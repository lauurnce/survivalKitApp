# Verification: `growth_funnel_agg` RPC

**Status: APPLIED to production 2026-08-25; permission checks PASSED.** Applied via `npx supabase db query --linked --file scripts/db/consolidated-pending.sql` as role `postgres` (owner-authorized autonomous run). Catalog check: `has_function_privilege` = anon false / authenticated false / service_role true on every growth_% function. Remaining Result lines below are filled only where actually executed. This migration was
written but never applied to the live project and the RPC has never been
called. Nothing below has been executed. This doc is not a record of what
happened — it is the checklist that defines what "passing" looks like, for
the owner to run by hand in the Supabase Studio SQL editor (this repo has no
`supabase db push` workflow wired up; every existing `admin_*` and `growth_*`
aggregate was applied the same way — see the "Applied to live" comment in
`20260706000001_admin_profiles_agg.sql` and the verification doc for
`20260808000000_growth_identity_agg.sql`).

Do not check any box below, and do not edit a "Result" line, until you have
actually run the query and read actual output. Do not paste real counts,
timings from a production-sized table, or any other production figure into
this file, or into any other tracked file — they belong only in the
gitignored `docs/reports/growth/.data/` (per `.gitignore`'s `docs/reports/`
rule), and only there once a report collector produces them. This repo is
public; every example value below is synthetic.

## Preconditions

All of the following must already exist on the target project (all are from
migrations applied before this one):

- `events` (`001_initial_schema.sql`, widened by
  `20260706150000_events_widen_type_add_attribution.sql`) with `device_id`,
  `event_type`, `subject_id`, `created_at` columns, and the pre-existing
  `idx_events_created` / `idx_events_device` indexes.
- `payments` (`20260624120000_payments_ledger.sql`) with `device_id`,
  `paid_at`.
- `subscriptions` (`20260623100000_subscriptions.sql`) with `device_id`,
  `created_at`.
- `growth_identity_agg` should already be applied
  (`20260808000000_growth_identity_agg.sql`) — not a hard dependency of this
  function, but if it is missing, apply it first so the two `growth_*`
  aggregates land in the order they were written.

## Step 1 — red: confirm the function does not exist yet

```sql
select proname from pg_proc where proname = 'growth_funnel_agg';
```

Expected (before migration): 0 rows.

Result: ☐ not yet run

## Step 2 — apply the migration

Paste the full contents of `20260808000001_growth_funnel_agg.sql` into the
Supabase Studio SQL editor (connected as `postgres`, which is how the SQL
editor connects by default) and run it. This migration adds no new index —
it is the function definition only.

**Record the date this was actually run**, in `YYYY-MM-DD` form:

Result: ☐ not yet run — date applied: __________

**Record which role actually created the function.** Unlike
`growth_identity_agg`, this function does not read `auth.users`, so the
owning role has no `auth`-schema consequence — but a mismatched owner still
changes who the function runs as under `security definer`, and every other
`growth_*`/`admin_*` aggregate records this, so this one does too. If you ran
this through anything other than the default `postgres` connection, note the
actual role here instead of assuming:

Result: ☐ not yet run — role that created the function: __________

Re-running the migration a second time must succeed with no errors: the
function body uses `create or replace function`, and the trailing
`revoke`/`grant` statements are unconditional and idempotent by nature.

Result: ☐ not yet run

## Step 3 — confirm the query plan matches what the function actually scans

This migration adds no new index. `growth_funnel_agg`'s `windowed` CTE
filters only on `created_at` (`>= p_since and < p_until`) — the pre-existing
`idx_events_created (created_at desc)` index (`001_initial_schema.sql`)
already covers that predicate. `event_type` is applied afterward, inside the
`steps` CTE's aggregate `FILTER (...)` clauses: a `FILTER` clause restricts
which rows get counted into which bucket, not which rows the scan reads off
disk, so an index leading with `event_type` would not narrow this scan —
`steps` also computes an unfiltered `any_event` count, so every row in the
window has to be visited regardless of its type. The `dead` CTE has no
`WHERE` clause at all: it is deliberately all-time (see the migration's
comment), so it always reads every row in `events`, independent of any
index.

Get the current PH week's window boundaries:

```bash
npx tsx -e "
import { phWeekWindows } from './lib/reports/phWeek';
const [current] = phWeekWindows(new Date(), 1);
console.log(current.sinceIso, current.untilIso);
"
```

Substitute the two printed timestamps for `<since>` / `<until>` below and run
this in the SQL editor — it reproduces exactly what the `windowed` CTE scans,
with no `event_type` predicate:

```sql
explain analyze
select device_id, event_type, subject_id
from events
where created_at >= '<since>'
  and created_at <  '<until>';
```

Record the plan's scan type and its "Execution Time" line. A healthy plan
uses `idx_events_created` — an `Index Scan` or `Bitmap Heap Scan` naming it
in the plan — to locate the window's rows and then reads each one; there is
no further predicate left to filter by, so this is a range read, not a
narrow lookup. On a table small enough that Postgres judges reading
everything to be cheaper than consulting the index, a `Seq Scan` is not
itself a failure — record what the plan actually says rather than assuming
an `Index Scan` appears:

Result: ☐ not yet run — scan type: ☐ Seq Scan ☐ Index Scan ☐ Bitmap Heap Scan ☐ other: __________ — index named in the plan (if any): __________ — execution time: __________ ms

## Step 4 — green: the function exists and returns the contracted shape

```bash
npx tsx -e "
import { createReportsClient, callRpc } from './scripts/reports/supabaseAdmin';
import { phWeekWindows } from './lib/reports/phWeek';
const [current] = phWeekWindows(new Date(), 1);
callRpc(createReportsClient(), 'growth_funnel_agg', { p_since: current.sinceIso, p_until: current.untilIso })
  .then(r => console.log(current.label, JSON.stringify(r, null, 2)));
"
```

Expected: `r.ok === true`, `r.error === null`, and the printed JSON's `data`
is a single object with exactly six top-level keys — `since`, `until`,
`steps`, `ledger`, `entitlements`, `dead_events` — and every nested value a
number or an ISO timestamp string (never null, never absent). Check off each
key as you confirm it is present with the right shape — do not write the
actual number here:

- ☐ `since` — ISO timestamp, equal to the `sinceIso` passed in
- ☐ `until` — ISO timestamp, equal to the `untilIso` passed in
- ☐ `steps.enter`
- ☐ `steps.year_select`
- ☐ `steps.subject_open`
- ☐ `steps.subject_open_any`
- ☐ `steps.module_open`
- ☐ `steps.paywall_teaser_view`
- ☐ `steps.paywall_teaser_click`
- ☐ `steps.subscribe_click`
- ☐ `steps.any_event`
- ☐ `ledger.paid`
- ☐ `ledger.paid_after_subscribe_click`
- ☐ `entitlements.subscriptions_created`
- ☐ `dead_events.unlock_click_rows`
- ☐ `dead_events.unlock_submitted_rows`
- ☐ `dead_events.dead_last_seen` — ISO timestamp or `null` (`null` only if
  neither dead event type has ever been recorded — Observation 2 in Step 8
  below expects both row counts to be non-zero, which would make `null` here
  unexpected)

Result: ☐ not yet run

## Step 5 — THE PERMISSION CHECK. Do not skip this one.

This is the most important check in this document. The migration ends with:

```sql
revoke execute on function growth_funnel_agg(timestamptz, timestamptz)
  from public, anon, authenticated;
grant execute on function growth_funnel_agg(timestamptz, timestamptz) to service_role;
```

**If that `revoke` did not take effect, funnel and conversion data —
distinct-device counts through every step of the paywall, plus the number of
paying devices in any window an anonymous caller chooses — becomes readable
by anyone holding the public anon key, with no login required.** The anon
key ships in this repo's client bundle by design; the only thing standing
between "public read-only key" and "readable business metrics" is this
`revoke` actually taking hold.

Verify it was rejected by calling the RPC as `anon`, from this repo, against
the production project (uses `.env.reports.local`, which must already be
populated with production values per `lib/reports/reportsEnv.ts`):

```bash
npx tsx -e "
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { parseEnvFile } from './lib/reports/reportsEnv';
import { phWeekWindows } from './lib/reports/phWeek';
const v = parseEnvFile(readFileSync('.env.reports.local','utf8'));
const [current] = phWeekWindows(new Date(), 1);
createClient(v.NEXT_PUBLIC_SUPABASE_URL, v.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
  .rpc('growth_funnel_agg', { p_since: current.sinceIso, p_until: current.untilIso })
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
specifically because these aggregates are granted to `service_role` alone).
This is the same call as Step 4 — if Step 4 already printed `ok: true` and
`error: null`, this step is already satisfied and needs no separate run:

Result: ☐ not yet run — same result as Step 4: ☐ yes

## Step 7 — the window is half-open

Run the Step 4 script twice in the same process, once for the current PH
week and once for the previous one:

```bash
npx tsx -e "
import { createReportsClient, callRpc } from './scripts/reports/supabaseAdmin';
import { phWeekWindows } from './lib/reports/phWeek';
const [current, previous] = phWeekWindows(new Date(), 2);
Promise.all([
  callRpc(createReportsClient(), 'growth_funnel_agg', { p_since: current.sinceIso,  p_until: current.untilIso }),
  callRpc(createReportsClient(), 'growth_funnel_agg', { p_since: previous.sinceIso, p_until: previous.untilIso }),
]).then(([curRes, prevRes]) => {
  console.log('previous.untilIso === current.sinceIso:', previous.untilIso === current.sinceIso);
  console.log('current  echoed since/until match:', curRes.data.since === current.sinceIso && curRes.data.until === current.untilIso);
  console.log('previous echoed since/until match:', prevRes.data.since === previous.sinceIso && prevRes.data.until === previous.untilIso);
});
"
```

Expected: all three printed lines say `true`. `phWeekWindows` is already
covered by its own test (Task 1); this step is checking that this function's
`since`/`until` in the returned JSON are the exact values passed in, unmodified
— not re-testing `phWeekWindows` itself. An event landing on the exact
boundary instant between two weeks must be countable in exactly one of them,
which the half-open `>= p_since and < p_until` comparison in the migration is
what guarantees; this step only confirms the boundary values themselves are
passed through unchanged.

Result: ☐ not yet run — all three lines print `true`: ☐ yes ☐ no (list which line failed: __________)

## Step 8 — record the three funnel-shape observations, described not quoted

Using the Step 4 output, record only the *relationship* between values below
— never the values themselves, which belong solely in a report collector's
output under `docs/reports/growth/.data/` (gitignored), not in this tracked
file.

**Observation 1 — `steps.subject_open_any` vs `steps.subject_open`.** The
subject *list* page emits `subject_open` without a `subject_id`; the modules
page emits it with one. `subject_open_any` (unfiltered) should therefore be
greater than `subject_open` (filtered on `subject_id is not null`), since the
unfiltered count includes both pages' events and the filtered one includes
only the second. If they come out equal, the subject-list page is not
emitting what its source (`app/(main)/year/[yearId]/subjects/page.tsx:81`)
says it emits — stop and investigate before trusting the funnel, and do not
check the "greater (expected)" box below unless the values actually came out
that way.

Result: ☐ not yet run — `subject_open_any` vs `subject_open`: ☐ greater (expected) ☐ equal (investigate — do not proceed) ☐ less (should not be possible — investigate)

**Observation 2 — dead-event evidence.** Using the Step 4 output's
`dead_events` object: confirm `unlock_click_rows` and `unlock_submitted_rows`
are both non-zero (there is historical data — these types were live before
the pivot).

Treat 2026-06-23 — the date `subscriptions`'s migration
(`20260623100000_subscriptions.sql`) landed — only as a **lower bound**, not
a cutoff. `20260706150000_events_widen_type_add_attribution.sql`'s own
comment records that `subscribe_click`, `paywall_teaser_view`, and
`paywall_teaser_click` inserts were silently rejected by the live DB
constraint from launch until that migration landed on **2026-07-06**, two
weeks after `subscriptions` itself. So a `dead_last_seen` anywhere in the
**2026-06-23 → 2026-07-06 window is plausible and not itself alarming**: the
client's switch-over away from the old unlock flow had no reason to be
instantaneous with either migration landing, and the new funnel events
were not even acceptable to the database for those two weeks. Only a
`dead_last_seen` **after 2026-07-06** — once the widened constraint made the
live funnel fully insertable — means something is still emitting one of
these two dead event types after the pivot was actually in place, which
would contradict the "dead event" finding and must be investigated, not
waved through.

Result: ☐ not yet run — both row counts non-zero: ☐ yes ☐ no — `dead_last_seen` on or before 2026-07-06: ☐ yes ☐ no (investigate if no) — falls within 2026-06-23 → 2026-07-06 specifically: ☐ yes ☐ no ☐ n/a (before 2026-06-23)

**Observation 3 — `steps.any_event` vs `steps.enter`.** `any_event` counts
every device that emitted anything in the window; `enter` counts only
devices whose first-touch event was recorded. `any_event` should be greater
than or equal to `enter` — a device arriving on a shared deep link can emit
`module_open` without ever emitting `enter`, but every device that emits
`enter` is by definition also counted in `any_event`. It should never be
smaller.

Result: ☐ not yet run — `any_event` >= `enter`: ☐ yes ☐ no (should not be possible — investigate)

## Step 9 — hand off to Task 11

If Observation 2 above holds (both dead-event row counts non-zero,
`dead_last_seen` on or before 2026-07-06), that is the evidence Task 11's
admin-dashboard repair needs to justify removing `unlock_click` /
`unlock_submitted` as rendered live funnel steps (`app/admin/page.tsx:29-30`,
`components/AdminDashboard.tsx:867-868`). Note here only that the evidence
was produced, not the figures themselves:

Result: ☐ not yet run — dead-event evidence available for Task 11: ☐ yes ☐ no
