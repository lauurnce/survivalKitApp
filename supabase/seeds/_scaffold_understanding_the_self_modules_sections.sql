-- ============================================================
-- Understanding the Self, Modules & Sections (SCAFFOLD)
-- Subject ID: 11509900-1340-449a-993c-13b894dee299
-- 1st Year, Semester 1, minor
-- Suggested module count: 4-6
--
-- Reserved UUID namespace below is collision-free and deterministic.
-- Fill module titles/slugs + section headings/bodies from the GPT-5.5
-- deep-research output, then run this file once. Re-running is safe
-- (the DELETE clears prior rows for this subject first).
-- ============================================================

DELETE FROM modules WHERE subject_id = '11509900-1340-449a-993c-13b894dee299';

-- ---- Reserved module UUIDs (use in order; delete unused rows) ----
--   M01: a5a94d46-8676-5a28-94cf-f8849ea90ad6
--   M02: 1bbfe4a0-d9ab-570b-8176-f8910b4293e4
--   M03: cdb37a9c-0c3c-519c-b54b-71716b948674
--   M04: 1132195f-3e9a-5020-8393-7d3e4244cc3f
--   M05: 6d899f41-8f1f-5553-b8c7-226e17294a79
--   M06: 11dd19c6-4ea5-5af4-bd6c-728e7aedb90f
--   M07: 8b1f0f64-a114-5a56-ac9b-b41a133151e5
--   M08: 71e363b9-e097-5fb8-818c-0c419246aaaf
--   M09: 00d4f74c-6917-58c3-8e3b-f7046e6e4c34
--   M10: ce3eb041-48c7-5db1-8648-c186344c61b9
--   M11: f55ce98b-08d3-5006-a1c9-eff5833bb837
--   M12: 111a96d3-1448-55d6-adb3-8e38bd7c6636

-- INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
--   ('a5a94d46-8676-5a28-94cf-f8849ea90ad6','11509900-1340-449a-993c-13b894dee299','Lesson 1: <TITLE>','lesson-1-<slug>',1),
--   ('1bbfe4a0-d9ab-570b-8176-f8910b4293e4','11509900-1340-449a-993c-13b894dee299','Lesson 2: <TITLE>','lesson-2-<slug>',2),
--   ('cdb37a9c-0c3c-519c-b54b-71716b948674','11509900-1340-449a-993c-13b894dee299','Lesson 3: <TITLE>','lesson-3-<slug>',3),
--   ('1132195f-3e9a-5020-8393-7d3e4244cc3f','11509900-1340-449a-993c-13b894dee299','Lesson 4: <TITLE>','lesson-4-<slug>',4),
--   ('6d899f41-8f1f-5553-b8c7-226e17294a79','11509900-1340-449a-993c-13b894dee299','Lesson 5: <TITLE>','lesson-5-<slug>',5),
--   ('11dd19c6-4ea5-5af4-bd6c-728e7aedb90f','11509900-1340-449a-993c-13b894dee299','Lesson 6: <TITLE>','lesson-6-<slug>',6),
--   ('8b1f0f64-a114-5a56-ac9b-b41a133151e5','11509900-1340-449a-993c-13b894dee299','Lesson 7: <TITLE>','lesson-7-<slug>',7),
--   ('71e363b9-e097-5fb8-818c-0c419246aaaf','11509900-1340-449a-993c-13b894dee299','Lesson 8: <TITLE>','lesson-8-<slug>',8),
--   ('00d4f74c-6917-58c3-8e3b-f7046e6e4c34','11509900-1340-449a-993c-13b894dee299','Lesson 9: <TITLE>','lesson-9-<slug>',9),
--   ('ce3eb041-48c7-5db1-8648-c186344c61b9','11509900-1340-449a-993c-13b894dee299','Lesson 10: <TITLE>','lesson-10-<slug>',10),
--   ('f55ce98b-08d3-5006-a1c9-eff5833bb837','11509900-1340-449a-993c-13b894dee299','Lesson 11: <TITLE>','lesson-11-<slug>',11),
--   ('111a96d3-1448-55d6-adb3-8e38bd7c6636','11509900-1340-449a-993c-13b894dee299','Lesson 12: <TITLE>','lesson-12-<slug>',12);

-- ---- Reserved section UUIDs, per module ----
-- Module 1 (a5a94d46-8676-5a28-94cf-f8849ea90ad6):
--   S1: 9792671b-fe88-5daa-84bf-1f617e27de40
--   S2: ce98161e-bb1b-5aa2-b08a-03d9ddf5bafd
--   S3: 52c484fe-6de4-534f-9b8c-5c0cdd6da0a9
--   S4: 3502a2e2-d48a-5306-af81-5a3329580aa2
--   S5: 9254e0b8-185f-5bae-bf20-79acb4377680
--   S6: 956300ff-b8af-5d99-b543-cee199dc8c0c
--   S7: 50978c3a-0753-5ace-8d15-bae51b8f7163
--   S8: 911840e5-5cf4-5da0-a0eb-79eb5c2ecd4d
--   S9: 520faced-c3ee-5ad8-b232-023001b40de7
--   S10: 554a0640-5468-58ec-8e49-14e259161ae2  <- reserve last for kind='activity'
-- Module 2 (1bbfe4a0-d9ab-570b-8176-f8910b4293e4):
--   S1: 03470e97-2289-5025-a08a-77f44fbc941e
--   S2: 25bc828f-005e-5f3b-a0ce-a625b2093c4e
--   S3: 51fbfe51-ff3f-5d5a-b796-bb5da6b1f91a
--   S4: 35eeeb48-03b7-5415-b454-66e13fd8de20
--   S5: 4ed7ab87-ec5a-59c3-9b61-a78f42950a0d
--   S6: 9a2a4314-4a4c-55a4-96e9-4cf18af52868
--   S7: 4096daa1-f3e4-5e83-8443-b8ead95380f1
--   S8: d1197182-8679-52b7-acfd-bea02e26d18d
--   S9: 8f19c3ca-243a-5322-8898-b3c11f0f1978
--   S10: 97897f5f-92df-5602-bf5e-6c1bdb08ee7f  <- reserve last for kind='activity'
-- Module 3 (cdb37a9c-0c3c-519c-b54b-71716b948674):
--   S1: 49d13abb-e91c-5c61-9de4-a504ed0adc47
--   S2: efaecef0-dd51-511a-b228-a801c302d133
--   S3: 5072b3bc-9dec-51d6-b4bb-0bac40f68ae6
--   S4: e6ddb2c7-234b-56ef-ae16-2b55cf00ad3e
--   S5: af4f16bf-9bcb-5fc2-8e63-4f58b37b189a
--   S6: cbdb0b9c-1bf0-5b0b-b100-e83a94044dac
--   S7: 9f9556b6-7182-5b3c-bb66-ae47191afe2e
--   S8: ddfbd515-68ff-594e-8860-9096647a2132
--   S9: 15bf7c55-59a6-5f00-b01d-c7784a7a6f7c
--   S10: b117d34e-0a40-53d1-b5cc-8d21bee5035f  <- reserve last for kind='activity'
-- Module 4 (1132195f-3e9a-5020-8393-7d3e4244cc3f):
--   S1: 51c15b0c-d005-536a-9b7b-1a2d59070962
--   S2: cfea9168-f809-5011-bbd2-d46107565dcf
--   S3: 126f64df-97ed-5412-ab13-875ddaec7716
--   S4: afc75a8f-c41b-53d4-8a46-9f750ead4b77
--   S5: 86d2570a-dc89-5c23-b56d-247b07a6a787
--   S6: c432b1b6-3c02-5813-b2f1-ca8d94022ca9
--   S7: d58ace16-75b6-5e78-a9f3-2e4202c7dd1d
--   S8: 0da6f78a-92ed-5a0f-b82b-28d67bb5dffd
--   S9: 72932d81-1e8e-58ab-beb4-f85f2781ff55
--   S10: 26901dc1-da50-5c9c-a4ea-416627dc5966  <- reserve last for kind='activity'
-- Module 5 (6d899f41-8f1f-5553-b8c7-226e17294a79):
--   S1: 7027d71f-bc06-5a54-9387-8818a56297eb
--   S2: 8f75c355-9a27-5a53-9f29-5e853828f44f
--   S3: 4700435f-3d84-5a80-bf97-b8ff85379278
--   S4: c7115202-3ede-50d2-b063-7e21da87b5f1
--   S5: 4e05ed4f-835e-5e28-a9b4-d0145250d569
--   S6: 6232b894-3c88-561d-bc06-081fcaec34f2
--   S7: 6562f11d-935a-551c-9d08-1f48a6c12122
--   S8: d0cf2384-6f80-5bc6-85e3-1bebeb7b09c7
--   S9: d55fbcaa-8bab-59ef-9498-2d0a64dd8a42
--   S10: e4083284-a6ab-5a2b-ac03-d3f2e595ab0f  <- reserve last for kind='activity'
-- Module 6 (11dd19c6-4ea5-5af4-bd6c-728e7aedb90f):
--   S1: 189fc452-a237-59a1-9fee-561610c450aa
--   S2: 0fdce087-7adb-5f6b-82bf-b825aa5b4282
--   S3: 0a7dc3ea-f798-5749-b49c-ef4a3edc604a
--   S4: 9ce2353a-993c-5bad-b455-9a9b54f0f29a
--   S5: 51d8fbb1-8918-5050-afe4-270253cb9fed
--   S6: c7a551e1-deae-536c-a9a7-9eb5e33b2ac9
--   S7: 4f998f80-d13a-5f2a-a705-51be6d91febd
--   S8: 65ae462b-c73f-5d74-9ab0-96bdcc782cfb
--   S9: f032738e-3d2a-5f02-82ea-c3239bd5c967
--   S10: 054234bf-58a9-5e60-9a70-ff7b32fb4bd2  <- reserve last for kind='activity'
-- Module 7 (8b1f0f64-a114-5a56-ac9b-b41a133151e5):
--   S1: 4855edea-3400-545a-b98d-27258828c917
--   S2: a2fc4111-f7c6-563e-86de-f43f4707d4ed
--   S3: c87c381b-aa05-51bf-b67c-3fe4223b90ac
--   S4: 5bab62e8-1f4c-544f-92c3-8f9f427b5e9c
--   S5: 5fe2c2a3-7b3d-5e1a-80a1-d559f24bfcba
--   S6: 3089eb2e-40d8-517c-ad6f-40793c6cb985
--   S7: b2b6523d-ce62-5067-aa25-36b358927f84
--   S8: c39483f7-1e8b-5a56-8314-36479272ce0e
--   S9: b8a1e35c-eca1-5920-a1e7-edb95701477f
--   S10: a5e08e4b-988f-56f1-bee2-cd7ac11f933a  <- reserve last for kind='activity'
-- Module 8 (71e363b9-e097-5fb8-818c-0c419246aaaf):
--   S1: 972a57c3-38cd-57f0-9489-32ae87feb87f
--   S2: e74a2b48-8f20-5591-98d4-59aadddd9684
--   S3: 9eade0f3-c624-5afb-a1d6-7c53017dc019
--   S4: cd4a134d-8ef4-5349-aaa3-9416f34066e9
--   S5: 2e25a7a1-3816-525a-ab75-2d811bb3d145
--   S6: f20e8f4a-798f-532c-bd81-3a0425811d27
--   S7: 8f0520b5-3d66-5208-a964-0c704ba8dd4e
--   S8: 4f8c3bba-51c5-512c-829e-75a04ab48a3a
--   S9: fc0737ab-037d-5ced-83f3-fee5d789063b
--   S10: aeed9046-fec9-5480-b074-aa6b0040f687  <- reserve last for kind='activity'
-- Module 9 (00d4f74c-6917-58c3-8e3b-f7046e6e4c34):
--   S1: 0ce4fc97-3c14-5646-9207-e6a83698a66e
--   S2: 6ae4055f-940f-5768-ab95-76748e2e2163
--   S3: 9cd040f3-c68c-53fc-bb63-034a22736741
--   S4: 47c43ec9-3d71-5f4f-a82d-20b9291281d1
--   S5: 44a8dbc2-52e0-52ef-87bf-aba1838aaa35
--   S6: 9148e1f1-d798-540a-beb4-4bb993fa9fc0
--   S7: 3ba3d0af-9433-5368-91c0-2a29b7289d21
--   S8: 104df5aa-9198-511f-a67c-e9fa5e60a8b0
--   S9: c16ea317-25a5-5e45-b5ca-872da360d997
--   S10: f5f5a894-cdba-5fba-b6e1-2eb80bea653f  <- reserve last for kind='activity'
-- Module 10 (ce3eb041-48c7-5db1-8648-c186344c61b9):
--   S1: 41c4de6f-13e9-57ae-a0ec-ead455295bc0
--   S2: ea9fe62d-dc16-53cc-9a06-ded37982b6e4
--   S3: 6a019483-04ce-5710-a98c-359068c94339
--   S4: 21a6aa71-54a1-5d64-aab1-692ac4268f6f
--   S5: 69815678-899b-567b-ba1e-a662081301d8
--   S6: bb1f1737-9b3f-5877-ba15-267fa078c5c9
--   S7: 2c7c3be9-94f0-534f-803f-0945210767bf
--   S8: 6b86e439-c7ed-558e-bc3f-7ad47b6026e4
--   S9: a82e2154-8035-54fa-9dfe-d36d884d53cd
--   S10: 042d2dac-b4f0-523b-90de-7573414a56d9  <- reserve last for kind='activity'
-- Module 11 (f55ce98b-08d3-5006-a1c9-eff5833bb837):
--   S1: ac0d352b-2ae1-5152-a69f-c389dd8a2b72
--   S2: 609db7ae-aa57-53f8-85b5-1f634e56512a
--   S3: 7b110cda-2164-5c7a-a09f-34ee53f3d4ee
--   S4: 453b38ed-3995-5ca8-985f-12acd4860a36
--   S5: b73d546e-f064-5a3d-a8be-c3d65ab5fce8
--   S6: cf5245da-c38b-5b9d-b06a-1b045205ccaf
--   S7: dd9880d9-ac3b-56a9-9e9e-b3aa68589c2d
--   S8: ebb673b6-dc52-5e0f-9148-d76f25cdc6f8
--   S9: 5238c5cf-335b-5bbc-96c8-d0a629aba7d6
--   S10: 26fe05d7-b5fc-5cca-b9df-da4e4e624fac  <- reserve last for kind='activity'
-- Module 12 (111a96d3-1448-55d6-adb3-8e38bd7c6636):
--   S1: d7a792e4-67b6-57f6-908b-a6ecaa08f9e2
--   S2: 8ea704f6-81ae-55ab-88a6-a9e8eace9818
--   S3: b6e20452-40e2-5909-a50f-d056f99a25bf
--   S4: f28eb300-9c0b-59f7-b352-f5b0b45a4c66
--   S5: 4f3040d4-5ebe-5ed4-a675-b06852daaa33
--   S6: 406d1826-27a9-59f3-987c-6bee5892cd0a
--   S7: 883603be-ba1c-5331-bd2c-e40348d498b8
--   S8: 0eeab003-1a69-5aaa-90d1-c6bd30ac1767
--   S9: 9778dbb3-2401-56e6-bbf3-c38393e8eb35
--   S10: 5f167f4b-b798-5699-86e9-d15047a1c1f9  <- reserve last for kind='activity'

-- ============================================================
-- IMPORT TEMPLATE, one INSERT per module. Replace placeholders.
-- content sections are FREE; the final activity section is PAID.
-- ide_language (python|sql|java|c), starter_code, topology_data are
-- all OPTIONAL columns, include only when the section needs them.
-- ============================================================
--
-- INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
-- ('a5a94d46-8676-5a28-94cf-f8849ea90ad6','content','<Heading>',$md$
-- <full markdown teaching body, free tier>
-- $md$, 1),
-- ('a5a94d46-8676-5a28-94cf-f8849ea90ad6','activity','Practice & Exam Drills, Lesson 1',$md$
-- <review questions, worked exam problems w/ solutions, how-to-pass tips, paid tier>
-- $md$, 2);
--
-- With an interactive playground, use the 5-column form instead:
-- INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
-- ('a5a94d46-8676-5a28-94cf-f8849ea90ad6','activity','Coding Drill',$md$<task>$md$, 3, 'python', $code$print("hi")$code$);

-- >>>>>>>>>>>>>>>>>>>>  PASTE FILLED-IN INSERTS BELOW  <<<<<<<<<<<<<<<<<<<<

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('a5a94d46-8676-5a28-94cf-f8849ea90ad6','11509900-1340-449a-993c-13b894dee299','Lesson 1: Concepts and Perspectives of Self','lesson-1-concepts-and-perspectives-of-self',1),
  ('1bbfe4a0-d9ab-570b-8176-f8910b4293e4','11509900-1340-449a-993c-13b894dee299','Lesson 2: Psychology of the Self','lesson-2-psychology-of-the-self',2),
  ('cdb37a9c-0c3c-519c-b54b-71716b948674','11509900-1340-449a-993c-13b894dee299','Lesson 3: Social and Cultural Dimensions of Self','lesson-3-social-and-cultural-dimensions-of-self',3),
  ('1132195f-3e9a-5020-8393-7d3e4244cc3f','11509900-1340-449a-993c-13b894dee299','Lesson 4: The Digital Self and Society','lesson-4-the-digital-self-and-society',4),
  ('6d899f41-8f1f-5553-b8c7-226e17294a79','11509900-1340-449a-993c-13b894dee299','Lesson 5: Personal Growth and Self-Care','lesson-5-personal-growth-and-self-care',5);

-- ==== Lesson 1 ====
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a5a94d46-8676-5a28-94cf-f8849ea90ad6','content','Defining Self and Identity',$md$
Every person asks, "Who am I?" Understanding the self begins with defining what we mean by "self" and "identity." The self can refer to you as an individual: your thoughts, feelings, and personality. Identity includes the roles and labels we carry (like student, Filipino, friend) and how we see ourselves. Together, self and identity shape how you understand who you are.

Think of the self as having layers. At the core is personal identity (your own traits and beliefs), and around it is social identity (groups and roles you belong to). For example, you might describe yourself as a friendly daughter (personal identity) who is part of a particular barangay (social identity). These layers interact: your personal choices are influenced by social groups, and vice versa.
$md$, 1),
('a5a94d46-8676-5a28-94cf-f8849ea90ad6','content','Philosophical and Cultural Views of the Self',$md$
Different cultures and thinkers have different views of the self. In Western philosophy, the self is often seen as a separate individual with unique rights and goals. Think of ideas like "I think, therefore I am" (Descartes) or the Protestant emphasis on individual worth. In contrast, many Filipino and Asian traditions emphasize "kapwa" or shared identity. In this view, the self is closely linked to family, community, and relationships. For example, in Filipino culture, one's choices often reflect concern for family honor or community benefit.

Across disciplines, scholars ask: is the self one unified thing or many parts? Some suggest multiple selves: for instance, your online self vs. in-person self, or how you behave at home vs. with friends. Understanding these perspectives helps you see that self is partly what you think about yourself and partly how society and culture shape you.
$md$, 2),
('a5a94d46-8676-5a28-94cf-f8849ea90ad6','activity','Components of Identity',$md$
Identity comes from many components. Some common factors include:

- **Personal traits:** qualities like kindness, intelligence, or creativity.
- **Roles and labels:** being a student, son/daughter, teammate, or member of a club. These are roles you perform.
- **Cultural identity:** language, religion, and traditions (e.g., Filipino, Catholic, Visayan).
- **Experiences:** life events, successes and failures (surviving an exam, joining a festival). These shape how you see yourself.

By reflecting on these components, you start to see the big picture of your self and identity. You might use a journal to list your roles and traits, or talk with friends about what defines you. This exploration is the first step in understanding who you are.

Ready to apply this? The practice set for this lesson includes exam-style questions and reflection exercises that build your understanding of self and identity, unlock it to start drilling.
$md$, 3),
('a5a94d46-8676-5a28-94cf-f8849ea90ad6','activity','Practice & Exam Drills, Lesson 1',$md$
**Review Questions:**

1. What is the difference between self and identity?
2. Name two components that contribute to personal identity.
3. Explain how cultural values (e.g. kapwa) can influence one's self-view.
4. Describe a situation where your online self might differ from your offline self.

**Worked Problems:**

**Essay Question:** Choose a Filipino cultural practice (like bayanihan, family ties, or fiestas) and explain how it reflects a view of the self that differs from a purely individualistic perspective.

**Solution:** [Example answer] In Filipino culture, bayanihan (community cooperation) shows a collectivist view of self. Individuals see themselves as part of a group. Unlike an individualistic perspective (where success is personal), in bayanihan everyone's actions benefit the community. For instance, during fiestas, people work together to prepare the celebration. This teaches that identity includes being a helpful member of the group. Therefore, the self is understood in relation to others, not just as an isolated individual. This matches Asian perspectives where kapwa (shared identity) is important.

**Scenario Analysis:** Ali and Ben are both college freshmen. Ali describes himself mainly by his hobbies and dreams, while Ben describes himself by his family role (oldest son) and barangay community work. How do their self-descriptions reflect different aspects of identity?

**Solution:** Ali focuses on personal identity (his own traits and goals) which is common in individualistic contexts. Ben emphasizes social identity (family role, community). This shows how identity has multiple parts. Ben's identity is shaped by his relationships (familial and community roles). Ali's identity is more about his own characteristics. Both views are valid; understanding the self involves seeing all these parts.

**Hands-On Exercise (Reflection):**

- **Identity Map:** Draw a circle in the center of a page with your name. Around it, write labels for roles (e.g. student, friend), values (e.g. honesty), and groups (e.g. religion, sports team). Connect them with lines to you. Which influence seems strongest? Why?
- **Personal Journal:** Write a short paragraph about a time when your idea of yourself changed (e.g. after winning an award or failing a test). What caused this change?

**How to Pass Tips:**

- Remember key terms: self, identity, personal identity vs. social identity. Professors often ask you to define these clearly.
- Use Filipino examples if allowed (e.g. family, bayanihan), it shows understanding of context.
- Don't just list traits; explain how they fit together (e.g. "I am a student and a writer because…").
- For scenario questions, organize your answer (point out different aspects and compare). Outline before writing.
$md$, 4);

-- ==== Lesson 2 ====
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('1bbfe4a0-d9ab-570b-8176-f8910b4293e4','content','Bandura''s Person-Behavior-Environment Model',$md$
Psychologist Albert Bandura proposed that the self develops through a triadic interaction of Person, Behavior, and Environment. This means your personal traits (P), your actions (B), and the environment (E) all influence each other in a loop. For example, your interest in coding (person) may lead you to join a school programming club (behavior), which places you among tech-savvy friends (environment). Those friends then inspire you to learn more coding (back to person).

**Key idea: Reciprocal determinism.** You're not a passive product of your environment; you also choose and change it. A supportive environment (like a positive family or school) can build self-confidence, while your own choices can shape your environment. Understanding this helps you see that self is partly shaped by surroundings but also by your actions.
$md$, 1),
('1bbfe4a0-d9ab-570b-8176-f8910b4293e4','content','Developmental Theories of Self',$md$
Psychology suggests the self changes over life stages. For example:

- **Erikson's stages:** In adolescence, the major task is identity vs. role confusion. Teenagers try different roles (cliques, hobbies) to find who they are. Success leads to a strong identity; confusion leads to uncertainty about themselves. A Filipino example: A teenager might balance being filial to family vs. pursuing a dream career. Navigating this helps form their self-concept.
- **Childhood:** Early experiences (being praised or scolded) shape basic self-esteem. If a child is encouraged ("You can do it!"), they build confidence.
- **Adulthood:** Self continues evolving with career, relationships, parenthood.

Also consider Maslow's hierarchy. When basic needs (food, safety) are met, people can pursue self-esteem and self-actualization (fulfilling potential). If you have a stable life (like many Filipino families value), you can focus on personal growth.
$md$, 2),
('1bbfe4a0-d9ab-570b-8176-f8910b4293e4','activity','Personality and Self-Concept',$md$
Your self-concept is how you see yourself (it's partly a mental "picture" of you). It includes self-esteem (how much you value yourself) and self-efficacy (believing you can succeed). For example, if you believe "I am good at math," you're likely to tackle math problems confidently. A class failed exam might threaten that belief unless you reassure yourself.

Major theories:

- **Psychoanalytic (Freud):** Divides self into id/ego/superego; it emphasizes unconscious influences (e.g. drives, family).
- **Humanistic (Rogers, Maslow):** Focuses on the conscious self and potential. Rogers talked about self-actualization: each person has an ideal self and real self; problems arise if they don't match (which could cause stress).
- **Trait theories:** Suggest the self has traits like introversion or extroversion that are stable.

It's enough to know there are different theories. Try relating them to yourself: do you think your behavior is driven by unconscious desires, or by conscious goals?
$md$, 3),
('1bbfe4a0-d9ab-570b-8176-f8910b4293e4','activity','Reflection on Personal Growth',$md$
By understanding these theories, you gain insight into your own growth. For example:

- Remember when you were 10 vs. now, your interests and confidence changed. Erikson's theory suggests you moved from Industry vs. Inferiority (learning skills) to Identity vs. Role Confusion.
- Think about personal goals (e.g. finishing college). Your self-efficacy (belief "I can study enough to pass") matters. Building self-efficacy is part of personal growth.

Start a practice: set small goals (like finishing a book) to boost self-efficacy. Keep a learning journal: note successes and challenges each week. Over time, this builds a more detailed self-concept (you become aware of your strengths and values).

Ready to apply this? The practice set for this lesson includes reflective questions on personality theories, example problems, and self-growth exercises, unlock it to start drilling.
$md$, 4),
('1bbfe4a0-d9ab-570b-8176-f8910b4293e4','activity','Practice & Exam Drills, Lesson 2',$md$
**Review Questions:**

1. Explain Bandura's triadic model (person, behavior, environment) in your own words.
2. What is Erikson's identity vs. role confusion stage? Why is it important?
3. Define self-concept and self-efficacy. Give a personal example.
4. Name one psychoanalytic and one humanistic view of the self.

**Worked Problems:**

**Essay:** Describe a personal example (real or hypothetical) of reciprocal determinism. Show how your traits influenced an environment and vice versa.

**Solution:** [Example answer] Suppose Ana is shy by nature (person). Because of this, she rarely speaks up in class (behavior) and tends to sit alone (environment: isolation). Over time, her classmates view her as "always quiet," so they don't ask her to join study groups (environment reinforces behavior). Realizing this, Ana decides to force herself to say one idea per class (new behavior). This causes classmates to include her more in activities (environment changes). Now she feels more confident (person trait boosts). This cycle illustrates Bandura's model: Ana's personal trait influenced her actions and environment, which then fed back into her personality.

**Scenario:** Juan is preparing for a board exam but feels "not good enough." Which theory of self can help him improve his mindset? Outline a step-by-step approach (using any positive psychology concept).

**Solution:** Using learned optimism (Seligman): First, Juan identifies pessimistic thoughts (e.g. "I'll fail"). Second, he challenges them by listing past successes (primary school, college projects). Third, he sets a small goal (solve 2 review questions daily) to build confidence. Over time, he replaces "I can't" with "I can try," improving his self-efficacy. This approach applies a constructive attitude to reshape his self-concept.

**Hands-On Exercises:**

- **Self-Evaluation:** On a scale of 1–5, rate your confidence (self-efficacy) in three areas (school, relationships, skills). For any rating below 3, plan one small step to improve it (e.g. join a study group to feel more confident in class).
- **Journal Prompt:** Write a short reflection: "What have I learned about myself this week?" Include at least one new thing you discovered.

**How to Pass Tips:**

- Professors may ask: "Give an example of how X theory explains identity formation." Practice by relating theories to Filipino scenarios (e.g., family influence = Erikson's stage).
- Memorize names and key terms (Bandura, Erikson, self-actualization, etc.), but also understand them: explain in your own words.
- Common mistake: listing theories without examples. Always tie a theory to a real or hypothetical case.
- For essay-type exam questions, outline answer with theory + example + conclusion for clarity.
$md$, 5);

-- ==== Lesson 3 ====
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('cdb37a9c-0c3c-519c-b54b-71716b948674','content','Family and Upbringing',$md$
Family is often our first social context. Parenting style, family values, and early experiences form a big part of our identity. For instance, Filipino families emphasize respect for elders (paggalang) and close family ties. If you grew up encouraged to talk about your feelings by your parents, you might have an open self-expression. If your family is strict about discipline, you might develop a sense of responsibility but also pressure to meet expectations.

Consider siblings and birth order: Being the eldest, like many Filipino panganay, might make you feel responsible and protective (shapes a caring self). An only child may be self-reliant. Note how family stories (grandparents' tales, family traditions) give you a sense of history and values.
$md$, 1),
('cdb37a9c-0c3c-519c-b54b-71716b948674','content','Culture, Community, and Identity',$md$
Beyond family, culture and community guide us. In the Philippines, being Makabayan (patriotic) or participating in fiestas can strengthen identity as Filipino. Schools and communities teach norms: Filipino values like bayanihan, utang na loob, and pakikisama influence how we see ourselves. For example, if everyone around you values pakikisama (getting along), you learn to see yourself as someone who maintains peace and avoids conflict.

Also, society has expectations: Gender roles (e.g., gentleman vs. traditional Filipina), class roles (students, workers), and religion (the Philippines has strong Catholic heritage) all impact identity. For example, coming from a Filipino family with strong religious practice may make you identify as a spiritual person.
$md$, 2),
('cdb37a9c-0c3c-519c-b54b-71716b948674','activity','Friends, Peers, and Groups',$md$
Our peer groups and friends strongly influence our self-image. Think of your circle of friends: if they are studious and kind, you might view yourself as academic and caring. If they love basketball and games, you might incorporate athlete into your identity. Peer feedback also affects self-esteem (a friend complimenting you can boost confidence; criticism can hurt your self-concept).

**Social identity theory:** we often feel a sense of belonging with groups (e.g., school club, samahan). For example, being part of a tartanilla riding group (a community group) might make you proud and affect how you see yourself (like, "I am a tatangero"). These group identities become part of our self-definition.
$md$, 3),
('cdb37a9c-0c3c-519c-b54b-71716b948674','activity','Media, Technology, and Modern Influences',$md$
Media and tech form a new cultural force. What you see on TV, news, or TikTok shapes ideals. For example, Filipino TV dramas often highlight family and romantic love; they can reinforce the idea that family is central to identity. Social media: Platforms like Facebook or TikTok allow many Filipino youths to express parts of their identity (sharing madaldal vs. mahiyain selves online).

Be mindful: media can spread stereotypes (e.g., "all IT people are nerdy," or "a successful life means going abroad"). These messages might seep into your self-perception. It's healthy to reflect: "Is this really who I am, or someone told me I should be?"

Also, globalization means we're exposed to other cultures (K-pop fans, foreign movies). This can create multiple cultural identities (e.g., being a proud Filipino who also loves Korean music). Navigating between these can enrich your self, but also cause confusion if values clash. Recognizing this helps you build a more flexible and personal identity.

Ready to apply this? The practice set for this lesson includes case studies on cultural influences and self-reflective exercises, unlock it to start drilling.
$md$, 4),
('cdb37a9c-0c3c-519c-b54b-71716b948674','activity','Practice & Exam Drills, Lesson 3',$md$
**Review Questions:**

1. How do family values influence personal identity? Give a Filipino example.
2. What is social identity theory? How might it explain choosing friends?
3. Describe one way media or technology can shape the self.
4. Name two cultural factors that contribute to identity in the Philippines.

**Worked Problems:**

**Case Study:** Maria moved from a province to Manila for college. In her hometown, she was known as "the choir girl." In Manila, she joins a theater club. Explain how these social contexts might influence Maria's identity.

**Solution:** In her province, Maria's identity included being a choir singer (social role, community identity). Her self-concept there was likely musical and conservative. In Manila's theater group, she explores acting (a new role). The urban, artistic environment may make her see herself as creative and outgoing. According to social identity ideas, being in different groups (choir vs theater) allows Maria to adopt new facets of identity. She might learn different skills (singing vs acting) and meet diverse friends, changing her self-concept.

**Essay:** Discuss how kababata (childhood friends) relationships can impact someone's sense of self. Provide at least one positive and one negative influence.

**Solution:** Childhood friends (kababata) are part of early development. Positively, strong kababata ties can give a sense of belonging and loyal friendships, boosting self-esteem and an identity of being loyal and friendly. For example, when friends support you in school, you feel capable. Negatively, if kababata say hurtful things or include you in risky behavior (like skipping school), you might internalize those as part of your identity (e.g., "I'm not good enough," or "I'm a rule-breaker"). Social influence theory shows peers affect norms; if your friends value studying, you may see yourself as a good student. If they mock you for hobbies, you might give them up, altering your identity.

**Hands-On Exercises:**

- **Cultural Reflection:** Write 3 sentences about a Philippine tradition you practice (e.g., noche buena, fiestas, mano greeting). How does this tradition make you feel about who you are?
- **Group Activity:** List the names of your 3 closest friends or peers. Next to each name, write one trait you admire in them. How does spending time with them influence you to think about yourself?

**How to Pass Tips:**

- Professors may ask for examples linking culture to self. Use clear examples (e.g., "As a Filipino, I observe family-centric values").
- Remember "personal vs. social identity": emphasize group membership if relevant (e.g., being part of a samahan or community).
- Avoid generalizations without explanation. If you say "media influences self," say how.
- In answers, mention both individual and societal factors for completeness.
$md$, 5);

-- ==== Lesson 4 ====
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('1132195f-3e9a-5020-8393-7d3e4244cc3f','content','Online Identity and the Digital Self',$md$
Your digital self is how you present yourself online. It includes your social media profiles, the pictures you post, your comments, and even your "data shadow" (data you leave behind). For example, if your Facebook bio says "math lover", that becomes part of your online identity. According to scholar Kimberly Iglesia, our digital self is an extension of ourselves in cyberspace.

The online world allows you to experiment with identity. You might post only your best photos, creating a polished version of yourself. Or you might discuss passions (e.g., gaming, writing) on forums, showing sides of yourself your offline friends don't see. This is not inherently bad; it's simply another aspect of your identity. But be aware: the digital self can sometimes create pressure (comparing likes or followers).
$md$, 1),
('1132195f-3e9a-5020-8393-7d3e4244cc3f','content','Social Media and Self-Image',$md$
Social media can boost confidence or hurt it. Consider this: when someone compliments your post, it can make you feel valued. But constant comparison (seeing others succeed or look perfect) can make you doubt yourself. Filipino youth often feel the "happiness pose" pressure from Instagram or Facebook. It's important to remember that people usually share highlights, not real life.

Tips for a healthy digital self-image:

- **Curate your feed:** follow positive pages and unfollow people/pages that make you feel bad about yourself.
- **Share authentically:** it's okay to show struggles, not just successes. This helps you connect with others who can relate.

Always keep digital security in mind: your online actions (even unintentional posts) can affect your real-life reputation. Thinking of your digital self as part of your overall identity helps you manage your online presence wisely.
$md$, 2),
('1132195f-3e9a-5020-8393-7d3e4244cc3f','activity','Navigating Social Pressures Online',$md$
Social media often shows ideals: ideal body types, ideal success, ideal lifestyle. Filipino netizens see influencers or celebrities daily. You might feel pressure to fit those images. For example, if everyone at school is posting about studying in an expensive café, you might feel like you must do the same to "keep up."

Remember: you have control. If you feel pressured, step back. Reflect: "Does this match who I am and what I value?" Use these moments to strengthen your real-self narrative. For instance, instead of feeling bad about not traveling, remind yourself that you value family first.

Online communities can also expand identity positively. For example, a Filipino student interested in environmentalism might join an online group and adopt the identity of an advocate. This shows how the digital world can introduce you to new facets of self you hadn't explored.
$md$, 3),
('1132195f-3e9a-5020-8393-7d3e4244cc3f','activity','Balancing Online and Offline Self',$md$
A healthy self-care tip is to balance screen time with real-world experiences. Make time for face-to-face interactions (values pakikipagkapwa!). Remember that empathy, body language, and real achievements in daily life also define you.

Ask yourself regularly: "Am I living for likes, or for what truly matters to me?" Practice mindfulness: when you're with family or friends, put away the phone and be present. This ensures your offline self (real relationships, inner feelings) stays strong.

By understanding the digital self, you control it. Don't let online comparisons define you; use the internet as a tool to explore interests and build genuine connections that enhance your sense of self.

Ready to apply this? The practice set for this lesson offers exercises on digital identity and scenarios to test your understanding, unlock it to start drilling.
$md$, 4),
('1132195f-3e9a-5020-8393-7d3e4244cc3f','activity','Practice & Exam Drills, Lesson 4',$md$
**Review Questions:**

1. What is the "digital self"? How does it relate to your identity?
2. Give one positive and one negative influence of social media on self-image.
3. Why is it important to balance online and offline aspects of self?
4. Explain how online communities can shape identity.

**Worked Problems:**

**Scenario:** Miguel notices he feels anxious when he doesn't get enough "likes" on his online posts. He decides to limit his social media to 30 minutes a day. Explain how this action affects Miguel's self-management and identity.

**Solution:** By limiting social media, Miguel exercises self-regulation, a self-care skill. This helps him detach his self-esteem from likes. It reinforces that his identity isn't defined by social media popularity. Over time, Miguel will likely feel more in control (increased self-efficacy) and authentic, because he's aligning his behavior (less scrolling) with his values (mental wellness). This change shows healthy personal growth, Miguel's self-concept becomes based on real achievements, not online validation.

**Essay:** How can viewing only positive posts on social media create a "filtered" self-image issue? Suggest one strategy to cope with this effect.

**Solution:** Seeing only positive posts is like looking at a highlight reel; it can create upward social comparison, making one feel inferior (e.g., "Everyone is successful except me"). This filters reality and can hurt self-esteem. A coping strategy is to remember that social media often excludes struggles. One can remind themselves of their own accomplishments and talk openly about challenges with friends. Another strategy: follow accounts that share struggles (e.g., mental health advocates) to see a more balanced view, which normalizes having difficulties.

**Hands-On Exercises:**

- **Digital Diary:** For one day, jot down how much time you spend online and how you feel after certain interactions (happy, anxious, neutral). Reflect: which online activities affected your mood the most and why?
- **Online Profile Check:** Review your main social media profile. Choose one element (profile picture, bio, a recent post). Ask: Does this reflect the "real you"? If not, write a note on how you could change it to be more authentic.

**How to Pass Tips:**

- Common exam question: "Discuss the impact of social media on the modern self." Make sure to give a balanced view (both positive and negative effects).
- Use terms like "digital identity," "self-presentation," "cyber self," and cite local context if possible (e.g., mention popular apps in the Philippines like Facebook or TikTok).
- A common mistake is focusing only on complaints. Also mention how digital tools can help (e.g., joining positive communities).
- In your answers, emphasize self-management techniques (limiting screen time, critical thinking), professors expect solutions, not just problems.
$md$, 5);

-- ==== Lesson 5 ====
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('6d899f41-8f1f-5553-b8c7-226e17294a79','content','Goal Setting and Motivation',$md$
Personal growth often starts with goals. Setting clear, achievable goals gives direction to your self-development. Use the SMART approach: Specific, Measurable, Achievable, Relevant, Time-bound. For example, instead of saying, "I want to study more," say, "I will review 2 chapters of my programming book every evening this week." This clarity makes success and progress visible.

Filipino values like sipag (hard work) and tiyaga (perseverance) tie into motivation. Frame goals as helping others too (e.g., "I'll study so I can help my younger cousin with homework"), adding meaning. Achieving small goals boosts motivation (as self-efficacy increases). Each success, no matter how small, is a piece of your developing self-story. Celebrate them quietly, or share with supportive friends.
$md$, 1),
('6d899f41-8f1f-5553-b8c7-226e17294a79','content','Stress Management and Resilience',$md$
College can be stressful. Understanding stress and learning to manage it is part of caring for your self. Common stressors: exams, adjusting to new environment, personal conflicts. Filipinos often support each other in bayanihan style; don't hesitate to seek help (talk to a friend or counselor).

Techniques to build resilience:

- **Time management:** Avoid last-minute cramming. Plan a study schedule. This reduces panic and shows respect for yourself (valuing your time).
- **Relaxation:** Do mental breaks: deep breathing, a short walk in the park, or listening to favorite OPM songs. Even 5 minutes can reset your mind.
- **Positive reframing:** When a setback occurs (a failed quiz, for example), try to find a lesson ("I learned what to focus on next time"). This mindset, similar to learned optimism, turns stress into growth.

Remember: taking care of your body (sleep, good food, exercise) directly affects your mood and confidence. Even simple acts like having a healthy ulam (viand) and sleeping well before exams are ways of caring for the self.
$md$, 2),
('6d899f41-8f1f-5553-b8c7-226e17294a79','activity','Building Healthy Habits',$md$
Incorporate daily habits that reinforce a positive identity:

- **Journaling:** Write one thing you're grateful for each day. This practice improves self-awareness and contentment.
- **Reflective questions:** Every week, ask yourself: "What do I want to improve about myself?" and "What am I proud of?" Record answers. Over time, this shows your growth and areas to work on.
- **Mindfulness:** Try a simple exercise. Sit quietly for 1 minute, focus on your breath. Notice thoughts without judgment. This trains awareness of your emotional self.

These habits help you understand your current self and guide who you want to become. They are personal exercises, so even if no one else sees your journal, it matters for you.
$md$, 3),
('6d899f41-8f1f-5553-b8c7-226e17294a79','activity','Reflection and Integration',$md$
By now, you've explored many facets of yourself: personal traits, relationships, cultural identity, digital presence, and goals. A useful exercise is to integrate these into a personal mission statement or self-care plan. Ask yourself: "Given what I've learned, how do I want to grow?" For example, you might write: "I am a creative learner who values family; I will improve my math skills by setting weekly study goals, and I will practice relaxation when stressed."

Keeping a Self-Improvement Plan (short notes or bullet points) can be motivating. It reminds you that understanding the self is an ongoing journey.

Ready to apply this? The practice set for this lesson has goal-setting templates, exam questions on stress management, and a guided reflection activity, unlock it to start drilling.
$md$, 4),
('6d899f41-8f1f-5553-b8c7-226e17294a79','activity','Practice & Exam Drills, Lesson 5',$md$
**Review Questions:**

1. What does SMART stand for in goal-setting? Provide an example of a SMART goal.
2. Name two stress management techniques and explain how they work.
3. How does journaling help in personal growth?
4. Why is sleep and nutrition important for the self?

**Worked Problems:**

**Scenario:** Carlo has midterms next week. He feels overwhelmed. Outline a one-week plan using at least two time-management or stress-relief strategies.

**Solution:** Carlo first prioritizes subjects by difficulty. Then, he makes a study schedule (e.g., 2 hours of review for each subject per day, with short breaks in between). He sets SMART goals: "Complete chapter 1 problems by Monday." He practices relaxation by doing 5-minute deep-breathing sessions between study blocks. He also plans a fun break after finishing a study session. By organizing time and including breaks, Carlo reduces stress and gains confidence.

**Essay:** Reflect on a personal failure or setback. How can applying resilience (positive reframing) change its impact on your self-concept?

**Solution:** [Example answer] Suppose I failed a coding assignment. Initially, I felt like a "bad programmer." Using resilience, I reframe: "This shows areas to improve in coding. I will learn from the errors." By focusing on the lesson, I maintain belief in myself. This reframing protects self-esteem, as I see failure as temporary. Over time, learning from mistakes strengthens my identity as a capable learner, not as someone who fails.

**Hands-On Exercises:**

- **Goal Worksheet:** Write one academic and one personal goal for this month. Under each, list three steps to achieve it. Check progress weekly.
- **Stress Journal:** Keep track of stressful events for 3 days. For each event, note how you felt and one thing you did (or could do) to relax afterward (even short breaks or deep breaths).

**How to Pass Tips:**

- Professors love practical applications: expect questions like "How would you manage time during exams?" Be ready with specific strategies (lists, schedules, etc.).
- Memorize the order of Maslow's hierarchy or SMART goals, as they often appear as short-answer or essay parts.
- Study common stress-coping terms: e.g., resilience, self-efficacy, self-care. Define them clearly.
- Avoid vague answers. Instead of saying "I will relax," mention a specific method (e.g., exercise, prayer, or breathing). Concrete plans score better.
$md$, 5);

-- SOURCES:
--   Ateneo de Manila University, Syllabus for SocSci 11: Understanding the Self (course outline)
--   Polytechnic University of the Philippines, Syllabus for GEED 10023: Understanding the Self
--   Far Eastern University Manila, Course Outline for GED0110: Understanding the Self
--   Commission on Higher Education (CHED), CMO No. 25 s.2015 (BSIT/BSCS sample curriculum, includes GE2 Understanding the Self)
--   Commission on Higher Education (CHED), Revised General Education Curriculum (course description for Understanding the Self)

