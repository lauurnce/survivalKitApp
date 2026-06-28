-- ============================================================
-- Applications Development and Emerging Technologies — Modules & Sections
-- Subject ID: 30000000-0003-0002-0001-000000000001
-- 3rd Year, Semester 2 — major
-- 7 lessons. Per lesson: S1+S2 = content (FREE), S3 + drill = activity (PAID).
-- Re-running is safe (the DELETE clears prior rows for this subject first).
-- ============================================================

DELETE FROM modules WHERE subject_id = '30000000-0003-0002-0001-000000000001';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('1836bce1-585f-59d6-a2a8-e506c9d47865','30000000-0003-0002-0001-000000000001','Lesson 1: Introduction to Applications Development','lesson-1-introduction-to-applications-development',1),
  ('a8bed4f2-250b-5cf7-bbf9-50fc755f2fa6','30000000-0003-0002-0001-000000000001','Lesson 2: Requirements Analysis and Planning','lesson-2-requirements-analysis-and-planning',2),
  ('52c67d2e-5ca0-568c-b7c8-ca2c0f5d5473','30000000-0003-0002-0001-000000000001','Lesson 3: Design Principles and User Interfaces','lesson-3-design-principles-and-user-interfaces',3),
  ('6482f159-acca-57be-b95f-7a3242217995','30000000-0003-0002-0001-000000000001','Lesson 4: Server-side Development and Databases','lesson-4-server-side-development-and-databases',4),
  ('c98ee9ff-ba9f-5a82-8283-35d95951f53d','30000000-0003-0002-0001-000000000001','Lesson 5: Emerging Technologies','lesson-5-emerging-technologies',5),
  ('3e810057-cdfd-5424-8d29-5af3b0a80efa','30000000-0003-0002-0001-000000000001','Lesson 6: Testing, Deployment, and Security','lesson-6-testing-deployment-and-security',6),
  ('12489fd2-3e14-5ba6-bbb8-9d2ac50e843e','30000000-0003-0002-0001-000000000001','Lesson 7: Ethics, Legal, and Professional Issues','lesson-7-ethics-legal-and-professional-issues',7);

-- ============================================================
-- LESSON 1: Introduction to Applications Development
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('1836bce1-585f-59d6-a2a8-e506c9d47865','content','What is Application Development?',$md$
Application development is the process of creating software applications for users. It involves writing code, designing interfaces, and managing data to solve real-world problems. In the Philippine context, this could mean building apps for local businesses, education platforms, or government services. Applications are developed using various technologies (web, mobile, desktop) and follow a systematic approach. Emerging technologies, such as cloud computing and artificial intelligence, influence how modern applications are built and deployed.
$md$, 1),
('1836bce1-585f-59d6-a2a8-e506c9d47865','content','Software Development Life Cycle (SDLC)',$md$
The Software Development Life Cycle (SDLC) is a structured process used to plan, develop, test, and maintain software. Common models include Waterfall (sequential phases) and Agile (iterative sprints). Each phase—requirements, design, implementation, testing, deployment, and maintenance—helps ensure quality and clarity. For example, before coding an e-commerce app, you would gather requirements (what features it needs), then design the architecture and user interface, and finally implement and test the software. Documenting each step prevents mistakes and confusion later on.
$md$, 2),
('1836bce1-585f-59d6-a2a8-e506c9d47865','activity','Emerging Technologies in IT',$md$
Emerging technologies are new or evolving tools that impact how we create and use applications. Examples include cloud computing (e.g. AWS or Azure for hosting apps), artificial intelligence (AI/ML for smart features like recommendations), and the Internet of Things (IoT) for connecting devices. For instance, a smart traffic app in Metro Manila might use cloud servers and machine learning to predict congestion. Understanding these trends is important: exams may ask how such technologies can improve a given software solution.
$md$, 3);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('1836bce1-585f-59d6-a2a8-e506c9d47865','activity','Practice & Exam Drills — Lesson 1',$md$
**Review Questions:**

1. What is the SDLC and why is it important in software development?
2. Compare Waterfall and Agile models (one key difference).
3. Name two emerging technologies and one example application of each.
4. Why do developers use version control tools (like Git) during development?
5. Give a Philippine example of an app or platform influenced by cloud computing or AI.

**Worked Problem:**

A barangay wants an online system to report issues (e.g., potholes, garbage). As a developer, list three functional requirements for this system (what it must do). Then suggest one emerging technology that could improve it, and explain how.

**Solution:**

Functional requirements might include: (1) user login and registration; (2) a form to submit issue reports (with location and optional photo); (3) a dashboard for officials to review and update issue status. An emerging technology could be a cloud database (so reports are stored online and accessible anywhere) or mobile GPS (to automatically tag the report's location). Using a cloud platform like Google Cloud allows scalability and easy access, while GPS makes reporting faster and more accurate.

**How to Pass Tips:**

- Remember the steps of the SDLC; professors often ask to explain or sequence them.
- Learn key terms: requirements, deployment, framework, Agile.
- In answers, ground them in examples (mention a local app or law if relevant).
- Know basic facts (Data Privacy Act, common cloud services) but focus on understanding *why* they matter in development.

**Coding Drill:** Complete `count_open_issues` so it returns the number of issues whose status is `"open"`.
$md$, 4, 'python', $code$issues = [
    {"id": 1, "location": "Manila", "status": "open"},
    {"id": 2, "location": "Cebu",  "status": "closed"},
    {"id": 3, "location": "Davao", "status": "open"},
]

def count_open_issues(issue_list):
    # TODO: return count of issues where status == 'open'
    count = 0
    for issue in issue_list:
        if issue["status"] == "open":
            count += 1
    return count

print(count_open_issues(issues))$code$);

-- ============================================================
-- LESSON 2: Requirements Analysis and Planning
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a8bed4f2-250b-5cf7-bbf9-50fc755f2fa6','content','Gathering User Requirements',$md$
The first step in any project is understanding what users need. This can involve interviews, surveys, or observing tasks to gather functional and non-functional requirements. For example, if building a mobile banking app, requirements might include "allow users to view account balance" or "send notifications for transactions." Clear requirements prevent misunderstandings later on. Always document requirements carefully in words (like user stories) or simple diagrams.
$md$, 1),
('a8bed4f2-250b-5cf7-bbf9-50fc755f2fa6','content','Documenting Requirements',$md$
After gathering information, developers write it down in a formal way. Common tools include use-case diagrams (showing how users interact with the system) or user stories ("As a user, I want…"). A software specification might list all functions in detail. This plan acts like a contract: everyone (clients, developers) reviews it before coding. In exams, you may need to draft a small use-case or explain the purpose of a requirements document.
$md$, 2),
('a8bed4f2-250b-5cf7-bbf9-50fc755f2fa6','activity','Project Planning Essentials',$md$
Once requirements are set, planning begins. This involves setting timelines, assigning roles, and choosing development methodologies. In a student project, this could mean dividing tasks (one person designs the interface, another writes code, etc.). In professional settings, teams use tools like Git for collaboration and project trackers (like Jira). Professors expect you to know common planning practices, such as estimating tasks or creating project milestones.
$md$, 3);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('a8bed4f2-250b-5cf7-bbf9-50fc755f2fa6','activity','Practice & Exam Drills — Lesson 2',$md$
**Review Questions:**

1. What is the difference between functional and non-functional requirements? Give one example of each.
2. What is a user story? Write a short user story for a student enrollment system.
3. Name a tool or diagram commonly used to document requirements.
4. Why is clear documentation important before programming starts?
5. Describe one method to gather requirements from stakeholders.

**Worked Problem:**

A university wants an app for scheduling study group sessions. Identify two functional requirements and one non-functional requirement. Then describe a simple use-case: who the actor is and what they do.

**Solution:**

Functional requirements: (1) allow students to create study group sessions (enter date/time and subject); (2) let students join or leave existing sessions. Non-functional requirement: the app should load session lists within 2 seconds (performance). Use-case: Actor = Student. Use case = "Join Study Group": The student selects a session from a list and taps "Join", then the system adds them to the session.

**How to Pass Tips:**

- Learn the purpose of requirement documents (what the system must do).
- Practice writing clear user stories ("As a ___, I want ___ so that ___.").
- Understand examples of functional vs. non-functional (e.g. reliability, response time).
- Use real-life examples (like planning an app for your community) to frame answers.

**Coding Drill:** Complete `add_user_story` so it appends the new story to the list.
$md$, 4, 'python', $code$stories = [
    "As a voter, I want to register online so I can vote",
    "As an admin, I want to delete old events"
]

def add_user_story(stories, story):
    # TODO: add the story to the stories list
    pass

add_user_story(stories, "As a student, I want to enroll online")
print(stories)$code$);

-- ============================================================
-- LESSON 3: Design Principles and User Interfaces
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('52c67d2e-5ca0-568c-b7c8-ca2c0f5d5473','content','UI/UX Design Fundamentals',$md$
User Interface (UI) and User Experience (UX) design focus on how an app looks and feels. A good interface is clean, consistent, and easy to use. For example, a banking app should clearly label buttons like "Transfer" or "Pay Bill," and use colors and layouts that make sense to users. Key UI principles include contrast (readable text), alignment (organized layout), and accessibility (usable by people with disabilities). Professors may show a sample screen and ask you to identify UI problems or improvements.
$md$, 1),
('52c67d2e-5ca0-568c-b7c8-ca2c0f5d5473','content','Design Patterns and Principles',$md$
Software design patterns are reusable solutions to common problems. A popular pattern in app development is MVC (Model-View-Controller): it separates data (Model), the user interface (View), and the logic (Controller). This makes large applications easier to manage. Other principles include DRY ("Don't Repeat Yourself") and KISS ("Keep It Simple, Stupid!"). In exams, you might explain a pattern or suggest a simple UI improvement (like moving a critical button to a more visible position).
$md$, 2),
('52c67d2e-5ca0-568c-b7c8-ca2c0f5d5473','activity','Front-End Technologies Overview',$md$
Front-end development uses languages like HTML, CSS, and JavaScript to build what users see. For example, HTML defines page structure, CSS styles it, and JavaScript adds interactivity (buttons, form validation). Modern frameworks (React, Angular, Vue) speed up development by providing reusable components and templates. You don't need to code these in this course, but know they exist: understanding the roles of HTML/CSS/JS helps in questions about web-based applications.
$md$, 3),
('52c67d2e-5ca0-568c-b7c8-ca2c0f5d5473','activity','Practice & Exam Drills — Lesson 3',$md$
**Review Questions:**

1. List two key principles of good UI design and why each matters.
2. What does MVC stand for, and what is the role of the Controller?
3. Name one advantage of using a front-end framework like React.
4. Explain why consistency in design (colors, fonts, buttons) is important in an app.
5. Give an example of a web technology used for structure, one for style, and one for behavior (HTML, CSS, JS respectively).

**Worked Problem:**

An online shopping app's product page has the "Add to Cart" button at the bottom and small font for prices. Identify two issues from a UI/UX perspective and suggest fixes.

**Solution:**

Issues: (1) The "Add to Cart" button is too far from product details; users might miss it. (2) The small font is hard to read. Fixes: Move the button closer to the top near the product description, and increase font size or contrast for better readability.

**Hands-on Exercise:**

(This exercise is conceptual—no code block needed.) Imagine a simple login page. Describe one improvement to its design to enhance usability. For example: making the "Login" button larger and a bright color so users find it easily, or aligning the "Username" and "Password" fields for a cleaner look. Write your answer in a few sentences.

**How to Pass Tips:**

- In UI questions, mention practical improvements (e.g. change color or size of buttons, align input fields).
- Be ready to explain *why* a design choice helps users (like accessibility or clarity).
- Recall basic design terms (contrast, hierarchy, responsive). Professors often like examples: relate to local apps or websites (e.g. ease of use in a mobile banking app).
$md$, 4);

-- ============================================================
-- LESSON 4: Server-side Development and Databases
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('6482f159-acca-57be-b95f-7a3242217995','content','Server-side Languages and Frameworks',$md$
Server-side development involves code running on a server (behind the scenes). Languages include Python, Java, C#, and frameworks like Django (Python) or Spring (Java). These handle business logic, database operations, and security. For example, when you submit a web form, the server processes it (saving data or performing computations). In exams, you may be asked to name a server-side language and explain its use (e.g. Java for enterprise apps, Python for web APIs).
$md$, 1),
('6482f159-acca-57be-b95f-7a3242217995','content','Database Basics and Integration',$md$
Applications often use databases to store information. Common databases include MySQL, PostgreSQL, or cloud-based options like Firebase. Key ideas: data is organized into tables (e.g., a table of student records), and SQL queries retrieve or update it. For instance, a student portal might have a Students table with columns (ID, name, grade). Knowing basic SQL commands (SELECT, INSERT, UPDATE) can be useful. Even if you don't write SQL in an exam, understand that data storage and retrieval are core to many applications.
$md$, 2),
('6482f159-acca-57be-b95f-7a3242217995','activity','APIs and Data Storage',$md$
APIs (Application Programming Interfaces) allow different software systems to communicate. For example, a web app might call a weather API to get current conditions. Data must be handled securely: passwords should be hashed, and database connections protected. Many modern apps use RESTful APIs or cloud services for data. If personal data is involved (e.g., a system for students), remember the Data Privacy Act (RA 10173) that requires protecting such information. Questions may involve describing a request flow: user action → server processing → database → response.
$md$, 3);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('6482f159-acca-57be-b95f-7a3242217995','activity','Practice & Exam Drills — Lesson 4',$md$
**Review Questions:**

1. What is a database table? Give a real-world example (like a table of books or students).
2. Why do server-side frameworks (like Flask or Spring) help developers?
3. What does SQL stand for? Name one SQL command and its purpose.
4. Explain what an API is, in simple terms.
5. What security measure should be taken when storing user passwords?

**Worked Problem:**

Suppose you have a database table `Products(id, name, price)`. Write a pseudo-SQL query to find all products priced above ₱500. Then explain how a Python server program might retrieve and display these products on a webpage.

**Solution:**

The SQL query: `SELECT * FROM Products WHERE price > 500;`. A Python server (e.g. using Flask) would connect to the database, execute this query, fetch the results, and then pass them to an HTML template or API response. The webpage could then loop through these records and show each product's name and price in a list or table.

**Hands-on Exercise:**

Using the starter Python code, complete the `get_user_by_name` function so it returns the matching user or `None`. For example, `get_user_by_name("Bob")` should return `{"id": 2, "name": "Bob", "age": 30}`.

**How to Pass Tips:**

- Memorize basic SQL keywords (SELECT, INSERT, WHERE).
- Understand the client-server flow: user action → server code → database → server response.
- Be ready to describe what happens when data is saved or retrieved (forms, API calls).
- Practice simple coding tasks (searching a list or filtering data in Python) as exam drills.
$md$, 4, 'python', $code$# Assume we have a list of user records (like a simple database)
users = [
    {"id": 1, "name": "Alice", "age": 25},
    {"id": 2, "name": "Bob",   "age": 30}
]

def get_user_by_name(name):
    # TODO: return the user record whose name matches (case-sensitive), or None if not found
    for user in users:
        if user["name"] == name:
            return user
    return None

print(get_user_by_name("Bob"))$code$);

-- ============================================================
-- LESSON 5: Emerging Technologies
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('c98ee9ff-ba9f-5a82-8283-35d95951f53d','content','Cloud Computing and Deployment Models',$md$
Cloud computing means using remote servers (over the internet) to host apps and data. Services like AWS, Google Cloud, or local providers let developers deploy apps without owning physical hardware. Models include Infrastructure-as-a-Service (virtual machines), Platform-as-a-Service (managed app platforms), and Software-as-a-Service (hosted software). For example, storing files on Google Drive is SaaS. Understanding cloud models is useful: exam questions might ask you to compare IaaS vs. PaaS or identify benefits like scalability (handling many users) and cost savings.
$md$, 1),
('c98ee9ff-ba9f-5a82-8283-35d95951f53d','content','Artificial Intelligence and Machine Learning',$md$
AI (Artificial Intelligence) and ML (Machine Learning) refer to systems that learn from data. In application development, AI/ML can power features like recommendation engines or image recognition. For instance, a food delivery app could use ML to suggest restaurants based on past orders. You don't need to build models from scratch, but know basic concepts: training vs. inference, datasets, algorithms. Key idea: AI means programs can perform intelligent tasks, and ML is how they learn from data. In exams, use simple examples (spam filters, chatbots) to explain how AI/ML adds value.
$md$, 2),
('c98ee9ff-ba9f-5a82-8283-35d95951f53d','activity','Internet of Things (IoT) and Other Trends',$md$
The Internet of Things (IoT) connects everyday devices (sensors, appliances) to the internet, enabling smart applications. An example is traffic sensors that adjust light timings automatically. IoT raises security and privacy issues (like protecting device data). Other emerging trends include AR/VR (augmented/virtual reality) and blockchain. You may not be asked in detail about these, but mentioning a Philippine example (like smart farming sensors or e-agriculture devices) shows you're aware of local tech trends.
$md$, 3),
('c98ee9ff-ba9f-5a82-8283-35d95951f53d','activity','Practice & Exam Drills — Lesson 5',$md$
**Review Questions:**

1. What is cloud computing? Give one advantage and one disadvantage of using a cloud service.
2. Explain the difference between AI and ML in simple terms.
3. Describe an example of how IoT could improve life in a Philippine city.
4. What is scalability in the context of web applications?
5. Name one potential security risk with IoT devices and a way to mitigate it.

**Worked Problem:**

A startup wants to build an app that recommends dishes to users based on their past orders (like a recommendation engine). Outline which emerging technologies (cloud, AI, IoT, etc.) they might use and how. For example, they could use a cloud database for storage and a machine learning library to analyze order history.

**Solution:**

They might host their app on a cloud platform (so it can scale if many users join). They could use an ML library (like Python's scikit-learn) to find patterns in past orders and suggest dishes. If connected to IoT (like smart refrigerators), the app could even factor in ingredient availability. The key is: cloud for hosting/data, and ML algorithms for recommendations.

**Hands-on Exercise:**

(This section is conceptual.) Write a short plan (2–3 sentences) explaining cloud computing to a layperson. For instance: "Cloud computing is like renting storage and computers over the internet instead of buying them. This allows apps to work fast and lets anyone access their data from anywhere." This helps practice explaining technical ideas simply.

**How to Pass Tips:**

- For cloud topics, remember major providers (AWS, Azure) but focus on concepts (scaling, reliability).
- For AI/ML, note that these need data to learn patterns; use simple examples (like movie recommendation).
- Use everyday examples (smartphones, smart homes) to illustrate emerging tech.
- Mention any local examples (like e-services running on cloud or smart agriculture sensors) to relate tech to the Philippine context.
$md$, 4);

-- ============================================================
-- LESSON 6: Testing, Deployment, and Security
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('3e810057-cdfd-5424-8d29-5af3b0a80efa','content','Software Testing Strategies',$md$
Testing ensures an application works as intended. Common types include unit testing (checking individual functions or components) and integration testing (checking combined parts). For example, a unit test might verify that a function correctly adds two numbers. Automated tests (written in code) are standard practice. In exams, you might have to identify which type of testing is needed or explain how testing catches bugs before release.
$md$, 1),
('3e810057-cdfd-5424-8d29-5af3b0a80efa','content','Deployment and DevOps Basics',$md$
Deployment is releasing an application to users (for example, uploading a website or submitting an app to a store). DevOps is the practice of combining development and operations, often using continuous integration/continuous deployment (CI/CD) tools. This means whenever new code is written, automated processes test and deploy it. For instance, after committing code, a CI/CD system can run tests and update the live app without manual steps. Questions may cover the concept of a deployment pipeline or why automated deployment reduces errors.
$md$, 2),
('3e810057-cdfd-5424-8d29-5af3b0a80efa','activity','Security Best Practices',$md$
Security is crucial in development. Always validate user inputs (to prevent attacks like SQL injection) and encrypt or hash sensitive data. For example, do not store passwords in plain text—always hash them first. In the Philippines, the Data Privacy Act (RA 10173) requires protecting personal data (e.g., use secure connections, ask user consent). Professors may present a scenario (like a data breach or suspicious input) and ask how to secure the app (e.g., input validation, encryption, software updates).
$md$, 3);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('3e810057-cdfd-5424-8d29-5af3b0a80efa','activity','Practice & Exam Drills — Lesson 6',$md$
**Review Questions:**

1. What is unit testing? Give one example.
2. Why are passwords typically stored as hashes instead of plain text?
3. What does CI/CD stand for? Why is it useful in deployment?
4. Name one method to prevent SQL injection attacks.
5. Explain what "continuous integration" means in simple terms.

**Worked Problem:**

Consider the function `is_even(n)`. What does `is_even(5)` return, and why? Write a Python assertion to test that `is_even(10)` returns `True`.

**Solution:**

`is_even(5)` returns `False` because 5 is not divisible by 2. A test for `is_even(10)` could be:

```python
assert is_even(10) == True
```

This passes if `is_even(10)` returns `True`.

**Hands-on Exercise:**

Add another test to the code: check that `is_even(7)` returns `False`, using an `assert` statement. For example:

```python
assert is_even(7) == False
```

This reinforces writing unit tests in Python.

**How to Pass Tips:**

- Learn basic security terms (encryption vs. hashing, OWASP top risks).
- Understand why testing is done: mention catching bugs early and ensuring quality.
- Remember CI/CD concepts (automated build/test/deploy); practice describing them simply.
- In code snippets, practice spotting logic errors and writing small tests (assert statements).
$md$, 4, 'python', $code$def is_even(n):
    # returns True if n is an even number, False otherwise
    return n % 2 == 0

# TODO: write a simple test that checks is_even(4) returns True
assert is_even(4) == True
print("test passed")$code$);

-- ============================================================
-- LESSON 7: Ethics, Legal, and Professional Issues
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('12489fd2-3e14-5ba6-bbb8-9d2ac50e843e','content','Ethical Considerations in IT',$md$
As developers, we must follow ethical standards. This includes respecting user privacy (not misusing personal data) and avoiding plagiarism (writing original code or properly citing sources). In the Philippines, the DOST Code of Ethics for IT Professionals says we should "perform our duties with honesty." An exam question might describe a scenario (like finding a bug in a competitor's software) and ask what the ethical action is (for example, do not exploit it and report it instead).
$md$, 1),
('12489fd2-3e14-5ba6-bbb8-9d2ac50e843e','content','Intellectual Property and Licensing',$md$
Software licenses determine how code can be used or shared. Open-source licenses (GPL, MIT, Apache) allow copying and modification under certain conditions (e.g., sharing improvements). Proprietary software requires purchasing or permission to use. In class, know basic terms: copyright, patent, and software piracy. For example, copying a paid program without permission is illegal under the IP Code (RA 8293). Questions may ask you to identify a license type from terms (e.g., "You must release source code" indicates a GPL-like license) or explain the consequence of piracy under Philippine law.
$md$, 2),
('12489fd2-3e14-5ba6-bbb8-9d2ac50e843e','activity','Professional Conduct and Legal Compliance',$md$
Professional behavior means following laws and organizational policies. This includes protecting user data (complying with the Data Privacy Act) and doing honest work (no cheating on exams or projects). For instance, if your college requires original projects, copying code is unethical and likely violates academic rules. Professors often expect answers like "report the issue" or "use licensed resources." Key laws: RA 10173 (Data Privacy Act of 2012) and RA 8293 (Intellectual Property Code of 1997). These highlight the importance of ethical and legal practice in IT.
$md$, 3),
('12489fd2-3e14-5ba6-bbb8-9d2ac50e843e','activity','Practice & Exam Drills — Lesson 7',$md$
**Review Questions:**

1. What is one ethical practice an IT professional should always follow?
2. Name one open-source software license and one condition it imposes.
3. Why is it unethical to copy code from peers or the internet without permission?
4. What does the Data Privacy Act protect?
5. Give an example of a professional misconduct scenario in software development.

**Worked Problem:**

Suppose a classmate asks you to share your licensed software tool login so they can use it. What should you do and why? Explain in terms of ethics and licensing.

**Solution:**

You should refuse to share your login because it violates the software licensing terms and academic integrity. Ethically, enabling piracy of paid software is wrong. Legally, sharing a license may breach the software's terms of service and copyright law. A good alternative is to suggest they use free or properly licensed software instead.

**Hands-on Exercise:**

(Reflection) Write a brief answer: Why is it important to follow a code of ethics in IT, both in college and in industry? Discuss how ethical behavior builds trust with users, colleagues, and society.

**How to Pass Tips:**

- Memorize key Philippine laws: RA 10173 (Data Privacy Act), RA 8293 (IP Code).
- In ethical scenarios, always choose honesty and legality: professors look for answers like "report the issue" or "use licensed resources."
- Understand different licenses: know the difference between "free software" and "open source" (e.g., freedom vs. cost).
- Use real cases (news or experiences) as examples in answers (e.g., data breaches, piracy cases) to make explanations concrete.
$md$, 4);

-- SOURCES:
--   De La Salle University — BSIT program core subjects listing (includes Applications Development and Emerging Technologies)
--   CHED CMO No. 25, s.2015 — Revised PSGs for BSCS/BSIS/BSIT (course specification)
--   CHED CMO No. 02, s.2014 — PSGs for Entertainment and Multimedia (Annex C sample syllabus)
