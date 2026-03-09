-- Database webhook: call send-booking-email Edge Function on every new booking
-- NOTE: This must be configured via the Supabase Dashboard instead of raw SQL.
--
-- Go to: Database → Webhooks → Create a new webhook
--
-- Settings:
--   Name:    send-booking-email
--   Table:   bookings
--   Events:  INSERT
--   Type:    Supabase Edge Function
--   Function: send-booking-email
--
-- Alternatively, use the pg_net extension to call the function via HTTP trigger:

create or replace function public.handle_new_booking()
returns trigger
language plpgsql
security definer
as $$
begin
  perform net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/send-booking-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'bookings',
      'record', row_to_json(new)
    )
  );
  return new;
end;
$$;

create trigger on_booking_created
  after insert on public.bookings
  for each row
  execute function public.handle_new_booking();
