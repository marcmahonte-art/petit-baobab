-- =====================================================================
-- Correction du bug "impossible de créer des élèves" (espace école)
-- Cause : child_profiles.mascot a un CHECK obsolète qui n'accepte que
-- les ANCIENNES mascottes ('awa','lion','robot'). Le code de création
-- d'élève (route /api/school/students) utilise les NOUVELLES mascottes
-- ('bobo','kaya','zuri','momo','kiki','baobab'). L'insert enfant
-- viole le CHECK -> échec silencieux -> created:0.
-- Correction : on étend le CHECK aux 6 nouvelles mascottes
-- (on garde les 3 anciennes pour la compatibilité des données existantes).
-- =====================================================================

-- 1. Trouver le nom exact de la contrainte (par sécurité, on la drop via son nom)
DO $$
DECLARE
  con_name text;
BEGIN
  SELECT conname INTO con_name
  FROM pg_constraint
  WHERE conrelid = 'public.child_profiles'::regclass
    AND contype = 'c'
    AND conname LIKE '%mascot%';

  IF con_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.child_profiles DROP CONSTRAINT %I', con_name);
  END IF;
END $$;

-- 2. Nouveau CHECK étendu (anciennes + nouvelles mascottes)
ALTER TABLE public.child_profiles
  ADD CONSTRAINT child_profiles_mascot_check
  CHECK (mascot IN (
    'awa', 'lion', 'robot',            -- anciennes (compat)
    'bobo', 'kaya', 'zuri', 'momo', 'kiki', 'baobab'  -- nouvelles
  ));

-- 3. Vérification
-- SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint
-- WHERE conrelid = 'public.child_profiles'::regclass AND contype = 'c';
