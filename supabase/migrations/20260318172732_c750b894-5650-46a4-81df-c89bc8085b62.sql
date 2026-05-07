
-- Add missing columns to company_requests for the Create form
ALTER TABLE public.company_requests 
ADD COLUMN IF NOT EXISTS sigle text,
ADD COLUMN IF NOT EXISTS bank text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS bp text,
ADD COLUMN IF NOT EXISTS manager_residence text,
ADD COLUMN IF NOT EXISTS manager_marital_status text,
ADD COLUMN IF NOT EXISTS manager_marital_regime text,
ADD COLUMN IF NOT EXISTS manager_mandate_duration text,
ADD COLUMN IF NOT EXISTS additional_services text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS discount_applied numeric DEFAULT 0;

-- Create storage bucket for blog/news images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('blog-images', 'blog-images', true, 20971520, ARRAY['image/jpeg','image/png','image/webp','image/gif','image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('documents', 'documents', true, 52428800, ARRAY['application/pdf','image/jpeg','image/png','image/webp','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO NOTHING;

-- Create company-logos bucket if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('company-logos', 'company-logos', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif','image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for blog-images
CREATE POLICY "Public read blog images" ON storage.objects FOR SELECT USING (bucket_id = 'blog-images');
CREATE POLICY "Admins upload blog images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'blog-images' AND auth.uid() IS NOT NULL);
CREATE POLICY "Admins update blog images" ON storage.objects FOR UPDATE USING (bucket_id = 'blog-images' AND auth.uid() IS NOT NULL);
CREATE POLICY "Admins delete blog images" ON storage.objects FOR DELETE USING (bucket_id = 'blog-images' AND auth.uid() IS NOT NULL);

-- Storage policies for documents
CREATE POLICY "Public read documents" ON storage.objects FOR SELECT USING (bucket_id = 'documents');
CREATE POLICY "Auth upload documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.uid() IS NOT NULL);
CREATE POLICY "Auth update documents" ON storage.objects FOR UPDATE USING (bucket_id = 'documents' AND auth.uid() IS NOT NULL);

-- Storage policies for company-logos
CREATE POLICY "Public read company logos" ON storage.objects FOR SELECT USING (bucket_id = 'company-logos');
CREATE POLICY "Auth upload company logos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'company-logos' AND auth.uid() IS NOT NULL);
CREATE POLICY "Auth update company logos" ON storage.objects FOR UPDATE USING (bucket_id = 'company-logos' AND auth.uid() IS NOT NULL);

-- Create page_contents table for admin-editable pages (Terms, Privacy)
CREATE TABLE IF NOT EXISTS public.page_contents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text UNIQUE NOT NULL,
  title text NOT NULL DEFAULT '',
  content jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

ALTER TABLE public.page_contents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read page contents" ON public.page_contents FOR SELECT USING (true);
CREATE POLICY "Admins can manage page contents" ON public.page_contents FOR ALL USING (is_admin(auth.uid()));

-- Insert default Terms and Privacy content
INSERT INTO public.page_contents (page_key, title, content) VALUES
('terms', 'Conditions Générales d''Utilisation', '[
  {"heading": "1. Objet", "body": "Les présentes Conditions Générales d''Utilisation (CGU) régissent l''utilisation de la plateforme Legal Form et les services de création d''entreprise proposés. En utilisant nos services, vous acceptez ces conditions dans leur intégralité."},
  {"heading": "2. Services proposés", "body": "Legal Form propose les services suivants :\n• Création d''entreprises (SARL, SARLU, SNC, etc.)\n• Création d''associations, ONG et coopératives\n• Rédaction de documents juridiques\n• Immatriculations et formalités administratives\n• Accompagnement et conseil entrepreneurial"},
  {"heading": "3. Tarifs et paiement", "body": "Une facture personnalisée et adaptée à votre demande vous sera envoyée après étude de votre dossier.\n\nLe paiement s''effectue en deux temps : 50% d''acompte à la commande, puis le solde de manière progressive durant la procédure. Les paiements sont acceptés par Mobile Money, carte bancaire et virement électronique."},
  {"heading": "4. Obligations de l''utilisateur", "body": "L''utilisateur s''engage à :\n• Fournir des informations exactes et complètes\n• Transmettre des documents authentiques et valides\n• Répondre dans les délais aux demandes d''informations complémentaires\n• Respecter les délais de paiement convenus"},
  {"heading": "5. Obligations de Legal Form", "body": "Legal Form s''engage à :\n• Traiter les dossiers avec diligence et professionnalisme\n• Informer le client de l''avancement de son dossier\n• Respecter la confidentialité des informations transmises\n• Fournir les documents et attestations dans les délais convenus"},
  {"heading": "6. Délais de traitement", "body": "Les délais de traitement varient selon le type de demande et la région. Legal Form s''efforce de traiter les dossiers dans les meilleurs délais, sous réserve de la réception de tous les documents requis et des délais des organismes officiels."},
  {"heading": "7. Responsabilité", "body": "Legal Form ne saurait être tenue responsable des retards ou refus émanant des organismes officiels, ni des conséquences résultant d''informations inexactes fournies par le client."},
  {"heading": "8. Litiges", "body": "En cas de litige, les parties s''engagent à rechercher une solution amiable. À défaut, les tribunaux d''Abidjan seront seuls compétents pour connaître du litige."},
  {"heading": "9. Contact", "body": "Pour toute question concernant ces conditions, contactez-nous à : contact@legalform.ci"}
]'::jsonb),
('privacy', 'Politique de Confidentialité', '[
  {"heading": "1. Introduction", "body": "Legal Form s''engage à protéger la vie privée de ses utilisateurs. Cette politique de confidentialité explique comment nous collectons, utilisons, stockons et protégeons vos informations personnelles lorsque vous utilisez nos services de création d''entreprise."},
  {"heading": "2. Informations collectées", "body": "Nous collectons les informations suivantes :\n• Informations d''identification : nom, prénom, adresse email, numéro de téléphone\n• Informations professionnelles : activité, type d''entreprise souhaitée\n• Documents administratifs : pièces d''identité, justificatifs de domicile\n• Informations de paiement : données de transaction (traitées de manière sécurisée)"},
  {"heading": "3. Utilisation des données", "body": "Vos données sont utilisées pour :\n• Traiter vos demandes de création d''entreprise\n• Vous contacter concernant l''avancement de vos dossiers\n• Améliorer nos services et votre expérience utilisateur\n• Respecter nos obligations légales et réglementaires"},
  {"heading": "4. Protection des données", "body": "Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos données personnelles contre tout accès non autorisé, modification, divulgation ou destruction. Vos données sont stockées sur des serveurs sécurisés."},
  {"heading": "5. Partage des données", "body": "Vos données personnelles ne sont jamais vendues à des tiers. Elles peuvent être partagées uniquement avec les organismes officiels (RCCM, CNPS, DGI) dans le cadre des procédures de création d''entreprise, et avec nos partenaires de paiement sécurisé."},
  {"heading": "6. Vos droits", "body": "Conformément à la réglementation, vous disposez des droits suivants :\n• Droit d''accès à vos données personnelles\n• Droit de rectification des données inexactes\n• Droit de suppression de vos données\n• Droit de portabilité de vos données\n• Droit d''opposition au traitement de vos données"},
  {"heading": "7. Contact", "body": "Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits, contactez-nous à : contact@legalform.ci"}
]'::jsonb)
ON CONFLICT (page_key) DO NOTHING;
