import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { getAllPortfolioImages } from "@/api/portfolio";
import heroBg1 from "@/assets/hero-bg.jpg";
import heroBg2 from "@/assets/cover-2.jpg";
import heroBg3 from "@/assets/cover-3.jpg";

const COVER_PHOTOS = [heroBg1, heroBg2, heroBg3];
const ROTATION_INTERVAL = 8000; // 8 seconds per image

const HeroSection = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % COVER_PHOTOS.length);
    }, ROTATION_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background Image Carousel */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImageIndex}
            src={COVER_PHOTOS[currentImageIndex]}
            alt="Cinematic wedding photography"
            className="w-full h-full object-cover animate-slow-zoom"
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-end h-full text-center px-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <p className="font-body text-[13px] tracking-[0.3em] uppercase text-background/80 mb-4">
            Cinematic Photography
          </p>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="font-display text-5xl md:text-7xl lg:text-[5.5rem] font-medium text-background leading-[1.05] max-w-3xl tracking-tight"
        >
          Capturing Timeless
          <br />
          <span className="italic">Moments</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="font-body text-base md:text-lg text-background/70 mt-5 max-w-md font-light"
        >
          Every frame tells a story. Every story deserves to be remembered.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.3 }}
          className="flex flex-col sm:flex-row gap-3 mt-10"
        >
          <a
            href="#portfolio"
            className="px-8 py-3.5 bg-background text-foreground rounded-full font-body text-sm font-medium transition-all duration-300 hover:shadow-[var(--shadow-elevated)]"
          >
            View Portfolio
          </a>
          <a
            href="#contact"
            className="px-8 py-3.5 bg-background/15 text-background border border-background/30 rounded-full font-body text-sm font-medium backdrop-blur-sm transition-all duration-300 hover:bg-background/25"
          >
            Book a Session
          </a>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown size={20} className="text-background/50" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
