create table community_events (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  start_at timestamp with time zone not null,
  end_at timestamp with time zone not null,
  competition_id uuid references community_competitions(id),
  created_at timestamp with time zone default now()
);

-- Row Level Security
alter table community_events enable row level security;
create policy "public read" on community_events for select using (true);
create policy "owner insert" on community_events for insert with check (auth.uid() = child_id);
