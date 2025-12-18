# Guide de Déploiement - LegalForm

## ✅ Étapes Complétées

### 1. Système i18n (Multilingue)
- ✅ Configuration i18next avec français et anglais
- ✅ Bouton de sélection de langue dans le header
- ✅ Fichiers de traduction: `src/i18n/locales/fr.json` et `src/i18n/locales/en.json`

### 2. Compte Super Admin
- ✅ Edge function `create-super-admin` déployée
- ✅ Page de setup: `/setup-admin`
- ✅ Credentials: 
  - Email: admin@legalform.ci
  - Mot de passe: @LegalForm2025

**Pour créer le compte admin, visitez:** `https://votre-domaine.com/setup-admin`

### 3. Service Worker & Cache Offline
- ✅ Service Worker configuré dans `public/sw.js`
- ✅ Manifest PWA dans `public/manifest.json`
- ✅ Auto-registration au démarrage de l'app

### 4. Google Analytics
- ✅ Configuration dans `src/utils/analytics.ts`
- ✅ Tracking des pages et événements
- ✅ Tracking des conversions

**IMPORTANT:** Remplacez `G-XXXXXXXXXX` dans `src/utils/analytics.ts` par votre vrai ID Google Analytics.

### 5. Optimisation des Images
- ✅ Composant `OptimizedImage` avec lazy loading
- ✅ Intersection Observer pour chargement progressif
- ✅ Placeholder pendant le chargement
- ✅ Utilitaires dans `src/utils/imageOptimization.ts`

## 📋 Configuration Requise Avant Déploiement

### 1. Google Analytics
Mettez à jour le fichier `src/utils/analytics.ts`:
```typescript
const MEASUREMENT_ID = 'G-VOTRE-ID-ANALYTICS'; // Remplacer ici
```

### 2. Secrets FedaPay
Les secrets suivants doivent être configurés:
- ✅ FEDAPAY_SECRET_KEY (déjà configuré)
- ✅ FEDAPAY_WEBHOOK_SECRET (déjà configuré)

### 3. Création du Super Admin
1. Visitez `/setup-admin` sur votre domaine
2. Cliquez sur "Créer le compte super admin"
3. Vous serez automatiquement connecté

### 4. Service Worker
Le Service Worker est automatiquement enregistré. Pour vérifier:
1. Ouvrez DevTools > Application > Service Workers
2. Vérifiez que le SW est actif

## 🚀 Déploiement

### Frontend
1. Cliquez sur le bouton "Publish" dans Lovable
2. Cliquez sur "Update" pour déployer les changements frontend

### Backend (Automatique)
- Les Edge Functions sont déployées automatiquement
- Les migrations de base de données sont appliquées automatiquement

## 🧪 Tests Recommandés

### Tests Manuels Post-Déploiement
1. **Authentification:**
   - [ ] Créer un compte utilisateur
   - [ ] Se connecter avec le super admin
   - [ ] Tester la déconnexion

2. **Création d'entreprise:**
   - [ ] Remplir le formulaire de création
   - [ ] Vérifier la génération du numéro de suivi
   - [ ] Tester le téléchargement de documents

3. **Paiement:**
   - [ ] Initier un paiement FedaPay
   - [ ] Vérifier le webhook de confirmation
   - [ ] Vérifier l'email de confirmation

4. **Multilingue:**
   - [ ] Basculer entre français et anglais
   - [ ] Vérifier que les traductions s'appliquent
   - [ ] Vérifier la persistance de la langue

5. **Performance:**
   - [ ] Vérifier le lazy loading des images
   - [ ] Tester le mode offline (désactiver internet)
   - [ ] Vérifier les temps de chargement

6. **Analytics:**
   - [ ] Vérifier que les pages sont trackées dans GA
   - [ ] Vérifier les événements de conversion
   - [ ] Vérifier le tracking des formulaires

## 📱 PWA (Progressive Web App)

L'application est maintenant installable comme PWA:
- Sur mobile: Bouton "Ajouter à l'écran d'accueil"
- Sur desktop: Bouton d'installation dans la barre d'adresse

## 🔧 Maintenance

### Mise à jour des traductions
Modifiez les fichiers:
- `src/i18n/locales/fr.json` (français)
- `src/i18n/locales/en.json` (anglais)

### Cache Offline
Pour mettre à jour le cache, changez la version dans `public/sw.js`:
```javascript
const CACHE_NAME = 'legalform-v2'; // Incrémenter le numéro
```

## ⚠️ Points d'Attention

1. **Images:** Pour une optimisation maximale en production, considérez:
   - Conversion en WebP côté serveur
   - Utilisation d'un CDN d'images
   - Compression automatique

2. **Tests Automatisés:** 
   - Les tests E2E nécessitent Playwright ou Cypress (non inclus)
   - Tests unitaires recommandés avec Vitest

3. **SEO:**
   - Vérifiez les meta tags sur chaque page
   - Ajoutez structured data (JSON-LD) si nécessaire
   - Configurez sitemap.xml et robots.txt

4. **Performance:**
   - Utilisez Lighthouse pour analyser les performances
   - Optimisez le bundle size si nécessaire
   - Activez la compression GZIP/Brotli sur le serveur

## 📞 Support

Pour toute question, contactez l'équipe de développement ou consultez la documentation Lovable.
