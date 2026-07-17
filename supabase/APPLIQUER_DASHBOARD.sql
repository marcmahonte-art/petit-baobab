-- ============================================================
-- Petit Baobab — Migrations module école (à coller dans
-- Supabase Dashboard → SQL → New query → Run)
-- Idempotent : peut être exécuté plusieurs fois.
-- ============================================================

-- ===== 02_school_tables.sql =====
CREATE TABLE IF NOT EXISTS classrooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name text NOT NULL,
  class_code text UNIQUE NOT NULL,
  academic_year text DEFAULT '2025-2026',
  archived_at timestamp NULL,
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS school_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id uuid NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text,
  display_name text,
  mascot text DEFAULT 'awa',
  pin text,
  deleted_at timestamp NULL,
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS student_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  action text NOT NULL,
  stars_used integer DEFAULT 0,
  points_earned integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp DEFAULT now()
);

ALTER TABLE child_profiles
  ADD COLUMN IF NOT EXISTS student_id uuid REFERENCES school_students(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS classroom_id uuid REFERENCES classrooms(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION generate_class_code()
RETURNS text AS $$
DECLARE
  code text;
BEGIN
  LOOP
    code := 'BAOBAB-' || array_to_string(
      (SELECT ARRAY(
        SELECT substr('ABCDEFGHIJKLMNOPQRSTUVWXYZ', (trunc(random()*26)::int)+1, 1)
        FROM generate_series(1,5)
      ))
    , '');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM classrooms WHERE class_code = code);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION set_class_code()
RETURNS trigger AS $$
BEGIN
  IF NEW.class_code IS NULL THEN
    NEW.class_code := generate_class_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_class_code ON classrooms;
CREATE TRIGGER trg_set_class_code
BEFORE INSERT ON classrooms
FOR EACH ROW EXECUTE FUNCTION set_class_code();

ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "classrooms_access" ON classrooms
FOR ALL
USING (account_id = (SELECT id FROM accounts WHERE user_id = auth.uid()))
WITH CHECK (account_id = (SELECT id FROM accounts WHERE user_id = auth.uid()));

CREATE POLICY "students_access" ON school_students
FOR ALL
USING (classroom_id IN (
  SELECT id FROM classrooms WHERE account_id = (SELECT id FROM accounts WHERE user_id = auth.uid())
))
WITH CHECK (classroom_id IN (
  SELECT id FROM classrooms WHERE account_id = (SELECT id FROM accounts WHERE user_id = auth.uid())
));

CREATE POLICY "activities_access" ON student_activities
FOR ALL
USING (profile_id IN (
  SELECT id FROM child_profiles WHERE account_id = (SELECT id FROM accounts WHERE user_id = auth.uid())
))
WITH CHECK (profile_id IN (
  SELECT id FROM child_profiles WHERE account_id = (SELECT id FROM accounts WHERE user_id = auth.uid())
));

CREATE INDEX IF NOT EXISTS idx_classrooms_account_id ON classrooms(account_id);
CREATE INDEX IF NOT EXISTS idx_classrooms_class_code ON classrooms(class_code);
CREATE INDEX IF NOT EXISTS idx_school_students_classroom_id ON school_students(classroom_id);
CREATE INDEX IF NOT EXISTS idx_school_students_name_class ON school_students(lower(first_name), classroom_id);
CREATE INDEX IF NOT EXISTS idx_student_activities_profile_created ON student_activities(profile_id, created_at DESC);

-- ===== 03_role_columns.sql =====
ALTER TABLE accounts
  ADD COLUMN IF NOT EXISTS has_family_sub boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_school_sub boolean NOT NULL DEFAULT false;

UPDATE accounts SET has_family_sub = true WHERE plan IN ('free', 'decouverte', 'super_baobab');
UPDATE accounts SET has_school_sub = true WHERE plan = 'ecole_pro';

CREATE OR REPLACE FUNCTION on_plan_changed()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.has_family_sub := NEW.plan IN ('free', 'decouverte', 'super_baobab') OR (NEW.plan = 'ecole_pro' AND OLD.has_family_sub = true);
  NEW.has_school_sub := (NEW.plan = 'ecole_pro');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_on_plan_changed ON accounts;
CREATE TRIGGER trg_on_plan_changed BEFORE UPDATE OF plan ON accounts
FOR EACH ROW EXECUTE FUNCTION on_plan_changed();

CREATE INDEX IF NOT EXISTS idx_accounts_plan ON accounts (plan);
