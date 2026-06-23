-- Drop the partial index and replace with an unconditional unique constraint
drop index if exists subscriptions_device_year_active_idx;
create unique index subscriptions_device_year_idx
  on subscriptions (device_id, year_id);
