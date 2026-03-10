import { supabase } from "@/lib/supabase";

export interface Payment {
  id: string;
  booking_id: string | null;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  amount_cents: number;
  currency: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CheckoutSessionRequest {
  booking_id: string;
  service_title: string;
  amount_cents: number;
  customer_email: string;
  success_url: string;
  cancel_url: string;
}

export interface CheckoutSessionResponse {
  session_id: string;
  url: string;
}

export async function createCheckoutSession(
  data: CheckoutSessionRequest
): Promise<CheckoutSessionResponse> {
  if (!supabase) {
    throw new Error("Service is not configured. Please try again later.");
  }

  const { data: response, error } = await supabase.functions.invoke(
    "create-checkout-session",
    { body: data }
  );

  if (error) {
    throw new Error(error.message);
  }

  return response as CheckoutSessionResponse;
}

export async function getPaymentsByBooking(
  bookingId: string
): Promise<Payment[]> {
  if (!supabase) {
    throw new Error("Service is not configured. Please try again later.");
  }

  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as Payment[];
}
