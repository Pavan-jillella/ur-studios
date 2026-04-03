-- ================================================================
-- EMERGENCY FIX: Run this entire script in Supabase SQL Editor
-- This fixes ALL "Failed to save" errors in one shot
-- Go to: https://supabase.com → Your Project → SQL Editor → New Query
-- Paste everything below and click RUN
-- ================================================================

-- ─── STEP 1: Fix profiles table policies ─────────────────────
-- Allow users to upsert their own profile (needed for login auto-create)
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Admins can read all profiles" on public.profiles;
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Admins can update profile roles" on public.profiles;
drop policy if exists "Admins can manage profiles" on public.profiles;

-- Users can manage (read/write) their own profile row
create policy "Users manage own profile"
  on public.profiles for all
  using (id = auth.uid())
  with check (id = auth.uid());

-- Admins can read all profiles
create policy "Admins read all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ─── STEP 2: Set YOUR account as admin ───────────────────────
-- This finds your user and upserts the admin profile
insert into public.profiles (id, full_name, role)
select 
  u.id,
  coalesce(u.raw_user_meta_data->>'full_name', 'Pavan Jillella'),
  'admin'
from auth.users u
where u.email = 'pavankalyan171199@gmail.com'
on conflict (id) do update 
  set role = 'admin',
      full_name = coalesce(excluded.full_name, 'Pavan Jillella');

-- ─── STEP 3: Fix bookings (allow public contact form submissions) ─
drop policy if exists "Allow public inserts" on public.bookings;
drop policy if exists "Public can insert bookings" on public.bookings;
drop policy if exists "Clients can read own bookings" on public.bookings;
drop policy if exists "Admins can read all bookings" on public.bookings;
drop policy if exists "Admins can update bookings" on public.bookings;
drop policy if exists "Admins can delete bookings" on public.bookings;
drop policy if exists "Admins full access to bookings" on public.bookings;

create policy "Anyone can submit a booking"
  on public.bookings for insert with check (true);

create policy "Admins manage all bookings"
  on public.bookings for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Clients read own bookings"
  on public.bookings for select
  using (client_id = auth.uid());

-- ─── STEP 4: Portfolio images ─────────────────────────────────
drop policy if exists "Public can read active portfolio images" on public.portfolio_images;
drop policy if exists "Admins full access to portfolio" on public.portfolio_images;

create policy "Public read portfolio images"
  on public.portfolio_images for select using (is_active = true);

create policy "Admins manage portfolio"
  on public.portfolio_images for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ─── STEP 5: Testimonials ─────────────────────────────────────
drop policy if exists "Public can read active testimonials" on public.testimonials;
drop policy if exists "Admins full access to testimonials" on public.testimonials;

create policy "Public read testimonials"
  on public.testimonials for select using (is_active = true);

create policy "Admins manage testimonials"
  on public.testimonials for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ─── STEP 6: Services ─────────────────────────────────────────
drop policy if exists "Public can read active services" on public.services;
drop policy if exists "Admins full access to services" on public.services;

create policy "Public read services"
  on public.services for select using (is_active = true);

create policy "Admins manage services"
  on public.services for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ─── STEP 7: Cover images ─────────────────────────────────────
drop policy if exists "Public can read active cover images" on public.cover_images;
drop policy if exists "Admins can manage cover images" on public.cover_images;

create policy "Public read cover images"
  on public.cover_images for select using (is_active = true);

create policy "Admins manage cover images"
  on public.cover_images for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ─── STEP 8: Site settings ────────────────────────────────────
drop policy if exists "Public can read site settings" on public.site_settings;
drop policy if exists "Admins can manage site settings" on public.site_settings;

create policy "Public read site settings"
  on public.site_settings for select using (true);

create policy "Admins manage site settings"
  on public.site_settings for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ─── STEP 9: Gallery albums ───────────────────────────────────
drop policy if exists "Clients can read own albums" on public.gallery_albums;
drop policy if exists "Admins full access to albums" on public.gallery_albums;

create policy "Clients read own albums"
  on public.gallery_albums for select using (client_id = auth.uid());

create policy "Admins manage albums"
  on public.gallery_albums for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ─── STEP 10: Gallery photos ──────────────────────────────────
drop policy if exists "Clients can read own album photos" on public.gallery_photos;
drop policy if exists "Clients can approve own photos" on public.gallery_photos;
drop policy if exists "Admins full access to photos" on public.gallery_photos;

create policy "Clients read own photos"
  on public.gallery_photos for select
  using (
    exists (
      select 1 from public.gallery_albums
      where id = gallery_photos.album_id and client_id = auth.uid()
    )
  );

create policy "Admins manage photos"
  on public.gallery_photos for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ─── STEP 11: Storage buckets ─────────────────────────────────
-- Drop and recreate all storage policies
do $$
declare
  policies text[] := array[
    'Public read portfolio', 'Admin upload portfolio', 'Admin delete portfolio', 'Admin update portfolio',
    'Public read site', 'Admin upload site', 'Admin delete site', 'Admin update site',
    'Public read blog', 'Admin upload blog', 'Admin delete blog', 'Admin update blog',
    'Admin upload gallery', 'Admin delete gallery', 'Clients read gallery'
  ];
  p text;
begin
  foreach p in array policies loop
    execute format('drop policy if exists %I on storage.objects', p);
  end loop;
end $$;

-- Portfolio bucket
create policy "Public read portfolio" on storage.objects
  for select using (bucket_id = 'portfolio');
create policy "Admin upload portfolio" on storage.objects
  for insert with check (bucket_id = 'portfolio' and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "Admin update portfolio" on storage.objects
  for update using (bucket_id = 'portfolio' and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "Admin delete portfolio" on storage.objects
  for delete using (bucket_id = 'portfolio' and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Site bucket (cover images, about photo)
create policy "Public read site" on storage.objects
  for select using (bucket_id = 'site');
create policy "Admin upload site" on storage.objects
  for insert with check (bucket_id = 'site' and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "Admin update site" on storage.objects
  for update using (bucket_id = 'site' and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "Admin delete site" on storage.objects
  for delete using (bucket_id = 'site' and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Blog bucket
create policy "Public read blog" on storage.objects
  for select using (bucket_id = 'blog');
create policy "Admin upload blog" on storage.objects
  for insert with check (bucket_id = 'blog' and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "Admin update blog" on storage.objects
  for update using (bucket_id = 'blog' and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "Admin delete blog" on storage.objects
  for delete using (bucket_id = 'blog' and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Gallery bucket
create policy "Admin upload gallery" on storage.objects
  for insert with check (bucket_id = 'gallery' and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "Admin delete gallery" on storage.objects
  for delete using (bucket_id = 'gallery' and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "Clients read gallery" on storage.objects
  for select using (bucket_id = 'gallery' and auth.role() = 'authenticated');

-- ─── DONE! Verify results ─────────────────────────────────────
select id, full_name, role from public.profiles order by created_at;
