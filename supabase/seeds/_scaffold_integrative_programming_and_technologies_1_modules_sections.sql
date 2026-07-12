-- ============================================================
-- Integrative Programming and Technologies 1, Modules & Sections
-- Subject ID: 20000000-0002-0002-0001-000000000005
-- 2nd Year, Semester 2, major
-- 14 lessons. L1-L8 = integration core; L9-L14 = Python refresher appendix
--   (recovered from a pre-existing live import, renumbered from 1-6).
-- Split: S1+S2 = content (FREE); remaining teaching blocks + drill
--   = activity (PAID). L1-L8 -> 2/2; L9-L14 -> 2/3.
-- Python IDE playgrounds on drills (programming subject).
-- Re-running is safe (DELETE clears prior rows).
-- ============================================================

DELETE FROM modules WHERE subject_id = '20000000-0002-0002-0001-000000000005';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('6d054267-bed8-50f2-b5f7-a74b0f230ac0','20000000-0002-0002-0001-000000000005','Lesson 1: Introduction to Integrative Programming','lesson-1-introduction-to-integrative-programming',1),
  ('deb08773-907a-56c6-ae38-5138a34ddb5b','20000000-0002-0002-0001-000000000005','Lesson 2: Data Interchange Formats, JSON and XML','lesson-2-data-interchange-formats-json-and-xml',2),
  ('157a631d-cc05-5f89-8ebf-da9a84866c20','20000000-0002-0002-0001-000000000005','Lesson 3: Web Services and REST APIs','lesson-3-web-services-and-rest-apis',3),
  ('4f2673dd-9e46-525e-9710-3512a55c0a26','20000000-0002-0002-0001-000000000005','Lesson 4: Server-Side Scripting and Backend Integration','lesson-4-server-side-scripting-and-backend-integration',4),
  ('3dafe7cf-ca2f-5a13-8ee2-e8a91ee3d001','20000000-0002-0002-0001-000000000005','Lesson 5: Database Integration and Data Access','lesson-5-database-integration-and-data-access',5),
  ('b7d098c6-2c95-54a4-8fd7-4e6c081cb6a2','20000000-0002-0002-0001-000000000005','Lesson 6: Sessions, Authentication, and Secure Integration','lesson-6-sessions-authentication-and-secure-integration',6),
  ('0801bc09-f04e-5794-8d82-59d3f6972ee2','20000000-0002-0002-0001-000000000005','Lesson 7: Middleware and Message-Based Integration','lesson-7-middleware-and-message-based-integration',7),
  ('a04c9132-3ec8-5f19-b70f-57da3a8bc949','20000000-0002-0002-0001-000000000005','Lesson 8: Integration Testing, Error Handling, and Best Practices','lesson-8-integration-testing-error-handling-and-best-practices',8),
  ('de4d65cc-eb46-5f93-9efb-c1fdda789339','20000000-0002-0002-0001-000000000005','Lesson 9: Python Refresher, Programming and Problem Solving','lesson-9-python-refresher-programming-and-problem-solving',9),
  ('755b434e-4a5b-573b-92b2-c5d148d78140','20000000-0002-0002-0001-000000000005','Lesson 10: Python Refresher, Variables and Data Types','lesson-10-python-refresher-variables-and-data-types',10),
  ('1f04d8d7-f0a4-538d-a84f-8b82891ffc2d','20000000-0002-0002-0001-000000000005','Lesson 11: Python Refresher, Control Structures and Functions','lesson-11-python-refresher-control-structures-and-functions',11),
  ('8613f8f8-70ad-54a5-ac44-a60306fa82ee','20000000-0002-0002-0001-000000000005','Lesson 12: Python Refresher, Lists, Tuples, and Dictionaries','lesson-12-python-refresher-lists-tuples-and-dictionaries',12),
  ('5c22ae1e-342e-40e8-bbbf-d91b825d246f','20000000-0002-0002-0001-000000000005','Lesson 13: Python Refresher, File I/O and Exception Handling','lesson-13-python-refresher-file-io-and-exception-handling',13),
  ('e97c80ca-1282-4f7e-8033-6a1255c7157b','20000000-0002-0002-0001-000000000005','Lesson 14: Python Refresher, Integrating Python with Technologies','lesson-14-python-refresher-integrating-python-with-technologies',14);

-- ============================================================
-- LESSON 1: Introduction to Integrative Programming
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('6d054267-bed8-50f2-b5f7-a74b0f230ac0','content','What Is Integrative Programming?',$md$
**Integrative programming** is the discipline of making separate programs, systems, and services work together as one solution. Most real software is not a single program, it is a web app talking to a database, a mobile app calling a payment service, or a school portal pulling grades from a registrar system. This course teaches the "glue" skills: exchanging data between systems, calling services over a network, and designing interfaces so components built by different teams (often in different languages) can cooperate. For example, when you pay a bill through GCash, the app talks to a bank's system, a biller's system, and an SMS gateway, none of which GCash wrote. Integrative programming is what makes that conversation possible, and it is one of the most in-demand skills for Filipino IT graduates because companies rarely build everything from scratch.
$md$, 1),
('6d054267-bed8-50f2-b5f7-a74b0f230ac0','content','Why Systems Must Talk to Each Other',$md$
Organizations accumulate many systems over time: payroll, inventory, HR, accounting, customer apps. These are often bought from different vendors or built years apart, a situation called **heterogeneous systems**. Rewriting everything as one giant program is too expensive and risky, so instead we integrate. Common motivations: (1) **avoiding double encoding**, staff should not retype the same data into two systems; (2) **real-time visibility**, a sale in the store app should immediately update inventory; (3) **new services from old systems**, a university can expose its old enrollment database through a modern mobile app. In the Philippine setting, think of how LandBank, PhilHealth, and SSS systems must exchange member data, or how a barangay records system might feed a city-wide dashboard. Exams often ask you to explain *why* integration beats rewriting: lower cost, less disruption, and reuse of proven systems.
$md$, 2),
('6d054267-bed8-50f2-b5f7-a74b0f230ac0','activity','Integration Approaches at a Glance',$md$
There are several classic approaches to integration, and you should be able to compare them. **File transfer**: one system writes a file (like CSV), another reads it, simple but slow and error-prone. **Shared database**: two applications read and write the same tables, fast, but tightly couples the systems. **Remote procedure calls / APIs**: one system calls a function or web endpoint on another, the dominant modern style (REST APIs fall here). **Messaging**: systems drop messages on a queue that others consume later, great for reliability and decoupling. Each has trade-offs in speed, coupling, and complexity. A typical exam question gives a scenario ("a sari-sari store POS must send daily sales to head office over unreliable internet") and asks which approach fits (messaging or file transfer, because they tolerate downtime). Throughout this course we will use these four approaches as our map.

*Ready to apply this? The practice set below walks through exam-style problems with step-by-step solutions.*
$md$, 3);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('6d054267-bed8-50f2-b5f7-a74b0f230ac0','activity','Practice & Exam Drills, Lesson 1',$md$
**Review Questions**

1. Define integrative programming in your own words.
2. What is a heterogeneous system? Give a real-world example.
3. List the four classic integration approaches and one advantage of each.
4. Why do organizations usually integrate old systems instead of rewriting them?
5. Give a Philippine example of two systems that must exchange data, and what data flows between them.

**Worked Exam-Style Problem**

*Problem:* A university has a 15-year-old enrollment system and wants a new mobile app for students to view schedules. Recommend an integration approach and justify it.

*Solution:* Step 1: Identify constraints, the old system works and holds authoritative data; rewriting is risky. Step 2: Rule out shared database (the mobile app should not write directly into legacy tables) and file transfer (schedules must be reasonably fresh). Step 3: Recommend wrapping the enrollment system with an **API layer**: a small web service reads the legacy database and exposes read-only endpoints like `/students/{id}/schedule`. Step 4: Justify, the legacy system stays untouched, the app gets clean JSON data, and the API can add caching and security. Step 5: Note the trade-off, building and maintaining the API layer is extra work, but it isolates future apps from the legacy design.

**How to Pass Tips**

- Memorize the four integration approaches (file transfer, shared database, API/RPC, messaging) with one pro and one con each, comparison questions are extremely common.
- When a scenario mentions unreliable networks or offline periods, the expected answer is usually messaging or file transfer.
- Use local, concrete examples (GCash, school portals, government agencies), professors reward grounded answers.
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

-- ============================================================
-- LESSON 2: Data Interchange Formats, JSON and XML
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('deb08773-907a-56c6-ae38-5138a34ddb5b','content','Why Systems Need a Common Data Language',$md$
When two systems exchange data, they must agree on a format both can read, a **data interchange format**. A Java banking system and a Python mobile backend cannot share raw objects in memory; they exchange text that each side can parse. The two formats you must master are **JSON** (JavaScript Object Notation) and **XML** (eXtensible Markup Language). JSON looks like nested key-value pairs: `{"name": "Ana", "course": "BSIT"}`. XML wraps data in tags: `<student><name>Ana</name></student>`. JSON dominates modern web APIs because it is lighter and maps directly to objects in most languages; XML is still everywhere in enterprise and government systems (electronic invoices, bank files, old web services). Being able to read, write, and convert between both is a core exam skill and a daily task in real integration work.
$md$, 1),
('deb08773-907a-56c6-ae38-5138a34ddb5b','content','JSON in Depth',$md$
JSON has only a few building blocks, which is why it is so popular. **Values** can be strings, numbers, booleans (`true`/`false`), `null`, arrays, or objects. **Objects** are unordered collections of key-value pairs in braces `{}`; **arrays** are ordered lists in brackets `[]`. A student record with grades might look like: `{"student_id": "2024-00123", "grades": [{"subject": "IPT1", "grade": 1.75}]}`. Rules to remember for exams: keys must be double-quoted strings; no trailing commas; no comments allowed. In Python, `json.loads()` turns a JSON string into dictionaries and lists, and `json.dumps()` goes the other way, this pair is called **deserialization** and **serialization**. Almost every REST API you will ever call (payment gateways, weather services, government portals) sends and receives JSON, so fluency here pays off in every later lesson.
$md$, 2),
('deb08773-907a-56c6-ae38-5138a34ddb5b','activity','XML and Choosing Between Formats',$md$
XML organizes data as a tree of nested **elements** with opening and closing tags, optional **attributes** (`<grade subject="IPT1">1.75</grade>`), and a single **root element**. It supports schemas (XSD) that formally validate structure, a big reason banks and government agencies still require it (for example, BIR electronic filings and bank payroll files often use XML). Compared to JSON, XML is more verbose but more self-describing and better at document-style data. Exam comparisons usually expect: JSON = lightweight, native to JavaScript, ideal for web/mobile APIs; XML = heavier, supports validation and namespaces, common in enterprise/legacy systems. A frequent scenario question: "A payment partner requires XML but your app uses JSON internally, what do you do?" Answer: build a **transformation layer** that converts between formats at the boundary, keeping your internal model clean.

*Ready to apply this? The practice set below walks through exam-style problems with step-by-step solutions.*
$md$, 3);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('deb08773-907a-56c6-ae38-5138a34ddb5b','activity','Practice & Exam Drills, Lesson 2',$md$
**Review Questions**

1. What is a data interchange format and why is it necessary?
2. List the six JSON value types.
3. Write a JSON object representing a subject with a title and a list of three lesson titles.
4. What are two advantages of XML over JSON, and two of JSON over XML?
5. What do serialization and deserialization mean?
6. Why can JSON not contain comments, and what problems can that cause?

**Worked Exam-Style Problem**

*Problem:* Convert this XML into equivalent JSON: `<order id="55"><item qty="2">Ballpen</item><item qty="1">Notebook</item></order>`

*Solution:* Step 1: The root `order` becomes an object; its `id` attribute becomes a key: `"id": "55"`. Step 2: Repeated `<item>` elements become an array. Step 3: Each item has an attribute and text content, so represent both: `{"qty": "2", "name": "Ballpen"}`. Final answer: `{"order": {"id": "55", "items": [{"qty": "2", "name": "Ballpen"}, {"qty": "1", "name": "Notebook"}]}}`. Step 4: Note in your answer that attribute-to-key mapping is a design choice, exams award points for stating the convention you used.

**How to Pass Tips**

- Practice hand-writing small JSON documents without a computer; missing quotes and trailing commas are the top mark-losers.
- Remember: JSON keys are always double-quoted; single quotes are invalid.
- For XML, always close every tag and have exactly one root element.
- When asked "which format should this system use," anchor your answer to the consumer: web/mobile app -> JSON; regulated enterprise partner or document validation -> XML.

**Coding Drill:** Complete `total_units` so it parses the JSON string and returns the sum of the units of all subjects.
$md$, 4, 'python', $code$import json

payload = '{"student": "Ana Cruz", "subjects": [{"code": "IPT1", "units": 3}, {"code": "HCI", "units": 3}, {"code": "ETHICS", "units": 2}]}'

def total_units(json_string):
    # TODO: parse the JSON and sum the "units" of every subject
    data = json.loads(json_string)
    total = 0
    for subject in data["subjects"]:
        total += subject["units"]
    return total

print(total_units(payload))$code$);

-- ============================================================
-- LESSON 3: Web Services and REST APIs
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('157a631d-cc05-5f89-8ebf-da9a84866c20','content','What Is a Web Service?',$md$
A **web service** is a program that other programs call over a network using standard web protocols, usually HTTP, the same protocol browsers use. Instead of returning web pages for humans, it returns data (typically JSON) for other software. This matters for integration because HTTP travels everywhere: through firewalls, across the internet, between any languages. Two big styles exist. **SOAP** is the older, XML-heavy standard with strict contracts (WSDL files), still used by banks and government systems. **REST** (REpresentational State Transfer) is the dominant modern style: simple HTTP requests to URLs that represent resources. When your weather app shows a PAGASA-style forecast, or a delivery app tracks a parcel, a REST API call is happening behind the scenes. In this course, "API" (Application Programming Interface) usually means a REST web service.
$md$, 1),
('157a631d-cc05-5f89-8ebf-da9a84866c20','content','REST Fundamentals: Resources, Verbs, and Status Codes',$md$
REST organizes an API around **resources** identified by URLs, such as `/students` or `/students/2024-00123`. You act on resources with **HTTP methods**: **GET** reads data, **POST** creates something new, **PUT/PATCH** update it, and **DELETE** removes it. The server replies with a **status code**: `200 OK` (success), `201 Created`, `400 Bad Request` (your input was wrong), `401 Unauthorized`, `404 Not Found`, and `500 Internal Server Error` (the server crashed). Request and response bodies are usually JSON, with **headers** carrying metadata like `Content-Type: application/json`. A well-designed REST API is predictable: `GET /subjects` lists subjects, `GET /subjects/ipt1` fetches one, `POST /subjects` adds one. Exams love asking you to match methods to actions and to interpret status codes, memorize the ones above cold.
$md$, 2),
('157a631d-cc05-5f89-8ebf-da9a84866c20','activity','Consuming an API in Practice',$md$
Calling an API from code follows the same recipe in every language: build the request (URL, method, headers, optional body), send it, check the status code, then parse the JSON response. In Python this is typically the `requests` library: `response = requests.get(url)`, then `data = response.json()`. Real-world concerns you must mention in exams: **API keys** identify and authorize your app (sent in a header like `Authorization: Bearer <token>`); **rate limits** cap how many calls you can make per minute; **timeouts** stop your app from hanging when the service is slow; and you must **never trust the response blindly**, check the status code before parsing. A typical Philippine scenario: an e-commerce site calls a courier's REST API to compute shipping fees to different provinces, handling the case where the courier's API is down by showing a fallback flat rate.

*Ready to apply this? The practice set below walks through exam-style problems with step-by-step solutions.*
$md$, 3);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('157a631d-cc05-5f89-8ebf-da9a84866c20','activity','Practice & Exam Drills, Lesson 3',$md$
**Review Questions**

1. What is the difference between a web page and a web service?
2. Compare SOAP and REST in two sentences.
3. Match the HTTP methods GET, POST, PUT, DELETE to their actions.
4. What do status codes 200, 201, 400, 401, 404, and 500 mean?
5. What is an API key for, and where is it usually placed in a request?
6. Why should a client always check the status code before parsing the response body?

**Worked Exam-Style Problem**

*Problem:* Design REST endpoints for a barangay clearance system: residents request a clearance, staff view pending requests, staff approve one request.

*Solution:* Step 1: Identify the resource, clearance *requests*. Step 2: Map actions to methods: submit = `POST /requests` (body: resident details; returns `201` with the new request id). Step 3: List pending = `GET /requests?status=pending` (query parameter filters). Step 4: Approve = `PATCH /requests/{id}` with body `{"status": "approved"}`, PATCH because we update one field, not replace the whole record. Step 5: State error handling, `404` if the id does not exist, `400` if the status value is invalid, `401` if a non-staff user tries to approve. Full marks come from correct method choice plus status codes, not just the URLs.

**How to Pass Tips**

- Memorize the method-action table (GET-read, POST-create, PUT/PATCH-update, DELETE-remove), it appears on nearly every quiz.
- Status codes group by hundreds: 2xx success, 4xx client error, 5xx server error. If you forget an exact code, stating the correct group still earns partial credit.
- In design questions, use plural nouns for resources (`/students`, not `/getStudent`), professors check for this.
- Always mention timeouts and error handling when asked how to *consume* an API; it separates passing answers from perfect ones.

**Coding Drill:** Complete `handle_response` so it returns the parsed data when the status is 200, or an error message string for anything else.
$md$, 4, 'python', $code$import json

def handle_response(status_code, body):
    # TODO: if status_code is 200, parse body as JSON and return it;
    # otherwise return the string "error: <status_code>"
    if status_code == 200:
        return json.loads(body)
    return "error: " + str(status_code)

ok = handle_response(200, '{"fee": 120, "courier": "LBC"}')
bad = handle_response(404, '{}')
print(ok)
print(bad)$code$);

-- ============================================================
-- LESSON 4: Server-Side Scripting and Backend Integration
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('4f2673dd-9e46-525e-9710-3512a55c0a26','content','The Role of the Server Side',$md$
Every integrated application has a **server side**: code that runs on a machine you control, sits between users and your data, and talks to other systems. While the browser or mobile app (the **client side**) handles display and input, the server side enforces rules, hides secrets, and coordinates integrations. Why can the client not call a payment gateway directly? Because the gateway's secret API key must never ship inside an app where anyone can extract it. The server holds the key, receives the client's request, calls the gateway, and returns only safe results. Common server-side technologies you will meet: **PHP** (still powering a huge share of Philippine school and business websites), **Node.js** (JavaScript on the server), **Python** (Flask, Django, FastAPI), and **Java** (Spring). The concepts, routing, request handling, responses, are identical across all of them.
$md$, 1),
('4f2673dd-9e46-525e-9710-3512a55c0a26','content','Anatomy of a Request Handler',$md$
Server-side code is organized around **routes**: rules that map a method and URL pattern to a function. A handler for `POST /enroll` might: (1) read and validate the request body; (2) check business rules (is the subject open? does the student have unpaid balances?); (3) call other systems (registrar database, payment API); (4) return a JSON response with the right status code. Two universal rules: **validate every input** (never assume the client sent clean data, check types, ranges, and required fields) and **fail with clear errors** (return `400` with a message like "student_id is required", not a crash). **Environment variables** keep secrets (database passwords, API keys) out of source code, a favorite exam point and a real-world security requirement under the Data Privacy Act, since leaked credentials expose personal data.
$md$, 2),
('4f2673dd-9e46-525e-9710-3512a55c0a26','activity','Integrating Third-Party Services Server-Side',$md$
Real backends are integration hubs. A typical Filipino e-commerce backend calls: a **payment gateway** (PayMongo, Maya) to charge cards or e-wallets, an **SMS/email service** to notify customers, a **courier API** for shipping, and its own **database**. Key patterns to name in exams: the **facade**, your server exposes one clean endpoint (`POST /checkout`) that internally orchestrates several external calls; **webhooks**, instead of you asking the gateway "is it paid yet?" repeatedly, the gateway calls *your* URL when payment completes (push, not poll); and **idempotency**, design handlers so receiving the same webhook twice does not double-process an order (check if the payment id was already recorded). Also mention **graceful degradation**: if the SMS service is down, the order should still succeed and the notification can be retried later.

*Ready to apply this? The practice set below walks through exam-style problems with step-by-step solutions.*
$md$, 3);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('4f2673dd-9e46-525e-9710-3512a55c0a26','activity','Practice & Exam Drills, Lesson 4',$md$
**Review Questions**

1. Give three responsibilities of the server side that the client side must never handle.
2. Why must API secret keys stay on the server?
3. What are the four typical steps inside a request handler?
4. What is a webhook, and how does it differ from polling?
5. Define idempotency and explain why webhook handlers need it.
6. What are environment variables used for?

**Worked Exam-Style Problem**

*Problem:* An online store's `POST /checkout` endpoint sometimes charges customers twice when they double-click the "Pay" button. Diagnose the cause and propose a fix.

*Solution:* Step 1: Diagnose, two identical requests arrive; the handler is not idempotent, so each one creates a separate charge. Step 2: Client-side mitigation, disable the button after the first click (helps, but never sufficient; requests can still be retried by the network). Step 3: Server-side fix, require an **idempotency key**: the client generates a unique order token, and the server records it; if a request arrives with a token it has already processed, return the original result instead of charging again. Step 4: Note that major gateways (Stripe, PayMongo) support exactly this header, showing the pattern is industry standard. Step 5: Conclude, correctness must be enforced on the server because only the server is trusted.

**How to Pass Tips**

- "Never trust the client" answers almost every security-flavored question in this lesson.
- Know the checkout flow by heart: validate -> business rules -> external calls -> response. Professors ask you to order these steps.
- If a scenario involves "the payment succeeded but the system did not update," the expected answer involves webhooks and retries.
- Mention environment variables whenever credentials appear in a question, hardcoded secrets are an automatic red flag.

**Coding Drill:** Complete `process_webhook` so a payment id that was already processed is skipped (returns "duplicate") instead of being recorded twice.
$md$, 4, 'python', $code$processed = {"pay_001", "pay_002"}

def process_webhook(payment_id):
    # TODO: if payment_id is already in processed, return "duplicate";
    # otherwise add it and return "recorded"
    if payment_id in processed:
        return "duplicate"
    processed.add(payment_id)
    return "recorded"

print(process_webhook("pay_003"))
print(process_webhook("pay_003"))
print(processed)$code$);

-- ============================================================
-- LESSON 5: Database Integration and Data Access
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('3dafe7cf-ca2f-5a13-8ee2-e8a91ee3d001','content','Connecting Applications to Databases',$md$
Almost every integration eventually touches a **database**, the system of record where data actually lives. Application code connects to a database server (MySQL, PostgreSQL, SQL Server) through a **driver** or connector library, opens a **connection**, sends SQL, and reads results. Key vocabulary: a **connection string** holds the host, port, database name, and credentials (kept in environment variables, never in code); a **connection pool** reuses open connections because opening one is slow, vital when hundreds of users hit a web app at once. The database is a shared integration point: the enrollment web app, the cashier's system, and the dean's reporting dashboard may all read the same student tables. That is powerful but risky, which is why access is usually mediated through an API or a **data access layer** rather than letting every program write tables directly.
$md$, 1),
('3dafe7cf-ca2f-5a13-8ee2-e8a91ee3d001','content','The Data Access Layer and ORMs',$md$
A **data access layer (DAL)** is the part of your code that isolates SQL from business logic. Instead of scattering queries everywhere, you write functions like `get_student(id)` or `save_enrollment(record)`, if the schema changes, only the DAL changes. Many teams go further and use an **ORM (Object-Relational Mapper)** such as Eloquent (PHP/Laravel), SQLAlchemy (Python), or Prisma (Node.js): it maps tables to classes so `Student.find(id)` generates the SQL for you. Trade-offs to cite in exams: ORMs speed up development and reduce SQL mistakes, but can hide inefficient queries; raw SQL gives full control but more room for error. Also know **transactions**: grouping several statements so they all succeed or all roll back, enrolling a student and charging their account must be atomic, or money and records drift apart.
$md$, 2),
('3dafe7cf-ca2f-5a13-8ee2-e8a91ee3d001','activity','SQL Injection and Safe Queries',$md$
The most examined topic in this lesson is **SQL injection**, the classic attack where user input is pasted into a SQL string. If code builds `"SELECT * FROM users WHERE name = '" + input + "'"` and a user types `' OR '1'='1`, the query returns every user; worse payloads can delete tables. The defense is **parameterized queries** (prepared statements): the SQL template and the values travel separately, so input is always treated as data, never as code, `cursor.execute("SELECT * FROM users WHERE name = %s", (input,))`. Every language and ORM supports this; using it is non-negotiable professionally and legally (a breach of personal data violates the Data Privacy Act of 2012). Exam answers should always name the attack, show a vulnerable example, and give the parameterized fix, that three-part structure earns full marks.

*Ready to apply this? The practice set below walks through exam-style problems with step-by-step solutions.*
$md$, 3);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('3dafe7cf-ca2f-5a13-8ee2-e8a91ee3d001','activity','Practice & Exam Drills, Lesson 5',$md$
**Review Questions**

1. What belongs in a connection string, and where should it be stored?
2. Why do web applications use connection pools?
3. What is a data access layer and what problem does it solve?
4. Give one advantage and one disadvantage of using an ORM.
5. What is a transaction? Give a scenario where skipping it corrupts data.
6. Show a vulnerable SQL string and rewrite it as a parameterized query.

**Worked Exam-Style Problem**

*Problem:* A login form builds this query: `SELECT * FROM accounts WHERE user='<u>' AND pass='<p>'`. Explain how an attacker logs in without a password, and fix the code.

*Solution:* Step 1: The attack, enter username `admin' --` (the `--` starts a SQL comment). The query becomes `SELECT * FROM accounts WHERE user='admin' --' AND pass=''`, so the password check is commented out and the attacker is logged in as admin. Step 2: Name it, SQL injection via string concatenation. Step 3: The fix, a parameterized query: `SELECT * FROM accounts WHERE user=? AND pass=?` with the two inputs bound as parameters; the quote and comment characters are now just literal text. Step 4: Strengthen the answer, passwords should also be hashed (bcrypt), so the query compares hashes, never plaintext. Mentioning both the injection fix and hashing marks a complete answer.

**How to Pass Tips**

- The phrase "parameterized query / prepared statement" must appear in any injection answer, synonyms like "sanitize input" alone earn partial credit only.
- Remember ACID for transactions: Atomicity, Consistency, Isolation, Durability, a favorite enumeration question.
- If asked "ORM or raw SQL?", answer "it depends" with one concrete factor each way, balanced answers score highest.
- Connection pooling questions usually want two words: "reuse" and "performance."

**Coding Drill:** Complete `build_safe_query` so it returns the parameterized template and the values as a tuple, never concatenating user input into the SQL string.
$md$, 4, 'python', $code$def build_safe_query(student_id, semester):
    # TODO: return (sql_template, params) using %s placeholders
    sql = "SELECT subject, grade FROM grades WHERE student_id = %s AND semester = %s"
    params = (student_id, semester)
    return sql, params

sql, params = build_safe_query("2024-00123", "2nd")
print(sql)
print(params)$code$);

-- ============================================================
-- LESSON 6: Sessions, Authentication, and Secure Integration
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('b7d098c6-2c95-54a4-8fd7-4e6c081cb6a2','content','Why HTTP Needs Sessions',$md$
HTTP is **stateless**: every request stands alone, and the server forgets you the moment it responds. Yet applications must remember who is logged in across many requests. The classic solution is the **session**: after login, the server creates a session record and gives the browser a **cookie** holding a random session ID; the browser sends the cookie with every request, and the server looks up who you are. The modern alternative for APIs is the **token**, most commonly a **JWT (JSON Web Token)**: the server signs a small JSON payload (user id, expiry) and hands it to the client, which sends it back in the `Authorization: Bearer` header. Sessions keep state on the server; JWTs keep it on the client with a tamper-proof signature. Know both flows step by step, "trace what happens when a user logs in" is a staple exam question.
$md$, 1),
('b7d098c6-2c95-54a4-8fd7-4e6c081cb6a2','content','Authentication vs Authorization',$md$
These two words are the most confused pair in the course. **Authentication** answers "who are you?", verifying identity with a password, one-time PIN, or fingerprint. **Authorization** answers "what may you do?", checking permissions after identity is known. A student and a registrar both authenticate into the school portal, but only the registrar is authorized to edit grades. Standard building blocks: **password hashing** (store bcrypt hashes, never plaintext, if the database leaks, passwords stay secret), **multi-factor authentication** (password + SMS or authenticator code, now common in Philippine banking apps), and **role-based access control (RBAC)**, assign roles like `student`, `cashier`, `admin`, and check the role on every protected endpoint. The check must happen **on the server for every request**; hiding a button in the app is not authorization.
$md$, 2),
('b7d098c6-2c95-54a4-8fd7-4e6c081cb6a2','activity','Securing System-to-System Integration',$md$
Machines authenticate to each other too. When your backend calls a payment gateway, it presents an **API key** or an **OAuth 2.0** access token; when the gateway calls your webhook, you verify its **signature**, a hash of the payload computed with a shared secret, proving the message is genuine and unaltered. Core rules for exams and real life: (1) **always use HTTPS/TLS** so credentials and personal data are encrypted in transit; (2) **never commit secrets to source control**, use environment variables or secret managers; (3) **verify webhook signatures** before trusting the payload, otherwise anyone who discovers your URL can fake a "payment succeeded" event; (4) **scope and rotate keys**, give each integration the minimum permission and replace keys periodically. These map directly to Data Privacy Act compliance: personal data must be protected in transit and at rest.

*Ready to apply this? The practice set below walks through exam-style problems with step-by-step solutions.*
$md$, 3);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('b7d098c6-2c95-54a4-8fd7-4e6c081cb6a2','activity','Practice & Exam Drills, Lesson 6',$md$
**Review Questions**

1. Why is HTTP called stateless, and what problem does that create?
2. Trace the cookie-session login flow in four steps.
3. How does a JWT differ from a server-side session? Give one advantage of each.
4. Define authentication and authorization with a school-portal example.
5. Why are passwords hashed instead of encrypted or stored as plaintext?
6. What is a webhook signature and what attack does verifying it prevent?

**Worked Exam-Style Problem**

*Problem:* A food-delivery startup exposes `GET /orders/{id}` and discovers users can view other people's orders by changing the id in the URL. Name the flaw and fix it.

*Solution:* Step 1: Name the flaw, broken authorization, specifically an **IDOR** (Insecure Direct Object Reference): the endpoint authenticates the user but never checks ownership. Step 2: The fix, after loading order `{id}`, compare `order.customer_id` with the authenticated user's id from the session/JWT; return `403 Forbidden` (or `404` to avoid leaking existence) when they differ. Step 3: Generalize, every protected resource needs an ownership or role check on the server; client-side hiding is not security. Step 4: Bonus point, use unguessable UUIDs for ids as defense in depth, while stressing the real fix is the server-side check.

**How to Pass Tips**

- One-line memory hook: authentication = login, authorization = permissions. Write it at the top of your scratch paper.
- Any question containing "changed the URL/id and saw someone else's data" is IDOR, answer with a server-side ownership check.
- List the four secret-handling rules (HTTPS, no secrets in code, verify signatures, rotate keys) when asked how systems securely integrate.
- bcrypt is the expected password-hashing answer; MD5 or SHA-1 alone are marked wrong.

**Coding Drill:** Complete `can_access` so it allows the request only when the user owns the order or has the admin role.
$md$, 4, 'python', $code$def can_access(user, order):
    # TODO: return True if user owns the order or user's role is "admin"
    if user["role"] == "admin":
        return True
    return user["id"] == order["customer_id"]

alice = {"id": 7, "role": "customer"}
admin = {"id": 1, "role": "admin"}
order = {"id": "ORD-55", "customer_id": 7}

print(can_access(alice, order))
print(can_access(admin, order))
print(can_access({"id": 9, "role": "customer"}, order))$code$);

-- ============================================================
-- LESSON 7: Middleware and Message-Based Integration
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('0801bc09-f04e-5794-8d82-59d3f6972ee2','content','What Is Middleware?',$md$
**Middleware** is software that sits between other software, handling the plumbing so applications do not talk to each other directly. The term appears at two levels, and exams test both. At the **application level**, middleware is a chain of functions that every request passes through before reaching your handler, logging, authentication checks, input parsing, CORS headers. Express (Node.js), Laravel, and Django all use this pattern: a login-required middleware runs once and protects every route behind it. At the **systems level**, middleware means infrastructure that connects whole applications: **message brokers** (RabbitMQ, Kafka), **API gateways** (one entry point that routes, throttles, and secures calls to many backend services), and **enterprise service buses** in older architectures. Both meanings share one idea: put cross-cutting work in the middle so individual programs stay simple.
$md$, 1),
('0801bc09-f04e-5794-8d82-59d3f6972ee2','content','Message Queues and Asynchronous Integration',$md$
A **message queue** decouples systems in time: a **producer** puts a message on the queue and moves on; a **consumer** takes messages off and processes them at its own pace. If the consumer is down, messages simply wait, nothing is lost. This is **asynchronous** integration, in contrast to a REST call where the caller blocks until the answer returns (**synchronous**). Vocabulary to master: **queue** (point-to-point: one consumer gets each message) versus **publish/subscribe** (every subscriber gets a copy); **at-least-once delivery** (messages may repeat, so consumers must be idempotent, the Lesson 4 concept returns); and **dead-letter queue** (where repeatedly failing messages are parked for inspection). Classic scenario: an online store queues "send receipt email" jobs so checkout stays fast even if the email service is slow, the customer never waits for SMTP.
$md$, 2),
('0801bc09-f04e-5794-8d82-59d3f6972ee2','activity','Choosing Sync vs Async in Real Designs',$md$
Exam design questions usually reduce to one decision: call it now (synchronous REST) or queue it (asynchronous messaging)? Use **synchronous** when the caller needs the answer to continue, checking a balance before approving a withdrawal, validating a discount code at checkout. Use **asynchronous** when the work can happen later or must survive outages, sending notifications, generating reports, syncing sales from provincial branches with unstable internet to a head-office server in Manila. Hybrid designs are common and score well: accept the order synchronously (fast `201 Created`), then queue the slow parts (email, inventory sync, analytics). Also name the costs honestly: queues add infrastructure to run, make debugging harder (where is my message?), and only guarantee *eventual* consistency, the dashboard may lag a few seconds behind reality. Trade-off awareness is what separates a memorized answer from an engineer's answer.

*Ready to apply this? The practice set below walks through exam-style problems with step-by-step solutions.*
$md$, 3);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('0801bc09-f04e-5794-8d82-59d3f6972ee2','activity','Practice & Exam Drills, Lesson 7',$md$
**Review Questions**

1. Define middleware at the application level and at the systems level.
2. What does an API gateway do? Name three responsibilities.
3. Differentiate a queue from publish/subscribe.
4. What is at-least-once delivery, and what must consumers do because of it?
5. What is a dead-letter queue for?
6. Give one scenario each where synchronous and asynchronous integration is the right choice, and why.

**Worked Exam-Style Problem**

*Problem:* A chain of pharmacies in different provinces must report sales to head office. Internet at branches is intermittent. Design the integration and justify each choice.

*Solution:* Step 1: Requirements, no lost sales data, tolerate offline periods, head office needs consolidated (not instant) figures. Step 2: Choose asynchronous messaging, each branch POS writes sales to a **local queue/store**; a sync agent forwards messages to the head-office broker whenever connectivity returns. Step 3: Handle duplicates, the broker delivers at-least-once, so the head-office consumer checks each sale's unique id before inserting (idempotency). Step 4: Handle poison messages, malformed records go to a dead-letter queue for manual review instead of blocking the line. Step 5: Justify rejecting REST-only, synchronous calls would fail during outages and lose or delay data; the queue turns unreliable connectivity from a failure into a normal case.

**How to Pass Tips**

- "Unreliable network" or "system may be down" in a scenario = queue-based answer, almost without exception.
- Draw the boxes: producer -> queue -> consumer. A labeled diagram earns method marks even if wording is thin.
- Pair "at-least-once" with "idempotent consumer" in the same sentence, professors look for that linkage.
- Remember the hybrid pattern (respond fast, queue the slow work); it is the model answer for most e-commerce scenarios.

**Coding Drill:** Complete `drain_queue` so it processes messages in FIFO order, skipping ids already seen (duplicate delivery) and returning the list of processed ids.
$md$, 4, 'python', $code$queue = [
    {"id": "s1", "amount": 250},
    {"id": "s2", "amount": 480},
    {"id": "s1", "amount": 250},
    {"id": "s3", "amount": 120},
]

def drain_queue(messages):
    # TODO: process in order; skip duplicate ids; return processed ids
    seen = set()
    processed = []
    for msg in messages:
        if msg["id"] in seen:
            continue
        seen.add(msg["id"])
        processed.append(msg["id"])
    return processed

print(drain_queue(queue))$code$);

-- ============================================================
-- LESSON 8: Integration Testing, Error Handling, and Best Practices
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a04c9132-3ec8-5f19-b70f-57da3a8bc949','content','Testing Integrated Systems',$md$
Testing one program is hard; testing several programs talking to each other is harder, so the industry uses a **testing pyramid**. **Unit tests** check single functions in isolation and run in milliseconds. **Integration tests** check that components work together, does the API really write to the database? does the JSON parse into the right fields? **End-to-end tests** drive the whole system like a user would. A key technique for integration work is the **mock** (or stub): a fake stand-in for an external service. You cannot charge a real credit card in every test run, so you mock the payment gateway to return a scripted "success" or "declined" response. Most providers also offer a **sandbox environment**, a fake version of their real API with test credentials, which is why PayMongo, Maya, and similar services give developers test keys separate from live keys.
$md$, 1),
('a04c9132-3ec8-5f19-b70f-57da3a8bc949','content','Error Handling Across System Boundaries',$md$
In an integrated system, failure is normal: networks drop, services time out, partners deploy bugs. Robust integration code plans for this. Patterns to know: **timeouts** on every external call (never wait forever); **retries with exponential backoff**, wait 1s, then 2s, then 4s before retrying, so a struggling service is not hammered; the **circuit breaker**, after repeated failures, stop calling the broken service for a while and fail fast, protecting your own app; and **fallbacks**, degrade gracefully, like showing cached shipping rates when the courier API is down. Equally important is **logging**: record every external call with a correlation id so you can trace one user's request across systems. Exam scenarios often describe a cascade ("the courier API slowed down and the whole store froze") and expect you to prescribe timeouts plus a circuit breaker.
$md$, 2),
('a04c9132-3ec8-5f19-b70f-57da3a8bc949','activity','Integration Best Practices, The Checklist',$md$
This closing section collects the course into one reviewable checklist. **Design**: expose clean, versioned APIs (`/v1/...`) so you can evolve without breaking consumers; document them (OpenAPI/Swagger is the standard). **Data**: validate at every boundary; use standard formats (JSON/XML) and agree on schemas early. **Security**: HTTPS everywhere, secrets in environment variables, authenticate both users and systems, verify webhook signatures. **Reliability**: timeouts, retries with backoff, idempotent handlers, queues for work that can wait. **Operations**: log with correlation ids, monitor error rates, test against sandboxes and mocks before touching production. Walk into the final exam able to expand any checklist line into a paragraph with an example, that skill converts directly into essay points, and later, into the habits employers expect from a junior developer on day one.

*Ready to apply this? The practice set below walks through exam-style problems with step-by-step solutions.*
$md$, 3);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('a04c9132-3ec8-5f19-b70f-57da3a8bc949','activity','Practice & Exam Drills, Lesson 8',$md$
**Review Questions**

1. Order the testing pyramid levels and state what each verifies.
2. What is a mock, and why is it essential when testing payment integrations?
3. What is a sandbox environment? How does it differ from production?
4. Explain retries with exponential backoff and why plain rapid retries are harmful.
5. What does a circuit breaker do, and what failure does it prevent?
6. What is a correlation id and how does it help debugging across systems?

**Worked Exam-Style Problem**

*Problem:* During a flash sale, a store's checkout calls an inventory service that becomes slow. Requests pile up until the entire website stops responding. Explain the failure and redesign for resilience.

*Solution:* Step 1: Explain the cascade, checkout threads block waiting on the slow service; with no timeout, every web worker ends up stuck, so even non-checkout pages die. Step 2: Immediate fix, add a **timeout** (e.g., 2 seconds) so calls fail fast instead of accumulating. Step 3: Add a **circuit breaker**, after N consecutive failures, skip the call entirely for a cooldown period and return a fallback ("stock level unavailable, order will be confirmed by email"). Step 4: Restructure, move stock reconciliation to a **queue** so checkout does not synchronously depend on inventory during peak load. Step 5: Verify, load-test the redesign in a staging environment with the inventory service artificially slowed, proving the site stays up. Naming timeout, circuit breaker, fallback, and queue in one coherent design is the full-marks answer.

**How to Pass Tips**

- Memorize the pyramid order (unit -> integration -> end-to-end) and that cost/speed rises as you go up.
- "The whole system froze because one service was slow" always wants: timeout + circuit breaker + fallback.
- Never say "test in production", say sandbox, staging, or mocks.
- For essay finals, reproduce the five-part checklist (design, data, security, reliability, operations) as your outline, it structures a complete answer instantly.

**Coding Drill:** Complete `call_with_retry` so it retries the flaky service up to 3 times and returns the first successful result, or "gave up" if all attempts fail.
$md$, 4, 'python', $code$attempts = {"count": 0}

def flaky_service():
    attempts["count"] += 1
    if attempts["count"] < 3:
        return None  # failure
    return "inventory: 42 units"

def call_with_retry(service, max_tries):
    # TODO: try up to max_tries times; return first non-None result, else "gave up"
    for _ in range(max_tries):
        result = service()
        if result is not None:
            return result
    return "gave up"

print(call_with_retry(flaky_service, 3))
print("attempts made:", attempts["count"])$code$);


-- ============================================================
-- LESSON 9: Python Refresher, Programming and Problem Solving
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('de4d65cc-eb46-5f93-9efb-c1fdda789339','content','What Is Interactive Programming?',$md$
Interactive programming involves creating programs that respond to user input or events, making applications more engaging. Unlike batch programs that run from start to finish automatically, interactive programs wait for the user and then do something, such as clicking a button or entering text. This course introduces fundamental concepts of programming and shows how technologies (like Python or web interfaces) can be integrated to build simple interactive applications. You will learn basic problem-solving and programming principles, preparing you for building practical projects.
$md$, 1),
('de4d65cc-eb46-5f93-9efb-c1fdda789339','content','Programming and Problem Solving',$md$
Effective programming starts with problem solving. We break a problem into smaller steps before writing code. This often begins with defining the problem, understanding requirements, and then designing a solution algorithmically. An **algorithm** is a step-by-step procedure to solve a task. For example, to compute the sum of two numbers:

1. Input two numbers.
2. Add them together.
3. Output the result.

Using tools like **flowcharts** or **pseudocode** helps visualize these steps. A flowchart uses symbols (ovals for start/end, rectangles for actions, diamonds for decisions) to map logic. In this module, you'll learn to read and draw simple flowcharts to plan programs. Effective problem solving sets the foundation: before coding, outline your logic so the program follows a clear plan.
$md$, 2),
('de4d65cc-eb46-5f93-9efb-c1fdda789339','activity','Getting Started with Python',$md$
In this class we will use **Python** as our programming language. Python is easy-to-read and widely used in schools and industry. To start coding in Python, install a Python interpreter (like Python.org or use an online IDE). Writing a simple program can be as easy as:

```python
print("Hello, Pilipinas!")  # Displays text to the screen
```

This line uses `print()` to output text. Lines beginning with `#` are comments for humans and are ignored by Python. In class you will set up Python on your computer or use the provided lab computers. By the end of this module, you should be comfortable running a Python script and understanding how your code maps to the problem-solving plan.
$md$, 3),
('de4d65cc-eb46-5f93-9efb-c1fdda789339','activity','Module Summary and Next Steps',$md$
Interactive programming combines logic, coding, and user interaction. In this module we introduced programming and problem solving, and got started with Python. Remember: **always plan your program logic** (flowchart or pseudocode) before writing code. Next, we will learn about the building blocks of Python programs: variables, data types, and how to get input/output from the user.

*Ready to apply these ideas? The practice drills below include programming exercises and debugging tips, with a live coding playground.*
$md$, 4);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('de4d65cc-eb46-5f93-9efb-c1fdda789339','activity','Practice & Exam Drills, Lesson 9',$md$
**Review Questions**

1. What is an algorithm and why is it useful before coding?
2. Name three common flowchart symbols and their meanings.
3. What does the `print()` function do in Python? Give an example.
4. Why are comments important in code?
5. Describe the difference between batch (non-interactive) programs and interactive programs.

**Worked Exam Problem**

*Problem:* Write a simple Python program (in pseudocode or flowchart first) that asks the user for their name and then greets them by name.

**Solution Steps**

**Step 1: Plan the Algorithm.** We want to ask for a name and then say hello. The steps: Start → Input the user's name → Output a greeting that includes the name → End.

**Step 2: Write Pseudocode.**
```
START
OUTPUT "Enter your name: "
INPUT name
OUTPUT "Hello, " + name + "! Welcome to the class."
END
```

**Step 3: Convert to Python.**
```python
name = input("Enter your name: ")      # Get name from user
print("Hello, " + name + "! Welcome to the class.")
```

**Step 4: Explain the Code.** The `input()` function displays a prompt and reads text into the variable `name`. The `print()` then concatenates strings to greet the user.

**Hands-On Exercise**

Use the starter code to create a program that asks the user for two peso amounts (for example, price of goods), adds them together, and prints the total as a peso amount. Test your program with sample inputs.

**How to Pass Tips**

- **Common Mistake:** Forgetting to convert input to the right type (e.g., `input()` returns text). For numeric addition, ensure you convert to `int` or `float` if needed.
- **What Professors Look For:** Clear variable names, correct prompt messages, and accurate results. Make sure to include error-free syntax.
- **Memorize vs. Understand:** It's more important to understand the logic (ask → process → output) than to memorize the exact code. But know that `print()` shows output and `input()` takes user input.
$md$, 5, 'python', $code$# Write a Python program that asks for two numbers
# (peso values from user input), adds them, and prints the result with a ₱ sign.
print("Interactive Sum Program")
# TODO: Prompt user for two numbers and print their sum.$code$);

-- ============================================================
-- LESSON 10: Python Refresher, Variables and Data Types
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('755b434e-4a5b-573b-92b2-c5d148d78140','content','Variables and Data Types',$md$
In Python, a **variable** is like a labeled box that stores a value (such as a number or text). You can name these variables to keep track of data. For example, `score = 85` stores the number 85 in a variable called `score`. Python is **dynamically typed**, meaning you don't declare variable types explicitly; the type (integer, string, etc.) is determined by the value you assign.

Common data types in Python include:

- **Integer (int):** Whole numbers, e.g. `n = 42`.
- **Float:** Decimal numbers, e.g. `price = 17.50`.
- **String (str):** Text enclosed in quotes, e.g. `name = "Juan"`.
- **Boolean (bool):** `True` or `False` values, e.g. `is_raining = False`.

Understanding types is important because you can only perform certain operations on certain types. For example, `5 + 3` gives `8`, but `"5" + "3"` (string addition) gives `"53"` (concatenation).
$md$, 1),
('755b434e-4a5b-573b-92b2-c5d148d78140','content','Operators and Expressions',$md$
**Operators** let us do calculations or comparisons. Key operator types:

- **Arithmetic operators:** `+`, `-`, `*`, `/`, `%` (modulo), `**` (power). Example: `3 * 4` results in `12`.
- **Relational (comparison) operators:** `==`, `!=`, `<`, `>`, `<=`, `>=`. These produce Boolean results. Example: `5 > 3` is `True`.
- **Logical operators:** `and`, `or`, `not` (combine Boolean conditions). Example: `True and False` is `False`.

An **expression** is a combination of variables, literals, and operators that evaluates to a value. For instance, `total = price * quantity` uses the arithmetic `*` operator. Remember **operator precedence** (multiplication before addition) when writing expressions, or use parentheses to make your intent clear: `(a + b) * c`.
$md$, 2),
('755b434e-4a5b-573b-92b2-c5d148d78140','activity','Input and Output',$md$
Interactive programs often exchange information with the user. We already saw `print()` for output. To get input, use `input()`:

```python
age = input("Enter your age: ")  # This reads a string from the user
```

By default `input()` returns a string. If you need a number, convert it:

```python
age = int(input("Enter your age: "))
```

Now `age` is an integer. Always validate user input in real programs (not required here, but good practice). For example, if a user types letters when an integer is expected, the program will error out.
$md$, 3),
('755b434e-4a5b-573b-92b2-c5d148d78140','activity','Module Summary',$md$
In this lesson we explored how to store and work with data in Python. You learned about variables, basic data types (int, float, string, bool), and how to use operators to compute or compare. You also saw how to get input from the user and output results. Next lesson will cover control structures (decision-making and loops) and how to organize code with functions.

*Ready for challenges? The practice drills below include writing small programs using variables and operators, with a live coding playground.*
$md$, 4);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('755b434e-4a5b-573b-92b2-c5d148d78140','activity','Practice & Exam Drills, Lesson 10',$md$
**Review Questions**

1. What is a variable and how do you assign a value in Python?
2. Give examples of at least three Python data types and a value for each.
3. What is the difference between `=` and `==` in Python?
4. How do you convert a string input to an integer? Why might you do that?
5. Explain the output of this expression: `5 + 3 * 2`.

**Worked Exam Problem**

*Problem:* Suppose a retail store needs to calculate discounts. If an item costs ₱350.00 and there is a 15% discount, write a Python snippet to compute the discounted price. Show the steps.

**Solution Steps**

- **Step 1: Identify values.** Original price = 350.00 (float), discount rate = 0.15.
- **Step 2: Compute discount amount.** `discount_amount = original_price * discount_rate` → 350.00 * 0.15 = 52.5.
- **Step 3: Compute final price.** `final_price = original_price - discount_amount` → 350.00 - 52.5 = 297.5.
- **Step 4: Show formula.** `final_price = 350.0 - (350.0 * 0.15)`.
- **Step 5: Write Python code.**
```python
original_price = 350.0
discount_rate = 0.15
discount_amount = original_price * discount_rate
final_price = original_price - discount_amount
print("Discounted price: ₱", final_price)
```
- **Step 6: Check the logic.** Ensure operators and type are correct. If using input, ensure conversion: `float(input(...))`.

**Hands-On Exercise**

Use the starter code to convert kilometers to miles. Remember: multiply the km value by 0.621371 to get miles, then print the result, e.g.:
```python
miles = km * 0.621371
print(km, "km is approximately", miles, "miles")
```
Test with km = 5, 10, etc.

**How to Pass Tips**

- **Common Mistake:** Confusing integer and float division. In Python 3, `/` is float division. Always test your formulas.
- **What Professors Look For:** Correct use of types and operators. Show the steps or formula if asked. Use clear print formatting when dealing with currency or units (₱ symbol is a bonus for context).
- **Memorize vs. Understand:** You don't need to memorize conversion factors; focus on correct arithmetic. But remember basic operators and how to apply them in Python.
$md$, 5, 'python', $code$# Unit Conversion Exercise:
# Write a Python program that asks the user for a distance in kilometers
# and converts it to miles. (1 km ≈ 0.621371 miles)
km = float(input("Distance in kilometers: "))
# TODO: Compute distance in miles and print it$code$);

-- ============================================================
-- LESSON 11: Python Refresher, Control Structures and Functions
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('1f04d8d7-f0a4-538d-a84f-8b82891ffc2d','content','Decision Making (if Statements)',$md$
Programs often need to make choices. In Python we use `if`, `elif`, and `else` statements for decisions. Example:

```python
score = int(input("Enter exam score: "))
if score >= 75:
    print("You passed!")
else:
    print("You failed.")
```

Here, if `score` is 75 or higher, the program prints "You passed!", otherwise "You failed." Indentation (4 spaces) defines the block inside the `if`. We can chain conditions:

```python
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 75:
    grade = "C"
else:
    grade = "F"
print("Your grade is", grade)
```

The conditions are checked in order; the first true branch runs. Use these to make your program adapt to different inputs (e.g., giving feedback, choosing between actions).
$md$, 1),
('1f04d8d7-f0a4-538d-a84f-8b82891ffc2d','content','Loops (for and while)',$md$
Loops let us repeat tasks. The `for` loop iterates over a sequence or range. Example:

```python
for i in range(1, 6):  # i goes from 1 to 5
    print("Step", i)
```

This prints steps 1 through 5. Use `range(start, stop)` or `range(stop)` for numbers. Or loop through items in a list:

```python
fruits = ["mango", "banana", "apple"]
for fruit in fruits:
    print("I like", fruit)
```

A `while` loop runs as long as a condition holds true. Example:

```python
count = 0
while count < 3:
    print("Count is", count)
    count += 1  # increment counter
```

This prints count = 0, 1, 2. Be careful with `while` loops to update the condition (like `count += 1`) or they may never stop (infinite loop).
$md$, 2),
('1f04d8d7-f0a4-538d-a84f-8b82891ffc2d','activity','Defining and Calling Functions',$md$
Functions help organize code into reusable pieces. You define a function with `def` and call it by name. Example:

```python
def greet(name):
    print("Hello,", name)

greet("Ana")
```

This outputs `Hello, Ana`. Functions can take parameters and return values:

```python
def add(a, b):
    return a + b

result = add(5, 7)  # result is 12
print(result)
```

Using functions improves readability and lets you test smaller parts. For example, you might write a function to compute the area of a circle, then call it with different radii.
$md$, 3),
('1f04d8d7-f0a4-538d-a84f-8b82891ffc2d','activity','Module Summary',$md$
In this lesson we covered decision-making (`if`/`elif`/`else`), looping (`for`, `while`), and functions for structuring code. You now know how to make your programs choose different paths and repeat tasks. These concepts are key to writing any non-trivial program. Next module will dive into data structures in Python such as lists and dictionaries, which let you store collections of data.

*Practice using loops and if-statements below, with a live coding playground.*
$md$, 4);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('1f04d8d7-f0a4-538d-a84f-8b82891ffc2d','activity','Practice & Exam Drills, Lesson 11',$md$
**Review Questions**

1. What is the difference between `if`, `elif`, and `else` in Python?
2. Give an example of a `for` loop and explain what it does.
3. How do you avoid an infinite `while` loop?
4. Why use functions? List two benefits.
5. What does the `return` statement do in a function?

**Worked Exam Problem**

*Problem:* A professor wants a program to compute the final grade of a student. Given a score (0–100), assign grades: A (≥90), B (80–89), C (70–79), D (60–69), F (<60). Write a function `compute_grade(score)` that returns the letter grade, then print the result for a sample score.

**Solution Steps**

**Step 1: Define the Function.**
```python
def compute_grade(score):
    if score >= 90:
        return "A"
    elif score >= 80:
        return "B"
    elif score >= 70:
        return "C"
    elif score >= 60:
        return "D"
    else:
        return "F"
```

**Step 2: Call the Function with Sample Input.**
```python
grade = compute_grade(85)
print("The grade is", grade)
```

**Step 3: Explain Logic.** The function checks conditions in order. The first true condition's `return` stops the function. For score 85, the `elif score >= 80` is true, so it returns `"B"`.

**Step 4: Edge Cases.** If score = 90, the first `if` is true (A). If score = 59, the last `else` returns "F".

**Hands-On Exercise**

Complete the starter code for the temperature check. For example, if input is 35, output should be `Mainit (Hot)`. If input is 20, output `Tama lang (Moderate)`. Try test values like 15, 25, 31.

**How to Pass Tips**

- **Common Mistake:** Writing separate `if` for each condition instead of `elif` can cause multiple prints. Ensure the logic flows correctly in one `if`–`elif`–`else` chain.
- **What Professors Look For:** Use of correct relational operators (`<=`, `>=`) and that the ranges don't overlap or leave gaps. Make sure to indent properly.
- **Memorize vs. Understand:** Understand how loops and conditions control the flow. Memorize syntax for `for` and `while`. Pay attention to off-by-one errors in loops.
$md$, 5, 'python', $code$# Temperature Check Exercise:
# Write a program that asks for the current temperature (°C).
# If the temperature is below 18, print "Malamig (Cold)".
# If it is between 18 and 30 (inclusive), print "Tama lang (Moderate)".
# Otherwise, print "Mainit (Hot)".
temp = float(input("Current temperature in °C: "))
# TODO: Use if/elif/else to categorize the temperature.$code$);

-- ============================================================
-- LESSON 12: Python Refresher, Lists, Tuples, and Dictionaries
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('8613f8f8-70ad-54a5-ac44-a60306fa82ee','content','Working with Lists',$md$
A **list** is an ordered collection of items (which can be of mixed types). Lists are defined with square brackets, e.g. `fruits = ["mango", "banana", "apple"]`. You can access elements by index (starting at 0): `fruits[0]` is `"mango"`. Lists are **mutable**, meaning you can change them:

```python
numbers = [1, 2, 3]
numbers.append(4)      # now [1, 2, 3, 4]
numbers[1] = 5         # changes second element, now [1, 5, 3, 4]
```

Common list operations include `append()`, `remove()`, `pop()`, and slicing (e.g., `numbers[1:3]` gives `[5, 3]`). Lists are very handy for storing related data, like a list of student names or inventory items.
$md$, 1),
('8613f8f8-70ad-54a5-ac44-a60306fa82ee','content','Tuples and Sets',$md$
A **tuple** is like a list but **immutable** (cannot be changed once created). Defined with parentheses: `coords = (10.0, 5.0)`. Use tuples for fixed collections. You can index and iterate through tuples, but not append or modify items.

A **set** is an unordered collection of unique items, defined with braces: `colors = {"red", "blue", "green"}`. Since sets have no order and no duplicates, use them for membership tests or removing duplicates from a list. Example: `len({"a", "b", "a"})` is `2`.
$md$, 2),
('8613f8f8-70ad-54a5-ac44-a60306fa82ee','activity','Dictionaries (key–value pairs)',$md$
A **dictionary** (or map) stores data in key–value pairs. Defined with `{}`, e.g.:

```python
student = {"name": "Rica", "age": 21, "course": "BSIT"}
```

Keys are like labels, and values are the data. Access a value by its key: `student["name"]` gives `"Rica"`. Dictionaries are very useful when you need to look up information. Common operations: `student["grade"] = 88` (to add/update), `del student["age"]`, and methods like `.keys()`, `.values()`, `.items()`.

For example, you might use a dictionary to count how many times each word appears in a text, or to map student IDs to names.
$md$, 3),
('8613f8f8-70ad-54a5-ac44-a60306fa82ee','activity','Module Summary',$md$
This lesson introduced Python's built-in data structures: lists, tuples, sets, and dictionaries. You saw how to organize collections of data efficiently. In practice, you might store a list of quiz scores, a tuple of fixed coordinates, or a dictionary of user profiles. Mastery of these structures will allow you to handle data in your programs. Next, we will learn how to read and write data to files and handle errors.

*Try solving our drills below to manipulate lists and dictionaries, with a live coding playground.*
$md$, 4);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('8613f8f8-70ad-54a5-ac44-a60306fa82ee','activity','Practice & Exam Drills, Lesson 12',$md$
**Review Questions**

1. What is the difference between a list and a tuple?
2. How do you access the third element of a list named `items`?
3. Give an example of when a set is more appropriate than a list.
4. How do you add a new key–value pair to a dictionary?
5. What happens if you try to access a dictionary key that does not exist?

**Worked Exam Problem**

*Problem:* A teacher has scores of students stored in a list: `[65, 85, 90, 75, 70]`. She wants to add a new score `80` and then calculate the average score. Show the steps in Python.

**Solution Steps**

- **Step 1: Represent the list.** `scores = [65, 85, 90, 75, 70]`.
- **Step 2: Append the new score.**
```python
scores.append(80)  # scores is now [65, 85, 90, 75, 70, 80]
```
- **Step 3: Calculate the average.** Sum the list and divide by count:
```python
total = sum(scores)          # sum() adds all elements
average = total / len(scores)
```
- **Step 4: Print the result.**
```python
print("Average score:", average)
```
- **Step 5: Verify.** `total` is 465, `len(scores)` is 6, so average ≈ 77.5.

**Hands-On Exercise**

Using the starter code, update the inventory dictionary: add 7 to `"pens"` and subtract 3 from `"notebooks"`. Then print the updated dictionary, e.g. `{'pens': 17, 'notebooks': 2, 'erasers': 2}`.

**How to Pass Tips**

- **Common Mistake:** Off-by-one errors with indexing or forgetting that lists start at index 0. Always double-check your indices.
- **What Professors Look For:** Correct use of methods like `.append()`, proper dictionary syntax (`dict[key] = value`), and correct handling of keys.
- **Memorize vs. Understand:** Understand what each data structure is best for (ordered vs unordered, mutable vs immutable). You don't need to memorize all methods, but know the main ones (list: `append`, `pop`; dict: add key, delete key).
$md$, 5, 'python', $code$# Inventory Management Exercise:
# Given a dictionary of items and quantities, update the stock.
inventory = {"pens": 10, "notebooks": 5, "erasers": 2}
# The store received 7 more pens and sold 3 notebooks.
# TODO: Update the inventory accordingly and print the result.$code$);

-- ============================================================
-- LESSON 13: Python Refresher, File I/O and Exception Handling
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('5c22ae1e-342e-40e8-bbbf-d91b825d246f','content','Reading and Writing Files',$md$
Many programs need to save or load data from files (like lists of users, logs, etc.). In Python, you use `open()` to work with files. Example of writing to a file:

```python
with open("data.txt", "w") as file:
    file.write("Hello file!\n")
```

This code opens (or creates) `data.txt` for writing (`"w"` mode) and writes a line. Using `with` ensures the file closes automatically. To read:

```python
with open("data.txt", "r") as file:
    content = file.read()
print(content)  # Displays the file's contents
```

Or read line by line with `file.readline()`. Common modes: `"r"` (read), `"w"` (write, overwrites), `"a"` (append). Always handle files carefully (closing after done) to avoid data loss. For interactive programs, you might read a CSV of prices, update values, then write the new CSV.
$md$, 1),
('5c22ae1e-342e-40e8-bbbf-d91b825d246f','content','Handling Errors with Exceptions',$md$
User input or file operations can fail. Python uses `try`/`except` to handle errors gracefully. Example:

```python
try:
    x = int(input("Enter a number: "))
    print("Reciprocal is", 1/x)
except ValueError:
    print("That is not an integer!")
except ZeroDivisionError:
    print("Cannot divide by zero!")
```

This code handles two error types: if conversion to `int` fails, or if the user enters 0. Without `try`/`except`, the program would crash. Using exceptions, you can catch errors and respond (like reprompt or show a message). In exams, demonstrating that you know to catch errors can boost your solution.
$md$, 2),
('5c22ae1e-342e-40e8-bbbf-d91b825d246f','activity','Module Summary',$md$
In this lesson, you learned how to work with files and handle errors. File I/O lets your programs save and load data (imagine saving student records or logs). Exception handling with `try`/`except` makes your programs more robust against unexpected inputs (like dividing by zero or missing files). These skills integrate programming with real-world needs. In our next lesson, we will look at integrating technologies, such as using libraries or building simple interfaces for your programs.

*Excited to test file operations? The practice section below lets you try coding with files and error handling, with a live coding playground.*
$md$, 3),
('5c22ae1e-342e-40e8-bbbf-d91b825d246f','activity','Worked Example: Robust File Sum',$md$
Here is a robust pattern that ties file I/O and exception handling together. A program must read numbers from a file `data.txt` (one number per line) and compute their sum. If the file is missing or a line is not a number, it handles the error gracefully.

```python
try:
    file = open("data.txt", "r")
except FileNotFoundError:
    print("File not found.")
else:
    total = 0
    for line in file:
        try:
            num = float(line.strip())
            total += num
        except ValueError:
            print("Invalid input")
    print("Sum is", total)
    file.close()
```

We use a `try`/`except` around `open()`. Inside, for each line we use another `try`/`except` to catch conversion errors (`ValueError`). If a line cannot be parsed to `float`, we print "Invalid input" and skip it. Finally, we print the total sum. Nesting the error handling this way means one bad line does not crash the whole program.
$md$, 4);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('5c22ae1e-342e-40e8-bbbf-d91b825d246f','activity','Practice & Exam Drills, Lesson 13',$md$
**Review Questions**

1. What does the `"a"` mode do when opening a file?
2. How do you write to a file line by line? Give an example.
3. Explain what happens if you open a file that does not exist in `"r"` mode. How can you prevent a crash?
4. What is an exception in Python? How is it different from a syntax error?
5. Write a short code snippet using `try`/`except` to catch a division by zero error.

**Worked Exam Problem**

*Problem:* A program must read numbers from a file `data.txt` (one number per line) and compute their sum. If the file is missing or a line is not a number, handle the error by printing "Invalid input". Show a robust solution.

**Solution Steps**

- **Step 1: Open the file safely.**
```python
try:
    file = open("data.txt", "r")
except FileNotFoundError:
    print("File not found.")
```
- **Step 2: Read lines with error handling.**
```python
else:
    total = 0
    for line in file:
        try:
            num = float(line.strip())
            total += num
        except ValueError:
            print("Invalid input")
    print("Sum is", total)
    file.close()
```
- **Step 3: Explanation.** We use a `try`/`except` around `open()`. Inside, for each line we use another `try`/`except` to catch conversion errors. If a line cannot be parsed to `float`, we print "Invalid input" and skip it. Finally, we print the total sum.

**Hands-On Exercise**

Complete the starter code: read each student name, convert it to uppercase with `name.upper()`, and print it. Test by creating a small `students.txt` with names. Verify that if `students.txt` is missing, the program catches `FileNotFoundError` and prints the error message instead of crashing.

**How to Pass Tips**

- **Common Mistake:** Forgetting to close files can corrupt data. Using `with` is safer (it auto-closes). Also, put file operations inside `try`/`except` to handle missing files.
- **What Professors Look For:** Proper `try`/`except` blocks and file modes. Show handling of at least one common error (e.g. catching `FileNotFoundError`).
- **Memorize vs. Understand:** Remember the `open(..., mode)` syntax and the basic `try`/`except` form. More important is understanding why exceptions matter (to keep your program from crashing).
$md$, 5, 'python', $code$# Student Records Exercise:
# Read a text file "students.txt" where each line has a student's name.
# Print each name in uppercase. Then, handle the case where the file might not exist.
try:
    with open("students.txt", "r") as file:
        for line in file:
            name = line.strip()
            # TODO: Print the uppercase name
except FileNotFoundError:
    print("Error: students.txt file not found.")$code$);

-- ============================================================
-- LESSON 14: Python Refresher, Integrating Python with Technologies
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('e97c80ca-1282-4f7e-8033-6a1255c7157b','content','Using Modules and Libraries',$md$
One way to integrate technologies is by using Python's built-in modules or external libraries. For example, import the `math` module to access math functions:

```python
import math
print(math.sqrt(16))  # prints 4.0
```

You can install many packages (like `requests`, `numpy`, etc.) for additional features. For instance, using `requests` you could fetch data from a web API:

```python
import requests
response = requests.get("https://api.example.com/data")
print(response.json())
```

*(This code requires the `requests` library and internet access; just for illustration.)* Integrating such libraries extends Python beyond basic arithmetic and text handling, allowing database access, web requests, or data science tasks.
$md$, 1),
('e97c80ca-1282-4f7e-8033-6a1255c7157b','content','Introduction to Simple GUI Programming',$md$
Interactive applications often have graphical interfaces. Python's `tkinter` is a basic GUI library. For example:

```python
import tkinter as tk

window = tk.Tk()
window.title("Sample App")
label = tk.Label(window, text="Hello GUI!")
label.pack()
window.mainloop()
```

This creates a small window with the text "Hello GUI!". Learning a full GUI framework is advanced, but knowing it exists shows how programming can create desktop apps. The `mainloop()` call is an **event loop** that waits for user interaction (clicks, etc.). In exams, you might only be asked conceptual questions about event-driven programming (e.g. "what is an event loop?"), not full GUI code.
$md$, 2),
('e97c80ca-1282-4f7e-8033-6a1255c7157b','activity','Bringing It All Together',$md$
Throughout this course, you've learned to combine programming logic with tools. For example, you might write a Python program that reads a list of employees from a file (file I/O), processes it (using `for` loops and `if` conditions), and outputs a report or graph (using a module or library like `matplotlib`). Or build a simple interactive quiz using Python console input/output. The key is understanding how each concept fits in building real applications.
$md$, 3),
('e97c80ca-1282-4f7e-8033-6a1255c7157b','activity','Module Summary',$md$
This final module discussed how Python can integrate with various technologies: using modules/libraries (for web, math, data) and even basic GUIs. You saw that with a few lines of code, you can extend your program's capabilities. Remember, interactive programming means your code can respond to user actions or external data. Next steps: practice developing small projects (like a calculator app or simple data processor) to reinforce these concepts.

*Ready to build something cool? The final practice section below includes a mini-project exercise and exam tips, with a live coding playground.*
$md$, 4);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('e97c80ca-1282-4f7e-8033-6a1255c7157b','activity','Practice & Exam Drills, Lesson 14',$md$
**Review Questions**

1. How do you import and use a module in Python? Give an example.
2. What is event-driven programming (in one sentence)?
3. Give one example of when you might use a library (module) in a programming project.
4. Explain the role of `mainloop()` in a GUI application.
5. Why is it useful to write functions (like `peso_to_usd`) when integrating tasks?

**Worked Exam Problem**

*Problem:* Sketch out a simple program (in words or pseudocode) that reads product prices in pesos from a file, applies a 12% VAT (value-added tax), and writes the new prices to an output file. Assume each line in the input file `prices.txt` is a number (one price per line).

**Solution Outline**

- **Step 1: Open files.** Use `with open("prices.txt", "r") as infile:` and `with open("prices_vat.txt", "w") as outfile:`.
- **Step 2: Process each price.** For each line in `infile`:
```python
price = float(line.strip())
price_vat = price * 1.12  # add 12% VAT
outfile.write(f"{price_vat}\n")
```
- **Step 3: Explanation.** For each price, we calculate 112% of the original. Using `with` ensures files close automatically. This integrates file I/O, loops, and arithmetic with a real-world application (tax calculation).
- **Step 4: Error Handling (optional).** If required, add `try`/`except` around file operations or conversions to catch errors.

**Hands-On Exercise**

Complete the `peso_to_usd` function: divide the pesos amount by 55 to convert to USD. For example, 550 pesos should give 10.0 USD. Then run the program, input a peso value, and check the output. For extra challenge, format the result to 2 decimal places (e.g., using `round(dollars, 2)`).

**How to Pass Tips**

- **Common Mistake:** Forgetting to return a value from a function. Check that your `peso_to_usd` function returns the correct calculation.
- **What Professors Look For:** Proper function definition and call, correct arithmetic (especially the correct exchange rate or VAT factor). Clear comments and readable code.
- **Memorize vs. Understand:** Understand how to apply a formula in code (`return pesos / 55` for this exercise) and how to structure reading/writing files. Don't just copy examples, make sure the logic fits the problem.
$md$, 5, 'python', $code$# Currency Converter Exercise:
# Use the exchange rate 1 USD = ₱55 to convert. Write a function
# that converts Philippine pesos to USD, then use input/output.
def peso_to_usd(pesos):
    # TODO: Compute dollars
    return None

pesos = float(input("Enter amount in pesos: "))
dollars = peso_to_usd(pesos)
print("Equivalent in USD:", dollars)$code$);

-- ============================================================
-- SOURCES
-- CHED CMO No. 25, s.2015, BSIT curriculum (Integrative Programming and Technologies course description)
-- ACM/IEEE IT2008 and IT2017 curriculum guidelines, Integrative Programming & Technologies knowledge area
-- Hohpe & Woolf, Enterprise Integration Patterns (file transfer, shared DB, RPC, messaging taxonomy)
-- OWASP Top 10, injection, broken access control, and secure integration guidance
-- MDN Web Docs, HTTP methods, status codes, and REST fundamentals
-- Lessons 9-14: pre-existing live IPT 1 import (Python fundamentals), preserved and renumbered as refresher track
-- ============================================================
