-- Allow one email to register interest in multiple coming-soon subjects.
-- Replace the (email, source) unique key with (email, source, subject_title)
-- using NULLS NOT DISTINCT so paywall / year-level rows (subject_title IS NULL)
-- still de-duplicate per (email, source), while each per-subject signup is kept.
-- Requires Postgres 15+ for NULLS NOT DISTINCT (project runs Postgres 17).

-- The column itself was only ever added by hand on production; provide the
-- FK-free text column here so a cold replay has it before indexing.
alter table public.waitlist add column if not exists subject_title text;

alter table waitlist drop constraint if exists waitlist_email_source_key;

drop index if exists waitlist_email_source_subject_key;

create unique index if not exists waitlist_email_source_subject_key
  on waitlist (email, source, subject_title) nulls not distinct;
