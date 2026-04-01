import JSZip from "jszip";
import { GalleryPhoto, getSignedDownloadUrl } from "@/api/gallery";
import { getStoragePathFromUrl } from "@/lib/storage";

interface ExportProgress {
  current: number;
  total: number;
  status: "downloading" | "zipping" | "complete" | "error";
  message: string;
}

type ProgressCallback = (progress: ExportProgress) => void;

/**
 * Download a single photo and return as blob
 */
async function downloadPhoto(photo: GalleryPhoto): Promise<{ blob: Blob; filename: string }> {
  const path = getStoragePathFromUrl(photo.image_url);
  const signedUrl = await getSignedDownloadUrl(path);
  
  const response = await fetch(signedUrl);
  if (!response.ok) {
    throw new Error(`Failed to download: ${photo.title || photo.id}`);
  }
  
  const blob = await response.blob();
  const extension = photo.image_url.split(".").pop() || "jpg";
  const filename = `${photo.title || photo.id}.${extension}`;
  
  return { blob, filename };
}

/**
 * Export selected photos as a ZIP file
 */
export async function exportPhotosAsZip(
  photos: GalleryPhoto[],
  albumTitle: string,
  onProgress?: ProgressCallback
): Promise<void> {
  if (photos.length === 0) {
    throw new Error("No photos to export");
  }

  const zip = new JSZip();
  const total = photos.length;
  const usedFilenames = new Set<string>();

  // Download all photos
  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    
    onProgress?.({
      current: i + 1,
      total,
      status: "downloading",
      message: `Downloading ${i + 1} of ${total}...`,
    });

    try {
      const { blob, filename } = await downloadPhoto(photo);
      
      // Handle duplicate filenames
      let uniqueFilename = filename;
      let counter = 1;
      while (usedFilenames.has(uniqueFilename)) {
        const parts = filename.split(".");
        const ext = parts.pop();
        uniqueFilename = `${parts.join(".")}_${counter}.${ext}`;
        counter++;
      }
      usedFilenames.add(uniqueFilename);
      
      zip.file(uniqueFilename, blob);
    } catch (err) {
      console.error(`Failed to download photo ${photo.id}:`, err);
      // Continue with other photos
    }
  }

  onProgress?.({
    current: total,
    total,
    status: "zipping",
    message: "Creating ZIP file...",
  });

  // Generate ZIP blob
  const zipBlob = await zip.generateAsync({ 
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 }
  });

  // Trigger download
  const sanitizedTitle = albumTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  const filename = `${sanitizedTitle}_selections.zip`;
  
  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  onProgress?.({
    current: total,
    total,
    status: "complete",
    message: "Download complete!",
  });
}

/**
 * Export all approved photos from an album
 */
export async function exportSelectedPhotos(
  photos: GalleryPhoto[],
  albumTitle: string,
  onProgress?: ProgressCallback
): Promise<void> {
  const selectedPhotos = photos.filter((p) => p.is_approved);
  return exportPhotosAsZip(selectedPhotos, albumTitle, onProgress);
}
