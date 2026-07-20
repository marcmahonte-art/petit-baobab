# Mutualisation des composants /dashboard et /dashboardstudent

## Résultat du diagnostic (Étape 1)

### Architecture actuelle découverte

La structure réelle diffère de ce que la demande présuppose :

| Composant | `src/components/` (parent) | `dashboardstudent/_components/` (élève) | Verdict |
|---|---|---|---|
| **hero-banner.tsx** | ✅ Existe (54 lignes) — **code mort, 0 imports** | ✅ Existe (54 lignes) — **seul utilisé** | **100% identique** → byte pour byte |
| **feature-card.tsx** | ✅ Existe (42 lignes) — importé seulement par feature-modules.tsx dans le même dossier | ✅ Existe (42 lignes) | **100% identique** |
| **feature-modules.tsx** | ✅ Existe (21 lignes) — **code mort, 0 imports externes** | ✅ Existe (21 lignes) | Identique sauf 1 ligne d'import (`@/components/feature-card` vs `@/app/dashboardstudent/_components/feature-card`) |
| **recent-colorings.tsx** | ✅ Existe (125 lignes) — **code mort** | ✅ Existe (125 lignes) | **100% identique** |
| **activity-panel.tsx** | ✅ Existe (72 lignes) — **code mort** | ✅ Existe (72 lignes) | **100% identique** |
| **rewards-card.tsx** | ✅ Existe (45 lignes) — **code mort** | ✅ Existe (45 lignes) | **100% identique** |
| **mobile-bottom-nav.tsx** | ✅ Existe (42 lignes) — utilisé par `/dashboard`, `/parents`, `/parametres`, etc. | ✅ Existe (42 lignes) | Diff : href Accueil = `/dashboard` vs `/dashboardstudent` |
| **sidebar.tsx** | ✅ Existe (101 lignes) — utilisé par `/dashboard`, `/parents`, `/magic-drawing`, etc. | ✅ Existe (101 lignes) | Diff : href Accueil, commentaire logo, **contient les liens Espace parents + Facturation** |
| **header.tsx** | ✅ Existe (438 lignes) — **pas importé directement** par les pages, mais contient le code parent | ✅ Existe (437 lignes) — importé par dashboardstudent/page.tsx | Diff : import sidebar local |

> [!IMPORTANT]
> **Découverte clé** : `/dashboard/page.tsx` N'affiche PAS les mêmes composants que `/dashboardstudent/page.tsx`.
> - `/dashboard` utilise `<ParentsPage />` (bandeau premium, pricing, activités à venir, etc.) — c'est l'**espace parents**
> - `/dashboardstudent` utilise `<Header /> + <HeroBanner /> + <FeatureModules /> + <RecentColorings /> + <ActivityPanel /> + <RewardsCard />` — c'est l'**espace enfant/élève**
>
> Les copies dans `src/components/` de hero-banner, feature-card, feature-modules, recent-colorings, activity-panel, rewards-card sont du **code mort** qui n'est importé par aucune page.

### Composants à source unique (Sidebar, Header, MobileBottomNav)

- **`src/components/sidebar.tsx`** → utilisée par 8 fichiers : `/dashboard/page.tsx`, `header.tsx` (mobile menu), `/parents/page.tsx`, `/parents/billing/page.tsx`, `/parametres/page.tsx`, `/mes-livres/page.tsx`, `/livres-de-coloriage/page.tsx`, `/magic-drawing/page.tsx`
- **`src/components/header.tsx`** → contient une branche conditionnelle `if (studentSession)` qui rend un header élève simplifié. **Pas importé directement par des pages** (utilisé internement ?). À noter : le header de `dashboardstudent` est une copie complète de ce fichier.
- **`src/components/mobile-bottom-nav.tsx`** → utilisé par les mêmes pages que sidebar

### Récupération des données

Les composants identiques récupèrent tous leurs données via :
- **`useProfileStore`** (Zustand) : hero-banner, activity-panel, rewards-card
- **`drawingService.list()`** (appel API interne) : recent-colorings
- **Props statiques** : feature-card, feature-modules

Aucun composant identique ne lit de cookies ou de session directement. Ils sont tous "présentation pure" basée sur le store de profil — parfaits pour la mutualisation.

---

## Proposed Changes

### 1. Créer un dossier partagé `src/components/child-dashboard/`

Destination pour les composants mutualisés, avec un barrel export `index.ts`.

#### [NEW] [index.ts](file:///c:/Users/Lenovo/Desktop/Petit%20%20Baobab/petit-baobab/src/components/child-dashboard/index.ts)
Barrel export pour tous les composants partagés.

#### [NEW] [hero-banner.tsx](file:///c:/Users/Lenovo/Desktop/Petit%20%20Baobab/petit-baobab/src/components/child-dashboard/hero-banner.tsx)
Déplacé depuis `dashboardstudent/_components/hero-banner.tsx`. Code identique, zéro changement.

#### [NEW] [feature-card.tsx](file:///c:/Users/Lenovo/Desktop/Petit%20%20Baobab/petit-baobab/src/components/child-dashboard/feature-card.tsx)
Déplacé depuis `dashboardstudent/_components/feature-card.tsx`. Code identique.

#### [NEW] [feature-modules.tsx](file:///c:/Users/Lenovo/Desktop/Petit%20%20Baobab/petit-baobab/src/components/child-dashboard/feature-modules.tsx)
Déplacé, avec mise à jour de l'import de `FeatureCard` pour pointer vers le dossier partagé.

#### [NEW] [recent-colorings.tsx](file:///c:/Users/Lenovo/Desktop/Petit%20%20Baobab/petit-baobab/src/components/child-dashboard/recent-colorings.tsx)
Déplacé. Code identique.

#### [NEW] [activity-panel.tsx](file:///c:/Users/Lenovo/Desktop/Petit%20%20Baobab/petit-baobab/src/components/child-dashboard/activity-panel.tsx)
Déplacé. Code identique.

#### [NEW] [rewards-card.tsx](file:///c:/Users/Lenovo/Desktop/Petit%20%20Baobab/petit-baobab/src/components/child-dashboard/rewards-card.tsx)
Déplacé. Code identique.

---

### 2. Créer un tableau de navigation partagé

#### [NEW] [nav-items.ts](file:///c:/Users/Lenovo/Desktop/Petit%20%20Baobab/petit-baobab/src/components/child-dashboard/nav-items.ts)

Tableau `commonNavItems` contenant les 9 liens communs (Accueil exclu car le href diffère) :
```ts
// Liens communs à /dashboard et /dashboardstudent sidebar
export const commonNavItems = [
  { icon: Palette, label: "Coloriage", href: "/coloriage" },
  { icon: Sparkles, label: "Dessin magique", href: "/magic-drawing" },
  { icon: BookOpen, label: "Livres de coloriage", href: "/livres-de-coloriage" },
  { icon: Bookmark, label: "Mes livres", href: "/mes-livres" },
  { icon: Gamepad2, label: "Jeux éducatifs", href: "#" },
  { icon: Bookmark, label: "Histoires", href: "#" },
  { icon: Tent, label: "Activités", href: "#" },
]

export const settingsNavItem = { icon: Settings, label: "Paramètres", href: "/parametres" }
```

Chaque sidebar compose ses liens propres autour de ce tableau partagé.

---

### 3. MobileBottomNav — mutualisation avec prop `homeHref`

#### [NEW] [mobile-bottom-nav.tsx](file:///c:/Users/Lenovo/Desktop/Petit%20%20Baobab/petit-baobab/src/components/child-dashboard/mobile-bottom-nav.tsx)

Même code que l'actuel, mais avec une **prop `homeHref`** (par défaut `"/dashboard"`) pour différencier le lien "Accueil".

#### [MODIFY] [page.tsx](file:///c:/Users/Lenovo/Desktop/Petit%20%20Baobab/petit-baobab/src/app/dashboardstudent/page.tsx)
Import `MobileBottomNav` depuis le dossier partagé, passage de `homeHref="/dashboardstudent"`.

#### [MODIFY] [page.tsx](file:///c:/Users/Lenovo/Desktop/Petit%20%20Baobab/petit-baobab/src/app/dashboard/page.tsx)
Import `MobileBottomNav` depuis le dossier partagé (sans prop, valeur par défaut `/dashboard`).

> Toutes les autres pages qui importent `MobileBottomNav` depuis `@/components/mobile-bottom-nav` **ne sont pas modifiées** car elles veulent le href `/dashboard` par défaut — sauf que le fichier d'origine (`src/components/mobile-bottom-nav.tsx`) sera conservé tel quel. Seules les pages dashboard/dashboardstudent changent leur import.

> [!IMPORTANT]
> **Choix pour mobile-bottom-nav.tsx** : Plutôt que modifier l'original `src/components/mobile-bottom-nav.tsx` (utilisé par 7 autres pages), je crée la version partagée dans `child-dashboard/` et ne touche qu'aux 2 pages dashboard. L'original `src/components/mobile-bottom-nav.tsx` reste inchangé pour ne pas impacter les autres pages. On pourra migrer les autres pages ultérieurement.

---

### 4. Mise à jour des Sidebars (restent séparées)

#### [MODIFY] [sidebar.tsx](file:///c:/Users/Lenovo/Desktop/Petit%20%20Baobab/petit-baobab/src/components/sidebar.tsx)
Importer `commonNavItems` et `settingsNavItem` depuis `child-dashboard/nav-items.ts`. Reconstituer le tableau `navItems` en composant :
```ts
const navItems = [
  { icon: Home, label: "Accueil", href: "/dashboard" },
  ...commonNavItems,
  { icon: Users, label: "Espace parents", href: "/parents" },
  { icon: CreditCard, label: "Facturation", href: "/parents/billing" },
  settingsNavItem,
]
```
Le JSX reste strictement identique. Seule la source de données change.

#### [MODIFY] [sidebar.tsx](file:///c:/Users/Lenovo/Desktop/Petit%20%20Baobab/petit-baobab/src/app/dashboardstudent/_components/sidebar.tsx)
Même principe :
```ts
const navItems = [
  { icon: Home, label: "Accueil", href: "/dashboardstudent" },
  ...commonNavItems,
  settingsNavItem,
]
```
Pas de lien "Espace parents" ni "Facturation". Le JSX reste identique. **Ce composant reste dans `dashboardstudent/_components/`**, pas de fusion.

> [!WARNING]
> **Bug existant découvert** : la sidebar de `dashboardstudent` contient encore les liens "Espace parents" et "Facturation" (lignes 19-20) ! La duplication n'a pas été nettoyée après la copie. En utilisant le tableau `commonNavItems` partagé, ce bug sera automatiquement corrigé car seuls les liens communs sont inclus, et chaque sidebar ajoute explicitement ses liens propres.

---

### 5. Mise à jour de `/dashboardstudent/page.tsx`

#### [MODIFY] [page.tsx](file:///c:/Users/Lenovo/Desktop/Petit%20%20Baobab/petit-baobab/src/app/dashboardstudent/page.tsx)
Remplacer les imports de `_components/hero-banner`, `_components/feature-modules`, etc. par des imports depuis `@/components/child-dashboard`.

---

### 6. Nettoyage : suppression des fichiers dupliqués

#### [DELETE] `src/app/dashboardstudent/_components/hero-banner.tsx`
#### [DELETE] `src/app/dashboardstudent/_components/feature-card.tsx`
#### [DELETE] `src/app/dashboardstudent/_components/feature-modules.tsx`
#### [DELETE] `src/app/dashboardstudent/_components/recent-colorings.tsx`
#### [DELETE] `src/app/dashboardstudent/_components/activity-panel.tsx`
#### [DELETE] `src/app/dashboardstudent/_components/rewards-card.tsx`

Les fichiers orphelins dans `src/components/` (hero-banner, feature-card, feature-modules, recent-colorings, activity-panel, rewards-card) seront aussi supprimés car ils ne sont importés par aucun fichier.

#### [DELETE] `src/components/hero-banner.tsx`
#### [DELETE] `src/components/feature-card.tsx`
#### [DELETE] `src/components/feature-modules.tsx`
#### [DELETE] `src/components/recent-colorings.tsx`
#### [DELETE] `src/components/activity-panel.tsx`
#### [DELETE] `src/components/rewards-card.tsx`

---

### 7. Headers — restent STRICTEMENT séparés

**Aucune modification** à `src/components/header.tsx` ni à `src/app/dashboardstudent/_components/header.tsx`. Ces deux fichiers restent exactement là où ils sont, séparés, conformément à la consigne.

---

## Fichiers touchés — résumé

| Action | Fichier | Raison |
|--------|---------|--------|
| **CRÉER** | `src/components/child-dashboard/index.ts` | Barrel export |
| **CRÉER** | `src/components/child-dashboard/hero-banner.tsx` | Mutualisé |
| **CRÉER** | `src/components/child-dashboard/feature-card.tsx` | Mutualisé |
| **CRÉER** | `src/components/child-dashboard/feature-modules.tsx` | Mutualisé |
| **CRÉER** | `src/components/child-dashboard/recent-colorings.tsx` | Mutualisé |
| **CRÉER** | `src/components/child-dashboard/activity-panel.tsx` | Mutualisé |
| **CRÉER** | `src/components/child-dashboard/rewards-card.tsx` | Mutualisé |
| **CRÉER** | `src/components/child-dashboard/nav-items.ts` | Tableau liens communs |
| **CRÉER** | `src/components/child-dashboard/mobile-bottom-nav.tsx` | Mutualisé avec prop homeHref |
| **MODIFIER** | `src/app/dashboardstudent/page.tsx` | Changer les imports |
| **MODIFIER** | `src/app/dashboard/page.tsx` | Changer import MobileBottomNav |
| **MODIFIER** | `src/components/sidebar.tsx` | Utiliser commonNavItems |
| **MODIFIER** | `src/app/dashboardstudent/_components/sidebar.tsx` | Utiliser commonNavItems (corrige bug liens parent) |
| **SUPPRIMER** | 6 fichiers dans `dashboardstudent/_components/` | Remplacés par versions partagées |
| **SUPPRIMER** | 6 fichiers orphelins dans `src/components/` | Code mort |

**NON modifiés** (par design) :
- `src/components/header.tsx` — header parent, reste séparé
- `src/app/dashboardstudent/_components/header.tsx` — header élève, reste séparé
- `src/components/mobile-bottom-nav.tsx` — version originale utilisée par les autres pages, inchangée
- Aucun fichier lié à l'auth, cookies, middleware, store Zustand

## Open Questions

> [!IMPORTANT]
> **La sidebar élève contient actuellement les liens "Espace parents" et "Facturation"** (visible dans le code source lignes 19-20 de `dashboardstudent/_components/sidebar.tsx`). C'est clairement un bug de la duplication initiale. La refactorisation proposée **corrigera automatiquement** ce problème en ne composant que les liens communs + le lien Paramètres (sans Espace parents ni Facturation). **Confirmez-vous que c'est bien le comportement souhaité ?**

## Verification Plan

### Build
```bash
cd petit-baobab && npm run build
```
Le build Next.js confirmera que tous les imports sont résolus et qu'il n'y a pas de régression TypeScript.

### Manual Verification
1. Naviguer vers `/dashboardstudent` → vérifier que tous les composants s'affichent correctement (HeroBanner, FeatureModules, RecentColorings, ActivityPanel, RewardsCard)
2. Vérifier que la sidebar de `/dashboardstudent` n'affiche **PAS** "Espace parents" ni "Facturation"
3. Vérifier que la sidebar de `/dashboard` affiche bien "Espace parents" et "Facturation"
4. Vérifier le MobileBottomNav sur les deux espaces (lien Accueil pointe vers la bonne route)
5. Pas de test de session/auth nécessaire — zéro changement dans cette zone
