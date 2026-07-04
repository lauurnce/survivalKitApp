-- ============================================================
-- Integrative Programming and Technologies 1 — Modules & Sections
-- Subject ID: 20000000-0002-0002-0001-000000000005
-- 2nd Year, Semester 2 — major
-- 8 lessons. Split: S1+S2 = content (FREE); remaining teaching block + drill
--   = activity (PAID). L1-L8 -> 2/2.
-- Python IDE playgrounds on drills (programming subject).
-- Re-running is safe (DELETE clears prior rows).
-- ============================================================

DELETE FROM modules WHERE subject_id = '20000000-0002-0002-0001-000000000005';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('6d054267-bed8-50f2-b5f7-a74b0f230ac0','20000000-0002-0002-0001-000000000005','Lesson 1: Introduction to Integrative Programming','lesson-1-introduction-to-integrative-programming',1),
  ('deb08773-907a-56c6-ae38-5138a34ddb5b','20000000-0002-0002-0001-000000000005','Lesson 2: Data Interchange Formats — JSON and XML','lesson-2-data-interchange-formats-json-and-xml',2),
  ('157a631d-cc05-5f89-8ebf-da9a84866c20','20000000-0002-0002-0001-000000000005','Lesson 3: Web Services and REST APIs','lesson-3-web-services-and-rest-apis',3),
  ('4f2673dd-9e46-525e-9710-3512a55c0a26','20000000-0002-0002-0001-000000000005','Lesson 4: Server-Side Scripting and Backend Integration','lesson-4-server-side-scripting-and-backend-integration',4),
  ('3dafe7cf-ca2f-5a13-8ee2-e8a91ee3d001','20000000-0002-0002-0001-000000000005','Lesson 5: Database Integration and Data Access','lesson-5-database-integration-and-data-access',5),
  ('b7d098c6-2c95-54a4-8fd7-4e6c081cb6a2','20000000-0002-0002-0001-000000000005','Lesson 6: Sessions, Authentication, and Secure Integration','lesson-6-sessions-authentication-and-secure-integration',6),
  ('0801bc09-f04e-5794-8d82-59d3f6972ee2','20000000-0002-0002-0001-000000000005','Lesson 7: Middleware and Message-Based Integration','lesson-7-middleware-and-message-based-integration',7),
  ('a04c9132-3ec8-5f19-b70f-57da3a8bc949','20000000-0002-0002-0001-000000000005','Lesson 8: Integration Testing, Error Handling, and Best Practices','lesson-8-integration-testing-error-handling-and-best-practices',8);
