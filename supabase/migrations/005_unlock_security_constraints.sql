-- Prevent the same GCash reference from being used for multiple unlock requests.
-- Without this, a single payment could be submitted multiple times for different modules.
alter table unlocks
  add constraint unlocks_gcash_ref_unique unique (gcash_ref);

-- Prevent clients from submitting arbitrary payment amounts.
-- The RLS insert policy already enforces status = 'pending', but a client could
-- set amount = 0 or amount = 1 to trick an admin reviewing the queue.
-- This constraint ensures the amount is always exactly the required ₱20.
alter table unlocks
  add constraint unlocks_amount_fixed check (amount = 20);

-- One unlock request per (device, module) pair — prevents duplicate pending rows
-- for the same module which could confuse the admin review queue.
alter table unlocks
  add constraint unlocks_device_module_unique unique (device_id, module_id);
