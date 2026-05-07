
-- ============================================
-- PHASE 1: Core tables for LegalForm WebApp
-- ============================================

-- 1. App role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'team', 'client');

-- 2. Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  avatar_url TEXT,
  referral_code TEXT UNIQUE DEFAULT 'LF-' || substr(md5(random()::text), 1, 8),
  referral_link TEXT,
  referral_count INTEGER DEFAULT 0,
  referral_earnings NUMERIC DEFAULT 0,
  referred_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. User roles table (separate from profiles per security requirements)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'client',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Helper: check if user is admin or team
CREATE OR REPLACE FUNCTION public.is_admin_or_team(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'team')
  )
$$;

-- 5. RLS policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.is_admin_or_team(auth.uid()));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE USING (public.is_admin_or_team(auth.uid()));

-- 6. RLS policies for user_roles
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.is_admin_or_team(auth.uid()));
CREATE POLICY "Users can insert own client role" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id AND role = 'client');
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 7. Site settings table
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage site settings" ON public.site_settings FOR ALL USING (public.is_admin_or_team(auth.uid()));

-- 8. Blog posts table
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  category TEXT,
  tags TEXT[],
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  author_name TEXT DEFAULT 'Legal Form',
  views_count INTEGER DEFAULT 0,
  meta_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published posts" ON public.blog_posts FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can read all posts" ON public.blog_posts FOR SELECT USING (public.is_admin_or_team(auth.uid()));
CREATE POLICY "Admins can manage posts" ON public.blog_posts FOR ALL USING (public.is_admin_or_team(auth.uid()));

-- 9. Company requests table
CREATE TABLE public.company_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  request_number TEXT UNIQUE DEFAULT 'REQ-' || substr(md5(random()::text), 1, 8),
  company_name TEXT NOT NULL,
  company_type TEXT NOT NULL DEFAULT 'SARL',
  status TEXT NOT NULL DEFAULT 'pending',
  location TEXT DEFAULT 'Abidjan',
  capital TEXT,
  activity_sector TEXT,
  associates JSONB,
  documents JSONB,
  notes TEXT,
  admin_notes TEXT,
  amount NUMERIC,
  is_paid BOOLEAN DEFAULT false,
  payment_method TEXT,
  payment_date TIMESTAMPTZ,
  tracking_code TEXT UNIQUE DEFAULT 'TRK-' || upper(substr(md5(random()::text), 1, 10)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.company_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own requests" ON public.company_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create requests" ON public.company_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own requests" ON public.company_requests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all requests" ON public.company_requests FOR ALL USING (public.is_admin_or_team(auth.uid()));

-- 10. Service requests
CREATE TABLE public.service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  service_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  details JSONB,
  notes TEXT,
  admin_notes TEXT,
  amount NUMERIC,
  is_paid BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own service requests" ON public.service_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create service requests" ON public.service_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage service requests" ON public.service_requests FOR ALL USING (public.is_admin_or_team(auth.uid()));

-- 11. Payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  request_id UUID,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  transaction_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage payments" ON public.payments FOR ALL USING (public.is_admin_or_team(auth.uid()));

-- 12. Contact messages
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can send contact messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read contact messages" ON public.contact_messages FOR SELECT USING (public.is_admin_or_team(auth.uid()));
CREATE POLICY "Admins can manage contact messages" ON public.contact_messages FOR ALL USING (public.is_admin_or_team(auth.uid()));

-- 13. Support tickets
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT DEFAULT 'medium',
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tickets" ON public.support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create tickets" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage tickets" ON public.support_tickets FOR ALL USING (public.is_admin_or_team(auth.uid()));

-- 14. LexIA conversations
CREATE TABLE public.lexia_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lexia_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations" ON public.lexia_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can create conversations" ON public.lexia_conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all conversations" ON public.lexia_conversations FOR SELECT USING (public.is_admin_or_team(auth.uid()));

-- 15. LexIA messages
CREATE TABLE public.lexia_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.lexia_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lexia_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages of own conversations" ON public.lexia_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.lexia_conversations WHERE id = conversation_id AND user_id = auth.uid())
);
CREATE POLICY "Anyone can insert messages" ON public.lexia_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all messages" ON public.lexia_messages FOR SELECT USING (public.is_admin_or_team(auth.uid()));

-- 16. Identity documents
CREATE TABLE public.identity_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  request_id UUID,
  document_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.identity_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents" ON public.identity_documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upload documents" ON public.identity_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage documents" ON public.identity_documents FOR ALL USING (public.is_admin_or_team(auth.uid()));

-- 17. Company associates
CREATE TABLE public.company_associates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.company_requests(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  nationality TEXT,
  birth_date DATE,
  address TEXT,
  shares_percentage NUMERIC,
  role_in_company TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.company_associates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view associates of own requests" ON public.company_associates FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.company_requests WHERE id = request_id AND user_id = auth.uid())
);
CREATE POLICY "Users can manage associates of own requests" ON public.company_associates FOR ALL USING (
  EXISTS (SELECT 1 FROM public.company_requests WHERE id = request_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can manage all associates" ON public.company_associates FOR ALL USING (public.is_admin_or_team(auth.uid()));

-- 18. Created companies (showcase)
CREATE TABLE public.created_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  company_type TEXT,
  location TEXT,
  sector TEXT,
  logo_url TEXT,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.created_companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view visible companies" ON public.created_companies FOR SELECT USING (is_visible = true);
CREATE POLICY "Admins can manage companies" ON public.created_companies FOR ALL USING (public.is_admin_or_team(auth.uid()));

-- 19. Ebooks
CREATE TABLE public.ebooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  cover_image TEXT,
  file_url TEXT,
  category TEXT,
  is_published BOOLEAN DEFAULT false,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ebooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published ebooks" ON public.ebooks FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage ebooks" ON public.ebooks FOR ALL USING (public.is_admin_or_team(auth.uid()));

-- 20. Request messages
CREATE TABLE public.request_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.request_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages of own requests" ON public.request_messages FOR SELECT USING (auth.uid() = sender_id);
CREATE POLICY "Users can send messages" ON public.request_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Admins can manage all messages" ON public.request_messages FOR ALL USING (public.is_admin_or_team(auth.uid()));

-- 21. Request documents exchange
CREATE TABLE public.request_documents_exchange (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  is_admin_upload BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.request_documents_exchange ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own doc exchanges" ON public.request_documents_exchange FOR SELECT USING (auth.uid() = uploaded_by);
CREATE POLICY "Users can upload docs" ON public.request_documents_exchange FOR INSERT WITH CHECK (auth.uid() = uploaded_by);
CREATE POLICY "Admins can manage doc exchanges" ON public.request_documents_exchange FOR ALL USING (public.is_admin_or_team(auth.uid()));

-- 22. Payment logs
CREATE TABLE public.payment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES public.payments(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view payment logs" ON public.payment_logs FOR SELECT USING (public.is_admin_or_team(auth.uid()));
CREATE POLICY "System can insert payment logs" ON public.payment_logs FOR INSERT WITH CHECK (true);

-- 23. Testimonials
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company TEXT,
  message TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  is_approved BOOLEAN DEFAULT false,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved testimonials" ON public.testimonials FOR SELECT USING (is_approved = true);
CREATE POLICY "Anyone can submit testimonials" ON public.testimonials FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage testimonials" ON public.testimonials FOR ALL USING (public.is_admin_or_team(auth.uid()));

-- 24. FAQ
CREATE TABLE public.faq_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published FAQ" ON public.faq_items FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage FAQ" ON public.faq_items FOR ALL USING (public.is_admin_or_team(auth.uid()));

-- 25. Referral withdrawals
CREATE TABLE public.referral_withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  payment_details JSONB,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.referral_withdrawals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own withdrawals" ON public.referral_withdrawals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create withdrawals" ON public.referral_withdrawals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage withdrawals" ON public.referral_withdrawals FOR ALL USING (public.is_admin_or_team(auth.uid()));

-- 26. Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage notifications" ON public.notifications FOR ALL USING (public.is_admin_or_team(auth.uid()));
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- 27. Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_company_requests_updated_at BEFORE UPDATE ON public.company_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_service_requests_updated_at BEFORE UPDATE ON public.service_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 28. Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('company-logos', 'company-logos', true);

-- Storage RLS policies
CREATE POLICY "Anyone can view public files" ON storage.objects FOR SELECT USING (bucket_id = 'company-logos');
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'company-logos' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own uploads" ON storage.objects FOR UPDATE USING (bucket_id = 'company-logos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Admins can delete files" ON storage.objects FOR DELETE USING (bucket_id = 'company-logos' AND public.is_admin_or_team(auth.uid()));

-- 29. Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.company_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.blog_posts;

-- 30. Insert default site settings
INSERT INTO public.site_settings (key, value) VALUES 
  ('pricing', '{"abidjan": 199000, "interior": 169000, "referral_bonus": 10000}'::jsonb),
  ('contact', '{"phone": "+225 01 71 50 04 73", "whatsapp": "+225 07 09 67 79 25", "email": "contact@legalform.ci", "address": "BPM 387, Grand-Bassam, ANCIENNE CIE, Côte d''Ivoire"}'::jsonb),
  ('general', '{"site_name": "Legal Form", "site_tagline": "Créer, gérer et accompagner votre entreprise"}'::jsonb);
