-- Site settings table for dynamic content
create table if not exists public.site_settings (
  id uuid default gen_random_uuid() primary key,
  key text unique not null,
  value jsonb not null default '{}',
  updated_at timestamptz default now() not null
);

alter table public.site_settings enable row level security;

create policy "Public can read site settings"
  on public.site_settings for select
  using (true);

create policy "Admins can manage site settings"
  on public.site_settings for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Cover images table for hero carousel
create table if not exists public.cover_images (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  image_url text not null,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz default now() not null
);

alter table public.cover_images enable row level security;

create policy "Public can read active cover images"
  on public.cover_images for select
  using (is_active = true);

create policy "Admins can manage cover images"
  on public.cover_images for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Create site storage bucket for cover images and about photo
insert into storage.buckets (id, name, public)
values ('site', 'site', true)
on conflict (id) do nothing;

-- Site bucket: public read, admin write
create policy "Public read site" on storage.objects
  for select using (bucket_id = 'site');

create policy "Admin upload site" on storage.objects
  for insert with check (
    bucket_id = 'site'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admin delete site" on storage.objects
  for delete using (
    bucket_id = 'site'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admin update site" on storage.objects
  for update using (
    bucket_id = 'site'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Insert default settings
insert into public.site_settings (key, value) values
  ('hero', '{
    "tagline": "Cinematic Photography",
    "title": "Capturing Timeless",
    "titleAccent": "Moments",
    "subtitle": "Every frame tells a story. Every story deserves to be remembered."
  }'::jsonb),
  ('about', '{
    "title": "The Story Behind the Lens",
    "quote": "I believe the most powerful photographs are the ones that feel real.",
    "bio1": "With over 4 years of experience in cinematic photography, I specialize in capturing the raw, unscripted moments that make your story uniquely yours.",
    "bio2": "My approach blends documentary storytelling with fine art aesthetics, resulting in photographs that are both emotionally powerful and visually stunning. Based in Virginia, available worldwide.",
    "imageUrl": ""
  }'::jsonb)
on conflict (key) do nothing;
