import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Images, Calendar, CreditCard, Globe, BarChart3, Mail,
  ShoppingBag, Palette, ArrowRight, Check, Lock, Zap,
  Upload, Heart, Download, Clock, FileText, Truck
} from "lucide-react";

const modules = [
  {
    icon: Images,
    title: "Client Galleries",
    desc: "Deliver photos in beautiful, private galleries your clients will love.",
    features: ["Password protection", "Client favorites", "Bulk downloads", "Shareable links"],
  },
  {
    icon: Calendar,
    title: "Booking System",
    desc: "Let clients book and pay deposits directly from your website.",
    features: ["Service selection", "Calendar scheduling", "Automatic confirmations", "Deposit collection"],
  },
  {
    icon: CreditCard,
    title: "Payment Processing",
    desc: "Get paid faster with integrated invoicing and payment processing.",
    features: ["Stripe integration", "Invoices", "Deposits & full payments", "Refund management"],
  },
  {
    icon: Globe,
    title: "Portfolio Website",
    desc: "Build a stunning portfolio site with drag-and-drop simplicity.",
    features: ["Custom themes", "SEO settings", "Custom subdomain", "Mobile responsive"],
  },
  {
    icon: ShoppingBag,
    title: "Print Store",
    desc: "Sell prints, albums, and products directly to your clients.",
    features: ["Product catalog", "Shopping cart", "Shipping calculator", "Order management"],
  },
  {
    icon: Mail,
    title: "Email Marketing",
    desc: "Stay connected with newsletters, reminders, and notifications.",
    features: ["Newsletter campaigns", "Booking reminders", "Gallery notifications", "Templates"],
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    desc: "Understand your business with powerful, visual analytics.",
    features: ["Website traffic", "Gallery views", "Revenue tracking", "Booking metrics"],
  },
  {
    icon: Palette,
    title: "Portfolio Manager",
    desc: "Organize and showcase your best work effortlessly.",
    features: ["Drag & drop upload", "Bulk upload", "Image tagging", "Gallery categories"],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.6 },
  }),
} as const;

const Features = () => {
  return (
    <div className="pt-28 pb-20">
      {/* Header */}
      <section className="container mx-auto px-6 lg:px-12 text-center mb-20">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3"
        >
          Features
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-extrabold tracking-tight"
        >
          Built for photographers,{" "}
          <span className="text-gradient">by photographers</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-muted-foreground mt-5 max-w-2xl mx-auto"
        >
          Every tool you need to deliver an exceptional client experience and grow your photography business.
        </motion.p>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {modules.map((mod, i) => (
            <motion.div
              key={mod.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="p-8 rounded-2xl border border-border bg-card hover:border-primary/20 transition-all duration-500"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                <mod.icon size={22} className="text-primary" />
              </div>
              <h3 className="font-bold text-xl mb-2">{mod.title}</h3>
              <p className="text-sm text-muted-foreground mb-5">{mod.desc}</p>
              <div className="grid grid-cols-2 gap-2">
                {mod.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check size={14} className="text-primary flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 lg:px-12 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            Ready to simplify your workflow?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Start your free 14-day trial today. No credit card required.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-primary text-primary-foreground rounded-full text-sm font-semibold transition-all duration-300 hover:shadow-[var(--shadow-glow)] hover:scale-[1.02]"
          >
            Start Free Trial <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default Features;
