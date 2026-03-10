create table if not exists public.testimonials (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  role text not null,
  text text not null,
  avatar_url text,
  rating integer check (rating >= 1 and rating <= 5),
  is_featured boolean not null default false,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz default now() not null
);

alter table public.testimonials enable row level security;

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
  );
