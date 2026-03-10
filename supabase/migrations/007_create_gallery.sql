create table if not exists public.gallery_albums (
  id uuid default gen_random_uuid() primary key,
  booking_id uuid references public.bookings(id) on delete set null,
  client_id uuid references public.profiles(id) on delete set null,
  title text not null,
  description text,
  cover_image_url text,
  status text not null default 'draft' check (status in ('draft', 'proofing', 'delivered')),
  is_downloadable boolean not null default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.gallery_albums enable row level security;

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
  );

create table if not exists public.gallery_photos (
  id uuid default gen_random_uuid() primary key,
  album_id uuid references public.gallery_albums(id) on delete cascade not null,
  image_url text not null,
  thumbnail_url text,
  title text,
  display_order integer not null default 0,
  is_approved boolean not null default false,
  is_downloadable boolean not null default false,
  created_at timestamptz default now() not null
);

alter table public.gallery_photos enable row level security;

create policy "Clients can read own album photos"
  on public.gallery_photos for select
  using (
    exists (
      select 1 from public.gallery_albums
      where id = gallery_photos.album_id
        and client_id = auth.uid()
    )
  );

create policy "Clients can approve own photos"
  on public.gallery_photos for update
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
  );
