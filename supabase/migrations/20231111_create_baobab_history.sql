create table baobab_history (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references baobab_profiles(id),
  event_type text not null,
  title text not null,
  description text,
  xp numeric default 0,
  created_at timestamp with time zone default now()
);

-- Row Level Security
alter table baobab_history enable row level security;
create policy "public read" on baobab_history for select using (auth.uid() = (select child_profile_id from baobab_profiles where id = profile_id));
create policy "owner insert" on baobab_history for insert with check (auth.uid() = (select child_profile_id from baobab_profiles where id = profile_id));
