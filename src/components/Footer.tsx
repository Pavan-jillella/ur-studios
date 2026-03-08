import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 px-6 bg-card border-t border-border">
      <div className="container mx-auto text-center">
        <a href="#" className="font-display text-2xl font-semibold text-gradient-gold">
          Aurelia
        </a>
        <p className="font-serif text-sm italic text-muted-foreground mt-3">
          Capturing timeless love stories, one frame at a time.
        </p>
        <div className="gold-divider mx-auto my-6" />
        <div className="flex justify-center gap-8 mb-6">
          {["Instagram", "Pinterest", "Facebook", "YouTube"].map((social) => (
            <a
              key={social}
              href="#"
              className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-primary transition-colors"
            >
              {social}
            </a>
          ))}
        </div>
        <p className="font-body text-xs text-muted-foreground flex items-center justify-center gap-1">
          © 2026 Aurelia Studio. Made with <Heart size={12} className="text-primary" /> in Virginia.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
