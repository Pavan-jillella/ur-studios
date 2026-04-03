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

// Mock users for exploration/development when Supabase is not configured
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
  // Real photographer admin account
  "pavankalyan171199@gmail.com": {
    password: "1234567",
    profile: {
      id: "pavan-admin-id",
      full_name: "Pavan Jillella",
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
  // Demo client for testing
  "demo@client.com": {
    password: "Demo123!",
    profile: {
      id: "demo-client-id",
      full_name: "Demo Client",
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

  const fetchProfile = useCallback(async (currentUser: User): Promise<Profile | null> => {
    if (!supabase) {
      // Check if it's a mock user
      const mockUser = Object.values(MOCK_USERS).find(m => m.profile.id === currentUser.id);
      return mockUser ? mockUser.profile as Profile : null;
    }
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      if (data) return data as Profile;

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
    // Check for mock session first
    const mockSession = sessionStorage.getItem("mock_auth_user");
    if (mockSession) {
      const userData = JSON.parse(mockSession);
      setUser(userData.user);
      setProfile(userData.profile);
      setLoading(false);
      return;
    }

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

  const signIn = async (email: string, password: string) => {
    // Mock authentication logic
    if (!supabase || MOCK_USERS[email as keyof typeof MOCK_USERS]) {
      const mockUser = MOCK_USERS[email as keyof typeof MOCK_USERS];
      if (mockUser && mockUser.password === password) {
        const fakeUser = {
          id: mockUser.profile.id,
          email: email,
          user_metadata: { full_name: mockUser.profile.full_name },
        } as any as User;
        
        setUser(fakeUser);
        setProfile(mockUser.profile as Profile);
        
        // Persist mock session
        sessionStorage.setItem("mock_auth_user", JSON.stringify({
          user: fakeUser,
          profile: mockUser.profile
        }));

        return { user: fakeUser, profile: mockUser.profile as Profile };
      }
      
      if (!supabase) {
        throw new Error("Auth service not configured. Use the test credentials found in analysis_results.md.");
      }
    }

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

