# Configuration de l'e-mail de confirmation via Resend (Supabase SMTP)

L'e-mail de confirmation d'inscription est envoyé par **Supabase Auth**, pas par
notre code. Si l'utilisateur ne le reçoit pas, c'est parce que le projet
n'a pas de SMTP configuré (mode test Supabase : les e-mails ne sont pas
réellement délivrés). Ce guide branche **Resend** comme relais SMTP.

## 1. Créer un compte Resend
- Aller sur https://resend.com et créer un compte gratuit.
- Dans **API Keys**, créer une clé (`Create API Key`), nom ex. `petit-baobab`,
 权限 `Sending access`. Copier la clé (commence par `re_...`).

## 2. Ajouter et vérifier un domaine
- Dans Resend → **Domains**, ajouter ton domaine (ex. `petit-baobab.com` ou
  celui que tu possèdes).
- Resend affiche des enregistrements DNS (SPF, DKIM, DMARC) à ajouter chez ton
  registrar/hébergeur DNS.
- Attendre que le domaine passe en `Verified` (statut vert).

> Le plan gratuit Resend autorise 3 000 e-mails/jour vers des destinataires
> vérifiés ; pour envoyer à n'importe qui, il faut soit vérifier le domaine
> (recommandé) soit être en trial. Le domaine vérifié suffit pour la prod.

## 3. Brancher le SMTP dans Supabase
- Dans le dashboard Supabase du projet → **Authentication → Providers → Email**.
- Activer **SMTP** (toggle "Enable custom SMTP").
- Renseigner :
  - **Host** : `smtp.resend.com`
  - **Port** : `587`
  - **User** : `resend`
  - **Password** : la clé API Resend créée à l'étape 1 (`re_...`)
  - **Sender name** : `Petit Baobab`
  - **Sender email** : `onboarding@ton-domaine.com` (doit utiliser le domaine
    vérifié à l'étape 2)
- **Save**.

## 4. Vérifier que la confirmation e-mail est activée
Toujours dans **Authentication → Providers → Email** :
- **Confirm email** doit être `Enabled` (sinon aucun e-mail de confirmation
  n'est envoyé et l'utilisateur est connecté directement).

## 5. Tester
- Créer un nouveau compte sur l'app (espace parent ou école).
- Un e-mail "Confirm your signup" doit arriver dans la boîte de réception
  (vérifier aussi les spams).
- Cliquer le lien → le compte est confirmé → connexion possible.

## Notes
- Notre route `src/app/api/auth/signup/route.ts` appelle `supabase.auth.signUp(...)`
  sans `emailRedirectTo` : Supabase utilise son URL de confirmation par défaut
  (configurable dans **Authentication → URL Configuration** →
  `Site URL` / `Redirect URLs`). Pour rediriger vers l'app après confirmation,
  ajouter `https://petit-baobab.vercel.app` (et `http://localhost:3000` en dev)
  dans les `Redirect URLs`.
- Les templates d'e-mail (objet, contenu) sont personnalisables dans
  **Authentication → Email Templates**.
