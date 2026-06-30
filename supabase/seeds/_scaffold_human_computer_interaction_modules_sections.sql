-- ============================================================
-- Human Computer Interaction — Modules & Sections
-- Subject ID: 20000000-0002-0002-0001-000000000004
-- 2nd Year, Semester 2 — major
-- 8 lessons. Each lesson has 2 content blocks + 1 Practice & Exam Drills.
--   Split: S1+S2 = content (FREE); the drill = activity (PAID) -> 2 free / 1 paid.
-- No IDE playgrounds (design subject — drills are conceptual/design exercises).
-- Re-running is safe (DELETE clears prior rows for this subject first).
-- ============================================================

DELETE FROM modules WHERE subject_id = '20000000-0002-0002-0001-000000000004';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('4e4b0aba-40fb-5aa0-947b-e879ccb5b50c','20000000-0002-0002-0001-000000000004','Lesson 1: Introduction to Human-Computer Interaction','lesson-1-introduction-to-human-computer-interaction',1),
  ('85677651-8ff2-5ab6-aaac-d357bacec61e','20000000-0002-0002-0001-000000000004','Lesson 2: Human Abilities and Cognition','lesson-2-human-abilities-and-cognition',2),
  ('f69a8ee9-ecc8-594b-a29b-4c3601f7240c','20000000-0002-0002-0001-000000000004','Lesson 3: Interaction Design Principles','lesson-3-interaction-design-principles',3),
  ('51a681a2-a833-57e5-bda9-10631c7aec61','20000000-0002-0002-0001-000000000004','Lesson 4: The User-Centered Design Process','lesson-4-the-user-centered-design-process',4),
  ('ae19b157-8db3-5a49-8ae6-5bcee96486d2','20000000-0002-0002-0001-000000000004','Lesson 5: Prototyping and Interface Layout','lesson-5-prototyping-and-interface-layout',5),
  ('7114db28-6196-5bf7-b061-46940060698b','20000000-0002-0002-0001-000000000004','Lesson 6: Usability Testing and Evaluation','lesson-6-usability-testing-and-evaluation',6),
  ('1dac1e42-0b66-541d-acec-c9bf65a35c00','20000000-0002-0002-0001-000000000004','Lesson 7: Accessibility and Inclusive Design','lesson-7-accessibility-and-inclusive-design',7),
  ('5474918a-c771-51ce-9db7-daac8c7a71d0','20000000-0002-0002-0001-000000000004','Lesson 8: Mobile and Emerging Interfaces','lesson-8-mobile-and-emerging-interfaces',8);

