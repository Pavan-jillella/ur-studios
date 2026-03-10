create table if not exists public.services (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text not null unique,
  description text not null,
  long_description text,
  price text not null,
  price_cents integer,
  icon text not null default 'Camera',
  cover_image text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.services enable row level security;

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
  );
