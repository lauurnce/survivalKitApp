-- ============================================================
-- Information Assurance and Security 2 — Modules & Sections
-- Subject ID: 40000000-0004-0001-0001-000000000002
-- 4th Year, Semester 1 — major
-- 7 lessons. Split: S1+S2 = content (FREE); remaining teaching blocks + drill
--   = activity (PAID). Paid count per lesson follows the paste's real section
--   counts (2 or 3 paid).
-- Only Lesson 5 has a Python playground (ide_language=python + starter_code),
--   inserted via the 7-column form in its own INSERT. All other drills are 5-column.
-- Re-running is safe (DELETE clears prior rows for this subject first).
-- ============================================================

DELETE FROM modules WHERE subject_id = '40000000-0004-0001-0001-000000000002';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('882437b0-973e-51c7-be39-45f5c701541f','40000000-0004-0001-0001-000000000002','Lesson 1: Advanced Threats and Attack Techniques','lesson-1-advanced-threats-and-attack-techniques',1),
  ('9f42039f-5ce6-5d59-a4bf-32eac14c991b','40000000-0004-0001-0001-000000000002','Lesson 2: Network Security and Perimeter Defense','lesson-2-network-security-and-perimeter-defense',2),
  ('2cb05beb-eda4-500f-9c0a-e69e6709df84','40000000-0004-0001-0001-000000000002','Lesson 3: Secure Systems and Virtualization','lesson-3-secure-systems-and-virtualization',3),
  ('44977e92-4e4f-5b35-9f58-2569fe966be1','40000000-0004-0001-0001-000000000002','Lesson 4: Identity and Access Management (IAM)','lesson-4-identity-and-access-management-iam',4),
  ('22f48ad7-d466-5b7c-8f6c-7fec52e01e1a','40000000-0004-0001-0001-000000000002','Lesson 5: Cryptography and PKI','lesson-5-cryptography-and-pki',5),
  ('a4ea525a-c7f6-5e93-a82f-133c554b6228','40000000-0004-0001-0001-000000000002','Lesson 6: Security Operations and Incident Response','lesson-6-security-operations-and-incident-response',6),
  ('3e006bab-3aad-5280-9094-4b0a7df4ffb4','40000000-0004-0001-0001-000000000002','Lesson 7: Security Governance, Risk Management, and Compliance','lesson-7-security-governance-risk-management-and-compliance',7);

