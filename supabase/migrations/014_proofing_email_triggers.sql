-- Proofing Email Triggers
-- Automatically sends emails when album status changes or selections are submitted

-- Function to send proofing notification via edge function
create or replace function notify_proofing_change()
returns trigger as $$
declare
  client_record record;
  notification_type text;
  payload jsonb;
  selection_count integer;
begin
  -- Get client info
  select p.email, p.full_name
  into client_record
  from public.profiles p
  where p.id = coalesce(NEW.client_id, OLD.client_id);

  if client_record.email is null then
    return NEW;
  end if;

  -- Determine notification type based on changes
  if TG_OP = 'UPDATE' then
    -- Album status changed to proofing
    if OLD.status != 'proofing' and NEW.status = 'proofing' then
      notification_type := 'proofing_ready';
    
    -- Client submitted selections (selection_submitted_at was set)
    elsif OLD.selection_submitted_at is null and NEW.selection_submitted_at is not null then
      notification_type := 'selections_submitted';
      select count(*) into selection_count
      from public.gallery_photos
      where album_id = NEW.id and is_approved = true;
    
    -- Admin approved selections
    elsif OLD.selection_approved_at is null and NEW.selection_approved_at is not null then
      notification_type := 'selections_approved';
    
    -- Admin requested changes (reset submission)
    elsif OLD.selection_submitted_at is not null 
          and NEW.selection_submitted_at is null 
          and NEW.admin_feedback is not null 
          and NEW.admin_feedback != coalesce(OLD.admin_feedback, '') then
      notification_type := 'changes_requested';
    
    else
      -- No relevant change
      return NEW;
    end if;
  else
    return NEW;
  end if;

  -- Build payload
  payload := jsonb_build_object(
    'type', notification_type,
    'album_id', NEW.id,
    'album_title', NEW.title,
    'client_email', client_record.email,
    'client_name', coalesce(client_record.full_name, 'there'),
    'selection_count', coalesce(selection_count, 0),
    'feedback', NEW.admin_feedback
  );

  -- Call edge function (fire and forget)
  perform net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/send-proofing-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.supabase_anon_key')
    ),
    body := payload
  );

  return NEW;
exception
  when others then
    -- Log error but don't fail the transaction
    raise warning 'Failed to send proofing notification: %', SQLERRM;
    return NEW;
end;
$$ language plpgsql security definer;

-- Create trigger for album updates
drop trigger if exists on_album_proofing_change on public.gallery_albums;

create trigger on_album_proofing_change
  after update on public.gallery_albums
  for each row
  execute function notify_proofing_change();

-- Function to check for albums needing reminder (no selections after 7 days)
-- This should be called by a scheduled job (e.g., pg_cron or external scheduler)
create or replace function send_proofing_reminders()
returns void as $$
declare
  album_record record;
  client_record record;
  payload jsonb;
begin
  -- Find albums in proofing for 7+ days with no selections submitted
  for album_record in
    select a.*
    from public.gallery_albums a
    where a.status = 'proofing'
      and a.selection_submitted_at is null
      and a.created_at < now() - interval '7 days'
      and not exists (
        -- Don't send if we already have selections (client is actively using)
        select 1 from public.gallery_photos p
        where p.album_id = a.id and p.is_approved = true
      )
  loop
    -- Get client info
    select p.email, p.full_name
    into client_record
    from public.profiles p
    where p.id = album_record.client_id;

    if client_record.email is not null then
      payload := jsonb_build_object(
        'type', 'reminder_no_selection',
        'album_id', album_record.id,
        'album_title', album_record.title,
        'client_email', client_record.email,
        'client_name', coalesce(client_record.full_name, 'there')
      );

      perform net.http_post(
        url := current_setting('app.settings.supabase_url') || '/functions/v1/send-proofing-email',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.supabase_anon_key')
        ),
        body := payload
      );
    end if;
  end loop;
end;
$$ language plpgsql security definer;

-- Note: To enable automatic reminders, you need to:
-- 1. Enable the pg_net extension: create extension if not exists pg_net;
-- 2. Set up pg_cron for scheduled execution:
--    select cron.schedule('proofing-reminders', '0 10 * * *', 'select send_proofing_reminders()');
