import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Building2, FileText, Users, Shield, CheckCircle2, Star, Lightbulb, DollarSign, Palette, GraduationCap, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsSection from "@/components/NewsSection";
import heroBackground from "@/assets/hero-bg.jpg";

const Index = () => {
  const { t } = useTranslation();

  const services = [
    {
      icon: Building2,
      title: t('home.services.creation.title', 'Création d\'entreprise'),
      description: t('home.services.creation.desc', 'De l\'idée au lancement opérationnel'),
      items: [
        "Entreprise Individuelle, SARL, SARLU",
        "Association, ONG, Fondation",
        "SCOOPS, SCI, GIE",
        "SCOOPS, SCI, GIE"
      ],
    },
    {
      icon: FileText,
      title: t('home.services.management.title', 'Gestion d\'entreprise'),
      description: t('home.services.management.desc', 'Modifications et formalités'),
      items: [
        "Changement de gérant, cession de part",
        "Domiciliation d'entreprise",
        "Rédaction de contrats",
        "Dépôt de marque"
      ],
    },
    {
      icon: GraduationCap,
      title: t('home.services.support.title', 'Accompagnement'),
      description: t('home.services.support.desc', 'Accompagnement stratégique'),
      items: [
        "Comptabilité et fiscalité",
        "Formation entrepreneuriale",
        "Structuration de projet",
        "Mobilisation de financement"
      ],
    },
    {
      icon: FileText,
      title: t('home.services.other.title', 'Autres formalités'),
      description: t('home.services.other.desc', 'Démarches administratives'),
      items: [
        "Immobilier, Agrément FDFP",
        "Agrément agent immobilier",
        "Transport, Carte transporteur",
        "Formalités ACD"
      ],
    },
  ];

  const steps = [
    { 
      number: "01", 
      title: t('home.steps.step1.title', 'Choisissez votre service'), 
      description: t('home.steps.step1.desc', 'Digitalisation') 
    },
    { 
      number: "02", 
      title: t('home.steps.step2.title', 'Remplissez le formulaire'), 
      description: t('home.steps.step2.desc', 'Informations simples et rapides') 
    },
    { 
      number: "03", 
      title: t('home.steps.step3.title', 'Validation & paiement'), 
      description: t('home.steps.step3.desc', 'Tarifs adaptés selon votre région') 
    },
    { 
      number: "04", 
      title: t('home.steps.step4.title', 'Suivi jusqu\'à tous vos documents'), 
      description: t('home.steps.step4.desc', 'Suivi personnalisé') 
    },
  ];

  const testimonials = [
    {
      name: "KOFFI Innocent",
      company: "AGRICAPITAL SARL",
      region: "Daloa",
      rating: 5,
      comment: t('home.testimonials.koffi', 'Service rapide et professionnel. L\'équipe Legal Form a été disponible à chaque étape.'),
    },
    {
      name: "KOUASSI Marie",
      company: "TECHNOVATE SARL",
      region: "Abidjan",
      rating: 5,
      comment: t('home.testimonials.kouassi', 'J\'ai créé mon entreprise en peu de temps.'),
    },
    {
      name: "DIALLO Amadou",
      company: "BATIR CI SARL",
      region: "Bouaké",
      rating: 5,
      comment: t('home.testimonials.diallo', 'Processus simplifié, équipe compétente. Je recommande vivement Legal Form.'),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section - Split Layout */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-hero"
          style={{
            backgroundImage: `linear-gradient(135deg, hsl(179 100% 24% / 0.95) 0%, hsl(179 100% 18% / 0.95) 100%), url(${heroBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        {/* Geometric patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 border-2 border-white rounded-full" />
          <div className="absolute bottom-32 left-10 w-96 h-96 border-2 border-white transform rotate-45" />
          <div className="absolute top-1/2 right-1/4 w-48 h-48 border-2 border-white transform -rotate-12" />
        </div>

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
            {/* Left side - Main CTA */}
            <div className="lg:col-span-3">
              <h1 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-white mb-6 leading-tight animate-in fade-in slide-in-from-bottom-4 duration-1000">
                {t('home.hero.title', 'Transformez votre idée en une')}{" "}
                <span className="text-accent">{t('home.hero.highlight', 'entreprise viable')}</span>
              </h1>
              <p className="text-lg sm:text-xl text-white/90 mb-6 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
                {t('home.hero.subtitle', 'Créer, gérer et accompagner votre entreprise en Côte d\'Ivoire et partout dans le monde.')}
              </p>
              
              {/* Referral promo banner */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/20 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent rounded-lg">
                    <Gift className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Programme Parrainage</p>
                    <p className="text-white/80 text-xs">
                      Gagnez 10 000 FCFA en parrainant un proche. Votre filleul bénéficie aussi de -10 000 FCFA !
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
                <Link to="/create">
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-white shadow-strong text-lg px-8 py-6 h-auto font-semibold group">
                    {t('home.hero.cta', 'Créer mon entreprise')}
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/services">
                  <Button size="lg" variant="outline" className="border-2 border-white bg-white text-primary hover:bg-white/90 hover:text-primary text-lg px-8 py-6 h-auto font-bold">
                    {t('home.hero.services', 'Nos services')}
                  </Button>
                </Link>
              </div>
              
              {/* Pricing highlight */}
              <div className="mt-8 flex flex-wrap gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-400">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                  <p className="text-white/80 text-xs">Abidjan</p>
                  <p className="text-white font-bold">199 000 FCFA</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                  <p className="text-white/80 text-xs">Intérieur du pays</p>
                  <p className="text-white font-bold">À partir de 169 000 FCFA</p>
                </div>
              </div>
            </div>
            
            {/* Right side - News Section */}
            <div className="lg:col-span-2 animate-in fade-in slide-in-from-right-4 duration-1000 delay-300">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                <NewsSection />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-foreground mb-4">
              {t('home.services.title', 'Nos Services')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('home.services.subtitle', 'Créer, gérer et accompagner votre entreprise en Côte d\'Ivoire et partout dans le monde.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index} className="border-2 hover:border-primary hover:shadow-strong transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary group-hover:text-white transition-colors w-fit">
                        <Icon className="h-8 w-8 text-primary group-hover:text-white" />
                      </div>
                      <div>
                        <h3 className="font-heading font-semibold text-xl text-foreground mb-2">
                          {service.title}
                        </h3>
                        <p className="text-muted-foreground mb-4">{service.description}</p>
                        <ul className="space-y-2">
                          {service.items.map((item, i) => (
                            <li key={i} className="flex items-start text-sm text-muted-foreground">
                              <CheckCircle2 className="h-4 w-4 text-primary mr-2 flex-shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link to="/services">
              <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-white">
                {t('home.services.viewAll', 'Voir tous nos services')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 lg:py-32 bg-muted">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-foreground mb-4">
              {t('home.steps.title', 'Comment ça marche ?')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('home.steps.subtitle', 'Créez votre entreprise en 4 étapes simples')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-hero text-white font-heading font-bold text-2xl mb-4 shadow-soft">
                    {step.number}
                  </div>
                  <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-primary to-transparent -translate-x-1/2" />
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/create">
              <Button size="lg" className="bg-gradient-accent hover:opacity-90 shadow-soft text-lg px-8 py-6 h-auto font-semibold">
                {t('home.steps.cta', 'Commencer maintenant')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-foreground mb-4">
              {t('home.testimonials.title', 'Entreprises Créées')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('home.testimonials.subtitle', 'Découvrez les témoignages de nos clients satisfaits')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-2 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-accent fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.comment}"</p>
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-primary font-medium">{testimonial.company}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{testimonial.region}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/showcase">
              <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-white">
                {t('home.testimonials.viewAll', 'Voir toutes les entreprises créées')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;