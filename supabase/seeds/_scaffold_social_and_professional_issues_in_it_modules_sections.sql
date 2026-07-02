-- ============================================================
-- Social and Professional Issues in IT — Modules & Sections
-- Subject ID: 40000000-0004-0001-0001-000000000003
-- 4th Year, Semester 1 — major
-- 6 lessons. Split: S1+S2 = content (FREE); remaining teaching blocks + drill
--   = activity (PAID). Paid count follows each lesson's real section count:
--   L1 -> 2/2; L2-L5 -> 2/3; L6 -> 2/4.
-- No IDE playgrounds (professional-issues subject). Re-running is safe (DELETE clears prior rows).
-- ============================================================

DELETE FROM modules WHERE subject_id = '40000000-0004-0001-0001-000000000003';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('537e166b-a533-59c2-bf18-70f907dfac3c','40000000-0004-0001-0001-000000000003','Lesson 1: Professionalism and Ethics in IT','lesson-1-professionalism-and-ethics-in-it',1),
  ('254ba5a2-90e0-5a1b-84e2-060dc2f083a6','40000000-0004-0001-0001-000000000003','Lesson 2: Ethics and Decision-Making in IT','lesson-2-ethics-and-decision-making-in-it',2),
  ('b1ec0564-da59-5cc2-92ee-d4328c2a626d','40000000-0004-0001-0001-000000000003','Lesson 3: Professional Codes of Conduct','lesson-3-professional-codes-of-conduct',3),
  ('ee50e683-3e46-5f0e-82d6-3e7a7ebb3e47','40000000-0004-0001-0001-000000000003','Lesson 4: Privacy, Security, and Cyber Laws','lesson-4-privacy-security-and-cyber-laws',4),
  ('d0a396ec-b8bd-5cd9-9d59-b5d1a544b3d6','40000000-0004-0001-0001-000000000003','Lesson 5: Intellectual Property and Academic Integrity','lesson-5-intellectual-property-and-academic-integrity',5),
  ('3822c95b-e919-5f55-95c6-30a2d8c44a07','40000000-0004-0001-0001-000000000003','Lesson 6: Social and Environmental Impact of IT','lesson-6-social-and-environmental-impact-of-it',6);

