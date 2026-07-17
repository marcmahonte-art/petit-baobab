# Plan d'implémentation — Module École / Enseignant
## Petit Baobab · Flux B · Code de classe

> **Stack** : Next.js 15 App Router · TypeScript · Tailwind CSS v4 · Supabase · Zustand · Framer Motion · Lucide  
> **Durée estimée V1** : 5 à 6 semaines  
> **Objectif** : Permettre à un enseignant de créer sa classe, ajouter ses élèves, leur donner un code d'accès, et suivre leur activité individuelle depuis un tableau de bord dédié.

---

## Table des matières

1. [Phase 1 — Base de données](#phase-1)
2. [Phase 2 — Authentification élève](#phase-2)
3. [Phase 3 — Routes API](#phase-3)
4. [Phase 4 — Pages et composants](#phase-4)
5. [Phase 5 — Navigation et layout](#phase-5)
6. [Phase 6 — Intégration étoiles](#phase-6)
7. [Phase 7 — Tests et déploiement](#phase-7)
8. [Règles métier de référence](#regles)

---

## Phase 1 — Base de données (Supabase) {#phase-1}

**Durée estimée** : 2 à 3 jours  
**Fichier cible** : `supabase/02_school_tables.sql`

---

### Prompt 1.1 — Création des tables école

```
Tu travailles sur Petit Baobab, une application Next.js 15 avec Supabase PostgreSQL.

Le schéma existant contient déjà ces tables (ne pas modifier) :
- profiles (id, user_id, email)
- accounts (id, user_id, stars_balance, plan, plan_renewed_at)
- child_profiles (id, account_id, name, mascot, pin_required)
- saved_drawings (id, profile_id, image_url, origin, style, status, created_at)
- books (id, profile_id, title, status, pdf_url, created_at)
- stars_transactions (id, account_id, amount, reason, reference_id, created_at)

Crée le fichier supabase/02_school_tables.sql avec :

1. Table classrooms :
   - id uuid PK default gen_random_uuid()
   - account_id uuid FK → accounts(id) ON DELETE CASCADE
   - name text NOT NULL (ex: "CE1 A")
   - class_code text UNIQUE NOT NULL (ex: "BAOBAB-CE1A")
   - academic_year text DEFAULT '2025-2026'
   - created_at timestamp DEFAULT now()

2. Table school_students :
   - id uuid PK default gen_random_uuid()
   - classroom_id uuid FK → classrooms(id) ON DELETE CASCADE
   - first_name text NOT NULL
   - last_name text
   - display_name text (prénom affiché dans l'app)
   - mascot text DEFAULT 'awa' (valeurs : 'awa' | 'lion' | 'robot')
   - pin text (optionnel, hashé)
   - created_at timestamp DEFAULT now()

3. Table student_activities :
   - id uuid PK default gen_random_uuid()
   - profile_id uuid FK → child_profiles(id) ON DELETE CASCADE
   - action text NOT NULL (valeurs : 'drawing_created' | 'book_created' | 'badge_earned' | 'login')
   - stars_used integer DEFAULT 0
   - points_earned integer DEFAULT 0
   - metadata jsonb DEFAULT '{}'
   - created_at timestamp DEFAULT now()

4. Ajouter sur child_profiles (ALTER TABLE) :
   - student_id uuid REFERENCES school_students(id) ON DELETE SET NULL
   - classroom_id uuid REFERENCES classrooms(id) ON DELETE SET NULL

5. Activer RLS sur les 3 nouvelles tables avec ces politiques :
   - classrooms : SELECT/INSERT/UPDATE/DELETE si account_id = (SELECT id FROM accounts WHERE user_id = auth.uid())
   - school_students : SELECT/INSERT/UPDATE/DELETE si classroom_id IN (SELECT id FROM classrooms WHERE account_id = (SELECT id FROM accounts WHERE user_id = auth.uid()))
   - student_activities : SELECT si profile_id IN (SELECT id FROM child_profiles WHERE account_id = (SELECT id FROM accounts WHERE user_id = auth.uid()))

6. Fonction generate_class_code() qui génère un code unique format "BAOBAB-XXXXX" (5 lettres majuscules aléatoires) et vérifie l'unicité dans classrooms.class_code.

7. Trigger : avant INSERT sur classrooms, appeler generate_class_code() si class_code est NULL.

Génère le SQL complet prêt à exécuter avec supabase db push.
```

---

### Prompt 1.2 — Types TypeScript

```
Dans le projet Petit Baobab (Next.js 15, TypeScript), crée le fichier src/types/school.ts.

Basé sur ce schéma Supabase :
- classrooms (id, account_id, name, class_code, academic_year, created_at)
- school_students (id, classroom_id, first_name, last_name, display_name, mascot, pin, created_at)
- student_activities (id, profile_id, action, stars_used, points_earned, metadata, created_at)
- child_profiles a maintenant student_id et classroom_id

Crée :

1. Les types de base :
   - Classroom
   - SchoolStudent
   - StudentActivity avec type StudentActivityAction = 'drawing_created' | 'book_created' | 'badge_earned' | 'login'

2. Les types enrichis pour l'UI (avec jointures) :
   - ClassroomWithStats : Classroom + { student_count: number, active_today: number, total_drawings: number, total_books: number }
   - StudentWithProfile : SchoolStudent + { profile_id: string, points: number, badges: string[], drawings_count: number, books_count: number, last_active: string | null }
   - StudentActivityFeed : StudentActivity + { student_name: string, classroom_name: string }

3. Les types de requête API :
   - CreateClassroomInput : { name: string, academic_year?: string }
   - CreateStudentInput : { first_name: string, last_name?: string, display_name?: string, mascot?: string }
   - CreateStudentsBulkInput : { classroom_id: string, students: CreateStudentInput[] }
   - StudentLoginInput : { class_code: string, first_name: string }
   - StudentLoginResponse : { profile_id: string, student_id: string, name: string, mascot: string, classroom_name: string, stars_balance: number }

Exporte tous les types. Utilise des interfaces pour les objets, des types pour les unions.
```

---

## Phase 2 — Authentification élève {#phase-2}

**Durée estimée** : 2 jours  
**Fichiers cibles** : `src/app/api/auth/student-login/route.ts`, `src/middleware.ts`, `src/lib/auth/student-session.ts`

---

### Prompt 2.1 — Route de connexion élève

```
Dans Petit Baobab (Next.js 15 App Router, TypeScript, Supabase), crée la route API POST /api/auth/student-login.

Contexte auth existant :
- L'auth parent utilise Supabase Auth avec cookies HTTP-only : 'sb-access-token' et 'sb-refresh-token'
- Le client Supabase est créé via src/lib/supabase/server.ts avec createServerClient
- Le middleware src/middleware.ts gère les redirections auth

Fonctionnement de la connexion élève (sans email, sans Supabase Auth) :
1. Recevoir { class_code: string, first_name: string }
2. Valider : class_code non vide, first_name entre 2 et 50 caractères
3. Chercher dans classrooms WHERE class_code = $1 (case-insensitive)
4. Si classe non trouvée → 404 { error: "Code de classe invalide" }
5. Chercher dans school_students WHERE classroom_id = $2 AND lower(first_name) = lower($3)
6. Si plusieurs résultats (homonymes) → retourner la liste pour que l'élève choisisse
7. Si aucun résultat → 404 { error: "Prénom introuvable dans cette classe" }
8. Récupérer le child_profile lié via student_id
9. Créer un JWT custom signé avec STUDENT_JWT_SECRET (variable env) contenant :
   { profile_id, student_id, classroom_id, name, mascot, type: 'student', iat, exp: 7 jours }
10. Poser le cookie 'sb-student-token' : httpOnly, sameSite strict, secure en prod, maxAge 7 jours
11. Insérer dans student_activities : { profile_id, action: 'login', stars_used: 0, points_earned: 0 }
12. Retourner StudentLoginResponse

Gestion des homonymes :
- Si 2+ élèves avec le même prénom dans la classe, retourner { multiple: true, students: [{ id, display_name, mascot }] }
- Le frontend affichera un choix parmi les avatars
- Une deuxième requête avec { class_code, student_id } sélectionne directement

Crée aussi src/lib/auth/student-session.ts avec :
- signStudentToken(payload) → string
- verifyStudentToken(token) → payload | null
- getStudentSession(cookies) → StudentLoginResponse | null

Utilise jose pour JWT (déjà dans les dépendances Next.js).
```

---

### Prompt 2.2 — Middleware étendu

```
Dans Petit Baobab (Next.js 15), modifie src/middleware.ts pour gérer deux types de sessions en parallèle sans casser l'auth parent existante.

Auth parent actuelle (ne pas toucher) :
- Cookie 'sb-access-token' → session Supabase Auth standard
- Redirections : /login et /signup publics, tout le reste protégé

Nouvelle logique à ajouter pour les élèves :
- Cookie 'sb-student-token' → JWT custom signé avec STUDENT_JWT_SECRET
- Si sb-student-token valide → autoriser l'accès à /dashboard, /coloriage, /magic-drawing, /livres-de-coloriage
- Si sb-student-token invalide ou expiré → rediriger vers /school
- La route /school est toujours publique (même loguée)
- Les routes /school/dashboard et /school/student/* ne sont accessibles qu'aux parents (sb-access-token)

Logique de priorité :
1. Si la route commence par /school/dashboard ou /school/student → vérifier sb-access-token uniquement
2. Si la route commence par /school (hors dashboard) → public
3. Pour les autres routes protégées → accepter sb-access-token OU sb-student-token valide
4. Injecter dans les headers de la request :
   - x-session-type: 'parent' | 'student'
   - x-profile-id: string
   - x-classroom-id: string (si student)

Crée une fonction getSessionType(request) qui retourne { type, profileId, classroomId } | null.

Ne pas utiliser de matcher complexe — garder la logique lisible dans le corps du middleware.
```

---

## Phase 3 — Routes API {#phase-3}

**Durée estimée** : 3 à 4 jours  
**Répertoire cible** : `src/app/api/school/`

---

### Prompt 3.1 — CRUD classes

```
Dans Petit Baobab (Next.js 15 App Router, TypeScript, Supabase), crée le répertoire src/app/api/school/classroom/ avec ces routes :

src/app/api/school/classroom/route.ts :
- GET : liste toutes les classes de l'enseignant connecté
  → SELECT classrooms + COUNT(school_students) + COUNT(saved_drawings via child_profiles) + nb actifs aujourd'hui
  → Retourne ClassroomWithStats[]
  → Tri par created_at DESC

- POST : créer une classe
  → Body : CreateClassroomInput { name, academic_year? }
  → Vérifier que plan === 'ecole_pro' (sinon 403)
  → Insérer dans classrooms (class_code généré par le trigger SQL)
  → Retourner la classe créée avec son class_code

src/app/api/school/classroom/[id]/route.ts :
- GET : détail d'une classe avec stats complètes
- PATCH : renommer la classe (name uniquement)
- DELETE : archiver (soft delete, ajouter colonne archived_at)

Sécurité sur toutes les routes :
- Vérifier la session parent via getSessionType() ou createServerClient
- Vérifier que la classe appartient bien à l'account de l'enseignant
- Retourner 401 si non authentifié, 403 si accès interdit, 404 si non trouvé

Utiliser le pattern de réponse existant dans le projet pour les erreurs.
```

---

### Prompt 3.2 — Gestion des élèves

```
Dans Petit Baobab, crée src/app/api/school/students/ avec :

src/app/api/school/students/route.ts :
- POST : ajouter un ou plusieurs élèves à une classe
  → Body : CreateStudentsBulkInput { classroom_id, students: CreateStudentInput[] }
  → Pour chaque élève :
    1. Insérer dans school_students
    2. Récupérer account_id depuis classrooms → accounts
    3. Créer un child_profile lié : { account_id, name: display_name, mascot, student_id: student.id, classroom_id }
  → Retourner { created: number, students: StudentWithProfile[] }
  → Limiter à 60 élèves par classe (vérifier avant insertion)

src/app/api/school/students/import/route.ts :
- POST multipart/form-data : import CSV
  → Champ 'file' : fichier CSV
  → Champ 'classroom_id' : string
  → Parser avec papaparse (déjà dans le projet)
  → Format attendu : colonnes 'prenom' obligatoire, 'nom' optionnel
  → Valider chaque ligne : prénom entre 2 et 50 caractères, pas de caractères spéciaux
  → Déduplication : ignorer les doublons exacts (même prénom + nom dans la même classe)
  → Appeler la logique de POST /students en interne
  → Retourner { imported: number, skipped: number, errors: string[] }

src/app/api/school/students/[id]/route.ts :
- GET : profil complet d'un élève avec activités
  → student + child_profile + saved_drawings (10 derniers) + books + student_activities (30 derniers) + badges depuis gamification
- PATCH : modifier display_name ou mascot
- DELETE : supprimer l'élève et son child_profile (soft delete avec deleted_at)

src/app/api/school/students/[id]/activity/route.ts :
- GET : historique d'activité paginé
  → Query params : page (défaut 1), limit (défaut 20), from (date ISO), to (date ISO)
  → Retourner { activities: StudentActivityFeed[], total: number, has_more: boolean }
  → Agréger par jour pour le graphique d'activité 7 jours
```

---

### Prompt 3.3 — Dashboard enseignant

```
Dans Petit Baobab, crée src/app/api/school/dashboard/route.ts :

GET /api/school/dashboard :
Retourner en une seule requête toutes les données du tableau de bord :

{
  stars: {
    balance: number,          // accounts.stars_balance
    monthly_limit: number,    // 1000 pour ecole_pro
    consumed_this_month: number, // SUM des stars_transactions négatives ce mois
    renewal_date: string      // accounts.plan_renewed_at + 1 mois
  },
  classrooms: ClassroomWithStats[], // toutes les classes avec stats
  recent_activity: StudentActivityFeed[], // 10 dernières actions toutes classes confondues
  summary: {
    total_students: number,
    active_today: number,
    total_drawings: number,
    total_books: number
  }
}

Optimisation : utiliser des CTEs PostgreSQL pour éviter les N+1 queries.
La requête doit s'exécuter en moins de 500ms.
Mettre en cache avec revalidate: 60 (Next.js fetch cache).
```

---

## Phase 4 — Pages et composants {#phase-4}

**Durée estimée** : 2 semaines  
**Répertoire cible** : `src/app/school/` et `src/components/school/`

---

### Prompt 4.1 — Page connexion élève /school

```
Dans Petit Baobab (Next.js 15, TypeScript, Tailwind CSS v4, Framer Motion, Lucide), crée src/app/school/page.tsx.

Design system du projet :
- Fond : #FFF9F2 (crème chaud)
- Couleur primaire : #7D6AF8 (violet)
- Police : Nunito Sans
- Radius : 20px pour les cards, pill pour les boutons principaux
- Le projet utilise des illustrations africaines et la mascotte Awa

Page de connexion élève (pas de compte, pas d'email) :
- Afficher le logo Petit Baobab en haut
- Titre : "Rejoins ta classe !" avec la mascotte Awa qui fait signe
- Un grand champ "Code de ta classe" : input uppercase automatique, placeholder "BAOBAB-CE1A", clavier alphanumérique sur mobile (inputMode="text", autoCapitalize="characters")
- Un grand champ "Ton prénom" : input, autoComplete="given-name"
- Bouton principal "Se connecter" (violet, grand, avec icône flèche)
- Lien discret en bas : "Espace enseignant →" → /login
- Animation Framer Motion : les deux champs apparaissent avec un léger slideUp

Gestion des états :
- Loading : spinner sur le bouton, champs désactivés
- Erreur : message sous le champ concerné (code invalide / prénom introuvable) avec icône warning
- Homonymes : si plusieurs élèves avec le même prénom, afficher une grille d'avatars (mascotte + display_name) pour choisir
- Succès : animation confetti légère → redirect vers /dashboard

Appel API : POST /api/auth/student-login
Stocker le profil dans le store Zustand existant après connexion.

Rendre le composant accessible : labels corrects, focus visible, rôles ARIA.
```

---

### Prompt 4.2 — Layout dashboard enseignant

```
Dans Petit Baobab, crée src/app/school/dashboard/layout.tsx et les composants de navigation associés.

Ce layout est réservé aux sessions parent (sb-access-token).
Si session élève → rediriger vers /dashboard.
Si pas de session → rediriger vers /login.

Structure du layout (desktop) :
- Sidebar fixe 240px à gauche
- Contenu principal qui prend le reste

Sidebar src/components/school/SchoolSidebar.tsx :
Navigation (avec icônes Lucide) :

Section principale :
- LayoutDashboard  "Tableau de bord"  → /school/dashboard
- School           "Mes classes"       → /school/dashboard/classes

Section Suivi :
- Star             "Étoiles"           → /school/dashboard/etoiles  [badge: solde actuel]
- BarChart         "Statistiques"      → /school/dashboard/stats     [badge: "Bientôt"]

Section Communication :
- MessageSquare    "Messages"          → /school/dashboard/messages  [badge: "V3"]

Section Établissement :
- Building2        "Mon école"         → /school/dashboard/ecole     [badge: "V3"]
- Settings         "Paramètres"        → /school/dashboard/parametres

En bas de sidebar :
- Nom de l'école (depuis accounts)
- Badge plan "École / Pro" en vert
- Solde étoiles avec mini barre de progression

Mobile :
- Sheet Shadcn (déjà dans le projet) avec hamburger en header
- Header mobile : logo + hamburger + solde étoiles

État actif : fond teal léger + bordure gauche teal + texte teal foncé (comme le design system existant du projet).

Badges "Bientôt" et "V3" : pills grises, non-cliquables, désactivent le lien.
```

---

### Prompt 4.3 — Page tableau de bord principal

```
Dans Petit Baobab, crée src/app/school/dashboard/page.tsx.

Fetcher les données depuis GET /api/school/dashboard avec React Server Component.

Layout de la page (grid) :

Ligne 1 — 4 stat cards :
- Élèves total
- Actifs aujourd'hui  
- Dessins créés ce mois
- Livres générés ce mois

Ligne 2 — Barre étoiles :
- Barre de progression large avec : solde actuel / 1000, date de renouvellement
- Si solde < 200 : warning en orange "Pensez à renouveler"

Ligne 3 — 2 colonnes :
- Colonne gauche (60%) : Mes classes — liste des ClassroomWithStats, chaque classe est une card cliquable avec : nom, nb élèves, nb actifs aujourd'hui, mini barre d'activité 7 jours, bouton "Voir la classe →"
- Colonne droite (40%) : Activité récente — feed des 10 dernières actions avec : avatar élève, action (a créé un dessin / a généré un livre / s'est connecté), timestamp relatif (il y a 5 min), étoiles consommées

Bouton flottant (bottom right) : "+ Nouvelle classe" → ouvre un Sheet/Dialog

Animations Framer Motion : staggered entrance des cards au montage.

Utiliser les composants Radix UI et Shadcn déjà présents dans le projet.
```

---

### Prompt 4.4 — Page détail d'une classe

```
Dans Petit Baobab, crée src/app/school/dashboard/classes/[id]/page.tsx.

C'est la page centrale du module. Elle affiche tout sur une classe.

Header de la page :
- Breadcrumb : Tableau de bord > Mes classes > CE1 A
- Nom de la classe (éditable inline avec double-clic)
- Code de classe affiché en badge monospace violet
- Boutons d'action : "Imprimer les codes" | "Ajouter des élèves" | "..."

Onglets (Tabs Radix UI ou Shadcn) :

Onglet "Élèves" (actif par défaut) :
- Barre de recherche + filtres (Tous / Actifs / Inactifs)
- Grille de cards élèves : avatar mascotte + nom + stats rapides (dessins, livres, points) + badge actif/inactif
- Cliquer sur un élève → ouvrir un Sheet latéral avec la fiche complète (voir Prompt 4.5)
- Bouton "Importer CSV" → Dialog avec zone de drop du fichier

Onglet "Coloriages" :
- Grille des saved_drawings de tous les élèves de la classe
- Filtre par élève (select)
- Tri : plus récent / plus ancien
- Cliquer sur un dessin → lightbox avec image + infos (élève, style, date, étoiles)

Onglets verrouillés (afficher le tab mais désactivé avec tooltip "Disponible bientôt") :
- Livres, Progression, Récompenses, Messages

État vide de la classe :
- Illustration + message "Votre classe est vide"
- Bouton "Ajouter vos premiers élèves"

Responsive : sur mobile, les onglets deviennent un select, la grille passe en liste.
```

---

### Prompt 4.5 — Fiche individuelle élève (Sheet)

```
Dans Petit Baobab, crée src/components/school/StudentDrawer.tsx.

C'est un Sheet Shadcn (panneau latéral) qui s'ouvre quand on clique sur un élève.

Props : { studentId: string, isOpen: boolean, onClose: () => void }

Fetcher les données : GET /api/school/students/[studentId]

Contenu du Sheet (scrollable) :

Section 1 — Identité :
- Avatar mascotte (grand, 64px)
- Nom complet + display_name
- Nom de la classe
- Badge "Actif" / "Inactif" (dernière connexion)
- Bouton "Modifier" (display_name, mascotte)

Section 2 — Stats rapides :
- Grid 2x2 : Dessins créés / Livres générés / Points totaux / Étoiles utilisées

Section 3 — Badges obtenus :
- Liste des badges avec icône + nom + date d'obtention
- Si aucun badge : message encourageant

Section 4 — Activité 7 derniers jours :
- Mini graphe à barres (7 colonnes = 7 jours) 
- Fait avec des div CSS (pas de lib externe), hauteur proportionnelle à l'activité du jour
- Labels : L M M J V S D

Section 5 — Derniers dessins (grille 2x3) :
- Miniatures des 6 derniers saved_drawings
- Cliquer → lightbox

Section 6 — Actions enseignant :
- "Voir tous les dessins" → filtre la classe sur cet élève
- "Réinitialiser le PIN" (si PIN activé)
- "Retirer de la classe" (confirmer avec AlertDialog)

Gérer le loading state avec skeleton (Shadcn Skeleton).
```

---

### Prompt 4.6 — Page étoiles

```
Dans Petit Baobab, crée src/app/school/dashboard/etoiles/page.tsx.

Fetcher : GET /api/stars/history (route existante) + données depuis /api/school/dashboard

Layout :

Section 1 — Solde actuel :
- Grand nombre : "720 étoiles"
- Sous-titre : "sur 1 000 ce mois · renouvellement le 15 août"
- Barre de progression large et colorée (jaune → orange selon le niveau)
- Si < 200 étoiles : alerte warning avec bouton "Voir les plans"

Section 2 — Consommation par élève (top 10) :
- Tableau : avatar + nom + classe + étoiles utilisées ce mois + barre de consommation relative
- Triable par consommation

Section 3 — Historique des transactions :
- Filtre : Tout / Ce mois / Mois dernier
- Liste paginée des stars_transactions avec : date, raison (human-readable), montant (+ ou -), élève concerné si applicable
- Raisons traduites en français : signup_bonus → "Bonus de bienvenue", generation → "Génération de dessin", refund → "Remboursement"

Section 4 — Acheter des étoiles (placeholder V2) :
- Card avec message "Bientôt disponible — paiement Orange Money, Moov Money et carte"
- Bouton désactivé "Acheter des étoiles"
```

---

### Prompt 4.7 — Page codes d'accès

```
Dans Petit Baobab, crée src/app/school/dashboard/classes/[id]/codes/page.tsx et le composant src/components/school/ClassCodeCard.tsx.

ClassCodeCard affiche le code d'une classe de façon visuelle :
- Fond violet léger (#EEEDFE)
- Code en grand (police monospace, 24px, lettres espacées, couleur #3C3489)
- Nom de la classe en dessous
- Logo Petit Baobab en filigrane discret
- Instructions courtes : "1. Va sur petitbaobab.com/school · 2. Entre ce code · 3. Écris ton prénom"

Page codes/page.tsx :
- Affiche ClassCodeCard pour chaque classe de l'enseignant
- Bouton "Imprimer tous les codes" : ouvre window.print() avec une CSS @media print qui :
  - Cache la navigation
  - Affiche les cards en grille 2x2 sur la page A4
  - Chaque card fait ~1/4 de page A4 (format à découper)
- Bouton "Générer le QR code" pour chaque classe :
  - Utiliser la lib qrcode (npm install qrcode @types/qrcode)
  - QR code encodant l'URL : https://petitbaobab.com/school?code=BAOBAB-CE1A
  - Afficher dans un Dialog avec bouton télécharger PNG
- Bouton "Copier le lien" : copie https://petitbaobab.com/school?code=BAOBAB-CE1A dans le clipboard
```

---

## Phase 5 — Navigation et layout global {#phase-5}

**Durée estimée** : 2 jours

---

### Prompt 5.1 — Adapter le Header existant

```
Dans Petit Baobab, modifie src/components/Header.tsx (ou le composant header existant).

Actuellement le header affiche : recherche + langue + notifications + avatar parent.

Ajouter la logique de session duale :
1. Lire le header x-session-type injecté par le middleware
2. Si session 'student' :
   - Remplacer l'avatar parent par : avatar mascotte + "Awa · CE1 A"
   - Afficher le solde étoiles de l'élève avec icône étoile (depuis le store Zustand)
   - Masquer la recherche globale
   - Afficher un bouton "Déconnexion" discret
3. Si session 'parent' sur les routes /school/dashboard/* :
   - Garder le header normal mais y ajouter le nom de l'école

Créer un hook useSessionType() dans src/lib/hooks/useSessionType.ts qui :
- Lit le type de session depuis un cookie côté client (non-httpOnly, juste pour l'UI)
- Expose { type: 'parent' | 'student' | null, name: string, classroomName: string }
```

---

### Prompt 5.2 — Store Zustand pour l'école

```
Dans Petit Baobab, crée src/lib/stores/school.store.ts.

Le projet utilise Zustand 5. Regarder les stores existants (ex: src/lib/stores/) pour suivre le même pattern.

Store schoolStore avec :

State :
- currentClassroom: ClassroomWithStats | null
- classrooms: ClassroomWithStats[]
- selectedStudentId: string | null
- isStudentDrawerOpen: boolean
- dashboardData: DashboardData | null
- isLoading: boolean
- error: string | null

Actions :
- setCurrentClassroom(classroom)
- setClassrooms(classrooms)
- openStudentDrawer(studentId)
- closeStudentDrawer()
- setDashboardData(data)
- refreshDashboard() → appelle GET /api/school/dashboard et met à jour le state
- reset()

Persister currentClassroom dans sessionStorage (pas localStorage) via le middleware Zustand persist, pour que l'enseignant retrouve sa dernière classe ouverte.

Exporter le store et le hook useSchoolStore.
```

---

## Phase 6 — Intégration étoiles {#phase-6}

**Durée estimée** : 1 jour  
**Fichiers cibles** : modifier les routes API existantes

---

### Prompt 6.1 — Décompte étoiles côté élève

```
Dans Petit Baobab, modifie src/app/api/magic-drawing/route.ts pour gérer les sessions élève.

La route existante gère la génération d'images IA et le décompte d'étoiles pour les parents.

Ajouter la gestion session élève :
1. Avant toute chose, vérifier le type de session via les headers (x-session-type, x-profile-id)
2. Si session 'student' :
   a. Récupérer account_id depuis child_profiles → classroom → classrooms → account_id (pool étoiles de l'école)
   b. Lire stars_balance de cet account
   c. Calculer le coût selon le style (contour_simple: 1, noir_blanc: 1, dessin_detaille: 3, version_couleur: 3)
   d. Si solde insuffisant → 402 { error: "Plus assez d'étoiles dans ta classe. Demande à ton enseignant.", stars_needed: cost, stars_balance: balance }
   e. Débiter : UPDATE accounts SET stars_balance = stars_balance - $cost
   f. Insérer dans stars_transactions : { account_id, amount: -cost, reason: 'generation', reference_id: null }
   g. Après génération réussie : insérer dans student_activities : { profile_id, action: 'drawing_created', stars_used: cost, points_earned: 10 }
   h. Si génération échoue : rembourser (UPDATE + INSERT avec reason: 'refund')
3. Si session 'parent' : comportement existant inchangé

Retourner dans la réponse :
- Le nouveau solde d'étoiles (pour mise à jour UI en temps réel)
- Le drawing_id créé (pour la transaction)
```

---

## Phase 7 — Tests et déploiement {#phase-7}

**Durée estimée** : 3 jours

---

### Prompt 7.1 — Tests des routes API

```
Dans Petit Baobab, crée des tests pour le module école dans src/__tests__/school/.

Utiliser le framework de test existant dans le projet (Jest ou Vitest, adapter selon ce qui est configuré).

Tester ces scénarios critiques :

1. student-login.test.ts :
   - Connexion réussie avec code valide + prénom connu
   - Code de classe invalide → 404
   - Prénom non trouvé dans la classe → 404
   - Homonymes → retour multiple: true avec liste
   - Cookie posé avec les bons attributs (httpOnly, secure)
   - Token JWT valide et contenu correct

2. classroom.test.ts :
   - Création de classe → class_code généré automatiquement
   - Tentative de création sans plan ecole_pro → 403
   - Tentative d'accès à une classe d'un autre compte → 403

3. students.test.ts :
   - Ajout d'un élève → child_profile créé avec student_id
   - Import CSV valide (fichier test fourni)
   - Import CSV avec doublons → doublons ignorés, rapport retourné
   - Limite 60 élèves → 422 si dépassée

4. stars.test.ts :
   - Génération dessin élève : étoiles débitées du pool école (pas du profil élève)
   - Génération échouée → remboursement automatique
   - Solde insuffisant → 402 avec message adapté enfant

Mocker les appels Supabase avec des données de test cohérentes.
```

---

### Prompt 7.2 — Variables d'environnement et déploiement

```
Dans Petit Baobab, mets à jour la configuration de déploiement pour le module école.

1. Ajouter dans .env.local.example (et Vercel Dashboard) :
   STUDENT_JWT_SECRET=<générer avec: openssl rand -base64 32>

2. Vérifier que les variables existantes sont toujours présentes :
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY

3. Mettre à jour supabase/config.toml si nécessaire pour les nouvelles tables.

4. Créer le script de seed pour les données de test :
   supabase/seed.sql :
   - 1 compte test (account_id connu)
   - 1 classe "CE1 Test" avec code "BAOBAB-TEST"
   - 5 élèves dans cette classe
   - Solde de 1000 étoiles sur le compte

5. Dans package.json, ajouter le script :
   "db:school": "supabase db push && supabase db reset --linked"

6. Mettre à jour README.md avec la section "Module École" :
   - Variables env nécessaires
   - Comment créer un compte test enseignant
   - URL de test : /school avec code BAOBAB-TEST + prénom "Awa"
```

---

## Règles métier de référence {#regles}

À copier dans chaque prompt où la logique métier est critique.

```
RÈGLES MÉTIER PETIT BAOBAB — MODULE ÉCOLE (à respecter dans tout le code)

PLANS ET ACCÈS :
- Seul le plan 'ecole_pro' (25 000 FCFA/mois) donne accès au module école
- Vérification : accounts.plan === 'ecole_pro'
- Max 60 élèves par classe (limite pédagogique)
- Pas de limite de nombre de classes

ÉTOILES :
- Pool partagé : les étoiles appartiennent à l'account (école), pas aux élèves
- 1 000 étoiles renouvelées chaque mois à la date anniversaire
- Coût des générations : Contour simple = 1★, Noir&Blanc = 1★, Détaillé = 3★, Couleur = 3★
- Si génération échoue → remboursement automatique immédiat
- Alerte à 200★ restantes

CONNEXION ÉLÈVE :
- Pas d'email, pas de mot de passe
- Cookie : 'sb-student-token' (httpOnly, 7 jours)
- JWT contient : profile_id, student_id, classroom_id, name, mascot, type:'student'
- La route /school est toujours publique
- Élève peut accéder à : /dashboard, /coloriage, /magic-drawing, /livres-de-coloriage

DONNÉES :
- Tous les dessins d'un élève → saved_drawings avec profile_id = child_profile.id de l'élève
- Tous les livres d'un élève → books avec profile_id = child_profile.id de l'élève
- Chaque action → student_activities (login, drawing_created, book_created, badge_earned)
- RLS Supabase garantit qu'un enseignant ne voit que ses propres classes et élèves

LANGUE :
- Français uniquement pour les messages côté élève (interface simplifiée)
- Français et Anglais pour l'interface enseignant (système i18n existant)

WATERMARK :
- Les impressions des élèves sur plan École/Pro sont SANS watermark
- Les dessins s'ajoutent à "Mes dessins" et les livres à "Mes livres" (centralisé)
```

---

## Ordre de développement recommandé

```
Semaine 1 :  Phase 1 (DB) + Phase 2 (Auth élève)
Semaine 2 :  Phase 3 (API routes)
Semaine 3 :  Phase 4 prompts 4.1 + 4.2 + 4.3 (login + layout + dashboard)
Semaine 4 :  Phase 4 prompts 4.4 + 4.5 + 4.6 (classe + fiche élève + étoiles)
Semaine 5 :  Phase 4 prompt 4.7 + Phase 5 (codes + navigation)
Semaine 6 :  Phase 6 (intégration étoiles) + Phase 7 (tests + déploiement)
```

---

*Document généré pour Petit Baobab — Module École / Flux B*  
*Version 1.0 — Juillet 2025*
