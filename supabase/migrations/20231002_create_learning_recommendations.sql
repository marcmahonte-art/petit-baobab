-- supabase/migrations/20231002_create_learning_recommendations.sql
create table learning_recommendations (
  id uuid primary key default uuid_generate_v4(),
  child_id uuid references children(id),
  type text,
  title text,
  description text,
  priority integer,
  reason text,
  resource_type text,
  resource_id uuid,
  status text default 'pending',
  created_at timestamp with time zone default now()
);
