import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Camera, Heart, User, Building } from "lucide-react";

const services = [
  {
    icon: Heart,
    title: "Wedding Photography",
    description: "Your love story, captured in every frame. From getting ready to the last dance.",
    price: "From $2,500",
  },
  {
    icon: Camera,
    title: "Portrait Photography",
    description: "Reveal your story through striking, editorial-quality portraits.",
    price: "From $500",
  },
  {
    icon: User,
    title: "Event Photography",
    description: "Corporate events, galas, and celebrations documented with elegance.",
    price: "From $1,200",
  },
  {
    icon: Building,
    title: "Commercial Photography",
    description: "Elevate your brand with cinematic commercial and fashion imagery.",
    price: "From $1,500",
  },
];

const ServicesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="services" className="section-padding bg-card" ref={ref}>
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <p className="font-body text-[13px] tracking-[0.3em] uppercase text-muted-foreground mb-3">What We Offer</p>
          <h2 className="font-display text-4xl md:text-6xl font-medium text-foreground tracking-tight">
            Services
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-8 md:p-10 rounded-2xl bg-background border border-border hover:shadow-[var(--shadow-elevated)] transition-all duration-500"
            >
              <service.icon size={24} className="text-primary mb-6" strokeWidth={1.5} />
              <h3 className="font-display text-xl font-medium text-foreground mb-3">{service.title}</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6">{service.description}</p>
              <div className="flex items-center justify-between">
                <span className="font-body text-sm font-medium text-primary">{service.price}</span>
                <a
                  href="#contact"
                  className="font-body text-[13px] font-medium text-foreground/60 hover:text-foreground transition-colors"
                >
                  Learn More →
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
