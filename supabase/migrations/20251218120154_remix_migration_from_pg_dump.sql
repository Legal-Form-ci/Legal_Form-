CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    excerpt text,
    content text NOT NULL,
    cover_image text,
    author_id uuid,
    author_name text,
    category text,
    tags text[],
    is_published boolean DEFAULT false,
    published_at timestamp with time zone,
    views_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: company_associates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_associates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_request_id uuid NOT NULL,
    full_name text NOT NULL,
    phone text,
    email text,
    residence_address text,
    profession text,
    marital_status text,
    marital_regime text,
    shares_count integer,
    shares_percentage numeric(5,2),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: company_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    structure_type text NOT NULL,
    company_name text NOT NULL,
    sigle text,
    capital text,
    activity text,
    bank text,
    region text,
    city text,
    address text,
    bp text,
    contact_name text NOT NULL,
    phone text NOT NULL,
    email text NOT NULL,
    manager_mandate_duration text,
    manager_residence text,
    manager_marital_status text,
    manager_marital_regime text,
    additional_services text[],
    estimated_price integer,
    status text DEFAULT 'pending'::text NOT NULL,
    payment_id text,
    payment_status text,
    client_rating integer,
    client_review text,
    closed_at timestamp with time zone,
    closed_by text,
    assigned_to uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT company_requests_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'payment_pending'::text, 'paid'::text, 'in_progress'::text, 'documents_ready'::text, 'completed'::text, 'cancelled'::text, 'closed'::text])))
);


--
-- Name: contact_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    subject text,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    replied_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: created_companies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.created_companies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    region text NOT NULL,
    district text,
    founder_name text,
    founder_photo_url text,
    logo_url text,
    testimonial text,
    rating integer,
    is_featured boolean DEFAULT false,
    is_visible boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT created_companies_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: ebook_downloads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ebook_downloads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ebook_id uuid NOT NULL,
    user_email text NOT NULL,
    user_name text,
    downloaded_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ebooks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ebooks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    cover_image text,
    file_url text NOT NULL,
    category text,
    is_free boolean DEFAULT true,
    price integer,
    download_count integer DEFAULT 0,
    is_published boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: identity_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.identity_documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    request_id uuid NOT NULL,
    request_type text NOT NULL,
    user_id uuid NOT NULL,
    document_type text NOT NULL,
    front_url text NOT NULL,
    back_url text,
    face_detected boolean DEFAULT false,
    verified boolean DEFAULT false,
    verified_by uuid,
    verified_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT identity_documents_request_type_check CHECK ((request_type = ANY (ARRAY['company'::text, 'service'::text])))
);


--
-- Name: lexia_conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lexia_conversations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id text NOT NULL,
    user_id uuid,
    visitor_name text,
    visitor_email text,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    ended_at timestamp with time zone,
    summary text,
    satisfaction_rating integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT lexia_conversations_satisfaction_rating_check CHECK (((satisfaction_rating >= 1) AND (satisfaction_rating <= 5)))
);


--
-- Name: lexia_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lexia_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    conversation_id uuid NOT NULL,
    role text NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT lexia_messages_role_check CHECK ((role = ANY (ARRAY['user'::text, 'assistant'::text])))
);


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    request_id uuid,
    request_type text,
    transaction_id text,
    amount integer NOT NULL,
    currency text DEFAULT 'XOF'::text,
    status text DEFAULT 'pending'::text NOT NULL,
    payment_method text,
    customer_email text,
    customer_name text,
    customer_phone text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT payments_request_type_check CHECK ((request_type = ANY (ARRAY['company'::text, 'service'::text]))),
    CONSTRAINT payments_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'declined'::text, 'cancelled'::text, 'refunded'::text])))
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    full_name text,
    phone text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: request_documents_exchange; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.request_documents_exchange (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    request_id uuid NOT NULL,
    request_type text NOT NULL,
    sender_id uuid NOT NULL,
    sender_role text NOT NULL,
    document_name text NOT NULL,
    document_url text NOT NULL,
    document_type text,
    message text,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT request_documents_exchange_request_type_check CHECK ((request_type = ANY (ARRAY['company'::text, 'service'::text])))
);


--
-- Name: request_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.request_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    request_id uuid NOT NULL,
    request_type text NOT NULL,
    sender_id uuid NOT NULL,
    sender_role text NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT request_messages_request_type_check CHECK ((request_type = ANY (ARRAY['company'::text, 'service'::text])))
);


--
-- Name: service_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    service_type text NOT NULL,
    service_category text,
    company_name text,
    description text,
    documents jsonb,
    status text DEFAULT 'pending'::text NOT NULL,
    estimated_price integer,
    payment_id text,
    payment_status text,
    client_rating integer,
    client_review text,
    closed_at timestamp with time zone,
    closed_by text,
    assigned_to uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT service_requests_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'payment_pending'::text, 'paid'::text, 'in_progress'::text, 'completed'::text, 'cancelled'::text, 'closed'::text])))
);


--
-- Name: support_tickets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.support_tickets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    subject text NOT NULL,
    description text NOT NULL,
    category text,
    priority text DEFAULT 'medium'::text,
    status text DEFAULT 'open'::text,
    assigned_to uuid,
    resolved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT support_tickets_priority_check CHECK ((priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'urgent'::text]))),
    CONSTRAINT support_tickets_status_check CHECK ((status = ANY (ARRAY['open'::text, 'in_progress'::text, 'resolved'::text, 'closed'::text])))
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role text DEFAULT 'client'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT user_roles_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'team'::text, 'client'::text])))
);


--
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);


--
-- Name: blog_posts blog_posts_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_slug_key UNIQUE (slug);


--
-- Name: company_associates company_associates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_associates
    ADD CONSTRAINT company_associates_pkey PRIMARY KEY (id);


--
-- Name: company_requests company_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_requests
    ADD CONSTRAINT company_requests_pkey PRIMARY KEY (id);


--
-- Name: contact_messages contact_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_messages
    ADD CONSTRAINT contact_messages_pkey PRIMARY KEY (id);


--
-- Name: created_companies created_companies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.created_companies
    ADD CONSTRAINT created_companies_pkey PRIMARY KEY (id);


--
-- Name: ebook_downloads ebook_downloads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ebook_downloads
    ADD CONSTRAINT ebook_downloads_pkey PRIMARY KEY (id);


--
-- Name: ebooks ebooks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ebooks
    ADD CONSTRAINT ebooks_pkey PRIMARY KEY (id);


--
-- Name: identity_documents identity_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.identity_documents
    ADD CONSTRAINT identity_documents_pkey PRIMARY KEY (id);


--
-- Name: lexia_conversations lexia_conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lexia_conversations
    ADD CONSTRAINT lexia_conversations_pkey PRIMARY KEY (id);


--
-- Name: lexia_messages lexia_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lexia_messages
    ADD CONSTRAINT lexia_messages_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);


--
-- Name: request_documents_exchange request_documents_exchange_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.request_documents_exchange
    ADD CONSTRAINT request_documents_exchange_pkey PRIMARY KEY (id);


--
-- Name: request_messages request_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.request_messages
    ADD CONSTRAINT request_messages_pkey PRIMARY KEY (id);


--
-- Name: service_requests service_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_requests
    ADD CONSTRAINT service_requests_pkey PRIMARY KEY (id);


--
-- Name: support_tickets support_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_key UNIQUE (user_id);


--
-- Name: blog_posts update_blog_posts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: company_requests update_company_requests_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_company_requests_updated_at BEFORE UPDATE ON public.company_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: payments update_payments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: service_requests update_service_requests_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_service_requests_updated_at BEFORE UPDATE ON public.service_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: support_tickets update_support_tickets_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_roles update_user_roles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: blog_posts blog_posts_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES auth.users(id);


--
-- Name: company_associates company_associates_company_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_associates
    ADD CONSTRAINT company_associates_company_request_id_fkey FOREIGN KEY (company_request_id) REFERENCES public.company_requests(id) ON DELETE CASCADE;


--
-- Name: company_requests company_requests_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_requests
    ADD CONSTRAINT company_requests_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES auth.users(id);


--
-- Name: company_requests company_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_requests
    ADD CONSTRAINT company_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: ebook_downloads ebook_downloads_ebook_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ebook_downloads
    ADD CONSTRAINT ebook_downloads_ebook_id_fkey FOREIGN KEY (ebook_id) REFERENCES public.ebooks(id) ON DELETE CASCADE;


--
-- Name: identity_documents identity_documents_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.identity_documents
    ADD CONSTRAINT identity_documents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: identity_documents identity_documents_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.identity_documents
    ADD CONSTRAINT identity_documents_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES auth.users(id);


--
-- Name: lexia_conversations lexia_conversations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lexia_conversations
    ADD CONSTRAINT lexia_conversations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: lexia_messages lexia_messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lexia_messages
    ADD CONSTRAINT lexia_messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.lexia_conversations(id) ON DELETE CASCADE;


--
-- Name: payments payments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: request_documents_exchange request_documents_exchange_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.request_documents_exchange
    ADD CONSTRAINT request_documents_exchange_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES auth.users(id);


--
-- Name: request_messages request_messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.request_messages
    ADD CONSTRAINT request_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES auth.users(id);


--
-- Name: service_requests service_requests_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_requests
    ADD CONSTRAINT service_requests_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES auth.users(id);


--
-- Name: service_requests service_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_requests
    ADD CONSTRAINT service_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: support_tickets support_tickets_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES auth.users(id);


--
-- Name: support_tickets support_tickets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: contact_messages Admins can delete contact messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete contact messages" ON public.contact_messages FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::text)))));


--
-- Name: company_requests Admins can delete requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete requests" ON public.company_requests FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::text)))));


--
-- Name: service_requests Admins can delete service requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete service requests" ON public.service_requests FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::text)))));


--
-- Name: created_companies Admins can manage companies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage companies" ON public.created_companies USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::text)))));


--
-- Name: ebooks Admins can manage ebooks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage ebooks" ON public.ebooks USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::text)))));


--
-- Name: payments Admins can manage payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage payments" ON public.payments USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::text)))));


--
-- Name: blog_posts Admins can manage posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage posts" ON public.blog_posts USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::text)))));


--
-- Name: user_roles Admins can manage roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage roles" ON public.user_roles USING ((EXISTS ( SELECT 1
   FROM public.user_roles user_roles_1
  WHERE ((user_roles_1.user_id = auth.uid()) AND (user_roles_1.role = 'admin'::text)))));


--
-- Name: identity_documents Admins can update documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update documents" ON public.identity_documents FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::text)))));


--
-- Name: profiles Admins can view all profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'team'::text]))))));


--
-- Name: user_roles Admins can view all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.user_roles user_roles_1
  WHERE ((user_roles_1.user_id = auth.uid()) AND (user_roles_1.role = 'admin'::text)))));


--
-- Name: ebook_downloads Admins can view downloads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view downloads" ON public.ebook_downloads FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::text)))));


--
-- Name: contact_messages Anyone can create contact messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can create contact messages" ON public.contact_messages FOR INSERT WITH CHECK (true);


--
-- Name: lexia_conversations Anyone can create conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can create conversations" ON public.lexia_conversations FOR INSERT WITH CHECK (true);


--
-- Name: lexia_messages Anyone can create messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can create messages" ON public.lexia_messages FOR INSERT WITH CHECK (true);


--
-- Name: ebook_downloads Anyone can log downloads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can log downloads" ON public.ebook_downloads FOR INSERT WITH CHECK (true);


--
-- Name: ebooks Anyone can view published ebooks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view published ebooks" ON public.ebooks FOR SELECT USING ((is_published = true));


--
-- Name: blog_posts Anyone can view published posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view published posts" ON public.blog_posts FOR SELECT USING ((is_published = true));


--
-- Name: created_companies Anyone can view visible companies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view visible companies" ON public.created_companies FOR SELECT USING ((is_visible = true));


--
-- Name: company_requests Team can update all requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Team can update all requests" ON public.company_requests FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'team'::text]))))));


--
-- Name: lexia_conversations Team can update conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Team can update conversations" ON public.lexia_conversations FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'team'::text]))))));


--
-- Name: service_requests Team can update service requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Team can update service requests" ON public.service_requests FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'team'::text]))))));


--
-- Name: support_tickets Team can update tickets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Team can update tickets" ON public.support_tickets FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'team'::text]))))));


--
-- Name: company_associates Team can view all associates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Team can view all associates" ON public.company_associates FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'team'::text]))))));


--
-- Name: created_companies Team can view all companies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Team can view all companies" ON public.created_companies FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'team'::text]))))));


--
-- Name: identity_documents Team can view all documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Team can view all documents" ON public.identity_documents FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'team'::text]))))));


--
-- Name: payments Team can view all payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Team can view all payments" ON public.payments FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'team'::text]))))));


--
-- Name: blog_posts Team can view all posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Team can view all posts" ON public.blog_posts FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'team'::text]))))));


--
-- Name: company_requests Team can view all requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Team can view all requests" ON public.company_requests FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'team'::text]))))));


--
-- Name: service_requests Team can view all service requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Team can view all service requests" ON public.service_requests FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'team'::text]))))));


--
-- Name: support_tickets Team can view all tickets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Team can view all tickets" ON public.support_tickets FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'team'::text]))))));


--
-- Name: contact_messages Team can view contact messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Team can view contact messages" ON public.contact_messages FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'team'::text]))))));


--
-- Name: company_associates Users can create associates for their requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create associates for their requests" ON public.company_associates FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.company_requests
  WHERE ((company_requests.id = company_associates.company_request_id) AND (company_requests.user_id = auth.uid())))));


--
-- Name: request_documents_exchange Users can create documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create documents" ON public.request_documents_exchange FOR INSERT WITH CHECK ((auth.uid() = sender_id));


--
-- Name: request_messages Users can create messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create messages" ON public.request_messages FOR INSERT WITH CHECK ((auth.uid() = sender_id));


--
-- Name: service_requests Users can create service requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create service requests" ON public.service_requests FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: identity_documents Users can create their documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their documents" ON public.identity_documents FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: company_requests Users can create their own requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own requests" ON public.company_requests FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: support_tickets Users can create tickets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create tickets" ON public.support_tickets FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: company_requests Users can update their own requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own requests" ON public.company_requests FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: service_requests Users can update their own service requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own service requests" ON public.service_requests FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: company_associates Users can view associates of their requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view associates of their requests" ON public.company_associates FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.company_requests
  WHERE ((company_requests.id = company_associates.company_request_id) AND (company_requests.user_id = auth.uid())))));


--
-- Name: lexia_messages Users can view conversation messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view conversation messages" ON public.lexia_messages FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.lexia_conversations
  WHERE ((lexia_conversations.id = lexia_messages.conversation_id) AND ((lexia_conversations.user_id = auth.uid()) OR (EXISTS ( SELECT 1
           FROM public.user_roles
          WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'team'::text]))))))))));


--
-- Name: lexia_conversations Users can view their conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their conversations" ON public.lexia_conversations FOR SELECT USING (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'team'::text])))))));


--
-- Name: identity_documents Users can view their documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their documents" ON public.identity_documents FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: request_documents_exchange Users can view their documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their documents" ON public.request_documents_exchange FOR SELECT USING (((sender_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.company_requests
  WHERE ((company_requests.id = request_documents_exchange.request_id) AND (company_requests.user_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM public.service_requests
  WHERE ((service_requests.id = request_documents_exchange.request_id) AND (service_requests.user_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'team'::text])))))));


--
-- Name: request_messages Users can view their messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their messages" ON public.request_messages FOR SELECT USING (((sender_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.company_requests
  WHERE ((company_requests.id = request_messages.request_id) AND (company_requests.user_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM public.service_requests
  WHERE ((service_requests.id = request_messages.request_id) AND (service_requests.user_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'team'::text])))))));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: company_requests Users can view their own requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own requests" ON public.company_requests FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_roles Users can view their own role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own role" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: service_requests Users can view their own service requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own service requests" ON public.service_requests FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: payments Users can view their payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their payments" ON public.payments FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: support_tickets Users can view their tickets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their tickets" ON public.support_tickets FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: blog_posts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

--
-- Name: company_associates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.company_associates ENABLE ROW LEVEL SECURITY;

--
-- Name: company_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.company_requests ENABLE ROW LEVEL SECURITY;

--
-- Name: contact_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: created_companies; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.created_companies ENABLE ROW LEVEL SECURITY;

--
-- Name: ebook_downloads; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ebook_downloads ENABLE ROW LEVEL SECURITY;

--
-- Name: ebooks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ebooks ENABLE ROW LEVEL SECURITY;

--
-- Name: identity_documents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.identity_documents ENABLE ROW LEVEL SECURITY;

--
-- Name: lexia_conversations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.lexia_conversations ENABLE ROW LEVEL SECURITY;

--
-- Name: lexia_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.lexia_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: payments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: request_documents_exchange; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.request_documents_exchange ENABLE ROW LEVEL SECURITY;

--
-- Name: request_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.request_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: service_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

--
-- Name: support_tickets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


