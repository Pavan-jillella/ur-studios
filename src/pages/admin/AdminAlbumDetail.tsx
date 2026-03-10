import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, Upload, Trash2, Save } from "lucide-react";
import {
  getAlbumById,
  getAlbumPhotos,
  updateAlbum,
  addPhotosToAlbum,
  updatePhoto,
  deletePhoto,
  type GalleryAlbum,
  type GalleryPhoto,
  type GalleryPhotoInsert,
} from "@/api/gallery";
import { uploadFile, deleteFile, getStoragePathFromUrl } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export default function AdminAlbumDetail() {
  const { id: albumId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [album, setAlbum] = useState<GalleryAlbum | null>(null);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmDeletePhotoId, setConfirmDeletePhotoId] = useState<string | null>(null);

  // Album form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("draft");
  const [isDownloadable, setIsDownloadable] = useState(false);

  const fetchData = useCallback(async () => {
    if (!albumId) return;
    try {
      setLoading(true);
      const [albumData, photosData] = await Promise.all([
        getAlbumById(albumId),
        getAlbumPhotos(albumId),
      ]);
      setAlbum(albumData);
      setPhotos(photosData);
      setTitle(albumData.title);
      setDescription(albumData.description ?? "");
      setStatus(albumData.status);
      setIsDownloadable(albumData.is_downloadable);
    } catch (err) {
      toast.error("Failed to load album");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [albumId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveAlbum = async () => {
    if (!albumId || !title) {
      toast.error("Title is required");
      return;
    }

    setSaving(true);
    try {
      const updated = await updateAlbum(albumId, {
        title,
        description: description || null,
        status: status as "draft" | "proofing" | "delivered",
        is_downloadable: isDownloadable,
      });
      setAlbum(updated);
      toast.success("Album updated");
    } catch (err) {
      toast.error("Failed to update album");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !albumId) return;

    setUploading(true);
    try {
      const uploadedPhotos: GalleryPhotoInsert[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const timestamp = Date.now();
        const ext = file.name.split(".").pop();
        const path = `${albumId}/${timestamp}-${i}.${ext}`;

        const imageUrl = await uploadFile("gallery", path, file);

        uploadedPhotos.push({
          album_id: albumId,
          image_url: imageUrl,
          thumbnail_url: imageUrl,
          title: file.name.replace(/\.[^.]+$/, ""),
          display_order: photos.length + i,
          is_approved: true,
          is_downloadable: isDownloadable,
        });
      }

      const created = await addPhotosToAlbum(uploadedPhotos);
      setPhotos((prev) => [...prev, ...created]);
      toast.success(`${files.length} photo${files.length > 1 ? "s" : ""} uploaded`);
    } catch (err) {
      toast.error("Failed to upload photos");
      console.error(err);
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const togglePhotoDownloadable = async (photo: GalleryPhoto) => {
    try {
      const updated = await updatePhoto(photo.id, {
        is_downloadable: !photo.is_downloadable,
      });
      setPhotos((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
    } catch (err) {
      toast.error("Failed to update photo");
      console.error(err);
    }
  };

  const handleDeletePhoto = async (photo: GalleryPhoto) => {
    try {
      // Try to delete from storage
      const storagePath = getStoragePathFromUrl(photo.image_url);
      if (storagePath) {
        try {
          await deleteFile("gallery", storagePath);
        } catch {
          // Storage deletion may fail; continue with DB deletion
        }
      }

      await deletePhoto(photo.id);
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
      setConfirmDeletePhotoId(null);
      toast.success("Photo deleted");
    } catch (err) {
      toast.error("Failed to delete photo");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full" />
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="font-body text-lg text-muted-foreground">
          Album not found
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate("/admin/gallery")}
        >
          Back to Gallery
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => navigate("/admin/gallery")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Gallery
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              {album.title}
            </h1>
            <p className="font-body text-muted-foreground mt-1">
              {photos.length} photo{photos.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Album Settings */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="font-display text-lg font-semibold mb-4">
            Album Settings
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="album-title">Title</Label>
              <Input
                id="album-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="proofing">Proofing</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="album-description">Description</Label>
              <Textarea
                id="album-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="album-downloadable"
                checked={isDownloadable}
                onCheckedChange={setIsDownloadable}
              />
              <Label htmlFor="album-downloadable">Allow Downloads</Label>
            </div>
            <div className="flex justify-end items-end">
              <Button onClick={handleSaveAlbum} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {/* Photo Upload */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">Photos</h2>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handlePhotoUpload}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? "Uploading..." : "Upload Photos"}
          </Button>
        </div>
      </div>

      {/* Photo Grid */}
      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
          <Upload className="h-8 w-8 mb-2" />
          <p className="font-body">No photos in this album yet</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload your first photos
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo) => (
            <Card key={photo.id} className="overflow-hidden group">
              <div className="relative aspect-square">
                <img
                  src={photo.thumbnail_url ?? photo.image_url}
                  alt={photo.title ?? "Photo"}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                {photo.is_downloadable && (
                  <Badge
                    variant="outline"
                    className="absolute top-2 right-2 bg-green-100 text-green-800 border-green-200 text-[10px]"
                  >
                    Downloadable
                  </Badge>
                )}
              </div>
              <CardContent className="p-3">
                <p className="font-body text-xs text-muted-foreground truncate mb-2">
                  {photo.title ?? "Untitled"}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={photo.is_downloadable}
                      onCheckedChange={() => togglePhotoDownloadable(photo)}
                      className="scale-75"
                    />
                    <span className="text-[10px] text-muted-foreground">
                      DL
                    </span>
                  </div>
                  {confirmDeletePhotoId === photo.id ? (
                    <div className="flex gap-1">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-6 text-[10px] px-2"
                        onClick={() => handleDeletePhoto(photo)}
                      >
                        Confirm
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-[10px] px-2"
                        onClick={() => setConfirmDeletePhotoId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      onClick={() => setConfirmDeletePhotoId(photo.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
}
