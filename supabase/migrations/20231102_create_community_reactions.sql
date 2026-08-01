-- supabase/migrations/20231102_create_community_reactions.sql
create table community_reactions (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references community_posts(id),
  child_id uuid references children(id),
  reaction text not null,
  created_at timestamp with time zone default now()
);

alter table community_reactions enable row level security;
create policy  Children can react to approved posts
  on community_reactions for insert
  using (
    auth.uid() = child_id and
    (select approved from community_posts where id = post_id) = true
  );
