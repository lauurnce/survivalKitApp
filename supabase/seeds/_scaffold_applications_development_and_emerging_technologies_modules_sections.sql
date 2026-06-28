-- ============================================================
-- Applications Development and Emerging Technologies — Modules & Sections
-- Subject ID: 30000000-0003-0002-0001-000000000001
-- 3rd Year, Semester 2 — major
-- 7 lessons. Per lesson: S1+S2 = content (FREE), S3 + drill = activity (PAID).
-- Re-running is safe (the DELETE clears prior rows for this subject first).
-- ============================================================

DELETE FROM modules WHERE subject_id = '30000000-0003-0002-0001-000000000001';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('1836bce1-585f-59d6-a2a8-e506c9d47865','30000000-0003-0002-0001-000000000001','Lesson 1: Introduction to Applications Development','lesson-1-introduction-to-applications-development',1),
  ('a8bed4f2-250b-5cf7-bbf9-50fc755f2fa6','30000000-0003-0002-0001-000000000001','Lesson 2: Requirements Analysis and Planning','lesson-2-requirements-analysis-and-planning',2),
  ('52c67d2e-5ca0-568c-b7c8-ca2c0f5d5473','30000000-0003-0002-0001-000000000001','Lesson 3: Design Principles and User Interfaces','lesson-3-design-principles-and-user-interfaces',3),
  ('6482f159-acca-57be-b95f-7a3242217995','30000000-0003-0002-0001-000000000001','Lesson 4: Server-side Development and Databases','lesson-4-server-side-development-and-databases',4),
  ('c98ee9ff-ba9f-5a82-8283-35d95951f53d','30000000-0003-0002-0001-000000000001','Lesson 5: Emerging Technologies','lesson-5-emerging-technologies',5),
  ('3e810057-cdfd-5424-8d29-5af3b0a80efa','30000000-0003-0002-0001-000000000001','Lesson 6: Testing, Deployment, and Security','lesson-6-testing-deployment-and-security',6),
  ('12489fd2-3e14-5ba6-bbb8-9d2ac50e843e','30000000-0003-0002-0001-000000000001','Lesson 7: Ethics, Legal, and Professional Issues','lesson-7-ethics-legal-and-professional-issues',7);

