-- 24_memory_books.sql
-- Table et politiques RLS pour « Mon cahier de souvenirs »

CREATE TABLE IF NOT EXISTS public.memory_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL DEFAULT 'school_memory_book_v1',
  title TEXT NOT NULL DEFAULT 'Mon Cahier de Souvenirs',
  school_year TEXT DEFAULT '2025-2026',
  theme TEXT DEFAULT 'savane',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed')),
  cover_color TEXT DEFAULT '#7D6AF8',
  pages_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index pour accélérer les requêtes par profil enfant
CREATE INDEX IF NOT EXISTS idx_memory_books_profile_id ON public.memory_books(profile_id);

-- Activation de RLS
ALTER TABLE public.memory_books ENABLE ROW LEVEL SECURITY;

-- Politiques RLS sécurisées basées sur le compte parent
DROP POLICY IF EXISTS "L'utilisateur peut lire les cahiers de souvenirs de sa famille" ON public.memory_books;
CREATE POLICY "L'utilisateur peut lire les cahiers de souvenirs de sa famille" ON public.memory_books
  FOR SELECT USING (
    profile_id IN (
      SELECT cp.id FROM public.child_profiles cp
      JOIN public.accounts acc ON cp.account_id = acc.id
      WHERE acc.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "L'utilisateur peut insérer les cahiers de souvenirs de sa famille" ON public.memory_books;
CREATE POLICY "L'utilisateur peut insérer les cahiers de souvenirs de sa famille" ON public.memory_books
  FOR INSERT WITH CHECK (
    profile_id IN (
      SELECT cp.id FROM public.child_profiles cp
      JOIN public.accounts acc ON cp.account_id = acc.id
      WHERE acc.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "L'utilisateur peut modifier les cahiers de souvenirs de sa famille" ON public.memory_books;
CREATE POLICY "L'utilisateur peut modifier les cahiers de souvenirs de sa famille" ON public.memory_books
  FOR UPDATE USING (
    profile_id IN (
      SELECT cp.id FROM public.child_profiles cp
      JOIN public.accounts acc ON cp.account_id = acc.id
      WHERE acc.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "L'utilisateur peut supprimer les cahiers de souvenirs de sa famille" ON public.memory_books;
CREATE POLICY "L'utilisateur peut supprimer les cahiers de souvenirs de sa famille" ON public.memory_books
  FOR DELETE USING (
    profile_id IN (
      SELECT cp.id FROM public.child_profiles cp
      JOIN public.accounts acc ON cp.account_id = acc.id
      WHERE acc.user_id = auth.uid()
    )
  );
