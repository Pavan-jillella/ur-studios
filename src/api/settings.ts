import { supabase } from "@/lib/supabase";

export interface SiteSettings {
  id: string;
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
}

export interface HeroSettings {
  tagline: string;
  title: string;
  titleAccent: string;
  subtitle: string;
}

export interface AboutSettings {
  title: string;
  quote: string;
  bio1: string;
  bio2: string;
  imageUrl: string;
}

export interface SocialLinks {
  instagram: string;
  facebook: string;
  twitter: string;
  youtube: string;
  pinterest: string;
  tiktok: string;
  linkedin: string;
}

export interface ContactSettings {
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  businessHours: string;
  mapEmbedUrl: string;
}

const LOCAL_STORAGE_KEY = "ur_studios_settings";

function getLocalSettings(): Record<string, Record<string, unknown>> {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  return data ? JSON.parse(data) : {};
}

function saveLocalSettings(settings: Record<string, Record<string, unknown>>) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
}

const defaultHero: HeroSettings = {
  tagline: "Cinematic Photography",
  title: "Capturing Timeless",
  titleAccent: "Moments",
  subtitle: "Every frame tells a story. Every story deserves to be remembered.",
};

const defaultAbout: AboutSettings = {
  title: "The Story Behind the Lens",
  quote: "I believe the most powerful photographs are the ones that feel real.",
  bio1: "With over 4 years of experience in cinematic photography, I specialize in capturing the raw, unscripted moments that make your story uniquely yours.",
  bio2: "My approach blends documentary storytelling with fine art aesthetics, resulting in photographs that are both emotionally powerful and visually stunning. Based in Virginia, available worldwide.",
  imageUrl: "",
};

const defaultSocialLinks: SocialLinks = {
  instagram: "https://instagram.com/urpixelstudio",
  facebook: "",
  twitter: "",
  youtube: "",
  pinterest: "",
  tiktok: "",
  linkedin: "",
};

const defaultContactSettings: ContactSettings = {
  email: "hello@urpixelstudio.com",
  phone: "",
  address: "",
  city: "Virginia",
  state: "VA",
  zip: "",
  country: "USA",
  businessHours: "Mon-Fri 9am-6pm",
  mapEmbedUrl: "",
};

export async function getSetting<T>(key: string): Promise<T | null> {
  if (!supabase) {
    const local = getLocalSettings();
    return (local[key] as T) || null;
  }

  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("key", key)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    throw new Error(error.message);
  }

  return data?.value as T;
}

export async function updateSetting<T extends Record<string, unknown>>(
  key: string,
  value: T
): Promise<void> {
  if (!supabase) {
    const local = getLocalSettings();
    local[key] = value;
    saveLocalSettings(local);
    return;
  }

  const { error } = await supabase
    .from("site_settings")
    .upsert(
      { key, value, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );

  if (error) {
    throw new Error(error.message);
  }
}

export async function getHeroSettings(): Promise<HeroSettings> {
  const settings = await getSetting<HeroSettings>("hero");
  return settings || defaultHero;
}

export async function updateHeroSettings(
  settings: Partial<HeroSettings>
): Promise<void> {
  const current = await getHeroSettings();
  await updateSetting("hero", { ...current, ...settings });
}

export async function getAboutSettings(): Promise<AboutSettings> {
  const settings = await getSetting<AboutSettings>("about");
  return settings || defaultAbout;
}

export async function updateAboutSettings(
  settings: Partial<AboutSettings>
): Promise<void> {
  const current = await getAboutSettings();
  await updateSetting("about", { ...current, ...settings });
}

export async function getSocialLinks(): Promise<SocialLinks> {
  const settings = await getSetting<SocialLinks>("social");
  return settings || defaultSocialLinks;
}

export async function updateSocialLinks(
  settings: Partial<SocialLinks>
): Promise<void> {
  const current = await getSocialLinks();
  await updateSetting("social", { ...current, ...settings });
}

export async function getContactSettings(): Promise<ContactSettings> {
  const settings = await getSetting<ContactSettings>("contact");
  return settings || defaultContactSettings;
}

export async function updateContactSettings(
  settings: Partial<ContactSettings>
): Promise<void> {
  const current = await getContactSettings();
  await updateSetting("contact", { ...current, ...settings });
}
