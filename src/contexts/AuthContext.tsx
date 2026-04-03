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

// Mock users ONLY used when Supabase is NOT configured (.env.local missing)
const MOCK_USERS = {
  "admin@urstudios.com": {
    password: "Admin123!",
    profile: {
      id: "mock-admin-id",
      full_name: "Admin User",
      role: "admin" as const,
      created_at: new Date().toISOString(),
    },
  },
  "client@urstudios.com": {
    password: "Client123!",
    profile: {
      id: "mock-client-id",
      full_name: "Test Client",
      role: "client" as const,
      created_at: new Date().toISOString(),
    },
  },
};

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

  // Emails that should always be treated as admin
  const ADMIN_EMAILS = ["udayreddy416@gmail.com", "pavanjillella.1711@gmail.com"];

  const fetchProfile = useCallback(async (currentUser: User): Promise<Profile | null> => {
    if (!supabase) {
      // Check if it's a mock user
      const mockUser = Object.values(MOCK_USERS).find(m => m.profile.id === currentUser.id);
      return mockUser ? mockUser.profile as Profile : null;
    }
    try {
      const isAdminEmail = ADMIN_EMAILS.includes(currentUser.email ?? "");

      // Simple select — profile should already exist (created on signup or via SQL)
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      if (data) {
        // Override role for admin emails in case DB has wrong value
        if (isAdminEmail && data.role !== "admin") {
          return { ...data, role: "admin" } as Profile;
        }
        return data as Profile;
      }

      if (error) {
        console.warn("Profile fetch failed:", error.message);
      }

      // Fallback: synthesize profile in memory so the app doesn't hang
      return {
        id: currentUser.id,
        full_name: currentUser.user_metadata?.full_name || (isAdminEmail ? "Pavan Jillella" : ""),
        role: isAdminEmail ? "admin" : "client",
        avatar_url: null,
        phone: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Profile;
    } catch (err) {
      console.error("Profile fetch error:", err);
      return null;
    }
  }, []);

  useEffect(() => {
    // Only use mock sessions if Supabase is NOT configured
    if (!supabase) {
      const mockSession = sessionStorage.getItem("mock_auth_user");
      if (mockSession) {
        const userData = JSON.parse(mockSession);
        setUser(userData.user);
        setProfile(userData.profile);
      }
      setLoading(false);
      return;
    }

    // Supabase IS configured — clear any stale mock sessions
    sessionStorage.removeItem("mock_auth_user");

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

  const signIn = async (email: string, password: string) => {
    // If Supabase is NOT configured, use mock users
    if (!supabase) {
      const mockUser = MOCK_USERS[email as keyof typeof MOCK_USERS];
      if (mockUser && mockUser.password === password) {
        const fakeUser = {
          id: mockUser.profile.id,
          email: email,
          user_metadata: { full_name: mockUser.profile.full_name },
        } as any as User;
        setUser(fakeUser);
        setProfile(mockUser.profile as Profile);
        sessionStorage.setItem("mock_auth_user", JSON.stringify({
          user: fakeUser,
          profile: mockUser.profile
        }));
        return { user: fakeUser, profile: mockUser.profile as Profile };
      }
      throw new Error("Auth service not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
    }

    // Supabase IS configured — always use real auth

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw new Error(error.message);

    const signedInUser = data.user;
    setUser(signedInUser);

    const p = await fetchProfile(signedInUser);
    setProfile(p);

    return { user: signedInUser, profile: p };
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string
  ) => {
    if (!supabase) throw new Error("Registration is disabled in mock mode.");
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
    sessionStorage.removeItem("mock_auth_user");
    setUser(null);
    setProfile(null);
    if (supabase) {
      await supabase.auth.signOut();
    }
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

