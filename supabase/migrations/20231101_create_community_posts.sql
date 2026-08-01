-- supabase/migrations/20231101_create_community_posts.sql
create table community_posts (
  id uuid primary key default uuid_generate_v4(),
  child_id uuid references children(id),
  type text not null,
  resource_id uuid,
  visibility text not null default 'public',
  approved boolean not null default false,
  created_at timestamp with time zone default now()
);

-- Row Level Security policies (example)
alter table community_posts enable row level security;
create policy  Children can insert own posts
  on community_posts for insert
  using (auth.uid() = child_id);
create policy Parents can update approval
  on community_posts for update
  using (auth.role() = 'parent' and child_id = auth.uid());
