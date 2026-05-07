-- Drop old function (return type change)
DROP FUNCTION IF EXISTS public.reset_stuck_newsletter_campaigns();

CREATE OR REPLACE FUNCTION public.reset_stuck_newsletter_campaigns()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  reset_count INTEGER := 0;
  partial_count INTEGER := 0;
  rec RECORD;
BEGIN
  -- Campaigns with no successful send -> safe to retry (back to scheduled)
  FOR rec IN
    SELECT c.id FROM public.newsletter_campaigns c
    WHERE c.status = 'sending'
      AND c.updated_at < now() - INTERVAL '30 minutes'
      AND NOT EXISTS (
        SELECT 1 FROM public.newsletter_send_logs l
        WHERE l.campaign_id = c.id AND l.status = 'success'
      )
  LOOP
    UPDATE public.newsletter_campaigns
    SET status = 'scheduled', updated_at = now()
    WHERE id = rec.id;

    INSERT INTO public.newsletter_send_logs (campaign_id, recipient_email, status, error_message, attempt)
    VALUES (rec.id, 'system@legalform.ci', 'skipped',
            'Campagne bloquée >30min sans envoi réussi : remise en file (scheduled)', 0);

    reset_count := reset_count + 1;
  END LOOP;

  -- Campaigns with at least one success -> mark partial_failed (no auto retry)
  FOR rec IN
    SELECT c.id FROM public.newsletter_campaigns c
    WHERE c.status = 'sending'
      AND c.updated_at < now() - INTERVAL '30 minutes'
      AND EXISTS (
        SELECT 1 FROM public.newsletter_send_logs l
        WHERE l.campaign_id = c.id AND l.status = 'success'
      )
  LOOP
    UPDATE public.newsletter_campaigns
    SET status = 'partial_failed', updated_at = now()
    WHERE id = rec.id;

    INSERT INTO public.newsletter_send_logs (campaign_id, recipient_email, status, error_message, attempt)
    VALUES (rec.id, 'system@legalform.ci', 'skipped',
            'Campagne partiellement envoyée bloquée >30min : marquée partial_failed (revue manuelle requise)', 0);

    partial_count := partial_count + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'reset', reset_count,
    'partial_failed', partial_count,
    'total', reset_count + partial_count,
    'checked_at', now()
  );
END;
$function$;