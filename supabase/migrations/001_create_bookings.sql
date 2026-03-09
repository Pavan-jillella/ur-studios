-- Create bookings table
create table if not exists public.bookings (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  phone text,
  event_date date,
  location text,
  service_type text not null,
  message text,
  status text not null default 'pending',
  created_at timestamptz default now() not null
);

-- Enable Row Level Security
alter table public.bookings enable row level security;

-- Allow anonymous inserts (for the public contact form)
create policy "Allow public inserts" on public.bookings
  for insert
  with check (true);

-- Only authenticated users (admin) can read bookings
create policy "Authenticated users can read" on public.bookings
  for select
  using (auth.role() = 'authenticated');
