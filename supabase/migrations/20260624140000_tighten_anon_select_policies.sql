-- Tighten over-permissive anon RLS policies that are live in production.
--
-- The deployed database (verified via pg_policies) carries policies that differ
-- in NAME from 20260623_enable_rls.sql but are functionally too broad:
--
--   unlocks.anon_select_unlocks               SELECT  USING (true)
--   module_progress.anon_select_module_progress SELECT USING (true)
--   module_progress.anon_insert_module_progress INSERT WITH CHECK (length checks only)
--   module_progress.anon_delete_module_progress DELETE USING (length checks only)
--
-- `anon_select_unlocks USING (true)` lets any holder of the public publishable
-- key read every device's payment reference (gcash_ref). The unlocks reads the
-- app actually performs all go through the service_role key, so anon needs no
-- SELECT on unlocks at all — drop it.
--
-- The module_progress anon policies allow one anon key to read/modify any
-- device's progress (IDOR). Scope them to the caller's own device_id. The
-- server path (/api/progress) uses service_role and is unaffected.
--
-- Idempotent and safe to replay.

-- ── unlocks: remove anon read entirely (service_role handles all reads) ────────
DROP POLICY IF EXISTS "anon_select_unlocks" ON unlocks;
DROP POLICY IF EXISTS "unlocks_device_read" ON unlocks;

-- ── module_progress: scope anon access to the caller's own device ──────────────
DROP POLICY IF EXISTS "anon_select_module_progress" ON module_progress;
DROP POLICY IF EXISTS "anon_insert_module_progress" ON module_progress;
DROP POLICY IF EXISTS "anon_delete_module_progress" ON module_progress;

CREATE POLICY "anon_select_module_progress" ON module_progress FOR SELECT TO anon
  USING (device_id = current_setting('app.device_id', true));
CREATE POLICY "anon_insert_module_progress" ON module_progress FOR INSERT TO anon
  WITH CHECK (device_id = current_setting('app.device_id', true));
CREATE POLICY "anon_delete_module_progress" ON module_progress FOR DELETE TO anon
  USING (device_id = current_setting('app.device_id', true));
