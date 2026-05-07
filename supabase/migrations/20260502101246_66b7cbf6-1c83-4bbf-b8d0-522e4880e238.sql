-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Drop existing job if it exists (idempotent)
DO $$
BEGIN
  PERFORM cron.unschedule('send-scheduled-newsletters');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Schedule: every 5 minutes, trigger the newsletter sender in "cron" mode
SELECT cron.schedule(
  'send-scheduled-newsletters',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://xwtmnzorzsvkamqemddk.supabase.co/functions/v1/send-newsletter-campaign',
    headers := '{"Content-Type": "application/json", "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3dG1uem9yenN2a2FtcWVtZGRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MDIyNzQsImV4cCI6MjA4OTE3ODI3NH0.QE1RN4EiQd2bB5RD41mtRP_Gn4mJ21QaA7WvU69MVig", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3dG1uem9yenN2a2FtcWVtZGRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MDIyNzQsImV4cCI6MjA4OTE3ODI3NH0.QE1RN4EiQd2bB5RD41mtRP_Gn4mJ21QaA7WvU69MVig"}'::jsonb,
    body := '{"mode": "cron"}'::jsonb
  );
  $$
);