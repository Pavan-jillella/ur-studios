import { supabase } from "@/lib/supabase";

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "admin" | "client";
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export async function getProfile(userId: string): Promise<Profile> {
  if (!supabase) {
    throw new Error("Service not configured.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw new Error(error.message);
  return data as Profile;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, "full_name" | "avatar_url" | "phone">>
): Promise<Profile> {
  if (!supabase) {
    throw new Error("Service not configured.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Profile;
}

export async function getAllProfiles(): Promise<(Profile & { email?: string })[]> {
  if (!supabase) {
    throw new Error("Service not configured.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Profile[];
}

export async function updateProfileRole(
  userId: string,
  role: "admin" | "client"
): Promise<Profile> {
  if (!supabase) {
    throw new Error("Service not configured.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Profile;
}
