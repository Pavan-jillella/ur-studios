import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Award, BookOpen, Camera } from "lucide-react";
import photographerPortrait from "@/assets/photographer-portrait.jpg";

const stats = [
  { icon: Camera, value: "500+", label: "Sessions Shot" },
  { icon: Award, value: "12", label: "Awards Won" },
  { icon: BookOpen, value: "8", label: "Years Experience" },
];

const AboutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="section-padding bg-card" ref={ref}>
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative overflow-hidden">
              <img
                src={photographerPortrait}
                alt="Photographer portrait"
                className="w-full object-cover aspect-[3/4]"
              />
              <div className="absolute inset-0 border border-primary/20" />
            </div>
            {/* Floating accent */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 border border-primary/30 -z-10" />
            <div className="absolute -top-6 -left-6 w-32 h-32 border border-primary/10 -z-10" />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p className="font-body text-sm tracking-[0.4em] uppercase text-primary mb-4">About Me</p>
            <h2 className="font-display text-4xl md:text-5xl font-medium text-foreground mb-6">
              The Story Behind <span className="italic text-gradient-gold">the Lens</span>
            </h2>
            <div className="gold-divider mb-8" />

            <p className="font-serif text-xl italic text-primary/80 mb-6">
              "I believe the best photographs are not posed — they are felt."
            </p>

            <p className="font-body text-muted-foreground leading-relaxed mb-4">
              With over eight years of experience in cinematic photography, I specialize in capturing 
              the raw, unscripted moments that make your story uniquely yours. Every wedding, every 
              portrait, every frame is an opportunity to create something timeless.
            </p>

            <p className="font-body text-muted-foreground leading-relaxed mb-8">
              My approach blends documentary storytelling with fine art aesthetics, resulting in 
              photographs that are both emotionally powerful and visually stunning. Based in Virginia, 
              available worldwide.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="text-center"
                >
                  <stat.icon size={20} className="text-primary mx-auto mb-2" />
                  <p className="font-display text-2xl font-semibold text-foreground">{stat.value}</p>
                  <p className="font-body text-xs text-muted-foreground tracking-[0.15em] uppercase mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
