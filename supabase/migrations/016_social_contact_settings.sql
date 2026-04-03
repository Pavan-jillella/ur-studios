-- Add default social links and contact settings to site_settings table

-- Insert social links defaults
INSERT INTO public.site_settings (key, value) VALUES
  ('social', '{
    "instagram": "https://instagram.com/urpixelstudio",
    "facebook": "",
    "twitter": "",
    "youtube": "",
    "pinterest": "",
    "tiktok": "",
    "linkedin": ""
  }'::jsonb),
  ('contact', '{
    "email": "hello@urpixelstudio.com",
    "phone": "",
    "address": "",
    "city": "Virginia",
    "state": "VA",
    "zip": "",
    "country": "USA",
    "businessHours": "Mon-Fri 9am-6pm",
    "mapEmbedUrl": ""
  }'::jsonb)
ON CONFLICT (key) DO NOTHING;
