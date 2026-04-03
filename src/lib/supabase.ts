import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Polyfill navigator.locks before Supabase uses it.
// GoTrue-js uses the Web Locks API which can deadlock in some browsers/contexts.
// This no-op implementation prevents the "Lock not released within 5000ms" error.
if (typeof navigator !== "undefined" && navigator.locks) {
  const originalRequest = navigator.locks.request.bind(navigator.locks);
  (navigator.locks as any).request = async (
    name: string,
    optionsOrCallback: any,
    maybeCallback?: any
  ) => {
    // Just run the callback directly, skipping the lock mechanism
    const callback = typeof maybeCallback === "function" ? maybeCallback : optionsOrCallback;
    if (typeof callback === "function") {
      return callback({ name, mode: "exclusive" });
    }
    return originalRequest(name, optionsOrCallback, maybeCallback);
  };
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: "implicit",
      storageKey: "ur-studio-auth",
    },
  });
} else {
  console.warn(
    "Supabase environment variables not set. Running in demo mode."
  );
}

export { supabase };
