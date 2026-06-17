-- Per-device module completion tracking ("mark as done").
-- Anonymous users are identified by their client-generated device_id.

create table if not exists module_progress (
  device_id    text        not null,
  module_id    text        not null,
  completed_at timestamptz not null default now(),
  primary key (device_id, module_id)
);

-- Fast lookup of all completed modules for a device (used to build progress bars).
create index if not exists module_progress_device_idx
  on module_progress (device_id);

alter table module_progress enable row level security;

-- Reads/writes go through the service-role server client (see app/api/progress/route.ts),
-- which bypasses RLS. No anon policies are granted, so the table is not directly
-- readable/writable with the public publishable key.
