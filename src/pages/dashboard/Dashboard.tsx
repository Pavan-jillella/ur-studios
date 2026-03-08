import { motion } from "framer-motion";
import { TrendingUp, Eye, Calendar, DollarSign, ArrowUpRight } from "lucide-react";

const stats = [
  { label: "Total Revenue", value: "$12,450", change: "+12%", icon: DollarSign },
  { label: "Gallery Views", value: "3,842", change: "+8%", icon: Eye },
  { label: "Bookings", value: "24", change: "+3", icon: Calendar },
  { label: "Website Visits", value: "1,205", change: "+15%", icon: TrendingUp },
];

const recentBookings = [
  { client: "Sarah Mitchell", service: "Wedding", date: "Mar 15, 2026", status: "Confirmed" },
  { client: "James Rivera", service: "Portrait", date: "Mar 18, 2026", status: "Pending" },
  { client: "Emma Chen", service: "Engagement", date: "Mar 22, 2026", status: "Confirmed" },
  { client: "Alex Thompson", service: "Corporate", date: "Mar 25, 2026", status: "Pending" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

const Dashboard = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome back. Here's your business overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="p-5 rounded-xl border border-border bg-card"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon size={16} className="text-primary" />
              </div>
              <span className="text-xs font-semibold text-primary flex items-center gap-0.5">
                {stat.change} <ArrowUpRight size={12} />
              </span>
            </div>
            <div className="text-2xl font-extrabold tracking-tight">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Recent Bookings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl border border-border bg-card"
      >
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-bold text-base">Recent Bookings</h2>
        </div>
        <div className="divide-y divide-border">
          {recentBookings.map((booking) => (
            <div key={booking.client} className="flex items-center justify-between px-5 py-3.5">
              <div>
                <div className="font-medium text-sm">{booking.client}</div>
                <div className="text-xs text-muted-foreground">{booking.service} · {booking.date}</div>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                booking.status === "Confirmed"
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}>
                {booking.status}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
