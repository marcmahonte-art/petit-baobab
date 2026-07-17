# Product Design Audit — Page Livres de Coloriage

**Mode:** Review | **Surface:** `/livres-de-coloriage` | **Fichier:** `src/components/coloring-books-page.tsx` (2342 lignes), `useBookWizard.ts`, `useBookStore.ts`, `BookHeader.tsx`, `BookStepper.tsx` | **Date:** 03/07/2026

---

## Résumé

La page Livres de Coloriage est un assistant (wizard) en 4 étapes extrêmement riche, mais souffre de **surcharge cognitive**, de **doublons**, d'**incohérences de couleur**, et d'un **manque de hiérarchie** qui rendent le parcours utilisateur confus. Le fichier de 2342 lignes est difficile à maintenir et signale un besoin de refactorisation.

---

## P0 — Bloque la tâche principale

### 1. Wizard surchargé : Étape 2 contient 10 sections numérotées de 1 à 10
- **Fichier :** `coloring-books-page.tsx:922-1363`
- **Problème :** L'étape 2 "Personnaliser" affiche des sections numérotées **1 à 10** (Informations, Couverture, Palette, Style, Contour, Format, Orientation, Cadre, Options, Impression). L'utilisateur arrive à l'étape 2 et voit des sous-étapes 1-10, ce qui entre en conflit mental avec les 4 étapes principales du stepper.
- **Conséquence :** L'utilisateur pense qu'il y a 10 étapes, pas 4. Sentiment de lourdeur et d'abandon potentiel.
- **Fix :** Supprimer la numérotation des sections. Utiliser des titres hiérarchiques (h3/h4) sans numéros, ou des sections repliables (accordéon).

### 2. Doublon : Format et Orientation présents à l'étape 1 ET à l'étape 2
- **Fichier :** Étape 1 "Options rapides" (lignes 754-788) vs Étape 2 sections 6-7 (lignes 1150-1232)
- **Problème :** Les sélecteurs de format et d'orientation apparaissent deux fois : une fois dans les "Options rapides" de l'étape 1, et une fois comme sections complètes dans l'étape 2.
- **Conséquence :** L'utilisateur peut changer le format à l'étape 1, puis le re-changer à l'étape 2 sans comprendre pourquoi.
- **Fix :** Garder le format/orientation uniquement à l'étape 2 (ou uniquement à l'étape 1). Supprimer les "Options rapides" redondantes de l'étape 1.

### 3. Couleur violette non unifiée (`#7D6AF8` au lieu de `#6D4CFF`)
- **Fichier :** Partout dans `coloring-books-page.tsx`, `BookHeader.tsx`, `BookStepper.tsx`
- **Problème :** La page utilise `#7D6AF8` comme couleur primaire violette, alors que le design token unifié est `#6D4CFF` (correction déjà appliquée ailleurs dans l'app).
- **Conséquence :** Incohérence visuelle entre les pages. Le violet des livres de coloriage est différent du violet du reste de l'application.
- **Fix :** Remplacer `#7D6AF8` par `#6D4CFF` dans toute la page.

### 4. Progression de génération simulée (fausse)
- **Fichier :** `coloring-books-page.tsx:198-222`
- **Problème :** La barre de progression de l'étape 4 est simulée avec `setInterval` (+20% toutes les 120ms, soit 600ms pour atteindre 100%). Le PDF est déjà téléchargé quand l'utilisateur clique sur "Télécharger le PDF", mais la barre tourne indépendamment.
- **Conséquence :** L'utilisateur voit une barre de progression qui n'a aucun rapport avec le vrai progrès. Trompeur.
- **Fix :** Soit synchroniser la progression avec la vraie génération PDF, soit afficher un spinner simple sans barre de progression simulée.

---

## P1 — Risque d'échec de la tâche

### 5. Pas de vrai bouton "Créer un nouveau livre" qui réinitialise
- **Fichier :** `coloring-books-page.tsx:2043-2052`
- **Problème :** Le bouton "Créer un nouveau livre" à l'étape 4 remet à l'étape 1 mais ne vide pas les sélections (`selectedIds`, `title`, `author`, etc.).
- **Conséquence :** L'utilisateur croit repartir de zéro mais ses anciens choix persistent.
- **Fix :** Appeler une fonction `reset()` qui réinitialise tout le store.

### 6. Validation ignorée par les boutons directs
- **Fichier :** `coloring-books-page.tsx:710-717`, `744-750`, `833-841` (boutons "Personnaliser")
- **Problème :** Les boutons "Personnaliser" appellent directement `setActiveStep(2)` sans passer par `validate()`. Seul `handleNextStep()` valide.
- **Conséquence :** L'utilisateur peut passer à l'étape 2 sans avoir sélectionné de dessin.
- **Fix :** Centraliser la navigation via `handleNextStep()` ou ajouter `validate()` avant `setActiveStep`.

### 7. Profils enfants "Awa"/"Kofi" en dur dans BookHeader
- **Fichier :** `BookHeader.tsx:63-69`
- **Problème :** Les profils enfants sont codés en dur (`"awa"`, `"kofi"` avec âges fixes). Devraient venir de `useProfileStore`.
- **Conséquence :** Si l'utilisateur a un enfant qui s'appelle autrement, les profils affichés sont incorrects.
- **Fix :** Lire les profils depuis `useProfileStore` et les afficher dynamiquement.

### 8. Bouton "Imprimer" de l'étape 4 non fonctionnel
- **Fichier :** `coloring-books-page.tsx:2022-2030`
- **Problème :** Le bouton "Demander une impression" n'a pas de `onClick` — il ne fait rien.
- **Conséquence :** L'utilisateur clique et rien ne se passe.
- **Fix :** Ajouter un `onClick` qui ouvre la modale d'impression ou affiche un message "Bientôt disponible".

---

## P2 — Friction significative

### 9. Doublon sémantique : section "Options" et section "Impression"
- **Fichier :** `coloring-books-page.tsx:1277-1363`
- **Problème :** Les sections 9 (Options additionnelles) et 10 (Options d'impression) sont très proches visuellement. "Recto uniquement" pourrait aussi bien être dans les options d'impression, et "Marges de reliure" est dans l'impression alors que ça pourrait être optionnel.
- **Fix :** Fusionner en une seule section "Options" avec sous-catégories claires.

### 10. Disparition des info-bulles/tooltips
- **Fichier :** Partout dans la page
- **Problème :** Les éléments comme "Épaisseur des contours" (Slider), "Cadre décoratif", "Palette de couleurs" n'ont pas de tooltips ou d'explications. Un enfant ne comprend pas forcément ce que "Bogolan" ou "Faso Dan Fani" signifie.
- **Fix :** Ajouter des `Tooltip` Shadcn sur les zones critiques avec des explications simples.

### 11. Pas d'aperçu mobile de la couverture en temps réel à l'étape 1
- **Fichier :** `coloring-books-page.tsx:722-751`
- **Problème :** L'aperçu de la couverture est dans la colonne centrale (visible sur desktop) mais pas accessible directement sur mobile à l'étape 1.
- **Conséquence :** L'utilisateur mobile voit les dessins mais pas l'aperçu du livre qu'il construit.
- **Fix :** Ajouter un accordéon "Aperçu" mobile à l'étape 1 (comme c'est fait à l'étape 2).

### 12. Section "Validation" à l'étape 3 toujours verte
- **Fichier :** `coloring-books-page.tsx:1796-1817`
- **Problème :** Les 5 items de validation sont toujours cochés, même si l'utilisateur n'a pas rempli le titre, l'auteur, etc.
- **Conséquence :** La validation n'a aucun sens — elle donne une fausse impression de complétude.
- **Fix :** Rendre la validation réelle : cocher vert uniquement si l'étape est vraiment complétée.

### 13. "Fit Width" en anglais dans une interface française
- **Fichier :** `coloring-books-page.tsx:1508`
- **Problème :** Le bouton "Fit Width" n'est pas traduit en français.
- **Fix :** Remplacer par "Ajuster à la largeur".

### 14. Page 2342 lignes — monstrueuse
- **Fichier :** `coloring-books-page.tsx` — 2342 lignes
- **Problème :** Toute la logique wizard, les 4 étapes, la génération PDF, le rendu, tout est dans UN seul fichier composant.
- **Fix :** Extraire chaque étape dans son propre composant : `Step1ChooseDrawings.tsx`, `Step2Personalize.tsx`, `Step3Preview.tsx`, `Step4Download.tsx`. La génération PDF dans un hook séparé.

---

## P3 — Améliorations mineures

### 15. Bouton "Mes livres" non fonctionnel
- **Fichier :** `BookHeader.tsx:43-47`
- **Problème :** Le bouton "Mes livres" n'a pas de `onClick` — aucune redirection.
- **Fix :** Router vers `/parents/livres` ou une page de bibliothèque.

### 16. Nombre de copies par défaut à 10 dans une interface "famille"
- **Fichier :** `useBookStore.ts:78`
- **Problème :** `copiesCount` par défaut à 10. Pour un parent individuel, la valeur logique serait 1.
- **Fix :** Passer à 1 par défaut.

### 17. Accents manquants dans le printable book
- **Fichier :** `coloring-books-page.tsx:2238`, `2294`, `2297`
- **Problème :** `"personnalise"` → `"personnalisé"`, `"appartient a"` → `"appartient à"`, `"Prepare"` → `"Prépare"`.
- **Fix :** Correction orthographique.

### 18. Choix du profil enfant en haut ne met pas à jour les infos du livre
- **Fichier :** `useBookWizard.ts` — effet `useEffect` uniquement sur `currentChild`
- **Problème :** Changer d'enfant dans BookHeader définit `currentChild` mais les valeurs (`title`, `author`, `childName`) sont écrasées quelle que soit la modification manuelle antérieure.
- **Conséquence :** Si le parent personnalise le titre, puis change d'enfant, ses modifications sont perdues.
- **Fix :** Appliquer les valeurs préremplies seulement si l'utilisateur n'a pas modifié manuellement les champs.

### 19. Icône `ChevronRight` dans la grille de suggestions (inutilisée)
- **Fichier :** `coloring-books-page.tsx:703-706`
- **Problème :** La carte "Ajouter plus" dans la liste des dessins sélectionnés est décorative mais ne fait rien (pas de `onClick`).
- **Fix :** Soit la rendre fonctionnelle (défiler vers la grille), soit la supprimer.

### 20. Pas d'état "Aucun livre" pour un nouvel utilisateur
- **Fichier :** Pas de vue "vide"
- **Problème :** Si l'utilisateur n'a jamais créé de livre, la page affiche directement le wizard sans message de bienvenue ou d'explication.
- **Fix :** Ajouter un état vide optionnel avec un message de bienvenue et un bouton "Créer mon premier livre".

---

## Recommandations prioritaires

1. **Unifier la couleur violette** — remplacer `#7D6AF8` par `#6D4CFF` partout dans les composants livres de coloriage.
2. **Supprimer la numérotation des sections** à l'étape 2 (ne pas avoir des numéros 1-10 qui entrent en conflit avec les 4 étapes).
3. **Supprimer les "Options rapides" redondantes** de l'étape 1 (format/orientation sont déjà à l'étape 2).
4. **Rendre la barre de progression réelle** ou la remplacer par un spinner simple.
5. **Extraire chaque étape** dans un fichier dédié pour réduire le fichier de 2342 lignes.
6. **Ajouter un `reset()`** au store pour le bouton "Créer un nouveau livre".
7. **Rendre les profils enfants dynamiques** depuis `useProfileStore`.
8. **Corriger les accents** manquants dans le printable book.
