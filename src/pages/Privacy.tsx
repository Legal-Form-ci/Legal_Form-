import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="font-heading font-bold text-4xl sm:text-5xl text-foreground mb-4">
              Politique de Confidentialité
            </h1>
            <p className="text-muted-foreground">
              Dernière mise à jour : Décembre 2024
            </p>
          </div>

          <Card>
            <CardContent className="p-8 prose prose-slate max-w-none">
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">1. Introduction</h2>
              <p className="text-muted-foreground mb-6">
                Legal Form s'engage à protéger la vie privée de ses utilisateurs. Cette politique de confidentialité 
                explique comment nous collectons, utilisons, stockons et protégeons vos informations personnelles 
                lorsque vous utilisez nos services de création d'entreprise.
              </p>

              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">2. Informations collectées</h2>
              <p className="text-muted-foreground mb-4">Nous collectons les informations suivantes :</p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li>Informations d'identification : nom, prénom, adresse email, numéro de téléphone</li>
                <li>Informations professionnelles : activité, type d'entreprise souhaitée</li>
                <li>Documents administratifs : pièces d'identité, justificatifs de domicile</li>
                <li>Informations de paiement : données de transaction (traitées de manière sécurisée)</li>
              </ul>

              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">3. Utilisation des données</h2>
              <p className="text-muted-foreground mb-4">Vos données sont utilisées pour :</p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li>Traiter vos demandes de création d'entreprise</li>
                <li>Vous contacter concernant l'avancement de vos dossiers</li>
                <li>Améliorer nos services et votre expérience utilisateur</li>
                <li>Respecter nos obligations légales et réglementaires</li>
              </ul>

              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">4. Protection des données</h2>
              <p className="text-muted-foreground mb-6">
                Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour 
                protéger vos données personnelles contre tout accès non autorisé, modification, divulgation ou 
                destruction. Vos données sont stockées sur des serveurs sécurisés.
              </p>

              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">5. Partage des données</h2>
              <p className="text-muted-foreground mb-6">
                Vos données personnelles ne sont jamais vendues à des tiers. Elles peuvent être partagées uniquement 
                avec les organismes officiels (RCCM, CNPS, DGI) dans le cadre des procédures de création d'entreprise, 
                et avec nos partenaires de paiement sécurisé.
              </p>

              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">6. Vos droits</h2>
              <p className="text-muted-foreground mb-4">Conformément à la réglementation, vous disposez des droits suivants :</p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li>Droit d'accès à vos données personnelles</li>
                <li>Droit de rectification des données inexactes</li>
                <li>Droit de suppression de vos données</li>
                <li>Droit de portabilité de vos données</li>
                <li>Droit d'opposition au traitement de vos données</li>
              </ul>

              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">7. Contact</h2>
              <p className="text-muted-foreground mb-6">
                Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits, 
                contactez-nous à : <a href="mailto:contact@legalform.ci" className="text-primary hover:underline">contact@legalform.ci</a>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;