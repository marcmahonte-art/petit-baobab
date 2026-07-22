-- Migration: Supprimer le bonus de bienvenue de 5 étoiles
-- Les nouveaux comptes commencent avec 0 étoile au lieu de 5.
-- Un directeur d'école voit donc 0 sur /school/dashboard à la création.

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

  -- 2. Créer le compte avec 0 étoile (plus de bonus de bienvenue)
  INSERT INTO public.accounts (user_id, stars_balance, plan)
  VALUES (new.id, 0, 'free')
  ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id
  RETURNING id INTO new_account_id;

  -- Si un compte existait déjà et n'a pas été inséré (ex: ré-inscription),
  -- on récupère l'identifiant existant.
  IF new_account_id IS NULL THEN
    SELECT id INTO new_account_id FROM public.accounts WHERE user_id = new.id;
  END IF;

  -- 3. Créer le profil enfant initial si aucun n'existe
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
