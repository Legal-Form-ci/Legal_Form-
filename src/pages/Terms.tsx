import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="font-heading font-bold text-4xl sm:text-5xl text-foreground mb-4">
              Conditions Générales d'Utilisation
            </h1>
            <p className="text-muted-foreground">
              Dernière mise à jour : Décembre 2024
            </p>
          </div>

          <Card>
            <CardContent className="p-8 prose prose-slate max-w-none">
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">1. Objet</h2>
              <p className="text-muted-foreground mb-6">
                Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation de la plateforme 
                Legal Form et les services de création d'entreprise proposés. En utilisant nos services, vous 
                acceptez ces conditions dans leur intégralité.
              </p>

              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">2. Services proposés</h2>
              <p className="text-muted-foreground mb-4">Legal Form propose les services suivants :</p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li>Création d'entreprises (SARL, SUARL, SNC, etc.)</li>
                <li>Création d'associations, ONG et coopératives</li>
                <li>Rédaction de documents juridiques</li>
                <li>Immatriculations et formalités administratives</li>
                <li>Accompagnement et conseil entrepreneurial</li>
              </ul>

              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">3. Tarifs et paiement</h2>
              <p className="text-muted-foreground mb-4">
                Les tarifs de création d'entreprise sont les suivants :
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li><strong>Abidjan :</strong> 180 000 FCFA</li>
                <li><strong>Régions de l'intérieur :</strong> À partir de 200 000 FCFA (selon la région)</li>
              </ul>
              <p className="text-muted-foreground mb-6">
                Le paiement s'effectue en deux temps : 50% d'acompte à la commande, puis le solde de manière 
                progressive durant la procédure. Les paiements sont acceptés par Mobile Money, carte bancaire 
                et virement électronique.
              </p>

              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">4. Obligations de l'utilisateur</h2>
              <p className="text-muted-foreground mb-4">L'utilisateur s'engage à :</p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li>Fournir des informations exactes et complètes</li>
                <li>Transmettre des documents authentiques et valides</li>
                <li>Répondre dans les délais aux demandes d'informations complémentaires</li>
                <li>Respecter les délais de paiement convenus</li>
              </ul>

              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">5. Obligations de Legal Form</h2>
              <p className="text-muted-foreground mb-4">Legal Form s'engage à :</p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li>Traiter les dossiers avec diligence et professionnalisme</li>
                <li>Informer le client de l'avancement de son dossier</li>
                <li>Respecter la confidentialité des informations transmises</li>
                <li>Fournir les documents et attestations dans les délais convenus</li>
              </ul>

              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">6. Délais de traitement</h2>
              <p className="text-muted-foreground mb-6">
                Les délais de traitement varient selon le type de demande et la région. Legal Form s'efforce de 
                traiter les dossiers dans les meilleurs délais, sous réserve de la réception de tous les documents 
                requis et des délais des organismes officiels.
              </p>

              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">7. Responsabilité</h2>
              <p className="text-muted-foreground mb-6">
                Legal Form ne saurait être tenue responsable des retards ou refus émanant des organismes officiels, 
                ni des conséquences résultant d'informations inexactes fournies par le client.
              </p>

              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">8. Litiges</h2>
              <p className="text-muted-foreground mb-6">
                En cas de litige, les parties s'engagent à rechercher une solution amiable. À défaut, les tribunaux 
                d'Abidjan seront seuls compétents pour connaître du litige.
              </p>

              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">9. Contact</h2>
              <p className="text-muted-foreground mb-6">
                Pour toute question concernant ces conditions, contactez-nous à : 
                <a href="mailto:contact@legalform.ci" className="text-primary hover:underline ml-1">contact@legalform.ci</a>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;