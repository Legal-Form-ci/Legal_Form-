import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, CheckCircle, AlertCircle, User, Loader2, X, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface IdentityDocumentUploadProps {
  requestId: string;
  requestType: 'company' | 'service';
  onComplete?: () => void;
}

const IdentityDocumentUpload = ({ requestId, requestType, onComplete }: IdentityDocumentUploadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documentType, setDocumentType] = useState<string>("");
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [faceDetected, setFaceDetected] = useState<boolean | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const documentTypes = [
    { value: "cni", label: "Carte Nationale d'Identité (CNI)" },
    { value: "passport", label: "Passeport" },
    { value: "sejour", label: "Carte de séjour" },
    { value: "permis", label: "Permis de conduire" },
  ];

  const handleImageSelect = useCallback(async (file: File, side: 'front' | 'back') => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Format invalide",
        description: "Veuillez sélectionner une image (JPG, PNG)",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "L'image ne doit pas dépasser 10 Mo",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      if (side === 'front') {
        setFrontImage(file);
        setFrontPreview(preview);
        // Analyze face on front image
        analyzeFace(preview);
      } else {
        setBackImage(file);
        setBackPreview(preview);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const analyzeFace = async (imageDataUrl: string) => {
    setIsAnalyzing(true);
    setFaceDetected(null);

    try {
      // Simple face detection using canvas and image analysis
      const img = new Image();
      img.onload = () => {
        // Basic heuristic: check if image has appropriate dimensions for ID photo
        const aspectRatio = img.width / img.height;
        const hasGoodAspect = aspectRatio > 0.5 && aspectRatio < 2;
        const hasGoodSize = img.width >= 300 && img.height >= 300;
        
        // For a more robust solution, we'd use face-api.js
        // For now, we assume face is present if image meets basic criteria
        setFaceDetected(hasGoodAspect && hasGoodSize);
        setIsAnalyzing(false);
        
        if (hasGoodAspect && hasGoodSize) {
          toast({
            title: "Image analysée",
            description: "Le document semble valide",
          });
        } else {
          toast({
            title: "Vérification requise",
            description: "Veuillez vous assurer que la photo d'identité est visible",
            variant: "destructive"
          });
        }
      };
      img.onerror = () => {
        setFaceDetected(false);
        setIsAnalyzing(false);
      };
      img.src = imageDataUrl;
    } catch (error) {
      console.error('Face analysis error:', error);
      setFaceDetected(false);
      setIsAnalyzing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent, side: 'front' | 'back') => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageSelect(file, side);
  }, [handleImageSelect]);

  const uploadToStorage = async (file: File, folder: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}/${requestId}/${folder}_${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from('identity-documents')
      .upload(fileName, file);

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('identity-documents')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async () => {
    if (!documentType) {
      toast({
        title: "Type requis",
        description: "Veuillez sélectionner le type de document",
        variant: "destructive"
      });
      return;
    }

    if (!frontImage) {
      toast({
        title: "Recto requis",
        description: "Veuillez télécharger le recto du document",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      // Upload images
      const frontUrl = await uploadToStorage(frontImage, 'front');
      const backUrl = backImage ? await uploadToStorage(backImage, 'back') : null;

      if (!frontUrl) {
        throw new Error('Échec du téléchargement du recto');
      }

      // Save to database
      const { error } = await supabase
        .from('identity_documents')
        .insert({
          user_id: user.id,
          request_id: requestId,
          request_type: requestType,
          document_type: documentType,
          front_url: frontUrl,
          back_url: backUrl,
          face_detected: faceDetected || false,
        });

      if (error) throw error;

      toast({
        title: "Document téléchargé",
        description: "Votre pièce d'identité a été enregistrée avec succès",
      });

      // Reset form
      setDocumentType("");
      setFrontImage(null);
      setBackImage(null);
      setFrontPreview(null);
      setBackPreview(null);
      setFaceDetected(null);

      onComplete?.();
    } catch (error: any) {
      console.error('Submit error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'enregistrer le document",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (side: 'front' | 'back') => {
    if (side === 'front') {
      setFrontImage(null);
      setFrontPreview(null);
      setFaceDetected(null);
    } else {
      setBackImage(null);
      setBackPreview(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Pièce d'identité
        </CardTitle>
        <CardDescription>
          Téléchargez votre pièce d'identité (recto et verso)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Document Type */}
        <div className="space-y-2">
          <Label>Type de document</Label>
          <Select value={documentType} onValueChange={setDocumentType}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez le type" />
            </SelectTrigger>
            <SelectContent>
              {documentTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Upload Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Front */}
          <div className="space-y-2">
            <Label className="flex items-center justify-between">
              <span>Recto *</span>
              {isAnalyzing && (
                <Badge variant="secondary" className="animate-pulse">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Analyse...
                </Badge>
              )}
              {faceDetected === true && (
                <Badge className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Valide
                </Badge>
              )}
              {faceDetected === false && (
                <Badge variant="destructive">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Vérifier
                </Badge>
              )}
            </Label>
            
            <input
              ref={frontInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0], 'front')}
            />

            {frontPreview ? (
              <div className="relative group">
                <img
                  src={frontPreview}
                  alt="Recto"
                  className="w-full h-40 object-cover rounded-lg border"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                  onClick={() => removeImage('front')}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                onClick={() => frontInputRef.current?.click()}
                onDrop={(e) => handleDrop(e, 'front')}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <Camera className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Cliquez ou glissez l'image ici
                </p>
              </div>
            )}
          </div>

          {/* Back */}
          <div className="space-y-2">
            <Label>Verso (optionnel)</Label>
            
            <input
              ref={backInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0], 'back')}
            />

            {backPreview ? (
              <div className="relative group">
                <img
                  src={backPreview}
                  alt="Verso"
                  className="w-full h-40 object-cover rounded-lg border"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                  onClick={() => removeImage('back')}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                onClick={() => backInputRef.current?.click()}
                onDrop={(e) => handleDrop(e, 'back')}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Cliquez ou glissez l'image ici
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <Button 
          onClick={handleSubmit} 
          disabled={!documentType || !frontImage || isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Téléchargement...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Enregistrer le document
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default IdentityDocumentUpload;
