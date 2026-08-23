# 🎨 Icônes du projet Petit Baobab — Document de référence

> **But** : liste complète de toutes les icônes utilisées dans le projet, pour pouvoir les recréer / personnaliser.

---

## 1. Bibliothèque utilisée

| | |
|---|---|
| **Bibliothèque** | [lucide-react](https://lucide.dev) |
| **Version** | `^1.25.0` (seule lib d'icônes du projet) |
| **Fichiers concernés** | ~150 fichiers |
| **Icônes uniques** | **176 icônes lucide-react** |

Le type TypeScript `LucideIcon` est aussi utilisé (`nav-items.ts`, `Book.ts`, `BookFrame.ts`, `BookStyle.ts`, `InputField.tsx`).

En complément : **SVG inline "maison"** (logos sociaux, WhatsApp, archive) — voir section 5.

---

## ✅ Icônes personnalisées DÉJÀ CRÉÉES (disponibles)

> **Dossier** : `C:\Users\Lenovo\Desktop\Petit Baobab Marketing\icon`
> **Style** : rendu **3D type emoji** (coloré, ludique) — cohérent avec l'univers enfant.
> **Format** : PNG (⚠️ fond noir à détourer en transparent avant intégration dans l'app).

| Fichier PNG | Remplace l'icône lucide | Usage dans l'app |
|---|---|---|
| `coloriages.png` | `Palette` | Atelier de coloriage |
| `dessins.png` | `Pencil` | Mes dessins / dessiner |
| `etoiles.png` | `Star` ⭐ | Étoiles (monnaie du jeu + avis) — **prioritaire** |
| `histoires.png` | `BookHeart` | Histoires |
| `imprimer-impressions.png` | `Printer` | Impression |
| `jeux educatifs.png` | `Gamepad2` | Jeux éducatifs |
| `livres.png` | `BookOpen` 📖 | Mes livres — **prioritaire** |
| `marqueur IA.png` | `Sparkles` ✨ | Marqueur "IA" — **prioritaire** |
| `notifications.png` | `Bell` 🔔 | Notifications — **prioritaire** |
| `paramètres.png` | `Settings` ⚙️ | Paramètres — **prioritaire** |
| `recompenses.png` | `Award` | Récompenses |
| `recompenses - coupe.png` | `Trophy` | Trophée / classement |
| `robot - generer par ia.png` | `Bot` / `BrainCircuit` | Coach IA / génération IA |
| `telecharger en pdf.png` | `Download` / `FileDown` ⬇️ | Téléchargement PDF — **prioritaire** |
| `utilisateurs-users.png` | `Users` 👥 | Espace parent / élèves — **prioritaire** |
| `validation.png` | `CheckCircle` ✅ | Validation/succès |

### À faire pour intégrer ces icônes
1. **Détourer** les PNG (remplacer le fond noir par la transparence).
2. Les copier vers `public/icons/` (ou `public/badges/` pour combler l'anomalie des badges).
3. Créer un fichier central `src/components/icons/index.tsx` qui mappe chaque nom lucide → composant custom :
   ```tsx
   import Star from "@/components/icons/custom/etoiles";
   // puis ré-exporter sous le même nom que lucide pour un remplacement sans toucher aux imports
   ```
4. Idéalement, redemander des versions **SVG** au graphiste pour un rendu net à toutes tailles.

### Icônes prioritaires restant à créer
D'après le top transverse (section 3), il manque encore : `Check`/`X`, `ArrowLeft`/`ArrowRight`, `Loader2`, `Search`, `X` (fermer), `Home`, `Bookmark`, `Send`.

---

## 2. Icônes lucide-react groupées par module

### 2.1 Landing page / pages publiques

| Icône | Fichier | Usage |
|---|---|---|
| `Menu` | `landing/Header.tsx` | Burger menu mobile |
| `ArrowRight` | `landing/Hero.tsx`, `HowItWorks.tsx`, `AboutPage.tsx` | Flèches CTA |
| `Play` | `landing/Hero.tsx` | Bouton lecture vidéo/démo |
| `ShieldCheck` | `landing/Hero.tsx`, About, boutique | Confiance/sécurité |
| `Ban` | `landing/Hero.tsx`, coloring-books | Sans pub / filtre |
| `Award` | `landing/Hero.tsx`, child-dashboard | Récompense |
| `Palette` | `landing/FeatureStrip.tsx`, About | Coloriage |
| `Bot` | `landing/FeatureStrip.tsx` | IA |
| `BookOpen` | FeatureStrip, About, partout | Livres |
| `Gamepad2` | FeatureStrip, nav enfant | Jeux |
| `BookHeart` | `landing/FeatureStrip.tsx` | Histoires |
| `Star` | Testimonials, LandingPage, CreateBookBanner… | Évaluations / étoiles |
| `Download` | HowItWorks | Téléchargement |
| `Check` | FonctionnalitesPage | Liste à puces |
| `BadgeCheck`, `GraduationCap`, `Heart`, `Leaf`, `Map`, `Pencil`, `School`, `Smartphone`, `Sparkles`, `Sprout`, `UsersRound`, `WandSparkles` | `about/AboutPage.tsx` | Section à propos |
| `ArrowLeft` | confidentialité | Retour |
| `Sparkles` | tarification | Déco IA |

### 2.2 Authentification

| Icône | Fichier | Usage |
|---|---|---|
| `Lock` | `auth/PasswordInput.tsx` | Mot de passe |
| `Eye` / `EyeOff` | `auth/PasswordInput.tsx` | Afficher/masquer mot de passe |
| `Hash` | `auth/StudentLoginForm.tsx` | Code classe |
| `User` | StudentLoginForm, paramètres | Utilisateur |
| `Loader2` | StudentLoginForm, boutons, partout | Spinner de chargement |
| `School` | StudentLoginForm, select-space | Espace école |
| `AlertCircle` | StudentLoginForm | Erreur |
| `Shield` | StudentLoginForm, facturation | Sécurité |
| `CheckCircle` / `CheckCircle2` | StudentLoginForm, succès | Succès/validation |
| `Globe` | LanguageSwitcher, header | Langue |
| `ChevronDown` | LanguageSwitcher, headers | Déroulant |
| `HelpCircle` | NeedHelpLink, store | Aide |
| `Mail` | login, signup, check-email, newsletter | E-mail |

### 2.3 Header / navigation globale

| Icône | Fichier | Usage |
|---|---|---|
| `Search` | header.tsx, galeries | Recherche |
| `Bell` | header.tsx, dashboards | Notifications |
| `Settings` | header.tsx, nav | Paramètres |
| `Users` | header.tsx, select-space | Espace parent |
| `LogOut` | headers, sidebars | Déconnexion |
| `Home` | mobile-bottom-nav, sidebars | Accueil |
| `Bookmark` | mobile-bottom-nav, footer-actions | Enregistrer/favori |
| `X` | sheet.tsx, HelpBot, modals | Fermer |
| `Send` | HelpBot | Envoyer message |
| `ChevronRight` | select-space, listes | Navigation |
| `CreditCard` | sidebar learn, billing | Facturation |

### 2.4 Atelier de coloriage / dessin

| Icône | Fichier | Usage |
|---|---|---|
| `ArrowLeft` | coloring-header | Retour |
| `FolderOpen` | coloring-header, DrawingCard | Sauvegarder |
| `Printer` | coloring-header, partout | Imprimer |
| `Sliders` | coloring-page | Outils |
| `Paintbrush` | drawing-tools-panel | Pinceau |
| `PaintBucket` | drawing-tools-panel | Remplissage |
| `Eraser` | drawing-tools-panel | Gomme |
| `Wand2` | drawing-tools-panel | Magie |
| `Undo` / `Redo` | drawing-tools-panel, StarsActivity | Annuler/Rétablir |
| `ZoomIn` / `ZoomOut` | drawing-tools-panel, books | Zoom |
| `Trash2` | drawing-tools-panel, cartes | Tout effacer / supprimer |
| `Maximize` / `Minimize` | canvas-card | Plein écran |
| `Cat`, `Apple`, `Briefcase`, `Drum`, `Type`, `TreePalm`, `TreePine`, `Home`, `GraduationCap`, `PartyPopper` | category-tabs | Catégories de dessins |
| `Plus` / `Minus` | books, panier, étoiles | Ajouter/retirer |
| `Info`, `Calendar`, `Gift`, `Lightbulb`, `BookText`, `Zap`, `Flame`, `Package`, `Ruler`, `Compass`, `FileText`, `HardDrive`, `PawPrint`, `Flag`, `Save`, `Contrast`, `Shirt`, `Grid3x3`, `Sun`, `LayoutGrid` | coloring-books-page, book.constants | Styles/trames de livres, infos |
| `Clock`, `Heart`, `Lock` | magic-drawing | Historique, favori, verrouillé |
| `Bookmark`, `BookPlus` | footer-actions | Enregistrer, ajouter au livre |

### 2.5 Mes dessins / livres sauvegardés

| Icône | Fichier | Usage |
|---|---|---|
| `Sparkles` | DrawingCard, partout | Dessin IA |
| `FileText`, `Pencil` | SavedBookCard | Détails, édition |

### 2.6 Dashboard enfant & paramètres

| Icône | Fichier | Usage |
|---|---|---|
| `Tent` | nav-items.ts | Campement/aventure |
| `BrainCircuit` | nav-items.ts | Coach IA |
| `Map` | nav-items.ts | Parcours |
| `Activity` | activity-panel, admin | Activité |
| `Trophy` | StatsCards, activités | Trophée |
| `MoreHorizontal` | mobile-bottom-nav, ClassCard | Menu ⋯ |
| `Smile` | pricing-page-content | Émoji satisfaction |
| `Volume2`, `Music`, `Languages`, `Info`, `User` | parametres/page.tsx | Paramètres son/langue |

### 2.7 Espace parents

| Icône | Fichier | Usage |
|---|---|---|
| `RotateCcw` | how-it-works, students | Réinitialiser |
| `AlertTriangle` | SubscriptionStatus, dialogs | Alerte |
| `Receipt` | billing school | Facture |
| `ShoppingCart` / `ShoppingBag` | billing, boutique | Panier/commande |
| `Filter` | StarsActivity | Filtres |
| `RefreshCw` | StarsActivity, partout | Rafraîchir |
| `Truck` | commandes | Livraison |
| `MessageSquare` / `MessageSquareText` | OrderSuccess, store | Message/WhatsApp |

### 2.8 Boutique & Store

| Icône | Fichier | Usage |
|---|---|---|
| `Code`, `Sticker` | CategoryCard | Catégories produits |
| `Phone` | PaymentMethods | Mobile Money |
| `Smartphone`, `Monitor` | PaymentMethods, paramètres | Paiement mobile/desktop |
| `PackageOpen` | mes-achats | Commande vide |
| `Circle` | orders/[id] | Étape non atteinte |
| `MapPin` | orders/[id] | Adresse |
| `Upload` | StudentsClient | Import élèves |
| `ImagePlus` | classes/create | Ajouter image |
| `List`, `Rows3` | GalleryView | Modes d'affichage |
| `ScrollText` | CertificateCard | Certificat |
| `Dices`, `ClipboardList` | ToolCategorySelector | Jeux, fiches |
| `Target`, `BarChart3`, `LineChart` | ProgressChart, admin | Progrès/stats |
| `Copy`, `Share2`, `MessageCircle` | ShareClassWidget | Partage |
| `Wallet`, `Coins` | facturation, admin | Portefeuille/étoiles |
| `Building2`, `Building`, `Puzzle`, `Crown`, `History`, `ExternalLink`, `EyeOff`, `Baby`, `Boxes`, `Tags`, `Ticket`, `Headphones`, `Server`, `Brain`, `Cpu`, `Construction`, `FolderTree`, `LayoutDashboard`, `TrendingUp`, `TrendingDown`, `Users2`, `CheckSquare`, `SlidersHorizontal`, `ArrowLeftRight`, `PlusCircle`, `MinusCircle`, `CalendarDays`, `XCircle`, `RefreshCcw`, `FileDown` | espaces school/admin/store | Navigation & actions admin |

### 2.9 Coach IA & Portfolio

| Icône | Fichier | Usage |
|---|---|---|
| `Zap` | RecommendationsList | Recommandation rapide |
| `Image` | MemoryCard | Souvenir photo |
| `Send`, `Lock`, `Mail` | TimeCapsule | Capsule temporelle |

---

## 3. Top icônes transverses (les plus récurrentes)

Ces icônes sont les **prioritaires à personnaliser** car elles apparaissent partout :

1. ⭐ `Star` — étoiles (monnaie du jeu + avis)
2. ✅ `Check` / `CheckCircle(2)` — validation
3. ❌ `X` / `XCircle` — fermer / échec
4. ⬇️ `Download` — téléchargement
5. ⏳ `Loader2` — spinner
6. ← → `ArrowLeft` / `ArrowRight` — navigation
7. 📖 `BookOpen` — livres
8. 🎨 `Palette` — coloriage
9. ✨ `Sparkles` — marqueur "IA"
10. ⚙️ `Settings` — paramètres
11. 🔔 `Bell` — notifications
12. 👥 `Users` — espace parent/élèves

---

## 4. SVG inline personnalisés existants

| Icône | Fichier | Usage |
|---|---|---|
| Logo **Google** (multicolore) | `src/components/auth/SocialButton.tsx` | Connexion Google |
| Logo **Apple** | idem | Connexion Apple |
| Logo **Facebook** | idem | Connexion Facebook |
| **Facebook**, **Instagram**, **TikTok**, **YouTube** | `landing/MainFooter.tsx`, `landing/Footer.tsx` | Réseaux sociaux footer |
| **WhatsApp** | `school/SchoolSupportButton.tsx`, `FacturationClient.tsx` | Support WhatsApp |
| `ArchiveIcon` (custom) | `school/parametres/ParametresClient.tsx` | Action archiver |

---

## 5. Assets d'icônes / images existants dans `public/`

### Marque / favicons
- `public/favicon.svg`, `public/favicon.webp`
- `public/logo/` : `favicone.svg`, `icone.svg`, `logo-petit-baobab.svg`
- `public/logo-petit-baobab.svg`
- `public/illustrations/` : `favicone.svg`, `icone.svg`, `logo-petit-baobab.svg`
- Dossier source `Logo/` : `.ai`, `.eps`, `.pdf`, PNG réseaux sociaux

### ⚠️ Anomalie détectée
`src/features/gamification/constants.ts` référence ~22 badges via `iconUrl: "/badges/*.svg"`
(first-drawing, super-artist, explorer, master-artist, creative, ai-master, bookworm, author,
storyteller, gamer, scholar, streak-7/30/100, level-10/25/50/100, social, teacher-pet, shopper…)
mais **le dossier `public/badges/` n'existe pas** → liens d'icônes cassés à créer.

---

## 6. Conseils pour la personnalisation

- **Format recommandé** : SVG, viewBox 24×24 (standard lucide), `stroke-width="2"`, `stroke-linecap="round"`, `stroke-linejoin="round"` pour garder la cohérence avec lucide-react.
- **Remplacement global** : comme toutes les icônes passent par `lucide-react`, tu peux soit :
  1. créer tes propres composants SVG et remplacer les imports `lucide-react`,
  2. ou wrapper : `const Star = ({...props}) => <MyStarIcon {...props} />` dans un fichier central (ex: `src/components/icons/index.tsx`) puis ré-exporter.
- **Couleurs** : utiliser `currentColor` dans les SVG pour hériter des couleurs Tailwind.
