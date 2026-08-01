create table analytics_daily (
  date date primary key,
  new_users int default 0,
  active_users int default 0,
  sessions int default 0,
  drawings int default 0,
  books int default 0,
  ai_generations int default 0,
  orders int default 0,
  payments int default 0,
  xp bigint default 0,
  stars_spent int default 0,
  stars_earned int default 0
);
