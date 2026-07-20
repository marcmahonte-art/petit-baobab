# Problématique — Petit Baobab : mélange des sessions et lenteur après duplication de `/dashboard`

## 1. Contexte du projet

**Petit Baobab** est une application web éducative pour enfants (coloriage, dessin magique, livres), construite avec **Next.js 16 (App Router)**, **Supabase** (auth + base de données + Realtime) et déployée sur **Vercel**.

L'application gère **trois espaces distincts** selon le type de compte :

| Espace | Route | Public | Mécanisme d'auth |
|--------|-------|--------|------------------|
| Parent (enfant) | `/dashboard` | Enfant connecté via un compte parent | Session Supabase (`sb-access-token`, `sb-refresh-token`, cookie `pb-role=parent`) |
| Élève (école) | `/dashboardstudent` | Élève d'une classe | Token JWT élève (`sb-student-token`, httpOnly, vérif locale via `jose`, **sans appel base de données**) + `sb-student-session-active` |
| Parent (compte) | `/parents` | Adulte, gestion du compte | Session Supabase |
| Directeur d'école | `/school/dashboard` | Enseignant (`pb-role=teacher`) | Session Supabase |

Les espaces enfant partagent des routes « jeux » (`/coloriage`, `/magic-drawing`, `/livres-de-coloriage`, `/mes-livres`, `/parametres`).

## 2. Problématique A — Mélange / cohabitation des sessions (parent vs élève)

### 2.1 Ce qui se produit

Un utilisateur qui se connecte avec un **compte parent** se retrouve parfois affiché dans l'espace **élève** (`/dashboardstudent`) sous l'identité d'un élève différent (ex. « Awa »), avec le header en « mode élève » (bouton « Quitter », logo remplacé par le nom de la classe). Le parent perd son propre espace et voit les données d'un autre enfant.

### 2.2 Cause racine

Le système utilise **deux jeux de cookies distincts et indépendants** qui peuvent coexister dans le même navigateur :

- Cookies **parent** : `sb-access-token`, `sb-refresh-token`, `pb-role`.
- Cookies **élève** : `sb-student-token` (JWT httpOnly), `sb-student-session-active`.

Trois défaillances permettaient leur cohabitation :

1. **`clearAuthCookies` ne supprimait pas les cookies élève.** Lors d'une déconnexion parent, seuls les cookies parent étaient purgés. Un `sb-student-token` résiduel (d'une connexion élève antérieure) restait présent.
2. **Le login parent ne purgeait pas non plus les cookies élève.** Un parent pouvait se connecter *sans* s'être préalablement déconnecté de la session élève ; les deux sessions restaient actives côte à côte.
3. **Le store client (`studentSession` dans Zustand) n'était pas vidé au login parent.** Même sans cookie, le store en mémoire navigateur conservait la session élève (Awa). Le header global (`components/header.tsx`) bascule en « mode élève » **dès qu'un `studentSession` existe dans le store**, indépendamment de la session parent active.

### 2.3 Pourquoi `/dashboardstudent` « gagnait »

- La page `dashboardstudent/page.tsx` restaure la session depuis `sb-student-token` (vérif locale, pas d'appel DB).
- Le header choisit le mode élève si `studentSession.type === "student"` est présent → affichage élève même pour un parent.
- Le middleware laissait un parent passer sur `/dashboardstudent` (`NextResponse.next()` dès qu'un `adultToken` était présent), sans redirection.

### 2.4 Objectif visé (A)

> **`/dashboardstudent` doit être exclusivement réservé à la session élève.** Un compte parent ne doit jamais y accéder ni y être affiché. La connexion d'un parent doit systématiquement écraser / purger toute trace de session élève (cookie + store). Inversement, un élève ne doit jamais voir l'espace parent.

## 3. Problématique B — Lenteur après duplication de `/dashboard`

### 3.1 Ce qui a été fait

Pour unifier l'expérience visuelle, l'espace parent `/dashboard` a été **dupliqué** pour devenir identique à `/dashboardstudent` : copie des composants dans `src/app/dashboard/_components/`, réécriture de `page.tsx`. Les deux dashboards utilisent désormais des **sidebars séparées** (pas de composant partagé).

### 3.2 Symptôme de lenteur

L'utilisateur ressent le site comme **« trop lent »**, notamment sur l'accès à l'espace enfant.

### 3.3 Causes identifiées

1. **Chargement bloquant de `dashboardstudent/page.tsx`.** La page attend une réponse de `/api/auth/student-session` (lignes 51-59) avant d'afficher quoi que ce soit, avec un spinner plein écran. Tant que l'appel n'est pas terminé, rien ne s'affiche → sensation de blocage.
2. **Realtime WebSocket ouvert en permanence.** `useRealtimeStars` ouvrait 1 connexion WebSocket persistante par dashboard ouvert. Pour 400 utilisateurs simultanés, cela sature les limites de connexions de Supabase (Realtime + base de données), pas Next.js/Vercel. Le hook a été désactivé côté élève, mais le modèle reste un goulot d'étranglement à l'échelle.
3. **Absence de cache côté serveur sur les routes data.** Les routes `/api/drawings` et `/api/books` sont sollicitées à chaque chargement sans cache mémoire (TTL), générant autant d'appels base de données que de visiteurs.
4. **Images servies en `<img>` brut** au lieu de `next/image` (AVIF/WebP + cache 30 j déjà configuré dans `next.config.ts` mais non utilisé partout), rallongeant le poids des pages.

### 3.4 Objectif visé (B)

> Maintenir l'identité visuelle unifiée des deux dashboards **sans dégrader les performances**, et préparer la montée en charge à ~400 utilisateurs :
> - Chargement **non bloquant** de l'espace enfant (afficher immédiatement, puis compléter la session).
> - **Réduire la pression sur Supabase** (pas de WebSocket par dashboard, cache serveur TTL sur les routes de lecture).
> - Servir les images optimisées (`next/image`).

## 4. Objectif global du projet

1. **Isolation stricte des sessions** : un espace = un type de compte. Aucune fuite parent↔élève, ni en cookie ni en store, ni au niveau du middleware.
2. **Expérience visuelle cohérente** entre `/dashboard` (parent) et `/dashboardstudent` (élève) sans duplication de logique métier fragile.
3. **Performance et scalabilité** : site réactif (< chargement perçu instantané) et capable de supporter ~400 utilisateurs sans saturer Supabase.
4. **Robustesse du déploiement** : build `next build --webpack` (Turbopack incompatible avec le middleware sur Next 16), déploiement maîtrisé sur Vercel.

## 5. Corrections déjà appliquées

| Correctif | Fichier | Commit |
|-----------|---------|--------|
| Suppression des cookies élève dans `clearAuthCookies` | `src/lib/auth.ts` | `e1c9991` |
| Purge des cookies élève au login parent (`setAuthCookies`) | `src/lib/auth.ts` | `e1c9991` |
| Redirection parent → `/dashboard` si accès à `/dashboardstudent` | `middleware.ts` | `1eaaa60` |
| Vidage de `studentSession` au login parent (`checkSession`) | `src/lib/auth-store.ts` | `1eaaa60` |
| Désactivation de `useRealtimeStars` côté élève | `dashboardstudent/_components/header.tsx` | `5411c8f` |

## 6. Actions restantes recommandées (performance)

1. Rendre `dashboardstudent/page.tsx` **non bloquant** (afficher le shell immédiatement, puis hydrater la session).
2. Ajouter un **cache mémoire serveur TTL ~5 s** par `profileId` sur `/api/drawings` et `/api/books`.
3. Remplacer les `<img>` par `next/image` pour bénéficier d'AVIF/WebP + cache 30 j.
4. (Option) Centraliser la sidebar enfant en **un seul composant partagé** pour éviter la dérive entre `/dashboard` et `/dashboardstudent`.
