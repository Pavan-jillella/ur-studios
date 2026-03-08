import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Eye, Calendar, DollarSign } from "lucide-react";

const metrics = [
  { label: "Website Visits", value: "1,205", icon: Eye },
  { label: "Gallery Views", value: "3,842", icon: BarChart3 },
  { label: "Bookings", value: "24", icon: Calendar },
  { label: "Revenue", value: "$12,450", icon: DollarSign },
];

const Analytics = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Track your business performance and growth.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="p-5 rounded-xl border border-border bg-card"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <m.icon size={16} className="text-primary" />
            </div>
            <div className="text-2xl font-extrabold tracking-tight">{m.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{m.label}</div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col items-center justify-center py-20 rounded-xl border border-border bg-card"
      >
        <BarChart3 size={32} className="text-muted-foreground mb-3" />
        <h3 className="font-bold">Detailed charts coming soon</h3>
        <p className="text-sm text-muted-foreground mt-1">Connect your site to start seeing traffic and engagement data.</p>
      </motion.div>
    </div>
  );
};

export default Analytics;
