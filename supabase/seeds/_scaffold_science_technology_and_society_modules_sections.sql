-- ============================================================
-- Science, Technology and Society — Modules & Sections
-- Subject ID: 2ffc307f-4e05-4ef3-a033-1f6b3ed200d9
-- 1st Year, Semester 2 — minor
-- 5 lessons. Each has 4 content blocks + 1 Practice & Exam Drills.
--   Split: S1+S2 = content (FREE); remaining teaching blocks + drill = activity
--   (PAID) -> 2 free / 3 paid every lesson.
-- No IDE playgrounds (social-science subject). Re-running is safe (DELETE clears prior rows).
-- ============================================================

DELETE FROM modules WHERE subject_id = '2ffc307f-4e05-4ef3-a033-1f6b3ed200d9';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('0dc1d96d-33be-59fe-8ccb-32a0d19301fb','2ffc307f-4e05-4ef3-a033-1f6b3ed200d9','Lesson 1: Introduction to Science, Technology, and Society','lesson-1-introduction-to-science-technology-and-society',1),
  ('9c0b9c7b-9380-567e-a5d0-f9b993976d69','2ffc307f-4e05-4ef3-a033-1f6b3ed200d9','Lesson 2: History of Science and Technology','lesson-2-history-of-science-and-technology',2),
  ('95967eae-8e5f-54e6-9249-68fbae92a030','2ffc307f-4e05-4ef3-a033-1f6b3ed200d9','Lesson 3: Science, Technology and Nation Building','lesson-3-science-technology-and-nation-building',3),
  ('662a726b-5cd6-5445-80c0-1424d009453d','2ffc307f-4e05-4ef3-a033-1f6b3ed200d9','Lesson 4: Technology and Society in the Digital Age','lesson-4-technology-and-society-in-the-digital-age',4),
  ('7db57f56-5374-5d53-8d61-b7adad07b83e','2ffc307f-4e05-4ef3-a033-1f6b3ed200d9','Lesson 5: Science, Technology, and Social Challenges','lesson-5-science-technology-and-social-challenges',5);

-- ============================================================
-- LESSON 1: Introduction to Science, Technology, and Society
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('0dc1d96d-33be-59fe-8ccb-32a0d19301fb','content','Defining Science, Technology, and Society',$md$
**Science** is systematic knowledge about how the natural world works, based on observation and experiment. **Technology** is the practical application of science and human ingenuity to solve problems (tools, machines, processes). **Society** refers to communities of people and their shared cultures, institutions, and values. In Science, Technology, and Society (STS) we study how these three domains influence each other. For example, scientific research can lead to new technologies (like medicine from biology), and technology (like social media) can transform society. Conversely, societal needs and values also drive scientific priorities and technological design (e.g. creating affordable renewable energy to address climate change).
$md$, 1),
('0dc1d96d-33be-59fe-8ccb-32a0d19301fb','content','Nature of Science and Technology',$md$
Science advances through the **scientific method**: asking questions, forming hypotheses, testing by experiment, and building theories. It values evidence and critical thinking. Technology often begins with a human need or idea and is developed through design, engineering, and iteration. A simple example: curiosity about light (science) led to developing the light bulb (technology) that now changes how society lives and works after dark. Unlike pure science, technology focuses on practical solutions. Still, the two are deeply linked: better technology (like powerful microscopes) can open new scientific discoveries, and scientific breakthroughs (like understanding electricity) lead to innovative technologies (like computers).
$md$, 2),
('0dc1d96d-33be-59fe-8ccb-32a0d19301fb','activity','Interplay of Science, Technology, and Society',$md$
Imagine STS as a triangle: each corner (science, technology, society) affects the others.

- **Science ➔ Technology:** Scientific discoveries create new possibilities (e.g. discovery of electricity enabled electric power grids).
- **Technology ➔ Science:** New tech tools let scientists explore further (e.g. satellites in space exploring climate).
- **Society ➔ Science/Tech:** Social challenges and goals motivate research (e.g. a need for clean water drives research in water purification).
- **Science/Tech ➔ Society:** Advances can greatly change daily life (the internet connected communities worldwide; genetic research affects healthcare).

A local example: the advent of mobile money apps (a technology) was enabled by software development and internet science, and it revolutionized how Filipinos pay bills and transfer money. At the end of this lesson, students should see how science and technology are not separate from society – they shape our culture and vice versa, which is the core idea of STS.

*Ready to apply this? The practice set below includes example questions and reflections on how science and tech influence society.*
$md$, 3),
('0dc1d96d-33be-59fe-8ccb-32a0d19301fb','activity','Practice & Exam Drills — Lesson 1',$md$
**Review Questions**

1. Define science, technology, and society in your own words.
2. Give one example of a technology that came from a scientific discovery, and explain its impact on society.
3. How can societal values or needs influence scientific research? Provide an example.
4. What is one difference between how science operates and how technology develops?
5. Explain the concept of the STS triangle in a short paragraph.

**Worked Exam-Style Problems**

*Problem:* The invention of the microscope allowed humans to see tiny organisms for the first time. Describe two ways this technology (microscope) affected both science and society.

*Solution:* (1) Scientific impact: Scientists discovered cells, bacteria, and other microorganisms, advancing biology and medicine (development of germ theory). (2) Societal impact: People gained understanding of disease causes (reducing superstitions) and improving public health. **Writing tip:** Always connect the tech to a concrete scientific advancement and a societal change.

*Problem:* Consider the social media platform (technology) and describe one positive and one negative impact it has had on Filipino society.

*Solution:* Positive: It enables community organization (e.g., crowdsourcing for typhoon relief). Negative: Spread of misinformation or cyberbullying. In answers, cite real examples (like social media use during elections or typhoons) to show your understanding.

**Hands-On Exercise (analysis)**

- Choose a technology you use daily (e.g., mobile phone, online banking) and write a short reflection (1–2 paragraphs) on how science and society contributed to its creation. Identify what science made it possible and what societal need it addresses.
- *Bonus:* Identify a recent tech news story in the Philippines and write 3 sentences on its social impact (e.g., new e-pay service rollout).

**How to Pass Tips**

- In essay or exam questions, always give specific examples. Professors expect concrete technologies (like "smartphone cameras" or "solar panels") and their effects.
- Distinguish clearly between science (the search for understanding) and technology (application of that understanding). Mixing them up is a common mistake.
- Show how society fits in: mention cultural, environmental, or economic contexts. For example, note how Filipino traditions or policies shape tech use.
- Don't forget the cause-and-effect chain: "scientific research ➔ new tech ➔ societal change." Use local examples (the role of DOST, or Filipino innovators) to strengthen answers.
$md$, 4);

