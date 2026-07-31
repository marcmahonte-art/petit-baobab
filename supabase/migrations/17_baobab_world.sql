-- ============================================================
-- Petit Baobab — Le Baobab Vivant (monde persistant par enfant)
-- ============================================================
-- ▸ À exécuter dans : Supabase Dashboard → SQL Editor → New Query
-- ▸ Projet : https://supabase.com/dashboard/project/bsepfqpjomrtveavbfib
-- ============================================================

-- 1. child_world (état du monde d'un enfant)
CREATE TABLE IF NOT EXISTS public.child_world (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE UNIQUE,
  tree_level INTEGER NOT NULL DEFAULT 1 CHECK (tree_level >= 1 AND tree_level <= 30),
  world_level INTEGER NOT NULL DEFAULT 1 CHECK (world_level >= 1),
  background_theme TEXT NOT NULL DEFAULT 'savane',
  weather TEXT NOT NULL DEFAULT 'sunny' CHECK (weather IN ('sunny', 'cloudy', 'rain', 'rainbow', 'windy', 'starry')),
  season TEXT NOT NULL DEFAULT 'dry' CHECK (season IN ('dry', 'rainy', 'spring', 'autumn', 'christmas', 'halloween', 'school', 'holidays')),
  last_growth_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_child_world_child ON public.child_world(child_id);

-- 2. world_objects (objets, animaux, décorations débloqués)
CREATE TABLE IF NOT EXISTS public.world_objects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  object_type TEXT NOT NULL,
  object_key TEXT NOT NULL,
  position_x DOUBLE PRECISION NOT NULL DEFAULT 50,
  position_y DOUBLE PRECISION NOT NULL DEFAULT 50,
  rotation DOUBLE PRECISION NOT NULL DEFAULT 0,
  scale DOUBLE PRECISION NOT NULL DEFAULT 1,
  is_unlocked BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (child_id, object_type)
);

CREATE INDEX IF NOT EXISTS idx_world_objects_child ON public.world_objects(child_id);

-- 3. world_history (souvenirs / grandes étapes)
CREATE TABLE IF NOT EXISTS public.world_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_world_history_child ON public.world_history(child_id, created_at DESC);

-- 4. world_captures (images souvenirs — album annuel futur)
CREATE TABLE IF NOT EXISTS public.world_captures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  image_url TEXT,
  image_data TEXT,
  caption TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_world_captures_child ON public.world_captures(child_id, created_at DESC);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_child_world_updated ON public.child_world;
CREATE TRIGGER trg_child_world_updated
  BEFORE UPDATE ON public.child_world
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

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
ALTER TABLE public.child_world ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.world_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.world_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.world_captures ENABLE ROW LEVEL SECURITY;

-- child_world
DROP POLICY IF EXISTS "child_world_select_own" ON public.child_world;
CREATE POLICY "child_world_select_own"
  ON public.child_world FOR SELECT
  USING (public.child_belongs_to_user(child_id));

DROP POLICY IF EXISTS "child_world_insert_own" ON public.child_world;
CREATE POLICY "child_world_insert_own"
  ON public.child_world FOR INSERT
  WITH CHECK (public.child_belongs_to_user(child_id));

DROP POLICY IF EXISTS "child_world_update_own" ON public.child_world;
CREATE POLICY "child_world_update_own"
  ON public.child_world FOR UPDATE
  USING (public.child_belongs_to_user(child_id));

-- world_objects
DROP POLICY IF EXISTS "world_objects_select_own" ON public.world_objects;
CREATE POLICY "world_objects_select_own"
  ON public.world_objects FOR SELECT
  USING (public.child_belongs_to_user(child_id));

DROP POLICY IF EXISTS "world_objects_insert_own" ON public.world_objects;
CREATE POLICY "world_objects_insert_own"
  ON public.world_objects FOR INSERT
  WITH CHECK (public.child_belongs_to_user(child_id));

DROP POLICY IF EXISTS "world_objects_update_own" ON public.world_objects;
CREATE POLICY "world_objects_update_own"
  ON public.world_objects FOR UPDATE
  USING (public.child_belongs_to_user(child_id));

-- world_history
DROP POLICY IF EXISTS "world_history_select_own" ON public.world_history;
CREATE POLICY "world_history_select_own"
  ON public.world_history FOR SELECT
  USING (public.child_belongs_to_user(child_id));

DROP POLICY IF EXISTS "world_history_insert_own" ON public.world_history;
CREATE POLICY "world_history_insert_own"
  ON public.world_history FOR INSERT
  WITH CHECK (public.child_belongs_to_user(child_id));

-- world_captures
DROP POLICY IF EXISTS "world_captures_select_own" ON public.world_captures;
CREATE POLICY "world_captures_select_own"
  ON public.world_captures FOR SELECT
  USING (public.child_belongs_to_user(child_id));

DROP POLICY IF EXISTS "world_captures_insert_own" ON public.world_captures;
CREATE POLICY "world_captures_insert_own"
  ON public.world_captures FOR INSERT
  WITH CHECK (public.child_belongs_to_user(child_id));
