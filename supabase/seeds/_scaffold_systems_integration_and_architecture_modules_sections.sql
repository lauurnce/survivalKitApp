-- ============================================================
-- Systems Integration and Architecture — Modules & Sections
-- Subject ID: 30000000-0003-0001-0001-000000000002
-- 3rd Year, Semester 1 — major
--
-- Free/paid split: per lesson, sections 1-2 are FREE (kind='content'),
-- section 3 + the practice drills are PAID (kind='activity'). Each
-- lesson's drills activity carries a Python IDE playground, so it uses
-- the 7-column form and lives in its own INSERT (a VALUES list cannot
-- mix column counts). Re-running is safe (the DELETE clears prior rows).
-- ============================================================

DELETE FROM modules WHERE subject_id = '30000000-0003-0001-0001-000000000002';

-- ---- Reserved module UUIDs (use in order; delete unused rows) ----
--   M01: 55c215f7-4e39-5eed-9bdb-744e7eb24547
--   M02: 82da7460-0642-5961-b7af-26e3514d34ab
--   M03: fb99eb69-56e4-5383-a04a-4bb95b7de567
--   M04: 5bd78697-327f-5e9a-bc27-ed46b93e8137
--   M05: 22dba449-b892-5d94-aa42-0e07c8a216d2
--   M06: df0c9643-382d-519a-812b-3c6ff679d92f
--   M07: 7147968d-c39c-55fe-9ffb-6e666a1e8f21
--   M08: 8fdf6171-ba7e-50c4-9c78-885914e03998
--   M09: 62d61104-2fa2-577f-85f7-9f07010948ba
--   M10: 3d250545-81f1-5a0c-9625-cdba89716c6e
--   M11: ad22607a-0d60-5c62-96f0-82329ad2cc1b
--   M12: 6ba7a33a-4f4e-58c8-bd3d-39ae703db677

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('55c215f7-4e39-5eed-9bdb-744e7eb24547','30000000-0003-0001-0001-000000000002','Lesson 1: The Role of Systems Integration in Organizations','lesson-1-role-of-systems-integration',1),
  ('82da7460-0642-5961-b7af-26e3514d34ab','30000000-0003-0001-0001-000000000002','Lesson 2: Enterprise Architecture and Architectural Views','lesson-2-enterprise-architecture-views',2),
  ('fb99eb69-56e4-5383-a04a-4bb95b7de567','30000000-0003-0001-0001-000000000002','Lesson 3: Architecture Styles and Quality Attributes','lesson-3-architecture-styles-quality-attributes',3),
  ('5bd78697-327f-5e9a-bc27-ed46b93e8137','30000000-0003-0001-0001-000000000002','Lesson 4: Middleware and Integration Patterns','lesson-4-middleware-integration-patterns',4),
  ('22dba449-b892-5d94-aa42-0e07c8a216d2','30000000-0003-0001-0001-000000000002','Lesson 5: APIs, Services, and Microservice Integration','lesson-5-apis-services-microservice-integration',5),
  ('df0c9643-382d-519a-812b-3c6ff679d92f','30000000-0003-0001-0001-000000000002','Lesson 6: Data Integration and Interoperability','lesson-6-data-integration-interoperability',6),
  ('7147968d-c39c-55fe-9ffb-6e666a1e8f21','30000000-0003-0001-0001-000000000002','Lesson 7: Secure, Reliable, and Observable Integrated Systems','lesson-7-secure-reliable-observable-systems',7),
  ('8fdf6171-ba7e-50c4-9c78-885914e03998','30000000-0003-0001-0001-000000000002','Lesson 8: Testing, Deployment, and Governance of Integration Solutions','lesson-8-testing-deployment-governance',8);

-- ---- Reserved section UUIDs, per module ----
-- Module 1 (55c215f7-4e39-5eed-9bdb-744e7eb24547):
--   S1: 663a3ea2-adb5-5b4f-82b3-c8d81d909ad8
--   S2: d3145c26-9e03-58eb-beb9-e963cef82d9c
--   S3: d81be2af-11c2-5f6d-824d-7be97f72257d
--   S4: f5c633cc-62f5-5c91-8309-3adf27e9f8fe
--   S5: f0bc5844-072c-5b8e-8224-95ad96d75254
--   S6: 3b32b8b7-0b90-5e43-8b8b-40a02ed34e78
--   S7: dfca622a-190b-5f81-a8c2-5602a7577160
--   S8: 73de49d2-401b-5a97-a677-e020d52d5fe4
--   S9: 2f5e069f-42cc-54ae-8b46-59a65c6b684c
--   S10: 9f2b4945-3325-5ba2-8853-65411053181a  <- reserve last for kind='activity'
-- Module 2 (82da7460-0642-5961-b7af-26e3514d34ab):
--   S1: c73f737a-b814-5014-92f4-c9fc5366f163
--   S2: cc5dd8d1-3355-5fa3-82be-7f6c96cc61e3
--   S3: 3567bc26-98c5-5618-adcb-bd9e6b2ac49c
--   S4: 00cea3cc-d5c4-57aa-b435-42f87aaf1ebe
--   S5: fbb1a994-8a70-5eeb-9d24-479d40a8b5b1
--   S6: f57edee0-9635-51ed-ac54-e62baaadf601
--   S7: a869d44d-6365-59ec-88b2-eec37501a7bb
--   S8: 06756c6f-757e-564d-9529-e4ea5c4a8c08
--   S9: c64d81b9-55e8-57fc-91a3-f67238f720c4
--   S10: 1e621a5b-fc31-5869-ac08-bfcba8e09794  <- reserve last for kind='activity'
-- Module 3 (fb99eb69-56e4-5383-a04a-4bb95b7de567):
--   S1: 1a2646bc-0114-522f-8ea6-a846012dc442
--   S2: 5a6ac22c-04cf-5ba9-a84f-004c4c128b09
--   S3: 3bb3b7aa-aafd-5865-93f0-73bd94495b22
--   S4: 585e0192-aea4-581b-9b78-bb2f61cf9f92
--   S5: 865d3935-e807-5705-9be8-036a54ca1dff
--   S6: 362788f4-bbb0-51bc-9a47-a4610bef7e46
--   S7: 04d6f526-c0ac-5d2a-9a4a-b5d8658e5f24
--   S8: 8486d908-57cd-51f7-9c20-c481d569cd30
--   S9: 5788ac9c-cf22-5cf6-818b-45bb8670625d
--   S10: 9974d669-008f-5136-ad78-c5a1daeeea27  <- reserve last for kind='activity'
-- Module 4 (5bd78697-327f-5e9a-bc27-ed46b93e8137):
--   S1: bc9f5cf5-84fc-59cc-8328-33b67c3fcd73
--   S2: 05a9c178-b45a-5db5-9014-2f0620a1852d
--   S3: 63c62059-452f-54cc-8a0b-ee585b71661e
--   S4: 47b5105f-282a-5e4b-b862-1c1f600d664f
--   S5: 351d6cae-338f-5fd6-af27-196dc31e2bf3
--   S6: b5ef7bc2-b8c4-5449-a317-1fe2d57dda00
--   S7: 853872f9-66e2-5d9e-886c-d56657a8c342
--   S8: c934eda4-f320-5a9c-acd4-db9ac43d1524
--   S9: e0174467-4522-5f83-860c-d98f7a63c5c9
--   S10: 8db5593c-cc68-5978-b79c-4abde442bdaf  <- reserve last for kind='activity'
-- Module 5 (22dba449-b892-5d94-aa42-0e07c8a216d2):
--   S1: 251b060c-b5b3-54da-b2a8-0a8e5efb378b
--   S2: 8e58b03b-0e38-5a83-9234-95a6cf006cfd
--   S3: 9941f338-8c20-5c10-9453-d71b913de7d0
--   S4: 1c04a307-9559-5335-8d1e-712c6d5c0b93
--   S5: d4a6c705-df15-5536-96e5-a64d11636856
--   S6: f465ca4d-b71e-5ce3-8070-7327577815a2
--   S7: 7f6330bc-c365-5ac1-bad8-7fccd95a5a35
--   S8: 5284bda1-270e-59ed-b59f-9520e18b709f
--   S9: 98240186-6d3e-5195-87ad-6a1544bf6485
--   S10: 55bcbd77-2799-5f12-88d5-7807b9be08bb  <- reserve last for kind='activity'
-- Module 6 (df0c9643-382d-519a-812b-3c6ff679d92f):
--   S1: 1e73e89f-c15e-5f86-afc9-37daabdba2b3
--   S2: 72b806bd-b3f7-5854-acfb-1240ae5b9d12
--   S3: 6fcbd4e2-4be5-55e0-8a15-97141903b962
--   S4: 34b600e9-ccee-5bba-9507-4a92e775e21f
--   S5: 69cf460c-ab0b-549a-840e-aa6b846e2790
--   S6: 41b58266-d4fa-56e1-9d04-8c4d6fae6e59
--   S7: 441fc543-33f6-51a0-9987-fcfa59b4d640
--   S8: cd0f6582-9674-5987-99e8-e39d4e311996
--   S9: e64d2b01-5625-52e0-9014-2de2e18d305d
--   S10: efcc47ba-d09b-5139-b421-f6d511e05915  <- reserve last for kind='activity'
-- Module 7 (7147968d-c39c-55fe-9ffb-6e666a1e8f21):
--   S1: 634ccc8b-4b83-595d-a14a-ba01eecdd96d
--   S2: f9062371-10b1-59f5-8026-235bde88a3b3
--   S3: 8e0d39c5-b2a5-550f-93d6-872ae5195be3
--   S4: 4aced980-d5c0-59e4-82ee-9c70b3dbd163
--   S5: 6b114c8d-55be-5db3-86f6-b7a099b4b71b
--   S6: bc0b261a-3512-5b01-973a-ba18548cac0e
--   S7: eea7209e-d05f-5ee2-aa51-edc4c9b67c92
--   S8: 8b81130f-58aa-5824-b28c-caef7f957bad
--   S9: 16805f31-9dca-5d16-bd49-823f5d3268b3
--   S10: fa1c2b45-3814-5454-9e77-5f87e66434f0  <- reserve last for kind='activity'
-- Module 8 (8fdf6171-ba7e-50c4-9c78-885914e03998):
--   S1: 5c70085a-e8ae-517b-ab03-5b12eb520b92
--   S2: caa292a5-7d97-56bc-8844-e7def527a785
--   S3: fba8af0c-8e4c-5c5d-a0ec-2d9e239f4ba9
--   S4: c626526b-0775-57e5-8fbe-bd4dfa0b758b
--   S5: 65dafae5-f52d-553f-99b3-da6118c13554
--   S6: 5eb2a16f-06f4-5453-aae9-9dc00ee76698
--   S7: 89ce6c91-ed6f-5106-9807-1bf11e930fcd
--   S8: 9be540da-572e-58da-8489-4f4999f5e996
--   S9: 1747bf8d-1f24-52ee-8f47-172c3c86b307
--   S10: 1d3f777c-bbf6-5820-86ca-24b9dc13e77d  <- reserve last for kind='activity'
-- Module 9 (62d61104-2fa2-577f-85f7-9f07010948ba):
--   S1: 8456f017-a1f1-5d2d-b728-6ab464f1cd4c
--   S2: 3f0ad007-9cc5-5922-a383-9413a01922f7
--   S3: c35ebabe-d6bd-5b48-84c6-e884c8a33b2a
--   S4: 038a08b4-9a81-5df5-9501-6489567350c9
--   S5: 62dde1d2-0a4f-51b9-9f2f-13033e2c5d19
--   S6: 2c00efa4-abbf-533b-84bd-76225d5e06ba
--   S7: d149bfd7-57c5-5fd3-83b0-8d3ba84cfd21
--   S8: 66c9a89f-5530-5323-a8b7-907ac379a86c
--   S9: b1b8f5cb-1c45-5747-a2af-b637a0d99dd8
--   S10: ecbf3770-9100-5cb1-b630-a7e1316e5118  <- reserve last for kind='activity'
-- Module 10 (3d250545-81f1-5a0c-9625-cdba89716c6e):
--   S1: 398e88f3-6be9-504c-a0e2-94eeb907754c
--   S2: 7b436732-4e44-567f-8077-45f8f1ed1dd6
--   S3: d6599d5b-c0e8-5844-bcef-21656e91e17d
--   S4: 717a6993-7b67-51d2-96c5-b5d0de2aeed7
--   S5: 34a2c635-6f18-547b-8e63-34754caac72d
--   S6: 87f108e0-87e9-5600-a5fd-a730f2673b39
--   S7: bab23f2e-5181-5160-bf2c-03ade4791bff
--   S8: b92a094f-4e15-5c8f-9036-f66e120d222a
--   S9: adb68a2c-727f-58fc-83d3-3f24d138cbcc
--   S10: 69db5b30-30c0-5fe3-8121-945d0310a721  <- reserve last for kind='activity'
-- Module 11 (ad22607a-0d60-5c62-96f0-82329ad2cc1b):
--   S1: 3487d6b4-45f6-5a65-a8b4-ca74bff18ed0
--   S2: c4073cb5-9376-5a91-a3d4-fcea8ec12b36
--   S3: d096581e-80ff-5756-a9c2-869571fb3322
--   S4: 86978fda-4600-5edf-bab5-0d96e97a6042
--   S5: da123c14-7cd6-5508-811c-76fbf856711b
--   S6: 4a0b260d-222e-52ca-a5d4-6d9fa130538b
--   S7: 57af4807-27cf-5f8b-acaa-7f4765b82537
--   S8: c9292849-b998-54c8-af49-c7320ad6193c
--   S9: 00a508b5-f2a2-5aeb-b7db-4dbbe09b8fc0
--   S10: 65df1b4b-3a18-507a-bd62-9b1ff1b11905  <- reserve last for kind='activity'
-- Module 12 (6ba7a33a-4f4e-58c8-bd3d-39ae703db677):
--   S1: bd851232-c968-55c7-85c3-47bba0b90ea5
--   S2: 7be9c1d8-adb7-5ed6-ae0e-50d79bece0c4
--   S3: c2a5690d-a9a9-5d4f-ac36-a567f2f3e1f2
--   S4: 381ad68d-2579-59b1-af58-93cb6fd0d4a2
--   S5: 64380bb5-8ad5-5723-9aae-b5ae38e2dd12
--   S6: 9b2a3593-d199-5d81-b8ec-5e3a21063f79
--   S7: 166bd198-01e4-5a9a-8cc2-df03c64205c7
--   S8: ebf03d64-1544-5788-8085-fd6cf419d830
--   S9: dd24e33b-c147-526e-9190-8a47c5907195
--   S10: e1302fe3-6dac-52f3-af02-888b1f78d738  <- reserve last for kind='activity'

-- ============================================================
-- IMPORT TEMPLATE — one INSERT per module. Replace placeholders.
-- content sections are FREE; the final activity section is PAID.
-- ide_language (python|sql|java|c), starter_code, topology_data are
-- all OPTIONAL columns — include only when the section needs them.
-- ============================================================
--
-- INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
-- ('55c215f7-4e39-5eed-9bdb-744e7eb24547','content','<Heading>',$md$
-- <full markdown teaching body — free tier>
-- $md$, 1),
-- ('55c215f7-4e39-5eed-9bdb-744e7eb24547','activity','Practice & Exam Drills — Lesson 1',$md$
-- <review questions, worked exam problems w/ solutions, how-to-pass tips — paid tier>
-- $md$, 2);
--
-- With an interactive playground, use the 5-column form instead:
-- INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
-- ('55c215f7-4e39-5eed-9bdb-744e7eb24547','activity','Coding Drill',$md$<task>$md$, 3, 'python', $code$print("hi")$code$);

-- >>>>>>>>>>>>>>>>>>>>  PASTE FILLED-IN INSERTS BELOW  <<<<<<<<<<<<<<<<<<<<


-- Per lesson: S1/S2 = free content, S3 = content gated as activity,
-- S4 = Practice & Exam Drills activity with a Python playground.
-- 2 free + 2 paid. The S4 drills use the 7-column form, so each lesson
-- splits into one 5-column INSERT (S1-S3) and one 7-column INSERT (S4).

-- ============================================================
-- LESSON 1: The Role of Systems Integration in Organizations
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('55c215f7-4e39-5eed-9bdb-744e7eb24547','content','Why Systems Integration Matters',$md$
Systems integration is the disciplined process of making separate information systems work together as one useful environment. In a real organization, systems rarely exist in isolation. A registrar uses a student information system, an accounting office uses a billing system, HR uses a payroll system, and management relies on reports drawn from many of them. If these systems are disconnected, data must be re-encoded, approvals become slow, and errors multiply.

A good integration solution aims to achieve **interoperability**, which means different applications can exchange data and cooperate correctly even if they were built by different teams, at different times, or with different technologies. This is why integration is not just a programming task. It is also a business problem, a process problem, and a design problem.

When schools and companies talk about "architecture," they mean the high-level structure of the solution: the major components, the data flows, the rules of interaction, and the quality goals the design must meet. A strong architecture answers questions such as:

- Which systems talk directly to each other?
- Which system is the source of truth for a piece of data?
- How are failures handled?
- How do we keep the solution secure, maintainable, and scalable?

For BSIT students, the subject is important because it sits at the intersection of programming, databases, networking, systems administration, security, and project planning. It trains you to think beyond one application and to design whole environments that serve organizational needs.
$md$, 1),
('55c215f7-4e39-5eed-9bdb-744e7eb24547','content','Common Integration Problems and Core Terms',$md$
Many integration failures come from simple but repeated problems. One system may store dates as YYYY-MM-DD, while another uses MM/DD/YYYY. A legacy program may identify a customer by account number, while a mobile app uses email address. An HR system may update every night, but payroll may require immediate data. These differences create mismatches in format, meaning, and timing.

To discuss these clearly, you need a few core terms:

| Term | Plain meaning |
|---|---|
| System | A set of components that work together for a purpose |
| Subsystem | A smaller system inside a larger one |
| Interface | The point where two systems interact |
| Component | A major building block of a system |
| Integration | Connecting systems so they exchange data or services correctly |
| Architecture | The overall structure and rules of the solution |
| Legacy system | An older system still in use |
| Source of truth | The system officially responsible for the correct value of a data item |

You should also separate integration from replacement. Sometimes a company does not replace an old system because it is expensive, risky, or deeply embedded in operations. Instead, the organization builds adapters or services around it so that newer systems can still use its data. This is a common Philippine reality in schools, hospitals, banks, cooperatives, and local government offices.

The goal, then, is not always "build a brand-new system." Often, the smarter goal is "make the existing environment work reliably as one."
$md$, 2),
('55c215f7-4e39-5eed-9bdb-744e7eb24547','activity','The Integration Life Cycle and the People Involved',$md$
A systems integration effort usually follows a life cycle, even if the project is small. It begins with understanding the business need. After that, the team identifies the systems involved, the data that must move, the timing of updates, the risks, and the constraints. Only then should the team choose tools and integration styles.

A simple integration life cycle looks like this:

1. **Problem definition** – What business gap are we solving?
2. **Requirements gathering** – What data, services, users, and rules are involved?
3. **Architecture design** – What components and connections will be used?
4. **Implementation** – Build interfaces, transformations, APIs, or middleware logic
5. **Testing** – Verify correctness, performance, and failure handling
6. **Deployment** – Move the solution into a real environment
7. **Monitoring and maintenance** – Watch logs, fix issues, and improve the design

Several roles usually appear in the process. A **business stakeholder** explains the organizational need. A **systems analyst** translates that need into requirements. A **developer** implements services and connectors. A **database specialist** handles schema and data quality issues. A **network or systems administrator** supports infrastructure, access, and deployment. A **project manager** keeps scope, schedule, and communication under control.

In exams, professors often check whether you can connect technology choices to business needs. Do not study integration as a list of tools only. Study it as a structured response to organizational problems.
$md$, 3);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('55c215f7-4e39-5eed-9bdb-744e7eb24547','activity','Practice & Exam Drills — Lesson 1',$md$
### Review Questions

1. What is systems integration in your own words?
2. Differentiate system integration from system replacement.
3. Why is architecture needed before implementation?
4. What is meant by source of truth?
5. Give two common causes of integration failure.
6. Why do organizations keep legacy systems instead of replacing them immediately?

### Worked Exam-Style Problems

**Problem 1: Concept Identification**

A state university uses three separate systems: enrollment, accounting, and LMS. Students must manually submit screenshots of paid tuition before their LMS access is activated. Identify the integration problem and propose a basic architectural response.

*Step-by-step solution*

1. **State the problem clearly.** The systems are functionally related but operationally disconnected. Payment status is not flowing from accounting to the LMS.
2. **Identify the effect on users and operations.** Students experience delays, staff manually verify proof, and encoding errors may happen.
3. **Name the type of need.** This is an organizational systems integration problem involving data exchange and process automation.
4. **Propose a basic response.** Create an interface or service that allows the accounting system to send verified payment status to the enrollment system or directly to the LMS.
5. **State the expected result.** Once payment is confirmed, access can be activated automatically, reducing delay and manual work.

**Final answer:** The main issue is the lack of integration among the enrollment, accounting, and LMS systems. A suitable response is to design an interface or service that automatically transfers verified payment status from accounting to the LMS workflow so student access is updated without manual screenshots.

**Problem 2: Short Essay**

Explain why systems integration is both a technical and organizational concern.

*Step-by-step solution*

- Technical side: systems differ in language, database design, interfaces, and timing.
- Organizational side: departments have different policies, approval flows, priorities, and data ownership.
- Connection: even if two systems can technically exchange data, the integration may still fail if ownership, rules, or process timing are unclear.
- Conclusion: good integration requires both correct technology and clear coordination.

**Final answer:** Systems integration is technical because it deals with interfaces, data formats, networks, and implementation. It is also organizational because systems belong to different offices with different rules, owners, and workflows. A successful solution must align both the technology and the business process.

### Hands-On Exercise

Use the starter code to build a small "student profile integration" script.

Tasks:

1. Match records from `portal_users` and `lms_users`.
2. Produce a unified list with these fields: `student_no`, `name`, `email`, `course_count`, `status`.
3. If a portal user has no LMS record, still include that user.
4. Print the final integrated list neatly.

**Expected learning:** You are practicing the core idea of integration: reconciling identifiers, handling missing records, and producing a single usable output from two systems.

### How to Pass This Topic

- Memorize the difference between integration, architecture, interface, and source of truth.
- In essay questions, always connect the technical answer to a business consequence.
- Professors often reward answers that mention manual encoding, duplicate data, delays, inconsistency, and legacy constraints.
- Do not answer "use an API" immediately without first stating the actual organizational problem.
- If a question asks for architecture, give the high-level structure, not raw code.
$md$, 4, 'python', $code$# Lesson 1 starter code
# Goal: combine records from two small systems into one unified view.

portal_users = [
    {"student_no": "2023-0001", "name": "Ana Cruz", "email": "ana@school.edu.ph"},
    {"student_no": "2023-0002", "name": "Ben Reyes", "email": "ben@school.edu.ph"},
]

lms_users = [
    {"id": "2023-0001", "course_count": 5, "status": "active"},
    {"id": "2023-0003", "course_count": 2, "status": "active"},
]

def integrate_users(portal, lms):
    # TODO:
    # 1. Match records using student_no from portal and id from lms
    # 2. Produce one list of unified dictionaries
    # 3. If a student exists in portal but not in lms, set course_count to 0 and status to "not_found"
    # 4. Print the final integrated list
    integrated = []
    return integrated

print(integrate_users(portal_users, lms_users))
$code$);

-- ============================================================
-- LESSON 2: Enterprise Architecture and Architectural Views
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('82da7460-0642-5961-b7af-26e3514d34ab','content','What Enterprise Architecture Covers',$md$
Enterprise architecture looks at an organization as a whole and asks how business goals, processes, applications, data, and technology should fit together. In simple terms, it prevents IT from becoming a random collection of disconnected tools.

A practical way to understand enterprise architecture is through four common domains:

| Domain | Main question |
|---|---|
| Business architecture | What does the organization do, and how does work flow? |
| Application architecture | What systems and software support that work? |
| Data architecture | What information is needed, and where is it stored? |
| Technology architecture | What infrastructure, networks, platforms, and devices run everything? |

Suppose a Philippine hospital wants to connect patient registration, laboratory results, and billing. The business architecture describes patient intake and discharge workflows. The application architecture lists the hospital information system, lab system, and billing platform. The data architecture defines patient IDs, records, and result formats. The technology architecture covers servers, networks, cloud services, and endpoint devices.

Systems integration becomes easier when these four views are aligned. If they are not aligned, the team may connect software that does not support the real process or moves data with unclear ownership.

Enterprise architecture is therefore not "only for large corporations." Even a medium-sized school, cooperative, clinic, or retail chain benefits from clear architectural thinking.
$md$, 1),
('82da7460-0642-5961-b7af-26e3514d34ab','content','Architectural Views and Documentation',$md$
No single diagram can explain a whole system to everyone. Managers care about workflows and impact. Developers care about modules, APIs, and dependencies. Database staff care about structures and quality rules. This is why architects produce different **views** of the same solution.

Common architectural documents include:

- **Context diagram** – shows the system and its external actors or connected systems
- **Component diagram** – shows major internal building blocks
- **Data flow diagram** – shows how information moves
- **Deployment diagram** – shows where components run
- **Interface specification** – explains how one system calls or exchanges data with another

A good architectural document is not just "nice-looking." It should answer design questions. For example, a context diagram should reveal whether a payment gateway is external. A deployment view should reveal whether a database and an application server are separated. An interface specification should define request and response structures, errors, and timing.

For exams, remember this rule: views are stakeholder-based. You do not create a diagram just because a tool can draw it. You create it because a stakeholder needs a certain perspective.
$md$, 2),
('82da7460-0642-5961-b7af-26e3514d34ab','activity','As-Is, To-Be, and Gap Analysis',$md$
A common way to teach architecture in BSIT is by comparing the current environment with the desired future environment.

The **as-is architecture** describes the present state. It includes existing systems, pain points, manual steps, data duplication, unsupported legacy tools, and current infrastructure. The **to-be architecture** describes the intended future state after improvement. The difference between them is the **gap**, and studying that gap is called **gap analysis**.

Example:

| Aspect | As-is | To-be |
|---|---|---|
| Student payment validation | Manual screenshot checking | Automated accounting-to-LMS status sync |
| Data entry | Repeated in multiple systems | Shared master student record |
| Reports | Compiled manually | Generated from integrated data |
| Availability | Office-hours dependent | Near real-time status updates |

Gap analysis helps a team decide what must be built, replaced, retained, or wrapped with adapters. This step also reveals risks. Maybe the legacy system cannot expose an API. Maybe the data is incomplete. Maybe network capacity is weak in branch campuses.

When you answer architecture questions, do not jump from "problem" to "tool." Show the transition from as-is to to-be and explain the gap the integration solution closes.
$md$, 3);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('82da7460-0642-5961-b7af-26e3514d34ab','activity','Practice & Exam Drills — Lesson 2',$md$
### Review Questions

1. What are the four common domains of enterprise architecture?
2. Why do architects prepare different views for different stakeholders?
3. What is the purpose of an as-is architecture?
4. What is the purpose of a to-be architecture?
5. Define gap analysis in one to two sentences.
6. Give one example each of a business, application, data, and technology component.

### Worked Exam-Style Problems

**Problem 1: Classification**

A city government is modernizing its permit process. The following items are listed: business permit approval workflow, permit portal, applicant database, network firewall. Classify each item into the correct architectural domain.

*Step-by-step solution*

Ask what each item represents. If it represents work or organizational process, place it under Business. If it is software used by people, place it under Application. If it is stored information, place it under Data. If it is infrastructure or technical platform, place it under Technology.

**Answer:**

- Business permit approval workflow → **Business architecture**
- Permit portal → **Application architecture**
- Applicant database → **Data architecture**
- Network firewall → **Technology architecture**

**Problem 2: As-Is to To-Be**

A private college has separate systems for admissions, enrollment, library, and finance. Students use different logins and staff generate reports manually. Write one as-is statement, one to-be statement, and one gap statement.

*Step-by-step solution*

Describe the current pain point plainly; describe the desired future state plainly; state the specific missing capability between them.

**Sample answer:**

- **As-is:** The college uses separate systems with different logins and manually consolidated reports.
- **To-be:** The college will use integrated services with single sign-on and centralized reporting.
- **Gap:** The current environment lacks shared identity management and integrated data exchange across systems.

### Hands-On Exercise

Complete the starter code so that each component is mapped correctly to one of the four architecture domains.

**Extension task:** Create a second list called `future_changes` and print a simple report like:

```
Enrollment Process -> Business -> Keep/Improve
Student Information System -> Application -> Replace
Student Master Record -> Data -> Standardize
Cloud VM -> Technology -> Scale
```

This helps you think in as-is / to-be / action form.

### How to Pass This Topic

- Memorize the four architecture domains and be ready to classify examples quickly.
- When a problem mentions workflow, think business; software, think application; records, think data; server/network, think technology.
- A common mistake is mixing data architecture with database software. Data architecture is about the information itself, not only the DBMS.
- In essay answers, use the phrase "align business goals with IT solutions" when relevant.
- If the question asks for a view, mention who the view is for.
$md$, 4, 'python', $code$# Lesson 2 starter code
# Goal: classify components into architecture domains.

components = [
    {"name": "Enrollment Process", "type": "workflow"},
    {"name": "Student Information System", "type": "application"},
    {"name": "Student Master Record", "type": "data"},
    {"name": "Cloud VM", "type": "infrastructure"},
]

def classify_component(component_type):
    # TODO:
    # return one of: "Business", "Application", "Data", "Technology"
    return "Unknown"

for item in components:
    layer = classify_component(item["type"])
    print(f'{item["name"]} -> {layer}')
$code$);

-- ============================================================
