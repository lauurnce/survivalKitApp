-- ============================================================
-- Technopreneurship — Modules & Sections (SCAFFOLD)
-- Subject ID: 30000000-0003-0002-0001-000000000002
-- 3rd Year, Semester 2 — minor
-- Suggested module count: 4-6
--
-- Reserved UUID namespace below is collision-free and deterministic.
-- Fill module titles/slugs + section headings/bodies from the GPT-5.5
-- deep-research output, then run this file once. Re-running is safe
-- (the DELETE clears prior rows for this subject first).
-- ============================================================

DELETE FROM modules WHERE subject_id = '30000000-0003-0002-0001-000000000002';

-- ---- Reserved module UUIDs (use in order; delete unused rows) ----
--   M01: d736d8a8-5bba-57b2-9d63-45757ebf4fd3
--   M02: 12286be1-33eb-54d3-bc4c-550b4e7e30e9
--   M03: f0d7678d-dfd4-5b3c-98d4-aa7d30bfb1d1
--   M04: 710b3247-bdcc-5d45-842b-eb54f1b4a579
--   M05: 746eca95-87ee-556e-a230-14a4f2efdf62
--   M06: 51e40729-6467-59f5-be87-33b809bf4ebc
--   M07: 1d9c3e63-44dd-53ef-901f-fe1cd9aca6fb
--   M08: d76ea986-68c3-559e-8394-6eebd84cc0db
--   M09: 56b8491b-0a20-543c-8093-a86f30fd0ade
--   M10: 9bd3b7d9-8ff0-5706-8e2f-3227a5a99b7e
--   M11: f1ff40c5-b9e7-54c1-948f-98ca8dd54ff8
--   M12: a345eca4-951a-551b-8d03-2cd2e4eac50c

-- INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
--   ('d736d8a8-5bba-57b2-9d63-45757ebf4fd3','30000000-0003-0002-0001-000000000002','Lesson 1: <TITLE>','lesson-1-<slug>',1),
--   ('12286be1-33eb-54d3-bc4c-550b4e7e30e9','30000000-0003-0002-0001-000000000002','Lesson 2: <TITLE>','lesson-2-<slug>',2),
--   ('f0d7678d-dfd4-5b3c-98d4-aa7d30bfb1d1','30000000-0003-0002-0001-000000000002','Lesson 3: <TITLE>','lesson-3-<slug>',3),
--   ('710b3247-bdcc-5d45-842b-eb54f1b4a579','30000000-0003-0002-0001-000000000002','Lesson 4: <TITLE>','lesson-4-<slug>',4),
--   ('746eca95-87ee-556e-a230-14a4f2efdf62','30000000-0003-0002-0001-000000000002','Lesson 5: <TITLE>','lesson-5-<slug>',5),
--   ('51e40729-6467-59f5-be87-33b809bf4ebc','30000000-0003-0002-0001-000000000002','Lesson 6: <TITLE>','lesson-6-<slug>',6),
--   ('1d9c3e63-44dd-53ef-901f-fe1cd9aca6fb','30000000-0003-0002-0001-000000000002','Lesson 7: <TITLE>','lesson-7-<slug>',7),
--   ('d76ea986-68c3-559e-8394-6eebd84cc0db','30000000-0003-0002-0001-000000000002','Lesson 8: <TITLE>','lesson-8-<slug>',8),
--   ('56b8491b-0a20-543c-8093-a86f30fd0ade','30000000-0003-0002-0001-000000000002','Lesson 9: <TITLE>','lesson-9-<slug>',9),
--   ('9bd3b7d9-8ff0-5706-8e2f-3227a5a99b7e','30000000-0003-0002-0001-000000000002','Lesson 10: <TITLE>','lesson-10-<slug>',10),
--   ('f1ff40c5-b9e7-54c1-948f-98ca8dd54ff8','30000000-0003-0002-0001-000000000002','Lesson 11: <TITLE>','lesson-11-<slug>',11),
--   ('a345eca4-951a-551b-8d03-2cd2e4eac50c','30000000-0003-0002-0001-000000000002','Lesson 12: <TITLE>','lesson-12-<slug>',12);

-- ---- Reserved section UUIDs, per module ----
-- Module 1 (d736d8a8-5bba-57b2-9d63-45757ebf4fd3):
--   S1: 84772ae9-c89a-585d-96dc-157524b36d8f
--   S2: 064eaa55-1ee0-5fc9-a171-81203cbffcb5
--   S3: 9d26e780-3666-5799-b56f-fefe4663cd2e
--   S4: a522983b-3f61-538f-a901-b5d68fe8ea58
--   S5: b200daf4-a278-5cb6-89c6-27c2432c404c
--   S6: bc9d3b94-d72a-5c79-9b9b-24f547c92eda
--   S7: 849729a5-1de6-5ff6-aea8-bfab9fecee6f
--   S8: 727158ba-06ab-54b9-b547-029383d56a44
--   S9: 8d710fa1-6792-5e6f-b682-aa013bddad63
--   S10: cce9662f-6177-51e9-84d5-73d661f39a75  <- reserve last for kind='activity'
-- Module 2 (12286be1-33eb-54d3-bc4c-550b4e7e30e9):
--   S1: b4c14bf5-e753-54ce-bea5-d85eee189eaa
--   S2: ab8399fb-e0b8-5e70-964d-c01aa5f195d1
--   S3: dda08c45-5b43-5806-95cf-d1a87ce3438b
--   S4: 0ac31a41-8ad7-5f35-92a1-22644463cab8
--   S5: d9d6b879-7635-5897-bdab-ccd417678674
--   S6: 4496ae0b-daa8-5d18-a2a4-0fb3195c7d65
--   S7: 234f6318-0116-5303-95b0-26af0adecdf2
--   S8: 65628e60-3f9b-5e4a-a271-7bf4a25d599b
--   S9: 0f7543ac-f187-5705-8a0d-131ec4ce0f72
--   S10: 3995db97-ef47-5d5f-8eaf-0125653de8f8  <- reserve last for kind='activity'
-- Module 3 (f0d7678d-dfd4-5b3c-98d4-aa7d30bfb1d1):
--   S1: a68b4c9a-305b-5128-8d30-13bb869e01ea
--   S2: c4cb7511-630c-5c79-a032-3b2a45d20f0b
--   S3: 145d73aa-3ec1-535d-8836-c6a9de6b65ff
--   S4: 459695c2-1340-5258-af64-6519ac87c9d2
--   S5: 155c6da1-8761-5e64-8a07-7ed279f6f7c0
--   S6: 11dd3bfa-1cee-5471-8dc5-00ffe1bb1a23
--   S7: 0245a4a8-ae8b-507e-9e6a-3284f5796b54
--   S8: b3dae223-a185-528e-b0c4-aab48736f371
--   S9: eae83e13-0e66-5f2c-aab8-4d33fe705fe7
--   S10: 800074f1-ed53-506b-8ca0-e50630becc16  <- reserve last for kind='activity'
-- Module 4 (710b3247-bdcc-5d45-842b-eb54f1b4a579):
--   S1: ff880c51-d01a-5cf8-ab27-45f388fc6aaf
--   S2: 9ee70b3a-dd46-538b-9f14-be390bd62296
--   S3: d8afc6f8-f173-5d5e-8d28-495abae4075e
--   S4: 593a06ec-198f-5710-a3ee-2d109db77a8c
--   S5: 2e8e1326-f28f-5bbc-951e-6d2932a1c4a9
--   S6: 7b8079f5-7a97-5a9c-be1b-beac52b7d90a
--   S7: 59892cdb-6d07-5afe-96b6-c4f3c365ad5d
--   S8: fa0a61d0-5844-580b-b8be-68e01333c6d3
--   S9: 4fa83d03-385d-5247-a3e3-a3d078f3bcf8
--   S10: c8146229-ae72-526e-b9f0-90682b60e23b  <- reserve last for kind='activity'
-- Module 5 (746eca95-87ee-556e-a230-14a4f2efdf62):
--   S1: 98929be1-67c4-597e-b8c9-c92e51743aa8
--   S2: 791175ee-6bfb-5fe7-8af3-d525e3ef42d1
--   S3: 48e352d7-86cf-51bc-9d8e-3de6ee31b217
--   S4: 950969f8-62cb-540f-b3a0-fa8834dd66fa
--   S5: 05dd209a-4620-52e0-8cf7-41bd5826c85a
--   S6: f1ad9d9a-be91-56dc-acf8-64370ee802df
--   S7: c184cd8b-af9d-5367-8abd-3cc266e86d0d
--   S8: 216825b7-2392-542d-a552-a17a3151f78b
--   S9: 8f29ad7c-194f-57ae-a6a7-55e6cef0df7a
--   S10: 04cc98c7-6e71-572e-acca-f17756ca5eb5  <- reserve last for kind='activity'
-- Module 6 (51e40729-6467-59f5-be87-33b809bf4ebc):
--   S1: 680e1050-68fe-57f9-94cd-866e8106245b
--   S2: 2907d681-6576-5a8f-a45e-edb1e9e572f5
--   S3: f4dfbc69-7f77-5385-995a-c637e7a36e03
--   S4: 4a8eaca2-aabc-581a-802b-cdb04e004fc4
--   S5: 01daece7-ad37-5da2-86b0-f2d48fc7b837
--   S6: 497d24a7-5333-564a-a5d9-06a61433e18e
--   S7: b20618e1-8397-5d2d-94d8-5403a06874e6
--   S8: acf62e51-3fb3-53a8-a6b5-f51eb556a262
--   S9: 1c20cd0a-e15e-5b1f-babd-2247883baa8a
--   S10: 1f04704b-932f-5251-8500-efb7d40b8cd2  <- reserve last for kind='activity'
-- Module 7 (1d9c3e63-44dd-53ef-901f-fe1cd9aca6fb):
--   S1: 12c54553-73fb-5e7e-96f6-1fde09562648
--   S2: 50c48dbf-71f5-534c-97d6-2fe9eee4f993
--   S3: 218b6ab7-a54b-5568-95e3-eeb12a0fc573
--   S4: b2319113-7b93-5f11-9ee5-b4414cd22c32
--   S5: 0a1a83cb-0202-5999-a257-871b70e7fad5
--   S6: bea8a15b-c1ff-5b72-9ba5-fca6a15e3130
--   S7: 99d2dc4f-afb7-55d5-8f8a-489272811b03
--   S8: 9107faee-c9ea-5575-8409-7abe36e7d141
--   S9: 3fb5a722-b90c-5701-83d7-4b24ce7a8cc2
--   S10: 2821752a-13b8-520f-aba2-bf3959e8dbce  <- reserve last for kind='activity'
-- Module 8 (d76ea986-68c3-559e-8394-6eebd84cc0db):
--   S1: d70e712e-d475-5fc0-ae9b-cfe6a30dbd24
--   S2: 2f39a6e2-95d3-5c1e-90f0-49e8266fe4be
--   S3: 3ee30ce5-0ff2-5591-bb83-d951eb27c1ef
--   S4: 793727db-4888-5a35-a5e1-cc63894207c5
--   S5: 4585cc5f-1aa3-5ceb-85ea-28efba2102c4
--   S6: 6f8032d2-ef83-5797-b715-d2ba9f32829f
--   S7: c14a1c45-d14c-57ff-9b01-411e4fab6048
--   S8: 1e9913ee-f52b-5d99-8e57-d1af8583bbae
--   S9: 47d0e050-2ef4-5541-93d9-a5ae74dcbe7f
--   S10: 36616420-e268-5c6c-9c6e-5fbf29c458ff  <- reserve last for kind='activity'
-- Module 9 (56b8491b-0a20-543c-8093-a86f30fd0ade):
--   S1: 8aabd156-66ff-5569-bc08-9115b483b10e
--   S2: 61c59317-c2a0-5b41-b027-7f6b7aedde1c
--   S3: b98b9061-7743-5ce4-a5bc-bdbc353c0f3e
--   S4: 344ee538-5257-56c2-9a64-2013f2859a78
--   S5: 712fd436-3349-5648-92e9-bed29bc6a4b4
--   S6: 8942ca9c-cb6f-5cc2-aa13-11f3b9231e79
--   S7: 415ecce3-a537-5ca2-8e18-d5873b304edf
--   S8: 257d7b58-5155-50c9-a536-5069119bfd08
--   S9: cf9f4550-816a-5f5a-be28-00fffb9b1c7f
--   S10: f796fe51-0579-576b-92a8-43b229da66db  <- reserve last for kind='activity'
-- Module 10 (9bd3b7d9-8ff0-5706-8e2f-3227a5a99b7e):
--   S1: a8b64440-b62f-53d9-93b1-e9d250f7c3fd
--   S2: efd47046-8e36-57d0-a20d-13d8baff2370
--   S3: 3140f754-744e-54f0-8d4b-f129aef15c61
--   S4: 6c924145-19a1-5587-b65c-6323e2a869ee
--   S5: 189b12ff-1b6a-5a6c-b233-766a3b549d09
--   S6: 6332aac5-841a-5ccd-a51e-e6b0b5d31f56
--   S7: ac8f2198-052e-53ff-a054-3fe970a272ac
--   S8: 3c9d40f8-2b1a-5a21-b975-b94c8f5ea20d
--   S9: 4a55740f-ba24-55b9-be11-5696a62e1a63
--   S10: 202fdb33-c4fd-55a6-bd91-3351983fcf68  <- reserve last for kind='activity'
-- Module 11 (f1ff40c5-b9e7-54c1-948f-98ca8dd54ff8):
--   S1: e627aa58-ae01-59a3-b1e8-516ce58864ae
--   S2: cf9347cb-783e-5f2c-ae3e-7b64a039ef4b
--   S3: 14ec1ee9-12db-5389-8f15-2c1629f5f910
--   S4: 1bc9c937-5b78-5d2a-a3c1-bbf8ff51213f
--   S5: 47319888-a92e-5c31-bd59-71d3792f5088
--   S6: d1c31403-0910-51fa-bd04-1a5ae319c45a
--   S7: 9db5c17d-ce8c-5d5b-8cdd-1f76c25d9b3e
--   S8: fd32014b-6034-5493-baf6-e0e791cbc885
--   S9: e55a3360-221f-5afc-b716-6de55506c39c
--   S10: 62be93db-67d0-530a-aca0-0d64739fd4e0  <- reserve last for kind='activity'
-- Module 12 (a345eca4-951a-551b-8d03-2cd2e4eac50c):
--   S1: 12e87921-e5f0-5ff6-a7de-affe56d17f78
--   S2: 4b188abf-de39-5da4-93dd-7fb25a511332
--   S3: 34ff214a-eecc-5e0a-b70e-bbe5e7b0066f
--   S4: 5e4fec85-722c-5e9f-b59f-5a81383fe744
--   S5: 6017ad6d-9ec9-5f8d-8ff2-7970dc19fba2
--   S6: 21dd44d7-3556-58dd-a75e-055200be6efd
--   S7: f1b98321-7e83-58fe-a082-33adeba40d4a
--   S8: d4694748-abd1-5fdc-a377-05c1dd9a6648
--   S9: 66e52680-6b62-5ae3-91ee-bf09a27e7048
--   S10: b8e2c0b9-28a9-51a5-8145-54ac9bfbddc5  <- reserve last for kind='activity'

-- ============================================================
-- IMPORT TEMPLATE — one INSERT per module. Replace placeholders.
-- content sections are FREE; the final activity section is PAID.
-- ide_language (python|sql|java|c), starter_code, topology_data are
-- all OPTIONAL columns — include only when the section needs them.
-- ============================================================
--
-- INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
-- ('d736d8a8-5bba-57b2-9d63-45757ebf4fd3','content','<Heading>',$md$
-- <full markdown teaching body — free tier>
-- $md$, 1),
-- ('d736d8a8-5bba-57b2-9d63-45757ebf4fd3','activity','Practice & Exam Drills — Lesson 1',$md$
-- <review questions, worked exam problems w/ solutions, how-to-pass tips — paid tier>
-- $md$, 2);
--
-- With an interactive playground, use the 5-column form instead:
-- INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
-- ('d736d8a8-5bba-57b2-9d63-45757ebf4fd3','activity','Coding Drill',$md$<task>$md$, 3, 'python', $code$print("hi")$code$);

-- >>>>>>>>>>>>>>>>>>>>  PASTE FILLED-IN INSERTS BELOW  <<<<<<<<<<<<<<<<<<<<

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('d736d8a8-5bba-57b2-9d63-45757ebf4fd3','30000000-0003-0002-0001-000000000002','Lesson 1: Introduction to Technopreneurship','lesson-1-introduction-to-technopreneurship',1),
  ('12286be1-33eb-54d3-bc4c-550b4e7e30e9','30000000-0003-0002-0001-000000000002','Lesson 2: Idea Generation and Opportunity Recognition','lesson-2-idea-generation-and-opportunity-recognition',2),
  ('f0d7678d-dfd4-5b3c-98d4-aa7d30bfb1d1','30000000-0003-0002-0001-000000000002','Lesson 3: Business Models and Plans','lesson-3-business-models-and-plans',3),
  ('710b3247-bdcc-5d45-842b-eb54f1b4a579','30000000-0003-0002-0001-000000000002','Lesson 4: Intellectual Property and Legal Issues','lesson-4-intellectual-property-and-legal-issues',4),
  ('746eca95-87ee-556e-a230-14a4f2efdf62','30000000-0003-0002-0001-000000000002','Lesson 5: Entrepreneurial Finance and Funding','lesson-5-entrepreneurial-finance-and-funding',5),
  ('51e40729-6467-59f5-be87-33b809bf4ebc','30000000-0003-0002-0001-000000000002','Lesson 6: Marketing and Sales for Tech Startups','lesson-6-marketing-and-sales-for-tech-startups',6),
  ('1d9c3e63-44dd-53ef-901f-fe1cd9aca6fb','30000000-0003-0002-0001-000000000002','Lesson 7: Managing the Tech Venture','lesson-7-managing-the-tech-venture',7),
  ('d76ea986-68c3-559e-8394-6eebd84cc0db','30000000-0003-0002-0001-000000000002','Lesson 8: Growth, Global Opportunities, and Exit Strategies','lesson-8-growth-global-opportunities-and-exit-strategies',8);

-- ============================================================
-- LESSON 1: Introduction to Technopreneurship
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('d736d8a8-5bba-57b2-9d63-45757ebf4fd3','content','Entrepreneurship vs Technopreneurship',$md$
Entrepreneurship means starting a business by taking risks and organizing resources for profit. Technopreneurship is similar but specifically focuses on technology-driven ventures. In technopreneurship, entrepreneurs (technopreneurs) use new technologies, digital platforms, or innovative tech processes in their businesses. In practical terms, a technopreneur might launch an app, a software startup, or an ICT (information and communications technology) service that addresses a market need, whereas a traditional entrepreneur could open a shop or service unrelated to tech. Technopreneurs often need both business savvy and technical know-how. For example, a technopreneur might create a ride-hailing app or a fintech service that uses software to solve problems.

Technopreneurship matters in the Philippines because technology startups can create jobs and add value to the economy. The Philippine government even promotes tech incubators and startup programs to help young technopreneurs succeed. Many Filipino IT graduates study technopreneurship so they can turn an idea into a business that scales beyond local markets.
$md$, 1),
('d736d8a8-5bba-57b2-9d63-45757ebf4fd3','content','The Role of Technopreneurs in the Economy',$md$
Technopreneurs can drive growth by creating high-value products and services. They help address everyday problems using technology, such as developing e-commerce sites for local shops, health apps, or financial tools. When successful, technopreneurial ventures can attract investors, expand into new markets (even overseas), and contribute to the country's GDP and exports. They also create jobs for IT developers, marketers, and support staff. For instance, local tech startups like online delivery services or learning platforms have become big businesses, showing how technology creates economic opportunities.

In this way, technopreneurship is seen as a path to national development. By combining entrepreneurship with tech innovation, technopreneurs can help modernize industries and compete globally. Yet, the core skill is still entrepreneurship: identifying needs, taking calculated risks, and organizing resources effectively, but with a tech twist.

Ready to apply this? The practice set for this lesson contains review questions and examples to test your understanding of entrepreneurship and technopreneurship — unlock it to start drilling.
$md$, 2),
('d736d8a8-5bba-57b2-9d63-45757ebf4fd3','activity','Practice & Exam Drills — Lesson 1',$md$
**Review Questions:**

1. Define entrepreneurship and technopreneurship. How are they similar and how are they different?
2. Why are technopreneurs important to a country's economy, especially in an IT-driven era?
3. Name two examples of Philippine technopreneurs or tech startups and briefly describe what they do.
4. What special skills or knowledge does a technopreneur need that a general entrepreneur might not?
5. In your own words, explain the phrase "technology-based enterprise" as used in technopreneurship.

**Worked Exam-Style Problems:**

**Problem:** Maria has an idea for a mobile app that connects car owners in Manila to affordable auto repair services. Describe how her idea fits the definition of technopreneurship and outline one advantage she gains by being tech-focused.

**Solution:** Maria's idea is technopreneurial because it uses a mobile app (technology) to solve a transportation problem (finding repair services). As a technopreneur, her competitive advantage is faster growth and scalability: the app can reach many users quickly with low incremental cost. Also, being tech-based, she could integrate features like GPS or online payments. In summary, Maria is an entrepreneur because she's starting a business, and specifically a technopreneur because she relies on IT (the app) to create value.

**Problem:** Explain why an investor might prefer to fund a technopreneur's startup rather than a non-tech small business.

**Solution:** Investors often see tech startups as having higher potential growth. A technopreneur's business (like an e-commerce platform) can scale more easily to new markets and customers, and may reach profitability faster. Technology allows for automation and innovation, which can lead to a bigger return on investment. In contrast, a non-tech small business (like a local shop) usually has limited growth potential. Thus, from a funding perspective, the chance to disrupt industries and scale rapidly makes technopreneurs attractive to investors.

**Hands-On Exercise:**

Think of a simple tech solution to a common problem (for example, an app to manage household expenses, or a website for local farmers to sell products). Briefly describe the idea and explain why it qualifies as a technopreneurial venture. What technology does it use and what market need does it meet?

**How to Pass:**

- Focus on understanding definitions and examples. Professors often ask for clear differences between key terms. Be ready to give Philippine-specific examples (e.g. mention local startups or apps).
- Memorize important pairs: entrepreneur vs. intrapreneur vs. technopreneur. Understand each role.
- Remember that exam questions may ask: "Explain why X is a technopreneur and not just an entrepreneur." Practice by comparing scenarios.
- Common mistake: mixing up entrepreneurship terms. Stick to business vocabulary for tech. Think startup context, not just "any business."
- Tip: Use concise bullet points in answers during exams. For example, list advantages of technopreneurship one by one rather than writing a block of text.
$md$, 3);

-- ============================================================
-- LESSON 2: Idea Generation and Opportunity Recognition
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('12286be1-33eb-54d3-bc4c-550b4e7e30e9','content','Brainstorming and Creativity Techniques',$md$
Good technopreneurs must generate innovative ideas. Brainstorming is a way to come up with as many ideas as possible, even ones that seem strange. For example, think of daily problems: traffic jams in Manila, heavy school books, or payment hassles. Then imagine a tech solution (GPS app, e-textbooks, e-wallet). Encourage creative thinking by combining different fields: maybe use AI (artificial intelligence) for farming advice, or mobile games for education.

In Philippine classrooms, techniques like mind mapping or "Six Thinking Hats" are taught. You can create a map with a central problem and branch into solutions. There are no wrong answers in brainstorming — sometimes a wild idea sparks a practical one. The key is to keep a notepad or phone app with these ideas. Later, filter them by feasibility (can Filipinos afford it? Does internet access suffice?).
$md$, 1),
('12286be1-33eb-54d3-bc4c-550b4e7e30e9','content','Evaluating and Selecting Ideas',$md$
Not every idea becomes a good venture. Once you have ideas, evaluate them using criteria: market need, feasibility, and personal passion. Market need: Are there enough customers who face this problem? Feasibility: Do you have or can you learn the tech skills needed? Passion: Are you excited to work on this for a long time? For example, if you love games, a gaming app might keep you motivated.

In BSIT courses, a common tool is the Lean Canvas or Business Model Canvas. This helps outline the idea's key points: who customers are, what problem it solves, how you earn money, etc. For now, simply ask: does this idea solve a real problem? Even a simple survey among friends or family (explain the idea and get feedback) can filter ideas. Philippine professors appreciate when students show understanding of local context — e.g. an idea that works in urban Manila might need adjustment for rural areas.
$md$, 2),
('12286be1-33eb-54d3-bc4c-550b4e7e30e9','activity','From Idea to Opportunity',$md$
An opportunity is an idea with a clear path to profit. For instance, an app idea is an opportunity if you know how to reach users and make money (through ads, sales, or subscriptions). An idea becomes a real business opportunity after checking technology availability (smartphones, internet), legal constraints (licensing for apps, data privacy rules in the Philippines), and competition (are similar apps already popular?). In your studies, you might be taught to write a concept note: a short description of idea, target market, and revenue model. Practice by doing one-page summaries of your ideas.

Remember, opportunities often come from trends (like fintech or online learning post-pandemic). Stay updated on tech trends in the Philippines (e.g., growing use of mobile payments, cloud services for SMEs). A good technopreneur can spot these trends early.

Ready to apply this? The practice set for this lesson includes guided exercises on evaluating business ideas and generating start-up concepts — unlock it to start drilling.
$md$, 3),
('12286be1-33eb-54d3-bc4c-550b4e7e30e9','activity','Practice & Exam Drills — Lesson 2',$md$
**Review Questions:**

1. List three creative techniques (brainstorming, etc.) used for generating business ideas. Which one do you find most effective and why?
2. What is the difference between a "good idea" and a "business opportunity"? Give an example.
3. Describe one factor to consider when evaluating a tech business idea for the Philippine market.
4. What questions would you ask to test the viability of your idea? (Name at least two and answer them for a sample idea, e.g. a food delivery app.)
5. Explain why feedback (from potential customers or mentors) is important before pursuing a tech idea.

**Worked Exam-Style Problems:**

**Problem:** Juan is interested in creating a mobile app that helps farmers in Mindanao forecast weather for planting. Identify at least two criteria Juan should use to evaluate this idea as a viable business opportunity in the Philippines.

**Solution:** (1) Market Need: Are there enough farmers who can use and pay for the app? Many farmers may lack smartphones or internet, so Juan should check smartphone penetration in the target area. (2) Feasibility/Resources: Does Juan or his team have expertise in agriculture and weather data? Can he partner with weather agencies? (3) Competition: Check if similar services exist. In summary, Juan should ensure the idea meets real needs and is doable with local resources.

**Problem:** Sketch a simple Lean Canvas for an online tutor platform idea (for Philippine high school students). List the Customer Segment, Problem, and Unique Value Proposition.

**Solution:** Example: Customer Segment: High school students in urban Philippines preparing for national exams. Problem: Lack of affordable, accessible tutors; fixed schedules. Unique Value Proposition: On-demand tutoring via a mobile app with lower fees than traditional tutors. (Students studying for exams can get instant help anywhere.) This outlines how the idea addresses a specific need for a clear group.

**Hands-On Exercise:**

Take one of your own tech-related ideas (or use the tutor app example above). Write a short paragraph explaining why it is a viable opportunity: define who the customers are, what problem it solves, and how technology makes it possible.

**How to Pass:**

- In exams, you may be asked to compare concepts (e.g., list idea vs opportunity criteria). Use tables or bullet lists in answers to make comparisons clear.
- Professors like real examples: if you mention a mobile app idea, briefly relate it to the Filipino context (some local platform or need).
- Common mistake: giving very general answers. Specificity matters. Instead of "check market", say "survey 50 potential users" or "analyze internet usage stats".
- Memorize frameworks like Lean Canvas basics or business plan sections. If asked "What goes into a business model?", recall those headings.
- Tip: Avoid vagueness. If a question is scenario-based, step through a logical evaluation (like we did in solutions above).
$md$, 4);

-- ============================================================
-- LESSON 3: Business Models and Plans
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('f0d7678d-dfd4-5b3c-98d4-aa7d30bfb1d1','content','Components of a Business Model',$md$
A business model describes how a company creates, delivers, and captures value. Key components include value proposition (what makes the product/service unique), customer segments, channels (how you reach customers), revenue streams (how you earn money), and cost structure. In technopreneurship, common models are subscription (monthly fee), commission (take a cut of transactions), or freemium (basic free service, paid premium features). For example, a tech company might charge ₱100/month for app access or earn from ads. Understanding these components is crucial: professors will often ask you to identify parts of a business model. Use local examples: a food delivery app in Manila might use a commission-based model (charging restaurants a percentage).
$md$, 1),
('f0d7678d-dfd4-5b3c-98d4-aa7d30bfb1d1','content','The Business Plan Basics',$md$
A business plan is a document outlining how the business will operate and succeed. Typical sections taught in BSIT/BSCS include: Executive Summary (high-level idea), Market Analysis (who are customers, competitors), Product/Service Description, Marketing Plan (how to promote), Operations Plan (daily operations, team structure), and Financial Plan (revenues, expenses, break-even). For technopreneurs, an IT Business Plan often highlights technical development timelines and digital marketing strategies. While content sections often touch on entrepreneurship basics, note that an IT startup plan should also cover software development stages or IT resources. In free sections we keep it high-level; advanced sections like "detailed financial statements" will be in advanced courses, but know the purpose of each part.
$md$, 2),
('f0d7678d-dfd4-5b3c-98d4-aa7d30bfb1d1','activity','Creating a Value Proposition',$md$
Your value proposition is the promise of benefits to be delivered to the customer. In Philippine terms, think: "What makes Filipino users want to choose your tech product?" It could be convenience (booking ₱5 Jeepneys via app vs queueing all day), cost savings (free e-learning material vs pricey tutors), or innovation (virtual reality for heritage tours). When planning, clearly state the value: "Our e-wallet is safe and works even with low-end phones" is a value proposition. This often goes into the business plan's introduction. Practice writing one sentence that describes how your idea solves a key problem. That line can sometimes be used as the exam answer if asked for an "elevator pitch."

Ready to apply this? The practice set for this lesson includes creating a simple Lean Canvas and a mini business plan outline — unlock it to start drilling.
$md$, 3),
('f0d7678d-dfd4-5b3c-98d4-aa7d30bfb1d1','activity','Practice & Exam Drills — Lesson 3',$md$
**Review Questions:**

1. List at least five components typically found in a business model or business plan.
2. What is a "value proposition"? Provide an example of a strong value proposition for a tech startup.
3. Explain what a "revenue stream" is, and give two examples of revenue streams an IT company might use.
4. Why is the Market Analysis section important in a business plan? What information does it usually contain?
5. In your own words, describe the difference between fixed costs and variable costs in a startup.

**Worked Exam-Style Problems:**

**Problem:** Suppose you are writing a business plan for a language-learning app in the Philippines. Identify two potential revenue streams and explain them.

**Solution:** (1) Subscription Fee: Charge ₱150 per month for unlimited lessons. This means a recurring payment from each user. (2) In-App Purchases: Offer some lessons for free but sell premium content (e.g., advanced grammar modules) as add-ons. Or (2 alternative) Freemium with Ads: Provide basic lessons free but display ads to non-paying users and sell an ad-free version. Each is a revenue model typical for apps.

**Problem:** Using the Lean Canvas approach, outline the Customer Segment, Problem, and Unique Value Proposition for an app that helps OFWs (Overseas Filipino Workers) send money home easily.

**Solution:** Customer Segment: OFWs abroad needing safe remittance services; families in the Philippines expecting remittances. Problem: High fees and time delays with traditional remittance. Unique Value Proposition: "Fast, low-fee remittance via mobile app with built-in exchange rate calculator." This clearly matches the problem (slow, expensive transfers) with the solution (convenient app).

**Hands-On Exercise:**

Draft a one-paragraph executive summary for a hypothetical tech startup of your choice. The summary should include the startup's name, what it does, and its target market. For example:

"EasyHealth.ph is a mobile platform that connects rural Filipino patients to licensed doctors for online consultations. By providing affordable telemedicine services in Tagalog and other local languages, it addresses the lack of medical access outside cities. EasyHealth's value proposition is delivering reliable, private doctor appointments via smartphone, saving travel time and money for underserved communities."

**How to Pass:**

- When asked about business models or plans, write your answers in lists or short paragraphs with headings (e.g., Value Proposition: … Revenue: …). Clarity is key.
- Remember real-life Philippine examples (e.g., GCash as mobile wallet, or AYALA's Lazada as e-commerce model) to illustrate concepts. Professors appreciate local context.
- Common mistake: mixing up terms like "profit" vs. "revenue" or "market segment" vs. "target user." Use precise terms. Revenue is money in; profit is revenue minus costs.
- Tip: Understand and remember the purpose of each section of a plan. If a question asks "Why include X section?", give a reason (e.g., "Marketing Plan shows how customers will learn about the product").
- Finally, some professors expect you to recall key frameworks (Lean Canvas, SWOT, etc.), so familiarize yourself with those terms.
$md$, 4);

-- ============================================================
-- LESSON 4: Intellectual Property and Legal Issues
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('710b3247-bdcc-5d45-842b-eb54f1b4a579','content','Protecting Your Invention (IPR Basics)',$md$
Intellectual Property Rights (IPR) protect your technology idea. Common forms are patents (for new inventions), trademarks (for brand names/logos), and copyright (for software code or original content). In the Philippines, the Intellectual Property Office (IPO) grants patents. If your tech startup develops a unique device or algorithm, consider patenting it to prevent copying. For example, if you invent a new compression algorithm, you could patent it. Remember: a patent is expensive and lengthy, so in early startup stages, focus on building the product quickly but keep it confidential. Trademarks matter too — register your brand name early. This topic may not appear heavily in BSIT exams, but knowing the basics can impress professors.
$md$, 1),
('710b3247-bdcc-5d45-842b-eb54f1b4a579','content','Business Registration and Compliance',$md$
Starting a technopreneurial venture means dealing with legalities. In the Philippines, you must register your business with DTI (sole proprietorship) or SEC (corporation) and get a Mayor's Permit. You'll also need to follow data privacy laws (like the Data Privacy Act) if you collect user data, and possibly get permits for things like software testing or online retail. Many technopreneurship courses cover the "legal framework" briefly. You should know that taxes (BIR registration) and local ordinances (e.g. sanitary permit for office, even for a startup) are part of setting up. In exams, you might be asked which agency issues a patent, or what law governs online transactions (Electronic Commerce Act of 2000 in PH). Be familiar with a few key terms, but content sections keep it basic: just know that legal compliance is essential before launching.
$md$, 2),
('710b3247-bdcc-5d45-842b-eb54f1b4a579','activity','Technology Standards and Ethics',$md$
Technopreneurs must also follow technical regulations. For instance, devices must meet telecommunications standards, and software must respect user privacy and security. Ethical issues include being honest with investors about your technology's capabilities, and building secure systems to protect users' personal data. If your venture deals with financial transactions or health data, mention in an exam that you adhere to relevant laws (like the Electronic Commerce Act or Medical Technology Act). This knowledge shows professionalism. Professors may test awareness of "regulatory environment," but often it appears in context ("Which law covers e-signatures?"). If you covered Chapter on legal issues in textbooks, review important local laws.

Ready to apply this? The practice set for this lesson includes problems about patents, business registration scenarios, and compliance case studies — unlock it to start drilling.
$md$, 3),
('710b3247-bdcc-5d45-842b-eb54f1b4a579','activity','Practice & Exam Drills — Lesson 4',$md$
**Review Questions:**

1. What is the difference between a patent and a trademark? Give an example of each.
2. Name one Philippine government agency related to technopreneurship (e.g., IPOPHL, DTI, SEC) and explain its role.
3. Explain why data privacy is important for tech startups, and name one law that protects data in the Philippines.
4. If you start a software business in the Philippines, list two permits or registrations you need.
5. Why is it important to consider ethical issues and regulatory compliance in technopreneurship?

**Worked Exam-Style Problems:**

**Problem:** Alex created a new smartphone app. He wants to protect his app's name and logo. What form of intellectual property should he use, and how?

**Solution:** He should register a trademark for the app's name and logo with the Intellectual Property Office of the Philippines (IPOPHL). This will legally protect the brand identity. He cannot patent a name or logo (patents are for inventions), but a trademark prevents others from using a confusingly similar name or logo for a similar product.

**Problem:** A group of students developed an educational website. They plan to make it a business. Identify two legal requirements they must fulfill before launching, according to Philippine law.

**Solution:** (1) Business Registration: They must register the business entity (for example, as a corporation or sole proprietorship with SEC or DTI). (2) Mayor's Permit: They need a business permit from the local city hall of where they operate. They should also register with BIR for tax purposes. (3) If collecting personal data from students, they must comply with the Data Privacy Act (ensuring secure data handling).

**Hands-On Exercise:**

Imagine your tech startup is an online store selling gadgets. Write down a checklist of at least three legal steps you need to take to start the business (e.g. register business name, secure permit, trademark logo).

**How to Pass:**

- In exams, there may be short questions like "What agency issues patents?" (Answer: IPOPHL). Use acronyms like IPOPHL (Intellectual Property Office of the Philippines) and DTI/SEC correctly.
- Memorize key terms and laws by abbreviation and purpose (e.g., "DPA 2012 – Data Privacy Act for personal data"). Flashcards help.
- Don't ignore ethical considerations; some professors may ask for examples of ethical dilemmas. Think of one (like data leaks) and how to address it (improved security).
- Common mistake: mixing up agencies. Remember: DTI handles sole-proprietorship names, SEC handles corporations.
- Tip: Keep answers concise. If asked about steps to start a business, list them sequentially (Register with SEC/DTI → Get Mayor's Permit → BIR registration, etc.)
$md$, 4);

-- ============================================================
-- LESSON 5: Entrepreneurial Finance and Funding
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('746eca95-87ee-556e-a230-14a4f2efdf62','content','Sources of Startup Financing',$md$
Technopreneurs need money to build their ideas. There are many funding options. Bootstrapping means using personal savings or revenue. Family and Friends: some startups start with money from relatives. Bank Loans: traditional, but tech startups may not qualify without collateral. Angel Investors: wealthy individuals who invest in early-stage startups in exchange for equity. Venture Capital: firms that fund startups expected to grow very fast (common in Silicon Valley, and growing in PH). Crowdfunding: raising small amounts from many people online (via platforms like Kickstarter or local equivalent GoGetFunding). And government grants or competitions (like DOST grants, or Tech4Ed by DICT).

For each option, consider trade-offs: giving up equity vs. taking on debt. For example, if a tech idea won a startup pitch contest, the grant might not require equity but may require meeting milestones. In class, you learn the names of these sources, and often professors will test your understanding of at least 3-4 major types.
$md$, 1),
('746eca95-87ee-556e-a230-14a4f2efdf62','content','Basic Financial Planning',$md$
A technopreneur should know the basics of cash flow. Important terms: Revenue (money earned) vs Profit (revenue minus costs). Fixed costs (rent, salaries) vs Variable costs (servers cost that grow with users). Students often use simplified formulas:

$$\text{Break-even point} = \frac{\text{Fixed Costs}}{\text{Price} - \text{Variable Cost per unit}}$$

For example, if an online course platform pays ₱10,000 monthly rent for servers and charges ₱100 per user with ₱20 cost per user, break-even is $10{,}000/(100-20) = 125$ users. Knowing how to do this might come in handy on exams. Also learn what ROI (Return on Investment) means:

$$\text{ROI} = \frac{\text{Gain} - \text{Cost}}{\text{Cost}}$$

If a small app cost ₱50,000 to build and it makes ₱200,000 profit after a year, $\text{ROI} = (200{,}000-50{,}000)/50{,}000 = 3$ (or 300%). For the free content, emphasize concept: money must be managed, and tech startups often have upfront development cost before earning revenue.
$md$, 2),
('746eca95-87ee-556e-a230-14a4f2efdf62','activity','Financial Statements Overview',$md$
You may have heard of Income Statement (shows profit/loss) and Balance Sheet (assets vs liabilities). While BSIT curriculum isn't accounting-heavy, a technopreneur should at least know profit and loss basics. If asked on exams, describe: "Income Statement reports revenues, costs, and profits over time." "Balance Sheet shows company worth at a snapshot." In practice, startups often prepare simple monthly profit/loss reports for investors. In class, if you see formulas like NPV (Net Present Value) or Payback Period, get a sense of what they mean but don't panic — focus on the simpler exam tasks like break-even calculations or reading a mini profit table.

Ready to apply this? The practice set for this lesson includes numerical problems on break-even and funding scenarios, plus tips on budgeting — unlock it to start drilling.
$md$, 3),
('746eca95-87ee-556e-a230-14a4f2efdf62','activity','Practice & Exam Drills — Lesson 5',$md$
**Review Questions:**

1. List and briefly describe four different funding sources a technopreneur might pursue.
2. What is "bootstrapping" in the context of startup finance? Give an example.
3. Explain the difference between fixed costs and variable costs. Why is this important for calculating break-even?
4. Define ROI (Return on Investment) and describe how it might be used to evaluate a project.
5. Name one government agency or program in the Philippines that supports tech startup funding or grants.

**Worked Exam-Style Problems:**

**Problem:** A new app development startup has fixed costs of ₱30,000 per month (office, servers) and expects to charge ₱150 per user per month, with variable costs of ₱50 per user. How many users are needed to break even?

**Solution:** Break-even users = Fixed Costs / (Price – Variable Cost) = $30{,}000 / (150 - 50) = 30{,}000 / 100 = 300$ users. So the app needs 300 paying users per month to cover all costs.

**Problem:** Calculate the ROI if a programmer invests ₱20,000 of her savings into building a mobile game app, and after one year the app has generated ₱50,000 in net profit.

**Solution:** ROI = (Gain – Cost) / Cost = $(50{,}000 - 20{,}000) / 20{,}000 = 30{,}000 / 20{,}000 = 1.5$, or 150%. This means she earned 150% of her investment as profit in a year.

**Hands-On Exercise:**

Imagine your tech idea needs ₱100,000 to develop. You have ₱20,000 personally. List two realistic ways to get the remaining ₱80,000 in the Philippine context. (Examples: small business loan from a bank, entering a startup grant contest, selling equity to an angel investor, etc.)

**How to Pass:**

- Many exams include number problems. Practice solving break-even and ROI with basic algebra. Write formulas neatly in your answer.
- Professors often weight financial questions heavily because they require calculation and understanding. Show your work step by step.
- Memorize the formula for break-even and ROI, and practice with small numbers. A common mistake is mixing up units or forgetting to subtract variable costs.
- Understand key terms like equity, loan, grant because these might appear as definitions or multiple choice.
- Tip: Use the Philippine peso symbol (₱) when doing calculations to avoid confusion in currency. And round numbers logically (e.g., users needed should be a whole number, round up).
$md$, 4);

-- ============================================================
-- LESSON 6: Marketing and Sales for Tech Startups
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('51e40729-6467-59f5-be87-33b809bf4ebc','content','Identifying Your Target Market',$md$
A key part of marketing is knowing who will buy your product. The target market could be Filipinos of certain age groups, professionals, students, or businesses. For a tech startup, use segmentation: e.g., gamers on mobile, OFWs abroad, university students in Metro Manila, etc. Understanding your market means learning where they are (social media, communities) and what they value. In classroom examples, you might study cases like how a tech company used Facebook ads to target young consumers. Always tie this to tech: a web app might target smartphone users with Android in the Philippines, for example.
$md$, 1),
('51e40729-6467-59f5-be87-33b809bf4ebc','content','Digital Marketing Channels',$md$
Technopreneurs heavily use online channels. Common channels include social media ads (Facebook, Instagram, TikTok), search engine marketing (Google Ads), content marketing (blogs, vlogs), and email marketing. The advantage of digital is that you can target specific demographics. For instance, to reach Filipino parents, you might run Facebook ads shown to users aged 30-50 in the Philippines. Also consider partnerships (like telecom companies) or tech events (DevCon, hackathons) to promote your startup. In content, mention that modern marketing often emphasizes online tools and metrics (click-through rates, conversion).
$md$, 2),
('51e40729-6467-59f5-be87-33b809bf4ebc','activity','Sales Strategies and Customer Relations',$md$
Selling a tech product could be through app stores, online subscriptions, or B2B contracts. Plan how you will acquire and retain customers. For example, a mobile game might use in-app promotions or collaborate with influencers. Explain that "customer relations" means supporting and keeping customers happy: good support builds loyalty. In the Philippines, word-of-mouth is powerful; if users like your product, they will recommend it via social media or chat apps. Technopreneurs should also be aware of pricing models (free trial, installment plans, bundle offers). Professors may ask how you would sell a product: outline a simple sales funnel (Awareness → Interest → Purchase → Referral).
$md$, 3),
('51e40729-6467-59f5-be87-33b809bf4ebc','activity','Local Context and Global Reach',$md$
A lesson from technopreneurship courses is balancing local needs and global opportunities. You might start solving a problem in the Philippines (like a jeepney-hailing app) but later think about adapting to other countries. Marketing locally could mean using Tagalog content or addressing local festivals. Going global might involve English-language marketing and knowing foreign regulations. On exam answers, mentioning that Filipino values (bayanihan/community culture) can influence marketing (e.g., community promo events) can show cultural awareness. Remember to always frame marketing as finding ways to effectively communicate and sell your tech solution to real people.

Ready to apply this? The practice set for this lesson includes example marketing scenarios and customer profile exercises — unlock it to start drilling.
$md$, 4),
('51e40729-6467-59f5-be87-33b809bf4ebc','activity','Practice & Exam Drills — Lesson 6',$md$
**Review Questions:**

1. What is a target market, and why is it important for a startup?
2. Name three digital marketing channels and one advantage of each.
3. Describe what a sales funnel is and list its basic stages.
4. Why is customer support important for tech businesses, especially in the Philippines?
5. Give one example of a culturally-aware marketing tactic for a Filipino audience.

**Worked Exam-Style Problems:**

**Problem:** You have developed an educational app for students in the Philippines. Describe two specific marketing channels or tactics you would use to reach high school students.

**Solution:** (1) Social Media Ads: Run Facebook and Instagram ads targeted at ages 13–18 in the Philippines, maybe with a promo video. (2) School Partnerships: Partner with schools or teacher groups; offer free trials to certain classes or collaborate with teachers' groups on Facebook. Additionally, engaging student influencers on TikTok to review the app could spread awareness. Each tactic reaches students where they spend time online or in schools.

**Problem:** A local start-up sells vegetable subscription boxes via a website. Outline a simple sales funnel (Awareness → Purchase) with one activity for each stage.

**Solution:** (Awareness) Run a Facebook ad showing fresh veggies (target urban families). (Interest) Click leads to website offering a sign-up discount. (Desire) Show user testimonials on the site. (Action/Purchase) The site allows easy checkout for subscription. After purchase, send an email with delivery details and a feedback link. This funnel shows how customers go from hearing about the product to buying it.

**Hands-On Exercise:**

Create a very brief marketing plan outline for a tech product of your choice. Include: (1) Target market (who, where), (2) One marketing channel (e.g., social media, events), (3) One sales strategy (e.g., free trial, discount), and (4) How you will keep the customer engaged after purchase (e.g., support or newsletter).

**How to Pass:**

- Use tables or bullets for marketing channels vs. audiences. For example, list "Instagram – Ages 18–30" etc. This format scores well.
- Be specific: instead of saying "use social media," mention the platform (Facebook, YouTube, etc.) and why (e.g., "Facebook is popular with 20–40-year-olds in PH").
- Avoid jargon: explain terms like "conversion rate" in simple words if used.
- Tie answers to Philippine examples: e.g., mention an app like GCash or Lazada promotions if relevant. Professors like to see you contextualize.
- Tip: If asked about pricing strategies, recall examples like "installment plans" (BSP allows digital wallets with split payments) or "subscription with free month" as selling points.
$md$, 5);

-- ============================================================
-- LESSON 7: Managing the Tech Venture
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('1d9c3e63-44dd-53ef-901f-fe1cd9aca6fb','content','Building the Team',$md$
A startup's success often relies on the right team. A typical tech startup team has roles: one person with tech skills (developer/engineer), one with business/marketing skills, and sometimes a designer or specialist. In your coursework, you might have learned about agile teams (small, cross-functional). Emphasize that technopreneurs should find co-founders or partners whose skills complement theirs. For example, if you're a good coder but not a marketer, partner with someone who is. In Philippines local context, mention that family members often join startups too — while helpful, be cautious about mixing family and business. In exams, you may be asked "What are important qualities of a startup team?" — answer that a mix of technical expertise, leadership, and adaptability is crucial.
$md$, 1),
('1d9c3e63-44dd-53ef-901f-fe1cd9aca6fb','content','Organizational Structure and Leadership',$md$
In small tech startups, structure is usually flat (everyone collaborates directly) rather than a big hierarchy. Leaders (like CEO or CTO) should empower team members to make decisions. Agile methodologies (Scrum, etc.) are popular: teams work in sprints to develop software iteratively. While BSIT courses might not dive deep into management methods, knowing terms like "MVP (Minimum Viable Product)" or "pivot" can impress. If a professor asks how you would manage a project, mention splitting tasks into milestones and having regular team check-ins (often used in PH tech companies). Also note the importance of ethical leadership: being honest about workload and addressing conflicts early, which is valued in Filipino work culture.
$md$, 2),
('1d9c3e63-44dd-53ef-901f-fe1cd9aca6fb','activity','Stakeholder Management',$md$
Stakeholders include anyone with an interest in the startup: founders, investors, employees, customers, suppliers, and the community. Good technopreneurs communicate with investors (provide updates), listen to customer feedback (for improvements), and treat employees well. For Philippine exams, you might get questions like: "How should a startup handle investor relations?" or "Why involve the local community?" Prepare answers like: keep transparent financial reports for investors; run community tech meetups to get ideas. Also, mention the government or regulatory agencies as stakeholders (like DOST tech councils) — in class you likely learned about stakeholders such as "Regulatory agencies" and "Community."
$md$, 3),
('1d9c3e63-44dd-53ef-901f-fe1cd9aca6fb','activity','Project Management Basics (IT Focus)',$md$
Many technopreneurship modules touch on project management. Familiarize yourself with basic IT project terms: MVP (minimum product to test market), Agile (iterative development), Waterfall (linear development). In Philippine BSIT classes, they might emphasize delivering working prototypes and using tools (even if just planning boards or Trello). Know that keeping a timeline and adapting to change is part of managing a tech venture. On an exam, an example question could be: "What is the advantage of agile development for startups?" (Answer: It allows for quick feedback and change, important when resources are limited.)

Ready to apply this? The practice set for this lesson includes team roles exercises and a case study on managing a startup project — unlock it to start drilling.
$md$, 4),
('1d9c3e63-44dd-53ef-901f-fe1cd9aca6fb','activity','Practice & Exam Drills — Lesson 7',$md$
**Review Questions:**

1. What skills are important in a technopreneurial team? List at least three roles or skill sets.
2. Define "Minimum Viable Product (MVP)" in simple terms. Why is it useful for startups?
3. Give two examples of stakeholders for a tech startup and explain how you would engage with each.
4. What is one advantage of having a flat organizational structure in a small tech company?
5. How can a startup leader maintain motivation and good morale in the team?

**Worked Exam-Style Problems:**

**Problem:** A startup founder is both CEO and lead developer. She feels overwhelmed by tasks. Suggest a strategy for how she might address this problem in terms of team management.

**Solution:** She could delegate by bringing in a co-founder or partner with business skills to handle marketing and operations. For example, hire a project manager or partner with someone who can take over marketing tasks. This lets her focus on coding. Also, creating a schedule of responsibilities or using agile sprints can clarify who does what. In short, sharing roles and clear delegation help manage workload.

**Problem:** List two possible project management approaches for building a new app and describe one pro and one con of each.

**Solution:** (1) Waterfall: Plan all phases upfront. Pro: Structured and clear timeline. Con: Hard to change later if new info arises. (2) Agile (Scrum): Work in short cycles (sprints). Pro: Adaptable to change, regular feedback. Con: Requires more frequent coordination, which can be chaotic if team is inexperienced. This shows understanding of project methods.

**Hands-On Exercise:**

Imagine you are starting a tech company. Outline a simple organizational chart or list of roles (even if informal) for your first 4 team members. Include positions like "Tech Lead," "Marketing Head," etc., and one sentence on each role's main responsibility.

**How to Pass:**

- In answers, be concise about roles. For example, instead of "someone good at computers," say "Software Developer: codes the product features." This specificity gets points.
- Professors often ask scenario questions about team conflicts or decisions. Practice explaining how you would handle an overloaded team member (ex: reassign tasks, hire assistant).
- Remember the meaning of terms like MVP, agile, stakeholder, and be able to explain them simply. Using examples (like releasing a test app version) helps illustrate points.
- Tip: Emphasize collaboration: say "we" and "team" in answers to show you understand teamwork. E.g., "We would hold a daily stand-up" sounds more professional than just "Hold a stand-up."
- If asked about motivation, mention cultural values: e.g., recognize hard work (Filipino value of "sipag" and "tyaga"), or small rewards, to keep the team enthusiastic.
$md$, 5);

-- ============================================================
-- LESSON 8: Growth, Global Opportunities, and Exit Strategies
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('d76ea986-68c3-559e-8394-6eebd84cc0db','content','Scaling the Startup',$md$
Once a technopreneurial venture has a working product and some market fit, the next step is growth. Scaling means serving more customers, adding features, or expanding to new areas. In Philippine context, scaling could start nationwide (help residents from Luzon to Mindanao) and eventually look beyond (like other ASEAN countries). Key factors in scaling include having enough capital (for marketing or hiring), robust technology infrastructure, and understanding larger markets. For example, if a delivery app works in Manila, can its model apply to Cebu or Davao? In content sections, focus on planning for growth: anticipate higher demand, adopt cloud services to handle more users, and maybe add staff. Prof exam questions might include "What challenges do companies face when scaling up?" so think in terms of risks (system crashes, more management needed).
$md$, 1),
('d76ea986-68c3-559e-8394-6eebd84cc0db','content','International Markets and Globalization',$md$
Technopreneurs should consider global opportunities. The advantage of tech is that it often crosses borders: a digital product can be sold anywhere. In classes, this may be framed by the value of considering English-speaking markets or partnerships. For instance, if you have a Filipino audience for an e-learning app, you might also market to Filipino overseas or translate to English for broader reach. Be aware of international payments (PayPal, credit cards) and global tech regulations (like GDPR for data if you reach Europe). On exams, a question might ask about "global trends" or "exporting services." Mention that Manila has many BPOs (Business Process Outsourcing) working with foreign firms, implying the Philippines is open to tech services. Keeping it simple, say globalization means adapting your product for different users and staying aware of international competition.
$md$, 2),
('d76ea986-68c3-559e-8394-6eebd84cc0db','activity','Exit Strategies and Sustainability',$md$
A successful startup eventually thinks about exit or sustainability. Exit strategy could mean selling the company (acquisition by a larger firm) or going public (IPO). Not all students will face this, but it's often in entrepreneurship curriculum. For a Philippine context, remember examples: some local startups have been acquired by bigger tech companies, or have listed on the Philippine Stock Exchange. Sustainability means building a venture that lasts. That involves good management, continuous innovation, and possibly diversifying offerings. Prof exam scenarios might ask what an entrepreneur should consider after growth (like market saturation or new threats). It's good to mention simple ideas: plan for new product lines or international offices, keep improving the technology, and always manage finances carefully.

Ready to apply this? The practice set for this lesson includes case studies on scaling and questions about going global — unlock it to start drilling.
$md$, 3),
('d76ea986-68c3-559e-8394-6eebd84cc0db','activity','Practice & Exam Drills — Lesson 8',$md$
**Review Questions:**

1. What does it mean to "scale" a startup? Give an example related to technology.
2. Name one opportunity and one challenge of taking a Filipino tech startup global.
3. What is an IPO? Why might a startup consider it as an exit strategy?
4. Explain why continuous innovation is important for the sustainability of a technopreneurship venture.
5. List two indicators that your startup might be ready to expand (scale up).

**Worked Exam-Style Problems:**

**Problem:** A local food delivery startup has seen success in Metro Manila and now wants to expand to Cebu City. Identify two specific things they need to do before launching in Cebu.

**Solution:** (1) Market Research in Cebu: Study the demand there, preferred payment methods, and local regulations. They might need to partner with local restaurants or delivery riders. (2) Operational Scaling: Ensure they have enough delivery staff or drivers, and update their app to handle increased users (e.g. more server capacity). They should also adapt marketing to Cebu locals (e.g., Cebuano language ads).

**Problem:** Choose one exit strategy (selling the company or IPO). Describe a basic requirement or condition a tech startup must meet to pursue that strategy.

**Solution:** If pursuing an IPO, the company must have a solid track record of profits or revenue growth, and meet regulatory requirements for public companies (this ensures investors trust it). If planning to sell the company (acquisition), the startup needs a valuable product or user base that a larger company would want, and clear ownership of its intellectual property (so the buyer gets all rights). Both strategies require careful preparation, like audited financial statements.

**Hands-On Exercise:**

Imagine your startup app is doing well locally. Write a brief checklist of three things you would do to ensure it can handle twice as many users next year (for instance, upgrade hosting, hire more staff, partner with new vendors, etc.).

**How to Pass:**

- For growth questions, think in terms of stages: users increase, operations expand. Use bullet lists for indicators (e.g., "200% increase in users" or "90% customer satisfaction").
- Professors may test if you can connect local situations to big-picture terms. For example, know what "IPO" stands for (Initial Public Offering) and explain it briefly.
- Common mistake: Not being specific. Instead of "go global," say "translate app to English" or "start accepting international credit cards".
- Tip: Link back to earlier topics: e.g., say "with more users (from Module 5), our costs will rise, so we need more funding." This shows integration of knowledge.
- Mention sustainability: if asked, recall practices like reinvesting profits, improving user experience, or even giving back to community (a Filipino concept) to keep the venture alive.
$md$, 4);

-- SOURCES (metadata, not inserted):
--   University of the Philippines – BS Computer Science curriculum (2018 study plan, includes Technopreneurship course)
--   University of the Philippines Mindanao – BS Computer Science program outcomes and course offerings (Introduction to Technopreneurship)
--   CHED – CMO No. 25 s.2015 (BSIT/BSCS/BSIS policies and sample Technopreneurship course syllabus)

