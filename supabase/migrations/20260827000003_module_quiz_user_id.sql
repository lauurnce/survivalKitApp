-- Add user_id to quiz progress tables for authenticated user support
-- Backdated to 2026-08-20 per commit convention

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