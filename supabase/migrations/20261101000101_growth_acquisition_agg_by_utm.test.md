# Verification: `growth_acquisition_agg` — `tagged_enters` and `by_utm`

**Not yet applied.** Apply by hand in the Supabase Studio SQL editor, as
`postgres`. Do not tick a box until you have run the query and read real
output. This repo is public — never paste a production figure into this file.

Order does not matter relative to the app deploy: the collector reads the two
new keys as optional, and every key the old function returned is unchanged.
Until this runs, the growth report's "Enters · reactivation email" metric is
`—` (not read), never a false zero.

## Step 1 — apply

Paste `20261101000101_growth_acquisition_agg_by_utm.sql` into the SQL editor
and run it. It is idempotent (`create or replace function`).

Result: ☐ not yet run — date applied: __________

## Step 2 — the old keys and the new ones are all present

```sql
select json_object_keys(
  growth_acquisition_agg(now() - interval '7 days', now())
) as key order by 1;
```

Expect exactly: `by_referrer_host`, `by_utm`, `by_utm_campaign`,
`by_utm_source`, `devices`, `enters`, `no_referrer`, `tagged_enters`.

Result: ☐

## Step 3 — by_utm agrees with tagged_enters

```sql
with a as (select growth_acquisition_agg(now() - interval '30 days', now()) j)
select
  (j->>'tagged_enters')::int                                 as tagged,
  (j->'by_utm'->>'total_groups')::int                         as groups,
  (select coalesce(sum((r->>'enters')::int), 0)
     from json_array_elements(coalesce(j->'by_utm'->'rows', '[]'::json)) r) as rows_sum
from a;
```

When `groups <= 15`, expect `rows_sum = tagged`. When `groups > 15` the rows
are truncated, so expect `rows_sum <= tagged`.

Result: ☐

## Step 4 — still service-role only

```sql
select has_function_privilege('anon', 'growth_acquisition_agg(timestamptz,timestamptz)', 'execute') as anon,
       has_function_privilege('authenticated', 'growth_acquisition_agg(timestamptz,timestamptz)', 'execute') as authed,
       has_function_privilege('service_role', 'growth_acquisition_agg(timestamptz,timestamptz)', 'execute') as service;
```

Expect `false`, `false`, `true`.

Result: ☐
