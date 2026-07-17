-- seed_school.sql – Données de test pour le module école

-- 1. Crée un compte école (plan ecole_pro) avec un solde d'étoiles
INSERT INTO accounts (id, user_id, stars_balance, plan, plan_renewed_at)
VALUES (
  gen_random_uuid(),
  gen_random_uuid(), -- user_id fictif (à associer à un utilisateur Supabase existant si besoin)
  1000,
  'ecole_pro',
  now()
) RETURNING id INTO _account_id;

-- 2. Crée une classe de test
INSERT INTO classrooms (id, account_id, name, class_code, academic_year)
VALUES (
  gen_random_uuid(),
  _account_id,
  'CE1 Test',
  'BAOBAB-TEST',
  '2025-2026'
) RETURNING id INTO _classroom_id;

-- 3. Crée 5 élèves et leurs child_profiles associés
DO $$
DECLARE
  student_ids uuid[] := ARRAY[]::uuid[];
  profile_ids uuid[] := ARRAY[]::uuid[];
  names text[] := ARRAY['Awa', 'Kofi', 'Aminata', 'Fatima', 'Abdoul'];
  i int;
BEGIN
  FOR i IN 1..array_length(names,1) LOOP
    INSERT INTO school_students (id, classroom_id, first_name, mascot)
    VALUES (gen_random_uuid(), _classroom_id, names[i], 'awa')
    RETURNING id INTO student_ids[i];

    INSERT INTO child_profiles (id, account_id, name, mascot, student_id, classroom_id)
    VALUES (gen_random_uuid(), _account_id, names[i], 'awa', student_ids[i], _classroom_id)
    RETURNING id INTO profile_ids[i];
  END LOOP;
END $$;

-- Nettoyage temporaire (si besoin, vous pouvez enlever cette partie)
-- SELECT * FROM accounts;
-- SELECT * FROM classrooms;
-- SELECT * FROM school_students;
-- SELECT * FROM child_profiles;
