-- RA 10173 (Philippine Data Privacy Act) audit trail: record WHEN a waitlist
-- signup happened and which privacy policy version was live at that moment.
-- The policy at /privacy already documents that submission is voluntary
-- (the lawful basis) — this column makes that basis auditable per-row
-- instead of relying on "the policy page existed" as an implicit claim.
alter table public.waitlist
  add column consent_recorded_at timestamptz not null default now(),
  add column privacy_policy_version text not null default '2026-06';

comment on column public.waitlist.consent_recorded_at is
  'Server-set timestamp of when this signup (and therefore the voluntary submission that is our lawful basis for processing) occurred.';
comment on column public.waitlist.privacy_policy_version is
  'Snapshot of the privacy policy "Last updated" label in effect at signup time, for audit purposes if the policy changes later.';
