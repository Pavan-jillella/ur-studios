import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { getAboutSettings, type AboutSettings } from "@/api/settings";
import photographerPortrait from "@/assets/photographer-portrait.jpg";

const defaultAboutSettings: AboutSettings = {
  title: "The Story Behind the Lens",
  quote: "I believe the most powerful photographs are the ones that feel real.",
  bio1: "With over 4 years of experience in cinematic photography, I specialize in capturing the raw, unscripted moments that make your story uniquely yours.",
  bio2: "My approach blends documentary storytelling with fine art aesthetics, resulting in photographs that are both emotionally powerful and visually stunning. Based in Virginia, available worldwide.",
  imageUrl: "",
};

const AboutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [aboutSettings, setAboutSettings] = useState<AboutSettings>(defaultAboutSettings);

  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await getAboutSettings();
        setAboutSettings(settings);
      } catch (err) {
        console.error("Failed to load about settings:", err);
      }
    }
    loadSettings();
  }, []);

  const portraitImage = aboutSettings.imageUrl || photographerPortrait;

  return (
    <section id="about" className="section-padding bg-card" ref={ref}>
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="overflow-hidden rounded-2xl">
              <img
                src={portraitImage}
                alt="Photographer portrait"
                className="w-full object-cover aspect-[3/4]"
              />
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p className="font-body text-[13px] tracking-[0.3em] uppercase text-muted-foreground mb-4">About</p>
            <h2 className="font-display text-4xl md:text-5xl font-medium text-foreground mb-8 tracking-tight">
              {aboutSettings.title}
            </h2>

            <p className="font-serif text-xl italic text-primary mb-8">
              "{aboutSettings.quote}"
            </p>

            <p className="font-body text-muted-foreground leading-relaxed mb-4">
              {aboutSettings.bio1}
            </p>

            <p className="font-body text-muted-foreground leading-relaxed mb-10">
              {aboutSettings.bio2}
            </p>


          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
