import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import {
  Heart,
  Image as ImageIcon,
  Camera,
  Download,
  CalendarDays,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle,
  Sparkles,
  CreditCard,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getClientPortalData } from "@/lib/mockData";

// ─── Stat Card ──────────────────────
function QuickStat({
  label,
  value,
  icon: Icon,
  color,
  delay,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardContent className="p-5 flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-display font-bold tracking-tight">
              {value}
            </p>
            <p className="text-xs font-body text-muted-foreground uppercase tracking-wider">
              {label}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Gallery Preview Card ──────────────────────
function GalleryPreview({
  gallery,
  index,
}: {
  gallery: {
    id: string;
    title: string;
    coverUrl: string;
    photoCount: number;
    favorites: number;
    status: "delivered" | "proofing" | "draft";
  };
  index: number;
}) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
      className="group cursor-pointer"
      onClick={() => navigate("/portal/gallery")}
    >
      <div className="relative overflow-hidden rounded-2xl aspect-[4/3] bg-muted">
        <img
          src={gallery.coverUrl}
          alt={gallery.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <Badge
            className={`text-[10px] font-body shadow-lg ${
              gallery.status === "delivered"
                ? "bg-emerald-500/90 text-white border-0"
                : gallery.status === "proofing"
                ? "bg-amber-500/90 text-white border-0"
                : "bg-gray-500/90 text-white border-0"
            }`}
          >
            {gallery.status === "delivered"
              ? "✓ Ready"
              : gallery.status === "proofing"
              ? "Selecting"
              : "Draft"}
          </Badge>
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="font-display text-lg font-semibold leading-tight">
            {gallery.title}
          </h3>
          <div className="flex items-center gap-3 mt-2 text-white/80">
            <span className="flex items-center gap-1 text-xs font-body">
              <ImageIcon className="h-3 w-3" />
              {gallery.photoCount}
            </span>
            {gallery.favorites > 0 && (
              <span className="flex items-center gap-1 text-xs font-body">
                <Heart className="h-3 w-3 fill-current text-pink-400" />
                {gallery.favorites}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Landing Component ──────────────────────
export default function PortalLanding() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(getClientPortalData());

  useEffect(() => {
    setData(getClientPortalData());
  }, []);

  const firstName = (profile?.full_name || data.greeting).split(" ")[0];

  // Get current time greeting
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-10 pb-12">
      {/* Hero Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-foreground via-foreground/95 to-foreground/85 text-white px-8 py-10 md:px-12 md:py-14"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/[0.03] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-white/[0.02] translate-y-1/3 -translate-x-1/4" />
        <div className="absolute top-6 right-8 opacity-20">
          <Sparkles className="h-8 w-8" />
        </div>

        <div className="relative z-10">
          <p className="font-body text-sm text-white/60 uppercase tracking-wider mb-2">
            {timeGreeting}
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            Welcome back, {firstName} ✨
          </h1>
          <p className="font-body text-white/60 mt-3 text-lg max-w-xl">
            Your memories are safe with us. Here's everything at a glance.
          </p>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickStat
          label="Total Photos"
          value={data.totalPhotos.toString()}
          icon={ImageIcon}
          color="bg-blue-50 text-blue-600"
          delay={0.15}
        />
        <QuickStat
          label="Favorites"
          value={data.favoritesCount.toString()}
          icon={Heart}
          color="bg-pink-50 text-pink-600"
          delay={0.2}
        />
        <QuickStat
          label="Galleries"
          value={data.recentGalleries.length.toString()}
          icon={Camera}
          color="bg-purple-50 text-purple-600"
          delay={0.25}
        />
        <QuickStat
          label="Ready to Download"
          value={data.recentGalleries.filter((g) => g.status === "delivered").length.toString()}
          icon={Download}
          color="bg-emerald-50 text-emerald-600"
          delay={0.3}
        />
      </div>

      {/* Upcoming Session */}
      {data.upcomingSession && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <Card className="overflow-hidden border-primary/10 bg-primary/[0.02]">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                      <CalendarDays className="h-4 w-4" />
                    </div>
                    <span className="font-body text-xs uppercase tracking-wider text-primary font-semibold">
                      Upcoming Session
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-semibold">
                    {data.upcomingSession.service}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm font-body text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {new Date(data.upcomingSession.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {data.upcomingSession.time}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {data.upcomingSession.location}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => navigate("/portal/bookings")}
                  className="shrink-0 gap-2 rounded-xl"
                >
                  View Details
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recent Galleries */}
      <div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="flex items-center justify-between mb-5"
        >
          <h2 className="font-display text-2xl font-semibold">
            Your Galleries
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-sm font-body"
            onClick={() => navigate("/portal/gallery")}
          >
            View All
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.recentGalleries.map((gallery, index) => (
            <GalleryPreview key={gallery.id} gallery={gallery} index={index} />
          ))}
        </div>
      </div>

      {/* Recent Payments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-2xl font-semibold">
            Payment History
          </h2>
        </div>
        <Card>
          <CardContent className="p-0 divide-y divide-border">
            {data.recentPayments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-xl ${
                      payment.status === "paid"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {payment.status === "paid" ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <CreditCard className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-body text-sm font-medium">
                      {payment.description}
                    </p>
                    <p className="font-body text-xs text-muted-foreground">
                      {new Date(payment.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display text-lg font-semibold">
                    ${payment.amount.toLocaleString()}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${
                      payment.status === "paid"
                        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                        : "bg-amber-100 text-amber-700 border-amber-200"
                    }`}
                  >
                    {payment.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
