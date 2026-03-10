-- Add new columns to the existing bookings table
alter table public.bookings
  add column if not exists client_id uuid references public.profiles(id) on delete set null,
  add column if not exists payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'paid', 'refunded')),
  add column if not exists assigned_album_id uuid,
  add column if not exists updated_at timestamptz default now() not null;

-- Drop the overly broad read policy
drop policy if exists "Authenticated users can read" on public.bookings;

-- Clients can read their own bookings
create policy "Clients can read own bookings"
  on public.bookings for select
  using (client_id = auth.uid());

-- Admins can read all bookings
create policy "Admins can read all bookings"
  on public.bookings for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admins can update bookings
create policy "Admins can update bookings"
  on public.bookings for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admins can delete bookings
create policy "Admins can delete bookings"
  on public.bookings for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
