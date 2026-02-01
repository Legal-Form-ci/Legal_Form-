# Guide de Déploiement - LegalForm

## 1. Build de Production

### Prérequis
- Node.js 18+ installé
- npm ou yarn

### Générer le build

```bash
# Installer les dépendances
npm install

# Générer le build de production
npm run build
```

Le dossier `dist/` contiendra tous les fichiers prêts à déployer.

## 2. Déploiement sur cPanel (SafariCloud)

### Étape 1: Télécharger les fichiers build
1. Ouvrez le **Gestionnaire de fichiers** dans cPanel
2. Naviguez vers le dossier `public_html/` ou le sous-domaine cible
3. Téléversez tout le contenu du dossier `dist/`

### Étape 2: Configurer le fichier .htaccess
Créez un fichier `.htaccess` à la racine avec ce contenu:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Handle Single Page Application routing
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
  
  # Security Headers
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
  
  # Cache Control
  <FilesMatch "\.(html)$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
  </FilesMatch>
  
  <FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$">
    Header set Cache-Control "public, max-age=31536000"
  </FilesMatch>
</IfModule>

# Enable Gzip compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/css application/json
  AddOutputFilterByType DEFLATE application/javascript text/xml application/xml
</IfModule>
```

## 3. Variables d'Environnement

L'application nécessite ces variables d'environnement (déjà configurées dans Lovable Cloud):

- `VITE_SUPABASE_URL` - URL du projet Supabase
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Clé publique Supabase

Ces valeurs sont intégrées au build lors de la génération.

## 4. Configuration Backend (Supabase)

### Webhooks KkiaPay
Configurez dans votre dashboard KkiaPay:
```
Webhook URL: https://qeznwyczskbjaeyhvuis.supabase.co/functions/v1/verify-kkiapay-payment
```

### Edge Functions Déployées
Les fonctions suivantes sont actives:
- `create-payment` - Création de paiements
- `payment-webhook` - Webhook de paiement
- `verify-kkiapay-payment` - Vérification KkiaPay
- `ai-content-generator` - Génération IA pour actualités
- `send-notification` - Envoi d'emails
- `send-status-notification` - Notifications de statut

## 5. Domaine Personnalisé

Pour configurer votre domaine personnalisé (ex: legalform.ci):

1. Pointez les DNS vers votre hébergeur
2. Ajoutez le domaine dans cPanel
3. Installez un certificat SSL (Let's Encrypt gratuit via cPanel)

## 6. Architecture

```
Frontend (React/Vite)
    ↓
Supabase (Backend-as-a-Service)
    ├── Auth (Authentification)
    ├── Database (PostgreSQL)
    ├── Edge Functions (API)
    └── Storage (Fichiers)
```

L'application est **100% indépendante** de Lovable après le build.
Toutes les connexions sont directes entre le frontend et Supabase.

## 7. Sécurité

- RLS (Row Level Security) activée sur toutes les tables
- Authentification par email/mot de passe
- Tokens JWT pour les sessions
- Headers de sécurité HTTP configurés
- Validation des entrées côté client et serveur

## 8. Maintenance

### Sauvegardes
Les données sont stockées sur Supabase Cloud avec sauvegardes automatiques.

### Mises à jour
1. Modifier le code source
2. Régénérer le build (`npm run build`)
3. Remplacer les fichiers sur le serveur

## 9. Support

Pour toute assistance technique:
- Email: support@legalform.ci
- Documentation Supabase: https://supabase.com/docs
