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

-- ============================================================
-- LESSON 2: Rizal's Early Life and Education
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('d2a72c3b-74c2-5b37-94c2-7c1748823e4e','content','Family Background and Childhood',$md$
José Rizal was born on **June 19, 1861**, in Calamba, Laguna. He was the seventh of 11 children in a middle-class family. His parents, **Don Francisco Mercado** and **Doña Teodora Alonso**, were educated and taught Rizal the value of learning. From a young age, Rizal showed genius in many fields: he learned to speak Tagalog, Spanish, Latin, and other languages as a child; he was an excellent student in history, science, and the arts; and he loved drawing and sketching his surroundings (even making an eye glass out of coconut when he was only 5!).

Rizal's family was well-connected: his older brother **Paciano** introduced him to Filipino patriots and political ideas. The close-knit Mercado family also faced challenges: under Spanish rule, they had to pay high taxes and risked being accused by unfair authorities. These experiences in childhood—seeing injustice and also being nurtured by a loving family—helped shape Rizal's sense of responsibility to his country.
$md$, 1),
('d2a72c3b-74c2-5b37-94c2-7c1748823e4e','content','Education in the Philippines (Ateneo and UST)',$md$
Rizal's formal education took place in Manila. At age 11, he passed the entrance exam for the **Ateneo Municipal de Manila** (run by Jesuits), where he excelled in Latin, philosophy, and literature, graduating with honors. Later, he enrolled at the **University of Santo Tomas (UST)** to study medicine. Here he first encountered discrimination: Spanish professors often insulted Filipino students and Catholic friars controlled much of campus life. Rizal even wrote a letter protesting unfair fees to the rector of UST.

His time in the Philippines also introduced him to literature and history. He read books on Enlightenment ideas and the history of Spain and Europe, broadening his worldview. However, he grew frustrated by the colonial system and its limits on Filipinos. By 1882, Rizal left UST disillusioned and decided to continue his studies abroad, believing he could gain a better education and perspective in Europe.
$md$, 2),
('d2a72c3b-74c2-5b37-94c2-7c1748823e4e','activity','Studies in Europe and La Solidaridad',$md$
In 1882, Rizal traveled to **Madrid, Spain** to study. In Europe, he completed his medical degree (specializing in ophthalmology) and also studied philosophy. He lived in Madrid and later Paris, where liberal ideas flowed freely. In Europe, Rizal wrote novels, poetry, and essays in Spanish. Crucially, he co-founded the newspaper **La Solidaridad** with other Filipino students and intellectuals (called the **Ilustrados**). Through *La Solidaridad*, Rizal and his friends campaigned for reforms in the Philippines, such as representation in the Spanish Cortes (parliament) and equality before the law.

His exposure to Europe's freedom helped Rizal develop nationalist ideas. He saw how people of different nations fought for their rights. Rizal also mingled with other Asians and writers, comparing the Filipino situation to others. In Europe, he wrote his masterpiece **Noli Me Tangere** (1887) and started **El Filibusterismo**. His time abroad made him a bridge between Western liberal thought and Filipino aspirations.

*Ready to apply this? The practice set below walks through exam-style questions with step-by-step guidance.*
$md$, 3),
('d2a72c3b-74c2-5b37-94c2-7c1748823e4e','activity','Practice & Exam Drills — Lesson 2',$md$
**Review Questions**

1. Name Rizal's parents and describe their influence on him.
2. Where did Rizal study in Manila, and what challenges did he face there?
3. What did Rizal study in Spain, and what new perspective did he gain?
4. What was *La Solidaridad*, and why was it important for Rizal?
5. List one way Rizal's early experiences in the Philippines influenced his later ideas.

**Worked Exam-Style Problems**

*Problem 1:* Explain how Rizal's family background influenced his patriotism.

*Solution:* Step 1: Mention Rizal's close family (Mercado family) and their educational values. Step 2: Describe Paciano's role in introducing Rizal to Filipino patriots. Step 3: Note how familial love and witnessing injustice (e.g., when Rizal's mother was imprisoned on false charges) shaped his values. Step 4: Conclude that because of his family's support and experiences, Rizal developed empathy for fellow Filipinos and a strong sense of justice.

*Problem 2:* Discuss the significance of Rizal's education abroad. How did it change his views?

*Solution:* Step 1: State what he studied (medicine, liberal arts) and where (Madrid, Paris). Step 2: Explain that in Europe he met reformists and saw freer societies. Step 3: Mention how being exposed to Enlightenment ideas deepened his understanding of rights and nationhood. Step 4: Conclude that his European education gave him the knowledge and perspective to critique Spanish colonialism through his writings and activism.

*Problem 3:* Describe one challenge Rizal faced in the Philippines and how he responded to it.

*Solution:* Step 1: Identify a challenge (e.g., colonial discrimination at UST or unfair accusation against family). Step 2: Explain Rizal's reaction: at UST he protested fees in writing, showing early activism; regarding family, he became determined to fight injustice. Step 3: Show how this challenge pushed him to seek change (studying abroad and writing reform works).

**Hands-On Exercise**

*Project:* Create a timeline of Rizal's education and travels from age 11 to age 30. Highlight the key places (Calamba, Manila, Madrid, Paris, etc.) and what he achieved at each stage (graduated Ateneo, published first essays, wrote novels, etc.).

**How to Pass Tips**

- **Connect Events:** Link Rizal's personal experiences to his later work. For example, explain how an insult he faced at UST motivated his critique of the Church in *Noli*.
- **Key Dates/Places:** Memorize a few key dates (birth/death years) and places (Ateneo 1877, Madrid 1882, *Noli* published 1887).
- **Distinguish Facts:** Don't confuse Rizal's timeline (he finished his medical degree in Madrid, not in the Philippines).
- **Understand, Don't Just List:** Instead of just listing Rizal's stops, explain why each was important (e.g., Paris broadened his nationalist ideas).
$md$, 4);

-- ============================================================
-- LESSON 3: Noli Me Tangere – The First Novel
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('8d98f980-8131-52bf-a2c0-09abffc87aa6','content','Background of Noli Me Tangere',$md$
**Noli Me Tangere** (Touch Me Not) was Rizal's first novel, completed in 1887. He wrote it in Europe (using a German typewriter) under the pen name "Dimasalang." The novel's title (Latin for "touch me not") comes from a Bible phrase but here hints that Philippine society was sensitive and needed healing. Rizal wrote *Noli* to reveal the "social cancers" of Philippine society – abuse of power, corruption in government and Church, and injustice toward the poor.

The context of *Noli*: it was a bold move. Rizal knew that criticizing the Spanish colonial system could bring danger. Indeed, *Noli* was banned by Spanish authorities and Church officials when Filipino students brought copies to the Philippines. *Noli* became famous among the Ilustrados (educated Filipinos) for its critical stance and its call for reform.
$md$, 1),
('8d98f980-8131-52bf-a2c0-09abffc87aa6','content','Summary of Noli Me Tangere',$md$
The novel follows **Crisóstomo Ibarra**, a young, wealthy Filipino who returns to the Philippines from Europe. He discovers that his father, Don Rafael, died wrongly while imprisoned. Ibarra's fiancée, **María Clara**, is raised by the kindly Father Dámaso (a friar). Many characters represent Philippine society: the scheming **Padre Dámaso**, the brave **Elías** (a boatman and rebel), and the generous **Capitán Tiago** (María Clara's father). The story takes place in the fictional town of San Diego but clearly mirrors real places.

Major events: Ibarra plans to build a school for the townspeople but faces opposition. A tragic subplot involves **Sisa**, a poor mother whose sons are abused by soldiers, symbolizing the suffering of common folk. The novel ends with an attempted rebellion and Ibarra fleeing for safety. Through these events, Rizal paints a detailed picture of the injustices (like forced labor, discrimination, and evil clergy) affecting Filipinos.
$md$, 2),
('8d98f980-8131-52bf-a2c0-09abffc87aa6','activity','Themes and Impact of Noli Me Tangere',$md$
*Noli Me Tangere* highlights several themes:

- **Social Injustice:** It exposes how the powerful (friars and officials) exploit the poor.
- **Identity and Education:** Ibarra's belief in education for reform reflects Rizal's own advocacy.
- **Religion vs. Faith:** The novel criticizes corrupt clergy but also shows true faith through sympathetic characters like Elías.

The impact was huge. Filipinos who read *Noli* felt a sense of shared suffering and realized the need for change. The novel stirred nationalist ideas, making readers ask "Why must Filipinos endure this?". However, the Spanish authorities saw it as a threat. *Noli* led to stricter censorship. But among Filipinos, it became a symbol of awakening – a reason to start talking about reform and rights openly.

*Ready to apply this? The practice set below walks through exam-style questions with step-by-step solutions and analytical prompts.*
$md$, 3),
('8d98f980-8131-52bf-a2c0-09abffc87aa6','activity','Practice & Exam Drills — Lesson 3',$md$
**Review Questions**

1. In what year was *Noli Me Tangere* published, and why was this significant?
2. Who is Crisóstomo Ibarra and what is his dream for his hometown?
3. Name two injustices or abuses depicted in *Noli Me Tangere*.
4. What happened to Sisa and her sons, and what does this represent?
5. How did Spanish authorities react to the publication of *Noli Me Tangere*?

**Worked Exam-Style Problems**

*Problem 1:* Explain the significance of Crisóstomo Ibarra's character in *Noli Me Tangere*.

*Solution:* Step 1: Identify Ibarra as the protagonist, a reform-minded Filipino. Step 2: Discuss his ideals – he believes in education and peaceful reform (building a school). Step 3: Contrast him with other characters (like Elías or Padre Dámaso) to show his role as a bridge between oppressed Filipinos and the colonial rulers. Step 4: Conclude that Ibarra's journey (from hope to disillusionment) mirrors the awakening of the Filipino people and their loss of innocence.

*Problem 2:* Discuss two social issues highlighted in *Noli Me Tangere*, providing examples from the novel.

*Solution:* Step 1: Issue 1 – Corruption by clergy (e.g., Padre Dámaso's abuse of power, undermining the church's moral authority). Step 2: Explain how this reveals hypocrisy and cruelty. Step 3: Issue 2 – Oppression of the poor (e.g., Sisa's tragic story where her sons are killed by soldiers). Step 4: Show how this represents the widespread suffering of ordinary Filipinos. Step 5: Conclude that by depicting these issues, Rizal calls readers to notice and fix such injustices.

*Problem 3:* How did *Noli Me Tangere* contribute to the Filipino nationalist movement?

*Solution:* Step 1: Explain that *Noli* raised awareness of shared problems under colonialism. Step 2: Note that the novel was widely read by Ilustrados and reformists, inspiring discussions on equality and rights. Step 3: Mention that the harsh reaction (censorship, book burnings) proved the novel's power. Step 4: Conclude that *Noli* became a catalyst that helped Filipinos feel united against injustice.

**Hands-On Exercise**

*Character Analysis:* Choose one major character from *Noli Me Tangere* (e.g., María Clara, Padre Dámaso, or Elías). Write a paragraph describing how this character represents a part of Philippine society or value. For example, what does your chosen character tell us about colonial Philippines?

**How to Pass Tips**

- **Focus on Key Scenes:** Memorize a few vivid episodes (like the school inauguration or Sisa's madness) to illustrate your answers, but avoid reciting everything.
- **Themes Over Plot Details:** Professors often ask about themes (injustice, nationalism) rather than expecting a full summary.
- **Know Characters:** Be able to identify main characters and their roles (María Clara symbolizes innocence, Elías symbolizes revolution).
- **Don't Memorize as a Story:** If asked, give the answer in your own words focusing on the novel's message.
- **Language:** Even though the novel was in Spanish, you can answer in Filipino or English. Understanding matters, not quoting Spanish text.
$md$, 4);

-- ============================================================
-- LESSON 4: El Filibusterismo – The Sequel and Revenge
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('243cbf27-b3bc-5465-9e7b-f391da3184f9','content','Background of El Filibusterismo',$md$
**El Filibusterismo** (The Reign of Greed) was Rizal's second novel, published in 1891. He worked on it while exiled in Dapitan and finished it earlier through friends abroad. The word "filibuster" means revolt, so the title suggests uprising. Rizal originally planned it as a continuation of *Noli*, a decade later. In mood and tone, *El Filibusterismo* is darker and more cynical than *Noli*. Rizal was frustrated that *Noli* did not spark immediate change, so *El Fili* explores what might happen if some Filipinos take a more desperate, violent path.

The novel is dedicated to three martyr priests (**Gomburza**), indicating Rizal's sympathy with Filipino clergy who were punished for reformist ideas. *El Fili* shows Rizal's shift in thinking: he still doesn't fully join a revolution, but he understands the growing anger.
$md$, 1),
('243cbf27-b3bc-5465-9e7b-f391da3184f9','content','Summary of El Filibusterismo',$md$
In *El Fili*, Crisóstomo Ibarra returns under the alias **Simoun**, a wealthy jeweler. He secretly plots revenge on the corrupt Spanish regime. Key characters include **Basilio** (the studious boy from *Noli*, now grown and studying medicine) and **Isagani** (a passionate student). Simoun befriends these Filipinos while planning to incite an uprising at a grand party he intends to bomb.

Major events: Simoun funds discontent by stirring resentment at the University of Santo Tomas (denying degrees for political reasons) and organizing smugglers with Don Custodio, a corrupt official. During a luxurious banquet, Simoun reveals bombs hidden in lamps, but the plan fails when one lamp is extinguished prematurely. The bomb kills Don Custodio instead of Spanish officials, foiling Simoun's revolution. In the end, Simoun realizes the plan led to more tragedy and confesses himself to authorities.

Through these events, *El Fili* portrays the revolution as matured anger. Simoun's failure suggests that violence without a unified plan is futile.
$md$, 2),
('243cbf27-b3bc-5465-9e7b-f391da3184f9','activity','Themes and Impact of El Filibusterismo',$md$
*El Filibusterismo* explores themes of revenge, revolution, and moral choices. Major themes include:

- **Sacrifice vs. Ambition:** Simoun's pursuit of revenge shows how obsession with justice can consume a person.
- **Education and Responsibility:** Basilio's journey (he finally confronts the wrongs done to his family) highlights Filipino desire for education and justice.
- **Nationalism evolving:** The novel reflects the idea that some Filipinos became more radical when peaceful reforms failed.

**Impact:** The novel shocked readers with its critical tone. It confirmed Rizal's fears about the dangers of uncontrolled anger. For Filipino society, *El Fili* intensified the call for change. It showed that true reform would require either a complete overhaul or new leadership. The reaction to *El Fili* was similar to *Noli*: it was feared by colonial authorities but beloved by reformists. Together, *Noli* and *El Fili* laid a literary foundation for revolution, even though Rizal himself was later executed before the revolution succeeded.

*Ready to apply this? The practice set below includes detailed Q&A and scenario analyses.*
$md$, 3),
('243cbf27-b3bc-5465-9e7b-f391da3184f9','activity','Practice & Exam Drills — Lesson 4',$md$
**Review Questions**

1. What is the alter ego of Crisóstomo Ibarra in *El Filibusterismo*, and what is his mission?
2. How does *El Fili* differ in tone from *Noli Me Tangere*?
3. Describe one key event or plot point from *El Filibusterismo*.
4. What is the significance of the banquet scene at the end of the novel?
5. Name two themes explored in *El Filibusterismo*.

**Worked Exam-Style Problems**

*Problem 1:* Compare the characters of Ibarra in *Noli* and Simoun in *El Fili*. What do they represent?

*Solution:* Step 1: Identify Ibarra as the idealistic reformist in *Noli* vs. Simoun as the vengeful revolutionary in *El Fili*. Step 2: Explain Ibarra's goals (education, peaceful reform) and Simoun's goals (violent revolution). Step 3: Discuss that both are the same person, showing Rizal's own inner conflict on how best to help the country. Step 4: Conclude that this transformation represents the frustration of peaceful reform and the lure/danger of violent action.

*Problem 2:* Explain the theme of sacrifice in *El Filibusterismo*, citing an example from the novel.

*Solution:* Step 1: Define "sacrifice" in context (giving up something for a cause). Step 2: One example is the personal sacrifices Basilio makes for his family; another is Simoun himself, who sacrifices his freedom (and life) by accepting the consequences of his plot. Step 3: Explain how these sacrifices highlight the high cost of the fight for justice. Step 4: Conclude that Rizal shows sacrifice is noble but tragic if it comes from destructive ends.

*Problem 3:* Discuss the message Rizal might have intended about revolution by ending *El Filibusterismo* the way he did.

*Solution:* Step 1: Note that Simoun's plan fails and he confesses defeat. Step 2: Suggest Rizal's message: revolution without unity or moral purpose can fail and cause more harm. Step 3: Highlight that Rizal portrays both the impetus for revolution (oppression) and its potential pitfalls. Step 4: Conclude that Rizal seemed to warn that Filipinos must think carefully about how to achieve freedom.

**Hands-On Exercise**

*Compare and Contrast:* Create a two-column chart comparing *Noli Me Tangere* and *El Filibusterismo*. For example, list tone (hopeful vs. dark), main character goals (reform vs. revenge), and outcomes. Use this chart to write a short paragraph on how Rizal's views evolved between the two novels.

**How to Pass Tips**

- **Be Clear on Timeline:** Remember *El Fili* was published after *Noli*, showing progression. Place it in chronology (1891).
- **Know Key Symbols:** Understand what symbols mean (Simoun's jewels/wealth as the corrupting means; the lamp-bomb as the downfall of Simoun's revenge).
- **Focus on Motivations:** Why does Simoun do what he does? Why do Basilio and Isagani take certain actions? Understanding motives is key.
- **Don't Rely on Memory Alone:** You don't need every chapter. Focus on main events and what they mean for Philippine society at that time.
- **Personal Insight:** Questions may ask for your interpretation of Rizal's message. Connect his warnings to real consequences of unplanned violence.
$md$, 4);

