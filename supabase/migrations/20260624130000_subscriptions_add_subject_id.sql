-- Add subject_id to subscriptions so per-subject plans are scoped correctly.
-- Without this column every subject payment created a year-level row, breaking
-- both the isSubscribed query (which filters on subject_id) and the access check.

alter table subscriptions add column if not exists subject_id uuid references subjects(id);

-- Drop the old (device_id, year_id) unique index: two rows can now legitimately
-- share the same device+year (one year plan, one subject plan).
drop index if exists subscriptions_device_year_idx;

-- Replace with a three-column partial unique index:
--   • year plan (subject_id IS NULL)  → unique on (device_id, year_id) where subject_id is null
--   • subject plan (subject_id NOT NULL) → unique on (device_id, year_id, subject_id)
-- Two separate partial indexes enforce each constraint independently.
create unique index subscriptions_device_year_plan_idx
  on subscriptions (device_id, year_id)
  where subject_id is null;

create unique index subscriptions_device_year_subject_idx
  on subscriptions (device_id, year_id, subject_id)
  where subject_id is not null;
