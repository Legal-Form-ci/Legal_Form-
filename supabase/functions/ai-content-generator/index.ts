import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, mode = "article", generateImage = false } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!content || content.trim().length < 3) {
      return new Response(
        JSON.stringify({ error: "Veuillez saisir au moins quelques mots" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Step 1: Generate structured content
    const systemPrompt = `Tu es un rédacteur en chef expert pour Legal Form, plateforme #1 de création d'entreprises en Côte d'Ivoire. Tu transformes n'importe quel texte — même un seul mot ou une simple idée — en contenu professionnel, structuré et engageant.

RÈGLES ABSOLUES:
- Jamais de balisage visible (pas de **, ##, ou HTML exposé)
- Le contenu doit être naturel, humain, fluide
- Adapte le ton: informatif pour les articles, engageant pour les actualités
- Structure avec des chapitres clairs, des paragraphes aérés
- Utilise le format Markdown propre pour la mise en forme interne
- Génère TOUJOURS un contenu riche et développé, même à partir d'un mot

CAPACITÉS:
- Analyser le contexte entrepreneurial ivoirien
- Structurer en chapitres/sous-chapitres avec titres
- Créer des listes à puces pertinentes
- Insérer des tableaux comparatifs si utile
- Générer des hashtags pertinents
- Adapter la longueur selon le contenu (500 à 2000 mots)

MODE ${mode === 'social' ? 'PUBLICATION SOCIALE' : 'ARTICLE/ACTUALITÉ'}:
${mode === 'social' ? `
- Ton engageant et direct
- Phrase d'accroche percutante en première ligne
- Emojis utilisés avec parcimonie (2-4 max)
- Hashtags en fin de publication
- Question ouverte pour l'engagement si pertinent
- Style naturel comme rédigé par un humain
` : `
- Ton professionnel et informatif
- Structure en sections avec titres
- Introduction accrocheuse, développement riche, conclusion
- Points clés mis en valeur
- Sources et références si pertinent
`}

Réponds UNIQUEMENT en JSON valide:
{
  "title": "Titre accrocheur (max 100 car)",
  "excerpt": "Résumé concis (max 250 car)",
  "category": "Catégorie parmi: Fiscalité, Juridique, Entrepreneuriat, Actualités, Formation, Conseils, Financement, Innovation",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "formattedContent": "Contenu complet structuré en Markdown",
  "imagePrompt": "Description détaillée pour générer une image pertinente (en anglais, 1-2 phrases)"
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
          { role: "user", content: `Transforme ce texte en publication professionnelle:\n\n${content}` },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requêtes atteinte, réessayez dans quelques secondes" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Crédits IA insuffisants" }),
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

    let parsed;
    try {
      const jsonMatch = messageContent.match(/```json\s*([\s\S]*?)\s*```/) ||
                        messageContent.match(/```\s*([\s\S]*?)\s*```/) ||
                        [null, messageContent];
      parsed = JSON.parse(jsonMatch[1] || messageContent);
    } catch {
      console.error("Failed to parse AI response:", messageContent);
      parsed = {
        title: content.substring(0, 80).trim(),
        excerpt: content.substring(0, 200).trim(),
        category: "Actualités",
        tags: [],
        formattedContent: content,
        imagePrompt: "Professional business meeting in modern African office, Ivory Coast, corporate",
      };
    }

    // Step 2: Generate image if requested
    let generatedImage = null;
    if (generateImage && parsed.imagePrompt) {
      try {
        console.log("Generating image with prompt:", parsed.imagePrompt);
        const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image",
            messages: [
              {
                role: "user",
                content: `Generate a professional, ultra-realistic photograph for a business article. ${parsed.imagePrompt}. The image should be high quality, well-lit, modern and professional. No text, watermarks, or logos in the image.`,
              },
            ],
            modalities: ["image", "text"],
          }),
        });

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          const imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
          if (imageUrl) {
            generatedImage = imageUrl;
            console.log("Image generated successfully");
          }
        } else {
          console.error("Image generation failed:", imageResponse.status);
        }
      } catch (imgError) {
        console.error("Image generation error:", imgError);
      }
    }

    return new Response(
      JSON.stringify({
        ...parsed,
        generatedImage,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("AI content generator error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erreur inconnue" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
