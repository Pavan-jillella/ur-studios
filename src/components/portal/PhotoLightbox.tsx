import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Heart,
  MessageSquare,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
} from "lucide-react";
import { GalleryPhoto, PhotoCategory } from "@/api/gallery";
import { cn } from "@/lib/utils";

interface PhotoLightboxProps {
  photos: GalleryPhoto[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onToggleApproval?: (photo: GalleryPhoto) => void;
  onUpdateNotes?: (photo: GalleryPhoto, notes: string) => void;
  onUpdateCategory?: (photo: GalleryPhoto, category: PhotoCategory) => void;
  onDownload?: (photo: GalleryPhoto) => void;
  isProofingMode?: boolean;
  selectionLimit?: number;
  currentSelectionCount?: number;
}

export function PhotoLightbox({
  photos,
  initialIndex,
  isOpen,
  onClose,
  onToggleApproval,
  onUpdateNotes,
  onUpdateCategory,
  onDownload,
  isProofingMode = false,
  selectionLimit,
  currentSelectionCount = 0,
}: PhotoLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showNotes, setShowNotes] = useState(false);
  const [localNotes, setLocalNotes] = useState("");
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const currentPhoto = photos[currentIndex];

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (currentPhoto) {
      setLocalNotes(currentPhoto.client_notes || "");
      setZoom(1);
      setRotation(0);
    }
  }, [currentPhoto]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  }, [photos.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  }, [photos.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          goToPrevious();
          break;
        case "ArrowRight":
          goToNext();
          break;
        case "Escape":
          onClose();
          break;
        case "f":
        case "F":
          if (isProofingMode && onToggleApproval && currentPhoto) {
            onToggleApproval(currentPhoto);
          }
          break;
        case "n":
        case "N":
          setShowNotes((prev) => !prev);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, goToPrevious, goToNext, onClose, isProofingMode, onToggleApproval, currentPhoto]);

  const handleSaveNotes = () => {
    if (onUpdateNotes && currentPhoto) {
      onUpdateNotes(currentPhoto, localNotes);
    }
    setShowNotes(false);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  if (!currentPhoto) return null;

  const canSelectMore = !selectionLimit || currentSelectionCount < selectionLimit || currentPhoto.is_approved;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-black/95 border-none">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-4">
            <span className="text-white/80 text-sm">
              {currentIndex + 1} / {photos.length}
            </span>
            {currentPhoto.title && (
              <span className="text-white font-medium">{currentPhoto.title}</span>
            )}
            {currentPhoto.is_approved && (
              <Badge variant="secondary" className="bg-pink-500/20 text-pink-300">
                <Heart className="w-3 h-3 mr-1 fill-current" />
                Selected
              </Badge>
            )}
            {currentPhoto.category !== "none" && (
              <Badge variant="outline" className="text-white/80 border-white/30">
                {currentPhoto.category === "album" && "For Album"}
                {currentPhoto.category === "print" && "For Print"}
                {currentPhoto.category === "rejected" && "Rejected"}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom controls */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomOut}
              className="text-white hover:bg-white/20"
            >
              <ZoomOut className="w-5 h-5" />
            </Button>
            <span className="text-white/60 text-sm w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomIn}
              className="text-white hover:bg-white/20"
            >
              <ZoomIn className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRotate}
              className="text-white hover:bg-white/20"
            >
              <RotateCw className="w-5 h-5" />
            </Button>

            <div className="w-px h-6 bg-white/20 mx-2" />

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Main image area */}
        <div className="flex items-center justify-center w-full h-full">
          {/* Previous button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            className="absolute left-4 z-10 w-12 h-12 rounded-full bg-black/50 text-white hover:bg-black/70"
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>

          {/* Image */}
          <div className="flex items-center justify-center overflow-hidden w-full h-full p-16">
            <img
              src={currentPhoto.image_url}
              alt={currentPhoto.title || "Photo"}
              className="max-w-full max-h-full object-contain transition-transform duration-200"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
              }}
              draggable={false}
            />
          </div>

          {/* Next button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="absolute right-4 z-10 w-12 h-12 rounded-full bg-black/50 text-white hover:bg-black/70"
          >
            <ChevronRight className="w-8 h-8" />
          </Button>
        </div>

        {/* Bottom toolbar */}
        <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-4 p-4 bg-gradient-to-t from-black/80 to-transparent">
          {isProofingMode && (
            <>
              {/* Favorite button */}
              <Button
                variant={currentPhoto.is_approved ? "default" : "outline"}
                onClick={() => onToggleApproval?.(currentPhoto)}
                disabled={!canSelectMore && !currentPhoto.is_approved}
                className={cn(
                  "gap-2",
                  currentPhoto.is_approved
                    ? "bg-pink-500 hover:bg-pink-600 text-white"
                    : "border-white/30 text-white hover:bg-white/20"
                )}
              >
                <Heart
                  className={cn("w-5 h-5", currentPhoto.is_approved && "fill-current")}
                />
                {currentPhoto.is_approved ? "Selected" : "Select"}
                <span className="text-xs opacity-70">(F)</span>
              </Button>

              {/* Notes button */}
              <Button
                variant="outline"
                onClick={() => setShowNotes(!showNotes)}
                className={cn(
                  "gap-2 border-white/30 text-white hover:bg-white/20",
                  currentPhoto.client_notes && "border-blue-400 text-blue-300"
                )}
              >
                <MessageSquare className="w-5 h-5" />
                Notes
                <span className="text-xs opacity-70">(N)</span>
              </Button>

              {/* Category buttons */}
              {onUpdateCategory && (
                <div className="flex gap-1 border border-white/30 rounded-lg p-1">
                  {(["album", "print"] as PhotoCategory[]).map((cat) => (
                    <Button
                      key={cat}
                      variant={currentPhoto.category === cat ? "default" : "ghost"}
                      size="sm"
                      onClick={() => onUpdateCategory(currentPhoto, currentPhoto.category === cat ? "none" : cat)}
                      className={cn(
                        "text-xs",
                        currentPhoto.category === cat
                          ? "bg-white/20 text-white"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                      )}
                    >
                      {cat === "album" ? "Album" : "Print"}
                    </Button>
                  ))}
                </div>
              )}
            </>
          )}

          {onDownload && currentPhoto.is_downloadable && (
            <Button
              variant="outline"
              onClick={() => onDownload(currentPhoto)}
              className="gap-2 border-white/30 text-white hover:bg-white/20"
            >
              <Download className="w-5 h-5" />
              Download
            </Button>
          )}

          {/* Selection progress */}
          {isProofingMode && selectionLimit && (
            <div className="absolute right-4 flex items-center gap-2 text-white/80">
              <span className="text-sm">
                {currentSelectionCount} / {selectionLimit} selected
              </span>
              <div className="w-24 h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-pink-500 transition-all duration-300"
                  style={{
                    width: `${Math.min((currentSelectionCount / selectionLimit) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Notes panel */}
        {showNotes && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-96 bg-zinc-900 rounded-lg p-4 shadow-xl z-20">
            <h4 className="text-white font-medium mb-2">Add Notes</h4>
            <p className="text-white/60 text-sm mb-3">
              Add crop suggestions, favorite reasons, or requests
            </p>
            <Textarea
              value={localNotes}
              onChange={(e) => setLocalNotes(e.target.value)}
              placeholder="e.g., 'Love this one! Can you crop tighter?'"
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-white/40 mb-3"
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowNotes(false)}
                className="text-white/70 hover:text-white"
              >
                Cancel
              </Button>
              <Button onClick={handleSaveNotes}>Save Notes</Button>
            </div>
          </div>
        )}

        {/* Keyboard hints */}
        <div className="absolute bottom-4 left-4 text-white/40 text-xs space-x-4">
          <span>← → Navigate</span>
          <span>ESC Close</span>
          {isProofingMode && <span>F Select</span>}
          <span>N Notes</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
