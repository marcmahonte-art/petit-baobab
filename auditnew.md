# 📋 RAPPORT D'AUDIT TECHNIQUE — Petit Baobab
**Système d'étoiles, rôles, connexion élève, synchronisation**
*Audit statique — aucune modification. 17/07/2026*

---

## Score global
**58 / 100**
Justification : L'architecture global est cohérente et la consommation école/élève est correctement routée, mais 3 bloqueurs empêchent la conformité : (1) le middleware n'injecte pas `x-classroom-id`/`x-profile-id` → la génération IA élève échoue, (2) aucun renouvellement automatique des étoiles (cron/trigger absents), (3) pas de vraie synchronisation temps réel pour l'élève.

---

## Architecture générale
Schéma DB sain (accounts, child_profiles, classrooms, school_students, saved_drawings, books, stars_transactions, student_activities). Séparation nette parent/école via `account.plan` + flags `has_family_sub`/`has_school_sub`. Routes API RESTful, auth élève par JWT dédié (`sb-student-token`). Le flux de consommation école est correct (magic-drawing résout `classroom→account_id`). Points faibles : logique de renouvellement étoiles uniquement "lazy" au login, pas de mécanisme serveur autonome ; deux middlewares (`middleware.ts` + `proxy.ts`) se chevauchent.

---

## Flux Parent
- ✅ Connexion `/login` → cookies `sb-access-token`/`sb-refresh-token` posés (`auth.ts:66-86`)
- ✅ Redirection parent simple → `/dashboard` (`callback/route.ts:88`, `login/page.tsx`)
- ✅ Consommation étoiles déduite du `account` parent (`magic-drawing/route.ts:124-147`)
- ✅ Remboursement auto si échec IA (`magic-drawing/route.ts:278-279`)
- ⚠️ Renouvellement quotidien gratuit non fiable (voir Gestion des étoiles)
- ✅ `stars/history` propre et paginé (`stars/history/route.ts`)

## Flux Enseignant
- ✅ Redirection enseignant pur → `/school/dashboard` (`callback/route.ts:86`, `login/page.tsx:92`)
- ✅ Redirection double-flag → `/select-space` (`callback/route.ts:83-85`, `select-space/page.tsx` existe ✅)
- ✅ `/school/dashboard` protégé (middleware BLOC 1, `school-auth.ts:42`)
- ✅ Dashboard lit `account.stars_balance` (`school/dashboard/route.ts:41-46`)
- ❌ Renouvellement mensuel école jamais déclenché
- ⚠️ `teacher.name` est un fallback hardcodé "Awa Kaboré" (`school/dashboard/route.ts:288`) — pas le vrai nom
- ⚠️ `localStorage("pb-default-space")` coché mais jamais relu en header (`callback` lit `x-pb-default-space` inexistant) → préférence mémorisée inefficace

## Flux Élève
- ✅ Route `POST /api/auth/student-login` existe (`student-login/route.ts`)
- ✅ Homonymes gérés (retour `multiple:true` + `students[]`, `student-login/route.ts:88-97`)
- ✅ Cookie `sb-student-token` httpOnly, secure prod, 7j (`student-session.ts:14-20`)
- ✅ JWT signé avec `STUDENT_JWT_SECRET` (pas la clé Supabase) (`student-session.ts:9-30`) — ⚠️ fallback secret par défaut si var absente
- ✅ Ligne `student_activities` 'login' créée (`student-login/route.ts:156-163`)
- ✅ `/school` public, pas redirigé (`middleware.ts` BLOC 3)
- ✅ Élève ne peut pas atteindre `/school/dashboard` (middleware BLOC 1)
- ❌ **Écart critique** : UX "code + prénom simultanément" implémentée, mais l'étape 1 (code → liste des élèves à cliquer) **n'est pas** implémentée. Le brief demande de vérifier laquelle est en place → **c'est la variante alternative** (code+prénom), pas la variante étape-1/étape-2.
- ❌ **Écart critique** : `magic-drawing` élève échoue — middleware n'injecte que `x-session-type`, pas `x-classroom-id`/`x-profile-id` (`middleware.ts:84-86` vs `magic-drawing/route.ts:148-156` → 400 "informations de classe manquantes")
- ✅ Session élève affiche le solde école dans le Header (`header.tsx:27-31, 37-55`)
- ⚠️ Payload JWT correct `{profile_id, student_id, classroom_id, name, mascot, type:'student'}` (`student-session.ts:26`)

---

## Gestion des étoiles
- **Atomicité** : voie nominale ✅ (`adjust_stars` PL/pgSQL, `01_auth_stars_tables.sql:195-226`, UPDATE+INSERT transactionnels). Voie fallback ❌ non-atomique (`auth.ts:136-183`, read-then-write, race condition possible).
- **Décrément** : `UPDATE accounts SET stars_balance = stars_balance + p_amount WHERE id=...` ✅ atomique au niveau SQL. Pas de pattern `WHERE stars_balance >= X` mais la fonction lève une exception si `<0` ✅.
- **Remboursement** : auto en cas d'échec IA ✅ (`magic-drawing/route.ts:278-279` + `REFUND`).
- **Retour solde** : `newBalance` renvoyé ✅ (`magic-drawing/route.ts:338`) mais **le store élève (`studentSession.starsBalance`) n'est pas mis à jour côté client** après génération → UI élève affiche un solde périmé.
- **Renouvellement gratuit** : ❌ pas de cron/trigger/edge function. Lazy uniquement au login/session (`login/route.ts:110-128`, `session/route.ts:41-59`), basé sur "24h glissantes" (pas minuit GMT), non cumulatif ✅.
- **Renouvellement école** : ❌ totalement absent (jamais déclenché).
- **Double consommation** : ❌ aucune protection (pas d'idempotence sur `drawingId`, `saved_drawings.id` fourni mais pas de contrainte unique) → double-clic = double débit.
- **CHECK/stars_balance >= 0** : ✅ contrainte `CHECK (stars_balance >= 0)` (`01_auth_stars_tables.sql:30`) + guard SQL.

---

## Synchronisation temps réel
**Ce qui existe** : polling 30s du dashboard enseignant (`DashboardClient.tsx:19-22`) → le solde école se rafraîchit ~30s après une conso élève.
**Ce qui manque** : aucun Supabase Realtime (`supabase.channel()`/`postgres_changes` introuvable). Pas de polling côté élève (Header lit un store statique).
**Impact** : si Ali (élève) consomme 5★, le dashboard enseignant se met à jour après ≤30s (acceptable), mais **le dashboard d'Awa (élève)** ne se met PAS à jour du tout (pas de fetch périodique de son solde). Pas de push instantané.

---

## Base de données
- ✅ Tables présentes : `accounts, child_profiles, classrooms, school_students, saved_drawings, books, stars_transactions, student_activities`
- ✅ `accounts` a `stars_balance, plan, plan_renewed_at, has_family_sub, has_school_sub` (`01_auth_stars_tables.sql:27-34`, `03_role_columns.sql:7-9`)
- ✅ RLS activé sur toutes les tables (`01_auth_stars_tables.sql:233-238`)
- ⚠️ **RLS élève** : un élève n'a PAS de session Supabase (JWT app uniquement). Les policies RLS sont basées sur `auth.uid()` → un élève ne peut rien lire directement via RLS. Le solde école est lu **côté serveur** par les routes (avec service/admin ou token adulte), pas par l'élève. La règle "élève lit stars_balance de son école sans modifier" n'est **pas** garantie par RLS (elle est gérée par l'absence de route d'écriture exposée à l'élève) — fonctionnel mais pas défensif au niveau RLS.
- ✅ Index présents : `stars_transactions(account_id)` (`01_auth_stars_tables.sql:336`), `classrooms(class_code)`, `school_students(classroom_id)`, `school_students(lower(first_name), classroom_id)`.
- ⚠️ Pas d'index composite `(account_id, created_at)` sur `stars_transactions` (demandé explicitement). Le dashboard école trie/filtre par date → scan possible à grande échelle.
- ✅ Contrainte `CHECK stars_balance >= 0` présente.

---

## Sécurité
- ✅ Auth élève : JWT `HS256` signé `STUDENT_JWT_SECRET`, httpOnly, 7j, payload validé (`type==='student'`) (`student-session.ts`)
- ✅ `/school/dashboard` refuse le token élève (middleware + `school-auth.ts:42`)
- ✅ Routes école protégées par `getTeacherSession` (vérifie `plan==='ecole_pro'`)
- ⚠️ `STUDENT_JWT_SECRET` a un fallback hardcodé (`student-session.ts:10`) → si la var d'env manque, tous les JWT sont signés avec un secret public → forgeabilité. À vérifier en prod.
- ⚠️ `proxy.ts` (2e middleware) redondant avec `middleware.ts` ; Next n'exécute qu'un middleware → `proxy.ts` est mort, mais sa présence est trompeuse et sa logique de redirection `/dashboard`→`/login` est déjà couverte (ou non, selon lequel tourne).
- ⚠️ RLS `classrooms_access`/`students_access`/`activities_access` utilisent `auth.uid()` → ne couvrent que le flux adulte ; le flux élève repose entièrement sur la logique applicative (pas de fail-safe RLS).

---

## Bugs détectés
1. **`middleware.ts:84-86`** — n'injecte que `x-session-type` pour l'élève. `magic-drawing/route.ts:148-156` exige `x-classroom-id` → **génération IA élève impossible (400)**. Impact : fonctionnalité élève cassée.
2. **`school/dashboard/route.ts:288`** — `teacher.name` hardcodé "Awa Kaboré". Impact : fausse identité enseignant.
3. **`callback/route.ts:69,85`** — lit header `x-pb-default-space` jamais envoyé par le front (`select-space/page.tsx:143-149` écrit `localStorage` seul). Impact : préférence "se souvenir de mon choix" ignorée.
4. **`auth.ts:136-183`** — `adjustStarsFallback` non atomique. Impact : race condition si RPC absente.
5. **`magic-drawing/route.ts:221-230`** — pas d'idempotence sur `drawingId`. Impact : double débit sur double-clic.
6. **`student-session.ts:10`** — fallback secret JWT. Impact : risque de forge si env manquant.
7. **Header élève (`header.tsx:27-31`)** — `studentSession.starsBalance` jamais updaté après consommation. Impact : solde élève périmé jusqu'à reconnexion.
8. **`proxy.ts`** — middleware mort/redondant. Impact : confusion maintenance.

---

## Risques
- **Concurrence** : fallback non-atomique + pas d'idempotence → surconsommation possible sous charge.
- **Performance** : pas d'index `(account_id, created_at)` ; dashboard école scanne toutes les transactions à chaque appel.
- **Sécurité** : secret JWT par défaut ; RLS ne couvre pas le flux élève (défense en profondeur absente).
- **Architecture** : renouvellement étoiles dépendant du login utilisateur → utilisateurs inactifs jamais recrédités ; école jamais renouvelée.

---

## Plan de correction par priorité

### Priorité 1 — Bloquant (avant mise en prod)
1. **Middleware** : injecter `x-classroom-id` et `x-profile-id` depuis le JWT élève vérifié (`student-session.getStudentSession`) dans BLOC 2 (`middleware.ts:84`). Sans ça, l'élève ne peut pas générer de dessin.
2. **Renouvellement école** : créer un mécanisme (pg_cron / Edge Function / trigger) remettant `stars_balance=1000` à `plan_renewed_at` pour `ecole_pro`.
3. **Renouvellement gratuit** : remplacer le lazy-login par un cron/trigger à minuit GMT (ou documenter l'acceptation du lazy).
4. **`STUDENT_JWT_SECRET`** : garantir la variable d'env en prod, supprimer/surveiller le fallback.

### Priorité 2 — Important (2 semaines)
5. Idempotence génération (`drawingId` unique constraint ou guard) contre double-clip.
6. Mettre à jour `studentSession.starsBalance` côté client après `magic-drawing` (ou polling léger).
7. Corriger `teacher.name` depuis le vrai profil utilisateur.
8. Câbler la préférence `localStorage` → header `x-pb-default-space` (ou lire le localStorage côté callback).
9. Index composite `stars_transactions(account_id, created_at)`.

### Priorité 3 — Amélioration (prochain sprint)
10. Supabase Realtime sur `accounts.stars_balance` pour synchro instantanée enseignant+élève.
11. Supprimer/`proxy.ts` redondant ou fusionner dans `middleware.ts`.
12. Garantir `adjust_stars` RPC toujours présent (retirer le fallback non-atomique, ou le sécuriser avec `UPDATE ... WHERE stars_balance >= X`).
13. RLS défensive pour le flux élève (policies lisant `stars_balance` par `classroom_id` via le JWT, en lecture seule).
