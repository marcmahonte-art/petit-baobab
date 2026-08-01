-- supabase/migrations/20230801_create_automation_notifications.sql
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  account_id uuid references accounts(id),
  child_id uuid references child_profiles(id),
  title text not null,
  message text not null,
  type text not null, -- INFO, ALERT, REMINDER
  channel text not null, -- IN_APP, EMAIL, WHATSAPP, PUSH
  status text not null default 'PENDING',
  action_url text,
  icon text,
  metadata jsonb,
  read_at timestamp with time zone,
  created_at timestamp with time zone default now()
);
