import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { getPortfolioImages, type PortfolioImage } from "@/api/portfolio";
import portfolio1 from "@/assets/portfolio-1.jpg";
import portfolio2 from "@/assets/portfolio-2.jpg";
import portfolio3 from "@/assets/portfolio-3.jpg";
import portfolio4 from "@/assets/portfolio-4.jpg";
import portfolio5 from "@/assets/portfolio-5.jpg";
import portfolio6 from "@/assets/portfolio-6.jpg";

const fallbackImages = [
  { src: portfolio1, alt: "Photography 1" },
  { src: portfolio2, alt: "Photography 2" },
  { src: portfolio3, alt: "Photography 3" },
  { src: portfolio4, alt: "Photography 4" },
  { src: portfolio5, alt: "Photography 5" },
  { src: portfolio6, alt: "Photography 6" },
];

const ShowcaseGallery = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [dbImages, setDbImages] = useState<PortfolioImage[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getPortfolioImages()
      .then((data) => setDbImages(data.slice(0, 6)))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const hasDbImages = loaded && dbImages.length > 0;
  const images = hasDbImages
    ? dbImages.map((img) => ({ src: img.image_url, alt: img.alt_text || img.title }))
    : fallbackImages;

  return (
    <section className="py-16 md:py-24 bg-background" ref={ref}>
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="font-body text-[13px] tracking-[0.3em] uppercase text-muted-foreground mb-3">
            Our Work
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-medium text-foreground tracking-tight">
            Showcase Gallery
          </h2>
        </motion.div>

        {/* Masonry-style Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {images.map((image, index) => {
            // Create varied heights for masonry effect
            const heightClass = index % 3 === 0 
              ? "row-span-2 aspect-[3/4]" 
              : "aspect-square";
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`group relative overflow-hidden rounded-lg ${heightClass}`}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ShowcaseGallery;
