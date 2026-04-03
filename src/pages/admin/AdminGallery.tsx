import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Plus, Trash2, FolderOpen } from "lucide-react";
import {
  getAllAlbums,
  createAlbum,
  deleteAlbum,
  type GalleryAlbum,
  type GalleryAlbumInsert,
} from "@/api/gallery";
import { getBookings, type Booking } from "@/api/bookings";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
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

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800 border-gray-200",
  proofing: "bg-amber-100 text-amber-800 border-amber-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
};

interface AlbumFormData {
  title: string;
  description: string;
  booking_id: string;
  client_id: string;
  status: string;
  is_downloadable: boolean;
}

const defaultFormData: AlbumFormData = {
  title: "",
  description: "",
  booking_id: "",
  client_id: "",
  status: "draft",
  is_downloadable: false,
};

export default function AdminGallery() {
  const navigate = useNavigate();
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<AlbumFormData>(defaultFormData);
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [albumsData, bookingsData] = await Promise.allSettled([
        getAllAlbums(),
        getBookings(),
      ]);
      setAlbums(albumsData.status === "fulfilled" ? albumsData.value : []);
      setBookings(bookingsData.status === "fulfilled" ? bookingsData.value : []);
      // Only show error if BOTH failed and it's a real error (not just empty)
      if (albumsData.status === "rejected" && bookingsData.status === "rejected") {
        const msg = (albumsData.reason as Error)?.message || "";
        if (!msg.includes("not configured")) {
          toast.error("Failed to load gallery data");
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreateDialog = () => {
    setFormData(defaultFormData);
    setDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!formData.title) {
      toast.error("Please provide a title");
      return;
    }

    setSaving(true);
    try {
      const payload: GalleryAlbumInsert = {
        title: formData.title,
        description: formData.description || null,
        booking_id: formData.booking_id || null,
        client_id: formData.client_id || null,
        status: formData.status as "draft" | "proofing" | "delivered",
        is_downloadable: formData.is_downloadable,
        cover_image_url: null,
        selection_limit: null,
        selection_submitted_at: null,
        selection_approved_at: null,
        admin_feedback: null,
      };

      const created = await createAlbum(payload);
      setAlbums((prev) => [created, ...prev]);
      setDialogOpen(false);
      toast.success("Album created");
    } catch (err) {
      toast.error("Failed to create album");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAlbum(id);
      setAlbums((prev) => prev.filter((a) => a.id !== id));
      setConfirmDeleteId(null);
      toast.success("Album deleted");
    } catch (err) {
      toast.error("Failed to delete album");
      console.error(err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Gallery
          </h1>
          <p className="font-body text-muted-foreground mt-1">
            Manage client photo albums and galleries
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Create Album
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : albums.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <FolderOpen className="h-12 w-12 mb-4" />
          <p className="font-body text-lg">No albums yet</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={openCreateDialog}
          >
            Create your first album
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Photos</TableHead>
                <TableHead>Downloadable</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {albums.map((album) => (
                <TableRow
                  key={album.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/admin/gallery/${album.id}`)}
                >
                  <TableCell>
                    <div>
                      <p className="font-medium">{album.title}</p>
                      {album.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {album.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusColors[album.status] ?? ""}
                    >
                      {album.status}
                    </Badge>
                  </TableCell>
                  <TableCell>—</TableCell>
                  <TableCell>
                    {album.is_downloadable ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        Yes
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">No</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(album.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      {confirmDeleteId === album.id ? (
                        <>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(album.id)}
                          >
                            Confirm
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setConfirmDeleteId(null)}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setConfirmDeleteId(album.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create Album Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Create Album
            </DialogTitle>
            <DialogDescription>
              Create a new photo album for a client
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Album title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Optional description"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Linked Booking</Label>
              <Select
                value={formData.booking_id}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, booking_id: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a booking (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {bookings.map((booking) => (
                    <SelectItem key={booking.id} value={booking.id}>
                      {booking.name} - {booking.service_type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_id">Client ID</Label>
              <Input
                id="client_id"
                value={formData.client_id}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    client_id: e.target.value,
                  }))
                }
                placeholder="Client user ID (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
              >
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

            <div className="flex items-center gap-3">
              <Switch
                id="is_downloadable"
                checked={formData.is_downloadable}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    is_downloadable: checked,
                  }))
                }
              />
              <Label htmlFor="is_downloadable">Allow Downloads</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? "Creating..." : "Create Album"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
