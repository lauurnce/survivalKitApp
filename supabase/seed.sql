-- ============================================================
-- Seed — one dummy subject/module for nav testing
-- ============================================================

-- Years
insert into years (id, label, sort_order, coming_soon) values
  ('00000000-0000-0000-0000-000000000001', '1st Year', 1, false),
  ('00000000-0000-0000-0000-000000000002', '2nd Year', 2, false),
  ('00000000-0000-0000-0000-000000000003', '3rd Year', 3, true),
  ('00000000-0000-0000-0000-000000000004', '4th Year', 4, true)
on conflict do nothing;

-- Subjects (1st Year)
insert into subjects (id, year_id, title, slug, sort_order) values
  ('00000000-0000-0000-0001-000000000001',
   '00000000-0000-0000-0000-000000000001',
   'Introduction to Computing', 'intro-to-computing', 1),
  ('00000000-0000-0000-0001-000000000002',
   '00000000-0000-0000-0000-000000000001',
   'Computer Programming 1', 'computer-programming-1', 2)
on conflict do nothing;

-- Subjects (2nd Year)
insert into subjects (id, year_id, title, slug, sort_order) values
  ('00000000-0000-0000-0001-000000000003',
   '00000000-0000-0000-0000-000000000002',
   'COBOL Programming', 'cobol-programming', 1),
  ('00000000-0000-0000-0001-000000000004',
   '00000000-0000-0000-0000-000000000002',
   'Computer Programming 2', 'computer-programming-2', 2)
on conflict do nothing;

-- Dummy module
insert into modules (id, subject_id, title, slug, sort_order) values
  ('00000000-0000-0000-0002-000000000001',
   '00000000-0000-0000-0001-000000000001',
   'Module 1 — Overview of Computing', 'module-1-overview', 1)
on conflict do nothing;

-- Dummy sections
insert into sections (module_id, kind, heading, body_md, sort_order) values
  ('00000000-0000-0000-0002-000000000001', 'content',
   'What is Computing?',
   E'Computing is the activity of using and improving computer hardware and software.\n\nIt encompasses everything from writing code to designing systems that process information.',
   1),
  ('00000000-0000-0000-0002-000000000001', 'content',
   'History of Computers',
   E'The first electronic general-purpose computer was ENIAC, built in 1945.\n\nModern computers evolved through several generations of hardware and software innovation.',
   2),
  ('00000000-0000-0000-0002-000000000001', 'activity',
   'Activity 1 — Identify Computer Generations',
   E'Match each computer generation with its defining technology.\n\n1. First Generation — Vacuum tubes\n2. Second Generation — Transistors\n3. Third Generation — Integrated circuits\n4. Fourth Generation — Microprocessors',
   3)
on conflict do nothing;

