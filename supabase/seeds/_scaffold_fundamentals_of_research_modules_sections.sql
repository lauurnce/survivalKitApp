-- ============================================================
-- Fundamentals of Research — Modules & Sections
-- Subject ID: 30000000-0003-0001-0001-000000000003
-- 3rd Year, Semester 1 — minor
-- 6 lessons. Split: S1+S2 = content (FREE); remaining teaching blocks + drill = activity (PAID).
--   Lesson 1 has 4 content blocks + drill -> 2 free / 3 paid.
--   Lessons 2-6 have 3 content blocks + drill -> 2 free / 2 paid.
-- No IDE playgrounds (research subject). Re-running is safe (DELETE clears prior rows).
-- ============================================================

DELETE FROM modules WHERE subject_id = '30000000-0003-0001-0001-000000000003';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('78f694b1-5d38-5bdb-8b3d-13baad91bb40','30000000-0003-0001-0001-000000000003','Lesson 1: Introduction to Research','lesson-1-introduction-to-research',1),
  ('2bdab8a7-b762-566a-ab7c-8328a1de5b94','30000000-0003-0001-0001-000000000003','Lesson 2: Research Problems and Questions','lesson-2-research-problems-and-questions',2),
  ('9911257f-768f-5c34-898e-35bd469c7eff','30000000-0003-0001-0001-000000000003','Lesson 3: Literature Review & Writing','lesson-3-literature-review-and-writing',3),
  ('529e7ab3-78b0-5ae0-9b4f-7957d4fad674','30000000-0003-0001-0001-000000000003','Lesson 4: Research Methods and Design','lesson-4-research-methods-and-design',4),
  ('ac389336-c0b6-51db-9b1e-53542f2bbc78','30000000-0003-0001-0001-000000000003','Lesson 5: Data Collection and Analysis','lesson-5-data-collection-and-analysis',5),
  ('396fb7c8-3e88-510e-91a0-e3be427e2e7e','30000000-0003-0001-0001-000000000003','Lesson 6: Ethics and Proposal Writing','lesson-6-ethics-and-proposal-writing',6);

-- ============================================================
-- LESSON 1: Introduction to Research
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('78f694b1-5d38-5bdb-8b3d-13baad91bb40','content','What is Research?',$md$
Research is a systematic method of inquiry that seeks to discover new knowledge or validate existing information. It involves asking questions, gathering evidence, and drawing conclusions in a structured way. Unlike guessing or intuition, research follows organized steps and uses data and facts. In information technology, research might explore why certain programs work better or how to improve a system based on evidence.
$md$, 1),
('78f694b1-5d38-5bdb-8b3d-13baad91bb40','content','Characteristics of Good Research',$md$
Good research is systematic, meaning it follows a clear plan of action. It is empirical: based on observed or measured data. It aims to be objective, minimizing bias in how data are collected and interpreted. Quality research also tends to be analytical: it breaks down complex problems into parts and examines them carefully. Overall, a well-designed research project will be reliable and trustworthy because it handles variables carefully and sticks to logical methods.
$md$, 2),
('78f694b1-5d38-5bdb-8b3d-13baad91bb40','activity','Why Research Matters',$md$
Research is important because it helps us understand and solve real problems. For example, a BSIT student might research how Filipinos use mobile banking to help design more user-friendly apps. On a larger scale, research guides government and businesses to make informed decisions (like using data to plan better internet coverage in rural areas). For students, learning research skills also builds critical thinking and communication ability—skills that are valuable in any IT career.
$md$, 3),
('78f694b1-5d38-5bdb-8b3d-13baad91bb40','activity','The Research Process',$md$
A typical research process has several stages. First, you identify a clear question or problem to study. Next, you review what others have already learned about the topic. Then you design your own study (choosing methods and tools) and collect data (like conducting surveys or experiments). After data collection, you analyze the information to find patterns or answers. Finally, you draw conclusions and share your findings, often in a report. This step-by-step approach keeps a research project organized and focused.
$md$, 4),
('78f694b1-5d38-5bdb-8b3d-13baad91bb40','activity','Practice & Exam Drills — Lesson 1',$md$
**Review Questions**

1. What is the definition of research? Provide an example of research in IT.
2. List three characteristics of good research.
3. Why is it important for research to be systematic and evidence-based?
4. How does research benefit technology development or decision-making? Give one example.
5. Explain the difference between a guess and a research finding.

**Worked Problems**

**Exam Problem:** A student wants to study why many Filipinos prefer using mobile wallets instead of carrying cash. Outline the major steps this student should follow in conducting this research, starting from the research question to final conclusions.

**Solution:** First, the student should formulate a clear research question (e.g., "Why do Filipino consumers prefer mobile wallets over cash for daily transactions?"). Next, conduct a literature review to find existing studies on digital payments. Then design the study: for example, create a survey or interview questions to ask users about their payment habits. After deciding on a methodology (such as sampling a diverse group of people), the student would collect data by distributing the survey or conducting interviews. Then they would analyze the data (for example, calculating percentages of responses) to identify patterns. Finally, the student would draw conclusions based on the evidence (e.g., finding that convenience is the main reason people use mobile wallets). Each step builds on the actual data, making the findings reliable.

**Exam Problem:** Identify whether the following scenario is an example of research, and explain why or why not: Every morning, Maria checks the traffic update app to decide which route to take. She notices her co-workers do the same. She concludes that the app must be very accurate. Based on this, she recommends all drivers to use the app.

**Solution:** This scenario is not a proper research study. Maria is making a conclusion based on casual observation, but she has not gathered or analyzed data systematically. True research would involve collecting evidence from many drivers (for example, surveying people about the app's accuracy or comparing predicted vs. actual travel times). Since Maria did not perform any controlled study or analysis, her conclusion is only an assumption. Real research would test and verify the app's accuracy with actual data before drawing conclusions.

**Hands-On Exercise**

Choose a real-world IT topic (such as online shopping habits, use of e-learning platforms, or social media usage in your community). Write a clear research question and at least two specific objectives for a study on this topic. For example, if your topic is e-learning platforms, one question could be "What factors influence students' satisfaction with online learning platforms?"

**How to Pass Tips**

- **Understand key terms.** Be ready to define research, systematic, empirical, etc., and explain them clearly. Professors often test these definitions.
- **Memorize steps.** Know the basic research steps (Question → Review → Design → Data → Analysis → Conclusion). Being able to list them in order can earn credit.
- **Use examples.** Practice explaining concepts with simple examples (like a popular app or a common issue). This shows you understand the idea.
- **Be concise and structured.** In your exam answers, write clearly and in a logical order. Consider outlining your answer first (in your notes) before writing full sentences.
- **Check clarity.** When writing definitions or processes, ensure your reasoning is explicit. Avoid leaving logic gaps (for instance, explain why each step leads to the next).
$md$, 5);

-- ============================================================
-- LESSON 2: Research Problems and Questions
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('2bdab8a7-b762-566a-ab7c-8328a1de5b94','content','Selecting a Research Topic',$md$
To begin research, you need a good topic that interests you and is relevant to IT. Look for real problems or trends you notice around you, like an app or system that doesn't work well. Your topic should be focused and feasible to study in one semester, and enough data or resources should be available. For example, instead of studying "social media in the Philippines" (too broad), you might narrow it to something like "how high school students in Manila use online learning apps." A specific topic helps you stay focused and find useful information.
$md$, 1),
('2bdab8a7-b762-566a-ab7c-8328a1de5b94','content','Formulating a Problem Statement',$md$
A problem statement is a concise description of the issue your research will address. It clearly explains what is wrong or what gap exists, and why it matters. For example: "Local software developers lack a standard task management tool, causing inefficiency in team collaboration." This tells us who (local developers), what (lack a tool), and why it matters (inefficiency). A clear problem statement guides your research direction and helps readers immediately understand the purpose of your study.
$md$, 2),
('2bdab8a7-b762-566a-ab7c-8328a1de5b94','activity','Research Questions and Objectives',$md$
After defining the problem, break it into specific research questions and objectives. A research question focuses on one part of the problem (often phrased with "What" or "How"). From the example above, a question might be "What task management tools do local software teams currently use, and how satisfied are they with these tools?" Objectives are the goals or steps of your study (like "to survey the most common tools among Filipino developers"). If your study is quantitative, you might also form a hypothesis—a prediction you will test. Well-formulated questions and objectives keep your research focused and make it easier to plan the study.
$md$, 3),
('2bdab8a7-b762-566a-ab7c-8328a1de5b94','activity','Practice & Exam Drills — Lesson 2',$md$
**Review Questions**

1. What factors make a good research topic? List two and explain.
2. How would you narrow the broad topic "social media usage" into a more specific research question for IT students?
3. What is a research problem statement? Why is it important?
4. How is a research question different from an objective or hypothesis?
5. Provide an example of a clear, concise problem statement on any IT issue (in one sentence).

**Worked Problems**

**Exam Problem:** You are interested in studying e-learning platforms. Write a specific research problem statement and one research question related to this topic.

**Solution:** One possible problem statement is: "High school students at Manila Science High School report low engagement during online classes due to poorly designed e-learning platforms." A matching research question could be: "What features of the current e-learning platform are most commonly associated with student disengagement?" This question targets the problem by asking which platform features impact engagement.

**Exam Problem:** Given the problem statement: "Local internet cafe owners lack an efficient system to manage customer queues, leading to long wait times." Propose two research questions that could guide a study on this issue.

**Solution:** For this problem, research questions could include: 1) "What methods do internet cafe owners currently use to manage customer queues, if any?" and 2) "How do queue management practices affect customer satisfaction or wait times in these cafes?" These questions directly address the identified problem and set the stage for finding practical solutions.

**Hands-On Exercise**

Think of a technical issue or challenge you've observed (it could be at your school, job, or community). Write a one-sentence problem statement for that issue and formulate two related research questions.

**How to Pass Tips**

- **Be specific.** Avoid vague terms in your problem statement and questions. Instead of "social media," specify which platform and which user group (e.g., "Facebook usage among college freshmen").
- **Match questions to problems.** Every research question should relate directly to part of your problem statement. If the problem mentions time, one question can focus on timing issues.
- **Check clarity.** Read your problem statement and questions: are they understandable to someone not in the class? If not, simplify the wording.
- **Avoid yes/no questions.** Good research questions usually begin with "What," "How," or "Why" rather than yes/no. This ensures you gather detailed information.
- **Use your knowledge.** Think about what professors emphasize: clarity and focus. Show that you can take a broad idea and break it into clear, answerable questions.
$md$, 4);

-- ============================================================
-- LESSON 3: Literature Review & Writing
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('9911257f-768f-5c34-898e-35bd469c7eff','content','The Literature Review',$md$
A literature review surveys existing research on your topic to show what is already known and what gaps your study can fill. It summarizes key findings and puts them in the context of your research. For example, you might write: "Prior studies in the Philippines have found that mobile apps greatly increase student engagement in online learning (De la Cruz & Santos, 2021), suggesting that improving app design could further boost learning outcomes." This demonstrates you understand past work and sets the stage for your research.
$md$, 1),
('9911257f-768f-5c34-898e-35bd469c7eff','content','Finding and Evaluating Sources',$md$
Use reliable academic sources such as peer-reviewed journals, books, and official reports. Search tools like Google Scholar, university library databases, or government repositories are helpful. For example, you might find useful papers in the DOST or CHED archives or at tech conferences (IEEE, ACM). Check a source's credibility by considering the author's expertise and the publication venue. Also look at the date: since technology changes fast, prefer recent studies (ideally within the last 5–10 years). Always note how each source's findings relate to your own research question.
$md$, 2),
('9911257f-768f-5c34-898e-35bd469c7eff','activity','Citing Sources and Avoiding Plagiarism',$md$
Always give credit when you use someone else's ideas or words. Use a standard citation style like APA. For instance, you might write: According to Garcia (2022), e-learning improves students' performance. If you quote directly, use quotation marks and a page number (for example, Garcia (2022) found that "e-learning improves performance" (p. 45).). Even when you paraphrase (put information in your own words), include a citation like (Garcia, 2022). Plagiarism (copying without credit) is a serious academic offense. A good rule is: if an idea or fact is not your own, cite it. For example: "AI can improve local disaster warnings" (Ramos, 2020) clearly attributes the idea to Ramos.
$md$, 3),
('9911257f-768f-5c34-898e-35bd469c7eff','activity','Practice & Exam Drills — Lesson 3',$md$
**Review Questions**

1. What is the purpose of a literature review in a research project?
2. Name two online tools or databases you could use to find academic sources.
3. What information should you check to judge if a source is reliable?
4. How do you correctly cite a source in APA style when paraphrasing versus quoting?
5. Why is it wrong to copy exact text from a source without quotation marks or citation?

**Worked Problems**

**Exam Problem:** Rewrite the following plagiarized sentence by paraphrasing and adding a citation. Plagiarized: "Mobile learning increases student performance significantly (Santos, 2021)."

**Solution:** A correct way is: Mobile learning has been shown to greatly improve student performance (Santos, 2021). This restates the idea in new words and cites Santos, 2021.

**Exam Problem:** You have the following references in your notes: (Garcia, 2020), (Lopez, 2018, p. 45). Which one is correctly formatted for an in-text APA citation of a paraphrased idea? Explain why.

**Solution:** (Garcia, 2020) is correct for a paraphrase, because it includes the author and year. The (Lopez, 2018, p. 45) format is used when quoting directly (note the page number). When paraphrasing, we include only author and year, so use (Garcia, 2020) for a paraphrase.

**Hands-On Exercise**

Find one scholarly article related to your research topic (you may use Google Scholar). Write a one-sentence summary of its main finding and include a proper APA citation (author, year) in parentheses.

**How to Pass Tips**

- **Consistently cite sources.** Whenever you use a fact or idea from a text, add a citation. Professors check for any uncited information.
- **Remember APA format.** Typically write (Author, Year) after a statement from a source. If quoting directly, also add page numbers (e.g., (Author, Year, p. 123)).
- **Rephrase in your own words.** Don't just change a word or two; fully restate the idea in a new way, then cite it. This avoids plagiarism.
- **Use a reference list.** If allowed, listing all cited works (title, author, year) in a bibliography shows you have done thorough research.
- **Use quotation marks for quotes.** Only put text in quotes if it's exactly from the source, and always cite it. If you forget quotes, even with a citation it's still plagiarism.
$md$, 4);

-- ============================================================
-- LESSON 4: Research Methods and Design
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('529e7ab3-78b0-5ae0-9b4f-7957d4fad674','content','Types of Research Methods',$md$
Research in IT can use various methods. Surveys and questionnaires collect numerical data from many people (quantitative). Experiments test a hypothesis by changing one factor and comparing results (for example, testing if a new software feature improves productivity by comparing two user groups). Case studies or interviews are qualitative: they give detailed insight into a specific situation (like in-depth interviews with developers about how they use a tool). Descriptive research simply observes or measures things (e.g., counting how many students use a study app). Each method serves different purposes.
$md$, 1),
('529e7ab3-78b0-5ae0-9b4f-7957d4fad674','content','Quantitative vs. Qualitative Approaches',$md$
Quantitative research deals with numbers and measurable data. You design instruments (like online surveys with rating scales) and use statistics to analyze results (calculating averages, correlations, etc.). For example, you might survey 100 users about the number of hours they spend coding per week. Qualitative research deals with words and meanings. You might conduct interviews or focus groups to understand experiences. For instance, you might interview developers about why they prefer one programming language over another. Qualitative data are analyzed by identifying themes or patterns. Both approaches can be combined (mixed methods) for a richer understanding.
$md$, 2),
('529e7ab3-78b0-5ae0-9b4f-7957d4fad674','activity','Choosing a Research Design',$md$
Your research question determines the design. If you want to test cause-and-effect (for example, "Does using a coding app improve students' grades?"), you might use an experimental design with a control group. If you want to describe a situation ("How many students use the library's computers?"), a descriptive survey is enough. Other designs include correlational studies (examining relationships, like stress vs. screen time) and case studies (deep dive into one example, such as developing a prototype). Always consider how you will collect data ethically. A clear plan for methods and analysis ensures your study can answer the research questions.
$md$, 3),
('529e7ab3-78b0-5ae0-9b4f-7957d4fad674','activity','Practice & Exam Drills — Lesson 4',$md$
**Review Questions**

1. What is the main difference between quantitative and qualitative research?
2. Give one example of a research question best answered by a quantitative method.
3. What is an independent variable and a dependent variable in an experiment?
4. Why might a researcher choose a survey over interviews, or vice versa?
5. What is a case study design, and when is it useful?

**Worked Problems**

**Exam Problem:** You want to test if a new scheduling app reduces customer wait times in an internet cafe. Outline a simple experimental design for this study.

**Solution:** Divide customers or time periods into two groups (control vs. treatment). The control group uses the old scheduling method, and the treatment group uses the new app. The independent variable is the type of scheduling method (old vs. new), and the dependent variable is the average wait time. Measure and compare the wait times: if the group using the new app has significantly lower wait times, it suggests the app helped reduce wait times.

**Exam Problem:** Determine whether each scenario calls for a qualitative or quantitative method, and explain why.
a. Studying engineers' opinions about a new programming tool through open-ended interviews.
b. Counting how many people in a community have access to high-speed internet.

**Solution:** a. This is qualitative because it uses interviews to explore opinions and experiences in depth. Data would be thematic rather than numerical. b. This is quantitative because it involves measuring a number (how many people). A survey or official data would give numeric results that you can summarize statistically.

**Hands-On Exercise**

Think of a research question for an IT topic (for example, "Does using mobile apps increase productivity?"). Write one quantitative question you could answer with a survey (e.g., "On average, how many hours per week do you save by using X app?") and one qualitative question you could answer with an interview (e.g., "How has using X app affected your daily work routine?").

**How to Pass Tips**

- **Match method to question.** If you need numerical data (counts, averages, frequencies), use quantitative methods (surveys, experiments). If you need opinions or detailed descriptions, use qualitative methods (interviews, focus groups).
- **Remember variables.** In an experiment, clearly identify the independent variable (what you change) and the dependent variable (what you measure).
- **Outline your design.** In answers, it helps to list steps or sketch a plan (e.g., "1. Randomly assign participants to groups; 2. Apply treatment; 3. Measure outcomes"). This shows clear thinking.
- **Use key terms.** Words like random assignment, control group, rating scale, theme analysis, etc., indicate understanding of research design.
- **Justify your choice.** When asked why a method is appropriate, explain how it fits the goal (e.g., "A survey is suitable to gather data from many users, whereas an interview is chosen to explore user experiences in depth.").
$md$, 4);

-- ============================================================
-- LESSON 5: Data Collection and Analysis
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('ac389336-c0b6-51db-9b1e-53542f2bbc78','content','Sampling and Data Collection',$md$
The population is the entire group you want to study (for example, all BSIT students in your university). A sample is a smaller group selected from the population. Common sampling methods include simple random sampling (everyone has an equal chance), stratified sampling (divide population into subgroups like year level, then sample each), and convenience sampling (using whoever is available). The sample should represent the population well. When collecting data, use methods like surveys, interviews, or observations. For a survey, write clear questions and decide on an appropriate scale. It's good practice to pilot-test your questionnaire on a few people to make sure questions are understood.
$md$, 1),
('ac389336-c0b6-51db-9b1e-53542f2bbc78','content','Questionnaire Design and Instruments',$md$
Design your data collection tools carefully. For example, a questionnaire might include multiple-choice, yes/no, or rating-scale questions (such as Likert scales). Open-ended questions let respondents answer in their own words but are harder to analyze. Ensure each question is clear and not leading. Check that your instrument is valid (it measures what you intend to measure) and reliable (it would give similar results if repeated). For instance, if asking about "internet speed," make sure all respondents understand what speed ranges or terms you mean. Plan how you will distribute the instrument (paper, online, interview) and how to record the responses.
$md$, 2),
('ac389336-c0b6-51db-9b1e-53542f2bbc78','activity','Data Analysis: Descriptive Statistics',$md$
After collecting data, organize and summarize it. If you have numerical data, calculate descriptive statistics: the mean (average), median (middle value), and mode (most frequent value). For example, if students studied 3, 5, 2, 6, and 4 hours, the mean is (3+5+2+6+4)/5 = 4, and the median (middle when sorted 2,3,4,5,6) is 4. Use tables and graphs to present findings: bar charts or pie charts for categories, histograms for distributions, etc. If your data is categorical (like yes/no responses), use counts and percentages. Even without advanced statistics, presenting clear summaries of your data is a crucial part of analysis.
$md$, 3),
('ac389336-c0b6-51db-9b1e-53542f2bbc78','activity','Practice & Exam Drills — Lesson 5',$md$
**Review Questions**

1. What is the difference between a population and a sample?
2. Name two ways to select a sample (sampling methods).
3. Why is it important for a sample to be representative of the population?
4. What do validity and reliability mean in the context of a survey question?
5. When would you use a bar graph versus a pie chart?

**Worked Problems**

**Exam Problem:** Given the data on hours studied by 5 students: 3, 5, 2, 6, 4. Calculate the mean and median study hours.

**Solution:** First, sort the data: 2, 3, 4, 5, 6. The mean is (2+3+4+5+6)/5 = 20/5 = 4. The median (the middle value) is 4 (the third number in the sorted list). So both the mean and median are 4 hours.

**Exam Problem:** You need to survey 50 employees in a large company to know their preferred programming language. Which sampling method would ensure each employee has a fair chance of being selected? Explain why.

**Solution:** A simple random sample is best. For example, list all employees and randomly pick 50 names (using random numbers or a lottery). This way, every employee has an equal chance of selection, reducing bias. A method like convenience sampling (surveying only those who volunteer) might skew results if volunteers differ from others.

**Hands-On Exercise**

Write two survey questions (with answer choices) about a computer technology topic, such as internet usage or software preferences. For example: "How many hours do you use a computer on a typical day?" (answer choices: 0–1, 2–4, 5–8, 9+ hours) and "Which operating system do you primarily use?" (choices: Windows, macOS, Linux, Other).

**How to Pass Tips**

- **Show your calculations.** When solving for mean or other statistics, write out your math clearly (list the numbers, then divide). This can earn partial credit.
- **Check median carefully.** Remember: for an odd number of values, the median is the middle one; for an even number, it's the average of the two middle values.
- **Use sampling terms.** Include terms like random sample, stratified, or convenience sample. Professors look for these keywords.
- **Choose the right graph.** Bar charts are used for comparing categories (like favorite apps), while pie charts show a part-to-whole distribution (like percentage share). Always label your axes or legend clearly.
- **Pilot test note.** Mention that you would test questions for clarity before full data collection. This shows thoroughness (even if you don't actually do it in an exam).
$md$, 4);

-- ============================================================
-- LESSON 6: Ethics and Proposal Writing
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('396fb7c8-3e88-510e-91a0-e3be427e2e7e','content','Ethical Guidelines in Research',$md$
Research must respect participants and follow laws. Always obtain informed consent: explain the study's purpose and procedures, and get agreement from participants (or guardians, if minors). Ensure confidentiality: protect personal information (for example, the Philippine Data Privacy Act of 2012 requires secure handling of data). If your study involves people, seek approval from an ethics review board (like a university IRB). Avoid harming participants physically, emotionally, or legally. For instance, if asking sensitive questions, allow participants to skip them. Always be honest and transparent about your research.
$md$, 1),
('396fb7c8-3e88-510e-91a0-e3be427e2e7e','content','Responsible Research Conduct',$md$
Be honest and fair throughout your research process. Do not fabricate or falsify data, and never plagiarize others' work. Keep raw data secure and use it only for the stated purpose. If working with collaborators, give proper credit and discuss author order beforehand. If you make a mistake, report it. Avoid conflicts of interest (for example, disclose if a sponsor could benefit from your results). Essentially, do what you say you will do in your research plan, and report results truthfully—even if they don't support your hypothesis.
$md$, 2),
('396fb7c8-3e88-510e-91a0-e3be427e2e7e','activity','Writing a Research Proposal',$md$
A research proposal is a detailed plan for a study. It typically includes:

- **Title:** a concise description of your study's topic.
- **Introduction:** background, problem statement, and objectives.
- **Literature Review:** summary of related studies (see Module 3).
- **Methodology:** how you will collect and analyze data (sampling, instruments, procedures).
- **Timeline:** a schedule of activities (sometimes shown as a Gantt chart or table).
- **Budget:** resources needed (if applicable).
- **References:** list of sources in proper format (often APA).

Write in clear, formal language. Follow any guidelines your school provides for length or format. A well-organized proposal (with clear headings and realistic plans) shows that your research can be done successfully.
$md$, 3),
('396fb7c8-3e88-510e-91a0-e3be427e2e7e','activity','Practice & Exam Drills — Lesson 6',$md$
**Review Questions**

1. What is informed consent and why is it important in research?
2. Name two principles of research ethics (for example, respect for persons, beneficence).
3. Give an example of research misconduct (e.g., data fabrication or plagiarism).
4. What steps should a researcher take to protect participants' confidentiality?
5. What is the purpose of an Institutional Review Board (IRB) in research?

**Worked Problems**

**Exam Problem:** Evaluate this scenario: A student surveys her classmates about study habits, but does not tell them the results are for a graded assignment and collects names. Is this ethical? Explain.

**Solution:** This is unethical. The classmates did not give informed consent (they didn't know it was for a graded research project). Also, collecting names without permission violates confidentiality. The student should have clearly explained the research purpose and allowed anonymity. Transparency and respect for participants' rights are required in ethical research.

**Exam Problem:** Match each research proposal section to its content:

A. Problem Statement and Objectives
B. Methodology
C. Literature Review

Sections: 1. Describes how data will be collected and analyzed. 2. Lists what previous studies found and their authors. 3. States the research question and goals.

**Solution:** A-3 (Problem statement & objectives corresponds to stating the question and goals), B-1 (Methodology describes data collection and analysis), C-2 (Literature Review summarizes previous studies and sources).

**Hands-On Exercise**

Write a sample consent statement for a survey where participants answer questions anonymously. For example: "Your participation is voluntary and anonymous. You may skip any question. The data will be used only for this study." Then list two methods you will use to keep the data confidential (e.g., secure storage, no names collected).

**How to Pass Tips**

- **Use key terms.** Include words like informed consent, anonymity, IRB, plagiarism, etc. This shows the grader you know the ethical concepts.
- **Be specific in scenarios.** If given an example, point out exactly what is wrong (e.g., "No consent was obtained," "Data were not kept anonymous"). Don't just recite principles; apply them to the situation.
- **Proposal details.** If asked about writing proposals, mention sections like methodology and timeline. Clear headings and a structured format will earn points.
- **Cite local laws if relevant.** For example, mentioning the Philippine Data Privacy Act (RA 10173, 2012) or university guidelines can demonstrate awareness of local context.
$md$, 4);

-- SOURCES:
--   Polytechnic University of the Philippines (DIP-IT) — COMP 015: Fundamentals of Research course syllabus (BSIT program)
--   CHED CMO No. 25, s. 2015 — Revised policies, standards, and guidelines for BSIT programs
