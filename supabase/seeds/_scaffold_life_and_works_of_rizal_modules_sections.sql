-- ============================================================
-- The Life and Works of Rizal — Modules & Sections
-- Subject ID: 6c302241-54af-4da4-9078-d1c65c1ce6e7
-- 2nd Year, Semester 2 — minor
-- 6 lessons. Split: S1+S2 = content (FREE); remaining teaching blocks + drill
--   = activity (PAID). L1-L5 have 3 content blocks -> 2 free / 2 paid;
--   L6 has 4 content blocks -> 2 free / 3 paid.
-- No IDE playgrounds (history subject). Re-running is safe (DELETE clears prior rows).
-- ============================================================

DELETE FROM modules WHERE subject_id = '6c302241-54af-4da4-9078-d1c65c1ce6e7';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('dea97086-e17e-5982-9083-c9a9376b37f9','6c302241-54af-4da4-9078-d1c65c1ce6e7','Lesson 1: Rizal Law, Context, and Nationalism','lesson-1-rizal-law-context-and-nationalism',1),
  ('d2a72c3b-74c2-5b37-94c2-7c1748823e4e','6c302241-54af-4da4-9078-d1c65c1ce6e7','Lesson 2: Rizal''s Early Life and Education','lesson-2-rizals-early-life-and-education',2),
  ('8d98f980-8131-52bf-a2c0-09abffc87aa6','6c302241-54af-4da4-9078-d1c65c1ce6e7','Lesson 3: Noli Me Tangere – The First Novel','lesson-3-noli-me-tangere-the-first-novel',3),
  ('243cbf27-b3bc-5465-9e7b-f391da3184f9','6c302241-54af-4da4-9078-d1c65c1ce6e7','Lesson 4: El Filibusterismo – The Sequel and Revenge','lesson-4-el-filibusterismo-the-sequel-and-revenge',4),
  ('f6fadc56-2224-5b7d-9510-40bc86ccdcd1','6c302241-54af-4da4-9078-d1c65c1ce6e7','Lesson 5: Rizal''s Essays, Letters, and Other Writings','lesson-5-rizals-essays-letters-and-other-writings',5),
  ('aa5af8b0-2bec-5dfc-987d-ca07895784ce','6c302241-54af-4da4-9078-d1c65c1ce6e7','Lesson 6: Rizal''s Reform Efforts, Martyrdom, and Legacy','lesson-6-rizals-reform-efforts-martyrdom-and-legacy',6);

