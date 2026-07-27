-- Options livraison pour les commandes boutique
ALTER TABLE public.shop_orders
  ADD COLUMN IF NOT EXISTS delivery_method text NOT NULL DEFAULT 'download'
    CHECK (delivery_method IN ('download', 'delivery'));

ALTER TABLE public.shop_orders
  ADD COLUMN IF NOT EXISTS delivery_fee integer NOT NULL DEFAULT 0;

ALTER TABLE public.shop_orders
  ADD COLUMN IF NOT EXISTS shipping_address text;
