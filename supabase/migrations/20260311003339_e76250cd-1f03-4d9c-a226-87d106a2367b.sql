
-- Drop all RESTRICTIVE policies and recreate as PERMISSIVE on all tables

-- blog_comments
DROP POLICY IF EXISTS "Admins can manage blog comments" ON public.blog_comments;
DROP POLICY IF EXISTS "Anyone can read approved blog comments" ON public.blog_comments;
DROP POLICY IF EXISTS "Anyone can submit blog comments" ON public.blog_comments;
CREATE POLICY "Admins can manage blog comments" ON public.blog_comments FOR ALL USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Anyone can read approved blog comments" ON public.blog_comments FOR SELECT USING (is_approved = true);
CREATE POLICY "Anyone can submit blog comments" ON public.blog_comments FOR INSERT WITH CHECK (length(content) > 0 AND post_id IS NOT NULL);

-- blog_posts
DROP POLICY IF EXISTS "Admins can manage posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can read all posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Anyone can read published posts" ON public.blog_posts;
CREATE POLICY "Admins can manage posts" ON public.blog_posts FOR ALL USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Anyone can read published posts" ON public.blog_posts FOR SELECT USING (is_published = true);

-- company_associates
DROP POLICY IF EXISTS "Admins can manage all associates" ON public.company_associates;
DROP POLICY IF EXISTS "Users can manage associates of own requests" ON public.company_associates;
DROP POLICY IF EXISTS "Users can view associates of own requests" ON public.company_associates;
CREATE POLICY "Admins can manage all associates" ON public.company_associates FOR ALL USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Users can manage associates of own requests" ON public.company_associates FOR ALL USING (EXISTS (SELECT 1 FROM company_requests WHERE company_requests.id = company_associates.request_id AND company_requests.user_id = auth.uid()));

-- company_requests
DROP POLICY IF EXISTS "Admins can manage all requests" ON public.company_requests;
DROP POLICY IF EXISTS "Users can create requests" ON public.company_requests;
DROP POLICY IF EXISTS "Users can update own requests" ON public.company_requests;
DROP POLICY IF EXISTS "Users can view own requests" ON public.company_requests;
CREATE POLICY "Admins can manage all requests" ON public.company_requests FOR ALL USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Users can view own requests" ON public.company_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create requests" ON public.company_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own requests" ON public.company_requests FOR UPDATE USING (auth.uid() = user_id);

-- contact_messages
DROP POLICY IF EXISTS "Admins can manage contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can read contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Anyone can send contact messages" ON public.contact_messages;
CREATE POLICY "Admins can manage contact messages" ON public.contact_messages FOR ALL USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Anyone can send contact messages" ON public.contact_messages FOR INSERT WITH CHECK (length(name) > 0 AND length(email) > 0 AND length(message) > 0);

-- created_companies
DROP POLICY IF EXISTS "Admins can manage companies" ON public.created_companies;
DROP POLICY IF EXISTS "Anyone can view visible companies" ON public.created_companies;
CREATE POLICY "Admins can manage companies" ON public.created_companies FOR ALL USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Anyone can view visible companies" ON public.created_companies FOR SELECT USING (is_visible = true);

-- ebook_downloads
DROP POLICY IF EXISTS "Admins can view downloads" ON public.ebook_downloads;
DROP POLICY IF EXISTS "Anyone can log downloads" ON public.ebook_downloads;
CREATE POLICY "Admins can view downloads" ON public.ebook_downloads FOR SELECT USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Anyone can log downloads" ON public.ebook_downloads FOR INSERT WITH CHECK (ebook_id IS NOT NULL);

-- ebooks
DROP POLICY IF EXISTS "Admins can manage ebooks" ON public.ebooks;
DROP POLICY IF EXISTS "Anyone can view published ebooks" ON public.ebooks;
CREATE POLICY "Admins can manage ebooks" ON public.ebooks FOR ALL USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Anyone can view published ebooks" ON public.ebooks FOR SELECT USING (is_published = true);

-- faq_items
DROP POLICY IF EXISTS "Admins can manage FAQ" ON public.faq_items;
DROP POLICY IF EXISTS "Anyone can view published FAQ" ON public.faq_items;
CREATE POLICY "Admins can manage FAQ" ON public.faq_items FOR ALL USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Anyone can view published FAQ" ON public.faq_items FOR SELECT USING (is_published = true);

-- forum_comments
DROP POLICY IF EXISTS "Admins can manage comments" ON public.forum_comments;
DROP POLICY IF EXISTS "Anyone can read forum comments" ON public.forum_comments;
DROP POLICY IF EXISTS "Authenticated users can comment" ON public.forum_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON public.forum_comments;
CREATE POLICY "Admins can manage comments" ON public.forum_comments FOR ALL USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Anyone can read forum comments" ON public.forum_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON public.forum_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON public.forum_comments FOR UPDATE USING (auth.uid() = user_id);

-- forum_posts
DROP POLICY IF EXISTS "Admins can manage forum posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Anyone can read forum posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.forum_posts;
CREATE POLICY "Admins can manage forum posts" ON public.forum_posts FOR ALL USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Anyone can read forum posts" ON public.forum_posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON public.forum_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON public.forum_posts FOR UPDATE USING (auth.uid() = user_id);

-- identity_documents
DROP POLICY IF EXISTS "Admins can manage documents" ON public.identity_documents;
DROP POLICY IF EXISTS "Users can upload documents" ON public.identity_documents;
DROP POLICY IF EXISTS "Users can view own documents" ON public.identity_documents;
CREATE POLICY "Admins can manage documents" ON public.identity_documents FOR ALL USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Users can upload documents" ON public.identity_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own documents" ON public.identity_documents FOR SELECT USING (auth.uid() = user_id);

-- lexia_conversations
DROP POLICY IF EXISTS "Admins can view all conversations" ON public.lexia_conversations;
DROP POLICY IF EXISTS "Anyone can create conversations" ON public.lexia_conversations;
DROP POLICY IF EXISTS "Users can view own conversations" ON public.lexia_conversations;
CREATE POLICY "Admins can view all conversations" ON public.lexia_conversations FOR SELECT USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Anyone can create conversations" ON public.lexia_conversations FOR INSERT WITH CHECK (session_id IS NOT NULL OR user_id = auth.uid());
CREATE POLICY "Users can view own conversations" ON public.lexia_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can update conversations" ON public.lexia_conversations FOR UPDATE USING (true);

-- lexia_messages
DROP POLICY IF EXISTS "Admins can view all messages" ON public.lexia_messages;
DROP POLICY IF EXISTS "Anyone can insert messages" ON public.lexia_messages;
DROP POLICY IF EXISTS "Users can view messages of own conversations" ON public.lexia_messages;
CREATE POLICY "Admins can view all messages" ON public.lexia_messages FOR SELECT USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Anyone can insert messages" ON public.lexia_messages FOR INSERT WITH CHECK (length(content) > 0 AND conversation_id IS NOT NULL);
CREATE POLICY "Users can view messages of own conversations" ON public.lexia_messages FOR SELECT USING (EXISTS (SELECT 1 FROM lexia_conversations WHERE lexia_conversations.id = lexia_messages.conversation_id AND lexia_conversations.user_id = auth.uid()));

-- notifications
DROP POLICY IF EXISTS "Admins can manage notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Admins can manage notifications" ON public.notifications FOR ALL USING (is_admin_or_team(auth.uid()));
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (length(title) > 0 AND length(message) > 0);
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- payment_logs
DROP POLICY IF EXISTS "Admins can view payment logs" ON public.payment_logs;
DROP POLICY IF EXISTS "System can insert payment logs" ON public.payment_logs;
CREATE POLICY "Admins can view payment logs" ON public.payment_logs FOR SELECT USING (is_admin_or_team(auth.uid()));
CREATE POLICY "System can insert payment logs" ON public.payment_logs FOR INSERT WITH CHECK (length(event) > 0);

-- payments
DROP POLICY IF EXISTS "Admins can manage payments" ON public.payments;
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
CREATE POLICY "Admins can manage payments" ON public.payments FOR ALL USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- profiles
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);

-- referral_withdrawals
DROP POLICY IF EXISTS "Admins can manage withdrawals" ON public.referral_withdrawals;
DROP POLICY IF EXISTS "Users can create withdrawals" ON public.referral_withdrawals;
DROP POLICY IF EXISTS "Users can view own withdrawals" ON public.referral_withdrawals;
CREATE POLICY "Admins can manage withdrawals" ON public.referral_withdrawals FOR ALL USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Users can create withdrawals" ON public.referral_withdrawals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own withdrawals" ON public.referral_withdrawals FOR SELECT USING (auth.uid() = user_id);

-- request_documents_exchange
DROP POLICY IF EXISTS "Admins can manage doc exchanges" ON public.request_documents_exchange;
DROP POLICY IF EXISTS "Users can upload docs" ON public.request_documents_exchange;
DROP POLICY IF EXISTS "Users can view own doc exchanges" ON public.request_documents_exchange;
CREATE POLICY "Admins can manage doc exchanges" ON public.request_documents_exchange FOR ALL USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Users can upload docs" ON public.request_documents_exchange FOR INSERT TO authenticated WITH CHECK (auth.uid() = uploaded_by);
CREATE POLICY "Users can view own doc exchanges" ON public.request_documents_exchange FOR SELECT TO authenticated USING (auth.uid() = uploaded_by OR (request_type = 'company' AND EXISTS (SELECT 1 FROM company_requests cr WHERE cr.id = request_documents_exchange.request_id AND cr.user_id = auth.uid())) OR (request_type = 'service' AND EXISTS (SELECT 1 FROM service_requests sr WHERE sr.id = request_documents_exchange.request_id AND sr.user_id = auth.uid())));

-- request_messages
DROP POLICY IF EXISTS "Admins can manage all messages" ON public.request_messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.request_messages;
DROP POLICY IF EXISTS "Users can view messages of own requests" ON public.request_messages;
CREATE POLICY "Admins can manage all messages" ON public.request_messages FOR ALL USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Users can send messages" ON public.request_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can view messages of own requests" ON public.request_messages FOR SELECT TO authenticated USING (auth.uid() = sender_id OR (request_type = 'company' AND EXISTS (SELECT 1 FROM company_requests cr WHERE cr.id = request_messages.request_id AND cr.user_id = auth.uid())) OR (request_type = 'service' AND EXISTS (SELECT 1 FROM service_requests sr WHERE sr.id = request_messages.request_id AND sr.user_id = auth.uid())));
CREATE POLICY "Users can update own messages" ON public.request_messages FOR UPDATE TO authenticated USING (auth.uid() = sender_id OR is_admin_or_team(auth.uid()));

-- service_requests
DROP POLICY IF EXISTS "Admins can manage service requests" ON public.service_requests;
DROP POLICY IF EXISTS "Users can create service requests" ON public.service_requests;
DROP POLICY IF EXISTS "Users can view own service requests" ON public.service_requests;
CREATE POLICY "Admins can manage service requests" ON public.service_requests FOR ALL USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Users can create service requests" ON public.service_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own service requests" ON public.service_requests FOR SELECT USING (auth.uid() = user_id);

-- site_settings
DROP POLICY IF EXISTS "Admins can manage site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Anyone can read site settings" ON public.site_settings;
CREATE POLICY "Admins can manage site settings" ON public.site_settings FOR ALL USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Anyone can read site settings" ON public.site_settings FOR SELECT USING (true);

-- support_tickets
DROP POLICY IF EXISTS "Admins can manage tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can create tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can view own tickets" ON public.support_tickets;
CREATE POLICY "Admins can manage tickets" ON public.support_tickets FOR ALL USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Users can create tickets" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own tickets" ON public.support_tickets FOR SELECT USING (auth.uid() = user_id);

-- testimonials
DROP POLICY IF EXISTS "Admins can manage testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Anyone can submit testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Anyone can view approved testimonials" ON public.testimonials;
CREATE POLICY "Admins can manage testimonials" ON public.testimonials FOR ALL USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Anyone can submit testimonials" ON public.testimonials FOR INSERT WITH CHECK (length(name) > 0 AND length(message) > 0);
CREATE POLICY "Anyone can view approved testimonials" ON public.testimonials FOR SELECT USING (is_approved = true);

-- user_roles
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert own client role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own client role" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id AND role = 'client'::app_role);

-- whatsapp_logs
DROP POLICY IF EXISTS "Admins can manage whatsapp logs" ON public.whatsapp_logs;
DROP POLICY IF EXISTS "Authenticated users can insert whatsapp logs" ON public.whatsapp_logs;
CREATE POLICY "Admins can manage whatsapp logs" ON public.whatsapp_logs FOR ALL USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Authenticated users can insert whatsapp logs" ON public.whatsapp_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
