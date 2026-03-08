import { motion } from "framer-motion";
import { User, Globe, CreditCard, Bell, Shield } from "lucide-react";

const sections = [
  { icon: User, title: "Profile", desc: "Update your name, email, and profile photo." },
  { icon: Globe, title: "Website", desc: "Customize your portfolio site, domain, and SEO." },
  { icon: CreditCard, title: "Billing", desc: "Manage your subscription and payment methods." },
  { icon: Bell, title: "Notifications", desc: "Configure email and push notification preferences." },
  { icon: Shield, title: "Security", desc: "Change your password and enable two-factor authentication." },
];

const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences.</p>
      </div>

      <div className="space-y-3">
        {sections.map((s, i) => (
          <motion.button
            key={s.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="w-full flex items-center gap-4 p-5 rounded-xl border border-border bg-card hover:border-primary/20 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <s.icon size={18} className="text-primary" />
            </div>
            <div>
              <div className="font-semibold text-sm">{s.title}</div>
              <div className="text-xs text-muted-foreground">{s.desc}</div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default Settings;
