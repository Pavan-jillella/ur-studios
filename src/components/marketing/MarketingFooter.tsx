import { Link } from "react-router-dom";
import { Camera } from "lucide-react";

const MarketingFooter = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Camera size={16} className="text-primary-foreground" />
              </div>
              <span className="font-bold text-lg tracking-tight">FrameFlow</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Everything photographers need to run their business, in one beautiful platform.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4">Product</h4>
            <div className="space-y-3">
              <Link to="/features" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
              <Link to="/pricing" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4">Company</h4>
            <div className="space-y-3">
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">About</a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4">Legal</h4>
            <div className="space-y-3">
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© 2026 FrameFlow. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default MarketingFooter;
