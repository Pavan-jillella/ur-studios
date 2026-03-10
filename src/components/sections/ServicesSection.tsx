import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Camera, Heart, User, Building, Star, Sparkles, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { getServices, type Service } from "@/api/services";

const iconMap: Record<string, LucideIcon> = {
  Camera,
  Heart,
  User,
  Building,
  Star,
  Sparkles,
};

const fallbackServices = [
  { icon: "Heart", title: "Wedding Photography", slug: "wedding", description: "Your love story, captured in every frame.", price: "From $2,500" },
  { icon: "Camera", title: "Portrait Photography", slug: "portrait", description: "Reveal your story through striking portraits.", price: "From $500" },
  { icon: "User", title: "Event Photography", slug: "event", description: "Corporate events and celebrations documented with elegance.", price: "From $1,200" },
  { icon: "Building", title: "Commercial Photography", slug: "commercial", description: "Elevate your brand with cinematic imagery.", price: "From $1,500" },
];

const ServicesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [services, setServices] = useState<Service[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getServices()
      .then((data) => setServices(data))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const displayServices = loaded && services.length > 0 ? services : (loaded ? fallbackServices.map((s, i) => ({ ...s, id: String(i) } as unknown as Service)) : []);

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

        {!loaded ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="p-8 md:p-10 rounded-2xl bg-background border border-border animate-pulse">
                <div className="w-6 h-6 bg-muted rounded mb-6" />
                <div className="h-5 bg-muted rounded w-3/4 mb-3" />
                <div className="h-4 bg-muted rounded w-full mb-2" />
                <div className="h-4 bg-muted rounded w-2/3 mb-6" />
                <div className="h-4 bg-muted rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayServices.map((service, index) => {
              const IconComponent = iconMap[service.icon] || Camera;
              return (
                <motion.div
                  key={service.id || index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group p-8 md:p-10 rounded-2xl bg-background border border-border hover:shadow-[var(--shadow-elevated)] transition-all duration-500"
                >
                  <IconComponent size={24} className="text-primary mb-6" strokeWidth={1.5} />
                  <h3 className="font-display text-xl font-medium text-foreground mb-3">{service.title}</h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6">{service.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-body text-sm font-medium text-primary">{service.price}</span>
                    <Link
                      to={`/services/${service.slug}`}
                      className="font-body text-[13px] font-medium text-foreground/60 hover:text-foreground transition-colors"
                    >
                      Learn More →
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default ServicesSection;
