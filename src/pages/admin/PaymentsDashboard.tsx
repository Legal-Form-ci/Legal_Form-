import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft, CreditCard, DollarSign, TrendingUp, Clock } from "lucide-react";

interface PaymentData {
  id: string;
  tracking_number: string;
  company_name: string;
  contact_name: string;
  estimated_price: number;
  status: string;
  payment_status?: string;
  created_at: string;
  email: string;
  phone: string;
  type: 'company' | 'service';
  service_type?: string;
}

const PaymentsDashboard = () => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/auth");
      } else if (userRole !== 'admin') {
        navigate("/client/dashboard");
      }
    }
  }, [user, userRole, loading, navigate]);

  useEffect(() => {
    if (user && userRole === 'admin') {
      fetchPayments();
    }
  }, [user, userRole]);

  const fetchPayments = async () => {
    try {
      // Fetch company requests
      const { data: companyData, error: companyError } = await supabase
        .from('company_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (companyError) throw companyError;

      // Fetch service requests
      const { data: serviceData, error: serviceError } = await supabase
        .from('service_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (serviceError) throw serviceError;

      // Combine both types of requests
      const combinedData = [
        ...(companyData || []).map(r => ({ ...r, type: 'company' as const })),
        ...(serviceData || []).map(r => ({ ...r, type: 'service' as const }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setPayments(combinedData as any);
      setLoadingPayments(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les paiements",
        variant: "destructive",
      });
      setLoadingPayments(false);
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'payment_confirmed':
      case 'completed':
        return 'bg-green-500';
      case 'payment_pending':
        return 'bg-yellow-500';
      case 'payment_failed':
        return 'bg-red-500';
      case 'pending':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case 'payment_confirmed':
        return 'Payé';
      case 'payment_pending':
        return 'En attente de paiement';
      case 'payment_failed':
        return 'Échec du paiement';
      case 'pending':
        return 'Non payé';
      case 'completed':
        return 'Terminé (Payé)';
      default:
        return status;
    }
  };

  const calculateStats = () => {
    const total = payments.reduce((sum, p) => sum + (p.estimated_price || 0), 0);
    const paid = payments
      .filter(p => p.status === 'payment_confirmed' || p.status === 'completed')
      .reduce((sum, p) => sum + (p.estimated_price || 0), 0);
    const pending = payments
      .filter(p => p.status === 'payment_pending' || p.status === 'pending')
      .reduce((sum, p) => sum + (p.estimated_price || 0), 0);
    
    return { total, paid, pending, count: payments.length };
  };

  const stats = calculateStats();

  if (loading || loadingPayments) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/dashboard')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au tableau de bord
          </Button>

          <div className="mb-8">
            <h1 className="font-heading font-bold text-4xl text-foreground mb-2">
              Gestion des Paiements
            </h1>
            <p className="text-muted-foreground">
              Suivi des paiements et transactions
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.count}</div>
                <p className="text-xs text-muted-foreground">
                  Toutes les demandes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Montant Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total.toLocaleString()} FCFA</div>
                <p className="text-xs text-muted-foreground">
                  Total des transactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Payé</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.paid.toLocaleString()} FCFA</div>
                <p className="text-xs text-muted-foreground">
                  Paiements confirmés
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En attente</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pending.toLocaleString()} FCFA</div>
                <p className="text-xs text-muted-foreground">
                  Paiements en attente
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Liste des Paiements</CardTitle>
              <CardDescription>
                Vue d'ensemble de tous les paiements et leur statut
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N° Suivi</TableHead>
                      <TableHead>Entreprise</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={`${payment.type}-${payment.id}`}>
                        <TableCell className="font-medium">
                          {payment.tracking_number || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {payment.type === 'company' 
                            ? (payment.company_name || 'Sans nom')
                            : (payment.service_type || 'Service')}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{payment.contact_name}</div>
                            <div className="text-muted-foreground">{payment.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {payment.estimated_price?.toLocaleString() || 0} FCFA
                        </TableCell>
                        <TableCell>
                          <Badge className={getPaymentStatusColor(payment.payment_status || payment.status)}>
                            {getPaymentStatusLabel(payment.payment_status || payment.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(payment.created_at).toLocaleDateString('fr-FR')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentsDashboard;
