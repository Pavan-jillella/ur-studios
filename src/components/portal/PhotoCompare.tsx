import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Heart, Check, ArrowLeftRight } from "lucide-react";
import { GalleryPhoto } from "@/api/gallery";
import { cn } from "@/lib/utils";

interface PhotoCompareProps {
  photos: GalleryPhoto[];
  isOpen: boolean;
  onClose: () => void;
  onToggleApproval?: (photo: GalleryPhoto) => void;
}

export function PhotoCompare({
  photos,
  isOpen,
  onClose,
  onToggleApproval,
}: PhotoCompareProps) {
  const [selectedPhotos, setSelectedPhotos] = useState<GalleryPhoto[]>([]);

  const togglePhotoSelection = (photo: GalleryPhoto) => {
    if (selectedPhotos.find((p) => p.id === photo.id)) {
      setSelectedPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    } else if (selectedPhotos.length < 3) {
      setSelectedPhotos((prev) => [...prev, photo]);
    }
  };

  const isSelected = (photo: GalleryPhoto) =>
    selectedPhotos.some((p) => p.id === photo.id);

  const handleClose = () => {
    setSelectedPhotos([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-zinc-950 border-none">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-4">
            <ArrowLeftRight className="w-5 h-5 text-white" />
            <span className="text-white font-medium">Compare Photos</span>
            <Badge variant="secondary" className="bg-white/20 text-white">
              Select up to 3 photos
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex flex-col h-full pt-16 pb-4">
          {/* Comparison View */}
          {selectedPhotos.length > 0 && (
            <div className="flex-1 flex items-center justify-center gap-4 px-4 mb-4">
              {selectedPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative flex-1 max-w-[500px] h-full flex flex-col"
                >
                  <div className="relative flex-1 rounded-lg overflow-hidden bg-zinc-900">
                    <img
                      src={photo.image_url}
                      alt={photo.title || "Photo"}
                      className="w-full h-full object-contain"
                    />
                    {/* Selection indicator */}
                    {photo.is_approved && (
                      <Badge className="absolute top-2 right-2 bg-pink-500">
                        <Heart className="w-3 h-3 mr-1 fill-current" />
                        Selected
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-white/70 text-sm truncate">
                      {photo.title || "Untitled"}
                    </span>
                    <div className="flex gap-2">
                      {onToggleApproval && (
                        <Button
                          size="sm"
                          variant={photo.is_approved ? "default" : "outline"}
                          onClick={() => onToggleApproval(photo)}
                          className={cn(
                            photo.is_approved
                              ? "bg-pink-500 hover:bg-pink-600"
                              : "border-white/30 text-white hover:bg-white/20"
                          )}
                        >
                          <Heart
                            className={cn(
                              "w-4 h-4 mr-1",
                              photo.is_approved && "fill-current"
                            )}
                          />
                          {photo.is_approved ? "Selected" : "Select"}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => togglePhotoSelection(photo)}
                        className="text-white/70 hover:text-white"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {selectedPhotos.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-white/60">
                <ArrowLeftRight className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Select photos below to compare</p>
                <p className="text-sm mt-1">Click on up to 3 photos</p>
              </div>
            </div>
          )}

          {/* Photo strip */}
          <div className="px-4">
            <div className="bg-zinc-900 rounded-lg p-3">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {photos.map((photo) => (
                  <button
                    key={photo.id}
                    onClick={() => togglePhotoSelection(photo)}
                    className={cn(
                      "relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all",
                      isSelected(photo)
                        ? "ring-2 ring-primary ring-offset-2 ring-offset-zinc-900"
                        : "hover:ring-2 hover:ring-white/50",
                      selectedPhotos.length >= 3 &&
                        !isSelected(photo) &&
                        "opacity-50 cursor-not-allowed"
                    )}
                    disabled={selectedPhotos.length >= 3 && !isSelected(photo)}
                  >
                    <img
                      src={photo.thumbnail_url || photo.image_url}
                      alt={photo.title || "Photo"}
                      className="w-full h-full object-cover"
                    />
                    {isSelected(photo) && (
                      <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                        <Check className="w-6 h-6 text-white" />
                      </div>
                    )}
                    {photo.is_approved && (
                      <div className="absolute top-1 right-1 w-4 h-4 bg-pink-500 rounded-full flex items-center justify-center">
                        <Heart className="w-2.5 h-2.5 text-white fill-current" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
