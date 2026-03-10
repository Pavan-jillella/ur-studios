import { supabase } from "@/lib/supabase";

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  avatar_url: string | null;
  rating: number | null;
  is_featured: boolean;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export type TestimonialInsert = Omit<Testimonial, "id" | "created_at">;

export async function getTestimonials(): Promise<Testimonial[]> {
  if (!supabase) {
    throw new Error("Service is not configured. Please try again later.");
  }

  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data as Testimonial[];
}

export async function getAllTestimonials(): Promise<Testimonial[]> {
  if (!supabase) {
    throw new Error("Service is not configured. Please try again later.");
  }

  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data as Testimonial[];
}

export async function createTestimonial(
  data: TestimonialInsert
): Promise<Testimonial> {
  if (!supabase) {
    throw new Error("Service is not configured. Please try again later.");
  }

  const { data: created, error } = await supabase
    .from("testimonials")
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return created as Testimonial;
}

export async function updateTestimonial(
  id: string,
  updates: Partial<Testimonial>
): Promise<Testimonial> {
  if (!supabase) {
    throw new Error("Service is not configured. Please try again later.");
  }

  const { data, error } = await supabase
    .from("testimonials")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Testimonial;
}

export async function deleteTestimonial(id: string): Promise<void> {
  if (!supabase) {
    throw new Error("Service is not configured. Please try again later.");
  }

  const { error } = await supabase
    .from("testimonials")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}
