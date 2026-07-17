-- ============================================================
-- Petit Baobab — Renouvellement automatique des étoiles (P1-2 & P1-3)
-- ============================================================
-- Mécanisme choisi : pg_cron (planificateur SQL natif de Supabase).
--
-- Pourquoi pg_cron plutôt qu'une Edge Function planifiée ?
--   * Le renouvellement porte sur des données SQL (comptes) et doit être
--     atomique et transactionnel -> un traitement en base est plus sûr et
--     plus rapide qu'un aller-retour réseau depuis une fonction edge.
--   * pg_cron tourne côté base, sans dépendre d'un appel HTTP externe ni
--     d'un "warm-up" de fonction ; il s'exécute même si l'app Next.js est
--     à l'arrêt (un utilisateur inactif récupère bien ses étoiles).
--   * Pas de secret Supabase exposé côté client, pas de nouveau vecteur
--     d'attaque réseau.
--
-- Règles métier :
--   * Plan "free"        : remise à 5 étoiles à chaque minuit GMT, SANS
--                          cumul (le solde repasse à 5, jamais plus).
--   * Plan "ecole_pro"   : remise à 1000 étoiles à la date anniversaire
--                          de plan_renewed_at (fenêtre glissante mensuelle),
--                          puis plan_renewed_at avancé d'un mois.
--   * Les autres plans (decouverte, super_baobab) ne sont pas touchés ici
--     (leur renouvellement relève de la logique d'abonnement Stripe).
-- ============================================================

-- Fonction unique exécutée chaque jour à minuit GMT par pg_cron.
CREATE OR REPLACE FUNCTION public.renew_stars_for_due_accounts()
RETURNS INTEGER AS $$
DECLARE
  v_processed INTEGER := 0;
  v_today     DATE := timezone('utc', now())::date;
BEGIN
  -- 1) Comptes FREE : remise à 5 étoiles à minuit GMT (sans cumul).
  --    On ne remet à jour que si le solde est < 5 pour éviter un historique
  --    de transaction inutile, mais le solde cible est toujours exactement 5.
  UPDATE public.accounts
  SET stars_balance = 5
  WHERE plan = 'free'
    AND stars_balance <> 5;

  GET DIAGNOSTICS v_processed = ROW_COUNT;

  -- Journaliser le renouvellement gratuit pour chaque compte concerné.
  INSERT INTO public.stars_transactions (account_id, amount, reason, reference_id)
  SELECT id, 5, 'daily_reset', NULL
  FROM public.accounts
  WHERE plan = 'free' AND stars_balance = 5
  ON CONFLICT DO NOTHING;

  -- 2) Comptes ECOLE_PRO : renouvellement à la date anniversaire mensuelle.
  --    plan_renewed_at NULL -> on l'initialise à hier pour forcer un premier
  --    renouvellement immédiat si besoin.
  UPDATE public.accounts
  SET stars_balance = 1000,
      plan_renewed_at = plan_renewed_at + interval '1 month'
  WHERE plan = 'ecole_pro'
    AND plan_renewed_at IS NOT NULL
    AND timezone('utc', now()) >= plan_renewed_at;

  -- 3) Initialiser plan_renewed_at pour les ecole_pro qui n'en ont pas encore.
  UPDATE public.accounts
  SET plan_renewed_at = timezone('utc', now())
  WHERE plan = 'ecole_pro'
    AND plan_renewed_at IS NULL;

  RETURN v_processed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ────────────────────────────────────────────────────────────
-- Planification pg_cron : tous les jours à 00:00 GMT (UTC)
-- ────────────────────────────────────────────────────────────
-- L'extension pg_cron DOIT être activée (Supabase : Database → Extensions)
-- pour que la planification s'applique. Pour ne pas faire échouer la
-- migration quand l'extension n'est pas encore installée, on vérifie sa
-- présence et on ne planifie QUE si elle existe. Une fois pg_cron activée,
-- relancez simplement ce bloc (ou créez le job manuellement dans le
-- dashboard Supabase → Database → Cron) avec :
--   SELECT cron.schedule('renew_stars_daily','0 0 * * *',
--     'SELECT public.renew_stars_for_due_accounts();');
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  ) THEN
    PERFORM cron.schedule(
      'renew_stars_daily',   -- nom unique du job
      '0 0 * * *',           -- tous les jours à minuit (serveur Supabase = UTC)
      'SELECT public.renew_stars_for_due_accounts();'
    );
    RAISE NOTICE 'pg_cron actif : job renew_stars_daily planifié à minuit UTC.';
  ELSE
    RAISE NOTICE 'Extension pg_cron NON installée : job non planifié. '
      'Activez pg_cron puis relancez le bloc de planification (voir commentaire). '
      'Le renouvellement gratuit/lazy côté app reste fonctionnel (P1-3).';
  END IF;
END $$;

-- ────────────────────────────────────────────────────────────
-- P2-9 : Index composite sur stars_transactions(account_id, created_at)
-- (lectures fréquentes de l'historique trié par date côté enseignant/parent)
-- ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_stars_transactions_account_id_created_at
  ON public.stars_transactions (account_id, created_at);

-- ────────────────────────────────────────────────────────────
-- P3-12 : Fallback atomique adjust_stars_atomic
-- Version atomique du fallback utilisée par lib/auth.ts si la RPC
-- adjust_stars venait à être absente. UPDATE conditionnel unique
-- (stars_balance >= -p_amount) + journalisation, renvoie le nouveau
-- solde ou NULL si solde insuffisant / compte introuvable.
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.adjust_stars_atomic(
  p_account_id UUID,
  p_amount INTEGER,
  p_reason TEXT,
  p_reference_id UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  UPDATE public.accounts
  SET stars_balance = stars_balance + p_amount
  WHERE id = p_account_id
    AND stars_balance >= (-LEAST(p_amount, 0));

  IF NOT FOUND THEN
    RETURN NULL; -- solde insuffisant ou compte introuvable
  END IF;

  SELECT stars_balance INTO v_new_balance
  FROM public.accounts WHERE id = p_account_id;

  INSERT INTO public.stars_transactions (account_id, amount, reason, reference_id)
  VALUES (p_account_id, p_amount, p_reason, p_reference_id);

  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
