-- ============================================================
-- Human Computer Interaction — Modules & Sections
-- Subject ID: 20000000-0002-0002-0001-000000000004
-- 2nd Year, Semester 2 — major
-- 8 lessons. Each lesson has 2 content blocks + 1 Practice & Exam Drills.
--   Split: S1+S2 = content (FREE); the drill = activity (PAID) -> 2 free / 1 paid.
-- No IDE playgrounds (design subject — drills are conceptual/design exercises).
-- Re-running is safe (DELETE clears prior rows for this subject first).
-- ============================================================

DELETE FROM modules WHERE subject_id = '20000000-0002-0002-0001-000000000004';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('4e4b0aba-40fb-5aa0-947b-e879ccb5b50c','20000000-0002-0002-0001-000000000004','Lesson 1: Introduction to Human-Computer Interaction','lesson-1-introduction-to-human-computer-interaction',1),
  ('85677651-8ff2-5ab6-aaac-d357bacec61e','20000000-0002-0002-0001-000000000004','Lesson 2: Human Abilities and Cognition','lesson-2-human-abilities-and-cognition',2),
  ('f69a8ee9-ecc8-594b-a29b-4c3601f7240c','20000000-0002-0002-0001-000000000004','Lesson 3: Interaction Design Principles','lesson-3-interaction-design-principles',3),
  ('51a681a2-a833-57e5-bda9-10631c7aec61','20000000-0002-0002-0001-000000000004','Lesson 4: The User-Centered Design Process','lesson-4-the-user-centered-design-process',4),
  ('ae19b157-8db3-5a49-8ae6-5bcee96486d2','20000000-0002-0002-0001-000000000004','Lesson 5: Prototyping and Interface Layout','lesson-5-prototyping-and-interface-layout',5),
  ('7114db28-6196-5bf7-b061-46940060698b','20000000-0002-0002-0001-000000000004','Lesson 6: Usability Testing and Evaluation','lesson-6-usability-testing-and-evaluation',6),
  ('1dac1e42-0b66-541d-acec-c9bf65a35c00','20000000-0002-0002-0001-000000000004','Lesson 7: Accessibility and Inclusive Design','lesson-7-accessibility-and-inclusive-design',7),
  ('5474918a-c771-51ce-9db7-daac8c7a71d0','20000000-0002-0002-0001-000000000004','Lesson 8: Mobile and Emerging Interfaces','lesson-8-mobile-and-emerging-interfaces',8);

-- ============================================================
-- LESSON 1: Introduction to Human-Computer Interaction
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('4e4b0aba-40fb-5aa0-947b-e879ccb5b50c','content','What Is HCI?',$md$
Human–computer interaction (HCI) studies how people interact with computers and software. In an HCI course, you learn the history and scope of the field (from punch cards and GUIs to modern user experience design). Key concepts include **usability** (how easy and efficient a system is) and **user experience** (overall satisfaction). HCI is interdisciplinary: it combines computer science, cognitive psychology, graphic design, and social science. The goal is to create computer systems that people find intuitive, useful, and pleasant.
$md$, 1),
('4e4b0aba-40fb-5aa0-947b-e879ccb5b50c','content','Why HCI Matters',$md$
HCI matters because poor interface design causes errors and frustration. For example, if an e-government website is confusing, citizens will waste time or avoid using it. Studying HCI teaches you to solve these real-world problems. You will learn to apply principles such as **visibility** (making interface elements clear) and **feedback** (showing results of actions). Understanding common user mistakes (e.g. misclicks on complex menus) helps prevent them. In the Philippine context, HCI skills help design apps for local needs, like easy-to-use health or banking apps in Filipino.

*Ready to apply this? The practice set below walks through exam-style problems with step-by-step solutions and a live design exercise.*
$md$, 2),
('4e4b0aba-40fb-5aa0-947b-e879ccb5b50c','activity','Practice & Exam Drills — Lesson 1',$md$
**Review Questions**

1. What is Human–Computer Interaction (HCI) and why is it important?
2. Name two main goals of good interface design (hint: think efficiency and satisfaction).
3. List one example of how culture or language can affect interface design in the Philippines.
4. Explain the difference between usability and user experience.
5. What role do humans vs computers play in the HCI process?

**Worked Problem**

A student is designing an online student portal for a university. The menu has ten tiny buttons all on one screen, and the labels are in English while many users prefer Filipino. Identify two major HCI issues here and suggest fixes.

*Solution:* First, having ten tiny buttons is a usability problem: it violates **Fitts' Law** (small targets are harder to click). We should increase button size and group similar functions logically (e.g. Academics, Finance, Dorm). Second, using only English labels may confuse Filipino users. We can provide Filipino or Taglish labels or bilingual options to match users' language. These changes improve the interface's usability and inclusiveness.

**Hands-On Exercise**

Imagine you are tasked to improve the design of a busy Barangay services website. Sketch (on paper or digital) a simple homepage layout that uses large icons and Filipino labels. Focus on clarity and explain your design choices. (This is a practical exercise — discuss it in a study group or with peers.)

**How to Pass Tips**

- Study and remember key terms (usability, affordance, consistency, etc.). In exams, expect definition questions (e.g. "Define usability") and scenario questions ("Identify interface issues in this example").
- Professors often test on Nielsen's or Shneiderman's design principles, so know them by heart.
- Avoid the mistake of thinking HCI is just coding — focus instead on concepts like user needs and design rules.
- Be able to compare good vs bad interfaces with reasons.
$md$, 3);

-- ============================================================
-- LESSON 2: Human Abilities and Cognition
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('85677651-8ff2-5ab6-aaac-d357bacec61e','content','Human Memory and Perception',$md$
Human abilities impose limits on interface design. For example, short-term memory can only hold about **7±2 chunks** of information. An overloaded screen forces users to remember too much, causing errors. HCI teaches techniques like **"recognition rather than recall"** – for instance, using menus or icons so users don't have to memorize commands. Human perception is also limited: small fonts or low contrast are hard to read. Designers must use clear fonts, sufficient color contrast, and simple layouts. Understanding perception (color vision, attention) helps you predict how users perceive your interface.
$md$, 1),
('85677651-8ff2-5ab6-aaac-d357bacec61e','content','Attention and Load',$md$
**Cognitive load** refers to how much mental effort a user needs. High load causes frustration. Good interfaces break tasks into steps and use **progressive disclosure** (show only what's needed). For example, in an online form, grouping related fields and using checkboxes instead of asking users to list items helps reduce cognitive load. HCI also addresses physical factors: **Fitts' Law** tells us that the time to tap a target is based on its size and distance. This means smartphone buttons should be large enough and placed within easy thumb reach. Keeping mental and physical loads low is a key design principle.

*Ready to apply this? The practice set below walks through exam-style problems with step-by-step solutions and an interactive quiz.*
$md$, 2),
('85677651-8ff2-5ab6-aaac-d357bacec61e','activity','Practice & Exam Drills — Lesson 2',$md$
**Review Questions**

1. What is the typical limit of items a person can remember in short-term memory?
2. Explain "recognition rather than recall" in HCI.
3. How does Fitts' Law relate to button size and target selection?
4. Why should an interface avoid using more than a few colors or fonts?
5. Give one example of how an interface can reduce cognitive load for users.

**Worked Problem**

A teacher shows you two versions of a menu page: Version A has 12 tiny links in one column; Version B has 4 large, clearly labeled buttons in two rows (in Filipino). Which version is better and why?

*Solution:* Version B is better. It has fewer choices visible at once and larger targets, reducing cognitive load (fewer items to scan) and physical effort (larger clickable area). The Filipino labels in Version B match user preference, reducing the mental load of understanding English. Overall, Version B aligns with HCI principles (recognition, Fitts' Law) and would be easier for students to use.

**Hands-On Exercise**

Conduct a simple test with a friend or classmate: show them a cluttered and a simplified app interface, and ask which one they can navigate faster and why. Note their feedback. Try to relate their answers to memory limits or attention.

**How to Pass Tips**

- Remember key HCI "laws": Miller's Law (7±2 items), Fitts' Law, Hick's Law (time increases with choices). Professors may ask you to calculate index of difficulty or identify these principles in a question.
- Draw quick sketches: for example, draw two button layouts and compare.
- Avoid the mistake of ignoring context (Philippine users, like older relatives with weak eyesight).
- Always justify design choices by citing human capabilities (e.g. "I made text large because older users struggle with small fonts.").
$md$, 3);

-- ============================================================
-- LESSON 3: Interaction Design Principles
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('f69a8ee9-ecc8-594b-a29b-4c3601f7240c','content','Usability and Heuristics',$md$
Interaction design relies on established rules called **heuristics**. For instance, Nielsen's 10 usability heuristics or Shneiderman's 8 golden rules are widely taught. These include principles like **consistency and standards** (keep your menus and labels uniform) and **feedback** (show progress bars or confirmations when users act). Another key principle is **error prevention**: design forms with constraints or confirmations to reduce mistakes (e.g. requiring confirmation before deleting a record). These guidelines come from decades of HCI research and are tested in many countries, including the Philippines (e.g. improving government website forms).
$md$, 1),
('f69a8ee9-ecc8-594b-a29b-4c3601f7240c','content','Practical Guidelines',$md$
Apply design principles to layout and flow. For example, "place the most important information above the fold" so users see it right away. Use **grouping** and **alignment** to show relationships (buttons for navigation on left, content on right). Visual **affordances** should hint at functionality: e.g. buttons look 3D, links change color on hover. Standard UI elements (like a trash icon for delete) leverage users' existing mental models, which is easier than inventing new symbols. Familiarity matters: if all Filipino apps use a 'hamburger menu' icon, you probably should too.

*Ready to apply this? The practice set below walks through exam-style problems with step-by-step solutions and a checklist of design heuristics.*
$md$, 2),
('f69a8ee9-ecc8-594b-a29b-4c3601f7240c','activity','Practice & Exam Drills — Lesson 3',$md$
**Review Questions**

1. List any three of Nielsen's usability heuristics or Shneiderman's rules.
2. What does "visibility of system status" mean? Give an example.
3. Why is consistency important in interface design?
4. Explain "error prevention" and give a common UI example.
5. What is an affordance in HCI?

**Worked Problem**

Examine this scenario: A mobile app has two buttons, "Submit" and "Submit123", side by side, looking almost identical. Users often tap the wrong one by mistake. Identify at least two heuristic violations and propose fixes.

*Solution:* The interface violates **Consistency** (two similar buttons doing different things is confusing) and **Error Prevention** (unclear labels lead to mistakes). Fixes: Make button labels clear (e.g. "Send" vs "Draft") and far apart. Use different colors or icons to distinguish them. Possibly add a confirmation dialog for "Submit" to prevent accidental taps. These changes follow HCI guidelines (clear labels, distinct affordances).

**Hands-On Exercise**

Take a screenshot of a messy app screen (e.g. lots of text and buttons) and highlight issues like small text or unclear icons. Rewrite or draw a corrected version applying one of Nielsen's principles. Compare with classmates.

**How to Pass Tips**

- Memorize key terms: "visibility," "feedback," "affordance," "constraints." Professors often phrase questions like "Which rule says you should use familiar icons?" or "What principle applies to error messages?"
- Practice by reviewing example interfaces and identifying which heuristic each supports or breaks.
- A common exam trap is confusing "important" with "relevant"; focus on usability goals (effectiveness, efficiency, satisfaction) rather than vague terms.
- Always tie your answers to real examples ("For instance, adding a loading spinner shows system status.").
$md$, 3);

-- ============================================================
-- LESSON 4: The User-Centered Design Process
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('51a681a2-a833-57e5-bda9-10631c7aec61','content','Design Thinking and Analysis',$md$
User-centered design (UCD) means involving real users from the start. The process often follows **design thinking**: empathize (user research), define (gather requirements), ideate (brainstorm designs), prototype, and test. In UCD, we create **personas** (fictional user profiles) to represent target users. For example, a persona might be "Juan, 45, farmer with limited internet skills," guiding design choices (big buttons, Tagalog language). You'll also learn methods like interviews, surveys, and observation (contextual inquiry) to discover what users really need.
$md$, 1),
('51a681a2-a833-57e5-bda9-10631c7aec61','content','Prototyping and Iteration',$md$
After analysis, design **low-fidelity prototypes**: sketches or paper mock-ups to explore ideas cheaply. Then move to **high-fidelity prototypes** (digital mock-ups or even coded interfaces) for user feedback. Crucially, HCI emphasizes **iteration**: test early and revise. For instance, one might test a wireframe with five users, gather comments, then refine the design. In Philippine schools, students might do group projects where they interview actual local users and present iterations of their interface. Always document feedback and keep improving; this iterative mindset is a core outcome in CHED-aligned curriculum.

*Ready to apply this? The practice set below walks through exam-style problems with step-by-step solutions and a prototyping activity.*
$md$, 2),
('51a681a2-a833-57e5-bda9-10631c7aec61','activity','Practice & Exam Drills — Lesson 4',$md$
**Review Questions**

1. What are the main stages of a user-centered design process?
2. Define "persona" and explain its purpose.
3. Why is iteration important in interface design?
4. Name two techniques for gathering user requirements.
5. What is the difference between a low-fidelity and high-fidelity prototype?

**Worked Problem**

Your team is designing a ticketing kiosk interface. You have two personas: Maria (65, grandmother, needs simple choices) and Kevin (20, tech-savvy student). How would these personas affect your design? Give one concrete design decision for each persona.

*Solution:* For Maria, we would use large text and buttons, a very simple menu (e.g. one-button-per-service), and likely Tagalog translations. We might include a "Help" voice prompt. For Kevin, we could include QR code scanning and more detailed options (like seat selection), trusting him to navigate menus faster. Essentially, Maria's persona pushes for maximum simplicity and accessibility, Kevin's allows more features but still clear layout. This shows adapting design to user needs.

**Hands-On Exercise**

Practice making a persona: list demographic info (age, job, tech comfort), goals, and challenges for someone like a public school teacher using an educational app. Write a short paragraph summary. Then sketch one screen (with 3–4 UI elements) that would suit that persona's needs.

**How to Pass Tips**

- Be ready to outline design steps in order (analysis, design, evaluation). Professors might give you a mini scenario ("You want to improve a banking app; what's your first step?"). Always start with user research, not coding.
- Remember that surveys, interviews, and persona-building are common term questions.
- A typical mistake is saying "Ask user what they want" without specifics; instead mention concrete methods (e.g. "conduct focus group of representative users").
- Emphasize the iterative nature — exams like answers with phases repeated.
$md$, 3);

-- ============================================================
-- LESSON 5: Prototyping and Interface Layout
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('ae19b157-8db3-5a49-8ae6-5bcee96486d2','content','Wireframes and Mockups',$md$
Prototyping is where design becomes tangible. A **wireframe** is a simple layout (often black-and-white) showing where elements go. For example, a wireframe for an app login screen would show a logo, two text fields, and a button block. It doesn't need visuals or color. A **mockup** adds visual detail and style, closer to a final look. In class, you might learn tools like Figma or even just pencil sketches. Prototyping early catches design issues (e.g. button placement) before any code is written.
$md$, 1),
('ae19b157-8db3-5a49-8ae6-5bcee96486d2','content','Visual Design Basics',$md$
Interface layout also uses graphic design principles. Key ideas: **Contrast** (make important buttons stand out with color or size), **Alignment** (line up labels and inputs for a clean look), and **Hierarchy** (title big, subtitles smaller). Filipino designers often consider cultural color meanings (e.g. green might imply go/success). Use grids or common layouts (like a header, content area, and footer) so users feel at home. Remember readability: use sufficient font size (≥14px) and spacing. A cluttered interface is a no-no – for example, avoid cramming twenty links at the top of a page.

*Ready to apply this? The practice set below walks through exam-style problems with step-by-step solutions and a visual layout drill.*
$md$, 2),
('ae19b157-8db3-5a49-8ae6-5bcee96486d2','activity','Practice & Exam Drills — Lesson 5',$md$
**Review Questions**

1. What is a wireframe, and how is it different from a mockup?
2. Why is consistency in layout important (e.g. always placing navigation menus in the same place)?
3. Name two layout principles (e.g. alignment, spacing) and explain them.
4. How does contrast improve an interface?
5. What is a common layout for mobile apps?

**Worked Problem**

A signup form currently has labels above each field, but text is small and fields span the full screen width. Suggest two layout changes to improve it.

*Solution:* (1) Increase font size and label–field contrast to improve readability. (2) Use logical spacing: put labels next to or slightly above fields with even padding, so the form is easier to scan. Also, grouping related fields (e.g. personal info vs account info) can reduce the perceived length. These align with layout best practices (readable typography and clear grouping).

**Hands-On Exercise**

Draw two versions of the same smartphone app screen. Version A: randomly place 10 icons. Version B: use a grid with equal spacing, labels below icons, and a search bar at top. Show peers and ask which is easier to understand. Discuss why.

**How to Pass Tips**

- Professors may test you on specific layout terms (e.g. "What does 'visual hierarchy' mean?"). Remember common patterns (cards, lists, forms).
- Exams often expect you to spot problems: "Identify layout issues with this interface."
- Always think mobile-first: many Filipino users access via phones, so practice designing for small screens. Note alignment (e.g. center vs left alignment) matters.
- A common error is using too many fonts or colors – stick to one font family and 2–3 colors for readability.
$md$, 3);

-- ============================================================
-- LESSON 6: Usability Testing and Evaluation
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('7114db28-6196-5bf7-b061-46940060698b','content','Evaluation Methods',$md$
HCI evaluation ensures the design works for users. Two main approaches are **formative** (ongoing testing during design) and **summative** (final testing after design). Popular methods include **heuristic evaluation** (experts check the interface against established heuristics) and **user testing** (watching real people use the interface). You might learn to plan a usability test: define tasks, recruit 5–10 representative users, observe them performing tasks, and record issues. Philippine coursework often has students do guerrilla testing with classmates or deploy surveys for feedback.
$md$, 1),
('7114db28-6196-5bf7-b061-46940060698b','content','Metrics and Feedback',$md$
During tests, we measure metrics like **time on task**, **error rate**, and **satisfaction scores**. For example, the **System Usability Scale (SUS)** is a quick survey giving a score from 0–100. If your app scores below ~68, it's generally considered below average. You should also gather qualitative feedback: ask users how they felt about the interface. A common tip is the **"think aloud"** protocol, where users say their thoughts while using the system. After testing, analyze results: find patterns (e.g. all users stumbled on one button), then fix those issues. This cycle of "test, learn, iterate" is at the heart of the HCI curriculum.

*Ready to apply this? The practice set below walks through exam-style problems with step-by-step solutions and a usability evaluation plan.*
$md$, 2),
('7114db28-6196-5bf7-b061-46940060698b','activity','Practice & Exam Drills — Lesson 6',$md$
**Review Questions**

1. What is the difference between formative and summative evaluation?
2. Describe how a usability test is conducted in simple steps.
3. What is the purpose of a heuristic evaluation?
4. Name one metric used in usability testing and explain it.
5. Why might we use "think aloud" during user testing?

**Worked Problem**

You have designed a new menu interface for a popular Filipino delivery app. You conduct a usability test with 5 users doing the task "Place an order for fried chicken." All users complain that finding the "Checkout" button is confusing. Based on this feedback, what change would you make to the design?

*Solution:* Since all users had trouble with the "Checkout" button, it likely isn't visible enough. We should make it more prominent: maybe a larger button, with high-contrast color, placed in a consistent location (e.g. bottom right). We might also label it clearly (e.g. "Confirm Order"). Then re-test to ensure users can find it. This is applying the test feedback to fix usability.

**Hands-On Exercise**

Pick a website (e.g. a local government site) and do a quick "heuristic review." Check it against two heuristics, like visibility of status (does it show loading?) and match between system and real world (language). Jot down any violations you find.

**How to Pass Tips**

- Remember key terms (formative/summative, SUS). Exams love asking about steps in a usability test ("how many users is ideal?" or "why measure time on task?").
- One trick: 5 users usually find ~75% of problems (Nielsen's rule of thumb) — common exam knowledge.
- Mistake to avoid: saying testing is optional — in HCI, it's mandatory. Emphasize the iterative nature (test–fix–test again).
- Always connect findings to design improvements in your answers ("We will improve X because users had issues with Y.").
$md$, 3);

-- ============================================================
-- LESSON 7: Accessibility and Inclusive Design
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('1dac1e42-0b66-541d-acec-c9bf65a35c00','content','Principles of Accessibility',$md$
Accessibility ensures people with disabilities can use software. Key concerns: visual, auditory, motor, and cognitive impairments. For example, color-blind users need sufficient color contrast and should not rely on color alone to convey meaning. Screen-reader users need proper labels (alt text for images). Filipino designers must also consider users with limited literacy: using clear icons and voice prompts can help. **Universal Design** extends accessibility to all users, e.g. using larger clickable areas (good for users with tremors or big fingers). The HCI curriculum covers standards like **WCAG** (Web Content Accessibility Guidelines).
$md$, 1),
('1dac1e42-0b66-541d-acec-c9bf65a35c00','content','Designing for Special Users',$md$
Think about older adults: they may prefer simpler layouts, larger fonts, and clear language. For instance, when designing a health-monitoring app for elderly Filipinos, you'd use high-contrast, large text, and avoid jargon. For users with hearing impairment, ensure any multimedia has captions. For Philippine public systems (like an online gov't form), typical accommodations include skip links (for keyboard navigation) and forms that allow keyboard input. HCI courses often include case studies or tools like colorblind simulators to raise awareness. The goal is to make interfaces usable by everyone.

*Ready to apply this? The practice set below walks through exam-style problems with step-by-step solutions and an accessibility audit exercise.*
$md$, 2),
('1dac1e42-0b66-541d-acec-c9bf65a35c00','activity','Practice & Exam Drills — Lesson 7',$md$
**Review Questions**

1. What does "universal design" mean in HCI?
2. Give one example of a change to help color-blind users.
3. Why are alt texts important?
4. How might you adapt an interface for senior citizens?
5. What is WCAG?

**Worked Problem**

A developer builds a photo-sharing app. The "Upload" button is green with a white plus icon, and there is no text. Users with red–green colorblindness can't tell if the button is active or disabled (grayed out looks similar). What are two ways to improve this?

*Solution:* First, add text "Upload" next to or inside the button to not rely on color alone. Second, use shape or outline differences for the disabled state (e.g. thick border or "X" on disabled). Also ensure green and gray have high contrast (check contrast ratio). These changes help color-blind users see the difference and use the app.

**Hands-On Exercise**

Check a local government website or an app on your phone for accessibility. For example, try navigating by keyboard only: can you reach all buttons? Or use a screen reader (or TalkBack) and see if it reads all controls logically. Take note of any major issues.

**How to Pass Tips**

- Key exam points include WCAG levels (A, AA) and specific guidelines (alt text, keyboard access). Often a question will ask for design fixes: e.g. "How to improve this interface for visually impaired users?" Always mention concrete fixes (increase font, use larger contrast buttons).
- Don't confuse general "design for good UX" with accessibility specifics — they want disability-focused fixes.
- Familiarize yourself with Philippine laws too: some projects may mention the Magna Carta for Persons with Disability (Republic Act 7277) requiring accessibility.
- In exams, listing recognized guidelines or acts (WCAG, Republic Act 7277) can score points.
$md$, 3);

-- ============================================================
-- LESSON 8: Mobile and Emerging Interfaces
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('5474918a-c771-51ce-9db7-daac8c7a71d0','content','Designing for Mobile',$md$
Mobile interfaces have smaller screens and touch input. This means **minimalism** is key: one big headline or primary action per screen, big touch targets (minimum 48×48 points per Material Design guidelines). The **"thumb zone"** is a concept: common buttons should be where thumbs can easily reach (bottom area). Philippine apps must also consider connectivity (ensure the UI indicates loading) and local language settings. **Responsive design** is important: the layout should adapt if someone switches from portrait to landscape. In HCI theory, we learn to prioritize content (e.g. show text and main button first) and use **progressive disclosure** (collapse advanced options under menus).
$md$, 1),
('5474918a-c771-51ce-9db7-daac8c7a71d0','content','Emerging Interfaces (VR, Voice, AR)',$md$
Beyond mobile, HCI also explores new modalities. **Voice interfaces** (like Siri or Alexa) rely on spoken commands: principles include simple grammar and clear prompts (for example, speaking Taglish commands in the Philippine context). **AR** (augmented reality) overlays digital info on the real world (think Pokémon Go). When teaching AR, courses focus on aligning virtual elements accurately (so objects appear fixed in space). **VR** (virtual reality) creates immersion; designers must prevent motion sickness by optimizing frame rate. Collaborative or social tech (like online group chats or games) is also covered: HCI looks at how people interact remotely, such as supporting group decisions (groupware). These topics are often at the end of the syllabus as "special issues."

*Ready to apply this? The practice set below walks through exam-style problems with step-by-step solutions and a design sketch exercise for mobile layouts.*
$md$, 2),
('5474918a-c771-51ce-9db7-daac8c7a71d0','activity','Practice & Exam Drills — Lesson 8',$md$
**Review Questions**

1. Why must mobile buttons be large enough for touch?
2. What is responsive design?
3. Give one example of a voice interface design guideline.
4. What usability issue is unique to AR/VR interfaces?
5. How do you test if a mobile design adapts to different screen sizes?

**Worked Problem**

You have a form that works well on desktop, but on a smartphone it feels cramped. How would you adapt the form design for mobile users?

*Solution:* Stack fields vertically in a single column to fit the narrow width. Increase spacing and font size for readability. Use input types that bring up the appropriate keyboard (e.g. email type for email fields). Possibly break the form into multiple steps or screens so each screen has only a few fields. These changes use responsive design and mobile UI best practices.

**Hands-On Exercise**

Take a desktop website and view it on your phone (or shrink your browser). Identify one major usability problem (e.g. text too small, elements overlapping). Sketch how you would lay out the top part of that page for mobile (maybe the navigation and heading).

**How to Pass Tips**

- Know differences: e.g. desktop can use hover effects, mobile cannot. Exams may ask: "Name two mobile design constraints."
- A common error is thinking desktop knowledge works the same on mobile — always mention touch, orientation, limited screen.
- Remember hot topics: voice UX (e.g. clarity in voice prompts) and VR usability (like avoiding fast camera movement).
- Use Philippine examples (e.g. mobile-first for rural users with cheap phones). Professors appreciate it if you mention technical terms (e.g. media queries in responsive design) when relevant.
$md$, 3);

-- ============================================================
-- SOURCES
-- Polytechnic University of the Philippines — Course syllabus for Human-Computer Interaction
-- Far Eastern University – Institute of Technology, BSIT program outcomes (includes HCI knowledge)
-- CHED CMO No. 25 s.2015 — BSIT program standards (mentions HCI topics such as usability)
-- ============================================================
