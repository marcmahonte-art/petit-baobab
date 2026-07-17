-- ============================================================
-- Petit Baobab — RLS défensive pour le flux élève (P3-13)
-- ============================================================
-- Défense en profondeur : un élève ne doit jamais pouvoir ÉCRIRE le solde
-- d'étoiles de son école, mais doit pouvoir LIRE le solde de SA classe pour
-- afficher son compteur. On ajoute une policy de lecture seule sur
-- accounts.stars_balance, vérifiable côté DB via le JWT élève.
--
-- Le JWT élève (sb-student-token) contient classroom_id. On valide donc que
-- l'account ciblé est bien celui de la classroom de l'élève. L'écriture reste
-- interdite (aucune policy INSERT/UPDATE/DELETE pour le rôle élève).
-- ============================================================

-- Fonction : l'account appartient-il à la classroom de l'élève (claim JWT) ?
CREATE OR REPLACE FUNCTION public.account_belongs_to_student_classroom(p_account_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_classroom_id TEXT;
  v_account_id   UUID;
BEGIN
  -- classroom_id est injecté par le middleware via le header JWT élève décodé.
  -- On le récupère depuis les claims de la requête courante si présents.
  v_classroom_id := current_setting('request.jwt.claims', true)::json ->> 'classroom_id';
  IF v_classroom_id IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT account_id INTO v_account_id
  FROM public.classrooms
  WHERE id = v_classroom_id::UUID;

  RETURN v_account_id = p_account_id;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Policy de LECTURE seule du solde pour le flux élève (via JWT élève).
DROP POLICY IF EXISTS "Lecture du solde par l'élève de la classe" ON public.accounts;
CREATE POLICY "Lecture du solde par l'élève de la classe" ON public.accounts
  FOR SELECT
  USING (
    -- Soit un adulte propriétaire (déjà couvert par les autres policies),
    -- soit un élève dont la classroom appartient à cet account.
    account_belongs_to_student_classroom(id)
  );
