-- ============================================================
-- Petit Baobab — Espace par défaut persistant (P2-8)
-- ============================================================
-- Le callback OAuth (server-to-server) ne peut pas lire le localStorage
-- côté client. On persiste donc le choix "espace par défaut" côté serveur
-- via une colonne sur accounts, lue directement par le callback.
-- Valeurs possibles : 'family' | 'school' (NULL = pas de préférence).
-- ============================================================

ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS default_space TEXT
  CHECK (default_space IN ('family', 'school'));
