-- User feedback collection with auto-approval and discount coupons
-- Idempotent: safe to run against live DB or fresh one.

create table if not exists user_feedback (
  id                    uuid primary key default gen_random_uuid(),
  device_id             uuid not null,
  user_id               uuid references auth.users(id) on delete cascade,
  module_id             uuid not null references modules(id) on delete cascade,
  app_rating            smallint not null check (app_rating >= 1 and app_rating <= 5),
  module_rating         smallint not null check (module_rating >= 1 and module_rating <= 5),
  feedback_text         text default '',
  is_anonymous          boolean not null,
  is_quality_approved   boolean not null default false,
  coupon_code           varchar(20) unique,
  coupon_expires_at     timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- Indexes for common queries
create index if not exists user_feedback_device_id_created_idx
  on user_feedback (device_id, created_at desc);

create index if not exists user_feedback_user_id_created_idx
  on user_feedback (user_id, created_at desc) where user_id is not null;

create index if not exists user_feedback_module_id_created_idx
  on user_feedback (module_id, created_at desc);

create index if not exists user_feedback_coupon_code_idx
  on user_feedback (coupon_code) where coupon_code is not null;

create index if not exists user_feedback_approved_created_idx
  on user_feedback (is_quality_approved, created_at desc);

-- Enable RLS
alter table user_feedback enable row level security;

-- Policy 1: Authenticated users can insert their own feedback
drop policy if exists "authenticated users insert own feedback" on user_feedback;
create policy "authenticated users insert own feedback"
  on user_feedback for insert
  with check (auth.uid() = user_id);

-- Policy 2: Authenticated users can select their own feedback
drop policy if exists "authenticated users select own feedback" on user_feedback;
create policy "authenticated users select own feedback"
  on user_feedback for select
  using (auth.uid() = user_id);

-- Policy 3: Anonymous (device_id-based) users can insert
drop policy if exists "anonymous users insert feedback" on user_feedback;
create policy "anonymous users insert feedback"
  on user_feedback for insert
  with check (is_anonymous = true and user_id is null);

-- Policy 4: Anonymous users can select their own by device_id
drop policy if exists "anonymous users select feedback" on user_feedback;
create policy "anonymous users select feedback"
  on user_feedback for select
  using (is_anonymous = true and user_id is null and device_id = current_setting('app.device_id', true)::uuid);

-- Policy 5: Admins can select all (service role bypass in app)
drop policy if exists "admins select all feedback" on user_feedback;
create policy "admins select all feedback"
  on user_feedback for select
  using (auth.role() = 'service_role');

-- Policy 6: Prevent updates/deletes (immutable).
-- A policy covers exactly one command, so update and delete are separate.
drop policy if exists "no updates" on user_feedback;
create policy "no updates"
  on user_feedback for update
  using (false);

drop policy if exists "no deletes" on user_feedback;
create policy "no deletes"
  on user_feedback for delete
  using (false);
