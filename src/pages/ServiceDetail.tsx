import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import { getServiceBySlug, type Service } from "@/api/services";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { usePageMeta } from "@/lib/seo";
import { toast } from "sonner";
import { ArrowLeft, CalendarDays } from "lucide-react";

export default function ServiceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  usePageMeta(
    service?.title ?? "Service",
    service?.description ?? undefined
  );

  useEffect(() => {
    if (!slug) return;

    async function load() {
      try {
        const data = await getServiceBySlug(slug!);
        if (!data) {
          setNotFound(true);
        } else {
          setService(data);
        }
      } catch (err) {
        toast.error("Failed to load service details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20">
          <Skeleton className="w-full aspect-[21/9] max-h-[450px]" />
          <div className="container mx-auto max-w-3xl px-6 py-12 space-y-6">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-6 w-1/4" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (notFound || !service) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-32 pb-24 px-6">
          <div className="container mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="font-display text-4xl font-medium text-foreground mb-4">
                Service Not Found
              </h1>
              <p className="font-body text-muted-foreground mb-8">
                The service you're looking for doesn't exist or is no longer available.
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 font-body text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </motion.div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative mt-20">
        {service.cover_image ? (
          <div className="relative w-full aspect-[21/9] max-h-[450px] overflow-hidden">
            <img
              src={service.cover_image}
              alt={service.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="absolute bottom-0 left-0 right-0 p-8 md:p-12"
            >
              <div className="container mx-auto max-w-3xl">
                <h1 className="font-display text-3xl md:text-5xl font-medium text-white tracking-tight mb-3">
                  {service.title}
                </h1>
                <p className="font-display text-xl md:text-2xl text-white/80">
                  {service.price}
                </p>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="relative w-full aspect-[21/9] max-h-[450px] bg-gradient-to-br from-primary/30 to-primary/5">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="absolute bottom-0 left-0 right-0 p-8 md:p-12"
            >
              <div className="container mx-auto max-w-3xl">
                <h1 className="font-display text-3xl md:text-5xl font-medium text-foreground tracking-tight mb-3">
                  {service.title}
                </h1>
                <p className="font-display text-xl md:text-2xl text-primary">
                  {service.price}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </section>

      {/* Description */}
      <section className="px-6 py-16">
        <div className="container mx-auto max-w-3xl">
          {/* Short description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-body text-lg text-muted-foreground leading-relaxed mb-8"
          >
            {service.description}
          </motion.p>

          {/* Long description */}
          {service.long_description && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="prose prose-lg max-w-none mb-12"
              dangerouslySetInnerHTML={{ __html: service.long_description }}
            />
          )}

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="pt-8 border-t border-border"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Button asChild size="lg" className="font-body">
                <a href="/#contact">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Book This Service
                </a>
              </Button>
              <Link
                to="/"
                className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                View all services
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
