import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Tu es LexIA, l'assistante virtuelle intelligente de Legal Form, une plateforme de création d'entreprises en Côte d'Ivoire.

PERSONNALITÉ:
- Tu es professionnelle, amicale et efficace
- Tu parles français avec un ton chaleureux mais professionnel
- Tu utilises parfois des emojis de manière modérée (🏢 📋 ✅ 💼)

DOMAINES D'EXPERTISE:
1. Création d'entreprises en Côte d'Ivoire:
   - Entreprise Individuelle (EI)
   - SARL / SARLU
   - SAS / SASU
   - Associations et ONG
   - SCI, GIE

2. Formalités administratives:
   - DFE (Déclaration Fiscale d'Existence)
   - NCC (Numéro de Compte Contribuable)
   - CNPS (Déclaration employeur)
   - IDU (Identifiant Unique)

3. Tarifs Legal Form:
   - Entreprise Individuelle: 25 000 FCFA
   - SARL/SARLU: à partir de 150 000 FCFA
   - SAS/SASU: à partir de 200 000 FCFA
   - Association: à partir de 75 000 FCFA

4. Délais:
   - Création d'entreprise: 7-14 jours ouvrés
   - DFE/NCC: 3-5 jours ouvrés

RÈGLES:
- Réponds uniquement aux questions liées à la création d'entreprise, aux formalités administratives, et aux services de Legal Form
- Pour les questions hors sujet, redirige poliment vers le sujet principal
- Si tu ne connais pas une information spécifique, suggère de contacter le service client
- Encourage les utilisateurs à démarrer leur projet via la plateforme

CONTACT:
- Site: legalform.ci
- Email: contact@legalform.ci
- Pour démarrer: Propose d'utiliser le formulaire de création sur la plateforme`;

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
