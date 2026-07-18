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
