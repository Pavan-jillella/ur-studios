import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  getBookings,
  updateBooking,
  deleteBooking,
  type Booking,
} from "@/api/bookings";
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
import { Trash2 } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  confirmed: "bg-green-100 text-green-800 border-green-200",
  completed: "bg-blue-100 text-blue-800 border-blue-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const paymentColors: Record<string, string> = {
  unpaid: "bg-red-100 text-red-800 border-red-200",
  paid: "bg-green-100 text-green-800 border-green-200",
  refunded: "bg-yellow-100 text-yellow-800 border-yellow-200",
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getBookings();
      setBookings(data);
    } catch (err) {
      toast.error("Failed to load bookings");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleStatusChange = async (status: string) => {
    if (!selectedBooking) return;
    setUpdatingStatus(true);
    try {
      const updated = await updateBooking(selectedBooking.id, { status });
      setBookings((prev) =>
        prev.map((b) => (b.id === updated.id ? updated : b))
      );
      setSelectedBooking(updated);
      toast.success("Booking status updated");
    } catch (err) {
      toast.error("Failed to update status");
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePaymentChange = async (payment_status: string) => {
    if (!selectedBooking) return;
    setUpdatingStatus(true);
    try {
      const updated = await updateBooking(selectedBooking.id, {
        payment_status,
      });
      setBookings((prev) =>
        prev.map((b) => (b.id === updated.id ? updated : b))
      );
      setSelectedBooking(updated);
      toast.success("Payment status updated");
    } catch (err) {
      toast.error("Failed to update payment status");
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBooking(id);
      setBookings((prev) => prev.filter((b) => b.id !== id));
      setConfirmDeleteId(null);
      setDialogOpen(false);
      setSelectedBooking(null);
      toast.success("Booking deleted");
    } catch (err) {
      toast.error("Failed to delete booking");
      console.error(err);
    }
  };

  const openBookingDetail = (booking: Booking) => {
    setSelectedBooking(booking);
    setDialogOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Bookings
        </h1>
        <p className="font-body text-muted-foreground mt-1">
          Manage all client bookings and inquiries
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p className="font-body text-lg">No bookings yet</p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow
                  key={booking.id}
                  className="cursor-pointer"
                  onClick={() => openBookingDetail(booking)}
                >
                  <TableCell className="font-medium">{booking.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {booking.email}
                  </TableCell>
                  <TableCell>{booking.service_type}</TableCell>
                  <TableCell>
                    {booking.event_date
                      ? new Date(booking.event_date).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusColors[booking.status] ?? ""}
                    >
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={paymentColors[booking.payment_status] ?? ""}
                    >
                      {booking.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(booking.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Booking Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedBooking && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl">
                  Booking Details
                </DialogTitle>
                <DialogDescription>
                  Booking from {selectedBooking.name}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Name
                    </p>
                    <p className="font-body">{selectedBooking.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Email
                    </p>
                    <p className="font-body">{selectedBooking.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Phone
                    </p>
                    <p className="font-body">
                      {selectedBooking.phone || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Service
                    </p>
                    <p className="font-body">
                      {selectedBooking.service_type}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Event Date
                    </p>
                    <p className="font-body">
                      {selectedBooking.event_date
                        ? new Date(
                            selectedBooking.event_date
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Location
                    </p>
                    <p className="font-body">
                      {selectedBooking.location || "N/A"}
                    </p>
                  </div>
                </div>

                {selectedBooking.message && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Message
                    </p>
                    <p className="font-body mt-1 whitespace-pre-wrap rounded-md bg-muted p-3 text-sm">
                      {selectedBooking.message}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Status
                    </p>
                    <Select
                      value={selectedBooking.status}
                      onValueChange={handleStatusChange}
                      disabled={updatingStatus}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Payment
                    </p>
                    <Select
                      value={selectedBooking.payment_status}
                      onValueChange={handlePaymentChange}
                      disabled={updatingStatus}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unpaid">Unpaid</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  Created:{" "}
                  {new Date(selectedBooking.created_at).toLocaleString()}
                </div>
              </div>

              <DialogFooter>
                {confirmDeleteId === selectedBooking.id ? (
                  <div className="flex w-full items-center justify-between">
                    <p className="text-sm text-destructive">
                      Are you sure? This cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setConfirmDeleteId(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(selectedBooking.id)}
                      >
                        Confirm Delete
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setConfirmDeleteId(selectedBooking.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Booking
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
