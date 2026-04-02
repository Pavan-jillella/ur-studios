import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, CheckCircle } from "lucide-react";

export default function Signup() {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, fullName);
      setSuccess(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Signup failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClasses =
    "w-full bg-transparent border border-border rounded-lg px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-foreground focus:outline-none transition-colors";

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
          <h1 className="font-display text-3xl font-medium text-foreground">
            Check Your Email
          </h1>
          <p className="font-body text-muted-foreground mt-3 mb-8">
            We've sent a confirmation link to <strong>{email}</strong>. Click the
            link to activate your account.
          </p>
          <Link
            to="/login"
            className="inline-block px-8 py-3 bg-foreground text-background rounded-full font-body text-sm font-medium transition-all duration-300 hover:bg-foreground/80"
          >
            Go to Login
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <Link to="/" className="font-display text-2xl font-semibold text-foreground">
            UR pixelstudio
          </Link>
          <h1 className="font-display text-3xl font-medium text-foreground mt-6">
            Create Account
          </h1>
          <p className="font-body text-muted-foreground mt-2">
            Sign up to access your client portal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="font-body text-sm text-foreground block mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              className={inputClasses}
              disabled={loading}
            />
          </div>
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
              placeholder="At least 6 characters"
              className={inputClasses}
              disabled={loading}
            />
          </div>
          <div>
            <label className="font-body text-sm text-foreground block mb-1.5">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
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
                Creating account <Loader2 size={16} className="animate-spin" />
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="text-center font-body text-sm text-muted-foreground mt-8">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-foreground font-medium hover:underline"
          >
            Sign in
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
