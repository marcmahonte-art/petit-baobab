-- Passe la durée de téléchargement de 30 à 60 jours
ALTER TABLE public.shop_downloads
  ALTER COLUMN expires_at SET DEFAULT (now() + interval '60 days');
