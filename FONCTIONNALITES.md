# Petit Baobab - Analyse fonctionnelle complète

## Architecture technique
- **Framework :** Next.js 15 (App Router)
- **Langage :** TypeScript
- **CSS :** Tailwind CSS v4
- **State management :** Zustand
- **Animations :** Framer Motion
- **UI :** Radix UI (primitives) + Shadcn
- **Canvas :** Fabric.js
- **Base de données :** Supabase (via @supabase/supabase-js)
- **Police :** Nunito / Nunito Sans
- **Icônes :** Lucide

---

## 1. Page d'accueil (Dashboard)

### 1.1 Barre latérale (Sidebar)
- Logo Petit Baobab
- Navigation : Accueil, Coloriage, Dessin magique, Livres de coloriage, Jeux éducatifs, Histoires, Activités, Espace parents, Paramètres
- État actif sur la page courante
- Carte "Passez Premium" avec illustration enfant
- Animations hover (scale)

### 1.2 En-tête (Header)
- Barre de recherche (640px, placeholder personnalisé)
- Bouton langue (Globe)
- Bouton notifications (avec badge)
- Avatar utilisateur + nom (Awa)
- Menu mobile avec Sheet (sidebar escamotable)

### 1.3 Bannière Héro
- Mascotte Awa (personnage principal)
- Message de bienvenue personnalisé ("Bonjour Awa !")
- Paysage illustré (village, girafe, baobab)
- Animation flottante

### 1.4 Modules de fonctionnalités (Feature Modules)
6 cartes cliquables :
- **Coloriage** → `/coloriage`
- **Dessin magique** → `/magic-drawing`
- **Livres de coloriage** → `/livres-de-coloriage`
- **Jeux éducatifs** (placeholder)
- **Histoires** (placeholder)
- **Activités** (placeholder)

Chaque carte : illustration + fond coloré + étiquette + animation hover (translateY)

### 1.5 Derniers coloriages (Recent Colorings)
- Grille de 4 cartes
- Miniature, titre, horodatage
- Icône crayon
- Lien "Voir tout"

### 1.6 Panneau d'activité (Activity Panel)
- Anneau de progression (75%)
- Message d'encouragement
- Statistiques : Points (120), Badges (5), Jours (7)
- Icônes avec couleurs distinctives

### 1.7 Cartes de récompenses (Rewards Card)
- Badges : Super Artiste, Explorateur, Créatif, Lecteur
- Animations hover (scale)
- Design circulaire avec couleurs par catégorie

### 1.8 Navigation mobile (Bottom Navigation)
- 5 entrées : Accueil, Coloriage, Magique, Jeux, Histoires
- Barre fixe en bas sur mobile

---

## 2. Page Coloriage (/coloriage)

### 2.1 Outils de dessin (Drawing Tools Panel)
- **Pinceau** (Brush) - outil de dessin libre
- **Pot de peinture** (Bucket) - remplissage de zone
- **Gomme** (Eraser)
- **Remplissage magique** (Fill) - remplissage intelligent
- **Annuler / Refaire** (Undo/Redo) avec historique
- **Zoom + / Zoom -**
- **Effacer tout** (Clear All)
- Tooltips avec raccourcis clavier

### 2.2 Toile de dessin (Canvas - Fabric.js)
- Canvas interactif basé sur Fabric.js
- Chargement de modèles de coloriage (svg/illustrations)
- Système de flood fill (remplissage)
- Mode plein écran
- Historique des actions (undo/redo stack)

### 2.3 Palette de couleurs (Color Palette)
- 14 couleurs : Rouge, Orange, Jaune, Vert Clair, Vert, Turquoise, Bleu, Violet, Rose, Marron, Beige, Gris, Noir, Arc-en-ciel
- Sélection visuelle avec animation
- Arc-en-ciel avec dégradé

### 2.4 Curseur de taille de pinceau (Brush Size Slider)

### 2.5 En-tête du coloriage (Coloring Header)
- Bouton Retour vers l'accueil
- Bouton "Mes dessins" (galerie)
- Bouton Télécharger (PNG)
- Bouton Imprimer
- Avatar utilisateur

### 2.6 Grille "Mes dessins" (My Drawings Grid)
- Liste des dessins enregistrés
- Catégories : animaux, culture, etc.

### 2.7 Onglets de catégories (Category Tabs)
- Filtrage par catégorie : Tous, Animaux, Afrique, Métiers, École, Fruits

### 2.8 Actions du pied (Footer Actions)
- Enregistrer le dessin
- Ajouter au livre de coloriage

### 2.9 Popup de récompense (Reward Popup)
- Animé avec confetti (canvas-confetti)
- Attribution de points (+10) et badges
- Message de félicitations personnalisé

### 2.10 Galerie de dessins (DrawingGallery)
- Sheet latéral (Shadcn Sheet)
- Liste des dessins sauvegardés
- Ouverture et chargement d'un dessin existant

### 2.11 Sauvegarde des dessins (DrawingService)
- Stockage local (localStorage)
- CRUD : sauvegarder, renommer, supprimer, lister
- États : en cours / terminé
- Auto-sauvegarde des templates

---

## 3. Page Dessin Magique (/magic-drawing)

### 3.1 Assistant de génération par IA (3 étapes)
**Étape 1 :** Décris ton dessin
- Zone de texte (textarea, max 200 caractères)
- Suggestions cliquables (éléphant, maison africaine, lion courageux, marché africain)
- Compteur de caractères

**Étape 2 :** Choisis le style
- Coloriage (Noir & Blanc)
- Contour simple
- Dessin détaillé
- Version couleur

**Étape 3 :** Créer le dessin
- Bouton "Créer mon dessin magique" (1 étoile)
- Indicateur de chargement animé
- Gestion des erreurs

### 3.2 API de génération IA (/api/magic-drawing)
- Appel OpenAI (GPT-Image-1)
- Construction de prompt enrichi
- 4 styles avec paramètres distincts (guidance_scale, steps)
- Filtre de sécurité (negative prompt)
- Support du contexte africain

### 3.3 Panneau de résultat
- Affichage de l'image générée
- Bouton favori (coeur)
- Télécharger PNG
- Télécharger PDF
- Ajouter au livre
- Imprimer (popup A4)
- Variantes du dessin (4 suggestions)

### 3.4 Bannière sécurité
- Message "Contenu sûr et adapté aux enfants"
- Filtre de modération mentionné

### 3.5 Barre d'information
- Étoiles (125)
- Historique
- Avatar

---

## 4. Page Livres de Coloriage (/livres-de-coloriage)

### 4.1 Assistant de création de livre (Wizard 4 étapes)
**Étape 1 :** Choisir les dessins
- Bibliothèque de 8 dessins intégrés (éléphant, girafe, lion, village, cheval, balafon, baobab, caméléon)
- Dessins personnels de l'utilisateur
- Recherche textuelle
- Filtre par catégorie (Tous, Animaux, Afrique, Métiers, École, Fruits)
- Sélection multiple (max 50)
- Aperçu de la couverture en direct
- Options rapides (format, orientation)
- Résumé du livre (dessins, pages, format)
- Bouton "Personnaliser"

**Étape 2 :** Personnalisation
- Section 1: Informations du livre (titre, sous-titre, auteur, nom de l'enfant)
- Section 2: Choix de la couverture (5 modèles : Petit Baobab, Savane, École, Afrique, Colorée + IA)
- Section 3: Palette de couleurs (8 palettes : Violet, Vert, Jaune, Orange, Bleu, Rose, Turquoise, Multicolore)
- Section 4: Style du dessin (Contour simple, Noir & Blanc détaillé, Contours épais, Version couleur)
- Section 5: Épaisseur des contours (slider 0-100%)
- Section 6: Format du livre (A4, A5, US Letter, Carré)
- Section 7: Orientation (Portrait, Paysage, Carré)
- Section 8: Cadre décoratif (Faso Dan Fani, Bogolan, Nature, Savane, Animaux, Aucun)
- Options du livre (numéros de page, page de titre, appartenance à, texte éducatif, fun fact, questions)
- Aperçu en direct (accordéon mobile)
- Profils enfant (Awa, Kofi) avec valeurs préremplies

**Étape 3 :** Révision & impression
- Paramètres d'impression (économiser encre, recto seul, marques de coupe, marge reliure)
- Options d'export (fond perdu, nombre de copies)
- Aperçu page par page avec zoom
- Poids estimé du PDF

**Étape 4 :** Génération
- Barre de progression animée
- Confetti à la fin
- Téléchargement PDF (génération côté client)
- Impression directe

### 4.2 Types de formats supportés
- A4 (21.0 x 29.7 cm)
- A5 (14.8 x 21.0 cm)
- US Letter (21.6 x 27.9 cm)
- Carré (21.0 x 21.0 cm)

### 4.3 Types de cadres décoratifs
- Faso Dan Fani (bordure tissée)
- Bogolan (motifs en terre)
- Nature (feuilles et lianes)
- Savane (silhouettes sauvages)
- Animaux (empreintes de pattes)
- Aucun

---

## 5. Page Espace Parents (/parents)

### 5.1 En-tête Parent
- Sélection du profil enfant (Awa / Kofi)
- Bouton "Déconnexion"

### 5.2 Bannière Premium
- Message "Votre enfant profite du forfait GRATUIT"
- Forfaits disponibles en un coup d'oeil

### 5.3 Section Tarifs (Pricing)
**Forfait Découverte :** 2 000 FCFA
- 100 crédits
- Tous les styles de dessin
- Livres
- Téléchargement des créations
- Aucun délai d'expiration

**Forfait Super Baobab :** 4 500 FCFA (Populaire)
- 250 crédits
- Mêmes avantages + meilleur rapport qualité/prix

**Forfait École/Pro :** 25 000 FCFA/mois
- 1 000 crédits/mois
- Tous les styles, livres, jeux complets
- Téléchargement illimité
- Gestion multi-utilisateurs
- Support prioritaire

### 5.4 Activités à venir (Upcoming Activities)
- Agenda des activités enfants

### 5.5 Comment ça marche (How It Works)
- Explication du fonctionnement

### 5.6 Carte d'information (Information Card)
- Version : 1.0.0 (Bêta)
- Localisation : Ouagadougou, BF
- Astuces et conseils

---

## 6. Page Paramètres (/parametres)

### 6.1 Profil de l'enfant
- Prénom de l'enfant (input)
- Choix de la mascotte : Awa (👧🏾), Bébé Lion (🦁), Baobab Robot (🤖)

### 6.2 Préférences Audio
- Musique d'ambiance (toggle)
- Effets sonores (toggle)

### 6.3 Langue de l'application
- Français (🇫🇷)
- Mooré (🇧🇫)
- Dioula (🇧🇫)

### 6.4 Contrôle Parental
- Vérification parentale active (toggle)
- Code PIN 4 chiffres

### 6.5 Persistance
- Sauvegarde dans localStorage
- Toast de confirmation

---

## 7. Système de gamification

### 7.1 Points
- Attribution de points (+10 par coloriage terminé)
- Affichage dans le panneau d'activité

### 7.2 Badges
- Super Artiste, Explorateur, Créatif, Lecteur
- Affichage dans Rewards Card
- Obtention via popup de récompense

### 7.3 Confettis (canvas-confetti)
- Déclenché sur obtention de récompense
- Déclenché sur génération de livre terminée
- Déclenché sur sauvegarde de configuration

---

## 8. Api Routes

### 8.1 /api/magic-drawing (POST)
- Génération d'images via OpenAI GPT-Image-1
- 4 styles de rendu
- Construction de prompt enrichi avec contexte africain
- Filtre de contenu (negative prompt)

### 8.2 /api/drawings (GET/POST)
- Liste et sauvegarde des dessins

### 8.3 /api/magic-drawing/book/add
- Ajout d'une image générée à un livre

### 8.4 /api/magic-drawing/download
- Téléchargement d'image générée

---

## 9. Bibliothèque de dessins (Library)
8 dessins intégrés :
- Éléphant
- Girafe
- Lion
- Village africain
- Cheval
- Balafon (Petite fille)
- Baobab
- Caméléon

Catégories : Animaux, Afrique, Métiers, École, Fruits

---

## 10. Design System

### 10.1 Palette de couleurs
- Fond : #FFF9F2 (crème chaud)
- Texte : #3B2416 (brun foncé)
- Surface : #FFFFFF
- Bordures : #F0E7DA / #EFE7DB
- Couleurs fonctionnelles : Jaune (#FFD95C), Violet (#7D6AF8), Vert (#20C997), Orange (#FFB300), Bleu (#1194FF), Rose (#FF5E83), Turquoise (#13C6A2)

### 10.2 Rayons (Radius)
- sm: 16px, md: 20px, lg: 24px, xl: 28px, hero: 32px, pill: 999px

### 10.3 Ombres
- Card: `0 4px 12px rgba(0,0,0,.06)`
- Hover: `0 10px 30px rgba(0,0,0,.12)`

### 10.4 Typographie
- Nunito Sans (police principale)
- Hiérarchie : display-lg (48px), display-md (32px), headline-lg (24px), body-lg (18px), body-md (16px)

---

## 11. Responsive Design
- **Desktop (≥1280px) :** Grille complète sidebar 280px + contenu
- **1280px-1024px :** Sidebar 240px, feature grid 3 colonnes
- **1024px-768px :** Héro 1 colonne, modules 2 colonnes
- **Mobile (≤768px) :** Sidebar cachée (Sheet), navigation bottom, recherche 100%

---

## 12. Assets et Illustrations
- Mascotte Awa (personnage principal)
- Illustrations : lion, robot, livre, puzzle, fille lecture, crayons, paysage village, premium-boy
- Logo : SVG, PNG, EPS, PDF, AI (multi-formats)
- Footer décoratif (herbe)
- Screenshots de référence (5 captures)
