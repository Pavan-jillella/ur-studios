import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Camera, Heart, User, Sparkles, Building } from "lucide-react";

import serviceWedding from "@/assets/service-wedding.jpg";
import serviceEngagement from "@/assets/service-engagement.jpg";
import servicePortrait from "@/assets/service-portrait.jpg";
import portfolio8 from "@/assets/portfolio-8.jpg";
import portfolio4 from "@/assets/portfolio-4.jpg";

const services = [
  {
    icon: Heart,
    title: "Wedding Photography",
    description: "Your love story, captured in every frame. From getting ready to the last dance.",
    price: "From $2,500",
    image: serviceWedding,
  },
  {
    icon: Camera,
    title: "Engagement Shoots",
    description: "Celebrate the beginning of your journey together with a cinematic engagement session.",
    price: "From $800",
    image: serviceEngagement,
  },
  {
    icon: User,
    title: "Portrait Photography",
    description: "Reveal your story through striking, editorial-quality portraits.",
    price: "From $500",
    image: servicePortrait,
  },
  {
    icon: Building,
    title: "Event Photography",
    description: "Corporate events, galas, and celebrations documented with elegance.",
    price: "From $1,200",
    image: portfolio8,
  },
  {
    icon: Sparkles,
    title: "Commercial Photography",
    description: "Elevate your brand with cinematic commercial and fashion imagery.",
    price: "From $1,500",
    image: portfolio4,
  },
];

const ServicesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="services" className="section-padding bg-card" ref={ref}>
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="font-body text-sm tracking-[0.4em] uppercase text-primary mb-4">What We Offer</p>
          <h2 className="font-display text-4xl md:text-6xl font-medium text-foreground">
            Our <span className="italic text-gradient-gold">Services</span>
          </h2>
          <div className="gold-divider mx-auto mt-6" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group relative overflow-hidden bg-secondary border border-border hover:border-primary/30 transition-all duration-500"
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary via-transparent to-transparent" />
                <div className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center bg-primary/10 border border-primary/30">
                  <service.icon size={18} className="text-primary" />
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-display text-xl font-medium text-foreground mb-2">{service.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4">{service.description}</p>
                <div className="flex items-center justify-between">
                  <span className="font-serif text-lg text-primary italic">{service.price}</span>
                  <a
                    href="#contact"
                    className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-primary transition-colors"
                  >
                    Learn More →
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
