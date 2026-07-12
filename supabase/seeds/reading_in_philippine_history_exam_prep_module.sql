-- ============================================================
-- Reading in Philippine History — Exam Prep: Prelims & Finals
-- Subject ID: 10000000-0001-0002-0002-000000000001
-- Module ID:  b2000001-0001-0002-0002-0000000000e1
-- Purpose: exam-prep module — blueprints, practice sets, full
--   mock exams with explained answer keys. Every item is
--   answerable from reading_in_philippine_history_modules_sections.sql.
-- Idempotent / INSERT-only for content: deletes only this one
--   module by id (its sections cascade), then re-inserts.
--   Existing lesson modules 1-10 are never touched.
-- Run after reading_in_philippine_history_modules_sections.sql
-- ============================================================

DELETE FROM modules WHERE id = 'b2000001-0001-0002-0002-0000000000e1';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('b2000001-0001-0002-0002-0000000000e1','10000000-0001-0002-0002-000000000001','Exam Prep: Prelims & Finals','exam-prep-prelims-finals',11);

-- ------------------------------------------------------------
-- SECTION 1 (FREE): Prelim Exam Blueprint & Study Plan
-- ------------------------------------------------------------

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('b2000001-0001-0002-0002-0000000000e1','content','Prelim Exam Blueprint & Study Plan',$md$
Your prelim in Reading in Philippine History almost always draws from the first four modules of this course. Professors love this stretch because it tests both **memory** (dates, names, definitions) and **skill** (classifying sources, applying criticism). Here is exactly what to expect and how to prepare in one week.

### What the Prelim Covers

| Module in this app | Typical weight | What actually gets tested |
|---|---|---|
| The Meaning and Relevance of History | ~20% | Stearns's four purposes of history; primary vs secondary; artifact vs ecofact; the three types of unwritten sources; Philippine and foreign repositories |
| Tests of Authenticity and Credibility | ~30% | External vs internal criticism; Gottschalk's credibility criteria; the Maragtas case; rules for disagreeing and hostile sources; research ethics |
| Case Study: The Tejeros Convention of 1897 | ~25% | The Katipunan split, the two factions and their leaders, the March 22, 1897 election and its aftermath, and why Alvarez is primary while Agoncillo is secondary |
| Early Philippine Chronicles — Pigafetta and Plasencia | ~25% | The Magellan expedition timeline, Pigafetta's manuscripts, Plasencia's *Customs of the Tagalogs*, and the biases of both chroniclers |

### The Question Types You Will Face

| Type | What it looks like | How to win it |
|---|---|---|
| Multiple choice | Four options, usually one "trap" distractor built from a nearby fact | Eliminate the distractor that belongs to a *different* module or person |
| Identification | "Give the term/person" — no options | These come straight from the memorize list below |
| True/False | Statements with one wrong detail (a date, a name, an "always") | Absolute words like "always" and "never" are usually false |
| Primary vs secondary classification | A described source; you classify it | Ask one question: was the creator *present at the event*? (Proximity is the key distinction) |
| Document analysis | A short quoted excerpt plus 2–3 questions | Name the source type, the author's vantage point, and the bias before answering anything else |

### The Exact Memorize List

If you can recite everything here, you can answer roughly 80% of a typical prelim.

**Module 1**
- Stearns (1998): **moral understanding, understanding people and societies, providing identity, civic formation**
- Primary source = testimony of an **eyewitness** (Gottschalk, 1950); secondary = produced by someone **not present** (textbooks, encyclopedias, monographs, journal articles, bibliographies)
- **Artifact** = object made/modified by humans; **ecofact** = natural archaeological evidence (bones, seeds, shells) not shaped by humans
- Unwritten sources: **archaeological, oral, material** evidence
- Repositories: National Library of the Philippines (Filipiniana Division; Historical Data Papers, Philippine Revolutionary Records); National Archives of the Philippines (Spanish-period government records); Archivo General de Indias in **Seville**; **PARES** (free online Spanish portal); Mexico's Archivo General de la Nación (Philippines under the **Viceroyalty of New Spain until 1821**); British Museum (documents taken during the **British occupation of Manila, 1762–64**); Ayer Collection at the **Newberry Library, Chicago**

**Module 2**
- **Historical method** = examining/testing sources; **historiography** = the writing of history
- **External criticism = authenticity** ("is it what it claims to be?") — examines **authorship, time, space**
- **Internal criticism = credibility** — Gottschalk's four: **competence, willingness to tell the truth, adequacy of data, reliability against other sources**
- The *Maragtas*: alleged document that **William Henry Scott (1984)** argued rested on suspicious oral traditions and fabricated written sources
- Gottschalk: the historian plays "**prosecutor, attorney for the defense, judge, and jury all in one**"
- A source that does not fit the **milieu** of its supposed period is likely fabricated; witnesses **without** a personal stake are more credible; when all independent sources agree, the event is accepted as factual

**Module 3**
- Full name: **Kataas-taasang Kagalang-galangang Katipunan ng mga Anak ng Bayan**, founded by **Andres Bonifacio**
- Factions: **Magdiwang** — Noveleta, led by **Mariano Alvarez**; **Magdalo** — Kawit, led by **Baldomero Aguinaldo**
- **Tejeros Convention, March 22, 1897**: Emilio Aguinaldo elected President; **Danielo Tirona** challenged Bonifacio's qualification; Bonifacio declared the proceedings **null and void**; he was executed for treason in **Maragondon, Cavite, May 1897**
- **Santiago Alvarez**, *Katipunan and the Revolution* — Magdiwang participant, serialized in *Sampagita* (1920s) → **primary** source with faction bias
- **Teodoro Agoncillo**, *The Revolt of the Masses* (1956) — pioneer of **nationalist historiography** → **secondary** source

**Module 4**
- Pigafetta: Italian chronicler of the Magellan-Elcano expedition; one of only **18 of ~270** crew who returned; **four manuscripts** — one Italian (Ambrosiana Library, Milan), three French (earliest c. 1525)
- Timeline: left Seville **Aug 10, 1519** with five ships (*Victoria, Concepción, San Antonio, Santiago, Trinidad*) → **Strait of Magellan, Oct 21, 1520** (only three ships through) → landed **Zamal (Samar), March 16, 1521**, islands named **Archipelago of St. Lazarus** → blood compact with **Rajah Colambu** at Masao → first Mass **March 31, 1521** → **Cebu, April 7, 1521** (Rajah Humabon; 800+ baptized; **Santo Niño** gifted) → **Battle of Mactan, April 27, 1521** — Magellan killed by Lapu-Lapu's forces
- Plasencia: **Franciscan friar**, arrived **1577**, wrote *Customs of the Tagalogs* (**c. 1589**) with a missionary bias; **Bathala** ("the maker of all things"); **catalonan** = chief religious officiator; afterlife: **maca** (rest) vs **casamaan** (punishment)

### Top Mistakes Students Make

1. **Confusing the two Aguinaldos.** *Baldomero* Aguinaldo led the Magdalo faction; *Emilio* Aguinaldo was elected President at Tejeros. Read the question twice.
2. **Swapping external and internal criticism.** External = authenticity (the document itself); internal = credibility (the content's truthfulness). If the question is about forgery, it is external.
3. **Treating "primary" as "always true."** The lesson is explicit: primary sources carry biases too — Alvarez was a Magdiwang loyalist and still a primary source.
4. **Mixing up the 1521 dates.** Landing (March 16) ≠ first Mass (March 31) ≠ Cebu arrival (April 7) ≠ Mactan (April 27).
5. **Attributing Plasencia's ethnography to Pigafetta.** Pigafetta sailed with Magellan in 1521; Plasencia was a friar writing about Tagalog customs almost 70 years later.

### Realistic 7-Day Study Plan

| Day | Focus | Do this |
|---|---|---|
| 1 | The Meaning and Relevance of History | Recite Stearns's four purposes; build a two-column primary/secondary chart; drill artifact vs ecofact |
| 2 | The Meaning and Relevance of History | Memorize the repositories table — country, archive, and the one fact attached to each (1821, 1762–64, Seville, PARES) |
| 3 | Tests of Authenticity and Credibility | External vs internal criticism until automatic; Gottschalk's four credibility criteria; the Maragtas case |
| 4 | Tests of Authenticity and Credibility | Rules for disagreeing/hostile sources and the basic assumptions; say the "prosecutor, attorney, judge, jury" quote from memory |
| 5 | Case Study: The Tejeros Convention of 1897 | Draw the faction map (Magdiwang/Noveleta/M. Alvarez vs Magdalo/Kawit/B. Aguinaldo); rehearse the March 22, 1897 sequence and the Alvarez-vs-Agoncillo source comparison |
| 6 | Early Philippine Chronicles — Pigafetta and Plasencia | Write the 1519–1521 timeline from memory three times; list Plasencia's key terms (Bathala, catalonan, maca, casamaan) |
| 7 | All four modules | Take the free 15-item practice set below under time pressure (20 minutes), then the mock exams; review every miss against the lesson |

One warning: do not study the modules in isolation. The best prelim questions cross modules — for example, applying Module 2's criticism tests to Module 3's Tejeros sources or Module 4's chronicles. That is exactly how the practice items below are built.
$md$, 1);

-- ------------------------------------------------------------
-- SECTION 2 (FREE): Free Practice Set — 15 Items with Answer Key
-- ------------------------------------------------------------

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('b2000001-0001-0002-0002-0000000000e1','content','Free Practice Set — 15 Items with Answer Key',$md$
Work through these 15 items in 20 minutes, closed notes. They are built exactly like real prelim questions — same modules, same traps. The answer key with explanations is at the bottom.

### Part I — Multiple Choice

**1.** According to Peter Stearns (1998), a community coming to understand who they are through their shared historical experiences illustrates which purpose of history?

- A. Moral understanding
- B. Civic formation
- C. Providing identity
- D. Understanding people and societies

**2.** Archaeologists recover rice seeds, shells, and animal bones from an ancient settlement. None of these were made or modified by humans. These are classified as:

- A. Artifacts
- B. Ecofacts
- C. Relics
- D. Material evidence

**3.** Which question belongs to **external** criticism?

- A. Was the author willing to tell the truth?
- B. Is this source what it claims to be?
- C. Is the information detailed and complete enough?
- D. Does the account agree with other independent sources?

**4.** Louis Gottschalk described the historian's role as playing which roles "all in one"?

- A. Author, editor, publisher, and critic
- B. Witness, suspect, victim, and investigator
- C. Prosecutor, attorney for the defense, judge, and jury
- D. Reporter, historian, archivist, and teacher

**5.** Which statement correctly describes the outcome of the Tejeros Convention of March 22, 1897?

- A. Bonifacio was elected President and Aguinaldo declared the proceedings null and void
- B. Aguinaldo was elected President, and Bonifacio later declared the proceedings null and void
- C. The two factions peacefully reunited under Mariano Alvarez
- D. The convention drafted and promulgated the Malolos Constitution

**6.** Santiago Alvarez's memoirs are a primary source on the Tejeros Convention while Teodoro Agoncillo's *The Revolt of the Masses* is a secondary source. What single criterion drives this distinction?

- A. The language each book was written in
- B. The proximity of each author to the event — Alvarez was present, Agoncillo was not
- C. The publisher of each book
- D. The political opinions of each author

**7.** On March 16, 1521, the Magellan expedition made its first Philippine landfall. Where, and what name did Magellan give the islands?

- A. Cebu; Islas Filipinas
- B. Mactan; Archipelago of St. Lazarus
- C. Zamal (Samar); Archipelago of St. Lazarus
- D. Limasawa; Islas de San Miguel

**8.** What happened at the Battle of Mactan on April 27, 1521?

- A. Magellan defeated Lapu-Lapu and completed the conquest of Cebu
- B. Magellan personally led the assault and was killed
- C. Rajah Humabon repelled the Spanish fleet
- D. The expedition lost all five of its ships

### Part II — True or False

**9.** A source whose style and content do not fit the milieu of its supposed period is likely fabricated.

**10.** Fray Juan de Plasencia sailed with the Magellan expedition and wrote his account of the voyage in 1521.

### Part III — Identification

**11.** The alleged document that historian William Henry Scott (1984) argued was based on suspicious oral traditions and fabricated written sources.

**12.** The person who challenged Bonifacio's qualification for the position he had been elected to at Tejeros.

**13.** The supreme deity of the Tagalogs described by Plasencia as "the maker of all things."

### Part IV — Source Classification

**14.** Classify each source as **primary** or **secondary**:
- (a) The diary of a Katipunero written during the Revolution of 1896
- (b) A college textbook chapter on the Philippine Revolution published in 2015

### Part V — Document Analysis

**15.** Plasencia listed the Tagalog religious specialists — the catalonan, mangagauay, and others — under the heading "Priests of the Devil."

- (a) What bias does this label reveal about the author?
- (b) According to the lessons, does identifying this bias automatically disqualify *Customs of the Tagalogs* as a source? Explain in one sentence.

---

### Answer Key

**1. C** — "Providing identity" is Stearns's purpose about communities knowing who they are through shared historical experience; civic formation is about informed citizenship instead.

**2. B** — Ecofacts are natural archaeological evidence not shaped by humans; artifacts are, by definition, made or modified by humans.

**3. B** — External criticism tests authenticity (is the source what it claims to be?); options A, C, and D are all Gottschalk's internal-criticism credibility tests.

**4. C** — Gottschalk's famous line: the historian is "prosecutor, attorney for the defense, judge, and jury all in one."

**5. B** — Aguinaldo won the presidency; after Danielo Tirona questioned Bonifacio's qualification, Bonifacio declared the proceedings null and void. The Malolos Constitution (D) belongs to 1898–1899, not Tejeros.

**6. B** — Proximity to the event is the key distinction between primary and secondary sources; opinions and publishers do not change the classification.

**7. C** — First landfall was the island of Zamal (Samar), and the islands were named the Archipelago of St. Lazarus. Cebu came later (April 7).

**8. B** — Magellan led the Mactan assault personally and was killed; Lapu-Lapu had refused to submit.

**9. TRUE** — This is one of the basic assumptions in working with sources: a source out of step with its supposed milieu is likely fabricated.

**10. FALSE** — Plasencia was a Franciscan friar who arrived in 1577 and wrote *Customs of the Tagalogs* around 1589; the expedition chronicler in 1521 was Antonio Pigafetta.

**11. The Maragtas** — Scott's 1984 critique is the lesson's example of why the test of authenticity is necessary.

**12. Danielo Tirona** — His challenge to Bonifacio's qualification triggered the nullification of the proceedings.

**13. Bathala** — The Tagalog supreme deity who dwelled in heaven, per Plasencia.

**14. (a) Primary; (b) secondary** — The diarist was present inside the events; the 2015 textbook author reflects on them from outside.

**15. (a)** It reveals Plasencia's colonial-Christian missionary framing — he treated indigenous religious practice as idolatry to be understood and replaced. **(b)** No — identifying a bias does not automatically disqualify a source; it shapes how the historian interprets it.

---

**Scoring:** 13–15 correct, you are prelim-ready — sharpen with the mocks. 9–12, re-read your weakest module first. Below 9, restart the 7-day plan at Day 1.

The four full-length 30-item mock exams below, with fully explained answer keys and a traps drill, come with the subject unlock.
$md$, 2);

-- ------------------------------------------------------------
-- SECTION 3 (LOCKED): Prelim Mock Exam A — 30 Items
-- ------------------------------------------------------------

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('b2000001-0001-0002-0002-0000000000e1','activity','Prelim Mock Exam A — 30 Items',$md$
Simulate real conditions: 45 minutes, closed notes, no skipping ahead to the key. Coverage: the first four modules. The full answer key with explanations is in the section after Mock Exam B.

### Part I — Multiple Choice (Items 1–12)

**1.** Which pair consists of **two secondary sources**?

- A. A diary and a photograph taken at the event
- B. An encyclopedia and a textbook
- C. A letter and an official document from the period
- D. A video recording and a newspaper article written at the time

**2.** The Archivo General de Indias, a key repository of Spanish-period Philippine documents, is located in:

- A. Madrid
- B. Seville
- C. Barcelona
- D. Mexico City

**3.** Why does Mexico's Archivo General de la Nación hold records relevant to Philippine history?

- A. Mexican collectors purchased the documents at auction
- B. The Philippines was under the Viceroyalty of New Spain until Mexico's independence in 1821
- C. Mexican friars wrote most of the early chronicles
- D. The documents were taken there during the British occupation of Manila

**4.** As distinguished from the historical method, **historiography** refers to:

- A. Applying scientific rules to test whether an event actually occurred
- B. The process of writing history — synthesizing tested data into a narrative
- C. The excavation and dating of artifacts
- D. The cataloguing of archival collections

**5.** Which of the following is **NOT** one of Gottschalk's criteria for assessing the credibility of a source?

- A. The competence of the source
- B. The willingness to tell the truth
- C. The adequacy of the data
- D. The authorship of the document

**6.** Two sources contradict each other, but both are equally authentic and credible. According to the lesson, the historian should prefer:

- A. The older of the two sources
- B. The one with more logical reasoning and common sense
- C. The one produced by a government institution
- D. Neither — both must be rejected

**7.** Which option correctly pairs a Katipunan faction with its base and its leader?

- A. Magdiwang — Kawit — Baldomero Aguinaldo
- B. Magdalo — Noveleta — Mariano Alvarez
- C. Magdiwang — Noveleta — Mariano Alvarez
- D. Magdalo — Kawit — Emilio Aguinaldo

**8.** After the Tejeros Convention, Bonifacio was arrested, tried, and executed in May 1897. Where, and on what charge?

- A. Bagumbayan, on charges of rebellion
- B. Maragondon, Cavite, on charges of treason
- C. Noveleta, on charges of sedition
- D. Kawit, on charges of desertion

**9.** Agoncillo's **nationalist historiography** holds that:

- A. Philippine history is best reconstructed from Spanish colonial records
- B. Philippine history must be written from a Filipino perspective, centered on the experiences of ordinary Filipinos
- C. Only eyewitness memoirs may be used as sources
- D. The revolution was primarily the achievement of the educated elite

**10.** How many manuscript versions of Pigafetta's account survive, and in what languages?

- A. Two — both in Spanish
- B. Four — one in Italian and three in French
- C. Three — one each in Italian, French, and Spanish
- D. Four — all in Italian

**11.** Which sequence puts the 1521 events in the correct chronological order?

- A. Cebu arrival → Samar landfall → Battle of Mactan → first Mass
- B. Samar landfall → blood compact at Masao → first Mass → Cebu arrival → Battle of Mactan
- C. First Mass → Samar landfall → Cebu arrival → Battle of Mactan
- D. Samar landfall → Cebu arrival → first Mass → Battle of Mactan

**12.** According to Plasencia, the **catalonan** was:

- A. A soothsayer who predicted the future
- B. The chief religious officiator, who could be male or female and was held in high esteem
- C. A powerful witch said to kill with a glance
- D. A bishop-like figure who assisted the dying

### Part II — True or False (Items 13–18)

**13.** The Katipunan's full name was Kataas-taasang Kagalang-galangang Katipunan ng mga Anak ng Bayan.

**14.** Because primary sources come from eyewitnesses, a primary source is always more reliable than any secondary source, without exception.

**15.** Only 18 of the roughly 270 original crew members of the Magellan expedition returned to Spain.

**16.** Witnesses with a direct personal interest in an outcome tend to be more credible than witnesses without such an interest.

**17.** The National Archives of the Philippines holds government records from the Spanish colonial period.

**18.** Santiago Alvarez's memoirs were originally serialized in Spanish in a Madrid newspaper.

### Part III — Identification (Items 19–24)

**19.** The Tagalog weekly that serialized Santiago Alvarez's memoirs in the 1920s.

**20.** The passage between the Atlantic and Pacific Oceans discovered on October 21, 1520.

**21.** The religious image presented as a gift in Cebu in 1521 and still venerated there today.

**22.** Plasencia's term for the afterlife place of punishment for the wicked.

**23.** The Spanish government's free online portal giving access to digitized archival documents.

**24.** The three things historians examine when assessing a source's authenticity.

### Part IV — Source Classification (Items 25–28)

Classify each source as **primary** or **secondary**. If it is an unwritten source, also name its type (archaeological, oral, or material evidence).

**25.** An encyclopedia entry on the Katipunan.

**26.** Pigafetta's chronicle of the 1519–1522 voyage.

**27.** Folk tales and legends about a town's founding, passed down through generations.

**28.** Stone tools and pottery excavated from a pre-colonial settlement.

### Part V — Document Analysis (Items 29–30)

Read the excerpt, then answer.

> "...the testimony of an eyewitness, or of a witness by any other of the senses, or of a mechanical device... that is, of one who or that which was present at the events of which he or it tells." — Louis Gottschalk (1950), defining a primary source

**29.** (a) Under this definition, does Agoncillo's *The Revolt of the Masses* qualify as a primary source on the Tejeros Convention? Explain why or why not. (b) Give one reason the lesson still treats Agoncillo's book as a major scholarly reference despite your answer in (a).

> "The Tagalogs recognized a supreme deity they called Bathala, the maker of all things, who dwelled in heaven. They also venerated the moon, especially during its new phase, and certain stars — the morning star, called Tala, and the Pleiades." — adapted from Fray Juan de Plasencia, *Customs of the Tagalogs* (c. 1589)

**30.** (a) Is this a primary or secondary source on 16th-century Tagalog religious beliefs? (b) What was the author's vantage point and purpose in documenting these practices? (c) Give one reason internal criticism is required before accepting this description at face value.
$md$, 3);

-- ------------------------------------------------------------
-- SECTION 4 (LOCKED): Prelim Mock Exam B — 30 Items
-- ------------------------------------------------------------

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('b2000001-0001-0002-0002-0000000000e1','activity','Prelim Mock Exam B — 30 Items',$md$
Same scope as Mock Exam A — the first four modules — but every item is new and pitched slightly harder: more detail recall, and classification items where the answer depends on the research question. 45 minutes, closed notes.

### Part I — Multiple Choice (Items 1–12)

**1.** Which repository houses the Historical Data Papers and the Philippine Revolutionary Records?

- A. National Archives of the Philippines
- B. National Library of the Philippines
- C. Archivo General de Indias
- D. Archives of the University of Santo Tomas

**2.** Some Spanish-period Philippine documents ended up in the British Museum because they were:

- A. Donated by the Spanish crown as a diplomatic gift
- B. Taken during the British occupation of Manila (1762–64)
- C. Purchased by British collectors after 1898
- D. Evacuated there for safekeeping during World War II

**3.** The Ayer Collection of Philippine materials is held at the:

- A. Library of Congress
- B. National Archives and Records Service
- C. Newberry Library, Chicago
- D. British Museum

**4.** Which of the following is **NOT** one of the lesson's reasons why the test of authenticity is necessary?

- A. Sources can be fabricated
- B. Negative revisionism exists
- C. Sources can mislead, even unintentionally
- D. Primary sources are always biased

**5.** According to the lesson, a source representing a fixed ideological viewpoint should be:

- A. Discarded from the study entirely
- B. Cross-checked against other sources not aligned with that perspective
- C. Accepted as long as it is a primary source
- D. Preferred, because ideology guarantees internal consistency

**6.** Which statement matches the lesson's basic assumptions about sources?

- A. Documents tend to be more reliable, while relics are more detailed
- B. Relics and artifacts tend to be more reliable, while documents and testimonies are more detailed
- C. Testimonies are always more reliable than artifacts
- D. Reliability and detail always increase together

**7.** The Magdalo faction of the Katipunan was led by:

- A. Emilio Aguinaldo
- B. Baldomero Aguinaldo
- C. Mariano Alvarez
- D. Santiago Alvarez

**8.** According to the lesson, what eroded Bonifacio's standing before the Tejeros Convention, especially in Cavite?

- A. Accusations that he misused Katipunan funds
- B. A series of Spanish military defeats
- C. His refusal to attend the convention
- D. His public rivalry with José Rizal

**9.** Which ship was **NOT** among the five that left Seville with Magellan in 1519?

- A. Victoria
- B. Trinidad
- C. Santiago
- D. San Pablo

**10.** During the Pacific crossing, the starving crew was reduced to eating:

- A. Seaweed and raw fish only
- B. Leather, sawdust, and mice
- C. Hardtack and salted pork
- D. Rice traded from passing islanders

**11.** The blood compact at Masao was performed between Magellan and:

- A. Rajah Humabon
- B. Rajah Colambu
- C. Lapu-Lapu
- D. Rajah Siagun

**12.** In Plasencia's list of religious specialists, which one was said to be capable of killing with a glance?

- A. Mangagauay
- B. Mancocolam
- C. Hocloban
- D. Silagan

### Part II — True or False (Items 13–18)

**13.** Agoncillo's *The Revolt of the Masses* was first published in 1956.

**14.** The earliest French manuscript of Pigafetta's account, *Le Voyage et Navigation*, dates to around 1525 in Paris.

**15.** The Silagan, found in Catanduanes, was believed to eat human livers.

**16.** Even when all independent sources agree on an event, historians still refuse to accept that event as factual.

**17.** Bonifacio accepted the Tejeros election results and went on to serve in Aguinaldo's revolutionary government.

**18.** SIL Philippines in Quezon City holds approximately 2,000 titles on Philippine languages.

### Part III — Identification (Items 19–24)

**19.** The historian who in 1950 defined a primary source as "the testimony of an eyewitness."

**20.** The rajah of Cebu during whose rule over 800 natives, including the ruler and his wife, were baptized in 1521.

**21.** The ritual figure who, per Plasencia, bathed a girl and removed her blindfold after her four-day, four-night seclusion.

**22.** The term for deliberate attempts to downplay, minimize, or distort historical events.

**23.** The Tagalog name of the morning star, per Plasencia.

**24.** The exact date and the city from which Magellan's fleet departed at the start of the expedition.

### Part IV — Source Classification (Items 25–28)

For each, classify the source as **primary** or **secondary** *relative to the stated research question*. Watch carefully — the same book can change classification when the question changes.

**25.** *The Revolt of the Masses* (Agoncillo, 1956), used to study the events of the Tejeros Convention of 1897.

**26.** *The Revolt of the Masses* (Agoncillo, 1956), used to study how mid-20th-century Filipino historians wrote about the revolution.

**27.** Santiago Alvarez's memoirs, serialized in the 1920s, used to study the Tejeros Convention of 1897.

**28.** An encyclopedia entry summarizing Pigafetta's account, used to study the 1521 voyage.

### Part V — Document Analysis (Items 29–30)

> The historian must act as "prosecutor, attorney for the defense, judge, and jury all in one." — Louis Gottschalk (1950)

**29.** (a) In one or two sentences, explain what this statement means about the historian's task. (b) Apply it to the Tejeros Convention: name the two sources analyzed in the lesson and state one thing the historian must "prosecute" (question) in each.

> On April 27, 1521, Magellan personally led an assault on Mactan after its ruler, Lapu-Lapu, refused to submit. Magellan was killed in the battle. — adapted from Pigafetta's account of the expedition

**30.** (a) Why is Pigafetta's account of this event considered a primary source? (b) State one strength of his account as historical evidence. (c) State one limitation of his account as a source about pre-colonial Filipino societies.
$md$, 4);

-- ------------------------------------------------------------
-- SECTION 5 (LOCKED): Prelim Mock Exams — Answer Key with Explanations
-- ------------------------------------------------------------

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('b2000001-0001-0002-0002-0000000000e1','activity','Prelim Mock Exams — Answer Key with Explanations',$md$
Score yourself honestly, then read the explanation for **every** item — including the ones you got right. The explanations tell you why the tempting wrong choices are wrong, which is where the real exam points hide.

### Mock Exam A — Key

**1. B** — Encyclopedias and textbooks are both produced by people not present at the events. Every other pair contains at least one primary source: diaries, photographs, letters, official documents, video recordings, and newspaper articles written at the time are all on the lesson's primary-source list.

**2. B** — Seville. Madrid is the tempting distractor: it hosts the Archivo Histórico Nacional, the Real Academia de la Historia, and the Biblioteca Nacional de España — but not the Archivo General de Indias.

**3. B** — The Philippines was governed under the Viceroyalty of New Spain until Mexican independence in 1821, so colonial paperwork flowed through Mexico. Option D describes the British Museum's story, not Mexico's.

**4. B** — Historiography is the *writing* of history. Option A is the definition of the historical method — the classic swap.

**5. D** — Authorship belongs to the authenticity (external criticism) checklist along with time and space. Gottschalk's credibility criteria are competence, willingness to tell the truth, adequacy of data, and reliability against other sources.

**6. B** — When two sources are equally valid, the lesson's first rule is to prefer the one with more logical reasoning and common sense. Age and institutional origin are not the tiebreakers.

**7. C** — Magdiwang was based in Noveleta under Mariano Alvarez. Option D is the classic trap: Magdalo really was based in Kawit, but its leader was **Baldomero** Aguinaldo, not Emilio.

**8. B** — Maragondon, Cavite, on charges of treason. Bagumbayan (A) is where GOMBURZA were executed in 1872 — a different event entirely.

**9. B** — Nationalist historiography means writing Philippine history from a Filipino perspective, centered on ordinary Filipinos — Agoncillo argued the masses made the revolution, the opposite of option D.

**10. B** — Four manuscripts survive: one Italian at the Ambrosiana Library in Milan, and three in French, the earliest (*Le Voyage et Navigation*) from around 1525.

**11. B** — Samar landfall (March 16) → blood compact at Masao (March 27–28) → first Mass (March 31) → Cebu arrival (April 7) → Battle of Mactan (April 27). Every wrong option moves Cebu or the Mass out of place.

**12. B** — The catalonan was the chief religious officiator, male or female, held in high esteem. A describes the pangatahojan, C the hocloban, D the sonat.

**13. TRUE** — Kataas-taasang Kagalang-galangang Katipunan ng mga Anak ng Bayan.

**14. FALSE** — The lesson says a primary source is *generally* more reliable, not always. Primary sources carry biases too (Alvarez wrote as a Magdiwang loyalist), and credibility must still be tested.

**15. TRUE** — Pigafetta was among only 18 of roughly 270 who returned, which is what makes his account so rare.

**16. FALSE** — It is the reverse: witnesses *without* a direct personal interest tend to be more credible than those with a stake in the outcome.

**17. TRUE** — The NAP holds government records from the Spanish colonial period; the National Library is the general national depository.

**18. FALSE** — The memoirs were serialized in the *Tagalog* weekly *Sampagita* in the 1920s.

**19. Sampagita** — the Tagalog weekly of the 1920s.

**20. The Strait of Magellan** — only three of the five ships made it through.

**21. The Santo Niño** — gifted at the mass baptism in Cebu and still venerated there today.

**22. Casamaan** — the place of punishment for the wicked; do not confuse it with *maca*, the place of rest for the just and valiant.

**23. PARES (Portal de Archivos Españoles)** — free online access to many digitized Spanish archival documents.

**24. Authorship, time, and space (setting/context)** — the three authenticity checks of external criticism.

**25. Secondary, written** — an encyclopedia is on the lesson's list of secondary sources.

**26. Primary, written** — Pigafetta was aboard the expedition; his chronicle is eyewitness testimony.

**27. Unwritten — oral evidence** — folk tales, myths, legends, and folk songs passed down through generations. For unwritten sources, the lesson classifies by type (archaeological, oral, material) rather than by the primary/secondary split.

**28. Unwritten — archaeological evidence** — excavated tools and pottery are artifacts revealing past cultures and lifeways.

**29. (a)** No. Agoncillo was not present at the events of 1897 (he lived 1912–1985), so under Gottschalk's eyewitness definition his book is a **secondary** source. **(b)** The lesson still treats it as a major scholarly reference because Agoncillo drew on a wide range of primary documents and pioneered nationalist historiography.

**30. (a)** Primary — Plasencia was a direct observer who lived and worked among the Tagalogs from his arrival in 1577. **(b)** He wrote as a Spanish Franciscan missionary; his purpose was partly descriptive and partly evangelical — documenting practices so other missionaries could understand and eventually replace them. **(c)** Internal criticism is needed because his colonial-Christian framing (he labeled indigenous specialists "Priests of the Devil") could distort the meaning of the practices he described.

---

### Mock Exam B — Key

**1. B** — The National Library of the Philippines (Filipiniana Division and Microfilm Section) holds the Historical Data Papers and Philippine Revolutionary Records. The NAP (A) is the tempting swap — it holds Spanish-period *government* records.

**2. B** — Taken during the British occupation of Manila, 1762–64.

**3. C** — The Ayer Collection is at the Newberry Library in Chicago. The Library of Congress and NARS are separate US repositories.

**4. D** — The lesson's three reasons are fabrication (the Maragtas case), negative revisionism, and misleading sources. "Primary sources are always biased" is not one of them — and "always" should make you suspicious anyway.

**5. B** — Ideologically fixed sources must be cross-checked against sources *not* aligned with that perspective. Discarding them outright (A) is not the rule; caution and corroboration are.

**6. B** — Assumption 1 in the lesson: relics and artifacts tend to be more reliable, while documents and testimonies are more detailed.

**7. B** — Baldomero Aguinaldo led the Magdalo. Emilio Aguinaldo (A) is the trap — he was elected President at Tejeros, but the faction leader named in the lesson is Baldomero.

**8. B** — A series of Spanish military defeats eroded Bonifacio's standing, especially in Cavite.

**9. D** — The five ships were *Victoria, Concepción, San Antonio, Santiago,* and *Trinidad*. There was no *San Pablo*.

**10. B** — Leather, sawdust, and mice — the lesson's stark detail about the Pacific crossing.

**11. B** — Rajah Colambu, at Masao. Rajah Siagun (D) was encountered around Homonhon; Rajah Humabon (A) belongs to Cebu; Lapu-Lapu (C) refused any compact.

**12. C** — The hocloban was the more powerful witch said to kill with a glance. Mangagauay induced and cured illness; the mancocolam emitted fire at night; the silagan of Catanduanes ate human livers.

**13. TRUE** — First published in 1956.

**14. TRUE** — *Le Voyage et Navigation*, c. 1525, Paris.

**15. TRUE** — Exactly as Plasencia recorded it.

**16. FALSE** — When all independent sources agree on an event, that event is generally accepted as factual — one of the lesson's basic assumptions.

**17. FALSE** — Bonifacio declared the proceedings null and void, was arrested, tried, and executed in May 1897.

**18. TRUE** — Approximately 2,000 titles on Philippine languages.

**19. Louis Gottschalk** — his 1950 definition anchors the whole primary/secondary distinction.

**20. Rajah Humabon** — over 800 natives, including Humabon and his wife, were baptized.

**21. The catalonan** — after the four-day, four-night blindfolded seclusion at a girl's first menstruation.

**22. Negative revisionism** — one of the reasons the test of authenticity exists.

**23. Tala** — the morning star; the Pleiades were called *Mapolon* and *Balatic*.

**24. August 10, 1519, from Seville** — with five ships and roughly 270 crew.

**25. Secondary** — measured against the events of 1897, Agoncillo is an outside, later scholar.

**26. Primary** — measured against the question "how did mid-20th-century Filipino historians write?", the 1956 book is itself direct evidence. Classification depends on proximity *to the event you are studying*, not on the book alone.

**27. Primary** — Alvarez was an eyewitness participant. The 1920s publication date matters for credibility testing (memory, motive), but it does not change his proximity to the event.

**28. Secondary** — a summary written by non-witnesses; it stands one step further from the voyage than Pigafetta himself.

**29. (a)** The historian cannot simply accept testimony: they must challenge each source (prosecutor), give it a fair hearing (defense attorney), and then weigh and decide (judge and jury) — this is the work of external and internal criticism. **(b)** The two lesson sources are Santiago Alvarez's *Katipunan and the Revolution* and Agoncillo's *The Revolt of the Masses*. For Alvarez, the historian must question his Magdiwang loyalties and sympathy for Bonifacio's side; for Agoncillo, his distance from the events and his nationalist interpretive framework.

**30. (a)** Pigafetta was aboard the expedition and present at the events he describes — the definition of a primary source. **(b)** It is the most detailed surviving firsthand narrative of the first circumnavigation, written by one of the few survivors. **(c)** He was a European outsider recording a brief encounter from the expedition's perspective, so his account cannot describe Filipino societies from within — a limitation the lesson flags for sources about pre-colonial Filipinos.

---

**Benchmark:** 24+ per mock means you are ready. 18–23: drill the traps section next. Below 18: re-read the module your misses cluster in before touching the traps.
$md$, 5);

-- ------------------------------------------------------------
-- SECTION 6 (LOCKED): Common Prelim Traps & How to Avoid Them
-- ------------------------------------------------------------

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('b2000001-0001-0002-0002-0000000000e1','activity','Common Prelim Traps & How to Avoid Them',$md$
These six traps account for most lost prelim points in this subject. Each one comes with a mini-drill — do the drill *before* reading its answer.

### Trap 1 — Treating "primary" as a permanent label on a book

Primary vs secondary is not a property of the book; it is a relationship between the source and **the event you are studying**. The lesson's key distinction is *proximity to the event*. Change the research question and the classification can flip.

**Mini-drill:** Classify Agoncillo's *The Revolt of the Masses* (1956) for each question: (a) "What happened at the Tejeros Convention in 1897?" (b) "How did Filipino historians of the 1950s interpret the revolution?"

> **Answer:** (a) Secondary — Agoncillo was not present in 1897. (b) Primary — the 1956 book is itself direct, firsthand evidence of 1950s nationalist historiography.

### Trap 2 — Swapping external and internal criticism

Sort by what is being questioned. **External criticism = authenticity**: is the document itself what it claims to be? (authorship, time, space — forgery hunting). **Internal criticism = credibility**: is what it *says* accurate? (competence, willingness to tell the truth, adequacy, reliability against other sources).

**Mini-drill:** Which test applies? (a) Scott (1984) shows the *Maragtas* rests on fabricated written sources. (b) A historian asks whether Santiago Alvarez, as a Magdiwang loyalist, was willing to describe the Magdalo fairly.

> **Answer:** (a) External criticism — the question is whether the document is genuine at all. (b) Internal criticism — the document is genuine; its truthfulness and bias are in question.

### Trap 3 — Confusing Pigafetta with Plasencia

Both are Spanish-era chroniclers, both are primary sources, and professors love swapping their details.

| | Pigafetta | Plasencia |
|---|---|---|
| Who | Italian scholar-explorer, layman | Spanish Franciscan friar |
| When | Sailed 1519–1522; in the Philippines in 1521 | Arrived 1577; wrote c. 1589 |
| Wrote about | The expedition: landfall, blood compact, first Mass, Cebu, Mactan | Tagalog customs: Bathala, the catalonan, rites, burial, afterlife |
| Bias to name | European explorer's outsider perspective on a brief encounter | Missionary evangelical framing ("Priests of the Devil") |

**Mini-drill:** Who recorded each? (a) The blood compact with Rajah Colambu. (b) The catalonan and the hocloban. (c) The names *maca* and *casamaan*. (d) The Battle of Mactan.

> **Answer:** (a) Pigafetta. (b) Plasencia. (c) Plasencia. (d) Pigafetta.

### Trap 4 — The two Aguinaldos and the two Alvarezes

Four names, two surnames, one exam disaster. Fix them now: **Mariano Alvarez** led the Magdiwang (Noveleta). **Santiago Alvarez** wrote the memoirs *Katipunan and the Revolution*. **Baldomero Aguinaldo** led the Magdalo (Kawit). **Emilio Aguinaldo** was elected President at Tejeros.

**Mini-drill:** Fill in: (a) Faction based in Kawit: ___, led by ___. (b) The Magdiwang author whose memoirs ran in *Sampagita*: ___. (c) Elected President on March 22, 1897: ___. (d) Bonifacio was executed in ___ (place), in ___ (month/year).

> **Answer:** (a) Magdalo, Baldomero Aguinaldo. (b) Santiago Alvarez. (c) Emilio Aguinaldo. (d) Maragondon, Cavite; May 1897.

### Trap 5 — Blurring the 1521 timeline

Four dates in six weeks; every mock exam tests their order. Anchor them: **March 16** — landfall at Zamal (Samar), islands named Archipelago of St. Lazarus. **March 27–28** — Masao, blood compact with Rajah Colambu. **March 31** — first Mass; cross erected. **April 7** — arrival in Cebu (Humabon; 800+ baptized; Santo Niño). **April 27** — Battle of Mactan; Magellan killed. Behind them sit **August 10, 1519** (departure from Seville) and **October 21, 1520** (Strait of Magellan).

**Mini-drill:** Put in order: Cebu arrival — first Mass — Samar landfall — Battle of Mactan — blood compact.

> **Answer:** Samar landfall → blood compact → first Mass → Cebu arrival → Battle of Mactan.

### Trap 6 — Mixing Gottschalk's credibility tests into the authenticity checklist

Two separate checklists, one author quoted for both — that is the whole trick. Authenticity (external): **authorship, time, space**. Credibility (internal, Gottschalk's four): **competence, willingness to tell the truth, adequacy of data, reliability against other sources**. Bonus fallacy to drop: "primary = true." The lesson says primary sources are *generally* more reliable — they still carry biases, and witnesses with a personal stake are *less* credible.

**Mini-drill:** Sort into External or Internal: (a) adequacy of data, (b) authorship, (c) willingness to tell the truth, (d) time of composition, (e) competence, (f) space/setting.

> **Answer:** External — (b) authorship, (d) time, (f) space. Internal — (a) adequacy, (c) willingness, (e) competence.

Master these six and the mock-exam distractors stop working on you. That is the point.
$md$, 6);

-- ------------------------------------------------------------
-- SECTION 7 (LOCKED): Final Exam Blueprint & Rapid Review Sheet
-- ------------------------------------------------------------

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('b2000001-0001-0002-0002-0000000000e1','activity','Final Exam Blueprint & Rapid Review Sheet',$md$
The final is **cumulative** — all ten modules — but weighted heavily toward the material after the prelim. Expect roughly 20% from the first four modules (definitions, criticism tests, Tejeros, the chronicles) and 80% from modules five to ten. This sheet compresses everything you must memorize for that 80%.

### Coverage and Weight

| Module in this app | Typical weight |
|---|---|
| The Meaning and Relevance of History / Tests of Authenticity and Credibility / Tejeros / Early Chronicles | ~20% combined |
| The Katipunan — Revolution and Its Documents | ~18% |
| Visual and Documentary Sources in Philippine History | ~12% |
| Historic Controversies | ~18% |
| Philippine Constitutions, Indigenous Peoples, and Agrarian Reform | ~18% |
| Colonial Legacies — Applied Historical Analysis | ~10% |
| Local History and Philippine Heritage | ~4% |

### Documents, Authors, Dates — The Master Table

| Document / Work | Author | Date | One fact examiners love |
|---|---|---|---|
| Kartilya ng Katipunan | Emilio Jacinto ("Brain of the Katipunan") | Katipunan era | Sold at four kualta per copy (Richardson, 2013); more expansive than Bonifacio's *Decalogue* — aspirations and moral values, not just obligations |
| *Liwanag at Dilim* | Emilio Jacinto | — | His collection of political and social essays |
| Acta de la Proclamación de la Independencia del Pueblo Filipino | Written and read by Ambrocio Rianzares Bautista | June 12, 1898, Kawit, Cavite | 98 signatories — but not Aguinaldo (Ocampo, 2020); one American signed: Colonel L.M. Johnson |
| Malolos Constitution | Malolos Congress (convened at Barasoain Church, Sept 15, 1898) | Promulgated Jan 21, 1899 | 93 articles, 14 titles; first republican constitution enacted in Asia; three branches |
| *Political Cartoons: Political Caricature of the American Era, 1901–1941* | Alfred McCoy and Alfredo Roces | 1985 | Cartoons as evidence of political culture: unequal pay, Uncle Sam vs Juan dela Cruz (*Lipag Kalabaw*, Nov 14, 1908), anti-friar, corrupt politicians, rice crisis of 1919 |
| Three accounts of the Cavite Mutiny | Montero y Vidal (Spanish), Pardo de Tavera (Filipino), Gov-Gen Rafael de Izquierdo (official) | 1872 event; compiled by Zaide (1990) | LeRoy called Montero y Vidal "rabid"; Izquierdo framed the mutiny as a wide conspiracy |

### Revolution-to-Republic Timeline

- **July 7, 1892** — Katipunan founded by Bonifacio after the Reform Movement failed and La Liga Filipina disbanded
- **August 30, 1896** — assault on San Juan del Monte (Jacinto as intelligence director)
- **March 22, 1897** — Tejeros Convention; **May 1897** — Bonifacio executed at Maragondon
- **May 1, 1898** — Dewey destroys the Spanish fleet in Manila Bay
- **June 12, 1898** — Independence proclaimed at Kawit; flag (sewn in Hong Kong) first raised; anthem by **Julian Felipe** first performed; Mabini calls it "reckless and premature"
- **September 15, 1898** — Malolos Congress convenes at Barasoain
- **January 21, 1899** — Malolos Constitution promulgated; **January 23, 1899** — First Philippine Republic inaugurated, Aguinaldo President
- **April 6, 1899** — Jacinto dies of malaria, about age 24

### The Two Controversies — Positions and Panels

**Site of the First Mass (March 31, 1521, said by Fr. Pedro de Valderrama at "Mazaua")**

| Position | Core evidence | Backing |
|---|---|---|
| Limasawa (Southern Leyte) | Navigational/geographical fit of Pigafetta's account: routes, currents, landmarks | NHCP position through most of the 20th century; **Gancayco Committee (1979)** — sailing routes, land forms, river deltas |
| Butuan / Masao (Agusan del Norte) | Pigafetta's explicit mention of Butuan; recorded latitude approx. 9 degrees 40 minutes North | Respondents to the **Mojares Panel (2018–2019)** — Gabriel Atega and Dr. Potenciano Malvar; Camiguin appearing as three "mountains" from heights near the 1872 Magallanes monument |

The lesson's bottom line — and the safe exam answer on "who is right": **the controversy remains unresolved at the scholarly level.**

**Cavite Mutiny (January 20, 1872, Fort San Felipe)**

- Crushed within hours; led to the execution of **GOMBURZA** — Frs. Mariano Gómez (73), José Burgos (35), Jacinto Zamora (37) — by **garrote at Bagumbayan, February 17, 1872**
- The priests were leaders of the **secularization** movement (transfer of parishes from Spanish friars to Filipino secular clergy)
- Rizal dedicated ***El Filibusterismo*** to them; their memory fed the Propaganda Movement and the Revolution of 1896
- Three versions: **Montero y Vidal** (Spanish, anti-Filipino bias), **Pardo de Tavera** (Filipino reformist context), **Izquierdo** (official report justifying repression)

### Constitutions At a Glance

| Constitution | Context | Hook to remember |
|---|---|---|
| Malolos (1899) | First Republic | First republican constitution in Asia; ended by the Philippine-American War (1899–1902) |
| 1935 | Commonwealth under the **Tydings-McDuffie Act (1934)** | Strong executive, bicameral legislature; Quezon first Commonwealth President |
| 1943 | Japanese occupation | Puppet republic under **Jose P. Laurel**; dismissed as illegitimate |
| 1973 | Martial Law (declared Sept 21, 1972) | Ratified via criticized **Citizens' Assemblies**; rule by decree |
| 1987 | After the 1986 People Power Revolution | Ratified **February 2, 1987**; restored the Senate; **social justice** is its heart (Muñoz-Palma); defined in *Calalang v. Williams* by Justice José Laurel as the humanization of laws and equalization of social and economic forces |

### Indigenous Peoples and Agrarian Reform — Numbers and Laws

- IP definition: historical continuity criteria from the **Martínez Cobo (1983)** UN study — ancestral lands, common ancestry, distinct culture, language, regional residence
- About **110 ethno-linguistic groups**, 14–17 million people; **Mindanao ~61%** (Lumad — 18 non-Muslim groups, Visayan for "of the land"; Moro — seven Islamized groups); **Cordillera ~33%** (Igorot — "people from the mountain"); Mangyan of Mindoro
- Colonial labels: *infieles* / *salvajes* (Spanish) → "non-Christian tribes" (American); Bureau of Non-Christian Tribes (1901); **David Barrows** and the 1903 census
- **IPRA — RA 8371 (1997)**: four bundles of rights — ancestral domains/lands, self-governance, social justice/human rights, cultural integrity; implemented by the **NCIP (1998)**
- Agrarian reform ladder: encomienda/hacienda → friar lands resold (often to the wealthy) → Land Reform Act (1955) → Agricultural Land Reform Code, **RA 3844 (1963)** → **PD 27 (1972)**, rice and corn lands only → **CARP, RA 6657 (1988)** under Corazon Aquino — broad scope, criticized as slow and incomplete

### Visual Sources — Names to Lock In

- **Juan Luna** (1857–1899, Badoc, Ilocos Norte): *Spoliarium* — 4.22 × 7.675 m, largest painting in the Philippines; **chiaroscuro**; Rizal read it as the Philippines under colonial rule and declared "genius knows no country"
- **Fernando Amorsolo** (1892–1972, National Artist 1972): *Planting Rice* (1951); wartime shift — *The Bombing of the Intendencia*, *The Burning of Manila*
- **Documentaries**: period footage inside them can be primary; the edited film itself is a **secondary** source

### Colonial Legacies — Rapid Facts

- Bridges: cut stone + *argamasa* (lime mortar; plant sap, molasses, egg white added); **Arquitectura Mestiza** (Ignacio Alcina, 1668); built by *polistas* under *polo y servicios*; masonic marks by Filipino stone cutters; e.g. **Puente de Malagonlong** (Tayabas), Puente de España (Manila)
- "Moro": Spanish label transplanted from the North African Moors of the Reconquista — Philippine Muslims had **no connection** to them; Moro Wars; raids read as self-defense (Muslim view) vs piracy (Spanish view); **Bates Treaty (1899)**; 1963 Senate report causes — land, education, livelihood, health/transport; MNLF by the 1960s–70s
- **Claveria Decree, November 21, 1849**: surnames from an official catalogue, distributed alphabetically by municipality — administrative control (taxes, records, identity)
- Education: pre-colonial **Baybayin** literacy; Spanish schooling = conversion and social control; American = **Thomasites (1901, ship Thomas)**, English medium, mass public and secular schooling, Americanization; later Filipino as co-medium, Marcos "New Society" use of curriculum, **K-12 (2012–2016)**

### Local History and Heritage — The Short List

- Local history = the "unheard history" of communities; **not the same as oral history** (spoken transmission across generations)
- Standards: authentic, accurate, objective, reliable, relevant, systematic/scientific
- NAP bundles: *Obras Publicas, Ereccion de Pueblos, Fincas, Testamentos, Provincias*
- UNESCO heritage: **cultural** (tangible — movable/immovable/underwater; intangible), **natural**, **heritage in armed conflict**
- **The Ruins** (Bacolod): Don Mariano Ledesma Lacson's mansion, burned by Filipino guerrillas in WWII so the Japanese could not garrison it — history gives heritage its context
- **Heritage Cycle** (Simon Thurley): understanding → valuing → caring → finding meaning → back to understanding
- **RA 10066, National Cultural Heritage Act of 2009**, building on the 1987 Constitution (Art. XIV, Secs. 14–17); agencies: NHCP, National Museum, National Library, CCP, National Archives

Run the two final mocks below only after you can reproduce the master table and the timeline from memory.
$md$, 7);

-- ------------------------------------------------------------
-- SECTION 8 (LOCKED): Final Mock Exam A — 30 Items
-- ------------------------------------------------------------

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('b2000001-0001-0002-0002-0000000000e1','activity','Final Mock Exam A — 30 Items',$md$
Cumulative, weighted toward everything after the prelim. 50 minutes, closed notes. Key with explanations is two sections down.

### Part I — Multiple Choice (Items 1–14)

**1.** The Katipunan was founded on July 7, 1892, in the wake of:

- A. The execution of GOMBURZA that same year
- B. The failure of the peaceful Reform Movement and the disbanding of Rizal's La Liga Filipina
- C. The proclamation of the Malolos Constitution
- D. The outbreak of the Spanish-American War

**2.** The Kartilya ng Katipunan is almost universally attributed to:

- A. Andres Bonifacio
- B. Emilio Aguinaldo
- C. Emilio Jacinto
- D. Apolinario Mabini

**3.** According to Jim Richardson (2013), how did Jacinto's Kartilya differ from Bonifacio's *Decalogue*?

- A. It was shorter and listed only obligations
- B. It was more expansive, focused on aspirations and moral values — the kind of person a Katipunero should aspire to be
- C. It was written in Spanish for the educated elite
- D. It abolished the Decalogue's teachings on equality

**4.** The Declaration of Philippine Independence was written and publicly read on June 12, 1898 by:

- A. Emilio Aguinaldo
- B. Apolinario Mabini
- C. Ambrocio Rianzares Bautista
- D. Julian Felipe

**5.** Which pair of facts about the Malolos Constitution is correct?

- A. Promulgated January 21, 1899; first republican constitution enacted in Asia
- B. Promulgated June 12, 1898; drafted at Kawit
- C. Promulgated January 23, 1899; established two branches of government
- D. Promulgated September 15, 1898; written by Rianzares Bautista

**6.** McCoy and Roces's *Political Cartoons* (1985) analyzes political caricature from which period?

- A. The Spanish era, 1872–1898
- B. The American era, 1901–1941
- C. The Japanese occupation, 1941–1945
- D. The Martial Law years, 1972–1986

**7.** The dramatic contrast of light and dark that defines Luna's *Spoliarium* is called:

- A. Sfumato
- B. Chiaroscuro
- C. Impasto
- D. Trompe l'oeil

**8.** The entire First Mass controversy turns on identifying the place Pigafetta called:

- A. Zamal
- B. Homonhon
- C. Mazaua
- D. Cebu

**9.** The Gancayco Committee (1979) concluded in favor of which site, based on sailing routes, land forms, river deltas, and geographical location?

- A. Butuan
- B. Limasawa
- C. Cebu
- D. Magallanes, Agusan del Norte

**10.** GOMBURZA were executed on February 17, 1872, by:

- A. Firing squad at Fort San Felipe
- B. Garrote at Bagumbayan
- C. Hanging at Intramuros
- D. Garrote at Maragondon

**11.** The 1935 Constitution was drafted after which U.S. law provided for the Philippine Commonwealth?

- A. The Bates Treaty
- B. The Tydings-McDuffie Act
- C. The Local Government Code
- D. Presidential Decree 27

**12.** The Indigenous Peoples' Rights Act (1997) is also known as:

- A. Republic Act 6657
- B. Republic Act 8371
- C. Republic Act 10066
- D. Republic Act 3844

**13.** Why did the Spaniards call Muslim Filipinos "Moros"?

- A. Philippine Muslims traced their ancestry to North Africa
- B. The Spaniards transplanted the name of the North African Moors of their Reconquista experience, despite Philippine Muslims having no connection to them
- C. It was the Muslims' own name for themselves
- D. American colonizers invented the term in 1899

**14.** The primary purpose of the Claveria Decree of 1849 was:

- A. Religious conversion of the native population
- B. Administrative control — stable, trackable family identities for taxation, legal records, and census
- C. Abolishing indigenous surnames entirely
- D. Rewarding loyal families with noble titles

### Part II — True or False (Items 15–19)

**15.** Emilio Aguinaldo's signature appears among the 98 signatories of the declaration of independence.

**16.** Apolinario Mabini considered the proclamation of independence "reckless and premature."

**17.** A documentary film, as a curated and edited work, is a secondary source even if it contains primary footage.

**18.** *Lumad* is a Visayan word meaning "of the land."

**19.** The 1943 Constitution was drafted by a Constitutional Commission after the People Power Revolution.

### Part III — Identification (Items 20–25)

**20.** The composer whose anthem was performed for the first time on June 12, 1898.

**21.** The church in Malolos, Bulacan where the Revolutionary Congress convened on September 15, 1898.

**22.** The National Artist who painted *The Bombing of the Intendencia* and *The Burning of Manila* during World War II.

**23.** The priest who offered the first Mass on Philippine soil on March 31, 1521.

**24.** The 1998 body created to implement the Indigenous Peoples' Rights Act.

**25.** The term coined by the Jesuit Ignacio Alcina in 1668 for the blend of European design with Philippine materials and labor.

### Part IV — Source Classification (Items 26–27)

**26.** An actual political cartoon printed in *The Independent* in 1915, used to study public opinion during the American era. Primary or secondary?

**27.** McCoy and Roces's 1985 book analyzing such cartoons. Primary or secondary?

### Part V — Document Analysis (Items 28–30)

> "Social justice is the heart of the 1987 Constitution." — Justice Cecilia Muñoz-Palma, President of the Constitutional Commission

**28.** (a) What historical event led directly to the drafting of this constitution, and when was it ratified? (b) According to Justice José Laurel in *Calalang v. Williams*, what does social justice mean?

> "Genius knows no country; genius sprouts everywhere." — José Rizal

**29.** (a) On the occasion of which painting, by which painter, did Rizal make this declaration? (b) What allegorical meaning did Rizal read into that painting?

> A 1963 Senate Committee report identified the root causes of Muslim discontent as: land problems, educational disparity, lack of livelihood, and inadequate health and transportation infrastructure.

**30.** (a) This report addresses which long-running problem in Philippine history? (b) Name the colonial-era origin of the hostile framing of Muslim Filipinos. (c) What armed movement had emerged by the 1960s–70s demanding an independent Muslim homeland?
$md$, 8);

-- ------------------------------------------------------------
-- SECTION 9 (LOCKED): Final Mock Exam B — 30 Items
-- ------------------------------------------------------------

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('b2000001-0001-0002-0002-0000000000e1','activity','Final Mock Exam B — 30 Items',$md$
Same cumulative scope as Final Mock A, all-new items, pitched at detail level — the questions that separate the top of the class. 50 minutes, closed notes.

### Part I — Multiple Choice (Items 1–14)

**1.** Which statement about Emilio Jacinto is true?

- A. He completed a law degree before joining the Katipunan
- B. He served as intelligence director in the assault on San Juan del Monte on August 30, 1896
- C. He led the Magdalo faction at the Tejeros Convention
- D. He wrote *The Revolt of the Masses*

**2.** According to Jim Richardson (2013), the Kartilya was:

- A. Distributed free to every member
- B. Sold at four kualta per copy, and it kept circulating even after the revolution shifted to resisting American control
- C. Printed only once and immediately banned
- D. Written in Spanish to reach the educated elite

**3.** The American who actually signed the declaration of independence was:

- A. Commodore George Dewey
- B. Colonel L.M. Johnson
- C. Governor William Howard Taft
- D. No American signed the document

**4.** The Malolos Constitution was composed of:

- A. 93 articles divided into 14 titles, plus transitory provisions
- B. 14 articles divided into 93 titles
- C. 50 articles in 7 titles
- D. A single declaration with no articles

**5.** The First Republic of the Philippines was inaugurated:

- A. June 12, 1898, at Kawit
- B. September 15, 1898, at Barasoain
- C. January 21, 1899, in Manila
- D. January 23, 1899, in Malolos, with Aguinaldo as President

**6.** The *Lipag Kalabaw* cartoon of November 14, 1908 depicted:

- A. Filipino politicians dividing public funds
- B. Juan dela Cruz questioning Uncle Sam about restrictions on freedom of speech, with the figures' size and posture showing the colonial power imbalance
- C. Chinese merchants hoarding rice
- D. Friars fleeing the islands

**7.** Cartoonists turned their critical attention to Chinese merchants during:

- A. The rice crisis of 1919
- B. The Philippine-American War
- C. The 1908 elections
- D. The Japanese occupation

**8.** The Butuan/Masao position on the First Mass rests on:

- A. The Gancayco Report of 1979
- B. Pigafetta's explicit mention of Butuan and his recorded latitude of approximately 9 degrees 40 minutes North
- C. A papal declaration of 1521
- D. The present location of the Santo Niño

**9.** Which statement about the Mojares Panel is correct?

- A. It was created in 1979 and settled the question permanently
- B. It was created by the NHCP and the National Quincentennial Committee ahead of the 500th anniversary, chaired by Dr. Resil Mojares, and heard respondents Gabriel Atega and Dr. Potenciano Malvar argue for Butuan
- C. It formally reversed the NHCP position and declared Butuan the site
- D. It was a committee of the Malolos Congress

**10.** American historian James LeRoy observed that which author became notably "rabid" in his treatment of the Cavite events?

- A. T.H. Pardo de Tavera
- B. Gregorio Zaide
- C. José Montero y Vidal
- D. Rafael de Izquierdo

**11.** Critics attacked the ratification of the 1973 Constitution because it was:

- A. Conducted entirely by mail
- B. Carried out through staged Citizens' Assemblies
- C. Never announced to the public
- D. Approved only by the Senate

**12.** The Comprehensive Agrarian Reform Program was enacted as:

- A. Republic Act 3844 in 1963
- B. Presidential Decree 27 in 1972 under Marcos
- C. Republic Act 6657 in 1988 under Corazon Aquino
- D. Republic Act 8371 in 1997

**13.** To increase the durability of *argamasa*, colonial bridge builders sometimes added:

- A. Crushed seashells and sand only
- B. Plant sap, molasses, and egg white
- C. Imported Roman cement
- D. Volcanic ash and iron filings

**14.** Republic Act 10066 is:

- A. The Indigenous Peoples' Rights Act
- B. The Local Government Code
- C. The National Cultural Heritage Act of 2009
- D. The Comprehensive Agrarian Reform Law

### Part II — True or False (Items 15–19)

**15.** The Philippine flag first raised on June 12, 1898 had been sewn in Hong Kong.

**16.** The *Spoliarium* measures 4.22 × 7.675 meters and is the largest painting in the Philippines.

**17.** Fr. Mariano Gómez was the youngest of the three priests executed in 1872.

**18.** Presidential Decree 27 (1972) mandated land transfer for all types of agricultural land.

**19.** Local history and oral history are two names for the same thing.

### Part III — Identification (Items 20–25)

**20.** The Governor-General whose official report portrayed the Cavite Mutiny as a widespread conspiracy, justifying the repressive response.

**21.** The novel Rizal dedicated to the memory of GOMBURZA.

**22.** The anthropologist who supervised the 1903 Philippine Census that classified Filipinos into "Christian and Civilized Tribes" and "Non-Christian and Wild Tribes."

**23.** The American teachers, deployed beginning 1901, popularly named after the ship that brought many of them.

**24.** The Bacolod City landmark — a mansion's skeletal remains — burned by Filipino guerrillas in World War II to deny the Japanese a garrison.

**25.** Simon Thurley's model describing how communities engage with heritage: understanding, valuing, caring, finding meaning, and back again.

### Part IV — Source Classification (Items 26–27)

**26.** The surviving Puente de Malagonlong in Tayabas, used to study colonial labor systems. Classify it: primary or secondary evidence, and written or unwritten?

**27.** A documentary film about the Philippine Revolution produced in 2010, taken as a whole work. Primary or secondary?

### Part V — Document Analysis (Items 28–30)

> Historical continuity may consist of: occupation of ancestral lands; common ancestry with the original occupants; distinct cultural expressions such as religion, tribal systems, dress, and livelihood; language; and residence in particular regions. — adapted from the UN study by José Martínez Cobo (1983)

**28.** (a) Which group of Filipinos does this framework define? (b) Which 1997 law protects this group, and what is its Republic Act number? (c) Name two of that law's four bundles of rights.

> Bridges typically bore markers identifying the Spanish official who commissioned construction, yet masonic symbols carved beneath the structures show that Filipino stone cutters marked their work. — adapted from the lesson on colonial bridges

**29.** (a) Under what colonial labor system were these bridges built, and what were the laborers called? (b) What do the carved marks reveal about the builders? (c) Name one other thing the lesson says bridges reveal about the colonial period.

> Local history is the "unheard history" of communities and localities — the collective experiences of ordinary people, places, and institutions that conventional national history has often overlooked.

**30.** (a) How does local history differ from oral history? (b) Name two of the six standards for writing local history. (c) Give one reason the lesson says local history matters.
$md$, 9);

-- ------------------------------------------------------------
-- SECTION 10 (LOCKED): Final Mock Exams — Answer Key with Explanations
-- ------------------------------------------------------------

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('b2000001-0001-0002-0002-0000000000e1','activity','Final Mock Exams — Answer Key with Explanations',$md$
Same rule as the prelim key: read every explanation, not just your misses. The wrong-choice notes are the vaccine against the final's distractors.

### Final Mock Exam A — Key

**1. B** — The Katipunan (1892) answered the failure of the peaceful Reform Movement and the disbanding of La Liga Filipina. GOMBURZA (A) died in 1872, twenty years earlier; the Malolos Constitution (C) and the Spanish-American War (D) come six years later.

**2. C** — Emilio Jacinto, the "Brain of the Katipunan." Bonifacio (A) wrote the separate *Decalogue* — the classic swap.

**3. B** — Richardson distinguishes the Kartilya as more expansive, focused on aspirations and moral values — the kind of person a Katipunero should aspire to be — versus the Decalogue's list of obligations.

**4. C** — Ambrocio Rianzares Bautista wrote and publicly read the *Acta*. Aguinaldo (A) proclaimed independence but did not write or read the document; Julian Felipe (D) composed the anthem.

**5. A** — January 21, 1899, and the first republican constitution enacted in Asia. January 23 (C) is the inauguration of the Republic, and the constitution established three branches, not two.

**6. B** — The book's subtitle says it: *Political Caricature of the American Era, 1901–1941*.

**7. B** — Chiaroscuro: the dramatic contrast of light and dark that highlights the mangled bodies against the oppressive background.

**8. C** — Pigafetta's "Mazaua" (Masao) is the disputed place. Zamal (A) was the first landfall; Homonhon (B) came before Mazaua; Cebu (D) came after.

**9. B** — The Gancayco Report (1979) favored Limasawa, based on sailing routes, land forms, river deltas, and geography, and anchored the NHCP position for decades.

**10. B** — Garrote at Bagumbayan (now Luneta). Fort San Felipe (A) was the mutiny site, not the execution site; Maragondon (D) is Bonifacio's story from 1897.

**11. B** — The Tydings-McDuffie Act (1934). The Bates Treaty (A) is the 1899 agreement with the Sultan of Sulu — different module, different problem.

**12. B** — RA 8371. RA 6657 is CARP; RA 10066 is the heritage act; RA 3844 is the 1963 agrarian code.

**13. B** — The Spaniards transplanted their Reconquista-era label for the North African Moors; the lesson stresses that Philippine Muslims had no connection whatsoever to them.

**14. B** — Administrative control: stable, trackable family identities for taxation, legal obligations, and the census. Religious conversion (A) was the Spanish *school* system's aim, not the surname decree's.

**15. FALSE** — Of the 98 signatories, Aguinaldo's signature does not appear (Ocampo, 2020).

**16. TRUE** — Mabini believed the Philippines was not yet ready; it needed more weapons and ammunition.

**17. TRUE** — Footage inside it may be primary, but the curated, edited film is the filmmaker's interpretation — a secondary source.

**18. TRUE** — The Lumad are the 18 non-Muslim IP groups of Mindanao; *Lumad* is Visayan for "of the land."

**19. FALSE** — The 1943 Constitution was the Japanese-sponsored charter under Jose P. Laurel; the Constitutional Commission after People Power produced the 1987 Constitution.

**20. Julian Felipe** — the anthem's composer; first performed June 12, 1898 at Kawit.

**21. The Church of Barasoain** — hence the name "Malolos Congress."

**22. Fernando Amorsolo** — he painted *The Bombing of the Intendencia* from his own house as the building burned.

**23. Fr. Pedro de Valderrama** — at Mazaua, March 31, 1521.

**24. The National Commission on Indigenous Peoples (NCIP)** — created in 1998 to implement IPRA.

**25. Arquitectura Mestiza** — "mixed architecture": European design executed in Philippine materials by Filipino labor.

**26. Primary** — a cartoon printed in 1915 is a visual source created inside the period being studied, carrying its creator's perspective on that moment.

**27. Secondary** — a 1985 scholarly analysis produced decades after the events, reflecting on them from outside.

**28. (a)** The 1986 People Power Revolution, which ousted Marcos and brought Corazon Aquino to power; the constitution was ratified on February 2, 1987. **(b)** The humanization of laws and the equalization of social and economic forces so that justice may be approximated for all.

**29. (a)** The *Spoliarium*, by Juan Luna. **(b)** Rizal read it as a representation of the Philippines under colonial rule — humanity unredeemed, idealism in struggle against injustice.

**30. (a)** The Moro problem as it persisted after independence in 1946. **(b)** The Spanish transplanted their Reconquista hostility, labeling Philippine Muslims "Moros" after the North African Moors and waging repeated military campaigns (the Moro Wars) against them. **(c)** The Moro National Liberation Front (MNLF).

---

### Final Mock Exam B — Key

**1. B** — Jacinto served as intelligence director at San Juan del Monte on August 30, 1896. He never completed a formal university degree (A); Magdalo was led by Baldomero Aguinaldo (C); *The Revolt of the Masses* is Agoncillo's (D).

**2. B** — Sold at four kualta per copy and still circulating after the fight shifted to resisting American control (Richardson, 2013).

**3. B** — Colonel L.M. Johnson. Dewey (A) is the trap: he was invited but did not appear.

**4. A** — 93 articles divided into 14 titles, plus transitory provisions.

**5. D** — January 23, 1899, at Malolos, with Aguinaldo as President. June 12 (A) is the proclamation of independence; September 15 (B) is the Congress convening at Barasoain; January 21 (C) is the constitution's promulgation.

**6. B** — Juan dela Cruz questioning Uncle Sam about free-speech restrictions; the figures' relative size and posture visually communicated the colonial power imbalance.

**7. A** — The rice crisis of 1919 turned cartoonists against Chinese merchants; critical attention to Japan came later, over its expanding military ambitions.

**8. B** — The explicit mention of Butuan in Pigafetta's account plus his recorded latitude of about 9 degrees 40 minutes North. The Gancayco Report (A) supports the *other* side.

**9. B** — Created by the NHCP and the National Quincentennial Committee for the 500th anniversary, chaired by Dr. Resil Mojares, with respondents Atega and Malvar arguing for Butuan (including the Camiguin "three mountains" observation). It did not settle the question (A) or formally reverse the NHCP position (C) — the lesson says the controversy remains unresolved.

**10. C** — José Montero y Vidal, the Spanish official whose account LeRoy said became notably "rabid" — strongly condemning the executed priests.

**11. B** — Staged Citizens' Assemblies: the standard criticism of the January 1973 ratification.

**12. C** — RA 6657, 1988, under Corazon Aquino. RA 3844 (A) is the 1963 Agricultural Land Reform Code; PD 27 (B) covered rice and corn lands only; RA 8371 (D) is IPRA.

**13. B** — Plant sap, molasses, and egg white were added to the lime-and-water *argamasa* for durability.

**14. C** — The National Cultural Heritage Act of 2009, built on the 1987 Constitution's Article XIV mandate.

**15. TRUE** — Sewn in Hong Kong, first raised and waved publicly at Kawit on June 12, 1898.

**16. TRUE** — 4.22 × 7.675 meters; the largest painting in the Philippines.

**17. FALSE** — Gómez was the *oldest* at 73; Burgos (35) was the youngest, with Zamora at 37.

**18. FALSE** — PD 27 covered rice and corn lands only; that limited scope is exactly the lesson's criticism of it.

**19. FALSE** — They are related but distinct: local history is the ground-up history of communities and localities; oral history is specifically the transmission of historical experience through the spoken word across generations.

**20. Governor-General Rafael de Izquierdo** — his official report framed the mutiny as a widespread conspiracy to justify the repression.

**21. *El Filibusterismo*** — dedicated to the memory of the three martyred priests.

**22. David Barrows** — of the Bureau of Non-Christian Tribes (established 1901).

**23. The Thomasites** — after the ship *Thomas* that brought many of them.

**24. The Ruins** — Don Mariano Ledesma Lacson's mansion; knowing the history is what turns the picturesque ruin into layered heritage.

**25. The Heritage Cycle** — understanding → valuing → taking care of it → finding meaning → back to understanding.

**26. Primary, unwritten** — a surviving bridge is material/tangible evidence from inside the period: its stone, mortar, and carved marks testify directly to colonial construction and labor.

**27. Secondary** — as a curated, edited whole it is the filmmaker's 2010 interpretation; only actual period footage inside it would count as primary.

**28. (a)** The Indigenous Peoples of the Philippines. **(b)** The Indigenous Peoples' Rights Act (IPRA), Republic Act 8371. **(c)** Any two of: right to ancestral domains and lands; right to self-governance and empowerment; right to social justice and human rights; right to cultural integrity.

**29. (a)** The *polo y servicios* labor obligation; the laborers were called *polistas*. **(b)** Filipino stone cutters marked their work with carved symbols — asserting their presence even in anonymous colonial construction officially credited to the Spanish commissioners. **(c)** Either: bridges show economic integration (connecting pueblos and alcaldias for goods, troops, and missionaries), or they served as boundary markers between towns and provinces.

**30. (a)** Local history is the ground-up history of communities and localities; oral history refers specifically to historical experience transmitted through the spoken word across generations. **(b)** Any two of: authentic, accurate, objective, reliable, relevant, systematic/scientific. **(c)** Any one of: it fills gaps in the national narrative; corrects imbalances by giving voice to marginalized groups; strengthens local identity; supports national development as communities gained autonomy under the Local Government Code.

---

**Benchmark:** 25+ on each final mock and you walk into the exam room calm. Below 20, go back to the Rapid Review Sheet, rebuild the master table from memory, and retake the weaker mock in two days.
$md$, 10);
