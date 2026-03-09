import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const PHOTOGRAPHER_EMAIL = Deno.env.get("PHOTOGRAPHER_EMAIL") || "uday@urstudios.com";

interface BookingPayload {
  type: "INSERT";
  table: string;
  record: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    event_date: string | null;
    location: string | null;
    service_type: string;
    message: string | null;
    status: string;
    created_at: string;
  };
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Not specified";
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function buildPhotographerEmail(record: BookingPayload["record"]): string {
  return `
    <h2>New Booking Request</h2>
    <table style="border-collapse:collapse;width:100%;max-width:500px;">
      <tr><td style="padding:8px 0;color:#666;">Name</td><td style="padding:8px 0;font-weight:600;">${record.name}</td></tr>
      <tr><td style="padding:8px 0;color:#666;">Email</td><td style="padding:8px 0;">${record.email}</td></tr>
      <tr><td style="padding:8px 0;color:#666;">Phone</td><td style="padding:8px 0;">${record.phone || "Not provided"}</td></tr>
      <tr><td style="padding:8px 0;color:#666;">Event Date</td><td style="padding:8px 0;">${formatDate(record.event_date)}</td></tr>
      <tr><td style="padding:8px 0;color:#666;">Location</td><td style="padding:8px 0;">${record.location || "Not provided"}</td></tr>
      <tr><td style="padding:8px 0;color:#666;">Service</td><td style="padding:8px 0;">${record.service_type}</td></tr>
    </table>
    ${record.message ? `<h3>Message</h3><p>${record.message}</p>` : ""}
    <hr style="margin:24px 0;border:none;border-top:1px solid #eee;" />
    <p style="color:#999;font-size:13px;">Booking ID: ${record.id}<br/>Received: ${new Date(record.created_at).toLocaleString()}</p>
  `;
}

function buildClientEmail(record: BookingPayload["record"]): string {
  return `
    <div style="font-family:sans-serif;max-width:500px;">
      <h2>Thank you, ${record.name}!</h2>
      <p>We've received your booking request and will get back to you within 24 hours.</p>
      <h3>Your Booking Details</h3>
      <table style="border-collapse:collapse;width:100%;">
        <tr><td style="padding:8px 0;color:#666;">Service</td><td style="padding:8px 0;">${record.service_type}</td></tr>
        <tr><td style="padding:8px 0;color:#666;">Event Date</td><td style="padding:8px 0;">${formatDate(record.event_date)}</td></tr>
        ${record.location ? `<tr><td style="padding:8px 0;color:#666;">Location</td><td style="padding:8px 0;">${record.location}</td></tr>` : ""}
      </table>
      <p style="margin-top:24px;">If you have any questions, feel free to reply to this email.</p>
      <p>— UR Studios</p>
    </div>
  `;
}

Deno.serve(async (req) => {
  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }

    const payload: BookingPayload = await req.json();
    const { record } = payload;

    // Send notification to photographer
    const photographerRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "UR Studios <onboarding@resend.dev>",
        to: [PHOTOGRAPHER_EMAIL],
        subject: `New Booking: ${record.name} — ${record.service_type}`,
        html: buildPhotographerEmail(record),
      }),
    });

    if (!photographerRes.ok) {
      const err = await photographerRes.text();
      console.error("Photographer email failed:", err);
    }

    // Send confirmation to client
    const clientRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "UR Studios <onboarding@resend.dev>",
        to: [record.email],
        subject: "We received your booking request — UR Studios",
        html: buildClientEmail(record),
      }),
    });

    if (!clientRes.ok) {
      const err = await clientRes.text();
      console.error("Client email failed:", err);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
