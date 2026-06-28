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

