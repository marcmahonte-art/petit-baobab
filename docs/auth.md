# Authentification — Petit Baobab

Document de référence sur les types d'authentification, les flux, les cookies,
les redirections et la déconnexion. Généré à partir de l'audit du code
(`src/app/api/auth/*`, `src/lib/auth-store.ts`, `src/app/(auth)/login/page.tsx`,
`src/components/auth/StudentLoginForm.tsx`).

---

## 1. Vue d'ensemble : 3 types de sessions

| Type | Cible | Identifiants | Cookies posés | Espace après connexion |
|------|-------|--------------|---------------|------------------------|
| **Parent / Famille** | Adulte (compte famille) | e-mail + mot de passe | `sb-access-token`, `sb-refresh-token`, `role=parent` | `/parents` ou `/parents/select-profile` |
| **École / Enseignant** | Compte `ecole_pro` | e-mail + mot de passe | `sb-access-token`, `sb-refresh-token`, `role=teacher` | `/school/dashboard` |
| **Élève** | Enfant (lié à une école) | code de classe + prénom | `sb-student-token` (httpOnly), `sb-student-session-active` | `/dashboardstudent` |

> Les comptes Parent et École partagent le **même mécanisme** (Supabase Auth
> e-mail/mot de passe) ; seule la valeur `accounts.plan` (`free` vs `ecole_pro`)
> et le cookie de rôle différencient l'espace de destination.

---

## 2. Flux Parent / École (e-mail + mot de passe)

### Inscription — `POST /api/auth/signup`
- Champs : `email`, `password` (≥ 8), `ageConsent=true`, `accountType` (`family`|`school`), `schoolName?`, `schoolWhatsapp?`.
- Crée l'utilisateur via Supabase Auth (`signUp`).
- Crée/maj le compte :
  - `family` → `plan=free`, `stars_balance=5`, 1 profil enfant par défaut.
  - `school` → `plan=ecole_pro`, `default_space=school`, `stars_balance=1000`, `school_name`/`school_whatsapp` renseignés.
- Un e-mail de confirmation Supabase est envoyé (la délivrabilité dépend du SMTP configuré côté Supabase).
- Redirection front après succès : `/login?space=<family|school>` (+ `&school_signup=1` pour école).

### Connexion — `POST /api/auth/login`
- `signInWithPassword` (Supabase Auth).
- Récupère/crée le compte `accounts` et les `child_profiles`.
- **Renouvellement quotidien des étoiles** (plan `free`) : filet de sécurité si le cron pg_cron n'a pas tourné à minuit GMT.
- Pose les cookies :
  - `setAuthCookies(access_token, refresh_token)` — httpOnly, sécurisés.
  - `setRoleCookie(account.plan)` — `role=teacher` si `ecole_pro`, sinon `role=parent`.
- Réponse JSON : `user`, `account`, `profiles`.

### Redirection après connexion (`src/app/(auth)/login/page.tsx`)
```ts
if (next)                       router.push(next)
else if (plan === "ecole_pro")  router.push("/school/dashboard")
else if (multipleProfiles)      router.push("/parents/select-profile")
else                            router.push("/parents")
```

### Déconnexion — `POST /api/auth/logout` + `useAuthStore.logout()`
- Le store `logout()` fait le `fetch("/api/auth/logout")` **ET** vide l'état client
  (`user`, `account`, `profiles`, `activeProfileId`, `studentSession`), puis
  nettoie `useProfileStore` et `useCreditStore`.
- Redirection par espace (appliquée dans les headers/sidebars) :
  - `/dashboard` (parent) → `/login?space=family`
  - `/school/dashboard` (école) → `/login?space=school`
- ⚠️ **Bug corrigé** : le logout école utilisait un `fetch` direct sans vider le
  store → l'état `user` restait non-null et la page `/login` redirigeait vers
  `/parents` puis `/login?next=/parents`. Désormais le logout école appelle
  `useAuthStore.logout()`.

---

## 3. Flux Élève (code de classe + prénom)

### Composant — `StudentLoginForm` (`src/components/auth/StudentLoginForm.tsx`)
⚠️ **Non encore branché à une route publique** : le composant existe mais n'est
importé par aucune page. Il n'y a pas encore de page `/student-login` dédiée.

### Connexion — `POST /api/auth/student-login`
- Champs : `class_code`, `first_name`, optionnel `student_id` (pour lever les homonymes).
- Recherche la classe active (`classrooms.class_code`, non archivée).
- Recherche l'élève par prénom (insensible à la casse) dans la classe.
  - Si plusieurs homonymes → réponse `{ multiple: true, students: [...] }`, le
    front rappelle avec `student_id`.
- Récupère le `child_profiles` lié, le solde d'étoiles du compte école.
- **Signe un JWT élève** (`signStudentToken`) et pose :
  - `sb-student-token` (httpOnly, sécurisé) — contient `profile_id`, `student_id`,
    `classroom_id`, `account_id`, `name`, `mascot`, `classroom_name`, `stars_balance`, `type:"student"`.
  - `sb-student-session-active` (non httpOnly, pour que le client sache qu'une session élève existe).
- Redirection front : `router.push("/dashboardstudent")` (délai 800 ms + confettis).

### Restauration de session — `GET /api/auth/student-session`
- Décode le cookie `sb-student-token` (httpOnly) et renvoie la session au client
  pour restaurer l'état après un rafraîchissement de page `/dashboardstudent`.

### Déconnexion élève — `POST /api/auth/student-logout`
- Supprime `sb-student-token` et `sb-student-session-active`.
- Côté client, le header de `/dashboardstudent` et `/dashboard` appelle ce endpoint
  puis `clearStudentSession()` du store.

### Particularité du bouton "Retour" (coloriage)
- Session élève (`studentSession` présent) → `/dashboardstudent`
- Compte enfant d'un parent (`studentSession` absent) → `/dashboard`

---

## 4. Cookies

| Cookie | Portée | httpOnly | Rôle |
|--------|--------|----------|------|
| `sb-access-token` | auth parent/école | oui | token Supabase |
| `sb-refresh-token` | auth parent/école | oui | refresh Supabase |
| `role` | routage | oui | `parent` | `teacher` |
| `sb-student-token` | auth élève | oui | JWT élève signé |
| `sb-student-session-active` | auth élève | non | présence session élève (client) |

---

## 5. Pages & routes liées

| Route | Usage |
|-------|-------|
| `/login?space=family` | Connexion parent |
| `/login?space=school` | Connexion école |
| `/signup?space=family` | Inscription parent |
| `/signup?space=school` | Inscription école |
| `/school` | Landing école (CTA vers `/login`) |
| `/parents` | Espace parent |
| `/school/dashboard` | Espace école (guard : `plan=ecole_pro`) |
| `/dashboardstudent` | Espace élève (code + prénom) |
| `/dashboard` | Espace enfant d'un parent |
| `/select-space` | Choix d'espace (redirige selon `account`) |

### Guards serveur (redirect)
- `/school/dashboard` → `redirect("/login")` si pas d'utilisateur ; `redirect("/parents")` si `plan !== ecole_pro`.
- `/parents`, `/parents/billing`, `/parents/select-profile`, `/dashboard` → `router.push("/login")` si pas d'utilisateur.
- Effet `/login` : si `user` présent au montage → `router.push(next || "/parents")`.

---

## 6. Points d'attention / TODO

1. **Page de connexion élève manquante** : `StudentLoginForm` est prêt mais non
   routé. Créer `/student-login` (ou brancher depuis le CTA "Connexion élève
   (code de classe)" de `/login`) pour exposer la connexion par code + prénom.
2. **Déconnexion école** : désormais OK (vide le store). Vérifier que
   `SchoolMobileNav` et `SchoolSidebar` utilisent bien `useAuthStore.logout()`.
3. **E-mail de confirmation** : dépend du SMTP Supabase (voir `docs/RESEND_SETUP`
   ou configuration Supabase). En mode test, les e-mails ne sont pas délivrés.
4. **Cohérence `next`** : les guards redirigent vers `/login?next=<path>` ; la
   page login consomme ce `next` en priorité après connexion.
