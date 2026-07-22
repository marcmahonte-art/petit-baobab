-- Migration: Remet le comportement d'origine pour les comptes famille
-- Les comptes famille gardent les 5 étoiles de bienvenue.
-- Les comptes ecole_pro seront réinitialisés à 0 lors de l'abonnement (via le webhook).

-- La fonction handle_new_user() reste inchangée avec stars_balance = 5 et le bonus de bienvenue.
