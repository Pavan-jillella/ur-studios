const Footer = () => {
  return (
    <footer className="py-16 px-6 bg-card border-t border-border">
      <div className="container mx-auto max-w-5xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <a href="#" className="font-display text-xl font-semibold text-foreground">
              UR Studios
            </a>
            <p className="font-body text-[13px] text-muted-foreground mt-2">
              Capturing timeless moments, one frame at a time.
            </p>
          </div>

          <div className="flex gap-8">
            {["Instagram", "Pinterest", "Facebook", "YouTube"].map((social) => (
              <a
                key={social}
                href="#"
                className="font-body text-[13px] text-muted-foreground hover:text-foreground transition-colors"
              >
                {social}
              </a>
            ))}
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-body text-[12px] text-muted-foreground">
            © 2026 Aurelia Studio. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy", "Terms"].map((link) => (
              <a key={link} href="#" className="font-body text-[12px] text-muted-foreground hover:text-foreground transition-colors">
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
