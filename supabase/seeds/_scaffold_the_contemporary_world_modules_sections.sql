-- ============================================================
-- The Contemporary World — Modules & Sections
-- Subject ID: 34687e6e-77e9-4b25-a4d9-8d0fd7c05582
-- 1st/2nd Year, Semester 2 — minor
-- 5 lessons. Split: S1+S2 = content (FREE); remaining teaching blocks + drill
--   = activity (PAID). Paid count follows each lesson's real section count:
--   L1 -> 2/3; L2-L5 -> 2/4.
-- No IDE playgrounds (social-science subject). Re-running is safe (DELETE clears prior rows).
-- ============================================================

DELETE FROM modules WHERE subject_id = '34687e6e-77e9-4b25-a4d9-8d0fd7c05582';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('29fdcab7-f5b8-5523-b943-f966655eec69','34687e6e-77e9-4b25-a4d9-8d0fd7c05582','Lesson 1: Defining Globalization','lesson-1-defining-globalization',1),
  ('c6ba1766-bc83-5306-879c-ff88e833e684','34687e6e-77e9-4b25-a4d9-8d0fd7c05582','Lesson 2: Global Economy and Governance','lesson-2-global-economy-and-governance',2),
  ('f72e1372-aea9-5c3f-915d-3c8b054522cd','34687e6e-77e9-4b25-a4d9-8d0fd7c05582','Lesson 3: World Regions and Inequalities','lesson-3-world-regions-and-inequalities',3),
  ('d9f734ea-286e-5602-88f2-768603d69c51','34687e6e-77e9-4b25-a4d9-8d0fd7c05582','Lesson 4: Culture, Media, and Ideas in a Global World','lesson-4-culture-media-and-ideas-in-a-global-world',4),
  ('f28eaacf-7bb3-520b-8de8-9a078649b220','34687e6e-77e9-4b25-a4d9-8d0fd7c05582','Lesson 5: Population, Mobility, and Sustainability','lesson-5-population-mobility-and-sustainability',5);

-- ============================================================
-- LESSON 1: Defining Globalization
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('29fdcab7-f5b8-5523-b943-f966655eec69','content','What Is Globalization?',$md$
**Globalization** is the process by which people, goods, ideas, and cultures become more interconnected across the world. Think of it as one big network that brings countries together. In the past century, improvements in transportation, communication, and technology have made it easier to travel and share information between distant places. As a result, local events can have global effects and vice versa. For example, a viral video or a currency crisis in one country can quickly influence people or markets in the Philippines. Understanding globalization means looking at how this "shrinking of the world" happens and why it matters.
$md$, 1),
('29fdcab7-f5b8-5523-b943-f966655eec69','content','Dimensions of Globalization',$md$
Globalization has **economic, cultural, political, and technological** dimensions. Economically, it involves trade (exporting and importing goods and services), international investment (like multinational companies operating abroad), and global markets. Culturally, globalization spreads languages, food, media, and lifestyles (for instance, Filipino dishes like adobo are known abroad, and we enjoy global films or social media). Politically, countries coordinate through international organizations (like the United Nations or ASEAN) and global agreements. Technologically, the Internet and smartphones connect people worldwide, breaking down barriers of distance. Each of these dimensions overlaps – for example, a political decision (like a trade treaty) can have economic and cultural effects.
$md$, 2),
('29fdcab7-f5b8-5523-b943-f966655eec69','activity','A Brief History of Globalization',$md$
Globalization has deep roots in history. Ancient trade routes like the **Silk Road** connected Asia, the Middle East, and Europe. During the Age of Exploration, colonization linked the Philippines, Latin America, Africa, and Asia in a world economy. In the 19th and early 20th centuries, steamships and telegraphs accelerated global ties. The modern phase began after World War II: faster air travel, container shipping, and digital communication in the late 20th century led to today's interconnected world. This means globalization isn't entirely new; what's new is its speed and scale. For example, Filipino workers now communicate daily with overseas employers in real time, something unheard of 50 years ago.
$md$, 3),
('29fdcab7-f5b8-5523-b943-f966655eec69','activity','Drivers of Globalization',$md$
Several key forces drive globalization. **Technological innovation** is a big one – the Internet, mobile phones, and cheap air travel connect people instantly across continents. **Trade policies and economic agreements** also play a role: countries reduce tariffs and sign free-trade deals to encourage international business. **Multinational companies** invest in different countries, setting up factories or offices (think of technology or clothing brands that operate worldwide). **Migration and travel** mean people (and their cultures) move globally; Overseas Filipino Workers and students abroad bring back ideas and money. Even global challenges like climate change or pandemics drive countries to cooperate across borders. Each driver makes the world more tightly linked in some way.

*Ready to apply this? The practice set below walks through exam-style problems with step-by-step solutions.*
$md$, 4),
('29fdcab7-f5b8-5523-b943-f966655eec69','activity','Practice & Exam Drills — Lesson 1',$md$
**Review Questions**

1. Define globalization in your own words.
2. Name two technological developments that have accelerated globalization.
3. List three different ways cultures can mix due to globalization (with Philippine examples).
4. Explain how trade affects globalization.
5. Describe one historical event that contributed to early globalization.
6. Why do global events (like a foreign economic crisis) impact the Philippines?
7. Give an example of a multinational corporation in the Philippines and its global significance.
8. What is the role of the Internet in connecting people globally?
9. How can reducing tariffs between countries promote globalization?
10. Explain how Overseas Filipino Workers (OFWs) illustrate globalization.

**Worked Exam-Style Problems**

*Problem:* Discuss how modern technology contributes to globalization and impacts everyday life in the Philippines.

*Solution:* Step 1: Identify key technologies (Internet, smartphones, social media, video calls). Step 2: Explain their global reach (the Internet connects to websites everywhere; social media platforms have users worldwide). Step 3: Describe Philippine impact (Filipinos use Facebook to stay in touch with family abroad; online business transactions happen instantly; e-learning and remote work became possible). Step 4: Mention an example (a Filipino online seller can reach global markets via Instagram or Lazada). Step 5: Conclude that technology makes communication and commerce borderless, making the Philippines part of a global network.

*Problem:* Explain the concept of global trade and how it affects Philippine products and consumers.

*Solution:* Step 1: Define global trade as the exchange of goods and services between countries. Step 2: Note Philippine exports (like electronics, coconut products, or garments) go abroad, bringing income to Filipino businesses. Step 3: Note imports (like fuel, raw materials, or gadgets) allow consumers access to things not made locally. Step 4: Discuss effects (positive: local industries can grow by exporting; negative: local farmers face competition from imported rice). Step 5: Use example (over-importation of rice can affect local rice farmers' income). Step 6: Emphasize that global trade connects Philippine markets with others, affecting prices and jobs.

*Problem:* Describe one historical period of globalization and its impact on the Philippines.

*Solution:* Step 1: Pick an era, e.g., Spanish colonial era (16th–19th century). Step 2: Describe trade routes (the Manila Galleon connected Manila and Acapulco, Mexico). Step 3: Explain outcomes (exchange of goods: Philippine sugar and spices were exported; Mexico's silver came in, also cultural exchange—mestizo culture, Catholicism brought from Spain). Step 4: Connect to today (legacy of Catholicism, Filipino cuisine influences like use of tomatoes). Step 5: Show pattern: global connection brought economic and cultural changes to the Philippines.

**Hands-On Exercise**

Imagine you are interviewing a relative who lived through the 1990s (before widespread Internet in the Philippines). Ask them how people communicated internationally then (e.g., letters, expensive phone calls). Compare it with how a young person today uses social media or video chat. Write a short paragraph on how this illustrates the difference technology makes in globalization.

**How to Pass Tips**

- Memorize key definitions (globalization, multinational, tariff) because professors often ask "define this term."
- Understand examples from Philippine context (OFWs, BPO industry, malls importing brands) to illustrate concepts.
- For essays, structure your answer step by step: define the idea, give reasons, and provide Philippine examples.
- Common mistakes: Don't just say "globalization is good/bad" without specifics. Professors expect clear cause–effect and examples.
- Focus on understanding processes (how X leads to Y) rather than just memorizing facts.
$md$, 5);

-- ============================================================
-- LESSON 2: Global Economy and Governance
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('c6ba1766-bc83-5306-879c-ff88e833e684','content','The Global Market Economy',$md$
The **global economy** refers to how countries' economies connect through trade, investment, and markets. Countries export goods (like electronics, agricultural products, services) and import things they need. In the Philippines, for example, we export semiconductors and import oil or raw materials. World markets set prices; when the price of oil goes up globally, Philippine gas and electricity prices rise. Global market integration means businesses operate across borders: a Filipino company may buy parts from China and sell products in the US. Understanding the global economy involves seeing that economies affect each other: economic growth or crises elsewhere can impact jobs, prices, and industries here.
$md$, 1),
('c6ba1766-bc83-5306-879c-ff88e833e684','content','International Trade and Institutions',$md$
Trade agreements and global institutions help shape the world economy. Organizations like the **World Trade Organization (WTO)** set rules to make trade fair and predictable. The Philippines is a WTO member, which means we agree to certain rules on tariffs and trade practices. There are also trade blocs: for example, the **ASEAN Free Trade Area (AFTA)** encourages free trade among Southeast Asian countries. International financial institutions like the **International Monetary Fund (IMF)** and **World Bank** provide loans and support to countries, and influence economic policies. For instance, if the Philippines gets an IMF loan, it may need to adjust its budget or banking rules. These institutions and agreements aim to stabilize and grow the global economy.
$md$, 2),
('c6ba1766-bc83-5306-879c-ff88e833e684','activity','Global Corporations and Multinationals',$md$
Globalization is driven by **multinational corporations (MNCs)**. These companies have offices or factories in multiple countries. In the Philippines, tech companies like Google or telecoms like Globe work globally; factories of electronics (e.g., semiconductors) are often owned by foreign MNCs. These corporations bring foreign investment and jobs, but also shape local economies. For example, a clothing manufacturer that exports garments abroad can boost local employment. At the same time, competition from global brands can challenge small local businesses. Understanding MNCs is key: they illustrate how a business decision in one country (like Apple launching a new product) can involve workers and markets worldwide.
$md$, 3),
('c6ba1766-bc83-5306-879c-ff88e833e684','activity','Global Governance and International Organizations',$md$
**Global governance** refers to rules and institutions that countries use to manage world affairs. The **United Nations (UN)** is the most known example: nearly every country, including the Philippines, is a member. The UN addresses issues like peace, development, and human rights. Regional organizations also play a role: **ASEAN** (Association of Southeast Asian Nations) helps the Philippines work with neighbors on issues from trade to security. Another example is **APEC** (Asia-Pacific Economic Cooperation), which includes the Philippines and aims to boost economic growth in the Pacific Rim. These bodies don't replace national governments, but they create agreements and dialogues so countries can solve problems together (like natural disasters or health pandemics) rather than acting completely alone.
$md$, 4),
('c6ba1766-bc83-5306-879c-ff88e833e684','activity','International Relations and Power',$md$
Globalization doesn't mean all countries are equal. **International relations** studies how powerful and less powerful countries interact. Superpowers (like the US and China) have a big influence on global policies and economy. The Philippines, as a smaller country, must navigate these powers in trade and politics (e.g., balancing relations between big economies). Historic ties, such as the alliance with the US or trade with China, affect our policies. Learning about global power dynamics helps understand why some countries set international rules and others follow. It also explains conflicts and cooperation: for example, why ASEAN members have joint statements or why the Philippines can be part of international peacekeeping.

*Ready to apply this? The practice set below walks through exam-style problems with step-by-step solutions.*
$md$, 5),
('c6ba1766-bc83-5306-879c-ff88e833e684','activity','Practice & Exam Drills — Lesson 2',$md$
**Review Questions**

1. What is a multinational corporation? Give an example in the Philippines.
2. How do changes in global oil prices affect the Philippine economy?
3. What role does the World Trade Organization play in global trade?
4. Name two trade agreements or groups the Philippines is part of and explain their purpose.
5. How do international loans (e.g. from IMF) potentially influence Philippine policies?
6. Give one advantage and one disadvantage of free trade for the Philippines.
7. Explain the concept of a global currency exchange rate and its effect on imports/exports.
8. What is ASEAN, and why is it important for the Philippines?
9. Describe a situation where global governance (like the UN) helped the Philippines deal with a problem.
10. Why must small countries consider the interests of powerful countries in international affairs?

**Worked Exam-Style Problems**

*Problem:* Discuss the impact of globalization on Philippine manufacturing industries.

*Solution:* Step 1: Identify how globalization affects manufacturing (access to foreign markets, competition). Step 2: Explain positive impacts (local factories can export goods to bigger markets, attracting foreign investment and modern technology). Step 3: Explain challenges (competition from imported products may hurt uncompetitive local factories). Step 4: Use example (Philippine electronics assembly lines supply devices worldwide; however, cheaper imported fabrics challenge local textiles). Step 5: Conclude with balance (globalization brings both opportunities and challenges, and policy or skills improvements help local industries adapt).

*Problem:* How does membership in ASEAN benefit the Philippines economically and politically?

*Solution:* Step 1: Define ASEAN (regional group of Southeast Asian nations). Step 2: Economically, discuss trade benefits (lower tariffs among members allow Philippine products easier access to neighbors; shared infrastructure projects). Step 3: Politically, discuss cooperation (common stance on regional security issues; support in negotiations). Step 4: Example – ASEAN trade leads to more Filipino exports of tropical products to Malaysia or Vietnam. Step 5: Mention challenges (domestic industries might face more competition). Step 6: Conclude that ASEAN membership helps the Philippines engage regionally, diversify markets, and address issues like piracy or disasters together.

*Problem:* Explain how changes in the US economy can affect the Philippine economy.

*Solution:* Step 1: Identify economic connections (the US is a major trading partner and host to millions of Filipino migrants). Step 2: If the US economy grows, demand for imports may rise (benefiting Philippine exports in services like BPO or goods). Step 3: If the US slows or goes into recession, remittances from Filipinos abroad might drop (reducing Philippine household income). Step 4: Example – If the US raises interest rates, the Philippine peso may weaken against the dollar, making imports costlier. Step 5: Summarize that because of trade, investments, and remittances, the Philippine economy is tied to major global economies like the US.

**Hands-On Exercise**

Examine a chart of Philippine trade balance (exports vs imports) over several years. Describe one trend you notice (e.g., imports growing faster than exports). Write a short paragraph analyzing what global factors (like global demand, trade policies, or currency changes) might explain that trend. How could the government or businesses respond?

**How to Pass Tips**

- Focus on understanding processes: for example, trace a product (electronics or banana) from the Philippines to the world market.
- Memorize key trade organizations and their acronyms (WTO, IMF, ASEAN, APEC) and know one function for each.
- In essay answers, discuss both sides (advantages/disadvantages) for balanced analysis.
- Use local examples (like the Bangko Sentral ng Pilipinas policies on foreign exchange) to show application.
- Don't confuse terms: global governance means international rules/organizations; domestic governance is local government issues.
$md$, 6);

