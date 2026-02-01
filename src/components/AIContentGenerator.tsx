import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AIContentGeneratorProps {
  content: string;
  onGenerate: (generated: {
    title: string;
    excerpt: string;
    category: string;
    formattedContent: string;
  }) => void;
  disabled?: boolean;
}

const AIContentGenerator = ({ content, onGenerate, disabled }: AIContentGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateWithAI = async () => {
    if (!content.trim()) {
      toast({
        title: "Contenu requis",
        description: "Veuillez saisir du contenu à enrichir",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-content-generator", {
        body: { content },
      });

      if (error) throw error;

      if (data) {
        onGenerate({
          title: data.title || "",
          excerpt: data.excerpt || "",
          category: data.category || "",
          formattedContent: data.formattedContent || content,
        });

        toast({
          title: "Contenu généré",
          description: "L'IA a enrichi votre article avec succès",
        });
      }
    } catch (error: any) {
      console.error("AI generation error:", error);
      toast({
        title: "Erreur de génération",
        description: error.message || "Impossible de générer le contenu",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={generateWithAI}
      disabled={disabled || isGenerating || !content.trim()}
      className="bg-primary hover:bg-primary/90 text-primary-foreground"
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Génération IA...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Générer avec l'IA
        </>
      )}
    </Button>
  );
};

export default AIContentGenerator;
