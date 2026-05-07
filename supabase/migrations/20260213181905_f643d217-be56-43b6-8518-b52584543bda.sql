
-- Final batch of missing columns

-- identity_documents
ALTER TABLE public.identity_documents ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;
ALTER TABLE public.identity_documents ADD COLUMN IF NOT EXISTS verified_by UUID;

-- lexia_conversations
ALTER TABLE public.lexia_conversations ADD COLUMN IF NOT EXISTS visitor_name TEXT;
ALTER TABLE public.lexia_conversations ADD COLUMN IF NOT EXISTS visitor_email TEXT;
ALTER TABLE public.lexia_conversations ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.lexia_conversations ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ;
ALTER TABLE public.lexia_conversations ADD COLUMN IF NOT EXISTS message_count INTEGER DEFAULT 0;
ALTER TABLE public.lexia_conversations ADD COLUMN IF NOT EXISTS satisfaction_rating INTEGER;

-- referral_withdrawals
ALTER TABLE public.referral_withdrawals ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- service_requests
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS company_name TEXT;
