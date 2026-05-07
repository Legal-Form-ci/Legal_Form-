-- Create referral_withdrawals table for managing withdrawal requests
CREATE TABLE IF NOT EXISTS public.referral_withdrawals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  payment_method TEXT,
  payment_details JSONB,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.referral_withdrawals ENABLE ROW LEVEL SECURITY;

-- Policies for referral_withdrawals
CREATE POLICY "Users can view their own withdrawals" ON public.referral_withdrawals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own withdrawals" ON public.referral_withdrawals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all withdrawals" ON public.referral_withdrawals
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update withdrawals" ON public.referral_withdrawals
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_referral_withdrawals_updated_at
  BEFORE UPDATE ON public.referral_withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for performance
CREATE INDEX idx_referral_withdrawals_user_id ON public.referral_withdrawals(user_id);
CREATE INDEX idx_referral_withdrawals_status ON public.referral_withdrawals(status);

-- Enable realtime for withdrawals
ALTER PUBLICATION supabase_realtime ADD TABLE public.referral_withdrawals;