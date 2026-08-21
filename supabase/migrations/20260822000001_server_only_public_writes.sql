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
