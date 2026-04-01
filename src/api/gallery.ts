import { supabase } from "@/lib/supabase";

export type AlbumStatus = 'draft' | 'proofing' | 'delivered';
export type PhotoCategory = 'none' | 'album' | 'print' | 'rejected';

export interface GalleryAlbum {
  id: string;
  booking_id: string | null;
  client_id: string | null;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  status: AlbumStatus;
  is_downloadable: boolean;
  created_at: string;
  updated_at: string;
  // Photo Proofing fields
  selection_limit: number | null;
  selection_submitted_at: string | null;
  selection_approved_at: string | null;
  admin_feedback: string | null;
}

export interface GalleryPhoto {
  id: string;
  album_id: string;
  image_url: string;
  thumbnail_url: string | null;
  title: string | null;
  display_order: number;
  is_approved: boolean;
  is_downloadable: boolean;
  created_at: string;
  // Photo Proofing fields
  client_notes: string | null;
  category: PhotoCategory;
}

export type GalleryAlbumInsert = Omit<
  GalleryAlbum,
  "id" | "created_at" | "updated_at"
>;

export type GalleryPhotoInsert = Omit<GalleryPhoto, "id" | "created_at">;

export async function getAllAlbums(): Promise<GalleryAlbum[]> {
  if (!supabase) {
    throw new Error("Service is not configured. Please try again later.");
  }

  const { data, error } = await supabase
    .from("gallery_albums")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as GalleryAlbum[];
}

export async function getClientAlbums(
  clientId: string
): Promise<GalleryAlbum[]> {
  if (!supabase) {
    throw new Error("Service is not configured. Please try again later.");
  }

  const { data, error } = await supabase
    .from("gallery_albums")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as GalleryAlbum[];
}

export async function getAlbumById(id: string): Promise<GalleryAlbum> {
  if (!supabase) {
    throw new Error("Service is not configured. Please try again later.");
  }

  const { data, error } = await supabase
    .from("gallery_albums")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as GalleryAlbum;
}

export async function createAlbum(
  data: GalleryAlbumInsert
): Promise<GalleryAlbum> {
  if (!supabase) {
    throw new Error("Service is not configured. Please try again later.");
  }

  const { data: created, error } = await supabase
    .from("gallery_albums")
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return created as GalleryAlbum;
}

export async function updateAlbum(
  id: string,
  updates: Partial<GalleryAlbum>
): Promise<GalleryAlbum> {
  if (!supabase) {
    throw new Error("Service is not configured. Please try again later.");
  }

  const { data, error } = await supabase
    .from("gallery_albums")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as GalleryAlbum;
}

export async function deleteAlbum(id: string): Promise<void> {
  if (!supabase) {
    throw new Error("Service is not configured. Please try again later.");
  }

  const { error } = await supabase
    .from("gallery_albums")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getAlbumPhotos(
  albumId: string
): Promise<GalleryPhoto[]> {
  if (!supabase) {
    throw new Error("Service is not configured. Please try again later.");
  }

  const { data, error } = await supabase
    .from("gallery_photos")
    .select("*")
    .eq("album_id", albumId)
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as GalleryPhoto[];
}

export async function addPhotosToAlbum(
  photos: GalleryPhotoInsert[]
): Promise<GalleryPhoto[]> {
  if (!supabase) {
    throw new Error("Service is not configured. Please try again later.");
  }

  const { data, error } = await supabase
    .from("gallery_photos")
    .insert(photos)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data as GalleryPhoto[];
}

export async function updatePhoto(
  photoId: string,
  updates: Partial<GalleryPhoto>
): Promise<GalleryPhoto> {
  if (!supabase) {
    throw new Error("Service is not configured. Please try again later.");
  }

  const { data, error } = await supabase
    .from("gallery_photos")
    .update(updates)
    .eq("id", photoId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as GalleryPhoto;
}

export async function updatePhotoApproval(
  photoId: string,
  isApproved: boolean
): Promise<GalleryPhoto> {
  return updatePhoto(photoId, { is_approved: isApproved });
}

export async function deletePhoto(photoId: string): Promise<void> {
  if (!supabase) {
    throw new Error("Service is not configured. Please try again later.");
  }

  const { error } = await supabase
    .from("gallery_photos")
    .delete()
    .eq("id", photoId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getDownloadablePhotos(
  clientId: string
): Promise<GalleryPhoto[]> {
  if (!supabase) {
    throw new Error("Service is not configured. Please try again later.");
  }

  const { data: albums, error: albumsError } = await supabase
    .from("gallery_albums")
    .select("id")
    .eq("client_id", clientId);

  if (albumsError) {
    throw new Error(albumsError.message);
  }

  if (!albums || albums.length === 0) {
    return [];
  }

  const albumIds = albums.map((album) => album.id);

  const { data, error } = await supabase
    .from("gallery_photos")
    .select("*")
    .in("album_id", albumIds)
    .eq("is_downloadable", true)
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as GalleryPhoto[];
}

export async function getSignedDownloadUrl(
  path: string
): Promise<string> {
  if (!supabase) {
    throw new Error("Service is not configured. Please try again later.");
  }

  const { data, error } = await supabase.storage
    .from("gallery")
    .createSignedUrl(path, 3600);

  if (error) {
    throw new Error(error.message);
  }

  return data.signedUrl;
}

// =====================
// Photo Proofing API
// =====================

export async function submitSelections(albumId: string): Promise<GalleryAlbum> {
  if (!supabase) {
    throw new Error("Service is not configured. Please try again later.");
  }

  const { data, error } = await supabase
    .from("gallery_albums")
    .update({ 
      selection_submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("id", albumId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as GalleryAlbum;
}

export async function getProofingQueue(): Promise<GalleryAlbum[]> {
  if (!supabase) {
    throw new Error("Service is not configured. Please try again later.");
  }

  const { data, error } = await supabase
    .from("gallery_albums")
    .select("*")
    .eq("status", "proofing")
    .not("selection_submitted_at", "is", null)
    .is("selection_approved_at", null)
    .order("selection_submitted_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data as GalleryAlbum[];
}

export async function approveSelections(
  albumId: string,
  feedback?: string
): Promise<GalleryAlbum> {
  if (!supabase) {
    throw new Error("Service is not configured. Please try again later.");
  }

  const { data, error } = await supabase
    .from("gallery_albums")
    .update({ 
      selection_approved_at: new Date().toISOString(),
      admin_feedback: feedback || null,
      updated_at: new Date().toISOString()
    })
    .eq("id", albumId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as GalleryAlbum;
}

export async function requestSelectionChanges(
  albumId: string,
  feedback: string
): Promise<GalleryAlbum> {
  if (!supabase) {
    throw new Error("Service is not configured. Please try again later.");
  }

  const { data, error } = await supabase
    .from("gallery_albums")
    .update({ 
      selection_submitted_at: null, // Reset submission
      admin_feedback: feedback,
      updated_at: new Date().toISOString()
    })
    .eq("id", albumId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as GalleryAlbum;
}

export async function bulkUpdatePhotoApproval(
  photoIds: string[],
  isApproved: boolean
): Promise<GalleryPhoto[]> {
  if (!supabase) {
    throw new Error("Service is not configured. Please try again later.");
  }

  const { data, error } = await supabase
    .from("gallery_photos")
    .update({ is_approved: isApproved })
    .in("id", photoIds)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data as GalleryPhoto[];
}

export async function updatePhotoNotes(
  photoId: string,
  notes: string
): Promise<GalleryPhoto> {
  return updatePhoto(photoId, { client_notes: notes });
}

export async function updatePhotoCategory(
  photoId: string,
  category: PhotoCategory
): Promise<GalleryPhoto> {
  return updatePhoto(photoId, { category, is_approved: category !== 'none' && category !== 'rejected' });
}

export async function getSelectedPhotos(albumId: string): Promise<GalleryPhoto[]> {
  if (!supabase) {
    throw new Error("Service is not configured. Please try again later.");
  }

  const { data, error } = await supabase
    .from("gallery_photos")
    .select("*")
    .eq("album_id", albumId)
    .eq("is_approved", true)
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as GalleryPhoto[];
}

export async function getPhotosByCategory(
  albumId: string,
  category: PhotoCategory
): Promise<GalleryPhoto[]> {
  if (!supabase) {
    throw new Error("Service is not configured. Please try again later.");
  }

  const { data, error } = await supabase
    .from("gallery_photos")
    .select("*")
    .eq("album_id", albumId)
    .eq("category", category)
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as GalleryPhoto[];
}
