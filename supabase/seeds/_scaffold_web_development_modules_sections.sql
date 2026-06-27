-- ============================================================
-- Web Development — Modules & Sections (SCAFFOLD)
-- Subject ID: 69e11f2d-2a28-41d3-85b2-632981d17b4b
-- 3rd Year, Semester 1 — major
-- Suggested module count: 6-10
--
-- Reserved UUID namespace below is collision-free and deterministic.
-- Fill module titles/slugs + section headings/bodies from the GPT-5.5
-- deep-research output, then run this file once. Re-running is safe
-- (the DELETE clears prior rows for this subject first).
-- ============================================================

DELETE FROM modules WHERE subject_id = '69e11f2d-2a28-41d3-85b2-632981d17b4b';

-- ---- Reserved module UUIDs (use in order; delete unused rows) ----
--   M01: 2f237d87-4d3f-509a-962b-470987099daf
--   M02: f53e3b6c-d5d2-5797-8346-f6ce10f3b9a1
--   M03: 7268fad6-cfca-5a22-ab66-4ca8b277c587
--   M04: 34915f48-136f-577a-a00f-a1749b629849
--   M05: 0912525f-5b59-5496-84ad-64faec6545c8
--   M06: cf6350e6-340f-5cb5-ae98-8111fa5c1586
--   M07: 1e807c61-eed0-562d-8df1-53eb6c9094ba
--   M08: 22034d95-8aae-51bf-a5f7-09dcc3f9ca8d
--   M09: 60e552c6-6dd8-509e-b1ac-7a081fe3bb98
--   M10: 9d4b4764-02da-5d09-81e6-fa9b9cde332e
--   M11: 8e17f4c6-d9d0-518a-a7af-71fc6a750ad0
--   M12: 1b809cbc-ae80-5e00-968e-95d3346b6502

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('2f237d87-4d3f-509a-962b-470987099daf','69e11f2d-2a28-41d3-85b2-632981d17b4b','Lesson 1: Web Foundations and the Development Workflow','lesson-1-web-foundations-development-workflow',1),
  ('f53e3b6c-d5d2-5797-8346-f6ce10f3b9a1','69e11f2d-2a28-41d3-85b2-632981d17b4b','Lesson 2: Semantic HTML and Information Structure','lesson-2-semantic-html-information-structure',2),
  ('7268fad6-cfca-5a22-ab66-4ca8b277c587','69e11f2d-2a28-41d3-85b2-632981d17b4b','Lesson 3: CSS for Layout, Design, and Responsiveness','lesson-3-css-layout-design-responsiveness',3),
  ('34915f48-136f-577a-a00f-a1749b629849','69e11f2d-2a28-41d3-85b2-632981d17b4b','Lesson 4: JavaScript Fundamentals and DOM Manipulation','lesson-4-javascript-fundamentals-dom-manipulation',4),
  ('0912525f-5b59-5496-84ad-64faec6545c8','69e11f2d-2a28-41d3-85b2-632981d17b4b','Lesson 5: Forms, Validation, HTTP, and Asynchronous Web','lesson-5-forms-validation-http-asynchronous-web',5),
  ('cf6350e6-340f-5cb5-ae98-8111fa5c1586','69e11f2d-2a28-41d3-85b2-632981d17b4b','Lesson 6: Server-Side Development, CRUD, and Database Integration','lesson-6-server-side-crud-database-integration',6),
  ('1e807c61-eed0-562d-8df1-53eb6c9094ba','69e11f2d-2a28-41d3-85b2-632981d17b4b','Lesson 7: Security, Accessibility, Performance, and Testing','lesson-7-security-accessibility-performance-testing',7),
  ('22034d95-8aae-51bf-a5f7-09dcc3f9ca8d','69e11f2d-2a28-41d3-85b2-632981d17b4b','Lesson 8: Deployment, Collaboration, and Web Project Integration','lesson-8-deployment-collaboration-project-integration',8);

-- ---- Reserved section UUIDs, per module ----
-- Module 1 (2f237d87-4d3f-509a-962b-470987099daf):
--   S1: c627ac87-93a8-5e65-ad81-89462bbfb0b9
--   S2: 2381f872-4cec-5392-80db-ef1782bdd39f
--   S3: 5ce95fdf-8fe9-5144-9986-85e1f372b45b
--   S4: fb9b633c-4c5f-5aac-9dd9-9e6343098c1b
--   S5: 4016b8b9-1ee6-57de-aeaf-262853bc7bb5
--   S6: 2c267cf3-d304-5100-aac0-36e6995d0325
--   S7: 33d8ac55-9b88-55dd-829c-d04b0dfd1102
--   S8: e38721cf-899e-5d02-ba09-223a5128ee7d
--   S9: 198e237f-e0a1-58e8-95f2-8a98c17bb982
--   S10: e1f4e1cf-fb2c-5734-815e-61df2bac1d02  <- reserve last for kind='activity'
-- Module 2 (f53e3b6c-d5d2-5797-8346-f6ce10f3b9a1):
--   S1: af56f1bb-4951-5312-aa3e-ed7a5b2b0291
--   S2: 41c423b7-3e3b-5fdb-8aca-d7521ec8d4e9
--   S3: 58847214-87dc-5142-8389-4ff38a24ee3b
--   S4: 4f64cb0f-9f8a-5ec2-9ed3-4807b7bee274
--   S5: 6101073f-762a-5240-95ae-d5413535f5bc
--   S6: f192991c-bcc7-5cb0-8f84-33927370cf73
--   S7: db0270fe-9cc0-529c-a729-f9fb1aade0da
--   S8: cfc01587-e9cd-519a-9fcf-0f6f49ab56df
--   S9: ea96f6b4-9895-5a38-9d18-961b1a8f0c70
--   S10: 0a3896a6-e7e4-57ba-b537-1a75329c2afe  <- reserve last for kind='activity'
-- Module 3 (7268fad6-cfca-5a22-ab66-4ca8b277c587):
--   S1: fe113f7b-d5af-533b-a82c-7ccdf5a67c34
--   S2: c5383ef4-bdac-593a-9333-1461a3080e26
--   S3: 901188db-09e4-5ccb-b083-65b6ba4eb78f
--   S4: bcde3b83-6c61-5358-9b3f-6f9462bc1427
--   S5: 6f4b79f1-e004-514f-ad5d-b8afd1b9325d
--   S6: badb1af0-b3e1-5d01-8324-61ee554f6342
--   S7: ff53354f-c84c-5e68-b8d6-1ca64aaaf2c2
--   S8: ce76beaa-e46a-58d5-967d-be6bb3b3da7d
--   S9: ff218426-3304-572f-abc3-eaf0897cb9bd
--   S10: f3c0e69f-58f8-59b5-ba2f-3962709e1e76  <- reserve last for kind='activity'
-- Module 4 (34915f48-136f-577a-a00f-a1749b629849):
--   S1: a702768b-5479-50b8-a3c0-52153409eb95
--   S2: 7b7a6de9-31a8-566f-a52f-48fd95762d23
--   S3: ce4949a6-bd51-5740-9487-faa6d67e2f2a
--   S4: 735760e8-a926-5c34-8860-9f6960082b6f
--   S5: 2b0604a3-372b-5df4-913d-35b84dc3ed2d
--   S6: 10d899cc-f0b5-53ec-ac64-4c34699d70cc
--   S7: 090447d7-a457-5ede-8afa-636be3b30522
--   S8: fd60947d-2de1-5dd8-8e9d-734c94c21f02
--   S9: c8885909-85f3-5fba-bd35-c11e27cbb8db
--   S10: 08ed0505-d139-5e67-bf56-a39bf39e13a0  <- reserve last for kind='activity'
-- Module 5 (0912525f-5b59-5496-84ad-64faec6545c8):
--   S1: 0e253a8b-aba0-5643-bfc6-f143dd85e6eb
--   S2: f174832e-baf9-5251-b5eb-3faf16ad3912
--   S3: 1649a6f0-2793-543d-83e5-370d54be4336
--   S4: ea5b139a-b153-56dd-883c-2ee5bdd49982
--   S5: 06b5efed-de23-527b-8a4c-ed1eae5770ba
--   S6: 72319ea9-9f34-5823-b502-853933d5329a
--   S7: 4df794c4-11e4-58a3-895a-90a8faaad6fa
--   S8: 9885e94e-7c73-548b-91ba-0578bff6853b
--   S9: eb3477db-891a-512b-9e0c-64bf4219a4f5
--   S10: 79952389-cf58-56c3-887d-9ef8e3f95403  <- reserve last for kind='activity'
-- Module 6 (cf6350e6-340f-5cb5-ae98-8111fa5c1586):
--   S1: 40c02320-5c76-52e0-9f16-a537388d1d25
--   S2: a0fe04e1-4f79-53b7-9ba0-90def275b0ae
--   S3: eaefc2b2-8a1f-5395-835e-7cd9fb46a601
--   S4: 1b3d8dba-4442-5516-8384-70ae8d864eda
--   S5: 177bdd06-bfd2-554e-b9b9-febf4e9bf9d3
--   S6: 1d99a18a-ad14-587f-8a3e-2645ec1f3a82
--   S7: 9a99c814-068d-53ae-af31-f62f84023247
--   S8: 20676c61-3e19-5d32-9966-4fe4a9c5ea78
--   S9: fd28e33a-3cb1-53fb-9db9-237619b6723d
--   S10: 20d4f876-6502-53a5-aab4-81da153ab9c3  <- reserve last for kind='activity'
-- Module 7 (1e807c61-eed0-562d-8df1-53eb6c9094ba):
--   S1: 57da38e8-c79a-5263-bcc5-eea51a08c30b
--   S2: 350e0c86-8a44-56c5-ac03-c16b9103fd84
--   S3: ff3ab896-fb29-5186-b027-10e73e4e5d1f
--   S4: 60dbd70f-19a2-57f6-b323-3f22345d2883
--   S5: 51681d7a-1341-50a8-921e-590c40b75633
--   S6: fe1cf2b1-f917-5b34-acb5-93b56d518145
--   S7: 59c6f878-9657-595c-a1eb-7936ac2181e0
--   S8: d53c5f83-b49c-5a4e-b79d-4dd6549072ca
--   S9: 514a2f3a-d2fe-5655-b3b8-41d6937a5d70
--   S10: 0e801481-cafb-5fe5-a837-bb30f44d68b7  <- reserve last for kind='activity'
-- Module 8 (22034d95-8aae-51bf-a5f7-09dcc3f9ca8d):
--   S1: 101f038a-5d00-56bd-b284-b1acc637b697
--   S2: 2e6467b6-3441-53e8-9ee1-ae85314fc472
--   S3: 6bfd5bcb-4ad7-56ac-b1bd-2cbfe75b77c7
--   S4: 4a7d6bed-5544-572f-ba28-833beef78e74
--   S5: 1f0c2482-f977-57f3-aa95-7e81a63c68df
--   S6: 0e0d11e8-3d81-5c59-b933-5611f75e847f
--   S7: 87aaa7bc-ff52-51bb-a920-8b3741acdc49
--   S8: 839e3a94-0b5a-55a0-84fa-4cd72a516253
--   S9: b1aeba27-8e6b-5598-9154-bf87f0945592
--   S10: 20b6ecea-7616-5e53-b829-fd231d68e512  <- reserve last for kind='activity'
-- Module 9 (60e552c6-6dd8-509e-b1ac-7a081fe3bb98):
--   S1: 2b47513d-5de1-5b0a-a340-d6cc42e8283c
--   S2: 00ffd7ea-e05d-5736-8100-ace592c93f63
--   S3: 8e59baae-2eab-5a55-baec-911df8f04f38
--   S4: 5b5bd069-5287-5281-bf14-45b8bb2777e7
--   S5: 72781cd4-2de7-5135-b6ce-4ed60b0000a9
--   S6: 97805b6d-b1bd-5f09-9d27-100f152d3ecb
--   S7: cf2c3382-34a7-5995-bd8c-73a8324ace09
--   S8: 16644f68-0c4b-5b10-919b-4f9de8d385b9
--   S9: 2bcbcc27-04b3-59ad-9efa-d8dc5d4553b6
--   S10: aeedb6d6-677e-524c-a69b-f85793fe4c5c  <- reserve last for kind='activity'
-- Module 10 (9d4b4764-02da-5d09-81e6-fa9b9cde332e):
--   S1: 8e7dcd9b-eef0-57f8-8de7-76b2d7909510
--   S2: 750cd5b9-e7b3-52ba-86fd-960b2d78e80f
--   S3: c70908de-330f-583b-b5fc-1ee1b8a6e2bb
--   S4: 796fb4ed-a638-5a6b-a886-f57952f81f15
--   S5: e16ea31e-4384-5d21-8eca-68ecef008c2c
--   S6: 5a8e9cca-ca61-5b43-9e1e-63b6dc417ca7
--   S7: 35d7f5a4-a5c3-56e9-93d0-d35caa0298db
--   S8: 456fd8e8-37d0-5ab7-bbb4-464f7ccc6453
--   S9: 3ebee7e5-ec1b-50d5-a3ed-ccaf145bd3ae
--   S10: 7d7f47ee-15c0-5822-b1d4-5ba89e4084b1  <- reserve last for kind='activity'
-- Module 11 (8e17f4c6-d9d0-518a-a7af-71fc6a750ad0):
--   S1: e96227d4-0095-5390-bb45-7dc6c09f59f7
--   S2: d7258290-7f0b-5642-b81d-64f9e8b3b203
--   S3: 85d4fba3-2978-5c0c-8401-36359cf403f1
--   S4: 00b8e42a-ac2f-51e9-b65a-313770aed6a1
--   S5: 42302b89-0962-5ba4-a18c-9299c5e4b0c6
--   S6: 773199d6-a395-56bd-ae27-0671d7323618
--   S7: dd2d74a3-5cbc-5a11-a0a0-a1d75674fa88
--   S8: 6b3c8695-7372-5d37-9aa8-2ea4e564528b
--   S9: bc6b2594-143c-5f49-b0a3-c7deea215bef
--   S10: 3a22fb3f-aa6b-5599-b21e-18507c7d65db  <- reserve last for kind='activity'
-- Module 12 (1b809cbc-ae80-5e00-968e-95d3346b6502):
--   S1: c8f45851-b707-5c2e-8d46-2727876867e1
--   S2: ef4cacea-1613-5c7c-a6f6-d868a4fe1318
--   S3: f6d3f0a6-3deb-588a-8731-cab8b48b6331
--   S4: 42861a07-c96e-5bfb-ad56-0f0c6965a245
--   S5: 75e16ec7-799b-5b52-8ff4-18ccf810d4af
--   S6: 42a216b0-f993-541b-aefd-9429884ec030
--   S7: 2839a34d-c12a-5865-9771-c70a83d7ac64
--   S8: ffdc6783-59ed-5c53-a709-0e39fdebce17
--   S9: 19fd3eb0-daed-5456-aed6-7aad8b3ef17f
--   S10: 6734f974-a459-53d1-8838-91235c47fa39  <- reserve last for kind='activity'

-- ============================================================
-- IMPORT TEMPLATE — one INSERT per module. Replace placeholders.
-- content sections are FREE; the final activity section is PAID.
-- ide_language (python|sql|java|c), starter_code, topology_data are
-- all OPTIONAL columns — include only when the section needs them.
-- ============================================================
--
-- INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
-- ('2f237d87-4d3f-509a-962b-470987099daf','content','<Heading>',$md$
-- <full markdown teaching body — free tier>
-- $md$, 1),
-- ('2f237d87-4d3f-509a-962b-470987099daf','activity','Practice & Exam Drills — Lesson 1',$md$
-- <review questions, worked exam problems w/ solutions, how-to-pass tips — paid tier>
-- $md$, 2);
--
-- With an interactive playground, use the 5-column form instead:
-- INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
-- ('2f237d87-4d3f-509a-962b-470987099daf','activity','Coding Drill',$md$<task>$md$, 3, 'python', $code$print("hi")$code$);

-- >>>>>>>>>>>>>>>>>>>>  PASTE FILLED-IN INSERTS BELOW  <<<<<<<<<<<<<<<<<<<<

-- ============================================================
-- LESSON 1: Web Foundations and the Development Workflow
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('2f237d87-4d3f-509a-962b-470987099daf','content','The Web as a System',$md$
Web development is not only about making pages look good. It is the process of designing, building, testing, and maintaining websites and web applications that run through a browser. In a BSIT context, that means combining content, interface, logic, and data into one usable system.

A useful way to think about the web is through three major parts:

- **Client side** — what the user sees and interacts with in the browser
- **Server side** — the program or service that receives requests and sends responses
- **Data layer** — the database or persistent storage where application data lives

When a student opens an online enrollment portal, the browser displays the page, the server checks the request, and the database stores subjects, schedules, and student records. A real web system is therefore a collaboration of technologies rather than a single file.

Web development is usually grouped into:

- **Front-end development** — structure, style, and interaction
- **Back-end development** — business rules, data handling, authentication, and APIs
- **Full-stack development** — working across both sides

As a third-year BSIT student, you should start seeing the web not as "HTML only," but as an information system delivered through the browser. That mindset will guide the rest of the subject.
$md$, 1),
('2f237d87-4d3f-509a-962b-470987099daf','content','How the Browser Talks to the Server',$md$
Every time a user opens a website, a sequence happens behind the scenes:

1. The user enters a URL or clicks a link.
2. The browser identifies the target server.
3. A request is sent using HTTP or HTTPS.
4. The server processes the request.
5. A response is returned, often containing HTML, CSS, JavaScript, images, or JSON.
6. The browser renders the result for the user.

A URL is commonly broken into parts:

- **Protocol** — `https`
- **Domain** — `example.com`
- **Path** — `/students/profile`
- **Query string** — `?id=2025-00123`

For example:

```
https://portal.school.edu.ph/enrollment/view?student=2025-00123
```

This tells the browser where to go and sometimes what data to request.

The request-response model is central to web development. A browser does not "guess" what to show. It asks. The server replies. Because of this, web developers must understand:

- what data is requested,
- what format is returned,
- and how errors are handled.

If the server cannot find a page, the browser may receive a **404** response. If login fails because of wrong credentials, the application must decide how to respond clearly and securely.
$md$, 2),
('2f237d87-4d3f-509a-962b-470987099daf','content','Core Technologies in a Basic Web Stack',$md$
A beginner-friendly web stack usually starts with three browser technologies:

- **HTML** for structure
- **CSS** for presentation
- **JavaScript** for behavior

Think of them this way:

| Technology | Main Purpose | Example |
|---|---|---|
| HTML | Defines content and meaning | headings, forms, tables |
| CSS | Controls appearance and layout | colors, spacing, responsive layout |
| JavaScript | Adds logic and interactivity | buttons, validation, dynamic updates |

On the server side, many schools also introduce a framework or language for processing requests and working with data. The exact tool may vary, but the concepts stay similar:

- routes
- forms and validation
- CRUD operations
- sessions or authentication
- database connection

A database is commonly used when the site must remember something beyond one visit. Examples include user accounts, product listings, grades, complaints, reservations, or inventory records.

Even at the foundation level, it is important to distinguish between a static site and a dynamic web application:

- A **static site** serves mostly fixed content
- A **dynamic application** generates responses based on user input, stored data, or business rules
$md$, 3),
('2f237d87-4d3f-509a-962b-470987099daf','content','The Development Workflow and Professional Mindset',$md$
Good web development follows a process. Students often rush into coding, but real projects usually begin earlier and end later than code itself.

A practical workflow looks like this:

1. Understand the problem
2. Plan the pages, users, and features
3. Design the interface and content structure
4. Build the front end
5. Connect server-side logic and data
6. Test functionality and usability
7. Deploy and maintain

This subject also expects professional habits. Start practicing these early:

- organize files clearly,
- name variables meaningfully,
- comment only when needed,
- test after each small change,
- and document assumptions.

In the Philippine setting, examples may include a barangay document request portal, a school event registration site, or a small business ordering page. The technical concepts remain the same even when the domain changes.

What matters most in this lesson is the shift from "making pages" to building systems that serve users through the web.
$md$, 4),
('2f237d87-4d3f-509a-962b-470987099daf','activity','Practice & Exam Drills — Lesson 1',$md$
### Review Questions

1. Differentiate the client side from the server side in one clear sentence each.
2. What are the main purposes of HTML, CSS, and JavaScript?
3. In a URL, what is the difference between a path and a query string?
4. Why is a database needed in many web applications?
5. Give one example of a static website and one example of a dynamic web application.
6. Why is testing considered part of web development and not an optional extra?

### Worked Exam-Style Problems

**Problem 1: Breaking Down a URL**

A professor gives the following URL:

```
https://admission.univ.edu.ph/apply/form?program=BSIT&year=2026
```

Identify the protocol, domain, path, and query string.

*Step-by-step solution*

- Protocol: `https`
- Domain: `admission.univ.edu.ph`
- Path: `/apply/form`
- Query string: `program=BSIT&year=2026`

Why this matters:

- The protocol tells the browser how to communicate.
- The domain identifies the server.
- The path points to a resource or route.
- The query string passes extra values to the server.

**Problem 2: Classifying Web Stack Responsibilities**

A library system has these tasks:

- Show a list of books on screen
- Color the "Available" badge green
- Validate whether the borrower ID field is empty before submit
- Save a loan transaction to the database

Which technologies are most directly responsible?

*Step-by-step solution*

- Show a list of books on screen → **HTML**
- Color the "Available" badge green → **CSS**
- Validate whether the borrower ID field is empty before submit → **JavaScript**
- Save a loan transaction to the database → **Server-side code + database**

Exam tip: many instructors ask this as a matching-type or short-identification item.

### Hands-on Exercise

Study the following mini file structure and explain the role of each file:

```
project/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
└── images/
    └── logo.png
```

Write a short paragraph answering:

- which file controls structure,
- which controls appearance,
- which controls behavior,
- and why folders are useful in real projects.

### How to Pass This Topic

- Memorize the difference between client-side and server-side. That is frequently tested.
- Practice reading and breaking down URLs. Professors like exact identification.
- Do not say "HTML is programming." In most classrooms, HTML is treated as a markup language, not a general-purpose programming language.
- When asked for a "web application," give an example with user input or stored data, not just a brochure site.
- In essays, use the words *request*, *response*, *browser*, *server*, and *database* correctly. Precision earns points.
$md$, 5);

-- ============================================================
-- LESSON 2: Semantic HTML and Information Structure
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('f53e3b6c-d5d2-5797-8346-f6ce10f3b9a1','content','Why Semantic HTML Matters',$md$
HTML is the structural language of the web. It tells the browser what each part of a page represents. Good HTML is not written merely to "make things appear." It is written to express meaning.

Compare these two approaches:

- Using generic containers everywhere: `div`, `div`, `div`
- Using meaningful tags: `header`, `nav`, `main`, `section`, `article`, `footer`

The second approach is called **semantic HTML**. It improves:

- readability for developers,
- accessibility for assistive technologies,
- search engine understanding,
- and maintainability of the codebase.

For example, a student dashboard page may have:

- a `header` for branding,
- a `nav` for links,
- a `main` area for content,
- and a `footer` for contact information.

Semantic tags do not replace good layout design, but they give the page a stronger structure. This is especially useful when projects grow beyond one screen or one developer.

A simple HTML skeleton looks like this:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Student Portal</title>
</head>
<body>
  <header>
    <h1>Student Portal</h1>
  </header>
  <main>
    <section>
      <h2>Announcements</h2>
      <p>Enrollment starts next week.</p>
    </section>
  </main>
</body>
</html>
```
$md$, 1),
('f53e3b6c-d5d2-5797-8346-f6ce10f3b9a1','content','Building Common Page Elements Correctly',$md$
Most web pages rely on a set of recurring HTML structures. You should know how to build these correctly:

- headings and paragraphs,
- lists,
- links,
- images,
- tables,
- forms.

A few rules matter a lot in exams and practical tasks:

- Headings should follow a logical order like `h1`, `h2`, `h3`
- Links should be meaningful, not just "click here"
- Images should include `alt` text when they carry content
- Tables should be used for tabular data, not for page layout

Example of a simple navigation list:

```html
<nav>
  <ul>
    <li><a href="index.html">Home</a></li>
    <li><a href="modules.html">Modules</a></li>
    <li><a href="contact.html">Contact</a></li>
  </ul>
</nav>
```

Example of an image with useful alternative text:

```html
<img src="mayon.jpg" alt="Mayon Volcano viewed from Legazpi City">
```

If the image fails to load, the alt text still communicates its meaning. More importantly, screen readers rely on this text.
$md$, 2),
('f53e3b6c-d5d2-5797-8346-f6ce10f3b9a1','content','Forms as a Core Web Feature',$md$
Forms are one of the most important HTML features because they collect user input. In real systems, forms power:

- login pages,
- registration pages,
- search bars,
- checkout pages,
- appointment systems,
- and feedback portals.

Common form controls include:

- `input`
- `textarea`
- `select`
- `button`
- `label`

A `label` must be clearly associated with an `input`. This improves usability and accessibility.

```html
<form>
  <label for="email">School Email</label>
  <input type="email" id="email" name="email">

  <label for="course">Course</label>
  <select id="course" name="course">
    <option>BSIT</option>
    <option>BSCS</option>
  </select>

  <button type="submit">Submit</button>
</form>
```

Notice that HTML alone can already provide basic constraints through input types like `email`, `number`, and `date`. Later lessons will connect this to validation and server processing.
$md$, 3),
('f53e3b6c-d5d2-5797-8346-f6ce10f3b9a1','content','Information Architecture and Content Quality',$md$
A web page should not only be valid. It should also be easy to understand and navigate. This is where **information architecture** comes in. Information architecture is the way content is grouped, labeled, and organized so users can find what they need quickly.

Good content structure usually answers:

- What is the page for?
- Who is the user?
- What should the user do next?
- What information must be prominent?

For example, in a scholarship application site, users should immediately see:

- eligibility,
- requirements,
- deadlines,
- status checking,
- and contact information.

Poor structure leads to confusion even when the code is technically correct. A page can be "valid HTML" and still be bad for users.

As a web developer, you should think beyond tags. HTML structure should support clarity, flow, and purpose.
$md$, 4),
('f53e3b6c-d5d2-5797-8346-f6ce10f3b9a1','activity','Practice & Exam Drills — Lesson 2',$md$
### Review Questions

1. What is semantic HTML?
2. Why is a label important in a form?
3. When should you use a table in HTML?
4. What is the purpose of alt text in an image?
5. What is the difference between `header`, `nav`, and `main`?
6. Why should heading levels be ordered logically?

### Worked Exam-Style Problems

**Problem 1: Fix the Structure**

Given this code:

```html
<div>
  <div>My Shop</div>
  <div>
    <div>Products</div>
    <div>Shoes and bags available.</div>
  </div>
</div>
```

Rewrite it using semantic HTML.

*Step-by-step solution*

A better answer is:

```html
<header>
  <h1>My Shop</h1>
</header>

<main>
  <section>
    <h2>Products</h2>
    <p>Shoes and bags available.</p>
  </section>
</main>
```

Why this is better:

- `header` identifies the page header
- `h1` and `h2` show hierarchy
- `section` groups related content
- `p` is correct for paragraph text

**Problem 2: Spot the Accessibility Issue**

A form contains:

```html
<input type="text" placeholder="Enter name">
```

What is missing?

*Step-by-step solution*

The form control has no visible or programmatically associated label.

Corrected version:

```html
<label for="name">Full Name</label>
<input type="text" id="name" name="name" placeholder="Enter name">
```

Reason:

- Placeholder text is not a full substitute for a label
- Users need a persistent field description
- Screen readers work better with labels

### Hands-on Exercise

Create the HTML structure for a **Barangay Service Request Page** with these parts:

- page title
- navigation bar
- service request form
- announcements section
- footer with contact details

Use semantic tags only. Do not style yet.

Suggested starting point:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Barangay Service Request</title>
</head>
<body>

</body>
</html>
```

### How to Pass This Topic

- Expect professors to ask you to rewrite non-semantic HTML into semantic HTML.
- Memorize the purpose of these tags: `header`, `nav`, `main`, `section`, `article`, `footer`.
- Never use tables for page layout in modern exam answers unless explicitly instructed.
- Always pair `label` with `input` in your form answers.
- If asked to "improve HTML," mention semantics, accessibility, and maintainability.
$md$, 5);

-- ============================================================
-- LESSON 3: CSS for Layout, Design, and Responsiveness
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('7268fad6-cfca-5a22-ab66-4ca8b277c587','content','CSS Syntax, Cascade, and Specificity',$md$
CSS controls how HTML appears. It can change color, spacing, borders, positioning, and layout. But CSS is not simply "decorating" a page. It is a rule system.

A CSS rule has:

- a selector
- one or more declarations

```css
h1 {
  color: navy;
  margin-bottom: 16px;
}
```

The browser follows the **cascade**, meaning multiple rules may target the same element. When that happens, CSS decides which rule wins based on:

- specificity,
- source order,
- and importance.

Specificity usually follows this logic:

- element selectors are weaker,
- class selectors are stronger,
- ID selectors are stronger than classes.

Example:

```css
p { color: black; }
.notice { color: blue; }
#mainNotice { color: red; }
```

If the same paragraph matches all three, the ID selector usually wins.

Understanding the cascade is important because many CSS errors are not syntax errors. They are selection errors. The style exists, but the wrong rule is taking priority.
$md$, 1),
('7268fad6-cfca-5a22-ab66-4ca8b277c587','content','The Box Model and Modern Layout',$md$
Every visible HTML element behaves like a box. The CSS box model includes:

- content
- padding
- border
- margin

This explains why elements take up more space than the raw width or height you assign.

Example:

```css
.card {
  width: 300px;
  padding: 20px;
  border: 1px solid #333;
  margin: 10px;
}
```

This element uses more horizontal space than 300px because padding and border add to it.

For layout, older approaches relied heavily on floats or tables. Modern CSS favors:

- **Flexbox** for one-dimensional layout
- **Grid** for two-dimensional layout

Use Flexbox when arranging items in a row or column, such as navigation links or cards. Use Grid when building larger page sections, such as dashboards or gallery structures.

```css
.container {
  display: flex;
  gap: 16px;
}
```

This creates a far cleaner layout than manually forcing positions.
$md$, 2),
('7268fad6-cfca-5a22-ab66-4ca8b277c587','content','Responsive Design and Mobile-First Thinking',$md$
A web page should work on phones, tablets, laptops, and desktops. This is the idea behind **responsive web design**.

Three core ideas support responsiveness:

- flexible layouts,
- scalable media,
- media queries.

A media query allows styles to change based on screen conditions:

```css
@media (max-width: 768px) {
  .menu {
    flex-direction: column;
  }
}
```

This means a horizontal menu can stack vertically on smaller screens.

A practical rule is **mobile first**. Start with styles for smaller screens, then add enhancements for wider screens. This often leads to cleaner design because it forces you to prioritize essential content.

Responsive design is not just about shrinking things. It is about deciding what users need first. On a mobile device, a student checking grades may need the most important information immediately, without excessive banners or large visual blocks.
$md$, 3),
('7268fad6-cfca-5a22-ab66-4ca8b277c587','content','Visual Consistency and Basic UI Decisions',$md$
CSS also supports usability through consistency. A good interface repeats patterns so users do not have to relearn the page every time.

Watch for these design concerns:

- readable typography,
- consistent spacing,
- contrast between text and background,
- visible hover and focus states,
- clear alignment,
- restrained color usage.

For example, a school portal should not change button styles on every page. A consistent button system improves trust and usability.

A simple design token approach can help:

```css
:root {
  --primary: #003366;
  --accent: #ffcc00;
  --space-md: 16px;
}
```

This makes styles easier to maintain later.

At the BSIT level, you are not expected to become a full UI designer in one lesson. But you should learn that layout and visual decisions affect how usable a system becomes.
$md$, 4),
('7268fad6-cfca-5a22-ab66-4ca8b277c587','activity','Practice & Exam Drills — Lesson 3',$md$
### Review Questions

1. What are the two main parts of a CSS rule?
2. What is the cascade in CSS?
3. Which is generally stronger: a class selector or an ID selector?
4. What are the four parts of the box model?
5. When should you use Flexbox?
6. What is the purpose of a media query?

### Worked Exam-Style Problems

**Problem 1: Computing Width with the Box Model**

A `.card` has:

```css
.card {
  width: 200px;
  padding: 10px;
  border: 2px solid black;
  margin: 8px;
}
```

What is the total horizontal space occupied, including margin?

*Step-by-step solution*

Start with content width:

- Content = 200px

Add left and right padding:

- 10px + 10px = 20px

Add left and right border:

- 2px + 2px = 4px

Add left and right margin:

- 8px + 8px = 16px

Total: $$200 + 20 + 4 + 16 = 240\text{px}$$

Final answer: **240px**

**Problem 2: Specificity Check**

Given this CSS:

```css
p { color: black; }
.alert { color: orange; }
#warning { color: red; }
```

And this HTML:

```html
<p id="warning" class="alert">Low balance</p>
```

What color appears?

*Step-by-step solution*

The paragraph matches all three selectors:

- `p`
- `.alert`
- `#warning`

The ID selector `#warning` is strongest here, so the color is **red**.

### Hands-on Exercise

Use this HTML and make it responsive:

```html
<div class="cards">
  <div class="card">Module 1</div>
  <div class="card">Module 2</div>
  <div class="card">Module 3</div>
</div>
```

Your tasks:

- show the cards in one row on wide screens,
- stack them on small screens,
- add spacing between cards.

Suggested CSS starter:

```css
.cards {
}

.card {
  border: 1px solid #333;
  padding: 16px;
}
```

### How to Pass This Topic

- Practice specificity questions. They appear often in quizzes.
- Be careful when computing the box model. Many students forget padding or margin.
- Know at least one working Flexbox pattern.
- When asked about responsive design, mention media queries and mobile-first.
- Avoid writing random styles without a selector plan. In practical exams, neat CSS earns credit faster.
$md$, 5);

-- ============================================================
-- LESSON 4: JavaScript Fundamentals and DOM Manipulation
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('34915f48-136f-577a-a00f-a1749b629849','content','JavaScript as the Behavior Layer',$md$
JavaScript gives a page behavior. It can react to user actions, update content, check input, and communicate with servers.

Core JavaScript basics include:

- variables,
- data types,
- operators,
- conditions,
- loops,
- functions,
- arrays and objects.

Example:

```javascript
let studentName = "Lara";
let units = 21;

if (units > 18) {
  console.log("Overload request may be needed.");
}
```

In web development, JavaScript is often not used alone. It is connected to the browser environment. That means your script can act on page elements and respond to events like clicks, typing, or form submission.

A useful principle: write logic in small functions. This makes code easier to test and debug.
$md$, 1),
('34915f48-136f-577a-a00f-a1749b629849','content','The DOM and Selecting Elements',$md$
The browser represents the current page as the **Document Object Model** or DOM. JavaScript can read and change this structure.

Common DOM actions include:

- selecting elements,
- changing text or attributes,
- adding or removing classes,
- creating new elements,
- responding to events.

Example:

```javascript
const title = document.querySelector("#pageTitle");
title.textContent = "Welcome, BSIT Student";
```

This selects an element whose ID is `pageTitle` and changes its display text.

Common selectors:

- `document.querySelector()` — first match
- `document.querySelectorAll()` — all matches

This bridge between JS and HTML is why interactive pages can update without being fully reloaded.
$md$, 2),
('34915f48-136f-577a-a00f-a1749b629849','content','Events, Functions, and User Interaction',$md$
An **event** is something that happens in the browser:

- a click,
- a key press,
- a mouse move,
- a form submit,
- a page load.

JavaScript can attach behavior to these events.

```javascript
const btn = document.querySelector("#saveBtn");

btn.addEventListener("click", function () {
  alert("Record saved.");
});
```

This code runs when the button is clicked.

Event-driven programming is central to web apps. Instead of executing once from top to bottom and ending, code waits for something to happen and then responds.

This is why interface logic should be clear and predictable. For example:

- clicking a menu should open a menu,
- submitting a blank form should show a useful message,
- selecting a filter should update the visible data.
$md$, 3),
('34915f48-136f-577a-a00f-a1749b629849','content','Arrays, Objects, and Rendering Data',$md$
Real web applications usually handle collections of data. In JavaScript, these often appear as arrays of objects.

```javascript
const courses = [
  { code: "IT321", title: "Web Development" },
  { code: "IT322", title: "Information Assurance" }
];
```

Each object stores related properties. This makes data easier to manage than separate variables.

A common web task is **rendering data** to the page. That means taking values from JavaScript and presenting them as HTML content.

Another important habit is debugging. If the page does not behave as expected, check:

- spelling of selectors,
- whether the script loads at the correct time,
- whether the event is attached correctly,
- and whether the target element actually exists.

In many lab exams, the logic is simple. The mistake is usually in the connection between HTML and JavaScript.
$md$, 4),
('34915f48-136f-577a-a00f-a1749b629849','activity','Practice & Exam Drills — Lesson 4',$md$
### Review Questions

1. What is the role of JavaScript in a web page?
2. What does DOM stand for?
3. What is the difference between `querySelector()` and `querySelectorAll()`?
4. What is an event in JavaScript?
5. Why are functions useful in interface logic?
6. Give one example of an array of objects.

### Worked Exam-Style Problems

**Problem 1: Trace the Output**

HTML:

```html
<p id="status">Pending</p>
<button id="btn">Update</button>
```

JavaScript:

```javascript
const statusText = document.querySelector("#status");
const btn = document.querySelector("#btn");

btn.addEventListener("click", function () {
  statusText.textContent = "Approved";
});
```

What happens when the button is clicked?

*Step-by-step solution*

- `statusText` selects the paragraph
- `btn` selects the button
- the click event runs a function
- that function changes the paragraph text

Final result: the page changes from **Pending** to **Approved**

**Problem 2: Identify the Bug**

Code:

```javascript
const saveBtn = document.querySelector("#save");
saveBtn.addEventListener("click", function () {
  console.log("Saved");
});
```

But the HTML button is:

```html
<button id="submit">Save</button>
```

Why does nothing happen?

*Step-by-step solution*

The JavaScript tries to select `#save`, but the actual element has ID `submit`.

Correct fix:

```javascript
const saveBtn = document.querySelector("#submit");
```

This is a classic DOM mismatch problem.

### Hands-on Exercise

Create a simple student greeting behavior.

HTML:

```html
<input type="text" id="nameInput" placeholder="Enter your name">
<button id="showBtn">Show Greeting</button>
<p id="output"></p>
```

Tasks:

- when the button is clicked, display `Hello, <name>!`
- if the input is blank, display `Please enter your name.`

Starter JavaScript:

```javascript
const nameInput = document.querySelector("#nameInput");
const showBtn = document.querySelector("#showBtn");
const output = document.querySelector("#output");

// write your event logic here
```

### How to Pass This Topic

- Expect practical exams that ask you to read a short script and predict the result.
- Most errors come from wrong selectors, wrong IDs, or attaching events before elements are ready.
- Memorize these terms: DOM, event, function, array, object.
- When debugging, check one layer at a time: HTML first, then selector, then event, then logic.
- In coding tasks, keep the solution simple. Professors usually prefer correct basics over flashy complexity.
$md$, 5);

-- ============================================================
-- LESSON 5: Forms, Validation, HTTP, and Asynchronous Web
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('0912525f-5b59-5496-84ad-64faec6545c8','content','Designing Forms That Users Can Actually Complete',$md$
A form is successful only when users can complete it correctly. That means web developers must think about both technical validity and human usability.

Good forms often follow these rules:

- ask only for necessary information,
- group related fields,
- use clear labels,
- provide helpful placeholders only when appropriate,
- show readable error messages,
- and keep the number of steps manageable.

Examples of strong field choices:

- `type="email"` for email addresses
- `type="date"` for dates
- `type="number"` for quantities
- `required` for critical inputs

Simple HTML validation helps, but it is only the first layer. Users can still bypass or manipulate browser-side checks. That is why validation must also happen on the server.

In school systems, common validation problems include:

- blank required fields,
- invalid format,
- duplicate usernames,
- impossible dates,
- and values outside allowed ranges.
$md$, 1),
('0912525f-5b59-5496-84ad-64faec6545c8','content','HTTP Methods and Status Codes',$md$
HTTP is the protocol that drives browser-server communication. In practice, you should recognize the common request methods:

- **GET** — request data
- **POST** — submit new data
- **PUT/PATCH** — update existing data
- **DELETE** — remove data

A simple way to remember them is through CRUD:

| CRUD Action | Common HTTP Method |
|---|---|
| Create | POST |
| Read | GET |
| Update | PUT or PATCH |
| Delete | DELETE |

HTTP responses also include status codes. The most common ones in web development are:

- **200** — success
- **201** — created successfully
- **400** — bad request
- **401** — unauthorized
- **403** — forbidden
- **404** — not found
- **500** — server error

When answering exam items, do not only memorize the number. Understand the scenario that causes it.
$md$, 2),
('0912525f-5b59-5496-84ad-64faec6545c8','content','JSON, Fetching Data, and Asynchronous Behavior',$md$
Modern web pages often fetch data without reloading the whole page. This is where **asynchronous web behavior** comes in.

A common data format is JSON:

```json
{
  "student": "Ana Cruz",
  "course": "BSIT",
  "year": 3
}
```

JSON is lightweight and easy for JavaScript to read.

In the browser, data can be requested using the Fetch API:

```javascript
fetch("/api/students")
  .then(response => response.json())
  .then(data => console.log(data));
```

This means:

- request data from the server,
- convert the response to JSON,
- then use the returned data.

The page does not stop and wait in a blocking way. It continues running, then reacts when the response arrives. That is why async programming is important in interactive systems like dashboards, search suggestions, and live status panels.
$md$, 3),
('0912525f-5b59-5496-84ad-64faec6545c8','content','Client-Side State and Practical User Experience',$md$
A web page may need to remember temporary information, such as:

- selected filters,
- dark/light mode preference,
- items in a cart,
- or the current step in a multi-part form.

This idea is often called **state**. In browser-based development, simple state may be kept through:

- variables while the page is open,
- local storage for longer persistence,
- session-based techniques depending on architecture.

A practical example: if a student is filling out a long scholarship form, the application should not force them to re-enter everything after a small interface action. Good state handling improves the user experience.

Still, sensitive data should not be stored carelessly on the client. The browser is not a safe place for secrets.
$md$, 4),
('0912525f-5b59-5496-84ad-64faec6545c8','activity','Practice & Exam Drills — Lesson 5',$md$
### Review Questions

1. Why is browser-side validation alone not enough?
2. Which HTTP method is commonly used to create new data?
3. What does a 404 status code mean?
4. What is JSON used for in web applications?
5. Why is asynchronous behavior useful in modern websites?
6. Give one example of client-side state.

### Worked Exam-Style Problems

**Problem 1: Match the Method**

A school portal needs these actions:

- Load all announcements
- Submit a new support ticket
- Update a student profile
- Remove a saved draft

Match each one to an HTTP method.

*Step-by-step solution*

- Load all announcements → **GET**
- Submit a new support ticket → **POST**
- Update a student profile → **PUT or PATCH**
- Remove a saved draft → **DELETE**

Professors often use this as a matching-type question.

**Problem 2: Pick the Correct Status Code**

A user requests a page that does not exist.

What is the most appropriate status code?

*Step-by-step solution*

- The browser reached the server
- The request format may be fine
- But the resource is missing

Correct answer: **404 Not Found**

Why not 500?

- 500 means the server encountered an internal problem

Why not 401?

- 401 is about authentication, not a missing resource

### Hands-on Exercise

Analyze and improve this form:

```html
<form>
  <input type="text" placeholder="Email">
  <input type="text" placeholder="Age">
  <button>Send</button>
</form>
```

Your goals:

- use better input types,
- add labels,
- mark required fields,
- and explain what must still be validated on the server.

Then study this JavaScript:

```javascript
fetch("/api/apply")
  .then(res => res.json())
  .then(data => {
    console.log(data.message);
  });
```

Explain:

- what request is being made,
- what format is expected back,
- and what happens after the response arrives.

### How to Pass This Topic

- Memorize the GET/POST/PUT/PATCH/DELETE pattern with CRUD.
- Professors frequently ask for status code interpretation.
- When discussing validation, always say client-side **and** server-side.
- If a question mentions data exchange with JavaScript, mention JSON.
- Do not confuse asynchronous code with "faster code." The key idea is non-blocking interaction.
$md$, 5);

-- ============================================================
-- LESSON 6: Server-Side Development, CRUD, and Database Integration
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('cf6350e6-340f-5cb5-ae98-8111fa5c1586','content','What the Server Side Actually Does',$md$
The server side handles the parts of a web application that should not depend only on the browser. Its common responsibilities include:

- routing requests,
- validating submitted data,
- applying business rules,
- managing authentication and sessions,
- reading and writing data,
- and sending responses.

For example, when a user submits a room reservation request, the server may need to:

- check if the room exists,
- verify that the date is valid,
- confirm that the room is still available,
- save the reservation,
- and return a success or error response.

This work should not be trusted to front-end code alone because browser code can be changed by the user.
$md$, 1),
('cf6350e6-340f-5cb5-ae98-8111fa5c1586','content','CRUD as the Backbone of Many Web Systems',$md$
A large number of web applications are CRUD systems. CRUD stands for:

- **C**reate
- **R**ead
- **U**pdate
- **D**elete

Examples in Philippine contexts:

- Create a barangay complaint record
- Read a list of permit requests
- Update a product price in an online catalog
- Delete an expired announcement

A useful way to model features is by asking:

- what entities exist,
- what actions users can perform,
- and what permissions apply.

Entities might include:

- users,
- posts,
- products,
- reservations,
- grades,
- departments,
- or documents.

Once you identify the entities, CRUD becomes much easier to design.
$md$, 2),
('cf6350e6-340f-5cb5-ae98-8111fa5c1586','content','Relational Data and Database Thinking',$md$
Most BSIT students are also expected to connect applications to a database. Even when the interface looks simple, the data behind it often requires careful structure.

A common relational model uses tables such as:

| Table | Sample Fields |
|---|---|
| users | user_id, name, email, password_hash |
| courses | course_id, code, title |
| enrollments | enrollment_id, user_id, course_id, status |

This shows relationships:

- one user can have many enrollments,
- one course can belong to many enrollments,
- the enrollment table links the two.

Good database-backed web development requires:

- valid keys,
- sensible constraints,
- consistent naming,
- and protection against invalid or duplicate records.
$md$, 3),
('cf6350e6-340f-5cb5-ae98-8111fa5c1586','content','Authentication, Sessions, and Integration Flow',$md$
Many web applications need to know who the user is. This leads to **authentication** and **session management**.

A basic flow looks like this:

1. User submits login form
2. Server checks credentials
3. Server creates a session or token-based authenticated state
4. Protected resources become available
5. Logout destroys or invalidates that state

This does not have to be complicated at the introductory level. What matters is understanding that the server decides access based on verified identity.

Front end, back end, and database should work as one flow:

- the browser gathers input,
- the server checks and processes it,
- the database stores or retrieves data,
- and the browser displays the result.
$md$, 4);

-- Lesson 6 activity uses the interactive Python playground, so it needs the
-- 5-column-plus form. A single VALUES list cannot mix column counts, so the
-- activity row is its own INSERT.
INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('cf6350e6-340f-5cb5-ae98-8111fa5c1586','activity','Practice & Exam Drills — Lesson 6',$md$
### Review Questions

1. What tasks are usually handled by the server side?
2. Expand CRUD and define each word briefly.
3. Why is data validation needed on the server?
4. What is the purpose of a linking table like `enrollments`?
5. What happens in a basic authentication flow?
6. Why should passwords not be stored as plain text?

### Worked Exam-Style Problems

**Problem 1: Convert Requirements into CRUD**

A small online canteen system has these requirements:

- staff can add menu items,
- students can view all menu items,
- staff can change prices,
- staff can remove unavailable items.

Identify the CRUD operations involved.

*Step-by-step solution*

- add menu items → **Create**
- view all menu items → **Read**
- change prices → **Update**
- remove unavailable items → **Delete**

This problem is simple, but it checks whether you can convert natural language into system operations.

**Problem 2: Build a Basic Table Design**

A professor asks you to model a course registration feature where:

- one student can register for many subjects,
- one subject can have many students.

What tables should exist?

*Step-by-step solution*

This is a many-to-many relationship, so you need:

- students
- subjects
- registrations

Possible fields:

- `students(student_id, name, program)`
- `subjects(subject_id, code, title)`
- `registrations(registration_id, student_id, subject_id, status)`

Why the third table?

- Because many-to-many relationships are usually resolved through a linking table

### Hands-on Exercise

Use the Python starter code to simulate a tiny backend inventory service.

Tasks:

- Implement `list_products()`
- Implement `add_product(name, price, stock)`
- Implement `update_stock(product_id, qty_sold)`

Required behavior:

- Assign a new ID automatically
- Reject negative stock deductions
- Prevent stock from going below zero
- Return a useful message like `"Sale recorded"` or `"Insufficient stock"`

After coding, explain how this resembles the logic behind a real server-side route.

### How to Pass This Topic

- If a requirement sounds like "add, show, edit, remove," think CRUD immediately.
- In database questions, identify the entities first, then the relationship.
- For login-flow essays, mention verification, session/token, and protected access.
- Many professors award points for showing a clean flow from form → server → database → response.
- Never say server-side validation is optional. That is a common conceptual mistake.
$md$, 5, 'python', $code$products = [
    {"id": 1, "name": "USB Keyboard", "price": 550, "stock": 4},
    {"id": 2, "name": "Mouse", "price": 300, "stock": 10}
]

def list_products():
    # return all products
    pass

def add_product(name, price, stock):
    # create a new product with an auto-incremented id
    pass

def update_stock(product_id, qty_sold):
    # deduct qty_sold from stock if enough stock exists
    # return a success or error message
    pass
$code$);

-- ============================================================
-- LESSON 7: Security, Accessibility, Performance, and Testing
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('1e807c61-eed0-562d-8df1-53eb6c9094ba','content','Security Basics Every Web Developer Should Respect',$md$
Even a simple web app can expose users to risk if security is ignored. At the introductory level, you should recognize some common concerns:

- weak authentication,
- unsanitized user input,
- unauthorized access,
- insecure file uploads,
- exposed sensitive data.

Two foundational habits matter immediately:

- validate and sanitize input
- enforce authorization rules

For example, if a user edits the URL to view another student's private record, the server should still block access when permission is missing. Security cannot depend on the honesty of the user interface.

You are not expected to master all web vulnerabilities in one lesson, but you should understand that security is part of design, not a last-minute patch.
$md$, 1),
('1e807c61-eed0-562d-8df1-53eb6c9094ba','content','Accessibility as a Professional Requirement',$md$
Accessibility means building websites that can be used by more people, including users with disabilities or temporary limitations.

Important accessibility practices include:

- meaningful HTML structure,
- keyboard-friendly interaction,
- sufficient color contrast,
- descriptive form labels,
- alt text for informative images,
- visible focus states.

Accessibility is not "extra polish." It directly affects usability and fairness. A government service portal, scholarship page, or university enrollment system should be usable even without a mouse or with assistive technology.

In many cases, semantic HTML already improves accessibility. That is why the earlier lessons matter.
$md$, 2),
('1e807c61-eed0-562d-8df1-53eb6c9094ba','content','Performance and Efficient Delivery',$md$
Performance affects both user satisfaction and system credibility. Slow pages can discourage users before they finish a task.

Common performance concerns include:

- oversized images,
- too many HTTP requests,
- blocking scripts,
- duplicated resources,
- poor caching strategy.

A few practical improvements:

- compress images,
- load only needed assets,
- minimize unnecessary scripts,
- and avoid loading everything at once.

In the Philippine context, performance matters even more because not all users have stable or fast internet. A well-designed page should still remain usable under modest network conditions.
$md$, 3),
('1e807c61-eed0-562d-8df1-53eb6c9094ba','content','Testing and Quality Assurance',$md$
Testing checks whether the system behaves as intended. At the web application level, testing may include:

- functional testing,
- form validation testing,
- usability testing,
- compatibility testing,
- and basic security testing.

Common questions to ask:

- Does the submit button work?
- What happens if required fields are blank?
- What happens if the internet disconnects?
- Does the layout break on mobile?
- Does the system reject invalid records?

A system is not "done" when the last line of code is written. It is closer to done when expected behavior has been checked carefully.
$md$, 4),
('1e807c61-eed0-562d-8df1-53eb6c9094ba','activity','Practice & Exam Drills — Lesson 7',$md$
### Review Questions

1. Why must authorization be checked on the server?
2. State one difference between validation and authorization.
3. Give three practical accessibility improvements for a form page.
4. Why does performance matter for users on weaker connections?
5. What is the purpose of testing in web development?
6. Name one example of a security mistake involving user input.

### Worked Exam-Style Problems

**Problem 1: Security Scenario**

A web app lets users edit their own profile by visiting:

```
/profile/edit?id=15
```

A student changes the URL to:

```
/profile/edit?id=16
```

and can now see another student's profile.

What is the main issue?

*Step-by-step solution*

- The app trusts the user-controlled ID too much
- The system fails to confirm whether the logged-in user is allowed to edit that record
- This is an **authorization** problem

Correct reasoning:

- authentication asks "Who are you?"
- authorization asks "What are you allowed to access?"

**Problem 2: Accessibility Repair**

A submit button is dark blue text on a slightly darker blue background. The form also has no labels, only placeholders.

List two accessibility problems and fix them conceptually.

*Step-by-step solution*

Problem 1:

- Poor color contrast makes text difficult to read

Fix:

- increase contrast between text and background

Problem 2:

- placeholders alone are not enough for form identification

Fix:

- add explicit labels tied to each field

### Hands-on Exercise

Evaluate this mini page and list at least five issues:

```html
<img src="seal.png">
<input type="text" placeholder="Name">
<input type="text" placeholder="Email">
<button style="background:#222; color:#333;">Submit</button>
```

Guide questions:

- Is the image accessible?
- Are the inputs properly labeled?
- Is the button readable?
- What if the user uses only a keyboard?
- What tests would you run before deployment?

### How to Pass This Topic

- In security questions, separate authentication from authorization.
- In accessibility questions, mention concrete items: labels, alt text, contrast, keyboard access, semantic structure.
- Performance answers earn more points when you refer to the user experience under real network conditions.
- Testing questions are often scenario-based. Read carefully and identify the failure condition.
- Do not write vague phrases like "make it more secure." State what should be checked or protected.
$md$, 5);

-- ============================================================
-- LESSON 8: Deployment, Collaboration, and Web Project Integration
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('22034d95-8aae-51bf-a5f7-09dcc3f9ca8d','content','From Local Project to Live System',$md$
A web project is only useful to real users when it is deployed. **Deployment** means transferring the application from a development environment to a server or hosting platform where users can access it.

A deployment-ready web application usually needs:

- a stable codebase,
- a clear file structure,
- environment-specific settings,
- working asset paths,
- database configuration,
- and a final round of testing.

Developers should also understand the difference between:

- **development environment** — where features are built and debugged
- **production environment** — the live version used by actual users

A project that works on one laptop may still fail after deployment because of missing files, wrong configuration, or dependency mismatches.
$md$, 1),
('22034d95-8aae-51bf-a5f7-09dcc3f9ca8d','content','Version Control and Team Collaboration',$md$
Web development is often collaborative. Teams need a safe way to manage changes, avoid losing work, and track progress. This is why **version control** matters.

At a conceptual level, version control helps teams:

- preserve change history,
- work on features separately,
- merge updates,
- and recover earlier versions when needed.

Even if the tool varies, the underlying habits are important:

- commit meaningful changes,
- write clear commit messages,
- avoid editing the same files carelessly,
- and test before merging work.

For capstone-style projects, poor collaboration can destroy good technical work. Clear role assignment, documentation, and file discipline matter almost as much as coding.
$md$, 2),
('22034d95-8aae-51bf-a5f7-09dcc3f9ca8d','content','Maintenance, Documentation, and Real-World Responsibility',$md$
Publishing a site is not the end. Systems need maintenance because users, requirements, and technology change.

Maintenance may involve:

- fixing bugs,
- updating content,
- improving performance,
- adjusting security controls,
- and refining the interface after feedback.

Documentation helps future maintenance. At minimum, a team should be able to answer:

- what the system does,
- how to set it up,
- how routes or pages are organized,
- what the database contains,
- and what assumptions were made.

If a project is turned over to another developer or to a client organization, poor documentation creates risk.
$md$, 3),
('22034d95-8aae-51bf-a5f7-09dcc3f9ca8d','content','Integrating Everything into a Semester-Level Web Project',$md$
By this point, web development should feel like an integrated subject rather than isolated topics. A typical semester project combines:

- semantic HTML,
- responsive CSS,
- DOM logic with JavaScript,
- forms and validation,
- server-side processing,
- database-backed CRUD,
- security and accessibility,
- testing and deployment.

A good final system is not the one with the most features. It is the one that solves a clear problem with stable, usable, and maintainable design.

For BSIT students, strong project themes often involve local service workflows:

- school records request,
- barangay complaint tracking,
- small business ordering,
- event registration,
- or clinic appointment management.

The best systems balance technical correctness and user value.
$md$, 4),
('22034d95-8aae-51bf-a5f7-09dcc3f9ca8d','activity','Practice & Exam Drills — Lesson 8',$md$
### Review Questions

1. What is deployment?
2. Why can a project work locally but fail in production?
3. What are the benefits of version control in team projects?
4. Why is documentation important after development?
5. Give three things you would check before launching a site.
6. What makes a semester web project strong from a BSIT perspective?

### Worked Exam-Style Problems

**Problem 1: Pre-Deployment Checklist**

A team says their project is finished because all pages display properly on one laptop. Their instructor asks why that is not enough.

Give at least four deployment-readiness checks.

*Step-by-step solution*

Possible correct checks:

- Test on different screen sizes
- Verify forms and validation
- Confirm database connection settings
- Check broken links or missing assets
- Review login and access control
- Test basic performance and loading behavior

Reason:

- A local success on one device does not guarantee production success

**Problem 2: Collaboration Failure Case**

Two teammates edit the same file and overwrite each other's changes. The final submit version loses a working feature.

What process problem most likely happened?

*Step-by-step solution*

The core issue is poor collaboration and version control discipline.

Likely missing practices:

- no clear branching or task separation,
- weak commit workflow,
- no change review before merge,
- no final integration testing.

This is a technical management issue, not just a coding issue.

### Hands-on Exercise

Draft a mini project plan for a **Community Health Appointment Web App**.

Your outline should include:

- target users
- key pages
- core CRUD entities
- one form with validation rules
- one security consideration
- one accessibility consideration
- one deployment checklist
- one maintenance note

Write it as a concise project brief. If your professor asks for "integration," this kind of answer shows you can connect multiple lessons into one design.

### How to Pass This Topic

- Think like a system builder, not just a coder. Professors reward integration.
- For project questions, mention both technical and user-facing concerns.
- In deployment answers, talk about environment differences, not just "uploading files."
- For collaboration questions, mention version control, testing, and documentation.
- In finals, integrated essay questions are common. Structure your answer from front end → logic → data → quality → deployment.
$md$, 5);

-- SOURCES (metadata — not inserted): UP Open University / UP Diliman CMSC 207;
-- PUP CCIS BSIT; FEU Institute of Technology BSIT (Web & Mobile); Adamson
-- University BSIT 2022; Ateneo de Manila Web Design Fundamentals; DLSU CCAPDEV;
-- CHED CMO 25 s. 2015 (BSCS/BSIS/BSIT PSG).

