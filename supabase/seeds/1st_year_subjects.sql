-- ============================================================
-- 1st Year subjects — run AFTER migration 002
-- Deletes all existing subjects (cascades to modules/sections),
-- then inserts correct 1st year data with non-colliding UUIDs.
-- ============================================================

DELETE FROM subjects;

-- 1st Year, 1st Semester — Major
INSERT INTO subjects (id, year_id, semester, kind, title, slug, sort_order) VALUES
  ('10000000-0001-0001-0001-000000000001',
   '00000000-0000-0000-0000-000000000001',
   1, 'major', 'Computer Programming 1', 'computer-programming-1', 1),
  ('10000000-0001-0001-0001-000000000002',
   '00000000-0000-0000-0000-000000000001',
   1, 'major', 'Introduction to Computing', 'introduction-to-computing', 2);

-- 1st Year, 1st Semester — Minor
INSERT INTO subjects (id, year_id, semester, kind, title, slug, sort_order) VALUES
  ('10000000-0001-0001-0002-000000000001',
   '00000000-0000-0000-0000-000000000001',
   1, 'minor', 'Mathematics in the Modern World', 'mathematics-in-the-modern-world', 3),
  ('10000000-0001-0001-0002-000000000002',
   '00000000-0000-0000-0000-000000000001',
   1, 'minor', 'Accounting Principles', 'accounting-principles', 4),
  ('10000000-0001-0001-0002-000000000003',
   '00000000-0000-0000-0000-000000000001',
   1, 'minor', 'Purposive Communication', 'purposive-communication', 5),
  ('10000000-0001-0001-0002-000000000004',
   '00000000-0000-0000-0000-000000000001',
   1, 'minor', 'Filipinolohiya', 'filipinolohiya', 6);

-- 1st Year, 2nd Semester — Major
INSERT INTO subjects (id, year_id, semester, kind, title, slug, sort_order) VALUES
  ('10000000-0001-0002-0001-000000000001',
   '00000000-0000-0000-0000-000000000001',
   2, 'major', 'Computer Programming 2', 'computer-programming-2', 7),
  ('10000000-0001-0002-0001-000000000002',
   '00000000-0000-0000-0000-000000000001',
   2, 'major', 'Discrete Structures 1', 'discrete-structures-1', 8);

-- 1st Year, 2nd Semester — Minor
INSERT INTO subjects (id, year_id, semester, kind, title, slug, sort_order) VALUES
  ('10000000-0001-0002-0002-000000000001',
   '00000000-0000-0000-0000-000000000001',
   2, 'minor', 'Reading in Philippine History', 'reading-in-philippine-history', 9);
