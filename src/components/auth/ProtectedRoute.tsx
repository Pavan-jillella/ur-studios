import { Navigate, Outlet, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  allowedRoles: ("admin" | "client")[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User exists but no profile — show error instead of redirect loop
  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center">
        <h1 className="font-display text-2xl font-medium text-foreground mb-3">
          Account Setup Incomplete
        </h1>
        <p className="font-body text-muted-foreground max-w-md mb-6">
          Your profile could not be loaded. This usually means the database
          hasn't been set up yet. Please contact the site administrator.
        </p>
        <Link
          to="/"
          className="px-6 py-2.5 bg-foreground text-background rounded-full font-body text-sm font-medium"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  if (!allowedRoles.includes(profile.role)) {
    const redirect = profile.role === "admin" ? "/admin" : "/portal";
    return <Navigate to={redirect} replace />;
  }

  return <Outlet />;
}
