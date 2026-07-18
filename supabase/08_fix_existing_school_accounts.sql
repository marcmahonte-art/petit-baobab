-- ============================================================
-- Petit Baobab — Correction des comptes école existants
-- À exécuter dans le SQL Editor Supabase (droits admin/service role).
-- Idempotent.
-- ============================================================

-- 1. Corriger UN compte précis (remplace l'email ci-dessous par le tien).
--    Décommente et adapte si tu veux cibler un compte spécifique.
--
-- UPDATE accounts
-- SET
--   plan = 'ecole_pro',
--   default_space = 'school',
--   stars_balance = 1000,
--   plan_renewed_at = now(),
--   has_school_sub = true
-- WHERE user_id = (SELECT id FROM auth.users WHERE email = 'ton-email@exemple.com');

-- 2. Corriger tous les comptes qui ont déjà une empreinte "école"
--    (default_space = 'school' OU has_school_sub = true) mais dont le plan
--    est resté 'free' à cause du trigger handle_new_user + RLS.
--    Cela répare les inscriptions école faites avant le correctif code.
UPDATE accounts
SET
  plan = 'ecole_pro',
  default_space = 'school',
  stars_balance = 1000,
  plan_renewed_at = now(),
  has_school_sub = true
WHERE (default_space = 'school' OR has_school_sub = true)
  AND plan <> 'ecole_pro';

-- 3. (Re)synchroniser has_school_sub / has_family_sub sur tous les comptes
--    au cas où le trigger n'aurait pas tourné.
UPDATE accounts
SET has_school_sub = (plan = 'ecole_pro')
WHERE has_school_sub IS DISTINCT FROM (plan = 'ecole_pro');

UPDATE accounts
SET has_family_sub =
  (plan IN ('free', 'decouverte', 'super_baobab')
   OR (plan = 'ecole_pro' AND has_family_sub = true))
WHERE has_family_sub IS DISTINCT FROM
  (plan IN ('free', 'decouverte', 'super_baobab')
   OR (plan = 'ecole_pro' AND has_family_sub = true));
