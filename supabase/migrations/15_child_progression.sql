-- ============================================================
-- Petit Baobab — Système de progression RPG
-- ============================================================
-- ▸ À exécuter dans : Supabase Dashboard → SQL Editor → New Query
-- ▸ Projet : https://supabase.com/dashboard/project/bsepfqpjomrtveavbfib
-- ============================================================

-- 1. Table child_progression
CREATE TABLE IF NOT EXISTS public.child_progression (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE UNIQUE,
  level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
  xp INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
  xp_total INTEGER NOT NULL DEFAULT 0 CHECK (xp_total >= 0),
  current_title TEXT NOT NULL DEFAULT 'Petite graine',
  avatar_frame TEXT,
  current_theme TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_child_progression_child_id ON public.child_progression(child_id);

-- 2. Table child_unlocks
CREATE TABLE IF NOT EXISTS public.child_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  unlock_type TEXT NOT NULL CHECK (unlock_type IN ('brush', 'mascot', 'background', 'book', 'palette', 'sticker', 'frame', 'animation', 'pack')),
  unlock_key TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'level_up',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_child_unlocks_child_id ON public.child_unlocks(child_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_child_unlocks_unique ON public.child_unlocks(child_id, unlock_type, unlock_key);

-- 3. Table child_inventory
CREATE TABLE IF NOT EXISTS public.child_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('mascot', 'frame', 'brush', 'color', 'sticker', 'badge', 'book', 'animation')),
  item_key TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_child_inventory_child_id ON public.child_inventory(child_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_child_inventory_unique ON public.child_inventory(child_id, item_type, item_key);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_child_progression_updated ON public.child_progression;
CREATE TRIGGER trg_child_progression_updated
  BEFORE UPDATE ON public.child_progression
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.child_progression ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_inventory ENABLE ROW LEVEL SECURITY;

-- Les parents voient les progressions de leurs enfants (via child_profiles → accounts → user_id)
DROP POLICY IF EXISTS "child_progression_select_own" ON public.child_progression;
CREATE POLICY "child_progression_select_own"
  ON public.child_progression FOR SELECT
  USING (
    child_id IN (
      SELECT cp.id FROM public.child_profiles cp
      JOIN public.accounts a ON a.id = cp.account_id
      WHERE a.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "child_progression_insert_own" ON public.child_progression;
CREATE POLICY "child_progression_insert_own"
  ON public.child_progression FOR INSERT
  WITH CHECK (
    child_id IN (
      SELECT cp.id FROM public.child_profiles cp
      JOIN public.accounts a ON a.id = cp.account_id
      WHERE a.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "child_progression_update_own" ON public.child_progression;
CREATE POLICY "child_progression_update_own"
  ON public.child_progression FOR UPDATE
  USING (
    child_id IN (
      SELECT cp.id FROM public.child_profiles cp
      JOIN public.accounts a ON a.id = cp.account_id
      WHERE a.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "child_unlocks_select_own" ON public.child_unlocks;
CREATE POLICY "child_unlocks_select_own"
  ON public.child_unlocks FOR SELECT
  USING (
    child_id IN (
      SELECT cp.id FROM public.child_profiles cp
      JOIN public.accounts a ON a.id = cp.account_id
      WHERE a.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "child_unlocks_insert_own" ON public.child_unlocks;
CREATE POLICY "child_unlocks_insert_own"
  ON public.child_unlocks FOR INSERT
  WITH CHECK (
    child_id IN (
      SELECT cp.id FROM public.child_profiles cp
      JOIN public.accounts a ON a.id = cp.account_id
      WHERE a.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "child_inventory_select_own" ON public.child_inventory;
CREATE POLICY "child_inventory_select_own"
  ON public.child_inventory FOR SELECT
  USING (
    child_id IN (
      SELECT cp.id FROM public.child_profiles cp
      JOIN public.accounts a ON a.id = cp.account_id
      WHERE a.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "child_inventory_insert_own" ON public.child_inventory;
CREATE POLICY "child_inventory_insert_own"
  ON public.child_inventory FOR INSERT
  WITH CHECK (
    child_id IN (
      SELECT cp.id FROM public.child_profiles cp
      JOIN public.accounts a ON a.id = cp.account_id
      WHERE a.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "child_inventory_update_own" ON public.child_inventory;
CREATE POLICY "child_inventory_update_own"
  ON public.child_inventory FOR UPDATE
  USING (
    child_id IN (
      SELECT cp.id FROM public.child_profiles cp
      JOIN public.accounts a ON a.id = cp.account_id
      WHERE a.user_id = auth.uid()
    )
  );
