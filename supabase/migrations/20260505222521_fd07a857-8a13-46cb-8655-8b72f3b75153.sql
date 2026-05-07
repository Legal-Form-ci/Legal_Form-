-- 1) Historique des vérifications DNS
CREATE TABLE IF NOT EXISTS public.dns_check_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL,
  spf_ok BOOLEAN NOT NULL DEFAULT false,
  dkim_ok BOOLEAN NOT NULL DEFAULT false,
  dmarc_ok BOOLEAN NOT NULL DEFAULT false,
  all_ok BOOLEAN NOT NULL DEFAULT false,
  details JSONB,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dns_check_history_checked_at ON public.dns_check_history(checked_at DESC);

ALTER TABLE public.dns_check_history ENABLE ROW LEVEL SECURITY;

-- Seuls les admins peuvent lire
CREATE POLICY "Admins can read DNS history"
ON public.dns_check_history FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 2) Cron : re-vérifier le DNS toutes les 30 minutes via l'edge function
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'dns-check-30min') THEN
    PERFORM cron.unschedule('dns-check-30min');
  END IF;
END $$;

SELECT cron.schedule(
  'dns-check-30min',
  '*/30 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://xwtmnzorzsvkamqemddk.supabase.co/functions/v1/check-dns-records',
    headers := '{"Content-Type":"application/json"}'::jsonb,
    body := '{"persist":true}'::jsonb
  );
  $$
);

-- 3) Restreindre EXECUTE des SECURITY DEFINER critiques à authenticated/service_role uniquement
REVOKE EXECUTE ON FUNCTION public.reset_stuck_newsletter_campaigns() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.unsubscribe_newsletter(text) FROM public;
-- garder anon pour unsubscribe_newsletter (lien email public), c'est volontaire