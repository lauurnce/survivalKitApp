-- Backfill year readers for devices that read a year's content without ever
-- being counted as its reader.
--
-- Until lib/readCounting.ts, /api/events recorded a year reader only from the
-- subjects list page (subject_open with a year and no subject). A device that
-- went straight into a lesson — the landing page's CP1 button, a shared link,
-- "Popular right now" — left module/subject/section rows in counter_log but no
-- year row, so it was missing from "N readers" on /year.
--
-- Step 1 adds the missing (device, year) rows, dated to that device's first
-- read in the year. Step 2 sets reader_count to the number of year rows in
-- counter_log, which is what record_visit maintains it as (one per device per
-- year, never re-incremented); the two were equal for every year before this
-- backfill.
--
-- Idempotent: step 1 inserts only rows that do not exist yet, and step 2
-- recomputes from the log, so a second run changes nothing. Sent as one
-- script (SQL editor / connector), both statements run in one implicit
-- transaction.

insert into public.counter_log (device_id, resource_type, resource_id, first_seen_at, last_read_at)
select reads.device_id, 'year', reads.year_id, min(reads.first_seen_at), min(reads.first_seen_at)
from (
  select l.device_id, s.year_id::text as year_id, l.first_seen_at
  from public.counter_log l
  join public.modules m on m.id::text = l.resource_id
  join public.subjects s on s.id = m.subject_id
  where l.resource_type = 'module'
  union all
  select l.device_id, s.year_id::text, l.first_seen_at
  from public.counter_log l
  join public.subjects s on s.id::text = l.resource_id
  where l.resource_type = 'subject'
  union all
  select l.device_id, s.year_id::text, l.first_seen_at
  from public.counter_log l
  join public.sections se on se.id::text = l.resource_id
  join public.modules m on m.id = se.module_id
  join public.subjects s on s.id = m.subject_id
  where l.resource_type = 'section'
) reads
group by reads.device_id, reads.year_id
on conflict (device_id, resource_type, resource_id) do nothing;

insert into public.counters (resource_type, resource_id, reader_count, read_count)
select 'year', l.resource_id, count(*), 0
from public.counter_log l
where l.resource_type = 'year'
group by l.resource_id
on conflict (resource_type, resource_id)
do update set reader_count = excluded.reader_count
where public.counters.reader_count is distinct from excluded.reader_count;
