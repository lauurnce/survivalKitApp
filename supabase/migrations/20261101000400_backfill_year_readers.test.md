# Verification: backfill year readers

**Not yet applied.** Apply by hand in the Supabase Studio SQL editor (or via
the Supabase connector), as `postgres`, like every other migration in this
repo. Do not tick a box until you have run the query and read real output.
This repo is public — never paste a production figure into this file.

Deploy the `fix/reader-counter` code first or together: without it, new
deep-linked readers keep arriving without a year row, and a later run of this
migration is needed to pick them up (harmless, it is idempotent).

## Step 0 — before: every year's count equals its log rows

```sql
select c.resource_id, c.reader_count,
       (select count(*) from counter_log l
         where l.resource_type = 'year' and l.resource_id = c.resource_id) as log_rows
from counters c where c.resource_type = 'year' order by 1;
```

Expect `reader_count = log_rows` on every row. If not, stop: step 2 would
change counts for a reason other than this backfill — find out why first.

Result: ☐

## Step 1 — apply

Run `20261101000400_backfill_year_readers.sql`. Send it as one script so both statements share a transaction.

Result: ☐ not yet run — date applied: __________

## Step 2 — no reader is left without a year row

```sql
select count(*) as devices_missing_year_reader
from counter_log l
join modules m on l.resource_type = 'module' and m.id::text = l.resource_id
join subjects s on s.id = m.subject_id
where not exists (
  select 1 from counter_log y
  where y.device_id = l.device_id and y.resource_type = 'year'
    and y.resource_id = s.year_id::text);
```

Expect `0`.

Result: ☐

## Step 3 — counts still equal log rows, and only went up

Re-run the step 0 query. Expect `reader_count = log_rows` on every row, and
each `reader_count` at least what step 0 showed.

Result: ☐

## Step 4 — idempotent

Run the migration again, then the step 0 query. Expect identical numbers.

Result: ☐
