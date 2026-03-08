import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

import portfolio1 from "@/assets/portfolio-1.jpg";
import portfolio2 from "@/assets/portfolio-2.jpg";
import portfolio3 from "@/assets/portfolio-3.jpg";
import portfolio4 from "@/assets/portfolio-4.jpg";
import portfolio5 from "@/assets/portfolio-5.jpg";
import portfolio6 from "@/assets/portfolio-6.jpg";
import portfolio7 from "@/assets/portfolio-7.jpg";
import portfolio8 from "@/assets/portfolio-8.jpg";

const images = [
  { src: portfolio1, alt: "Wedding first dance", category: "Wedding" },
  { src: portfolio2, alt: "Engagement in golden field", category: "Engagement" },
  { src: portfolio3, alt: "Wedding ceremony", category: "Wedding" },
  { src: portfolio4, alt: "Fashion portrait", category: "Portrait" },
  { src: portfolio5, alt: "Beach engagement", category: "Engagement" },
  { src: portfolio6, alt: "Reception details", category: "Wedding" },
  { src: portfolio7, alt: "Autumn couple portrait", category: "Engagement" },
  { src: portfolio8, alt: "Corporate event", category: "Events" },
];

const PortfolioSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const nextImage = () => setLightboxIndex((prev) => (prev !== null ? (prev + 1) % images.length : null));
  const prevImage = () => setLightboxIndex((prev) => (prev !== null ? (prev - 1 + images.length) % images.length : null));

  return (
    <section id="portfolio" className="section-padding bg-background" ref={ref}>
      <div className="container mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="font-body text-sm tracking-[0.4em] uppercase text-primary mb-4">Selected Works</p>
          <h2 className="font-display text-4xl md:text-6xl font-medium text-foreground">
            Featured <span className="italic text-gradient-gold">Portfolio</span>
          </h2>
          <div className="gold-divider mx-auto mt-6" />
        </motion.div>

        {/* Masonry Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
          {images.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="break-inside-avoid group cursor-pointer relative overflow-hidden"
              onClick={() => openLightbox(index)}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-background/0 group-hover:bg-background/40 transition-all duration-500 flex items-end">
                <div className="p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                  <p className="font-body text-xs tracking-[0.3em] uppercase text-primary">{image.category}</p>
                  <p className="font-serif text-lg text-foreground mt-1">{image.alt}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View More CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1 }}
          className="text-center mt-12"
        >
          <a
            href="#contact"
            className="inline-block px-10 py-4 border border-primary/30 text-primary font-body text-sm tracking-[0.2em] uppercase transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
          >
            View Full Portfolio
          </a>
        </motion.div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button onClick={closeLightbox} className="absolute top-6 right-6 text-foreground hover:text-primary transition-colors z-10">
            <X size={32} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            className="absolute left-4 md:left-8 text-foreground hover:text-primary transition-colors z-10"
          >
            <ChevronLeft size={40} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            className="absolute right-4 md:right-8 text-foreground hover:text-primary transition-colors z-10"
          >
            <ChevronRight size={40} />
          </button>
          <motion.img
            key={lightboxIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            src={images[lightboxIndex].src}
            alt={images[lightboxIndex].alt}
            className="max-h-[85vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </motion.div>
      )}
    </section>
  );
};

export default PortfolioSection;
