create table baobab_animals (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references baobab_profiles(id),
  animal_type text not null,
  "level" int not null default 1,
  unlocked boolean not null default false,
  equipped boolean not null default false,
  obtained_at timestamp with time zone default now()
);

-- Row Level Security
alter table baobab_animals enable row level security;
create policy "public read" on baobab_animals for select using (auth.uid() = (select child_profile_id from baobab_profiles where id = profile_id));
create policy "owner upsert" on baobab_animals for insert, update with check (auth.uid() = (select child_profile_id from baobab_profiles where id = profile_id));
