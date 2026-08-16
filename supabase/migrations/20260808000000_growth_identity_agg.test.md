# Verification: `growth_identity_agg` RPC

**Status: UNAPPLIED and UNVERIFIED, pending an owner run.** This migration was
written but never applied to the live project and the RPC has never been
called. Nothing below has been executed. This doc is not a record of what
happened — it is the checklist that defines what "passing" looks like, for
the owner to run by hand in the Supabase Studio SQL editor (this repo has no
`supabase db push` workflow wired up; every existing `admin_*` aggregate was
applied the same way — see the "Applied to live" comment in
`20260706000001_admin_profiles_agg.sql`).

Do not check any box below, and do not edit the "Result" lines, until you
have actually run the query and read actual output. Do not paste the actual
counts into this file, or into any other tracked file — they belong only in
the gitignored `docs/reports/growth/.data/` (per `.gitignore`'s
`docs/reports/` rule), and only there once a report collector produces them.

## Preconditions

All of the following must already exist on the target project (all are from
migrations applied before this one):

- `auth.users` (Supabase-managed) with an `email_confirmed_at` column.
- `profiles` (`20260706000000_profiles.sql`).
- `events` (`001_initial_schema.sql`, widened by
  `20260706150000_events_widen_type_add_attribution.sql`) with `device_id`
  and `event_type` columns.
- `payments` (`20260624120000_payments_ledger.sql`) with `device_id`, plus
  `user_id` added by `20260624200000_accounts_user_id.sql`.
- `subscriptions` (`20260623100000_subscriptions.sql`) with `device_id`,
  `status`, `current_period_end`.
- `waitlist` (`20260620000000_create_waitlist.sql`) with `email`.
- `class_members` (`20260716000000_classes.sql`) with `device_id`.
- `user_feedback` (`20260718000000_user_feedback.sql`) with `device_id`.

## Step 1 — red: confirm the function does not exist yet

```sql
select proname from pg_proc where proname = 'growth_identity_agg';
```

Expected (before migration): 0 rows.

Result: ☐ not yet run

## Step 2 — apply the migration

Paste the full contents of `20260808000000_growth_identity_agg.sql` into the
Supabase Studio SQL editor (connected as `postgres`, which is how the SQL
editor connects by default) and run it.

**Record which role actually created the function** — this matters because
the function is `security definer` and reads `auth.users`, which only the
owning role's privileges make possible (see Step 4). If you ran this through
anything other than the default `postgres` connection, note the actual role
here instead of assuming:

Result: ☐ not yet run — date applied: __________ — role that created the function: ___________

Re-running the migration a second time must succeed with no errors: the
function body uses `create or replace function`, and the trailing
`revoke`/`grant` statements are unconditional and idempotent by nature.

Result: ☐ not yet run

## Step 3 — green: the function exists and returns the contracted shape

```sql
select growth_identity_agg();
```

Expected: exactly one row, one JSON object, with all thirteen keys present
and every value numeric (not null, not a string). Check off each key as you
confirm it is present and numeric — do not write the actual number here:

- ☐ `accounts`
- ☐ `accounts_confirmed`
- ☐ `profiles`
- ☐ `devices_entered`
- ☐ `devices_any_event`
- ☐ `devices_paid`
- ☐ `devices_subscribed`
- ☐ `subscriptions_active`
- ☐ `payments_with_user_id`
- ☐ `payments_total`
- ☐ `waitlist_emails`
- ☐ `class_member_devices`
- ☐ `feedback_devices`

Result: ☐ not yet run

## Step 4 — confirm `auth.users` was actually reachable

If Step 3 returned successfully with a non-null `accounts` and
`accounts_confirmed`, `auth.users` was reachable from inside the function —
record that here. If Step 3 instead errored referencing `auth.users` or
`permission denied for schema auth`, the role that created the function
(recorded in Step 2) cannot read the auth schema; `security definer` runs as
the function's *owner*, and a function created through the dashboard SQL
editor while connected as `postgres` can read `auth.users`, but one created
by a lesser role cannot. If that happens, drop and re-create the function
while connected as `postgres` and re-run Step 3 before continuing.

Record whichever was actually true. Do not assume it worked because it
worked for the other `admin_*` aggregates — check it here, for this
function, because it is the one new dependency on the `auth` schema:

Result: ☐ not yet run — `auth.users` reachable: ☐ yes ☐ no — owning role: ___________

## Step 5 — THE PERMISSION CHECK. Do not skip this one.

This is the most important check in this document. The migration ends with:

```sql
revoke execute on function growth_identity_agg() from public, anon, authenticated;
grant execute on function growth_identity_agg() to service_role;
```

If that `revoke` did not take effect, every identity count in this function
— including `accounts`, a direct read of `auth.users` — is callable by
anyone holding the public anon key, with no login required. Verify it was
rejected by calling the RPC as `anon`, from this repo, against the
production project (uses `.env.reports.local`, which must already be
populated with production values per `lib/reports/reportsEnv.ts`):

```bash
npx tsx -e "
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { parseEnvFile } from './lib/reports/reportsEnv';
const v = parseEnvFile(readFileSync('.env.reports.local','utf8'));
createClient(v.NEXT_PUBLIC_SUPABASE_URL, v.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
  .rpc('growth_identity_agg')
  .then(r => console.log('anon call error:', r.error?.message ?? 'NONE — THIS IS A PROBLEM'));
"
```

Expected: a printed error message (permission denied to call the function).

**If the output ends in `NONE — THIS IS A PROBLEM`, the revoke did not
apply.** Do not proceed, do not treat this migration as done, and do not let
any report collector call this RPC until it is fixed — re-run the `revoke`
statement by hand, connected as `postgres` or the function owner, and repeat
this step until it prints an error, not `NONE`.

Result: ☐ not yet run — anon call rejected: ☐ yes (error printed) ☐ NO — printed `NONE` (unresolved problem)

## Step 6 — confirm the service role can call it

This is how report collectors will actually reach this RPC (see
`scripts/reports/supabaseAdmin.ts`, which uses the service-role key
specifically because these aggregates are granted to `service_role` alone):

```bash
npx tsx -e "import { createReportsClient, callRpc } from './scripts/reports/supabaseAdmin'; callRpc(createReportsClient(), 'growth_identity_agg').then(r => console.log('ok:', r.ok, 'error:', r.error))"
```

Expected: `ok: true` and `error: null`.

Result: ☐ not yet run

## Step 7 — record the reconciliation, described not quoted

Once Steps 3–6 pass, compare `accounts` against `devices_entered` from the
Step 3 output. State here only whether they differ, and roughly by what
order of magnitude — never the actual figures, which belong solely in a
report collector's output under `docs/reports/growth/.data/` (gitignored),
not in this tracked file:

Result: ☐ not yet run — `accounts` vs `devices_entered`: ☐ roughly the same order of magnitude ☐ differ by roughly an order of magnitude ☐ differ by more than an order of magnitude

If they differ by roughly an order of magnitude, that is consistent with the
hypothesis in the migration's header comment and in
`docs/POST-MORTEM.md`: the earlier "total signed-up users" figure most
likely counted devices, not accounts.
