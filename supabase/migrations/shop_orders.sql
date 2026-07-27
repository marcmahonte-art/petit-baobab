-- ============================================================
-- BOUTIQUE PETIT BAOBAB — commandes, téléchargements, webhooks
-- À exécuter dans le SQL Editor Supabase (projet bsepfqpjomrtveavbfib)
-- ============================================================

-- 1. Commandes boutique (checkout invité — pas de user_id obligatoire)
create table if not exists public.shop_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  -- Client (invité)
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  country text not null default '',
  city text not null default '',
  -- Contenu
  items jsonb not null default '[]'::jsonb,
  total integer not null check (total >= 0),
  total_ht integer not null default 0,
  currency text not null default 'XOF',
  -- Paiement PayDunya
  payment_method text not null default 'paydunya',
  payment_status text not null default 'pending'
    check (payment_status in ('pending','processing','paid','failed','cancelled','expired')),
  status text not null default 'pending'
    check (status in ('pending','completed','cancelled')),
  invoice_token text unique,          -- token facture PayDunya
  transaction_id text,                -- id transaction PayDunya confirmée
  invoice_number text,                -- facture interne INV-BQ-...
  invoice_url text,                   -- chemin du PDF facture (storage privé)
  -- Accès invité sécurisé (lien magique)
  access_token text unique not null default encode(gen_random_bytes(24), 'hex'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists shop_orders_email_idx on public.shop_orders (email);
create index if not exists shop_orders_invoice_token_idx on public.shop_orders (invoice_token);

-- 2. Téléchargements sécurisés (token 30 jours, 20 téléchargements max)
create table if not exists public.shop_downloads (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.shop_orders(id) on delete cascade,
  product_id text not null,
  product_title text not null,
  file_path text not null,            -- chemin dans le bucket privé shop-files
  token text unique not null default encode(gen_random_bytes(24), 'hex'),
  expires_at timestamptz not null default (now() + interval '30 days'),
  max_downloads integer not null default 20,
  download_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists shop_downloads_order_idx on public.shop_downloads (order_id);

-- 3. Événements webhook (idempotence — empêche le double traitement)
create table if not exists public.shop_webhook_events (
  id uuid primary key default gen_random_uuid(),
  invoice_token text not null,
  status text not null,
  payload jsonb,
  processed_at timestamptz not null default now(),
  unique (invoice_token, status)
);

-- 4. RLS : tout est DENY par défaut pour anon/authenticated.
--    Les invités accèdent à leurs commandes UNIQUEMENT via les API routes
--    (service_role) authentifiées par access_token / download token.
alter table public.shop_orders enable row level security;
alter table public.shop_downloads enable row level security;
alter table public.shop_webhook_events enable row level security;
-- (aucune policy => aucune lecture/écriture client directe)

-- 5. Bucket privé pour les PDF produits + factures boutique
insert into storage.buckets (id, name, public)
values ('shop-files', 'shop-files', false)
on conflict (id) do nothing;
