import { supabase } from "@/lib/supabase";

export interface PortfolioImage {
  id: string;
  title: string;
  alt_text: string | null;
  category: string;
  image_url: string;
  display_order: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
}

export type PortfolioImageInsert = Omit<PortfolioImage, "id" | "created_at">;

export async function getPortfolioImages(): Promise<PortfolioImage[]> {
  if (!supabase) {
    throw new Error("Service is not configured. Please try again later.");
  }

  const { data, error } = await supabase
    .from("portfolio_images")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as PortfolioImage[];
}

export async function getAllPortfolioImages(): Promise<PortfolioImage[]> {
  if (!supabase) {
    throw new Error("Service is not configured. Please try again later.");
  }

  const { data, error } = await supabase
    .from("portfolio_images")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as PortfolioImage[];
}

export async function getFeaturedPortfolioImages(): Promise<PortfolioImage[]> {
  if (!supabase) {
    throw new Error("Service is not configured. Please try again later.");
  }

  const { data, error } = await supabase
    .from("portfolio_images")
    .select("*")
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as PortfolioImage[];
}

export async function createPortfolioImage(
  data: PortfolioImageInsert
): Promise<PortfolioImage> {
  if (!supabase) {
    throw new Error("Service is not configured. Please try again later.");
  }

  const { data: created, error } = await supabase
    .from("portfolio_images")
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return created as PortfolioImage;
}

export async function updatePortfolioImage(
  id: string,
  updates: Partial<PortfolioImage>
): Promise<PortfolioImage> {
  if (!supabase) {
    throw new Error("Service is not configured. Please try again later.");
  }

  const { data, error } = await supabase
    .from("portfolio_images")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as PortfolioImage;
}

export async function deletePortfolioImage(id: string): Promise<void> {
  if (!supabase) {
    throw new Error("Service is not configured. Please try again later.");
  }

  const { error } = await supabase
    .from("portfolio_images")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}
