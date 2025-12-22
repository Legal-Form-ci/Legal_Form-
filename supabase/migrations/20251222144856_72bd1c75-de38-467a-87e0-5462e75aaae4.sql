-- Add tracking_number to payments table for easier reference
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS tracking_number text;

-- Add indexes for better performance on payments
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_request_id ON public.payments(request_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON public.payments(transaction_id);

-- Add indexes on company_requests for payment queries
CREATE INDEX IF NOT EXISTS idx_company_requests_payment_status ON public.company_requests(payment_status);
CREATE INDEX IF NOT EXISTS idx_company_requests_user_id ON public.company_requests(user_id);

-- Add indexes on service_requests for payment queries
CREATE INDEX IF NOT EXISTS idx_service_requests_payment_status ON public.service_requests(payment_status);
CREATE INDEX IF NOT EXISTS idx_service_requests_user_id ON public.service_requests(user_id);

-- Add tracking_number to company_requests if not exists
ALTER TABLE public.company_requests
ADD COLUMN IF NOT EXISTS tracking_number text UNIQUE;

-- Add tracking_number to service_requests if not exists  
ALTER TABLE public.service_requests
ADD COLUMN IF NOT EXISTS tracking_number text UNIQUE;

-- Create function to generate tracking number
CREATE OR REPLACE FUNCTION public.generate_tracking_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prefix text;
  new_number text;
BEGIN
  IF TG_TABLE_NAME = 'company_requests' THEN
    prefix := 'LF-ENT-';
  ELSIF TG_TABLE_NAME = 'service_requests' THEN
    prefix := 'LF-SRV-';
  ELSE
    prefix := 'LF-';
  END IF;
  
  new_number := prefix || to_char(now(), 'YYYYMMDD') || '-' || substring(NEW.id::text, 1, 8);
  NEW.tracking_number := upper(new_number);
  RETURN NEW;
END;
$$;

-- Create triggers for auto-generating tracking numbers
DROP TRIGGER IF EXISTS generate_company_tracking ON public.company_requests;
CREATE TRIGGER generate_company_tracking
  BEFORE INSERT ON public.company_requests
  FOR EACH ROW
  WHEN (NEW.tracking_number IS NULL)
  EXECUTE FUNCTION public.generate_tracking_number();

DROP TRIGGER IF EXISTS generate_service_tracking ON public.service_requests;
CREATE TRIGGER generate_service_tracking
  BEFORE INSERT ON public.service_requests
  FOR EACH ROW
  WHEN (NEW.tracking_number IS NULL)
  EXECUTE FUNCTION public.generate_tracking_number();

-- Create function to sync payment status to requests
CREATE OR REPLACE FUNCTION public.sync_payment_to_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.request_type = 'company' AND NEW.request_id IS NOT NULL THEN
    UPDATE public.company_requests
    SET payment_status = NEW.status,
        payment_id = NEW.transaction_id,
        updated_at = now()
    WHERE id = NEW.request_id;
  ELSIF NEW.request_type = 'service' AND NEW.request_id IS NOT NULL THEN
    UPDATE public.service_requests
    SET payment_status = NEW.status,
        payment_id = NEW.transaction_id,
        updated_at = now()
    WHERE id = NEW.request_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to sync payment status
DROP TRIGGER IF EXISTS sync_payment_status ON public.payments;
CREATE TRIGGER sync_payment_status
  AFTER INSERT OR UPDATE OF status ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_payment_to_request();

-- Add RLS policy for service role to manage payments (for edge functions)
DROP POLICY IF EXISTS "Service role can manage payments" ON public.payments;
CREATE POLICY "Service role can manage payments"
ON public.payments
FOR ALL
USING (true)
WITH CHECK (true);

-- Allow authenticated users to create payments
DROP POLICY IF EXISTS "Users can create payments" ON public.payments;
CREATE POLICY "Users can create payments"
ON public.payments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create payment_logs table for tracking payment events
CREATE TABLE IF NOT EXISTS public.payment_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid REFERENCES public.payments(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on payment_logs
ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for payment_logs
CREATE POLICY "Team can view payment logs"
ON public.payment_logs
FOR SELECT
USING (is_team_member(auth.uid()));

CREATE POLICY "System can create payment logs"
ON public.payment_logs
FOR INSERT
WITH CHECK (true);

-- Add indexes on payment_logs
CREATE INDEX IF NOT EXISTS idx_payment_logs_payment_id ON public.payment_logs(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_event_type ON public.payment_logs(event_type);