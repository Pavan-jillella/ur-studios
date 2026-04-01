import { useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getClientAlbums,
  getAlbumPhotos,
  updatePhotoApproval,
  updatePhotoNotes,
  updatePhotoCategory,
  submitSelections,
  bulkUpdatePhotoApproval,
  type GalleryAlbum,
  type GalleryPhoto,
  type PhotoCategory,
} from "@/api/gallery";
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon, Heart, ChevronDown, ChevronUp, CheckCircle, Send, MessageSquare, ArrowLeftRight, CheckSquare, Square } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PhotoLightbox } from "@/components/portal/PhotoLightbox";
import { PhotoCompare } from "@/components/portal/PhotoCompare";
import { SelectionProgress } from "@/components/portal/SelectionProgress";

function albumStatusVariant(status: string): "default" | "secondary" | "outline" {
  switch (status) {
    case "delivered":
      return "default";
    case "proofing":
      return "secondary";
    default:
      return "outline";
  }
}

export default function PortalGallery() {
  const { user, loading: authLoading } = useAuth();
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAlbumId, setExpandedAlbumId] = useState<string | null>(null);
  const [albumPhotos, setAlbumPhotos] = useState<Record<string, GalleryPhoto[]>>({});
  const [photosLoading, setPhotosLoading] = useState<string | null>(null);
  
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxAlbumId, setLightboxAlbumId] = useState<string | null>(null);
  
  // Compare mode state
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareAlbumId, setCompareAlbumId] = useState<string | null>(null);
  
  // Batch selection mode
  const [batchMode, setBatchMode] = useState(false);
  const [batchSelected, setBatchSelected] = useState<Set<string>>(new Set());
  
  // Filter state
  const [categoryFilter, setCategoryFilter] = useState<"all" | PhotoCategory>("all");
  
  // Submit confirmation dialog
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [submittingAlbumId, setSubmittingAlbumId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const data = await getClientAlbums(user!.id);
        setAlbums(data);
      } catch (err) {
        console.error("Failed to load galleries:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user, authLoading]);

  const toggleAlbum = async (albumId: string) => {
    if (expandedAlbumId === albumId) {
      setExpandedAlbumId(null);
      return;
    }

    setExpandedAlbumId(albumId);

    // Load photos if not already loaded
    if (!albumPhotos[albumId]) {
      setPhotosLoading(albumId);
      try {
        const photos = await getAlbumPhotos(albumId);
        setAlbumPhotos((prev) => ({ ...prev, [albumId]: photos }));
      } catch (err) {
        toast.error("Failed to load photos");
        console.error(err);
      } finally {
        setPhotosLoading(null);
      }
    }
  };

  const handleToggleFavorite = async (photo: GalleryPhoto) => {
    const newApproval = !photo.is_approved;
    try {
      await updatePhotoApproval(photo.id, newApproval);
      setAlbumPhotos((prev) => ({
        ...prev,
        [photo.album_id]: prev[photo.album_id].map((p) =>
          p.id === photo.id ? { ...p, is_approved: newApproval } : p
        ),
      }));
      toast.success(newApproval ? "Marked as favorite" : "Removed from favorites");
    } catch (err) {
      toast.error("Failed to update photo");
      console.error(err);
    }
  };

  const handleUpdateNotes = async (photo: GalleryPhoto, notes: string) => {
    try {
      await updatePhotoNotes(photo.id, notes);
      setAlbumPhotos((prev) => ({
        ...prev,
        [photo.album_id]: prev[photo.album_id].map((p) =>
          p.id === photo.id ? { ...p, client_notes: notes } : p
        ),
      }));
      toast.success("Notes saved");
    } catch (err) {
      toast.error("Failed to save notes");
      console.error(err);
    }
  };

  const handleUpdateCategory = async (photo: GalleryPhoto, category: PhotoCategory) => {
    try {
      await updatePhotoCategory(photo.id, category);
      setAlbumPhotos((prev) => ({
        ...prev,
        [photo.album_id]: prev[photo.album_id].map((p) =>
          p.id === photo.id ? { ...p, category, is_approved: category !== 'none' && category !== 'rejected' } : p
        ),
      }));
      toast.success(category === "none" ? "Category removed" : `Marked for ${category}`);
    } catch (err) {
      toast.error("Failed to update category");
      console.error(err);
    }
  };

  const handleSubmitSelections = async () => {
    if (!submittingAlbumId) return;
    try {
      await submitSelections(submittingAlbumId);
      setAlbums((prev) =>
        prev.map((a) =>
          a.id === submittingAlbumId
            ? { ...a, selection_submitted_at: new Date().toISOString() }
            : a
        )
      );
      toast.success("Selections submitted! Your photographer will review them soon.");
      setSubmitDialogOpen(false);
      setSubmittingAlbumId(null);
    } catch (err) {
      toast.error("Failed to submit selections");
      console.error(err);
    }
  };

  const openLightbox = (albumId: string, photoIndex: number) => {
    if (batchMode) return; // Don't open lightbox in batch mode
    setLightboxAlbumId(albumId);
    setLightboxIndex(photoIndex);
    setLightboxOpen(true);
  };

  const openCompare = (albumId: string) => {
    setCompareAlbumId(albumId);
    setCompareOpen(true);
  };

  // Batch selection handlers
  const toggleBatchSelect = (photoId: string) => {
    setBatchSelected((prev) => {
      const next = new Set(prev);
      if (next.has(photoId)) {
        next.delete(photoId);
      } else {
        next.add(photoId);
      }
      return next;
    });
  };

  const handleBatchApprove = async (albumId: string) => {
    if (batchSelected.size === 0) return;
    try {
      const photoIds = Array.from(batchSelected);
      await bulkUpdatePhotoApproval(photoIds, true);
      setAlbumPhotos((prev) => ({
        ...prev,
        [albumId]: prev[albumId].map((p) =>
          batchSelected.has(p.id) ? { ...p, is_approved: true } : p
        ),
      }));
      toast.success(`${batchSelected.size} photos selected`);
      setBatchSelected(new Set());
      setBatchMode(false);
    } catch (err) {
      toast.error("Failed to update photos");
      console.error(err);
    }
  };

  const handleBatchDeselect = async (albumId: string) => {
    if (batchSelected.size === 0) return;
    try {
      const photoIds = Array.from(batchSelected);
      await bulkUpdatePhotoApproval(photoIds, false);
      setAlbumPhotos((prev) => ({
        ...prev,
        [albumId]: prev[albumId].map((p) =>
          batchSelected.has(p.id) ? { ...p, is_approved: false } : p
        ),
      }));
      toast.success(`${batchSelected.size} photos deselected`);
      setBatchSelected(new Set());
      setBatchMode(false);
    } catch (err) {
      toast.error("Failed to update photos");
      console.error(err);
    }
  };

  const exitBatchMode = () => {
    setBatchMode(false);
    setBatchSelected(new Set());
  };

  // Get filtered photos for current album
  const getFilteredPhotos = (albumId: string) => {
    const photos = albumPhotos[albumId] || [];
    if (categoryFilter === "all") return photos;
    return photos.filter((p) => p.category === categoryFilter);
  };

  // Get selection count for an album
  const getSelectionCount = (albumId: string) => {
    return (albumPhotos[albumId] || []).filter((p) => p.is_approved).length;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-2xl font-semibold text-foreground">My Gallery</h1>
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (albums.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20"
      >
        <h1 className="font-display text-2xl font-semibold text-foreground mb-4">My Gallery</h1>
        <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="font-body text-muted-foreground">No galleries available yet.</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold text-foreground">My Gallery</h1>

      <div className="space-y-4">
        {albums.map((album, index) => (
          <motion.div
            key={album.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="overflow-hidden">
              <CardHeader
                className="cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => toggleAlbum(album.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Cover image or placeholder */}
                    <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {album.cover_image_url ? (
                        <img
                          src={album.cover_image_url}
                          alt={album.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                    <div>
                      <CardTitle className="font-display text-lg font-medium">
                        {album.title}
                      </CardTitle>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge variant={albumStatusVariant(album.status)}>
                          {album.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground font-body">
                          {album.photo_count ?? 0} photos
                        </span>
                      </div>
                    </div>
                  </div>
                  {expandedAlbumId === album.id ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>

              <AnimatePresence>
                {expandedAlbumId === album.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <CardContent className="pt-0">
                      {/* Status Messages */}
                      {album.status === "proofing" && !album.selection_submitted_at && (
                        <div className="mb-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
                          <p className="text-sm font-body text-primary font-medium flex items-center gap-2">
                            <Heart className="h-4 w-4" />
                            Select your favorites by clicking photos or using the fullscreen viewer.
                          </p>
                          {album.admin_feedback && (
                            <p className="mt-2 text-sm text-amber-600 flex items-center gap-2">
                              <MessageSquare className="h-4 w-4" />
                              Feedback: {album.admin_feedback}
                            </p>
                          )}
                        </div>
                      )}
                      {album.status === "proofing" && album.selection_submitted_at && (
                        <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-100">
                          <p className="text-sm font-body text-blue-700 font-medium flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Selections submitted! Waiting for review.
                          </p>
                        </div>
                      )}
                      {album.status === "delivered" && (
                        <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-100">
                          <p className="text-sm font-body text-green-700 font-medium flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Your photos are ready!
                          </p>
                        </div>
                      )}

                      {album.description && (
                        <p className="text-sm text-muted-foreground font-body mb-4">
                          {album.description}
                        </p>
                      )}

                      {/* Selection Progress & Actions for proofing */}
                      {album.status === "proofing" && albumPhotos[album.id] && (
                        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <SelectionProgress
                            current={getSelectionCount(album.id)}
                            limit={album.selection_limit}
                            className="flex-1"
                          />
                          <div className="flex gap-2 flex-wrap">
                            {/* Compare button */}
                            {!album.selection_submitted_at && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openCompare(album.id)}
                                className="gap-2"
                              >
                                <ArrowLeftRight className="h-4 w-4" />
                                Compare
                              </Button>
                            )}
                            {/* Batch select button */}
                            {!album.selection_submitted_at && !batchMode && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setBatchMode(true)}
                                className="gap-2"
                              >
                                <CheckSquare className="h-4 w-4" />
                                Multi-Select
                              </Button>
                            )}
                            {/* Submit button */}
                            {!album.selection_submitted_at && getSelectionCount(album.id) > 0 && !batchMode && (
                              <Button
                                onClick={() => {
                                  setSubmittingAlbumId(album.id);
                                  setSubmitDialogOpen(true);
                                }}
                                className="gap-2"
                              >
                                <Send className="h-4 w-4" />
                                Submit Selections
                              </Button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Batch Mode Controls */}
                      {batchMode && album.status === "proofing" && !album.selection_submitted_at && (
                        <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                          <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-2">
                              <CheckSquare className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-800">
                                {batchSelected.size} photos selected
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={exitBatchMode}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleBatchDeselect(album.id)}
                                disabled={batchSelected.size === 0}
                              >
                                Deselect All
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleBatchApprove(album.id)}
                                disabled={batchSelected.size === 0}
                                className="bg-pink-500 hover:bg-pink-600"
                              >
                                <Heart className="h-4 w-4 mr-1" />
                                Select All
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Category Filter Tabs */}
                      {album.status === "proofing" && albumPhotos[album.id]?.length > 0 && (
                        <Tabs
                          value={categoryFilter}
                          onValueChange={(v) => setCategoryFilter(v as typeof categoryFilter)}
                          className="mb-4"
                        >
                          <TabsList>
                            <TabsTrigger value="all">All Photos</TabsTrigger>
                            <TabsTrigger value="album">For Album</TabsTrigger>
                            <TabsTrigger value="print">For Prints</TabsTrigger>
                          </TabsList>
                        </Tabs>
                      )}

                      {/* Photos Grid */}
                      {photosLoading === album.id ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Skeleton key={i} className="aspect-square rounded-lg" />
                          ))}
                        </div>
                      ) : getFilteredPhotos(album.id).length === 0 ? (
                        <p className="text-sm text-muted-foreground font-body text-center py-8">
                          {categoryFilter === "all" 
                            ? "No photos in this album yet."
                            : `No photos marked for ${categoryFilter} yet.`
                          }
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {getFilteredPhotos(album.id).map((photo, photoIndex) => (
                            <div 
                              key={photo.id} 
                              className={cn(
                                "relative group cursor-pointer",
                                batchMode && batchSelected.has(photo.id) && "ring-2 ring-blue-500 rounded-lg"
                              )}
                              onClick={() => {
                                if (batchMode) {
                                  toggleBatchSelect(photo.id);
                                } else {
                                  openLightbox(album.id, photoIndex);
                                }
                              }}
                            >
                              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                                <img
                                  src={photo.thumbnail_url || photo.image_url}
                                  alt={photo.title ?? "Gallery photo"}
                                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  loading="lazy"
                                />
                              </div>
                              
                              {/* Batch mode checkbox */}
                              {batchMode && album.status === "proofing" && !album.selection_submitted_at && (
                                <div className="absolute top-2 left-2 p-1 rounded bg-white/90 shadow">
                                  {batchSelected.has(photo.id) ? (
                                    <CheckSquare className="h-5 w-5 text-blue-600" />
                                  ) : (
                                    <Square className="h-5 w-5 text-gray-400" />
                                  )}
                                </div>
                              )}
                              
                              {/* Notes indicator */}
                              {photo.client_notes && !batchMode && (
                                <div className="absolute bottom-2 left-2 p-1 rounded-full bg-blue-500/80 text-white">
                                  <MessageSquare className="h-3 w-3" />
                                </div>
                              )}
                              {/* Favorite toggle (only for proofing albums, not in batch mode) */}
                              {album.status === "proofing" && !album.selection_submitted_at && !batchMode && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleFavorite(photo);
                                  }}
                                  className={cn(
                                    "absolute top-2 right-2 p-1.5 rounded-full transition-all duration-200",
                                    photo.is_approved
                                      ? "bg-primary text-primary-foreground shadow-md"
                                      : "bg-black/40 text-white hover:bg-black/60"
                                  )}
                                >
                                  <Heart
                                    className={cn(
                                      "h-4 w-4",
                                      photo.is_approved && "fill-current"
                                    )}
                                  />
                                </button>
                              )}
                              {/* Approved indicator for delivered or submitted */}
                              {(album.status === "delivered" || album.selection_submitted_at) && photo.is_approved && (
                                <div className="absolute top-2 right-2 p-1.5 rounded-full bg-primary text-primary-foreground">
                                  <Heart className="h-4 w-4 fill-current" />
                                </div>
                              )}
                              {/* Category badge */}
                              {photo.category !== "none" && (
                                <div className="absolute top-2 left-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {photo.category === "album" ? "Album" : "Print"}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Photo Lightbox */}
      {lightboxAlbumId && (
        <PhotoLightbox
          photos={getFilteredPhotos(lightboxAlbumId)}
          initialIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => {
            setLightboxOpen(false);
            setLightboxAlbumId(null);
          }}
          onToggleApproval={
            albums.find((a) => a.id === lightboxAlbumId)?.status === "proofing" &&
            !albums.find((a) => a.id === lightboxAlbumId)?.selection_submitted_at
              ? handleToggleFavorite
              : undefined
          }
          onUpdateNotes={
            albums.find((a) => a.id === lightboxAlbumId)?.status === "proofing"
              ? handleUpdateNotes
              : undefined
          }
          onUpdateCategory={
            albums.find((a) => a.id === lightboxAlbumId)?.status === "proofing"
              ? handleUpdateCategory
              : undefined
          }
          isProofingMode={albums.find((a) => a.id === lightboxAlbumId)?.status === "proofing"}
          selectionLimit={albums.find((a) => a.id === lightboxAlbumId)?.selection_limit ?? undefined}
          currentSelectionCount={getSelectionCount(lightboxAlbumId)}
        />
      )}

      {/* Photo Compare */}
      {compareAlbumId && (
        <PhotoCompare
          photos={albumPhotos[compareAlbumId] || []}
          isOpen={compareOpen}
          onClose={() => {
            setCompareOpen(false);
            setCompareAlbumId(null);
          }}
          onToggleApproval={
            albums.find((a) => a.id === compareAlbumId)?.status === "proofing" &&
            !albums.find((a) => a.id === compareAlbumId)?.selection_submitted_at
              ? handleToggleFavorite
              : undefined
          }
        />
      )}

      {/* Submit Selections Confirmation Dialog */}
      <AlertDialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Your Selections?</AlertDialogTitle>
            <AlertDialogDescription>
              You've selected {submittingAlbumId ? getSelectionCount(submittingAlbumId) : 0} photos.
              Once submitted, your photographer will review your choices. You can still view your 
              selections but won't be able to make changes until they respond.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmitSelections}>
              Submit Selections
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
