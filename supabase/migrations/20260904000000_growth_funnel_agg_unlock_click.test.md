# Verification: `growth_funnel_agg` — add `unlock_click` step

**Not yet applied.** This repo has no `supabase db push` workflow (see the
`.test.md` for `20260808000001_growth_funnel_agg.sql`) — every `growth_*`
aggregate is applied by hand in the Supabase Studio SQL editor, connected as
`postgres`. Nothing below has been run. Do not check a box or fill a
"Result" line until you have actually run the query and read real output.
This repo is public — never paste a production figure into this file.

This migration only widens `steps` with one more `count(...) filter(...)`
column on the same `windowed` CTE the original migration already scans; it
adds no new table, no new index, and no new permission grant — the trailing
`revoke`/`grant` are the exact same statements as the original migration,
repeated because `create or replace function` requires the full function
body. Because of that, this checklist is a **delta** against the original's
already-passed verification, not a full re-run of every step there.

## Step 1 — apply the migration

Paste the full contents of
`20260904000000_growth_funnel_agg_unlock_click.sql` into the Supabase Studio
SQL editor and run it.

Record the date this was actually run, in `YYYY-MM-DD` form:

Result: ☐ not yet run — date applied: __________

Re-running it a second time must succeed with no errors — `create or replace
function` and the unconditional `revoke`/`grant` are idempotent by
construction, same as the original migration.

Result: ☐ not yet run

## Step 2 — the new field is present and counts something real

```bash
npx tsx -e "
import { createReportsClient, callRpc } from './scripts/reports/supabaseAdmin';
import { phWeekWindows } from './lib/reports/phWeek';
const [current] = phWeekWindows(new Date(), 1);
callRpc(createReportsClient(), 'growth_funnel_agg', { p_since: current.sinceIso, p_until: current.untilIso })
  .then(r => console.log(current.label, JSON.stringify(r, null, 2)));
"
```

Expected: `r.ok === true`, `r.error === null`, and `steps` now has an
`unlock_click` key alongside the eight it already had (`enter`,
`year_select`, `subject_open`, `subject_open_any`, `module_open`,
`paywall_teaser_view`, `paywall_teaser_click`, `subscribe_click`,
`any_event`) — nine windowed step counts in total. Do not write the actual
number here:

- ☐ `steps.unlock_click` — present, a number (0 is a valid answer if no one
  reached /unlock this window — the point is the key exists and the RPC
  didn't error, not that it's non-zero)
- ☐ every pre-existing `steps.*` key from the original migration is still
  present, unaffected by this change

Result: ☐ not yet run

## Step 3 — the permission check is unchanged, but still worth confirming

The original migration's Step 5 already established that this function must
never be callable by `anon`. Since this migration ends in the identical
`revoke`/`grant` pair, this should already hold — but confirm it wasn't
accidentally weakened by re-running the anon check from that migration's
`.test.md` Step 5 (same script, unchanged):

Result: ☐ not yet run — anon call rejected: ☐ yes (error printed) ☐ NO — printed `NONE` (unresolved problem, stop and fix before treating this migration as done)

## Step 4 — funnel.ts and the report agree

Run the growth collector (`npm run report:growth`) once against the applied
migration and confirm the funnel table in its output now shows a
"Reached Unlock" row between "Tapped the paywall" and "Started checkout" —
nine rows before "Paid (ledger)" instead of eight. Do not paste the report's
actual figures here; this is a shape check only.

Result: ☐ not yet run — "Reached Unlock" row present, correctly positioned: ☐ yes ☐ no
