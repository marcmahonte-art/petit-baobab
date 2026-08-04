-- ============================================================
-- Petit Baobab - Learning Map (GPS de l'enfant) - PHASE 9
-- Carte du monde africaine : regions, missions, quetes,
-- statistiques de competences. Le contenu canonique est
-- seede par l'application (seedLearningMap) de facon idempotente.
-- ============================================================

-- 1. learning_regions (regions de la grande carte africaine)
CREATE TABLE IF NOT EXISTS public.learning_regions (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🏝️',
  color TEXT NOT NULL DEFAULT '#20C997',
  position_x NUMERIC NOT NULL DEFAULT 0,
  position_y NUMERIC NOT NULL DEFAULT 0,
  required_xp INTEGER NOT NULL DEFAULT 0,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_learning_regions_order ON public.learning_regions(order_index);

-- 2. learning_levels (niveaux de progression de l'enfant)
CREATE TABLE IF NOT EXISTS public.learning_levels (
  id TEXT PRIMARY KEY,
  level INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  xp_required INTEGER NOT NULL DEFAULT 0,
  reward_stars INTEGER NOT NULL DEFAULT 0,
  icon TEXT NOT NULL DEFAULT '⭐',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_learning_levels_level ON public.learning_levels(level);

-- 3. learning_missions (missions / etapes des regions)
CREATE TABLE IF NOT EXISTS public.learning_missions (
  id TEXT PRIMARY KEY,
  region_id TEXT NOT NULL REFERENCES public.learning_regions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  order_index INTEGER NOT NULL DEFAULT 0,
  xp INTEGER NOT NULL DEFAULT 10,
  stars INTEGER NOT NULL DEFAULT 1,
  badge TEXT,
  illustration TEXT,
  type TEXT NOT NULL DEFAULT 'COLORING' CHECK (type IN ('COLORING','MAGIC_DRAWING','BOOK','GAME','QUIZ','STORY','VIDEO','CHALLENGE','MISSION','COLLECTION')),
  duration INTEGER NOT NULL DEFAULT 10,
  difficulty TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner','intermediate','advanced','expert')),
  prerequisites TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_learning_missions_region ON public.learning_missions(region_id, order_index);

-- 4. mission_rewards (recompenses detaillees d'une mission)
CREATE TABLE IF NOT EXISTS public.mission_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id TEXT NOT NULL REFERENCES public.learning_missions(id) ON DELETE CASCADE,
  xp INTEGER NOT NULL DEFAULT 0,
  stars INTEGER NOT NULL DEFAULT 0,
  badge TEXT,
  item TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (mission_id, badge, item)
);
CREATE INDEX IF NOT EXISTS idx_mission_rewards_mission ON public.mission_rewards(mission_id);

-- 5. child_mission_progress (avancee d'un enfant sur les missions)
CREATE TABLE IF NOT EXISTS public.child_mission_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  mission_id TEXT NOT NULL REFERENCES public.learning_missions(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('locked','available','in_progress','completed')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (child_id, mission_id)
);
CREATE INDEX IF NOT EXISTS idx_child_mission_progress_child ON public.child_mission_progress(child_id, mission_id);

-- 6. daily_missions (missions quotidiennes tournantes)
CREATE TABLE IF NOT EXISTS public.daily_missions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'COLORING',
  xp INTEGER NOT NULL DEFAULT 15,
  stars INTEGER NOT NULL DEFAULT 2,
  icon TEXT NOT NULL DEFAULT '🎯',
  day_key TEXT NOT NULL DEFAULT 'monday' CHECK (day_key IN ('monday','tuesday','wednesday','thursday','friday','saturday','sunday')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. weekly_missions (defis hebdomadaires)
CREATE TABLE IF NOT EXISTS public.weekly_missions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'CHALLENGE',
  xp INTEGER NOT NULL DEFAULT 50,
  stars INTEGER NOT NULL DEFAULT 5,
  badge TEXT,
  icon TEXT NOT NULL DEFAULT '🏆',
  week_offset INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. learning_statistics (stats + radar de competences)
CREATE TABLE IF NOT EXISTS public.learning_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  creativity INTEGER NOT NULL DEFAULT 0 CHECK (creativity >= 0 AND creativity <= 100),
  reading INTEGER NOT NULL DEFAULT 0 CHECK (reading >= 0 AND reading <= 100),
  observation INTEGER NOT NULL DEFAULT 0 CHECK (observation >= 0 AND observation <= 100),
  logic INTEGER NOT NULL DEFAULT 0 CHECK (logic >= 0 AND logic <= 100),
  perseverance INTEGER NOT NULL DEFAULT 0 CHECK (perseverance >= 0 AND perseverance <= 100),
  imagination INTEGER NOT NULL DEFAULT 0 CHECK (imagination >= 0 AND imagination <= 100),
  total_xp INTEGER NOT NULL DEFAULT 0,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  missions_completed INTEGER NOT NULL DEFAULT 0,
  regions_unlocked INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (child_id)
);
CREATE INDEX IF NOT EXISTS idx_learning_statistics_child ON public.learning_statistics(child_id);

-- RLS
ALTER TABLE public.learning_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_mission_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_statistics ENABLE ROW LEVEL SECURITY;

-- Tables canoniques : lecture publique, ecriture reservee aux parents authentifies
DROP POLICY IF EXISTS "learning_regions_select_all" ON public.learning_regions;
CREATE POLICY "learning_regions_select_all" ON public.learning_regions FOR SELECT USING (true);
DROP POLICY IF EXISTS "learning_regions_insert_auth" ON public.learning_regions;
CREATE POLICY "learning_regions_insert_auth" ON public.learning_regions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "learning_regions_update_auth" ON public.learning_regions;
CREATE POLICY "learning_regions_update_auth" ON public.learning_regions FOR UPDATE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "learning_levels_select_all" ON public.learning_levels;
CREATE POLICY "learning_levels_select_all" ON public.learning_levels FOR SELECT USING (true);
DROP POLICY IF EXISTS "learning_levels_insert_auth" ON public.learning_levels;
CREATE POLICY "learning_levels_insert_auth" ON public.learning_levels FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "learning_levels_update_auth" ON public.learning_levels;
CREATE POLICY "learning_levels_update_auth" ON public.learning_levels FOR UPDATE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "learning_missions_select_all" ON public.learning_missions;
CREATE POLICY "learning_missions_select_all" ON public.learning_missions FOR SELECT USING (true);
DROP POLICY IF EXISTS "learning_missions_insert_auth" ON public.learning_missions;
CREATE POLICY "learning_missions_insert_auth" ON public.learning_missions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "learning_missions_update_auth" ON public.learning_missions;
CREATE POLICY "learning_missions_update_auth" ON public.learning_missions FOR UPDATE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "mission_rewards_select_all" ON public.mission_rewards;
CREATE POLICY "mission_rewards_select_all" ON public.mission_rewards FOR SELECT USING (true);
DROP POLICY IF EXISTS "mission_rewards_insert_auth" ON public.mission_rewards;
CREATE POLICY "mission_rewards_insert_auth" ON public.mission_rewards FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "daily_missions_select_all" ON public.daily_missions;
CREATE POLICY "daily_missions_select_all" ON public.daily_missions FOR SELECT USING (true);
DROP POLICY IF EXISTS "daily_missions_insert_auth" ON public.daily_missions;
CREATE POLICY "daily_missions_insert_auth" ON public.daily_missions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "weekly_missions_select_all" ON public.weekly_missions;
CREATE POLICY "weekly_missions_select_all" ON public.weekly_missions FOR SELECT USING (true);
DROP POLICY IF EXISTS "weekly_missions_insert_auth" ON public.weekly_missions;
CREATE POLICY "weekly_missions_insert_auth" ON public.weekly_missions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Donnees enfant : lecture + ecriture par le parent proprietaire
DROP POLICY IF EXISTS "child_mission_progress_select_own" ON public.child_mission_progress;
CREATE POLICY "child_mission_progress_select_own"
  ON public.child_mission_progress FOR SELECT
  USING (public.child_belongs_to_user(child_id));
DROP POLICY IF EXISTS "child_mission_progress_insert_own" ON public.child_mission_progress;
CREATE POLICY "child_mission_progress_insert_own"
  ON public.child_mission_progress FOR INSERT
  WITH CHECK (public.child_belongs_to_user(child_id));
DROP POLICY IF EXISTS "child_mission_progress_update_own" ON public.child_mission_progress;
CREATE POLICY "child_mission_progress_update_own"
  ON public.child_mission_progress FOR UPDATE
  USING (public.child_belongs_to_user(child_id));

DROP POLICY IF EXISTS "learning_statistics_select_own" ON public.learning_statistics;
CREATE POLICY "learning_statistics_select_own"
  ON public.learning_statistics FOR SELECT
  USING (public.child_belongs_to_user(child_id));
DROP POLICY IF EXISTS "learning_statistics_insert_own" ON public.learning_statistics;
CREATE POLICY "learning_statistics_insert_own"
  ON public.learning_statistics FOR INSERT
  WITH CHECK (public.child_belongs_to_user(child_id));
DROP POLICY IF EXISTS "learning_statistics_update_own" ON public.learning_statistics;
CREATE POLICY "learning_statistics_update_own"
  ON public.learning_statistics FOR UPDATE
  USING (public.child_belongs_to_user(child_id));
