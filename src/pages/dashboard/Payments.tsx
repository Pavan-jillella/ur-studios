import { motion } from "framer-motion";
import { CreditCard, Plus } from "lucide-react";

const Payments = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Payments</h1>
          <p className="text-sm text-muted-foreground mt-1">Track invoices, deposits, and revenue.</p>
        </div>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-primary text-primary-foreground rounded-lg text-sm font-semibold transition-all hover:shadow-[var(--shadow-glow)]">
          <Plus size={16} /> New Invoice
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-24 rounded-xl border-2 border-dashed border-border bg-card/50"
      >
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <CreditCard size={24} className="text-primary" />
        </div>
        <h3 className="font-bold text-lg">No payments yet</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs text-center">
          Connect your Stripe account to start accepting payments and sending invoices.
        </p>
        <button className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-primary text-primary-foreground rounded-lg text-sm font-semibold">
          Connect Stripe
        </button>
      </motion.div>
    </div>
  );
};

export default Payments;
