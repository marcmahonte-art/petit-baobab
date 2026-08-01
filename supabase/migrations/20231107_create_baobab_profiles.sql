create table baobab_profiles (
  id uuid primary key default uuid_generate_v4(),
  child_profile_id uuid references child_profiles(id),
  current_level int not null default 1,
  xp numeric not null default 0,
  current_stage text,
  current_region text,
  tree_skin text,
  house_skin text,
  bridge_skin text,
  music text,
  background text,
  updated_at timestamp with time zone default now()
);

-- Row Level Security
alter table baobab_profiles enable row level security;
create policy "public read" on baobab_profiles for select using (auth.uid() = child_profile_id);
create policy "owner upsert" on baobab_profiles for insert, update with check (auth.uid() = child_profile_id);
