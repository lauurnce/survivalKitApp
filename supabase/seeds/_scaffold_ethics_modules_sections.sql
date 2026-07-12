-- ============================================================
-- Ethics, Modules & Sections
-- Subject ID: 476dbfed-5212-4296-9036-895bbbe546d4
-- 2nd Year, Semester 2, minor
-- 5 lessons. Each has 3 content blocks + 1 Practice & Exam Drills.
--   Split: S1+S2 = content (FREE); the 3rd teaching block + drill = activity
--   (PAID) -> 2 free / 2 paid every lesson.
-- No IDE playgrounds (philosophy subject). Re-running is safe (DELETE clears prior rows).
-- ============================================================

DELETE FROM modules WHERE subject_id = '476dbfed-5212-4296-9036-895bbbe546d4';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('cf8fe871-8018-5e68-a12b-0f9cc7821b84','476dbfed-5212-4296-9036-895bbbe546d4','Lesson 1: Introduction to Ethics and Moral Concepts','lesson-1-introduction-to-ethics-and-moral-concepts',1),
  ('f0aff824-e320-5405-9bbe-6e17eddd662d','476dbfed-5212-4296-9036-895bbbe546d4','Lesson 2: Moral Agency and Decision-Making','lesson-2-moral-agency-and-decision-making',2),
  ('5e27e216-70e2-5d8a-beb8-e36d540ddd43','476dbfed-5212-4296-9036-895bbbe546d4','Lesson 3: Culture, Society, and Filipino Values','lesson-3-culture-society-and-filipino-values',3),
  ('264ba160-fc4f-5392-ac1f-4c75057ce66b','476dbfed-5212-4296-9036-895bbbe546d4','Lesson 4: Ethical Theories and Frameworks','lesson-4-ethical-theories-and-frameworks',4),
  ('4fb4afbb-c0de-583a-8020-d17130f234d2','476dbfed-5212-4296-9036-895bbbe546d4','Lesson 5: Contemporary Issues and Social Ethics','lesson-5-contemporary-issues-and-social-ethics',5);

-- ============================================================
-- LESSON 1: Introduction to Ethics and Moral Concepts
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('cf8fe871-8018-5e68-a12b-0f9cc7821b84','content','What Is Ethics?',$md$
**Ethics** is the study of right and wrong behavior. In simple terms, it asks, "How should we act?" and "What kind of person should we be?" Ethics (also called moral philosophy) goes beyond following rules – it examines the principles behind why actions are considered good or bad. You'll learn to distinguish ethical values (honesty, fairness) from mere personal preferences. For example, you may prefer certain foods (taste vs. health) – that's not moral. But helping others in need is a choice reflecting morality.
$md$, 1),
('cf8fe871-8018-5e68-a12b-0f9cc7821b84','content','Ethics, Morality, and Rules',$md$
A **moral standard** is a rule about right and wrong, usually learned from family, community, or religion. For example, "Stealing is wrong." Non-moral rules include etiquette or laws that are not ethical in nature. Key distinctions:

- **Morals vs. Ethics:** Morals are personal beliefs about right and wrong. Ethics is the systematic study of those morals.
- **Laws vs. Ethics:** Laws are enforced by government. Something can be legal but unethical, and vice versa.
- **Values:** Beliefs (like loyalty) that guide choices.

Understanding these helps you explain *why* a rule exists, not just follow it. For instance, laws against plagiarism promote honesty in academics.
$md$, 2),
('cf8fe871-8018-5e68-a12b-0f9cc7821b84','activity','Moral Dilemmas and Social Rules',$md$
A **moral dilemma** is a tough situation where you have to choose between two conflicting values. For example, a student might face the choice: help a sick classmate by copying homework, or be honest and complete it alone. In dilemmas, there may be no completely "right" answer. Ethics teaches us to think carefully in these situations. Scholars classify moral dilemmas into levels: **personal** (decisions you resolve yourself), **organizational** (e.g. business or school issues), and **societal** (government policies, public welfare). Laws and social rules exist to protect everyone's rights. Without any rules or ethics, powerful people or groups might harm others. In fact, one purpose of ethics is to protect the **common good** by guiding behavior toward fairness and justice.

*Ready to apply these ideas? The practice set below contains examples, step-by-step solutions, and deeper exercises.*
$md$, 3),
('cf8fe871-8018-5e68-a12b-0f9cc7821b84','activity','Practice & Exam Drills, Lesson 1',$md$
**Review Questions**

1. Define ethics and explain how it differs from personal taste or preference.
2. Give an example of a moral standard and a non-moral rule. How are they different?
3. What is a moral dilemma? Name the three "levels" of moral dilemmas (personal, organizational, societal).
4. Why do societies have rules and laws? How do they relate to ethical behavior?
5. Explain why freedom is important in moral decision-making.

**Worked Exam-Style Problems**

*Problem:* Ana finds a lost wallet with ₱5,000 inside. She needs money for a family emergency. Should she keep the money or turn in the wallet to the authorities? Identify the moral dilemma, list the values involved, and propose an ethical solution.

*Solution:* This is a **personal moral dilemma**: honesty vs. need. Values: honesty (not stealing) and compassion (helping family). Ethical reasoning: Ana should first attempt to find the owner, since keeping found money violates honesty. If she truly cannot find the owner, she should report it to lost-and-found (acting responsibly). Justification: this preserves trust and common good, while still addressing her emergency by legal means (perhaps the owner rewards her honestly).

*Problem:* A student sees two classmates copying answers during an exam. Reporting them might get them expelled, but staying silent is dishonest. What should the student do? Outline steps in moral reasoning.

*Solution:* Identify stakeholders (classmates, school community). Ethical options: do nothing (silence) or tell the teacher. Weigh values: fairness (cheating harms others) vs. loyalty (not betraying friends). Reason: This is a conflict between honesty (cheating is wrong) and loyalty. Using moral reasoning, the student might decide reporting preserves fairness (everyone works honestly). They should consider consequences (other students lose trust, school rules are upheld). Conclusion: Informing the teacher is the ethical choice, perhaps suggesting an anonymous tip if worried, which balances honesty and compassion.

**Application Exercise**

- Reflect on a real or imagined situation (e.g. in a tricycle ride, family, classroom) where you faced a moral choice. Describe the dilemma and explain how you resolved it using ethical principles or which values you prioritized (fairness, duty, etc.).
- Role-play with a classmate: one is an ethical adviser, the other describes an ethical dilemma at work (e.g. witnessing a coworker breaking rules). The adviser guides them using questions (Who is affected? What are the values?).

**How to Pass this Topic**

- Remember key definitions (morality, ethics, dilemma) and examples from daily life. Use Filipino settings (school, family, trabaho) to ground answers.
- In essays, clearly identify the ethical issue and stakeholders involved. Show understanding of general principles (honesty, respect) rather than just stating "do the right thing."
- Common mistakes: confusing rules of etiquette with moral rules; overlooking an action's impact on others. Always ask "How would I justify this action to someone impartial?"
- Professors often expect examples. Mention everyday Philippine scenarios (traffic rules, barangay community issues). Simple frameworks (like "Is it fair?" or "Could I defend this publicly?") help in exams.
$md$, 4);

-- ============================================================
-- LESSON 2: Moral Agency and Decision-Making
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('f0aff824-e320-5405-9bbe-6e17eddd662d','content','Freedom, Responsibility, and Moral Choice',$md$
Ethical behavior depends on **free choice**. Only humans have the awareness and freedom to choose their actions. This freedom brings responsibility: each choice has consequences for oneself and others. For example, choosing to cheat on an exam (exercise of freedom) means you might get a higher grade but harm the honest students and yourself (by not really learning). Moral education teaches us to balance freedom with responsibility. We learn that our freedom is best used when guided by reason and respect for others. In other words, we can't blame society if someone refuses to think or care about the consequences of their actions.
$md$, 1),
('f0aff824-e320-5405-9bbe-6e17eddd662d','content','Seven-Step Moral Reasoning Model',$md$
A helpful way to make ethical decisions is to follow a structured process. One common model has seven steps:

1. **State the problem:** Recognize the moral issue clearly (e.g. "Is it right to take this action?").
2. **Check the facts:** Gather all relevant information (who, what, why, legal rules, personal values involved).
3. **Identify the stakeholders:** Who will be affected? (family, community, you).
4. **Develop options:** List possible actions you could take (even tough or creative ones).
5. **Test the options:** Use simple tests – for example, the **harm test** (which option causes least harm), **publicity test** (would you be okay if everyone knew this choice?), **fairness test** (does it treat everyone justly?).
6. **Make a choice:** After weighing options and tests, pick the action that best fits your principles.
7. **Review:** After acting, reflect on the decision. Could anything be learned or changed for future dilemmas?

This process ensures you use reason (not just gut feeling) and think about others before deciding. Practicing these steps on smaller issues builds good decision-making habits.
$md$, 2),
('f0aff824-e320-5405-9bbe-6e17eddd662d','activity','Developing Virtue and Character',$md$
Ethics is not only about decisions in one moment; it's also about what kind of person you become. **Virtue ethics** teaches that good character traits (virtues) like honesty, kindness, and courage are learned by practicing them repeatedly. For example, telling the truth even when it's hard makes honesty a habit. Over time, a person who habitually acts kindly and responsibly develops a moral character. Psychologists also talk about **stages of moral development** (basic rewards/punishments → community values → principled conscience). Philippine culture and education (family teaching, community service) aim to help students move toward "conscience-based" decisions – doing what feels right deep inside, not just what's easy.

*Ready to apply these ideas? The practice set below contains examples, step-by-step solutions, and deeper exercises.*
$md$, 3),
('f0aff824-e320-5405-9bbe-6e17eddd662d','activity','Practice & Exam Drills, Lesson 2',$md$
**Review Questions**

1. Why is freedom important in ethics, and what responsibility comes with it?
2. List the seven steps of moral reasoning in order (briefly describe each).
3. What is the purpose of reflecting on an ethical decision after making it?
4. Explain how practicing a virtue (e.g. honesty) can build a person's character.
5. Give an example of an ethical decision you or someone you know made and what values were involved.

**Worked Exam-Style Problems**

*Problem:* Marco is caught cheating by his friend Liza during a game contest. Liza feels it's wrong but also doesn't want to get Marco in trouble. Use the seven-step model to reason what Liza should do.

*Solution:* (1) Problem: Friend vs. honesty. (2) Facts: Marco cheated. (3) Stakeholders: Marco, Liza, contest organizers, other players. (4) Options: Confront Marco privately, tell the organizer, say nothing. (5) Tests: Publicity test – would Liza defend not telling anyone? Fairness – keeping silent is unfair to others. (6) Choice: Liza should report or remind Marco of the rules (most fair). (7) Review: Liza learns that honesty protects everyone's trust, including her own integrity.

*Problem:* A new student group pressures Maria to join their "school pranks." Maria is unsure if it's okay. Discuss how Maria could use reason and feelings in her decision.

*Solution:* Feelings might push Maria to fit in (peer pressure). But reason requires thinking: Are these pranks harmless or hurtful? Maria can list the facts (what pranks, consequences) and consider rules (school policy). She may realize a prank could get people hurt or suspended (harm test). Even if it feels fun (instinct), reason suggests choosing a prank that doesn't hurt anyone – or refusing altogether. Thus she balances her feeling ("I want to belong") with reason and empathy (considering others). It is brave (moral courage) to say no if it violates values.

**Application Exercise**

- Write a short reflection on how you have handled a peer pressure situation (e.g. on social media or in a group). Which moral virtues (e.g. honesty, courage) did you need? Would you do anything differently now?
- Group activity: Role-play a scenario in pairs. One plays a student leader suggesting an unethical action (like skipping class together without permission), and the other practices saying no using logical reasons or virtue arguments.

**How to Pass this Topic**

- Memorize key terms: moral agent, moral reasoning model, virtue. Professors like seeing the 7-step names.
- Use clear examples: say exactly what you or a hypothetical person would do and why. Tie your answer to concepts like fairness, duty, or consequences.
- Common pitfalls: jumping to "just do the right thing" without explanation. Always articulate the steps of reasoning or which virtue you're following.
- Tip: When in doubt, ask if the action respects everyone's rights and whether you'd be comfortable if others knew about it. This aligns with impartiality and fairness.
$md$, 4);

-- ============================================================
-- LESSON 3: Culture, Society, and Filipino Values
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('5e27e216-70e2-5d8a-beb8-e36d540ddd43','content','Culture and Moral Behavior',$md$
Our culture shapes what we see as "normal" and can influence values. **Cultural relativism** says each society's morals are valid for its people, but ethics teaches some principles may be universal (like human dignity). For example, showing respect to elders is very important in Filipino culture, but respect is a value shared worldwide. Culture provides context: in the Philippines, concepts like **kapwa** (shared identity) stress community well-being. However, culture is not an excuse for injustice – unjust practices in any culture (like *utang na loob* being used to force favors) can be questioned by ethics. In other words, one should understand cultural influences but also think critically about them.
$md$, 1),
('5e27e216-70e2-5d8a-beb8-e36d540ddd43','content','Filipino Cultural Values in Ethics',$md$
Many Filipino values relate to ethics. For instance, **pakikisama** (harmonious community relations) encourages considering others' needs, which aligns with empathy and cooperation. **Bayanihan** (helping neighbors) teaches generosity. **Pagmamano** and **paggalang** (respect) show how personal behavior affects others' dignity. On the other hand, **hiya** (shame) can deter wrongdoing but may also silence people from reporting issues. Philippine society is also deeply influenced by Christianity: teachings like "love thy neighbor" and the sanctity of life inform moral choices. In short, when making decisions, Filipino students often balance modern ethical principles (fairness, rights) with traditional values like family loyalty and religious beliefs.
$md$, 2),
('5e27e216-70e2-5d8a-beb8-e36d540ddd43','activity','Developing Community and Individual Morality',$md$
Ethics education in society aims to build both social and individual virtue. Classrooms, families, and communities teach moral values through examples and practice. Psychologist **Lawrence Kohlberg** describes how people grow from obeying rules to understanding justice as they mature. In the Philippines, schools use collaborative activities (like group projects) to teach teamwork and fairness. Civic values, like bayanihan, encourage students to think beyond themselves. For example, a student council organizing a tree-planting teaches care for the environment and community. These experiences help students internalize moral principles so they act correctly even without supervision.

*Ready to apply these ideas? The practice set below contains examples, step-by-step solutions, and deeper exercises.*
$md$, 3),
('5e27e216-70e2-5d8a-beb8-e36d540ddd43','activity','Practice & Exam Drills, Lesson 3',$md$
**Review Questions**

1. How can cultural values influence what a person thinks is right or wrong?
2. Give an example of a Filipino value (e.g. kapwa, bayanihan) and explain its ethical significance.
3. What is cultural relativism? Why might it be a problem to accept it without question?
4. How does society help develop a person's moral character (give one example)?
5. Describe a situation where traditional values might conflict with modern laws or ethics.

**Worked Exam-Style Problems**

*Problem:* In your community, it is customary to give gifts to teachers after exams. A student can afford only a small token, others give expensive items. Is it ethical to give a bigger gift to stand out? Analyze from a cultural vs. ethical perspective.

*Solution:* Cultural view: Gift-giving shows respect. But ethical view: fairness and integrity matter. Using the 7-step model: State problem (pressure vs. fairness), check facts (gift expectations, teacher role), identify options (give equally, give expensive to impress, skip gift). Testing: publicity test – would the student feel ashamed if known? Likely yes (bragging). Best choice: give a modest gift or no gift, because the teacher's duty is independent of gifts. This respects the value of respect (paggalang) without unfairness.

*Problem:* A factory worker family tradition is to help friends and relatives get jobs even if they are less qualified (favor system). How should an HR ethics person evaluate this custom?

*Solution:* Identify values (loyalty/family) vs. merit/fairness. The cultural perspective recognizes *utang na loob* (debt of gratitude), but ethics in work values equal opportunity. The HR person should acknowledge the intention to help others but discourage nepotism. Ethical solution: Suggest following fair hiring rules, maybe mentoring less-qualified relatives instead of giving them an unfair advantage. This balances loyalty and justice.

**Application Exercise**

- Imagine a debate: "Cultural traditions should never be questioned by outside standards." Take turns arguing each side using ethical principles.
- Interview elders or community leaders about a tradition (like fiesta celebrations). Ask how they would handle a moral issue that breaks a tradition. Summarize how culture and ethics interact in that scenario.

**How to Pass this Topic**

- Show awareness of Filipino context. Mention local values (e.g. pakikisama, kapwa) and how they relate to ethics.
- Use examples from Philippine life (school, family, barangay issues). In essay questions, acknowledging both sides (culture vs. universal morality) is often expected.
- Avoid absolute statements like "All traditions are right." Recognize complexity: some customs support ethics, others may clash.
- Tip: Relate ethical terms (like justice, virtue) to community stories or national issues (e.g. bayanihan during disasters, voting for clean candidates).
$md$, 4);

-- ============================================================
-- LESSON 4: Ethical Theories and Frameworks
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('264ba160-fc4f-5392-ac1f-4c75057ce66b','content','Consequentialist Ethics (Utilitarianism)',$md$
**Consequentialist** theories judge actions by their outcomes. **Utilitarianism** is the most famous of these. It says an action is right if it produces the greatest good (happiness, well-being) for the greatest number. In practice, a utilitarian would calculate benefits vs. harms. For instance, if inventing a new gadget helps many people but hurts a few, a utilitarian may still support it. In a Philippine context, this might look like a company choosing a cheaper product that employs thousands versus a premium one that employs few. The key is the overall balance of good. Critics worry it can neglect individual rights (e.g. "Why not sacrifice one to save five?"), so utilitarianism must be applied carefully.
$md$, 1),
('264ba160-fc4f-5392-ac1f-4c75057ce66b','content','Deontological Ethics and Rights',$md$
**Deontological ethics** (duty-based) focus on rules and duties, not outcomes. Immanuel Kant's version is well-known: an action is moral if it follows a universal rule or duty. Kant's **Categorical Imperative** says we should only act on maxims that we can will to become universal laws. For example, always telling the truth is a duty, regardless of consequences. This means you respect others as ends in themselves, not means to an end. In practice, someone might refuse to lie even if lying would save them from trouble, because truth-telling is a duty. **Rights-based ethics** (closely related) emphasize respecting people's basic rights (life, privacy, freedom). For example, workers have a right to safe conditions; ignoring that is unethical even if it saves a company money.
$md$, 2),
('264ba160-fc4f-5392-ac1f-4c75057ce66b','activity','Virtue Ethics and Justice',$md$
**Virtue ethics** focuses on the character of the person. Following Aristotle, it says we should cultivate virtues (courage, honesty, generosity) as habits. A virtuous person knows the right thing by having a good character. For instance, a truthful student speaks honestly without needing to think each time. In the Philippines, teaching character (sincerity, *buong-puso*) is a local example of virtue ethics.

**Justice and Fairness:** Another approach emphasizes justice (fair treatment of all). Theories of justice look at how goods and burdens are distributed. For example, **distributive justice** asks: How should society share resources? Should everyone get the same, or should those who need more (like the poor) get more help? This is why topics like taxation come up in ethics: fair tax policies (progressive taxes) are seen as necessary for the common good. In other words, citizens contribute to society by paying taxes on income, so public services and welfare can be shared. Concepts like **equality** (everyone equal) and **equity** (giving more to the less fortunate) are key in justice theories.

*Ready to apply these ideas? The practice set below contains examples, step-by-step solutions, and deeper exercises.*
$md$, 3),
('264ba160-fc4f-5392-ac1f-4c75057ce66b','activity','Practice & Exam Drills, Lesson 4',$md$
**Review Questions**

1. Explain utilitarianism and give a simple example. What is a potential problem with it?
2. What is Kant's Categorical Imperative in one sentence? How does it differ from utilitarianism?
3. Describe virtue ethics in your own words. Name two virtues and how they might influence behavior.
4. What does "distributive justice" mean? Why might a government tax the rich at a higher rate?
5. Which theory would support telling the truth even if it leads to personal loss, and why?

**Worked Exam-Style Problems**

*Problem:* The local barangay considers closing a shortcut road to reduce accidents, even though it makes travel longer for students. Use utilitarianism and deontology to analyze: Is closing the road ethical?

*Solution:* **Utilitarian view:** closing the road reduces accidents (good for community safety) but inconveniences many (harm to convenience). We compare total harm: if serious injuries will be prevented, the net good may be higher by closing. **Deontological view:** if there is a duty to protect life, closing is right despite inconvenience. Even if some get more travel time, the duty to save lives overrides. Conclusion: Both frameworks likely support closing if the safety benefit outweighs the inconvenience. This shows different reasoning but a similar outcome.

*Problem:* A student is the only one with an original answer on a homework answer sheet. The teacher announces that copying will result in no credit for all. Will this student share answers? Apply a rights/responsibility framework.

*Solution:* Rights angle: Each student has a right to the instructor's respect and an education earned honestly. Responsibility: The student has a duty not to harm classmates' grades. Options: share (violates duty) or refuse (upholds honesty). The student should refuse to share. This protects the academic integrity of everyone. A virtue ethicist would say the honest thing is to uphold integrity. The student's action is ethical (being honest and courageous).

**Application Exercise**

- Debate in groups: One side argues from a utilitarian perspective ("What gives the greatest happiness for the most people?") and the other from a rights perspective ("What are people entitled to, no matter what?") on issues like civic duties or environmental rules.
- Case study: Analyze a news story (e.g. corruption, tech issues, disaster response) and identify ethical issues and which principle they violate.

**How to Pass this Topic**

- Clearly label each theory in answers (e.g. "Under Kant's categorical imperative…"). Compare if needed (e.g. "Unlike utilitarianism, Kantian ethics says…").
- Memorize key names: Aristotle (virtue), Kant (duty/rights), Bentham/Mill (utilitarian). Professors often expect these.
- For justice/taxation questions: mention fairness to majority and vulnerable (for utilitarian) and duty of government (for Kantian/social justice).
- Don't just memorize definitions, apply them. For example, practice identifying which theory an exam question is testing.
- Common mistakes: mixing up theories or missing any explanation. Structure answers so it's clear which framework you're using.
$md$, 4);

-- ============================================================
-- LESSON 5: Contemporary Issues and Social Ethics
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('4fb4afbb-c0de-583a-8020-d17130f234d2','content','Social Justice and the Common Good',$md$
Modern ethics often extends to large-scale issues. **Social justice** means looking after everyone's welfare. For example, a society that provides basic healthcare or education shows justice. In the Philippines, discussions about "inclusive growth" (making sure the rich and poor both benefit from the economy) are ethical at heart. Ethics asks: How do we help the poor? One answer is fair taxation and use of taxes for public services. Citizens have a responsibility to pay taxes that are fair (higher income, higher tax) so that everyone can share in progress. Similarly, caring for the environment is part of ethics now; for instance, reducing pollution respects the rights of future generations. In this way, ethics connects personal behavior (like not littering) with national policies (like environmental laws) for the common good.
$md$, 1),
('4fb4afbb-c0de-583a-8020-d17130f234d2','content','Professional and Technology Ethics',$md$
Even in our jobs and use of technology, ethics applies. As IT or business students, consider issues like privacy, intellectual property, and professional conduct. For example, hacking into someone's account violates their privacy and is unethical, even if there was no law against that specific act. Copying software illegally is unethical because it steals value from creators. In professional settings, ethics means doing your work honestly and competently. If you work on a team, that means not cutting corners on a project. On social media, spreading misinformation or cyberbullying are ethical problems. Philippine law may not cover every new tech dilemma, so personal ethics fill the gap: think about respect and harm to others online. Essentially, we apply the same ethical principles (honesty, respect, responsibility) whether offline or online.
$md$, 2),
('4fb4afbb-c0de-583a-8020-d17130f234d2','activity','Globalization, Pluralism, and Religion in Ethics',$md$
We live in a connected, diverse world. **Globalization** brings different cultures and beliefs together, which can challenge our ethics. On one hand, we look for universal values (like human rights) that apply everywhere. On the other hand, we respect **pluralism**: different cultures may have unique ways of expressing values. Filipino students often find guidance from religion (mostly Catholic teachings) or family traditions. For example, many Filipinos are taught that life and family are sacred; this influences ethical stances on issues like care for the elderly. In pluralist settings (like the internet), we encounter people with different views. Ethics doesn't demand everyone has the same beliefs, but it challenges us to find fair resolutions. For instance, respecting freedom of speech while condemning hate speech is a balancing act. Facing globalization, ethics encourages dialogue and empathy: understanding why someone else values something can help resolve conflicts.

*Ready to apply these ideas? The practice set below contains examples, step-by-step solutions, and deeper exercises.*
$md$, 3),
('4fb4afbb-c0de-583a-8020-d17130f234d2','activity','Practice & Exam Drills, Lesson 5',$md$
**Review Questions**

1. What is meant by the "common good" and how do taxes relate to it?
2. Give an example of an ethical issue in technology (privacy, plagiarism, etc.) and explain why it's important.
3. How can our actions today affect future generations (hint: environment)?
4. What does "pluralist" mean in ethics, and why is it a challenge?
5. Describe a way that religion or personal beliefs can influence ethical decisions (use a Filipino context).

**Worked Exam-Style Problems**

*Problem:* A factory in a barangay dumps chemical waste into a river because it's cheaper. Local fishermen suffer as fish are scarce. Identify the ethical issues and propose what a government official should do.

*Solution:* Issues: harm to the environment and livelihood of people (common good). Ethical values: justice (everyone's health), care for nature, legal responsibility. Government's action: enforce environmental regulations, require the company to clean up (protect community rights). The official should balance economic development with ethics: penalize wrongdoing to uphold justice and public welfare.

*Problem:* Alicia sees a classmate pirating a movie and watching it on their phone. Alicia knows piracy is technically illegal, but says it's okay because no one is harmed. Discuss this from a rights and utilitarian perspective.

*Solution:* **Utilitarian:** Pirating saves money but harms creative industries. The net good is unclear (some benefit, artists lose). **Rights view:** Artists have a right to earn for their work. Illegal downloading violates that right. Conclusion: Ethically wrong, because respecting creators' rights is important and many copies hurt the artist's livelihood. Alicia should refuse to join and explain it's unfair to the people who made the movie.

**Application Exercise**

- Write a brief ethical guideline (3–5 rules) for safe and responsible social media use (in English or Taglish). Include reasons (e.g. privacy, respect) for each rule.
- Case study: Research a Filipino news story (e.g. online privacy breach, community project). Identify the main ethical conflicts and discuss in a short report what should be done.

**How to Pass this Topic**

- Know current events and relate them to ethics: e.g. how ethics apply in tech (social media issues, data privacy), environment (typhoon response), or societal challenges (election ethics).
- Remember key terms: common good, rights of future generations, pluralism. Explain them in answers.
- Philippine context helps: mention local examples like bayanihan in disasters, or responsible use of social media during calamities.
- Tip: Professors often ask about "principles" behind policies (like why there are speed limits, or why cyberbullying is wrong). Think of ethical principles (justice, empathy) that justify these rules.
$md$, 4);

-- ============================================================
-- SOURCES
-- Far Eastern University Institute of Technology, Ethics course syllabus
-- Polytechnic University of the Philippines, Ethics instructional materials (course outline and topics)
-- De La Salle University Manila, GE Ethics course syllabus (outline of course parts)
-- CHED, National General Education Ethics syllabus (CMO 20 s.2013)
-- CHED CMO No. 25, s.2015, Revised PSGs for the BSIT program
-- ============================================================
