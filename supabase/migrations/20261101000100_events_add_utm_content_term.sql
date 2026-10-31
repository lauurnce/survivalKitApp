-- Traffic attribution, part two: utm_content and utm_term.
--
-- 20260706150000 added referrer + utm_source/medium/campaign. The other two
-- standard UTM keys were never stored, so a link tagged with them (which
-- creative, which keyword) recorded nothing beyond the first three. Like the
-- others these are captured on `enter` events only (lib/analytics.ts) and are
-- sanitized and length-capped by app/api/events/route.ts before insert.
--
-- Nullable, no default: every existing row and every non-`enter` row stays
-- NULL. `add column if not exists` keeps the file idempotent.
alter table public.events add column if not exists utm_content text;
alter table public.events add column if not exists utm_term text;
