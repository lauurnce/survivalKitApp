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

