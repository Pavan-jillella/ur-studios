import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

const ContactSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", eventDate: "", shootType: "wedding", message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Thank you! We'll be in touch within 24 hours.");
    setFormData({ name: "", email: "", phone: "", eventDate: "", shootType: "wedding", message: "" });
  };

  const inputClasses = "w-full bg-transparent border-b border-border px-0 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-foreground focus:outline-none transition-colors";

  return (
    <section id="contact" className="section-padding bg-background" ref={ref}>
      <div className="container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="font-body text-[13px] tracking-[0.3em] uppercase text-muted-foreground mb-3">Get In Touch</p>
          <h2 className="font-display text-4xl md:text-6xl font-medium text-foreground tracking-tight">
            Let's Create Together
          </h2>
          <p className="font-body text-muted-foreground mt-4 max-w-md mx-auto">
            Ready to tell your story? Let's start with a conversation.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <input
              type="text" required placeholder="Your name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={inputClasses}
            />
            <input
              type="email" required placeholder="Email address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={inputClasses}
            />
            <input
              type="tel" placeholder="Phone number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={inputClasses}
            />
            <input
              type="date"
              value={formData.eventDate}
              onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
              className={inputClasses}
            />
          </div>

          <select
            value={formData.shootType}
            onChange={(e) => setFormData({ ...formData, shootType: e.target.value })}
            className={`${inputClasses} bg-background`}
          >
            <option value="wedding">Wedding Photography</option>
            <option value="engagement">Engagement Session</option>
            <option value="portrait">Portrait Session</option>
            <option value="event">Event Photography</option>
            <option value="commercial">Commercial Photography</option>
          </select>

          <textarea
            rows={4}
            placeholder="Tell us about your vision..."
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className={`${inputClasses} resize-none`}
          />

          <div className="text-center pt-4">
            <button
              type="submit"
              className="inline-flex items-center gap-3 px-10 py-4 bg-foreground text-background rounded-full font-body text-sm font-medium transition-all duration-300 hover:gap-5 hover:shadow-[var(--shadow-elevated)]"
            >
              Book Your Session
              <ArrowRight size={16} />
            </button>
            <p className="font-body text-[13px] text-muted-foreground mt-4">
              We respond within 24 hours. No commitment required.
            </p>
          </div>
        </motion.form>
      </div>
    </section>
  );
};

export default ContactSection;
