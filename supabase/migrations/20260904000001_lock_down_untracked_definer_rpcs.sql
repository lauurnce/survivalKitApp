-- Lock down seven SECURITY DEFINER RPCs that exist in production but were
-- created by hand and never captured in a migration:
--
--   admin_funnel_counts, admin_dau_30d, admin_active_since, admin_user_totals
--     (read by app/admin/page.tsx), and
--   check_login_lockout, record_login_attempt, clear_login_attempts
--     (the admin login brute-force lockout, app/api/admin/login/route.ts).
--
-- Postgres grants EXECUTE to PUBLIC on every new function, so unless someone
-- revoked it by hand, anon and authenticated can call these through
-- PostgREST with the public publishable key — reading admin metrics, or
-- clearing/poisoning the login lockout. Every legitimate caller uses the
-- service-role client, so revoking from the client roles breaks nothing.
--
-- Their bodies and signatures are unknown to this repo, so this migration
-- deliberately does NOT recreate them. It walks pg_proc by name in schema
-- public, so it covers any signature (and any overloads) and is a no-op on
-- a database where a function does not exist — which is every fresh replay,
-- including CI's postgres:16 job. Revoke/grant are idempotent; re-running
-- this file is safe.

do $$
declare
  fn record;
begin
  for fn in
    select n.nspname as schema_name,
           p.proname as function_name,
           pg_get_function_identity_arguments(p.oid) as identity_args
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prokind = 'f'
      and p.proname in (
        'admin_funnel_counts',
        'admin_dau_30d',
        'admin_active_since',
        'admin_user_totals',
        'check_login_lockout',
        'record_login_attempt',
        'clear_login_attempts'
      )
  loop
    execute format(
      'revoke execute on function %I.%I(%s) from public, anon, authenticated',
      fn.schema_name, fn.function_name, fn.identity_args
    );
    execute format(
      'grant execute on function %I.%I(%s) to service_role',
      fn.schema_name, fn.function_name, fn.identity_args
    );
    raise notice 'locked down %.%(%)',
      fn.schema_name, fn.function_name, fn.identity_args;
  end loop;
end
$$;

-- Legacy anon INSERT policy from 001_initial_schema.sql. No app code path
-- inserts into unlocks as anon (reads and admin updates go through the
-- service-role client, which bypasses RLS), and 20260822000004 already
-- removed the equivalent anon write policies on events, counter_log and
-- waitlist — but no migration ever dropped this one, so any holder of the
-- publishable key could insert 'pending' rows into unlocks directly.
drop policy if exists "public_insert_unlocks" on public.unlocks;
