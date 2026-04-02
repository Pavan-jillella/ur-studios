import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const portalTabs = [
  { label: "Home", to: "/portal" },
  { label: "My Bookings", to: "/portal/bookings" },
  { label: "My Gallery", to: "/portal/gallery" },
  { label: "Downloads", to: "/portal/downloads" },
];

export default function PortalLayout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-6 py-3">
          {/* Brand */}
          <Link
            to="/"
            className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-foreground"
          >
            <Camera className="h-5 w-5 text-primary" />
            UR Studios
          </Link>

          {/* Nav Tabs - Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {portalTabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg font-body text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>

          {/* Right section */}
          <div className="flex items-center gap-4">
            <span className="hidden sm:block font-body text-sm text-muted-foreground">
              Welcome,{" "}
              <span className="font-medium text-foreground">
                {profile?.full_name ?? "Client"}
              </span>
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="font-body text-sm text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4 mr-1.5" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Nav Tabs - Mobile */}
        <div className="md:hidden border-t border-border overflow-x-auto">
          <nav className="flex items-center gap-1 px-4 py-2">
            {portalTabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  `whitespace-nowrap px-3 py-1.5 rounded-lg font-body text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* Content Area */}
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="container mx-auto px-6 py-8 max-w-6xl"
      >
        <Outlet />
      </motion.main>
    </div>
  );
}
