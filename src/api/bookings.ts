import { supabase } from "@/lib/supabase";

export interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  event_date: string | null;
  location: string | null;
  service_type: string;
  message: string | null;
  status: string;
  client_id: string | null;
  payment_status: string;
  assigned_album_id: string | null;
  created_at: string;
  updated_at: string;
}

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
  if (!supabase) {
    throw new Error("Booking service is not configured. Please try again later.");
  }

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

export async function getBookings(): Promise<Booking[]> {
  if (!supabase) {
    throw new Error("Booking service is not configured. Please try again later.");
  }

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as Booking[];
}

export async function getBookingById(id: string): Promise<Booking> {
  if (!supabase) {
    throw new Error("Booking service is not configured. Please try again later.");
  }

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Booking;
}

export async function updateBooking(
  id: string,
  updates: Partial<Booking>
): Promise<Booking> {
  if (!supabase) {
    throw new Error("Booking service is not configured. Please try again later.");
  }

  const { data, error } = await supabase
    .from("bookings")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Booking;
}

export async function deleteBooking(id: string): Promise<void> {
  if (!supabase) {
    throw new Error("Booking service is not configured. Please try again later.");
  }

  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getClientBookings(clientId: string): Promise<Booking[]> {
  if (!supabase) {
    throw new Error("Booking service is not configured. Please try again later.");
  }

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as Booking[];
}
