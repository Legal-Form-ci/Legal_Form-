
-- Fix RLS: Replace permissive WITH CHECK true with restrictive checks

-- contact_messages: require email to not be empty
DROP POLICY IF EXISTS "Anyone can send contact messages" ON public.contact_messages;
CREATE POLICY "Anyone can send contact messages" ON public.contact_messages
FOR INSERT WITH CHECK (
  length(name) > 0 AND length(email) > 0 AND length(message) > 0
);

-- testimonials: require name and message
DROP POLICY IF EXISTS "Anyone can submit testimonials" ON public.testimonials;
CREATE POLICY "Anyone can submit testimonials" ON public.testimonials
FOR INSERT WITH CHECK (
  length(name) > 0 AND length(message) > 0
);

-- blog_comments: require content and post_id
DROP POLICY IF EXISTS "Anyone can submit blog comments" ON public.blog_comments;
CREATE POLICY "Anyone can submit blog comments" ON public.blog_comments
FOR INSERT WITH CHECK (
  length(content) > 0 AND post_id IS NOT NULL
);

-- ebook_downloads: require ebook_id
DROP POLICY IF EXISTS "Anyone can log downloads" ON public.ebook_downloads;
CREATE POLICY "Anyone can log downloads" ON public.ebook_downloads
FOR INSERT WITH CHECK (
  ebook_id IS NOT NULL
);

-- lexia_conversations: allow insert for anyone (chatbot)
DROP POLICY IF EXISTS "Anyone can create conversations" ON public.lexia_conversations;
CREATE POLICY "Anyone can create conversations" ON public.lexia_conversations
FOR INSERT WITH CHECK (
  session_id IS NOT NULL OR user_id = auth.uid()
);

-- lexia_messages: require content and conversation_id
DROP POLICY IF EXISTS "Anyone can insert messages" ON public.lexia_messages;
CREATE POLICY "Anyone can insert messages" ON public.lexia_messages
FOR INSERT WITH CHECK (
  length(content) > 0 AND conversation_id IS NOT NULL
);

-- payment_logs: require event
DROP POLICY IF EXISTS "System can insert payment logs" ON public.payment_logs;
CREATE POLICY "System can insert payment logs" ON public.payment_logs
FOR INSERT WITH CHECK (
  length(event) > 0
);

-- notifications: require title and message
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "System can create notifications" ON public.notifications
FOR INSERT WITH CHECK (
  length(title) > 0 AND length(message) > 0
);

-- Update default prices in site_settings
UPDATE public.site_settings 
SET value = '{"abidjan": 255000, "interior": 169000, "referral_bonus": 10000}'::jsonb,
    updated_at = now()
WHERE key = 'pricing';

-- Insert if not exists
INSERT INTO public.site_settings (key, value)
SELECT 'pricing', '{"abidjan": 255000, "interior": 169000, "referral_bonus": 10000}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.site_settings WHERE key = 'pricing');
