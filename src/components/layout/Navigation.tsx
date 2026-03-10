import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogIn, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const sectionLinks = [
  { label: "Portfolio", section: "portfolio" },
  { label: "Services", section: "services" },
  { label: "About", section: "about" },
  { label: "Testimonials", section: "testimonials" },
  { label: "Contact", section: "contact" },
];

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle hash scrolling after navigation to homepage
  useEffect(() => {
    if (isHomePage && location.hash) {
      const id = location.hash.replace("#", "");
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [isHomePage, location.hash]);

  const scrollToSection = (section: string) => {
    if (isHomePage) {
      const el = document.getElementById(section);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(`/#${section}`);
    }
    setIsMobileOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? "glass-nav py-3" : "py-5 bg-transparent"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-6 lg:px-12">
        <Link to="/" className="font-display text-xl font-semibold tracking-tight text-foreground">
          UR Studios
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {isHomePage &&
            sectionLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => scrollToSection(link.section)}
                className="font-body text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                {link.label}
              </button>
            ))}

          {!isHomePage && (
            <Link
              to="/portfolio"
              className="font-body text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              Portfolio
            </Link>
          )}
          <Link
            to="/blog"
            className="font-body text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            Blog
          </Link>

          {user ? (
            <div className="flex items-center gap-4">
              <Link
                to={isAdmin ? "/admin" : "/portal"}
                className="font-body text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors duration-300 flex items-center gap-1.5"
              >
                <User size={14} />
                {isAdmin ? "Admin" : "Portal"}
              </Link>
              <button
                onClick={() => signOut()}
                className="font-body text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="font-body text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors duration-300 flex items-center gap-1.5"
            >
              <LogIn size={14} />
              Login
            </Link>
          )}

          {isHomePage && (
            <button
              onClick={() => scrollToSection("contact")}
              className="ml-2 px-5 py-2 bg-foreground text-background rounded-full font-body text-[13px] font-medium transition-all duration-300 hover:bg-foreground/80"
            >
              Book Now
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="md:hidden text-foreground"
        >
          {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-t border-border"
          >
            <div className="flex flex-col items-center gap-6 py-8">
              {isHomePage &&
                sectionLinks.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => scrollToSection(link.section)}
                    className="font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </button>
                ))}
              {!isHomePage && (
                <Link
                  to="/portfolio"
                  onClick={() => setIsMobileOpen(false)}
                  className="font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Portfolio
                </Link>
              )}
              <Link
                to="/blog"
                onClick={() => setIsMobileOpen(false)}
                className="font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Blog
              </Link>
              {user ? (
                <>
                  <Link
                    to={isAdmin ? "/admin" : "/portal"}
                    onClick={() => setIsMobileOpen(false)}
                    className="font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {isAdmin ? "Admin Dashboard" : "My Portal"}
                  </Link>
                  <button
                    onClick={() => { signOut(); setIsMobileOpen(false); }}
                    className="font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMobileOpen(false)}
                  className="font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Login
                </Link>
              )}
              {isHomePage && (
                <button
                  onClick={() => scrollToSection("contact")}
                  className="px-6 py-2.5 bg-foreground text-background rounded-full font-body text-sm font-medium"
                >
                  Book Now
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navigation;
