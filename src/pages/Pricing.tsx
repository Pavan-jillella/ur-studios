import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Basic",
    desc: "For photographers just getting started.",
    monthly: 19,
    annual: 15,
    features: [
      "5 client galleries",
      "Portfolio website",
      "Basic booking system",
      "Stripe payments",
      "Email support",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Pro",
    desc: "For growing photography businesses.",
    monthly: 39,
    annual: 29,
    features: [
      "Unlimited galleries",
      "Custom domain",
      "Advanced booking",
      "Print store",
      "Email marketing",
      "Analytics dashboard",
      "Priority support",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Studio",
    desc: "For studios and high-volume photographers.",
    monthly: 79,
    annual: 59,
    features: [
      "Everything in Pro",
      "Multi-user team",
      "White-label branding",
      "API access",
      "Advanced analytics",
      "Dedicated support",
      "Custom integrations",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const Pricing = () => {
  const [annual, setAnnual] = useState(true);

  return (
    <div className="pt-28 pb-20">
      <section className="container mx-auto px-6 lg:px-12 text-center mb-16">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3"
        >
          Pricing
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-extrabold tracking-tight"
        >
          Simple, transparent pricing
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-muted-foreground mt-4 max-w-xl mx-auto"
        >
          Start free for 14 days. Upgrade or cancel anytime.
        </motion.p>

        {/* Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-3 mt-8"
        >
          <span className={`text-sm font-medium ${!annual ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${annual ? "bg-primary" : "bg-muted"}`}
          >
            <div className={`absolute top-1 w-5 h-5 rounded-full bg-background shadow-sm transition-transform duration-300 ${annual ? "left-6" : "left-1"}`} />
          </button>
          <span className={`text-sm font-medium ${annual ? "text-foreground" : "text-muted-foreground"}`}>
            Annual <span className="text-primary text-xs font-semibold">Save 25%</span>
          </span>
        </motion.div>
      </section>

      <section className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className={`relative p-8 rounded-2xl border transition-all duration-300 ${
                plan.popular
                  ? "border-primary bg-card shadow-[var(--shadow-glow)]"
                  : "border-border bg-card hover:border-primary/20"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-primary text-primary-foreground rounded-full text-xs font-semibold">
                  Most Popular
                </div>
              )}
              <h3 className="font-bold text-xl">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{plan.desc}</p>
              <div className="mt-6 mb-6">
                <span className="text-4xl font-extrabold">${annual ? plan.annual : plan.monthly}</span>
                <span className="text-muted-foreground text-sm">/month</span>
              </div>
              <Link
                to="/signup"
                className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                  plan.popular
                    ? "bg-gradient-primary text-primary-foreground hover:shadow-[var(--shadow-glow)]"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {plan.cta}
              </Link>
              <div className="mt-8 space-y-3">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <Check size={15} className="text-primary flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Pricing;
