-- ============================================================
-- Reading in Philippine History, Modules & Sections
-- Subject ID: 10000000-0001-0002-0002-000000000001
-- Run after 1st_year_subjects.sql
-- ============================================================

DELETE FROM modules WHERE subject_id = '10000000-0001-0002-0002-000000000001';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('b2000001-0001-0002-0002-000000000001','10000000-0001-0002-0002-000000000001','The Meaning and Relevance of History','meaning-and-relevance-of-history',1),
  ('b2000001-0001-0002-0002-000000000002','10000000-0001-0002-0002-000000000001','Tests of Authenticity and Credibility','tests-of-authenticity-and-credibility',2),
  ('b2000001-0001-0002-0002-000000000003','10000000-0001-0002-0002-000000000001','Case Study: The Tejeros Convention of 1897','case-study-tejeros-convention',3),
  ('b2000001-0001-0002-0002-000000000004','10000000-0001-0002-0002-000000000001','Early Philippine Chronicles, Pigafetta and Plasencia','early-philippine-chronicles',4),
  ('b2000001-0001-0002-0002-000000000005','10000000-0001-0002-0002-000000000001','The Katipunan, Revolution and Its Documents','katipunan-revolution-documents',5),
  ('b2000001-0001-0002-0002-000000000006','10000000-0001-0002-0002-000000000001','Visual and Documentary Sources in Philippine History','visual-documentary-sources',6),
  ('b2000001-0001-0002-0002-000000000007','10000000-0001-0002-0002-000000000001','Historic Controversies','historic-controversies',7),
  ('b2000001-0001-0002-0002-000000000008','10000000-0001-0002-0002-000000000001','Philippine Constitutions, Indigenous Peoples, and Agrarian Reform','constitutions-ips-agrarian-reform',8),
  ('b2000001-0001-0002-0002-000000000009','10000000-0001-0002-0002-000000000001','Colonial Legacies, Applied Historical Analysis','colonial-legacies-applied-history',9),
  ('b2000001-0001-0002-0002-000000000010','10000000-0001-0002-0002-000000000001','Local History and Philippine Heritage','local-history-and-heritage',10);

-- ============================================================
-- MODULE 1: The Meaning and Relevance of History
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('b2000001-0001-0002-0002-000000000001','content','The Meaning and Relevance of History',$md$
History is more than a catalogue of dates and names. When studied properly, it moves past surface-level facts and asks the deeper questions: *Why did a certain event happen? How did it unfold?* These questions reveal how the past shaped the present and may shape the future.

The discipline of history serves several key purposes, identified by historian Peter Stearns (1998):

- **Moral understanding**, History presents humanity's ethical struggles, achievements, and failures, giving readers material to develop moral judgment.
- **Understanding people and societies**, Examining past behavior reveals patterns in how societies respond to crises, conflicts, and change.
- **Providing identity**, Communities understand who they are partly through their shared historical experiences.
- **Civic formation**, Informed citizenship depends on understanding how political systems, institutions, and rights were fought for and developed.

### Where to Find Historical Sources

Historians don't work from imagination, they work from **sources**: the surviving records, objects, and testimonies of the past.

**Philippine Repositories:**

The **National Library of the Philippines (NLP)** is the primary national depository, housing the Filipiniana Division and Microfilm Section. It holds crucial materials like the Historical Data Papers and Philippine Revolutionary Records.

The **National Archives of the Philippines (NAP)** holds government records from the Spanish colonial period. Other institutions include the Archives of the University of Santo Tomas, the Archdiocesan Archives of Manila (Intramuros), and the SIL Philippines (Quezon City) with approximately 2,000 titles on Philippine languages.

**Foreign Repositories:**

Because the Philippines spent over three centuries under Spanish rule, significant Philippine historical records are scattered internationally:

| Country | Key Archives |
|---|---|
| Spain | Archivo General de Indias (Seville); Archivo Histórico Nacional, Real Academia de la Historia, Biblioteca Nacional de España (all in Madrid). The government's Portal de Archivos Españoles (PARES) offers free online access to many digitized documents. |
| Mexico | Archivo General de la Nación de México, relevant because the Philippines was under the Viceroyalty of New Spain until Mexico's independence in 1821. |
| United Kingdom | British Museum, some Spanish-period documents were taken during the British occupation of Manila (1762–64). |
| United States | National Archives and Records Service (NARS); Library of Congress; Ayer Collection (Newberry Library, Chicago). |

Online archives such as **archive.org** and **Project Gutenberg** offer a growing number of scanned primary sources freely available for download.

### Classification and Types of Historical Sources

**Sources** are defined as artifacts left by the past. They fall into three broad categories.

An **artifact** is any object made or modified by humans for their own purposes, tools, artworks, pottery, documents. An **ecofact** is archaeological evidence from nature (bones, seeds, shells) that was not shaped by humans but still tells us about past environments and cultures.

#### Written Sources

**Primary Sources**, the direct testimony of an eyewitness, or someone who was present at the events being described. Examples: diaries, letters, official documents, newspaper articles written at the time, photographs, and video recordings.

Historian Louis Gottschalk (1950) defines a primary source as "the testimony of an eyewitness, or of a witness by any other of the senses, or of a mechanical device... that is, of one who or that which was present at the events of which he or it tells."

**Secondary Sources**, produced by someone who was *not* present at the events. Examples: bibliographies, encyclopedias, journal articles, monographs, and textbooks.

The key distinction is **proximity to the event**. Primary sources come from inside the experience; secondary sources reflect on it from the outside.

#### Unwritten (Non-Written) Sources

Not all history is recorded in text. Three types of non-written evidence are commonly used:

- **Archaeological evidence**, Artifacts and ecofacts (tools, ornaments, ruins, agricultural implements) that reveal past cultures and lifeways.
- **Oral evidence**, Folk tales, myths, legends, folk songs, and rituals passed down through generations.
- **Material evidence**, Photographs, artworks, videos, and sound recordings.
$md$, 1),

('b2000001-0001-0002-0002-000000000001','activity','Activity, Designing a Research Outline',$md$
Propose a title for a possible research topic in Philippine history. Formulate at least **three (3) problem statements or research questions** that your work would address. Prepare an outline showing the logical flow of your research.

Using digital archives (such as archive.org, PARES, or the National Library's online collections), compile a **bibliography of at least five sources** you would use. Classify each source according to type (primary/secondary, written/unwritten).
$md$, 2);

-- ============================================================
-- MODULE 2: Tests of Authenticity and Credibility
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('b2000001-0001-0002-0002-000000000002','content','Tests of Authenticity and Credibility',$md$
### Method vs. Historiography

**Historical Method** is the process of rigorously examining and critically analyzing the records and survivals of the past, applying a set of scientific rules to determine whether a reconstructed event actually occurred.

**Historiography** refers to the process of *writing* history, synthesizing tested data into a narrative. Before a historian begins writing, they must have completed the methodological work of examining their sources.

### External Criticism: The Test of Authenticity

**Authenticity** means originality. The test asks: *Is this source what it claims to be?*

This test is necessary because:
1. **Sources can be fabricated.** A historical example is the alleged *Maragtas*, a document that historian William Henry Scott (1984) argued was based on suspicious oral traditions and fabricated written sources.
2. **Negative revisionism exists.** Deliberate attempts to downplay, minimize, or distort historical events.
3. **Sources can mislead.** Misleading sources, even unintentionally, miseducate people by distorting the value or meaning of events.

In assessing authenticity, historians examine:
- **Authorship**, Who created the source?
- **Time**, When was the event? When was the source created relative to that event?
- **Space (setting/context)**, Where did the event occur?

### Internal Criticism: The Test of Credibility

Once authenticity is established, the historian turns to **internal criticism**, evaluating whether the source accurately represents reality.

For a source to be credible, Gottschalk (1950) suggests the historian assess:
1. The **competence** of the source (did the author have sufficient knowledge or vantage point?)
2. The **willingness** to tell the truth (was there reason to deceive?)
3. The **adequacy** of the data, is the information detailed and complete enough?
4. The **reliability** when tested against other independent sources

Gottschalk famously described the historian's role as playing "prosecutor, attorney for the defense, judge, and jury all in one."

Every author writes from a particular vantage point, with personal, cultural, or institutional interests that color their account. Identifying these **biases** does not automatically disqualify a source, but it shapes how the historian interprets it.

### Basic Assumptions When Working with Sources

1. Sources are accurate when proven authentic and credible. Relics and artifacts tend to be more reliable; documents and testimonies are more detailed.
2. Authenticity and credibility reinforce each other.
3. A primary source is generally more reliable than a secondary one.
4. Credibility increases when multiple independent sources agree.
5. Sources tend to carry biases toward their place of origin or producing person/institution.
6. Witnesses without direct personal interest tend to be more credible than those with a stake in the outcome.
7. When all independent sources agree on an event, that event is generally accepted as factual.
8. Testimony is most credible when the witness was mentally and emotionally fit at the time of their account.
9. A source that does not fit the milieu of its supposed period is likely fabricated.

### Dealing with Disagreeing or Hostile Sources

When sources contradict each other:
1. If both are equally valid, prefer the one with more logical reasoning and common sense.
2. If authenticity and credibility are unequal, prefer the more solidly authenticated source.
3. Hostile sources must be approached with extra caution and corroborated.
4. Sources representing a fixed ideological viewpoint should be cross-checked against others not aligned with that perspective.

### Ethics in Historical Research

Historians are expected to:
- Be aware of personal biases
- Remain objective and accurate in examining and analyzing sources
- Be impartial in interpretation and synthesis
- Use all relevant sources, including those that challenge their argument
- Cite sources properly
- Avoid plagiarism, fabrication, deception, or academic dishonesty
- Acknowledge debts to other scholars
- Avoid irresponsible or distorted interpretation
- Never use sources to deliberately mislead or modify history for personal benefit
$md$, 1),

('b2000001-0001-0002-0002-000000000002','activity','Activity, Applying Criticism to a Document',$md$
Locate any official document issued about you or your household (for example, a birth certificate, barangay clearance, or community record). Analyze it using the following criteria:

1. **Competence and impartiality**, How capable is the issuing authority of accurately recording the information? Is there any reason it might not be impartial?
2. **Willingness to tell the truth**, What official obligation did the issuer have to be accurate?
3. **Adequacy of data**, Does the document provide enough information, or are there gaps?

Identify at least one other independent source you could use to corroborate this document. What does comparing the two sources tell you?
$md$, 2);

-- ============================================================
-- MODULE 3: Case Study, The Tejeros Convention of 1897
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('b2000001-0001-0002-0002-000000000003','content','Case Study: The Tejeros Convention of 1897',$md$
### Background: The Katipunan Split

The Kataas-taasang Kagalang-galangang Katipunan ng mga Anak ng Bayan (the **Katipunan**), commonly called by its short name, was a secret society founded by Andres Bonifacio to fight for Philippine independence from Spain. By 1896, the Katipunan had expanded rapidly and its internal structures had grown into two major factions:

- **Magdiwang**, based in Noveleta, led by Mariano Alvarez
- **Magdalo**, based in Kawit, led by Baldomero Aguinaldo

Tensions grew between Bonifacio and Emilio Aguinaldo over strategy and leadership. A series of Spanish military defeats further eroded Bonifacio's standing, especially in Cavite.

To resolve the conflict, the **Tejeros Convention** was held on March 22, 1897. Elections were held: Aguinaldo was elected President of the new revolutionary government. When Danielo Tirona challenged Bonifacio's qualification for the position he had been elected to, Bonifacio declared the proceedings null and void. He was later arrested, tried, and executed on charges of treason in Maragondon, Cavite, in May 1897.

The Tejeros Convention is significant to historians not only for its political outcomes but because it illustrates how different sources record the same event very differently depending on the author's position, loyalties, and purpose.

### The Two Primary Sources Under Analysis

**Source 1: *Katipunan and the Revolution: Memoirs of a General* by Santiago V. Alvarez**

Santiago Alvarez (1872–?) was a member of the Magdiwang faction and a direct participant in the events of the revolution. His memoirs were originally serialized in the Tagalog weekly *Sampagita* in the 1920s. Because Alvarez was present at the Tejeros Convention and was a member of the Magdiwang (Bonifacio's closer allies), his account is a **primary source**, but one with clear potential biases stemming from his political loyalties.

**Source 2: *The Revolt of the Masses: The Story of Bonifacio and the Katipunan* by Teodoro A. Agoncillo**

Teodoro Agoncillo (1912–1985) was one of the most prominent Filipino historians of the 20th century, credited with pioneering a **nationalist historiography**, the view that Philippine history must be written from a Filipino perspective, centered on the experiences of ordinary Filipinos. His book, first published in 1956, argues that the masses made the revolution possible.

Because Agoncillo was not an eyewitness to the events, his work is a **secondary source**. However, he drew on a wide range of primary documents and is considered a major scholarly reference.

> **Note:** The original module includes full-text excerpts (approx. 12 scanned pages) from both books as image reproductions. Students are directed to access the original published works: Alvarez (Ateneo de Manila University Press, 1992/1996) and Agoncillo, *Revolt of the Masses* (University of the Philippines Press, 2nd ed. 2002/2005).

### Applying the Tests: A Framework for Comparison

When comparing both accounts of the Tejeros Convention, evaluate:

**External Criticism (Authenticity):**
- Brief description of each source (genre, form, original language, publication history)
- Competence of the author (direct participant vs. later scholar)
- Origin of the information (personal witness vs. documentary research)
- Date of composition relative to the events described

**Internal Criticism (Credibility):**
- What were the objectives of each author?
- Who were the key persons discussed in each account?
- What are the visible biases of each author?
- How do the accounts compare with each other and with other independent sources?
$md$, 1),

('b2000001-0001-0002-0002-000000000003','activity','Activity, Source Comparison Matrix: Tejeros Convention',$md$
Using the two books (Alvarez's *Katipunan and the Revolution* and Agoncillo's *Revolt of the Masses*), complete the following analysis matrices.

**A. Test of Authenticity**

| Source | Brief Description | Author's Competence | Origin of Information | Date of Information and Milieu |
|---|---|---|---|---|
| *Katipunan and the Revolution: Memoirs of a General* | | | | |
| *The Revolt of the Masses: The Story of Bonifacio and the Katipunan* | | | | |

**B. Test of Credibility**

| Source | Objectives of the Event | Key Persons Involved | Biases of the Author | Similarities/Differences with Other Sources |
|---|---|---|---|---|
| *Katipunan and the Revolution* | | | | |
| *The Revolt of the Masses* | | | | |

**C. Conclusion**

Based on your comparison of both sources using the above criteria: Which account do you find more credible regarding the events of the Tejeros Convention? Justify your conclusion with specific evidence from the texts.
$md$, 2);

-- ============================================================
-- MODULE 4: Early Philippine Chronicles, Pigafetta and Plasencia
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('b2000001-0001-0002-0002-000000000004','content','Early Philippine Chronicles, Pigafetta and Plasencia',$md$
### The Age of Exploration and the Philippine Encounter

The Age of Exploration (roughly the 15th and 16th centuries) marked a turning point for the Philippines. In 1521, Ferdinand Magellan's expedition inadvertently reached the Philippine archipelago, setting off a chain of subsequent voyages that would result in the conquest by Miguel López de Legazpi beginning in 1564–1565.

### Antonio Pigafetta and the First Voyage Around the World

**Background on Pigafetta**

Antonio Pigafetta (c. 1491–1531) was an Italian scholar and explorer who became the official chronicler of the Magellan-Elcano expedition. He was among only 18 of the roughly 270 original crew members who returned to Spain, making his account extraordinarily rare.

His account is important because it is a **primary source** (he was aboard the expedition) and remains the most detailed surviving firsthand narrative of the first circumnavigation of the globe.

**The Manuscripts**

Four known manuscript versions survive:
- One in Italian, held at the Ambrosiana Library in Milan
- Three in French, the earliest of which (*Le Voyage et Navigation*) dates to around 1525 in Paris

**Key Events from Pigafetta's Account**

Magellan's fleet, five ships (*Victoria*, *Concepción*, *San Antonio*, *Santiago*, *Trinidad*) and approximately 270 crew, left Seville on August 10, 1519.

Key narrative highlights:
- On October 21, 1520, Magellan discovered the passage between the Atlantic and Pacific Oceans, now called the **Strait of Magellan**. Only three ships made it through.
- Crossing the Pacific brought immense suffering. The crew was reduced to eating leather, sawdust, and mice.
- On **March 16, 1521**, they landed on the island of Zamal (Samar), marking the first European contact with the Philippines. Magellan named the islands the *Archipelago of St. Lazarus*.
- Proceeding to Homonhon, they encountered Rajah Siagun and Rajah Colambu of Butuan and Caraga.
- On March 27–28, they reached Masao (Mazaua?) in Butuan, where Magellan and Rajah Colambu performed a **blood compact**. On March 31, Mass was offered and a cross was erected.
- They sailed to **Cebu**, arriving April 7, 1521, where they met Rajah Humabon. Over 800 natives including Humabon and his wife were baptized. The **Santo Niño** was presented as a gift, an image still venerated in Cebu today.
- **Lapu-Lapu** of Mactan refused to submit. Magellan led an assault on Mactan personally on April 27, 1521 and was killed in the **Battle of Mactan**.

### Fray Juan de Plasencia and the Customs of the Tagalogs

Fray Juan de Plasencia, a Franciscan friar who arrived in the Philippines in 1577, wrote *Customs of the Tagalogs* (c. 1589), one of the earliest and most detailed descriptions of Tagalog religious beliefs, social practices, and daily life.

His account reflects the **perspective of a Spanish missionary**, which creates significant bias: Plasencia consistently frames indigenous religious practices as idolatrous or superstitious. His purpose was partly descriptive and partly evangelical, he documented practices in order to help other missionaries understand and eventually replace them.

**Key Topics in Plasencia's Account**

*On their religious beliefs:*
The Tagalogs recognized a supreme deity they called **Bathala** ("the maker of all things"), who dwelled in heaven. They also venerated the moon (especially during its new phase), certain stars (the morning star, called *Tala*, and the Pleiades, called *Mapolon* and *Balatic*), various idols called *lic-ha*, and crocodiles (*buaya*) out of fear.

*On rites of passage:*
During a girl's first menstrual period, she was blindfolded for four days and four nights while relatives gathered for a feast. After this period, a ritual figure called the *catalonan* bathed her, washed her head, and removed the blindfold, reportedly to bring her good fortune in marriage and fertility.

*On religious specialists (listed by Plasencia as "Priests of the Devil"):*

| Name | Role |
|---|---|
| *Catalonan* | Chief religious officiator; male or female; held in high esteem |
| *Mangagauay* | Healer-witch capable of inducing and curing illness |
| *Manyisalat* | Specialist in matters of love, capable of causing separation between couples |
| *Mancocolam* | One believed to emit fire from themselves at night |
| *Hocloban* | More powerful witch, said to kill with a glance |
| *Silagan* | Found in Catanduanes; believed to eat human livers |
| *Magtatangal* | Said to walk at night without a head or entrails |
| *Osuang* | Sorcerer among the Visayans, said to fly and eat human flesh |
| *Mangagayoma* | Made love charms from herbs, stones, and wood |
| *Sonat* | A kind of bishop figure who assisted the dying and predicted the fate of souls |
| *Pangatahojan* | Soothsayer, predictor of the future |
| *Bayoguin* | A person whose nature inclined toward that of the opposite gender |

*On beliefs about death and burial:*
The deceased was buried beside their house. The Tagalogs believed in an afterlife: *maca* (a place of rest, like paradise) for the just and valiant, and *casamaan* (a place of punishment) for the wicked.

> **Note:** The term "Priest of the Devil" reflects Plasencia's colonial-Christian framing. These roles were understood very differently within Tagalog culture itself.
$md$, 1),

('b2000001-0001-0002-0002-000000000004','activity','Activity, Analyzing Pigafetta and Plasencia',$md$
1. Using a world map and a Philippine map, trace the route of the Magellan expedition from Seville (1519) to the Philippines and back.

2. Explain why Pigafetta's account of the Magellan expedition is considered an essential primary source. What are its strengths? What are its limitations as a source about pre-colonial Filipinos?

3. Analyze Fray de Plasencia's *Customs of the Tagalogs*: focusing on his description of Tagalog religious beliefs and worship practices, does the language he uses suggest any bias? How does Plasencia's perspective compare to that of Antonio de Morga in his *Sucesos de las Islas Filipinas*, another Spanish colonial account, in terms of how each author treats their subject?
$md$, 2);

-- ============================================================
-- MODULE 5: The Katipunan, Revolution and Its Documents
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('b2000001-0001-0002-0002-000000000005','content','The Katipunan and its Key Documents',$md$
### Lesson 1: Kartilya ng Katipunan

#### Context: The Founding of the Katipunan

The Katipunan was founded on July 7, 1892, by Andres Bonifacio and a small group of Manilans, motivated by the failure of the peaceful Reform Movement and the disbanding of José Rizal's La Liga Filipina. In need of an organization that could pursue independence through direct action, Bonifacio built the Katipunan as a mass revolutionary society open to ordinary Filipinos regardless of class.

#### Emilio Jacinto: The Author

The Kartilya is almost universally attributed to **Emilio Jacinto** (c. 1875–1899), who served as Bonifacio's closest intellectual adviser and is often called the "Brain of the Katipunan."

Despite never completing a formal university degree, Jacinto was intellectually gifted. He rose rapidly within the Katipunan, served as intelligence director in the assault on San Juan del Monte on August 30, 1896, and also authored a collection of political and social essays titled *Liwanag at Dilim* (Light and Darkness). He died on April 6, 1899, at the age of approximately 24, after contracting malaria.

#### The Kartilya: Content and Significance

The Kartilya is a primary source containing the oaths and guiding principles that Katipunan members were required to follow. British scholar Jim Richardson (2013) notes it was sold at four *kualta* per copy and continued to circulate even after the revolution shifted to resisting American control.

Richardson distinguishes the Kartilya from Bonifacio's own *Decalogue*: Jacinto's Kartilya was more expansive, focusing on **aspirations and moral values**, the kind of person a Katipunero should aspire to be, rather than simply listing obligations.

Key principles stressed in the Kartilya:
- Love of country as a supreme obligation
- The dignity and equality of all human beings
- Rejection of cruelty, dishonesty, and exploitation
- Reverence for women
- Duty to aid others, especially the poor and oppressed
- Prioritizing collective welfare over personal interest

> **Note:** The full text of the Kartilya is available in Jim Richardson's *The Light of Liberty: Documents and Studies on the Katipunan, 1892–1897* (Ateneo de Manila University Press, 2013, pp. 131–134).

---

### Lesson 2: The Declaration of Philippine Independence

#### Historical Background

The **Philippine Declaration of Independence** was proclaimed by Emilio Aguinaldo on **June 12, 1898**, at his ancestral house in Kawit, Cavite. This proclamation came in the context of the Spanish-American War, during which U.S. naval forces under Commodore George Dewey had destroyed the Spanish fleet in Manila Bay on May 1, 1898.

The declaration document, known formally as the **Acta de la Proclamación de la Independencia del Pueblo Filipino**, was written and publicly read by **Ambrocio Rianzares Bautista** before a crowd of thousands. At the same occasion:
- The Philippine flag, sewn in Hong Kong, was raised and waved publicly for the first time
- The national anthem was performed for the first time by composer **Julian Felipe**

#### Points of Historical Interest and Controversy

1. **Aguinaldo's missing signature.** Of the 98 signatories, Aguinaldo's signature does not appear (Ocampo, 2020). The reasons remain a subject of historical discussion.
2. **American presence.** Commodore Dewey was invited but did not appear. An American military officer, Colonel L.M. Johnson, was among the signatories.
3. **Apolinario Mabini's opposition.** Mabini considered the proclamation "reckless and premature." He believed the Philippines was not yet ready, it needed more weapons and ammunition.
4. **Absence of immediate ratification.** The declaration was not immediately promulgated into law or recognized internationally.

> **Note:** The full text of the *Acta de la Proclamación* (English translation by Sulpicio Guevara) is available through the Official Gazette of the Philippines online.

---

### Lesson 3: The Malolos Constitution and the First Philippine Republic

#### From Revolution to Republic

The proclamation of independence set in motion a process of political organization. On **September 15, 1898**, the Revolutionary Congress convened at the **Church of Barasoain** in Malolos, Bulacan to draft the constitution. This body became known as the **Malolos Congress**.

After revisions and debate, Aguinaldo promulgated the **Malolos Constitution** on **January 21, 1899**.

Key features:
- It established **three branches of government**: Executive, Legislative, and Judiciary
- It was composed of **93 articles** divided into **14 titles**, plus transitory provisions
- It is historically significant as the **first Philippine constitution** and the **first republican constitution enacted in Asia**

On **January 23, 1899**, the **First Republic of the Philippines** was inaugurated in Malolos, with Aguinaldo as President.

> **Note:** The full text of the Malolos Constitution is accessible through the Official Gazette of the Philippines online.
$md$, 1),

('b2000001-0001-0002-0002-000000000005','activity','Activities, Katipunan and Revolution Documents',$md$
## Activity A, Reflecting on the Kartilya

After reading the full text of the Kartilya ng Katipunan (available in Richardson, 2013, or accessible through digital archives):

1. Write a reflection paper (three paragraphs, 3–5 sentences each) on the relevance of the Kartilya's principles toward the goal of national independence. Consider whether the values it espouses are still relevant today.

2. Choose two specific teachings from the Kartilya. For each, write one paragraph explaining the teaching and relating it to a personal experience or contemporary situation in your own life.

---

## Activity B, Analyzing the Declaration as a Source

After reading the full text of the *Acta de la Proclamación* (available online at the Official Gazette or through Guevara, 1972):

**A. Sourcing the Document**
1. Is this document a primary source? Explain your reasoning.
2. Do you think the author (Rianzares Bautista) is a credible source for this document? Why or why not?
3. For whom was this document intended? Why do you think it was written?

**B. Comprehension**
4. What are the author's main arguments in the document?
5. Identify one historical fact that can be verified from this document.
6. Are there any provisions that you feel should not have been included? Explain your reasoning.

**C. Interpretation**
7. Does this document tell you anything you did not previously know? What is it?
8. Does the evidence support or contradict what you have learned from other sources?
9. What claims in this document should be cross-checked with other sources?
10. Does this source broaden or deepen your understanding of the period? How?

---

## Activity C, Comparing Constitutional Provisions

Access the texts of the Philippine constitutions through the Official Gazette and complete the matrix below. For each comparison point, identify at least one similarity and one difference.

| Constitution | National Territory | Bill of Rights | Citizenship |
|---|---|---|---|
| 1935 Constitution | | | |
| 1943 Constitution | | | |
| 1973 Constitution | | | |
| 1987 Constitution | | | |
$md$, 2);

-- ============================================================
-- MODULE 6: Visual and Documentary Sources in Philippine History
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('b2000001-0001-0002-0002-000000000006','content','Visual and Documentary Sources in Philippine History',$md$
### Lesson 1: Visual Sources in the Study of History

History is not recorded only in written texts. Visual sources, photographs, paintings, drawings, maps, and political cartoons, are also primary sources that reveal how people saw, experienced, and represented the world around them.

Like any primary source, visual sources carry the biases and perspectives of their creators. Reading them critically requires asking: *Who created this? For what audience? With what purpose?*

#### Political Cartoons as Historical Sources

**Political cartoons** are illustrations that translate editorial positions into satirical, sarcastic, or burlesque images. They reflect public perception and are powerful indicators of the social climate.

The book *Political Cartoons: Political Caricature of the American Era, 1901–1941* (1985), authored by Alfred McCoy and Alfredo Roces, collects cartoons from local publications and analyzes them as evidence of political culture during the American period.

**Key themes depicted in these cartoons:**

- **Unequal pay**, Cartoons from *The Independent* (1915) and *Bag-ong Kusog* (1928) criticized the salary gap between American and Filipino workers doing equivalent jobs.
- **Power dynamics between colonizer and colonized**, A cartoon from *Lipag Kalabaw* (November 14, 1908) depicted Juan dela Cruz (representing the Filipino) questioning Uncle Sam (representing the United States) about restrictions on freedom of speech. The relative size and posture of the figures visually communicated the colonial power imbalance.
- **Anti-friar sentiment**, Even as Spanish influence waned politically, cartoonists mercilessly satirized the continued political power of the Catholic friars.
- **Filipino politicians and corruption**, Manila's political class was repeatedly depicted as self-serving and corrupt.
- **Anti-Chinese and later anti-Japanese sentiment**, Cartoonists turned critical attention toward Chinese merchants (during the rice crisis of 1919) and later toward Japan's expanding military ambitions.

#### Juan Luna and the Spoliarium

**Juan Luna** (1857–1899) was born in Badoc, Ilocos Norte and is remembered as one of the Philippines' greatest painters. His most celebrated masterpiece, the **Spoliarium**, depicts the aftermath of gladiatorial combat in ancient Rome. The painting measures 4.22 × 7.675 meters and is the largest painting in the Philippines.

Technically, the Spoliarium is notable for its dramatic use of **chiaroscuro**, the contrasting of light and dark, which highlights mangled bodies against a dark, oppressive background.

Allegorically, José Rizal interpreted the Spoliarium as a representation of the condition of the Philippines under colonial rule, humanity unredeemed, idealism in struggle against injustice. Rizal declared that "genius knows no country; genius sprouts everywhere."

#### Fernando Amorsolo: Landscape and War

**Fernando Amorsolo** (1892–1972) was named National Artist in Painting in 1972.

During World War II, Amorsolo shifted from his signature luminous landscapes of rural Filipino life to witnessing and painting the destruction brought by war:
- **The Bombing of the Intendencia**, painted from his house as he observed the burning of the colonial customs building
- **The Burning of Manila**, depicts the widespread destruction of the capital during the Japanese occupation

His earlier painting **Planting Rice** (1951) became iconic, a luminous depiction of women working in ricefields.

---

### Lesson 2: Documentaries as Historical Sources

A **documentary film** occupies a complex place in historical source typology:
- If it contains actual footage, recordings, or interviews from the period being studied, that footage may constitute a primary source
- The documentary itself as a curated, edited work is a **secondary source**, the filmmaker's interpretation of events
- Like all secondary sources, documentaries must be examined for selection bias, editorial choices, and the perspectives the filmmaker privileges or omits

When evaluating any documentary as a historical source, ask:
- Who made it, and when?
- What primary sources does it draw on?
- Whose voices and perspectives are included? Whose are absent?
- What is the documentary's argument or thesis?
- Does the evidence it presents support its conclusions?
$md$, 1),

('b2000001-0001-0002-0002-000000000006','activity','Activity, Reading a Visual Source',$md$
Select any one of the following:
- A political cartoon from a Philippine newspaper of the American period (available through archive.org)
- The painting *Spoliarium* by Juan Luna (viewable at the National Museum of the Philippines' online collection)
- Any photograph from the Philippine-American War period

Write an analysis addressing:
1. Who created this image, and when?
2. What is depicted literally?
3. What message or argument does the image convey?
4. What biases or perspectives does the creator bring to this image?
5. What can this image tell us that a written text might not?
$md$, 2);

-- ============================================================
-- MODULE 7: Historic Controversies
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('b2000001-0001-0002-0002-000000000007','content','Historic Controversies',$md$
### Lesson 1: The Site of the First Mass

#### The Controversy

One of the most debated questions in Philippine colonial history is: *Where did the first Easter Mass on Philippine soil take place?* The two main competing claims are **Limasawa** (Southern Leyte) and **Butuan** (Agusan del Norte).

The debate is based on **Pigafetta's account** of the Magellan expedition, specifically his identification of a location he called "Mazaua" or "Masao", the place where Magellan's crew first heard Mass in the Philippines on March 31, 1521.

#### The Historical Backdrop

The journey followed Magellan's first contact with the Philippine archipelago on March 16, 1521 (Samar). The crew made contact with Rajah Colambu in Homonhon, then sailed to the location identified as Mazaua, arriving March 28–29 and departing April 4. It was at Mazaua that Fr. Pedro de Valderrama offered Mass on March 31.

#### The Competing Claims

**The Limasawa Position:**
Proponents argue that Mazaua refers to Limasawa, a small island in Southern Leyte. This was the position of the National Historical Commission of the Philippines (NHCP) for most of the 20th century. Its supporters cite navigational and geographical evidence from Pigafetta's account that aligns with Limasawa's location, currents, and visible landmarks.

**The Butuan/Masao Position:**
Proponents argue that Mazaua refers to Masao in Butuan, Agusan del Norte. They point to the explicit mention of Butuan in Pigafetta's account and to the coordinates Pigafetta recorded (approximately 9 degrees 40 minutes North latitude), which they argue places the location more consistent with Butuan's latitude.

#### Key Investigations and Panels

**The Gancayco Committee (1979):**
The Gancayco Report concluded in favor of Limasawa based on assessment of sailing routes, land forms, river deltas, and geographical location. This report was used as a basis by the NHCP for decades.

**The Mojares Panel (2018–2019):**
In preparation for the 500th anniversary of the arrival of Christianity in the Philippines, the NHCP and the National Quincentennial Committee created a new panel chaired by Dr. Resil Mojares. Two respondents, Gabriel Atega and Dr. Potenciano Malvar, both argued in favor of Butuan but from different directions, noting that from heights near an 1872 monument in Magallanes, Agusan del Norte, Camiguin Island appears as three visible "mountains" to the west-southwest, aligning with accounts of three islands visible from the location of the cross-planting.

**The controversy remains unresolved** at the scholarly level and continues to be a subject of active historical debate.

---

### Lesson 2: The Cavite Mutiny of 1872

#### Overview

The **Cavite Mutiny** (*La Algarada Caviteña*) was a brief uprising of Filipino soldiers and laborers serving the Spanish armed forces at **Fort San Felipe** in Cavite Province on January 20, 1872. The mutineers believed their action could spark a wider national uprising, but the Spanish military crushed it within hours.

The most consequential result was the arrest, trial, and public execution on **February 17, 1872** of three priests prominent in the movement for secularization, the transfer of parishes from Spanish friars to Filipino secular clergy:

- **Fr. Mariano Gómez** (age 73)
- **Fr. José Burgos** (age 35)
- **Fr. Jacinto Zamora** (age 37)

Known collectively as **GOMBURZA**, the three were executed by garrote at Bagumbayan (now Luneta). Their executions directly inspired José Rizal, who dedicated his novel *El Filibusterismo* to their memory. GOMBURZA are remembered as martyrs of Filipino nationalism.

#### Three Versions of the Events

Three surviving accounts of the Cavite Mutiny, all translated and published by historian Gregorio Zaide (1990) in *Documentary Sources of Philippine History*, demonstrate sharply different perspectives:

**1. The Spanish Version, José Montero y Vidal**
A Spanish government official in Manila. His account is heavily biased against Filipinos and the Jesuits, largely supporting the official position of Governor-General Izquierdo. American historian James LeRoy observed that Montero y Vidal became notably "rabid" in his treatment of the Cavite events, strongly condemning the executed priests.

**2. The Filipino Version, T.H. Pardo de Tavera**
This account represents an effort to contextualize the mutiny from a reformist Filipino perspective.

**3. The Official Report, Governor-General Rafael de Izquierdo**
The colonial government's official account, reflecting the administration's decision to portray the mutiny as a widespread conspiracy to justify its repressive response.

> **Note:** Students are directed to access the three accounts through Zaide's *Documentary Sources of Philippine History* (Vol. 7, National Bookstore, 1990) or through Philippine archives.

#### The Broader Historical Significance

The Cavite Mutiny and the execution of GOMBURZA illustrate a key theme in Philippine history: how colonial authorities used perceived threats as justification for suppression, and how that suppression could generate new forms of resistance. The memory of GOMBURZA directly inspired the Propaganda Movement and, ultimately, the Revolution of 1896.
$md$, 1),

('b2000001-0001-0002-0002-000000000007','activity','Activities, Historic Controversies',$md$
## Activity A, Controversy Analysis: The First Mass

1. Create a Venn diagram comparing the arguments used by the Limasawa side and the Butuan side in claiming that the first Mass occurred in their respective localities. What evidence do they share? What is unique to each?

2. Write a short essay (3–4 paragraphs) stating your own position on the controversy. Base your argument on the historical evidence available, not on personal preference.

3. Do you agree with the conclusions reached by the various committees that have examined this issue? Explain why or why not.

---

## Activity B, Comparing Accounts of the Cavite Mutiny

Using the three versions of the Cavite Mutiny (Montero y Vidal, Pardo de Tavera, and de Izquierdo), fill in the matrix below:

| Differences | Montero y Vidal (Spanish version) | Pardo de Tavera (Filipino version) | de Izquierdo (Official report) |
|---|---|---|---|
| Cause of the uprising | | | |
| Description of the mutineers | | | |
| Role and guilt of the executed priests | | | |
| Conclusions about the event | | | |

After completing the matrix:
1. Which account do you find most credible? Justify your answer using the criteria for authenticity and credibility.
2. What does the comparison of these three accounts tell you about the nature of historical sources and the importance of consulting multiple perspectives?
$md$, 2);

-- ============================================================
-- MODULE 8: Philippine Constitutions, Indigenous Peoples, and Agrarian Reform
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('b2000001-0001-0002-0002-000000000008','content','Philippine Constitutions, Indigenous Peoples, and Agrarian Reform',$md$
### Lesson 1: The Constitutions of the Philippines

The Philippines has had multiple constitutions, each reflecting the political circumstances of its time:

**The Malolos Constitution (1899)**, The first Philippine constitution, drafted by the Malolos Congress and promulgated on January 21, 1899. Established the First Philippine Republic and is celebrated as the first republican constitution in Asia. The republic was short-lived: the Philippine-American War (1899–1902) ended Filipino sovereignty.

**The 1935 Commonwealth Constitution**, Following decades of American colonial administration, the Philippine Commonwealth was established under the Tydings-McDuffie Act (1934). The 1935 Constitution provided for a strong executive, a bicameral legislature (Senate and House of Representatives), and an independent judiciary. Manuel Quezon became the first Commonwealth President.

**The 1943 Japanese-Sponsored Constitution**, During the Japanese occupation (1941–1945), a puppet Philippine Republic was established. The 1943 Constitution governed this republic under Jose P. Laurel. It was generally dismissed as illegitimate by Filipino resistance movements, as it was imposed by an occupying foreign power.

**The 1973 Constitution (Marcos Period)**, Following the declaration of Martial Law on September 21, 1972, a new constitution was ratified under controversial circumstances in January 1973. Critics argued it was ratified through staged Citizens' Assemblies. It concentrated power in the executive and allowed Marcos to rule by decree without legislative oversight.

**The 1987 Constitution**, Drafted by a Constitutional Commission following the 1986 People Power Revolution, which ousted Marcos and brought Corazon Aquino to power. Ratified on February 2, 1987, it restored democratic governance, reestablished the Senate, and introduced significant protections for civil liberties and human rights. A distinguishing feature is its extensive treatment of **social justice** as a core constitutional value.

As Constitutional Commission President Justice Cecilia Muñoz-Palma stated: "Social justice is the heart of the 1987 Constitution." Social justice, as defined in the landmark *Calalang v. Williams* case by Justice José Laurel, means the humanization of laws and the equalization of social and economic forces so that justice may be approximated for all.

---

### Lesson 2: Indigenous Peoples of the Philippines

#### Who Are the Indigenous Peoples?

The term **Indigenous Peoples (IPs)** refers broadly to communities whose historical continuity connects them to the pre-colonial era of their territories. The definition draws from the United Nations, based on the study by José Martínez Cobo (1983), identifying historical continuity through:

1. Occupation of ancestral lands (or part of them)
2. Common ancestry with the original occupants of those lands
3. Distinct cultural expressions (religion, tribal systems, dress, livelihood, lifestyle)
4. Language (as primary, maternal, or habitual means of communication)
5. Residence in particular regions

The Philippines is home to approximately **110 ethno-linguistic groups** comprising an estimated 14–17 million people.

**Distribution of Indigenous Peoples:**
- **Mindanao:** approximately 61% of the IP population; includes the Lumad (18 non-Muslim IP groups; *Lumad* is a Visayan word meaning "of the land") and the Moro Peoples (seven Islamized groups)
- **Northern Luzon (Cordillera Administrative Region):** approximately 33%; includes the Igorot peoples (Ifugao, Ibaloy, Bontoc, Isneg, Tinguia, Kankanaey, *Igorot* meaning "people from the mountain")
- **Visayas and other regions:** the remaining percentage, including the Mangyan of Mindoro

#### Historical Context: Colonialism and Classification

During the Spanish colonial period, communities that resisted conversion were labeled *infieles* (infidels) or *salvajes* (savages). Under American rule, these groups were reclassified as "non-Christian tribes." In 1901, the Bureau of Non-Christian Tribes was established and anthropologist David Barrows supervised the 1903 Philippine Census, which classified Filipinos into "Christian and Civilized Tribes" and "Non-Christian and Wild Tribes."

#### Legal Protections: The IPRA and the 1987 Constitution

The **1987 Constitution** explicitly recognizes indigenous peoples' rights (Article II, Section 22).

In 1997, the **Indigenous Peoples' Rights Act (IPRA)**, also known as Republic Act 8371, was enacted, establishing four bundles of rights for IPs:
1. Right to Ancestral Domains and Lands
2. Right to Self-Governance and Empowerment
3. Right to Social Justice and Human Rights
4. Right to Cultural Integrity

In 1998, the **National Commission on Indigenous Peoples (NCIP)** was created to implement IPRA.

---

### Lesson 3: History of Agrarian Reform in the Philippines

#### What Is Agrarian Reform?

**Agrarian reform** refers to the redistribution of land to landless farmers and farm workers, together with the support services needed to make such redistribution effective.

**Spanish Colonial Period:** The *encomienda* system and later the *hacienda* system concentrated large tracts of agricultural land in the hands of the Church, Spanish nobles, and the colonial government. Filipino farmers worked as tenants under arrangements that extracted a large portion of their harvests, creating a deeply embedded system of landlordism.

**American Period:** The Americans initially promised land reforms but largely maintained the hacienda structure. The *friar lands* were purchased by the colonial government and resold, but often to wealthy Filipinos or companies rather than to the tenant farmers.

**Commonwealth and Post-War Period:** The **Land Reform Act of 1955** and **Agricultural Land Reform Code of 1963** (Republic Act 3844) were significant attempts but fell short of substantive redistribution.

**Marcos Period:** Presidential Decree 27 (1972) mandated land transfer for rice and corn lands. While celebrated as a major reform, its implementation was uneven and limited in scope, excluding vast portions of the agricultural sector.

**CARP (1988):** The most ambitious attempt was the **Comprehensive Agrarian Reform Program (CARP)**, enacted as Republic Act 6657 in 1988 under President Corazon Aquino. CARP aimed to distribute agricultural lands of all types to qualified beneficiaries. Despite its broad scope, implementation has been widely criticized as slow, incomplete, and subject to legal challenges by landowners. Decades after CARP, significant numbers of Filipino farmers remain without land of their own.
$md$, 1);

-- ============================================================
-- MODULE 9: Colonial Legacies, Applied Historical Analysis
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('b2000001-0001-0002-0002-000000000009','content','Colonial Legacies, Applied Historical Analysis',$md$
### Lesson 1: Bridges in 19th-Century Philippines as Historical Sources

#### Bridges as Material Evidence

Colonial-era bridges were built primarily using **cut stone** sourced from local geological materials, volcanic rock, limestone, and similar formations. The mortar (*argamasa*) was made from powdered lime mixed with water; to increase durability, local materials were sometimes added: plant sap, molasses, and egg white.

The architectural style is described as **Arquitectura Mestiza**, "mixed architecture," a term used by the Jesuit Ignacio Alcina as early as 1668 to describe the blend of European design with Philippine materials and labor. The designs were originally European; the construction workers were primarily Filipino *polistas* (those fulfilling labor obligations under the colonial *polo y servicios* system).

**What Bridges Reveal:**

1. **Colonial labor systems:** Bridges were built using forced or tribute labor (*polistas*) drawn from local communities. Masonic symbols carved beneath structures indicate that Filipino stone cutters marked their work, asserting their presence even in anonymous colonial construction.
2. **Economic integration:** Bridges connected *pueblos* (towns) and *alcaldias* (provincial units), facilitating the movement of goods, military forces, and missionaries.
3. **Boundary markers:** Beyond connection, bridges also served as demarcation lines between towns and provinces.
4. **The builders' identity:** While bridges typically bore markers identifying the Spanish official who commissioned construction, the actual craft was carried out by Filipino laborers whose contributions have been largely overlooked in official records.

Notable surviving colonial bridges include the **Puente de Malagonlong** in Tayabas (present-day Quezon Province) and the **Puente de España** in Manila.

---

### Lesson 2: The "Moro" Problem, Origins and Persistence

#### Understanding the Term

Before the arrival of the Spaniards in 1565, Muslims in the Philippines were among the most politically powerful groups in the archipelago. Islam had spread through Mindanao, the Sulu Archipelago, Palawan, and even parts of Luzon and the Visayas.

The Spanish brought with them a centuries-long conflict with Muslims rooted in the Iberian Peninsula. During the **Conquista** and the subsequent **Reconquista**, the Spanish developed deep antipathy toward Muslims, whom they called **Moros**, a term derived from the North African peoples ("Moors") who had invaded Spain. When they encountered Muslim communities in the Philippines, the Spaniards automatically applied this label, framing Muslim Filipinos as their natural enemies despite the fact that Philippine Muslims had no connection whatsoever to the North African Moors.

#### Origins of the Conflict

Mutual hostility between the Spanish colonial state and Muslim Filipino communities developed through several mechanisms:
- The Spaniards subjected Philippine Muslim communities to repeated military campaigns (*Moro Wars*), attempting to break Muslim political autonomy
- Muslims were categorically labeled in colonial historiography as backward, violent, and opposed to civilization
- In response, Muslim communities launched raids against Christianized coastal settlements, partly for economic resources and partly as an assertion of autonomy against colonial encroachment

From the Muslim perspective, these raids were acts of self-defense. From the Spanish and Christianized Filipino perspective, they were unprovoked piracy.

#### The American Period and After

When the Philippines transferred to American sovereignty following the Spanish-American War (1898), the Moro problem was inherited rather than resolved. Through the **Bates Treaty** (1899), the Sultan of Sulu formally recognized American sovereignty, though with significant reservations.

After independence in 1946, the integration of Muslim Mindanao remained deeply contested. A 1963 Senate Committee report identified the root causes of Muslim discontent as: (1) land problems, (2) educational disparity, (3) lack of livelihood, and (4) inadequate health and transportation infrastructure. By the 1960s and 1970s, the Moro Problem had escalated to armed separatism, with groups like the Moro National Liberation Front (MNLF) demanding an independent Muslim homeland.

---

### Lesson 3: The Claveria Decree of 1849, Surnames and Colonial Public Order

#### Why Do Filipinos Have the Surnames They Do?

The co-existence of Spanish-sounding surnames (like Reyes, Santos, Mendoza) and indigenous surnames (like Dimagiba, Kahabagan, Poqui) in the Philippines reflects a specific historical event: the **Claveria Decree of 1849**.

#### Background: The Problem of Surnames

Before 1849, Filipinos had no systematic, enforced system of surnames. Many people arbitrarily adopted surnames, sometimes sharing the same surname with no familial relationship. Others changed their surnames casually. This created serious administrative problems: individuals with the same given name and surname were indistinguishable in legal records; property inheritance disputes arose; taxation and census-taking were complicated.

#### The Decree of November 21, 1849

Governor-General Narciso Claveria issued a decree requiring the native population to adopt surnames from an officially compiled catalogue, a list drawn from Spanish vocabulary, place names, historical figures, and nature. The catalogue was distributed to each municipality in alphabetical order; municipalities were assigned to use a specific portion of the list to distinguish residents of different towns.

The implementation was uneven. The decree's purpose was as much about **administrative control** as cultural transformation: by creating stable, trackable family identities, the colonial government improved its capacity to levy taxes, track legal obligations, and administer the population.

---

### Lesson 4: The School Curriculum in the Philippines, Historical Development

#### Pre-Colonial Education

Before Spanish colonization, education in the Philippines was informal and community-based. Literacy in the indigenous **Baybayin** script existed among the Tagalogs and other groups. Children were taught practical skills, farming, fishing, weaving, navigation, and trade, by their families and communities.

#### Education Under Spanish Colonial Rule

The Spanish colonial education system was primarily an instrument of **religious conversion and social control** rather than broad civic education. The Church controlled most educational institutions; primary goals were teaching the Catholic faith and producing clerically aligned literate individuals. Indigenous Baybayin literacy was largely displaced.

#### Education Under American Rule

Beginning in 1901, the colonial government deployed over a thousand American teachers (popularly known as the **Thomasites**, after the ship *Thomas* that brought many of them) to establish a public school system.

Key features:
- **English as the medium of instruction**, English displaced Filipino languages in the classroom
- **Mass public education**, The colonial government built thousands of schools across the archipelago
- **Secular curriculum**, Unlike the Spanish system, American colonial education was not Church-controlled
- **Americanization**, The curriculum promoted American values, institutions, and cultural norms

#### Post-Independence and Contemporary Curriculum

After independence in 1946, the Philippines inherited the American-designed educational system and gradually adapted it:
- Introduction of Filipino (based on Tagalog/Pilipino) as a co-medium of instruction
- Under the Marcos period, the curriculum was used to promote the ideological program of the "New Society"
- After 1986, curriculum reforms emphasized human rights, democracy, and national identity
- The **K-12 program** (implemented 2012–2016) added two years to the secondary school cycle, bringing the Philippines into alignment with international standards
$md$, 1),

('b2000001-0001-0002-0002-000000000009','activity','Activities, Colonial Legacies',$md$
## Activity A, Local Infrastructure as Historical Source

Select a specific bridge, building, road, or other infrastructure near your area. Using primary and secondary sources:

1. Write a brief history of when it was built, by whom, and why.
2. What does this infrastructure reveal about the social, economic, or political conditions of the period in which it was built?
3. What challenges did you encounter in finding information about it? What kinds of sources were most useful?

---

## Activity B, Examining Perceptions of Muslims

1. Conduct a brief interview with three or more members of your household or community. Ask: (a) What words or images come to mind when you hear the term "Muslim" or "Moro"? (b) Where do you think these perceptions come from, school, media, personal experience, or community?

2. Based on the interviews and the history presented in this lesson, write a short narrative assessing whether the negative historical framing of Filipino Muslims continues to influence perceptions in your community today. What historical factors have shaped this perception?
$md$, 2);

-- ============================================================
-- MODULE 10: Local History and Philippine Heritage
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('b2000001-0001-0002-0002-000000000010','content','Local History and Philippine Heritage',$md$
### Lesson 1: Dealing with Local History

#### What Is Local History?

**Local history** is the "unheard history" of communities and localities, the collective experiences and testimonies of ordinary people, places, and institutions that conventional national history has often overlooked. Local history decentralizes historical inquiry: instead of starting from centers of political power (capitals, rulers, major figures), it begins from the ground up, from the lives and events of communities, towns, and regions.

This is distinct from **oral history**, though related to it. Oral history refers specifically to the transmission of historical experience through spoken word across generations.

#### Why Local History Matters

For much of the history of historical writing in the Philippines, scholars focused predominantly on the national narrative centered on Manila, on prominent political figures, and on major events. Regional and community experiences, the Cebuanos, the Igorots, the Visayans, the farmers and fishermen, received relatively little attention.

The growing field of local history helps to:
1. **Fill the gaps**, Illuminate events, communities, and experiences absent from the national narrative
2. **Correct imbalances**, Provide historical voice to groups marginalized in conventional accounts
3. **Strengthen local identity**, Help communities understand their own roots and contributions to the larger national story
4. **Support national development**, As local governments gained greater autonomy under the Local Government Code, local history provides cultural and historical context for communities to understand and shape their own development

#### Standards for Writing Local History

1. **Authentic**, Original in approach; not a duplication of existing work
2. **Accurate**, Correct in factual details
3. **Objective**, As impartial as possible; avoid excessive use of subjective adjectives and superlatives
4. **Reliable**, Supported by properly authenticated and credible sources
5. **Relevant**, Addresses questions or gaps of genuine interest and value
6. **Systematic/Scientific**, Follows established research methods; applies external and internal criticism to all sources

#### Sources for Local History

**Written sources:**
- Archival materials (national, religious congregational, and private archives)
- Documents from the National Archives of the Philippines (classified in bundles as *Obras Publicas*, *Ereccion de Pueblos*, *Fincas*, *Testamentos*, *Provincias*, etc.)
- Correspondence, diaries, and family records
- Local newspapers and periodicals

**Tangible (non-documentary) sources:**
- Archaeological finds: tools, pottery, agricultural implements, ornaments
- Old dwellings, buildings, caves, natural landmarks
- Personal possessions with historical significance (antique objects, religious items, clothing)

**Challenges specific to Philippine local history:**
- Many primary Spanish-era documents are written in Spanish
- Documents from the colonial period are often in poor physical condition
- Archival research is time-consuming and requires travel
- Many potential sources remain unexamined in archives

---

### Lesson 2: Philippine Heritage and History

#### What Is Heritage?

**Heritage** is broadly defined as "something that has been passed down or inherited from ancestors or previous generations." **Culture** describes the shared practices, beliefs, customs, and expressions of a society. Heritage is culture that has proven durable enough to transcend the period of its creation and remain meaningful to later generations.

#### UNESCO's Three Categories of Heritage

**1. Cultural Heritage**, has two types:
- *Tangible Cultural Heritage*, Physical, material objects and sites:
  - **Movable:** Paintings, artifacts, coins, manuscripts
  - **Immovable:** Monuments, historic buildings, archaeological sites, sacred landscapes
  - **Underwater:** Shipwrecks, submerged ruins
- *Intangible Cultural Heritage*, Living practices and expressions passed from generation to generation: oral traditions, performing arts, rituals, indigenous knowledge, craftsmanship

**2. Natural Heritage**, Natural features and formations of outstanding physical, biological, or geological value: landscapes, geological formations, habitats of threatened species

**3. Heritage in Armed Conflict**, Protection of cultural property in situations of armed conflict

#### What History Does for Heritage

Heritage and history are not the same thing, though they are deeply connected. History provides **context**, it situates heritage in time, explains its creation, documents its significance, and reveals the human stories behind material objects.

A useful example is **The Ruins** in Bacolod City, the skeletal remains of an early 20th-century mansion built by Don Mariano Ledesma Lacson for his wife. During World War II, Filipino guerrillas burned the structure to prevent Japanese forces from using it as a garrison. Without knowing this history, visitors see only a picturesque ruin. With it, the site becomes a layered story of love, loss, war, and resistance.

#### The Heritage Cycle

Simon Thurley developed a model called the **Heritage Cycle** to describe how communities engage with heritage:

Understanding heritage → Valuing it → Taking care of it → Finding meaning in it → Understanding heritage (cycling back)

The cycle emphasizes participation: as people come to understand and find meaning in heritage, they become invested in its preservation and protection.

#### Philippine Heritage Law: Republic Act 10066

The **National Cultural Heritage Act of 2009** (Republic Act 10066) provides the legal framework for heritage preservation in the Philippines. It builds on the mandate of the **1987 Constitution** (Article XIV, Sections 14–17), which obligates the state to:

- Foster the preservation, enrichment, and evolution of Filipino culture
- Conserve, develop, promote, and popularize the nation's historical and cultural heritage
- Declare that the country's artistic and historic wealth constitutes "the cultural treasure of the nation" and is under state protection

Key cultural agencies involved in heritage management include the National Historical Commission of the Philippines (NHCP), the National Museum of the Philippines, the National Library, the Cultural Center of the Philippines (CCP), and the National Archives.
$md$, 1),

('b2000001-0001-0002-0002-000000000010','activity','Activity, Heritage Reflection',$md$
Write **two or more paragraphs** (at least 3 sentences each) on the following questions:

1. What is heritage? Why is it important, both for communities and for the nation?

2. Identify a heritage icon near your area (a building, monument, site, or tradition). Briefly describe its history and explain why you think it is important to the community where it is located.
$md$, 2);
