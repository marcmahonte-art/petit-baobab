-- 19_portfolio_tables.sql
-- Création des tables du Portfolio Intelligent

-- Table child_portfolio
create table if not exists public.child_portfolio (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references auth.users(id) on delete cascade,
  cover text,
  theme text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Table portfolio_events
create table if not exists public.portfolio_events (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  title text not null,
  description text,
  image text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now() not null
);
create index if not exists idx_portfolio_events_child on public.portfolio_events(child_id);
create index if not exists idx_portfolio_events_type on public.portfolio_events(event_type);

-- Table portfolio_albums
create table if not exists public.portfolio_albums (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  cover text,
  year integer,
  created_at timestamp with time zone default now() not null
);
create index if not exists idx_portfolio_albums_child on public.portfolio_albums(child_id);

-- Table portfolio_favorites
create table if not exists public.portfolio_favorites (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references auth.users(id) on delete cascade,
  resource_type text not null,
  resource_id text not null,
  created_at timestamp with time zone default now() not null
);
create unique index if not exists uniq_favorite on public.portfolio_favorites(child_id, resource_type, resource_id);

-- Table portfolio_time_capsules
create table if not exists public.portfolio_time_capsules (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references auth.users(id) on delete cascade,
  message text not null,
  author text,
  unlock_after_years integer not null check (unlock_after_years in (1,3,5)),
  locked_until timestamp with time zone not null,
  opened boolean default false,
  created_at timestamp with time zone default now() not null
);
create index if not exists idx_time_capsules_child on public.portfolio_time_capsules(child_id);

-- Trigger to update updated_at on child_portfolio
create or replace function trigger_set_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_timestamp
before update on public.child_portfolio
for each row
execute function trigger_set_timestamp();
