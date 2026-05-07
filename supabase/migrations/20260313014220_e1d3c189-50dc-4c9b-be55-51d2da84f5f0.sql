-- Additional performance indexes for messaging and dashboards
CREATE INDEX IF NOT EXISTS idx_payments_user_status ON public.payments (user_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_request_id ON public.payments (request_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications (user_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts (is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts (slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON public.blog_posts (category);

CREATE INDEX IF NOT EXISTS idx_service_requests_user ON public.service_requests (user_id, status);
CREATE INDEX IF NOT EXISTS idx_service_requests_created ON public.service_requests (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles (user_id);

CREATE INDEX IF NOT EXISTS idx_company_requests_user ON public.company_requests (user_id, status);
CREATE INDEX IF NOT EXISTS idx_company_requests_created ON public.company_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_company_requests_tracking ON public.company_requests (tracking_code);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON public.support_tickets (user_id, status);

CREATE INDEX IF NOT EXISTS idx_identity_documents_user ON public.identity_documents (user_id, status);
CREATE INDEX IF NOT EXISTS idx_identity_documents_request ON public.identity_documents (request_id);

CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_created ON public.whatsapp_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_status ON public.whatsapp_logs (status);

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON public.user_roles (user_id, role);

-- Function to increment blog post views
CREATE OR REPLACE FUNCTION public.increment_blog_views(post_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE blog_posts SET views_count = COALESCE(views_count, 0) + 1 WHERE id = post_id;
$$;