# Verification: `growth_cohort_agg`, `growth_content_agg`, `growth_demand_agg`, `growth_feedback_agg` RPCs

**Status: UNAPPLIED and UNVERIFIED, pending an owner run.** This migration was
written but never applied to the live project and none of the four RPCs have
ever been called. Nothing below has been executed. This doc is not a record
of what happened — it is the checklist that defines what "passing" looks
like, for the owner to run by hand in the Supabase Studio SQL editor (this
repo has no `supabase db push` workflow wired up; every existing `admin_*`
and `growth_*` aggregate was applied the same way — see the "Applied to
live" comment in `20260706000001_admin_profiles_agg.sql` and the
verification docs for `20260808000000_growth_identity_agg.sql` and
`20260808000001_growth_funnel_agg.sql`).

Do not check any box below, and do not edit a "Result" line, until you have
actually run the query and read actual output. Do not paste real counts,
ratings, feedback text, timings from a production-sized table, or any other
production figure into this file, or into any other tracked file — they
belong only in the gitignored `docs/reports/growth/.data/` (per
`.gitignore`'s `docs/reports/` rule), and only there once a report collector
produces them. This repo is public; every example value below is synthetic.
**This rule is sharpest for `growth_feedback_agg`: never paste a real
`feedback_text` value anywhere in this file — a real quote is a disclosure
with a permanent public URL once this branch merges.**

All four functions are *secondary* reads: each backs one section of the
VANTAGE report (cohorts/retention, content fit, demand, voice of customer)
and a failure in any one of them should degrade that section, not the whole
run — unlike `growth_identity_agg` and `growth_funnel_agg`, which the report
collector treats as fatal if they fail.

## Preconditions

All of the following must already exist on the target project (all are from
migrations applied before this one):

- `events` (`001_initial_schema.sql`, widened by
  `20260706150000_events_widen_type_add_attribution.sql`) with `device_id`,
  `event_type`, `module_id`, `created_at` columns, and the pre-existing
  `idx_events_created` / `idx_events_device` indexes.
- `module_progress` (`20260617000000_module_progress.sql`) with `device_id`
  (text), `module_id` (text), `completed_at`.
- `modules` / `subjects` (`001_initial_schema.sql`) with `id` (uuid),
  `title`, and (for `modules`) `subject_id`.
- `waitlist` (`20260620000000_create_waitlist.sql`) with `device_id`,
  `source`, `willing_to_pay`, `device_type`, `created_at`.
- `user_feedback` (`20260718000000_user_feedback.sql`) with `device_id`
  (uuid, **not** text — unlike `events.device_id` / `payments.device_id`),
  `module_id`, `app_rating`, `module_rating`, `feedback_text`, `created_at`.
- `growth_identity_agg` and `growth_funnel_agg` should already be applied
  (`20260808000000_...` / `20260808000001_...`) — not a hard dependency of
  these four functions, but if either is missing, apply it first so the
  `growth_*` aggregates land in the order they were written.

**Known schema drift — read before Step 2.** `waitlist.year_label` and
`waitlist.subject_title` are used by `growth_demand_agg` below but **no
migration in this repo creates them** on the `waitlist` table (checked by
grepping every migration touching `waitlist`: `20260620000000_create_waitlist.sql`,
`20260623000003_waitlist_unique_per_subject.sql`, `20260623_enable_rls.sql`,
`20260629000001_admin_waitlist_agg.sql`, none of which adds the columns).
Two independent pieces of evidence say the columns exist live anyway: (1)
`app/api/waitlist/route.ts:111-112` writes both columns on every insert, and
(2) the already-shipped `admin_waitlist_agg()` function
(`20260629000001_admin_waitlist_agg.sql`) already selects both columns and
is presumed to be working in production today. **If `growth_demand_agg`
fails in Step 4 below citing `column "year_label" does not exist` or
`column "subject_title" does not exist`, that is real information — it means
the drift this doc warned about is not what's actually live — stop and
inspect the live `waitlist` schema (`\d waitlist` or the Table Editor) before
assuming the function is wrong or patching around it.**

## Step 1 — red: confirm the functions do not exist yet

```sql
select proname from pg_proc
where proname in (
  'growth_cohort_agg', 'growth_content_agg',
  'growth_demand_agg', 'growth_feedback_agg'
);
```

Expected (before migration): 0 rows.

Result: ☐ not yet run

## Step 2 — apply the migration

Paste the full contents of `20260808000003_growth_retention_agg.sql` into
the Supabase Studio SQL editor (connected as `postgres`, which is how the
SQL editor connects by default) and run it. This migration adds no new
index — it is the four function definitions only. **Task
`20260808000002_growth_audience_agg.sql` creates
`events_type_created_idx on events (event_type, created_at desc)`; that
migration is expected to already be applied, since its filename sorts
before this one, but this migration does not depend on it existing to
apply successfully — only Step 3's `growth_content_agg` plan discussion
below depends on it.**

**Record the date this was actually run**, in `YYYY-MM-DD` form:

Result: ☐ not yet run — date applied: __________

**Record which role actually created the functions.** None of the four read
`auth.users`, so the owning role has no `auth`-schema consequence — but a
mismatched owner still changes who each function runs as under
`security definer`, and every other `growth_*`/`admin_*` aggregate records
this, so these four do too. If you ran this through anything other than the
default `postgres` connection, note the actual role here instead of
assuming:

Result: ☐ not yet run — role that created the functions: __________

Re-running the migration a second time must succeed with no errors: every
function body uses `create or replace function`, and the trailing
`revoke`/`grant` statements are unconditional and idempotent by nature.

Result: ☐ not yet run

## Step 3 — confirm the query plans match what each function actually scans

This migration adds no new index of its own. Record each plan honestly —
"a Seq Scan is not a failure" is only true when the table is actually small
enough to make the index not worth consulting; do not write that conclusion
down without checking the row count first.

**3a — `growth_cohort_agg`'s `activity` CTE.** Filters only on
`created_at` (`>= now() - make_interval(...)`), which the pre-existing
`idx_events_created (created_at desc)` (`001_initial_schema.sql`) already
covers.

```sql
explain analyze
select distinct device_id, date_trunc('week', created_at at time zone 'Asia/Manila') as active_week
from events
where created_at >= now() - make_interval(weeks => 10);
```

Result: ☐ not yet run — scan type: ☐ Seq Scan ☐ Index Scan ☐ Bitmap Heap Scan ☐ other: __________ — index named (if any): __________ — execution time: __________ ms

**3b — `growth_cohort_agg`'s `first_seen` CTE.** `select device_id,
min(created_at) ... from events group by device_id` has no `WHERE` clause —
it must read every row in `events` at least once no matter what indexes
exist, because the earliest event for *any* device could be anywhere in the
table's history. A full scan here (`Seq Scan` or a full `Index Scan` on
`idx_events_device`) is expected by design, not a defect — there is no
predicate to add an index for. Record what the plan shows without treating
it as something to fix:

```sql
explain analyze
select device_id, min(created_at)
from events
group by device_id;
```

Result: ☐ not yet run — scan type: ☐ Seq Scan ☐ Index Scan ☐ other: __________ — execution time: __________ ms

**3c — `growth_content_agg`'s `opens` CTE.** Filters `event_type =
'module_open' and module_id is not null` plus a `created_at` range directly
against `events` — a genuine equality-then-range predicate, exactly the
shape `events_type_created_idx (event_type, created_at desc)` (created by
`20260808000002_growth_audience_agg.sql`) serves. Get a real window first:

```bash
npx tsx -e "
import { phWeekWindows } from './lib/reports/phWeek';
const [current] = phWeekWindows(new Date(), 1);
console.log(current.sinceIso, current.untilIso);
"
```

Substitute the two printed timestamps and run:

```sql
explain analyze
select device_id
from events
where event_type = 'module_open'
  and module_id is not null
  and created_at >= '<since>'
  and created_at <  '<until>';
```

A healthy plan uses `events_type_created_idx`. If it instead shows a `Seq
Scan`, first confirm `events_type_created_idx` actually exists
(`select indexname from pg_indexes where tablename = 'events' and indexname = 'events_type_created_idx';`)
before concluding the planner just judged the table small enough to skip
it — a *missing* index and a *judged-not-worth-using* index produce the
same plan shape and must not be conflated:

Result: ☐ not yet run — index exists: ☐ yes ☐ no — scan type: ☐ Seq Scan ☐ Index Scan ☐ Bitmap Heap Scan ☐ other: __________ — execution time: __________ ms

**3d — `growth_demand_agg` / `growth_feedback_agg`'s `windowed` CTEs.**
Both filter only on `created_at` against `waitlist` and `user_feedback`
respectively. Neither table has a plain `created_at` index today:
`waitlist` has none (`20260620000000_create_waitlist.sql` only indexes
`(email, source, subject_title)`); `user_feedback` has
`user_feedback_approved_created_idx` on `(is_quality_approved, created_at desc)`,
whose leading column these queries don't filter on, so it does not serve a
`created_at`-only range predicate. A `Seq Scan` on both is therefore the
expected plan today, not evidence of a missing-but-should-exist index by
itself:

```sql
explain analyze select * from waitlist where created_at >= now() - interval '7 days';
explain analyze select * from user_feedback where created_at >= now() - interval '7 days';
```

**This is genuinely ambiguous without a row count — do not wave it away.**
Run `select count(*) from waitlist;` and `select count(*) from
user_feedback;` (do not record the actual number in this file). If either
table is past roughly 10,000 rows and its `explain analyze` execution time
is above ~50ms, that combination is the discriminating signal that a
dedicated `create index if not exists <table>_created_idx on
<table>(created_at);` is now worth adding in a future migration — note that
finding below rather than adding the index in this pass, since it is outside
this migration's contracted scope:

Result: ☐ not yet run — waitlist: scan type __________, exec time __________ ms, row count past 10k: ☐ yes ☐ no — user_feedback: scan type __________, exec time __________ ms, row count past 10k: ☐ yes ☐ no — index worth adding now: ☐ yes ☐ no ☐ not enough data yet

## Step 4 — green: each function exists and returns the contracted shape

```bash
npx tsx -e "
import { createReportsClient, callRpc } from './scripts/reports/supabaseAdmin';
import { phWeekWindows } from './lib/reports/phWeek';
const [w] = phWeekWindows(new Date(), 1);
const c = createReportsClient();
const args = { p_since: w.sinceIso, p_until: w.untilIso };
Promise.all([
  callRpc(c, 'growth_cohort_agg', { p_weeks: 8 }),
  callRpc(c, 'growth_content_agg', args),
  callRpc(c, 'growth_demand_agg', args),
  callRpc(c, 'growth_feedback_agg', args),
]).then(rs => rs.forEach((r, i) => console.log(i, r.ok, r.error ?? '')));
"
```

Expected: four lines, each `true` with no error.

Result: ☐ not yet run — all four print `true` with no error: ☐ yes ☐ no (list which index/function failed: __________)

Check off each key as you confirm it is present with the right shape in the
underlying JSON — do not write the actual values here:

**`growth_cohort_agg`** — object with exactly two top-level keys:
- ☐ `weekly_active` — array of objects, each with `active_week` (date
  string) and `active_devices` (number)
- ☐ `cohorts` — array of objects, each with `cohort_week` (date string),
  `size`, `returned_week_1`, `returned_week_2` (all numbers)

**`growth_content_agg`** — a JSON array (not an object) of up to `p_limit`
rows, each with:
- ☐ `module_title`
- ☐ `subject_title`
- ☐ `open_devices`
- ☐ `completed_devices` (never null — `coalesce`d to 0)

**`growth_demand_agg`** — object with exactly seven top-level keys:
- ☐ `signups_window`
- ☐ `signups_all_time`
- ☐ `by_source`
- ☐ `by_year`
- ☐ `by_subject`
- ☐ `willing_to_pay`
- ☐ `by_device_type`

Result: ☐ not yet run — actual top-level key count on `growth_demand_agg` matches seven: ☐ yes ☐ no (list the discrepancy: __________)

**`growth_feedback_agg`** — object with exactly five top-level keys:
- ☐ `rows_window`
- ☐ `rows_all_time`
- ☐ `avg_app_rating` (number or null — null only if `windowed` is empty)
- ☐ `avg_module_rating` (number or null — null only if `windowed` is empty)
- ☐ `recent` — array (see Step 9 for what it must NOT contain)

Result: ☐ not yet run

## Step 5 — THE PERMISSION CHECK. Do not skip this one.

This is the most important check in this document. The migration ends with
four `revoke`/`grant` pairs, one per function:

```sql
revoke execute on function growth_cohort_agg(int) from public, anon, authenticated;
grant execute on function growth_cohort_agg(int) to service_role;

revoke execute on function growth_content_agg(timestamptz, timestamptz, int)
  from public, anon, authenticated;
grant execute on function growth_content_agg(timestamptz, timestamptz, int) to service_role;

revoke execute on function growth_demand_agg(timestamptz, timestamptz)
  from public, anon, authenticated;
grant execute on function growth_demand_agg(timestamptz, timestamptz) to service_role;

revoke execute on function growth_feedback_agg(timestamptz, timestamptz, int)
  from public, anon, authenticated;
grant execute on function growth_feedback_agg(timestamptz, timestamptz, int) to service_role;
```

**If any one of these four `revoke`s did not take effect, that function's
data becomes readable by anyone holding the public anon key, with no login
required.** For this migration specifically that means: cohort sizes and
week-over-week return rates (`growth_cohort_agg`), per-module open/complete
volumes (`growth_content_agg`), waitlist demand and willingness-to-pay
breakdowns (`growth_demand_agg`), and — worst of the four — **verbatim user
feedback text and star ratings** (`growth_feedback_agg`). The anon key ships
in this repo's client bundle by design; the only thing standing between
"public read-only key" and "readable cohort, content, demand, and voice of
customer data" is these four `revoke`s actually taking hold.

Verify each was rejected by calling it as `anon`, from this repo, against
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
const anon = createClient(v.NEXT_PUBLIC_SUPABASE_URL, v.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
const args = { p_since: current.sinceIso, p_until: current.untilIso };
Promise.all([
  anon.rpc('growth_cohort_agg', { p_weeks: 8 }),
  anon.rpc('growth_content_agg', args),
  anon.rpc('growth_demand_agg', args),
  anon.rpc('growth_feedback_agg', args),
]).then(rs => rs.forEach((r, i) => console.log(i, r.error?.message ?? 'NONE — THIS IS A PROBLEM')));
"
```

Expected: four printed error messages (permission denied to call the
function), one per line, none reading `NONE`.

**If any line ends in `NONE — THIS IS A PROBLEM`, that function's `revoke`
did not apply.** Do not proceed, do not treat this migration as done for
that function, and do not let any report collector call it until it is
fixed — re-run that function's `revoke` statement by hand, connected as
`postgres` or the function owner, and repeat this step until all four lines
print an error, not `NONE`.

Date this check was actually run, in `YYYY-MM-DD` form:

Result: ☐ not yet run — date checked: __________

Role this check connected to Supabase as (the role running this script,
i.e. which credentials populate `.env.reports.local` — not the role that
created the functions in Step 2):

Result: ☐ not yet run — role connected as: __________

Per-function outcome:

Result: ☐ not yet run — `growth_cohort_agg` rejected: ☐ yes ☐ NO (unresolved problem)
Result: ☐ not yet run — `growth_content_agg` rejected: ☐ yes ☐ NO (unresolved problem)
Result: ☐ not yet run — `growth_demand_agg` rejected: ☐ yes ☐ NO (unresolved problem)
Result: ☐ not yet run — `growth_feedback_agg` rejected: ☐ yes ☐ NO (unresolved problem)

## Step 6 — confirm the service role can call all four

This is how report collectors will actually reach these RPCs (see
`scripts/reports/supabaseAdmin.ts`, which uses the service-role key
specifically because these aggregates are granted to `service_role` alone).
This is the same call as Step 4 — if Step 4 already printed `true` with no
error for all four, this step is already satisfied and needs no separate
run:

Result: ☐ not yet run — same result as Step 4: ☐ yes

## Step 7 — the PH week boundary is a Monday

`growth_cohort_agg`'s `weekly_active` and `cohorts` both bucket on
`date_trunc('week', created_at at time zone 'Asia/Manila')`. Confirm the
Manila week actually starts on a Monday (`date_trunc('week', ...)` in
Postgres always starts weeks on Monday per ISO 8601 — this step is
confirming the `at time zone` conversion didn't get lost somewhere, not
re-deriving that Postgres convention):

```sql
select date_trunc('week', now() at time zone 'Asia/Manila')::date as ph_week_start,
       extract(isodow from date_trunc('week', now() at time zone 'Asia/Manila')) as dow;
```

Expected: `dow` = 1.

Result: ☐ not yet run — `dow` = 1: ☐ yes ☐ no (investigate — a conversion is missing somewhere)

Then, using the Step 4 `growth_cohort_agg` output, confirm every
`active_week` value in `weekly_active` and every `cohort_week` value in
`cohorts` is itself a Monday (same `extract(isodow from ...)` check applied
to each date, or simply eyeball that each date's day-of-week is Monday):

Result: ☐ not yet run — every `active_week` and `cohort_week` is a Monday: ☐ yes ☐ no (list any offending date's weekday, not the date's meaning: __________)

## Step 8 — confirm `growth_content_agg` actually returns rows

This is the check that the `m.id::text = c.module_id` join in the
`completions` CTE isn't silently matching zero rows (or that `opens ⋈
modules ⋈ subjects` isn't itself empty). Using the Step 4 output for
`growth_content_agg`:

Result: ☐ not yet run — array length > 0: ☐ yes ☐ no (investigate — either no `module_open` events landed in the window, or the `opens ⋈ modules` join is broken)

If the array is non-empty, confirm at least one row has `completed_devices >
0` (proves the `module_progress.module_id::text` cast actually matched a
live row rather than every device merely finishing zero modules that week
— a non-empty array with `completed_devices` uniformly 0 across every row is
not itself a failure, since `module_progress` is written on a different
event than `module_open` and a given week can genuinely have zero
completions, but it is the case worth a second look rather than an
automatic pass):

Result: ☐ not yet run — at least one row has `completed_devices` > 0: ☐ yes ☐ no (no completions this window — plausible but re-check with a wider window before concluding the join is broken) ☐ n/a (array was empty per the check above)

## Step 9 — confirm `growth_feedback_agg` leaks nothing

The `recent` array is the one place in this whole report that returns
verbatim user text, which is only safe because it is scoped to
`docs/reports/growth/.data/` (gitignored) and never committed. Using the
Step 4 output for `growth_feedback_agg`, inspect the **keys** present on
each object inside `recent` — not their values:

```bash
npx tsx -e "
import { createReportsClient, callRpc } from './scripts/reports/supabaseAdmin';
import { phWeekWindows } from './lib/reports/phWeek';
const [w] = phWeekWindows(new Date(), 1);
callRpc(createReportsClient(), 'growth_feedback_agg', { p_since: w.sinceIso, p_until: w.untilIso })
  .then(r => {
    const rows = (r.data as any)?.recent ?? [];
    const keys = new Set<string>();
    for (const row of rows) for (const k of Object.keys(row)) keys.add(k);
    console.log('keys seen:', [...keys].sort());
    console.log('leaks device_id:', keys.has('device_id'));
    console.log('leaks user_id:', keys.has('user_id'));
    console.log('leaks coupon_code:', keys.has('coupon_code'));
  });
"
```

Expected keys (only these, though some may be absent if `recent` is empty):
`created_at`, `app_rating`, `module_rating`, `feedback_text`, `module_title`.

**If `leaks device_id`, `leaks user_id`, or `leaks coupon_code` prints
`true`, this is a P0** — the function is returning identifying or
monetizable data (a coupon code is redeemable) alongside verbatim personal
text, and must not be left applied until the `select` list in
`growth_feedback_agg`'s `recent` sub-query is fixed to drop the leaking
column and the migration is re-applied.

Result: ☐ not yet run — leaks `device_id`: ☐ no (expected) ☐ YES (P0, stop) — leaks `user_id`: ☐ no (expected) ☐ YES (P0, stop) — leaks `coupon_code`: ☐ no (expected) ☐ YES (P0, stop)

## Step 10 — the window is half-open, for the three windowed functions

`growth_content_agg`, `growth_demand_agg`, and `growth_feedback_agg` all
take `p_since`/`p_until` (unlike `growth_cohort_agg`, which only takes
`p_weeks`). Confirm consecutive PH weeks abut exactly and each function
echoes back nothing that would suggest it silently re-derived its own
window:

```bash
npx tsx -e "
import { createReportsClient, callRpc } from './scripts/reports/supabaseAdmin';
import { phWeekWindows } from './lib/reports/phWeek';
const [current, previous] = phWeekWindows(new Date(), 2);
console.log('previous.untilIso === current.sinceIso:', previous.untilIso === current.sinceIso);
const c = createReportsClient();
Promise.all([
  callRpc(c, 'growth_demand_agg', { p_since: current.sinceIso,  p_until: current.untilIso }),
  callRpc(c, 'growth_demand_agg', { p_since: previous.sinceIso, p_until: previous.untilIso }),
]).then(([curR, prevR]) => {
  console.log('current call ok:', curR.ok, curR.error ?? '');
  console.log('previous call ok:', prevR.ok, prevR.error ?? '');
});
"
```

Unlike `growth_funnel_agg`, none of these three functions echoes `since`/
`until` back in its JSON, so there is no equivalent of the funnel doc's
"echoed since/until match" check — the half-open guarantee here rests
entirely on the SQL's `>= p_since and < p_until` comparison (present
verbatim in all three functions' `windowed` CTEs) plus `phWeekWindows`'s own
test coverage (Task 1). This step only confirms both calls succeed with
adjacent windows and that `previous.untilIso === current.sinceIso` holds.

Result: ☐ not yet run — `previous.untilIso === current.sinceIso`: ☐ yes ☐ no — both calls `ok: true`: ☐ yes ☐ no

## Step 11 — record the demand-drift finding, described not quoted

If Step 2's `waitlist.year_label` / `subject_title` caveat turned out to be
correct (the columns exist live despite no migration adding them), record
that the drift is confirmed and the function is safe as written. If instead
`growth_demand_agg` errored on either column, record that finding here
instead of silently patching the function — this migration should not be
marked done until that discrepancy is resolved with the owner:

Result: ☐ not yet run — `year_label`/`subject_title` confirmed live: ☐ yes ☐ no (function errored — see note above, do not mark this migration done)
