-- supabase/migrations/20260905000001_email_outbox_reactivation_kind.sql
-- Allow the finals reactivation mail into the lifecycle queue. The constraint
-- name is the Postgres default for the inline check in
-- 20260822000000_email_outbox.sql, confirmed against production.
--
-- Idempotent: drop-if-exists then re-add, so re-pasting is safe. Existing rows
-- all use the four original kinds, so the re-add validates instantly.
alter table email_outbox drop constraint if exists email_outbox_kind_check;
alter table email_outbox add constraint email_outbox_kind_check
  check (kind in ('receipt', 'welcome', 'expiry_warning', 'winback', 'reactivation'));
