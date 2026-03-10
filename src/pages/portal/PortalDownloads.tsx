import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getDownloadablePhotos,
  getSignedDownloadUrl,
  type GalleryPhoto,
} from "@/api/gallery";
import { motion } from "framer-motion";
import { Download, ImageIcon, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type DownloadablePhoto = GalleryPhoto & { album_title: string };

export default function PortalDownloads() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<DownloadablePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<string>("all");

  useEffect(() => {
    if (!user) return;

    async function load() {
      try {
        const data = await getDownloadablePhotos(user!.id);
        setPhotos(data);
      } catch (err) {
        toast.error("Failed to load downloads");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const albumNames = useMemo(() => {
    const names = [...new Set(photos.map((p) => p.album_title))];
    return names.sort();
  }, [photos]);

  const filteredPhotos = useMemo(() => {
    if (selectedAlbum === "all") return photos;
    return photos.filter((p) => p.album_title === selectedAlbum);
  }, [photos, selectedAlbum]);

  const handleDownload = async (photo: DownloadablePhoto) => {
    setDownloadingId(photo.id);
    try {
      const url = await getSignedDownloadUrl(photo.image_url);
      window.open(url, "_blank");
      toast.success("Download started");
    } catch (err) {
      toast.error("Failed to generate download link");
      console.error(err);
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-semibold text-foreground">Downloads</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="h-8 w-full rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20"
      >
        <h1 className="font-display text-2xl font-semibold text-foreground mb-4">Downloads</h1>
        <Download className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="font-body text-muted-foreground">No downloads available yet.</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="font-display text-2xl font-semibold text-foreground">Downloads</h1>

        {albumNames.length > 1 && (
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedAlbum} onValueChange={setSelectedAlbum}>
              <SelectTrigger className="w-[200px] font-body text-sm">
                <SelectValue placeholder="Filter by album" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Albums</SelectItem>
                {albumNames.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filteredPhotos.map((photo, index) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="space-y-2"
          >
            <div className="relative group aspect-square rounded-lg overflow-hidden bg-muted">
              <img
                src={photo.thumbnail_url || photo.image_url}
                alt={photo.title ?? "Downloadable photo"}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-body truncate">
                {photo.album_title}
              </p>
              <Button
                size="sm"
                variant="outline"
                className="w-full font-body text-xs"
                disabled={downloadingId === photo.id}
                onClick={() => handleDownload(photo)}
              >
                {downloadingId === photo.id ? (
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Preparing...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </span>
                )}
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
