-- supabase/migrations/20260905000000_email_unsubscribes.sql
-- Opt-out register for non-transactional email (the finals reactivation mail
-- and anything like it later). One row per user who clicked the signed
-- unsubscribe link or used their mail client's one-click button
-- (RFC 8058 List-Unsubscribe-Post). Receipts and access notices are
-- transactional and are not gated by this table.
--
-- Idempotent: safe to re-paste into the SQL Editor.
create table if not exists email_unsubscribes (
  -- Cascade, matching email_outbox: deleting the account leaves no trace of
  -- its mail preferences behind.
  user_id uuid primary key references auth.users(id) on delete cascade,
  unsubscribed_at timestamptz not null default now(),
  -- 'link' = confirm button on the landing page; 'one_click' = mail client.
  source text not null default 'link' check (source in ('link', 'one_click'))
);

alter table email_unsubscribes enable row level security;
-- No policies: service-role only. The unsubscribe route, the outbox drain and
-- the reactivation script all use the service client; nothing in the browser
-- may read who opted out.
revoke all on table email_unsubscribes from anon, authenticated;
