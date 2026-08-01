-- supabase/migrations/20231003_create_ai_learning_insights.sql
create table ai_learning_insights (
  id uuid primary key default uuid_generate_v4(),
  child_id uuid references children(id),
  summary text,
  strengths jsonb,
  difficulties jsonb,
  next_goals jsonb,
  generated_at timestamp with time zone default now()
);
