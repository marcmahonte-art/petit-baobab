# PayDunya — Inventaire complet

Toutes les occurrences de PayDunya dans le code, organisées par domaine.

---

## 1. Configuration & variables d'environnement

| Variable | Fichier |
|---|---|
| `PAYDUNYA_MODE` (live / test) | `src/lib/paydunya/config.ts:4` |
| `PAYDUNYA_MASTER_KEY` | `src/lib/paydunya/config.ts:15` |
| `PAYDUNYA_PRIVATE_KEY` | `src/lib/paydunya/config.ts:16` |
| `PAYDUNYA_TOKEN` | `src/lib/paydunya/config.ts:17` |
| `PAYDUNYA_BASE_URL` (sandbox/live) | `src/lib/paydunya/config.ts:7-10` |
| `NEXT_PUBLIC_PAYDUNYA_MODE` | `.env` / Vercel |

---

## 2. Bibliothèque cœur — `src/lib/paydunya/`

| Fichier | Rôle |
|---|---|
| `src/lib/paydunya/config.ts` | Lecture des vars d'env, construction headers, `assertPaydunyaConfigured()` |
| `src/lib/paydunya/client.ts` | Client HTTP bas niveau `paydunyaFetch()` avec timeout 15s, classe `PaydunyaError` |
| `src/lib/paydunya/checkout.ts` | `createShopInvoice()` → création facture boutique, retourne `checkoutUrl` + `invoiceToken` |
| `src/lib/paydunya/verify.ts` | `confirmPaydunyaInvoice()` → vérification serveur d'une facture (source de vérité) |
| `src/lib/paydunya/webhook.ts` | `processShopWebhook()` → confirme via PayDunya, crée downloads, facture PDF, emails/WhatsApp |

### Détail `config.ts`
- `PAYDUNYA_BASE_URL` = `https://app.paydunya.com/sandbox-api/v1` (test) ou `https://app.paydunya.com/api/v1` (live)
- Headers : `PAYDUNYA-MASTER-KEY`, `PAYDUNYA-PRIVATE-KEY`, `PAYDUNYA-TOKEN`, `Content-Type: application/json`
- `getAppUrl()` → URL de base du site (utilisée par emails/WhatsApp)
- `assertPaydunyaConfigured()` → vérifie que les 3 clés sont présentes

### Détail `client.ts`
- `paydunyaFetch<T>(path, body)` → fetch `POST ${PAYDUNYA_BASE_URL}${path}` avec headers + timeout 15s
- `PaydunyaError` extends `Error` avec `code`

### Détail `checkout.ts`
- Endpoint : `/checkout-invoice/create`
- Payload : `invoice_data` (items, total, taxes), `store` (name, logo, return/cancel URLs), `actions` (cancel_url, return_url)
- Retour : `{ checkoutUrl, invoiceToken }`

### Détail `verify.ts`
- Endpoint : `/checkout-invoice/confirm/{token}`
- Vérifie le statut réel côté serveur (pas de confiance client)
- Normalise le statut PayDunya en `paid` / `failed` / `pending`

### Détail `webhook.ts`
- `processShopWebhook(invoiceToken)` → appelée par IPN boutique
  1. Vérifie idempotence (table `shop_webhook_events`)
  2. Confirme la facture via `confirmPaydunyaInvoice()`
  3. Si `paid` : update `shop_orders` + crée `shop_downloads` + envoie email/WhatsApp + génère facture PDF
- Exporte le type `ShopOrderRow`

---

## 3. Paiement abonnement (école + famille) — `src/lib/payments/`

| Fichier | Rôle |
|---|---|
| `src/lib/payments/paydunya.ts` | Classe `PayDunyaProvider` → `createCheckout(params)` pour abonnements |
| `src/lib/payments/index.ts` | Re-export de `PayDunyaProvider` et `payDunyaProvider` |
| `src/lib/payments/types.ts` | Interface `PayDunyaCheckoutParams` |

### Détail `paydunya.ts`
- Endpoint : `/checkout-invoice/create` (identique boutique)
- `callback_url` = `${origin}/api/billing/webhook/paydunya`
- `return_url` = page succès, `cancel_url` = page échec
- PayDunyaProvider() est un singleton exporté

---

## 4. API Routes (webhooks)

| Route | Fichier | Usage |
|---|---|---|
| `POST /api/billing/webhook/paydunya` | `src/app/api/billing/webhook/paydunya/route.ts` | IPN abonnement (parents + école) |
| `POST /api/school/billing/paydunya/webhook` | `src/app/api/school/billing/paydunya/webhook/route.ts` | IPN abonnement école (dédoublonnée ?) |
| `POST /api/payment/create` | `src/app/api/payment/create/route.ts` | Crée facture boutique via `createShopInvoice()` |
| `GET /api/payment/status` | `src/app/api/payment/status/route.ts` | Revérifie statut via `processShopWebhook()` si pending |

---

## 5. Pages Frontend

### Boutique (shop)
| Page | Fichier | Détail |
|---|---|---|
| Checkout | `src/app/boutique/checkout/page.tsx` | Appelle `/api/payment/create`, redirige vers `checkout_url` PayDunya |
| Merci | `src/app/boutique/merci/page.tsx` | Vérifie statut réel (Supabase + PayDunya) |
| Paiement échoué | `src/app/boutique/paiement-echoue/page.tsx` | Cancel URL PayDunya |
| Mes achats | `src/app/boutique/mes-achats/page.tsx` | Statut commande, downloads |

### École
| Page | Fichier | Détail |
|---|---|---|
| Paramètres | `src/app/school/parametres/ParametresClient.tsx` | Intégration "PayDunya — Connecté" (section 8) |
| Facturation | `src/app/school/facturation/FacturationClient.tsx` | Mention PayDunya dans les paiements mockés |
| Billing | `src/app/school/dashboard/billing/BillingClient.tsx` | Carte "Moyen de paiement : PayDunya" |
| Achat étoiles | `src/components/school/StarPurchaseModal.tsx` | "Paiement sécurisé via PayDunya" |
| Souscription | `src/components/school/billing/SubscribeDialog.tsx` | "Paiement sécurisé via PayDunya" |

### Parents/Famille
| Composant | Fichier | Détail |
|---|---|---|
| Super Baobab Modal | `src/components/parents/SuperBaobabModal.tsx` | "Payer via PayDunya", "Paiement 100% sécurisé via PayDunya" |

### Composants partagés
| Composant | Fichier | Détail |
|---|---|---|
| PaymentMethods | `src/components/boutique/PaymentMethods.tsx` | Option `paydunya` dans la liste |
| TrustSection | `src/components/boutique/TrustSection.tsx` | "Payez par Orange Money, Moov Money, PayDunya" |
| BoutiqueFooter | `src/components/boutique/Footer.tsx` | Badge "PayDunya" |
| useOrderStatus | `src/components/boutique/useOrderStatus.ts` | Fallback localStorage "retour PayDunya" |

### Admin
| Page | Fichier | Détail |
|---|---|---|
| Admin sidebar | `src/components/dashboard/admin-sidebar.tsx:78` | Lien `/dashboard/payments/paydunya` |
| Admin PayDunya | `src/app/dashboard/payments/paydunya/page.tsx` | Page admin dédiée |

### Root repo (hors submodule)
| Fichier | Note |
|---|---|
| `src/lib/payments/paydunya.ts` | Dupliqué / identique au submodule |
| `src/lib/payments/index.ts` | Re-export |
| `src/lib/payments/types.ts` | Interface dupliquée |
| `src/lib/paydunya/config.ts` | Dupliqué |
| `src/lib/paydunya/client.ts` | Dupliqué |
| `src/lib/paydunya/verify.ts` | Dupliqué |
| `src/lib/paydunya/webhook.ts` | Dupliqué |

---

## 6. Emails & Notifications

| Fichier | Import |
|---|---|
| `src/lib/emails/send.ts` | Importe `getAppUrl` et `ShopOrderRow` depuis `paydunya/` |
| `src/lib/whatsapp/send.ts` | Importe `getAppUrl` et `ShopOrderRow` depuis `paydunya/` |
| `src/emails/order-confirmation.tsx` | Importe `ShopOrderRow` |
| `src/emails/payment-failed.tsx` | Importe `ShopOrderRow` |

---

## 7. Factures PDF

| Fichier | Ligne | Texte |
|---|---|---|
| `src/lib/invoices/generate-shop-invoice.ts:122` | "Paiement sécurisé via PayDunya (Orange Money, Moov Money, Carte bancaire)" |
| `src/lib/invoices/generate-invoice.ts:120` | "Paiement sécurisé via PayDunya" |

---

## 8. Base de données (SQL)

| Fichier | Colonne / Valeur |
|---|---|
| `supabase/migrations/shop_orders.sql:23` | `payment_method text not null default 'paydunya'` |
| `supabase/migrations/shop_orders.sql:28` | `invoice_token text unique` (token facture PayDunya) |
| `supabase/migrations/shop_orders.sql:29` | `transaction_id text` (id transaction PayDunya) |
| `src/lib/admin/data.ts:194,259` | `method: o.payment_method || "paydunya"` (fallback) |

---

## 9. Endpoints API PayDunya utilisés

| Endpoint | Méthode | Usage | Fichier |
|---|---|---|---|
| `/checkout-invoice/create` | POST | Création de facture | `checkout.ts`, `paydunya.ts` |
| `/checkout-invoice/confirm/{token}` | POST | Vérification statut | `verify.ts` |

---

## 10. Flux de données

### Boutique
```
Checkout → POST /api/payment/create → createShopInvoice() → PayDunya API
                                                                    ↓
                                                          Facture créée → return checkout_url
                                                                    ↓
                                                    Client paie sur PayDunya hosted page
                                                                    ↓
                                          ┌──────────────────────────┴──────────────┐
                                          ↓                                      ↓
                               Return URL (merci)                        IPN → webhook.ts
                                                                                   ↓
                                                                           confirmPaydunyaInvoice()
                                                                                   ↓
                                                                           Si paid : shop_downloads + email
```

### Abonnement (école / famille)
```
Achat étoiles → POST /api/billing/checkout → PayDunyaProvider.createCheckout()
                                                          ↓
                                                callback_url → /api/billing/webhook/paydunya
```

---

## 11. Test sandbox

Cf. section "Test de paiement PayDunya — Mode sandbox" ci-dessous (ancien contenu conservé).

---

# Test de paiement PayDunya — Mode sandbox

## Prérequis

Les 5 variables d'environnement doivent être configurées sur Vercel :

```
PAYDUNYA_MASTER_KEY=
PAYDUNYA_PRIVATE_KEY=test_private_...
PAYDUNYA_PUBLIC_KEY=test_public_...
PAYDUNYA_TOKEN=
PAYDUNYA_MODE=test
```

Un compte fictif doit être créé dans le dashboard PayDunya :
1. Dashboard PayDunya → onglet **Clients fictifs**
2. Ajouter un client (nom, téléphone, email)
3. Lui attribuer un solde suffisant (ex: 10 000 FCFA)
4. Noter son numéro de téléphone

## Processus de test

### 1. Lancer un achat sur le site

- Se connecter sur https://petit-baobab.vercel.app en tant que parent/enseignant
- Aller sur la page d'achat d'étoiles
- Choisir un pack (100, 250 ou 500 étoiles)
- Cliquer sur "Acheter"

→ Le site appelle `POST /api/billing/checkout`

**Réponse attendue :**
```json
{"available": true, "checkoutUrl": "https://app.paydunya.com/sandbox-checkout/..."}
```

### 2. Payer sur la page sandbox PayDunya

- Redirigé vers une page `https://app.paydunya.com/sandbox-checkout/...`
- Le montant et la description du pack sont affichés
- Choisir un moyen de paiement (Orange Money, Wave, etc.)
- Dans le champ **Numéro de téléphone**, saisir le numéro du **compte fictif**
- Cliquer sur "Payer"

### 3. Confirmation

- PayDunya sandbox simule un délai puis confirme le paiement
- PayDunya appelle `POST /api/billing/webhook/paydunya` avec les données de transaction
- Le serveur vérifie le statut via l'API confirm de PayDunya
- Si statut = "completed" : les étoiles sont créditées via `adjustStars()`
- L'utilisateur est redirigé vers la page de succès

### 4. Vérification

- Recharger la page d'achat → le solde d'étoiles doit avoir augmenté
- Vérifier les logs Vercel : Deployments → dernier déploiement → Functions → `/api/billing/webhook/paydunya`
- Vérifier qu'un replay de la même IPN ne crédite pas deux fois (idempotence)

### 5. Test d'idempotence

Si tu souhaites vérifier que le double crédit est impossible :
- Une fois le paiement réussi, rejouer manuellement la même requête IPN (même `invoice_token`) vers `/api/billing/webhook/paydunya`
- Le serveur doit répondre `{"ok": true, "deduped": true}` sans créditer à nouveau
- Vérifier que `stars_balance` n'a pas changé

## Passage en production

Une fois les tests sandbox validés :

1. Générer des clés **live** dans le dashboard PayDunya
2. Soumettre le KYC à PayDunya (CNI, RCCM, NINEA, RIB) — délai 5-10 jours ouvrés
3. Remplacer les clés sur Vercel :
   - `PAYDUNYA_PRIVATE_KEY` = clé commençant par `live_private_...`
   - `PAYDUNYA_MODE=live`
4. Les clés Master Key et Token restent les mêmes (ce sont les clés du compte, pas de l'application)

## Dépannage

| Problème | Cause probable | Solution |
|---|---|---|
| `POST /api/billing/checkout` retourne 503 | Variables d'env manquantes | Vérifier les 5 variables sur Vercel |
| Page de paiement introuvable | URL incorrecte | Vérifier les logs API PayDunya dans le dashboard |
| Webhook non reçu | `callback_url` incorrecte | Vérifier que `PAYDUNYA_MODE=test` utilise la sandbox URL |
| Étoiles non créditées | `adjustStars` a échoué | Vérifier les logs Vercel (Functions → webhook/paydunya) |
| Double crédit | Idempotence défaillante | Vérifier la RPC `adjust_stars` et la table `payments` |

## Architecture du flux

```
[Site] → POST /api/billing/checkout → [PayDunya API] → crée une facture
                                                               ↓
                                            Page hosted PayDunya (sandbox-checkout)
                                                               ↓
                                               Client paie (Wave / OM / carte)
                                                               ↓
                                            ┌──────────────────────────────────┐
                                            ↓                                  ↓
                               Page retour (return_url)         IPN → POST /api/billing/webhook/paydunya
                                                                                        ↓
                                                                           Vérification via API confirm
                                                                                        ↓
                                                                           Si "completed" : adjustStars()
                                                                                        ↓
                                                                           Réponse 200 à PayDunya
```

## Endpoints API PayDunya utilisés

| Endpoint | Méthode | Usage |
|---|---|---|
| `/checkout-invoice/create` | POST | Création de facture (dans `paydunya.ts`) |
| `/checkout-invoice/confirm/{token}` | POST | Vérification statut (dans le webhook) |
