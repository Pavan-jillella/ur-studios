import { supabase } from "@/lib/supabase";

/**
 * Generate a unique file path using crypto.randomUUID() and the original file extension.
 */
function generateUniquePath(file: File, basePath?: string): string {
  const extension = file.name.split(".").pop() || "bin";
  const uniqueName = `${crypto.randomUUID()}.${extension}`;
  return basePath ? `${basePath}/${uniqueName}` : uniqueName;
}

/**
 * Upload a file to a Supabase storage bucket and return its public URL.
 * Generates a unique path using crypto.randomUUID() + original file extension.
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<string> {
  if (!supabase) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }

  const uniquePath = generateUniquePath(file, path);

  const { error } = await supabase.storage
    .from(bucket)
    .upload(uniquePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return getPublicUrl(bucket, uniquePath);
}

/**
 * Delete a file from a Supabase storage bucket.
 */
export async function deleteFile(
  bucket: string,
  path: string
): Promise<void> {
  if (!supabase) {
    return; // Mock delete
  }

  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Get the public URL for a file in a Supabase storage bucket.
 */
export function getPublicUrl(bucket: string, path: string): string {
  if (!supabase) {
    return path; // For base64 fallback, path is the data URL itself
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  return data.publicUrl;
}

/**
 * Extract the storage path from a Supabase public URL.
 * URL format: .../storage/v1/object/public/{bucket}/{path}
 */
export function getStoragePathFromUrl(url: string): string {
  const match = url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/);
  return match ? match[1] : url;
}

/**
 * Extract the bucket name from a Supabase public URL.
 * URL format: .../storage/v1/object/public/{bucket}/{path}
 */
export function getBucketFromUrl(url: string): string {
  const match = url.match(/\/storage\/v1\/object\/public\/([^/]+)\//);
  return match ? match[1] : "";
}
