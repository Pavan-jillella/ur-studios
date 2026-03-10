import { supabase } from "@/lib/supabase";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  author_id: string | null;
  tags: string[];
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export type BlogPostInsert = Omit<
  BlogPost,
  "id" | "created_at" | "updated_at"
>;

export async function getPublishedPosts(): Promise<BlogPost[]> {
  if (!supabase) {
    throw new Error("Service is not configured. Please try again later.");
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as BlogPost[];
}

export async function getPostBySlug(slug: string): Promise<BlogPost> {
  if (!supabase) {
    throw new Error("Service is not configured. Please try again later.");
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as BlogPost;
}

export async function getPostById(id: string): Promise<BlogPost> {
  if (!supabase) {
    throw new Error("Service is not configured. Please try again later.");
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as BlogPost;
}

export async function getAllPosts(): Promise<BlogPost[]> {
  if (!supabase) {
    throw new Error("Service is not configured. Please try again later.");
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as BlogPost[];
}

export async function createPost(data: BlogPostInsert): Promise<BlogPost> {
  if (!supabase) {
    throw new Error("Service is not configured. Please try again later.");
  }

  const { data: created, error } = await supabase
    .from("blog_posts")
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return created as BlogPost;
}

export async function updatePost(
  id: string,
  updates: Partial<BlogPost>
): Promise<BlogPost> {
  if (!supabase) {
    throw new Error("Service is not configured. Please try again later.");
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as BlogPost;
}

export async function deletePost(id: string): Promise<void> {
  if (!supabase) {
    throw new Error("Service is not configured. Please try again later.");
  }

  const { error } = await supabase
    .from("blog_posts")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}
