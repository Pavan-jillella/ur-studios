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

const LOCAL_STORAGE_KEY = "ur_studios_bookings";

function getMockBookings(): Booking[] {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveMockBookings(bookings: Booking[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(bookings));
}

export async function createBooking(booking: BookingInsert) {
  // Generate the id locally so we don't need to .select() the row back
  // (Anonymous users can INSERT but not SELECT their own bookings due to RLS)
  const newBooking = {
    ...booking,
    id: crypto.randomUUID(),
    status: "pending",
    payment_status: "unpaid",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (!supabase) {
    const current = getMockBookings();
    saveMockBookings([newBooking as Booking, ...current]);
    return newBooking as Booking;
  }

  const { error } = await supabase
    .from("bookings")
    .insert(newBooking);

  if (error) {
    throw new Error(error.message);
  }

  return newBooking as Booking;
}

export async function getBookings(): Promise<Booking[]> {
  if (!supabase) {
    return getMockBookings();
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
    const bookings = getMockBookings();
    const booking = bookings.find((b) => b.id === id);
    if (!booking) throw new Error("Booking not found");
    return booking;
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
    const bookings = getMockBookings();
    const index = bookings.findIndex((b) => b.id === id);
    if (index === -1) throw new Error("Booking not found");
    bookings[index] = { ...bookings[index], ...updates, updated_at: new Date().toISOString() };
    saveMockBookings(bookings);
    return bookings[index];
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
    const bookings = getMockBookings();
    saveMockBookings(bookings.filter((b) => b.id !== id));
    return;
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
    return getMockBookings().filter((b) => b.client_id === clientId);
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
