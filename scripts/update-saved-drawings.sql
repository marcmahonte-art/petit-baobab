-- ============================================================
-- Petit Baobab — Mise à jour de la table saved_drawings
-- ============================================================
-- Ce script ajoute les colonnes manquantes (profile_id, origin, status, is_colored)
-- à la table "saved_drawings" et applique les politiques de sécurité (RLS).
--
-- ▸ À exécuter dans : Supabase Dashboard → SQL Editor → New Query
-- ▸ Projet : https://supabase.com/dashboard/project/bsepfqpjomrtveavbfib
-- ============================================================

-- 1. Ajouter les colonnes manquantes si elles n'existent pas et corriger les contraintes
ALTER TABLE public.saved_drawings 
ADD COLUMN IF NOT EXISTS origin TEXT CHECK (origin IN ('coloriage', 'ia')),
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('in_progress', 'completed', 'error')),
ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.child_profiles(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS is_colored BOOLEAN DEFAULT true;

-- Rendre la colonne progress nullable pour éviter les violations de contraintes
ALTER TABLE public.saved_drawings ALTER COLUMN progress DROP NOT NULL;

-- 2. Activer la sécurité RLS sur la table
ALTER TABLE public.saved_drawings ENABLE ROW LEVEL SECURITY;

-- 3. Politique de lecture publique ou par famille (lecture)
DROP POLICY IF EXISTS "L'utilisateur peut lire les dessins de sa famille sur saved_drawings" ON public.saved_drawings;
CREATE POLICY "L'utilisateur peut lire les dessins de sa famille sur saved_drawings" ON public.saved_drawings
  FOR SELECT USING (
    profile_id IN (
      SELECT cp.id FROM public.child_profiles cp
      JOIN public.accounts acc ON cp.account_id = acc.id
      WHERE acc.user_id = auth.uid()
    )
  );

-- 4. Politique de modification (écriture/mise à jour/suppression)
DROP POLICY IF EXISTS "L'utilisateur peut modifier les dessins de sa famille sur saved_drawings" ON public.saved_drawings;
CREATE POLICY "L'utilisateur peut modifier les dessins de sa famille sur saved_drawings" ON public.saved_drawings
  FOR ALL USING (
    profile_id IN (
      SELECT cp.id FROM public.child_profiles cp
      JOIN public.accounts acc ON cp.account_id = acc.id
      WHERE acc.user_id = auth.uid()
    )
  );
