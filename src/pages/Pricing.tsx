import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Pricing = () => {
  const packages = [
    {
      name: "Pack Création Abidjan",
      price: "180 000 FCFA",
      description: "Création complète de votre entreprise à Abidjan",
      features: [
        "Rédaction de statuts",
        "Immatriculation RCCM",
        "Déclaration Fiscale d'Existence (DFE)",
        "Numéro Compte Contribuable (NCC)",
        "Immatriculation CNPS",
        "Identification Unique (IDU)",
        "Numéro Télédéclarant (NTD)",
        "Avis de constitution",
        "Journal",
        "Déclaration de Souscription et Versement (DSV)"
      ],
      recommended: true
    },
    {
      name: "Pack Création Intérieur",
      price: "À partir de 150 000 FCFA",
      description: "Création complète selon votre région",
      features: [
        "Rédaction de statuts",
        "Immatriculation RCCM",
        "Déclaration Fiscale d'Existence (DFE)",
        "Numéro Compte Contribuable (NCC)",
        "Immatriculation CNPS",
        "Identification Unique (IDU)",
        "Numéro Télédéclarant (NTD)",
        "Avis de constitution",
        "Journal",
        "Déclaration de Souscription et Versement (DSV)"
      ],
      recommended: false
    }
  ];

  const additionalServices = [
    {
      title: "Structuration de Projet",
      description: "Montage de business plan, études de faisabilité et conseil stratégique",
      pricing: "Sur devis personnalisé"
    },
    {
      title: "Formation",
      description: "Formation entrepreneuriale, gestion d'entreprise et accompagnement",
      pricing: "Sur devis personnalisé"
    },
    {
      title: "Mobilisation de Financement",
      description: "Recherche, montage de dossiers et mobilisation de financements",
      pricing: "Sur devis personnalisé"
    },
    {
      title: "Solutions Digitales",
      description: "Sites web, applications mobiles et solutions sur mesure",
      pricing: "Sur devis personnalisé"
    },
    {
      title: "Identité Visuelle",
      description: "Logos, chartes graphiques et supports de communication",
      pricing: "Sur devis personnalisé"
    },
    {
      title: "Comptabilité & Fiscalité",
      description: "Suivi comptable, déclarations fiscales et conseil financier",
      pricing: "Sur devis personnalisé"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl text-foreground mb-6">
              Nos Tarifs
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Des tarifs transparents et compétitifs pour votre création d'entreprise
            </p>
          </div>

          {/* Main Packages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20 max-w-5xl mx-auto">
            {packages.map((pkg, index) => (
              <Card key={index} className={`border-2 ${pkg.recommended ? "border-primary shadow-strong" : ""}`}>
                {pkg.recommended && (
                  <div className="bg-primary text-white text-center py-2 text-sm font-semibold rounded-t-lg">
                    RECOMMANDÉ
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                  <div className="text-4xl font-bold text-primary my-4">{pkg.price}</div>
                  <CardDescription className="text-base">{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="bg-accent/10 p-4 rounded-lg mb-6">
                    <p className="text-sm text-accent font-semibold">
                      💳 Paiement en ligne : Mobile Money, carte bancaire, virement électronique
                    </p>
                  </div>
                  <Link to="/create">
                    <Button className="w-full" size="lg">
                      Démarrer mon projet
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Services */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="font-heading font-bold text-3xl text-foreground mb-4">
                Services Additionnels
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Services complémentaires facturés séparément selon vos besoins
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {additionalServices.map((service, index) => (
                <Card key={index} className="hover:shadow-soft transition-all">
                  <CardHeader>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-primary font-semibold">{service.pricing}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-hero rounded-2xl p-12 text-center text-white">
            <h2 className="font-heading font-bold text-3xl sm:text-4xl mb-4">
              Besoin d'un Devis Personnalisé ?
            </h2>
            <p className="text-lg mb-6 text-white/90">
              Contactez-nous pour obtenir un devis adapté à votre projet
            </p>
            <Link to="/contact">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white">
                Demander un devis
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
