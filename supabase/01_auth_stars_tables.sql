-- ============================================================
-- Petit Baobab — Authentification & Gestion des Étoiles (Correction)
-- ============================================================
-- Ce script configure les tables de profils, comptes parents,
-- profils enfants, dessins IA, livres et historique des transactions.
--
-- ▸ À exécuter dans : Supabase Dashboard → SQL Editor → New Query
-- ▸ Projet : https://supabase.com/dashboard/project/bsepfqpjomrtveavbfib
-- ============================================================

-- Activer l'extension uuid-ossp si nécessaire
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ────────────────────────────────────────────────────────────
-- 1. CRÉATION DES TABLES
-- ────────────────────────────────────────────────────────────

-- Table: public.profiles (Étend auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  locale TEXT DEFAULT 'fr' CHECK (locale IN ('fr', 'en')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: public.accounts (Un compte parent = un foyer)
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  stars_balance INTEGER DEFAULT 0 CHECK (stars_balance >= 0),
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'decouverte', 'super_baobab', 'ecole_pro')),
  plan_renewed_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: public.child_profiles (Profils enfants)
CREATE TABLE IF NOT EXISTS public.child_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  mascot TEXT DEFAULT 'awa' CHECK (mascot IN ('awa', 'lion', 'robot')),
  pin_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Renommer public.drawings en public.saved_drawings si elle existe et saved_drawings n'existe pas
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'drawings') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'saved_drawings') THEN
      ALTER TABLE public.drawings RENAME TO saved_drawings;
    ELSE
      DROP TABLE IF EXISTS public.drawings CASCADE;
    END IF;
  END IF;
END $$;

-- Table: public.saved_drawings (Historique des dessins magiques / coloriages)
CREATE TABLE IF NOT EXISTS public.saved_drawings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  origin TEXT NOT NULL CHECK (origin IN ('coloriage', 'ia')),
  style TEXT NOT NULL,
  stars_cost INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('en_cours', 'terminé', 'erreur', 'in_progress', 'completed', 'error')),
  name TEXT NOT NULL DEFAULT 'Dessin sans titre',
  model_name TEXT,
  is_colored BOOLEAN DEFAULT false,
  thumbnail TEXT,
  template JSONB DEFAULT '{}'::jsonb,
  state JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- S'assurer que les nouvelles colonnes sont présentes sur saved_drawings si elle existait déjà
ALTER TABLE public.saved_drawings ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT 'Dessin sans titre';
ALTER TABLE public.saved_drawings ADD COLUMN IF NOT EXISTS model_name TEXT;
ALTER TABLE public.saved_drawings ADD COLUMN IF NOT EXISTS is_colored BOOLEAN DEFAULT false;
ALTER TABLE public.saved_drawings ADD COLUMN IF NOT EXISTS thumbnail TEXT;
ALTER TABLE public.saved_drawings ADD COLUMN IF NOT EXISTS template JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.saved_drawings ADD COLUMN IF NOT EXISTS state JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.saved_drawings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Table: public.books (Livres créés par les enfants)
-- NOTE : On supprime l'ancienne table de livres créée potentiellement avec un profile_id TEXT dans setup-supabase-storage.sql pour forcer le bon type UUID
DROP TABLE IF EXISTS public.books CASCADE;

CREATE TABLE IF NOT EXISTS public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  author TEXT DEFAULT 'Anonyme',
  child_name TEXT,
  cover TEXT,
  palette TEXT,
  style TEXT,
  frame TEXT,
  format TEXT,
  orientation TEXT,
  pages JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL CHECK (status IN ('draft', 'finalized')),
  pdf_url TEXT,
  cover_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: public.stars_transactions (Historique des mouvements d'étoiles)
CREATE TABLE IF NOT EXISTS public.stars_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('signup_bonus', 'generation', 'refund', 'purchase', 'subscription_renewal', 'admin_grant')),
  reference_id UUID DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 2. DÉCLENCHEUR DE CRÉATION AUTOMATIQUE (TRIGGER)
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_account_id UUID;
  email_display_name TEXT;
  username TEXT;
BEGIN
  -- Extraire un joli nom par défaut de l'adresse e-mail
  username := split_part(new.email, '@', 1);
  email_display_name := initcap(replace(replace(replace(username, '.', ' '), '_', ' '), '-', ' '));
  IF email_display_name IS NULL OR email_display_name = '' THEN
    email_display_name := 'Mon Enfant';
  END IF;

  -- 1. Créer le profil public
  INSERT INTO public.profiles (id, email, locale)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'locale', 'fr')
  )
  ON CONFLICT (id) DO NOTHING;

  -- 2. Créer le compte parent (crédité de 5 étoiles par défaut)
  INSERT INTO public.accounts (user_id, stars_balance, plan)
  VALUES (new.id, 5, 'free')
  ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id
  RETURNING id INTO new_account_id;

  -- Si un compte existait déjà et n'a pas été inséré (ex: ré-inscription),
  -- on récupère l'identifiant existant.
  IF new_account_id IS NULL THEN
    SELECT id INTO new_account_id FROM public.accounts WHERE user_id = new.id;
  END IF;

  -- 3. Enregistrer le bonus de bienvenue (+5 étoiles) s'il n'existe pas déjà
  IF NOT EXISTS (
    SELECT 1 FROM public.stars_transactions 
    WHERE account_id = new_account_id AND reason = 'signup_bonus'
  ) THEN
    INSERT INTO public.stars_transactions (account_id, amount, reason, reference_id)
    VALUES (new_account_id, 5, 'signup_bonus', null);
  END IF;

  -- 4. Créer le profil enfant initial si aucun n'existe
  IF NOT EXISTS (
    SELECT 1 FROM public.child_profiles WHERE account_id = new_account_id
  ) THEN
    INSERT INTO public.child_profiles (account_id, name, mascot, pin_required)
    VALUES (new_account_id, email_display_name, 'awa', false);
  END IF;

  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Évite de bloquer la création du compte auth en cas d'erreur de script public
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enregistrer le déclencheur
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ────────────────────────────────────────────────────────────
-- 2b. FONCTION TRANSACTIONNELLE D'AJUSTEMENT DES ÉTOILES
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.adjust_stars(
  p_account_id UUID,
  p_amount INTEGER,
  p_reason TEXT,
  p_reference_id UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  -- Mettre à jour le solde du compte
  UPDATE public.accounts
  SET stars_balance = stars_balance + p_amount
  WHERE id = p_account_id
  RETURNING stars_balance INTO v_new_balance;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Compte % introuvable', p_account_id;
  END IF;

  -- Vérifier que le solde ne devienne pas négatif
  IF v_new_balance < 0 THEN
    RAISE EXCEPTION 'Solde d''étoiles insuffisant.';
  END IF;

  -- Insérer la transaction d'historique
  INSERT INTO public.stars_transactions (account_id, amount, reason, reference_id)
  VALUES (p_account_id, p_amount, p_reason, p_reference_id);

  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ────────────────────────────────────────────────────────────
-- 3. SÉCURITÉ ET RLS (ROW LEVEL SECURITY)
-- ────────────────────────────────────────────────────────────

-- Activer la sécurité RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_drawings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stars_transactions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS: profiles
DROP POLICY IF EXISTS "L'utilisateur peut lire son propre profil" ON public.profiles;
CREATE POLICY "L'utilisateur peut lire son propre profil" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "L'utilisateur peut mettre à jour son propre profil" ON public.profiles;
CREATE POLICY "L'utilisateur peut mettre à jour son propre profil" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Politiques RLS: accounts
DROP POLICY IF EXISTS "L'utilisateur peut lire son propre compte familial" ON public.accounts;
CREATE POLICY "L'utilisateur peut lire son propre compte familial" ON public.accounts
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "L'utilisateur peut modifier son propre compte familial" ON public.accounts;
CREATE POLICY "L'utilisateur peut modifier son propre compte familial" ON public.accounts
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "L'utilisateur peut créer son propre compte familial" ON public.accounts;
CREATE POLICY "L'utilisateur peut créer son propre compte familial" ON public.accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politiques RLS: child_profiles
DROP POLICY IF EXISTS "L'utilisateur peut lire les profils enfants de sa famille" ON public.child_profiles;
CREATE POLICY "L'utilisateur peut lire les profils enfants de sa famille" ON public.child_profiles
  FOR SELECT USING (
    account_id IN (SELECT id FROM public.accounts WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "L'utilisateur peut modifier les profils enfants de sa famille" ON public.child_profiles;
CREATE POLICY "L'utilisateur peut modifier les profils enfants de sa famille" ON public.child_profiles
  FOR ALL USING (
    account_id IN (SELECT id FROM public.accounts WHERE user_id = auth.uid())
  );

-- Politiques RLS: saved_drawings
DROP POLICY IF EXISTS "L'utilisateur peut lire les dessins de sa famille" ON public.saved_drawings;
CREATE POLICY "L'utilisateur peut lire les dessins de sa famille" ON public.saved_drawings
  FOR SELECT USING (
    profile_id IN (
      SELECT cp.id FROM public.child_profiles cp
      JOIN public.accounts acc ON cp.account_id = acc.id
      WHERE acc.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "L'utilisateur peut modifier les dessins de sa famille" ON public.saved_drawings;
CREATE POLICY "L'utilisateur peut modifier les dessins de sa famille" ON public.saved_drawings
  FOR ALL USING (
    profile_id IN (
      SELECT cp.id FROM public.child_profiles cp
      JOIN public.accounts acc ON cp.account_id = acc.id
      WHERE acc.user_id = auth.uid()
    )
  );

-- Politiques RLS: books
DROP POLICY IF EXISTS "L'utilisateur peut lire les livres de sa famille" ON public.books;
CREATE POLICY "L'utilisateur peut lire les livres de sa famille" ON public.books
  FOR SELECT USING (
    profile_id IN (
      SELECT cp.id FROM public.child_profiles cp
      JOIN public.accounts acc ON cp.account_id = acc.id
      WHERE acc.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "L'utilisateur peut modifier les livres de sa famille" ON public.books;
CREATE POLICY "L'utilisateur peut modifier les livres de sa famille" ON public.books
  FOR ALL USING (
    profile_id IN (
      SELECT cp.id FROM public.child_profiles cp
      JOIN public.accounts acc ON cp.account_id = acc.id
      WHERE acc.user_id = auth.uid()
    )
  );

-- Politiques RLS: stars_transactions
DROP POLICY IF EXISTS "L'utilisateur peut lire l'historique d'étoiles de sa famille" ON public.stars_transactions;
CREATE POLICY "L'utilisateur peut lire l'historique d'étoiles de sa famille" ON public.stars_transactions
  FOR SELECT USING (
    account_id IN (SELECT id FROM public.accounts WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "L'utilisateur peut créer des transactions pour son compte" ON public.stars_transactions;
CREATE POLICY "L'utilisateur peut créer des transactions pour son compte" ON public.stars_transactions
  FOR INSERT WITH CHECK (
    account_id IN (SELECT id FROM public.accounts WHERE user_id = auth.uid())
  );

-- ────────────────────────────────────────────────────────────
-- 4. INDEX DE PERFORMANCE
-- ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_child_profiles_account_id ON public.child_profiles(account_id);
CREATE INDEX IF NOT EXISTS idx_saved_drawings_profile_id ON public.saved_drawings(profile_id);
CREATE INDEX IF NOT EXISTS idx_books_profile_id ON public.books(profile_id);
CREATE INDEX IF NOT EXISTS idx_stars_transactions_account_id ON public.stars_transactions(account_id);
