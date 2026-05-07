-- Drop all RESTRICTIVE policies and recreate as PERMISSIVE on all tables

-- blog_comments
DROP POLICY IF EXISTS "Admins can manage blog comments" ON blog_comments;
DROP POLICY IF EXISTS "Anyone can read approved blog comments" ON blog_comments;
DROP POLICY IF EXISTS "Anyone can submit blog comments" ON blog_comments;
CREATE POLICY "Admins can manage blog comments" ON blog_comments FOR ALL TO public USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Anyone can read approved blog comments" ON blog_comments FOR SELECT TO public USING (is_approved = true);
CREATE POLICY "Anyone can submit blog comments" ON blog_comments FOR INSERT TO public WITH CHECK (length(content) > 0 AND post_id IS NOT NULL);

-- blog_posts
DROP POLICY IF EXISTS "Admins can manage posts" ON blog_posts;
DROP POLICY IF EXISTS "Anyone can read published posts" ON blog_posts;
CREATE POLICY "Admins can manage posts" ON blog_posts FOR ALL TO public USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Anyone can read published posts" ON blog_posts FOR SELECT TO public USING (is_published = true);

-- company_associates
DROP POLICY IF EXISTS "Admins can manage all associates" ON company_associates;
DROP POLICY IF EXISTS "Users can manage associates of own requests" ON company_associates;
CREATE POLICY "Admins can manage all associates" ON company_associates FOR ALL TO public USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Users can manage associates of own requests" ON company_associates FOR ALL TO public USING (EXISTS (SELECT 1 FROM company_requests WHERE company_requests.id = company_associates.request_id AND company_requests.user_id = auth.uid()));

-- company_requests
DROP POLICY IF EXISTS "Admins can manage all requests" ON company_requests;
DROP POLICY IF EXISTS "Users can create requests" ON company_requests;
DROP POLICY IF EXISTS "Users can update own requests" ON company_requests;
DROP POLICY IF EXISTS "Users can view own requests" ON company_requests;
CREATE POLICY "Admins can manage all requests" ON company_requests FOR ALL TO public USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Users can create requests" ON company_requests FOR INSERT TO public WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own requests" ON company_requests FOR UPDATE TO public USING (auth.uid() = user_id);
CREATE POLICY "Users can view own requests" ON company_requests FOR SELECT TO public USING (auth.uid() = user_id);

-- contact_messages
DROP POLICY IF EXISTS "Admins can manage contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Anyone can send contact messages" ON contact_messages;
CREATE POLICY "Admins can manage contact messages" ON contact_messages FOR ALL TO public USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Anyone can send contact messages" ON contact_messages FOR INSERT TO public WITH CHECK (length(name) > 0 AND length(email) > 0 AND length(message) > 0);

-- created_companies
DROP POLICY IF EXISTS "Admins can manage companies" ON created_companies;
DROP POLICY IF EXISTS "Anyone can view visible companies" ON created_companies;
CREATE POLICY "Admins can manage companies" ON created_companies FOR ALL TO public USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Anyone can view visible companies" ON created_companies FOR SELECT TO public USING (is_visible = true);

-- ebook_downloads
DROP POLICY IF EXISTS "Admins can view downloads" ON ebook_downloads;
DROP POLICY IF EXISTS "Anyone can log downloads" ON ebook_downloads;
CREATE POLICY "Admins can view downloads" ON ebook_downloads FOR SELECT TO public USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Anyone can log downloads" ON ebook_downloads FOR INSERT TO public WITH CHECK (ebook_id IS NOT NULL);

-- ebooks
DROP POLICY IF EXISTS "Admins can manage ebooks" ON ebooks;
DROP POLICY IF EXISTS "Anyone can view published ebooks" ON ebooks;
CREATE POLICY "Admins can manage ebooks" ON ebooks FOR ALL TO public USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Anyone can view published ebooks" ON ebooks FOR SELECT TO public USING (is_published = true);

-- faq_items
DROP POLICY IF EXISTS "Admins can manage FAQ" ON faq_items;
DROP POLICY IF EXISTS "Anyone can view published FAQ" ON faq_items;
CREATE POLICY "Admins can manage FAQ" ON faq_items FOR ALL TO public USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Anyone can view published FAQ" ON faq_items FOR SELECT TO public USING (is_published = true);

-- forum_comments
DROP POLICY IF EXISTS "Admins can manage comments" ON forum_comments;
DROP POLICY IF EXISTS "Anyone can read forum comments" ON forum_comments;
DROP POLICY IF EXISTS "Authenticated users can comment" ON forum_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON forum_comments;
CREATE POLICY "Admins can manage comments" ON forum_comments FOR ALL TO public USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Anyone can read forum comments" ON forum_comments FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can comment" ON forum_comments FOR INSERT TO public WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON forum_comments FOR UPDATE TO public USING (auth.uid() = user_id);

-- forum_posts
DROP POLICY IF EXISTS "Admins can manage forum posts" ON forum_posts;
DROP POLICY IF EXISTS "Anyone can read forum posts" ON forum_posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON forum_posts;
DROP POLICY IF EXISTS "Users can update own posts" ON forum_posts;
CREATE POLICY "Admins can manage forum posts" ON forum_posts FOR ALL TO public USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Anyone can read forum posts" ON forum_posts FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can create posts" ON forum_posts FOR INSERT TO public WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON forum_posts FOR UPDATE TO public USING (auth.uid() = user_id);

-- identity_documents
DROP POLICY IF EXISTS "Admins can manage documents" ON identity_documents;
DROP POLICY IF EXISTS "Users can upload documents" ON identity_documents;
DROP POLICY IF EXISTS "Users can view own documents" ON identity_documents;
CREATE POLICY "Admins can manage documents" ON identity_documents FOR ALL TO public USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Users can upload documents" ON identity_documents FOR INSERT TO public WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own documents" ON identity_documents FOR SELECT TO public USING (auth.uid() = user_id);

-- lexia_conversations
DROP POLICY IF EXISTS "Admins can view all conversations" ON lexia_conversations;
DROP POLICY IF EXISTS "Anyone can create conversations" ON lexia_conversations;
DROP POLICY IF EXISTS "Anyone can update conversations" ON lexia_conversations;
DROP POLICY IF EXISTS "Users can view own conversations" ON lexia_conversations;
CREATE POLICY "Admins can view all conversations" ON lexia_conversations FOR SELECT TO public USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Anyone can create conversations" ON lexia_conversations FOR INSERT TO public WITH CHECK (session_id IS NOT NULL OR user_id = auth.uid());
CREATE POLICY "Anyone can update conversations" ON lexia_conversations FOR UPDATE TO public USING (true);
CREATE POLICY "Users can view own conversations" ON lexia_conversations FOR SELECT TO public USING (auth.uid() = user_id);

-- lexia_messages
DROP POLICY IF EXISTS "Admins can view all messages" ON lexia_messages;
DROP POLICY IF EXISTS "Anyone can insert messages" ON lexia_messages;
DROP POLICY IF EXISTS "Users can view messages of own conversations" ON lexia_messages;
CREATE POLICY "Admins can view all messages" ON lexia_messages FOR SELECT TO public USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Anyone can insert messages" ON lexia_messages FOR INSERT TO public WITH CHECK (length(content) > 0 AND conversation_id IS NOT NULL);
CREATE POLICY "Users can view messages of own conversations" ON lexia_messages FOR SELECT TO public USING (EXISTS (SELECT 1 FROM lexia_conversations WHERE lexia_conversations.id = lexia_messages.conversation_id AND lexia_conversations.user_id = auth.uid()));

-- notifications
DROP POLICY IF EXISTS "Admins can manage notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Admins can manage notifications" ON notifications FOR ALL TO public USING (is_admin_or_team(auth.uid()));
CREATE POLICY "System can create notifications" ON notifications FOR INSERT TO public WITH CHECK (length(title) > 0 AND length(message) > 0);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE TO public USING (auth.uid() = user_id);
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT TO public USING (auth.uid() = user_id);

-- payment_logs
DROP POLICY IF EXISTS "Admins can view payment logs" ON payment_logs;
DROP POLICY IF EXISTS "System can insert payment logs" ON payment_logs;
CREATE POLICY "Admins can view payment logs" ON payment_logs FOR SELECT TO public USING (is_admin_or_team(auth.uid()));
CREATE POLICY "System can insert payment logs" ON payment_logs FOR INSERT TO public WITH CHECK (length(event) > 0);

-- payments
DROP POLICY IF EXISTS "Admins can manage payments" ON payments;
DROP POLICY IF EXISTS "Users can create payments" ON payments;
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
CREATE POLICY "Admins can manage payments" ON payments FOR ALL TO public USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Users can create payments" ON payments FOR INSERT TO public WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own payments" ON payments FOR SELECT TO public USING (auth.uid() = user_id);

-- profiles
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Admins can update any profile" ON profiles FOR UPDATE TO public USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT TO public USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT TO public WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO public USING (auth.uid() = user_id);
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT TO public USING (auth.uid() = user_id);

-- referral_withdrawals
DROP POLICY IF EXISTS "Admins can manage withdrawals" ON referral_withdrawals;
DROP POLICY IF EXISTS "Users can create withdrawals" ON referral_withdrawals;
DROP POLICY IF EXISTS "Users can view own withdrawals" ON referral_withdrawals;
CREATE POLICY "Admins can manage withdrawals" ON referral_withdrawals FOR ALL TO public USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Users can create withdrawals" ON referral_withdrawals FOR INSERT TO public WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own withdrawals" ON referral_withdrawals FOR SELECT TO public USING (auth.uid() = user_id);

-- request_documents_exchange
DROP POLICY IF EXISTS "Admins can manage doc exchanges" ON request_documents_exchange;
DROP POLICY IF EXISTS "Users can upload docs" ON request_documents_exchange;
DROP POLICY IF EXISTS "Users can view own doc exchanges" ON request_documents_exchange;
CREATE POLICY "Admins can manage doc exchanges" ON request_documents_exchange FOR ALL TO public USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Users can upload docs" ON request_documents_exchange FOR INSERT TO authenticated WITH CHECK (auth.uid() = uploaded_by);
CREATE POLICY "Users can view own doc exchanges" ON request_documents_exchange FOR SELECT TO authenticated USING (auth.uid() = uploaded_by OR (request_type = 'company' AND EXISTS (SELECT 1 FROM company_requests cr WHERE cr.id = request_documents_exchange.request_id AND cr.user_id = auth.uid())) OR (request_type = 'service' AND EXISTS (SELECT 1 FROM service_requests sr WHERE sr.id = request_documents_exchange.request_id AND sr.user_id = auth.uid())));

-- request_messages
DROP POLICY IF EXISTS "Admins can manage all messages" ON request_messages;
DROP POLICY IF EXISTS "Users can send messages" ON request_messages;
DROP POLICY IF EXISTS "Users can update own messages" ON request_messages;
DROP POLICY IF EXISTS "Users can view messages of own requests" ON request_messages;
CREATE POLICY "Admins can manage all messages" ON request_messages FOR ALL TO public USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Users can send messages" ON request_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update own messages" ON request_messages FOR UPDATE TO authenticated USING (auth.uid() = sender_id OR is_admin_or_team(auth.uid()));
CREATE POLICY "Users can view messages of own requests" ON request_messages FOR SELECT TO authenticated USING (auth.uid() = sender_id OR (request_type = 'company' AND EXISTS (SELECT 1 FROM company_requests cr WHERE cr.id = request_messages.request_id AND cr.user_id = auth.uid())) OR (request_type = 'service' AND EXISTS (SELECT 1 FROM service_requests sr WHERE sr.id = request_messages.request_id AND sr.user_id = auth.uid())));

-- service_requests
DROP POLICY IF EXISTS "Admins can manage service requests" ON service_requests;
DROP POLICY IF EXISTS "Users can create service requests" ON service_requests;
DROP POLICY IF EXISTS "Users can view own service requests" ON service_requests;
CREATE POLICY "Admins can manage service requests" ON service_requests FOR ALL TO public USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Users can create service requests" ON service_requests FOR INSERT TO public WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own service requests" ON service_requests FOR SELECT TO public USING (auth.uid() = user_id);

-- site_settings
DROP POLICY IF EXISTS "Admins can manage site settings" ON site_settings;
DROP POLICY IF EXISTS "Anyone can read site settings" ON site_settings;
CREATE POLICY "Admins can manage site settings" ON site_settings FOR ALL TO public USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Anyone can read site settings" ON site_settings FOR SELECT TO public USING (true);

-- support_tickets
DROP POLICY IF EXISTS "Admins can manage tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can create tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can view own tickets" ON support_tickets;
CREATE POLICY "Admins can manage tickets" ON support_tickets FOR ALL TO public USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Users can create tickets" ON support_tickets FOR INSERT TO public WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own tickets" ON support_tickets FOR SELECT TO public USING (auth.uid() = user_id);

-- testimonials
DROP POLICY IF EXISTS "Admins can manage testimonials" ON testimonials;
DROP POLICY IF EXISTS "Anyone can submit testimonials" ON testimonials;
DROP POLICY IF EXISTS "Anyone can view approved testimonials" ON testimonials;
CREATE POLICY "Admins can manage testimonials" ON testimonials FOR ALL TO public USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Anyone can submit testimonials" ON testimonials FOR INSERT TO public WITH CHECK (length(name) > 0 AND length(message) > 0);
CREATE POLICY "Anyone can view approved testimonials" ON testimonials FOR SELECT TO public USING (is_approved = true);

-- user_roles
DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;
DROP POLICY IF EXISTS "Users can insert own client role" ON user_roles;
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
CREATE POLICY "Admins can manage roles" ON user_roles FOR ALL TO public USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own client role" ON user_roles FOR INSERT TO public WITH CHECK (auth.uid() = user_id AND role = 'client');
CREATE POLICY "Users can view own role" ON user_roles FOR SELECT TO public USING (auth.uid() = user_id);

-- whatsapp_logs
DROP POLICY IF EXISTS "Admins can manage whatsapp logs" ON whatsapp_logs;
DROP POLICY IF EXISTS "Authenticated users can insert whatsapp logs" ON whatsapp_logs;
CREATE POLICY "Admins can manage whatsapp logs" ON whatsapp_logs FOR ALL TO public USING (is_admin_or_team(auth.uid()));
CREATE POLICY "Authenticated users can insert whatsapp logs" ON whatsapp_logs FOR INSERT TO public WITH CHECK (auth.uid() IS NOT NULL);