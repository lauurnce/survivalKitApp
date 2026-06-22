-- ============================================================
-- Seed missing subjects — 2nd Year Sem 2, 3rd Year, 4th Year
-- High-confidence placements only. No modules added.
-- ============================================================

-- 2nd Year, 2nd Semester — additional major subjects
INSERT INTO subjects (id, year_id, semester, kind, title, slug, sort_order) VALUES
  ('20000000-0002-0002-0001-000000000003',
   '00000000-0000-0000-0000-000000000002',
   2, 'major', 'Information Management', 'information-management', 3),
  ('20000000-0002-0002-0001-000000000004',
   '00000000-0000-0000-0000-000000000002',
   2, 'major', 'Human Computer Interaction', 'human-computer-interaction', 4),
  ('20000000-0002-0002-0001-000000000005',
   '00000000-0000-0000-0000-000000000002',
   2, 'major', 'Integrative Programming and Technologies 1', 'integrative-programming-and-technologies-1', 5)
ON CONFLICT (id) DO NOTHING;

-- 3rd Year, 1st Semester — major subjects
INSERT INTO subjects (id, year_id, semester, kind, title, slug, sort_order) VALUES
  ('30000000-0003-0001-0001-000000000001',
   '00000000-0000-0000-0000-000000000003',
   1, 'major', 'Multimedia', 'multimedia', 1),
  ('30000000-0003-0001-0001-000000000002',
   '00000000-0000-0000-0000-000000000003',
   1, 'major', 'Systems Integration and Architecture', 'systems-integration-and-architecture', 2),
  ('30000000-0003-0001-0001-000000000003',
   '00000000-0000-0000-0000-000000000003',
   1, 'major', 'Fundamentals of Research', 'fundamentals-of-research', 3),
  ('30000000-0003-0001-0001-000000000004',
   '00000000-0000-0000-0000-000000000003',
   1, 'major', 'IT Elective 1', 'it-elective-1', 4)
ON CONFLICT (id) DO NOTHING;

-- 3rd Year, 2nd Semester — major subjects
INSERT INTO subjects (id, year_id, semester, kind, title, slug, sort_order) VALUES
  ('30000000-0003-0002-0001-000000000001',
   '00000000-0000-0000-0000-000000000003',
   2, 'major', 'Applications Development and Emerging Technologies', 'applications-development-and-emerging-technologies', 1),
  ('30000000-0003-0002-0001-000000000002',
   '00000000-0000-0000-0000-000000000003',
   2, 'major', 'Technopreneurship', 'technopreneurship', 2),
  ('30000000-0003-0002-0001-000000000003',
   '00000000-0000-0000-0000-000000000003',
   2, 'major', 'Systems Analysis and Design', 'systems-analysis-and-design', 3),
  ('30000000-0003-0002-0001-000000000004',
   '00000000-0000-0000-0000-000000000003',
   2, 'major', 'Information Assurance and Security 1', 'information-assurance-and-security-1', 4),
  ('30000000-0003-0002-0001-000000000005',
   '00000000-0000-0000-0000-000000000003',
   2, 'major', 'IT Elective 2', 'it-elective-2', 5)
ON CONFLICT (id) DO NOTHING;

-- 4th Year, 1st Semester — major subjects
INSERT INTO subjects (id, year_id, semester, kind, title, slug, sort_order) VALUES
  ('40000000-0004-0001-0001-000000000001',
   '00000000-0000-0000-0000-000000000004',
   1, 'major', 'Systems Administration and Maintenance', 'systems-administration-and-maintenance', 1),
  ('40000000-0004-0001-0001-000000000002',
   '00000000-0000-0000-0000-000000000004',
   1, 'major', 'Information Assurance and Security 2', 'information-assurance-and-security-2', 2),
  ('40000000-0004-0001-0001-000000000003',
   '00000000-0000-0000-0000-000000000004',
   1, 'major', 'Social and Professional Issues in IT', 'social-and-professional-issues-in-it', 3),
  ('40000000-0004-0001-0001-000000000004',
   '00000000-0000-0000-0000-000000000004',
   1, 'major', 'IT Elective 3', 'it-elective-3', 4),
  ('40000000-0004-0001-0001-000000000005',
   '00000000-0000-0000-0000-000000000004',
   1, 'major', 'IT Elective 4', 'it-elective-4', 5),
  ('40000000-0004-0001-0001-000000000006',
   '00000000-0000-0000-0000-000000000004',
   1, 'major', 'Capstone Project', 'capstone-project', 6)
ON CONFLICT (id) DO NOTHING;
