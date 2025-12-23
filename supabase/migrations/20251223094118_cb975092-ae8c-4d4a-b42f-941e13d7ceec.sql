-- Add missing columns to service_requests table for contact info
ALTER TABLE public.service_requests 
ADD COLUMN IF NOT EXISTS contact_name TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS service_details JSONB;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_service_requests_user_id ON public.service_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON public.service_requests(status);
CREATE INDEX IF NOT EXISTS idx_company_requests_user_id ON public.company_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_company_requests_status ON public.company_requests(status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_request_id ON public.payments(request_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

-- Create trigger for tracking number on service_requests if not exists
DROP TRIGGER IF EXISTS generate_service_tracking_number ON public.service_requests;
CREATE TRIGGER generate_service_tracking_number
  BEFORE INSERT ON public.service_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_tracking_number();

-- Create trigger for tracking number on company_requests if not exists  
DROP TRIGGER IF EXISTS generate_company_tracking_number ON public.company_requests;
CREATE TRIGGER generate_company_tracking_number
  BEFORE INSERT ON public.company_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_tracking_number();

-- Sync payment trigger
DROP TRIGGER IF EXISTS sync_payment_status ON public.payments;
CREATE TRIGGER sync_payment_status
  AFTER INSERT OR UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_payment_to_request();