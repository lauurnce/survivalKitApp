-- Allow one email to register interest in multiple coming-soon subjects.
-- Replace the (email, source) unique key with (email, source, subject_title)
-- using NULLS NOT DISTINCT so paywall / year-level rows (subject_title IS NULL)
-- still de-duplicate per (email, source), while each per-subject signup is kept.
-- Requires Postgres 15+ for NULLS NOT DISTINCT (project runs Postgres 17).

alter table waitlist drop constraint if exists waitlist_email_source_key;

drop index if exists waitlist_email_source_subject_key;

create unique index if not exists waitlist_email_source_subject_key
  on waitlist (email, source, subject_title) nulls not distinct;
