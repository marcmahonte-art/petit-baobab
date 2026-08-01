-- supabase/migrations/20230801_create_automation_logs.sql
create table automation_logs (
  id uuid primary key default uuid_generate_v4(),
  rule_id uuid references automation_rules(id),
  account_id uuid references accounts(id),
  status text not null, -- SUCCESS, ERROR
  channel text not null,
  payload jsonb,
  created_at timestamp with time zone default now()
);
