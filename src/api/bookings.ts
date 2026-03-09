import { supabase } from "@/lib/supabase";

export interface BookingInsert {
  name: string;
  email: string;
  phone?: string;
  event_date?: string | null;
  location?: string;
  service_type: string;
  message?: string;
}

export async function createBooking(booking: BookingInsert) {
  const { data, error } = await supabase
    .from("bookings")
    .insert(booking)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
