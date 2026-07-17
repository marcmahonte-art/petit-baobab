-- ============================================================
-- Petit Baobab — Colonnes de rôle sur accounts (Phase 1.1)
-- ============================================================
-- Idempotent : peut être exécuté plusieurs fois sans erreur.

-- 1. Nouvelles colonnes
ALTER TABLE accounts
  ADD COLUMN IF NOT EXISTS has_family_sub boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_school_sub boolean NOT NULL DEFAULT false;

-- 2. Initialiser les comptes existants
UPDATE accounts
SET has_family_sub = true
WHERE plan IN ('free', 'decouverte', 'super_baobab');

UPDATE accounts
SET has_school_sub = true
WHERE plan = 'ecole_pro';

-- Les comptes ecole_pro qui ont AUSSI un abonnement famille conservent les deux à true.
-- (has_family_sub reste à false par défaut pour ecole_pro SAUF s'il l'était déjà.)

-- 3. Trigger on_plan_changed()
CREATE OR REPLACE FUNCTION on_plan_changed()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.has_family_sub :=
    NEW.plan IN ('free', 'decouverte', 'super_baobab')
    OR (NEW.plan = 'ecole_pro' AND OLD.has_family_sub = true);

  NEW.has_school_sub := (NEW.plan = 'ecole_pro');

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_on_plan_changed ON accounts;

CREATE TRIGGER trg_on_plan_changed
  BEFORE UPDATE OF plan ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION on_plan_changed();

-- 4. Index sur plan (si inexistant)
CREATE INDEX IF NOT EXISTS idx_accounts_plan ON accounts (plan);
