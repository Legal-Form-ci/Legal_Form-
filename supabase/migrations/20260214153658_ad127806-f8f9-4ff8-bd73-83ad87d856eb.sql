
-- Add missing columns to company_requests for the Create form
ALTER TABLE public.company_requests ADD COLUMN IF NOT EXISTS sigle text;
ALTER TABLE public.company_requests ADD COLUMN IF NOT EXISTS bank text;
ALTER TABLE public.company_requests ADD COLUMN IF NOT EXISTS bp text;
ALTER TABLE public.company_requests ADD COLUMN IF NOT EXISTS manager_residence text;
ALTER TABLE public.company_requests ADD COLUMN IF NOT EXISTS manager_marital_status text;
ALTER TABLE public.company_requests ADD COLUMN IF NOT EXISTS manager_marital_regime text;
ALTER TABLE public.company_requests ADD COLUMN IF NOT EXISTS manager_mandate_duration text;
ALTER TABLE public.company_requests ADD COLUMN IF NOT EXISTS discount_applied numeric DEFAULT 0;

-- Allow anonymous inserts to company_requests for non-logged users (optional)
-- Already have policy for user_id = auth.uid()

-- Add missing column to blog_posts for meta_description  
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS meta_description text;

-- Create forum_posts table
CREATE TABLE IF NOT EXISTS public.forum_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  category text DEFAULT 'general',
  is_pinned boolean DEFAULT false,
  likes_count integer DEFAULT 0,
  views_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read forum posts" ON public.forum_posts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" ON public.forum_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON public.forum_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage forum posts" ON public.forum_posts
  FOR ALL USING (public.is_admin_or_team(auth.uid()));

-- Create forum_comments table
CREATE TABLE IF NOT EXISTS public.forum_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.forum_posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  likes_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read forum comments" ON public.forum_comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can comment" ON public.forum_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON public.forum_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage comments" ON public.forum_comments
  FOR ALL USING (public.is_admin_or_team(auth.uid()));

-- Create blog_comments table
CREATE TABLE IF NOT EXISTS public.blog_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.blog_posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid,
  author_name text NOT NULL,
  content text NOT NULL,
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read approved blog comments" ON public.blog_comments
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Anyone can submit blog comments" ON public.blog_comments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage blog comments" ON public.blog_comments
  FOR ALL USING (public.is_admin_or_team(auth.uid()));
