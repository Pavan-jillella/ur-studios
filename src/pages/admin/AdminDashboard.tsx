import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  DollarSign,
  Users,
  Camera,
  Clock,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Bell,
  Calendar,
  CreditCard,
  Heart,
  Image,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getDashboardStats,
  MOCK_PROJECTS,
  MOCK_NOTIFICATIONS,
  MOCK_REVENUE_HISTORY,
  MOCK_SERVICE_BREAKDOWN,
  MOCK_INVOICES,
  MOCK_GALLERY_STATS,
} from "@/lib/mockData";

// ─── Stat Card ──────────────────────
function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendUp,
  delay,
  onClick,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
  delay: number;
  onClick?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card
        className={`relative overflow-hidden group transition-shadow duration-300 hover:shadow-lg ${onClick ? "cursor-pointer" : ""}`}
        onClick={onClick}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/[0.03] group-hover:to-primary/[0.06] transition-all duration-500" />
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-body text-muted-foreground font-medium uppercase tracking-wider">
                {title}
              </p>
              <p className="text-3xl font-display font-bold tracking-tight">
                {value}
              </p>
              {subtitle && (
                <p className="text-xs font-body text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="p-2.5 rounded-xl bg-primary/8 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              {trend && (
                <div
                  className={`flex items-center gap-0.5 text-xs font-medium font-body ${
                    trendUp ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  {trendUp ? (
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5" />
                  )}
                  {trend}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Mini Revenue Chart (SVG) ──────────────────────
function RevenueChart() {
  const data = MOCK_REVENUE_HISTORY;
  const max = Math.max(...data.map((d) => d.revenue));
  const min = Math.min(...data.map((d) => d.revenue));
  const range = max - min || 1;
  const width = 100;
  const height = 50;
  const padding = 4;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((d.revenue - min) / range) * (height - padding * 2);
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-28" preserveAspectRatio="none">
        <defs>
          <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(35, 60%, 55%)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(35, 60%, 55%)" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#revenueGradient)" />
        <path d={linePath} fill="none" stroke="hsl(35, 60%, 55%)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="2" fill="hsl(35, 60%, 55%)" />
        ))}
      </svg>
      <div className="flex justify-between px-1 mt-1">
        {data.map((d) => (
          <span key={d.month} className="text-[10px] font-body text-muted-foreground">
            {d.month}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Service Breakdown ──────────────────────
function ServiceBreakdown() {
  const data = MOCK_SERVICE_BREAKDOWN;
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="space-y-3">
      {data.map((service) => {
        const pct = Math.round((service.count / total) * 100);
        return (
          <div key={service.name} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-body font-medium text-foreground">
                {service.name}
              </span>
              <span className="text-sm font-body text-muted-foreground">
                {service.count} ({pct}%)
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="h-full rounded-full"
                style={{ backgroundColor: service.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Status helpers ──────────────────────
const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-700 border-gray-200" },
  shooting: { label: "Shooting", color: "bg-blue-100 text-blue-700 border-blue-200" },
  editing: { label: "Editing", color: "bg-amber-100 text-amber-700 border-amber-200" },
  delivered: { label: "Delivered", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

const notifIcons: Record<string, React.ElementType> = {
  booking: Calendar,
  payment: CreditCard,
  gallery: Image,
  favorite: Heart,
};

const notifColors: Record<string, string> = {
  booking: "text-blue-500 bg-blue-50",
  payment: "text-emerald-500 bg-emerald-50",
  gallery: "text-purple-500 bg-purple-50",
  favorite: "text-pink-500 bg-pink-50",
};

function formatTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

// ─── Main Dashboard Component ──────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(getDashboardStats());

  // Simulate live updates
  useEffect(() => {
    setStats(getDashboardStats());
  }, []);

  const upcomingProjects = MOCK_PROJECTS
    .filter((p) => p.status === "draft" || p.status === "shooting")
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
    .slice(0, 5);

  const recentNotifications = MOCK_NOTIFICATIONS.slice(0, 5);

  const overdueInvoices = MOCK_INVOICES.filter((i) => i.status === "overdue");

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="font-body text-muted-foreground mt-1">
          Welcome back. Here's your business at a glance.
        </p>
      </motion.div>

      {/* KPI Cards Row */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          subtitle="From paid invoices"
          icon={DollarSign}
          trend="+18%"
          trendUp={true}
          delay={0.05}
        />
        <StatCard
          title="Active Clients"
          value={stats.activeClients.toString()}
          subtitle="Total in system"
          icon={Users}
          trend="+3 new"
          trendUp={true}
          delay={0.1}
          onClick={() => navigate("/admin/users")}
        />
        <StatCard
          title="Upcoming Shoots"
          value={stats.upcomingShoots.toString()}
          subtitle="Draft + shooting"
          icon={Camera}
          delay={0.15}
          onClick={() => navigate("/admin/bookings")}
        />
        <StatCard
          title="Pending Payments"
          value={stats.pendingPayments.toString()}
          subtitle={stats.overdueAmount > 0 ? `$${stats.overdueAmount.toLocaleString()} overdue` : "On track"}
          icon={Clock}
          trend={stats.overdueAmount > 0 ? "Overdue" : undefined}
          trendUp={false}
          delay={0.2}
        />
        <StatCard
          title="Delivered"
          value={stats.deliveredProjects.toString()}
          subtitle="Completed projects"
          icon={CheckCircle}
          delay={0.25}
        />
      </div>

      {/* Two-column layout: Charts + Activity */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Revenue Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="font-display text-lg font-semibold">
                  Revenue Trend
                </CardTitle>
                <div className="flex items-center gap-1.5 text-emerald-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs font-body font-medium">+18% vs last period</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <RevenueChart />
            </CardContent>
          </Card>
        </motion.div>

        {/* Service Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg font-semibold">
                Bookings by Service
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ServiceBreakdown />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Three-column layout: Upcoming + Notifications + Overdue */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Upcoming Shoots */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="font-display text-lg font-semibold">
                  Upcoming Shoots
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/admin/bookings")}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors cursor-pointer"
                  onClick={() => navigate("/admin/bookings")}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-body text-sm font-medium truncate">
                      {project.clientName}
                    </p>
                    <p className="font-body text-xs text-muted-foreground">
                      {new Date(project.eventDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      · {project.serviceType}
                    </p>
                  </div>
                  <Badge variant="outline" className={`ml-2 text-[10px] shrink-0 ${statusConfig[project.status]?.color}`}>
                    {statusConfig[project.status]?.label}
                  </Badge>
                </div>
              ))}
              {upcomingProjects.length === 0 && (
                <p className="text-sm font-body text-muted-foreground text-center py-4">
                  No upcoming shoots
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="font-display text-lg font-semibold flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Activity
                </CardTitle>
                {recentNotifications.filter((n) => !n.read).length > 0 && (
                  <Badge className="bg-primary text-primary-foreground text-[10px]">
                    {recentNotifications.filter((n) => !n.read).length} new
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentNotifications.map((notif) => {
                const IconComp = notifIcons[notif.type] || Bell;
                return (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-3 p-2.5 rounded-lg transition-colors ${
                      !notif.read ? "bg-primary/[0.04]" : ""
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 ${notifColors[notif.type]}`}>
                      <IconComp className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-body text-sm font-medium leading-tight">
                        {notif.title}
                      </p>
                      <p className="font-body text-xs text-muted-foreground mt-0.5 truncate">
                        {notif.message}
                      </p>
                      <p className="font-body text-[10px] text-muted-foreground/70 mt-1">
                        {formatTimeAgo(notif.timestamp)}
                      </p>
                    </div>
                    {!notif.read && (
                      <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Gallery Activity + Overdue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="space-y-6"
        >
          {/* Overdue Alert */}
          {overdueInvoices.length > 0 && (
            <Card className="border-red-200 bg-red-50/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-red-600" />
                  <span className="font-body text-sm font-semibold text-red-700">
                    Overdue Payments
                  </span>
                </div>
                <div className="space-y-2">
                  {overdueInvoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between p-2 rounded-md bg-white/60"
                    >
                      <p className="font-body text-sm text-red-800 truncate">
                        {inv.clientName}
                      </p>
                      <span className="font-body text-sm font-semibold text-red-700">
                        ${inv.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Gallery Stats */}
          <Card className="h-auto">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="font-display text-lg font-semibold">
                  Gallery Activity
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/admin/gallery")}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {MOCK_GALLERY_STATS.slice(0, 4).map((album) => (
                <div
                  key={album.albumId}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors cursor-pointer"
                  onClick={() => navigate("/admin/gallery")}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-body text-sm font-medium truncate">
                      {album.albumTitle}
                    </p>
                    <p className="font-body text-xs text-muted-foreground">
                      {album.totalPhotos} photos · {album.favorites} ❤️
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`ml-2 text-[10px] shrink-0 ${
                      album.status === "delivered"
                        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                        : album.status === "proofing"
                        ? "bg-amber-100 text-amber-700 border-amber-200"
                        : "bg-gray-100 text-gray-700 border-gray-200"
                    }`}
                  >
                    {album.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
