import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/api/profiles";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ user: User; profile: Profile | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (currentUser: User): Promise<Profile | null> => {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      if (data) return data as Profile;

      // Profile doesn't exist — auto-create it
      if (error && error.code === "PGRST116") {
        const fullName = currentUser.user_metadata?.full_name || "";
        const role = currentUser.user_metadata?.role || "client";
        const { data: created, error: insertError } = await supabase
          .from("profiles")
          .insert({ id: currentUser.id, full_name: fullName, role })
          .select()
          .single();
        if (insertError) {
          console.error("Failed to create profile:", insertError.message);
          return null;
        }
        return created as Profile;
      }

      if (error) {
        console.error("Failed to fetch profile:", error.message);
      }
      return null;
    } catch (err) {
      console.error("Profile fetch error:", err);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted) return;
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        const p = await fetchProfile(currentUser);
        if (isMounted) setProfile(p);
      }
      if (isMounted) setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      const currentUser = session?.user ?? null;

      if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
        return;
      }

      setUser(currentUser);
      if (currentUser) {
        const p = await fetchProfile(currentUser);
        if (isMounted) setProfile(p);
      } else {
        setProfile(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // signIn now returns the user and profile directly so callers can redirect immediately
  const signIn = async (email: string, password: string) => {
    if (!supabase) throw new Error("Auth service not configured.");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw new Error(error.message);

    const signedInUser = data.user;
    setUser(signedInUser);

    // Fetch profile right here so we can return it to the caller
    const p = await fetchProfile(signedInUser);
    setProfile(p);

    return { user: signedInUser, profile: p };
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string
  ) => {
    if (!supabase) throw new Error("Auth service not configured.");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role: "client" },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });
    if (error) throw new Error(error.message);
  };

  const signOut = async () => {
    if (!supabase) return;
    setUser(null);
    setProfile(null);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin: profile?.role === "admin",
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
