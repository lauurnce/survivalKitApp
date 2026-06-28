-- ============================================================
-- Fundamentals of Research — Modules & Sections
-- Subject ID: 30000000-0003-0001-0001-000000000003
-- 3rd Year, Semester 1 — minor
-- 6 lessons. Split: S1+S2 = content (FREE); remaining teaching blocks + drill = activity (PAID).
--   Lesson 1 has 4 content blocks + drill -> 2 free / 3 paid.
--   Lessons 2-6 have 3 content blocks + drill -> 2 free / 2 paid.
-- No IDE playgrounds (research subject). Re-running is safe (DELETE clears prior rows).
-- ============================================================

DELETE FROM modules WHERE subject_id = '30000000-0003-0001-0001-000000000003';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('78f694b1-5d38-5bdb-8b3d-13baad91bb40','30000000-0003-0001-0001-000000000003','Lesson 1: Introduction to Research','lesson-1-introduction-to-research',1),
  ('2bdab8a7-b762-566a-ab7c-8328a1de5b94','30000000-0003-0001-0001-000000000003','Lesson 2: Research Problems and Questions','lesson-2-research-problems-and-questions',2),
  ('9911257f-768f-5c34-898e-35bd469c7eff','30000000-0003-0001-0001-000000000003','Lesson 3: Literature Review & Writing','lesson-3-literature-review-and-writing',3),
  ('529e7ab3-78b0-5ae0-9b4f-7957d4fad674','30000000-0003-0001-0001-000000000003','Lesson 4: Research Methods and Design','lesson-4-research-methods-and-design',4),
  ('ac389336-c0b6-51db-9b1e-53542f2bbc78','30000000-0003-0001-0001-000000000003','Lesson 5: Data Collection and Analysis','lesson-5-data-collection-and-analysis',5),
  ('396fb7c8-3e88-510e-91a0-e3be427e2e7e','30000000-0003-0001-0001-000000000003','Lesson 6: Ethics and Proposal Writing','lesson-6-ethics-and-proposal-writing',6);

