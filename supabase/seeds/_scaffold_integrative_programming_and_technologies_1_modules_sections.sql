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

-- ============================================================
-- LESSON 1: Introduction to Integrative Programming
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('6d054267-bed8-50f2-b5f7-a74b0f230ac0','content','What Is Integrative Programming?',$md$
**Integrative programming** is the discipline of making separate programs, systems, and services work together as one solution. Most real software is not a single program — it is a web app talking to a database, a mobile app calling a payment service, or a school portal pulling grades from a registrar system. This course teaches the "glue" skills: exchanging data between systems, calling services over a network, and designing interfaces so components built by different teams (often in different languages) can cooperate. For example, when you pay a bill through GCash, the app talks to a bank's system, a biller's system, and an SMS gateway — none of which GCash wrote. Integrative programming is what makes that conversation possible, and it is one of the most in-demand skills for Filipino IT graduates because companies rarely build everything from scratch.
$md$, 1),
('6d054267-bed8-50f2-b5f7-a74b0f230ac0','content','Why Systems Must Talk to Each Other',$md$
Organizations accumulate many systems over time: payroll, inventory, HR, accounting, customer apps. These are often bought from different vendors or built years apart — a situation called **heterogeneous systems**. Rewriting everything as one giant program is too expensive and risky, so instead we integrate. Common motivations: (1) **avoiding double encoding** — staff should not retype the same data into two systems; (2) **real-time visibility** — a sale in the store app should immediately update inventory; (3) **new services from old systems** — a university can expose its old enrollment database through a modern mobile app. In the Philippine setting, think of how LandBank, PhilHealth, and SSS systems must exchange member data, or how a barangay records system might feed a city-wide dashboard. Exams often ask you to explain *why* integration beats rewriting: lower cost, less disruption, and reuse of proven systems.
$md$, 2),
('6d054267-bed8-50f2-b5f7-a74b0f230ac0','activity','Integration Approaches at a Glance',$md$
There are several classic approaches to integration, and you should be able to compare them. **File transfer**: one system writes a file (like CSV), another reads it — simple but slow and error-prone. **Shared database**: two applications read and write the same tables — fast, but tightly couples the systems. **Remote procedure calls / APIs**: one system calls a function or web endpoint on another — the dominant modern style (REST APIs fall here). **Messaging**: systems drop messages on a queue that others consume later — great for reliability and decoupling. Each has trade-offs in speed, coupling, and complexity. A typical exam question gives a scenario ("a sari-sari store POS must send daily sales to head office over unreliable internet") and asks which approach fits (messaging or file transfer, because they tolerate downtime). Throughout this course we will use these four approaches as our map.

*Ready to apply this? The practice set below walks through exam-style problems with step-by-step solutions.*
$md$, 3);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('6d054267-bed8-50f2-b5f7-a74b0f230ac0','activity','Practice & Exam Drills — Lesson 1',$md$
**Review Questions**

1. Define integrative programming in your own words.
2. What is a heterogeneous system? Give a real-world example.
3. List the four classic integration approaches and one advantage of each.
4. Why do organizations usually integrate old systems instead of rewriting them?
5. Give a Philippine example of two systems that must exchange data, and what data flows between them.

**Worked Exam-Style Problem**

*Problem:* A university has a 15-year-old enrollment system and wants a new mobile app for students to view schedules. Recommend an integration approach and justify it.

*Solution:* Step 1: Identify constraints — the old system works and holds authoritative data; rewriting is risky. Step 2: Rule out shared database (the mobile app should not write directly into legacy tables) and file transfer (schedules must be reasonably fresh). Step 3: Recommend wrapping the enrollment system with an **API layer**: a small web service reads the legacy database and exposes read-only endpoints like `/students/{id}/schedule`. Step 4: Justify — the legacy system stays untouched, the app gets clean JSON data, and the API can add caching and security. Step 5: Note the trade-off — building and maintaining the API layer is extra work, but it isolates future apps from the legacy design.

**How to Pass Tips**

- Memorize the four integration approaches (file transfer, shared database, API/RPC, messaging) with one pro and one con each — comparison questions are extremely common.
- When a scenario mentions unreliable networks or offline periods, the expected answer is usually messaging or file transfer.
- Use local, concrete examples (GCash, school portals, government agencies) — professors reward grounded answers.
- "Loose coupling" is the magic phrase: integration should let systems change independently.

**Coding Drill:** Complete `merge_records` so it combines a student record from the registrar system with one from the library system into a single dictionary.
$md$, 4, 'python', $code$registrar = {"student_id": "2024-00123", "name": "Ana Cruz", "course": "BSIT"}
library = {"student_id": "2024-00123", "books_borrowed": 3}

def merge_records(a, b):
    # TODO: return one dict containing all keys from both records
    merged = {}
    for key, value in a.items():
        merged[key] = value
    for key, value in b.items():
        merged[key] = value
    return merged

print(merge_records(registrar, library))$code$);
