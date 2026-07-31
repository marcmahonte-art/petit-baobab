-- ============================================================
-- Petit Baobab — Parcours pédagogiques (Learning Paths)
-- ============================================================
-- ▸ À exécuter dans : Supabase Dashboard → SQL Editor → New Query
-- ▸ Projet : https://supabase.com/dashboard/project/bsepfqpjomrtveavbfib
-- ============================================================

-- 1. learning_paths (définitions canoniques des parcours)
CREATE TABLE IF NOT EXISTS public.learning_paths (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  age_min INTEGER NOT NULL DEFAULT 3 CHECK (age_min >= 0),
  age_max INTEGER NOT NULL DEFAULT 12 CHECK (age_max >= age_min),
  difficulty TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')),
  theme TEXT NOT NULL,
  cover TEXT,
  icon TEXT NOT NULL DEFAULT '🎓',
  estimated_duration TEXT NOT NULL DEFAULT '20 min',
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. learning_modules (modules d'un parcours — progression linéaire)
CREATE TABLE IF NOT EXISTS public.learning_modules (
  id TEXT PRIMARY KEY,
  path_id TEXT NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  reward_xp INTEGER NOT NULL DEFAULT 0 CHECK (reward_xp >= 0),
  reward_stars INTEGER NOT NULL DEFAULT 0 CHECK (reward_stars >= 0),
  reward_badge TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_learning_modules_path ON public.learning_modules(path_id, order_index);

-- 3. learning_lessons (leçons / activités d'un module)
CREATE TABLE IF NOT EXISTS public.learning_lessons (
  id TEXT PRIMARY KEY,
  module_id TEXT NOT NULL REFERENCES public.learning_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  lesson_type TEXT NOT NULL CHECK (lesson_type IN ('COLORING', 'MAGIC_DRAWING', 'BOOK', 'GAME', 'QUIZ', 'STORY', 'VIDEO', 'CHALLENGE', 'MISSION', 'COLLECTION')),
  content_id TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  reward_xp INTEGER NOT NULL DEFAULT 0 CHECK (reward_xp >= 0),
  reward_stars INTEGER NOT NULL DEFAULT 0 CHECK (reward_stars >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_learning_lessons_module ON public.learning_lessons(module_id, order_index);

-- 4. child_learning_progress (progression d'un enfant sur un parcours)
CREATE TABLE IF NOT EXISTS public.child_learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  path_id TEXT NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL REFERENCES public.learning_modules(id) ON DELETE CASCADE,
  lesson_id TEXT REFERENCES public.learning_lessons(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'available', 'completed')),
  progress_pct INTEGER NOT NULL DEFAULT 0 CHECK (progress_pct >= 0 AND progress_pct <= 100),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (child_id, path_id, module_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_child_learning_progress_child ON public.child_learning_progress(child_id, path_id, completed_at);

-- 5. learning_certificates (certificats de fin de parcours — QR de vérification)
CREATE TABLE IF NOT EXISTS public.learning_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  path_id TEXT NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  path_title TEXT NOT NULL,
  child_name TEXT NOT NULL DEFAULT '',
  mascot TEXT NOT NULL DEFAULT 'bobo-lion',
  token TEXT NOT NULL UNIQUE,
  pdf_url TEXT,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_learning_certificates_child ON public.learning_certificates(child_id, issued_at DESC);

-- Helper RLS : vérifie que le child_id appartient au compte du user connecté
CREATE OR REPLACE FUNCTION public.child_belongs_to_user(p_child_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.child_profiles cp
    JOIN public.accounts a ON a.id = cp.account_id
    WHERE cp.id = p_child_id AND a.user_id = auth.uid()
  );
$$ LANGUAGE sql STABLE;

-- RLS
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_certificates ENABLE ROW LEVEL SECURITY;

-- Tables canoniques : lecture publique, écriture réservée aux parents authentifiés (seed idempotent côté app)
DROP POLICY IF EXISTS "learning_paths_select_all" ON public.learning_paths;
CREATE POLICY "learning_paths_select_all" ON public.learning_paths FOR SELECT USING (true);

DROP POLICY IF EXISTS "learning_paths_insert_auth" ON public.learning_paths;
CREATE POLICY "learning_paths_insert_auth" ON public.learning_paths FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "learning_paths_update_auth" ON public.learning_paths;
CREATE POLICY "learning_paths_update_auth" ON public.learning_paths FOR UPDATE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "learning_modules_select_all" ON public.learning_modules;
CREATE POLICY "learning_modules_select_all" ON public.learning_modules FOR SELECT USING (true);

DROP POLICY IF EXISTS "learning_modules_insert_auth" ON public.learning_modules;
CREATE POLICY "learning_modules_insert_auth" ON public.learning_modules FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "learning_lessons_select_all" ON public.learning_lessons;
CREATE POLICY "learning_lessons_select_all" ON public.learning_lessons FOR SELECT USING (true);

DROP POLICY IF EXISTS "learning_lessons_insert_auth" ON public.learning_lessons;
CREATE POLICY "learning_lessons_insert_auth" ON public.learning_lessons FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- child_learning_progress : lecture + écriture par le parent propriétaire
DROP POLICY IF EXISTS "child_learning_progress_select_own" ON public.child_learning_progress;
CREATE POLICY "child_learning_progress_select_own"
  ON public.child_learning_progress FOR SELECT
  USING (public.child_belongs_to_user(child_id));

DROP POLICY IF EXISTS "child_learning_progress_insert_own" ON public.child_learning_progress;
CREATE POLICY "child_learning_progress_insert_own"
  ON public.child_learning_progress FOR INSERT
  WITH CHECK (public.child_belongs_to_user(child_id));

DROP POLICY IF EXISTS "child_learning_progress_update_own" ON public.child_learning_progress;
CREATE POLICY "child_learning_progress_update_own"
  ON public.child_learning_progress FOR UPDATE
  USING (public.child_belongs_to_user(child_id));

-- learning_certificates : lecture + écriture par le parent propriétaire
DROP POLICY IF EXISTS "learning_certificates_select_own" ON public.learning_certificates;
CREATE POLICY "learning_certificates_select_own"
  ON public.learning_certificates FOR SELECT
  USING (public.child_belongs_to_user(child_id));

DROP POLICY IF EXISTS "learning_certificates_insert_own" ON public.learning_certificates;
CREATE POLICY "learning_certificates_insert_own"
  ON public.learning_certificates FOR INSERT
  WITH CHECK (public.child_belongs_to_user(child_id));

DROP POLICY IF EXISTS "learning_certificates_update_own" ON public.learning_certificates;
CREATE POLICY "learning_certificates_update_own"
  ON public.learning_certificates FOR UPDATE
  USING (public.child_belongs_to_user(child_id));
