-- ============================================================
-- Petit Baobab — Idempotence génération IA (P2-5)
-- ============================================================
-- Table de verrou court pour empêcher un double débit d'étoiles sur une
-- même action de génération (double-clic / rejeu réseau).
--
-- Le client envoie une "idempotencyKey" stable par tentative. La route
-- /api/magic-drawing tente une insertion ; la contrainte UNIQUE sur "key"
-- fait échouer (23505) toute soumission en double dans la fenêtre de vie
-- de la ligne (60 secondes). Les lignes expirent automatiquement.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.magic_drawing_locks (
  key        TEXT PRIMARY KEY,
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Nettoyage automatique des verrous de plus de 60 secondes (trigger BEFORE INSERT).
CREATE OR REPLACE FUNCTION public.cleanup_magic_drawing_locks()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.magic_drawing_locks
  WHERE created_at < now() - interval '60 seconds';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cleanup_magic_drawing_locks ON public.magic_drawing_locks;
CREATE TRIGGER trg_cleanup_magic_drawing_locks
  BEFORE INSERT ON public.magic_drawing_locks
  FOR EACH ROW EXECUTE FUNCTION public.cleanup_magic_drawing_locks();

-- RLS : seuls les comptes peuvent voir leurs propres verrous (défense en profondeur).
ALTER TABLE public.magic_drawing_locks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture de ses propres verrous" ON public.magic_drawing_locks;
CREATE POLICY "Lecture de ses propres verrous" ON public.magic_drawing_locks
  FOR SELECT USING (
    account_id IN (SELECT id FROM public.accounts WHERE user_id = auth.uid())
  );
