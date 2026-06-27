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

-- ============================================================
-- LESSON 3: Requirements Engineering and Fact-Finding
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('dee0e51b-5c73-5378-b28e-4f9bd998cbf2','content','Functional and Nonfunctional Requirements',$md$
A requirement is a condition or capability needed by users or the organization. Requirements must be clear enough that the team can design, build, and test the system correctly.

Two major categories appear often in exams.

### Functional requirements

These describe **what the system should do**. Examples:

- The system shall allow students to book clinic appointments.
- The system shall generate daily inventory reports.
- The system shall send an approval notification to the applicant.

Functional requirements are about services, tasks, and behavior.

### Nonfunctional requirements

These describe **how well** the system should perform or under what conditions it should operate. Examples:

- The system shall respond to search queries within 3 seconds.
- The system shall be available from 7:00 AM to 7:00 PM on weekdays.
- The system shall restrict access using role-based permissions.
- The system shall support mobile viewing on standard smartphone browsers.

Nonfunctional requirements often cover:

| Area | Sample focus |
|---|---|
| Performance | speed, throughput, response time |
| Security | authentication, authorization, logging |
| Reliability | uptime, fault tolerance, backup |
| Usability | ease of learning, accessibility |
| Maintainability | modularity, ease of update |
| Compatibility | browser, OS, device support |
| Legal and policy | privacy, retention, audit trails |

Another important item is the **business rule** — a policy or condition that shapes the system. Examples:

- A student cannot enroll with an unsettled balance.
- Only the department head can approve bulk inventory adjustments.
- A loan request above ₱50,000 requires two levels of approval.

Business rules are not optional details. They often decide whether the system is acceptable in real operations.
$md$, 1),
('dee0e51b-5c73-5378-b28e-4f9bd998cbf2','content','Fact-Finding Techniques for Eliciting Requirements',$md$
Requirements do not appear by magic. They are gathered through fact-finding, also called elicitation.

### Interview
Direct conversation with users or managers. **Best for:** deep understanding, clarifying exceptions, learning pain points and priorities. **Tips:** prepare questions, ask about actual work (not only desired features), confirm understanding before ending.

### Observation
Watch how work is actually performed. **Best for:** detecting real behavior, exposing hidden workarounds, identifying delays. Users sometimes forget steps they do automatically; observation catches those.

### Questionnaire or survey
Useful when many respondents are involved. **Best for:** quick gathering of preferences, measuring common issues, structured responses.

### Document analysis
Review forms, reports, manuals, spreadsheets, logs, and policies. **Best for:** understanding data fields, identifying current outputs, finding compliance rules.

### Workshop or JAD-style session
A structured meeting with users, managers, and analysts. **Best for:** resolving conflicts, speeding up requirement agreement, producing shared understanding.

### Prototyping
Show a draft screen or workflow and collect reactions. **Best for:** interface-heavy systems; users who find it easier to react than to describe.

A strong analyst usually combines methods. For example, interviews plus document review plus observation often produce more reliable requirements than any single method alone.
$md$, 2),
('dee0e51b-5c73-5378-b28e-4f9bd998cbf2','activity','Writing, Organizing, and Validating Requirements',$md$
Good requirements should be clear, necessary, testable, and consistent.

Avoid vague statements like: *the system should be user-friendly; the system should be fast; the system should be secure.* These are too weak unless made measurable or more specific.

Better versions:

- New users shall complete appointment booking in no more than 4 screens.
- The system shall return search results within 3 seconds for up to 5,000 active records.
- The system shall log failed login attempts and lock the account after 5 consecutive failures.

A practical checklist for requirement quality:

| Question | Why it matters |
|---|---|
| Is it clear? | avoids multiple interpretations |
| Is it testable? | lets QA verify compliance |
| Is it necessary? | removes useless features |
| Is it feasible? | respects constraints |
| Is it consistent? | avoids contradiction |
| Is it traceable? | links back to stakeholder needs |

Requirements are often organized in a document such as an **SRS (Software Requirements Specification)**. Even if your class does not require a formal SRS, your output usually includes: system overview, stakeholder list, functional requirements, nonfunctional requirements, business rules, assumptions and constraints, acceptance criteria.

Validation means checking whether the requirements are truly correct. Typical validation actions: review with users, walkthroughs, prototype review, conflict resolution meetings, checking against policy or law, checking completeness against process steps.
$md$, 3),
('dee0e51b-5c73-5378-b28e-4f9bd998cbf2','activity','Practice & Exam Drills — Lesson 3',$md$
**Prioritization, traceability & change control reminder.** Prioritize with MoSCoW: Must-have (core), Should-have (important), Could-have (if time allows), Won't-have-for-now (deferred). Traceability connects a requirement back to its source and forward to design, implementation, and test (stakeholder complaint → requirement → design element → test case). Change is normal; *uncontrolled* change is the problem — a healthy process asks what changed, why, who requested it, the impact, and whether to approve now or defer.

**Review Questions**

1. What is the difference between functional and nonfunctional requirements?
2. Give three examples of business rules.
3. When is observation better than interview?
4. Why is document analysis useful during fact-finding?
5. What makes a requirement testable?
6. What is traceability?
7. Why do teams prioritize requirements?
8. What is uncontrolled change in requirements?

**Worked Exam-Style Problems**

**Problem 1: Classify each statement** as Functional Requirement, Nonfunctional Requirement, or Business Rule.
- "allow librarians to record book returns" → **Functional Requirement**
- "support up to 200 concurrent users during enrollment week" → **Nonfunctional Requirement** (capacity/performance)
- "a student with an active disciplinary hold cannot generate clearance" → **Business Rule**
- "back up transaction data every night at 10:00 PM" → **Nonfunctional Requirement** (operational reliability/control)
- "only accounting staff can reverse payment entries" → **Business Rule**

**Problem 2: Improve vague requirements.**
- "The system should be fast." → *The system shall display search results within 3 seconds for common queries.*
- "The system should be secure." → *The system shall require authenticated login and shall record all failed login attempts.*
- "The system should be easy to use." → *New users shall complete reservation submission using no more than 5 screens and without technical assistance.*

**Problem 3: Select elicitation techniques.** A school clinic wants a new patient logging system. The nurse performs undocumented shortcuts during busy days; the doctor wants better reports.
*Answer:* prioritize **Observation** (capture undocumented shortcuts), **Interview** with nurse and doctor (pain points and report needs), **Document analysis** of current forms/logs, and an optional prototype review later. The case mixes hidden actual practice with stated managerial needs.

**Hands-On Practice — Dormitory maintenance request system.**
1. Write five interview questions for students.
2. Write five interview questions for the maintenance supervisor.
3. List six functional requirements.
4. List four nonfunctional requirements.
5. Mark each functional requirement as Must-have, Should-have, or Could-have.

**How to Pass This Topic**

- Permissions and policy restrictions are often business rules.
- Do not write nonfunctional requirements as vague adjectives.
- In interview questions, avoid yes/no questions unless confirming facts.
- Use verbs such as record, generate, validate, notify, approve, restrict, display.
- If a requirement cannot be checked by a tester, improve it.
$md$, 4);

-- ============================================================
-- LESSON 4: Structured Analysis and Data Modeling
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('82df723c-7208-515c-81a2-3c46bc4bd44b','content','Context Diagrams and Data Flow Diagrams',$md$
Structured analysis focuses on representing how data moves through a system and how processes transform that data.

A **context diagram** shows the system as a single process and identifies external entities, major data inputs, and major data outputs. It gives the highest-level view.

Example for a clearance system:

- External entities: Student, Registrar, Cashier, Department Office
- Inputs: clearance request, payment confirmation, approval decision
- Outputs: status update, clearance result

A **Data Flow Diagram (DFD)** breaks the system into smaller processes. It usually contains:

| Symbol idea | Meaning |
|---|---|
| Process | transforms input data into output data |
| Data flow | movement of data between components |
| Data store | saved data |
| External entity | outside actor interacting with the system |

### Levels of DFD

- **Context diagram:** whole system as one process
- **Level 0 DFD:** major subprocesses
- **Lower-level DFDs:** more detailed decomposition of one process

Example Level 0 processes for a clinic system: Manage patient records; Schedule appointments; Issue medicines; Generate reports.

### Rules to remember

- Every process should have at least one input and one output.
- Data should not move directly from one external entity to another inside the model.
- Data should not move directly from one data store to another without a process.
- Lower-level DFDs should remain consistent with higher-level ones. This is called **balancing**.

DFDs are useful because they force you to think about the actual movement of information, not just screens.
$md$, 1),
('82df723c-7208-515c-81a2-3c46bc4bd44b','content','Data Dictionary and Process Specifications',$md$
A DFD shows movement, but it does not fully define each data item. That is why analysts also prepare a **data dictionary** — a description of the meaning of data elements, records, and structures.

Example:

| Data element | Meaning |
|---|---|
| Student_ID | unique identifier of enrolled student |
| Clearance_Status | current stage of approval |
| Request_Date | date when request was submitted |
| Approved_By | officer who finalized the action |

A stronger dictionary may also include type, format, allowed values, source, destination, and validation rule.

### Process specification

Some DFD processes are simple enough to understand from the title alone. Others need more explanation. A **process specification** describes the internal logic of a process, written using structured English, decision tables, decision trees, or simple algorithmic steps.

Example using structured English:

1. Receive clearance request.
2. Verify student identity.
3. Retrieve balance and disciplinary records.
4. If all units are clear, mark as approved.
5. Otherwise, return pending requirements list.

This helps developers and testers understand what the process is supposed to do before code is written.
$md$, 2),
('82df723c-7208-515c-81a2-3c46bc4bd44b','activity','Entity Relationship Diagrams and Normalization',$md$
Where DFDs focus on process and data movement, an **Entity Relationship Diagram (ERD)** focuses on data structure.

An ERD usually identifies:

- **entities** such as Student, Payment, Appointment, Item
- **attributes** such as StudentName, DatePaid, Quantity
- **relationships** such as Student requests Clearance

A good entity is something the organization needs to store information about repeatedly.

### Example — clinic appointment system

Entities: Student, Appointment, Nurse, Medicine, Medicine_Issue.

Possible relationships:

- A Student can have many Appointments.
- A Nurse handles many Appointments.
- An Appointment may result in many Medicine_Issue records.

### Normalization

Normalization organizes data to reduce redundancy and update problems. At a basic level:

- **First Normal Form:** atomic values, no repeating groups
- **Second Normal Form:** non-key attributes depend on the whole key
- **Third Normal Form:** non-key attributes do not depend on other non-key attributes

Simple exam reminder: if one table mixes student info, course info, and instructor info repeatedly, it may need decomposition. The goal is to reduce anomalies in insertion, update, and deletion.

ERDs are especially important because many professors connect Systems Analysis and Design with earlier database subjects. They expect you to show that a process model and a data model agree with each other.
$md$, 3),
('82df723c-7208-515c-81a2-3c46bc4bd44b','activity','Practice & Exam Drills — Lesson 4',$md$
**Model quality & balancing reminder.** Common DFD errors: process with inputs but no outputs (or vice versa); vague data-flow names like "information"; data store with no process interaction; lower-level DFD not matching higher-level flow names; actor/process names confused. Common ERD errors: an "entity" that is really a report; attributes mixed across entities; missing/unreasonable cardinality; carelessly stored derived values; unclear key. **Balancing** means the data flows entering/leaving a process at a higher level stay consistent when that process is decomposed.

**Review Questions**

1. What is the purpose of a context diagram?
2. Differentiate a context diagram from a Level 0 DFD.
3. What is a data dictionary?
4. Why are process specifications needed?
5. What is an ERD used for?
6. State the purpose of normalization.
7. What does balancing mean in DFDs?
8. Give two common errors in ERD construction.

**Worked Exam-Style Problems**

**Problem 1: Build a textual context diagram.** A library borrowing system: students borrow books; the librarian records borrowing and return transactions; the system sends due-date info to students and produces inventory updates for the librarian.
*Answer:*
- External entities: Student, Librarian
- Inputs: borrow request, return details, transaction entry
- Outputs: due-date information, inventory update, confirmation

**Problem 2: Convert requirements into a Level 0 DFD structure.** Given: users submit maintenance requests; staff review and assign; technicians update repair status; management receives summary reports.
*Possible processes:* Receive Maintenance Request; Review and Assign Request; Update Repair Status; Generate Management Reports.
*Possible data stores:* Request Records; Technician Records; Status History.

**Problem 3: Spot the normalization issue.** Table: `RequestID, StudentName, Course, AdviserName, AdviserEmail` (a student may submit many requests).
*Problem:* StudentName/Course repeat across requests; AdviserName/AdviserEmail repeat for the same adviser.
*Better decomposition:*
- Student(StudentID, StudentName, Course, AdviserID)
- Adviser(AdviserID, AdviserName, AdviserEmail)
- Request(RequestID, StudentID, RequestDate, Status)

**Hands-On Practice — Student Clearance System.**
1. A context diagram in words (entities + data flows).
2. A Level 0 DFD as numbered processes and data stores.
3. A mini data dictionary with at least eight fields.
4. A text-based ERD (entities, keys, relationships).
5. Identify one possible normalization problem in the current manual record.

**How to Pass This Topic**

- Name data flows precisely: Request Form, Approval Result, Payment Record — not vague "data."
- Processes should start with verbs: Validate Request, Generate Report, Update Status.
- In ERD questions, identify entities before drawing relationships.
- If unsure about full normalization, at least explain the redundancy clearly.
- Many professors give partial credit for logically consistent textual models even if the diagram is not artistically perfect.
$md$, 4);

-- ============================================================
-- LESSON 5: Object-Oriented Analysis and UML
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('d71a716c-2be0-5dd8-9175-8a9e8e741e4a','content','From Structured Analysis to Object-Oriented Thinking',$md$
Structured analysis models processes and data flows. Object-oriented analysis models the system as a set of objects, responsibilities, and interactions.

In object-oriented thinking, we focus on things such as users, records, transactions, services, and items handled by the system. These become **classes** or **objects** with attributes, operations (methods), and relationships to other classes.

Core object-oriented ideas include:

| Concept | Meaning |
|---|---|
| Class | blueprint for similar objects |
| Object | actual instance of a class |
| Attribute | data owned by an object |
| Method | action performed by an object |
| Encapsulation | bundling data and behavior together |
| Inheritance | one class extends another |
| Association | classes are related |
| Polymorphism | one interface, different implementations |

In Systems Analysis and Design, you do not need to code every class. What matters first is learning how to describe the problem domain in an organized, reusable way.

Example: in an appointment system, common classes may include Student, Appointment, ClinicStaff, and Prescription. Instead of thinking only about "Process Appointment," OO analysis asks:

- What does an Appointment know?
- What actions can an Appointment perform or trigger?
- Which class owns reschedule logic?
- What is the relationship between Student and Appointment?

This helps when the project will later be implemented using object-oriented programming.
$md$, 1),
('d71a716c-2be0-5dd8-9175-8a9e8e741e4a','content','Use Case Modeling',$md$
A use case describes how an actor interacts with the system to achieve a goal.

Common parts of a use case: Actor, Goal, Precondition, Main flow, Alternative flow, Postcondition.

Example use case title: **Submit Maintenance Request**

- **Actor:** Student Resident
- **Goal:** report a maintenance issue
- **Precondition:** resident account is active
- **Main flow:** logs in → enters issue details → submits request → system records request
- **Alternative flow:** required field missing → system prompts correction
- **Postcondition:** request is saved and reference number is generated

### Use case diagram basics

A use case diagram usually shows actors outside the system, use cases inside the system boundary, and relationships between them.

Sample use cases in a permit renewal system: Submit Renewal Application; Verify Documents; Assess Fees; Approve Application; View Application Status; Generate Daily Report.

Use case modeling is especially helpful because it translates stakeholder needs into system behavior without jumping too quickly into database or code details.
$md$, 2),
('d71a716c-2be0-5dd8-9175-8a9e8e741e4a','activity','Class, Sequence, and Activity Modeling',$md$
A **class diagram** shows the structure of classes and their relationships. A class may include name, attributes, and operations.

Example:

- **Applicant:** applicantID, name, contactNumber, submitApplication()
- **Application:** applicationID, dateSubmitted, status, computeFees()

### Identifying candidate classes

Read the case and mark important nouns, then screen them. Candidates: person roles, business records, transactions, resources, documents. But not every noun becomes a class — "screen," "button," or "office" may not belong in the core model unless central. Ask: Does the system need to remember information about it? Does it have distinct attributes? Does it participate in important relationships? Does it perform meaningful responsibilities?

### Sequence diagram

Shows how objects interact in time order (actor, participating objects, messages, top-to-bottom order). Example for online booking: Student sends bookAppointment() → AppointmentController validates data → ScheduleService checks slot → Database saves appointment → ConfirmationService sends notice. Good for analyzing message flow and validating logic.

### Activity diagram

Shows workflow, decisions, and alternative paths. Useful for step-by-step process logic, decisions/branching, parallel activities, and approval flow. Example: Receive request → Check completeness → if incomplete, return to applicant → if complete, route for approval → Record decision → Notify applicant.

### Choosing the right model

- **Use case diagram** for user goals
- **Class diagram** for structure
- **Sequence diagram** for interactions
- **Activity diagram** for workflow logic

A good analysis output does not use every diagram possible. It chooses the diagrams that best clarify the case.
$md$, 3),
('d71a716c-2be0-5dd8-9175-8a9e8e741e4a','activity','Practice & Exam Drills — Lesson 5',$md$
**Review Questions**

1. What is the difference between an object and a class?
2. What is encapsulation?
3. What is the purpose of a use case?
4. What parts are normally included in a basic use case description?
5. How does a class diagram differ from a sequence diagram?
6. When is an activity diagram useful?
7. Give one example of inheritance and one example of association.
8. Why is object-oriented analysis useful before implementation?

**Worked Exam-Style Problems**

**Problem 1: Identify actors and use cases.** A food delivery startup: customers place orders, riders accept deliveries, administrators manage the menu and monitor completed transactions.
*Actors:* Customer, Rider, Administrator.
*Likely use cases:* Place Order; Track Order; Accept Delivery Job; Update Delivery Status; Manage Menu; View Completed Transactions.

**Problem 2: Identify candidate classes** from the same case. Important nouns that carry data and participate in relationships: **Customer, Order, Rider, MenuItem, Payment, Delivery.**

**Problem 3: Choose the correct UML diagram.**
| Task | Best UML diagram |
|---|---|
| interaction during checkout | Sequence Diagram |
| workflow for approval | Activity Diagram |
| classes and relationships | Class Diagram |
| user goals | Use Case Diagram |

**Hands-On Practice — Dormitory Visitor Pass System.**
1. List three actors.
2. Write four use cases.
3. Draft one fully dressed mini use case (precondition, main flow, postcondition).
4. Identify five candidate classes.
5. Describe in words one sequence flow for "Issue Visitor Pass."

**How to Pass This Topic**

- Use verbs for use case names: Register User, Generate Report, Approve Request.
- Use nouns for class names: Student, Invoice, Reservation.
- Do not confuse a process step with a class.
- To justify a diagram choice, say what it shows: goal, structure, interaction, or workflow.
- Even in text-only exams, score well by listing actors, relationships, and message flow clearly.
$md$, 4);

-- ============================================================
-- LESSON 6: Systems Design
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('7793b931-b0db-57bf-adc8-31729fc28bde','content','From Analysis to Design and Architectural Decisions',$md$
Once requirements are clear, the next question is: How should the system be built? That is the job of design.

System design translates analysis outputs into implementable decisions. It covers architecture, data storage, interface design, controls, validation, module structure, and integration.

A sound design should be:

- correct with respect to requirements
- simple enough to understand and maintain
- modular so parts can change without breaking everything
- secure enough for the risk level
- usable for the target users
- scalable enough for expected growth

### Architectural choices

At the classroom level, you usually compare broad architectures:

| Design choice | Typical use |
|---|---|
| Standalone desktop | single office or local use |
| Client-server | controlled institutional environment |
| Web-based | browser access across many users |
| Mobile-supported | field access, convenience, notifications |
| Cloud-hosted | scalability and remote accessibility |

A practical design answer should justify architecture using context. For example:

- A barangay office with multiple service windows may prefer a web-based local network system.
- A student appointment system may prefer a web-based platform with mobile-friendly screens.
- A small office with one workstation may still use a standalone desktop system if the scope is limited.

Do not choose architecture only because it sounds modern. Choose it because it fits the project's users, environment, and constraints.
$md$, 1),
('7793b931-b0db-57bf-adc8-31729fc28bde','content','Database, File, Component, and Interface Design',$md$
Design also decides how information will be stored and how modules will be separated.

### Database design

This usually comes from the ERD and normalization work done earlier. At design stage, you now think about tables and keys, constraints, indexes, transaction integrity, and archival/backup needs. A weak database design can cause duplicate records, slow queries, broken reports, and inconsistent updates.

### File and record considerations

Some systems still export or import files such as CSV, PDF reports, spreadsheet uploads, and official printable forms. A complete design states which outputs are on-screen only, printable, downloadable, or sent through email/SMS integration.

### Component or module design

A system is rarely one giant block. It is usually divided into modules — for example: user management, transaction processing, reporting, notification, inventory, audit log. Name components by major responsibilities. Example for a clinic system: Appointment Module, Patient Record Module, Medicine Inventory Module, Reporting Module, Access Control Module. The design should also decide which modules interact and what data they exchange.

### Input and output design

**Input design** focuses on correct, efficient data entry: ask only for needed data, use clear labels, group related fields, reduce repetitive encoding, validate early, use appropriate controls (dropdowns, date pickers, checkboxes). Good examples: restricting dates to valid ranges, requiring a reference number format, auto-filling known details, confirming destructive actions.

**Output design** includes receipts, reports, dashboards, notifications, approval slips, history logs. Managers usually want summarized reports; front-line staff often need transaction-level detail.

A useful interface is consistent, readable, efficient, forgiving of mistakes, and accessible to beginners. In many BSIT courses, UI design connects closely with HCI — consider learnability, feedback, and error prevention, not only appearance.
$md$, 2),
('7793b931-b0db-57bf-adc8-31729fc28bde','activity','Controls, Security, and Design Quality',$md$
System design must include controls. A system that looks polished but lacks controls will fail in real operations.

### Common controls

| Control type | Example |
|---|---|
| Validation control | required field, type check, range check |
| Access control | role-based permissions |
| Audit control | timestamps and action logs |
| Recovery control | backup and restore procedures |
| Concurrency control | preventing conflicting updates |
| Error handling | meaningful error messages and retry logic |

### Security design questions

- Who can view which records?
- Who can approve, edit, or delete?
- Are sensitive fields encrypted or protected?
- Are user actions logged?
- How are passwords managed?
- How is backup handled?

For Philippine academic and organizational settings, this is especially important when dealing with student data, medical information, payroll records, citizen requests, and financial transactions.

### Design quality reminder

If asked to evaluate a design, comment on correctness, usability, maintainability, performance, security, and scalability. A good design is not only attractive. It is also defensible.
$md$, 3),
('7793b931-b0db-57bf-adc8-31729fc28bde','activity','Practice & Exam Drills — Lesson 6',$md$
**Review Questions**

1. What is the difference between analysis and design?
2. Give three factors in choosing system architecture.
3. Why is modular design important?
4. State three principles of good input design.
5. How does output design differ for managers and front-line staff?
6. What is role-based access control?
7. Give examples of validation controls.
8. Why are audit trails important?

**Worked Exam-Style Problems**

**Problem 1: Choose a suitable architecture.** A university clinic needs access from the nurse station, doctor room, and student devices for booking; it should support notifications and reporting.
*Step-by-step:* multiple locations + students need access + centralized reporting. Standalone is too limited; client-server is less convenient for students.
*Answer:* a **web-based architecture with a mobile-friendly interface** — centralized data, multiple clinic users, student self-service, easier remote access.

**Problem 2: Critique the form design.** An employee-submitted leave-request form asks for Employee Name, Employee ID, Department, Date Filed, Leave Start, Leave End, Reason, Approver Name, Approval Date, Approval Signature Upload.
*Two poor choices:* (1) **Approver Name** should not be entered by the employee — it is system-selected or role-assigned. (2) **Approval Date** and **Approval Signature Upload** belong to the approval stage, not the employee's initial submission. The form mixes applicant inputs with approver-side data.

**Problem 3: Recommend controls.** A cashiering system lets staff edit payment entries.
*Controls:* role-based access (only authorized staff can edit); audit log (who changed what and when); confirmation prompt before saving; reason-for-change field; optional supervisor approval for high-value edits.

**Hands-On Practice — Cooperative Membership System.**
1. Recommend an architecture and justify it.
2. List five system modules.
3. Design a text-based input form with field labels and validation notes.
4. List three reports and their target users.
5. Recommend five controls for security and reliability.

**How to Pass This Topic**

- Justify every design choice with users, scale, and constraints.
- Input/output questions are practical — think like a real user.
- If the case involves sensitive data, always mention access control, logging, and backup.
- Use the words modular, maintainable, consistent, validated in design evaluations.
- Explain *why* a design choice is better, not just *what* you chose.
$md$, 4);

