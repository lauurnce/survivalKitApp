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

