-- ============================================================
-- Database Administration — Modules & Sections
-- Subject ID: 0a7947c5-6b9d-4a9c-8980-3d4187ec8d82
-- 3rd Year, Semester 1 — major
--
-- Free/paid split: per lesson, sections 1-2 are FREE (kind='content'),
-- section 3 + the practice drills are PAID (kind='activity').
-- Re-running is safe (the DELETE clears prior rows for this subject).
-- ============================================================

DELETE FROM modules WHERE subject_id = '0a7947c5-6b9d-4a9c-8980-3d4187ec8d82';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('65311dcc-72f1-50c9-80de-3f200a73f099','0a7947c5-6b9d-4a9c-8980-3d4187ec8d82','Lesson 1: Foundations of Database Administration','lesson-1-foundations-of-database-administration',1),
  ('db58ec7e-702f-569a-96e8-0bb0740187a3','0a7947c5-6b9d-4a9c-8980-3d4187ec8d82','Lesson 2: Logical Design, Normalization, and Metadata Control','lesson-2-logical-design-normalization-metadata',2),
  ('13310768-cc33-5dfc-9388-2e853ba6766c','0a7947c5-6b9d-4a9c-8980-3d4187ec8d82','Lesson 3: Physical Storage, File Organization, and Indexing','lesson-3-physical-storage-file-organization-indexing',3),
  ('59f57eb3-cab9-5bbe-bd26-7880e4e43763','0a7947c5-6b9d-4a9c-8980-3d4187ec8d82','Lesson 4: Administrative SQL and Schema Objects','lesson-4-administrative-sql-schema-objects',4),
  ('32c49f63-b4f0-50b1-8297-4a4c762514fd','0a7947c5-6b9d-4a9c-8980-3d4187ec8d82','Lesson 5: Transactions, Concurrency Control, and Recovery Basics','lesson-5-transactions-concurrency-recovery',5),
  ('eeadbcc4-8c57-57c5-ae6c-e645a339b44f','0a7947c5-6b9d-4a9c-8980-3d4187ec8d82','Lesson 6: Backup, Restore, Availability, and Disaster Recovery','lesson-6-backup-restore-availability-disaster-recovery',6),
  ('8e3f6912-f3d9-5fe2-919e-13fd37628889','0a7947c5-6b9d-4a9c-8980-3d4187ec8d82','Lesson 7: Security, Access Control, Auditing, and Data Privacy','lesson-7-security-access-control-auditing-privacy',7),
  ('369553ac-ecd5-5dc7-8a94-3538e96c8e0c','0a7947c5-6b9d-4a9c-8980-3d4187ec8d82','Lesson 8: Monitoring, Performance Tuning, and Capacity Planning','lesson-8-monitoring-performance-tuning-capacity-planning',8);

