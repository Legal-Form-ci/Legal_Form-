-- Improve stuck newsletter recovery without automatically resubmitting partially sent campaigns
CREATE OR REPLACE FUNCTION public.reset_stuck_newsletter_campaigns()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected INTEGER := 0;
  step_count INTEGER := 0;
BEGIN
  -- If no recipient was sent successfully, the scheduled campaign can safely retry.
  UPDATE public.newsletter_campaigns c
  SET status = 'scheduled', updated_at = now()
  WHERE c.status = 'sending'
    AND c.updated_at < now() - INTERVAL '30 minutes'
    AND NOT EXISTS (
      SELECT 1
      FROM public.newsletter_send_logs l
      WHERE l.campaign_id = c.id
        AND l.status = 'success'
    );

  GET DIAGNOSTICS step_count = ROW_COUNT;
  affected := affected + step_count;

  -- If at least one recipient was already sent, stop automatic retry to avoid duplicates.
  UPDATE public.newsletter_campaigns c
  SET status = 'partial_failed', updated_at = now()
  WHERE c.status = 'sending'
    AND c.updated_at < now() - INTERVAL '30 minutes'
    AND EXISTS (
      SELECT 1
      FROM public.newsletter_send_logs l
      WHERE l.campaign_id = c.id
        AND l.status = 'success'
    );

  GET DIAGNOSTICS step_count = ROW_COUNT;
  affected := affected + step_count;

  RETURN affected;
END;
$$;

-- Separate cron safety job: recover stuck newsletter campaigns every 10 minutes.
CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $$
BEGIN
  PERFORM cron.unschedule('reset-stuck-newsletter-campaigns');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'reset-stuck-newsletter-campaigns',
  '*/10 * * * *',
  $$SELECT public.reset_stuck_newsletter_campaigns();$$
);