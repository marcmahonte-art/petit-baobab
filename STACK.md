# Petit Baobab — Stack & Fonctionnalités

Application web de création de **livres de coloriage personnalisés** pour enfants, avec un éditeur de dessin, une génération par IA et un espace parents.

## Stack technique

| Domaine | Techno |
| --- | --- |
| Framework | **Next.js 16** (App Router), React 19, TypeScript 5 |
| Styling | Tailwind CSS v4, `class-variance-authority`, `clsx`, `tailwind-merge` |
| Composants UI | Radix UI (dialog, tabs, tooltip, dropdown, slider, avatar, progress, scroll-area, slot), `lucide-react` (icônes) |
| Gestion d'état | **Zustand 5** |
| Backend / Données | **Supabase** (`@supabase/supabase-js`) — Auth + Storage + DB |
| Édition canvas | `fabric` 7 (éditeur de dessin), `canvas-confetti` (récompenses) |
| Export PDF | `jsPDF` 4 (génération du livre de coloriage) |
| Animations | `framer-motion` 12 |
| Qualité / Lint | ESLint 9 + `eslint-config-next` |
| Déploiement | **Vercel** (`vercel --prod`) |

Scripts (`package.json`) : `dev`, `build`, `start`, `lint`.

## Fonctionnalités

### Authentification & profils
- Auth Supabase : login / signup / logout / session (`/api/auth/*`).
- Profils enfant via `profile-store` (`src/lib/profile-store.ts`) ; sélection de profil actif.

### Éditeur de coloriage (`/coloriage`)
- Canvas d'édition (`canvas-card.tsx`, `drawing-engine.ts`) avec outils (`drawing-tools-panel.tsx`, `brush-size-slider.tsx`, `color-palette.tsx`).
- Catégories (`category-tabs.tsx`), grille de dessins (`my-drawings-grid.tsx`), coloriages récents (`recent-colorings.tsx`).
- Filigrane (`watermark.ts`).

### Création de livres de coloriage (`/livres-de-coloriage`)
- Assistant en étapes (`BookStepper`) : sélection des dessins → onglets **Couverture / Style / Format / Options**.
- Aperçu live (`BookPreviewCanvas`) : titre, sous-titre, enfant, auteur, palette de couleurs, cadre décoratif, modèle de cover (6 SVG dans `public/illustrations/covers/`).
- **Export PDF** (`jsPDF`) : rendu des pages + couverture, upload du PDF et de la vignette cover dans Supabase Storage, sauvegarde en bibliothèque.

### Dessin magique (`/magic-drawing`)
- Génération d'images par IA (`/api/magic-drawing*`), ajout au livre (`/api/magic-drawing/book/add`), téléchargement (`/api/magic-drawing/download`).

### Bibliothèque (`/mes-livres`)
- Livres sauvegardés (brouillons / finalisés), re-téléchargement et impression.

### Espace parents & récompenses
- `/parents`, `/parents/select-profile` : gestion des profils.
- Système d'étoiles (`/api/stars/history`), popups et cartes de récompense (`reward-popup.tsx`, `rewards-card.tsx`, `activity-panel.tsx`).

### Autres espaces
- `/dashboard` (tableau de bord), `/school` (espace école), `/parametres` (paramètres).
- Internationalisation (`src/lib/i18n.ts`).
- Navigation : `sidebar.tsx`, `mobile-bottom-nav.tsx`, `header.tsx`, `footer`.

## Structure du code

```
src/
├── app/                 # Routes (App Router) + API routes (/api)
│   ├── coloriage/  livres-de-coloriage/  magic-drawing/
│   ├── mes-livres/  parents/  school/  dashboard/  parametres/
│   ├── (auth)/  api/
├── features/
│   ├── books/          # Logique métier livres
│   ├── coloring-book/  # Assistant de création (hooks, store, services, composants)
│   └── drawings/       # DrawingService, types
├── components/         # UI partagés (auth, drawings, landing, parents, saved-books, ui)
└── lib/                # storageService, drawing-engine, watermark, i18n, profile-store
```

## Notes de performance
- Les covers sont des SVG ; le cover `petit-baobab` (≈91 KB, export Illustrator) est ~50× plus lourd que les autres (≈1,5 KB) → à optimiser (SVGO).
- Le téléchargement PDF est déclenché côté client immédiatement après génération (helper `src/lib/download.ts`) pour rester dans la fenêtre d'activation utilisateur.
