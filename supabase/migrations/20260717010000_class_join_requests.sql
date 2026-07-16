-- supabase/migrations/20260717010000_class_join_requests.sql
-- Classmate join requests awaiting rep approval — replaces the prior
-- iteration's auto-join (app/api/class/join/route.ts) with an approval step.
-- Idempotent: safe to run against the live DB or a fresh one.

create table if not exists class_join_requests (
  id          uuid primary key default gen_random_uuid(),
  class_id    uuid not null references classes(id) on delete cascade,
  device_id   text not null,
  status      text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at  timestamptz not null default now(),
  decided_at  timestamptz,
  unique(class_id, device_id)
);

create index if not exists class_join_requests_class_status_idx
  on class_join_requests (class_id, status);

alter table class_join_requests enable row level security;

-- A device may read only its own join requests (used by the polling
-- endpoint). Service role bypasses for the rep-facing approve/reject route.
drop policy if exists "device reads own join requests" on class_join_requests;
create policy "device reads own join requests"
  on class_join_requests for select
  using (device_id = current_setting('app.device_id', true));
