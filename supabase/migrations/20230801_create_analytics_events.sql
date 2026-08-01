create table analytics_events (
  id uuid primary key default uuid_generate_v4(),
  account_id uuid references accounts(id),
  child_id uuid references child_profiles(id),
  school_id uuid references schools(id),
  event_name text not null,
  event_category text,
  resource_type text,
  resource_id uuid,
  metadata jsonb,
  ip_country text,
  device text,
  platform text,
  created_at timestamp with time zone default now()
);
