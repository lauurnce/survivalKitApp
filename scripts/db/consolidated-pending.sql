-- ============================================================================
-- BSIT Survival Kit — consolidated PENDING migrations (paste-ready)
-- ============================================================================
-- Purpose : one script to paste into the Supabase SQL Editor that applies
--           every migration never yet run against production. Applying it is
--           equivalent to running the six source files below in order.
--
-- Generated : 2026-08-23 by scripts/db/build-consolidated.sh (do not edit by
--             hand; edit the source files and re-run the script).
--
-- Source files, applied in this order:
--   1. supabase/migrations/20260821010000_profiles_school_type.sql
--   2. supabase/migrations/20260821020000_admin_profiles_agg_school_type.sql
--   3. supabase/migrations/20260822000000_email_outbox.sql
--   4. supabase/migrations/20260822000003_restrict_privileged_rpcs.sql
--   5. supabase/migrations/20260822000004_server_only_public_writes.sql
--   6. supabase/migrations/20260822000005_server_only_feedback_inserts.sql
--
-- IDEMPOTENCY CONTRACT: the SQL Editor can be re-pasted after a partial or
-- failed attempt, so EVERY statement below must be safe to re-run. Tables and
-- indexes are created IF NOT EXISTS, functions use CREATE OR REPLACE,
-- policies are preceded by DROP POLICY IF EXISTS, and grants/revokes are
-- naturally repeatable. Keep new statements inside this contract.
-- ============================================================================


-- ----------------------------------------------------------------
-- Source: supabase/migrations/20260821010000_profiles_school_type.sql
-- ----------------------------------------------------------------

-- supabase/migrations/20260821010000_profiles_school_type.sql
-- Signup now asks every new student for their school and whether it is a
-- state/public institution or a private one. Two changes to `profiles`:
--
-- 1. A new `school_type` column. The sector is STORED, not derived from
--    lib/universities.ts, because only the student can answer it for a
--    school outside our 50-school catalog — and because what the student
--    told us is a different fact from what we looked up.
--
-- 2. `first_name` / `last_name` become nullable. A row now gets created at
--    signup, when we know the school but not yet the student's name. Empty
--    strings would satisfy the old constraint and lie: "hasn't told us yet"
--    would be indistinguishable from "told us it's empty". The existing
--    char_length checks stay and still reject a name that is present but
--    blank, because a CHECK passes on NULL.
--
-- Rows written before today keep school_type NULL, which reads as "not
-- specified" — we do not backfill a sector the student never gave us.
--
-- Idempotent: `add column if not exists` is a no-op on replay, and dropping
-- an already-dropped NOT NULL is a no-op in Postgres.

alter table profiles
  add column if not exists school_type text
    check (school_type in ('Public', 'Private'));

alter table profiles alter column first_name drop not null;
alter table profiles alter column last_name  drop not null;


-- ----------------------------------------------------------------
-- Source: supabase/migrations/20260821020000_admin_profiles_agg_school_type.sql
-- ----------------------------------------------------------------

-- supabase/migrations/20260821020000_admin_profiles_agg_school_type.sql
-- Adds two things to admin_profiles_agg(), both forced by signup now creating
-- profile rows (20260821010000_profiles_school_type.sql):
--
-- 'named'          — rows where the student has actually filled in the profile
--                    form. `total` used to mean the same thing, because the
--                    only way a row existed was a completed form. It no longer
--                    does: a signup row has a school and no name. Reporting
--                    `total` as "profiles completed" would inflate the number
--                    the moment this ships, so the dashboard needs both.
-- 'by_school_type' — public vs private, the answer signup now collects.
--                    Rows written before that column existed group under
--                    'Not specified' rather than being dropped or guessed at.
--
-- Everything else is carried over unchanged from
-- 20260706000001_admin_profiles_agg.sql. Service-role only, like the other
-- admin_* RPCs.
create or replace function admin_profiles_agg()
returns json
language sql security definer
set search_path = public
as $$
  select json_build_object(
    'total', (select count(*) from profiles),
    'named', (select count(*) from profiles where first_name is not null),
    'by_pathway', (
      select json_agg(row_to_json(t))
      from (
        select p.pathway, count(*)::int as count
        from profiles, unnest(pathways) as p(pathway)
        group by p.pathway
        order by count desc
      ) t
    ),
    'by_university', (
      select json_agg(row_to_json(t))
      from (
        select coalesce(university, 'Not specified') as university, count(*)::int as count
        from profiles
        group by coalesce(university, 'Not specified')
        order by count desc
      ) t
    ),
    'by_school_type', (
      select json_agg(row_to_json(t))
      from (
        select coalesce(school_type, 'Not specified') as school_type, count(*)::int as count
        from profiles
        group by coalesce(school_type, 'Not specified')
        order by count desc
      ) t
    ),
    'by_major', (
      select json_agg(row_to_json(t))
      from (
        select major, count(*)::int as count
        from profiles
        where major is not null
        group by major
        order by count desc
      ) t
    )
  );
$$;

revoke execute on function admin_profiles_agg() from public, anon, authenticated;
grant execute on function admin_profiles_agg() to service_role;


-- ----------------------------------------------------------------
-- Source: supabase/migrations/20260822000000_email_outbox.sql
-- ----------------------------------------------------------------

-- supabase/migrations/20260822000000_email_outbox.sql
-- Durable queue for lifecycle email. Rows are written on the payment path and
-- drained by the daily cron, so a Resend outage delays mail instead of losing
-- it: the webhook is idempotent on paymongo_link_id and its retry returns
-- early, which means an inline-only send has no second chance.
create table if not exists email_outbox (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('receipt','welcome','expiry_warning','winback')),
  -- Cascade, matching profiles and user_feedback: a deleted account must not
  -- leave its email address sitting in a queue waiting to be sent to.
  user_id uuid not null references auth.users(id) on delete cascade,
  to_email text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending','sent','failed')),
  attempts int not null default 0,
  last_error text,
  send_after timestamptz not null default now(),
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

-- One email of a given kind per scope, ever. scope_key is the subscription or
-- payment the mail is about, so a second cron pass cannot re-enqueue a warning
-- it already queued. This index is what makes "sent once, never repeated" a
-- property of the schema rather than of the cron's arithmetic.
create unique index if not exists email_outbox_kind_scope_key
  on email_outbox (kind, user_id, (payload->>'scope_key'));

-- The drain query: pending rows that are due, oldest first.
create index if not exists email_outbox_pending_due
  on email_outbox (send_after) where status = 'pending';

alter table email_outbox enable row level security;
-- No policies: service-role only. The webhook and cron both use the service
-- client; nothing in the browser may read a queue of email addresses.


-- ----------------------------------------------------------------
-- Source: supabase/migrations/20260822000003_restrict_privileged_rpcs.sql
-- ----------------------------------------------------------------

-- SECURITY DEFINER functions receive EXECUTE from PUBLIC by default. Revoke
-- that implicit grant so these administrative and rate-limit helpers remain
-- callable only through the server's service-role client.

alter function public.admin_top_sections(integer) set search_path = public;
alter function public.admin_active_subscribers() set search_path = public;
alter function public.admin_waitlist_agg() set search_path = public;

revoke execute on function public.admin_top_sections(integer)
  from public, anon, authenticated;
revoke execute on function public.admin_active_subscribers()
  from public, anon, authenticated;
revoke execute on function public.admin_waitlist_agg()
  from public, anon, authenticated;
revoke execute on function public.check_rate_limit(text, integer, integer)
  from public, anon, authenticated;
revoke execute on function public.cleanup_expired_rate_limits()
  from public, anon, authenticated;

grant execute on function public.admin_top_sections(integer) to service_role;
grant execute on function public.admin_active_subscribers() to service_role;
grant execute on function public.admin_waitlist_agg() to service_role;
grant execute on function public.check_rate_limit(text, integer, integer) to service_role;
grant execute on function public.cleanup_expired_rate_limits() to service_role;


-- ----------------------------------------------------------------
-- Source: supabase/migrations/20260822000004_server_only_public_writes.sql
-- ----------------------------------------------------------------

-- Public submissions are validated and rate-limited by the Next.js API routes,
-- which use service_role. Remove legacy anon policies that let callers bypass
-- those controls by writing through the public Supabase REST endpoint.

drop policy if exists "public_insert_events" on public.events;
drop policy if exists "events_device_insert" on public.events;
drop policy if exists "counter_log_device_insert" on public.counter_log;
drop policy if exists "waitlist_insert_only" on public.waitlist;

-- record_visit mutates counters with definer privileges. Keep it available to
-- the server route only, and pin object resolution for the elevated function.
alter function public.record_visit(text, text, text) set search_path = public;
revoke execute on function public.record_visit(text, text, text)
  from public, anon, authenticated;
grant execute on function public.record_visit(text, text, text) to service_role;


-- ----------------------------------------------------------------
-- Source: supabase/migrations/20260822000005_server_only_feedback_inserts.sql
-- ----------------------------------------------------------------

-- Feedback creation goes through /api/feedback, where identity, ratings,
-- quality approval, coupon eligibility, deduplication, and rate limits are
-- computed server-side. Direct inserts could otherwise choose privileged
-- coupon and approval columns themselves.

drop policy if exists "authenticated users insert own feedback"
  on public.user_feedback;
drop policy if exists "anonymous users insert feedback"
  on public.user_feedback;

