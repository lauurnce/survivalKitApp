-- ============================================================
-- Science, Technology and Society — Modules & Sections
-- Subject ID: 2ffc307f-4e05-4ef3-a033-1f6b3ed200d9
-- 1st Year, Semester 2 — minor
-- 5 lessons. Each has 4 content blocks + 1 Practice & Exam Drills.
--   Split: S1+S2 = content (FREE); remaining teaching blocks + drill = activity
--   (PAID) -> 2 free / 3 paid every lesson.
-- No IDE playgrounds (social-science subject). Re-running is safe (DELETE clears prior rows).
-- ============================================================

DELETE FROM modules WHERE subject_id = '2ffc307f-4e05-4ef3-a033-1f6b3ed200d9';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('0dc1d96d-33be-59fe-8ccb-32a0d19301fb','2ffc307f-4e05-4ef3-a033-1f6b3ed200d9','Lesson 1: Introduction to Science, Technology, and Society','lesson-1-introduction-to-science-technology-and-society',1),
  ('9c0b9c7b-9380-567e-a5d0-f9b993976d69','2ffc307f-4e05-4ef3-a033-1f6b3ed200d9','Lesson 2: History of Science and Technology','lesson-2-history-of-science-and-technology',2),
  ('95967eae-8e5f-54e6-9249-68fbae92a030','2ffc307f-4e05-4ef3-a033-1f6b3ed200d9','Lesson 3: Science, Technology and Nation Building','lesson-3-science-technology-and-nation-building',3),
  ('662a726b-5cd6-5445-80c0-1424d009453d','2ffc307f-4e05-4ef3-a033-1f6b3ed200d9','Lesson 4: Technology and Society in the Digital Age','lesson-4-technology-and-society-in-the-digital-age',4),
  ('7db57f56-5374-5d53-8d61-b7adad07b83e','2ffc307f-4e05-4ef3-a033-1f6b3ed200d9','Lesson 5: Science, Technology, and Social Challenges','lesson-5-science-technology-and-social-challenges',5);

