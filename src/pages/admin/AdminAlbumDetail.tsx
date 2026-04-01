import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, Upload, Trash2, Save, Heart, MessageSquare, Download, Package, Loader2 } from "lucide-react";
import {
  getAlbumById,
  getAlbumPhotos,
  updateAlbum,
  addPhotosToAlbum,
  updatePhoto,
  deletePhoto,
  approveSelections,
  requestSelectionChanges,
  type GalleryAlbum,
  type GalleryPhoto,
  type GalleryPhotoInsert,
} from "@/api/gallery";
import { uploadFile, deleteFile, getStoragePathFromUrl } from "@/lib/storage";
import { exportSelectedPhotos } from "@/lib/export";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

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
  const [selectionLimit, setSelectionLimit] = useState<string>("");
  
  // Proofing review state
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [photoViewMode, setPhotoViewMode] = useState<"all" | "selected">("all");
  
  // Export state
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState({ current: 0, total: 0, message: "" });

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
      setSelectionLimit(albumData.selection_limit?.toString() ?? "");
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
        selection_limit: selectionLimit ? parseInt(selectionLimit, 10) : null,
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

  const handleApproveSelections = async () => {
    if (!albumId) return;
    try {
      const updated = await approveSelections(albumId);
      setAlbum(updated);
      toast.success("Selections approved! Client will be notified.");
    } catch (err) {
      toast.error("Failed to approve selections");
      console.error(err);
    }
  };

  const handleRequestChanges = async () => {
    if (!albumId || !feedbackText.trim()) {
      toast.error("Please provide feedback for the client");
      return;
    }
    try {
      const updated = await requestSelectionChanges(albumId, feedbackText);
      setAlbum(updated);
      setFeedbackDialogOpen(false);
      setFeedbackText("");
      toast.success("Feedback sent to client");
    } catch (err) {
      toast.error("Failed to send feedback");
      console.error(err);
    }
  };

  // Get photos based on view mode
  const displayedPhotos = photoViewMode === "selected" 
    ? photos.filter(p => p.is_approved) 
    : photos;

  // Get selection stats
  const selectedCount = photos.filter(p => p.is_approved).length;

  const handleExportSelections = async () => {
    if (!album || selectedCount === 0) return;
    
    setExporting(true);
    try {
      await exportSelectedPhotos(photos, album.title, (progress) => {
        setExportProgress({
          current: progress.current,
          total: progress.total,
          message: progress.message,
        });
      });
      toast.success("Export complete!");
    } catch (err) {
      toast.error("Export failed");
      console.error(err);
    } finally {
      setExporting(false);
      setExportProgress({ current: 0, total: 0, message: "" });
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
            <div className="space-y-2">
              <Label htmlFor="selection-limit">Selection Limit (for proofing)</Label>
              <Input
                id="selection-limit"
                type="number"
                placeholder="e.g., 30"
                value={selectionLimit}
                onChange={(e) => setSelectionLimit(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty for unlimited selections
              </p>
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

      {/* Selection Review Panel - only show if album is in proofing with submitted selections */}
      {album.status === "proofing" && album.selection_submitted_at && !album.selection_approved_at && (
        <Card className="mb-8 border-amber-200 bg-amber-50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-lg font-semibold text-amber-800 flex items-center gap-2">
                  <Heart className="h-5 w-5 fill-amber-500 text-amber-500" />
                  Client Selections Ready for Review
                </h2>
                <p className="font-body text-amber-700 mt-1">
                  {selectedCount} photo{selectedCount !== 1 ? "s" : ""} selected
                  {album.selection_limit && ` out of ${album.selection_limit} limit`}
                </p>
                <p className="text-xs text-amber-600 mt-2">
                  Submitted on {new Date(album.selection_submitted_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setFeedbackDialogOpen(true)}
                  className="border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                  Request Changes
                </Button>
                <Button onClick={handleApproveSelections}>
                  Approve Selections
                </Button>
              </div>
            </div>
            
            {/* Export progress */}
            {exporting && (
              <div className="mt-4 pt-4 border-t border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                  <span className="text-sm text-amber-700">{exportProgress.message}</span>
                </div>
                <Progress 
                  value={(exportProgress.current / exportProgress.total) * 100} 
                  className="h-2"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Selection Approved Banner */}
      {album.status === "proofing" && album.selection_approved_at && (
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-lg font-semibold text-green-800 flex items-center gap-2">
                  ✓ Selections Approved
                </h2>
                <p className="font-body text-green-700 mt-1">
                  {selectedCount} photos approved on {new Date(album.selection_approved_at).toLocaleDateString()}
                </p>
              </div>
              <Button
                onClick={handleExportSelections}
                disabled={exporting || selectedCount === 0}
                className="gap-2"
              >
                {exporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Package className="h-4 w-4" />
                )}
                Export ZIP
              </Button>
            </div>
            
            {/* Export progress */}
            {exporting && (
              <div className="mt-4 pt-4 border-t border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                  <span className="text-sm text-green-700">{exportProgress.message}</span>
                </div>
                <Progress 
                  value={(exportProgress.current / exportProgress.total) * 100} 
                  className="h-2 [&>div]:bg-green-500"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Separator className="my-8" />

      {/* Photo Upload & View Controls */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="font-display text-xl font-semibold">Photos</h2>
          {album.status === "proofing" && selectedCount > 0 && (
            <Tabs value={photoViewMode} onValueChange={(v) => setPhotoViewMode(v as typeof photoViewMode)}>
              <TabsList>
                <TabsTrigger value="all">All ({photos.length})</TabsTrigger>
                <TabsTrigger value="selected">
                  <Heart className="h-3 w-3 mr-1 fill-current" />
                  Selected ({selectedCount})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Export button */}
          {selectedCount > 0 && (
            <Button
              variant="outline"
              onClick={handleExportSelections}
              disabled={exporting}
            >
              {exporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Package className="mr-2 h-4 w-4" />
              )}
              Export Selected ({selectedCount})
            </Button>
          )}
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
      {displayedPhotos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
          <Upload className="h-8 w-8 mb-2" />
          <p className="font-body">
            {photoViewMode === "selected" ? "No photos selected yet" : "No photos in this album yet"}
          </p>
          {photoViewMode === "all" && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload your first photos
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {displayedPhotos.map((photo) => (
            <Card key={photo.id} className={cn(
              "overflow-hidden group",
              photo.is_approved && "ring-2 ring-pink-400"
            )}>
              <div className="relative aspect-square">
                <img
                  src={photo.thumbnail_url ?? photo.image_url}
                  alt={photo.title ?? "Photo"}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                
                {/* Top badges */}
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  {photo.is_approved && (
                    <Badge className="bg-pink-500 text-white text-[10px]">
                      <Heart className="h-3 w-3 mr-1 fill-current" />
                      Selected
                    </Badge>
                  )}
                  {photo.is_downloadable && (
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800 border-green-200 text-[10px]"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      DL
                    </Badge>
                  )}
                </div>
                
                {/* Category badge */}
                {photo.category && photo.category !== "none" && (
                  <Badge className="absolute top-2 left-2 text-[10px]" variant="secondary">
                    {photo.category === "album" ? "Album" : "Print"}
                  </Badge>
                )}
                
                {/* Client notes indicator */}
                {photo.client_notes && (
                  <div className="absolute bottom-2 left-2 p-1.5 rounded-full bg-blue-500 text-white" title={photo.client_notes}>
                    <MessageSquare className="h-3 w-3" />
                  </div>
                )}
              </div>
              <CardContent className="p-3">
                <p className="font-body text-xs text-muted-foreground truncate mb-2">
                  {photo.title ?? "Untitled"}
                </p>
                
                {/* Show client notes if present */}
                {photo.client_notes && (
                  <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded mb-2 line-clamp-2">
                    "{photo.client_notes}"
                  </p>
                )}
                
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

      {/* Request Changes Dialog */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Changes</DialogTitle>
            <DialogDescription>
              Send feedback to the client about their photo selections. They'll be able to make changes and resubmit.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="e.g., 'Great selections! Could you pick 5 more photos for the album? Also, photo #12 is slightly blurry - consider swapping it.'"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRequestChanges} disabled={!feedbackText.trim()}>
              Send Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
