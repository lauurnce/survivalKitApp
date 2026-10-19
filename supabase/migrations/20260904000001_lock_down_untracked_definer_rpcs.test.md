# Verification: lock down untracked SECURITY DEFINER RPCs + drop `public_insert_unlocks`

**Not yet applied.** Apply by hand in the Supabase Studio SQL editor,
connected as `postgres` (it is also the only file in
`scripts/db/consolidated-pending.sql` at the time it was added). Nothing
below has been run against production. Do not check a box or fill a
"Result" line until you have actually run the query and read real output.
This repo is public — never paste a production figure into this file.

The seven functions this migration touches were created directly in
production and exist in no migration, so their bodies and signatures are
unknown here. The migration does **not** recreate them; it only revokes
`EXECUTE` from `public, anon, authenticated` and grants it to
`service_role`, for every overload found by name in schema `public`.

## Step 0 — record the before state

```sql
select p.proname,
       pg_get_function_identity_arguments(p.oid) as args,
       p.prosecdef as security_definer,
       has_function_privilege('anon', p.oid, 'execute') as anon_can_execute,
       has_function_privilege('authenticated', p.oid, 'execute') as authenticated_can_execute,
       has_function_privilege('service_role', p.oid, 'execute') as service_role_can_execute
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('admin_funnel_counts', 'admin_dau_30d', 'admin_active_since',
                    'admin_user_totals', 'check_login_lockout',
                    'record_login_attempt', 'clear_login_attempts')
order by 1, 2;

select policyname, cmd, roles
from pg_policies
where schemaname = 'public' and tablename = 'unlocks';
```

Note (privately, not here) which functions anon could execute before — that
is the size of the exposure this closes.

Result: ☐ not yet run

## Step 1 — apply the migration

Paste the full contents of
`20260904000001_lock_down_untracked_definer_rpcs.sql` and run it. The
messages pane prints one `locked down public.<fn>(<args>)` notice per
function found. Run it a second time: it must succeed with no errors.

Result: ☐ not yet run — date applied: __________

## Step 2 — the client roles can no longer execute, service_role still can

Re-run the first Step 0 query. Expected for every row:
`anon_can_execute = false`, `authenticated_can_execute = false`,
`service_role_can_execute = true`. Expected row count: seven, unless a
function has overloads (each overload is its own row, all locked).

Result: ☐ not yet run

## Step 3 — the legacy anon insert policy is gone

Re-run the `pg_policies` query. Expected: no row named
`public_insert_unlocks`.

Result: ☐ not yet run

## Step 4 — the app still works through service_role

- ☐ `/admin` dashboard loads with its funnel, DAU, active-now and user-total
  panels populated (those four RPCs are called with the service-role client
  in `app/admin/page.tsx`).
- ☐ A wrong admin password returns 401; a correct one logs in (the three
  lockout RPCs in `app/api/admin/login/route.ts`). No
  `check_login_lockout RPC error` in the Vercel runtime logs — that line
  would mean service_role lost access and login is running on the fallback
  limiter.
- ☐ From a shell with only the publishable key, the RPC is refused:

  ```bash
  curl -s -X POST "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/rpc/admin_user_totals" \
    -H "apikey: $NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" \
    -H "content-type: application/json" -d '{"p_new_days":3}'
  ```

  Expected: a `permission denied for function` error (PostgREST 401/403),
  not data.

Result: ☐ not yet run

## Fresh-database replay (already verified)

On a fresh database none of the seven functions exist, so the `do` block's
loop runs zero times and the file is a no-op apart from the
`drop policy if exists`. Verified 2026-10-19 by replaying all
`supabase/migrations/*.sql` in byte order against PGlite with the CI
bootstrap from `.github/workflows/db-migrations.yml`, re-running this file
a second time, and separately against stub definer functions with these
names (including a two-overload `admin_user_totals` and a same-named decoy
in another schema, which was correctly left alone): every `public` overload
ended with `anon`/`authenticated` unable to execute and `service_role`
able to.
