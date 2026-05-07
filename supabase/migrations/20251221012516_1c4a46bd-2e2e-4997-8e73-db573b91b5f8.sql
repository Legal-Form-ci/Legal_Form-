-- Update remaining policies that might still have recursion issues

-- Update blog_posts policies
DROP POLICY IF EXISTS "Admins can manage posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Team can view all posts" ON public.blog_posts;

CREATE POLICY "Admins can manage posts"
ON public.blog_posts
FOR ALL
USING (public.is_admin(auth.uid()));

CREATE POLICY "Team can view all posts"
ON public.blog_posts
FOR SELECT
USING (public.is_team_member(auth.uid()));

-- Update company_associates policies
DROP POLICY IF EXISTS "Team can view all associates" ON public.company_associates;

CREATE POLICY "Team can view all associates"
ON public.company_associates
FOR SELECT
USING (public.is_team_member(auth.uid()));

-- Update contact_messages policies
DROP POLICY IF EXISTS "Team can view contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can delete contact messages" ON public.contact_messages;

CREATE POLICY "Team can view contact messages"
ON public.contact_messages
FOR SELECT
USING (public.is_team_member(auth.uid()));

CREATE POLICY "Admins can delete contact messages"
ON public.contact_messages
FOR DELETE
USING (public.is_admin(auth.uid()));

-- Update created_companies policies
DROP POLICY IF EXISTS "Admins can manage companies" ON public.created_companies;
DROP POLICY IF EXISTS "Team can view all companies" ON public.created_companies;

CREATE POLICY "Admins can manage companies"
ON public.created_companies
FOR ALL
USING (public.is_admin(auth.uid()));

CREATE POLICY "Team can view all companies"
ON public.created_companies
FOR SELECT
USING (public.is_team_member(auth.uid()));

-- Update ebook_downloads policies
DROP POLICY IF EXISTS "Admins can view downloads" ON public.ebook_downloads;

CREATE POLICY "Admins can view downloads"
ON public.ebook_downloads
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Update ebooks policies
DROP POLICY IF EXISTS "Admins can manage ebooks" ON public.ebooks;

CREATE POLICY "Admins can manage ebooks"
ON public.ebooks
FOR ALL
USING (public.is_admin(auth.uid()));

-- Update identity_documents policies
DROP POLICY IF EXISTS "Team can view all documents" ON public.identity_documents;
DROP POLICY IF EXISTS "Admins can update documents" ON public.identity_documents;

CREATE POLICY "Team can view all documents"
ON public.identity_documents
FOR SELECT
USING (public.is_team_member(auth.uid()));

CREATE POLICY "Admins can update documents"
ON public.identity_documents
FOR UPDATE
USING (public.is_admin(auth.uid()));

-- Update lexia_conversations policies
DROP POLICY IF EXISTS "Users can view their conversations" ON public.lexia_conversations;
DROP POLICY IF EXISTS "Team can update conversations" ON public.lexia_conversations;

CREATE POLICY "Users can view their conversations"
ON public.lexia_conversations
FOR SELECT
USING ((user_id = auth.uid()) OR public.is_team_member(auth.uid()));

CREATE POLICY "Team can update conversations"
ON public.lexia_conversations
FOR UPDATE
USING (public.is_team_member(auth.uid()));

-- Update lexia_messages policies
DROP POLICY IF EXISTS "Users can view conversation messages" ON public.lexia_messages;

CREATE POLICY "Users can view conversation messages"
ON public.lexia_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM lexia_conversations
    WHERE lexia_conversations.id = lexia_messages.conversation_id
    AND (lexia_conversations.user_id = auth.uid() OR public.is_team_member(auth.uid()))
  )
);

-- Update request_documents_exchange policies
DROP POLICY IF EXISTS "Users can view their documents" ON public.request_documents_exchange;

CREATE POLICY "Users can view their documents"
ON public.request_documents_exchange
FOR SELECT
USING (
  (sender_id = auth.uid()) 
  OR (EXISTS (SELECT 1 FROM company_requests WHERE company_requests.id = request_documents_exchange.request_id AND company_requests.user_id = auth.uid()))
  OR (EXISTS (SELECT 1 FROM service_requests WHERE service_requests.id = request_documents_exchange.request_id AND service_requests.user_id = auth.uid()))
  OR public.is_team_member(auth.uid())
);

-- Update request_messages policies
DROP POLICY IF EXISTS "Users can view their messages" ON public.request_messages;

CREATE POLICY "Users can view their messages"
ON public.request_messages
FOR SELECT
USING (
  (sender_id = auth.uid()) 
  OR (EXISTS (SELECT 1 FROM company_requests WHERE company_requests.id = request_messages.request_id AND company_requests.user_id = auth.uid()))
  OR (EXISTS (SELECT 1 FROM service_requests WHERE service_requests.id = request_messages.request_id AND service_requests.user_id = auth.uid()))
  OR public.is_team_member(auth.uid())
);

-- Update support_tickets policies
DROP POLICY IF EXISTS "Team can view all tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Team can update tickets" ON public.support_tickets;

CREATE POLICY "Team can view all tickets"
ON public.support_tickets
FOR SELECT
USING (public.is_team_member(auth.uid()));

CREATE POLICY "Team can update tickets"
ON public.support_tickets
FOR UPDATE
USING (public.is_team_member(auth.uid()));