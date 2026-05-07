
-- Add promo_bonus column to company_requests
ALTER TABLE public.company_requests ADD COLUMN IF NOT EXISTS promo_bonus numeric DEFAULT 0;

-- Add ai_generated_flag to blog_posts
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS ai_generated boolean DEFAULT false;

-- Create whatsapp_logs table
CREATE TABLE IF NOT EXISTS public.whatsapp_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  phone text,
  message text NOT NULL,
  event_type text NOT NULL,
  status text DEFAULT 'pending',
  retry_count integer DEFAULT 0,
  error_message text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  sent_at timestamptz
);

ALTER TABLE public.whatsapp_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage whatsapp logs" ON public.whatsapp_logs FOR ALL USING (is_admin_or_team(auth.uid()));
CREATE POLICY "System can insert whatsapp logs" ON public.whatsapp_logs FOR INSERT WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_user ON public.whatsapp_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_event ON public.whatsapp_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_status ON public.whatsapp_logs(status);
