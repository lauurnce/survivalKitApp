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
