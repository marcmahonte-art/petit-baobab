-- 11_pedagogical_sheets.sql – Migration Assistant Pédagogique (/school/assistant)

create table if not exists public.pedagogical_sheets (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references public.accounts(id) on delete cascade,
  teacher_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  persona text not null check (persona in ('educatrice_creche', 'maitresse_maternelle', 'directrice')),
  tool_id text not null,
  category text,
  domaine_eveil text,
  input_values jsonb not null default '{}'::jsonb,
  generated_content text not null,
  stars_cost integer not null default 5,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_pedagogical_sheets_teacher on public.pedagogical_sheets(teacher_id, created_at desc);
create index if not exists idx_pedagogical_sheets_account on public.pedagogical_sheets(account_id);

alter table public.pedagogical_sheets
  add column if not exists pdf_path text,
  add column if not exists docx_path text;

alter table public.pedagogical_sheets enable row level security;

drop policy if exists "Les enseignants peuvent voir leurs fiches" on public.pedagogical_sheets;
create policy "Les enseignants peuvent voir leurs fiches"
  on public.pedagogical_sheets for select
  using (auth.uid() = teacher_id);

drop policy if exists "Les enseignants peuvent enregistrer leurs fiches" on public.pedagogical_sheets;
create policy "Les enseignants peuvent enregistrer leurs fiches"
  on public.pedagogical_sheets for insert
  with check (auth.uid() = teacher_id);

drop policy if exists "Les enseignants peuvent supprimer leurs fiches" on public.pedagogical_sheets;
create policy "Les enseignants peuvent supprimer leurs fiches"
  on public.pedagogical_sheets for delete
  using (auth.uid() = teacher_id);

drop policy if exists "Les enseignants peuvent modifier leurs fiches" on public.pedagogical_sheets;
create policy "Les enseignants peuvent modifier leurs fiches"
  on public.pedagogical_sheets for update
  using (auth.uid() = teacher_id)
  with check (auth.uid() = teacher_id);
