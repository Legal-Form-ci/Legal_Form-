
-- Add missing columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_link TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_earnings NUMERIC DEFAULT 0;

-- Add missing columns to company_requests
ALTER TABLE public.company_requests ADD COLUMN IF NOT EXISTS referrer_code TEXT;
ALTER TABLE public.company_requests ADD COLUMN IF NOT EXISTS estimated_price NUMERIC DEFAULT 0;

-- Add missing columns to request_documents_exchange
ALTER TABLE public.request_documents_exchange ADD COLUMN IF NOT EXISTS document_name TEXT;
ALTER TABLE public.request_documents_exchange ADD COLUMN IF NOT EXISTS document_type TEXT;
ALTER TABLE public.request_documents_exchange ADD COLUMN IF NOT EXISTS document_url TEXT;
ALTER TABLE public.request_documents_exchange ADD COLUMN IF NOT EXISTS sender_role TEXT DEFAULT 'client';
ALTER TABLE public.request_documents_exchange ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE public.request_documents_exchange ADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add missing columns to testimonials
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS company_type TEXT;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add missing columns to ebooks
ALTER TABLE public.ebooks ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT true;
ALTER TABLE public.ebooks ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0;

-- Add views_count alias
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;

-- Create increment_blog_views function
CREATE OR REPLACE FUNCTION public.increment_blog_views(post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE blog_posts SET views = views + 1, views_count = views_count + 1 WHERE id = post_id;
END;
$$;

-- Create company_associates table
CREATE TABLE IF NOT EXISTS public.company_associates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_request_id UUID REFERENCES public.company_requests(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  residence_address TEXT,
  profession TEXT,
  marital_status TEXT,
  marital_regime TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.company_associates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own associates" ON public.company_associates FOR ALL USING (true);

-- Create ebook_downloads table
CREATE TABLE IF NOT EXISTS public.ebook_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ebook_id UUID REFERENCES public.ebooks(id) ON DELETE CASCADE NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ebook_downloads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert downloads" ON public.ebook_downloads FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view downloads" ON public.ebook_downloads FOR SELECT USING (public.is_admin(auth.uid()));

-- Create forum_posts view (alias for forum_topics)
CREATE OR REPLACE VIEW public.forum_posts AS
SELECT 
  id, user_id, title, content, category,
  0 AS likes_count, views AS views_count,
  is_pinned, created_at, updated_at
FROM public.forum_topics;

-- Create forum_comments view (alias for forum_replies)
CREATE OR REPLACE VIEW public.forum_comments AS
SELECT 
  id, topic_id AS post_id, user_id, content,
  0 AS likes_count, created_at
FROM public.forum_replies;

-- Add missing column to referral_withdrawals
ALTER TABLE public.referral_withdrawals ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE public.referral_withdrawals ADD COLUMN IF NOT EXISTS payment_details JSONB DEFAULT '{}';
ALTER TABLE public.referral_withdrawals ADD COLUMN IF NOT EXISTS requested_at TIMESTAMPTZ DEFAULT now();
