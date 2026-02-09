-- Create FAQ table for dynamic FAQ management
CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id TEXT NOT NULL DEFAULT 'general',
  category_name TEXT NOT NULL DEFAULT 'Général',
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active FAQs" ON public.faqs;
DROP POLICY IF EXISTS "Admins can manage FAQs" ON public.faqs;

-- Public read for active FAQs
CREATE POLICY "Anyone can view active FAQs"
ON public.faqs
FOR SELECT
USING (is_active = true);

-- Admin full access
CREATE POLICY "Admins can manage FAQs"
ON public.faqs
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Create updated_at trigger if not exists
DROP TRIGGER IF EXISTS update_faqs_updated_at ON public.faqs;
CREATE TRIGGER update_faqs_updated_at
BEFORE UPDATE ON public.faqs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default FAQs if table is empty
INSERT INTO public.faqs (category_id, category_name, question, answer, sort_order) 
SELECT * FROM (VALUES
  ('company-creation', 'Création d''entreprise', 'Quels types d''entreprises pouvez-vous créer ?', 'Nous accompagnons la création de SARL, SARLU, et d''autres formes juridiques adaptées au droit ivoirien. Nos experts vous guident dans le choix de la structure la plus appropriée à votre projet.', 1),
  ('company-creation', 'Création d''entreprise', 'Combien de temps faut-il pour créer une entreprise ?', 'Le délai moyen est de 48 à 72 heures une fois le dossier complet. Ce délai inclut l''immatriculation au RCCM, l''obtention du NIF et l''enregistrement fiscal.', 2),
  ('company-creation', 'Création d''entreprise', 'Quels documents sont nécessaires ?', 'Vous aurez besoin d''une pièce d''identité valide (CNI ou passeport), un justificatif de domicile, et les informations sur l''activité de l''entreprise.', 3),
  ('payment', 'Paiement & Tarifs', 'Quels modes de paiement acceptez-vous ?', 'Nous acceptons les paiements par Mobile Money (MTN, Orange, Moov), les cartes bancaires (Visa, Mastercard). Tous les paiements sont sécurisés via KkiaPay.', 1),
  ('payment', 'Paiement & Tarifs', 'Quels sont vos tarifs ?', 'Nos tarifs varient selon le type de prestation : création d''entreprise à partir de 150 000 FCFA à Abidjan. Consultez notre page tarifs pour les détails complets.', 2),
  ('process', 'Processus & Suivi', 'Comment suivre l''avancement de mon dossier ?', 'Vous pouvez suivre votre dossier en temps réel depuis votre espace client ou via la page "Suivre mon dossier" avec votre numéro de téléphone.', 1),
  ('documents', 'Documents & Livrables', 'Quels documents vais-je recevoir ?', 'Vous recevrez les statuts certifiés, le registre de commerce (RCCM), l''attestation d''immatriculation fiscale, le NIF, et tous les documents nécessaires.', 1),
  ('services', 'Services Additionnels', 'Proposez-vous d''autres services ?', 'Oui ! Nous proposons la déclaration fiscale d''existence (DFE), le renouvellement CNPS, l''attestation de non-condamnation (NCC), la domiciliation d''entreprise.', 1)
) AS v(category_id, category_name, question, answer, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.faqs LIMIT 1);