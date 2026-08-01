-- supabase/migrations/20230801_create_notification_preferences.sql
create table notification_preferences (
  id uuid primary key default uuid_generate_v4(),
  account_id uuid references accounts(id),
  email_enabled boolean default true,
  whatsapp_enabled boolean default true,
  inapp_enabled boolean default true,
  push_enabled boolean default false,
  marketing_enabled boolean default true,
  language text default 'fr',
  quiet_hours_start time,
  quiet_hours_end time,
  updated_at timestamp with time zone default now()
);
