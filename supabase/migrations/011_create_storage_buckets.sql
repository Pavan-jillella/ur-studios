-- Create storage buckets
insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('blog', 'blog', true)
on conflict (id) do nothing;

-- Portfolio bucket: public read, admin write
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

create policy "Admin delete portfolio" on storage.objects
  for delete using (
    bucket_id = 'portfolio'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Gallery bucket: admin write, authenticated read
create policy "Admin upload gallery" on storage.objects
  for insert with check (
    bucket_id = 'gallery'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admin delete gallery" on storage.objects
  for delete using (
    bucket_id = 'gallery'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Clients read gallery" on storage.objects
  for select using (
    bucket_id = 'gallery'
    and auth.role() = 'authenticated'
  );

-- Blog bucket: public read, admin write
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

create policy "Admin delete blog" on storage.objects
  for delete using (
    bucket_id = 'blog'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
