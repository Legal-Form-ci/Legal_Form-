import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { publicTrackingSchema, PublicTrackingData } from "@/lib/validations";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Search, Package, Clock, CheckCircle } from "lucide-react";

interface RequestStatus {
  id: string;
  type: string;
  tracking_number?: string;
  status: string;
  created_at: string;
  company_name?: string;
  service_type?: string;
  contact_name: string;
}

const PublicTracking = () => {
  const [phone, setPhone] = useState("");
  const [requests, setRequests] = useState<RequestStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { toast } = useToast();

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "En attente", variant: "outline" },
      in_progress: { label: "En cours", variant: "default" },
      payment_pending: { label: "En attente de paiement", variant: "secondary" },
      payment_confirmed: { label: "Paiement confirmé", variant: "default" },
      completed: { label: "Terminé", variant: "default" },
      cancelled: { label: "Annulé", variant: "destructive" }
    };
    
    const statusInfo = statusMap[status] || { label: status, variant: "outline" as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    const validation = publicTrackingSchema.safeParse({ phone });
    if (!validation.success) {
      toast({
        title: "Erreur de validation",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setSearched(false);

    try {
      // Use secure edge function with rate limiting
      const { data, error } = await supabase.functions.invoke('secure-public-tracking', {
        body: { phone }
      });

      if (error) {
        if (error.message?.includes('Too many requests')) {
          toast({
            title: "Trop de tentatives",
            description: "Vous avez effectué trop de recherches. Veuillez réessayer plus tard.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      const allRequests = data?.requests || [];
      setRequests(allRequests);
      setSearched(true);

      if (allRequests.length === 0) {
        toast({
          title: "Aucun dossier trouvé",
          description: "Aucun dossier actif n'est associé à ce numéro.",
        });
      }

    } catch (error: any) {
      console.error('Error fetching requests:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer vos dossiers. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-12">
            <Package className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="font-heading font-bold text-4xl text-foreground mb-4">
              Suivre mon dossier
            </h1>
            <p className="text-muted-foreground text-lg">
              Entrez votre numéro de téléphone pour consulter l'état de vos dossiers
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Rechercher vos dossiers</CardTitle>
              <CardDescription>
                Utilisez le numéro de téléphone que vous avez fourni lors de votre demande
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <Label htmlFor="phone">Numéro de téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+225 XX XX XX XX XX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  <Search className="mr-2 h-4 w-4" />
                  {loading ? "Recherche..." : "Rechercher mes dossiers"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {searched && requests.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-4">Vos dossiers ({requests.length})</h2>
              {requests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {request.type === 'company' ? 'Création d\'entreprise' : 'Demande de service'}
                        </CardTitle>
                        <CardDescription>
                          {request.tracking_number && (
                            <span className="font-mono">{request.tracking_number}</span>
                          )}
                        </CardDescription>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Nom du contact</p>
                        <p className="font-medium">{request.contact_name}</p>
                      </div>
                      {request.company_name && (
                        <div>
                          <p className="text-muted-foreground">Entreprise</p>
                          <p className="font-medium">{request.company_name}</p>
                        </div>
                      )}
                      {request.service_type && (
                        <div>
                          <p className="text-muted-foreground">Type de service</p>
                          <p className="font-medium">{request.service_type}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-muted-foreground">Date de création</p>
                        <p className="font-medium">
                          {new Date(request.created_at).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    {request.status === 'completed' && (
                      <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center gap-2 text-green-700 dark:text-green-300">
                        <CheckCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">Votre dossier est terminé !</span>
                      </div>
                    )}
                    
                    {request.status === 'payment_pending' && (
                      <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-center gap-2 text-orange-700 dark:text-orange-300">
                        <Clock className="h-5 w-5" />
                        <span className="text-sm font-medium">En attente de paiement</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {searched && requests.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Aucun dossier trouvé</h3>
                <p className="text-muted-foreground">
                  Aucun dossier n'est associé à ce numéro de téléphone.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PublicTracking;