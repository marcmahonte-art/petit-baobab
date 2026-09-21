-- ============================================================
-- Petit Baobab — Migration 25 : Module Histoires Personnalisées
-- Tables, index et RLS conformes au Cahier des Charges V1
-- ============================================================

-- 1. Table principale : stories
create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  description text,
  moral text,
  status text not null default 'draft' check (status in ('draft', 'generating', 'ready', 'failed', 'archived')),
  age_min integer not null default 3,
  age_max integer not null default 12,
  country text not null default 'Burkina Faso',
  region text,
  environment text not null default 'savane',
  theme text not null default 'aventure',
  educational_goal text not null default 'partage',
  visual_style text not null default 'petit-baobab-3d',
  language text not null default 'fr',
  cover_url text,
  total_pages integer not null default 10,
  generation_id uuid,
  is_featured boolean not null default false,
  read_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

-- 2. Table des pages du conte : story_pages
create table if not exists public.story_pages (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  page_number integer not null,
  title text,
  text text not null,
  scene text,
  emotion text,
  image_prompt text,
  image_url text,
  audio_url text,
  coloring_url text,
  audio_status text default 'pending',
  image_status text default 'pending',
  created_at timestamptz not null default now(),
  constraint story_pages_story_page_unique unique (story_id, page_number)
);

-- 3. Profil des personnages (cohérence visuelle) : story_characters
create table if not exists public.story_characters (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  name text not null,
  type text not null default 'child',
  age integer,
  gender text,
  skin_tone text,
  hair text,
  clothing jsonb default '{}'::jsonb,
  personality jsonb default '[]'::jsonb,
  visual_description text,
  reference_image_url text,
  created_at timestamptz not null default now()
);

-- 4. Illustrations générées : story_illustrations
create table if not exists public.story_illustrations (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  page_id uuid references public.story_pages(id) on delete cascade,
  provider text not null default 'gemini',
  model text,
  prompt text not null,
  storage_path text,
  public_url text not null,
  width integer default 1024,
  height integer default 1024,
  status text not null default 'completed',
  created_at timestamptz not null default now()
);

-- 5. Audios / Narrations générées : story_audio
create table if not exists public.story_audio (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  page_id uuid references public.story_pages(id) on delete cascade,
  provider text not null default 'gemini_tts',
  model text,
  voice text,
  text text not null,
  storage_path text,
  duration_ms integer default 0,
  status text not null default 'completed',
  created_at timestamptz not null default now()
);

-- 6. Suivi des générations IA : story_generations
create table if not exists public.story_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  story_id uuid references public.stories(id) on delete cascade,
  type text not null default 'story', -- 'story', 'illustration', 'audio', 'pdf'
  provider text not null default 'gemini',
  model text default 'gemini-1.5-flash',
  status text not null default 'pending', -- 'pending', 'processing', 'completed', 'failed'
  input_tokens integer,
  output_tokens integer,
  estimated_cost numeric(10, 4) default 0,
  error_message text,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

-- 7. Favoris et lectures
create table if not exists public.story_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  story_id uuid not null references public.stories(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint story_favorites_user_story_unique unique (user_id, story_id)
);

create table if not exists public.story_views (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  page_number integer default 1,
  duration_seconds integer default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Index de performance recommandés
-- ============================================================
create index if not exists stories_user_id_created_at_idx on public.stories(user_id, created_at desc);
create index if not exists stories_status_idx on public.stories(status);
create index if not exists stories_theme_idx on public.stories(theme);
create index if not exists story_pages_story_id_page_number_idx on public.story_pages(story_id, page_number);
create index if not exists story_characters_story_id_idx on public.story_characters(story_id);
create index if not exists story_illustrations_page_id_idx on public.story_illustrations(page_id);
create index if not exists story_audio_page_id_idx on public.story_audio(page_id);
-- `story_generations` n'a pas de colonne `created_at` : elle date ses lignes avec
-- `started_at`. L'index d'origine visait `created_at` et faisait donc échouer
-- TOUT le script en `42703 — column "created_at" does not exist` (et, la
-- transaction étant annulée, aucune table n'était créée).
create index if not exists story_generations_story_id_started_at_idx on public.story_generations(story_id, started_at desc);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
alter table public.stories enable row level security;
alter table public.story_pages enable row level security;
alter table public.story_characters enable row level security;
alter table public.story_illustrations enable row level security;
alter table public.story_audio enable row level security;
alter table public.story_generations enable row level security;
alter table public.story_favorites enable row level security;
alter table public.story_views enable row level security;

-- ============================================================
-- Politiques RLS
--
-- ⚠️ CORRECTIF DE SÉCURITÉ — ne pas réintroduire `or auth.uid() is null`.
-- `auth.uid()` renvoie NULL précisément quand la requête est ANONYME : une
-- condition `... or auth.uid() is null` est donc VRAIE pour un visiteur non
-- connecté. Comme la clé anon est publique (NEXT_PUBLIC_SUPABASE_ANON_KEY) et
-- que `getSupabaseServer()` s'appuie dessus, la faille était exploitable
-- directement depuis un navigateur : n'importe qui pouvait réécrire ou
-- supprimer TOUTES les histoires, pages et personnages.
-- Les écritures sont donc réservées au propriétaire authentifié. La lecture
-- publique (histoires mises en avant ou sans propriétaire) reste ouverte, ce
-- qui est l'intention du projet.
--
-- `drop policy if exists` avant chaque `create policy` : le script redevient
-- réexécutable (sans quoi une seconde exécution échoue en 42710).
-- ============================================================

-- Politiques stories
drop policy if exists "Les utilisateurs peuvent lire les histoires publiques ou leurs propres histoires" on public.stories;
create policy "Les utilisateurs peuvent lire les histoires publiques ou leurs propres histoires"
  on public.stories for select
  using (user_id = auth.uid() or is_featured = true or user_id is null);

drop policy if exists "Les utilisateurs peuvent créer leurs propres histoires" on public.stories;
create policy "Les utilisateurs peuvent créer leurs propres histoires"
  on public.stories for insert
  with check (auth.uid() is not null and user_id = auth.uid());

drop policy if exists "Les utilisateurs peuvent modifier leurs propres histoires" on public.stories;
create policy "Les utilisateurs peuvent modifier leurs propres histoires"
  on public.stories for update
  using (auth.uid() is not null and user_id = auth.uid())
  with check (auth.uid() is not null and user_id = auth.uid());

drop policy if exists "Les utilisateurs peuvent supprimer leurs propres histoires" on public.stories;
create policy "Les utilisateurs peuvent supprimer leurs propres histoires"
  on public.stories for delete
  using (auth.uid() is not null and user_id = auth.uid());

-- Politiques story_pages
drop policy if exists "Accès en lecture aux pages des histoires accessibles" on public.story_pages;
create policy "Accès en lecture aux pages des histoires accessibles"
  on public.story_pages for select
  using (
    exists (
      select 1 from public.stories s
      where s.id = story_pages.story_id
      and (s.user_id = auth.uid() or s.is_featured = true or s.user_id is null)
    )
  );

drop policy if exists "Modification des pages par le propriétaire de l'histoire" on public.story_pages;
create policy "Modification des pages par le propriétaire de l'histoire"
  on public.story_pages for all
  using (
    auth.uid() is not null
    and exists (
      select 1 from public.stories s
      where s.id = story_pages.story_id
      and s.user_id = auth.uid()
    )
  )
  with check (
    auth.uid() is not null
    and exists (
      select 1 from public.stories s
      where s.id = story_pages.story_id
      and s.user_id = auth.uid()
    )
  );

-- Politiques story_characters
-- Même découpage que story_pages : lecture alignée sur l'accessibilité de
-- l'histoire, écriture réservée au propriétaire. Un `for all` unique laissait
-- `is_featured = true` ouvrir l'écriture des personnages à tout le monde.
drop policy if exists "Lecture des personnages d'une histoire accessible" on public.story_characters;
create policy "Lecture des personnages d'une histoire accessible"
  on public.story_characters for select
  using (
    exists (
      select 1 from public.stories s
      where s.id = story_characters.story_id
      and (s.user_id = auth.uid() or s.is_featured = true or s.user_id is null)
    )
  );

drop policy if exists "Modification des personnages par le propriétaire de l'histoire" on public.story_characters;
create policy "Modification des personnages par le propriétaire de l'histoire"
  on public.story_characters for all
  using (
    auth.uid() is not null
    and exists (
      select 1 from public.stories s
      where s.id = story_characters.story_id
      and s.user_id = auth.uid()
    )
  )
  with check (
    auth.uid() is not null
    and exists (
      select 1 from public.stories s
      where s.id = story_characters.story_id
      and s.user_id = auth.uid()
    )
  );

-- Politiques favoris
drop policy if exists "Gestion des favoris par utilisateur" on public.story_favorites;
create policy "Gestion des favoris par utilisateur"
  on public.story_favorites for all
  using (auth.uid() is not null and user_id = auth.uid())
  with check (auth.uid() is not null and user_id = auth.uid());

-- ============================================================
-- story_illustrations, story_audio, story_generations, story_views
-- restent SANS politique : RLS activé + aucune politique = accès refusé à
-- `anon` et `authenticated` (seule la clé service passe). C'est volontaire —
-- l'application ne les interroge pas encore (0 référence dans `src/`) et
-- deviner leurs règles d'accès maintenant risquerait d'ouvrir une brèche. À
-- compléter quand le module sera effectivement branché.
-- ============================================================

-- Rechargement du cache de schéma PostgREST (même raison que la migration 24).
notify pgrst, 'reload schema';
