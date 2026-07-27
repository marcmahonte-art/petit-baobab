# Variables d'environnement PayDunya

## À ajouter sur Vercel

Lien direct : https://vercel.com/polo6/petit-baobab/settings/environment-variables

Ajouter ces 5 variablroduction, Preview, Development) :

| Variable | Valeur |
|---|---|
| `PAYDUNYA_MASTER_KEY` | `wN6trbT8-0ju5-rwr6-A78R-ROO1beM6x6TB` |
| `PAYDUNYA_PRIVATE_KEY` | `test_private_0A6jE43ldVNO5sdTLIlHWOWYyoZ` |
| `PAYDUNYA_PUBLIC_KEY` | `test_public_IL7QvlCgQZOMsFnWK4kjUUzSGfS` |
| `PAYDUNYA_TOKEN` | `JSV68JNPCYMu7k73tDFB` |
| `PAYDUNYA_MODE` | `test` |

## Mode live (production)

Quand le KYC sera validé par PayDunya :

- `PAYDUNYA_PRIVATE_KEY` → clé commençant par `live_private_...`
- `PAYDUNYA_MODE` → `live`
- `PAYDUNYA_MASTER_KEY`, `TOKEN`, `PUBLIC_KEY` → inchangés (ce sont les clés du compte, pas de l'application)
