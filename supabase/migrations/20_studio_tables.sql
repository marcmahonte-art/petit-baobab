-- Migration for Petit Baobab Studio tables

-- studio_projects
create table studio_projects (
  id uuid primary key default uuid_generate_v4(),
  child_id uuid references child_profiles(id),
  title text not null,
  type text not null,
  thumbnail text,
  status text not null default 'draft',
  updated_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- studio_pages
create table studio_pages (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references studio_projects(id),
  page_number int not null,
  json jsonb not null,
  preview text,
  created_at timestamp with time zone default now()
);

-- studio_templates
create table studio_templates (
  id uuid primary key default uuid_generate_v4(),
  category text not null,
  title text not null,
  thumbnail text,
  json jsonb not null,
  premium boolean not null default false,
  created_at timestamp with time zone default now()
);

-- studio_assets
create table studio_assets (
  id uuid primary key default uuid_generate_v4(),
  child_id uuid references child_profiles(id),
  type text not null,
  url text not null,
  tags text[],
  created_at timestamp with time zone default now()
);

-- Enum for project types (used in application logic)
-- This is just a comment for developers; actual enforcement done in TypeScript.
