-- Photo Proofing System Schema Enhancements
-- Adds client notes, selection limits, categories, and workflow timestamps

-- Add client notes field to photos (for crop requests, comments, etc.)
alter table public.gallery_photos 
  add column if not exists client_notes text;

-- Add category for organizing selections (album photos, prints, rejected)
alter table public.gallery_photos 
  add column if not exists category text not null default 'none' 
  check (category in ('none', 'album', 'print', 'rejected'));

-- Add selection limit to albums (e.g., "pick 30 for album")
alter table public.gallery_albums 
  add column if not exists selection_limit integer;

-- Add workflow timestamps for selection submission and approval
alter table public.gallery_albums 
  add column if not exists selection_submitted_at timestamptz;

alter table public.gallery_albums 
  add column if not exists selection_approved_at timestamptz;

-- Add admin notes for feedback when requesting changes
alter table public.gallery_albums 
  add column if not exists admin_feedback text;

-- Create index for efficient proofing queue queries
create index if not exists idx_albums_proofing_status 
  on public.gallery_albums (status, selection_submitted_at) 
  where status = 'proofing';

-- Create index for category filtering
create index if not exists idx_photos_category 
  on public.gallery_photos (album_id, category);

-- Add policy allowing clients to update their notes and category selections
drop policy if exists "Clients can approve own photos" on public.gallery_photos;

create policy "Clients can update own photo selections"
  on public.gallery_photos for update
  using (
    exists (
      select 1 from public.gallery_albums
      where id = gallery_photos.album_id
        and client_id = auth.uid()
        and status = 'proofing'
    )
  )
  with check (
    exists (
      select 1 from public.gallery_albums
      where id = gallery_photos.album_id
        and client_id = auth.uid()
        and status = 'proofing'
    )
  );

-- Allow clients to update their album's selection_submitted_at
create policy "Clients can submit selections"
  on public.gallery_albums for update
  using (
    client_id = auth.uid() 
    and status = 'proofing'
  )
  with check (
    client_id = auth.uid() 
    and status = 'proofing'
  );
