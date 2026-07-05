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

-- ============================================================
-- LESSON 2: Data Interchange Formats — JSON and XML
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('deb08773-907a-56c6-ae38-5138a34ddb5b','content','Why Systems Need a Common Data Language',$md$
When two systems exchange data, they must agree on a format both can read — a **data interchange format**. A Java banking system and a Python mobile backend cannot share raw objects in memory; they exchange text that each side can parse. The two formats you must master are **JSON** (JavaScript Object Notation) and **XML** (eXtensible Markup Language). JSON looks like nested key-value pairs: `{"name": "Ana", "course": "BSIT"}`. XML wraps data in tags: `<student><name>Ana</name></student>`. JSON dominates modern web APIs because it is lighter and maps directly to objects in most languages; XML is still everywhere in enterprise and government systems (electronic invoices, bank files, old web services). Being able to read, write, and convert between both is a core exam skill and a daily task in real integration work.
$md$, 1),
('deb08773-907a-56c6-ae38-5138a34ddb5b','content','JSON in Depth',$md$
JSON has only a few building blocks, which is why it is so popular. **Values** can be strings, numbers, booleans (`true`/`false`), `null`, arrays, or objects. **Objects** are unordered collections of key-value pairs in braces `{}`; **arrays** are ordered lists in brackets `[]`. A student record with grades might look like: `{"student_id": "2024-00123", "grades": [{"subject": "IPT1", "grade": 1.75}]}`. Rules to remember for exams: keys must be double-quoted strings; no trailing commas; no comments allowed. In Python, `json.loads()` turns a JSON string into dictionaries and lists, and `json.dumps()` goes the other way — this pair is called **deserialization** and **serialization**. Almost every REST API you will ever call (payment gateways, weather services, government portals) sends and receives JSON, so fluency here pays off in every later lesson.
$md$, 2),
('deb08773-907a-56c6-ae38-5138a34ddb5b','activity','XML and Choosing Between Formats',$md$
XML organizes data as a tree of nested **elements** with opening and closing tags, optional **attributes** (`<grade subject="IPT1">1.75</grade>`), and a single **root element**. It supports schemas (XSD) that formally validate structure — a big reason banks and government agencies still require it (for example, BIR electronic filings and bank payroll files often use XML). Compared to JSON, XML is more verbose but more self-describing and better at document-style data. Exam comparisons usually expect: JSON = lightweight, native to JavaScript, ideal for web/mobile APIs; XML = heavier, supports validation and namespaces, common in enterprise/legacy systems. A frequent scenario question: "A payment partner requires XML but your app uses JSON internally — what do you do?" Answer: build a **transformation layer** that converts between formats at the boundary, keeping your internal model clean.

*Ready to apply this? The practice set below walks through exam-style problems with step-by-step solutions.*
$md$, 3);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('deb08773-907a-56c6-ae38-5138a34ddb5b','activity','Practice & Exam Drills — Lesson 2',$md$
**Review Questions**

1. What is a data interchange format and why is it necessary?
2. List the six JSON value types.
3. Write a JSON object representing a subject with a title and a list of three lesson titles.
4. What are two advantages of XML over JSON, and two of JSON over XML?
5. What do serialization and deserialization mean?
6. Why can JSON not contain comments, and what problems can that cause?

**Worked Exam-Style Problem**

*Problem:* Convert this XML into equivalent JSON: `<order id="55"><item qty="2">Ballpen</item><item qty="1">Notebook</item></order>`

*Solution:* Step 1: The root `order` becomes an object; its `id` attribute becomes a key: `"id": "55"`. Step 2: Repeated `<item>` elements become an array. Step 3: Each item has an attribute and text content, so represent both: `{"qty": "2", "name": "Ballpen"}`. Final answer: `{"order": {"id": "55", "items": [{"qty": "2", "name": "Ballpen"}, {"qty": "1", "name": "Notebook"}]}}`. Step 4: Note in your answer that attribute-to-key mapping is a design choice — exams award points for stating the convention you used.

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
A **web service** is a program that other programs call over a network using standard web protocols — usually HTTP, the same protocol browsers use. Instead of returning web pages for humans, it returns data (typically JSON) for other software. This matters for integration because HTTP travels everywhere: through firewalls, across the internet, between any languages. Two big styles exist. **SOAP** is the older, XML-heavy standard with strict contracts (WSDL files) — still used by banks and government systems. **REST** (REpresentational State Transfer) is the dominant modern style: simple HTTP requests to URLs that represent resources. When your weather app shows a PAGASA-style forecast, or a delivery app tracks a parcel, a REST API call is happening behind the scenes. In this course, "API" (Application Programming Interface) usually means a REST web service.
$md$, 1),
('157a631d-cc05-5f89-8ebf-da9a84866c20','content','REST Fundamentals: Resources, Verbs, and Status Codes',$md$
REST organizes an API around **resources** identified by URLs, such as `/students` or `/students/2024-00123`. You act on resources with **HTTP methods**: **GET** reads data, **POST** creates something new, **PUT/PATCH** update it, and **DELETE** removes it. The server replies with a **status code**: `200 OK` (success), `201 Created`, `400 Bad Request` (your input was wrong), `401 Unauthorized`, `404 Not Found`, and `500 Internal Server Error` (the server crashed). Request and response bodies are usually JSON, with **headers** carrying metadata like `Content-Type: application/json`. A well-designed REST API is predictable: `GET /subjects` lists subjects, `GET /subjects/ipt1` fetches one, `POST /subjects` adds one. Exams love asking you to match methods to actions and to interpret status codes — memorize the ones above cold.
$md$, 2),
('157a631d-cc05-5f89-8ebf-da9a84866c20','activity','Consuming an API in Practice',$md$
Calling an API from code follows the same recipe in every language: build the request (URL, method, headers, optional body), send it, check the status code, then parse the JSON response. In Python this is typically the `requests` library: `response = requests.get(url)`, then `data = response.json()`. Real-world concerns you must mention in exams: **API keys** identify and authorize your app (sent in a header like `Authorization: Bearer <token>`); **rate limits** cap how many calls you can make per minute; **timeouts** stop your app from hanging when the service is slow; and you must **never trust the response blindly** — check the status code before parsing. A typical Philippine scenario: an e-commerce site calls a courier's REST API to compute shipping fees to different provinces, handling the case where the courier's API is down by showing a fallback flat rate.

*Ready to apply this? The practice set below walks through exam-style problems with step-by-step solutions.*
$md$, 3);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('157a631d-cc05-5f89-8ebf-da9a84866c20','activity','Practice & Exam Drills — Lesson 3',$md$
**Review Questions**

1. What is the difference between a web page and a web service?
2. Compare SOAP and REST in two sentences.
3. Match the HTTP methods GET, POST, PUT, DELETE to their actions.
4. What do status codes 200, 201, 400, 401, 404, and 500 mean?
5. What is an API key for, and where is it usually placed in a request?
6. Why should a client always check the status code before parsing the response body?

**Worked Exam-Style Problem**

*Problem:* Design REST endpoints for a barangay clearance system: residents request a clearance, staff view pending requests, staff approve one request.

*Solution:* Step 1: Identify the resource — clearance *requests*. Step 2: Map actions to methods: submit = `POST /requests` (body: resident details; returns `201` with the new request id). Step 3: List pending = `GET /requests?status=pending` (query parameter filters). Step 4: Approve = `PATCH /requests/{id}` with body `{"status": "approved"}` — PATCH because we update one field, not replace the whole record. Step 5: State error handling — `404` if the id does not exist, `400` if the status value is invalid, `401` if a non-staff user tries to approve. Full marks come from correct method choice plus status codes, not just the URLs.

**How to Pass Tips**

- Memorize the method-action table (GET-read, POST-create, PUT/PATCH-update, DELETE-remove) — it appears on nearly every quiz.
- Status codes group by hundreds: 2xx success, 4xx client error, 5xx server error. If you forget an exact code, stating the correct group still earns partial credit.
- In design questions, use plural nouns for resources (`/students`, not `/getStudent`) — professors check for this.
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
Every integrated application has a **server side**: code that runs on a machine you control, sits between users and your data, and talks to other systems. While the browser or mobile app (the **client side**) handles display and input, the server side enforces rules, hides secrets, and coordinates integrations. Why can the client not call a payment gateway directly? Because the gateway's secret API key must never ship inside an app where anyone can extract it. The server holds the key, receives the client's request, calls the gateway, and returns only safe results. Common server-side technologies you will meet: **PHP** (still powering a huge share of Philippine school and business websites), **Node.js** (JavaScript on the server), **Python** (Flask, Django, FastAPI), and **Java** (Spring). The concepts — routing, request handling, responses — are identical across all of them.
$md$, 1),
('4f2673dd-9e46-525e-9710-3512a55c0a26','content','Anatomy of a Request Handler',$md$
Server-side code is organized around **routes**: rules that map a method and URL pattern to a function. A handler for `POST /enroll` might: (1) read and validate the request body; (2) check business rules (is the subject open? does the student have unpaid balances?); (3) call other systems (registrar database, payment API); (4) return a JSON response with the right status code. Two universal rules: **validate every input** (never assume the client sent clean data — check types, ranges, and required fields) and **fail with clear errors** (return `400` with a message like "student_id is required", not a crash). **Environment variables** keep secrets (database passwords, API keys) out of source code — a favorite exam point and a real-world security requirement under the Data Privacy Act, since leaked credentials expose personal data.
$md$, 2),
('4f2673dd-9e46-525e-9710-3512a55c0a26','activity','Integrating Third-Party Services Server-Side',$md$
Real backends are integration hubs. A typical Filipino e-commerce backend calls: a **payment gateway** (PayMongo, Maya) to charge cards or e-wallets, an **SMS/email service** to notify customers, a **courier API** for shipping, and its own **database**. Key patterns to name in exams: the **facade** — your server exposes one clean endpoint (`POST /checkout`) that internally orchestrates several external calls; **webhooks** — instead of you asking the gateway "is it paid yet?" repeatedly, the gateway calls *your* URL when payment completes (push, not poll); and **idempotency** — design handlers so receiving the same webhook twice does not double-process an order (check if the payment id was already recorded). Also mention **graceful degradation**: if the SMS service is down, the order should still succeed and the notification can be retried later.

*Ready to apply this? The practice set below walks through exam-style problems with step-by-step solutions.*
$md$, 3);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('4f2673dd-9e46-525e-9710-3512a55c0a26','activity','Practice & Exam Drills — Lesson 4',$md$
**Review Questions**

1. Give three responsibilities of the server side that the client side must never handle.
2. Why must API secret keys stay on the server?
3. What are the four typical steps inside a request handler?
4. What is a webhook, and how does it differ from polling?
5. Define idempotency and explain why webhook handlers need it.
6. What are environment variables used for?

**Worked Exam-Style Problem**

*Problem:* An online store's `POST /checkout` endpoint sometimes charges customers twice when they double-click the "Pay" button. Diagnose the cause and propose a fix.

*Solution:* Step 1: Diagnose — two identical requests arrive; the handler is not idempotent, so each one creates a separate charge. Step 2: Client-side mitigation — disable the button after the first click (helps, but never sufficient; requests can still be retried by the network). Step 3: Server-side fix — require an **idempotency key**: the client generates a unique order token, and the server records it; if a request arrives with a token it has already processed, return the original result instead of charging again. Step 4: Note that major gateways (Stripe, PayMongo) support exactly this header, showing the pattern is industry standard. Step 5: Conclude — correctness must be enforced on the server because only the server is trusted.

**How to Pass Tips**

- "Never trust the client" answers almost every security-flavored question in this lesson.
- Know the checkout flow by heart: validate -> business rules -> external calls -> response. Professors ask you to order these steps.
- If a scenario involves "the payment succeeded but the system did not update," the expected answer involves webhooks and retries.
- Mention environment variables whenever credentials appear in a question — hardcoded secrets are an automatic red flag.

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
Almost every integration eventually touches a **database** — the system of record where data actually lives. Application code connects to a database server (MySQL, PostgreSQL, SQL Server) through a **driver** or connector library, opens a **connection**, sends SQL, and reads results. Key vocabulary: a **connection string** holds the host, port, database name, and credentials (kept in environment variables, never in code); a **connection pool** reuses open connections because opening one is slow — vital when hundreds of users hit a web app at once. The database is a shared integration point: the enrollment web app, the cashier's system, and the dean's reporting dashboard may all read the same student tables. That is powerful but risky — which is why access is usually mediated through an API or a **data access layer** rather than letting every program write tables directly.
$md$, 1),
('3dafe7cf-ca2f-5a13-8ee2-e8a91ee3d001','content','The Data Access Layer and ORMs',$md$
A **data access layer (DAL)** is the part of your code that isolates SQL from business logic. Instead of scattering queries everywhere, you write functions like `get_student(id)` or `save_enrollment(record)` — if the schema changes, only the DAL changes. Many teams go further and use an **ORM (Object-Relational Mapper)** such as Eloquent (PHP/Laravel), SQLAlchemy (Python), or Prisma (Node.js): it maps tables to classes so `Student.find(id)` generates the SQL for you. Trade-offs to cite in exams: ORMs speed up development and reduce SQL mistakes, but can hide inefficient queries; raw SQL gives full control but more room for error. Also know **transactions**: grouping several statements so they all succeed or all roll back — enrolling a student and charging their account must be atomic, or money and records drift apart.
$md$, 2),
('3dafe7cf-ca2f-5a13-8ee2-e8a91ee3d001','activity','SQL Injection and Safe Queries',$md$
The most examined topic in this lesson is **SQL injection** — the classic attack where user input is pasted into a SQL string. If code builds `"SELECT * FROM users WHERE name = '" + input + "'"` and a user types `' OR '1'='1`, the query returns every user; worse payloads can delete tables. The defense is **parameterized queries** (prepared statements): the SQL template and the values travel separately, so input is always treated as data, never as code — `cursor.execute("SELECT * FROM users WHERE name = %s", (input,))`. Every language and ORM supports this; using it is non-negotiable professionally and legally (a breach of personal data violates the Data Privacy Act of 2012). Exam answers should always name the attack, show a vulnerable example, and give the parameterized fix — that three-part structure earns full marks.

*Ready to apply this? The practice set below walks through exam-style problems with step-by-step solutions.*
$md$, 3);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('3dafe7cf-ca2f-5a13-8ee2-e8a91ee3d001','activity','Practice & Exam Drills — Lesson 5',$md$
**Review Questions**

1. What belongs in a connection string, and where should it be stored?
2. Why do web applications use connection pools?
3. What is a data access layer and what problem does it solve?
4. Give one advantage and one disadvantage of using an ORM.
5. What is a transaction? Give a scenario where skipping it corrupts data.
6. Show a vulnerable SQL string and rewrite it as a parameterized query.

**Worked Exam-Style Problem**

*Problem:* A login form builds this query: `SELECT * FROM accounts WHERE user='<u>' AND pass='<p>'`. Explain how an attacker logs in without a password, and fix the code.

*Solution:* Step 1: The attack — enter username `admin' --` (the `--` starts a SQL comment). The query becomes `SELECT * FROM accounts WHERE user='admin' --' AND pass=''`, so the password check is commented out and the attacker is logged in as admin. Step 2: Name it — SQL injection via string concatenation. Step 3: The fix — a parameterized query: `SELECT * FROM accounts WHERE user=? AND pass=?` with the two inputs bound as parameters; the quote and comment characters are now just literal text. Step 4: Strengthen the answer — passwords should also be hashed (bcrypt), so the query compares hashes, never plaintext. Mentioning both the injection fix and hashing marks a complete answer.

**How to Pass Tips**

- The phrase "parameterized query / prepared statement" must appear in any injection answer — synonyms like "sanitize input" alone earn partial credit only.
- Remember ACID for transactions: Atomicity, Consistency, Isolation, Durability — a favorite enumeration question.
- If asked "ORM or raw SQL?", answer "it depends" with one concrete factor each way — balanced answers score highest.
- Connection pooling questions usually want two words: "reuse" and "performance."

**Coding Drill:** Complete `build_safe_query` so it returns the parameterized template and the values as a tuple — never concatenating user input into the SQL string.
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
HTTP is **stateless**: every request stands alone, and the server forgets you the moment it responds. Yet applications must remember who is logged in across many requests. The classic solution is the **session**: after login, the server creates a session record and gives the browser a **cookie** holding a random session ID; the browser sends the cookie with every request, and the server looks up who you are. The modern alternative for APIs is the **token**, most commonly a **JWT (JSON Web Token)**: the server signs a small JSON payload (user id, expiry) and hands it to the client, which sends it back in the `Authorization: Bearer` header. Sessions keep state on the server; JWTs keep it on the client with a tamper-proof signature. Know both flows step by step — "trace what happens when a user logs in" is a staple exam question.
$md$, 1),
('b7d098c6-2c95-54a4-8fd7-4e6c081cb6a2','content','Authentication vs Authorization',$md$
These two words are the most confused pair in the course. **Authentication** answers "who are you?" — verifying identity with a password, one-time PIN, or fingerprint. **Authorization** answers "what may you do?" — checking permissions after identity is known. A student and a registrar both authenticate into the school portal, but only the registrar is authorized to edit grades. Standard building blocks: **password hashing** (store bcrypt hashes, never plaintext — if the database leaks, passwords stay secret), **multi-factor authentication** (password + SMS or authenticator code, now common in Philippine banking apps), and **role-based access control (RBAC)** — assign roles like `student`, `cashier`, `admin`, and check the role on every protected endpoint. The check must happen **on the server for every request**; hiding a button in the app is not authorization.
$md$, 2),
('b7d098c6-2c95-54a4-8fd7-4e6c081cb6a2','activity','Securing System-to-System Integration',$md$
Machines authenticate to each other too. When your backend calls a payment gateway, it presents an **API key** or an **OAuth 2.0** access token; when the gateway calls your webhook, you verify its **signature** — a hash of the payload computed with a shared secret, proving the message is genuine and unaltered. Core rules for exams and real life: (1) **always use HTTPS/TLS** so credentials and personal data are encrypted in transit; (2) **never commit secrets to source control** — use environment variables or secret managers; (3) **verify webhook signatures** before trusting the payload, otherwise anyone who discovers your URL can fake a "payment succeeded" event; (4) **scope and rotate keys** — give each integration the minimum permission and replace keys periodically. These map directly to Data Privacy Act compliance: personal data must be protected in transit and at rest.

*Ready to apply this? The practice set below walks through exam-style problems with step-by-step solutions.*
$md$, 3);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('b7d098c6-2c95-54a4-8fd7-4e6c081cb6a2','activity','Practice & Exam Drills — Lesson 6',$md$
**Review Questions**

1. Why is HTTP called stateless, and what problem does that create?
2. Trace the cookie-session login flow in four steps.
3. How does a JWT differ from a server-side session? Give one advantage of each.
4. Define authentication and authorization with a school-portal example.
5. Why are passwords hashed instead of encrypted or stored as plaintext?
6. What is a webhook signature and what attack does verifying it prevent?

**Worked Exam-Style Problem**

*Problem:* A food-delivery startup exposes `GET /orders/{id}` and discovers users can view other people's orders by changing the id in the URL. Name the flaw and fix it.

*Solution:* Step 1: Name the flaw — broken authorization, specifically an **IDOR** (Insecure Direct Object Reference): the endpoint authenticates the user but never checks ownership. Step 2: The fix — after loading order `{id}`, compare `order.customer_id` with the authenticated user's id from the session/JWT; return `403 Forbidden` (or `404` to avoid leaking existence) when they differ. Step 3: Generalize — every protected resource needs an ownership or role check on the server; client-side hiding is not security. Step 4: Bonus point — use unguessable UUIDs for ids as defense in depth, while stressing the real fix is the server-side check.

**How to Pass Tips**

- One-line memory hook: authentication = login, authorization = permissions. Write it at the top of your scratch paper.
- Any question containing "changed the URL/id and saw someone else's data" is IDOR — answer with a server-side ownership check.
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
**Middleware** is software that sits between other software, handling the plumbing so applications do not talk to each other directly. The term appears at two levels, and exams test both. At the **application level**, middleware is a chain of functions that every request passes through before reaching your handler — logging, authentication checks, input parsing, CORS headers. Express (Node.js), Laravel, and Django all use this pattern: a login-required middleware runs once and protects every route behind it. At the **systems level**, middleware means infrastructure that connects whole applications: **message brokers** (RabbitMQ, Kafka), **API gateways** (one entry point that routes, throttles, and secures calls to many backend services), and **enterprise service buses** in older architectures. Both meanings share one idea: put cross-cutting work in the middle so individual programs stay simple.
$md$, 1),
('0801bc09-f04e-5794-8d82-59d3f6972ee2','content','Message Queues and Asynchronous Integration',$md$
A **message queue** decouples systems in time: a **producer** puts a message on the queue and moves on; a **consumer** takes messages off and processes them at its own pace. If the consumer is down, messages simply wait — nothing is lost. This is **asynchronous** integration, in contrast to a REST call where the caller blocks until the answer returns (**synchronous**). Vocabulary to master: **queue** (point-to-point: one consumer gets each message) versus **publish/subscribe** (every subscriber gets a copy); **at-least-once delivery** (messages may repeat, so consumers must be idempotent — the Lesson 4 concept returns); and **dead-letter queue** (where repeatedly failing messages are parked for inspection). Classic scenario: an online store queues "send receipt email" jobs so checkout stays fast even if the email service is slow — the customer never waits for SMTP.
$md$, 2),
('0801bc09-f04e-5794-8d82-59d3f6972ee2','activity','Choosing Sync vs Async in Real Designs',$md$
Exam design questions usually reduce to one decision: call it now (synchronous REST) or queue it (asynchronous messaging)? Use **synchronous** when the caller needs the answer to continue — checking a balance before approving a withdrawal, validating a discount code at checkout. Use **asynchronous** when the work can happen later or must survive outages — sending notifications, generating reports, syncing sales from provincial branches with unstable internet to a head-office server in Manila. Hybrid designs are common and score well: accept the order synchronously (fast `201 Created`), then queue the slow parts (email, inventory sync, analytics). Also name the costs honestly: queues add infrastructure to run, make debugging harder (where is my message?), and only guarantee *eventual* consistency — the dashboard may lag a few seconds behind reality. Trade-off awareness is what separates a memorized answer from an engineer's answer.

*Ready to apply this? The practice set below walks through exam-style problems with step-by-step solutions.*
$md$, 3);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('0801bc09-f04e-5794-8d82-59d3f6972ee2','activity','Practice & Exam Drills — Lesson 7',$md$
**Review Questions**

1. Define middleware at the application level and at the systems level.
2. What does an API gateway do? Name three responsibilities.
3. Differentiate a queue from publish/subscribe.
4. What is at-least-once delivery, and what must consumers do because of it?
5. What is a dead-letter queue for?
6. Give one scenario each where synchronous and asynchronous integration is the right choice, and why.

**Worked Exam-Style Problem**

*Problem:* A chain of pharmacies in different provinces must report sales to head office. Internet at branches is intermittent. Design the integration and justify each choice.

*Solution:* Step 1: Requirements — no lost sales data, tolerate offline periods, head office needs consolidated (not instant) figures. Step 2: Choose asynchronous messaging — each branch POS writes sales to a **local queue/store**; a sync agent forwards messages to the head-office broker whenever connectivity returns. Step 3: Handle duplicates — the broker delivers at-least-once, so the head-office consumer checks each sale's unique id before inserting (idempotency). Step 4: Handle poison messages — malformed records go to a dead-letter queue for manual review instead of blocking the line. Step 5: Justify rejecting REST-only — synchronous calls would fail during outages and lose or delay data; the queue turns unreliable connectivity from a failure into a normal case.

**How to Pass Tips**

- "Unreliable network" or "system may be down" in a scenario = queue-based answer, almost without exception.
- Draw the boxes: producer -> queue -> consumer. A labeled diagram earns method marks even if wording is thin.
- Pair "at-least-once" with "idempotent consumer" in the same sentence — professors look for that linkage.
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
