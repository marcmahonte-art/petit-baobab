-- ============================================================
-- Étend le CHECK de child_profiles.mascot aux 6 nouvelles mascottes
-- ============================================================

ALTER TABLE public.child_profiles
  DROP CONSTRAINT IF EXISTS child_profiles_mascot_check;

ALTER TABLE public.child_profiles
  ADD CONSTRAINT child_profiles_mascot_check
  CHECK (mascot IN ('awa', 'lion', 'robot', 'bobo', 'kaya', 'zuri', 'momo', 'kiki', 'baobab'));

-- Met à jour le DEFAULT pour les nouveaux profils
ALTER TABLE public.child_profiles
  ALTER COLUMN mascot SET DEFAULT 'bobo';
