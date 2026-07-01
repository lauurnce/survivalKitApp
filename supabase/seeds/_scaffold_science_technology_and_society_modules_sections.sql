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

-- ============================================================
-- LESSON 2: History of Science and Technology
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('9c0b9c7b-9380-567e-a5d0-f9b993976d69','content','Early Innovations (Prehistory to Middle Ages)',$md$
Human societies have always used technology. Early on, simple tools like fire, stone tools, and farming techniques appeared (around 10,000–5,000 BC) and transformed nomadic tribes into settled communities. The invention of the wheel and writing (in Mesopotamia and Egypt) around 3000 BC enabled trade and record-keeping. Ancient science began as observations of nature and mathematics (e.g. astronomical calendars in the Philippines and Asia). Medieval innovations include the compass, papermaking, and later, the printing press. In the Philippine context, pre-colonial Filipinos built the **Banaue Rice Terraces** (an engineering marvel) and excelled in shipbuilding (**balangay** boats) to thrive on islands. These achievements show early links between practical needs (like agriculture, navigation) and technological solutions.
$md$, 1),
('9c0b9c7b-9380-567e-a5d0-f9b993976d69','content','Scientific and Industrial Revolutions',$md$
The **Scientific Revolution** (16th–17th centuries) was a period when figures like Copernicus, Galileo, and Newton transformed how people understood nature (astronomy, physics). Science became more systematic. Closely following was the **Industrial Revolution** (late 18th–19th centuries): inventions like the steam engine, textile looms, and electricity dramatically changed production and society. Factories grew, cities expanded, and transportation (railroads, steamships) connected regions. Science (thermodynamics, chemistry) drove these tech advances. This era laid the groundwork for our modern scientific worldview and mechanized economy. For example, Philippine society was affected by steamships and telegraphs introduced in the 19th century, linking it to global trade (e.g., the Manila-Acapulco galleon earlier, and later telegraph lines under colonial rule).
$md$, 2),
('9c0b9c7b-9380-567e-a5d0-f9b993976d69','activity','20th Century and Beyond',$md$
The 20th century saw rapid S&T growth: cars, airplanes, computers, and space travel. World wars accelerated technology (radar, jet engines). The digital revolution began mid-century with computers and the internet. By late 20th–21st century, mobile phones, the web, biotechnology (like vaccines), and satellites have reshaped life. In the Philippines, the first computers appeared in universities in the 1960s–70s; widespread internet arrived in the 1990s. Today, Filipinos use smartphones and social media heavily, reflecting this tech history. Key scientific breakthroughs (DNA structure, semiconductors) led to technologies (genetic testing, electronics) that impact health and industry. Each era's tech built on past science – understanding this timeline helps predict how new technologies might emerge from today's research.
$md$, 3),
('9c0b9c7b-9380-567e-a5d0-f9b993976d69','activity','Philippine Science and Technology Milestones',$md$
The Philippines contributed to S&T history too. Filipino scientists and engineers made breakthroughs: **Dr. Fe del Mundo** pioneered pediatric medicine, becoming Asia's first woman to graduate from Harvard Medical School. Engineer **Gregorio Zara** invented an early videophone (1950s) and a rechargeable dry cell battery. The country also hosted international science: the **IRRI (International Rice Research Institute)** in Los Baños developed high-yield rice varieties that helped the global food supply. Government agencies like DOST and programs like the Philippine Space Agency (**PhilSA**) show the nation's commitment to S&T. Understanding these milestones gives context: for instance, the wide use of remote sensing in disaster management today stems from earlier investments in science and engineering.

*Ready to apply this? The practice set below includes timeline exercises and cause-effect analyses of tech milestones.*
$md$, 4),
('9c0b9c7b-9380-567e-a5d0-f9b993976d69','activity','Practice & Exam Drills — Lesson 2',$md$
**Review Questions**

1. List one major invention from the Industrial Revolution and its effect on society.
2. What was the Scientific Revolution, and why was it important for technology later on?
3. Name one ancient Filipino technology or engineering feat and briefly explain its significance.
4. How did World War II influence scientific research? Give one example.
5. What global impact did the Internet have on information sharing? (Think 1990s onward.)

**Worked Exam-Style Problems**

*Problem:* The printing press was invented in the 15th century. Describe two broad impacts this technology had on society and science.

*Solution:* (1) Literacy and education: Books became cheaper and more available, increasing literacy and spreading new scientific and philosophical ideas faster. (2) Scientific communication: Scholars could publish and share research widely (e.g., Copernicus's work), accelerating scientific progress. In answers, mention both an educational/cultural effect and a science-driven effect for completeness.

*Problem:* The Philippines adopted electricity in the early 20th century. Explain how the introduction of electric power transformed urban Filipino life.

*Solution:* Electric lighting extended productive hours (studying/working after dark), spurred industries (electric machinery in factories), and modernized cities (streetlights, electrified trams). When solving, tie the tech (electric grid) to concrete changes in daily life and economy.

**Hands-On Exercise (analysis)**

- Create a simple timeline (bulleted list) of 5–6 key science or tech milestones from different eras (e.g., fire discovery, printing press, steam engine, computer, satellite). Next to each, write one sentence about its social impact.
- Think of a traditional Filipino occupation (e.g. farming, fishing). Research one technological innovation that changed that occupation (e.g. hybrid rice seeds, outboard motor) and prepare a short explanation of how it helped.

**How to Pass Tips**

- When answering history questions, organize chronologically. Use dates/eras to structure essays.
- Remember context: Linking events to Philippine history will stand out (e.g., note what was happening in the Philippines when the Wright brothers flew or Sputnik launched).
- Expect "cause and effect" questions. Practice clear cause-effect answers: cause ➔ effect.
- Memorize a few key names/dates, but focus more on understanding trends (like "electrification led to …").
- Avoid just listing events; always add why they matter to society or science (exam answers should have reasoning, not just facts).
$md$, 5);

