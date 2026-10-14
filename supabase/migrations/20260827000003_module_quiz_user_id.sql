-- Add user_id to quiz progress tables for authenticated user support.
--
-- Renumbered from 20260820000000 so it sorts after
-- 20260827000000_module_quiz_progress.sql, which creates both tables this
-- file alters. Production already has these columns, indexes and policies;
-- every statement is guarded (IF NOT EXISTS / DROP POLICY IF EXISTS, and
-- ENABLE ROW LEVEL SECURITY is a no-op when already enabled), so re-running
-- this file against a database that has it is harmless.

-- module_quiz_progress
ALTER TABLE module_quiz_progress ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
CREATE INDEX IF NOT EXISTS module_quiz_progress_user_id_idx ON module_quiz_progress (user_id);

ALTER TABLE module_quiz_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user reads own module_quiz_progress" ON module_quiz_progress;
CREATE POLICY "user reads own module_quiz_progress" ON module_quiz_progress
  FOR SELECT USING (user_id = auth.uid());

-- module_quiz_answers
ALTER TABLE module_quiz_answers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
CREATE INDEX IF NOT EXISTS module_quiz_answers_user_id_idx ON module_quiz_answers (user_id);

DROP POLICY IF EXISTS "user reads own module_quiz_answers" ON module_quiz_answers;
CREATE POLICY "user reads own module_quiz_answers" ON module_quiz_answers
  FOR SELECT USING (user_id = auth.uid());
