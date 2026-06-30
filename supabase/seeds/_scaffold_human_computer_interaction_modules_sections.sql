-- ============================================================
-- Human Computer Interaction — Modules & Sections
-- Subject ID: 20000000-0002-0002-0001-000000000004
-- 2nd Year, Semester 2 — major
-- 8 lessons. Each lesson has 2 content blocks + 1 Practice & Exam Drills.
--   Split: S1+S2 = content (FREE); the drill = activity (PAID) -> 2 free / 1 paid.
-- No IDE playgrounds (design subject — drills are conceptual/design exercises).
-- Re-running is safe (DELETE clears prior rows for this subject first).
-- ============================================================

DELETE FROM modules WHERE subject_id = '20000000-0002-0002-0001-000000000004';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('4e4b0aba-40fb-5aa0-947b-e879ccb5b50c','20000000-0002-0002-0001-000000000004','Lesson 1: Introduction to Human-Computer Interaction','lesson-1-introduction-to-human-computer-interaction',1),
  ('85677651-8ff2-5ab6-aaac-d357bacec61e','20000000-0002-0002-0001-000000000004','Lesson 2: Human Abilities and Cognition','lesson-2-human-abilities-and-cognition',2),
  ('f69a8ee9-ecc8-594b-a29b-4c3601f7240c','20000000-0002-0002-0001-000000000004','Lesson 3: Interaction Design Principles','lesson-3-interaction-design-principles',3),
  ('51a681a2-a833-57e5-bda9-10631c7aec61','20000000-0002-0002-0001-000000000004','Lesson 4: The User-Centered Design Process','lesson-4-the-user-centered-design-process',4),
  ('ae19b157-8db3-5a49-8ae6-5bcee96486d2','20000000-0002-0002-0001-000000000004','Lesson 5: Prototyping and Interface Layout','lesson-5-prototyping-and-interface-layout',5),
  ('7114db28-6196-5bf7-b061-46940060698b','20000000-0002-0002-0001-000000000004','Lesson 6: Usability Testing and Evaluation','lesson-6-usability-testing-and-evaluation',6),
  ('1dac1e42-0b66-541d-acec-c9bf65a35c00','20000000-0002-0002-0001-000000000004','Lesson 7: Accessibility and Inclusive Design','lesson-7-accessibility-and-inclusive-design',7),
  ('5474918a-c771-51ce-9db7-daac8c7a71d0','20000000-0002-0002-0001-000000000004','Lesson 8: Mobile and Emerging Interfaces','lesson-8-mobile-and-emerging-interfaces',8);

-- ============================================================
-- LESSON 1: Introduction to Human-Computer Interaction
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('4e4b0aba-40fb-5aa0-947b-e879ccb5b50c','content','What Is HCI?',$md$
Human–computer interaction (HCI) studies how people interact with computers and software. In an HCI course, you learn the history and scope of the field (from punch cards and GUIs to modern user experience design). Key concepts include **usability** (how easy and efficient a system is) and **user experience** (overall satisfaction). HCI is interdisciplinary: it combines computer science, cognitive psychology, graphic design, and social science. The goal is to create computer systems that people find intuitive, useful, and pleasant.
$md$, 1),
('4e4b0aba-40fb-5aa0-947b-e879ccb5b50c','content','Why HCI Matters',$md$
HCI matters because poor interface design causes errors and frustration. For example, if an e-government website is confusing, citizens will waste time or avoid using it. Studying HCI teaches you to solve these real-world problems. You will learn to apply principles such as **visibility** (making interface elements clear) and **feedback** (showing results of actions). Understanding common user mistakes (e.g. misclicks on complex menus) helps prevent them. In the Philippine context, HCI skills help design apps for local needs, like easy-to-use health or banking apps in Filipino.

*Ready to apply this? The practice set below walks through exam-style problems with step-by-step solutions and a live design exercise.*
$md$, 2),
('4e4b0aba-40fb-5aa0-947b-e879ccb5b50c','activity','Practice & Exam Drills — Lesson 1',$md$
**Review Questions**

1. What is Human–Computer Interaction (HCI) and why is it important?
2. Name two main goals of good interface design (hint: think efficiency and satisfaction).
3. List one example of how culture or language can affect interface design in the Philippines.
4. Explain the difference between usability and user experience.
5. What role do humans vs computers play in the HCI process?

**Worked Problem**

A student is designing an online student portal for a university. The menu has ten tiny buttons all on one screen, and the labels are in English while many users prefer Filipino. Identify two major HCI issues here and suggest fixes.

*Solution:* First, having ten tiny buttons is a usability problem: it violates **Fitts' Law** (small targets are harder to click). We should increase button size and group similar functions logically (e.g. Academics, Finance, Dorm). Second, using only English labels may confuse Filipino users. We can provide Filipino or Taglish labels or bilingual options to match users' language. These changes improve the interface's usability and inclusiveness.

**Hands-On Exercise**

Imagine you are tasked to improve the design of a busy Barangay services website. Sketch (on paper or digital) a simple homepage layout that uses large icons and Filipino labels. Focus on clarity and explain your design choices. (This is a practical exercise — discuss it in a study group or with peers.)

**How to Pass Tips**

- Study and remember key terms (usability, affordance, consistency, etc.). In exams, expect definition questions (e.g. "Define usability") and scenario questions ("Identify interface issues in this example").
- Professors often test on Nielsen's or Shneiderman's design principles, so know them by heart.
- Avoid the mistake of thinking HCI is just coding — focus instead on concepts like user needs and design rules.
- Be able to compare good vs bad interfaces with reasons.
$md$, 3);

