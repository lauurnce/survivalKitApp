# Verification: `growth_acquisition_agg` and `growth_segment_agg` RPCs

**Status: UNAPPLIED and UNVERIFIED, pending an owner run.** This migration was
written but never applied to the live project and neither RPC has ever been
called. Nothing below has been executed. This doc is not a record of what
happened — it is the checklist that defines what "passing" looks like, for
the owner to run by hand in the Supabase Studio SQL editor (this repo has no
`supabase db push` workflow wired up; every existing `admin_*` and `growth_*`
aggregate was applied the same way — see the "Applied to live" comment in
`20260706000001_admin_profiles_agg.sql` and the verification docs for
`20260808000000_growth_identity_agg.sql` and `20260808000001_growth_funnel_agg.sql`).

Do not check any box below, and do not edit a "Result" line, until you have
actually run the query and read actual output. Do not paste real counts,
timings from a production-sized table, or any other production figure into
this file, or into any other tracked file — they belong only in the
gitignored `docs/reports/growth/.data/` (per `.gitignore`'s `docs/reports/`
rule), and only there once a report collector produces them. This repo is
public; every example value below is synthetic.

This migration is different from the two before it in one respect: **it
creates an index**, not just function definitions. No other house migration
uses `CONCURRENTLY` for an index build (see the plain `create index if not
exists` statements in `001_initial_schema.sql` and `20260624120000_payments_ledger.sql`)
and this one does not either — the table is small enough that a blocking
build is a non-event, and that's a call the owner has already made
consistently across every prior migration, not one this doc revisits.

## Preconditions

All of the following must already exist on the target project (all are from
migrations applied before this one):

- `events` (`001_initial_schema.sql`, widened by
  `20260706150000_events_widen_type_add_attribution.sql`) with `device_id`,
  `event_type`, `year_id`, `subject_id`, `created_at`, `referrer`,
  `utm_source`, `utm_medium`, `utm_campaign` columns, and the pre-existing
  `idx_events_created` / `idx_events_device` indexes.
- `payments` (`20260624120000_payments_ledger.sql`) with `device_id`,
  `year_id`, `subject_id`, `paid_at`.
- `years` (`001_initial_schema.sql`) with `id`, `label`, `sort_order`.
- `subjects` (`001_initial_schema.sql`) with `id`, `title`, `year_id`.
- `growth_identity_agg` and `growth_funnel_agg` should already be applied
  (`20260808000000_growth_identity_agg.sql`, `20260808000001_growth_funnel_agg.sql`)
  — not a hard dependency of either function here, but if either is missing,
  apply them first so the `growth_*` aggregates land in the order they were
  written.

## Step 1 — red: confirm neither function nor the index exists yet

```sql
select proname from pg_proc
where proname in ('growth_acquisition_agg', 'growth_segment_agg');
```

Expected (before migration): 0 rows.

Result: ☐ not yet run

```sql
select indexname from pg_indexes where indexname = 'events_type_created_idx';
```

Expected (before migration): 0 rows.

Result: ☐ not yet run

## Step 2 — apply the migration

Paste the full contents of `20260808000002_growth_audience_agg.sql` into the
Supabase Studio SQL editor (connected as `postgres`, which is how the SQL
editor connects by default) and run it. This migration adds one index
(`events_type_created_idx`) plus the two function definitions.

**Record the date this was actually run**, in `YYYY-MM-DD` form:

Result: ☐ not yet run — date applied: __________

**Record which role actually created the functions.** Neither function reads
`auth.users`, so the owning role has no `auth`-schema consequence — but a
mismatched owner still changes who the function runs as under `security
definer`, and every other `growth_*`/`admin_*` aggregate records this, so
this one does too. If you ran this through anything other than the default
`postgres` connection, note the actual role here instead of assuming:

Result: ☐ not yet run — role that created the functions: __________

Re-running the migration a second time must succeed with no errors: both
function bodies use `create or replace function`, the index uses `create
index if not exists`, and the trailing `revoke`/`grant` statements are
unconditional and idempotent by nature.

Result: ☐ not yet run

## Step 3 — confirm the index actually gets used where it needs to

`growth_acquisition_agg`'s `enters` CTE filters `events` on
`event_type = 'enter'` AND a `created_at` range in the same WHERE clause —
unlike `growth_funnel_agg`'s `windowed` CTE, whose `event_type` predicates
live only inside aggregate `FILTER (...)` clauses (which restrict which
already-scanned rows get counted into which bucket, not which rows the scan
reads off disk — this is *why* `events_type_created_idx` was removed from
that migration in commit `af9ffc7`: it served no query there). Here,
`event_type = 'enter'` gates the scan itself, before any aggregation, so a
composite `(event_type, created_at desc)` index can actually narrow what
gets read instead of being redundant with `idx_events_created`.

`growth_segment_agg`'s `windowed` CTE, by contrast, filters only on
`created_at` — exactly like `growth_funnel_agg` — and gets no benefit from
the new index. This step verifies the *acquisition* function only.

Get the current PH week's window boundaries:

```bash
npx tsx -e "
import { phWeekWindows } from './lib/reports/phWeek';
const [current] = phWeekWindows(new Date(), 1);
console.log(current.sinceIso, current.untilIso);
"
```

Substitute the two printed timestamps for `<since>` / `<until>` below and run
this in the SQL editor — it reproduces exactly what the `enters` CTE scans:

```sql
explain analyze
select device_id, referrer, utm_source, utm_medium, utm_campaign
from events
where event_type = 'enter'
  and created_at >= '<since>'
  and created_at <  '<until>';
```

**This is the falsifiable part — state the outcomes plainly, do not narrate
around them:**

- **Green / expected:** the plan names `events_type_created_idx` — an
  `Index Scan` or `Bitmap Heap Scan` referencing it directly.
- **Ambiguous, not automatically a failure:** a `Seq Scan`. On a table small
  enough that Postgres's planner judges a full scan cheaper than an index
  lookup, this can be the correct choice and does not by itself mean the
  index is dead — but it also does not by itself mean the index is healthy.
  Do not write either conclusion down without running the discriminating
  query below.
- **Red / actual failure:** the plan names `idx_events_created` (the
  `created_at`-only index) or any index other than
  `events_type_created_idx`, while a `Seq Scan` on `events_type_created_idx`
  itself never appears as a candidate. That would mean the new index is
  either malformed or the planner has a reason (e.g. stale statistics) to
  never consider it — investigate rather than record as fine.

**The discriminating query**, if the result above is a `Seq Scan` and you
need to know whether that is "table is small" or "index is dead": force the
planner to consider the index and compare cost, rather than trusting its
unforced choice.

```sql
set local enable_seqscan = off;
explain analyze
select device_id, referrer, utm_source, utm_medium, utm_campaign
from events
where event_type = 'enter'
  and created_at >= '<since>'
  and created_at <  '<until>';
```

If forcing `enable_seqscan = off` produces a plan using
`events_type_created_idx` with an execution time close to (or better than)
the unforced `Seq Scan`, the table is genuinely small and the planner's
default choice was reasonable — the index is not dead, just not yet worth
its own cost estimate. If the forced plan is dramatically slower, or still
cannot find a usable path through `events_type_created_idx`, the index is
not doing its job and needs investigation before this migration is treated
as done.

Record the plan's scan type and its "Execution Time" line for both the
unforced and (if run) forced query:

Result: ☐ not yet run — unforced scan type: ☐ Seq Scan ☐ Index Scan ☐ Bitmap Heap Scan ☐ other: __________ — index named (if any): __________ — execution time: __________ ms — forced-comparison run: ☐ yes ☐ no (not needed — index named directly) — forced result (if run): __________

## Step 4 — green: both functions exist and return the contracted shape

```bash
npx tsx -e "
import { createReportsClient, callRpc } from './scripts/reports/supabaseAdmin';
import { phWeekWindows } from './lib/reports/phWeek';
const [current] = phWeekWindows(new Date(), 1);
const args = { p_since: current.sinceIso, p_until: current.untilIso };
Promise.all([
  callRpc(createReportsClient(), 'growth_acquisition_agg', args),
  callRpc(createReportsClient(), 'growth_segment_agg', args),
]).then(([acq, seg]) => {
  console.log('acquisition:', JSON.stringify(acq, null, 2));
  console.log('segment:', JSON.stringify(seg, null, 2));
});
"
```

Expected: both `ok === true`, both `error === null`.

`growth_acquisition_agg`'s `data` is a single object with exactly six
top-level keys. Check off each as you confirm it is present with the right
shape — do not write the actual number or any array contents here:

- ☐ `enters` — a number
- ☐ `devices` — a number, `<= enters` (a device can enter more than once in
  a window)
- ☐ `no_referrer` — a number, `<= enters`
- ☐ `by_referrer_host` — an **object** (not a bare array — see below) with
  `rows` (an array of at most 15 `{host, count}` objects, or `null` if
  `enters` is 0) and `total_groups` (a number: the count of distinct hosts
  the window produced, computed *without* the 15-row cap)
- ☐ `by_utm_source` — an object with `rows` (at most 15 `{utm_source,
  utm_medium, count}` objects, or `null` if `enters` is 0) and
  `total_groups` (number, uncapped)
- ☐ `by_utm_campaign` — an object with `rows` (at most 15 `{utm_campaign,
  count}` objects, or `null` if no `enters` row has a non-null
  `utm_campaign`) and `total_groups` (number, uncapped)

`growth_segment_agg`'s `data` is a single object with exactly two top-level
keys:

- ☐ `by_year` — an array with **one row per row in the `years` table**
  (see Step 7 below for why this count matters), each an object with
  `year_label` (string), `module_open_devices` (number), `paywall_devices`
  (number), `paid_devices` (number) keys
- ☐ `by_subject` — an object with `rows` (an array of at most 25 objects,
  each with `subject_title` (string), `year_label` (string),
  `module_open_devices` (number), `paywall_devices` (number), and
  **`subject_plan_paid_devices`** (number — NOT the same population as
  `by_year.paid_devices`; see Step 8 below before quoting this figure
  anywhere) keys) and `total_groups` (number: the count of subjects with
  any activity in the window, i.e. after the query's own `having
  count(w.device_id) > 0` filter but before the 25-row cap — subjects with
  zero activity are excluded from `total_groups` too, on purpose; this is
  not the same "never drops a row" guarantee Step 7 checks for `by_year`)

**The relationship every capped distribution above must satisfy:**
`total_groups >= length(rows ?? [])`, with equality meaning the cap did not
truncate anything (15-or-fewer groups for the three acquisition
distributions, 25-or-fewer active subjects for `by_subject`). A
`total_groups` smaller than the row count is impossible and means the two
subqueries have diverged — investigate, do not record as fine.

Result: ☐ not yet run — `total_groups >= length(rows ?? [])` holds for all
four capped distributions (`by_referrer_host`, `by_utm_source`,
`by_utm_campaign`, `by_subject`): ☐ yes for all four ☐ no (name which key
failed: __________)

## Step 5 — THE PERMISSION CHECK. Do not skip this one.

This is the most important check in this document. The migration ends with:

```sql
revoke execute on function growth_acquisition_agg(timestamptz, timestamptz)
  from public, anon, authenticated;
grant execute on function growth_acquisition_agg(timestamptz, timestamptz) to service_role;

revoke execute on function growth_segment_agg(timestamptz, timestamptz)
  from public, anon, authenticated;
grant execute on function growth_segment_agg(timestamptz, timestamptz) to service_role;
```

**If either `revoke` did not take effect, that function's data — acquisition
attribution (referrer hosts, UTM sources and campaigns, the no-referrer
dark-social share) or segment volumes (year and subject breakdowns of
engagement and paid conversion) in any window an anonymous caller
chooses — becomes readable by anyone holding the public anon key, with no
login required.** The anon key ships in this repo's client bundle by design;
the only thing standing between "public read-only key" and "readable
business metrics" is these two `revoke` statements actually taking hold.

Verify both were rejected by calling each RPC as `anon`, from this repo,
against the production project (uses `.env.reports.local`, which must
already be populated with production values per `lib/reports/reportsEnv.ts`):

```bash
npx tsx -e "
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { parseEnvFile } from './lib/reports/reportsEnv';
import { phWeekWindows } from './lib/reports/phWeek';
const v = parseEnvFile(readFileSync('.env.reports.local','utf8'));
const [current] = phWeekWindows(new Date(), 1);
const client = createClient(v.NEXT_PUBLIC_SUPABASE_URL, v.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
const args = { p_since: current.sinceIso, p_until: current.untilIso };
Promise.all([
  client.rpc('growth_acquisition_agg', args),
  client.rpc('growth_segment_agg', args),
]).then(([acq, seg]) => {
  console.log('growth_acquisition_agg anon call error:', acq.error?.message ?? 'NONE — THIS IS A PROBLEM');
  console.log('growth_segment_agg anon call error:', seg.error?.message ?? 'NONE — THIS IS A PROBLEM');
});
"
```

Expected: two printed error messages (permission denied to call the
function), one per RPC.

**If either line ends in `NONE — THIS IS A PROBLEM`, that function's revoke
did not apply.** Do not proceed, do not treat this migration as done, and do
not let any report collector call that RPC until it is fixed — re-run the
`revoke` statement for that specific function by hand, connected as
`postgres` or the function owner, and repeat this step until both lines
print an error, not `NONE`.

Result: ☐ not yet run — date applied: __________ — role the editor connected as: __________ — `growth_acquisition_agg`: ☐ yes (error printed) ☐ NO — printed `NONE` (unresolved problem) — `growth_segment_agg`: ☐ yes (error printed) ☐ NO — printed `NONE` (unresolved problem)

## Step 6 — confirm the service role can call both

This is how report collectors will actually reach these RPCs (see
`scripts/reports/supabaseAdmin.ts`, which uses the service-role key
specifically because these aggregates are granted to `service_role` alone).
This is the same call as Step 4 — if Step 4 already printed `ok: true` and
`error: null` for both, this step is already satisfied and needs no separate
run:

Result: ☐ not yet run — same result as Step 4: ☐ yes

## Step 7 — `by_year` never drops a row

`by_year` is built with `from years y left join windowed w on w.year_id =
y.id` — a `left join` from the small, fixed `years` table, not from the
event stream. That means a year with zero events in the window must still
appear as a row with `module_open_devices`, `paywall_devices`, and
`paid_devices` all `0` — not be silently absent. A disappearing row here
would break the "identical row set every run" property the interpreter
agent depends on to compare week over week.

Count the rows in `years` and compare against the length of `by_year` from
the Step 4 output:

```sql
select count(*) from years;
```

Result: ☐ not yet run — `count(*)` from `years`: __________ — length of `by_year` array from Step 4: __________ — equal: ☐ yes ☐ no (investigate — a row went missing)

If any year is genuinely quiet, confirm at least one row in the Step 4
`by_year` output has `module_open_devices`, `paywall_devices`, and
`paid_devices` all equal to `0` (only if such a year exists — do not force
this check if every year had activity in the window):

Result: ☐ not yet run — n/a (every year had activity) ☐ confirmed a quiet year shows zeroes, not absence ☐ a quiet year is missing from the array (fails the check above)

## Step 8 — `by_subject.rows[].subject_plan_paid_devices` is not comparable to `by_year.paid_devices`

This is a documented semantic gap, not a bug, and it must be understood
before either figure is quoted anywhere. `payments.subject_id` is `NULL`
for a whole-year-plan purchase (`20260624120000_payments_ledger.sql:11`),
and `isSubscribed()` (`lib/subscriptions.ts`) treats that null-subject year
plan as unlocking every subject in the year — a year-plan payer is a real
conversion. `by_year.paid_devices` joins its `paid_devices` CTE on
`year_id`, which every payment row has (whether year-plan or
subject-plan), so it counts year-plan payers correctly. `by_subject.rows[].
subject_plan_paid_devices` joins the same CTE on `subject_id`, which a
year-plan payment never has — so that payment is excluded from *every*
subject's count by construction, not lost or undercounted. That is also
why the key is named `subject_plan_paid_devices` rather than
`paid_devices`: attributing one year-plan payment across the ~30 subjects
it unlocks would inflate every one of those subjects' conversion counts
into a number nobody could act on.

The falsifiable consequence: summing `subject_plan_paid_devices` across
every row in `by_subject.rows` that belongs to a given year will, in
general, be **less than** that year's `by_year.paid_devices` — by exactly
the number of whole-year-plan payers active in the window. That gap is
expected, not evidence of an undercount. The two figures should never be
added together or presented as if one decomposes into the other.

There is no query to run for this step — it is a comprehension check on
the two functions' output, not a database check. Confirm you understand
the above before this migration's `by_subject` figures are used in any
report or dashboard:

Result: ☐ not yet run — understood: `subject_plan_paid_devices` and
`by_year.paid_devices` measure different (non-summable) populations, and
`subject_plan_paid_devices` undercounting `by_year.paid_devices`'s
year-plan share is expected, not a defect: ☐ yes

## Step 9 — the referrer host is a bare hostname, never a URL

Using the Step 4 output's `by_referrer_host.rows` array (skip this step if
it is `null` because `enters` was 0 for the window): every `host` value
must be a bare hostname or the literal string `(none)` — no `https://`
scheme prefix, no path, no query string. A row still containing `://` or a
`/` means `split_part(split_part(referrer, '://', 2), '/', 1)` did not
match the stored format for that row, and needs fixing before the
interpreter agent starts reading it as a source name.

Result: ☐ not yet run — n/a (`by_referrer_host.rows` was null) ☐ every host value is bare (no scheme, no path) ☐ at least one host value still contains `://` or `/` (investigate — list one example format, not the actual host: __________)

## Step 10 — the window is half-open

Run the Step 4 script twice in the same process, once for the current PH
week and once for the previous one, and confirm the `since`/`until` values
implied by the arguments abut exactly (this repeats the same boundary check
`growth_funnel_agg`'s verification doc already ran — neither function here
echoes `since`/`until` back in its JSON the way `growth_funnel_agg` does, so
this step checks the window construction itself rather than the RPC's
echo):

```bash
npx tsx -e "
import { phWeekWindows } from './lib/reports/phWeek';
const [current, previous] = phWeekWindows(new Date(), 2);
console.log('previous.untilIso === current.sinceIso:', previous.untilIso === current.sinceIso);
"
```

Expected: `true`. `phWeekWindows` is already covered by its own test (Task 1)
and by `growth_funnel_agg`'s verification doc — this step is not re-testing
it, only confirming that the two calls in Step 4 would abut correctly if run
for consecutive weeks.

Result: ☐ not yet run — prints `true`: ☐ yes ☐ no
