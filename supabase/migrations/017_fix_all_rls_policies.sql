-- ============================================================
-- Migration 017: Fix all RLS policies for production use
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- ─── 1. BOOKINGS: Allow public insert (contact form) ─────────
-- The existing "Allow public inserts" policy may have been blocked
-- if the migration 010 overwrote things. Let's be explicit:

drop policy if exists "Allow public inserts" on public.bookings;
drop policy if exists "Clients can read own bookings" on public.bookings;
drop policy if exists "Admins can read all bookings" on public.bookings;
drop policy if exists "Admins can update bookings" on public.bookings;
drop policy if exists "Admins can delete bookings" on public.bookings;
drop policy if exists "Authenticated users can read" on public.bookings;

-- Anyone (even anonymous) can submit a booking (the contact form)
create policy "Public can insert bookings"
  on public.bookings for insert
  with check (true);

-- Clients can read their own bookings
create policy "Clients can read own bookings"
  on public.bookings for select
  using (client_id = auth.uid());

-- Admins can do everything
create policy "Admins full access to bookings"
  on public.bookings for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ─── 2. PORTFOLIO IMAGES: Public read + admin write ───────────
drop policy if exists "Public can read active portfolio images" on public.portfolio_images;
drop policy if exists "Admins full access to portfolio" on public.portfolio_images;

create policy "Public can read active portfolio images"
  on public.portfolio_images for select
  using (is_active = true);

create policy "Admins full access to portfolio"
  on public.portfolio_images for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ─── 3. TESTIMONIALS: Public read + admin write ───────────────
drop policy if exists "Public can read active testimonials" on public.testimonials;
drop policy if exists "Admins full access to testimonials" on public.testimonials;

create policy "Public can read active testimonials"
  on public.testimonials for select
  using (is_active = true);

create policy "Admins full access to testimonials"
  on public.testimonials for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ─── 4. SERVICES: Public read + admin write ───────────────────
drop policy if exists "Public can read active services" on public.services;
drop policy if exists "Admins full access to services" on public.services;

create policy "Public can read active services"
  on public.services for select
  using (is_active = true);

create policy "Admins full access to services"
  on public.services for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ─── 5. GALLERY ALBUMS: Fix policies ─────────────────────────
drop policy if exists "Clients can read own albums" on public.gallery_albums;
drop policy if exists "Admins full access to albums" on public.gallery_albums;

create policy "Clients can read own albums"
  on public.gallery_albums for select
  using (client_id = auth.uid());

create policy "Admins full access to albums"
  on public.gallery_albums for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ─── 6. GALLERY PHOTOS ────────────────────────────────────────
drop policy if exists "Clients can read own album photos" on public.gallery_photos;
drop policy if exists "Clients can approve own photos" on public.gallery_photos;
drop policy if exists "Admins full access to photos" on public.gallery_photos;

create policy "Clients can read own album photos"
  on public.gallery_photos for select
  using (
    exists (
      select 1 from public.gallery_albums
      where id = gallery_photos.album_id
        and client_id = auth.uid()
    )
  );

create policy "Admins full access to photos"
  on public.gallery_photos for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ─── 7. SITE SETTINGS: Public read + admin write ──────────────
drop policy if exists "Public can read site settings" on public.site_settings;
drop policy if exists "Admins can manage site settings" on public.site_settings;

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
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ─── 8. COVER IMAGES: Public read + admin write ───────────────
drop policy if exists "Public can read active cover images" on public.cover_images;
drop policy if exists "Admins can manage cover images" on public.cover_images;

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
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ─── 9. PROFILES: Fix so admin can read all profiles ─────────
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Admins can read all profiles" on public.profiles;
drop policy if exists "Admins full access to profiles" on public.profiles;

-- Users can always read their own profile
create policy "Users can read own profile"
  on public.profiles for select
  using (id = auth.uid());

-- Admins can read ALL profiles
create policy "Admins can read all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid());

-- Admins can manage all profiles
create policy "Admins can manage profiles"
  on public.profiles for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ─── 10. STORAGE BUCKETS: Fix admin upload policies ──────────

-- Portfolio storage
drop policy if exists "Public read portfolio" on storage.objects;
drop policy if exists "Admin upload portfolio" on storage.objects;
drop policy if exists "Admin delete portfolio" on storage.objects;
drop policy if exists "Admin update portfolio" on storage.objects;

create policy "Public read portfolio" on storage.objects
  for select using (bucket_id = 'portfolio');

create policy "Admin upload portfolio" on storage.objects
  for insert with check (
    bucket_id = 'portfolio'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admin update portfolio" on storage.objects
  for update using (
    bucket_id = 'portfolio'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admin delete portfolio" on storage.objects
  for delete using (
    bucket_id = 'portfolio'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Site storage (cover images, about photo)
drop policy if exists "Public read site" on storage.objects;
drop policy if exists "Admin upload site" on storage.objects;
drop policy if exists "Admin delete site" on storage.objects;
drop policy if exists "Admin update site" on storage.objects;

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

create policy "Admin update site" on storage.objects
  for update using (
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

-- Blog storage
drop policy if exists "Public read blog" on storage.objects;
drop policy if exists "Admin upload blog" on storage.objects;
drop policy if exists "Admin delete blog" on storage.objects;
drop policy if exists "Admin update blog" on storage.objects;

create policy "Public read blog" on storage.objects
  for select using (bucket_id = 'blog');

create policy "Admin upload blog" on storage.objects
  for insert with check (
    bucket_id = 'blog'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admin update blog" on storage.objects
  for update using (
    bucket_id = 'blog'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admin delete blog" on storage.objects
  for delete using (
    bucket_id = 'blog'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ─── 11. ENSURE your user is set as admin ────────────────────
-- This upserts a profile record for your account.
-- Replace 'YOUR_USER_UUID_HERE' with the UUID from Supabase Auth > Users
-- OR just run the line below which uses the CURRENT logged-in user's ID

-- Option A: If you know your UUID from Auth dashboard, paste it here:
-- insert into public.profiles (id, full_name, role)
-- values ('YOUR_USER_UUID_HERE', 'Pavan Jillella', 'admin')
-- on conflict (id) do update set role = 'admin', full_name = 'Pavan Jillella';

-- Option B: Run this after logging in via the website to auto-set your role:
-- update public.profiles set role = 'admin' where id = auth.uid();

-- ─── 12. BLOG POSTS ───────────────────────────────────────────
alter table if exists public.blog_posts enable row level security;

drop policy if exists "Public can read blog posts" on public.blog_posts;
drop policy if exists "Admins full access to blog posts" on public.blog_posts;

create policy "Public can read blog posts"
  on public.blog_posts for select
  using (is_published = true);

create policy "Admins full access to blog posts"
  on public.blog_posts for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
