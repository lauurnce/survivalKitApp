-- ============================================================
-- Ethics — Modules & Sections
-- Subject ID: 476dbfed-5212-4296-9036-895bbbe546d4
-- 2nd Year, Semester 2 — minor
-- 5 lessons. Each has 3 content blocks + 1 Practice & Exam Drills.
--   Split: S1+S2 = content (FREE); the 3rd teaching block + drill = activity
--   (PAID) -> 2 free / 2 paid every lesson.
-- No IDE playgrounds (philosophy subject). Re-running is safe (DELETE clears prior rows).
-- ============================================================

DELETE FROM modules WHERE subject_id = '476dbfed-5212-4296-9036-895bbbe546d4';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('cf8fe871-8018-5e68-a12b-0f9cc7821b84','476dbfed-5212-4296-9036-895bbbe546d4','Lesson 1: Introduction to Ethics and Moral Concepts','lesson-1-introduction-to-ethics-and-moral-concepts',1),
  ('f0aff824-e320-5405-9bbe-6e17eddd662d','476dbfed-5212-4296-9036-895bbbe546d4','Lesson 2: Moral Agency and Decision-Making','lesson-2-moral-agency-and-decision-making',2),
  ('5e27e216-70e2-5d8a-beb8-e36d540ddd43','476dbfed-5212-4296-9036-895bbbe546d4','Lesson 3: Culture, Society, and Filipino Values','lesson-3-culture-society-and-filipino-values',3),
  ('264ba160-fc4f-5392-ac1f-4c75057ce66b','476dbfed-5212-4296-9036-895bbbe546d4','Lesson 4: Ethical Theories and Frameworks','lesson-4-ethical-theories-and-frameworks',4),
  ('4fb4afbb-c0de-583a-8020-d17130f234d2','476dbfed-5212-4296-9036-895bbbe546d4','Lesson 5: Contemporary Issues and Social Ethics','lesson-5-contemporary-issues-and-social-ethics',5);

-- ============================================================
-- LESSON 1: Introduction to Ethics and Moral Concepts
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('cf8fe871-8018-5e68-a12b-0f9cc7821b84','content','What Is Ethics?',$md$
**Ethics** is the study of right and wrong behavior. In simple terms, it asks, "How should we act?" and "What kind of person should we be?" Ethics (also called moral philosophy) goes beyond following rules – it examines the principles behind why actions are considered good or bad. You'll learn to distinguish ethical values (honesty, fairness) from mere personal preferences. For example, you may prefer certain foods (taste vs. health) – that's not moral. But helping others in need is a choice reflecting morality.
$md$, 1),
('cf8fe871-8018-5e68-a12b-0f9cc7821b84','content','Ethics, Morality, and Rules',$md$
A **moral standard** is a rule about right and wrong, usually learned from family, community, or religion. For example, "Stealing is wrong." Non-moral rules include etiquette or laws that are not ethical in nature. Key distinctions:

- **Morals vs. Ethics:** Morals are personal beliefs about right and wrong. Ethics is the systematic study of those morals.
- **Laws vs. Ethics:** Laws are enforced by government. Something can be legal but unethical, and vice versa.
- **Values:** Beliefs (like loyalty) that guide choices.

Understanding these helps you explain *why* a rule exists, not just follow it. For instance, laws against plagiarism promote honesty in academics.
$md$, 2),
('cf8fe871-8018-5e68-a12b-0f9cc7821b84','activity','Moral Dilemmas and Social Rules',$md$
A **moral dilemma** is a tough situation where you have to choose between two conflicting values. For example, a student might face the choice: help a sick classmate by copying homework, or be honest and complete it alone. In dilemmas, there may be no completely "right" answer. Ethics teaches us to think carefully in these situations. Scholars classify moral dilemmas into levels: **personal** (decisions you resolve yourself), **organizational** (e.g. business or school issues), and **societal** (government policies, public welfare). Laws and social rules exist to protect everyone's rights. Without any rules or ethics, powerful people or groups might harm others. In fact, one purpose of ethics is to protect the **common good** by guiding behavior toward fairness and justice.

*Ready to apply these ideas? The practice set below contains examples, step-by-step solutions, and deeper exercises.*
$md$, 3),
('cf8fe871-8018-5e68-a12b-0f9cc7821b84','activity','Practice & Exam Drills — Lesson 1',$md$
**Review Questions**

1. Define ethics and explain how it differs from personal taste or preference.
2. Give an example of a moral standard and a non-moral rule. How are they different?
3. What is a moral dilemma? Name the three "levels" of moral dilemmas (personal, organizational, societal).
4. Why do societies have rules and laws? How do they relate to ethical behavior?
5. Explain why freedom is important in moral decision-making.

**Worked Exam-Style Problems**

*Problem:* Ana finds a lost wallet with ₱5,000 inside. She needs money for a family emergency. Should she keep the money or turn in the wallet to the authorities? Identify the moral dilemma, list the values involved, and propose an ethical solution.

*Solution:* This is a **personal moral dilemma**: honesty vs. need. Values: honesty (not stealing) and compassion (helping family). Ethical reasoning: Ana should first attempt to find the owner, since keeping found money violates honesty. If she truly cannot find the owner, she should report it to lost-and-found (acting responsibly). Justification: this preserves trust and common good, while still addressing her emergency by legal means (perhaps the owner rewards her honestly).

*Problem:* A student sees two classmates copying answers during an exam. Reporting them might get them expelled, but staying silent is dishonest. What should the student do? Outline steps in moral reasoning.

*Solution:* Identify stakeholders (classmates, school community). Ethical options: do nothing (silence) or tell the teacher. Weigh values: fairness (cheating harms others) vs. loyalty (not betraying friends). Reason: This is a conflict between honesty (cheating is wrong) and loyalty. Using moral reasoning, the student might decide reporting preserves fairness (everyone works honestly). They should consider consequences (other students lose trust, school rules are upheld). Conclusion: Informing the teacher is the ethical choice, perhaps suggesting an anonymous tip if worried, which balances honesty and compassion.

**Application Exercise**

- Reflect on a real or imagined situation (e.g. in a tricycle ride, family, classroom) where you faced a moral choice. Describe the dilemma and explain how you resolved it using ethical principles or which values you prioritized (fairness, duty, etc.).
- Role-play with a classmate: one is an ethical adviser, the other describes an ethical dilemma at work (e.g. witnessing a coworker breaking rules). The adviser guides them using questions (Who is affected? What are the values?).

**How to Pass this Topic**

- Remember key definitions (morality, ethics, dilemma) and examples from daily life. Use Filipino settings (school, family, trabaho) to ground answers.
- In essays, clearly identify the ethical issue and stakeholders involved. Show understanding of general principles (honesty, respect) rather than just stating "do the right thing."
- Common mistakes: confusing rules of etiquette with moral rules; overlooking an action's impact on others. Always ask "How would I justify this action to someone impartial?"
- Professors often expect examples. Mention everyday Philippine scenarios (traffic rules, barangay community issues). Simple frameworks (like "Is it fair?" or "Could I defend this publicly?") help in exams.
$md$, 4);

