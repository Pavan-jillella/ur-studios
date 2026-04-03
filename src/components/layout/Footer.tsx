import { useState, useEffect } from "react";
import { Instagram, Facebook, Twitter, Youtube, Linkedin } from "lucide-react";
import { getSocialLinks, type SocialLinks } from "@/api/settings";

const socialIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  youtube: Youtube,
  linkedin: Linkedin,
};

const socialLabels: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  twitter: "Twitter",
  youtube: "YouTube",
  pinterest: "Pinterest",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
};

const Footer = () => {
  const [socialLinks, setSocialLinks] = useState<SocialLinks | null>(null);

  useEffect(() => {
    getSocialLinks().then(setSocialLinks).catch(() => {});
  }, []);

  const activeSocials = socialLinks
    ? (Object.entries(socialLinks) as [keyof SocialLinks, string][])
        .filter(([, url]) => url && url.trim() !== "")
        .map(([key, url]) => ({ key, url, label: socialLabels[key] || key }))
    : [];

  return (
    <footer className="py-16 px-6 bg-card border-t border-border">
      <div className="container mx-auto max-w-5xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <a href="#" className="font-display text-xl font-bold text-foreground">
              UR Pixel Studio
            </a>
            <p className="font-body text-[13px] text-muted-foreground mt-2">
              Capturing timeless moments, one frame at a time.
            </p>
          </div>

          <div className="flex gap-6">
            {activeSocials.length > 0
              ? activeSocials.map(({ key, url, label }) => {
                  const Icon = socialIcons[key];
                  return (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-body text-[13px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                      <span className="hidden sm:inline">{label}</span>
                    </a>
                  );
                })
              : ["Instagram", "Pinterest", "Facebook", "YouTube"].map((social) => (
                  <span
                    key={social}
                    className="font-body text-[13px] text-muted-foreground"
                  >
                    {social}
                  </span>
                ))}
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-body text-[12px] text-muted-foreground">
            © {new Date().getFullYear()} UR Pixel Studio. All rights reserved.
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
