-- ============================================================
-- The Contemporary World — Modules & Sections
-- Subject ID: 34687e6e-77e9-4b25-a4d9-8d0fd7c05582
-- 1st/2nd Year, Semester 2 — minor
-- 5 lessons. Split: S1+S2 = content (FREE); remaining teaching blocks + drill
--   = activity (PAID). Paid count follows each lesson's real section count:
--   L1 -> 2/3; L2-L5 -> 2/4.
-- No IDE playgrounds (social-science subject). Re-running is safe (DELETE clears prior rows).
-- ============================================================

DELETE FROM modules WHERE subject_id = '34687e6e-77e9-4b25-a4d9-8d0fd7c05582';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('29fdcab7-f5b8-5523-b943-f966655eec69','34687e6e-77e9-4b25-a4d9-8d0fd7c05582','Lesson 1: Defining Globalization','lesson-1-defining-globalization',1),
  ('c6ba1766-bc83-5306-879c-ff88e833e684','34687e6e-77e9-4b25-a4d9-8d0fd7c05582','Lesson 2: Global Economy and Governance','lesson-2-global-economy-and-governance',2),
  ('f72e1372-aea9-5c3f-915d-3c8b054522cd','34687e6e-77e9-4b25-a4d9-8d0fd7c05582','Lesson 3: World Regions and Inequalities','lesson-3-world-regions-and-inequalities',3),
  ('d9f734ea-286e-5602-88f2-768603d69c51','34687e6e-77e9-4b25-a4d9-8d0fd7c05582','Lesson 4: Culture, Media, and Ideas in a Global World','lesson-4-culture-media-and-ideas-in-a-global-world',4),
  ('f28eaacf-7bb3-520b-8de8-9a078649b220','34687e6e-77e9-4b25-a4d9-8d0fd7c05582','Lesson 5: Population, Mobility, and Sustainability','lesson-5-population-mobility-and-sustainability',5);

