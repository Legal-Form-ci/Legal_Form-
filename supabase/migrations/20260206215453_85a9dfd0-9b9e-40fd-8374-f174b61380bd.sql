-- Table pour les paramètres du site (synchronisation des prix)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Insérer les paramètres par défaut (ignorer si existe)
INSERT INTO public.site_settings (key, value) VALUES
  ('pricing', '{"abidjan": 199000, "interior": 169000, "referral_bonus": 10000}'::jsonb),
  ('contact', '{"phone": "+225 01 71 50 04 73", "whatsapp": "+225 07 09 67 79 25", "email": "contact@legalform.ci", "address": "BPM 387, Grand-Bassam, ANCIENNE CIE, Côte d''Ivoire"}'::jsonb),
  ('general', '{"site_name": "Legal Form", "site_tagline": "Créer, gérer et accompagner votre entreprise"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings
CREATE POLICY "Settings are public readable" ON public.site_settings
FOR SELECT USING (true);

-- Only admins can update settings
CREATE POLICY "Admins can update settings" ON public.site_settings
FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert settings" ON public.site_settings
FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

-- Enable realtime only on site_settings (others already added)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'site_settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.site_settings;
  END IF;
END $$;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON public.site_settings(key);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_user ON public.profiles(user_id);