create type subscription_status as enum ('active', 'paused', 'cancelled');

create table subscriptions (
  id             uuid primary key default gen_random_uuid(),
  device_id      text not null,
  year_id        uuid not null references years(id),
  paymongo_link_id text not null,
  status         subscription_status not null default 'active',
  current_period_end timestamptz not null,
  created_at     timestamptz not null default now()
);

-- Unconditional unique constraint so ON CONFLICT works for all rows (active, paused, cancelled)
create unique index subscriptions_device_year_idx
  on subscriptions (device_id, year_id);

-- RLS: devices can only read their own subscriptions
alter table subscriptions enable row level security;

create policy "device reads own subscriptions"
  on subscriptions for select
  using (device_id = current_setting('app.device_id', true));

-- Service role bypasses RLS for webhook inserts
