-- Performance indexes for high-traffic public/admin features
CREATE INDEX IF NOT EXISTS idx_testimonials_approved_created_at
ON public.testimonials (is_approved, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_forum_posts_pinned_created_at
ON public.forum_posts (is_pinned DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_forum_comments_post_created_at
ON public.forum_comments (post_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_request_messages_request_type_created_at
ON public.request_messages (request_id, request_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_messages_read_created_at
ON public.contact_messages (is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_created_companies_visible_created_at
ON public.created_companies (is_visible, created_at DESC);