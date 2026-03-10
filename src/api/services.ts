import { supabase } from "@/lib/supabase";

export interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  long_description: string | null;
  price: string;
  price_cents: number | null;
  icon: string;
  cover_image: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type ServiceInsert = Omit<Service, "id" | "created_at" | "updated_at">;

export async function getServices(): Promise<Service[]> {
  if (!supabase) {
    throw new Error("Service is not configured. Please try again later.");
  }

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Service[];
}

export async function getAllServices(): Promise<Service[]> {
  if (!supabase) {
    throw new Error("Service is not configured. Please try again later.");
  }

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Service[];
}

export async function getServiceBySlug(slug: string): Promise<Service> {
  if (!supabase) {
    throw new Error("Service is not configured. Please try again later.");
  }

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Service;
}

export async function createService(data: ServiceInsert): Promise<Service> {
  if (!supabase) {
    throw new Error("Service is not configured. Please try again later.");
  }

  const { data: created, error } = await supabase
    .from("services")
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return created as Service;
}

export async function updateService(
  id: string,
  updates: Partial<Service>
): Promise<Service> {
  if (!supabase) {
    throw new Error("Service is not configured. Please try again later.");
  }

  const { data, error } = await supabase
    .from("services")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Service;
}

export async function deleteService(id: string): Promise<void> {
  if (!supabase) {
    throw new Error("Service is not configured. Please try again later.");
  }

  const { error } = await supabase
    .from("services")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}
