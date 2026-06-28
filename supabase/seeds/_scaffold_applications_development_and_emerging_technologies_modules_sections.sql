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

