import { useState } from "react";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, HelpCircle, Building2, CreditCard, FileText, Clock, Users, Phone } from "lucide-react";
import { Link } from "react-router-dom";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  faqs: FAQItem[];
}

const FAQ = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const faqCategories: FAQCategory[] = [
    {
      id: "company-creation",
      name: t('faq.categories.companyCreation', 'Création d\'entreprise'),
      icon: Building2,
      faqs: [
        {
          question: t('faq.questions.whatTypes', 'Quels types d\'entreprises pouvez-vous créer ?'),
          answer: t('faq.answers.whatTypes', 'Nous accompagnons la création de SARL, SARLU, et d\'autres formes juridiques adaptées au droit ivoirien. Nos experts vous guident dans le choix de la structure la plus appropriée à votre projet.')
        },
        {
          question: t('faq.questions.howLong', 'Combien de temps faut-il pour créer une entreprise ?'),
          answer: t('faq.answers.howLong', 'Le délai moyen est de 48 à 72 heures une fois le dossier complet. Ce délai inclut l\'immatriculation au RCCM, l\'obtention du NIF et l\'enregistrement fiscal.')
        },
        {
          question: t('faq.questions.documents', 'Quels documents sont nécessaires pour créer une entreprise ?'),
          answer: t('faq.answers.documents', 'Vous aurez besoin d\'une pièce d\'identité valide (CNI ou passeport), un justificatif de domicile, et les informations sur l\'activité de l\'entreprise. Notre équipe vous guidera sur les documents spécifiques selon votre situation.')
        },
        {
          question: t('faq.questions.capital', 'Quel est le capital minimum requis ?'),
          answer: t('faq.answers.capital', 'Pour une SARL, le capital minimum est de 100 000 FCFA. Pour une SARLU, il n\'y a pas de capital minimum obligatoire. Nous vous conseillons sur le capital optimal selon votre activité.')
        },
        {
          question: t('faq.questions.regions', 'Pouvez-vous créer des entreprises dans toute la Côte d\'Ivoire ?'),
          answer: t('faq.answers.regions', 'Oui, nous intervenons dans toutes les régions de Côte d\'Ivoire : Abidjan, Bouaké, Yamoussoukro, San-Pédro, Korhogo, et toutes les autres villes.')
        }
      ]
    },
    {
      id: "payment",
      name: t('faq.categories.payment', 'Paiement & Tarifs'),
      icon: CreditCard,
      faqs: [
        {
          question: t('faq.questions.paymentMethods', 'Quels modes de paiement acceptez-vous ?'),
          answer: t('faq.answers.paymentMethods', 'Nous acceptons les paiements par Mobile Money (MTN, Orange, Moov), les cartes bancaires (Visa, Mastercard), et les virements bancaires. Tous les paiements sont sécurisés via KkiaPay.')
        },
        {
          question: t('faq.questions.prices', 'Quels sont vos tarifs ?'),
          answer: t('faq.answers.prices', 'Nos tarifs varient selon le type de prestation : création d\'entreprise à partir de 150 000 FCFA, modification de statuts à partir de 75 000 FCFA. Consultez notre page tarifs pour les détails complets.')
        },
        {
          question: t('faq.questions.invoice', 'Comment obtenir une facture ?'),
          answer: t('faq.answers.invoice', 'Une facture est automatiquement générée et envoyée par email après chaque paiement. Vous pouvez également la télécharger depuis votre espace client.')
        },
        {
          question: t('faq.questions.refund', 'Quelle est votre politique de remboursement ?'),
          answer: t('faq.answers.refund', 'En cas d\'annulation avant le début du traitement, un remboursement complet est possible. Une fois le dossier en cours de traitement, les frais engagés ne sont pas remboursables.')
        }
      ]
    },
    {
      id: "process",
      name: t('faq.categories.process', 'Processus & Suivi'),
      icon: Clock,
      faqs: [
        {
          question: t('faq.questions.tracking', 'Comment suivre l\'avancement de mon dossier ?'),
          answer: t('faq.answers.tracking', 'Vous pouvez suivre votre dossier en temps réel depuis votre espace client ou via la page "Suivre mon dossier" avec votre numéro de téléphone. Vous recevez également des notifications par email à chaque étape.')
        },
        {
          question: t('faq.questions.steps', 'Quelles sont les étapes du processus de création ?'),
          answer: t('faq.answers.steps', '1. Soumission de la demande et des documents\n2. Vérification et validation par notre équipe\n3. Paiement des frais\n4. Dépôt auprès des administrations\n5. Réception des documents officiels')
        },
        {
          question: t('faq.questions.contact', 'Comment contacter le support ?'),
          answer: t('faq.answers.contact', 'Vous pouvez nous contacter via le chat Legal Pro sur le site, par téléphone au +225 07 09 67 79 25, par email à monentreprise@legalform.ci, ou via le formulaire de contact.')
        }
      ]
    },
    {
      id: "documents",
      name: t('faq.categories.documents', 'Documents & Livrables'),
      icon: FileText,
      faqs: [
        {
          question: t('faq.questions.whatDocuments', 'Quels documents vais-je recevoir ?'),
          answer: t('faq.answers.whatDocuments', 'Vous recevrez les statuts certifiés, le registre de commerce (RCCM), l\'attestation d\'immatriculation fiscale, le NIF, et tous les documents nécessaires pour exercer légalement.')
        },
        {
          question: t('faq.questions.delivery', 'Comment recevrai-je mes documents ?'),
          answer: t('faq.answers.delivery', 'Les documents sont d\'abord envoyés par email en version numérique. Les originaux peuvent être récupérés dans nos locaux ou envoyés par coursier sur demande.')
        },
        {
          question: t('faq.questions.modifications', 'Puis-je modifier les documents après création ?'),
          answer: t('faq.answers.modifications', 'Oui, nous proposons des services de modification de statuts, changement de gérant, augmentation de capital, etc. Ces modifications sont soumises aux frais légaux en vigueur.')
        }
      ]
    },
    {
      id: "services",
      name: t('faq.categories.services', 'Services Additionnels'),
      icon: Users,
      faqs: [
        {
          question: t('faq.questions.otherServices', 'Proposez-vous d\'autres services ?'),
          answer: t('faq.answers.otherServices', 'Oui ! Nous proposons la déclaration fiscale d\'existence (DFE), le renouvellement CNPS, l\'attestation de non-condamnation (NCC), la domiciliation d\'entreprise, et bien d\'autres services.')
        },
        {
          question: t('faq.questions.accounting', 'Faites-vous la comptabilité ?'),
          answer: t('faq.answers.accounting', 'Nous avons des partenaires comptables agréés que nous pouvons vous recommander. Contactez-nous pour plus d\'informations sur nos offres de mise en relation.')
        },
        {
          question: t('faq.questions.legal', 'Proposez-vous des conseils juridiques ?'),
          answer: t('faq.answers.legal', 'Notre équipe peut vous orienter sur les questions courantes liées à la création d\'entreprise. Pour des conseils juridiques approfondis, nous vous recommandons de consulter un avocat.')
        }
      ]
    }
  ];

  const allFaqs = faqCategories.flatMap(cat => 
    cat.faqs.map(faq => ({ ...faq, category: cat.name, categoryId: cat.id }))
  );

  const filteredFaqs = searchQuery.trim() 
    ? allFaqs.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : activeCategory 
      ? allFaqs.filter(faq => faq.categoryId === activeCategory)
      : allFaqs;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-hero text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                <HelpCircle className="h-12 w-12" />
              </div>
            </div>
            <h1 className="font-heading font-bold text-4xl md:text-5xl mb-6">
              {t('faq.title', 'Questions Fréquentes')}
            </h1>
            <p className="text-xl text-white/90 mb-8">
              {t('faq.subtitle', 'Trouvez rapidement les réponses à vos questions sur nos services de création d\'entreprise en Côte d\'Ivoire.')}
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('faq.searchPlaceholder', 'Rechercher une question...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-6 text-lg bg-white text-foreground border-0 shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-8 border-b bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              variant={activeCategory === null ? "default" : "outline"}
              onClick={() => setActiveCategory(null)}
              className="rounded-full"
            >
              {t('faq.allCategories', 'Toutes les catégories')}
            </Button>
            {faqCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  onClick={() => setActiveCategory(category.id)}
                  className="rounded-full"
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {category.name}
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {searchQuery.trim() && (
            <p className="text-muted-foreground mb-6">
              {filteredFaqs.length} {t('faq.results', 'résultat(s) pour')} "{searchQuery}"
            </p>
          )}
          
          {filteredFaqs.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <HelpCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {t('faq.noResults', 'Aucun résultat trouvé')}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {t('faq.noResultsDesc', 'Essayez avec d\'autres mots-clés ou consultez toutes les catégories.')}
                </p>
                <Button onClick={() => { setSearchQuery(''); setActiveCategory(null); }}>
                  {t('faq.showAll', 'Voir toutes les questions')}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Accordion type="single" collapsible className="space-y-4">
              {filteredFaqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border rounded-lg px-6 bg-card shadow-sm hover:shadow-md transition-shadow"
                >
                  <AccordionTrigger className="text-left py-5">
                    <div className="flex flex-col gap-2">
                      {searchQuery && (
                        <Badge variant="secondary" className="w-fit text-xs">
                          {faq.category}
                        </Badge>
                      )}
                      <span className="font-medium text-foreground">{faq.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5 whitespace-pre-line">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="max-w-2xl mx-auto text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Phone className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl">
                {t('faq.stillQuestions', 'Vous avez encore des questions ?')}
              </CardTitle>
              <CardDescription className="text-lg">
                {t('faq.stillQuestionsDesc', 'Notre équipe est disponible pour répondre à toutes vos questions.')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link to="/contact">
                    {t('faq.contactUs', 'Nous contacter')}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href="tel:+2250709677925">
                    <Phone className="mr-2 h-4 w-4" />
                    +225 07 09 67 79 25
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQ;
