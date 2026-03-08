import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background Image with Zoom */}
      <div className="absolute inset-0">
        <motion.img
          src={heroBg}
          alt="Cinematic wedding photography"
          className="w-full h-full object-cover animate-slow-zoom"
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background" />
        {/* Gold tint */}
        <div className="absolute inset-0 bg-primary/5" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.5 }}
        >
          <p className="font-body text-sm tracking-[0.4em] uppercase text-primary mb-6">
            Cinematic Photography
          </p>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.8 }}
          className="font-display text-5xl md:text-7xl lg:text-8xl font-medium text-foreground leading-[1.1] max-w-4xl"
        >
          Capturing Timeless
          <br />
          <span className="text-gradient-gold italic">Love Stories</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="font-serif text-xl md:text-2xl text-secondary-foreground mt-6 max-w-xl italic"
        >
          Every frame tells a story. Every story deserves to be remembered.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.6 }}
          className="flex flex-col sm:flex-row gap-4 mt-12"
        >
          <a
            href="#contact"
            className="px-10 py-4 bg-primary text-primary-foreground font-body text-sm tracking-[0.2em] uppercase transition-all duration-300 hover:shadow-[var(--shadow-gold)] hover:scale-105"
          >
            Book a Session
          </a>
          <a
            href="#portfolio"
            className="px-10 py-4 border border-foreground/20 text-foreground font-body text-sm tracking-[0.2em] uppercase transition-all duration-300 hover:border-primary hover:text-primary"
          >
            View Portfolio
          </a>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2"
        >
          <span className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground">Scroll</span>
          <ChevronDown size={16} className="text-primary" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
