-- ============================================================
-- Social and Professional Issues in IT — Modules & Sections
-- Subject ID: 40000000-0004-0001-0001-000000000003
-- 4th Year, Semester 1 — major
-- 6 lessons. Split: S1+S2 = content (FREE); remaining teaching blocks + drill
--   = activity (PAID). Paid count follows each lesson's real section count:
--   L1 -> 2/2; L2-L5 -> 2/3; L6 -> 2/4.
-- No IDE playgrounds (professional-issues subject). Re-running is safe (DELETE clears prior rows).
-- ============================================================

DELETE FROM modules WHERE subject_id = '40000000-0004-0001-0001-000000000003';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('537e166b-a533-59c2-bf18-70f907dfac3c','40000000-0004-0001-0001-000000000003','Lesson 1: Professionalism and Ethics in IT','lesson-1-professionalism-and-ethics-in-it',1),
  ('254ba5a2-90e0-5a1b-84e2-060dc2f083a6','40000000-0004-0001-0001-000000000003','Lesson 2: Ethics and Decision-Making in IT','lesson-2-ethics-and-decision-making-in-it',2),
  ('b1ec0564-da59-5cc2-92ee-d4328c2a626d','40000000-0004-0001-0001-000000000003','Lesson 3: Professional Codes of Conduct','lesson-3-professional-codes-of-conduct',3),
  ('ee50e683-3e46-5f0e-82d6-3e7a7ebb3e47','40000000-0004-0001-0001-000000000003','Lesson 4: Privacy, Security, and Cyber Laws','lesson-4-privacy-security-and-cyber-laws',4),
  ('d0a396ec-b8bd-5cd9-9d59-b5d1a544b3d6','40000000-0004-0001-0001-000000000003','Lesson 5: Intellectual Property and Academic Integrity','lesson-5-intellectual-property-and-academic-integrity',5),
  ('3822c95b-e919-5f55-95c6-30a2d8c44a07','40000000-0004-0001-0001-000000000003','Lesson 6: Social and Environmental Impact of IT','lesson-6-social-and-environmental-impact-of-it',6);

-- ============================================================
-- LESSON 1: Professionalism and Ethics in IT
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('537e166b-a533-59c2-bf18-70f907dfac3c','content','What is a Profession?',$md$
A **profession** is an occupation requiring specialized education, skills, and adherence to ethical standards. IT (Information Technology) is considered a profession because practitioners (developers, administrators, analysts, etc.) must apply specialized knowledge and follow formal codes of conduct. IT professionals have responsibilities beyond just completing technical tasks. They are expected to act with **integrity, accountability, and a commitment to public welfare**.

In the Philippines, an IT professional is someone who not only writes code or manages systems, but also considers how their work affects Filipino society. For example, developing an online banking app means ensuring security and privacy for users and following Philippine laws on data protection. Entry-level IT professionals should be prepared for lifelong learning and professional growth, often by joining organizations like the Philippine Computer Society or IEEE Computer Society (Philippines Chapter). These bodies promote standards and help members stay current in the fast-changing tech field.
$md$, 1),
('537e166b-a533-59c2-bf18-70f907dfac3c','content','Core Professional Values in IT',$md$
Professional IT workers share core values that guide their behavior. These include **honesty** (being truthful about work progress or errors), **responsibility** (owning one's tasks and mistakes), **respect for privacy** (protecting user data and consent), and **fairness** (treating coworkers and users without prejudice). For example, if you discover a security bug, honesty and responsibility mean you report it rather than exploit it. Respect means you handle all data (even personal or student data) with confidentiality. These values help build public trust; Filipinos expect IT services to be reliable and safe.

**Public welfare** is also a value: IT professionals should consider the impact of technology on society. For instance, introducing a new app to rural Philippines should consider people with limited internet or electricity. Inclusive design (making technology accessible to persons with disabilities or in areas with weak infrastructure) reflects professional responsibility to society. In summary, professionalism in IT means combining technical skill with ethical judgment and a commitment to the common good.
$md$, 2),
('537e166b-a533-59c2-bf18-70f907dfac3c','activity','Professional Organizations and Certification',$md$
Belonging to a professional organization helps an IT practitioner grow ethically and technically. In the Philippines, examples include the **Philippine Computer Society (PCS)** and the **Philippine Society of IT Educators (PSITE)**. Internationally, there are the **ACM** (Association for Computing Machinery) and **IEEE Computer Society**. These organizations offer networking, training, conferences, and often a formal Code of Ethics for members.

Certification and continuing education are also part of professionalism. While not all IT fields require a license in the Philippines, certification programs (like MCSE, AWS, or local PRC licensure for some IT-related fields) demonstrate a commitment to skill and ethics. Continuous learning (online courses, workshops) shows you take responsibility for staying current. Remember, technology changes fast – being a professional means learning new tools, following best practices, and sometimes earning certifications to prove competence.

*Ready to apply this? The practice set below walks through exam-style problems with step-by-step solutions and scenario exercises.*
$md$, 3),
('537e166b-a533-59c2-bf18-70f907dfac3c','activity','Practice & Exam Drills — Lesson 1',$md$
**Review Questions**

1. What differentiates a profession from a job, and why is IT considered a profession?
2. Name three core values of an IT professional and briefly explain why each is important.
3. List two professional organizations an IT graduate can join and one benefit of each.
4. Describe one way an IT professional can show lifelong learning in their career.
5. Explain why honesty is crucial when an IT professional discovers a security flaw.

**Exam-Style Problem**

*Problem:* Maria is an IT support specialist in a government agency. She notices that a new government database is missing proper encryption, risking citizen data. She could ignore it (since it's not yet asked), try to fix it secretly, or report it to her supervisor. What should she do to adhere to professional ethics and why?

*Solution:* Maria should report the issue to her supervisor or the IT security team immediately. This demonstrates **honesty and responsibility**. According to professional ethics, she has a duty to protect public data. Ignoring or hiding the problem violates integrity and can harm citizens if the breach happens. Reporting ensures proper measures are taken, aligning with professional values of accountability and public welfare.

**Hands-On Exercise (Case Scenario)**

You are a new IT employee at a local business. Your manager asks you to install an unlicensed (pirated) software for convenience, insisting it's cheaper. Prepare a short written response (~100 words) on how you would handle this, citing professional values. (Think about honesty, legal compliance, and respect for intellectual property.)

**How to Pass Tips**

- Focus on key values: professors often ask for specific values or principles (honesty, accountability, confidentiality). Use those exact terms in answers.
- Remember local context: mention Filipino examples if possible (e.g., government data, local e-commerce).
- Review common codes of conduct: know at least that organizations like IEEE/ACM exist and have guidelines.
- Practice scenario questions: explain what you would do and why, citing ethical reasons.
$md$, 4);

-- ============================================================
-- LESSON 2: Ethics and Decision-Making in IT
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('254ba5a2-90e0-5a1b-84e2-060dc2f083a6','content','What is Ethics?',$md$
**Ethics** is the study of moral principles—what is right and wrong. In IT, ethics deals with questions like "Is it right to use data-mining on users without their consent?" Ethics differs from law: something illegal (like stealing data) is also unethical, but not all unethical acts are illegal (e.g., minor plagiarism may not be prosecuted but is still unethical). Applied ethics in IT focuses on real-world dilemmas.

Filipino culture values **"kapwa"** (togetherness) and **"utang na loob"** (debt of gratitude), which inform ethical behavior too. IT ethics may ask: How do our actions affect our kapwa (fellow citizens)? For example, if you design a game that encourages gambling behaviors, is that socially responsible? Considering these cultural values helps make ethical decisions that respect Filipino society.
$md$, 1),
('254ba5a2-90e0-5a1b-84e2-060dc2f083a6','content','Ethical Theories and Principles',$md$
Several philosophical ethical theories help frame decisions:

- **Utilitarianism (Consequentialism):** Choose the action that brings the greatest good to the majority. In IT, this might mean deploying a feature that helps many users even if a few feel inconvenienced.
- **Deontology (Duty-based ethics):** Follow universal rules or duties (like "do not lie," or "respect privacy") regardless of outcomes. For instance, refuse to falsify records even if no one might notice.
- **Virtue Ethics:** Focus on one's character (honesty, courage, compassion). Ask, "What would a virtuous IT professional do?"

In practice, IT students should learn a mix: e.g., always protect data (duty), consider overall benefit (utilitarian), and be honest/compassionate in work (virtues). Memorize at least a couple of these terms and their key idea, because exams often reference them by name.
$md$, 2),
('254ba5a2-90e0-5a1b-84e2-060dc2f083a6','activity','Decision-Making Frameworks',$md$
Ethical decision-making usually follows steps: identify the problem, list stakeholders (users, employer, society), and consider options and consequences. One framework is:

1. **Gather facts:** What data or laws apply?
2. **Consider alternatives:** What can you do? (Report, fix, ignore, etc.)
3. **Consult codes or policies:** Does an ACM/IEEE code or company policy cover this?
4. **Make and justify decision:** Explain why the chosen action best follows ethical principles.

For example, faced with a data breach, you would identify affected people (stakeholders), consider notifying them vs. hiding it, refer to the Data Privacy Act (legal/ethical duty), and decide the responsible action (likely notifying authorities and users).
$md$, 3),
('254ba5a2-90e0-5a1b-84e2-060dc2f083a6','activity','Privacy, Consent, and Respect',$md$
A key IT ethical issue is **privacy**: respecting people's personal information. Always get consent before using someone's data (e.g., ask before emailing marketing materials). Under the Philippine **Data Privacy Act (RA 10173)**, organizations must secure personal data. As a professional, never misuse data (like leaking an email list).

Another issue is **freedom of information vs. security**. For example, should you allow encrypted messaging or help law enforcement? Many factors apply, but the principle is to minimize harm while respecting laws. Understanding both the ethical principle (privacy is a value) and the law (what RA 10173 says) is important.

*Ready to apply this? The practice set below shows how to analyze ethical scenarios step-by-step, plus more problem drills.*
$md$, 4),
('254ba5a2-90e0-5a1b-84e2-060dc2f083a6','activity','Practice & Exam Drills — Lesson 2',$md$
**Review Questions**

1. Briefly define utilitarianism and deontological ethics in your own words.
2. In IT, what is typically considered the "stakeholder group" when discussing social impact?
3. List two steps in an ethical decision-making process.
4. Give an example of respecting privacy in a software project.
5. Explain why obtaining user consent is important under Philippine law.

**Exam-Style Problem**

*Problem:* A university IT staff member finds that a batch of student records (names and grades) will be sent unencrypted over email due to a deadline. Should the staff member proceed or delay sending, and why?

*Solution:* The staff member should **not** send the records unencrypted. This risks students' privacy and violates the duty to protect data. They should use encryption or ask for a secure channel. Philippine RA 10173 requires protection of personal data. By delaying to ensure security, the staff member follows both utilitarian (protecting many students) and deontological (following data protection duties) ethics.

**Hands-On Exercise (Case Scenario)**

You are designing a mobile app that collects location data. Outline in bullet points (~5) the ethical considerations you must address (consider user consent, data usage, disclosure). Explain how you would apply them in your app design.

**How to Pass Tips**

- Ethics questions often require specific theory names. Familiarize yourself with terms: utilitarian, deontology, virtue ethics, duty, outcome.
- Always relate answers to scenarios: e.g., if asked about privacy, mention RA 10173 (Data Privacy Act) or informed consent.
- Practice outlining steps: professors like seeing "Step 1: … Step 2: …".
- Study Philippine examples of tech issues (like government data leaks) — they like local context.
$md$, 5);

-- ============================================================
-- LESSON 3: Professional Codes of Conduct
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('b1ec0564-da59-5cc2-92ee-d4328c2a626d','content','Why Codes of Ethics Matter',$md$
A **code of ethics** is a formal set of guidelines for professionals. In IT, major bodies have codes (e.g., the ACM Code of Ethics, IEEE Code). These codes remind IT workers of their commitments, such as prioritizing public good over personal gain, and maintaining competence. For example, the ACM Code begins with "Contribute to society and human well-being" and "Avoid harm." An IT professional in the Philippines should be familiar with these ideals, as they often parallel Philippine values (like community welfare).

Following a code helps in tricky situations. If a cloud service has a known flaw, the code says to notify affected parties rather than hide it. If a friend asks you to cheat on a programming assignment, the code's professionalism clause means you decline. Codes aren't law, but educators expect students to understand main points: confidentiality, honesty, respect for intellectual property, and commitment to quality.
$md$, 1),
('b1ec0564-da59-5cc2-92ee-d4328c2a626d','content','Comparing Major Codes (ACM/IEEE/Local)',$md$
- **ACM (Association for Computing Machinery):** Its code has four sections: Principles (e.g., "avoid harm", "be honest"), Professional Responsibilities, Leadership Responsibilities, and Compliance. It emphasizes "honesty and trustworthiness."
- **IEEE (Institute of Electrical and Electronics Engineers) Code:** Similar focus on safety, avoiding conflicts of interest, and being truthful. It starts with "to accept responsibility in making decisions consistent with the safety, health, and welfare of the public."
- **Philippine Codes:** While there isn't a single "PRC IT code," the Philippine Computer Society (PCS) and Philippine Software Industry Association (PSIA) have guidelines encouraging integrity and social responsibility. Academically, PE and SE licenses (Engineers, Software Eng.) include clauses about public welfare.

Students should know that most codes agree on key duties: protect users, improve competence, treat colleagues fairly, and obey laws. In an exam, you might be asked to match a scenario with a relevant code principle (e.g., breach of confidentiality violates code duties).
$md$, 2),
('b1ec0564-da59-5cc2-92ee-d4328c2a626d','activity','Applying Codes to Scenarios',$md$
When faced with a dilemma, one step is to ask: "What would the code of ethics say?" For instance, if a manager wants you to cut corners on security testing to save time, the ACM Code's clause about "ensuring software quality" tells you to push back and insist on proper testing. If a contractor offers a bonus for using cheaper, pirated software, IEEE's emphasis on legality and honesty says you should refuse.

Understanding codes helps answer exam questions about specific cases. Instead of just saying "I do X", tie it to the code: e.g., "Refusing to spread rumors about a colleague upholds the IEEE Code's principle to avoid negative outcomes for others' reputations." This shows you can apply theory to practice.
$md$, 3),
('b1ec0564-da59-5cc2-92ee-d4328c2a626d','activity','Professional Responsibility Beyond the Code',$md$
Remember, codes are guidelines, but professionalism also involves personal responsibility. This means admitting mistakes (like fixing a bug proactively even if not caught), and continuous improvement (attending workshops, earning certifications). It also means mentoring juniors, sharing knowledge openly (yet responsibly), and contributing to the community's betterment (e.g., speaking at a cyber safety seminar in your barangay).

In the Philippines, **"bayanihan"** (helping community) is a cultural value. As IT professionals, embody this by volunteering tech skills or participating in initiatives (e.g., online literacy programs). This goes beyond formal codes, but exam questions sometimes expect this broader view of professional duty: service and altruism in tech fields.

*Ready to apply this? The practice set below includes scenario exercises on code violations and solving them.*
$md$, 4),
('b1ec0564-da59-5cc2-92ee-d4328c2a626d','activity','Practice & Exam Drills — Lesson 3',$md$
**Review Questions**

1. State two principles from the ACM Code of Ethics that relate to IT professionalism.
2. What is the first duty listed in the IEEE Code of Ethics (hint: it involves public welfare)?
3. Give one example of a code-of-ethics violation in an IT context.
4. Why is continuous learning considered part of professional responsibility?
5. Explain "conflict of interest" and why codes mention it.

**Exam-Style Problem**

*Problem:* A software developer learns that a proprietary library they use has a cheap clone. Their boss asks them to switch to the clone to save costs. According to professional ethics codes, what should the developer consider before switching?

*Solution:* The developer should consider that using an unlicensed or unauthorized clone likely violates intellectual property laws and the professional code (which demands legality and honesty). The ACM Code says to be honest and avoid harm – using a pirated clone could harm the original creators and risk legal trouble for the company. The IEEE Code's emphasis on public welfare also suggests we shouldn't partake in dishonest practices. Thus, the developer should refuse the request or consult higher-ups, adhering to ethical standards.

**Hands-On Exercise (Case Scenario)**

Read this scenario and draft a brief email (2–3 paragraphs) as an IT professional: "Your project manager wants to withhold information about a data breach from the client until the next update, fearing panic. You believe clients have a right to know immediately. How do you handle this situation professionally?" Include references to ethical principles or codes that support your position.

**How to Pass Tips**

- Memorize key terms: professors often mention "ACM Code", "IEEE Code", "duty to employers vs. public," etc. Use these keywords.
- Practice writing with a professional tone: in scenario responses, imagine you're drafting an email or report. Clarity and respectfulness are graded.
- Think of real-world examples: maybe a news story of a tech company's ethical lapse, and what codes were relevant.
- Identify conflicts: When asked about conflict of interest (COI), remember it means personal gain vs professional duty. An example: coding for a friend on company time is a COI.
$md$, 5);

