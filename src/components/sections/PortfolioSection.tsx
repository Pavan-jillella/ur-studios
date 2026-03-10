import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getFeaturedPortfolioImages, type PortfolioImage } from "@/api/portfolio";

import portfolio1 from "@/assets/portfolio-1.jpg";
import portfolio2 from "@/assets/portfolio-2.jpg";
import portfolio3 from "@/assets/portfolio-3.jpg";
import portfolio4 from "@/assets/portfolio-4.jpg";
import portfolio5 from "@/assets/portfolio-5.jpg";
import portfolio6 from "@/assets/portfolio-6.jpg";
import portfolio7 from "@/assets/portfolio-7.jpg";
import portfolio8 from "@/assets/portfolio-8.jpg";

const fallbackImages = [
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
  const [dbImages, setDbImages] = useState<PortfolioImage[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getFeaturedPortfolioImages()
      .then((data) => setDbImages(data))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const hasDbImages = loaded && dbImages.length > 0;
  const images = hasDbImages
    ? dbImages.map((img) => ({ src: img.image_url, alt: img.alt_text || img.title, category: img.category }))
    : fallbackImages;

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const nextImage = () => setLightboxIndex((prev) => (prev !== null ? (prev + 1) % images.length : null));
  const prevImage = () => setLightboxIndex((prev) => (prev !== null ? (prev - 1 + images.length) % images.length : null));

  return (
    <section id="portfolio" className="section-padding bg-background" ref={ref}>
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <p className="font-body text-[13px] tracking-[0.3em] uppercase text-muted-foreground mb-3">Selected Works</p>
          <h2 className="font-display text-4xl md:text-6xl font-medium text-foreground tracking-tight">
            Featured Portfolio
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {images.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.08 }}
              className={`group cursor-pointer relative overflow-hidden rounded-xl ${
                index % 3 === 0 ? "md:col-span-2" : ""
              }`}
              onClick={() => openLightbox(index)}
            >
              <img
                src={image.src}
                alt={image.alt}
                className={`w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] ${
                  index % 3 === 0 ? "aspect-[21/9]" : "aspect-[4/3]"
                }`}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-all duration-500" />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="text-center mt-16"
        >
          <Link
            to="/portfolio"
            className="inline-block px-8 py-3.5 border border-foreground/15 text-foreground rounded-full font-body text-sm font-medium transition-all duration-300 hover:bg-foreground hover:text-background"
          >
            View Full Portfolio
          </Link>
        </motion.div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-foreground/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button onClick={closeLightbox} className="absolute top-6 right-6 text-background/70 hover:text-background transition-colors z-10">
            <X size={28} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            className="absolute left-4 md:left-8 text-background/50 hover:text-background transition-colors z-10"
          >
            <ChevronLeft size={36} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            className="absolute right-4 md:right-8 text-background/50 hover:text-background transition-colors z-10"
          >
            <ChevronRight size={36} />
          </button>
          <motion.img
            key={lightboxIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            src={images[lightboxIndex].src}
            alt={images[lightboxIndex].alt}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </motion.div>
      )}
    </section>
  );
};

export default PortfolioSection;
