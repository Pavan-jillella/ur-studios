import { supabase } from "@/lib/supabase";

export interface CoverImage {
  id: string;
  title: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export type CoverImageInsert = Omit<CoverImage, "id" | "created_at">;

const LOCAL_STORAGE_KEY = "ur_studios_cover_images";

function getLocalImages(): CoverImage[] {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveLocalImages(images: CoverImage[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(images));
}

export async function getCoverImages(): Promise<CoverImage[]> {
  if (!supabase) {
    return getLocalImages()
      .filter((img) => img.is_active)
      .sort((a, b) => a.display_order - b.display_order);
  }

  const { data, error } = await supabase
    .from("cover_images")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as CoverImage[];
}

export async function getAllCoverImages(): Promise<CoverImage[]> {
  if (!supabase) {
    return getLocalImages().sort((a, b) => a.display_order - b.display_order);
  }

  const { data, error } = await supabase
    .from("cover_images")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as CoverImage[];
}

export async function createCoverImage(
  imageData: CoverImageInsert
): Promise<CoverImage> {
  if (!supabase) {
    const newImage: CoverImage = {
      ...imageData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    const current = getLocalImages();
    saveLocalImages([...current, newImage]);
    return newImage;
  }

  const { data, error } = await supabase
    .from("cover_images")
    .insert(imageData)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as CoverImage;
}

export async function updateCoverImage(
  id: string,
  updates: Partial<CoverImage>
): Promise<CoverImage> {
  if (!supabase) {
    const images = getLocalImages();
    const index = images.findIndex((img) => img.id === id);
    if (index === -1) throw new Error("Image not found");

    images[index] = { ...images[index], ...updates };
    saveLocalImages(images);
    return images[index];
  }

  const { data, error } = await supabase
    .from("cover_images")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as CoverImage;
}

export async function deleteCoverImage(id: string): Promise<void> {
  if (!supabase) {
    const images = getLocalImages();
    saveLocalImages(images.filter((img) => img.id !== id));
    return;
  }

  const { error } = await supabase.from("cover_images").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}
