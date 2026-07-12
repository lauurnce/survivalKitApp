-- ============================================================
-- Social and Professional Issues in IT, Modules & Sections
-- Subject ID: 40000000-0004-0001-0001-000000000003
-- 4th Year, Semester 1, major
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
('537e166b-a533-59c2-bf18-70f907dfac3c','activity','Practice & Exam Drills, Lesson 1',$md$
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
**Ethics** is the study of moral principles, what is right and wrong. In IT, ethics deals with questions like "Is it right to use data-mining on users without their consent?" Ethics differs from law: something illegal (like stealing data) is also unethical, but not all unethical acts are illegal (e.g., minor plagiarism may not be prosecuted but is still unethical). Applied ethics in IT focuses on real-world dilemmas.

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
('254ba5a2-90e0-5a1b-84e2-060dc2f083a6','activity','Practice & Exam Drills, Lesson 2',$md$
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
- Study Philippine examples of tech issues (like government data leaks), they like local context.
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
('b1ec0564-da59-5cc2-92ee-d4328c2a626d','activity','Practice & Exam Drills, Lesson 3',$md$
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

-- ============================================================
-- LESSON 4: Privacy, Security, and Cyber Laws
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('ee50e683-3e46-5f0e-82d6-3e7a7ebb3e47','content','Data Privacy and Personal Information',$md$
Privacy is a major social issue in IT. In the Philippines, the **Data Privacy Act (RA 10173)** protects personal data. This means businesses and apps must collect consent for data, secure it, and allow access or correction on request. As a student, this translates to everyday practices: never share classmates' personal data without permission, and be careful posting private info on social media.

IT systems should only ask for data that is necessary. For instance, a public Wi-Fi app that tracks your location and web history raises privacy flags. Always think: *Am I respecting the user's rights?* Realize that Filipinos value privacy but also share a lot on social media. Professional IT practice balances these: build opt-in features (users choose to share) and clear privacy notices. In exams, you may be asked what RA 10173 requires – know it's about consent, security, and accountability for personal data.
$md$, 1),
('ee50e683-3e46-5f0e-82d6-3e7a7ebb3e47','content','Cybercrime and Security Measures',$md$
Cybercrime (**RA 10175**) covers offenses like hacking, phishing, cybersex, identity theft, and libel online. As IT professionals, you must secure systems against these crimes. For example, using strong passwords and updates to prevent hacking, educating colleagues about phishing emails, and never engaging in hacking.

One question might describe a scenario (like discovering a colleague used a weak password and got hacked). You should mention security best practices: information **confidentiality** (encrypt important files), **integrity** (check data for tampering), and **availability** (backups). Remember the triad **CIA** (Confidentiality, Integrity, Availability) – many exam questions expect you to mention this for security issues. Also recall local context: the Cybercrime law in the Philippines expanded scope (e.g., includes child pornography, hate speech online) which you can mention if relevant.
$md$, 2),
('ee50e683-3e46-5f0e-82d6-3e7a7ebb3e47','activity','Ethical Hacking and Disclosure',$md$
Sometimes a hacker finds a vulnerability in a system; ethical codes call this **responsible disclosure**. Non-disclosure (keeping it secret) may protect image but risks user security. Responsible disclosure (alerting the vendor and giving time to fix) aligns with ethical duty to prevent harm.

For IT students, know that vulnerability disclosure policies exist. In a professional exam question, you might compare **full disclosure** (publish bug publicly, pressuring a fix quickly) vs **non-disclosure** (keeping quiet). Generally, the ethical middle path is responsible disclosure: work with the vendor discreetly. Citing real hackers who did this (like Google's Project Zero) can earn bonus points if asked for examples.
$md$, 3),
('ee50e683-3e46-5f0e-82d6-3e7a7ebb3e47','activity','Social Networking and Online Conduct',$md$
Social media ethics is a big social issue. As an IT professional, your personal use of social networks reflects on your profession. For example, cyberbullying or posting illegal content can get professionals in trouble. Even in personal contexts, be mindful of **Netiquette** and the privacy of others.

Employers often check social media of candidates, so professionalism extends online. For exams: know that even though writing a tweet isn't "coding," it's often covered under Social & Professional Issues. A classic question: "Is it ethical for a developer to comment negatively about a competitor online?" The answer usually cites respectful communication and not defaming others, as per professional codes. Mentioning cyberbullying laws or company social media policies can show depth.

*Ready to apply this? The practice set below includes problem scenarios on applying laws and best practices in real situations.*
$md$, 4),
('ee50e683-3e46-5f0e-82d6-3e7a7ebb3e47','activity','Practice & Exam Drills, Lesson 4',$md$
**Review Questions**

1. What are the three main pillars of information security (the CIA triad)?
2. Under RA 10173, what rights do data subjects have? (List two.)
3. Give an example of a cybercrime under RA 10175.
4. Why is encryption important when transmitting sensitive data?
5. Describe responsible disclosure in one sentence.

**Exam-Style Problem**

*Problem:* A programmer learns of a bug that could allow unauthorized data access on the university portal. The semester is ending; reporting it now means delaying final grades. What is the ethical action?

*Solution:* The programmer should report the bug immediately. Student data privacy and system security are more important than convenience. By disclosing the issue (preferably following responsible disclosure: telling the admin privately), the programmer prevents potential harm. It aligns with professional duty and legal expectations (keeping systems secure is an obligation under laws like RA 10173, which holds data controllers accountable for breaches).

**Hands-On Exercise (Case Scenario)**

You run a small online store (simulation exercise). You collect customer emails for receipts. Outline a simple privacy policy (3–4 sentences) stating how you will use and protect customer data, according to ethical and legal standards. Include what data you collect, why, and how you secure it.

**How to Pass Tips**

- Laws and acts often come up by name. Remember the exact numbers (RA 10173 Data Privacy Act, RA 10175 Cybercrime Law, RA 8293 IP Code).
- For the CIA triad: it's a fundamental concept. Show examples (e.g., confidentiality via encryption).
- Mention encryption, firewalls, anti-virus as part of security solutions.
- When answering scenario questions, clearly separate legal obligations (what the law says) from ethical duties (best practices), e.g. "By law, we must… and ethically we should…."
$md$, 5);

-- ============================================================
-- LESSON 5: Intellectual Property and Academic Integrity
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('d0a396ec-b8bd-5cd9-9d59-b5d1a544b3d6','content','Understanding Intellectual Property (IP)',$md$
**Intellectual Property (IP)** refers to creations of the mind: software, books, music, etc. The Philippine **IP Code (RA 8293)** covers patents, trademarks, and copyrights. For IT, copyright is key: software code is automatically copyrighted, and copying it without permission is infringement.

IT professionals must respect IP. This means using licensed software (even if a friend says "it's easy to just download"), and giving credit when reusing code (either through licenses like MIT/BSD or by citing sources). For example, using an open-source library is fine if you follow its license (GPL, Apache, MIT, etc.), but using paid software without a license is illegal. On exams, students might face questions like "What makes software proprietary vs open-source?" or "Is it ethical to share your school project code with others?" The answer should mention licenses and give credit, showing an understanding of IP principles.
$md$, 1),
('d0a396ec-b8bd-5cd9-9d59-b5d1a544b3d6','content','Types of Software Licenses',$md$
There are many licenses, but in BSIT classes know two broad categories: **proprietary vs open-source**. Proprietary (closed-source) software (like Microsoft Office) requires buying a license. Open-source (like Linux, MySQL, Apache) is free to use, modify, and share, often with conditions (GPL requires sharing changes, MIT/BSD are more permissive).

In practice questions, you may be asked to pick a license for a student project. If sharing code and not wanting others to patent it, MIT/BSD are common for student apps. If you want to ensure changes stay open, GPL. Understand the idea: GPL "copyleft" means anyone who distributes your modified code must also share the source. At least memorize that open-source licenses exist and have basic differences.
$md$, 2),
('d0a396ec-b8bd-5cd9-9d59-b5d1a544b3d6','activity','Copyright vs. Plagiarism',$md$
In an academic context, copying code or text without permission or attribution is both an IP violation and unethical **plagiarism**. Filipino universities treat plagiarism seriously (some even have it in honor codes). Always write your own code or properly cite libraries.

Also distinguish **fair use**: quoting a short text in a report is okay, but copying large segments is not. Similarly, for code: if using snippets from StackOverflow or tutorials, be sure to understand them and comment that they are from X source. Exams might ask for examples of plagiarism vs fair use. A tip is to reference actual Philippine rules: some universities mention a maximum percentage of similarity allowed.
$md$, 3),
('d0a396ec-b8bd-5cd9-9d59-b5d1a544b3d6','activity','Consequences and Legal Issues',$md$
Violating IP rights can lead to fines or jail under Philippine law. For example, selling pirated DVDs or software breaches RA 8293, and there have been cases of raids on shops selling illegal copies. As future IT pros, you might also create content (apps, designs) that you should protect (through copyright or trademarks).

Understand also **digital rights management (DRM)** from a consumer perspective: circumventing DRM to copy a DVD can be illegal. If an exam mentions peer-to-peer networks and piracy, remember that even if "everyone does it," it's against the law. As a professional, the ethical stance is to discourage piracy (e.g. advising small businesses to use free open-source tools instead of pirated software).

*Ready to apply this? The practice set below includes exercises on licensing decisions and IP case studies.*
$md$, 4),
('d0a396ec-b8bd-5cd9-9d59-b5d1a544b3d6','activity','Practice & Exam Drills, Lesson 5',$md$
**Review Questions**

1. What are the three main categories of intellectual property protected by law?
2. Explain the difference between open-source and proprietary software.
3. Give an example of plagiarism in programming.
4. Which Philippine law covers software piracy, and what does it protect?
5. Name one advantage and one responsibility when using open-source code.

**Exam-Style Problem**

*Problem:* You found a helpful snippet on a public code repository (shared by someone else) and want to use it in your assignment. What should you do to use it ethically and legally?

*Solution:* First, check the snippet's license. If it's open-source (e.g., MIT license), you can usually use it, but you should still attribute the original author in your code comments or report. If no license is given, the safe approach is to re-implement the idea in your own words/code. In any case, include a comment saying it was adapted from source Y. This avoids plagiarism and respects intellectual property. It follows ethical practice of giving credit and any legal requirements of the license.

**Hands-On Exercise (Case Scenario)**

Imagine your group project is to develop a quiz app. You find a free icon library online for the UI. What steps do you take to ensure you're complying with the license? (List 3 bullet points, e.g., check license type, provide attribution, etc.)

**How to Pass Tips**

- Always answer in terms of laws or formal terms: use "copyright," "license," "permitted use."
- Remember exam keywords: "piracy," "royalty," "patent."
- Be precise: say "RA 8293" instead of just "copyright law" if possible.
- For plagiarism questions, referencing specific examples (like copying code or assignments) shows understanding.
- When discussing open-source, mention one famous license by name (e.g., GPL, MIT) to illustrate knowledge.
$md$, 5);

-- ============================================================
-- LESSON 6: Social and Environmental Impact of IT
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('3822c95b-e919-5f55-95c6-30a2d8c44a07','content','Digital Divide and Access',$md$
Not everyone has equal access to technology. The **digital divide** is the gap between those who have internet/computers and those who do not. In the Philippines, many rural areas still struggle with connectivity. As future IT professionals, understanding this is important. For example, when building a website or app for all Filipinos, you might make it mobile-friendly and low-bandwidth so people with slower connections can still use it.

Discussing the social impact, one should also note government initiatives (such as the DICT's free Wi-Fi in public areas) and community internet programs. In exams, you might analyze how IT projects can either widen or help bridge this divide. A question might ask for ideas on increasing e-learning access during the pandemic, citing examples like using radio or TV lessons (as the Philippine Department of Education did) shows cultural context.
$md$, 1),
('3822c95b-e919-5f55-95c6-30a2d8c44a07','content','E-Waste and Sustainability',$md$
Technology has an environmental side too. Discarded computers, phones, and servers contribute to **electronic waste (e-waste)**, which can be toxic. A professional issue is to promote sustainable practices: recycling old gadgets, or designing devices that last longer. For instance, as a software engineer, you can optimize code so it runs efficiently on older hardware, extending their usable life.

In broader terms, mention **Green IT**: using energy-efficient servers or cloud services helps the planet. The Philippines, being an archipelago, is vulnerable to climate change, so sustainable tech development is socially responsible. If asked, talk about programs like computer recycling drives or upcycling electronics for classrooms in poor areas.
$md$, 2),
('3822c95b-e919-5f55-95c6-30a2d8c44a07','activity','Social Media and Society',$md$
IT and social media have reshaped Filipino society (playing a big role in recent elections, for example). But there are issues: misinformation spreads fast online, which can harm society. IT pros can help by improving digital literacy (teaching friends how to fact-check) and understanding algorithmic influence (why Facebook or Twitter show certain news more).

Privacy debates also occur: should the government regulate online content to stop fake news? This can clash with free speech. A nuanced stance might be: supporting fact-check laws while guarding civil rights. In the classroom, talk about Philippine cases (like laws against libel or Senate hearings on social media). Highlighting these current events in answers impresses professors.
$md$, 3),
('3822c95b-e919-5f55-95c6-30a2d8c44a07','activity','Accessibility and Inclusion',$md$
Technology should serve everyone, including those with disabilities. Professional IT work includes making software usable for the visually impaired (screen readers, high contrast modes) or hearing impaired (captions on videos). This is a social responsibility. In the Philippines, laws like the **Magna Carta for Disabled Persons** encourage equal access.

In exams, mention the importance of accessibility standards (like alt text for images, keyboard navigation) when discussing software development. It shows awareness that IT impact is not just technical but deeply social, helping fellow Filipinos regardless of ability.
$md$, 4),
('3822c95b-e919-5f55-95c6-30a2d8c44a07','activity','Cultural and Ethical Considerations',$md$
Philippine culture emphasizes **Bayanihan** (community spirit). IT solutions can harness this: e.g., community-driven apps (we often see jeepney route apps or barangay announcement apps built by local devs). On the flip side, there's also concern over **digital colonialism** (large global tech companies dominating local markets). As a professional, consider developing local content and supporting Filipino-language computing.

Also note: some technologies carry cultural bias. For example, AI chatbots might not understand Tagalog well if trained on English data. Raising awareness of these issues shows deep understanding. If possible, cite an example: e.g., a chatbot mistakenly translating a Filipino idiom. Professors like to see local examples.

*Ready to apply this? The practice set below includes exam questions and activities on social impact scenarios.*
$md$, 5),
('3822c95b-e919-5f55-95c6-30a2d8c44a07','activity','Practice & Exam Drills, Lesson 6',$md$
**Review Questions**

1. What is the "digital divide," and why is it important for IT professionals?
2. Name two practices that help make computing more sustainable (Green IT).
3. Why should software be made accessible for people with disabilities? Give one specific example.
4. How can misinformation on social media be an IT-related issue?
5. What is one cultural factor to consider when developing an app for Filipinos?

**Exam-Style Problem**

*Problem:* You are designing an e-learning platform for elementary students in remote Philippine provinces, many of whom have limited internet. List and explain three design choices you would make to address their needs.

*Solution:* (Possible answers) 1) **Optimize for low bandwidth:** use text and compressed images instead of high-definition video. 2) **Offline capability:** allow downloading lessons so students can study without a constant connection, respecting intermittent electricity. 3) **Local language support:** interface in Filipino or local dialect, making it accessible culturally. These choices address social/technical constraints (digital divide) and show social responsibility.

**Hands-On Exercise (Case Scenario)**

Brainstorm a feature for a smartphone app that could promote social good in a Philippine community (e.g., reporting road hazards, local job postings, etc.). Write a short paragraph describing this feature, its intended social benefit, and one technical requirement to make it inclusive (like "works with older phones" or "has voice narration").

**How to Pass Tips**

- Provide local examples: referring to actual Philippine programs (like DepEd's TV teaching or DOST's internet projects) scores points.
- For environmental questions, use phrases like "sustainable development" and mention relevant laws.
- Accessibility buzzwords (like WCAG, alt text, captioning) show depth.
- Distinguish social vs. technical: when asked about social issues, talk about people first (e.g., job loss from automation). When asked technical, relate it (e.g., "use compression to help remote learners").
$md$, 6);

-- ============================================================
-- SOURCES
-- University of La Salette, Social and Professional Issues 2 course learning plan and outline
-- Cavite State University, DCIT 65 Social and Professional Issues course syllabus (AY 2022-2023)
-- Far Eastern University Institute of Technology, BSIT Curriculum Overview (2022-2023)
-- CHED CMO No. 25 s.2015, Revised PSGs for BSIT (Social and Professional Issues course specification)
-- ============================================================
