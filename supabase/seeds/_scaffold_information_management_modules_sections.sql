-- ============================================================
-- Information Management — Modules & Sections
-- Subject ID: 20000000-0002-0002-0001-000000000003
-- 2nd Year, Semester 2 — major
-- 10 lessons. Split: S1+S2 = content (FREE); remaining teaching blocks
--   (S3, S4) + the Practice & Exam Drills activity = activity (PAID).
--   Each lesson -> 2 free / 3 paid.
-- Every drill has a SQL playground (ide_language=sql + starter_code), so the
--   drill is inserted via the 7-column form in its own INSERT statement.
-- Re-running is safe (DELETE clears prior rows for this subject first).
-- ============================================================

DELETE FROM modules WHERE subject_id = '20000000-0002-0002-0001-000000000003';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('9ae38391-0460-5ea5-a8f2-2401ab1b110e','20000000-0002-0002-0001-000000000003','Lesson 1: Introduction to Information Systems','lesson-1-introduction-to-information-systems',1),
  ('458c437f-cf15-591b-8a21-a0899a839158','20000000-0002-0002-0001-000000000003','Lesson 2: Data Modeling with ER Diagrams','lesson-2-data-modeling-with-er-diagrams',2),
  ('b0ace7f9-03ae-5c15-b397-b319d705bc24','20000000-0002-0002-0001-000000000003','Lesson 3: Relational Design and Normalization','lesson-3-relational-design-and-normalization',3),
  ('44be57f8-adf1-57d2-80cd-39d62aa91636','20000000-0002-0002-0001-000000000003','Lesson 4: SQL – Data Definition and Data Manipulation','lesson-4-sql-data-definition-and-data-manipulation',4),
  ('21829336-6581-56fb-866e-61c03652d346','20000000-0002-0002-0001-000000000003','Lesson 5: SQL Queries (SELECT, Joins, and Aggregates)','lesson-5-sql-queries-select-joins-and-aggregates',5),
  ('b3cfdb35-2b57-59c7-9388-4007215630eb','20000000-0002-0002-0001-000000000003','Lesson 6: Transactions and Concurrency Control','lesson-6-transactions-and-concurrency-control',6),
  ('40f4d906-7c40-5024-abb5-a5b883c02237','20000000-0002-0002-0001-000000000003','Lesson 7: Database Administration','lesson-7-database-administration',7),
  ('a7ecc400-acc1-5fb4-a3a0-2698e5f59bab','20000000-0002-0002-0001-000000000003','Lesson 8: Data Governance and Information Lifecycle','lesson-8-data-governance-and-information-lifecycle',8),
  ('bc4465f2-dd0f-515b-b0e3-6a55a7f04e11','20000000-0002-0002-0001-000000000003','Lesson 9: Data Warehousing and Business Intelligence','lesson-9-data-warehousing-and-business-intelligence',9),
  ('8886ec70-db30-591b-be11-4085b1169cfd','20000000-0002-0002-0001-000000000003','Lesson 10: Legal and Ethical Issues in Information Management','lesson-10-legal-and-ethical-issues-in-information-management',10);

