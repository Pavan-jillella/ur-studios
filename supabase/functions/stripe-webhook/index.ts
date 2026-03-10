import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Convert a hex string to Uint8Array
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

// Convert Uint8Array to hex string
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Verify Stripe webhook signature using crypto.subtle
async function verifyStripeSignature(
  payload: string,
  sigHeader: string,
  secret: string
): Promise<boolean> {
  const parts = sigHeader.split(",");
  const timestampPart = parts.find((p) => p.startsWith("t="));
  const signaturePart = parts.find((p) => p.startsWith("v1="));

  if (!timestampPart || !signaturePart) {
    throw new Error("Invalid Stripe signature header format");
  }

  const timestamp = timestampPart.split("=")[1];
  const expectedSig = signaturePart.split("=")[1];

  // Check timestamp tolerance (5 minutes)
  const currentTime = Math.floor(Date.now() / 1000);
  const signatureTime = parseInt(timestamp, 10);
  if (Math.abs(currentTime - signatureTime) > 300) {
    throw new Error("Stripe webhook timestamp is too old");
  }

  // Compute expected signature
  const signedPayload = `${timestamp}.${payload}`;
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(signedPayload);

  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign("HMAC", key, messageData);
  const computedSig = bytesToHex(new Uint8Array(signatureBuffer));

  // Constant-time comparison
  if (computedSig.length !== expectedSig.length) return false;

  const computedBytes = hexToBytes(computedSig);
  const expectedBytes = hexToBytes(expectedSig);
  let result = 0;
  for (let i = 0; i < computedBytes.length; i++) {
    result |= computedBytes[i] ^ expectedBytes[i];
  }

  return result === 0;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!STRIPE_WEBHOOK_SECRET) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(
        JSON.stringify({ error: "Missing stripe-signature header" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body = await req.text();

    // Verify the webhook signature
    const isValid = await verifyStripeSignature(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET
    );

    if (!isValid) {
      console.error("Stripe signature verification failed");
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const event = JSON.parse(body);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const bookingId = session.metadata?.booking_id;
        const stripeSessionId = session.id;
        const paymentIntentId = session.payment_intent;

        console.log(
          `Checkout completed for booking ${bookingId}, session ${stripeSessionId}`
        );

        // Update payments table
        const { error: paymentError } = await supabase
          .from("payments")
          .update({
            status: "succeeded",
            stripe_payment_intent_id: paymentIntentId,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_session_id", stripeSessionId);

        if (paymentError) {
          console.error("Failed to update payment:", paymentError);
        }

        // Update booking payment status
        if (bookingId) {
          const { error: bookingError } = await supabase
            .from("bookings")
            .update({
              payment_status: "paid",
              updated_at: new Date().toISOString(),
            })
            .eq("id", bookingId);

          if (bookingError) {
            console.error("Failed to update booking:", bookingError);
          }
        }

        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object;
        const stripeSessionId = session.id;

        console.log(`Checkout expired for session ${stripeSessionId}`);

        // Update payments table
        const { error: paymentError } = await supabase
          .from("payments")
          .update({
            status: "failed",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_session_id", stripeSessionId);

        if (paymentError) {
          console.error("Failed to update payment on expiry:", paymentError);
        }

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
