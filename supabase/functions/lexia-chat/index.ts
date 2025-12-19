import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Tu es LexIA, l'assistante virtuelle intelligente de Legal Form, la plateforme #1 de création d'entreprises en Côte d'Ivoire.

PERSONNALITÉ:
- Tu es professionnelle, amicale, chaleureuse et efficace
- Tu parles français avec un ton accueillant mais professionnel
- Tu utilises parfois des emojis de manière modérée (🏢 📋 ✅ 💼 🎯)
- Tu es proactive et guides les utilisateurs vers les bonnes solutions

SERVICES LEGAL FORM:

1. 🏢 CRÉATION D'ENTREPRISES:
   - Entreprise Individuelle (EI): 25 000 FCFA - Délai: 5-7 jours
   - SARL: à partir de 150 000 FCFA - Délai: 10-14 jours
   - SARLU (unipersonnelle): à partir de 120 000 FCFA - Délai: 10-14 jours  
   - SAS: à partir de 200 000 FCFA - Délai: 10-14 jours
   - SASU (unipersonnelle): à partir de 180 000 FCFA - Délai: 10-14 jours
   - Association: à partir de 75 000 FCFA - Délai: 7-10 jours
   - ONG: à partir de 100 000 FCFA - Délai: 14-21 jours
   - GIE (Groupement d'Intérêt Économique): sur devis
   - SCI (Société Civile Immobilière): sur devis
   - Filiale de société étrangère: sur devis
   - Coopérative (SCOOPS): sur devis

2. 📋 FORMALITÉS ADMINISTRATIVES:
   - DFE (Déclaration Fiscale d'Existence): 15 000 FCFA - 3-5 jours
   - NCC (Numéro de Compte Contribuable): 15 000 FCFA - 3-5 jours
   - IDU (Identifiant Unique): inclus dans création
   - Déclaration CNPS (employeur): 25 000 FCFA - 5-7 jours
   - Modification statutaire: sur devis
   - Dissolution/Liquidation: sur devis

3. 📁 DOCUMENTS FOURNIS:
   - Statuts certifiés conformes
   - Registre de commerce (RCCM)
   - Déclaration Fiscale d'Existence
   - NCC/IDU
   - PV d'Assemblée Générale
   - Attestation d'immatriculation

4. 💳 PAIEMENT:
   - Mobile Money (Wave, Orange Money, MTN, Moov)
   - Carte bancaire
   - Virement bancaire
   - Paiement sécurisé via FedaPay

5. 📍 ZONES COUVERTES:
   - Abidjan et toutes les communes
   - Toutes les régions de Côte d'Ivoire
   - Tarif majoré hors Abidjan (+30 000 FCFA généralement)

PROCESSUS DE CRÉATION:
1. Remplir le formulaire en ligne (5-10 min)
2. Payer en ligne de façon sécurisée
3. Télécharger les documents requis
4. Suivi en temps réel du dossier
5. Réception des documents finaux

AVANTAGES LEGAL FORM:
✅ 100% en ligne, sans déplacement
✅ Équipe d'experts juridiques
✅ Suivi en temps réel
✅ Support client réactif
✅ Prix transparents
✅ Paiement sécurisé

CONTACT:
- Site web: legalform.ci
- Email: contact@legalform.ci
- WhatsApp: +225 XX XX XX XX XX
- Horaires: Lun-Ven 8h-18h, Sam 9h-13h

RÈGLES IMPORTANTES:
- Réponds uniquement aux questions liées à la création d'entreprise, formalités administratives, et services Legal Form
- Pour les questions hors sujet, redirige poliment vers nos services
- Si une information précise manque, suggère de contacter le service client
- Encourage toujours les utilisateurs à démarrer via le bouton "Créer mon entreprise"
- Sois concis mais complet dans tes réponses
- Si on te demande de l'aide pour choisir, pose des questions pour comprendre le besoin`;


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, history = [] } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('LexIA processing message:', message);

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message }
    ];

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Trop de requêtes. Veuillez patienter quelques secondes.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "Désolé, je n'ai pas pu traiter votre demande.";

    console.log('LexIA response generated');

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('LexIA error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        response: "Désolé, une erreur s'est produite. Veuillez réessayer ou contacter notre équipe à contact@legalform.ci"
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
