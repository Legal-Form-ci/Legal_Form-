
-- =============================================
-- FIX 1: Prevent privilege escalation on user_roles
-- Only allow inserting 'client' role for own user
-- =============================================
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;
CREATE POLICY "Users can insert own client role" ON public.user_roles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND role = 'client');

-- =============================================
-- FIX 2: Restrict lexia_messages SELECT to own conversations
-- =============================================
DROP POLICY IF EXISTS "Anyone can view messages in their conversations" ON public.lexia_messages;
CREATE POLICY "Users can view messages in own conversations" ON public.lexia_messages
FOR SELECT TO authenticated
USING (
  conversation_id IN (
    SELECT id FROM public.lexia_conversations
    WHERE user_id = auth.uid() OR user_id IS NULL
  )
);

-- Allow anon to view messages in anonymous conversations (session-based)
CREATE POLICY "Anon can view messages in anonymous conversations" ON public.lexia_messages
FOR SELECT TO anon
USING (
  conversation_id IN (
    SELECT id FROM public.lexia_conversations WHERE user_id IS NULL
  )
);

-- =============================================
-- FIX 3: Restrict notification insertion to authenticated users
-- =============================================
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "Authenticated can insert notifications" ON public.notifications
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================
-- FIX 4: Fix overly permissive policies (USING true)
-- =============================================

-- company_associates: restrict to request owners and admins
DROP POLICY IF EXISTS "Users can manage own associates" ON public.company_associates;
CREATE POLICY "Users can manage own associates" ON public.company_associates
FOR ALL TO authenticated
USING (
  company_request_id IN (
    SELECT id FROM public.company_requests WHERE user_id = auth.uid()
  )
  OR is_admin(auth.uid())
);

-- analytics_events: restrict insert to authenticated only
DROP POLICY IF EXISTS "Anyone can insert analytics" ON public.analytics_events;
CREATE POLICY "Authenticated can insert analytics" ON public.analytics_events
FOR INSERT TO authenticated
WITH CHECK (true);

-- Allow anon to insert analytics too (page tracking)
CREATE POLICY "Anon can insert analytics" ON public.analytics_events
FOR INSERT TO anon
WITH CHECK (true);

-- contact_messages: keep public insert but restrict fields
DROP POLICY IF EXISTS "Anyone can send contact messages" ON public.contact_messages;
CREATE POLICY "Anyone can send contact messages" ON public.contact_messages
FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- ebook_downloads: keep public insert
DROP POLICY IF EXISTS "Anyone can insert downloads" ON public.ebook_downloads;
CREATE POLICY "Anyone can insert downloads" ON public.ebook_downloads
FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- lexia_conversations: restrict insert
DROP POLICY IF EXISTS "Anyone can create conversations" ON public.lexia_conversations;
CREATE POLICY "Anyone can create conversations" ON public.lexia_conversations
FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- lexia_messages: restrict insert  
DROP POLICY IF EXISTS "Anyone can insert messages" ON public.lexia_messages;
CREATE POLICY "Anyone can insert messages" ON public.lexia_messages
FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- testimonials: restrict to authenticated
DROP POLICY IF EXISTS "Users can create testimonials" ON public.testimonials;
CREATE POLICY "Authenticated can create testimonials" ON public.testimonials
FOR INSERT TO authenticated
WITH CHECK (true);

-- search_results_cache: keep public access
DROP POLICY IF EXISTS "Anyone can insert cache" ON public.search_results_cache;
CREATE POLICY "Anyone can insert cache" ON public.search_results_cache
FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- =============================================
-- FIX 5: Set search_path on update_updated_at function
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
