import { motion } from "framer-motion";
import { Plus, Upload, Grid3X3, List } from "lucide-react";

const Portfolio = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Portfolio</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and organize your best work.</p>
        </div>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-primary text-primary-foreground rounded-lg text-sm font-semibold transition-all hover:shadow-[var(--shadow-glow)]">
          <Upload size={16} /> Upload Photos
        </button>
      </div>

      {/* Empty state */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-24 rounded-xl border-2 border-dashed border-border bg-card/50"
      >
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Plus size={24} className="text-primary" />
        </div>
        <h3 className="font-bold text-lg">No photos yet</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs text-center">
          Upload your first photos to start building your portfolio. Drag and drop or click to upload.
        </p>
        <button className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-primary text-primary-foreground rounded-lg text-sm font-semibold">
          <Upload size={16} /> Upload Photos
        </button>
      </motion.div>
    </div>
  );
};

export default Portfolio;
