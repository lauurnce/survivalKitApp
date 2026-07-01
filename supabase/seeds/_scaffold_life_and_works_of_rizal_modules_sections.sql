-- ============================================================
-- The Life and Works of Rizal — Modules & Sections
-- Subject ID: 6c302241-54af-4da4-9078-d1c65c1ce6e7
-- 2nd Year, Semester 2 — minor
-- 6 lessons. Split: S1+S2 = content (FREE); remaining teaching blocks + drill
--   = activity (PAID). L1-L5 have 3 content blocks -> 2 free / 2 paid;
--   L6 has 4 content blocks -> 2 free / 3 paid.
-- No IDE playgrounds (history subject). Re-running is safe (DELETE clears prior rows).
-- ============================================================

DELETE FROM modules WHERE subject_id = '6c302241-54af-4da4-9078-d1c65c1ce6e7';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('dea97086-e17e-5982-9083-c9a9376b37f9','6c302241-54af-4da4-9078-d1c65c1ce6e7','Lesson 1: Rizal Law, Context, and Nationalism','lesson-1-rizal-law-context-and-nationalism',1),
  ('d2a72c3b-74c2-5b37-94c2-7c1748823e4e','6c302241-54af-4da4-9078-d1c65c1ce6e7','Lesson 2: Rizal''s Early Life and Education','lesson-2-rizals-early-life-and-education',2),
  ('8d98f980-8131-52bf-a2c0-09abffc87aa6','6c302241-54af-4da4-9078-d1c65c1ce6e7','Lesson 3: Noli Me Tangere – The First Novel','lesson-3-noli-me-tangere-the-first-novel',3),
  ('243cbf27-b3bc-5465-9e7b-f391da3184f9','6c302241-54af-4da4-9078-d1c65c1ce6e7','Lesson 4: El Filibusterismo – The Sequel and Revenge','lesson-4-el-filibusterismo-the-sequel-and-revenge',4),
  ('f6fadc56-2224-5b7d-9510-40bc86ccdcd1','6c302241-54af-4da4-9078-d1c65c1ce6e7','Lesson 5: Rizal''s Essays, Letters, and Other Writings','lesson-5-rizals-essays-letters-and-other-writings',5),
  ('aa5af8b0-2bec-5dfc-987d-ca07895784ce','6c302241-54af-4da4-9078-d1c65c1ce6e7','Lesson 6: Rizal''s Reform Efforts, Martyrdom, and Legacy','lesson-6-rizals-reform-efforts-martyrdom-and-legacy',6);

-- ============================================================
-- LESSON 1: Rizal Law, Context, and Nationalism
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('dea97086-e17e-5982-9083-c9a9376b37f9','content','Why Study Rizal? Republic Act 1425 (Rizal Law)',$md$
The **Rizal Law (Republic Act 1425)** was passed in 1956. It mandates teaching the life and works of José Rizal in all schools. This law recognizes Rizal as a national hero who fought for freedom through ideas. In practice, it means every college student studies Rizal's story and writings. The law aims to build patriotism, love of country, and respect for Filipino heritage by learning about Rizal's example.

Rizal's story is not just history – it's a living lesson. He promoted education, character, and civic duty. Studying Rizal helps students understand values like honesty, courage, and service to the community. While learning about Rizal, think: How do Rizal's values apply to our lives today?
$md$, 1),
('dea97086-e17e-5982-9083-c9a9376b37f9','content','19th Century Philippines under Spanish Rule',$md$
To understand Rizal, we must see the Philippines of his time. In the late 1800s, the Philippines was a Spanish colony. Society was divided: the ruling Spaniards and friars had power and wealth, while many Filipinos were poor farmers or workers. Big estates (called **haciendas**) were controlled by elites. Education and government jobs were mostly for Spaniards.

Economically, the Philippines was opening up. The **Suez Canal** (opened 1869) and new trade meant ideas and goods arrived faster. Some Filipinos prospered (often educated **Ilustrados** or mestizos), but many still suffered under heavy taxes and unjust laws. Social issues like illiteracy and the suppression of the native language were common. These conditions set the stage for nationalism: a growing desire for more rights, representation, and identity among Filipinos.
$md$, 2),
('dea97086-e17e-5982-9083-c9a9376b37f9','activity','Rise of Philippine Nationalism and Other Heroes',$md$
In Rizal's era, the concept of nationhood and **nationalism** was spreading worldwide. In the Philippines, nationalism meant love of country and a desire for self-determination. Filipinos began to feel united not by provinces but as one nation with shared struggles.

Along with Rizal, other figures shaped nationalism. **Andrés Bonifacio** and **Emilio Jacinto** founded the **Katipunan**, a secret movement pushing for independence by revolution. Historians like **Marcelo H. del Pilar** and **Graciano López Jaena** wrote for reforms. Rizal himself wrote articles in **La Solidaridad** (a reformist newspaper).

Understanding nationalism helps explain Rizal's role. He inspired pride and critical thinking: he showed Filipinos that their identity and culture mattered. He also emphasized peaceful reforms (education, civic projects) as a path to change. Together, Rizal and his peers laid the ideological groundwork that later fueled the Philippine Revolution.

*Ready to apply this? The practice set below walks through exam-style questions with guided answers.*
$md$, 3),
('dea97086-e17e-5982-9083-c9a9376b37f9','activity','Practice & Exam Drills — Lesson 1',$md$
**Review Questions**

1. What is Republic Act 1425 (the Rizal Law) and why was it enacted?
2. List two key social conditions in the Philippines during the 19th century.
3. Who were the Ilustrados and why were they important in Rizal's time?
4. Define nationalism in the context of 19th-century Philippines.
5. Name two other Filipino figures or movements that influenced nationalism besides Rizal.

**Worked Exam-Style Problems**

*Problem 1:* Explain the importance of Republic Act 1425 in Philippine education and its main objective.

*Solution:* Step 1: Identify RA 1425's key provision: teaching Rizal's life and works. Step 2: Discuss the law's goal – to instill patriotism and national identity. Step 3: Mention context: passed after WWII to strengthen Filipino pride. Step 4: Conclude that by knowing Rizal's example (sacrifice, ideals, love of country), students gain civic values.

*Problem 2:* Describe how 19th-century colonial conditions influenced José Rizal's writings and ideas.

*Solution:* Step 1: List conditions (Spanish oppression, abuses by friars, poverty of Filipinos). Step 2: Explain Rizal was born into a middle-class family and saw injustice in education and law. Step 3: Connect how these experiences appear in his novels (e.g., *Noli Me Tangere* shows corrupt clergy) and essays (e.g., *Indolence of the Filipinos* addresses colonial blame). Step 4: Summarize that Rizal used his writings to critique the system and inspire reform by awakening nationalist feelings.

*Problem 3:* Discuss the role of other Filipino heroes in the rise of nationalism and how Rizal was connected to them.

*Solution:* Step 1: Mention key figures (e.g., Bonifacio, Del Pilar). Step 2: Explain their contributions (Katipunan for Bonifacio, *La Solidaridad* for Del Pilar). Step 3: Show Rizal's interaction (Rizal wrote for *La Solidaridad* and inspired Bonifacio, though Rizal favored reform over revolution). Step 4: Conclude that together, these efforts unified Filipinos under a national identity.

**Hands-On Exercise**

*Essay Task:* Write a short essay (1–2 paragraphs) on "Why is the Rizal Law still relevant today?" Draw from contemporary examples (e.g., national pride, current events referencing Rizal).

**How to Pass Tips**

- **Focus on Context:** Don't just memorize facts; link Rizal's life to the era's historical context (Spanish rule, nationalist movements).
- **Know RA 1425 Key Point:** RA 1425 mandates Rizal's teaching to promote patriotism. The year (1956) or exact text is less important than its purpose.
- **Understand Nationalism:** Be able to explain nationalism in your own words. Professors like discussion on how Rizal influenced Filipino identity.
- **Memorize Smartly:** Important dates (Rizal's birth 1861, death 1896) may help, but clarity on themes is usually more valued.
- **Avoid Common Pitfalls:** Don't confuse Rizal's views with later revolutionaries (he was not a follower of Bonifacio). Critique the system, not the faith.
$md$, 4);

