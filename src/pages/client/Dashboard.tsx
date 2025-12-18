import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DashboardWelcome from "@/components/DashboardWelcome";
import { LogOut, Plus, FileText, Building2, Clock } from "lucide-react";

interface Request {
  id: string;
  tracking_number: string | null;
  status: string;
  created_at: string;
  estimated_price: number | null;
  payment_status?: string | null;
  company_name: string | null;
  structure_type?: string;
  region?: string;
  service_type?: string;
  type: 'company' | 'service';
}

const ClientDashboard = () => {
  const { t } = useTranslation();
  const { user, userRole, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/auth");
      } else if (userRole === 'admin') {
        navigate("/admin/dashboard");
      }
    }
  }, [user, userRole, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      const { data: companyData, error: companyError } = await supabase
        .from('company_requests')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (companyError) throw companyError;

      const { data: serviceData, error: serviceError } = await supabase
        .from('service_requests')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (serviceError) throw serviceError;

      const companyRequests = (companyData || []).map(r => ({ ...r, type: 'company' as const }));
      const serviceRequests = (serviceData || []).map(r => ({ ...r, type: 'service' as const }));
      
      const allRequests = [...companyRequests, ...serviceRequests].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setRequests(allRequests);
    } catch (error: any) {
      console.error('Error fetching requests:', error);
      toast({
        title: t('dashboard.error', 'Erreur'),
        description: t('dashboard.errorLoading', 'Impossible de charger vos demandes'),
        variant: "destructive",
      });
    } finally {
      setLoadingRequests(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'in_progress': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'pending_quote': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return t('status.pending', 'En attente');
      case 'in_progress': return t('status.inProgress', 'En cours');
      case 'completed': return t('status.completed', 'Terminé');
      case 'rejected': return t('status.rejected', 'Rejeté');
      case 'pending_quote': return t('status.pendingQuote', 'Devis en attente');
      default: return status;
    }
  };

  if (loading || loadingRequests) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('dashboard.loading', 'Chargement...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          {/* Welcome Banner */}
          {user && <DashboardWelcome userId={user.id} />}
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-8 mb-8">
            <div>
              <h1 className="font-heading font-bold text-3xl sm:text-4xl text-foreground mb-2">
                {t('dashboard.title', 'Mon Espace Client')}
              </h1>
              <p className="text-muted-foreground">
                {t('dashboard.subtitle', 'Suivez l\'avancement de vos dossiers')}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => navigate("/create")} className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                {t('dashboard.newRequest', 'Nouvelle demande')}
              </Button>
              <Button variant="outline" onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                {t('dashboard.logout', 'Déconnexion')}
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card className="border-2">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{requests.length}</p>
                  <p className="text-sm text-muted-foreground">{t('dashboard.totalRequests', 'Demandes totales')}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-yellow-500/10">
                  <Clock className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {requests.filter(r => r.status === 'pending' || r.status === 'in_progress').length}
                  </p>
                  <p className="text-sm text-muted-foreground">{t('dashboard.inProgress', 'En cours')}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <Building2 className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {requests.filter(r => r.status === 'completed').length}
                  </p>
                  <p className="text-sm text-muted-foreground">{t('dashboard.completed', 'Terminées')}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {requests.length === 0 ? (
            <Card className="border-2">
              <CardContent className="pt-6 text-center py-12">
                <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4 text-lg">
                  {t('dashboard.noRequests', 'Vous n\'avez pas encore de demande en cours')}
                </p>
                <Button onClick={() => navigate("/create")} size="lg">
                  {t('dashboard.createFirst', 'Créer ma première entreprise')}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {requests.map((request) => (
                <Card 
                  key={request.id} 
                  className="border-2 hover:border-primary hover:shadow-lg transition-all cursor-pointer" 
                  onClick={() => navigate(`/request/${request.id}?type=${request.type}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                      <div>
                        <CardTitle className="text-lg">
                          {request.type === 'company' 
                            ? (request.company_name || t('dashboard.companyCreation', 'Création d\'entreprise')) 
                            : `Service ${request.service_type}`
                          }
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {t('dashboard.trackingNumber', 'N° de suivi')}: <span className="font-semibold text-foreground">{request.tracking_number || request.id.slice(0, 8)}</span>
                        </CardDescription>
                      </div>
                      <Badge className={`${getStatusColor(request.status)} text-white`}>
                        {getStatusLabel(request.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">{t('dashboard.type', 'Type')}</p>
                        <p className="font-medium text-sm">
                          {request.type === 'company' 
                            ? request.structure_type?.toUpperCase() 
                            : request.service_type
                          }
                        </p>
                      </div>
                      {request.region && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">{t('dashboard.region', 'Région')}</p>
                          <p className="font-medium text-sm">{request.region}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">{t('dashboard.date', 'Date')}</p>
                        <p className="font-medium text-sm">
                          {new Date(request.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      {request.estimated_price && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">{t('dashboard.price', 'Tarif')}</p>
                          <p className="font-medium text-sm text-primary">{request.estimated_price?.toLocaleString()} FCFA</p>
                        </div>
                      )}
                    </div>
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/request/${request.id}?type=${request.type}`);
                      }}
                      className="w-full"
                      variant="outline"
                    >
                      {t('dashboard.viewDetails', 'Voir les détails et messagerie')}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ClientDashboard;