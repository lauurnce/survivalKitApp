-- Add user_id to module_progress for authenticated user support
-- This allows quiz APIs to query by user_id with RLS policies

ALTER TABLE module_progress ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
CREATE INDEX IF NOT EXISTS module_progress_user_id_idx ON module_progress (user_id);

-- Update RLS policies to allow users to read their own progress
ALTER TABLE module_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "user reads own module_progress" ON module_progress;
DROP POLICY IF EXISTS "user inserts own module_progress" ON module_progress;
DROP POLICY IF EXISTS "user updates own module_progress" ON module_progress;
DROP POLICY IF EXISTS "user deletes own module_progress" ON module_progress;

-- Allow users to read their own progress (by user_id or device_id)
CREATE POLICY "user reads own module_progress" ON module_progress
  FOR SELECT USING (
    user_id = auth.uid() OR 
    device_id = current_setting('request.jwt.claims', true)::json->>'device_id'
  );

-- Allow users to insert their own progress
CREATE POLICY "user inserts own module_progress" ON module_progress
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR 
    device_id = current_setting('request.jwt.claims', true)::json->>'device_id'
  );

-- Allow users to update their own progress
CREATE POLICY "user updates own module_progress" ON module_progress
  FOR UPDATE USING (
    user_id = auth.uid() OR 
    device_id = current_setting('request.jwt.claims', true)::json->>'device_id'
  );

-- Allow users to delete their own progress
CREATE POLICY "user deletes own module_progress" ON module_progress
  FOR DELETE USING (
    user_id = auth.uid() OR 
    device_id = current_setting('request.jwt.claims', true)::json->>'device_id'
  );

-- Backfill user_id for existing rows where device_id matches a known user
-- This will be run by claimDeviceRows on next login