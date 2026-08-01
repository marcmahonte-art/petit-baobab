create table community_leaderboards (
  id uuid primary key default uuid_generate_v4(),
  competition_id uuid references community_competitions(id),
  child_id uuid references child_profiles(id),
  total_score numeric not null,
  rank integer,
  updated_at timestamp with time zone default now()
);

-- Row Level Security
alter table community_leaderboards enable row level security;
create policy "public read" on community_leaderboards for select using (true);
create policy "owner insert" on community_leaderboards for insert with check (auth.uid() = child_id);
