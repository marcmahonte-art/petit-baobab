# Product Design Review — Petit Baobab

**Mode:** Review  
**Surfaces inspectées:** Landing, Dashboard, Coloriage, Dessin Magique, Livres de coloriage, Parents, Paramètres, School, Login/Signup, Design tokens, Composants  
**Source:** Analyse du code source et des fichiers de spécification

---

## P0 — Bloque la tâche principale ou cause un dommage irrécupérable

### 1. Accents français manquants dans tout le produit
- **Localisation :** Landing (`page.tsx:63-64`), Magic Drawing, Settings, Sidebar, Header, et partout
- **Problème :** Le produit entier souffre de l'absence d'accents français : `"creativite"` → `"créativité"`, `"Telecharger"` → `"Télécharger"`, `"Parametres"` → `"Paramètres"`, `"securise"` → `"sécurisé"`, `"decris"` → `"décris"`, `"eveille"` → `"éveille"`, `"Selectionnez"` → `"Sélectionnez"`, etc.
- **Conséquence :** Le produit cible des enfants et des parents francophones. Ces fautes nuisent gravement à la crédibilité et à l'expérience éducative.
- **Fix :** Passe globale de correction des accents sur tous les fichiers source.

### 2. Navigation mobile non fonctionnelle
- **Localisation :** `src/components/mobile-bottom-nav.tsx:22-24`
- **Problème :** Les 5 liens du bottom nav utilisent `<a href="#">` — aucune navigation réelle.
- **Conséquence :** Sur mobile, l'utilisateur est bloqué sans accès aux pages principales via la barre du bas.
- **Fix :** Remplacer par des `<Link>` de Next.js pointant vers `/dashboard`, `/coloriage`, `/magic-drawing`, etc.

### 3. Bannière héro codée en dur avec "Awa"
- **Localisation :** `src/components/hero-banner.tsx:24-27`
- **Problème :** Le message "Bonjour Awa !" ignore le profil actif de l'enfant.
- **Conséquence :** Si l'enfant s'appelle Kofi ou a choisi un autre prénom, le message de bienvenue est incorrect.
- **Fix :** Lire le nom depuis `useProfileStore` au lieu de le coder en dur.

---

## P1 — Risque d'échec de la tâche, état critique manquant, défaut d'accessibilité majeur

### 4. Modules de fonctionnalités inactifs (liens vers `#`)
- **Localisation :** `src/components/sidebar.tsx:10-18`, `src/components/feature-modules.tsx:11-13`
- **Problème :** Jeux éducatifs, Histoires, Activités pointent tous vers `#`. Aucune indication qu'ils ne sont pas encore disponibles.
- **Conséquence :** L'utilisateur clique et obtient une page blanche ou un scroll en haut.
- **Fix :** Ajouter un badge "Bientôt" ou `disabled` sur ces entrées de navigation, ou rediriger vers une page coming soon.

### 5. Pas d'état "Aucun dessin" dans le tableau de bord
- **Localisation :** Section `RecentColorings` sur le Dashboard
- **Problème :** Pour un nouvel utilisateur sans coloriages, la section affiche un grid vide sans message ni guidance.
- **Conséquence :** L'enfant ne comprend pas pourquoi il n'y a rien et ne sait pas quoi faire.
- **Fix :** Ajouter un état vide avec illustration et message d'invitation ("Commence par colorier un dessin !").

### 6. Pas d'état de chargement/erreur sur le Dashboard
- **Localisation :** `src/app/dashboard/page.tsx:9-43`
- **Problème :** Le composant est entièrement statique côté serveur. Aucun squelette (skeleton) ni fallback pour les données utilisateur.
- **Conséquence :** En cas de latence réseau ou d'erreur, l'utilisateur voit un écran vide ou cassé.
- **Fix :** Ajouter des états `loading` (skeleton) et `error` avec message.

### 7. Paramètres sans validation
- **Localisation :** `src/app/parametres/page.tsx`
- **Problème :** Le prénom de l'enfant peut être vide ou contenir des caractères spéciaux. Aucune validation.
- **Conséquence :** Un nom vide ou invalide peut causer des bugs d'affichage ailleurs dans l'app.
- **Fix :** Ajouter `required` + validation de longueur min/max sur le champ prénom.

### 8. Gestion d'erreur API incomplète
- **Localisation :** `src/app/magic-drawing/page.tsx`
- **Problème :** `generationError` existe mais ne couvre pas tous les cas (ratelimit, timeout, contenu inapproprié).
- **Conséquence :** L'utilisateur peut voir une erreur générique sans savoir quoi faire.
- **Fix :** Ajouter des messages d'erreur spécifiques et des actions de récupération.

---

## P2 — Friction significative, incohérence, hiérarchie faible

### 9. Décalage entre le design system et l'implémentation
- **Localisation :** `src/lib/tokens/colors.ts` vs composants individuels
- **Problème :** Les tokens définissent `primary: "#6D4CFF"` mais le code utilise `#635BFF`, `#7C57FF`, `#7D6AF8` selon les pages — 3 nuances de violet différentes. Les radius tokens existent mais ne sont pas utilisés uniformément.
- **Conséquence :** Incohérence visuelle entre les pages, sentiment de produit non fini.
- **Fix :** Unifier la palette violette et remplacer toutes les valeurs hardcodées par les tokens.

### 10. Toggle EN/FR ignore Mooré et Dioula
- **Localisation :** `src/components/header.tsx:49-52`
- **Problème :** Le bouton langue bascule seulement FR↔EN. L'utilisateur qui choisit Mooré ou Dioula dans les paramètres ne verra jamais cette langue dans le header.
- **Conséquence :** L'utilisateur peut penser que la langue a changé alors que non.
- **Fix :** Synchroniser le toggle de langue du header avec le store `useI18nStore`.

### 11. Notifications mockées, pas réelles
- **Localisation :** `src/components/header.tsx:28-33`
- **Problème :** Les notifications sont codées en dur dans un `useState`. Aucune intégration Supabase. "Tout marquer comme lu" vide juste la liste locale.
- **Conséquence :** Fonctionnalité trompeuse — l'utilisateur croit avoir des notifications réelles.
- **Fix :** Intégrer avec une table Supabase `notifications` ou retirer la fonctionnalité jusqu'à ce qu'elle soit réelle.

### 12. Galerie de dessins localStorage seulement
- **Localisation :** `src/features/drawings/DrawingService.ts`
- **Problème :** Le fallback localStorage est utilisé sans synchro cloud fiable.
- **Conséquence :** L'utilisateur perd ses dessins en changeant d'appareil ou en effaçant son cache.
- **Fix :** Prioriser la synchro Supabase avec fallback localStorage en mode hors-ligne.

### 13. Feedback visuel retardé lors du switch de profil
- **Localisation :** `src/components/header.tsx`
- **Problème :** Changer de profil enfant met à jour le store mais le header utilise des `useState` locaux qui ne réagissent qu'au `useEffect`. Le header peut afficher l'ancien profil pendant un render cycle.
- **Conséquence :** Confusion visuelle pour l'enfant qui change de profil.
- **Fix :** Lire `activeProfile` directement depuis le store au lieu de copier dans un state local.

### 14. PIN parental non vérifié côté serveur
- **Localisation :** `src/app/parametres/page.tsx`
- **Problème :** Le code PIN est stocké en localStorage uniquement — contournable en effaçant les données navigateur.
- **Conséquence :** La protection parentale est illusoire.
- **Fix :** Stocker le PIN hashé côté serveur (table Supabase `parental_pins`).

### 15. "Coming Soon" sans indication visuelle
- **Localisation :** `src/app/school/page.tsx`, `src/components/feature-modules.tsx`
- **Problème :** Les modules "Jeux éducatifs", "Histoires", "Activités" n'ont aucune indication qu'ils ne sont pas encore disponibles.
- **Conséquence :** L'utilisateur clique et arrive sur une page vide ou un scroll vers le haut.
- **Fix :** Ajouter un overlay "Bientôt disponible" ou `disabled` + tooltip.

---

## P3 — Amélioration mineure de fabrication ou de cohérence

### 16. Pas de `placeholder="blur"` sur les images Next.js
- **Localisation :** Plusieurs composants
- **Problème :** Plusieurs `<Image>` n'ont pas de gestion d'état de chargement ou d'erreur.
- **Fix :** Ajouter `placeholder="blur"` et `onError` sur les images critiques.

### 17. Typos dans les commentaires et le code
- **Localisation :** Divers fichiers
- **Problème :** `"intelligens"` → `"intelligents"`, `"Selectionnez"` → `"Sélectionnez"`, etc.
- **Fix :** Passe de correction orthographique.

### 18. Hero banner non responsive sur très petits écrans
- **Localisation :** `src/components/hero-banner.tsx`
- **Problème :** `whitespace-nowrap` sur le titre peut déborder sur écran <360px.
- **Fix :** Remplacer par `whitespace-normal` sur mobile ou utiliser une media query.

### 19. Boutons icônes sans `aria-label`
- **Localisation :** Header, Magic Drawing, Coloriage
- **Problème :** Les boutons Bell, Globe, Heart, Download, Printer, etc. manquent d'étiquettes accessibles.
- **Conséquence :** Inaccessible aux lecteurs d'écran.
- **Fix :** Ajouter `aria-label` sur tous les boutons icônes.

### 20. Prix en FCFA uniquement, sans option devise
- **Localisation :** `parents/page.tsx`
- **Problème :** L'application pourrait viser une audience internationale mais les prix sont fixes en FCFA.
- **Fix :** Ajouter une conversion ou un paramètre de devise.

---

## Recommandations prioritaires

1. **Corriger tous les accents français** sur l'ensemble du code — passe globale de find/replace.
2. **Rendre le bottom nav fonctionnel** avec des `<Link>` Next.js vers les routes réelles.
3. **Remplacer "Awa" par le nom du profil actif** dans le Hero banner via `useProfileStore`.
4. **Unifier la palette violette** : choisir un seul violet (`#6D4CFF` du design token) et l'utiliser partout.
5. **Ajouter des états d'erreur et de chargement** (skeleton) sur toutes les pages asynchrones.
6. **Ajouter `aria-label`** sur tous les boutons icônes pour l'accessibilité.
