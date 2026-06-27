-- ============================================================
-- Systems Analysis and Design — Modules & Sections
-- Subject ID: 30000000-0003-0002-0001-000000000003
-- 3rd Year, Semester 2 — major
--
-- Free/paid split: per lesson, sections 1-2 are FREE (kind='content'),
-- section 3 + the practice drills are PAID (kind='activity').
-- No IDE playgrounds in this subject (case-analysis drills only).
-- Re-running is safe (the DELETE clears prior rows for this subject).
-- ============================================================

DELETE FROM modules WHERE subject_id = '30000000-0003-0002-0001-000000000003';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('7ca92329-c8f0-5c0b-a525-ab0e36577f5b','30000000-0003-0002-0001-000000000003','Lesson 1: Foundations of Systems Analysis and Design','lesson-1-foundations-of-systems-analysis-and-design',1),
  ('5772a6c6-ea95-5361-8e8e-54b5af556c47','30000000-0003-0002-0001-000000000003','Lesson 2: Systems Planning, Business Processes, and Feasibility','lesson-2-planning-business-processes-feasibility',2),
  ('dee0e51b-5c73-5378-b28e-4f9bd998cbf2','30000000-0003-0002-0001-000000000003','Lesson 3: Requirements Engineering and Fact-Finding','lesson-3-requirements-engineering-fact-finding',3),
  ('82df723c-7208-515c-81a2-3c46bc4bd44b','30000000-0003-0002-0001-000000000003','Lesson 4: Structured Analysis and Data Modeling','lesson-4-structured-analysis-data-modeling',4),
  ('d71a716c-2be0-5dd8-9175-8a9e8e741e4a','30000000-0003-0002-0001-000000000003','Lesson 5: Object-Oriented Analysis and UML','lesson-5-object-oriented-analysis-uml',5),
  ('7793b931-b0db-57bf-adc8-31729fc28bde','30000000-0003-0002-0001-000000000003','Lesson 6: Systems Design','lesson-6-systems-design',6),
  ('d7748ee4-cb0a-5696-b40d-f7bd5dec9ae7','30000000-0003-0002-0001-000000000003','Lesson 7: Testing, Implementation, and Maintenance','lesson-7-testing-implementation-maintenance',7),
  ('00f881d4-f722-51d4-baf5-184966a95b17','30000000-0003-0002-0001-000000000003','Lesson 8: Project Management, Documentation, and Capstone Readiness','lesson-8-project-management-documentation-capstone',8);

