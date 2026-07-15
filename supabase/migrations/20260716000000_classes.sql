-- supabase/migrations/20260716000000_classes.sql
-- Class Rep block sales: one manual sale unlocks a subject for every member
-- who joins via a 6-char class code. Mirrors the subscriptions/payments
-- pattern — see lib/payments.ts recordPayment for the analogous device flow.
-- Idempotent: safe to run against the live DB or a fresh one.

create table if not exists classes (
  id                 uuid primary key default gen_random_uuid(),
  code               text not null,
  name               text not null,
  subject_id         uuid not null references subjects(id),
  year_id            uuid not null references years(id),
  rep_device_id      text not null,
  seat_cap           int not null default 50,
  status             subscription_status not null default 'active',
  current_period_end timestamptz not null,
  -- 'block-<uuid>' placeholder for manually-generated PayMongo links, mirroring
  -- the real link IDs subscriptions/payments store. Never null: a class must
  -- always trace back to a payment record (see payments row below).
  paymongo_link_id   text not null,
  created_at         timestamptz not null default now()
);

create unique index if not exists classes_code_idx on classes (upper(code));
create unique index if not exists classes_paymongo_link_id_idx on classes (paymongo_link_id);
create index if not exists classes_subject_year_idx on classes (subject_id, year_id);

create table if not exists class_members (
  id         uuid primary key default gen_random_uuid(),
  class_id   uuid not null references classes(id) on delete cascade,
  device_id  text not null,
  joined_at  timestamptz not null default now(),
  unique(class_id, device_id)
);

create index if not exists class_members_device_idx on class_members (device_id);

alter table classes enable row level security;
alter table class_members enable row level security;

-- A device may read a class only if it is the rep or a joined member —
-- needed so the join page can show "already joined" state and the (future)
-- rep dashboard can read its own class. Service role bypasses for writes.
drop policy if exists "device reads own or joined class" on classes;
create policy "device reads own or joined class"
  on classes for select
  using (
    rep_device_id = current_setting('app.device_id', true)
    or id in (
      select class_id from class_members
      where device_id = current_setting('app.device_id', true)
    )
  );

drop policy if exists "device reads own membership" on class_members;
create policy "device reads own membership"
  on class_members for select
  using (device_id = current_setting('app.device_id', true));
