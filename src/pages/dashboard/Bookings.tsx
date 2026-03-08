import { motion } from "framer-motion";
import { Plus, Calendar } from "lucide-react";

const Bookings = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Bookings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your sessions and appointments.</p>
        </div>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-primary text-primary-foreground rounded-lg text-sm font-semibold transition-all hover:shadow-[var(--shadow-glow)]">
          <Plus size={16} /> New Booking
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-24 rounded-xl border-2 border-dashed border-border bg-card/50"
      >
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Calendar size={24} className="text-primary" />
        </div>
        <h3 className="font-bold text-lg">No bookings yet</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs text-center">
          Set up your services and availability to start accepting bookings from clients.
        </p>
        <button className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-primary text-primary-foreground rounded-lg text-sm font-semibold">
          <Plus size={16} /> Set Up Services
        </button>
      </motion.div>
    </div>
  );
};

export default Bookings;
