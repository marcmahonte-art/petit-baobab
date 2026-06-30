-- ============================================================
-- Petit Baobab — Supabase Storage Setup
-- ============================================================
-- Ce script crée les buckets de stockage, les policies RLS,
-- et la table "books" pour les livres de coloriage.
--
-- ▸ Exécuter dans : Supabase Dashboard → SQL Editor → New Query
-- ▸ Projet : https://supabase.com/dashboard/project/bsepfqpjomrtveavbfib
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1. CRÉER LES BUCKETS
-- ────────────────────────────────────────────────────────────

-- Bucket "drawings" — dessins IA, coloriages, miniatures
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'drawings',
  'drawings',
  true,
  10485760,  -- 10 MB max par fichier
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

-- Bucket "books" — PDF des livres et captures de couvertures
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'books',
  'books',
  true,
  52428800,  -- 50 MB max par fichier (les PDF peuvent être lourds)
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];


-- ────────────────────────────────────────────────────────────
-- 2. POLICIES RLS — Bucket "drawings"
-- ────────────────────────────────────────────────────────────

-- Lecture publique (tout le monde peut voir les images)
CREATE POLICY "drawings_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'drawings');

-- Upload autorisé (anon + authenticated)
CREATE POLICY "drawings_public_insert"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'drawings');

-- Mise à jour autorisée (pour remplacement de fichiers)
CREATE POLICY "drawings_public_update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'drawings');

-- Suppression autorisée
CREATE POLICY "drawings_public_delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'drawings');


-- ────────────────────────────────────────────────────────────
-- 3. POLICIES RLS — Bucket "books"
-- ────────────────────────────────────────────────────────────

-- Lecture publique
CREATE POLICY "books_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'books');

-- Upload autorisé
CREATE POLICY "books_public_insert"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'books');

-- Mise à jour autorisée
CREATE POLICY "books_public_update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'books');

-- Suppression autorisée
CREATE POLICY "books_public_delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'books');


-- ────────────────────────────────────────────────────────────
-- 4. TABLE "books" — Métadonnées des livres de coloriage
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT 'Mon livre de coloriage',
  subtitle TEXT DEFAULT '',
  author TEXT DEFAULT '',
  child_name TEXT DEFAULT '',
  cover TEXT DEFAULT 'petit-baobab',
  palette TEXT DEFAULT 'Purple',
  style TEXT DEFAULT 'Contour simple',
  frame TEXT DEFAULT 'Nature',
  format TEXT DEFAULT 'A4',
  orientation TEXT DEFAULT 'Portrait',
  pages JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'finalized')),
  pdf_url TEXT DEFAULT '',
  cover_image_url TEXT DEFAULT '',
  profile_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour recherche par profil
CREATE INDEX IF NOT EXISTS idx_books_profile_id ON books (profile_id);
CREATE INDEX IF NOT EXISTS idx_books_status ON books (status);

-- RLS pour la table books
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "books_table_select"
ON books FOR SELECT USING (true);

CREATE POLICY "books_table_insert"
ON books FOR INSERT WITH CHECK (true);

CREATE POLICY "books_table_update"
ON books FOR UPDATE USING (true);

CREATE POLICY "books_table_delete"
ON books FOR DELETE USING (true);


-- ────────────────────────────────────────────────────────────
-- 5. VÉRIFICATION — Confirmer que tout est créé
-- ────────────────────────────────────────────────────────────

-- Vérifier les buckets
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id IN ('drawings', 'books');

-- Vérifier la table books
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'books'
ORDER BY ordinal_position;
