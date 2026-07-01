-- ============================================================
-- Systems Administration and Maintenance — Modules & Sections
-- Subject ID: 40000000-0004-0001-0001-000000000001
-- 4th Year, Semester 1 — major
-- 8 lessons. Split: S1+S2 = content (FREE); remaining teaching blocks + drill
--   = activity (PAID). Most lessons have 3 content blocks -> 2 free / 2 paid;
--   Lesson 4 has 4 content blocks -> 2 free / 3 paid.
-- Only Lesson 8 has a Python playground (ide_language=python + starter_code),
--   inserted via the 7-column form in its own INSERT. All other drills are 5-column.
-- Re-running is safe (DELETE clears prior rows for this subject first).
-- ============================================================

DELETE FROM modules WHERE subject_id = '40000000-0004-0001-0001-000000000001';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('0b43e829-9722-556b-ac9d-2ff5de1e2776','40000000-0004-0001-0001-000000000001','Lesson 1: Introduction to Systems Administration and Maintenance','lesson-1-introduction-to-systems-administration-and-maintenance',1),
  ('04770e05-bf49-595b-b07c-05a0a61b1cb4','40000000-0004-0001-0001-000000000001','Lesson 2: Installing and Configuring Windows Operating Systems','lesson-2-installing-and-configuring-windows-operating-systems',2),
  ('184744d5-a256-573c-a94d-4159ba326ee0','40000000-0004-0001-0001-000000000001','Lesson 3: Installing and Configuring Linux Operating Systems','lesson-3-installing-and-configuring-linux-operating-systems',3),
  ('a8fe3e00-4cab-50cd-83a1-f8ae4358be20','40000000-0004-0001-0001-000000000001','Lesson 4: User and Group Account Management','lesson-4-user-and-group-account-management',4),
  ('adde31d0-fb73-57bf-841d-06791c73f84c','40000000-0004-0001-0001-000000000001','Lesson 5: Network Configuration and Troubleshooting','lesson-5-network-configuration-and-troubleshooting',5),
  ('9d505050-c2b5-5ef9-b212-e026f5bff7e0','40000000-0004-0001-0001-000000000001','Lesson 6: System Updates, Patching, and Maintenance','lesson-6-system-updates-patching-and-maintenance',6),
  ('ccc292bd-c576-599e-8493-11c2b172aa90','40000000-0004-0001-0001-000000000001','Lesson 7: Server Services and Network Applications','lesson-7-server-services-and-network-applications',7),
  ('9597a77e-1d87-5e6c-92c7-637508ef238b','40000000-0004-0001-0001-000000000001','Lesson 8: Automation with Scripting','lesson-8-automation-with-scripting',8);

