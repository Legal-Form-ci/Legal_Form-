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
import { ArrowLeft, CheckCircle, XCircle, Star } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  type: string;
  region: string;
  rating: number;
  testimonial: string;
  show_publicly: boolean;
  created_at: string;
  founder_name: string;
}

const TestimonialsAdmin = () => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loadingData, setLoadingData] = useState(true);

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
      fetchTestimonials();
    }
  }, [user, userRole]);

  const fetchTestimonials = async () => {
    const { data, error } = await supabase
      .from('created_companies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les témoignages",
        variant: "destructive",
      });
      return;
    }

    setTestimonials(data || []);
    setLoadingData(false);
  };

  const togglePublicVisibility = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('created_companies')
      .update({ show_publicly: !currentStatus })
      .eq('id', id);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Succès",
      description: !currentStatus ? "Témoignage approuvé et visible publiquement" : "Témoignage masqué",
    });

    fetchTestimonials();
  };

  if (loading || loadingData) {
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
              Gestion des Témoignages
            </h1>
            <p className="text-muted-foreground">
              Approuver ou masquer les témoignages clients
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Liste des Témoignages</CardTitle>
              <CardDescription>
                Total: {testimonials.length} témoignages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Entreprise</TableHead>
                      <TableHead>Fondateur</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Région</TableHead>
                      <TableHead>Note</TableHead>
                      <TableHead>Témoignage</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testimonials.map((testimonial) => (
                      <TableRow key={testimonial.id}>
                        <TableCell className="font-medium">
                          {testimonial.name}
                        </TableCell>
                        <TableCell>{testimonial.founder_name}</TableCell>
                        <TableCell>{testimonial.type}</TableCell>
                        <TableCell>{testimonial.region}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{testimonial.rating}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {testimonial.testimonial || "Pas de témoignage"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={testimonial.show_publicly ? "default" : "secondary"}>
                            {testimonial.show_publicly ? "Visible" : "Masqué"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant={testimonial.show_publicly ? "outline" : "default"}
                            onClick={() => togglePublicVisibility(testimonial.id, testimonial.show_publicly)}
                          >
                            {testimonial.show_publicly ? (
                              <>
                                <XCircle className="mr-1 h-4 w-4" />
                                Masquer
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-1 h-4 w-4" />
                                Approuver
                              </>
                            )}
                          </Button>
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

export default TestimonialsAdmin;
