create table analytics_school (
  school_id uuid references schools(id),
  date date not null,
  students int default 0,
  active_students int default 0,
  activities int default 0,
  books int default 0,
  games int default 0,
  average_time numeric default 0,
  average_progress numeric default 0,
  primary key (school_id, date)
);
