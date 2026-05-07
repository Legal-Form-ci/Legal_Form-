
-- Newsletter send logs (per recipient)
CREATE TABLE IF NOT EXISTS public.newsletter_send_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.newsletter_campaigns(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success','failed','skipped')),
  provider_message_id TEXT,
  error_message TEXT,
  attempt INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_nl_logs_campaign ON public.newsletter_send_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_nl_logs_status ON public.newsletter_send_logs(status);

ALTER TABLE public.newsletter_send_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage send logs" ON public.newsletter_send_logs
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Reset stuck "sending" campaigns older than 30 minutes (e.g. crashed worker)
CREATE OR REPLACE FUNCTION public.reset_stuck_newsletter_campaigns()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected INTEGER;
BEGIN
  UPDATE public.newsletter_campaigns
  SET status = 'scheduled', updated_at = now()
  WHERE status = 'sending'
    AND updated_at < now() - INTERVAL '30 minutes';
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;
