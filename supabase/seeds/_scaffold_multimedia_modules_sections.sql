-- ============================================================
-- Multimedia — Modules & Sections
-- Subject ID: 30000000-0003-0001-0001-000000000001
-- 3rd Year, Semester 1 — major
--
-- Free/paid split: per lesson, sections 1-2 are FREE (kind='content'),
-- section 3 + the practice drills are PAID (kind='activity').
-- No IDE playgrounds (GPT specified no ide_language/starter_code).
-- Re-running is safe (the DELETE clears prior rows for this subject).
-- ============================================================

DELETE FROM modules WHERE subject_id = '30000000-0003-0001-0001-000000000001';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('7e929126-052f-589a-92ca-ba044becbd35','30000000-0003-0001-0001-000000000001','Lesson 1: Multimedia Foundations and Workflow','lesson-1-multimedia-foundations-and-workflow',1),
  ('75730f01-6f88-56d6-95fd-4b4ede5fcbce','30000000-0003-0001-0001-000000000001','Lesson 2: Visual Design and Digital Imaging','lesson-2-visual-design-and-digital-imaging',2),
  ('2c1d5b05-ca76-578e-9580-570309e5cf8a','30000000-0003-0001-0001-000000000001','Lesson 3: Audio Design and Production','lesson-3-audio-design-and-production',3),
  ('e6c18ed9-ec62-51fd-9dac-30d64c50555d','30000000-0003-0001-0001-000000000001','Lesson 4: Video Production and Compression','lesson-4-video-production-and-compression',4),
  ('28157b75-a9ed-5da2-bbe6-ee0447ed76ae','30000000-0003-0001-0001-000000000001','Lesson 5: Animation and Motion Graphics','lesson-5-animation-and-motion-graphics',5),
  ('93abdd94-028d-5497-a29d-ea981ecbed93','30000000-0003-0001-0001-000000000001','Lesson 6: Interaction Design, UI, and Storyboarding','lesson-6-interaction-design-ui-storyboarding',6),
  ('c5025b6a-9043-54d5-81a7-78ae458f52f8','30000000-0003-0001-0001-000000000001','Lesson 7: Authoring, Integration, and Delivery','lesson-7-authoring-integration-and-delivery',7),
  ('871cd8ff-4850-522a-84be-335f2af192c9','30000000-0003-0001-0001-000000000001','Lesson 8: Accessibility, Ethics, and Multimedia Evaluation','lesson-8-accessibility-ethics-evaluation',8);

