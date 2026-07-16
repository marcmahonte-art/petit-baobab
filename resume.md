# Petit Baobab

Plateforme de coloriage et création de livres personnalisés pour enfants.

## Stack
**Framework:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4
**Auth/DB:** Supabase (Auth, PostgreSQL, Storage)
**État:** Zustand 5
**Canvas:** Fabric.js 7, jsPDF 4, svg2pdf.js
**UI:** Radix UI, Framer Motion 12, lucide-react
**Déploiement:** Vercel

## Routes pages
| Route | Description |
|---|---|
| `/` | Landing page |
| `/login`, `/signup` | Auth |
| `/coloriage` | Éditeur coloriage (Fabric.js) |
| `/livres-de-coloriage` | Création livre PDF |
| `/magic-drawing` | Dessin IA |
| `/mes-livres` | Bibliothèque |
| `/parents` | Espace parents (compte, étoiles) |
| `/parents/select-profile` | Choix profil enfant |
| `/parametres` | Paramètres |
| `/dashboard`, `/school` | Dashboard, scolaire |

## Routes API
`/api/auth/*` (callback, login, logout, session, signup)
`/api/drawings`, `/api/magic-drawing*`, `/api/stars/history`

## DB (Supabase PostgreSQL)
Tables: `profiles`, `accounts`, `child_profiles`, `saved_drawings`, `books`, `coloring_pages`, `stars_transactions`
RLS activé. Trigger `on_auth_user_created` pour auto-création compte/profil enfant.
Voir `supabase/01_auth_stars_tables.sql`

## Auth
Supabase Auth + cookies HTTP-only perso (`sb-access-token`, `sb-refresh-token`).
Providers: email/password + Google OAuth.
Callback OAuth : `src/app/api/auth/callback/route.ts`

## Architecture
- `src/app/` — pages et routes API Next.js
- `src/components/` — composants UI (auth/, landing/, coloring-book/, etc.)
- `src/features/` — logique métier (coloring-book, drawings)
- `src/lib/` — stores Zustand, clients Supabase, utilitaires, tokens design system
- `supabase/` — migrations SQL

## Scripts
`npm run dev` — développement
`npm run build` — build production
`npm run start` — serveur production
`npm run lint` — ESLint
