import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { getTestimonials, type Testimonial } from "@/api/testimonials";

const fallbackTestimonials = [
  { name: "Sarah & Michael", role: "Wedding, June 2025", text: "UR Pixel Studio captured our wedding day with such beauty and emotion." },
  { name: "Emily Rodriguez", role: "Engagement Session", text: "The engagement photos exceeded every expectation. The way she captured the golden hour light and our genuine emotions was breathtaking." },
  { name: "James & Anna", role: "Wedding, September 2025", text: "From the first consultation to the final gallery delivery, the experience was flawless. Our photos tell our story in the most cinematic way." },
  { name: "Victoria Chen", role: "Portrait Session", text: "I came in nervous and left feeling like a model. The portraits are stunning — moody, dramatic, and deeply personal." },
];

const TestimonialsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [current, setCurrent] = useState(0);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getTestimonials()
      .then((data) => setTestimonials(data))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const displayTestimonials = loaded && testimonials.length > 0
    ? testimonials
    : fallbackTestimonials.map((t, i) => ({ ...t, id: String(i) } as unknown as Testimonial));

  useEffect(() => {
    if (displayTestimonials.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % displayTestimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [displayTestimonials.length]);

  if (displayTestimonials.length === 0) return null;

  return (
    <section id="testimonials" className="section-padding-lg bg-background" ref={ref}>
      <div className="container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <p className="font-body text-[13px] tracking-[0.3em] uppercase text-muted-foreground mb-16">Kind Words</p>

          <div className="relative min-h-[200px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <p className="font-serif text-2xl md:text-4xl italic text-foreground leading-relaxed mb-10">
                  "{displayTestimonials[current]?.text}"
                </p>
                <p className="font-body text-sm font-medium text-foreground">{displayTestimonials[current]?.name}</p>
                <p className="font-body text-[13px] text-muted-foreground mt-1">
                  {displayTestimonials[current]?.role}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-center gap-2 mt-12">
            {displayTestimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === current ? "bg-foreground w-6" : "bg-foreground/15"
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
