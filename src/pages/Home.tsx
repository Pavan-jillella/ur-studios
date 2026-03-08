import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Images, Calendar, CreditCard, Globe, BarChart3, Mail,
  ArrowRight, Check, Star, Camera, Sparkles, Shield
} from "lucide-react";

const features = [
  { icon: Images, title: "Client Galleries", desc: "Deliver stunning, password-protected galleries with download & favorites." },
  { icon: Calendar, title: "Booking System", desc: "Accept bookings with calendar scheduling, deposits, and confirmations." },
  { icon: CreditCard, title: "Payments", desc: "Integrated Stripe payments for invoices, deposits, and print sales." },
  { icon: Globe, title: "Portfolio Website", desc: "Build a beautiful portfolio site on your own custom subdomain." },
  { icon: BarChart3, title: "Analytics", desc: "Track visitors, gallery views, bookings, and revenue in real-time." },
  { icon: Mail, title: "Email Marketing", desc: "Send campaigns, booking reminders, and gallery notifications." },
];

const stats = [
  { value: "10K+", label: "Photographers" },
  { value: "2M+", label: "Photos Delivered" },
  { value: "50K+", label: "Bookings Made" },
  { value: "99.9%", label: "Uptime" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const },
  }),
};

const Home = () => {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px]" />
        </div>

        <div className="relative z-10 container mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/8 border border-primary/15 mb-8"
          >
            <Sparkles size={14} className="text-primary" />
            <span className="text-xs font-semibold text-primary">Now with AI-powered editing</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-[5.5rem] font-extrabold leading-[1.05] tracking-tight max-w-4xl mx-auto"
          >
            Everything photographers need to{" "}
            <span className="text-gradient">run their business</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg md:text-xl text-muted-foreground mt-6 max-w-2xl mx-auto leading-relaxed"
          >
            Galleries, bookings, payments, portfolio websites, and more — all in one beautiful platform built for professional photographers.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mt-10"
          >
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-primary text-primary-foreground rounded-full text-sm font-semibold transition-all duration-300 hover:shadow-[var(--shadow-glow)] hover:scale-[1.02]"
            >
              Start Free Trial
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/features"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-secondary text-secondary-foreground rounded-full text-sm font-semibold transition-all duration-300 hover:bg-secondary/80"
            >
              See All Features
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-xs text-muted-foreground mt-5 flex items-center justify-center gap-4"
          >
            <span className="flex items-center gap-1"><Check size={12} className="text-primary" /> Free 14-day trial</span>
            <span className="flex items-center gap-1"><Check size={12} className="text-primary" /> No credit card required</span>
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card/50">
        <div className="container mx-auto px-6 lg:px-12 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-extrabold tracking-tight text-gradient">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="section-padding">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">Features</p>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              One platform, everything you need
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Stop juggling tools. Manage your entire photography business from a single, powerful dashboard.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="group p-7 rounded-2xl border border-border bg-card hover:border-primary/20 hover:shadow-[var(--shadow-elevated)] transition-all duration-500"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-gradient-primary group-hover:text-primary-foreground transition-all duration-500">
                  <feature.icon size={20} className="text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-primary p-12 md:p-20 text-center"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--accent)/0.3),transparent_70%)]" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-primary-foreground">
                Ready to grow your business?
              </h2>
              <p className="text-primary-foreground/80 mt-4 max-w-lg mx-auto text-lg">
                Join thousands of photographers already using FrameFlow to deliver exceptional client experiences.
              </p>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 mt-8 px-8 py-4 bg-background text-foreground rounded-full text-sm font-semibold transition-all duration-300 hover:shadow-[var(--shadow-elevated)] hover:scale-[1.02]"
              >
                Start Free Trial
                <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Home;
