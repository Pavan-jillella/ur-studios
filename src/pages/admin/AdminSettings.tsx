import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Upload, Save, Trash2, Plus, GripVertical, ImageIcon, Instagram, Facebook, Twitter, Youtube, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import {
  getHeroSettings,
  updateHeroSettings,
  getAboutSettings,
  updateAboutSettings,
  getSocialLinks,
  updateSocialLinks,
  getContactSettings,
  updateContactSettings,
  type HeroSettings,
  type AboutSettings,
  type SocialLinks,
  type ContactSettings,
} from "@/api/settings";
import {
  getAllCoverImages,
  createCoverImage,
  updateCoverImage,
  deleteCoverImage,
  type CoverImage,
} from "@/api/coverImages";
import { uploadFile, deleteFile, getStoragePathFromUrl, getBucketFromUrl } from "@/lib/storage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Hero settings
  const [heroSettings, setHeroSettings] = useState<HeroSettings>({
    tagline: "",
    title: "",
    titleAccent: "",
    subtitle: "",
  });

  // About settings
  const [aboutSettings, setAboutSettings] = useState<AboutSettings>({
    title: "",
    quote: "",
    bio1: "",
    bio2: "",
    imageUrl: "",
  });

  // Social links
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    instagram: "",
    facebook: "",
    twitter: "",
    youtube: "",
    pinterest: "",
    tiktok: "",
    linkedin: "",
  });

  // Contact settings
  const [contactSettings, setContactSettings] = useState<ContactSettings>({
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    businessHours: "",
    mapEmbedUrl: "",
  });

  // Cover images
  const [coverImages, setCoverImages] = useState<CoverImage[]>([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [newImageTitle, setNewImageTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // About image
  const [aboutImageFile, setAboutImageFile] = useState<File | null>(null);
  const [aboutImagePreview, setAboutImagePreview] = useState<string | null>(null);
  const aboutFileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [hero, about, covers, social, contact] = await Promise.all([
        getHeroSettings(),
        getAboutSettings(),
        getAllCoverImages(),
        getSocialLinks(),
        getContactSettings(),
      ]);
      setHeroSettings(hero);
      setAboutSettings(about);
      setCoverImages(covers);
      setSocialLinks(social);
      setContactSettings(contact);
    } catch (err) {
      toast.error("Failed to load settings");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveHero = async () => {
    setSaving(true);
    try {
      await updateHeroSettings(heroSettings);
      toast.success("Hero settings saved");
    } catch (err) {
      toast.error("Failed to save hero settings");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAbout = async () => {
    setSaving(true);
    try {
      let imageUrl = aboutSettings.imageUrl;

      // Upload new about image if selected
      if (aboutImageFile) {
        const path = `about/${Date.now()}-portrait`;
        imageUrl = await uploadFile("site", path, aboutImageFile);
        setAboutImageFile(null);
        setAboutImagePreview(null);
      }

      await updateAboutSettings({ ...aboutSettings, imageUrl });
      setAboutSettings((prev) => ({ ...prev, imageUrl }));
      toast.success("About settings saved");
    } catch (err) {
      toast.error("Failed to save about settings");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSocial = async () => {
    setSaving(true);
    try {
      await updateSocialLinks(socialLinks);
      toast.success("Social links saved");
    } catch (err) {
      toast.error("Failed to save social links");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveContact = async () => {
    setSaving(true);
    try {
      await updateContactSettings(contactSettings);
      toast.success("Contact settings saved");
    } catch (err) {
      toast.error("Failed to save contact settings");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAboutImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAboutImageFile(file);
      setAboutImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      if (!newImageTitle) {
        setNewImageTitle(file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));
      }
    }
  };

  const openUploadDialog = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setNewImageTitle("");
    setUploadDialogOpen(true);
  };

  const handleUploadCover = async () => {
    if (!selectedFile || !newImageTitle) {
      toast.error("Please select a file and provide a title");
      return;
    }

    setUploading(true);
    try {
      const path = `covers/${Date.now()}-${newImageTitle.replace(/\s+/g, "-").toLowerCase()}`;
      const imageUrl = await uploadFile("site", path, selectedFile);

      const newImage = await createCoverImage({
        title: newImageTitle,
        image_url: imageUrl,
        display_order: coverImages.length,
        is_active: true,
      });

      setCoverImages((prev) => [...prev, newImage]);
      setUploadDialogOpen(false);
      toast.success("Cover image uploaded");
    } catch (err) {
      toast.error("Failed to upload cover image");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteCover = async (image: CoverImage) => {
    try {
      const storagePath = getStoragePathFromUrl(image.image_url);
      const bucket = getBucketFromUrl(image.image_url);
      if (storagePath && bucket) {
        try {
          await deleteFile(bucket, storagePath);
        } catch {
          // Continue even if storage delete fails
        }
      }

      await deleteCoverImage(image.id);
      setCoverImages((prev) => prev.filter((img) => img.id !== image.id));
      setConfirmDeleteId(null);
      toast.success("Cover image deleted");
    } catch (err) {
      toast.error("Failed to delete cover image");
      console.error(err);
    }
  };

  const toggleCoverActive = async (image: CoverImage) => {
    try {
      const updated = await updateCoverImage(image.id, { is_active: !image.is_active });
      setCoverImages((prev) =>
        prev.map((img) => (img.id === updated.id ? updated : img))
      );
      toast.success(updated.is_active ? "Image activated" : "Image deactivated");
    } catch (err) {
      toast.error("Failed to update image");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
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
        <h1 className="font-display text-3xl font-bold tracking-tight">Site Settings</h1>
        <p className="font-body text-muted-foreground mt-1">
          Manage your website content and images
        </p>
      </div>

      <Tabs defaultValue="hero" className="space-y-6">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="hero">Hero Section</TabsTrigger>
          <TabsTrigger value="covers">Cover Images</TabsTrigger>
          <TabsTrigger value="about">About Section</TabsTrigger>
          <TabsTrigger value="social">Social Links</TabsTrigger>
          <TabsTrigger value="contact">Contact Info</TabsTrigger>
        </TabsList>

        {/* Hero Settings Tab */}
        <TabsContent value="hero">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section Content</CardTitle>
              <CardDescription>
                Customize the text displayed on your homepage hero section
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={heroSettings.tagline}
                  onChange={(e) =>
                    setHeroSettings((prev) => ({ ...prev, tagline: e.target.value }))
                  }
                  placeholder="e.g., Cinematic Photography"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={heroSettings.title}
                    onChange={(e) =>
                      setHeroSettings((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="e.g., Capturing Timeless"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="titleAccent">Title Accent (italic)</Label>
                  <Input
                    id="titleAccent"
                    value={heroSettings.titleAccent}
                    onChange={(e) =>
                      setHeroSettings((prev) => ({ ...prev, titleAccent: e.target.value }))
                    }
                    placeholder="e.g., Moments"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Textarea
                  id="subtitle"
                  value={heroSettings.subtitle}
                  onChange={(e) =>
                    setHeroSettings((prev) => ({ ...prev, subtitle: e.target.value }))
                  }
                  placeholder="e.g., Every frame tells a story..."
                  rows={2}
                />
              </div>

              <Button onClick={handleSaveHero} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Hero Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cover Images Tab */}
        <TabsContent value="covers">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Cover Images</CardTitle>
                <CardDescription>
                  Manage the rotating background images on your hero section
                </CardDescription>
              </div>
              <Button onClick={openUploadDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add Image
              </Button>
            </CardHeader>
            <CardContent>
              {coverImages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mb-4" />
                  <p className="font-body text-lg">No cover images yet</p>
                  <p className="font-body text-sm mt-1">
                    Upload your first cover image to replace the defaults
                  </p>
                  <Button variant="outline" className="mt-4" onClick={openUploadDialog}>
                    Upload Image
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {coverImages.map((image, index) => (
                    <div
                      key={image.id}
                      className={`relative rounded-lg overflow-hidden border-2 ${
                        image.is_active ? "border-primary" : "border-muted opacity-50"
                      }`}
                    >
                      <img
                        src={image.image_url}
                        alt={image.title}
                        className="w-full aspect-video object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-white text-sm font-medium truncate">
                          {image.title}
                        </p>
                        <p className="text-white/70 text-xs">Order: {index + 1}</p>
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => toggleCoverActive(image)}
                          title={image.is_active ? "Deactivate" : "Activate"}
                        >
                          <Switch checked={image.is_active} className="scale-75" />
                        </Button>
                        {confirmDeleteId === image.id ? (
                          <>
                            <Button
                              variant="destructive"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleDeleteCover(image)}
                            >
                              ✓
                            </Button>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => setConfirmDeleteId(null)}
                            >
                              ✕
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setConfirmDeleteId(image.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* About Settings Tab */}
        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>About Section Content</CardTitle>
              <CardDescription>
                Customize the about section on your homepage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Portrait Image */}
              <div className="space-y-2">
                <Label>Portrait Image</Label>
                <div className="flex items-start gap-4">
                  <div
                    className="w-32 h-40 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden"
                    onClick={() => aboutFileInputRef.current?.click()}
                  >
                    {aboutImagePreview || aboutSettings.imageUrl ? (
                      <img
                        src={aboutImagePreview || aboutSettings.imageUrl}
                        alt="Portrait preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <Upload className="mx-auto h-6 w-6 mb-1" />
                        <p className="text-xs">Upload</p>
                      </div>
                    )}
                    <input
                      ref={aboutFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAboutImageChange}
                    />
                  </div>
                  <div className="flex-1 text-sm text-muted-foreground">
                    <p>Upload a portrait photo for the about section.</p>
                    <p className="mt-1">Recommended aspect ratio: 3:4</p>
                    {aboutImageFile && (
                      <p className="mt-2 text-primary">
                        New image selected: {aboutImageFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="aboutTitle">Section Title</Label>
                <Input
                  id="aboutTitle"
                  value={aboutSettings.title}
                  onChange={(e) =>
                    setAboutSettings((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="e.g., The Story Behind the Lens"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quote">Quote</Label>
                <Input
                  id="quote"
                  value={aboutSettings.quote}
                  onChange={(e) =>
                    setAboutSettings((prev) => ({ ...prev, quote: e.target.value }))
                  }
                  placeholder="e.g., I believe the most powerful photographs..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio1">Bio Paragraph 1</Label>
                <Textarea
                  id="bio1"
                  value={aboutSettings.bio1}
                  onChange={(e) =>
                    setAboutSettings((prev) => ({ ...prev, bio1: e.target.value }))
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio2">Bio Paragraph 2</Label>
                <Textarea
                  id="bio2"
                  value={aboutSettings.bio2}
                  onChange={(e) =>
                    setAboutSettings((prev) => ({ ...prev, bio2: e.target.value }))
                  }
                  rows={3}
                />
              </div>

              <Button onClick={handleSaveAbout} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save About Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Links Tab */}
        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>
                Connect your social media profiles. Leave empty to hide from website.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instagram" className="flex items-center gap-2">
                    <Instagram className="h-4 w-4" /> Instagram
                  </Label>
                  <Input
                    id="instagram"
                    value={socialLinks.instagram}
                    onChange={(e) =>
                      setSocialLinks((prev) => ({ ...prev, instagram: e.target.value }))
                    }
                    placeholder="https://instagram.com/username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facebook" className="flex items-center gap-2">
                    <Facebook className="h-4 w-4" /> Facebook
                  </Label>
                  <Input
                    id="facebook"
                    value={socialLinks.facebook}
                    onChange={(e) =>
                      setSocialLinks((prev) => ({ ...prev, facebook: e.target.value }))
                    }
                    placeholder="https://facebook.com/page"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter" className="flex items-center gap-2">
                    <Twitter className="h-4 w-4" /> Twitter / X
                  </Label>
                  <Input
                    id="twitter"
                    value={socialLinks.twitter}
                    onChange={(e) =>
                      setSocialLinks((prev) => ({ ...prev, twitter: e.target.value }))
                    }
                    placeholder="https://twitter.com/username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="youtube" className="flex items-center gap-2">
                    <Youtube className="h-4 w-4" /> YouTube
                  </Label>
                  <Input
                    id="youtube"
                    value={socialLinks.youtube}
                    onChange={(e) =>
                      setSocialLinks((prev) => ({ ...prev, youtube: e.target.value }))
                    }
                    placeholder="https://youtube.com/channel"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pinterest">Pinterest</Label>
                  <Input
                    id="pinterest"
                    value={socialLinks.pinterest}
                    onChange={(e) =>
                      setSocialLinks((prev) => ({ ...prev, pinterest: e.target.value }))
                    }
                    placeholder="https://pinterest.com/username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tiktok">TikTok</Label>
                  <Input
                    id="tiktok"
                    value={socialLinks.tiktok}
                    onChange={(e) =>
                      setSocialLinks((prev) => ({ ...prev, tiktok: e.target.value }))
                    }
                    placeholder="https://tiktok.com/@username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin" className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4" /> LinkedIn
                  </Label>
                  <Input
                    id="linkedin"
                    value={socialLinks.linkedin}
                    onChange={(e) =>
                      setSocialLinks((prev) => ({ ...prev, linkedin: e.target.value }))
                    }
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </div>

              <Button onClick={handleSaveSocial} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Social Links"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Settings Tab */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Your business contact details displayed on the website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={contactSettings.email}
                    onChange={(e) =>
                      setContactSettings((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="hello@urpixelstudio.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" /> Phone
                  </Label>
                  <Input
                    id="phone"
                    value={contactSettings.phone}
                    onChange={(e) =>
                      setContactSettings((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Address
                  </Label>
                  <Input
                    id="address"
                    value={contactSettings.address}
                    onChange={(e) =>
                      setContactSettings((prev) => ({ ...prev, address: e.target.value }))
                    }
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={contactSettings.city}
                    onChange={(e) =>
                      setContactSettings((prev) => ({ ...prev, city: e.target.value }))
                    }
                    placeholder="Richmond"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={contactSettings.state}
                      onChange={(e) =>
                        setContactSettings((prev) => ({ ...prev, state: e.target.value }))
                      }
                      placeholder="VA"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input
                      id="zip"
                      value={contactSettings.zip}
                      onChange={(e) =>
                        setContactSettings((prev) => ({ ...prev, zip: e.target.value }))
                      }
                      placeholder="23219"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={contactSettings.country}
                    onChange={(e) =>
                      setContactSettings((prev) => ({ ...prev, country: e.target.value }))
                    }
                    placeholder="USA"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessHours">Business Hours</Label>
                  <Input
                    id="businessHours"
                    value={contactSettings.businessHours}
                    onChange={(e) =>
                      setContactSettings((prev) => ({ ...prev, businessHours: e.target.value }))
                    }
                    placeholder="Mon-Fri 9am-6pm"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="mapEmbedUrl">Google Maps Embed URL (optional)</Label>
                  <Input
                    id="mapEmbedUrl"
                    value={contactSettings.mapEmbedUrl}
                    onChange={(e) =>
                      setContactSettings((prev) => ({ ...prev, mapEmbedUrl: e.target.value }))
                    }
                    placeholder="https://www.google.com/maps/embed?..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Paste the embed URL from Google Maps to show a map on your contact page
                  </p>
                </div>
              </div>

              <Button onClick={handleSaveContact} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Contact Info"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upload Cover Image Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Cover Image</DialogTitle>
            <DialogDescription>
              Add a new image to your hero carousel
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Image File</Label>
              <div
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => coverFileInputRef.current?.click()}
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="mx-auto max-h-40 rounded object-contain"
                  />
                ) : (
                  <div className="text-muted-foreground">
                    <Upload className="mx-auto h-8 w-8 mb-2" />
                    <p className="text-sm">Click to select an image</p>
                    <p className="text-xs mt-1">Recommended: 1920x1080 or larger</p>
                  </div>
                )}
                <input
                  ref={coverFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverFileChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageTitle">Title</Label>
              <Input
                id="imageTitle"
                value={newImageTitle}
                onChange={(e) => setNewImageTitle(e.target.value)}
                placeholder="e.g., Cherry Blossoms"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUploadCover} disabled={uploading}>
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
