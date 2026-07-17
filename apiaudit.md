# 🔍 RAPPORT D'AUDIT API — Petit Baobab

## Score API — 28 routes, 24 complètes et branchées (≈86%) ; 1 BLOQUANTE (RPC manquant), 1 route ouverte (SSRF), 1 IDOR, 1 module non gaté par plan.

---

## ÉTAPE 1 — Inventaire complet des routes API

| Route | Méthodes | Existe | Ce qu'elle fait | Auth | Tables |
|---|---|---|---|---|---|
| `api/auth/login` | POST | ✅ | Connexion parent, crée/complète account+profiles, cookies httpOnly | Aucune (public) | accounts, stars_transactions, child_profiles |
| `api/auth/signup` | POST | ✅ | Inscription parent, RPC adjustStars (5★) | Aucune (public) | profiles, accounts, stars_transactions, child_profiles |
| `api/auth/logout` | POST | ✅ | Efface cookies auth | Aucune | — |
| `api/auth/session` | GET | ✅ | État session + reset quotidien lazy | getServerUser | accounts, stars_transactions, child_profiles |
| `api/auth/callback` | GET | ✅ | OAuth callback, création compte, OTP | OAuth code | profiles, accounts, stars_transactions, child_profiles |
| `api/auth/complete-signup` | GET | ✅ | Vérif OTP, set cookies | OTP | — |
| `api/auth/default-space` | POST | ✅ | Persiste accounts.default_space | getServerUser | accounts |
| `api/auth/student-login` | POST | ✅ | Connexion élève (code+prénom), JWT élève, log activité | Aucune (admin client) | classrooms, school_students, child_profiles, accounts, student_activities |
| `api/auth/student-logout` | POST | ✅ | Efface cookies élève | Aucune | — |
| `api/magic-drawing` | POST | ✅ | Génération IA OpenAI, débit étoiles atomique, lock idempotency, refund | **x-session-type** (parent/student) | classrooms, accounts, magic_drawing_locks, saved_drawings, stars_transactions, Storage |
| `api/magic-drawing/download` | GET | ✅ | Proxy téléchargement image | ❌ **AUCUNE** | — |
| `api/magic-drawing/book/add` | POST | ✅ | Ajoute dessin au livre "Mes dessins magiques" | getUser (parent only) | accounts, child_profiles, books, Storage |
| `api/drawings` | GET | ✅ | Liste SVG locaux (public/illustrations) | Aucune | — (FS) |
| `api/stars/history` | GET | ✅ | Historique transactions paginé | getServerUser (parent) | accounts, stars_transactions |
| `api/billing/plans` | GET | ✅ | Liste plans (hardcodée) | Aucune | — |
| `api/billing/payments` | GET | ✅ | Paiements user | getServerUser | payments |
| `api/billing/subscription` | GET | ✅ | Plan/balance + abonnement | getServerUser | accounts, subscriptions |
| `api/school/classroom` | GET, POST | ✅ | Liste classes + crée classe | getTeacherSession | classrooms + stats |
| `api/school/classroom/[id]` | GET, PATCH, DELETE | ✅ | Détail/Renomme/Archive classe | getTeacherSession (scope account) | classrooms, school_students… |
| `api/school/dashboard` | GET | ✅ | Agrégats dashboard enseignant | getTeacherSession | classrooms, school_students, child_profiles, saved_drawings, books, student_activities, stars_transactions |
| `api/school/students` (bulk) | POST | ✅ | Création lot élèves + profils, cap 60 | getTeacherSession + propriété classe | classrooms, school_students, child_profiles |
| `api/school/students/list` | GET | ✅ | Liste tous élèves + KPIs | getTeacherSession | school_students, child_profiles, saved_drawings, books, student_activities |
| `api/school/students/bulk` | POST | ✅ | Import JSON élèves | getTeacherSession + propriété | idem bulk |
| `api/school/students/import` | POST | ✅ | Import CSV élèves | getTeacherSession + propriété | idem bulk |
| `api/school/students/[id]` | GET, PATCH, DELETE | ✅ | Détail/Modifie/Supprime (soft) élève | getTeacherSession + **propriété classe (403)** | school_students, classrooms, child_profiles… |
| `api/school/students/[id]/activity` | GET | ✅ | Feed activité + chart 7j | getTeacherSession ❌ **PAS de scope account** | school_students, child_profiles, classrooms, student_activities |
| `api/school/students/[id]/stars` | POST | ✅ | Add/retire étoiles (student_activities) | getTeacherSession + propriété | school_students, classrooms, child_profiles, student_activities |
| `api/school/students/[id]/reset` | POST | ✅ | Reset progression (delete activités/dessins/livres) | getTeacherSession + propriété | student_activities, saved_drawings, books |

---

## ÉTAPE 2 — Fonctionnalités frontend (appels réels)

- **Inscription** → `POST /api/auth/signup` ✅ · **Connexion** → `POST /api/auth/login` ✅ · **Déconnexion** → `POST /api/auth/logout` ✅
- **Solde étoiles parent** → payload login/session + `GET /api/billing/subscription` ✅ · **Historique** → `GET /api/stars/history` ✅
- **Sélection profil enfant** → ⚠️ état local (`useState`), pas d'API (page `/parents/select-profile` non câblée)
- **/parents** → `GET /api/auth/session` ✅ (pas d'endpoint dédié, OK)
- **Dashboard élève (solde pool école)** → payload `student-login` + Realtime accounts ✅ (mais pas de polling côté famille/élève hors teacher)
- **Coloriage** → modèles `GET /api/drawings`, sauv. direct `saved_drawings` (client) ✅ · **Mes dessins** → `saved_drawings` direct ✅
- **Magic drawing** → `POST /api/magic-drawing` ✅, add-to-book `POST /api/magic-drawing/book/add` ✅, download `GET /api/magic-drawing/download` ✅
- **Livres** → create/save/list direct `books` (client) ✅ · add dessin → store local puis save ✅ · PDF → client-side ✅
- **Teacher dashboard** → `GET /api/school/dashboard` ✅ · **solde** → dashboard + Realtime/poll ✅
- **Création classe** → ❌ `supabase.rpc('create_classroom')` (RPC **inexistant**) → casse
- **Liste classes** → `GET /api/school/classroom` ✅ · **Ajout élève** → bulk `POST` OU insert direct `school_students` ✅
- **Import CSV** → `POST /api/school/students/import` ✅ · **Liste élèves** → `GET /api/school/students/list` ✅
- **Fiche élève** → `GET /api/school/students/[id]` ✅ · **Activité récente** → dashboard payload / `[id]/activity` ✅
- **Historique étoiles école** → `GET /api/stars/history` ⚠️ (parent-only, pas school) · **QR/codes** → client qrcode.react, pas d'API ✅
- **Connexion élève** → `POST /api/auth/student-login` ✅ · **Homonyme** → idem avec `student_id` ✅ · **Déco élève** → `POST /api/auth/student-logout` ✅
- **Étoiles temps réel** → Supabase Realtime `accounts` (useRealtimeStars) ✅ mais requiert Realtime activé
- **Renouvellement gratuit (5★/jour)** → pg_cron `renew_stars_for_due_accounts` ⚠️ (gated: NE se planifie QUE si extension pg_cron installée)
- **Renouvellement ecole (1000★/mois)** → idem pg_cron ⚠️
- **Achat étoiles** → aucune route (Stripe non câblé côté purchase)

---

## ÉTAPE 3 — Matrice de connexion

| Fonctionnalité | Route appelée | Statut | Problème |
|---|---|---|---|
| Inscription/Connexion/Déconnexion parent | /auth/signup·login·logout | BRANCHÉ | — |
| Solde + historique parent | /billing/subscription·/stars/history | BRANCHÉ | — |
| Sélection profil enfant | (aucune) | DÉBRANCHÉ | Pas d'API; état local seul |
| Dashboard élève (solde) | student-login + Realtime | BRANCHÉ | Pas de polling famille/élève |
| Coloriage (modèles+save) | /drawings + saved_drawings | BRANCHÉ | — |
| Magic drawing | /magic-drawing | BRANCHÉ | — |
| Add-to-book | /magic-drawing/book/add | BRANCHÉ | Parent-only, pas élève |
| Livres CRUD | books (direct) | BRANCHÉ | Direct client (RLS dépendante) |
| Teacher dashboard | /school/dashboard | BRANCHÉ | — |
| **Création classe** | rpc create_classroom | **DÉBRANCHÉ/BLOQUANT** | RPC n'existe pas → throw |
| Liste classes | /school/classroom | BRANCHÉ | — |
| Ajout/Import/Liste élèves | /students(bulk·import·list) | BRANCHÉ | — |
| Fiche élève + activité | /students/[id]·/activity | BRANCHÉ | activity = IDOR |
| Étoiles élève (add/retire/reset) | /students/[id]/stars·reset | BRANCHÉ | — |
| QR codes classe | (client) | BRANCHÉ | Pas d'API (acceptable) |
| Connexion élève | /auth/student-login | BRANCHÉ | — |
| Historique étoiles école | /stars/history | PARTIEL | Parent-only, pas school |
| Renouvellement étoiles | pg_cron SQL | PARTIEL | Nécessite extension pg_cron activée |
| Achat étoiles | (aucune) | MANQUANT | Pas de route purchase |

---

## ÉTAPE 4 — Routes manquantes

### MANQUANT — RPC SQL `create_classroom`
- Priorité : **BLOQUANT**
- Utilisée par : `school-store.createClass`
- Fonction : insérer classroom (account_id, name, academic_year) + retourner row
- Tables : classrooms
- Auth : RLS account_id

### MANQUANT — POST `/api/school/students` (ajout unitaire HTTP)
- Priorité : IMPORTANT
- Utilisée par : ajout élève depuis `/school/students` (actuellement insert direct client)
- Fonction : créer 1 élève + child_profile (comme bulk mais unitaire), cap 60
- Tables : classrooms, school_students, child_profiles
- Auth : teacher

### MANQUANT — GET historique étoiles école (context teacher)
- Priorité : IMPORTANT
- Utilisée par : historique étoiles école côté teacher
- Fonction : lister stars_transactions pour l'account école
- Tables : stars_transactions
- Auth : teacher

### MANQUANT — POST `/api/billing/checkout` (achat étoiles Stripe)
- Priorité : NICE-TO-HAVE
- Utilisée par : bouton achat étoiles
- Fonction : créer session Stripe, ajouter étoiles via adjustStars
- Tables : payments, accounts, stars_transactions
- Auth : parent/teacher

### MANQUANT — POST `/api/parents/select-profile`
- Priorité : NICE-TO-HAVE (si sync serveur requise)
- Utilisée par : /parents/select-profile

---

## ÉTAPE 5 — Routes mal branchées

1. **`school-store.createClass` appelle `supabase.rpc('create_classroom')` (inexistant)** → doit appeler `POST /api/school/classroom` (existe, authentifié). BLOQUANT.
2. **`/api/school/students/[id]/activity` — IDOR** : pas de vérification `account_id`. Un teacher peut lire les activités d'un élève d'un autre teacher via l'UUID. Corriger : joindre classroom → vérifier `account_id`.
3. **`/api/magic-drawing/book/add` — parent-only** : pas de support `x-session-type=student`. Un élève ne peut pas ajouter au livre (le frontend magic-drawing le permet visuellement). À étendre.
4. **`/api/stars/history` — parent-only** : le teacher ne peut pas récupérer son historique école. À brancher en teacher context.
5. **Module `/school/*` non gaté par `plan === 'ecole_pro'`** : `getTeacherSession` n'applique pas le check plan (lu seulement pour l'affichage limite). Tout compte teacher peut utiliser l'espace école. Décision produit : soit documenter, soit ajouter le gate.
6. **`school-store.addStudentsBulk` fait un insert direct client `school_students`** : fonctionne si RLS le permet, mais contourne la logique serveur (cap, profils). À router vers `/api/school/students/bulk`.

---

## ÉTAPE 6 — Audit sécurité

| FAILLE | Type | Impact | Détail |
|---|---|---|---|
| `/api/school/students/[id]/activity` | IDOR | Élevé | Aucun check `account_id` ; fuite données élève inter-teacher |
| `/api/magic-drawing/download` | Exposition/SSRF | Élevé | Proxy ouvert sur toute URL http(s), aucune auth, aucun filtrage domaine → SSRF / téléchargement arbitraire |
| `/api/drawings`, `/api/billing/plans` | Auth manquante | Faible | Public OK (contenu statique) mais à confirmer intentionnel |
| `/api/auth/student-login` | Auth manquante (par design) | Moyen | Pas de rate-limiting → brute-force code+prénom possible |
| Aucune route | Rate limiting | Moyen | Aucune protection anti-bruteforce / anti-abuse sur auth et génération |
| `/api/magic-drawing/book/add` | Auth partielle | Moyen | Pas de support session élève (incohérent avec magic-drawing) |
| Toutes routes | Exposition erreurs | Faible | Messages d'erreur génériques, pas de fuite sensible constatée |

---

## ÉTAPE 7 — Audit étoiles (cœur du système)

**`/api/magic-drawing` — EXCELLENT (référence) :**
- ✅ Vérifie `x-session-type` obligatoire.
- ✅ Si `student` → débit sur **l'account ÉCOLE** via `x-classroom-id` (jamais l'élève).
- ✅ Décrément **atomique** (`adjust_stars`/`adjust_stars_atomic` avec `WHERE stars_balance >= -X`).
- ✅ **Remboursement** automatique si échec IA (`+cost`, REFUND).
- ✅ **Anti double-clic** via `magic_drawing_locks` (unique, 409).
- ✅ Nouveau solde retourné (`newBalance`).
- ⚠️ Légère pré-vérification non-atomique à la ligne ~239, mais le garde-fou atomique RPC couvre.

**Autres routes consommatrices d'étoiles :** seule `magic-drawing` débite (les étoiles élève dans `/students/[id]/stars` sont des `student_activities` virtuelles, pas un débit du solde account — cohérent avec le modèle).

**Renouvellement gratuit (5★/jour) & école (1000★/mois) :**
- ✅ Mécanisme prévu : **pg_cron** `renew_stars_for_due_accounts` (SQL `04_stars_renewal_cron.sql`).
- ⚠️ **BLOQUANT potentiel** : le `cron.schedule` ne s'exécute **QUE si l'extension `pg_cron` est activée** dans Supabase. Sinon le job n'est jamais planifié et « Le renouvellement gratuit/lazy côté app reste fonctionnel (P1-3) » — mais ce fallback « lazy » n'est pas présent dans le code app audité (le reset quotidien n'apparaît que dans `/auth/session` et `/auth/login` comme safety-net partiel). **Risque : si pg_cron désactivé, les users gratuits ne récupèrent pas leurs 5★.**
- ✅ `adjust_stars_atomic` fourni en fallback (robuste).

**Realtime :** `useRealtimeStars` s'abonne à `accounts` UPDATE — correct, mais nécessite Realtime activé sur la table.

---

## ÉTAPE 8 — Rapport final

### Score
**28 routes, 24 complètes/branchées (86%).** 1 BLOQUANT (RPC manquant → création classe cassée), 1 faille IDOR (activity), 1 proxy ouvert SSRF (download), 1 module non gaté plan.

### Routes manquantes par priorité
**BLOQUANT**
1. RPC SQL `create_classroom` (ou rediriger `createClass` vers `POST /api/school/classroom`).

**IMPORTANT**
2. `POST /api/school/students` (ajout unitaire).
3. Historique étoiles côté teacher (`/stars/history` en context teacher).
4. Activer pg_cron OU ajouter fallback lazy de reset quotidien dans l'app.

**NICE-TO-HAVE**
5. `POST /api/billing/checkout` (achat étoiles Stripe).
6. `POST /api/parents/select-profile`.
7. Support `x-session-type=student` sur `/magic-drawing/book/add`.

### Routes mal branchées — corrections
- `school-store.createClass` → appeler `POST /api/school/classroom` au lieu de `rpc('create_classroom')`.
- `students/[id]/activity` → ajouter scope `account_id` (join classroom).
- `magic-drawing/book/add` → gérer `x-session-type` student.
- `stars/history` → accepter context teacher.

### Failles sécurité
- 🔴 IDOR `students/[id]/activity` (Élevé).
- 🔴 `/magic-drawing/download` proxy ouvert (Élevé / SSRF).
- 🟡 Pas de rate-limiting sur auth & génération (Moyen).
- 🟡 `/magic-drawing/book/add` auth partielle (Moyen).

### Problème étoiles
Système de débit **solide et correct** (atomique, remboursé, idempotent, school-billed pour élèves). **Risque majeur** : renouvellement gratuit dépend de pg_cron activé ; sans fallback app vérifié, les comptes free ne se rechargent pas.

---

## Plan d'action

### Sprint 1 — BLOQUANT (cette semaine)
1. **Créer RPC `create_classroom`** (SQL) OU modifier `school-store.createClass` pour appeler `POST /api/school/classroom`.
2. **Corriger IDOR** `students/[id]/activity` (scope account).
3. **Sécuriser `/magic-drawing/download`** (auth + allowlist domaine Supabase Storage).
4. **Vérifier pg_cron activé** sur le projet Supabase ; sinon ajouter fallback lazy dans `/auth/session`.

### Sprint 2 — IMPORTANT
5. `POST /api/school/students` unitaire.
6. Historique étoiles teacher.
7. Router `addStudentsBulk` vers l'API bulk.

### Sprint 3 — NICE-TO-HAVE
8. Achat étoiles Stripe.
9. select-profile API.
10. Support élève sur book/add.

---

## Code à produire immédiatement (BLOQUANT)

### 1. SQL — `create_classroom` (à exécuter dans Supabase SQL Editor)
```sql
CREATE OR REPLACE FUNCTION public.create_classroom(
  p_name text,
  p_academic_year text DEFAULT '2025-2026'
)
RETURNS public.classrooms
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_account_id uuid;
  v_class_code text;
  v_row public.classrooms;
BEGIN
  -- account du user connecté
  SELECT id INTO v_account_id
  FROM public.accounts
  WHERE user_id = auth.uid();

  IF v_account_id IS NULL THEN
    RAISE EXCEPTION 'Compte introuvable pour l''utilisateur courant.';
  END IF;

  -- code de classe unique (réutilise le générateur existant)
  v_class_code := public.generate_class_code();

  INSERT INTO public.classrooms (account_id, name, class_code, academic_year)
  VALUES (v_account_id, p_name, v_class_code, p_academic_year)
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;
```

### 2. `src/stores/school-store.ts` — remplacer `createClass` (appel RPC → API existante)
```typescript
async createClass(name, academicYear) {
  try {
    set({ loading: true, error: null });
    const res = await fetch('/api/school/classroom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, academic_year: academicYear }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || 'Erreur création classe');
    await get().fetchClasses();
    toast({ title: 'Classe créée', description: `${name} a été ajoutée.` });
  } catch (e: any) {
    set({ error: e.message || 'Erreur création', loading: false });
    toast({ title: 'Erreur', description: e.message });
  } finally {
    set({ loading: false });
  }
},
```

### 3. `src/app/api/school/students/[id]/activity/route.ts` — corriger l'IDOR (scope account)
```typescript
// Après récupération de student, ajouter la vérification de propriété :
const { data: ownerClass, error: ownErr } = await supabase
  .from("classrooms")
  .select("account_id")
  .eq("id", student.classroom_id)
  .eq("account_id", account.id)
  .single();

if (ownErr || !ownerClass) {
  return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });
}
```

### 4. `src/app/api/magic-drawing/download/route.ts` — sécuriser (auth + allowlist)
```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const imageUrl = req.nextUrl.searchParams.get("imageUrl");
  const allowed = /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\//.test(imageUrl || "");
  if (!imageUrl || !allowed) {
    return NextResponse.json({ error: "URL non autorisée." }, { status: 400 });
  }

  try {
    const upstream = await fetch(imageUrl);
    if (!upstream.ok) return new NextResponse("Erreur", { status: 502 });
    const buf = await upstream.arrayBuffer();
    const filename = (req.nextUrl.searchParams.get("filename") || "image")
      .replace(/[^a-zA-Z0-9_-]/g, "");
    return new NextResponse(buf, {
      headers: {
        "Content-Type": upstream.headers.get("Content-Type") || "image/png",
        "Content-Disposition": `attachment; filename="${filename}.png"`,
      },
    });
  } catch {
    return new NextResponse("Erreur", { status: 502 });
  }
}
```

> Audit terminé — aucune modification n'a été apportée au code (analyse seule, conformément à la consigne).
