
-- Fix overly permissive INSERT policy on whatsapp_logs
DROP POLICY IF EXISTS "System can insert whatsapp logs" ON public.whatsapp_logs;
CREATE POLICY "Authenticated users can insert whatsapp logs" ON public.whatsapp_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
