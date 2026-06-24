-- Append-only ledger: one immutable row per successful link.payment.paid.
-- subscriptions remains the access-control table; this is the audit record.
create table payments (
  id                uuid primary key default gen_random_uuid(),
  paymongo_link_id  text not null,
  device_id         text not null,
  year_id           uuid not null references years(id),
  -- null = whole-year plan (₱300); set = single-subject plan (₱50). Mirrors
  -- subscriptions.subject_id so the ledger records exactly what was bought.
  subject_id        uuid references subjects(id),
  amount            integer not null,            -- centavos; 5000 = ₱50, 30000 = ₱300
  currency          text not null default 'PHP',
  paid_at           timestamptz not null,
  created_at        timestamptz not null default now()
);

-- Single-use link => unique. Makes the replay/dedup check race-safe, mirroring
-- the existing subscriptions_paymongo_link_id_idx guard.
create unique index payments_paymongo_link_id_idx on payments (paymongo_link_id);

-- Dashboard reads by recency.
create index payments_paid_at_idx on payments (paid_at desc);

alter table payments enable row level security;

-- Mirror the subscriptions select policy: a device may read only its own
-- payments. The webhook writes via the service role, which bypasses RLS.
create policy "device reads own payments"
  on payments for select
  using (device_id = current_setting('app.device_id', true));
