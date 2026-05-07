-- Performance indexes for fast read/write operations

-- blog_posts: fast lookup by slug and published status
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts (slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts (is_published, published_at DESC);

-- company_requests: fast lookup by user, status, tracking
CREATE INDEX IF NOT EXISTS idx_company_requests_user_id ON public.company_requests (user_id);
CREATE INDEX IF NOT EXISTS idx_company_requests_status ON public.company_requests (status);
CREATE INDEX IF NOT EXISTS idx_company_requests_tracking ON public.company_requests (tracking_code);
CREATE INDEX IF NOT EXISTS idx_company_requests_created ON public.company_requests (created_at DESC);

-- service_requests: fast lookup by user and status
CREATE INDEX IF NOT EXISTS idx_service_requests_user_id ON public.service_requests (user_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON public.service_requests (status);

-- notifications: fast lookup by user and read status
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications (user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications (created_at DESC);

-- payments: fast lookup by user and request
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments (user_id);
CREATE INDEX IF NOT EXISTS idx_payments_request_id ON public.payments (request_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments (status);

-- profiles: fast lookup by user_id
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles (referral_code);

-- identity_documents: fast lookup
CREATE INDEX IF NOT EXISTS idx_identity_docs_user_id ON public.identity_documents (user_id);
CREATE INDEX IF NOT EXISTS idx_identity_docs_request_id ON public.identity_documents (request_id);
CREATE INDEX IF NOT EXISTS idx_identity_docs_status ON public.identity_documents (status);

-- request_messages: fast lookup
CREATE INDEX IF NOT EXISTS idx_request_messages_request_id ON public.request_messages (request_id);
CREATE INDEX IF NOT EXISTS idx_request_messages_sender_id ON public.request_messages (sender_id);

-- request_documents_exchange: fast lookup
CREATE INDEX IF NOT EXISTS idx_request_docs_request_id ON public.request_documents_exchange (request_id);

-- user_roles: fast lookup
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles (user_id);

-- company_associates: fast lookup
CREATE INDEX IF NOT EXISTS idx_company_associates_request_id ON public.company_associates (request_id);

-- site_settings: fast lookup by key
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON public.site_settings (key);

-- contact_messages: admin view
CREATE INDEX IF NOT EXISTS idx_contact_messages_read ON public.contact_messages (is_read, created_at DESC);

-- support_tickets: fast lookup
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets (user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets (status);

-- lexia_conversations
CREATE INDEX IF NOT EXISTS idx_lexia_conversations_user_id ON public.lexia_conversations (user_id);

-- forum_posts
CREATE INDEX IF NOT EXISTS idx_forum_posts_created ON public.forum_posts (created_at DESC);

-- ebooks
CREATE INDEX IF NOT EXISTS idx_ebooks_published ON public.ebooks (is_published);
CREATE INDEX IF NOT EXISTS idx_ebooks_slug ON public.ebooks (slug);