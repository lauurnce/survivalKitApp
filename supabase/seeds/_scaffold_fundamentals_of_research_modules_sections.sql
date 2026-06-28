-- ============================================================
-- Fundamentals of Research — Modules & Sections
-- Subject ID: 30000000-0003-0001-0001-000000000003
-- 3rd Year, Semester 1 — minor
-- 6 lessons. Split: S1+S2 = content (FREE); remaining teaching blocks + drill = activity (PAID).
--   Lesson 1 has 4 content blocks + drill -> 2 free / 3 paid.
--   Lessons 2-6 have 3 content blocks + drill -> 2 free / 2 paid.
-- No IDE playgrounds (research subject). Re-running is safe (DELETE clears prior rows).
-- ============================================================

DELETE FROM modules WHERE subject_id = '30000000-0003-0001-0001-000000000003';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('78f694b1-5d38-5bdb-8b3d-13baad91bb40','30000000-0003-0001-0001-000000000003','Lesson 1: Introduction to Research','lesson-1-introduction-to-research',1),
  ('2bdab8a7-b762-566a-ab7c-8328a1de5b94','30000000-0003-0001-0001-000000000003','Lesson 2: Research Problems and Questions','lesson-2-research-problems-and-questions',2),
  ('9911257f-768f-5c34-898e-35bd469c7eff','30000000-0003-0001-0001-000000000003','Lesson 3: Literature Review & Writing','lesson-3-literature-review-and-writing',3),
  ('529e7ab3-78b0-5ae0-9b4f-7957d4fad674','30000000-0003-0001-0001-000000000003','Lesson 4: Research Methods and Design','lesson-4-research-methods-and-design',4),
  ('ac389336-c0b6-51db-9b1e-53542f2bbc78','30000000-0003-0001-0001-000000000003','Lesson 5: Data Collection and Analysis','lesson-5-data-collection-and-analysis',5),
  ('396fb7c8-3e88-510e-91a0-e3be427e2e7e','30000000-0003-0001-0001-000000000003','Lesson 6: Ethics and Proposal Writing','lesson-6-ethics-and-proposal-writing',6);

-- ============================================================
-- LESSON 1: Introduction to Research
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('78f694b1-5d38-5bdb-8b3d-13baad91bb40','content','What is Research?',$md$
Research is a systematic method of inquiry that seeks to discover new knowledge or validate existing information. It involves asking questions, gathering evidence, and drawing conclusions in a structured way. Unlike guessing or intuition, research follows organized steps and uses data and facts. In information technology, research might explore why certain programs work better or how to improve a system based on evidence.
$md$, 1),
('78f694b1-5d38-5bdb-8b3d-13baad91bb40','content','Characteristics of Good Research',$md$
Good research is systematic, meaning it follows a clear plan of action. It is empirical: based on observed or measured data. It aims to be objective, minimizing bias in how data are collected and interpreted. Quality research also tends to be analytical: it breaks down complex problems into parts and examines them carefully. Overall, a well-designed research project will be reliable and trustworthy because it handles variables carefully and sticks to logical methods.
$md$, 2),
('78f694b1-5d38-5bdb-8b3d-13baad91bb40','activity','Why Research Matters',$md$
Research is important because it helps us understand and solve real problems. For example, a BSIT student might research how Filipinos use mobile banking to help design more user-friendly apps. On a larger scale, research guides government and businesses to make informed decisions (like using data to plan better internet coverage in rural areas). For students, learning research skills also builds critical thinking and communication ability—skills that are valuable in any IT career.
$md$, 3),
('78f694b1-5d38-5bdb-8b3d-13baad91bb40','activity','The Research Process',$md$
A typical research process has several stages. First, you identify a clear question or problem to study. Next, you review what others have already learned about the topic. Then you design your own study (choosing methods and tools) and collect data (like conducting surveys or experiments). After data collection, you analyze the information to find patterns or answers. Finally, you draw conclusions and share your findings, often in a report. This step-by-step approach keeps a research project organized and focused.
$md$, 4),
('78f694b1-5d38-5bdb-8b3d-13baad91bb40','activity','Practice & Exam Drills — Lesson 1',$md$
**Review Questions**

1. What is the definition of research? Provide an example of research in IT.
2. List three characteristics of good research.
3. Why is it important for research to be systematic and evidence-based?
4. How does research benefit technology development or decision-making? Give one example.
5. Explain the difference between a guess and a research finding.

**Worked Problems**

**Exam Problem:** A student wants to study why many Filipinos prefer using mobile wallets instead of carrying cash. Outline the major steps this student should follow in conducting this research, starting from the research question to final conclusions.

**Solution:** First, the student should formulate a clear research question (e.g., "Why do Filipino consumers prefer mobile wallets over cash for daily transactions?"). Next, conduct a literature review to find existing studies on digital payments. Then design the study: for example, create a survey or interview questions to ask users about their payment habits. After deciding on a methodology (such as sampling a diverse group of people), the student would collect data by distributing the survey or conducting interviews. Then they would analyze the data (for example, calculating percentages of responses) to identify patterns. Finally, the student would draw conclusions based on the evidence (e.g., finding that convenience is the main reason people use mobile wallets). Each step builds on the actual data, making the findings reliable.

**Exam Problem:** Identify whether the following scenario is an example of research, and explain why or why not: Every morning, Maria checks the traffic update app to decide which route to take. She notices her co-workers do the same. She concludes that the app must be very accurate. Based on this, she recommends all drivers to use the app.

**Solution:** This scenario is not a proper research study. Maria is making a conclusion based on casual observation, but she has not gathered or analyzed data systematically. True research would involve collecting evidence from many drivers (for example, surveying people about the app's accuracy or comparing predicted vs. actual travel times). Since Maria did not perform any controlled study or analysis, her conclusion is only an assumption. Real research would test and verify the app's accuracy with actual data before drawing conclusions.

**Hands-On Exercise**

Choose a real-world IT topic (such as online shopping habits, use of e-learning platforms, or social media usage in your community). Write a clear research question and at least two specific objectives for a study on this topic. For example, if your topic is e-learning platforms, one question could be "What factors influence students' satisfaction with online learning platforms?"

**How to Pass Tips**

- **Understand key terms.** Be ready to define research, systematic, empirical, etc., and explain them clearly. Professors often test these definitions.
- **Memorize steps.** Know the basic research steps (Question → Review → Design → Data → Analysis → Conclusion). Being able to list them in order can earn credit.
- **Use examples.** Practice explaining concepts with simple examples (like a popular app or a common issue). This shows you understand the idea.
- **Be concise and structured.** In your exam answers, write clearly and in a logical order. Consider outlining your answer first (in your notes) before writing full sentences.
- **Check clarity.** When writing definitions or processes, ensure your reasoning is explicit. Avoid leaving logic gaps (for instance, explain why each step leads to the next).
$md$, 5);

