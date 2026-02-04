import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Book, Server, Shield, CreditCard, Users, Database, Settings, Loader2, UserCircle, Building2, HelpCircle, Wrench } from "lucide-react";
import AdminLayout from "./AdminLayout";
import jsPDF from 'jspdf';

// Load image as base64
const loadImageAsBase64 = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error loading image:', error);
    return null;
  }
};

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

      // Load images
      const logoImage = await loadImageAsBase64('/images/agricapital-logo.jpg');
      const developerPhoto = await loadImageAsBase64('/images/developer-photo.jpg');
      const legalFormLogo = await loadImageAsBase64('/assets/logo.png');

      const primaryColor: [number, number, number] = [0, 124, 122];
      const goldColor: [number, number, number] = [184, 142, 50];
      const textColor: [number, number, number] = [30, 30, 30];
      const mutedColor: [number, number, number] = [100, 100, 100];

      const addHeader = (pageNum: number = 1, totalPages: number = 1) => {
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, pageWidth, 35, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('LEGAL FORM CI', margin, 22);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Documentation Technique & Guide Utilisateur', pageWidth - margin, 22, { align: 'right' });
        
        // Page number
        doc.setFontSize(8);
        doc.text(`Page ${pageNum}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      };

      const addFooter = () => {
        doc.setFillColor(248, 249, 250);
        doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
        doc.setTextColor(...mutedColor);
        doc.setFontSize(8);
        doc.text('© 2025 Legal Form CI - Documentation Officielle', margin, pageHeight - 8);
        doc.text('www.legalform.ci', pageWidth - margin, pageHeight - 8, { align: 'right' });
      };

      let currentPage = 1;
      const addNewPage = () => {
        doc.addPage();
        currentPage++;
        y = 50;
        addHeader(currentPage, 15);
        addFooter();
      };

      const addTitle = (text: string, size: number = 16, color: [number, number, number] = primaryColor) => {
        if (y > pageHeight - 50) addNewPage();
        doc.setTextColor(...color);
        doc.setFontSize(size);
        doc.setFont('helvetica', 'bold');
        doc.text(text, margin, y);
        y += size * 0.7;
        doc.setTextColor(...textColor);
        doc.setFont('helvetica', 'normal');
      };

      const addSubtitle = (text: string) => {
        if (y > pageHeight - 40) addNewPage();
        doc.setFillColor(...goldColor);
        doc.rect(margin, y - 4, 3, 12, 'F');
        doc.setTextColor(...textColor);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(text, margin + 8, y + 4);
        y += 12;
        doc.setFont('helvetica', 'normal');
      };

      const addParagraph = (text: string, size: number = 10) => {
        doc.setFontSize(size);
        doc.setTextColor(...textColor);
        const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
        for (const line of lines) {
          if (y > pageHeight - 25) addNewPage();
          doc.text(line, margin, y);
          y += size * 0.5;
        }
        y += 4;
      };

      const addBullet = (text: string, indent: number = 0) => {
        if (y > pageHeight - 25) addNewPage();
        doc.setFontSize(10);
        doc.setTextColor(...primaryColor);
        doc.text('•', margin + indent, y);
        doc.setTextColor(...textColor);
        const lines = doc.splitTextToSize(text, pageWidth - margin * 2 - 10 - indent);
        doc.text(lines[0], margin + 7 + indent, y);
        y += 6;
        if (lines.length > 1) {
          for (let i = 1; i < lines.length; i++) {
            doc.text(lines[i], margin + 7 + indent, y);
            y += 5;
          }
        }
      };

      const addNumberedItem = (num: string, text: string) => {
        if (y > pageHeight - 25) addNewPage();
        doc.setFillColor(...primaryColor);
        doc.circle(margin + 4, y - 2, 4, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(num, margin + 4, y, { align: 'center' });
        doc.setTextColor(...textColor);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(text, pageWidth - margin * 2 - 15);
        doc.text(lines[0], margin + 12, y);
        y += 6;
        if (lines.length > 1) {
          for (let i = 1; i < lines.length; i++) {
            doc.text(lines[i], margin + 12, y);
            y += 5;
          }
        }
      };

      const addInfoBox = (title: string, content: string) => {
        if (y > pageHeight - 50) addNewPage();
        doc.setFillColor(240, 248, 247);
        doc.roundedRect(margin, y, pageWidth - margin * 2, 25, 3, 3, 'F');
        doc.setDrawColor(...primaryColor);
        doc.setLineWidth(0.5);
        doc.roundedRect(margin, y, pageWidth - margin * 2, 25, 3, 3, 'S');
        doc.setTextColor(...primaryColor);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin + 5, y + 8);
        doc.setTextColor(...textColor);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const lines = doc.splitTextToSize(content, pageWidth - margin * 2 - 10);
        doc.text(lines, margin + 5, y + 16);
        y += 32;
      };

      // =============================================
      // PAGE DE GARDE
      // =============================================
      addHeader(1, 15);
      addFooter();
      
      y = 60;
      
      // Title
      doc.setFillColor(...primaryColor);
      doc.roundedRect(margin, y - 5, pageWidth - margin * 2, 40, 5, 5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(26);
      doc.setFont('helvetica', 'bold');
      doc.text('DOCUMENTATION OFFICIELLE', pageWidth / 2, y + 12, { align: 'center' });
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text('Plateforme de Création d\'Entreprises Legal Form CI', pageWidth / 2, y + 26, { align: 'center' });
      
      y += 55;
      
      // Version info box
      doc.setFillColor(248, 249, 250);
      doc.roundedRect(margin, y, pageWidth - margin * 2, 30, 3, 3, 'F');
      doc.setTextColor(...textColor);
      doc.setFontSize(11);
      doc.text('Version: 3.0.0', margin + 10, y + 12);
      doc.text(`Date: ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`, margin + 10, y + 22);
      doc.text('Licence: Propriétaire', pageWidth / 2 + 20, y + 12);
      doc.text('Statut: Production', pageWidth / 2 + 20, y + 22);
      
      y += 45;
      
      // Table des matières
      addTitle('TABLE DES MATIÈRES', 14, primaryColor);
      y += 5;
      
      const tocItems = [
        '1. Présentation de la Plateforme',
        '2. Architecture Technique',
        '3. Base de Données & Schéma',
        '4. Guide Administrateur',
        '5. Guide Équipe (Team)',
        '6. Guide Client',
        '7. Système de Paiement KkiaPay',
        '8. Edge Functions & API',
        '9. Sécurité & Authentification',
        '10. Déploiement & Maintenance',
        '11. Support & Contact Développeur'
      ];
      
      tocItems.forEach((item, i) => {
        if (y > pageHeight - 25) addNewPage();
        doc.setFontSize(11);
        doc.setTextColor(...textColor);
        doc.text(item, margin + 5, y);
        doc.setTextColor(...mutedColor);
        const dots = '.'.repeat(Math.floor((pageWidth - margin * 2 - doc.getTextWidth(item) - 30) / 2));
        doc.text(dots, margin + 5 + doc.getTextWidth(item) + 5, y);
        doc.text((i + 2).toString(), pageWidth - margin - 10, y);
        y += 8;
      });

      // =============================================
      // SECTION 1: PRÉSENTATION
      // =============================================
      addNewPage();
      addTitle('1. PRÉSENTATION DE LA PLATEFORME', 16, primaryColor);
      y += 5;
      
      addSubtitle('Qu\'est-ce que Legal Form CI ?');
      addParagraph('Legal Form CI est une plateforme digitale innovante dédiée à la création et la gestion d\'entreprises en Côte d\'Ivoire. Elle simplifie et accélère les démarches administratives pour les entrepreneurs ivoiriens et étrangers.');
      y += 5;
      
      addSubtitle('Fonctionnalités Principales');
      addBullet('Création d\'entreprises en ligne (SARL, SARLU, EI, SCI, ONG, Association, etc.)');
      addBullet('Suivi en temps réel des demandes avec numéro de tracking');
      addBullet('Paiement sécurisé via KkiaPay (Mobile Money, Cartes bancaires)');
      addBullet('Système de parrainage avec réductions de 10 000 FCFA');
      addBullet('Messagerie intégrée client-administrateur');
      addBullet('Génération automatique de factures et reçus PDF');
      addBullet('Assistant juridique IA "Legal Pro"');
      addBullet('Tableau de bord analytics avancé');
      addBullet('Gestion des actualités avec éditeur IA');
      addBullet('Support multilingue (Français, Anglais, Espagnol)');
      y += 5;
      
      addSubtitle('Types d\'Entreprises Supportées');
      addBullet('Entreprise Individuelle (EI)');
      addBullet('SARL - Société à Responsabilité Limitée');
      addBullet('SARLU - Société à Responsabilité Limitée Unipersonnelle');
      addBullet('SCI - Société Civile Immobilière');
      addBullet('ONG - Organisation Non Gouvernementale');
      addBullet('Association');
      addBullet('Fondation');
      addBullet('SCOOPS - Coopérative');
      addBullet('GIE - Groupement d\'Intérêt Économique');
      addBullet('Filiale');

      // =============================================
      // SECTION 2: ARCHITECTURE
      // =============================================
      addNewPage();
      addTitle('2. ARCHITECTURE TECHNIQUE', 16, primaryColor);
      y += 5;
      
      addSubtitle('Stack Frontend');
      addBullet('React 18 avec TypeScript pour la robustesse');
      addBullet('Vite comme bundler (build ultra-rapide)');
      addBullet('Tailwind CSS pour le styling moderne');
      addBullet('Shadcn/ui pour les composants accessibles');
      addBullet('React Query pour la gestion des données');
      addBullet('React Router v6 pour la navigation');
      addBullet('i18next pour l\'internationalisation');
      addBullet('Framer Motion pour les animations');
      y += 5;
      
      addSubtitle('Stack Backend (Supabase Cloud)');
      addBullet('PostgreSQL pour la base de données');
      addBullet('Row Level Security (RLS) pour la sécurité');
      addBullet('Edge Functions (Deno/TypeScript) pour la logique métier');
      addBullet('Realtime pour les notifications en temps réel');
      addBullet('Storage pour les fichiers et documents');
      addBullet('Auth pour l\'authentification');
      y += 5;
      
      addSubtitle('Intégrations Externes');
      addBullet('KkiaPay - Passerelle de paiement (Mobile Money, Cartes)');
      addBullet('Resend - Service d\'envoi d\'emails transactionnels');
      addBullet('IA Gemini/GPT - Génération de contenu et assistant');
      y += 5;
      
      addInfoBox('💡 Architecture Standalone', 
        'L\'application est 100% autonome après build. Elle peut être déployée sur n\'importe quel hébergeur (cPanel, Nginx, Apache) sans dépendance à Lovable.');

      // =============================================
      // SECTION 3: BASE DE DONNÉES
      // =============================================
      addNewPage();
      addTitle('3. BASE DE DONNÉES & SCHÉMA', 16, primaryColor);
      y += 5;
      
      addSubtitle('Tables Principales');
      addBullet('profiles - Profils utilisateurs avec codes parrainage');
      addBullet('user_roles - Rôles (admin, team, client)');
      addBullet('company_requests - Demandes de création d\'entreprise');
      addBullet('company_associates - Associés des entreprises');
      addBullet('service_requests - Demandes de services additionnels');
      addBullet('payments - Transactions de paiement');
      addBullet('payment_logs - Logs des événements de paiement');
      addBullet('identity_documents - Documents d\'identité uploadés');
      y += 5;
      
      addSubtitle('Tables de Contenu');
      addBullet('blog_posts - Articles et actualités');
      addBullet('created_companies - Vitrine des entreprises créées');
      addBullet('ebooks - E-books téléchargeables');
      addBullet('ebook_downloads - Téléchargements d\'e-books');
      y += 5;
      
      addSubtitle('Tables de Support');
      addBullet('contact_messages - Messages du formulaire de contact');
      addBullet('support_tickets - Tickets de support');
      addBullet('request_messages - Messagerie client-admin');
      addBullet('request_documents_exchange - Échange de documents');
      addBullet('lexia_conversations - Conversations avec l\'IA Legal Pro');
      addBullet('lexia_messages - Messages des conversations IA');
      addBullet('referral_withdrawals - Demandes de retrait parrainage');
      y += 5;
      
      addSubtitle('Fonctions Database');
      addBullet('is_admin(user_id) - Vérifie si l\'utilisateur est admin');
      addBullet('is_team_member(user_id) - Vérifie si admin ou team');
      addBullet('generate_tracking_number() - Génère numéros de suivi');
      addBullet('sync_payment_to_request() - Synchronise paiements');
      addBullet('generate_referral_code() - Génère codes parrainage');

      // =============================================
      // SECTION 4: GUIDE ADMINISTRATEUR
      // =============================================
      addNewPage();
      addTitle('4. GUIDE ADMINISTRATEUR', 16, primaryColor);
      y += 5;
      
      addSubtitle('Accès Administrateur');
      addParagraph('URL: /admin/dashboard');
      addParagraph('Le compte admin principal est admin@legalform.ci avec rôle "admin" dans la table user_roles.');
      y += 3;
      
      addSubtitle('Tableau de Bord Principal');
      addBullet('Vue d\'ensemble des statistiques en temps réel');
      addBullet('Nombre de demandes (en attente, en cours, terminées)');
      addBullet('Revenus du mois et de l\'année');
      addBullet('Graphiques de performance');
      addBullet('Notifications et alertes');
      y += 3;
      
      addSubtitle('Gestion des Demandes');
      addNumberedItem('1', 'Accédez à "Demandes" dans le menu latéral');
      addNumberedItem('2', 'Filtrez par statut: En attente, En cours, Terminée');
      addNumberedItem('3', 'Cliquez sur une demande pour voir les détails');
      addNumberedItem('4', 'Modifiez le statut et ajoutez des notes');
      addNumberedItem('5', 'Utilisez la messagerie pour communiquer avec le client');
      addNumberedItem('6', 'Uploadez les documents requis');
      y += 3;
      
      addSubtitle('Générateur de Factures');
      addNumberedItem('1', 'Allez dans "Facturation" > "Générer Facture"');
      addNumberedItem('2', 'Sélectionnez un client existant ou saisissez les infos');
      addNumberedItem('3', 'Ajoutez les lignes de facturation');
      addNumberedItem('4', 'Le cachet et la signature sont ajoutés automatiquement');
      addNumberedItem('5', 'Imprimez ou téléchargez le PDF');
      y += 3;
      
      addSubtitle('Gestion des Actualités');
      addNumberedItem('1', 'Menu "Actualités" pour créer/modifier des articles');
      addNumberedItem('2', 'Utilisez l\'éditeur riche (Markdown)');
      addNumberedItem('3', 'Cliquez "Générer avec l\'IA" pour auto-remplir les champs');
      addNumberedItem('4', 'Uploadez images et vidéos');
      addNumberedItem('5', 'Publiez ou planifiez l\'article');

      // =============================================
      // SECTION 5: GUIDE ÉQUIPE
      // =============================================
      addNewPage();
      addTitle('5. GUIDE ÉQUIPE (TEAM)', 16, primaryColor);
      y += 5;
      
      addSubtitle('Rôle Team vs Admin');
      addParagraph('Le rôle "team" a un accès limité par rapport à l\'admin:');
      addBullet('Peut voir et traiter les demandes');
      addBullet('Peut utiliser la messagerie');
      addBullet('Peut uploader des documents');
      addBullet('Ne peut PAS gérer les utilisateurs');
      addBullet('Ne peut PAS accéder aux paramètres système');
      addBullet('Ne peut PAS supprimer des demandes');
      y += 5;
      
      addSubtitle('Workflow de Traitement');
      addNumberedItem('1', 'Connectez-vous avec vos identifiants team');
      addNumberedItem('2', 'Consultez le tableau de bord pour les nouvelles demandes');
      addNumberedItem('3', 'Assignez-vous une demande en cliquant "Prendre en charge"');
      addNumberedItem('4', 'Vérifiez les documents et informations du client');
      addNumberedItem('5', 'Utilisez la messagerie pour demander des compléments');
      addNumberedItem('6', 'Mettez à jour le statut à chaque étape');
      addNumberedItem('7', 'Marquez "Terminée" quand le dossier est complet');

      // =============================================
      // SECTION 6: GUIDE CLIENT
      // =============================================
      addNewPage();
      addTitle('6. GUIDE CLIENT', 16, primaryColor);
      y += 5;
      
      addSubtitle('Création de Compte');
      addNumberedItem('1', 'Cliquez sur "Inscription" ou "Créer mon entreprise"');
      addNumberedItem('2', 'Remplissez email et mot de passe');
      addNumberedItem('3', 'Confirmez votre email (lien envoyé)');
      addNumberedItem('4', 'Connectez-vous à votre espace client');
      y += 5;
      
      addSubtitle('Processus de Création d\'Entreprise');
      addNumberedItem('1', 'Étape 1 - Société: Type, nom, capital, activités');
      addNumberedItem('2', 'Étape 2 - Localisation: Ville, commune, adresse');
      addNumberedItem('3', 'Étape 3 - Gérant: Informations du gérant');
      addNumberedItem('4', 'Étape 4 - Associés: Informations des associés');
      addNumberedItem('5', 'Étape 5 - Services: Services additionnels (optionnel)');
      addNumberedItem('6', 'Étape 6 - Récapitulatif: Vérification et paiement');
      y += 3;
      
      addInfoBox('💾 Sauvegarde Automatique', 
        'Vos données sont sauvegardées à chaque étape. Si vous quittez, vous retrouverez votre progression en revenant.');
      
      addSubtitle('Tableau de Bord Client');
      addBullet('Suivi de vos demandes en temps réel');
      addBullet('Numéro de tracking pour chaque demande');
      addBullet('Messagerie directe avec l\'équipe Legal Form');
      addBullet('Téléchargement de vos documents');
      addBullet('Historique des paiements et factures');
      addBullet('Section parrainage avec votre code unique');
      y += 5;
      
      addSubtitle('Système de Parrainage');
      addBullet('Chaque client reçoit un code parrainage unique');
      addBullet('Partagez votre code avec vos contacts');
      addBullet('Le filleul bénéficie de 10 000 FCFA de réduction');
      addBullet('Vous gagnez 10 000 FCFA par parrainage validé');
      addBullet('Demandez le retrait depuis votre espace');

      // =============================================
      // SECTION 7: PAIEMENT KKIAPAY
      // =============================================
      addNewPage();
      addTitle('7. SYSTÈME DE PAIEMENT KKIAPAY', 16, primaryColor);
      y += 5;
      
      addSubtitle('Configuration');
      addParagraph('Les clés KkiaPay sont stockées dans les secrets Supabase:');
      addBullet('KKIAPAY_PUBLIC_KEY - Clé publique (frontend)');
      addBullet('KKIAPAY_PRIVATE_KEY - Clé privée (backend)');
      addBullet('KKIAPAY_SECRET - Secret pour webhooks');
      y += 5;
      
      addSubtitle('Modes de Paiement Supportés');
      addBullet('Mobile Money (MTN, Orange, Moov, Wave)');
      addBullet('Cartes bancaires (Visa, Mastercard)');
      y += 5;
      
      addSubtitle('Flux de Paiement');
      addNumberedItem('1', 'Le client soumet sa demande');
      addNumberedItem('2', 'Le widget KkiaPay s\'ouvre avec le montant');
      addNumberedItem('3', 'Le client choisit son mode de paiement');
      addNumberedItem('4', 'Paiement effectué (code OTP si Mobile Money)');
      addNumberedItem('5', 'Webhook reçu par verify-kkiapay-payment');
      addNumberedItem('6', 'Statut mis à jour en base de données');
      addNumberedItem('7', 'Email de confirmation + reçu PDF envoyé');
      y += 5;
      
      addSubtitle('URL Webhook');
      addParagraph('https://qeznwyczskbjaeyhvuis.supabase.co/functions/v1/verify-kkiapay-payment');
      y += 3;
      
      addInfoBox('⚠️ Important', 
        'Configurez cette URL dans votre dashboard KkiaPay pour recevoir les notifications de paiement.');

      // =============================================
      // SECTION 8: EDGE FUNCTIONS
      // =============================================
      addNewPage();
      addTitle('8. EDGE FUNCTIONS & API', 16, primaryColor);
      y += 5;
      
      addSubtitle('Edge Functions Déployées');
      addBullet('create-payment - Initialise un paiement KkiaPay');
      addBullet('verify-kkiapay-payment - Vérifie et confirme les paiements');
      addBullet('payment-webhook - Reçoit les webhooks KkiaPay');
      addBullet('send-notification - Envoie des emails via Resend');
      addBullet('send-payment-notification - Notifications de paiement');
      addBullet('send-status-notification - Notifications de changement de statut');
      addBullet('ai-content-generator - Génération IA pour actualités');
      addBullet('lexia-chat - Assistant IA Legal Pro');
      addBullet('create-super-admin - Création compte super admin');
      addBullet('delete-admin-user - Suppression utilisateur admin');
      addBullet('upload-document - Upload sécurisé de documents');
      addBullet('notify-id-validation - Notification validation ID');
      addBullet('secure-public-tracking - Suivi public sécurisé');
      y += 5;
      
      addSubtitle('Base URL API');
      addParagraph('https://qeznwyczskbjaeyhvuis.supabase.co/functions/v1/');

      // =============================================
      // SECTION 9: SÉCURITÉ
      // =============================================
      addNewPage();
      addTitle('9. SÉCURITÉ & AUTHENTIFICATION', 16, primaryColor);
      y += 5;
      
      addSubtitle('Authentification');
      addBullet('Inscription par email/mot de passe');
      addBullet('Confirmation d\'email obligatoire');
      addBullet('Réinitialisation de mot de passe sécurisée');
      addBullet('Sessions JWT avec refresh automatique');
      addBullet('Tokens sécurisés côté client (localStorage)');
      y += 5;
      
      addSubtitle('Row Level Security (RLS)');
      addParagraph('Toutes les tables sont protégées par RLS. Chaque utilisateur ne peut accéder qu\'à ses propres données.');
      addBullet('is_admin() - Vérifie le rôle admin');
      addBullet('is_team_member() - Vérifie rôle admin ou team');
      addBullet('auth.uid() - ID de l\'utilisateur connecté');
      y += 5;
      
      addSubtitle('Rôles Utilisateurs');
      addBullet('admin - Accès complet à toutes les fonctionnalités');
      addBullet('team - Accès limité (traitement demandes, messagerie)');
      addBullet('client - Accès à son espace personnel uniquement');
      y += 5;
      
      addSubtitle('Bonnes Pratiques');
      addBullet('Ne jamais exposer les clés privées côté client');
      addBullet('Utiliser HTTPS obligatoirement en production');
      addBullet('Valider toutes les entrées utilisateur');
      addBullet('Logger les actions sensibles');

      // =============================================
      // SECTION 10: DÉPLOIEMENT
      // =============================================
      addNewPage();
      addTitle('10. DÉPLOIEMENT & MAINTENANCE', 16, primaryColor);
      y += 5;
      
      addSubtitle('Build de Production');
      addNumberedItem('1', 'Exécutez: npm install');
      addNumberedItem('2', 'Exécutez: npm run build');
      addNumberedItem('3', 'Le dossier dist/ contient les fichiers à déployer');
      y += 5;
      
      addSubtitle('Déploiement cPanel');
      addNumberedItem('1', 'Connectez-vous au cPanel de votre hébergeur');
      addNumberedItem('2', 'Ouvrez le Gestionnaire de fichiers');
      addNumberedItem('3', 'Accédez à public_html (ou votre dossier web)');
      addNumberedItem('4', 'Uploadez le contenu du dossier dist/');
      addNumberedItem('5', 'Créez le fichier .htaccess (voir ci-dessous)');
      addNumberedItem('6', 'Configurez le certificat SSL');
      y += 5;
      
      addSubtitle('Configuration .htaccess');
      doc.setFont('courier', 'normal');
      doc.setFontSize(9);
      const htaccess = [
        'RewriteEngine On',
        'RewriteBase /',
        'RewriteRule ^index\\.html$ - [L]',
        'RewriteCond %{REQUEST_FILENAME} !-f',
        'RewriteCond %{REQUEST_FILENAME} !-d',
        'RewriteRule . /index.html [L]'
      ];
      htaccess.forEach(line => {
        if (y > pageHeight - 25) addNewPage();
        doc.text(line, margin + 5, y);
        y += 5;
      });
      doc.setFont('helvetica', 'normal');
      y += 5;
      
      addSubtitle('Maintenance');
      addBullet('Sauvegardes automatiques via Supabase Cloud');
      addBullet('Monitoring des logs dans le dashboard');
      addBullet('Analytics disponibles dans /admin/analytics');
      addBullet('Mise à jour: rebuild + upload dist/');

      // =============================================
      // SECTION 11: SUPPORT & CONTACT
      // =============================================
      addNewPage();
      addTitle('11. SUPPORT & CONTACT DÉVELOPPEUR', 16, primaryColor);
      y += 10;
      
      // Developer card
      doc.setFillColor(248, 249, 250);
      doc.roundedRect(margin, y, pageWidth - margin * 2, 80, 5, 5, 'F');
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(1);
      doc.roundedRect(margin, y, pageWidth - margin * 2, 80, 5, 5, 'S');
      
      // Developer photo placeholder
      if (developerPhoto) {
        doc.addImage(developerPhoto, 'JPEG', margin + 10, y + 10, 50, 60);
      } else {
        doc.setFillColor(...primaryColor);
        doc.roundedRect(margin + 10, y + 10, 50, 60, 3, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.text('IK', margin + 35, y + 45, { align: 'center' });
      }
      
      // Developer info
      doc.setTextColor(...textColor);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Inocent KOFFI', margin + 70, y + 20);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...primaryColor);
      doc.text('Développeur Freelance Full Stack', margin + 70, y + 30);
      doc.setTextColor(...textColor);
      doc.setFontSize(10);
      doc.text('📞 +225 07 59 56 60 87', margin + 70, y + 42);
      doc.text('📧 inocent.koffi@agricapital.ci', margin + 70, y + 52);
      doc.text('🌐 www.ikoffi.agricapital.ci', margin + 70, y + 62);
      doc.text('💼 AgriCapital CI', margin + 70, y + 72);
      
      y += 95;
      
      addSubtitle('Support Legal Form');
      addBullet('Email: support@legalform.ci');
      addBullet('Email: monentreprise@legalform.ci');
      addBullet('Téléphone: +225 07 09 67 79 25');
      addBullet('Site web: www.legalform.ci');
      y += 5;
      
      addSubtitle('Hébergement');
      addBullet('Hébergeur: Safari Cloud (cPanel)');
      addBullet('Backend: Supabase Cloud (PostgreSQL)');
      addBullet('CDN: Cloudflare (optionnel)');
      y += 10;
      
      // Final note
      doc.setFillColor(...primaryColor);
      doc.roundedRect(margin, y, pageWidth - margin * 2, 25, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Merci d\'utiliser Legal Form CI !', pageWidth / 2, y + 10, { align: 'center' });
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Cette documentation est mise à jour régulièrement. Dernière version: ' + new Date().toLocaleDateString('fr-FR'), pageWidth / 2, y + 18, { align: 'center' });

      // Save
      doc.save('Documentation_LegalForm_v3.0.pdf');
      
      toast({
        title: "Documentation générée",
        description: "Le fichier PDF a été téléchargé avec succès",
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
      description: "Vue d'ensemble de la plateforme Legal Form et ses fonctionnalités"
    },
    {
      icon: Server,
      title: "Architecture Technique",
      description: "Stack: React, TypeScript, Supabase, Edge Functions"
    },
    {
      icon: Database,
      title: "Base de Données",
      description: "Schéma PostgreSQL, tables, relations et politiques RLS"
    },
    {
      icon: UserCircle,
      title: "Guide Administrateur",
      description: "Accès complet, gestion utilisateurs, facturation"
    },
    {
      icon: Users,
      title: "Guide Équipe",
      description: "Traitement des demandes, messagerie, documents"
    },
    {
      icon: Building2,
      title: "Guide Client",
      description: "Création d'entreprise, suivi, parrainage"
    },
    {
      icon: CreditCard,
      title: "Paiement KkiaPay",
      description: "Mobile Money, cartes, webhooks, confirmation"
    },
    {
      icon: Shield,
      title: "Sécurité & Auth",
      description: "RLS, rôles, JWT, bonnes pratiques"
    },
    {
      icon: Settings,
      title: "Déploiement",
      description: "Build, cPanel, .htaccess, maintenance"
    },
    {
      icon: HelpCircle,
      title: "Support",
      description: "Contact développeur, hébergeur, ressources"
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Documentation</h1>
            <p className="text-slate-400 mt-1">Documentation technique complète et guides utilisateur</p>
          </div>
          <Button 
            onClick={generateDocumentation} 
            disabled={generating}
            className="bg-primary hover:bg-primary/90"
            size="lg"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Download className="mr-2 h-5 w-5" />
                Télécharger le PDF Complet
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
                  Guide complet: installation, configuration, utilisation par rôle, maintenance et support
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Card key={index} className="bg-slate-800 border-slate-700 hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-white text-sm">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    {section.title}
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs">
                    {section.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Developer Info Card */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" />
              Développeur & Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                  <img 
                    src="/images/developer-photo.jpg" 
                    alt="Inocent KOFFI" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <span className="text-2xl font-bold text-primary hidden">IK</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Inocent KOFFI</h3>
                  <p className="text-primary text-sm">Développeur Freelance Full Stack</p>
                </div>
              </div>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-slate-300">
                  <span>📞</span>
                  <span>+225 07 59 56 60 87</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <span>📧</span>
                  <span>inocent.koffi@agricapital.ci</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <span>🌐</span>
                  <a href="https://www.ikoffi.agricapital.ci" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    www.ikoffi.agricapital.ci
                  </a>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <span>💼</span>
                  <span>AgriCapital CI</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
              <CardTitle className="text-white">Contact Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Email Principal</span>
                <span className="text-white">support@legalform.ci</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Email Commercial</span>
                <span className="text-white">monentreprise@legalform.ci</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Téléphone</span>
                <span className="text-white">+225 07 09 67 79 25</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Site Web</span>
                <span className="text-white">www.legalform.ci</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Hébergeur</span>
                <span className="text-white">Safari Cloud (cPanel)</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Documentation;
