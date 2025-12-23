import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type PaymentStatus = 'loading' | 'success' | 'failed' | 'pending';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<PaymentStatus>('loading');
  const [transactionId, setTransactionId] = useState<string | null>(null);

  useEffect(() => {
    // Get status from URL params (FedaPay redirects with status)
    const statusParam = searchParams.get('status');
    const txId = searchParams.get('transaction_id') || searchParams.get('id');
    
    setTransactionId(txId);

    // Determine payment status from URL
    if (statusParam === 'approved' || statusParam === 'completed' || statusParam === 'success') {
      setStatus('success');
    } else if (statusParam === 'declined' || statusParam === 'cancelled' || statusParam === 'failed') {
      setStatus('failed');
    } else if (statusParam === 'pending') {
      setStatus('pending');
    } else {
      // Default to pending if no clear status
      setStatus('pending');
    }
  }, [searchParams]);

  const getStatusContent = () => {
    switch (status) {
      case 'loading':
        return {
          icon: <Loader2 className="h-16 w-16 text-primary animate-spin" />,
          title: "Vérification en cours...",
          description: "Nous vérifions votre paiement",
          color: "text-primary"
        };
      case 'success':
        return {
          icon: <CheckCircle2 className="h-16 w-16 text-green-500" />,
          title: "Paiement réussi !",
          description: "Votre paiement a été effectué avec succès. Votre demande est maintenant en cours de traitement.",
          color: "text-green-500"
        };
      case 'failed':
        return {
          icon: <XCircle className="h-16 w-16 text-destructive" />,
          title: "Paiement échoué",
          description: "Le paiement n'a pas pu être complété. Veuillez réessayer ou contacter le support.",
          color: "text-destructive"
        };
      case 'pending':
        return {
          icon: <Loader2 className="h-16 w-16 text-yellow-500" />,
          title: "Paiement en attente",
          description: "Votre paiement est en cours de traitement. Vous serez notifié une fois confirmé.",
          color: "text-yellow-500"
        };
    }
  };

  const content = getStatusContent();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-xl">
          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                {content.icon}
              </div>
              <CardTitle className={`text-2xl ${content.color}`}>
                {content.title}
              </CardTitle>
              <CardDescription className="text-base mt-2">
                {content.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {transactionId && (
                <p className="text-sm text-muted-foreground">
                  Référence de transaction: <span className="font-mono">{transactionId}</span>
                </p>
              )}
              
              <div className="flex flex-col gap-3 pt-4">
                <Button 
                  onClick={() => navigate('/client/dashboard')}
                  className="w-full"
                >
                  Accéder à mon tableau de bord
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                
                {status === 'failed' && (
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/services')}
                    className="w-full"
                  >
                    Réessayer
                  </Button>
                )}
                
                <Button 
                  variant="ghost"
                  onClick={() => navigate('/')}
                  className="w-full"
                >
                  Retour à l'accueil
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentCallback;
