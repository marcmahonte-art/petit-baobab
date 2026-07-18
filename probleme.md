# 🐞 Problèmes — Espace Élève (coloriage, livres, header)

Analyse de l'audit : les 3 symptômes ont une **cause racine commune**.

---

## 🔴 Cause racine commune

1. **`setStudentSession` ne synchronise jamais `useProfileStore`**
   (→ `src/lib/auth-store.ts` ~ligne 192, `setStudentSession`).
   Au login élève, on stocke uniquement `useAuthStore.studentSession`
   (Zustand). Le store `useProfileStore` (`activeProfileId`, `activeProfile`)
   reste à `null`/`undefined`.

2. **Toutes les écritures Supabase passent par le client ANON**
   (`src/lib/supabaseClient.ts`) → côté DB `auth.uid()` = **NULL** pour un
   élève (il utilise un JWT custom `sb-student-token`, pas un user Supabase).
   La RLS sur `saved_drawings` et `books` exige
   `profile_id IN (SELECT cp.id ... WHERE acc.user_id = auth.uid())` →
   l'élève est **systématiquement bloqué en écriture**.

Conséquence en cascade : `profileId` = `"anonymous"`, sauvegarde rejetée
par RLS (mais l'UI affiche "✅ enregistré"), et le header lit un fallback.

---

## Problème 1 — Les dessins ne se sauvegardent pas (élève)

- **Fichiers** :
  - `src/components/coloring-page.tsx` :30,60,99,126 (lit `useProfileStore.activeProfileId`)
  - `src/components/canvas-card.tsx` :327,356 (`cleanProfileId = profileId || "anonymous"`)
  - `src/features/drawings/DrawingService.ts` :63 (écrit `profileId: input.profileId`)
  - `src/features/drawings/DrawingStorage.ts` :184-202 (upsert `saved_drawings` client anon)
  - `src/lib/supabaseClient.ts` :5-8 (client anon, auth.uid() = null)
  - `src/lib/auth-store.ts` :192 (setStudentSession ne peupler pas profile-store)
- **Cause** : `activeProfileId` nul → `profile_id = "anonymous"` ; RLS `saved_drawings`
  rejette (auth.uid() null). Même mécanisme pour `saveIA` (magic-drawing).
- **Symptôme visible** : l'UI dit "Dessin enregistré" alors que rien n'est persisté.
- **Correction proposée** :
  - Au login élève, alimenter `useProfileStore.setActiveProfile(profile_id)`
    depuis la réponse `student-login` (avec nom/mascot).
  - Router la sauvegarde élève via une **route API serveur**
    `POST /api/drawings` (client `getSupabaseServer`, validation `x-profile-id`
    du header `x-session-type=student`) afin de contourner la RLS anon.
  - OU ajouter une policy RLS `saved_drawings` autorisant l'écriture quand le
    JWT custom correspond au `profile_id` (via fonction SECURITY DEFINER).

---

## Problème 2 — Les livres ne se sauvegardent pas (élève)

- **Fichiers** :
  - `src/features/books/book-service.ts` :5-10 (RemoteBookStorage si env anon)
  - `src/features/books/RemoteBookStorage.ts` :41-62 (upsert `books` client anon)
  - `src/components/coloring-books-page.tsx` :334 (profileId du livre)
  - `src/features/coloring-book/hooks/useBookPdf.ts` :50-69
- **Cause** : identique au Problème 1. `books` a la **même RLS** (auth.uid()).
  Le `profile_id` du livre n'est pas renseigné côté élève → rejet RLS.
- **Correction proposée** :
  - Synchroniser `profile_id` élève dans le store de livre (depuis `studentSession`).
  - Écrire via une **route API serveur** `POST /api/books` (même pattern que
    dessins) validant `x-profile-id`.

---

## Problème 3 — Le nom de l'élève ne s'affiche pas dans le header

- **Fichiers** :
  - `src/components/coloring-header.tsx` :25,30,34-37 (lit **uniquement** `useProfileStore`)
  - `src/components/header.tsx` :38-79 (lit `studentSession.name` → OK sur /dashboard)
  - `src/lib/auth-store.ts` :192 (setStudentSession ne touche pas profile-store)
- **Cause** : les pages coloriage/livre utilisent `ColoringHeader`, qui lit
  `useProfileStore` (null après login élève) → affiche le fallback `"Awa"`
  au lieu du vrai prénom. Le header principal (`header.tsx`) fonctionne car
  il lit `studentSession`.
- **Correction proposée** :
  - Dans `ColoringHeader`, détecter `useAuthStore().studentSession` et afficher
    `studentSession.name` / `mascot` en priorité (comme `header.tsx`), garder
    le fallback profile-store sinon.
  - (Répare aussi les Problèmes 1 & 2) : au login élève, peupler
    `useProfileStore.setActiveProfile(profile_id)` + ajouter le profil enfant
    (nom/mascot) depuis la réponse `student-login`.

---

## 🧭 Plan de correction recommandé (ordre)

1. **Login élève** (`auth-store.ts` `setStudentSession`) : peupler
   `useProfileStore` (setActiveProfile + addProfile) avec le `profile_id`,
   `name`, `mascot` de la réponse. → répare header + donne le bon
   `profile_id` aux stores dessin/livre.
2. **Routes API serveur** pour les écritures élève :
   `POST /api/drawings` et `POST /api/books` (valident `x-session-type=student`
   + `x-profile-id`, utilisent `getSupabaseServer`). Brancher
   `drawingService`/`bookService` dessus pour la session élève.
3. **RLS** : ajouter une policy `saved_drawings`/`books` pour le flux élève
   (JWT custom → profile_id), ou s'appuyer uniquement sur les routes
   serveur côté service_role.

> ⚠️ Aucune modification de code n'a été faite — analyse seule, conformément
> à la demande. Le document sert de base au correctif à venir.
