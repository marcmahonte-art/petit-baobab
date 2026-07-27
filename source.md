# Architecture du Site — Petit Baobab

## Vue d'ensemble

Application full-stack Next.js 16 (App Router) avec Supabase comme backend, destinée aux enfants, parents, écoles et enseignants. Plateforme de coloriage, dessin IA, livres personnalisés et boutique e-commerce.

---

## Stack Technique

| Catégorie | Technologie |
|---|---|
| Framework | Next.js 16 + React 19 + TypeScript |
| Styling | Tailwind CSS v4 + Radix UI |
| Base de données | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth + JWT (jose) |
| État | Zustand (stores multiples) |
| Paiement | PayDunya (Mobile Money, Cartes) |
| Email | Resend |
| WhatsApp | Meta Cloud API |
| IA | OpenAI (gpt-image-1) |
| Canvas | Fabric.js |
| Tests | Vitest |

---

## Structure du Projet

```
src/
├── app/           # Pages (App Router) + API routes
├── components/    # UI components (auth, landing, dashboard, school, store, etc.)
├── features/      # Modules métier (drawings, books, coloring-book)
├── lib/           # Stores Zustand, utilitaires, i18n
├── stores/        # Stores spécialisés (cart, billing, order, school)
├── types/         # Définitions TypeScript
├── emails/        # Templates email (Resend)
└── __tests__/     # Tests unitaires

supabase/          # Migrations SQL (tables, RLS, triggers, cron)
public/            # Assets statiques (illustrations, SVG)
```

---

## Système de Rôles

| Rôle | Connexion | Accès |
|---|---|---|
| Parent/Famille | Email + mot de passe | Dashboard parent |
| Enfant | Code de classe + prénom | Dashboard enfant (/learn/*) |
| Enseignant | Email + mot de passe | Dashboard école (/school/*) |
| Super Admin | Email + mot de passe | Dashboard admin (/dashboard/*) |

Middleware (`middleware.ts`) gère le routage multi-rôle via cookies (`pb-role`).

---

## Authentification

| Mécanisme | Détail |
|---|---|
| Parent/Teacher | Supabase Auth + HTTP-only cookies |
| Enfant | JWT signé (jose) stocké en cookie `sb-student-token` |
| API Routes | Vérification via en-têtes `x-session-type` |
| OAuth | Callback géré par `/api/auth/callback` |

---

## Routage

### Pages Publiques
- `/` — Landing page
- `/coloriage` — Zone de coloriage
- `/magic-drawing` — Dessin IA
- `/boutique/*` — E-commerce
- `/tarification` — Prix et abonnements
- `/school` — Login étudiant

### Pages Authentifiées
- `/app/*` — Dashboard parent
- `/learn/*` — Dashboard enfant (colorisation, dessin IA, livres)
- `/school/*` — Dashboard enseignant (classes, élèves, suivi)
- `/dashboard/*` — Admin (analytiques, utilisateurs, contenu)
- `/store/*` — Compte client boutique
- `/parents/*` — Espace parent

---

## API Routes

### Auth (`/api/auth/*`)
`login`, `signup`, `session`, `logout`, `student-login`, `callback`, `complete-signup`, `default-space`

### Dessins (`/api/drawings/*`)
Sauvegarde, liste des dessins

### Livres (`/api/books/*`)
Sauvegarde, liste des livres

### Dessin Magique (`/api/magic-drawing/*`)
Génération IA, ajout au livre, téléchargement

### Paiement (`/api/payment/*`)
Création facture PayDunya, statut, téléchargement, webhook

### École (`/api/school/*`)
Dashboard, classes, élèves (création/bulk import), étoiles, facturation

### Boutique (`/api/store/*`)
Profil, téléchargements, favoris, avis, paramètres, magic-link

### Abonnement (`/api/billing/*`)
Souscription, renouvellement, historique, plans

---

## Gestion d'État (Zustand)

| Store | Persistance | Rôle |
|---|---|---|
| `auth-store` | Mémoire | Utilisateur, comptes, profils, session |
| `credit-store` | localStorage | Solde étoiles, plan, consommation |
| `profile-store` | localStorage | Profils enfants |
| `i18n` | localStorage | Langue (fr/en) |
| `coloring-store` (lib/store.ts) | Mémoire | État du canvas (outil, couleur, historique) |
| `cart-store` | localStorage | Panier boutique |
| `billing-store` | Mémoire | Abonnement |
| `order-store` | localStorage | Historique commandes |
| `school-store` | sessionStorage | Dashboard école, classes, élèves |

---

## Base de Données (Supabase)

### Tables principales
- `accounts` — Comptes utilisateur (solde étoiles, plan)
- `child_profiles` — Profils enfants (nom, mascotte, code PIN)
- `saved_drawings` — Dessins enregistrés (image_url, style, statut)
- `books` — Livres de coloriage personnalisés
- `stars_transactions` — Journal des mouvements d'étoiles

### Tables école
- `classrooms` — Classes (code, année scolaire)
- `school_students` — Élèves (nom, mascotte)
- `student_activities` — Activités des élèves

### Tables e-commerce
- `shop_orders`, `shop_customer_profiles`, `shop_products`, `shop_categories`
- `wishlists`, `reviews`, `shop_downloads`, `coupons`

### Tables support
- `email_logs`, `whatsapp_logs`, `notifications`

---

## Fonctionnalités Clés

1. **Coloriage numérique** — Canvas Fabric.js avec outils (pinceau, pot de peinture, gomme), undo/redo, zoom
2. **Dessin Magique (IA)** — Génération d'images via OpenAI (4 styles), consommation d'étoiles, idempotence
3. **Livres personnalisés** — Création de livres à partir de dessins, génération PDF (jsPDF), couvertures
4. **École** — Gestion de classes, import d'élèves, suivi d'activité, distribution d'étoiles
5. **Boutique e-commerce** — Catalogue, panier, paiement PayDunya (Orange Money, Moov, carte), téléchargements
6. **Économie d'étoiles** — Plan gratuit (5/jour), Découverte (100/mois), Super Baobab (250/mois), École Pro (1000/mois)
7. **Gamification** — Points, badges, mascottes, confetti
8. **Internationalisation** — Français / Anglais
9. **Notifications** — Email (Resend) + WhatsApp (Meta) pour confirmations de commande

---

## Flux de Données

### Connexion parent
```
Login → POST /api/auth/login → Supabase Auth → Cookies HTTP-only → Hydratation stores → Redirection
```

### Connexion élève
```
Code classe + prénom → POST /api/auth/student-login → JWT → Cookie sb-student-token → Dashboard enfant
```

### Dessin IA
```
Prompt → Vérification crédits → POST /api/magic-drawing → OpenAI → Supabase Storage → Sauvegarde → Nouveau solde
```

### Paiement boutique
```
Panier → POST /api/payment/create → PayDunya → Redirection paiement → Webhook → Mise à jour commande → Email + WhatsApp
```

---

## Sécurité

- Cookies HTTP-only pour les tokens d'auth
- JWT signé pour les sessions élèves
- Row Level Security (RLS) sur toutes les tables Supabase
- Vérification de session dans chaque API route
- Idempotence sur les générations IA (évite double débit)
- Filtrage de contenu pour enfants (prompts négatifs OpenAI)
