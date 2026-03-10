import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getClientBookings, type Booking } from "@/api/bookings";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CalendarDays, MapPin, Phone, Mail, CreditCard, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "confirmed":
      return "default";
    case "pending":
      return "secondary";
    case "cancelled":
      return "destructive";
    default:
      return "outline";
  }
}

function paymentVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "paid":
      return "default";
    case "unpaid":
      return "destructive";
    case "refunded":
      return "secondary";
    default:
      return "outline";
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Not specified";
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function PortalBookings() {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const data = await getClientBookings(user!.id);
        setBookings(data);
      } catch (err) {
        console.error("Failed to load bookings:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user, authLoading]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-2xl font-semibold text-foreground">My Bookings</h1>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20"
      >
        <h1 className="font-display text-2xl font-semibold text-foreground mb-4">My Bookings</h1>
        <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="font-body text-muted-foreground">
          No bookings yet. Book a session on our{" "}
          <a href="/#contact" className="text-primary underline hover:text-primary/80">
            website
          </a>
          .
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold text-foreground">My Bookings</h1>

      <div className="space-y-4">
        {bookings.map((booking, index) => (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => toggleExpand(booking.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-display text-lg font-medium">
                    {booking.service_type}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariant(booking.status)}>
                      {booking.status}
                    </Badge>
                    <Badge variant={paymentVariant(booking.payment_status)}>
                      {booking.payment_status}
                    </Badge>
                    {expandedId === booking.id ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground font-body">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDate(booking.event_date)}
                  </span>
                  {booking.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {booking.location}
                    </span>
                  )}
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedId === booking.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 border-t border-border space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-body">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-3.5 w-3.5" />
                            <span>{booking.email}</span>
                          </div>
                          {booking.phone && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="h-3.5 w-3.5" />
                              <span>{booking.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <span className="font-medium text-foreground">Name:</span>
                            <span>{booking.name}</span>
                          </div>
                        </div>
                        {booking.message && (
                          <div className="text-sm font-body">
                            <span className="font-medium text-foreground">Message:</span>
                            <p className="mt-1 text-muted-foreground">{booking.message}</p>
                          </div>
                        )}
                        {booking.payment_status === "unpaid" && (
                          <div className="pt-2">
                            <Button size="sm" className="font-body">
                              <CreditCard className="h-4 w-4 mr-1.5" />
                              Complete Payment
                            </Button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
