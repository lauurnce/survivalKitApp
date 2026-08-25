-- Drop the partial index and replace with an unconditional unique constraint
drop index if exists subscriptions_device_year_active_idx;
-- IF NOT EXISTS: 20260623100000 now creates this same unconditional index, so
-- this file is a no-op on cold replays and on prod's current state alike.
create unique index if not exists subscriptions_device_year_idx
  on subscriptions (device_id, year_id);
