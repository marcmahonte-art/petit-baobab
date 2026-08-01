-- supabase/migrations/20230801_create_automation_rules.sql
create table automation_rules (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  trigger_event text not null,
  conditions jsonb,
  actions jsonb not null,
  enabled boolean default true,
  priority text not null default 'NORMAL', -- URGENT, IMPORTANT, NORMAL, SILENT
  created_at timestamp with time zone default now()
);
