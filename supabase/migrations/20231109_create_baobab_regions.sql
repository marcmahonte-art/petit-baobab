create table baobab_regions (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references baobab_profiles(id),
  region_name text not null,
  unlocked boolean not null default false,
  progress numeric default 0,
  completed boolean default false,
  updated_at timestamp with time zone default now()
);

-- Row Level Security
alter table baobab_regions enable row level security;
create policy "public read" on baobab_regions for select using (auth.uid() = (select child_profile_id from baobab_profiles where id = profile_id));
create policy "owner upsert" on baobab_regions for insert, update with check (auth.uid() = (select child_profile_id from baobab_profiles where id = profile_id));
