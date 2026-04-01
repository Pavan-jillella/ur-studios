import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Heart, Clock, ChevronRight, ImageIcon } from "lucide-react";
import { getProofingQueue, type GalleryAlbum } from "@/api/gallery";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminProofingQueue() {
  const navigate = useNavigate();
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQueue() {
      try {
        const data = await getProofingQueue();
        setAlbums(data);
      } catch (err) {
        toast.error("Failed to load proofing queue");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchQueue();
  }, []);

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    }
    if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    }
    return "Just now";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Proofing Queue
          </h1>
          <p className="font-body text-muted-foreground mt-1">
            Review client photo selections
          </p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Proofing Queue
        </h1>
        <p className="font-body text-muted-foreground mt-1">
          Review client photo selections
        </p>
      </div>

      {albums.length === 0 ? (
        <Card className="py-16">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-green-100 p-4 mb-4">
              <Heart className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="font-display text-xl font-semibold mb-2">
              All caught up!
            </h2>
            <p className="font-body text-muted-foreground max-w-md">
              No client selections are waiting for review. When clients submit
              their photo selections, they'll appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {albums.map((album, index) => (
            <motion.div
              key={album.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
                onClick={() => navigate(`/admin/gallery/${album.id}`)}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-4">
                    {/* Album cover */}
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

                    {/* Album info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display font-semibold truncate">
                          {album.title}
                        </h3>
                        <Badge variant="secondary" className="flex-shrink-0">
                          <Heart className="h-3 w-3 mr-1 fill-pink-500 text-pink-500" />
                          Selections Ready
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Submitted {album.selection_submitted_at && getTimeAgo(album.selection_submitted_at)}
                        </span>
                        {album.selection_limit && (
                          <span>Limit: {album.selection_limit} photos</span>
                        )}
                      </div>
                    </div>

                    {/* Action */}
                    <Button variant="ghost" size="icon" className="flex-shrink-0">
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
