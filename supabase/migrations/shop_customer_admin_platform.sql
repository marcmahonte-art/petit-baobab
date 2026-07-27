-- ============================================================
-- Petit Baobab — espace client + back office boutique
-- À exécuter après supabase/migrations/shop_orders.sql
-- ============================================================

create extension if not exists pgcrypto;

-- Commandes : rattachement optionnel à un compte Supabase Auth après Magic Link.
alter table public.shop_orders
  add column if not exists customer_user_id uuid references auth.users(id) on delete set null;

do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'shop_orders_payment_status_check'
      and conrelid = 'public.shop_orders'::regclass
  ) then
    alter table public.shop_orders drop constraint shop_orders_payment_status_check;
  end if;
end $$;

alter table public.shop_orders
  add constraint shop_orders_payment_status_check
  check (payment_status in ('pending','processing','paid','failed','cancelled','expired','refunded'));

create index if not exists shop_orders_customer_user_idx on public.shop_orders (customer_user_id);

create table if not exists public.shop_customer_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  email text not null unique,
  first_name text,
  last_name text,
  phone text,
  country text,
  city text,
  language text not null default 'fr' check (language in ('fr','en')),
  newsletter_enabled boolean not null default true,
  whatsapp_enabled boolean not null default true,
  email_notifications boolean not null default true,
  whatsapp_notifications boolean not null default true,
  download_notifications boolean not null default true,
  privacy_analytics boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shop_order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.shop_orders(id) on delete cascade,
  event_type text not null,
  label text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.shop_products (
  id text primary key,
  title text not null,
  slug text unique,
  description text,
  price integer not null default 0 check (price >= 0),
  currency text not null default 'XOF',
  category_id text,
  cover_path text,
  pdf_path text,
  gallery jsonb not null default '[]'::jsonb,
  is_featured boolean not null default false,
  is_archived boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shop_categories (
  id text primary key,
  name text not null,
  slug text unique,
  icon text,
  color text not null default '#7D6AF8',
  sort_order integer not null default 0,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null,
  product_title text not null,
  product_image text,
  product_price integer,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid not null references public.shop_orders(id) on delete cascade,
  product_id text not null,
  product_title text not null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  photos text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending','published','hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, order_id, product_id)
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percentage','fixed')),
  discount_value integer not null check (discount_value > 0),
  starts_at timestamptz,
  ends_at timestamptz,
  max_uses integer,
  used_count integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.coupon_usage (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  order_id uuid not null references public.shop_orders(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  discount_amount integer not null default 0,
  created_at timestamptz not null default now(),
  unique (coupon_id, order_id)
);

create table if not exists public.product_views (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  user_id uuid references auth.users(id) on delete set null,
  session_id text,
  referrer text,
  created_at timestamptz not null default now()
);

create table if not exists public.product_sales (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  order_id uuid not null references public.shop_orders(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  revenue integer not null default 0,
  created_at timestamptz not null default now(),
  unique (product_id, order_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  channel text not null check (channel in ('internal','email','whatsapp','download')),
  title text not null,
  body text,
  status text not null default 'queued' check (status in ('queued','sent','failed','read')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.shop_orders(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  template text not null,
  status text not null default 'queued',
  provider_message_id text,
  error text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.whatsapp_logs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.shop_orders(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  phone text not null,
  template text not null,
  status text not null default 'queued',
  provider_message_id text,
  error text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists wishlists_user_idx on public.wishlists(user_id);
create index if not exists reviews_user_idx on public.reviews(user_id);
create index if not exists reviews_order_idx on public.reviews(order_id);
create index if not exists coupon_usage_coupon_idx on public.coupon_usage(coupon_id);
create index if not exists product_views_product_idx on public.product_views(product_id);
create index if not exists product_sales_product_idx on public.product_sales(product_id);
create index if not exists notifications_user_idx on public.notifications(user_id);
create index if not exists email_logs_order_idx on public.email_logs(order_id);
create index if not exists whatsapp_logs_order_idx on public.whatsapp_logs(order_id);

alter table public.shop_customer_profiles enable row level security;
alter table public.shop_order_events enable row level security;
alter table public.shop_products enable row level security;
alter table public.shop_categories enable row level security;
alter table public.wishlists enable row level security;
alter table public.reviews enable row level security;
alter table public.coupons enable row level security;
alter table public.coupon_usage enable row level security;
alter table public.product_views enable row level security;
alter table public.product_sales enable row level security;
alter table public.notifications enable row level security;
alter table public.email_logs enable row level security;
alter table public.whatsapp_logs enable row level security;

drop policy if exists "shop customer reads own profile" on public.shop_customer_profiles;
create policy "shop customer reads own profile" on public.shop_customer_profiles
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "shop customer updates own profile" on public.shop_customer_profiles;
create policy "shop customer updates own profile" on public.shop_customer_profiles
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "shop customer manages own wishlist" on public.wishlists;
create policy "shop customer manages own wishlist" on public.wishlists
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "shop customer manages own reviews" on public.reviews;
create policy "shop customer manages own reviews" on public.reviews
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "shop customer reads own notifications" on public.notifications;
create policy "shop customer reads own notifications" on public.notifications
  for select to authenticated using ((select auth.uid()) = user_id);

-- Les tables admin/logs restent RLS deny-by-default côté client.
-- Les routes serveur utilisent service_role après authentification applicative.

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.shop_customer_profiles to authenticated;
grant select, insert, update, delete on public.wishlists to authenticated;
grant select, insert, update, delete on public.reviews to authenticated;
grant select on public.notifications to authenticated;

insert into public.shop_order_events (order_id, event_type, label, created_at)
select id, 'created', 'Commande créée', created_at
from public.shop_orders
on conflict do nothing;
