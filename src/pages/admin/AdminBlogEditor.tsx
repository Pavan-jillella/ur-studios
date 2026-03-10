import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, Save, Upload } from "lucide-react";
import {
  getPostById,
  createPost,
  updatePost,
  type BlogPost,
  type BlogPostInsert,
} from "@/api/blog";
import { uploadFile } from "@/lib/storage";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminBlogEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [existingPost, setExistingPost] = useState<BlogPost | null>(null);

  const fetchPost = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const post = await getPostById(id);
      setExistingPost(post);
      setTitle(post.title);
      setSlug(post.slug);
      setExcerpt(post.excerpt ?? "");
      setContent(post.content);
      setCoverImage(post.cover_image ?? "");
      setTagsInput((post.tags ?? []).join(", "));
      setIsPublished(post.is_published);
    } catch (err) {
      toast.error("Failed to load post");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isEditing) {
      fetchPost();
    }
  }, [isEditing, fetchPost]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!isEditing) {
      setSlug(slugify(value));
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const timestamp = Date.now();
      const ext = file.name.split(".").pop();
      const path = `covers/${timestamp}-${slugify(title || "post")}.${ext}`;

      const url = await uploadFile("blog", path, file);
      setCoverImage(url);
      toast.success("Cover image uploaded");
    } catch (err) {
      toast.error("Failed to upload cover image");
      console.error(err);
    } finally {
      setUploadingCover(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSave = async () => {
    if (!title || !slug || !content) {
      toast.error("Title, slug, and content are required");
      return;
    }

    setSaving(true);
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      // Determine published_at
      let published_at = existingPost?.published_at ?? null;
      if (isPublished && !published_at) {
        published_at = new Date().toISOString();
      }
      if (!isPublished) {
        published_at = null;
      }

      const payload: BlogPostInsert = {
        title,
        slug,
        excerpt: excerpt || null,
        content,
        cover_image: coverImage || null,
        tags,
        is_published: isPublished,
        published_at,
        author_id: user?.id ?? null,
      };

      if (isEditing && id) {
        await updatePost(id, payload);
        toast.success("Post updated");
      } else {
        await createPost(payload);
        toast.success("Post created");
      }

      navigate("/admin/blog");
    } catch (err) {
      toast.error("Failed to save post");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => navigate("/admin/blog")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Button>

        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold tracking-tight">
            {isEditing ? "Edit Post" : "New Post"}
          </h1>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : isEditing ? "Update Post" : "Create Post"}
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        {/* Main Content */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="post-title">Title *</Label>
            <Input
              id="post-title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Post title"
              className="text-lg font-display"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="post-slug">Slug</Label>
            <Input
              id="post-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="post-slug"
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="post-excerpt">Excerpt</Label>
            <Textarea
              id="post-excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief summary of the post..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="post-content">Content *</Label>
            <Textarea
              id="post-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post content here..."
              rows={20}
              className="font-body min-h-[400px]"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Publish
              </h3>
              <div className="flex items-center gap-3">
                <Switch
                  id="is_published"
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
                <Label htmlFor="is_published">
                  {isPublished ? "Published" : "Draft"}
                </Label>
              </div>
              {existingPost?.published_at && (
                <p className="text-xs text-muted-foreground">
                  Published:{" "}
                  {new Date(existingPost.published_at).toLocaleDateString()}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Cover Image */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Cover Image
              </h3>
              {coverImage && (
                <div className="relative">
                  <img
                    src={coverImage}
                    alt="Cover"
                    className="w-full rounded-md object-cover aspect-video"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-7 text-xs"
                    onClick={() => setCoverImage("")}
                  >
                    Remove
                  </Button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverUpload}
              />
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingCover}
              >
                <Upload className="mr-2 h-4 w-4" />
                {uploadingCover ? "Uploading..." : "Upload Cover"}
              </Button>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="cover-url" className="text-xs">
                  Or paste URL
                </Label>
                <Input
                  id="cover-url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://..."
                  className="text-xs"
                />
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Tags
              </h3>
              <div className="space-y-2">
                <Input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="wedding, tips, behind-the-scenes"
                />
                <p className="text-[11px] text-muted-foreground">
                  Separate tags with commas
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
