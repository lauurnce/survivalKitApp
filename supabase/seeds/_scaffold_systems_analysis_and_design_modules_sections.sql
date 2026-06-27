-- ============================================================
-- Systems Analysis and Design — Modules & Sections
-- Subject ID: 30000000-0003-0002-0001-000000000003
-- 3rd Year, Semester 2 — major
--
-- Free/paid split: per lesson, sections 1-2 are FREE (kind='content'),
-- section 3 + the practice drills are PAID (kind='activity').
-- No IDE playgrounds in this subject (case-analysis drills only).
-- Re-running is safe (the DELETE clears prior rows for this subject).
-- ============================================================

DELETE FROM modules WHERE subject_id = '30000000-0003-0002-0001-000000000003';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('7ca92329-c8f0-5c0b-a525-ab0e36577f5b','30000000-0003-0002-0001-000000000003','Lesson 1: Foundations of Systems Analysis and Design','lesson-1-foundations-of-systems-analysis-and-design',1),
  ('5772a6c6-ea95-5361-8e8e-54b5af556c47','30000000-0003-0002-0001-000000000003','Lesson 2: Systems Planning, Business Processes, and Feasibility','lesson-2-planning-business-processes-feasibility',2),
  ('dee0e51b-5c73-5378-b28e-4f9bd998cbf2','30000000-0003-0002-0001-000000000003','Lesson 3: Requirements Engineering and Fact-Finding','lesson-3-requirements-engineering-fact-finding',3),
  ('82df723c-7208-515c-81a2-3c46bc4bd44b','30000000-0003-0002-0001-000000000003','Lesson 4: Structured Analysis and Data Modeling','lesson-4-structured-analysis-data-modeling',4),
  ('d71a716c-2be0-5dd8-9175-8a9e8e741e4a','30000000-0003-0002-0001-000000000003','Lesson 5: Object-Oriented Analysis and UML','lesson-5-object-oriented-analysis-uml',5),
  ('7793b931-b0db-57bf-adc8-31729fc28bde','30000000-0003-0002-0001-000000000003','Lesson 6: Systems Design','lesson-6-systems-design',6),
  ('d7748ee4-cb0a-5696-b40d-f7bd5dec9ae7','30000000-0003-0002-0001-000000000003','Lesson 7: Testing, Implementation, and Maintenance','lesson-7-testing-implementation-maintenance',7),
  ('00f881d4-f722-51d4-baf5-184966a95b17','30000000-0003-0002-0001-000000000003','Lesson 8: Project Management, Documentation, and Capstone Readiness','lesson-8-project-management-documentation-capstone',8);

-- ============================================================
-- LESSON 1: Foundations of Systems Analysis and Design
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('7ca92329-c8f0-5c0b-a525-ab0e36577f5b','content','Why Systems Analysis and Design Matters',$md$
Systems Analysis and Design is the study of how organizations understand problems, define requirements, and build information systems that solve those problems well. In BSIT, this subject sits between technical development and real organizational needs. It teaches you how to move from "May problema ang office" to "Here is a clear, justified, testable system solution."

An information system is more than software. It includes:

- **People** who use, manage, and support it
- **Processes** that define how work is done
- **Data** that the organization stores and uses
- **Technology** such as hardware, software, and networks
- **Policies and controls** that keep work accurate, secure, and compliant

A common mistake is to think that a system project starts with coding. In practice, coding starts much later. Good projects begin with questions like:

- What is the real business problem?
- Who is affected by it?
- What does the current process look like?
- What data is needed?
- What constraints exist?
- How will we know the new system is successful?

If these questions are skipped, the team may build a system that works technically but fails operationally. A fast, well-coded program is still a poor solution if it does not match the users' work, legal requirements, budget, or timeline.

A useful way to think about this subject is:

| Stage | Main Concern |
|---|---|
| Analysis | Understand the problem and define what the system must do |
| Design | Decide how the system will be built and how parts will work together |
| Implementation | Build, test, deploy, and support the system |

In Philippine contexts, Systems Analysis and Design is often applied to cases such as:

- student enrollment and clearance systems
- barangay service request and document tracking
- clinic appointment and medicine inventory systems
- payroll and HR systems for SMEs
- e-commerce order processing for local sellers
- logistics and delivery tracking for cooperatives

The subject trains you to think like a professional who can connect users, managers, developers, testers, and decision-makers into one coherent project effort.
$md$, 1),
('7ca92329-c8f0-5c0b-a525-ab0e36577f5b','content','The Role of the Systems Analyst',$md$
A systems analyst is the bridge between the organization and the technical team. The analyst does not only gather requests. The analyst studies operations, clarifies problems, identifies requirements, models processes and data, evaluates options, and helps the team produce a workable solution.

A good systems analyst usually performs these responsibilities:

- studies the current system or workflow
- identifies business problems, causes, and effects
- gathers requirements from users and stakeholders
- models processes, data, and interactions
- checks whether requirements are complete and consistent
- works with designers and developers during solution design
- helps prepare test cases and implementation plans
- communicates with both technical and non-technical audiences

The analyst must talk to different stakeholders. These often include:

| Stakeholder | Typical Concern |
|---|---|
| End users | Ease of use, speed, daily workflow |
| Managers | Reporting, control, productivity, cost |
| Owners or sponsors | Return on investment, strategic value |
| IT staff | Feasibility, maintenance, integration |
| Customers or citizens | Service quality, accessibility, trust |
| Regulators | Compliance, privacy, security, records |

A strong analyst needs both technical awareness and soft skills. For example:

- **Communication** for interviews, presentations, and documentation
- **Critical thinking** for separating symptoms from root causes
- **Modeling skill** for diagrams and structured descriptions
- **Empathy** for understanding the user's real work
- **Professional ethics** for handling sensitive data responsibly

A simple example: if a registrar complains, "The enrollment process is slow," the analyst should not immediately conclude, "We need a new website." The analyst must ask:

- Which part is slow?
- Is the issue data entry, approval, payment posting, or scheduling?
- Is the current delay caused by policy, staffing, network limits, or software?
- Who experiences the delay most?
- What evidence exists?

That is what makes the analyst different from someone who only receives feature requests.
$md$, 2),
('7ca92329-c8f0-5c0b-a525-ab0e36577f5b','activity','Development Approaches and the System Life Cycle',$md$
Most systems follow some form of life cycle, meaning a sequence of work from idea to operation. The classic model is the Systems Development Life Cycle or SDLC.

A common SDLC flow looks like this:

1. Planning
2. Analysis
3. Design
4. Implementation
5. Testing
6. Deployment
7. Maintenance and review

In real projects, these stages may overlap, but the logic remains useful: understand first, design next, build after, then evaluate.

Several development approaches are commonly discussed in this subject.

### Waterfall

Waterfall moves mostly in sequence. One stage is completed before the next begins. It works best when requirements are stable and heavily documented.

**Strengths:** easy to track by stage; strong documentation; useful in formal environments.
**Weaknesses:** changes are costly later; user feedback may arrive too late.

### Prototyping

A prototype is an early model of the system or interface. It is used to gather feedback and clarify requirements.

**Best for:** unclear user needs; interface-heavy systems; projects where users must react to something visible.

### Agile

Agile develops the system in short cycles or iterations. It values user feedback, incremental delivery, and adaptability.

**Best for:** changing requirements; fast-moving digital products; teams that can collaborate frequently.

### RAD and iterative approaches

Rapid Application Development and other iterative methods emphasize faster delivery, repeated refinement, and continuous user input.

For exam purposes, remember this principle:

> The best development approach depends on the project's level of uncertainty, stakeholder availability, risk, and need for structure.
$md$, 3),
('7ca92329-c8f0-5c0b-a525-ab0e36577f5b','activity','Practice & Exam Drills — Lesson 1',$md$
**Core Outputs to keep in mind:** problem statement, objectives, scope and limitations, feasibility study, requirements list, use cases/user stories, DFD/ERD/UML diagrams, interface sketches, data design and controls, test plan, implementation plan. Analysis asks *what* and *why*; design asks *how*.

**Review Questions**

1. What is the difference between system analysis and system design?
2. Why is it risky to begin coding before requirements are clarified?
3. Give three responsibilities of a systems analyst.
4. Differentiate an end user from a system sponsor.
5. Name four common stages of the SDLC.
6. When is prototyping more suitable than a strict waterfall approach?
7. Why is documentation important in systems projects?
8. How does this subject support a BSIT capstone project?

**Worked Exam-Style Problems**

**Problem 1: Classify the project concerns.** A private college wants to improve its student clearance process. Classify each concern as primarily a problem of *people, process, data, or technology*: approvals take too long; signatories cannot track pending requests; inconsistent cashier and registrar records; students must visit several offices physically.

*Step-by-step solution* — Look for the dominant cause.
- "Approvals take too long" → **Process** (workflow speed)
- "Cannot track pending requests" → **Technology** (missing system functionality)
- "Inconsistent records" → **Data** (facts not matching across offices)
- "Must visit several offices" → **Process** (fragmented workflow)

**Problem 2: Choose the development approach.** A city health office wants a vaccine inventory and clinic appointment system. Staff can review screens weekly, and some requirements may change once nurses see drafts. Waterfall or prototyping/iterative?

*Step-by-step solution* — Clues: users review weekly; requirements may change; seeing drafts affects decisions. Waterfall fits stable requirements; prototyping/iterative fits changing requirements + frequent review.
*Answer:* **Prototyping or iterative development**, because requirements are not yet stable and users can give regular feedback.

**Problem 3: Distinguish analysis from design.** Label each as Analysis or Design:
- Identify what reports the manager needs → **Analysis**
- Decide the database tables to store transaction history → **Design**
- Interview users about current delays → **Analysis**
- Define the validation rules for a mobile registration form → **Design**
- Write the system objective "reduce average processing time by 40%" → **Analysis**

**Hands-On Practice — Barangay Service Request Tracker.** A barangay office receives complaints through paper forms, Facebook messages, and walk-ins; records are duplicated and statuses inconsistent.
1. Write a 3-sentence problem statement.
2. List five stakeholders.
3. Propose two measurable objectives.
4. Choose one development approach and justify it in 3-5 sentences.

*Guide:* a good problem statement names the difficulty, who is affected, and why improvement matters; good stakeholders include residents, barangay staff, secretary, captain, IT support; objectives should be time/accuracy/tracking-based; prototyping fits if the barangay wants to review sample screens early.

**How to Pass This Topic**

- Memorize the difference between analysis and design — it appears often.
- To justify a method, use the words *requirements stability, user feedback, risk, documentation*.
- In essays, always mention people, process, data, and technology.
- Do not confuse stakeholders with project deliverables.
- Be specific. "To improve the system" is weak; "To reduce duplicate records and shorten approval time" is better.
$md$, 4);

-- ============================================================
-- LESSON 2: Systems Planning, Business Processes, and Feasibility
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('5772a6c6-ea95-5361-8e8e-54b5af556c47','content','Project Initiation and the Business Case',$md$
A systems project should begin with a clear reason for existing. This is called the business case. It explains why the organization should spend time, money, and effort on the project.

Project initiation usually starts when someone notices:

- delays in service
- repeated data errors
- weak reporting
- high operating cost
- poor user experience
- security or compliance issues
- lost opportunities for growth

At this point, the analyst should avoid jumping directly to a software feature list. The first job is to define the problem, the people affected, the impact, and the desired improvement.

A useful problem statement answers four questions:

1. What is happening now?
2. Why is it a problem?
3. Who is affected?
4. What improvement is expected?

Example:

> The current permit renewal process of the municipal office relies on manual encoding and separate spreadsheets per unit. This causes repeated data entry, delayed approvals, and inconsistent records seen by applicants and staff. The problem affects front-desk clerks, reviewers, and business owners, especially during peak renewal periods. The project aims to standardize records, reduce turnaround time, and improve status visibility.

A business case becomes stronger when it links the project to organizational goals, such as better public service, improved productivity, lower operational cost, stronger decision support, and improved compliance and auditability.

Managers often approve projects not because the system is "modern," but because the project is justified.
$md$, 1),
('5772a6c6-ea95-5361-8e8e-54b5af556c47','content','Business Processes and Process Improvement',$md$
A business process is a related set of activities that transforms inputs into outputs. In plain terms, it is the series of steps people follow to do work.

Examples:

- an enrollment process receives student data and outputs enrollment confirmation
- a clinic inventory process receives stock entries and outputs updated balances and alerts
- a loan approval process receives an application and outputs approval or rejection

Before designing a new system, you must understand the current process, sometimes called the **as-is** process. After improvements are proposed, you describe the **to-be** process.

When examining a process, ask:

- What starts the process?
- What steps happen?
- Who performs each step?
- What documents or data are used?
- Where do delays happen?
- Where do errors, duplicates, or rework happen?
- Which steps add value and which steps only consume time?

Common process problems include:

| Problem | Example |
|---|---|
| Redundancy | Same applicant data encoded in three offices |
| Bottleneck | Only one officer can approve every request |
| Lack of visibility | Staff cannot see the current status |
| Poor control | Transactions can be altered without trace |
| Unclear ownership | No one knows who should act next |
| Manual dependency | Many signatures and paper handoffs |

Sometimes the goal is not just automation but process improvement or even business process reengineering. Reengineering means redesigning the workflow more fundamentally instead of merely computerizing old inefficiencies.

For example:

- Bad idea: convert a six-signature paper flow into a six-screen digital flow
- Better idea: question whether all six approvals are really necessary

This is why analysts must study operations, not only screens and forms.
$md$, 2),
('5772a6c6-ea95-5361-8e8e-54b5af556c47','activity','Feasibility Analysis and Basic Financial Evaluation',$md$
A promising idea still needs to be checked for feasibility. Feasibility analysis asks whether the proposed project is realistic and worthwhile.

A common framework is **TELOS**:

| Type | Key Question |
|---|---|
| Technical | Can the needed technology be built, acquired, and supported? |
| Economic | Are the benefits worth the costs? |
| Legal | Does the project comply with law, policy, contracts, and regulations? |
| Operational | Will users and managers accept and use the system? |
| Schedule | Can it be delivered on time? |

You may also see organizational, social, or security feasibility discussed depending on the course.

### Economic feasibility

Economic feasibility compares costs and benefits.

**Possible costs:** software development or purchase, cloud hosting or hardware, training, maintenance, migration, project management effort.

**Possible benefits:** reduced clerical hours, fewer errors and rework, faster service, more accurate reporting, better customer satisfaction, reduced paper and storage cost.

Two basic computations are commonly used:

$$ \text{Net Benefit} = \text{Total Benefits} - \text{Total Costs} $$

$$ \text{ROI} = \frac{\text{Net Benefit}}{\text{Total Costs}} \times 100\% $$

If a project costs ₱500,000 and produces ₱650,000 worth of measurable benefits in a period, then:

$$ \text{Net Benefit} = 650{,}000 - 500{,}000 = 150{,}000 $$

$$ \text{ROI} = \frac{150{,}000}{500{,}000} \times 100\% = 30\% $$

A simple payback estimate is:

$$ \text{Payback Period} = \frac{\text{Project Cost}}{\text{Annual Net Benefit}} $$

A project may still be approved even if some benefits are intangible, such as stronger public trust or easier compliance. The key is to state them honestly.
$md$, 3),
('5772a6c6-ea95-5361-8e8e-54b5af556c47','activity','Practice & Exam Drills — Lesson 2',$md$
**Scope & Project Charter reminder.** Scope defines what is included and excluded; without scope control a project suffers **scope creep**. A scope statement should identify the business area, user groups, included/excluded functions, interfaces, assumptions, and constraints. A project charter usually contains title, sponsor, problem statement, objectives, scope, stakeholders, risks, schedule, and a high-level budget note.

**Review Questions**

1. What is a business case?
2. Differentiate an as-is process from a to-be process.
3. What is the purpose of feasibility analysis?
4. What does TELOS stand for?
5. Give two examples of tangible benefits and two examples of intangible benefits.
6. What is scope creep?
7. Why is it dangerous to automate a bad process without redesigning it?
8. What are common contents of a project charter?

**Worked Exam-Style Problems**

**Problem 1: Feasibility computation.** A cooperative wants a loan tracking system. Project cost: ₱420,000. Annual measurable benefit: ₱240,000. Annual operating cost after deployment: ₱40,000. Compute annual net benefit, ROI, and payback period.

*Step-by-step solution*
- Annual net benefit = 240,000 − 40,000 = **₱200,000**
- ROI (simple annual return ratio) = 200,000 / 420,000 × 100% ≈ **47.62%**. (If your professor defines ROI as net gain after recovering total cost in the same period, clarify the class formula; most classroom drills accept the simpler ratio.)
- Payback period = 420,000 / 200,000 = **2.1 years**

**Problem 2: Identify feasibility concerns.** For each issue, name the main feasibility category:
- Only three months before renewal season → **Schedule**
- Users refuse to give up their handwritten logbook → **Operational**
- Project needs server capacity the office lacks → **Technical**
- System must comply with privacy rules → **Legal**
- Estimated savings too small vs. cost → **Economic**

**Problem 3: Scope correction.** Weak scope: "The proposed resort management system will improve all operations... complete automation for all offices and all future expansion plans."
*Weaknesses:* "all operations" too broad; "complete automation" unrealistic; "all future expansion" undefined; no boundary, user group, or exclusion.
*Improved:* "The proposed resort management system will cover room reservation, guest check-in/check-out, payment recording, and occupancy reports for front-desk staff and management. It will exclude kitchen inventory, payroll, and online travel agency integration in Phase 1."

**Hands-On Practice — Municipal Permit Renewal.**
1. Write one problem statement.
2. List three tangible and three intangible benefits.
3. Perform a TELOS analysis in bullet form.
4. Write one scope statement with at least one exclusion.
5. State two major risks.

**How to Pass This Topic**

- Answer feasibility using the exact category name: technical, economic, legal, operational, schedule.
- When computing, show the formula first before substitution.
- In scope questions, include at least one sentence about what is not included.
- If the case mentions redesigning a workflow, mention business process improvement or reengineering.
- Connect the project to a real organizational goal, not just "automation."
$md$, 4);

