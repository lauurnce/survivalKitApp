-- ============================================================
-- Ethics — Modules & Sections
-- Subject ID: 476dbfed-5212-4296-9036-895bbbe546d4
-- 2nd Year, Semester 2 — minor
-- 5 lessons. Each has 3 content blocks + 1 Practice & Exam Drills.
--   Split: S1+S2 = content (FREE); the 3rd teaching block + drill = activity
--   (PAID) -> 2 free / 2 paid every lesson.
-- No IDE playgrounds (philosophy subject). Re-running is safe (DELETE clears prior rows).
-- ============================================================

DELETE FROM modules WHERE subject_id = '476dbfed-5212-4296-9036-895bbbe546d4';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('cf8fe871-8018-5e68-a12b-0f9cc7821b84','476dbfed-5212-4296-9036-895bbbe546d4','Lesson 1: Introduction to Ethics and Moral Concepts','lesson-1-introduction-to-ethics-and-moral-concepts',1),
  ('f0aff824-e320-5405-9bbe-6e17eddd662d','476dbfed-5212-4296-9036-895bbbe546d4','Lesson 2: Moral Agency and Decision-Making','lesson-2-moral-agency-and-decision-making',2),
  ('5e27e216-70e2-5d8a-beb8-e36d540ddd43','476dbfed-5212-4296-9036-895bbbe546d4','Lesson 3: Culture, Society, and Filipino Values','lesson-3-culture-society-and-filipino-values',3),
  ('264ba160-fc4f-5392-ac1f-4c75057ce66b','476dbfed-5212-4296-9036-895bbbe546d4','Lesson 4: Ethical Theories and Frameworks','lesson-4-ethical-theories-and-frameworks',4),
  ('4fb4afbb-c0de-583a-8020-d17130f234d2','476dbfed-5212-4296-9036-895bbbe546d4','Lesson 5: Contemporary Issues and Social Ethics','lesson-5-contemporary-issues-and-social-ethics',5);

