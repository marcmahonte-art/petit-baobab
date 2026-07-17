# Plan d'implémentation — Système de login multi-rôles
## Petit Baobab · Parent · Enseignant · Élève

> **Objectif** : Un seul formulaire `/login` existant pour les adultes, une page séparée `/school` pour les élèves. Après connexion, redirection automatique selon le rôle détecté via `accounts.plan`.
>
> **Principe** : Ne rien casser dans le login existant. Ajouter uniquement la logique de redirection et les nouvelles pages.
>
> **Durée estimée** : 3 à 4 jours

---

## Résumé des 4 flux

| Utilisateur | URL de connexion | Identifiants | Redirection finale |
|---|---|---|---|
| Parent simple | `/login` (existant) | email + mdp | `/dashboard` |
| Enseignant pur | `/login` (existant) | email + mdp | `/school/dashboard` |
| Parent + école | `/login` (existant) | email + mdp | `/select-space` |
| Élève | `/school` (nouveau) | code classe + prénom | `/dashboard` vue enfant |

---

## Fichiers à créer ou modifier

```
CRÉER :
  src/app/school/page.tsx
  src/app/select-space/page.tsx
  src/app/api/auth/student-login/route.ts
  src/lib/auth/student-session.ts
  supabase/03_role_columns.sql

MODIFIER :
  src/app/api/auth/callback/route.ts   ← ajouter logique redirection
  src/middleware.ts                     ← ajouter protection /school/dashboard
  src/app/login/page.tsx               ← ajouter lien vers /school
```

---

## Phase 1 — Base de données

**Fichier** : `supabase/03_role_columns.sql`
**Durée** : 30 min

---

### Prompt 1.1 — Colonnes de rôle sur accounts

```
Tu travailles sur Petit Baobab (Next.js 15, Supabase PostgreSQL).

La table accounts existante contient :
  id, user_id, stars_balance, plan, plan_renewed_at, created_at

Le champ plan peut valoir : 'free' | 'decouverte' | 'super_baobab' | 'ecole_pro'

Crée le fichier supabase/03_role_columns.sql avec :

1. ALTER TABLE accounts :
   ADD COLUMN has_family_sub boolean DEFAULT false
   ADD COLUMN has_school_sub boolean DEFAULT false

   has_family_sub = true si l'utilisateur a un abonnement famille
     (plan free, decouverte, super_baobab OU ecole_pro avec espace famille actif)
   has_school_sub = true si l'utilisateur gère une école (plan ecole_pro)

2. UPDATE pour initialiser les comptes existants :
   - has_family_sub = true WHERE plan IN ('free','decouverte','super_baobab')
   - has_school_sub = true WHERE plan = 'ecole_pro'
   - Pour les comptes ecole_pro qui ont AUSSI un abonnement famille :
     has_family_sub = true (ils auront les deux à true)

3. Trigger on_plan_changed() :
   S'exécute AFTER UPDATE OF plan ON accounts.
   Met à jour automatiquement has_family_sub et has_school_sub
   selon la nouvelle valeur de plan.
   Cas has_family_sub = true : plan IN ('free','decouverte','super_baobab')
     OU (plan = 'ecole_pro' AND has_family_sub = true déjà)
   Cas has_school_sub = true : plan = 'ecole_pro'

4. Index : CREATE INDEX ON accounts(plan) si pas déjà existant.

Le SQL doit être idempotent (IF NOT EXISTS sur les colonnes).
```

---

### Prompt 1.2 — Types TypeScript

```
Dans Petit Baobab (Next.js 15, TypeScript), mets à jour les types
existants pour refléter les nouveaux champs.

Trouve le fichier de types qui définit Account (probablement dans
src/types/ ou src/lib/supabase/types.ts) et ajoute :

Sur le type Account :
  has_family_sub: boolean
  has_school_sub: boolean

Crée aussi src/types/auth.ts avec :

type UserRole = 'parent' | 'teacher' | 'student'

type SessionType =
  | { type: 'parent';  profileId: string; accountId: string }
  | { type: 'teacher'; profileId: string; accountId: string }
  | { type: 'student'; profileId: string; studentId: string;
      classroomId: string; name: string; mascot: string }
  | null

type StudentLoginInput = {
  class_code  : string
  first_name  : string
  student_id? : string   // si sélection parmi homonymes
}

type StudentLoginResponse = {
  profile_id    : string
  student_id    : string
  classroom_id  : string
  name          : string
  mascot        : string
  classroom_name: string
  stars_balance : number
}

type MultipleStudentsResponse = {
  multiple: true
  students : { id: string; display_name: string; mascot: string }[]
}

Exporte tous les types depuis src/types/auth.ts.
```

---

## Phase 2 — Session élève (JWT custom)

**Fichier** : `src/lib/auth/student-session.ts`
**Durée** : 1h

---

### Prompt 2.1 — Utilitaires JWT élève

```
Dans Petit Baobab (Next.js 15, TypeScript), crée
src/lib/auth/student-session.ts.

Ce fichier gère les JWT pour les élèves qui se connectent
sans email ni Supabase Auth.

Utiliser la lib jose (déjà disponible dans Next.js 15).
Clé secrète : variable d'environnement STUDENT_JWT_SECRET.

Exporter ces 3 fonctions :

1. signStudentToken(payload: StudentLoginResponse): Promise<string>
   - Crée un JWT signé HS256
   - Payload : { ...StudentLoginResponse, type: 'student' }
   - Expiration : 7 jours
   - Issuer : 'petit-baobab-school'

2. verifyStudentToken(token: string): Promise<StudentLoginResponse | null>
   - Vérifie la signature et l'expiration
   - Retourne le payload si valide, null sinon
   - Ne jamais throw — toujours retourner null en cas d'erreur

3. getStudentSession(cookieStore: ReadonlyRequestCookies):
     Promise<StudentLoginResponse | null>
   - Lit le cookie 'sb-student-token'
   - Appelle verifyStudentToken
   - Retourne null si cookie absent ou invalide

Ajouter aussi une constante exportée :
  STUDENT_COOKIE_NAME = 'sb-student-token'
  STUDENT_COOKIE_OPTIONS = {
    httpOnly  : true,
    sameSite  : 'strict' as const,
    secure    : process.env.NODE_ENV === 'production',
    maxAge    : 60 * 60 * 24 * 7,   // 7 jours
    path      : '/',
  }
```

---

## Phase 3 — Route API connexion élève

**Fichier** : `src/app/api/auth/student-login/route.ts`
**Durée** : 2h

---

### Prompt 3.1 — Route POST /api/auth/student-login

```
Dans Petit Baobab (Next.js 15 App Router, TypeScript, Supabase),
crée src/app/api/auth/student-login/route.ts.

Contexte :
- Tables disponibles : classrooms, school_students, child_profiles,
  accounts, student_activities
- Utilitaires auth : src/lib/auth/student-session.ts (déjà créé)
- Client Supabase serveur : src/lib/supabase/server.ts

Logique complète de la route POST :

ÉTAPE 1 — Validation du body
  Body attendu : StudentLoginInput { class_code, first_name, student_id? }
  Rejeter si class_code vide ou first_name < 2 caractères ou > 50 caractères
  Sanitize : class_code.toUpperCase().trim() · first_name.trim()

ÉTAPE 2 — Chercher la classe
  SELECT id, name, account_id FROM classrooms
  WHERE class_code = $1 AND archived_at IS NULL
  Si non trouvé → 404 { error: "Code de classe invalide" }

ÉTAPE 3 — Chercher l'élève
  Si student_id fourni (cas sélection homonyme) :
    SELECT * FROM school_students WHERE id = $student_id
    AND classroom_id = $classroom_id AND deleted_at IS NULL
  Sinon :
    SELECT * FROM school_students
    WHERE classroom_id = $classroom_id
    AND lower(first_name) = lower($first_name)
    AND deleted_at IS NULL

  Si 0 résultat → 404 { error: "Prénom introuvable dans cette classe" }

  Si 2+ résultats (homonymes) :
    → 200 { multiple: true, students: [{ id, display_name, mascot }] }
    L'UI affichera des avatars pour choisir, puis renverra
    une 2ème requête avec student_id.

ÉTAPE 4 — Récupérer le profil enfant lié
  SELECT id FROM child_profiles
  WHERE student_id = $student_id
  Si non trouvé → 500 { error: "Profil non trouvé, contacter l'enseignant" }

ÉTAPE 5 — Récupérer le solde d'étoiles (pool école)
  SELECT stars_balance FROM accounts WHERE id = $classroom.account_id

ÉTAPE 6 — Créer la session
  const payload: StudentLoginResponse = {
    profile_id    : child_profile.id,
    student_id    : student.id,
    classroom_id  : classroom.id,
    name          : student.display_name || student.first_name,
    mascot        : student.mascot,
    classroom_name: classroom.name,
    stars_balance  : account.stars_balance,
  }
  const token = await signStudentToken(payload)

ÉTAPE 7 — Poser le cookie
  Utiliser STUDENT_COOKIE_NAME et STUDENT_COOKIE_OPTIONS depuis
  src/lib/auth/student-session.ts
  cookies().set(STUDENT_COOKIE_NAME, token, STUDENT_COOKIE_OPTIONS)

ÉTAPE 8 — Logger l'activité
  INSERT INTO student_activities :
  { profile_id, action: 'login', stars_used: 0, points_earned: 0,
    metadata: { classroom_id, classroom_name } }

ÉTAPE 9 — Retourner la réponse
  return NextResponse.json({ success: true, ...payload })

Gestion d'erreurs :
  - Toujours un message lisible par un parent (pas de stack trace)
  - Log les erreurs serveur dans console.error
  - Ne jamais exposer les détails internes dans la réponse
```

---

## Phase 4 — Modifier le callback login existant

**Fichier** : `src/app/api/auth/callback/route.ts`
**Durée** : 45 min

---

### Prompt 4.1 — Ajouter la logique de redirection par rôle

```
Dans Petit Baobab, modifie src/app/api/auth/callback/route.ts.

IMPORTANT : ne pas modifier la logique d'authentification Supabase
existante. Ajouter uniquement la logique de redirection APRÈS que
Supabase Auth a validé la session.

Trouve l'endroit où le callback Supabase échange le code contre
une session (supabase.auth.exchangeCodeForSession ou équivalent).

Après cet échange réussi, AJOUTER ce bloc :

  // Lire le rôle depuis la DB
  const { data: account } = await supabase
    .from('accounts')
    .select('plan, has_family_sub, has_school_sub')
    .eq('user_id', session.user.id)
    .single()

  // Déterminer la redirection
  let redirectTo = '/dashboard'   // défaut : parent simple

  if (account) {
    const isSchool  = account.has_school_sub === true
    const isFamily  = account.has_family_sub === true

    if (isSchool && isFamily) {
      redirectTo = '/select-space'       // les deux → écran de choix
    } else if (isSchool) {
      redirectTo = '/school/dashboard'   // enseignant pur
    }
    // sinon → /dashboard (parent simple, déjà le défaut)
  }

  return NextResponse.redirect(new URL(redirectTo, requestUrl.origin))

Si le fichier callback utilise déjà une variable redirectTo ou next,
adapter sans la supprimer — ajouter la logique de rôle avant la
redirection finale.

Ne pas toucher à la gestion des erreurs OAuth existante.
```

---

## Phase 5 — Middleware

**Fichier** : `src/middleware.ts`
**Durée** : 1h

---

### Prompt 5.1 — Étendre le middleware existant

```
Dans Petit Baobab, modifie src/middleware.ts.

Le middleware existant gère l'auth Supabase pour les routes protégées.
Ne pas modifier cette logique.

AJOUTER ces deux blocs AVANT la logique Supabase existante :

BLOC 1 — Protéger /school/dashboard (adultes uniquement)
  Si le pathname commence par '/school/dashboard' :
    Vérifier uniquement le cookie 'sb-access-token' (Supabase Auth)
    Si absent ou invalide → redirect vers '/login'
    Ne jamais autoriser sb-student-token sur cette route

BLOC 2 — Autoriser les élèves sur les routes enfant
  Si le pathname correspond à :
    '/dashboard' | '/coloriage' | '/magic-drawing' | '/livres-de-coloriage'
    | '/mes-livres' | '/parametres'
  ET que sb-access-token est absent :
    Vérifier sb-student-token via getStudentSession()
    Si valide → laisser passer + injecter dans les headers :
      request.headers.set('x-session-type', 'student')
      request.headers.set('x-profile-id', session.profile_id)
      request.headers.set('x-classroom-id', session.classroom_id)
    Si invalide → redirect vers '/school'

BLOC 3 — Routes publiques (ne pas toucher)
  '/school' exact et '/login' et '/signup' restent toujours publics

Importer getStudentSession depuis src/lib/auth/student-session.ts.

La priorité est :
  1. /school/dashboard → sb-access-token obligatoire
  2. /school (exact) → toujours public
  3. Routes enfant → sb-access-token OU sb-student-token
  4. Reste → logique Supabase existante inchangée
```

---

## Phase 6 — Pages UI

**Durée** : 1 jour

---

### Prompt 6.1 — Page /school (login élève)

```
Dans Petit Baobab (Next.js 15, TypeScript, Tailwind CSS v4,
Framer Motion 12, Lucide), crée src/app/school/page.tsx.

Design system du projet :
  Fond         : #FFF9F2  (crème chaud)
  Violet       : #7D6AF8  (couleur primaire du projet)
  Vert école   : #1D9E75  (couleur de l'espace école)
  Police       : Nunito Sans
  Radius       : pill pour les CTA, 20px pour les cards
  Le projet a déjà des composants Shadcn installés

Cette page est publique, sans auth requise.

STRUCTURE DE LA PAGE :

1. Header minimal :
   - Logo Petit Baobab à gauche
   - Lien discret "Espace adulte →" à droite → /login

2. Zone centrale (card principale, max-w-md, centrée) :
   - Grande illustration mascotte Awa qui fait coucou
     (utiliser /images/awa-wave.png ou équivalent selon les assets)
   - Titre : "Rejoins ta classe !"
   - Sous-titre : "Ton maître t'a donné un code ? C'est parti !"

3. Formulaire (pas de balise form, utiliser des divs + onClick) :
   Champ 1 — Code de classe :
     - Label : "Code de ta classe"
     - Input : type="text", inputMode="text",
       autoCapitalize="characters", autoComplete="off"
     - Transformation : convertir en majuscules à chaque frappe
     - Placeholder : "Ex : BAOBAB-CE1A"
     - Style : border vert (#1D9E75) quand rempli

   Champ 2 — Prénom :
     - Label : "Ton prénom"
     - Input : type="text", autoComplete="given-name"
     - Placeholder : "Awa, Kofi, Aminata..."

   Bouton : "C'est parti !" (vert, grand, pill, pleine largeur)
   Loading state : spinner + "On te cherche..." + disabled

4. ÉTAT : Homonymes (si multiple: true dans la réponse) :
   Remplacer le formulaire par :
   - Titre : "Qui es-tu ?"
   - Grille de cards (max 2 par ligne) pour chaque élève :
     - Grande mascotte (emoji 48px)
     - display_name en dessous
     - Card clickable avec border vert au survol
   - Sélectionner → relancer POST avec student_id

5. ÉTAT : Erreur :
   - Message d'erreur doux sous le champ concerné
   - Icône warning (Lucide AlertCircle)
   - Jamais de jargon technique

6. ÉTAT : Succès :
   - Confetti léger (canvas-confetti, déjà dans le projet)
   - Message "Bonjour [prénom] !" pendant 1s
   - Redirect automatique vers /dashboard

ANIMATIONS (Framer Motion) :
  - La card entre avec slideUp + fadeIn au montage
  - Les champs apparaissent en stagger (délai 100ms entre chaque)
  - Le bouton a un scale(0.97) au clic

LOGIQUE APRÈS CONNEXION RÉUSSIE :
  Stocker dans le store Zustand existant :
    { name, mascot, profileId, classroomId, type: 'student' }
  Utiliser le store auth ou profile déjà présent dans le projet.

APPEL API :
  POST /api/auth/student-login
  Body : { class_code, first_name }
  Si multiple → réafficher la sélection
  Si succès → confetti + redirect /dashboard
```

---

### Prompt 6.2 — Page /select-space (sélecteur de mode)

```
Dans Petit Baobab, crée src/app/select-space/page.tsx.

Cette page s'affiche uniquement pour les utilisateurs qui ont
à la fois has_family_sub = true ET has_school_sub = true.

Protéger la route : si pas de session Supabase Auth valide
→ redirect /login.
Si session valide mais pas les deux flags → redirect selon plan.

CONTENU DE LA PAGE :

1. Header :
   - Logo + nom de l'utilisateur connecté (depuis session Supabase)
   - Bouton "Se déconnecter"

2. Titre centré :
   "Où voulez-vous aller aujourd'hui ?"
   Sous-titre : "Votre compte a accès aux deux espaces."

3. Deux cards (côte à côte desktop, empilées mobile) :

   Card gauche — Espace famille :
     Couleur : bleu (#1194FF / E6F1FB)
     Icône : Users (Lucide)
     Titre : "Espace famille"
     Description : "Dessins et livres de votre enfant à la maison.
                    Accédez à vos abonnements personnels."
     Bouton : "Accéder →" → /dashboard

   Card droite — Espace école :
     Couleur : vert (#1D9E75 / E1F5EE)
     Icône : School (Lucide)
     Titre : "Espace école"
     Description : "Gérez vos classes, suivez vos élèves.
                    Tableau de bord enseignant."
     Bouton : "Accéder →" → /school/dashboard

4. Checkbox en bas :
   "Se souvenir de mon choix par défaut"
   Si cochée → sauvegarder le choix dans localStorage 'pb-default-space'
   Au prochain login → skip cette page et aller directement

ANIMATIONS Framer Motion :
  Les deux cards entrent avec un stagger (100ms de décalage).
  La card survolée se lève légèrement (translateY -4px).

Cette page doit être responsive : 2 colonnes sur desktop,
1 colonne sur mobile avec la card famille en premier.
```

---

### Prompt 6.3 — Modifier la page /login existante

```
Dans Petit Baobab, modifie src/app/login/page.tsx (ou le
composant LoginForm selon la structure du projet).

NE PAS modifier la logique d'authentification existante.
NE PAS modifier le design du formulaire.

AJOUTER UNIQUEMENT deux éléments :

1. Un lien vers l'espace élève, placé SOUS le bouton de connexion
   principal et AVANT le lien "Pas de compte ?", avec ce texte :

   ─────────────────────── ou ───────────────────────

   [Bouton secondaire, outline, pleine largeur]
   "Connexion élève (code de classe) →"
   → href="/school"

   Style : bouton outline (fond transparent, bordure, couleur texte
   secondaire). Pas de couleur forte — c'est un cas secondaire.

2. Un texte d'aide au-dessus du lien :
   Taille 12px, couleur muted, centré :
   "Vous êtes un élève ? Utilisez votre code de classe."

Ces deux éléments doivent respecter le design system existant.
Si le projet utilise des composants Shadcn Button,
utiliser variant="outline" pour le bouton élève.
```

---

## Phase 7 — Gestion du header selon le rôle

**Durée** : 2h

---

### Prompt 7.1 — Hook useSessionType

```
Dans Petit Baobab, crée src/lib/hooks/useSessionType.ts.

Ce hook côté client détecte le type de session de l'utilisateur
actuel pour adapter l'UI (header, navigation, etc.).

Il ne doit PAS lire les cookies httpOnly (inaccessibles en JS).
À la place, il lit un cookie public 'pb-session-type' qui sera
posé par le middleware (voir ci-dessous).

export function useSessionType() {
  Retourner un objet avec :
  {
    type        : 'parent' | 'teacher' | 'student' | 'unknown'
    name        : string | null   // prénom affiché dans le header
    classroomName: string | null  // "CE1 A" pour les élèves
    isStudent   : boolean
    isTeacher   : boolean
    isParent    : boolean
  }

  Pour les élèves : lire depuis le store Zustand (les données
  sont stockées au moment de la connexion dans /school/page.tsx)
  Pour les adultes : lire depuis la session Supabase (hook
  useUser() ou équivalent déjà présent dans le projet)
}

Créer aussi la fonction serveur getSessionTypeFromHeaders(headers)
dans src/lib/auth/session-type.ts :
  Lit x-session-type depuis les headers de la request
  Retourne 'parent' | 'teacher' | 'student' | null
  Utilisé dans les Server Components pour adapter le rendu
```

---

### Prompt 7.2 — Adapter le Header existant

```
Dans Petit Baobab, modifie le composant Header (trouver le
fichier exact selon la structure du projet, probablement
src/components/Header.tsx ou src/components/layout/Header.tsx).

Utiliser useSessionType() pour adapter l'affichage.

CHANGEMENTS SELON LE TYPE :

Si type === 'student' :
  - Remplacer l'avatar/nom par :
    [avatar mascotte 28px] + "[prénom] · [nom de la classe]"
  - Afficher le solde d'étoiles (depuis le store Zustand)
    avec icône étoile et nombre : "★ 47"
  - Masquer : barre de recherche, bouton notifications,
    menu profil, bouton langue
  - Afficher : bouton "Déconnexion" (icon LogOut, Lucide)
    qui appelle POST /api/auth/logout et redirect /school

Si type === 'teacher' :
  - Garder le header normal
  - Remplacer le badge plan par "École / Pro" en vert
  - Ajouter en dessous du nom : nom de l'école (depuis accounts)

Si type === 'parent' :
  - Header inchangé (comportement actuel)

La détection doit être instantanée (lecture synchrone du store
Zustand) pour éviter un flash de mauvais contenu.
```

---

## Phase 8 — Variables d'environnement et déploiement

**Durée** : 30 min

---

### Prompt 8.1 — Configuration environnement

```
Dans Petit Baobab, mets à jour la configuration des variables
d'environnement pour le système de login multi-rôles.

1. Ajouter dans .env.local :
   STUDENT_JWT_SECRET=<générer avec: openssl rand -base64 32>

2. Ajouter dans .env.local.example :
   # Secret pour les JWT élèves (connexion par code de classe)
   # Générer avec: openssl rand -base64 32
   STUDENT_JWT_SECRET=your_student_jwt_secret_here

3. Vérifier que ces variables existantes sont présentes :
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY

4. Si le projet utilise vercel.json, ajouter STUDENT_JWT_SECRET
   dans la section env. Sinon, noter de l'ajouter manuellement
   dans le dashboard Vercel sous Settings > Environment Variables,
   pour les environnements Production ET Preview.

5. Mettre à jour le README.md du projet, section "Variables
   d'environnement", avec STUDENT_JWT_SECRET et son usage.
```

---

## Phase 9 — Tests

**Durée** : 1 jour

---

### Prompt 9.1 — Tests des 4 flux de connexion

```
Dans Petit Baobab, crée les tests pour le système de login
multi-rôles dans src/__tests__/auth/.

Utiliser le framework de test existant (Jest ou Vitest).

Tester ces scénarios, fichier par fichier :

student-login.test.ts :
  ✓ Connexion réussie : code valide + prénom connu → cookie posé + 200
  ✓ Code de classe invalide → 404 avec message lisible
  ✓ Prénom introuvable dans la classe → 404
  ✓ Homonymes (2+ élèves même prénom) → 200 { multiple: true, students }
  ✓ Sélection homonyme avec student_id → connexion directe
  ✓ Prénom trop court (< 2 chars) → 400 validation
  ✓ Classe archivée → 404
  ✓ Élève supprimé (deleted_at non null) → 404
  ✓ Cookie sb-student-token : httpOnly, secure en prod, maxAge 7j
  ✓ JWT payload contient : profile_id, student_id, classroom_id,
    name, mascot, type:'student'
  ✓ student_activities : une ligne 'login' créée après connexion

auth-callback.test.ts :
  ✓ Parent simple (plan: 'free') → redirect /dashboard
  ✓ Parent decouverte → redirect /dashboard
  ✓ Parent super_baobab → redirect /dashboard
  ✓ Enseignant pur (ecole_pro, has_family_sub: false) → /school/dashboard
  ✓ Parent d'élève (ecole_pro, has_family_sub: true) → /select-space
  ✓ Erreur Supabase sur lecture plan → /dashboard par défaut (safe)

middleware.test.ts :
  ✓ /school/dashboard sans sb-access-token → redirect /login
  ✓ /school/dashboard avec sb-student-token → redirect /login
  ✓ /dashboard avec sb-student-token valide → 200 + headers injectés
  ✓ /dashboard sans aucun token → redirect /login
  ✓ /school (exact) → toujours 200 (public)
  ✓ /login → toujours 200 (public)

student-session.test.ts :
  ✓ signStudentToken → JWT valide décodable
  ✓ verifyStudentToken token valide → payload
  ✓ verifyStudentToken token expiré → null (pas de throw)
  ✓ verifyStudentToken token falsifié → null
  ✓ getStudentSession cookie absent → null

Mocker les appels Supabase.
Ne pas faire d'appels réseau réels dans les tests.
```

---

## Ordre d'exécution recommandé

```
Jour 1 matin  : Phase 1 (SQL + types)
Jour 1 après  : Phase 2 (JWT utilitaires)
Jour 2 matin  : Phase 3 (route student-login)
Jour 2 après  : Phase 4 (callback) + Phase 5 (middleware)
Jour 3 matin  : Phase 6 (pages UI : /school + /select-space + /login)
Jour 3 après  : Phase 7 (header) + Phase 8 (env)
Jour 4        : Phase 9 (tests) + déploiement staging
```

---

## Règles à respecter dans tous les prompts

```
CONTRAINTES GÉNÉRALES :

1. Ne jamais modifier la logique Supabase Auth existante.
   Ajouter uniquement, ne pas remplacer.

2. Cookie élève 'sb-student-token' :
   - httpOnly obligatoire
   - Jamais accessible depuis le JavaScript navigateur
   - Durée : 7 jours
   - Signé avec STUDENT_JWT_SECRET (pas la clé Supabase)

3. /school/dashboard :
   - Accessible uniquement avec sb-access-token (adulte)
   - Un élève avec sb-student-token ne peut JAMAIS y accéder
   - Le middleware bloque avant même que la page soit rendue

4. Messages d'erreur côté élève :
   - Toujours simples, positifs, sans jargon technique
   - "Code de classe invalide" et pas "404 Not Found"
   - "Prénom introuvable" et pas "No record found"

5. Design system :
   - Espace élève : couleur verte #1D9E75 (distinguer de l'espace adulte)
   - Espace adulte / enseignant : violet #7D6AF8 (couleur primaire existante)
   - Police : Nunito Sans partout
   - Fond : #FFF9F2 (crème chaud)

6. Responsive :
   - La page /school doit fonctionner sur tablette (taille tablette
     scolaire ~768px) avec des champs et boutons suffisamment grands
     pour des enfants (min 44px de hauteur pour les touch targets)

7. Pas de formulaire HTML <form> dans les composants React.
   Utiliser des divs + onClick. (contrainte existante du projet)
```

---

*Document généré pour Petit Baobab — Système login multi-rôles*
*Version 1.0 — Juillet 2025*
