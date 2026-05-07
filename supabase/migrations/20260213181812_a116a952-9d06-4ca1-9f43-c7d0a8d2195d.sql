
-- Add missing columns to match existing code expectations

-- company_requests
ALTER TABLE public.company_requests ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.company_requests ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid';
ALTER TABLE public.company_requests ADD COLUMN IF NOT EXISTS client_rating INTEGER;
ALTER TABLE public.company_requests ADD COLUMN IF NOT EXISTS estimated_price NUMERIC;
ALTER TABLE public.company_requests ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE public.company_requests ADD COLUMN IF NOT EXISTS referral_code TEXT;

-- request_documents_exchange - add aliases
ALTER TABLE public.request_documents_exchange ADD COLUMN IF NOT EXISTS document_name TEXT;
ALTER TABLE public.request_documents_exchange ADD COLUMN IF NOT EXISTS document_type TEXT;
ALTER TABLE public.request_documents_exchange ADD COLUMN IF NOT EXISTS document_url TEXT;
ALTER TABLE public.request_documents_exchange ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.request_documents_exchange ADD COLUMN IF NOT EXISTS description TEXT;

-- request_messages
ALTER TABLE public.request_messages ADD COLUMN IF NOT EXISTS sender_role TEXT DEFAULT 'client';
ALTER TABLE public.request_messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

-- created_companies - add columns for showcase
ALTER TABLE public.created_companies ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.created_companies ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE public.created_companies ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE public.created_companies ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE public.created_companies ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 5;
ALTER TABLE public.created_companies ADD COLUMN IF NOT EXISTS testimonial TEXT;
ALTER TABLE public.created_companies ADD COLUMN IF NOT EXISTS founder_name TEXT;
ALTER TABLE public.created_companies ADD COLUMN IF NOT EXISTS activity_sector TEXT;

-- ebooks
ALTER TABLE public.ebooks ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT true;
ALTER TABLE public.ebooks ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0;
ALTER TABLE public.ebooks ADD COLUMN IF NOT EXISTS author TEXT;
ALTER TABLE public.ebooks ADD COLUMN IF NOT EXISTS pages INTEGER;

-- ebook_downloads table
CREATE TABLE IF NOT EXISTS public.ebook_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ebook_id UUID REFERENCES public.ebooks(id) ON DELETE CASCADE,
  user_email TEXT,
  user_name TEXT,
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ebook_downloads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can log downloads" ON public.ebook_downloads FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view downloads" ON public.ebook_downloads FOR SELECT USING (public.is_admin_or_team(auth.uid()));

-- testimonials - add missing columns
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS company_type TEXT;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS location TEXT;

-- profiles - add email from auth
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_balance NUMERIC DEFAULT 0;
