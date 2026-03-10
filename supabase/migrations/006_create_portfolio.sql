create table if not exists public.portfolio_images (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  alt_text text,
  category text not null,
  image_url text not null,
  display_order integer not null default 0,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz default now() not null
);

alter table public.portfolio_images enable row level security;

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
  );
