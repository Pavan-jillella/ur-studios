import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createBooking } from "@/api/bookings";
import { getServices, type Service } from "@/api/services";
import { createCheckoutSession } from "@/api/payments";
import { useAuth } from "@/contexts/AuthContext";

const initialFormData = {
  name: "",
  email: "",
  phone: "",
  eventDate: "",
  location: "",
  shootType: "wedding",
  message: "",
};

const ContactSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    getServices()
      .then((data) => setServices(data))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const booking = await createBooking({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        event_date: formData.eventDate || null,
        location: formData.location || undefined,
        service_type: formData.shootType,
        message: formData.message || undefined,
      });

      // Check if the selected service has a price for Stripe checkout
      const selectedService = services.find(
        (s) => s.slug === formData.shootType || s.title.toLowerCase().includes(formData.shootType)
      );

      if (selectedService?.price_cents && booking?.id) {
        try {
          const { url } = await createCheckoutSession({
            booking_id: booking.id,
            service_title: selectedService.title,
            amount_cents: selectedService.price_cents,
            customer_email: formData.email,
            success_url: `${window.location.origin}/payment/success`,
            cancel_url: `${window.location.origin}/payment/cancel`,
          });
          if (url) {
            window.location.href = url;
            return;
          }
        } catch {
          // Stripe not configured — fall through to normal success
        }
      }

      toast.success("Thank you! We'll be in touch within 24 hours.");
      setFormData(initialFormData);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(`Booking failed: ${message}`);
    } finally {
      setSubmitting(false);
    }
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
              disabled={submitting}
            />
            <input
              type="email" required placeholder="Email address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={inputClasses}
              disabled={submitting}
            />
            <input
              type="tel" placeholder="Phone number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={inputClasses}
              disabled={submitting}
            />
            <input
              type="date"
              value={formData.eventDate}
              onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
              className={inputClasses}
              disabled={submitting}
            />
          </div>

          <input
            type="text" placeholder="Event location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className={inputClasses}
            disabled={submitting}
          />

          <select
            value={formData.shootType}
            onChange={(e) => setFormData({ ...formData, shootType: e.target.value })}
            className={`${inputClasses} bg-background`}
            disabled={submitting}
          >
            {services.length > 0
              ? services.map((s) => (
                  <option key={s.id} value={s.slug}>
                    {s.title} — {s.price}
                  </option>
                ))
              : (
                <>
                  <option value="wedding">Wedding Photography</option>
                  <option value="engagement">Engagement Session</option>
                  <option value="portrait">Portrait Session</option>
                  <option value="event">Event Photography</option>
                  <option value="commercial">Commercial Photography</option>
                </>
              )}
          </select>

          <textarea
            rows={4}
            placeholder="Tell us about your vision..."
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className={`${inputClasses} resize-none`}
            disabled={submitting}
          />

          <div className="text-center pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-3 px-10 py-4 bg-foreground text-background rounded-full font-body text-sm font-medium transition-all duration-300 hover:gap-5 hover:shadow-[var(--shadow-elevated)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  Submitting
                  <Loader2 size={16} className="animate-spin" />
                </>
              ) : (
                <>
                  Book Your Session
                  <ArrowRight size={16} />
                </>
              )}
            </button>
            <p className="font-body text-[13px] text-muted-foreground mt-4">
              {user
                ? "Your booking will be linked to your account."
                : "We respond within 24 hours. No commitment required."}
            </p>
          </div>
        </motion.form>
      </div>
    </section>
  );
};

export default ContactSection;
