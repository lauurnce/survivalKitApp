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
