# Verification: `events.utm_content` / `events.utm_term`

**Not yet applied.** Apply by hand in the Supabase Studio SQL editor, as
`postgres`, like every other migration in this repo. Do not tick a box until
you have run the query and read real output. This repo is public — never
paste a production figure into this file.

**Apply this BEFORE deploying the app change that writes these columns.**
Until it runs, `/api/events` inserts that carry `utm_content` / `utm_term`
are rejected by PostgREST (unknown column) and the route logs
`events insert failed (enter)` — the visit's whole `enter` row is lost, not
just the two new fields.

## Step 1 — apply

Paste `20261101000100_events_add_utm_content_term.sql` into the SQL editor and
run it. It is idempotent (`add column if not exists`).

Result: ☐ not yet run — date applied: __________

## Step 2 — both columns exist, nullable text

```sql
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'events'
  and column_name in ('utm_content', 'utm_term')
order by column_name;
```

Expect two rows: `text`, `YES`, default `null`.

Result: ☐

## Step 3 — existing rows untouched

```sql
select count(*) filter (where utm_content is not null or utm_term is not null)
from public.events;
```

Expect `0` immediately after applying (no backfill; only new `enter` rows
from tagged links fill them).

Result: ☐
