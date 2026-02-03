import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Book, Server, Shield, CreditCard, Users, Database, Settings, Loader2 } from "lucide-react";
import AdminLayout from "./AdminLayout";
import jsPDF from 'jspdf';

const Documentation = () => {
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);

  const generateDocumentation = async () => {
    setGenerating(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let y = 30;

      const addHeader = () => {
        doc.setFillColor(0, 124, 122);
        doc.rect(0, 0, pageWidth, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('LEGAL FORM', margin, 25);
        doc.setFontSize(10);
        doc.text('Documentation Technique', pageWidth - margin, 25, { align: 'right' });
      };

      const addNewPage = () => {
        doc.addPage();
        y = 50;
        addHeader();
      };

      const addTitle = (text: string, size: number = 16) => {
        if (y > pageHeight - 40) addNewPage();
        doc.setTextColor(0, 124, 122);
        doc.setFontSize(size);
        doc.setFont('helvetica', 'bold');
        doc.text(text, margin, y);
        y += size * 0.6;
        doc.setTextColor(30, 30, 30);
        doc.setFont('helvetica', 'normal');
      };

      const addParagraph = (text: string, size: number = 10) => {
        doc.setFontSize(size);
        const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
        for (const line of lines) {
          if (y > pageHeight - 20) addNewPage();
          doc.text(line, margin, y);
          y += size * 0.5;
        }
        y += 5;
      };

      const addBullet = (text: string) => {
        if (y > pageHeight - 20) addNewPage();
        doc.setFontSize(10);
        doc.text('• ' + text, margin + 5, y);
        y += 6;
      };

      // Page 1 - Titre
      addHeader();
      y = 80;
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text('Documentation Technique', pageWidth / 2, y, { align: 'center' });
      y += 15;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      doc.text('Plateforme Legal Form CI', pageWidth / 2, y, { align: 'center' });
      y += 30;
      doc.setFontSize(12);
      doc.text(`Version: 3.0.0`, pageWidth / 2, y, { align: 'center' });
      y += 8;
      doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, y, { align: 'center' });
      y += 30;

      // Table des matières
      addTitle('TABLE DES MATIÈRES', 14);
      y += 5;
      const toc = [
        '1. Présentation Générale',
        '2. Architecture Technique',
        '3. Installation et Déploiement',
        '4. Base de Données',
        '5. Authentification et Sécurité',
        '6. Intégration Paiement (KkiaPay)',
        '7. Edge Functions',
        '8. API Endpoints',
        '9. Configuration',
        '10. Maintenance'
      ];
      toc.forEach(item => addBullet(item));

      // Section 1
      addNewPage();
      addTitle('1. PRÉSENTATION GÉNÉRALE', 14);
      y += 5;
      addParagraph('Legal Form est une plateforme de création et gestion d\'entreprises en Côte d\'Ivoire. Elle permet aux entrepreneurs de créer leur société en ligne de manière simple et rapide.');
      y += 5;
      addTitle('Fonctionnalités principales:', 12);
      addBullet('Création d\'entreprises (SARL, SARLU, EI, ONG, etc.)');
      addBullet('Gestion des demandes et suivi en temps réel');
      addBullet('Paiement en ligne via KkiaPay (Mobile Money, Cartes)');
      addBullet('Système de parrainage avec récompenses');
      addBullet('Messagerie intégrée client-admin');
      addBullet('Génération de factures et reçus PDF');
      addBullet('Assistant IA Legal Pro');
      addBullet('Tableau de bord admin complet');

      // Section 2
      addNewPage();
      addTitle('2. ARCHITECTURE TECHNIQUE', 14);
      y += 5;
      addParagraph('L\'application utilise une architecture moderne et scalable:');
      y += 5;
      addTitle('Frontend:', 12);
      addBullet('React 18 avec TypeScript');
      addBullet('Vite comme bundler');
      addBullet('Tailwind CSS pour le styling');
      addBullet('Shadcn/ui pour les composants');
      addBullet('React Query pour la gestion des données');
      addBullet('React Router pour la navigation');
      addBullet('i18next pour l\'internationalisation (FR, EN, ES)');
      y += 5;
      addTitle('Backend (Supabase):', 12);
      addBullet('PostgreSQL pour la base de données');
      addBullet('Row Level Security (RLS) pour la sécurité');
      addBullet('Edge Functions (Deno) pour la logique métier');
      addBullet('Realtime pour les notifications');
      addBullet('Storage pour les fichiers');

      // Section 3
      addNewPage();
      addTitle('3. INSTALLATION ET DÉPLOIEMENT', 14);
      y += 5;
      addTitle('Prérequis:', 12);
      addBullet('Node.js 18+');
      addBullet('npm ou bun');
      y += 5;
      addTitle('Build de production:', 12);
      addParagraph('npm install');
      addParagraph('npm run build');
      y += 5;
      addParagraph('Le dossier dist/ contient tous les fichiers à déployer.');
      y += 5;
      addTitle('Déploiement cPanel:', 12);
      addBullet('1. Téléverser le contenu de dist/ dans public_html');
      addBullet('2. Créer le fichier .htaccess pour le routing SPA');
      addBullet('3. Configurer le certificat SSL');
      y += 5;
      addTitle('Configuration .htaccess:', 12);
      addParagraph('RewriteEngine On');
      addParagraph('RewriteBase /');
      addParagraph('RewriteRule ^index\\.html$ - [L]');
      addParagraph('RewriteCond %{REQUEST_FILENAME} !-f');
      addParagraph('RewriteCond %{REQUEST_FILENAME} !-d');
      addParagraph('RewriteRule . /index.html [L]');

      // Section 4
      addNewPage();
      addTitle('4. BASE DE DONNÉES', 14);
      y += 5;
      addTitle('Tables principales:', 12);
      addBullet('profiles - Profils utilisateurs');
      addBullet('user_roles - Rôles (admin, team, client)');
      addBullet('company_requests - Demandes de création d\'entreprise');
      addBullet('service_requests - Demandes de services additionnels');
      addBullet('company_associates - Associés des entreprises');
      addBullet('payments - Transactions de paiement');
      addBullet('payment_logs - Logs des événements de paiement');
      addBullet('identity_documents - Documents d\'identité');
      addBullet('blog_posts - Articles du blog');
      addBullet('created_companies - Entreprises créées (vitrine)');
      addBullet('contact_messages - Messages de contact');
      addBullet('support_tickets - Tickets de support');
      addBullet('lexia_conversations - Conversations Legal Pro');
      addBullet('referral_withdrawals - Demandes de retrait parrainage');

      // Section 5
      addNewPage();
      addTitle('5. AUTHENTIFICATION ET SÉCURITÉ', 14);
      y += 5;
      addParagraph('L\'authentification est gérée par Supabase Auth avec les fonctionnalités suivantes:');
      addBullet('Inscription par email/mot de passe');
      addBullet('Confirmation d\'email optionnelle');
      addBullet('Réinitialisation de mot de passe');
      addBullet('Sessions JWT sécurisées');
      y += 5;
      addTitle('Row Level Security (RLS):', 12);
      addParagraph('Toutes les tables sont protégées par RLS. Les fonctions de vérification:');
      addBullet('is_admin(user_id) - Vérifie si l\'utilisateur est admin');
      addBullet('is_team_member(user_id) - Vérifie si admin ou équipe');
      y += 5;
      addTitle('Rôles:', 12);
      addBullet('admin - Accès complet');
      addBullet('team - Accès équipe (sans gestion utilisateurs)');
      addBullet('client - Accès client standard');

      // Section 6
      addNewPage();
      addTitle('6. INTÉGRATION PAIEMENT (KKIAPAY)', 14);
      y += 5;
      addTitle('Configuration:', 12);
      addParagraph('Les clés KkiaPay sont stockées en secrets Supabase:');
      addBullet('KKIAPAY_PUBLIC_KEY - Clé publique');
      addBullet('KKIAPAY_PRIVATE_KEY - Clé privée');
      addBullet('KKIAPAY_SECRET - Secret pour webhooks');
      y += 5;
      addTitle('Flux de paiement:', 12);
      addBullet('1. Client soumet une demande');
      addBullet('2. Frontend ouvre le widget KkiaPay');
      addBullet('3. Utilisateur effectue le paiement');
      addBullet('4. Callback reçu par verify-kkiapay-payment');
      addBullet('5. Statut mis à jour en base de données');
      addBullet('6. Email de confirmation envoyé');
      y += 5;
      addTitle('Webhook URL:', 12);
      addParagraph('https://qeznwyczskbjaeyhvuis.supabase.co/functions/v1/verify-kkiapay-payment');

      // Section 7
      addNewPage();
      addTitle('7. EDGE FUNCTIONS', 14);
      y += 5;
      addTitle('Fonctions déployées:', 12);
      addBullet('create-payment - Prépare un paiement');
      addBullet('verify-kkiapay-payment - Vérifie et confirme les paiements');
      addBullet('payment-webhook - Webhook KkiaPay');
      addBullet('send-notification - Envoi d\'emails');
      addBullet('send-payment-notification - Notifications de paiement');
      addBullet('send-status-notification - Notifications de statut');
      addBullet('ai-content-generator - Génération IA pour actualités');
      addBullet('lexia-chat - Assistant Legal Pro');
      addBullet('create-super-admin - Création super admin');
      addBullet('delete-admin-user - Suppression utilisateur admin');
      addBullet('upload-document - Upload de documents');
      addBullet('notify-id-validation - Notification validation ID');
      addBullet('secure-public-tracking - Suivi public sécurisé');

      // Section 8
      addNewPage();
      addTitle('8. API ENDPOINTS', 14);
      y += 5;
      addParagraph('Base URL: https://qeznwyczskbjaeyhvuis.supabase.co/functions/v1/');
      y += 5;
      addTitle('Endpoints publics:', 12);
      addBullet('POST /verify-kkiapay-payment - Vérification paiement');
      addBullet('POST /payment-webhook - Webhook KkiaPay');
      addBullet('POST /secure-public-tracking - Suivi demande');
      y += 5;
      addTitle('Endpoints authentifiés:', 12);
      addBullet('POST /create-payment - Créer paiement');
      addBullet('POST /send-notification - Envoyer email');
      addBullet('POST /ai-content-generator - Générer contenu IA');
      addBullet('POST /lexia-chat - Chat Legal Pro');
      addBullet('POST /upload-document - Upload document');

      // Section 9
      addNewPage();
      addTitle('9. CONFIGURATION', 14);
      y += 5;
      addTitle('Variables d\'environnement:', 12);
      addBullet('VITE_SUPABASE_URL - URL Supabase');
      addBullet('VITE_SUPABASE_PUBLISHABLE_KEY - Clé publique');
      addBullet('VITE_SUPABASE_PROJECT_ID - ID projet');
      y += 5;
      addTitle('Secrets Supabase:', 12);
      addBullet('KKIAPAY_PUBLIC_KEY');
      addBullet('KKIAPAY_PRIVATE_KEY');
      addBullet('KKIAPAY_SECRET');
      addBullet('RESEND_API_KEY - Pour envoi emails');
      addBullet('SUPABASE_SERVICE_ROLE_KEY');

      // Section 10
      addNewPage();
      addTitle('10. MAINTENANCE', 14);
      y += 5;
      addTitle('Sauvegardes:', 12);
      addParagraph('Les données sont automatiquement sauvegardées par Supabase Cloud.');
      y += 5;
      addTitle('Mises à jour:', 12);
      addBullet('1. Modifier le code source');
      addBullet('2. Exécuter npm run build');
      addBullet('3. Téléverser dist/ sur le serveur');
      y += 5;
      addTitle('Monitoring:', 12);
      addBullet('Logs disponibles dans le dashboard Supabase');
      addBullet('Analytics via le dashboard admin');
      addBullet('Erreurs trackées dans payment_logs');
      y += 10;

      // Footer
      addTitle('SUPPORT', 12);
      addParagraph('Email: support@legalform.ci');
      addParagraph('Téléphone: +225 07 09 67 79 25');
      addParagraph('Site: www.legalform.ci');

      // Save
      doc.save('Documentation_LegalForm_v3.0.pdf');
      
      toast({
        title: "Documentation générée",
        description: "Le fichier PDF a été téléchargé",
      });
    } catch (error) {
      console.error('Error generating documentation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer la documentation",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const sections = [
    {
      icon: Book,
      title: "Présentation Générale",
      description: "Vue d'ensemble de la plateforme Legal Form et ses fonctionnalités principales"
    },
    {
      icon: Server,
      title: "Architecture Technique",
      description: "Stack technique: React, TypeScript, Supabase, Edge Functions"
    },
    {
      icon: Database,
      title: "Base de Données",
      description: "Schéma PostgreSQL avec RLS, tables et relations"
    },
    {
      icon: Shield,
      title: "Sécurité & Authentification",
      description: "Gestion des rôles, sessions JWT, politiques RLS"
    },
    {
      icon: CreditCard,
      title: "Intégration Paiement",
      description: "Configuration KkiaPay, webhooks et flux de paiement"
    },
    {
      icon: Users,
      title: "Gestion Utilisateurs",
      description: "Rôles admin, équipe et clients"
    },
    {
      icon: Settings,
      title: "Configuration & Déploiement",
      description: "Variables d'environnement, build et déploiement cPanel"
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Documentation</h1>
            <p className="text-slate-400 mt-1">Documentation technique complète de la plateforme</p>
          </div>
          <Button 
            onClick={generateDocumentation} 
            disabled={generating}
            className="bg-primary hover:bg-primary/90"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Génération...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Télécharger le PDF
              </>
            )}
          </Button>
        </div>

        {/* Info Card */}
        <Card className="bg-gradient-to-r from-primary/20 to-primary/10 border-primary/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <FileText className="h-12 w-12 text-primary" />
              <div>
                <h2 className="text-xl font-bold text-white">Documentation Legal Form v3.0</h2>
                <p className="text-slate-300">
                  Guide complet d'installation, configuration et maintenance de la plateforme
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Card key={index} className="bg-slate-800 border-slate-700 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-white">
                    <Icon className="h-5 w-5 text-primary" />
                    {section.title}
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    {section.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Informations Techniques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Version</span>
                <span className="text-white font-mono">3.0.0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Framework</span>
                <span className="text-white font-mono">React 18 + Vite</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Backend</span>
                <span className="text-white font-mono">Supabase Cloud</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Paiement</span>
                <span className="text-white font-mono">KkiaPay</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Langues</span>
                <span className="text-white font-mono">FR, EN, ES</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">URLs Importantes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col text-sm">
                <span className="text-slate-400">API Base URL</span>
                <span className="text-primary font-mono text-xs break-all">https://qeznwyczskbjaeyhvuis.supabase.co</span>
              </div>
              <div className="flex flex-col text-sm">
                <span className="text-slate-400">Webhook KkiaPay</span>
                <span className="text-primary font-mono text-xs break-all">/functions/v1/verify-kkiapay-payment</span>
              </div>
              <div className="flex flex-col text-sm">
                <span className="text-slate-400">Site Production</span>
                <span className="text-primary font-mono text-xs">www.legalform.ci</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Documentation;
