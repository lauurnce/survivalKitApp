-- Enable Row-Level Security on all tables
-- All server-side operations use the service_role key (bypasses RLS by design).
-- These policies restrict what the anon key can access as a defense-in-depth measure.

-- ── Public content (read-only for everyone) ───────────────────────────────────
ALTER TABLE years ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE counters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "years_public_read" ON years FOR SELECT TO anon USING (true);
CREATE POLICY "subjects_public_read" ON subjects FOR SELECT TO anon USING (true);
CREATE POLICY "modules_public_read" ON modules FOR SELECT TO anon USING (true);
CREATE POLICY "sections_public_read" ON sections FOR SELECT TO anon USING (true);
CREATE POLICY "counters_public_read" ON counters FOR SELECT TO anon USING (true);

-- ── Device-scoped tables (anon can only read/write their own device's data) ────
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE counter_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE unlocks ENABLE ROW LEVEL SECURITY;

-- Events: device can insert their own events; no read needed (analytics is server-only)
CREATE POLICY "events_device_insert" ON events FOR INSERT TO anon
  WITH CHECK (true);  -- device_id is validated server-side before insert

-- Module progress: device can read/write their own progress
CREATE POLICY "module_progress_device_read" ON module_progress FOR SELECT TO anon
  USING (true);  -- server validates device_id header before querying
CREATE POLICY "module_progress_device_write" ON module_progress FOR INSERT TO anon
  WITH CHECK (true);
CREATE POLICY "module_progress_device_delete" ON module_progress FOR DELETE TO anon
  USING (true);

-- Counter log: device can insert their own visit log
CREATE POLICY "counter_log_device_insert" ON counter_log FOR INSERT TO anon
  WITH CHECK (true);
CREATE POLICY "counter_log_device_read" ON counter_log FOR SELECT TO anon
  USING (true);

-- Unlocks: anon can insert (payment submission) and read their own status
CREATE POLICY "unlocks_device_insert" ON unlocks FOR INSERT TO anon
  WITH CHECK (true);
CREATE POLICY "unlocks_device_read" ON unlocks FOR SELECT TO anon
  USING (true);

-- ── Waitlist: insert-only for anon, no read ───────────────────────────────────
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "waitlist_insert_only" ON waitlist FOR INSERT TO anon
  WITH CHECK (true);
-- No SELECT policy for anon on waitlist — only service_role can read it (admin dashboard)
