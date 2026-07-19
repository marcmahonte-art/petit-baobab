-- ============================================================
-- Petit Baobab — Champs école sur accounts (nom + WhatsApp)
-- À exécuter dans le SQL Editor Supabase (droits admin/service role).
-- Idempotent.
-- ============================================================

ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS school_name TEXT,
  ADD COLUMN IF NOT EXISTS school_whatsapp TEXT;
