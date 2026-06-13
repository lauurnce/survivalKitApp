-- ============================================================
-- BSIT Survival Kit — Initial Schema
-- ============================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ============================================================
-- Tables
-- ============================================================

create table if not exists years (
  id          uuid primary key default gen_random_uuid(),
  label       text not null,
  sort_order  int  not null default 0
);

create table if not exists subjects (
  id          uuid primary key default gen_random_uuid(),
  year_id     uuid not null references years(id) on delete cascade,
  title       text not null,
  slug        text not null,
  sort_order  int  not null default 0,
  unique(year_id, slug)
);

create table if not exists modules (
  id          uuid primary key default gen_random_uuid(),
  subject_id  uuid not null references subjects(id) on delete cascade,
  title       text not null,
  slug        text not null,
  sort_order  int  not null default 0,
  unique(subject_id, slug)
);

-- Sections: kind = 'content' (public) or 'activity' (gated)
create table if not exists sections (
  id          uuid primary key default gen_random_uuid(),
  module_id   uuid not null references modules(id) on delete cascade,
  kind        text not null check (kind in ('content', 'activity')),
  heading     text not null,
  body_md     text not null default '',
  sort_order  int  not null default 0
);

-- Unlock requests (₱20 GCash, manual approval)
create table if not exists unlocks (
  id          uuid primary key default gen_random_uuid(),
  module_id   uuid not null references modules(id) on delete cascade,
  device_id   text not null,
  gcash_ref   text not null,
  status      text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  amount      int  not null default 20,
  created_at  timestamptz not null default now()
);

-- Analytics events
create table if not exists events (
  id          uuid primary key default gen_random_uuid(),
  device_id   text not null,
  event_type  text not null check (event_type in (
    'enter', 'year_select', 'subject_open', 'module_open',
    'section_view', 'unlock_click', 'unlock_submitted'
  )),
  year_id     uuid references years(id)    on delete set null,
  subject_id  uuid references subjects(id) on delete set null,
  module_id   uuid references modules(id)  on delete set null,
  section_id  uuid references sections(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- Indexes
-- ============================================================

create index if not exists idx_subjects_year    on subjects(year_id);
create index if not exists idx_modules_subject  on modules(subject_id);
create index if not exists idx_sections_module  on sections(module_id);
create index if not exists idx_unlocks_device   on unlocks(device_id, module_id);
create index if not exists idx_events_created   on events(created_at desc);
create index if not exists idx_events_device    on events(device_id);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table years     enable row level security;
alter table subjects  enable row level security;
alter table modules   enable row level security;
alter table sections  enable row level security;
alter table unlocks   enable row level security;
alter table events    enable row level security;

-- PUBLIC: read years, subjects, modules
create policy "public_read_years"
  on years for select to anon using (true);

create policy "public_read_subjects"
  on subjects for select to anon using (true);

create policy "public_read_modules"
  on modules for select to anon using (true);

-- PUBLIC: read only 'content' sections (not 'activity')
-- Activity body is served via server-side API route after unlock check
create policy "public_read_content_sections"
  on sections for select to anon
  using (kind = 'content');

-- UNLOCKS: public can insert (submit request), cannot read or update
create policy "public_insert_unlocks"
  on unlocks for insert to anon
  with check (status = 'pending');

-- EVENTS: public can insert (log events), cannot read
create policy "public_insert_events"
  on events for insert to anon with check (true);

-- SERVICE ROLE bypasses RLS (used by admin routes and ingest script)
-- (No additional policies needed — service role key bypasses RLS by default)
