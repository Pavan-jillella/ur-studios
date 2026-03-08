import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Send, MapPin, Phone, Mail } from "lucide-react";
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

  return (
    <section id="contact" className="section-padding bg-background" ref={ref}>
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="font-body text-sm tracking-[0.4em] uppercase text-primary mb-4">Get In Touch</p>
          <h2 className="font-display text-4xl md:text-6xl font-medium text-foreground">
            Let's Create <span className="italic text-gradient-gold">Together</span>
          </h2>
          <div className="gold-divider mx-auto mt-6" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-8"
          >
            <div>
              <p className="font-serif text-xl italic text-secondary-foreground mb-6">
                Ready to tell your story? Let's start with a conversation.
              </p>
            </div>

            <div className="space-y-6">
              {[
                { icon: MapPin, label: "Studio", value: "Richmond, Virginia" },
                { icon: Phone, label: "Phone", value: "+1 (804) 555-0123" },
                { icon: Mail, label: "Email", value: "hello@aureliastudio.com" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="w-10 h-10 flex items-center justify-center border border-primary/30">
                    <item.icon size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground">{item.label}</p>
                    <p className="font-body text-foreground mt-1">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-border">
              <p className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4">Follow Along</p>
              <div className="flex gap-4">
                {["Instagram", "Pinterest", "Facebook"].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="font-body text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {social}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4 }}
            onSubmit={handleSubmit}
            className="lg:col-span-3 space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground block mb-2">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-secondary border border-border px-4 py-3 font-body text-sm text-foreground focus:border-primary focus:outline-none transition-colors"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground block mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-secondary border border-border px-4 py-3 font-body text-sm text-foreground focus:border-primary focus:outline-none transition-colors"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground block mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-secondary border border-border px-4 py-3 font-body text-sm text-foreground focus:border-primary focus:outline-none transition-colors"
                  placeholder="(555) 000-0000"
                />
              </div>
              <div>
                <label className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground block mb-2">Event Date</label>
                <input
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  className="w-full bg-secondary border border-border px-4 py-3 font-body text-sm text-foreground focus:border-primary focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground block mb-2">Type of Shoot</label>
              <select
                value={formData.shootType}
                onChange={(e) => setFormData({ ...formData, shootType: e.target.value })}
                className="w-full bg-secondary border border-border px-4 py-3 font-body text-sm text-foreground focus:border-primary focus:outline-none transition-colors"
              >
                <option value="wedding">Wedding Photography</option>
                <option value="engagement">Engagement Session</option>
                <option value="portrait">Portrait Session</option>
                <option value="event">Event Photography</option>
                <option value="commercial">Commercial Photography</option>
              </select>
            </div>

            <div>
              <label className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground block mb-2">Tell Us Your Story</label>
              <textarea
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-secondary border border-border px-4 py-3 font-body text-sm text-foreground focus:border-primary focus:outline-none transition-colors resize-none"
                placeholder="Tell us about your vision, your event, and what you're looking for..."
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 px-10 py-4 bg-primary text-primary-foreground font-body text-sm tracking-[0.2em] uppercase transition-all duration-300 hover:shadow-[var(--shadow-gold)] hover:scale-[1.02]"
            >
              <Send size={16} />
              Book Your Session
            </button>

            <p className="text-center font-body text-xs text-muted-foreground">
              We respond within 24 hours. No commitment required.
            </p>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
