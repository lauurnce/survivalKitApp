-- Add subject_id to subscriptions so per-subject plans are scoped correctly.
-- Without this column every subject payment created a year-level row, breaking
-- both the isSubscribed query (which filters on subject_id) and the access check.
--
-- NOTE: This migration is written to be idempotent and to converge on the SAME
-- schema the live project already has (it was provisioned ad hoc as
-- `subscriptions_per_subject_plan`). Running it on a fresh database reproduces
-- production; running it against the live database is a no-op. We use a single
-- expression unique index over COALESCE(subject_id, 'year') rather than two
-- partial indexes — it enforces the identical invariant (exactly one row per
-- device+year for the year plan, and one row per device+year+subject for the
-- subject plan) with one index, and it matches what is already deployed.

alter table subscriptions add column if not exists subject_id uuid references subjects(id);

-- Drop the original (device_id, year_id) unique index — two rows can now
-- legitimately share device+year (one year plan + one subject plan) — and any
-- alternate-named indexes from earlier drafts of this migration.
drop index if exists subscriptions_device_year_idx;
drop index if exists subscriptions_device_year_plan_idx;
drop index if exists subscriptions_device_year_subject_idx;

-- One row per (device, year, subject); the year plan (subject_id IS NULL)
-- collapses to the 'year' sentinel so a device gets at most one year-plan row
-- per year. COALESCE makes NULLs comparable for uniqueness.
create unique index if not exists subscriptions_device_year_subject_uidx
  on subscriptions (device_id, year_id, coalesce(subject_id::text, 'year'));
