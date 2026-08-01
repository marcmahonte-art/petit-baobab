-- supabase/migrations/20231001_create_child_learning_profile.sql
create table child_learning_profile (
  id uuid primary key default uuid_generate_v4(),
  child_id uuid references children(id),
  estimated_age numeric,
  estimated_level text,
  preferred_topics jsonb,
  preferred_styles jsonb,
  learning_speed numeric,
  attention_span numeric,
  confidence_score numeric,
  motivation_score numeric,
  last_analysis_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
