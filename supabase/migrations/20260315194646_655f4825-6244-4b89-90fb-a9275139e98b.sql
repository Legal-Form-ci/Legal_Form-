
-- Create created_companies table (used by Showcase and Testimonials)
CREATE TABLE IF NOT EXISTS public.created_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT,
  region TEXT,
  district TEXT,
  rating INTEGER DEFAULT 5,
  testimonial TEXT,
  founder_name TEXT,
  founder_photo_url TEXT,
  logo_url TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.created_companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published companies" ON public.created_companies FOR SELECT USING (is_published = true OR public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage created companies" ON public.created_companies FOR ALL USING (public.is_admin(auth.uid()));

-- Add missing columns to service_requests
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS estimated_price NUMERIC DEFAULT 0;

-- Add missing columns to company_requests
ALTER TABLE public.company_requests ADD COLUMN IF NOT EXISTS structure_type TEXT;
ALTER TABLE public.company_requests ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE public.company_requests ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.company_requests ADD COLUMN IF NOT EXISTS email TEXT;

-- Fix security definer views
DROP VIEW IF EXISTS public.forum_posts;
DROP VIEW IF EXISTS public.forum_comments;

CREATE VIEW public.forum_posts WITH (security_invoker = true) AS
SELECT id, user_id, title, content, category, 0 AS likes_count, views AS views_count, is_pinned, created_at, updated_at
FROM public.forum_topics;

CREATE VIEW public.forum_comments WITH (security_invoker = true) AS
SELECT id, topic_id AS post_id, user_id, content, 0 AS likes_count, created_at
FROM public.forum_replies;
