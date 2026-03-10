import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload, ImageIcon } from "lucide-react";
import {
  getAllPortfolioImages,
  createPortfolioImage,
  updatePortfolioImage,
  deletePortfolioImage,
  type PortfolioImage,
  type PortfolioImageInsert,
} from "@/api/portfolio";
import { uploadFile, deleteFile, getStoragePathFromUrl, getBucketFromUrl } from "@/lib/storage";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categories = ["Wedding", "Portrait", "Engagement", "Events", "Commercial"];

interface PortfolioFormData {
  title: string;
  alt_text: string;
  category: string;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
}

const defaultFormData: PortfolioFormData = {
  title: "",
  alt_text: "",
  category: "Wedding",
  is_featured: false,
  is_active: true,
  display_order: 0,
};

export default function AdminPortfolio() {
  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<PortfolioImage | null>(null);
  const [formData, setFormData] = useState<PortfolioFormData>(defaultFormData);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchImages = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllPortfolioImages();
      setImages(data);
    } catch (err) {
      toast.error("Failed to load portfolio images");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      if (!formData.title) {
        setFormData((prev) => ({
          ...prev,
          title: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
        }));
      }
    }
  };

  const openUploadDialog = () => {
    setFormData(defaultFormData);
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadDialogOpen(true);
  };

  const openEditDialog = (image: PortfolioImage) => {
    setEditingImage(image);
    setFormData({
      title: image.title,
      alt_text: image.alt_text ?? "",
      category: image.category,
      is_featured: image.is_featured,
      is_active: image.is_active,
      display_order: image.display_order,
    });
    setEditDialogOpen(true);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }
    if (!formData.title) {
      toast.error("Please provide a title");
      return;
    }

    setUploading(true);
    try {
      const timestamp = Date.now();
      const ext = selectedFile.name.split(".").pop();
      const path = `${timestamp}-${formData.title.replace(/\s+/g, "-").toLowerCase()}.${ext}`;

      const imageUrl = await uploadFile("portfolio", path, selectedFile);

      const payload: PortfolioImageInsert = {
        title: formData.title,
        alt_text: formData.alt_text || null,
        image_url: imageUrl,
        category: formData.category,
        is_featured: formData.is_featured,
        is_active: formData.is_active,
        display_order: formData.display_order,
      };

      const created = await createPortfolioImage(payload);
      setImages((prev) => [...prev, created]);
      setUploadDialogOpen(false);
      toast.success("Image uploaded successfully");
    } catch (err) {
      toast.error("Failed to upload image");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleEditSave = async () => {
    if (!editingImage) return;

    setSaving(true);
    try {
      const updated = await updatePortfolioImage(editingImage.id, {
        title: formData.title,
        alt_text: formData.alt_text || null,
        category: formData.category,
        is_featured: formData.is_featured,
        is_active: formData.is_active,
        display_order: formData.display_order,
      });
      setImages((prev) =>
        prev.map((img) => (img.id === updated.id ? updated : img))
      );
      setEditDialogOpen(false);
      toast.success("Image updated");
    } catch (err) {
      toast.error("Failed to update image");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (image: PortfolioImage) => {
    try {
      // Try to delete from storage
      const storagePath = getStoragePathFromUrl(image.image_url);
      const bucket = getBucketFromUrl(image.image_url);
      if (storagePath && bucket) {
        try {
          await deleteFile(bucket, storagePath);
        } catch {
          // Storage deletion may fail for external URLs; continue with DB deletion
        }
      }

      await deletePortfolioImage(image.id);
      setImages((prev) => prev.filter((img) => img.id !== image.id));
      setConfirmDeleteId(null);
      toast.success("Image deleted");
    } catch (err) {
      toast.error("Failed to delete image");
      console.error(err);
    }
  };

  const formFields = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder="Image title"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="alt_text">Alt Text</Label>
        <Input
          id="alt_text"
          value={formData.alt_text}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, alt_text: e.target.value }))
          }
          placeholder="Descriptive alt text for accessibility"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, category: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="display_order">Display Order</Label>
          <Input
            id="display_order"
            type="number"
            value={formData.display_order}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                display_order: parseInt(e.target.value) || 0,
              }))
            }
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <Switch
            id="is_featured"
            checked={formData.is_featured}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, is_featured: checked }))
            }
          />
          <Label htmlFor="is_featured">Featured</Label>
        </div>
        <div className="flex items-center gap-3">
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, is_active: checked }))
            }
          />
          <Label htmlFor="is_active">Active</Label>
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Portfolio
          </h1>
          <p className="font-body text-muted-foreground mt-1">
            Manage your portfolio images
          </p>
        </div>
        <Button onClick={openUploadDialog}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Image
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-lg" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <ImageIcon className="h-12 w-12 mb-4" />
          <p className="font-body text-lg">No portfolio images yet</p>
          <Button variant="outline" className="mt-4" onClick={openUploadDialog}>
            Upload your first image
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {images.map((image) => (
            <Card key={image.id} className="overflow-hidden group">
              <div className="relative aspect-square">
                <img
                  src={image.image_url}
                  alt={image.alt_text ?? image.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                <div className="absolute top-2 right-2 flex gap-1">
                  {image.is_featured && (
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px]">
                      Featured
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-[10px]">
                    {image.category}
                  </Badge>
                </div>
                <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => openEditDialog(image)}
                  >
                    <Pencil className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  {confirmDeleteId === image.id ? (
                    <>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => handleDelete(image)}
                      >
                        Confirm
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setConfirmDeleteId(null)}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setConfirmDeleteId(image.id)}
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
              <CardContent className="p-3">
                <p className="font-body text-sm font-medium truncate">
                  {image.title}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Upload Image
            </DialogTitle>
            <DialogDescription>
              Upload a new image to your portfolio
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Image File *</Label>
              <div
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="mx-auto max-h-40 rounded object-contain"
                  />
                ) : (
                  <div className="text-muted-foreground">
                    <Upload className="mx-auto h-8 w-8 mb-2" />
                    <p className="text-sm">Click to select an image</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              {selectedFile && (
                <p className="text-xs text-muted-foreground">
                  {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            {formFields}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUploadDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Metadata Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Edit Image
            </DialogTitle>
            <DialogDescription>
              Update the image metadata
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {editingImage && (
              <div className="mb-4">
                <img
                  src={editingImage.image_url}
                  alt={editingImage.alt_text ?? editingImage.title}
                  className="w-full max-h-40 object-contain rounded"
                />
              </div>
            )}
            {formFields}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
