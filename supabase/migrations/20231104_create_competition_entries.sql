create table community_competition_entries (
  id uuid primary key default uuid_generate_v4(),
  competition_id uuid references community_competitions(id),
  child_id uuid references child_profiles(id),
  entry_data jsonb not null,
  score numeric,
  submitted_at timestamp with time zone default now()
);

-- Row Level Security
alter table community_competition_entries enable row level security;
create policy "public read" on community_competition_entries for select using (true);
create policy "owner insert" on community_competition_entries for insert with check (auth.uid() = child_id);
