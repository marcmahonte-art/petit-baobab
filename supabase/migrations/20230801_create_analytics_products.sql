create table analytics_products (
  product_id uuid primary key references products(id),
  views int default 0,
  downloads int default 0,
  sales int default 0,
  revenue numeric default 0,
  favorites int default 0,
  rating numeric default 0
);
