import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Login() {
  const { signIn, user, profile } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in (e.g. navigated to /login while authenticated), redirect
  useEffect(() => {
    if (user && profile) {
      navigate(profile.role === "admin" ? "/admin" : "/portal", { replace: true });
    }
  }, [user, profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn(email, password);
      toast.success("Welcome back!");
      // Redirect immediately using the returned profile
      const role = result.profile?.role;
      navigate(role === "admin" ? "/admin" : "/portal", { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed";
      toast.error(msg);
      setLoading(false);
    }
  };

  const inputClasses =
    "w-full bg-transparent border border-border rounded-lg px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-foreground focus:outline-none transition-colors";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <Link to="/" className="font-display text-2xl font-bold tracking-tight text-foreground transition-all hover:text-primary">
            UR Pixel Studio
          </Link>
          <h1 className="font-display text-3xl font-medium text-foreground mt-6">
            Welcome Back
          </h1>
          <p className="font-body text-muted-foreground mt-2">
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="font-body text-sm text-foreground block mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className={inputClasses}
              disabled={loading}
            />
          </div>
          <div>
            <label className="font-body text-sm text-foreground block mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className={inputClasses}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-foreground text-background rounded-full font-body text-sm font-medium transition-all duration-300 hover:bg-foreground/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                Signing in <Loader2 size={16} className="animate-spin" />
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="text-center font-body text-sm text-muted-foreground mt-8">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-foreground font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>

        <div className="text-center mt-4">
          <Link
            to="/"
            className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
