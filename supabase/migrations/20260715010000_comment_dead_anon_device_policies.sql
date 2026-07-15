-- Documentation-only migration — no policy logic changes.
--
-- Audit finding: policies on module_progress, subscriptions, and payments
-- that gate the `anon` role via
--   device_id = current_setting('app.device_id', true)
-- reference a Postgres session variable ("app.device_id") that nothing in
-- this codebase ever calls set_config() to populate (confirmed: no grep hit
-- for set_config or app.device_id outside these policy definitions). With
-- the setting unset, current_setting(..., true) returns NULL, and
-- `device_id = NULL` is never true in SQL — so these anon policies always
-- deny. This fails CLOSED (safe), not open, but is worth documenting so a
-- future reader doesn't mistake it for an ACTIVE per-device access control
-- and build on top of an assumption that it's enforcing anything.
--
-- All real reads and writes to these tables go through Next.js API routes
-- using the Supabase SERVICE ROLE client (which bypasses RLS entirely) and
-- do their own device_id / user_id filtering in application code — see
-- app/api/progress/route.ts, lib/payments.ts, lib/account.ts. If a future
-- change wants to actually use the anon key with PostgREST directly for
-- these tables, either wire up set_config('app.device_id', ..., true) in a
-- Postgres function invoked per-request, or drop these anon policies
-- entirely and keep everything on the service-role + app-code-filtering
-- pattern already in use.
comment on policy "anon_select_module_progress" on public.module_progress is
  'Currently unreachable: gates on current_setting(''app.device_id'', true), which nothing in the app ever sets. Fails closed. Real access goes through service-role routes with app-level device_id filtering — see 20260715010000_comment_dead_anon_device_policies.sql for detail.';
comment on policy "anon_insert_module_progress" on public.module_progress is
  'Currently unreachable — see anon_select_module_progress comment on this table.';
comment on policy "anon_delete_module_progress" on public.module_progress is
  'Currently unreachable — see anon_select_module_progress comment on this table.';

comment on policy "device reads own subscriptions" on public.subscriptions is
  'Currently unreachable: gates on current_setting(''app.device_id'', true), which nothing in the app ever sets. Fails closed. Real access goes through service-role routes (lib/account.ts, lib/subscriptions.ts) with app-level device_id/user_id filtering.';

comment on policy "device reads own payments" on public.payments is
  'Currently unreachable: gates on current_setting(''app.device_id'', true), which nothing in the app ever sets. Fails closed. Real access goes through service-role routes (lib/payments.ts, app/api/admin/reconcile) with app-level device_id/user_id filtering.';
