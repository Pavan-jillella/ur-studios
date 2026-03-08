import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    name: "Sarah & Michael",
    role: "Wedding, June 2025",
    text: "Aurelia captured our wedding day with such beauty and emotion. Every time we look at our photos, we relive those magical moments. Truly an artist behind the lens.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Engagement Session",
    text: "The engagement photos exceeded every expectation. The way she captured the golden hour light and our genuine emotions was breathtaking. We've never felt more beautiful.",
    rating: 5,
  },
  {
    name: "James & Anna",
    role: "Wedding, September 2025",
    text: "From the first consultation to the final gallery delivery, the experience was flawless. Our photos tell our story in the most cinematic, emotional way possible.",
    rating: 5,
  },
  {
    name: "Victoria Chen",
    role: "Portrait Session",
    text: "I came in nervous and left feeling like a model. The portraits are stunning — moody, dramatic, and yet deeply personal. A true visionary photographer.",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="testimonials" className="section-padding bg-background" ref={ref}>
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="font-body text-sm tracking-[0.4em] uppercase text-primary mb-4">Kind Words</p>
          <h2 className="font-display text-4xl md:text-6xl font-medium text-foreground">
            Client <span className="italic text-gradient-gold">Stories</span>
          </h2>
          <div className="gold-divider mx-auto mt-6" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          <div className="overflow-hidden">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="text-center px-4"
            >
              {/* Stars */}
              <div className="flex justify-center gap-1 mb-8">
                {Array.from({ length: testimonials[current].rating }).map((_, i) => (
                  <Star key={i} size={16} className="fill-primary text-primary" />
                ))}
              </div>

              {/* Quote */}
              <p className="font-serif text-2xl md:text-3xl italic text-foreground leading-relaxed mb-8">
                "{testimonials[current].text}"
              </p>

              {/* Author */}
              <p className="font-display text-lg text-foreground">{testimonials[current].name}</p>
              <p className="font-body text-sm text-muted-foreground tracking-[0.2em] uppercase mt-1">
                {testimonials[current].role}
              </p>
            </motion.div>
          </div>

          {/* Navigation */}
          <div className="flex justify-center items-center gap-6 mt-12">
            <button
              onClick={() => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === current ? "bg-primary w-8" : "bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => setCurrent((prev) => (prev + 1) % testimonials.length)}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
