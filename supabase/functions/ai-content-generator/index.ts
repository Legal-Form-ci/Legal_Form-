import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!content || content.trim().length < 20) {
      return new Response(
        JSON.stringify({ error: "Le contenu doit contenir au moins 20 caractères" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const systemPrompt = `Tu es un assistant rédactionnel expert pour Legal Form, une plateforme de création d'entreprises en Côte d'Ivoire. 
Analyse le contenu fourni et génère:
1. Un titre accrocheur et professionnel (max 80 caractères)
2. Un résumé concis (max 200 caractères)
3. Une catégorie appropriée parmi: Fiscalité, Juridique, Entrepreneuriat, Actualités, Formation, Conseils
4. Une version enrichie du contenu avec:
   - Des titres et sous-titres structurés (utilise ## et ###)
   - Des listes à puces quand pertinent
   - Du texte en gras pour les points importants
   - Une structure logique et professionnelle

Réponds UNIQUEMENT en JSON avec cette structure exacte:
{
  "title": "Le titre généré",
  "excerpt": "Le résumé court",
  "category": "La catégorie choisie",
  "formattedContent": "Le contenu enrichi en Markdown"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Voici le contenu à enrichir:\n\n${content}` },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requêtes atteinte, réessayez plus tard" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Crédits insuffisants pour l'IA" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 402 }
        );
      }
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error("Erreur du service IA");
    }

    const aiResponse = await response.json();
    const messageContent = aiResponse.choices?.[0]?.message?.content;

    if (!messageContent) {
      throw new Error("Réponse IA vide");
    }

    // Parse JSON from response
    let parsed;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = messageContent.match(/```json\s*([\s\S]*?)\s*```/) ||
                        messageContent.match(/```\s*([\s\S]*?)\s*```/) ||
                        [null, messageContent];
      parsed = JSON.parse(jsonMatch[1] || messageContent);
    } catch {
      console.error("Failed to parse AI response:", messageContent);
      // Fallback: use original content with some formatting
      parsed = {
        title: content.substring(0, 60).trim() + "...",
        excerpt: content.substring(0, 150).trim() + "...",
        category: "Actualités",
        formattedContent: content,
      };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI content generator error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erreur inconnue" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
