import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle, XCircle, Loader2, Shield } from "lucide-react";

interface FixResult {
  step: string;
  status: "ok" | "error" | "skipped";
  message: string;
}

export default function AdminSetup() {
  const { user } = useAuth();
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<FixResult[]>([]);
  const [done, setDone] = useState(false);

  const runFix = async () => {
    if (!supabase || !user) return;
    setRunning(true);
    setResults([]);
    const newResults: FixResult[] = [];

    const log = (step: string, status: FixResult["status"], message: string) => {
      newResults.push({ step, status, message });
      setResults([...newResults]);
    };

    // Step 1: Upsert admin profile
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert(
          { id: user.id, full_name: "Pavan Jillella", role: "admin" },
          { onConflict: "id", ignoreDuplicates: false }
        );
      if (error) throw error;
      log("Set admin profile", "ok", "Your account is now set as admin ✓");
    } catch (err) {
      log("Set admin profile", "error", (err as Error).message);
    }

    // Step 2: Verify profile
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      log("Verify profile role", data?.role === "admin" ? "ok" : "error",
        data?.role === "admin" ? "Role confirmed: admin ✓" : `Role is '${data?.role}' — SQL fix required`);
    } catch (err) {
      log("Verify profile role", "error", (err as Error).message);
    }

    // Step 3: Test portfolio write
    try {
      const testId = crypto.randomUUID();
      const { error: insertErr } = await supabase
        .from("portfolio_images")
        .insert({
          id: testId,
          title: "__setup_test__",
          category: "Other",
          image_url: "https://test.local/test.jpg",
          display_order: 9999,
          is_featured: false,
          is_active: false,
        });
      if (insertErr) throw insertErr;
      // Clean up test row
      await supabase.from("portfolio_images").delete().eq("id", testId);
      log("Portfolio write access", "ok", "Can upload portfolio images ✓");
    } catch (err) {
      const msg = (err as Error).message;
      log("Portfolio write access", "error", `Upload will fail: ${msg}`);
    }

    // Step 4: Test cover images write
    try {
      const testId = crypto.randomUUID();
      const { error: insertErr } = await supabase
        .from("cover_images")
        .insert({
          id: testId,
          title: "__setup_test__",
          image_url: "https://test.local/test.jpg",
          display_order: 9999,
          is_active: false,
        });
      if (insertErr) throw insertErr;
      await supabase.from("cover_images").delete().eq("id", testId);
      log("Cover images write access", "ok", "Can upload cover images ✓");
    } catch (err) {
      log("Cover images write access", "error", `Cover upload will fail: ${(err as Error).message}`);
    }

    // Step 5: Test testimonials write
    try {
      const testId = crypto.randomUUID();
      const { error: insertErr } = await supabase
        .from("testimonials")
        .insert({
          id: testId,
          name: "__test__",
          role: "test",
          text: "test",
          is_featured: false,
          is_active: false,
          display_order: 9999,
        });
      if (insertErr) throw insertErr;
      await supabase.from("testimonials").delete().eq("id", testId);
      log("Testimonials write access", "ok", "Can add testimonials ✓");
    } catch (err) {
      log("Testimonials write access", "error", `Testimonials will fail: ${(err as Error).message}`);
    }

    // Step 6: Test services write
    try {
      const testId = crypto.randomUUID();
      const { error: insertErr } = await supabase
        .from("services")
        .insert({
          id: testId,
          title: "__test__",
          slug: `__test_${Date.now()}__`,
          description: "test",
          price: "$0",
          icon: "Camera",
          display_order: 9999,
          is_active: false,
        });
      if (insertErr) throw insertErr;
      await supabase.from("services").delete().eq("id", testId);
      log("Services write access", "ok", "Can manage services ✓");
    } catch (err) {
      log("Services write access", "error", `Services will fail: ${(err as Error).message}`);
    }

    // Step 7: Test bookings (public insert)
    try {
      const testId = crypto.randomUUID();
      // Temporarily sign out to test public insert
      const { error: insertErr } = await supabase
        .from("bookings")
        .insert({
          id: testId,
          name: "__setup_test__",
          email: "test@test.com",
          service_type: "Test",
          status: "pending",
          payment_status: "unpaid",
        });
      if (insertErr) throw insertErr;
      await supabase.from("bookings").delete().eq("id", testId);
      log("Booking form (public)", "ok", "Contact form bookings work ✓");
    } catch (err) {
      log("Booking form (public)", "error", `Booking form will fail: ${(err as Error).message}`);
    }

    setDone(true);
    setRunning(false);
  };

  const allOk = results.length > 0 && results.every((r) => r.status === "ok");
  const hasErrors = results.some((r) => r.status === "error");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Database Setup</h1>
            <p className="font-body text-muted-foreground text-sm mt-0.5">
              Fix all Supabase permissions for your admin account
            </p>
          </div>
        </div>

        {!supabase && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 mb-6">
            <p className="font-body text-sm text-destructive font-medium">
              ⚠️ Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.
            </p>
          </div>
        )}

        {!user && supabase && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 mb-6">
            <p className="font-body text-sm text-amber-700 font-medium">
              ⚠️ You must be logged in to run the setup. Go to /login first.
            </p>
          </div>
        )}

        {user && (
          <div className="rounded-xl border bg-card p-4 mb-6">
            <p className="font-body text-sm text-muted-foreground">
              Logged in as: <span className="font-semibold text-foreground">{user.email}</span>
            </p>
            <p className="font-body text-xs text-muted-foreground mt-1">ID: {user.id}</p>
          </div>
        )}

        <div className="space-y-3 mb-6">
          {results.map((result, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-start gap-3 rounded-xl border p-4 ${
                result.status === "ok"
                  ? "border-green-200 bg-green-50"
                  : result.status === "error"
                  ? "border-red-200 bg-red-50"
                  : "border-border bg-muted/30"
              }`}
            >
              {result.status === "ok" ? (
                <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              ) : result.status === "error" ? (
                <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`font-body text-sm font-semibold ${
                  result.status === "ok" ? "text-green-800" : result.status === "error" ? "text-red-800" : "text-foreground"
                }`}>
                  {result.step}
                </p>
                <p className={`font-body text-xs mt-0.5 ${
                  result.status === "ok" ? "text-green-700" : result.status === "error" ? "text-red-700" : "text-muted-foreground"
                }`}>
                  {result.message}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {done && hasErrors && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 mb-6">
            <p className="font-body text-sm font-semibold text-amber-800 mb-2">
              ⚠️ Some checks failed. You need to run the SQL fix in Supabase:
            </p>
            <ol className="list-decimal list-inside space-y-1 font-body text-xs text-amber-700">
              <li>Go to <strong>supabase.com</strong> → Your project → SQL Editor</li>
              <li>Open the file: <code className="bg-amber-100 px-1 rounded">supabase/migrations/019_emergency_fix_all.sql</code></li>
              <li>Copy all the SQL and paste it into the SQL editor</li>
              <li>Click <strong>Run</strong></li>
              <li>Come back and click Run Setup again to verify</li>
            </ol>
          </div>
        )}

        {done && allOk && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 mb-6">
            <p className="font-body text-sm font-semibold text-green-800">
              ✅ All checks passed! Your admin account has full access. Go back to the admin panel.
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={runFix}
            disabled={running || !user || !supabase}
            className="flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-full font-body text-sm font-medium transition-all hover:bg-foreground/80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {running ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Running checks...
              </>
            ) : (
              "Run Setup & Fix Permissions"
            )}
          </button>
          {done && (
            <a
              href="/admin"
              className="flex items-center gap-2 px-6 py-3 border border-border rounded-full font-body text-sm font-medium transition-all hover:bg-muted"
            >
              Go to Admin →
            </a>
          )}
        </div>
      </motion.div>
    </div>
  );
}
