import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import portfolio1 from "@/assets/portfolio-1.jpg";
import portfolio3 from "@/assets/portfolio-3.jpg";
import portfolio5 from "@/assets/portfolio-5.jpg";

const stories = [
  {
    image: portfolio1,
    caption: "The quiet moments before the ceremony.",
    label: "Weddings",
  },
  {
    image: portfolio3,
    caption: "Where two paths become one.",
    label: "Ceremonies",
  },
  {
    image: portfolio5,
    caption: "Golden hours, lasting memories.",
    label: "Golden Hour",
  },
];

const ScrollStorySection = () => {
  return (
    <section className="bg-background">
      {stories.map((story, index) => (
        <StoryBlock key={index} story={story} />
      ))}
    </section>
  );
};

const StoryBlock = ({ story }: { story: typeof stories[0] }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.95, 1, 1, 0.95]);

  return (
    <div ref={ref} className="h-screen flex items-center justify-center px-6 md:px-20 overflow-hidden">
      <motion.div
        style={{ y, opacity, scale }}
        className="relative w-full max-w-5xl"
      >
        <div className="relative overflow-hidden rounded-2xl">
          <img
            src={story.image}
            alt={story.caption}
            className="w-full aspect-[16/10] object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
        </div>
        <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12">
          <p className="font-body text-xs tracking-[0.25em] uppercase text-background/60 mb-2">
            {story.label}
          </p>
          <p className="font-serif text-2xl md:text-4xl italic text-background/90 max-w-md">
            {story.caption}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ScrollStorySection;
