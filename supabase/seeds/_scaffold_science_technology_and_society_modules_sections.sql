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

-- ============================================================
-- LESSON 3: Science, Technology and Nation Building
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('95967eae-8e5f-54e6-9249-68fbae92a030','content','S&T in Economic Development',$md$
Science and technology are engines of national development. They create better industries (e.g., manufacturing electronics, call centers) and higher-paying jobs. For example, advances in agricultural science (like new rice strains from IRRI) helped boost Filipino food production, feeding millions. Technology enables modern infrastructure: building bridges, roads, ports, and telecommunications networks relies on engineering and materials science. The **Department of Science and Technology (DOST)** in the Philippines promotes research (like disaster-resilient buildings) that protects and uplifts communities. Emphasize: when a country invests in science (education, research labs) and technology (factories, digital connectivity), its economy and people's quality of life improve.
$md$, 1),
('95967eae-8e5f-54e6-9249-68fbae92a030','content','Science in Health, Education, and Society',$md$
Scientific progress directly benefits public health: Filipinos now live longer because vaccines and medicines combat diseases (smallpox, polio, dengue). For instance, the development and local production of the measles vaccine greatly reduced child mortality. Education-wise, science promotes innovation: science-based curricula (physics, biology) train future engineers and doctors. Society adapts as well: medical devices (X-ray, ECG machines) in Philippine hospitals reflect global scientific advances. In daily life, technology like refrigeration and the internet has changed homes and workplaces. Students should recognize that nation-building involves lifting living standards through science (better healthcare, nutrition) and making knowledge accessible (libraries, internet access) — all science-driven developments.
$md$, 2),
('95967eae-8e5f-54e6-9249-68fbae92a030','activity','Government Initiatives and Policies',$md$
The Philippine government creates policies to integrate S&T with development goals. Examples: laws that fund science education and research, and programs like **One Town, One Product** that promote local technology-based industries. The **Philippine Innovation Act** encourages R&D in high-tech fields. Government science institutions like **PAGASA** (weather service) and **NAMRIA** (maps, geodesy) use technology to serve communities (e.g., weather forecasts for farmers). Highlight: Nation-building isn't just economics; it's also environmental and social—S&T policies address climate adaptation (like building typhoon shelters) and sustainable development. Students should be aware of these frameworks as part of the "big picture" of STS in the Philippines.
$md$, 3),
('95967eae-8e5f-54e6-9249-68fbae92a030','activity','Local Innovations and Challenges',$md$
Filipinos have contributed their own innovations. For instance, **Gavino Trono's** work in marine science advanced seaweed farming, benefiting coastal communities. In tech, local companies developed OFW-focused apps for remittances. At the same time, challenges remain: many bright Filipino scientists move abroad (**"brain drain"**), and R&D funding is low compared to neighboring countries. Infrastructure gaps (like slow internet in rural areas) show uneven tech adoption. Studying STS includes these issues: how can the Philippines harness S&T for all? For example, e-learning platforms expanded during COVID to reach remote areas, showing both innovation and the need for better tech access. Understanding these successes and hurdles helps students think critically about using science and tech to solve national problems.

*Ready to apply this? The practice set below includes scenario questions on Philippine S&T policies and local innovation.*
$md$, 4),
('95967eae-8e5f-54e6-9249-68fbae92a030','activity','Practice & Exam Drills — Lesson 3',$md$
**Review Questions**

1. Name one Philippine law or agency that promotes science and explain its purpose.
2. How did DOST contribute to a recent public health or disaster response effort?
3. Give an example of a Filipino scientific achievement and its benefit to the country.
4. What is "brain drain" and how does it affect national development?
5. Why is R&D funding important for the Philippines?

**Worked Exam-Style Problems**

*Problem:* Suppose the government wants to support eco-friendly farming. Describe a policy or program it might create, and explain how it involves science and benefits society.

*Solution:* For example, the government could fund research on organic fertilizers and train farmers to use them. This policy combines agricultural science (studying plants and soil) with education programs. Benefits: healthier crops, less pollution, and potentially higher incomes for farmers. In answers, mention specific elements: "fund research," "train farmers," and tie them to science outcomes.

*Problem:* The Philippine weather bureau (PAGASA) often uses satellites and supercomputers to forecast typhoons. Explain how this technological capability impacts community safety and economy.

*Solution:* Accurate forecasts (science + technology) give people time to evacuate and protect property, reducing casualties and damage. Industries like shipping can plan around storms, saving money. The answer should link technology (satellites, models) to concrete societal gains (safety, economic saving).

**Hands-On Exercise (case study)**

- Read a short news report about a new tech initiative in the Philippines (e.g., solar-powered classrooms in rural schools). Write a brief (3-point) summary of how science made this possible and why it helps the community.
- Alternatively, role-play: Imagine you are part of a local government proposing a project to improve internet access in your barangay. Outline (bullet points) what technologies or partnerships you would use and what societal benefits you expect.

**How to Pass Tips**

- Always mention real Filipino examples when asked. Professors often value local relevance (citing DOST, PAGASA, or local tech start-ups).
- Learn a couple of current S&T projects (like community Wi-Fi, e-government portals) and use them in answers to show up-to-date awareness.
- In policy questions, name specific laws or programs if possible (even name-dropping "DOST" or "Science Act" shows preparation).
- Balance is key: note both achievements and ongoing problems (shows critical thinking). For example, answer about brain drain by saying "While many Pinoy scientists excel abroad, programs to improve local research are underway."
- Avoid vague terms. If writing about tech, be precise (e.g. "renewable energy" vs just "environment-friendly").
$md$, 5);

-- ============================================================
-- LESSON 4: Technology and Society in the Digital Age
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('662a726b-5cd6-5445-80c0-1424d009453d','content','Connectivity and the Internet',$md$
The rise of the Internet and mobile networks has radically changed society. In the Philippines, text messaging (SMS) and social media (Facebook, Twitter) became immensely popular since the 2000s. This connectivity means Filipinos can communicate instantly across islands. Online communities allow knowledge-sharing (tutorial videos, forums) and overseas workers to stay in touch with family. Importantly, lack of connectivity is still an issue in some rural areas (the **"digital divide"**), so expanding internet access is a government priority (e.g., free WiFi in public spaces). Emphasize: this module covers how digital technologies (smartphones, internet) affect culture, economy, and everyday life in the Philippines and beyond.
$md$, 1),
('662a726b-5cd6-5445-80c0-1424d009453d','content','Social Media and Culture',$md$
Social media platforms are a prime example of technology shaping society. **Positive** impacts include community organizing (hashtags for advocacy, crowdfunding for relief after typhoons) and amplified youth voices (bloggers, YouTubers). They also spread awareness of social issues quickly. However, **negatives** include misinformation (fake news) and cyberbullying. In the Philippines, viral campaigns (like #Resbakuna) have influenced public opinion on COVID vaccines. Studying STS means looking at these double-edged effects: How do we enjoy the benefits (connectivity, activism) while mitigating the harms (privacy invasion, addiction)? This section encourages critical thinking about media tech's role in our cultural life.
$md$, 2),
('662a726b-5cd6-5445-80c0-1424d009453d','activity','Digital Economy and Fintech',$md$
Technology has transformed business and finance in PH society. Online shopping (Lazada, Shopee) lets Filipinos buy goods without visiting stores, changing retail habits. E-payments and mobile wallets (GCash, PayMaya) are tech tools that make transactions easier – especially useful for unbanked communities. Information technology drives BPO (call center) industries, providing jobs. Students should note how these digital innovations rely on earlier tech (internet infrastructure, encryption algorithms) and how they impact society (e.g., more online jobs, convenience). Also discuss challenges like cybersecurity threats and the need for digital literacy (some elders or rural folks struggle with the new tech).
$md$, 3),
('662a726b-5cd6-5445-80c0-1424d009453d','activity','Digital Divide and Inclusion',$md$
Not everyone benefits equally from technology. **"Digital divide"** refers to gaps in tech access due to income, location, or age. In the Philippines, urban students often have laptops and fast internet, while rural areas may have slow connections or none. Programs like DepEd's online classes faced hurdles for students without devices. Society and government can address this: computer donation drives, training programs for seniors to use smartphones, or the DICT's push to improve broadband networks. Understanding STS means recognizing that technology's impact depends on societal factors; students should think about how to make technology inclusive so that national development via STS is fair to all communities.

*Ready to apply this? The practice set below has scenarios on social media ethics and case studies on e-payments.*
$md$, 4),
('662a726b-5cd6-5445-80c0-1424d009453d','activity','Practice & Exam Drills — Lesson 4',$md$
**Review Questions**

1. What is the "digital divide"? Give one example from a Philippine context.
2. List two positive and two negative effects of social media in Filipino society.
3. How has online shopping or e-commerce changed consumer behavior in the Philippines?
4. Name one technology that enabled the BPO (call center) industry to grow.
5. What can individuals do to use technology more responsibly (hint: think of digital citizenship)?

**Worked Exam-Style Problems**

*Problem:* A remote barangay (village) has no internet. As an IT student, propose one technological solution to help them get online, considering cost and infrastructure. Explain why your proposal suits a rural setting.

*Solution:* For example, set up a community WiFi with a long-range antenna connected to the nearest tower, or use a satellite internet service. These leverage known technology and local needs. The answer should justify with factors like "solar-powered equipment" for off-grid areas or local training support.

*Problem:* Describe how cyberbullying via social networks can affect students' learning and mental health. What role can schools and science (technology) play in addressing this issue?

*Solution:* Cyberbullying can cause stress, distraction, or absenteeism. Schools can integrate digital literacy classes (technology education) and policies. Answers should connect technology (internet tools) with education/society responses (counseling programs, awareness campaigns).

**Hands-On Exercise (role-play)**

- In groups, imagine you are community leaders in an ICT workshop. Design a mini campaign (bullet points) to teach responsible social media use to your peers. Include 3 key points (e.g., verify news, respect privacy, manage screen time).
- Alternatively, map out a simple flowchart of how online payment (like an e-wallet) works: user registration ➔ bank link ➔ sending money ➔ notification. This helps understand the underlying steps.

**How to Pass Tips**

- Stay current: mention recent apps and stats. Professors may ask about recent events (e.g., data breach news, newest social media trends).
- Use tech vocabulary accurately (e.g. "bandwidth" vs "speed", "cybersecurity"). Precise terms show mastery.
- In ethics questions (like cyberbullying), balance technology aspects with human factors (state an example and solution).
- When discussing pros/cons, try to give at least one example of each (examiners look for both sides).
- Be aware of Filipino specifics: cite local laws like the Data Privacy Act for privacy questions, or cite PH internet speed statistics for the digital divide.
$md$, 5);

-- ============================================================
-- LESSON 5: Science, Technology, and Social Challenges
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('7db57f56-5374-5d53-8d61-b7adad07b83e','content','Environmental Sustainability and Climate Change',$md$
Science and technology both cause and solve environmental issues. Industrial activities and energy use have led to climate change (rising temperatures, intense typhoons). Technology contributes: car emissions, industrial waste, and deforestation are tech-driven. On the other hand, science provides solutions: climate models predict weather, guiding disaster prep. **Green technologies** are emerging: solar panels, wind turbines, and electric jeepneys reduce carbon footprints. In the Philippines, typhoon-safe shelter designs and reforestation projects use science to adapt to environmental challenges. Sustainability is key: students learn how tech (like wastewater treatment) protects nature, and how policies (like clean air regulations) manage the impact of technology on the environment.
$md$, 1),
('7db57f56-5374-5d53-8d61-b7adad07b83e','content','Ethics and Responsible Technology',$md$
As technology advances, we face new ethical questions. In science: manipulating genes (GMOs, designer babies) raises moral and safety concerns. In technology: issues like data privacy (personal data collected by apps), AI bias, and intellectual property are major debates. For example, face recognition tech can improve security but also risks surveillance overreach. Filipino society grapples with these: the **Data Privacy Act** (Philippines) regulates personal information online. Encourage students to think about questions like "Should there be limits on AI development?" or "How do we balance tech convenience with privacy rights?" This section stresses that responsible citizenship means being aware of the moral dimensions of science and tech in society.
$md$, 2),
('7db57f56-5374-5d53-8d61-b7adad07b83e','activity','Disaster Preparedness and Resilience',$md$
The Philippines is prone to natural hazards (typhoons, earthquakes, volcanic eruptions). Science and technology help mitigate these risks: early warning systems (weather radars, tsunami buoys) give critical time for evacuation. Engineering designs (e.g., quake-resistant buildings, flood control dams) aim to protect lives. Information tech (SMS alerts, hazard maps) informs the public. For instance, **PAGASA's** improved forecasting models and **PHIVOLCS's** earthquake monitoring are scientific achievements with social value. This section combines environmental and technological angles: how society uses science to respond to natural challenges. It underlines a key STS theme: tech solutions are needed, but so is social planning and education (everyone must heed warnings and prepare).
$md$, 3),
('7db57f56-5374-5d53-8d61-b7adad07b83e','activity','Science and Health in Society',$md$
Medical science and health technologies have immense social impact. Vaccination campaigns (science development + public health policy) eradicated diseases. Recent example: the mRNA COVID-19 vaccines (an advanced biotech) helped fight the pandemic in the Philippines. Telemedicine and health apps show technology addressing healthcare access. Students should also consider inequalities: while science yields cures, not all Filipinos access them equally (rural vs. urban health centers). Health crises highlight STS: science invents treatments, but society's structures (insurance, clinics) determine who benefits. This section may overlap with ethics (e.g. prioritizing patients) and environment (pollution's health effects), emphasizing the complex web of STS in social issues.

*Ready to apply this? The practice set below has case studies on climate action and ethical dilemmas, plus disaster response planning scenarios.*
$md$, 4),
('7db57f56-5374-5d53-8d61-b7adad07b83e','activity','Practice & Exam Drills — Lesson 5',$md$
**Review Questions**

1. Give one example of how technology can help reduce environmental damage in the Philippines.
2. What ethical issue arises with collecting user data for social media apps?
3. How does early warning technology save lives during typhoons?
4. What is an example of science improving healthcare in rural areas?
5. Why is it important to consider ethics when developing new technologies?

**Worked Exam-Style Problems**

*Problem:* A proposal is made to build a large hydroelectric dam in a province. Identify two potential benefits and two potential drawbacks of this technology for society.

*Solution:* Benefits: (1) Clean energy generation, reducing fossil fuel use and pollution; (2) Job creation and revenue. Drawbacks: (1) Displacement of communities when the reservoir is filled; (2) Ecosystem impact (fish migration, forest flooding). Answers should balance both sides: mention environmental/social impact and technological advantage.

*Problem:* Describe a plan for educating citizens about preventing cybercrime. What technologies and institutions would be involved?

*Solution:* The plan could include free online workshops (tech: webinar platforms), coordination with the National Privacy Commission (policy) and schools (education). Answers should show integration: use of tech (internet, software), social actors (gov agencies), and expected outcomes (awareness, safer online behavior).

**Hands-On Exercise (scenario)**

- *Case study:* "After a typhoon, cellphone service was down. A new radio communication network was then used to coordinate rescue." Analyze this scenario by listing (a) which technologies were involved, (b) what problems each solved, and (c) a suggestion for improvement in future events.
- Or: Write a short proposal (bullets) for a tech-based project to help improve farming in your area (e.g. app for market prices, drone for crop spraying). Focus on the social benefits (higher income, less waste).

**How to Pass Tips**

- When discussing environment or disasters, always connect science/tech with policy or community action (e.g., mention community workshops or flood forecasting systems).
- In ethics questions, look for the core dilemma (risk vs benefit). Phrase answers as arguments (e.g., "On one hand…, on the other hand…").
- Use real local context: e.g., refer to specific typhoons (Yolanda/Haiyan) to illustrate points.
- Emphasize sustainability: modern exams appreciate awareness of the Sustainable Development Goals (like clean energy, climate action).
- Avoid being one-sided; acknowledge potential cons of any tech solution to show critical thinking.
$md$, 5);

-- ============================================================
-- SOURCES
-- City of Malabon University — Science, Technology and Society course syllabus
-- Polytechnic University of the Philippines — Science and Technology (Enhanced) course outline
-- Far Eastern University — Science, Technology and Society module facilitation guide (GED0104)
-- CHED — Science, Technology and Society GE course description (CMO 20, s.2013)
-- CHED CMO No. 25, s.2015 — PSGs for BSIT programs
-- ============================================================
