-- Enable Row-Level Security on all tables.
--
-- All server-side operations use the service_role key, which bypasses RLS by
-- design. These policies are the last line of defense for the PUBLIC anon key
-- (NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY), which ships in the client bundle and
-- can be used to hit the Supabase REST API directly. They must therefore be as
-- tight as the application's intent — never broader.
--
-- SECURITY NOTE: Postgres OR-combines multiple permissive policies for the same
-- (table, command, role). A policy of `USING (true)` / `WITH CHECK (true)`
-- therefore *widens* access even if a stricter policy already exists. An earlier
-- revision of this file did exactly that for `sections` and `unlocks`, which
-- would have silently defeated the paywall. This migration is now written to be
-- idempotent and to DROP any such over-permissive policies before (re)creating
-- the correct, scoped ones. It is safe to replay against production.

-- ── Public content (read-only for everyone) ───────────────────────────────────
ALTER TABLE years ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE counters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "years_public_read" ON years;
DROP POLICY IF EXISTS "subjects_public_read" ON subjects;
DROP POLICY IF EXISTS "modules_public_read" ON modules;
DROP POLICY IF EXISTS "counters_public_read" ON counters;

CREATE POLICY "years_public_read" ON years FOR SELECT TO anon USING (true);
CREATE POLICY "subjects_public_read" ON subjects FOR SELECT TO anon USING (true);
CREATE POLICY "modules_public_read" ON modules FOR SELECT TO anon USING (true);
CREATE POLICY "counters_public_read" ON counters FOR SELECT TO anon USING (true);

-- sections: anon may read ONLY 'content' sections. 'activity' bodies are paid
-- content and are served exclusively via the server-side /api/activity route
-- (service_role) after a subscription/unlock check. The canonical policy lives
-- in 001_initial_schema.sql ("public_read_content_sections"). We must NOT add a
-- second `USING (true)` policy here — that would OR with the content-only policy
-- and expose every activity body to the anon key. Drop any such leak if present.
DROP POLICY IF EXISTS "sections_public_read" ON sections;

-- ── Device-scoped tables ───────────────────────────────────────────────────────
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE counter_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE unlocks ENABLE ROW LEVEL SECURITY;

-- Events: device can insert their own events; no anon read (analytics is server-only).
DROP POLICY IF EXISTS "events_device_insert" ON events;
CREATE POLICY "events_device_insert" ON events FOR INSERT TO anon
  WITH CHECK (true);  -- device_id is validated server-side before insert

-- Module progress: anon writes go through the server (/api/progress, service_role),
-- but the device may read/write its own rows directly as a fallback. Scope reads to
-- the device so one anon key cannot enumerate every device's progress.
DROP POLICY IF EXISTS "module_progress_device_read" ON module_progress;
DROP POLICY IF EXISTS "module_progress_device_write" ON module_progress;
DROP POLICY IF EXISTS "module_progress_device_delete" ON module_progress;
CREATE POLICY "module_progress_device_read" ON module_progress FOR SELECT TO anon
  USING (device_id = current_setting('app.device_id', true));
CREATE POLICY "module_progress_device_write" ON module_progress FOR INSERT TO anon
  WITH CHECK (device_id = current_setting('app.device_id', true));
CREATE POLICY "module_progress_device_delete" ON module_progress FOR DELETE TO anon
  USING (device_id = current_setting('app.device_id', true));

-- Counter log: device can insert its own visit log; no anon read needed.
DROP POLICY IF EXISTS "counter_log_device_insert" ON counter_log;
DROP POLICY IF EXISTS "counter_log_device_read" ON counter_log;
CREATE POLICY "counter_log_device_insert" ON counter_log FOR INSERT TO anon
  WITH CHECK (true);

-- Unlocks: anon may ONLY submit a pending request. It must not be able to create
-- approved rows (that would self-grant paid content) nor read other devices'
-- payment references (gcash_ref). The canonical insert policy
-- ("public_insert_unlocks", WITH CHECK status='pending') lives in
-- 001_initial_schema.sql. Drop any over-permissive duplicates from prior runs.
DROP POLICY IF EXISTS "unlocks_device_insert" ON unlocks;
DROP POLICY IF EXISTS "unlocks_device_read" ON unlocks;

-- ── Waitlist: insert-only for anon, no read ───────────────────────────────────
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "waitlist_insert_only" ON waitlist;
CREATE POLICY "waitlist_insert_only" ON waitlist FOR INSERT TO anon
  WITH CHECK (true);
-- No SELECT policy for anon on waitlist — only service_role can read it (admin dashboard)
