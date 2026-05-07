
-- More missing columns to match existing code

-- company_requests
ALTER TABLE public.company_requests ADD COLUMN IF NOT EXISTS referrer_code TEXT;
ALTER TABLE public.company_requests ADD COLUMN IF NOT EXISTS structure_type TEXT;
ALTER TABLE public.company_requests ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.company_requests ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.company_requests ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE public.company_requests ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.company_requests ADD COLUMN IF NOT EXISTS additional_services TEXT[];
ALTER TABLE public.company_requests ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE public.company_requests ADD COLUMN IF NOT EXISTS activity TEXT;

-- company_associates
ALTER TABLE public.company_associates ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.company_associates ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.company_associates ADD COLUMN IF NOT EXISTS marital_status TEXT;
ALTER TABLE public.company_associates ADD COLUMN IF NOT EXISTS marital_regime TEXT;
ALTER TABLE public.company_associates ADD COLUMN IF NOT EXISTS residence_address TEXT;
ALTER TABLE public.company_associates ADD COLUMN IF NOT EXISTS profession TEXT;
ALTER TABLE public.company_associates ADD COLUMN IF NOT EXISTS shares_count INTEGER;
ALTER TABLE public.company_associates ADD COLUMN IF NOT EXISTS company_request_id UUID REFERENCES public.company_requests(id) ON DELETE CASCADE;

-- service_requests
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS tracking_number TEXT UNIQUE DEFAULT 'SRV-' || substr(md5(random()::text), 1, 8);
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid';
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS estimated_price NUMERIC;

-- request_documents_exchange
ALTER TABLE public.request_documents_exchange ADD COLUMN IF NOT EXISTS request_type TEXT;
ALTER TABLE public.request_documents_exchange ADD COLUMN IF NOT EXISTS sender_id UUID;
ALTER TABLE public.request_documents_exchange ADD COLUMN IF NOT EXISTS sender_role TEXT;
ALTER TABLE public.request_documents_exchange ADD COLUMN IF NOT EXISTS message TEXT;

-- request_messages
ALTER TABLE public.request_messages ADD COLUMN IF NOT EXISTS request_type TEXT;

-- identity_documents
ALTER TABLE public.identity_documents ADD COLUMN IF NOT EXISTS request_type TEXT;
ALTER TABLE public.identity_documents ADD COLUMN IF NOT EXISTS front_url TEXT;
ALTER TABLE public.identity_documents ADD COLUMN IF NOT EXISTS back_url TEXT;
ALTER TABLE public.identity_documents ADD COLUMN IF NOT EXISTS face_detected BOOLEAN DEFAULT false;

-- created_companies
ALTER TABLE public.created_companies ADD COLUMN IF NOT EXISTS show_publicly BOOLEAN DEFAULT false;
ALTER TABLE public.created_companies ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE public.created_companies ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.created_companies ADD COLUMN IF NOT EXISTS founder_photo_url TEXT;

-- referral_withdrawals
ALTER TABLE public.referral_withdrawals ADD COLUMN IF NOT EXISTS requested_at TIMESTAMPTZ DEFAULT now();
