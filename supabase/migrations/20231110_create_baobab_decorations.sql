create table baobab_decorations (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references baobab_profiles(id),
  item_type text not null,
  equipped boolean not null default false,
  obtained_at timestamp with time zone default now()
);

-- Row Level Security
alter table baobab_decorations enable row level security;
create policy "public read" on baobab_decorations for select using (auth.uid() = (select child_profile_id from baobab_profiles where id = profile_id));
create policy "owner upsert" on baobab_decorations for insert, update with check (auth.uid() = (select child_profile_id from baobab_profiles where id = profile_id));
