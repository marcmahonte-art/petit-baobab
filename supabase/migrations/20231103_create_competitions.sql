create table community_competitions (
  id uuid primary key default uuid_generate_v4(),
  child_id uuid references child_profiles(id),
  title text not null,
  description text,
  start_at timestamp with time zone not null,
  end_at timestamp with time zone not null,
  reward jsonb,
  created_at timestamp with time zone default now()
);

-- Row Level Security
alter table community_competitions enable row level security;
create policy "public read" on community_competitions for select using (true);
create policy "owner insert" on community_competitions for insert with check (auth.uid() = child_id);
