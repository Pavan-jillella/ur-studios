import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Camera,
  BarChart3,
  PieChart,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MOCK_INVOICES,
  MOCK_CLIENTS,
  MOCK_PROJECTS,
  MOCK_REVENUE_HISTORY,
  MOCK_SERVICE_BREAKDOWN,
} from "@/lib/mockData";

// ─── SVG Revenue Chart (reusable) ──────────────────────
function RevenueChart({ data }: { data: { month: string; revenue: number }[] }) {
  const max = Math.max(...data.map((d) => d.revenue));
  const w = 700;
  const h = 220;
  const padX = 50;
  const padY = 30;
  const chartW = w - padX * 2;
  const chartH = h - padY * 2;

  const points = data.map((d, i) => ({
    x: padX + (i / (data.length - 1)) * chartW,
    y: padY + chartH - (d.revenue / max) * chartH,
  }));

  const path = points.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(" ");
  const areaPath = `${path} L${points[points.length - 1].x},${h - padY} L${points[0].x},${h - padY} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((frac) => (
        <g key={frac}>
          <line
            x1={padX}
            y1={padY + chartH * (1 - frac)}
            x2={w - padX}
            y2={padY + chartH * (1 - frac)}
            stroke="currentColor"
            strokeOpacity={0.06}
          />
          <text
            x={padX - 8}
            y={padY + chartH * (1 - frac) + 4}
            textAnchor="end"
            className="fill-muted-foreground text-[10px] font-body"
          >
            ${(max * frac / 1000).toFixed(1)}k
          </text>
        </g>
      ))}

      {/* Gradient fill */}
      <defs>
        <linearGradient id="revenue-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(35, 60%, 55%)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="hsl(35, 60%, 55%)" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#revenue-grad)" />
      <path d={path} fill="none" stroke="hsl(35, 60%, 55%)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots + Labels */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill="hsl(35, 60%, 55%)" stroke="white" strokeWidth="2" />
          <text
            x={p.x}
            y={h - 8}
            textAnchor="middle"
            className="fill-muted-foreground text-[11px] font-body"
          >
            {data[i].month}
          </text>
          <text
            x={p.x}
            y={p.y - 12}
            textAnchor="middle"
            className="fill-foreground text-[10px] font-body font-semibold"
          >
            ${(data[i].revenue / 1000).toFixed(1)}k
          </text>
        </g>
      ))}
    </svg>
  );
}

// ─── Horizontal Bar Chart ──────────────────────
function HorizontalBarChart({
  data,
}: {
  data: { label: string; value: number; color: string; percent: number }[];
}) {
  return (
    <div className="space-y-3">
      {data.map((item, i) => (
        <div key={item.label} className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-body text-sm font-medium">{item.label}</span>
            <span className="font-body text-sm text-muted-foreground">
              ${item.value.toLocaleString()} ({item.percent}%)
            </span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${item.percent}%` }}
              transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
              className="h-full rounded-full"
              style={{ backgroundColor: item.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ──────────────────────
export default function AdminReports() {
  // Computed stats
  const stats = useMemo(() => {
    const totalRevenue = MOCK_INVOICES.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
    const pendingRevenue = MOCK_INVOICES.filter((i) => i.status === "pending" || i.status === "overdue").reduce((s, i) => s + i.amount, 0);
    const avgProjectValue = MOCK_PROJECTS.length > 0
      ? Math.round(MOCK_PROJECTS.reduce((s, p) => s + p.amount, 0) / MOCK_PROJECTS.length)
      : 0;
    const avgCLV = MOCK_CLIENTS.length > 0
      ? Math.round(MOCK_CLIENTS.reduce((s, c) => s + c.totalSpent, 0) / MOCK_CLIENTS.length)
      : 0;

    // Revenue by service type
    const serviceRevenue: Record<string, number> = {};
    MOCK_PROJECTS.forEach((p) => {
      const key = p.serviceType.includes("Wedding")
        ? "Wedding"
        : p.serviceType.includes("Portrait") || p.serviceType.includes("Brand")
        ? "Portrait"
        : p.serviceType.includes("Engagement")
        ? "Engagement"
        : p.serviceType.includes("Corporate") || p.serviceType.includes("Commercial")
        ? "Commercial"
        : "Events";
      serviceRevenue[key] = (serviceRevenue[key] || 0) + p.amount;
    });

    const totalProjectValue = MOCK_PROJECTS.reduce((s, p) => s + p.amount, 0);
    const revenueByService = Object.entries(serviceRevenue)
      .map(([label, value]) => ({
        label,
        value,
        percent: Math.round((value / totalProjectValue) * 100),
        color: MOCK_SERVICE_BREAKDOWN.find((s) => s.name === label)?.color || "hsl(200, 50%, 50%)",
      }))
      .sort((a, b) => b.value - a.value);

    // Top clients by CLV
    const topClients = [...MOCK_CLIENTS]
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);

    // Monthly growth
    const lastMonth = MOCK_REVENUE_HISTORY[MOCK_REVENUE_HISTORY.length - 1]?.revenue || 0;
    const prevMonth = MOCK_REVENUE_HISTORY[MOCK_REVENUE_HISTORY.length - 2]?.revenue || 0;
    const growthPercent = prevMonth > 0 ? Math.round(((lastMonth - prevMonth) / prevMonth) * 100) : 0;

    // Project completion rate
    const deliveredCount = MOCK_PROJECTS.filter((p) => p.status === "delivered").length;
    const completionRate = MOCK_PROJECTS.length > 0
      ? Math.round((deliveredCount / MOCK_PROJECTS.length) * 100)
      : 0;

    // Collection rate
    const collectionRate = (totalRevenue + pendingRevenue) > 0
      ? Math.round((totalRevenue / (totalRevenue + pendingRevenue)) * 100)
      : 0;

    return {
      totalRevenue,
      pendingRevenue,
      avgProjectValue,
      avgCLV,
      revenueByService,
      topClients,
      growthPercent,
      completionRate,
      collectionRate,
    };
  }, []);

  const kpiCards = [
    {
      label: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      sub: `${stats.growthPercent > 0 ? "+" : ""}${stats.growthPercent}% vs last month`,
      icon: DollarSign,
      trend: stats.growthPercent >= 0 ? "up" : "down",
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Avg Project Value",
      value: `$${stats.avgProjectValue.toLocaleString()}`,
      sub: `${MOCK_PROJECTS.length} total projects`,
      icon: Camera,
      trend: "up",
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Avg Client CLV",
      value: `$${stats.avgCLV.toLocaleString()}`,
      sub: `${MOCK_CLIENTS.length} clients`,
      icon: Users,
      trend: "up",
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Collection Rate",
      value: `${stats.collectionRate}%`,
      sub: `$${stats.pendingRevenue.toLocaleString()} outstanding`,
      icon: BarChart3,
      trend: stats.collectionRate >= 80 ? "up" : "down",
      color: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-display text-3xl font-bold tracking-tight">Reports</h1>
        <p className="font-body text-muted-foreground mt-1">
          Financial performance and business insights
        </p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, i) => {
          const KpiIcon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.05 + i * 0.05 }}
            >
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-xl ${kpi.color}`}>
                      <KpiIcon className="h-4 w-4" />
                    </div>
                    {kpi.trend === "up" ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                        <TrendingUp className="h-3 w-3 mr-0.5" /> Up
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px]">
                        <TrendingDown className="h-3 w-3 mr-0.5" /> Down
                      </Badge>
                    )}
                  </div>
                  <p className="text-2xl font-display font-bold">{kpi.value}</p>
                  <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider mt-1">
                    {kpi.label}
                  </p>
                  <p className="text-xs font-body text-muted-foreground mt-0.5">
                    {kpi.sub}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-lg font-semibold">
                Revenue Trend
              </CardTitle>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{stats.growthPercent}% vs last period
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <RevenueChart data={MOCK_REVENUE_HISTORY} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Two Column: Revenue by Service + Top Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Service */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg font-semibold flex items-center gap-2">
                <PieChart className="h-4 w-4 text-muted-foreground" />
                Revenue by Service
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HorizontalBarChart data={stats.revenueByService} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Clients */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Top Clients by CLV
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.topClients.map((client, i) => {
                const initials = client.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                return (
                  <div
                    key={client.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/40"
                  >
                    <span className="font-body text-xs text-muted-foreground font-semibold w-5 text-center">
                      {i + 1}
                    </span>
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-semibold font-body shrink-0"
                      style={{ backgroundColor: client.avatarColor }}
                    >
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm font-medium truncate">{client.name}</p>
                      <p className="font-body text-xs text-muted-foreground">
                        {client.projectCount} projects
                      </p>
                    </div>
                    <span className="font-display text-sm font-semibold">
                      ${client.totalSpent.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg font-semibold">
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Completion Rate */}
              <div className="text-center">
                <div className="relative inline-block">
                  <svg viewBox="0 0 100 100" className="w-28 h-28">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth="8" />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="hsl(160, 45%, 48%)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${stats.completionRate * 2.64} ${264 - stats.completionRate * 2.64}`}
                      strokeDashoffset="66"
                      initial={{ strokeDasharray: "0 264" }}
                      animate={{
                        strokeDasharray: `${stats.completionRate * 2.64} ${264 - stats.completionRate * 2.64}`,
                      }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                    />
                    <text x="50" y="46" textAnchor="middle" className="fill-foreground text-xl font-display font-bold">
                      {stats.completionRate}%
                    </text>
                    <text x="50" y="60" textAnchor="middle" className="fill-muted-foreground text-[8px] font-body">
                      COMPLETION
                    </text>
                  </svg>
                </div>
                <p className="font-body text-xs text-muted-foreground mt-2">
                  Project Completion Rate
                </p>
              </div>

              {/* Collection Rate */}
              <div className="text-center">
                <div className="relative inline-block">
                  <svg viewBox="0 0 100 100" className="w-28 h-28">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth="8" />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="hsl(35, 60%, 55%)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${stats.collectionRate * 2.64} ${264 - stats.collectionRate * 2.64}`}
                      strokeDashoffset="66"
                      initial={{ strokeDasharray: "0 264" }}
                      animate={{
                        strokeDasharray: `${stats.collectionRate * 2.64} ${264 - stats.collectionRate * 2.64}`,
                      }}
                      transition={{ duration: 1.5, delay: 0.7 }}
                    />
                    <text x="50" y="46" textAnchor="middle" className="fill-foreground text-xl font-display font-bold">
                      {stats.collectionRate}%
                    </text>
                    <text x="50" y="60" textAnchor="middle" className="fill-muted-foreground text-[8px] font-body">
                      COLLECTED
                    </text>
                  </svg>
                </div>
                <p className="font-body text-xs text-muted-foreground mt-2">
                  Payment Collection Rate
                </p>
              </div>

              {/* Avg Booking */}
              <div className="text-center">
                <div className="relative inline-block">
                  <svg viewBox="0 0 100 100" className="w-28 h-28">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth="8" />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="hsl(200, 55%, 50%)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${Math.min(100, Math.round(stats.avgProjectValue / 50)) * 2.64} ${264 - Math.min(100, Math.round(stats.avgProjectValue / 50)) * 2.64}`}
                      strokeDashoffset="66"
                      initial={{ strokeDasharray: "0 264" }}
                      animate={{
                        strokeDasharray: `${Math.min(100, Math.round(stats.avgProjectValue / 50)) * 2.64} ${264 - Math.min(100, Math.round(stats.avgProjectValue / 50)) * 2.64}`,
                      }}
                      transition={{ duration: 1.5, delay: 0.9 }}
                    />
                    <text x="50" y="46" textAnchor="middle" className="fill-foreground text-lg font-display font-bold">
                      ${(stats.avgProjectValue / 1000).toFixed(1)}k
                    </text>
                    <text x="50" y="60" textAnchor="middle" className="fill-muted-foreground text-[8px] font-body">
                      AVG VALUE
                    </text>
                  </svg>
                </div>
                <p className="font-body text-xs text-muted-foreground mt-2">
                  Average Project Value
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
