-- ============================================================
-- Petit Baobab — Système de rétention (missions, calendrier, saisons, battle pass)
-- ============================================================
-- ▸ À exécuter dans : Supabase Dashboard → SQL Editor → New Query
-- ▸ Projet : https://supabase.com/dashboard/project/bsepfqpjomrtveavbfib
-- ============================================================

-- 1. daily_missions (définitions canoniques des missions quotidiennes)
CREATE TABLE IF NOT EXISTS public.daily_missions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🎯',
  event TEXT NOT NULL,
  target INTEGER NOT NULL CHECK (target > 0),
  reward_xp INTEGER NOT NULL DEFAULT 0 CHECK (reward_xp >= 0),
  reward_stars INTEGER NOT NULL DEFAULT 0 CHECK (reward_stars >= 0),
  reward_item TEXT,
  reward_badge TEXT,
  difficulty TEXT NOT NULL DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. child_daily_progress (progression d'un enfant sur les missions du jour)
CREATE TABLE IF NOT EXISTS public.child_daily_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  mission_id TEXT NOT NULL,
  progress_date DATE NOT NULL DEFAULT CURRENT_DATE,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0),
  completed BOOLEAN NOT NULL DEFAULT false,
  claimed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (child_id, mission_id, progress_date)
);

-- 3. weekly_missions (définitions canoniques des missions hebdomadaires)
CREATE TABLE IF NOT EXISTS public.weekly_missions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🎯',
  event TEXT NOT NULL,
  target INTEGER NOT NULL CHECK (target > 0),
  reward_xp INTEGER NOT NULL DEFAULT 0 CHECK (reward_xp >= 0),
  reward_stars INTEGER NOT NULL DEFAULT 0 CHECK (reward_stars >= 0),
  reward_item TEXT,
  reward_badge TEXT,
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. child_weekly_progress (progression d'un enfant sur la semaine)
CREATE TABLE IF NOT EXISTS public.child_weekly_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  mission_id TEXT NOT NULL,
  active_week DATE NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0),
  completed BOOLEAN NOT NULL DEFAULT false,
  claimed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (child_id, mission_id, active_week)
);

-- 5. child_missions (missions générées et attribuées à un enfant — table pivot utilisée par le service)
CREATE TABLE IF NOT EXISTS public.child_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  mission_id TEXT NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🎯',
  event TEXT NOT NULL,
  target INTEGER NOT NULL CHECK (target > 0),
  reward_xp INTEGER NOT NULL DEFAULT 0 CHECK (reward_xp >= 0),
  reward_stars INTEGER NOT NULL DEFAULT 0 CHECK (reward_stars >= 0),
  reward_item TEXT,
  reward_badge TEXT,
  difficulty TEXT NOT NULL DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  active_date DATE,
  active_week DATE,
  active_month TEXT,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (child_id, mission_id)
);

-- 6. season_events (saisons)
CREATE TABLE IF NOT EXISTS public.season_events (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  theme TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  banner TEXT,
  primary_color TEXT NOT NULL DEFAULT '#FF8A00',
  secondary_color TEXT NOT NULL DEFAULT '#FFD95C',
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. season_rewards (récompenses par palier de saison)
CREATE TABLE IF NOT EXISTS public.season_rewards (
  id TEXT PRIMARY KEY,
  season_id TEXT NOT NULL REFERENCES public.season_events(id) ON DELETE CASCADE,
  level INTEGER NOT NULL CHECK (level >= 1),
  reward_type TEXT NOT NULL CHECK (reward_type IN ('background', 'sticker', 'frame', 'mascot', 'book', 'stars', 'avatar', 'animation')),
  reward_key TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (season_id, level)
);

-- 8. calendar_chests (coffres du calendrier de connexion)
CREATE TABLE IF NOT EXISTS public.calendar_chests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  chest_id TEXT NOT NULL CHECK (chest_id IN ('bronze', 'silver', 'gold', 'diamond', 'legendary', 'none')),
  day INTEGER NOT NULL CHECK (day >= 1),
  claimed BOOLEAN NOT NULL DEFAULT false,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (child_id, day)
);

-- 9. battle_pass_state (état du battle pass par enfant et saison)
CREATE TABLE IF NOT EXISTS public.battle_pass_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  season_id TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
  xp INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
  premium BOOLEAN NOT NULL DEFAULT false,
  claimed_free TEXT[] NOT NULL DEFAULT '{}',
  claimed_premium TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (child_id, season_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_child_daily_progress_child ON public.child_daily_progress(child_id, progress_date);
CREATE INDEX IF NOT EXISTS idx_child_weekly_progress_child ON public.child_weekly_progress(child_id, active_week);
CREATE INDEX IF NOT EXISTS idx_child_missions_child ON public.child_missions(child_id, period);
CREATE INDEX IF NOT EXISTS idx_calendar_chests_child ON public.calendar_chests(child_id, day);
CREATE INDEX IF NOT EXISTS idx_battle_pass_child ON public.battle_pass_state(child_id, season_id);
CREATE INDEX IF NOT EXISTS idx_season_rewards_season ON public.season_rewards(season_id);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_battle_pass_updated ON public.battle_pass_state;
CREATE TRIGGER trg_battle_pass_updated
  BEFORE UPDATE ON public.battle_pass_state
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.daily_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_daily_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_weekly_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.season_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.season_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_chests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_pass_state ENABLE ROW LEVEL SECURITY;

-- Les définitions canoniques (missions quotidiennes/hebdo, saisons, récompenses) sont publiques en lecture
DROP POLICY IF EXISTS "daily_missions_read_all" ON public.daily_missions;
CREATE POLICY "daily_missions_read_all" ON public.daily_missions FOR SELECT USING (true);

DROP POLICY IF EXISTS "weekly_missions_read_all" ON public.weekly_missions;
CREATE POLICY "weekly_missions_read_all" ON public.weekly_missions FOR SELECT USING (true);

DROP POLICY IF EXISTS "season_events_read_all" ON public.season_events;
CREATE POLICY "season_events_read_all" ON public.season_events FOR SELECT USING (true);

DROP POLICY IF EXISTS "season_rewards_read_all" ON public.season_rewards;
CREATE POLICY "season_rewards_read_all" ON public.season_rewards FOR SELECT USING (true);

-- Helper RLS : vérifie que le child_id appartient au compte du user connecté
CREATE OR REPLACE FUNCTION public.child_belongs_to_user(p_child_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.child_profiles cp
    JOIN public.accounts a ON a.id = cp.account_id
    WHERE cp.id = p_child_id AND a.user_id = auth.uid()
  );
$$ LANGUAGE sql STABLE;

-- child_missions : lecture + insertion par le parent
DROP POLICY IF EXISTS "child_missions_select_own" ON public.child_missions;
CREATE POLICY "child_missions_select_own"
  ON public.child_missions FOR SELECT
  USING (public.child_belongs_to_user(child_id));

DROP POLICY IF EXISTS "child_missions_insert_own" ON public.child_missions;
CREATE POLICY "child_missions_insert_own"
  ON public.child_missions FOR INSERT
  WITH CHECK (public.child_belongs_to_user(child_id));

DROP POLICY IF EXISTS "child_missions_update_own" ON public.child_missions;
CREATE POLICY "child_missions_update_own"
  ON public.child_missions FOR UPDATE
  USING (public.child_belongs_to_user(child_id));

-- child_daily_progress
DROP POLICY IF EXISTS "child_daily_progress_select_own" ON public.child_daily_progress;
CREATE POLICY "child_daily_progress_select_own"
  ON public.child_daily_progress FOR SELECT
  USING (public.child_belongs_to_user(child_id));

DROP POLICY IF EXISTS "child_daily_progress_insert_own" ON public.child_daily_progress;
CREATE POLICY "child_daily_progress_insert_own"
  ON public.child_daily_progress FOR INSERT
  WITH CHECK (public.child_belongs_to_user(child_id));

DROP POLICY IF EXISTS "child_daily_progress_update_own" ON public.child_daily_progress;
CREATE POLICY "child_daily_progress_update_own"
  ON public.child_daily_progress FOR UPDATE
  USING (public.child_belongs_to_user(child_id));

-- child_weekly_progress
DROP POLICY IF EXISTS "child_weekly_progress_select_own" ON public.child_weekly_progress;
CREATE POLICY "child_weekly_progress_select_own"
  ON public.child_weekly_progress FOR SELECT
  USING (public.child_belongs_to_user(child_id));

DROP POLICY IF EXISTS "child_weekly_progress_insert_own" ON public.child_weekly_progress;
CREATE POLICY "child_weekly_progress_insert_own"
  ON public.child_weekly_progress FOR INSERT
  WITH CHECK (public.child_belongs_to_user(child_id));

DROP POLICY IF EXISTS "child_weekly_progress_update_own" ON public.child_weekly_progress;
CREATE POLICY "child_weekly_progress_update_own"
  ON public.child_weekly_progress FOR UPDATE
  USING (public.child_belongs_to_user(child_id));

-- calendar_chests
DROP POLICY IF EXISTS "calendar_chests_select_own" ON public.calendar_chests;
CREATE POLICY "calendar_chests_select_own"
  ON public.calendar_chests FOR SELECT
  USING (public.child_belongs_to_user(child_id));

DROP POLICY IF EXISTS "calendar_chests_insert_own" ON public.calendar_chests;
CREATE POLICY "calendar_chests_insert_own"
  ON public.calendar_chests FOR INSERT
  WITH CHECK (public.child_belongs_to_user(child_id));

DROP POLICY IF EXISTS "calendar_chests_update_own" ON public.calendar_chests;
CREATE POLICY "calendar_chests_update_own"
  ON public.calendar_chests FOR UPDATE
  USING (public.child_belongs_to_user(child_id));

-- battle_pass_state
DROP POLICY IF EXISTS "battle_pass_select_own" ON public.battle_pass_state;
CREATE POLICY "battle_pass_select_own"
  ON public.battle_pass_state FOR SELECT
  USING (public.child_belongs_to_user(child_id));

DROP POLICY IF EXISTS "battle_pass_insert_own" ON public.battle_pass_state;
CREATE POLICY "battle_pass_insert_own"
  ON public.battle_pass_state FOR INSERT
  WITH CHECK (public.child_belongs_to_user(child_id));

DROP POLICY IF EXISTS "battle_pass_update_own" ON public.battle_pass_state;
CREATE POLICY "battle_pass_update_own"
  ON public.battle_pass_state FOR UPDATE
  USING (public.child_belongs_to_user(child_id));

-- ============================================================
-- Seed des saisons 2026 (Septembre La rentrée → Juin Les vacances)
-- ============================================================
INSERT INTO public.season_events (id, name, slug, theme, starts_at, ends_at, banner, primary_color, secondary_color, is_active)
VALUES
  ('season_rentree', 'La rentrée', 'rentree', 'retour à l''école', '2026-09-01T00:00:00Z', '2026-09-30T23:59:59Z', '/seasons/rentree.webp', '#FF8A00', '#FFD95C', false),
  ('season_animaux-afrique', 'Les animaux d''Afrique', 'animaux-afrique', 'savane et animaux', '2026-10-01T00:00:00Z', '2026-10-31T23:59:59Z', '/seasons/animaux.webp', '#FF6B35', '#FFD95C', false),
  ('season_metiers', 'Les métiers', 'metiers', 'découverte des métiers', '2026-11-01T00:00:00Z', '2026-11-30T23:59:59Z', '/seasons/metiers.webp', '#1D9E75', '#8BC34A', false),
  ('season_noel', 'Noël', 'noel', 'magie de Noël', '2026-12-01T00:00:00Z', '2026-12-31T23:59:59Z', '/seasons/noel.webp', '#E63946', '#FFD95C', false),
  ('season_monde', 'Le monde', 'monde', 'voyage autour du monde', '2026-01-01T00:00:00Z', '2026-01-31T23:59:59Z', '/seasons/monde.webp', '#1194FF', '#8BC34A', false),
  ('season_emotions', 'Les émotions', 'emotions', 'comprendre les émotions', '2026-02-01T00:00:00Z', '2026-02-28T23:59:59Z', '/seasons/emotions.webp', '#FF5E83', '#FFD95C', false),
  ('season_plantes', 'Les plantes', 'plantes', 'la nature et les plantes', '2026-03-01T00:00:00Z', '2026-03-31T23:59:59Z', '/seasons/plantes.webp', '#8BC34A', '#1D9E75', false),
  ('season_oceans', 'Les océans', 'oceans', 'la vie sous-marine', '2026-04-01T00:00:00Z', '2026-04-30T23:59:59Z', '/seasons/oceans.webp', '#00B4D8', '#1194FF', false),
  ('season_transports', 'Les transports', 'transports', 'tous les transports', '2026-05-01T00:00:00Z', '2026-05-31T23:59:59Z', '/seasons/transports.webp', '#FFB300', '#FF8A00', false),
  ('season_vacances', 'Les vacances', 'vacances', 'l''été et les vacances', '2026-06-01T00:00:00Z', '2026-06-30T23:59:59Z', '/seasons/vacances.webp', '#FF8A00', '#FFD95C', false)
ON CONFLICT (id) DO NOTHING;
