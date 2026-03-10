import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getClientAlbums,
  getAlbumPhotos,
  updatePhotoApproval,
  type GalleryAlbum,
  type GalleryPhoto,
} from "@/api/gallery";
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon, Heart, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
                      {album.status === "proofing" && (
                        <div className="mb-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
                          <p className="text-sm font-body text-primary font-medium flex items-center gap-2">
                            <Heart className="h-4 w-4" />
                            Select your favorites by clicking the heart icon on each photo.
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

                      {/* Photos Grid */}
                      {photosLoading === album.id ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Skeleton key={i} className="aspect-square rounded-lg" />
                          ))}
                        </div>
                      ) : albumPhotos[album.id]?.length === 0 ? (
                        <p className="text-sm text-muted-foreground font-body text-center py-8">
                          No photos in this album yet.
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {albumPhotos[album.id]?.map((photo) => (
                            <div key={photo.id} className="relative group">
                              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                                <img
                                  src={photo.thumbnail_url || photo.image_url}
                                  alt={photo.title ?? "Gallery photo"}
                                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  loading="lazy"
                                />
                              </div>
                              {/* Favorite toggle (only for proofing albums) */}
                              {album.status === "proofing" && (
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
                              {/* Approved indicator for delivered */}
                              {album.status === "delivered" && photo.is_approved && (
                                <div className="absolute top-2 right-2 p-1.5 rounded-full bg-primary text-primary-foreground">
                                  <Heart className="h-4 w-4 fill-current" />
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
    </div>
  );
}
