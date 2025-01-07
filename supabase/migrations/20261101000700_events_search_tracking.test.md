# Verification: search tracking — `events` search columns, event types, `growth_search_agg`

**Not yet applied.** Apply by hand in the Supabase Studio SQL editor (or via
the Supabase connector), as `postgres`, like every other migration in this
repo. Until it runs, /search still works, but every `search_query`,
`search_no_results` and `search_result_click` row is rejected (the API logs
the insert error — the columns do not exist yet), and the growth collector
records `growth_search_agg` as a failed RPC. No other event is affected:
`/api/events` sends the three new columns only for search events.
Do not tick a box until you have run the query and read real output. This repo
is public — never paste a production figure or a real query into this file.

The event-type list is production's as read on 2026-10-31 (twenty-six types,
ending in `pwa_installed`) plus the three search types. If another branch
widens the constraint too, merge both lists into one migration before
applying: each version drops and re-adds the whole list.

## Step 1 — apply

Run `20261101000700_events_search_tracking.sql`. It is idempotent
(`add column if not exists`, drop-then-add constraints, `create or replace`),
so a second run is a no-op.

Result: ☐ not yet run — date applied: __________

## Step 2 — columns exist and are nullable

```sql
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name = 'events'
  and column_name in ('search_query', 'result_count', 'result_rank');
```

Expect three rows: `text`, `integer`, `integer`, all `YES`.

Result: ☐

## Step 3 — the constraint lists the new types

```sql
select pg_get_constraintdef(oid)
from pg_constraint
where conname = 'events_event_type_check';
```

Expect twenty-nine types, ending in `'search_query'`, `'search_no_results'`,
`'search_result_click'`.

Result: ☐

## Step 4 — the length backstop rejects an over-long query

```sql
begin;
insert into events (device_id, event_type, search_query, result_count)
values ('00000000-0000-4000-8000-000000000000', 'search_query', repeat('a', 81), 1);
rollback;
```

Expect `violates check constraint "events_search_query_len_check"`.

Result: ☐

## Step 5 — the aggregate runs and is locked down

```sql
select growth_search_agg(now() - interval '7 days', now());
select has_function_privilege('anon', 'growth_search_agg(timestamptz, timestamptz)', 'execute');
```

Expect a JSON object with `searches`, `devices`, `no_result_searches`,
`result_clicks`, `top_queries {rows, total_groups}` and
`no_result_queries {rows, total_groups}` (`rows` is `null` while there is no
data), and `false` for the privilege check.

Result: ☐
