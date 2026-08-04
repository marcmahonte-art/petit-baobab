-- ============================================================
-- Petit Baobab - RLS policies for tables flagged by the
-- Supabase Database Linter (rls_enabled_no_policy).
--
-- Executed in the SQL Editor Supabase (projet bsepfqpjomrtveavbfib)
-- after migrations 19, 20, 21, 22 and the shop migrations.
--
-- Access model:
--   1. Portfolio (5 tables): user-scoped clients
--      (child_portfolio/portfolio_events/portfolio_albums/portfolio_favorites/portfolio_time_capsules
--       have child_id references auth.users(id)) -> auth.uid() = child_id
--   2. Studio (4 tables): user-scoped via child_profiles -> accounts -> user_id join
--      (studio_projects/studio_pages/studio_assets have child_id references child_profiles(id))
--      studio_templates is a shared read-only catalog for authenticated users
--   3. analytics_daily: read-only for authenticated users (school dashboards)
--   4. Admin/service-role only tables (shop_*, coupons, product_*, email/whatsapp logs,
--      automation_rules, notification_preferences): explicit deny-all policies so the
--      linter is satisfied while keeping client access fully blocked.
-- ============================================================

-- ============================================================
-- 1. PORTFOLIO
-- ============================================================

drop policy if exists "child_portfolio_select_own" on public.child_portfolio;
create policy "child_portfolio_select_own"
  on public.child_portfolio for select
  to authenticated
  using (auth.uid() = child_id);

drop policy if exists "child_portfolio_insert_own" on public.child_portfolio;
create policy "child_portfolio_insert_own"
  on public.child_portfolio for insert
  to authenticated
  with check (auth.uid() = child_id);

drop policy if exists "child_portfolio_update_own" on public.child_portfolio;
create policy "child_portfolio_update_own"
  on public.child_portfolio for update
  to authenticated
  using (auth.uid() = child_id)
  with check (auth.uid() = child_id);

drop policy if exists "child_portfolio_delete_own" on public.child_portfolio;
create policy "child_portfolio_delete_own"
  on public.child_portfolio for delete
  to authenticated
  using (auth.uid() = child_id);

drop policy if exists "portfolio_events_select_own" on public.portfolio_events;
create policy "portfolio_events_select_own"
  on public.portfolio_events for select
  to authenticated
  using (auth.uid() = child_id);

drop policy if exists "portfolio_events_insert_own" on public.portfolio_events;
create policy "portfolio_events_insert_own"
  on public.portfolio_events for insert
  to authenticated
  with check (auth.uid() = child_id);

drop policy if exists "portfolio_events_update_own" on public.portfolio_events;
create policy "portfolio_events_update_own"
  on public.portfolio_events for update
  to authenticated
  using (auth.uid() = child_id)
  with check (auth.uid() = child_id);

drop policy if exists "portfolio_events_delete_own" on public.portfolio_events;
create policy "portfolio_events_delete_own"
  on public.portfolio_events for delete
  to authenticated
  using (auth.uid() = child_id);

drop policy if exists "portfolio_albums_select_own" on public.portfolio_albums;
create policy "portfolio_albums_select_own"
  on public.portfolio_albums for select
  to authenticated
  using (auth.uid() = child_id);

drop policy if exists "portfolio_albums_insert_own" on public.portfolio_albums;
create policy "portfolio_albums_insert_own"
  on public.portfolio_albums for insert
  to authenticated
  with check (auth.uid() = child_id);

drop policy if exists "portfolio_albums_update_own" on public.portfolio_albums;
create policy "portfolio_albums_update_own"
  on public.portfolio_albums for update
  to authenticated
  using (auth.uid() = child_id)
  with check (auth.uid() = child_id);

drop policy if exists "portfolio_albums_delete_own" on public.portfolio_albums;
create policy "portfolio_albums_delete_own"
  on public.portfolio_albums for delete
  to authenticated
  using (auth.uid() = child_id);

drop policy if exists "portfolio_favorites_select_own" on public.portfolio_favorites;
create policy "portfolio_favorites_select_own"
  on public.portfolio_favorites for select
  to authenticated
  using (auth.uid() = child_id);

drop policy if exists "portfolio_favorites_insert_own" on public.portfolio_favorites;
create policy "portfolio_favorites_insert_own"
  on public.portfolio_favorites for insert
  to authenticated
  with check (auth.uid() = child_id);

drop policy if exists "portfolio_favorites_update_own" on public.portfolio_favorites;
create policy "portfolio_favorites_update_own"
  on public.portfolio_favorites for update
  to authenticated
  using (auth.uid() = child_id)
  with check (auth.uid() = child_id);

drop policy if exists "portfolio_favorites_delete_own" on public.portfolio_favorites;
create policy "portfolio_favorites_delete_own"
  on public.portfolio_favorites for delete
  to authenticated
  using (auth.uid() = child_id);

drop policy if exists "portfolio_time_capsules_select_own" on public.portfolio_time_capsules;
create policy "portfolio_time_capsules_select_own"
  on public.portfolio_time_capsules for select
  to authenticated
  using (auth.uid() = child_id);

drop policy if exists "portfolio_time_capsules_insert_own" on public.portfolio_time_capsules;
create policy "portfolio_time_capsules_insert_own"
  on public.portfolio_time_capsules for insert
  to authenticated
  with check (auth.uid() = child_id);

drop policy if exists "portfolio_time_capsules_update_own" on public.portfolio_time_capsules;
create policy "portfolio_time_capsules_update_own"
  on public.portfolio_time_capsules for update
  to authenticated
  using (auth.uid() = child_id)
  with check (auth.uid() = child_id);

drop policy if exists "portfolio_time_capsules_delete_own" on public.portfolio_time_capsules;
create policy "portfolio_time_capsules_delete_own"
  on public.portfolio_time_capsules for delete
  to authenticated
  using (auth.uid() = child_id);

-- ============================================================
-- 2. STUDIO (via child_profiles -> accounts -> user_id)
-- ============================================================

drop policy if exists "studio_projects_select_own" on public.studio_projects;
create policy "studio_projects_select_own"
  on public.studio_projects for select
  to authenticated
  using (
    child_id in (
      select cp.id from public.child_profiles cp
      join public.accounts a on a.id = cp.account_id
      where a.user_id = auth.uid()
    )
  );

drop policy if exists "studio_projects_insert_own" on public.studio_projects;
create policy "studio_projects_insert_own"
  on public.studio_projects for insert
  to authenticated
  with check (
    child_id in (
      select cp.id from public.child_profiles cp
      join public.accounts a on a.id = cp.account_id
      where a.user_id = auth.uid()
    )
  );

drop policy if exists "studio_projects_update_own" on public.studio_projects;
create policy "studio_projects_update_own"
  on public.studio_projects for update
  to authenticated
  using (
    child_id in (
      select cp.id from public.child_profiles cp
      join public.accounts a on a.id = cp.account_id
      where a.user_id = auth.uid()
    )
  )
  with check (
    child_id in (
      select cp.id from public.child_profiles cp
      join public.accounts a on a.id = cp.account_id
      where a.user_id = auth.uid()
    )
  );

drop policy if exists "studio_projects_delete_own" on public.studio_projects;
create policy "studio_projects_delete_own"
  on public.studio_projects for delete
  to authenticated
  using (
    child_id in (
      select cp.id from public.child_profiles cp
      join public.accounts a on a.id = cp.account_id
      where a.user_id = auth.uid()
    )
  );

drop policy if exists "studio_pages_select_own" on public.studio_pages;
create policy "studio_pages_select_own"
  on public.studio_pages for select
  to authenticated
  using (
    project_id in (
      select sp.id from public.studio_projects sp
      where sp.child_id in (
        select cp.id from public.child_profiles cp
        join public.accounts a on a.id = cp.account_id
        where a.user_id = auth.uid()
      )
    )
  );

drop policy if exists "studio_pages_insert_own" on public.studio_pages;
create policy "studio_pages_insert_own"
  on public.studio_pages for insert
  to authenticated
  with check (
    project_id in (
      select sp.id from public.studio_projects sp
      where sp.child_id in (
        select cp.id from public.child_profiles cp
        join public.accounts a on a.id = cp.account_id
        where a.user_id = auth.uid()
      )
    )
  );

drop policy if exists "studio_pages_update_own" on public.studio_pages;
create policy "studio_pages_update_own"
  on public.studio_pages for update
  to authenticated
  using (
    project_id in (
      select sp.id from public.studio_projects sp
      where sp.child_id in (
        select cp.id from public.child_profiles cp
        join public.accounts a on a.id = cp.account_id
        where a.user_id = auth.uid()
      )
    )
  )
  with check (
    project_id in (
      select sp.id from public.studio_projects sp
      where sp.child_id in (
        select cp.id from public.child_profiles cp
        join public.accounts a on a.id = cp.account_id
        where a.user_id = auth.uid()
      )
    )
  );

drop policy if exists "studio_pages_delete_own" on public.studio_pages;
create policy "studio_pages_delete_own"
  on public.studio_pages for delete
  to authenticated
  using (
    project_id in (
      select sp.id from public.studio_projects sp
      where sp.child_id in (
        select cp.id from public.child_profiles cp
        join public.accounts a on a.id = cp.account_id
        where a.user_id = auth.uid()
      )
    )
  );

drop policy if exists "studio_assets_select_own" on public.studio_assets;
create policy "studio_assets_select_own"
  on public.studio_assets for select
  to authenticated
  using (
    child_id in (
      select cp.id from public.child_profiles cp
      join public.accounts a on a.id = cp.account_id
      where a.user_id = auth.uid()
    )
  );

drop policy if exists "studio_assets_insert_own" on public.studio_assets;
create policy "studio_assets_insert_own"
  on public.studio_assets for insert
  to authenticated
  with check (
    child_id in (
      select cp.id from public.child_profiles cp
      join public.accounts a on a.id = cp.account_id
      where a.user_id = auth.uid()
    )
  );

drop policy if exists "studio_assets_update_own" on public.studio_assets;
create policy "studio_assets_update_own"
  on public.studio_assets for update
  to authenticated
  using (
    child_id in (
      select cp.id from public.child_profiles cp
      join public.accounts a on a.id = cp.account_id
      where a.user_id = auth.uid()
    )
  )
  with check (
    child_id in (
      select cp.id from public.child_profiles cp
      join public.accounts a on a.id = cp.account_id
      where a.user_id = auth.uid()
    )
  );

drop policy if exists "studio_assets_delete_own" on public.studio_assets;
create policy "studio_assets_delete_own"
  on public.studio_assets for delete
  to authenticated
  using (
    child_id in (
      select cp.id from public.child_profiles cp
      join public.accounts a on a.id = cp.account_id
      where a.user_id = auth.uid()
    )
  );

drop policy if exists "studio_templates_select_authenticated" on public.studio_templates;
create policy "studio_templates_select_authenticated"
  on public.studio_templates for select
  to authenticated
  using (true);

-- ============================================================
-- 3. ANALYTICS (read-only aggregate for authenticated users)
-- ============================================================

drop policy if exists "analytics_daily_select_authenticated" on public.analytics_daily;
create policy "analytics_daily_select_authenticated"
  on public.analytics_daily for select
  to authenticated
  using (true);

-- ============================================================
-- 4. ADMIN / SERVICE-ROLE ONLY (explicit deny-all)
-- ============================================================

drop policy if exists "shop_orders_deny_all" on public.shop_orders;
create policy "shop_orders_deny_all"
  on public.shop_orders for all
  to public
  using (false)
  with check (false);

drop policy if exists "shop_downloads_deny_all" on public.shop_downloads;
create policy "shop_downloads_deny_all"
  on public.shop_downloads for all
  to public
  using (false)
  with check (false);

drop policy if exists "shop_order_events_deny_all" on public.shop_order_events;
create policy "shop_order_events_deny_all"
  on public.shop_order_events for all
  to public
  using (false)
  with check (false);

drop policy if exists "shop_webhook_events_deny_all" on public.shop_webhook_events;
create policy "shop_webhook_events_deny_all"
  on public.shop_webhook_events for all
  to public
  using (false)
  with check (false);

drop policy if exists "shop_products_deny_all" on public.shop_products;
create policy "shop_products_deny_all"
  on public.shop_products for all
  to public
  using (false)
  with check (false);

drop policy if exists "shop_categories_deny_all" on public.shop_categories;
create policy "shop_categories_deny_all"
  on public.shop_categories for all
  to public
  using (false)
  with check (false);

drop policy if exists "coupons_deny_all" on public.coupons;
create policy "coupons_deny_all"
  on public.coupons for all
  to public
  using (false)
  with check (false);

drop policy if exists "coupon_usage_deny_all" on public.coupon_usage;
create policy "coupon_usage_deny_all"
  on public.coupon_usage for all
  to public
  using (false)
  with check (false);

drop policy if exists "product_sales_deny_all" on public.product_sales;
create policy "product_sales_deny_all"
  on public.product_sales for all
  to public
  using (false)
  with check (false);

drop policy if exists "product_views_deny_all" on public.product_views;
create policy "product_views_deny_all"
  on public.product_views for all
  to public
  using (false)
  with check (false);

drop policy if exists "email_logs_deny_all" on public.email_logs;
create policy "email_logs_deny_all"
  on public.email_logs for all
  to public
  using (false)
  with check (false);

drop policy if exists "whatsapp_logs_deny_all" on public.whatsapp_logs;
create policy "whatsapp_logs_deny_all"
  on public.whatsapp_logs for all
  to public
  using (false)
  with check (false);

drop policy if exists "automation_rules_deny_all" on public.automation_rules;
create policy "automation_rules_deny_all"
  on public.automation_rules for all
  to public
  using (false)
  with check (false);

drop policy if exists "notification_preferences_deny_all" on public.notification_preferences;
create policy "notification_preferences_deny_all"
  on public.notification_preferences for all
  to public
  using (false)
  with check (false);
