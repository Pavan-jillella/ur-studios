import { supabase } from "@/lib/supabase";

const LOCAL_STORAGE_KEY = "ur_studios_portfolio";

function getMockImages(): PortfolioImage[] {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveMockImages(images: PortfolioImage[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(images));
}

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
    return getMockImages()
      .filter((img) => img.is_active)
      .sort((a, b) => a.display_order - b.display_order);
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
    return getMockImages().sort((a, b) => a.display_order - b.display_order);
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
    return getMockImages()
      .filter((img) => img.is_active && img.is_featured)
      .sort((a, b) => a.display_order - b.display_order);
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
    const newImage: PortfolioImage = {
      ...data,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    const current = getMockImages();
    saveMockImages([...current, newImage]);
    return newImage;
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
    const images = getMockImages();
    const index = images.findIndex((img) => img.id === id);
    if (index === -1) throw new Error("Image not found in local storage");
    
    images[index] = { ...images[index], ...updates };
    saveMockImages(images);
    return images[index];
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
    const images = getMockImages();
    saveMockImages(images.filter((img) => img.id !== id));
    return;
  }

  const { error } = await supabase
    .from("portfolio_images")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}
