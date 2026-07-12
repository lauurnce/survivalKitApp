-- ============================================================
-- Discrete Structures 1, Exam Prep: Prelims & Finals
-- Subject ID: 10000000-0001-0002-0001-000000000002
-- Module ID:  b1000001-0001-0002-0001-0000000000e1
-- Purpose: exam-prep module (blueprints, mock exams, answer
--          keys, trap drills) built strictly on Lessons 1–9 of
--          discrete_structures_1_modules_sections.sql.
-- Idempotent: deletes only this module (sections cascade), then
--             re-inserts. INSERT-only otherwise; safe to re-run.
-- ============================================================

DELETE FROM modules WHERE id = 'b1000001-0001-0002-0001-0000000000e1';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('b1000001-0001-0002-0001-0000000000e1','10000000-0001-0002-0001-000000000002','Exam Prep: Prelims & Finals','exam-prep-prelims-finals',10);

-- ============================================================
-- SECTION 1 (content, FREE): Prelim Exam Blueprint & Study Plan
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('b1000001-0001-0002-0001-0000000000e1','content','Prelim Exam Blueprint & Study Plan',$md$
Your prelim in Discrete Structures 1 almost always covers the first four lessons. Here is exactly what to expect, what to memorize, and how to prepare in one week.

### What the Prelim Covers

| Lesson | Typical Weight | What Gets Tested |
|---|---|---|
| Lesson 1: Propositional Logic | 30% | Propositions vs. non-propositions, connectives, translation, truth tables, tautology/contradiction/contingency, converse/inverse/contrapositive |
| Lesson 2: Proof Techniques in Propositional Logic | 25% | Naming equivalence laws, naming inference rules, step-by-step validity proofs, testing validity with truth tables |
| Lesson 3: Predicate Logic and Quantifiers | 20% | ∀ and ∃ translation, quantifier inference rules, direct proof, contrapositive proof, proof by cases |
| Lesson 4: Set Concepts | 25% | Roster and set-builder form, cardinality, union/intersection/complement/difference, Cartesian product, inclusion-exclusion word problems |

### Question Types You Will See

| Question Type | What It Looks Like | Where It Comes From |
|---|---|---|
| Truth-table construction | "Construct the truth table for ¬P ∨ (Q ∧ P) and classify it." | Lesson 1 |
| English → symbols | "Translate: If the server is down, we cannot submit." | Lessons 1 and 3 |
| Symbols → English | "Read R → ¬L in words." | Lessons 1 and 3 |
| Identify the rule/law | "P → Q, ¬Q ∴ ¬P is which rule of inference?" | Lesson 2 |
| Set computations | "Given U, A, B, find A' ∩ B." | Lesson 4 |
| Inclusion-exclusion word problems | "40 like hockey, 35 like cricket, 20 like both..." | Lesson 4 |

### Your Exact Memorize List

Do not walk into the prelim without these cold:

1. **The five connective truth tables**, ¬P, P ∧ Q, P ∨ Q, P → Q, P ↔ Q. Especially: P → Q is false **only** when P is true and Q is false.
2. **The equivalence laws**, De Morgan's, Material Implication (P → Q ≡ ¬P ∨ Q), Involution (¬¬P ≡ P), Commutative, Associative, Distributive, Idempotence, Identity laws, Exportation, Material Equivalence.
3. **The inference rules**, Modus Ponens, Modus Tollens, Disjunctive Syllogism, Hypothetical Syllogism, Addition, Simplification, Conjunction, Constructive Dilemma, Destructive Dilemma.
4. **The conditional's three related forms**, inverse (¬P → ¬Q), converse (Q → P), contrapositive (¬Q → ¬P). Only the contrapositive is equivalent to the original.
5. **Set identities**, De Morgan's for sets ((A ∪ B)' = A' ∩ B'), |A × B| = |A| × |B|, and inclusion-exclusion: |A ∪ B| = |A| + |B| − |A ∩ B|.
6. **Quantifier patterns**, "All A are B" is ∀x[A(x) → B(x)]; "Some A are B" is ∃x[A(x) ∧ B(x)]. Note the ∀ pairs with →, the ∃ pairs with ∧.

### Top Mistakes That Cost Points

- Marking P → Q false when P is false. A false antecedent makes the conditional **true**, always.
- Writing the inverse when asked for the converse (or vice versa). Converse swaps; inverse negates; contrapositive does both.
- Building 2ⁿ⁻¹ rows instead of 2ⁿ. Three variables means 8 rows, no exceptions.
- Pushing ¬ inside parentheses without flipping the connective. ¬(P ∧ Q) is ¬P ∨ ¬Q, not ¬P ∧ ¬Q.
- Computing B − A when the item asks for A − B. Set difference is not commutative.
- Counting duplicate elements in cardinality. |{1, 2, 3, 3}| = 3, not 4.
- Forgetting to subtract the overlap in inclusion-exclusion word problems.

### 7-Day Study Plan

| Day | Focus | Do This |
|---|---|---|
| Day 1 | Lesson 1: Propositional Logic | Re-read the content section. Write the five connective truth tables from memory three times. Redo Exercise 1.4. |
| Day 2 | Lesson 1 translation drills | Redo Exercises 1.1–1.3. For every sentence, underline the connective keyword before symbolizing. |
| Day 3 | Lesson 2: Proof Techniques in Propositional Logic | Memorize the equivalence-law table and rules-of-inference table. Redo Exercise 2.1 and 2.2 without looking at the tables. |
| Day 4 | Lesson 2 validity + Lesson 3: Predicate Logic and Quantifiers | Redo Exercise 2.3 (truth-table validity). Then drill ∀/∃ translation with Exercise 3.1. |
| Day 5 | Lesson 3 proofs + Lesson 4: Set Concepts | Redo Exercise 3.2 (contrapositive, direct proof). Then run through every set operation in Lesson 4 with your own small examples. |
| Day 6 | Mixed practice | Take the Free Practice Set in the next section under time pressure (45 minutes), then check the key. |
| Day 7 | Mock exam day | Take a full 30-item mock exam in one sitting, mark it, and re-study only the items you missed. |
$md$, 1);

-- ============================================================
-- SECTION 2 (content, FREE): Free Practice Set, 15 Items
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('b1000001-0001-0002-0001-0000000000e1','content','Free Practice Set, 15 Items with Answer Key',$md$
Work through all 15 items before scrolling to the key. Everything here comes straight from Lessons 1–4.

### Items

1. Which of the following is a proposition?
   a. "Submit your activity!"  b. "9 + 6 = 14"  c. "Why is the lab closed?"  d. "x < 10"

2. P is false and Q is true. What is the truth value of P → Q?

3. Given "If it rains tonight, I will sleep well," write the converse, the inverse, and the contrapositive. Which one is logically equivalent to the original?

4. Let R = "Leo reviews," S = "Leo sleeps early," P = "Leo passes." Translate: "If Leo reviews and sleeps early, then he passes."

5. What is the main connective of (P ∧ Q) ∨ ¬R?

6. A formula uses the variables P, Q, and R. How many rows does its truth table need?

7. Construct the truth table for P → (P ∨ Q). Classify it as a tautology, contradiction, or contingency.

8. Which equivalence law justifies ¬¬P ≡ P?

9. Which rule of inference is this? P → Q, P ∴ Q

10. Let B(x) = "x is a BSIT student," D(x) = "x takes Discrete Structures." Symbolize: "All BSIT students take Discrete Structures."

11. Let A(x) = "x is an app," F(x) = "x is free." Symbolize: "Some apps are free."

12. Given U = {1,2,3,4,5,6,7,8,9}, A = {1,3,5,7,9}, B = {3,6,9}. Find A ∩ B.

13. Using the same sets: find A − B and B'.

14. If |A| = 4 and |B| = 3, what is |A × B|?

15. In a class of 50 students, 30 use Android, 28 use iOS, and 12 use both. How many use at least one of the two? How many use neither?

### Answer Key

1. **b.** "9 + 6 = 14" is declarative with a definite truth value (false). (a) is a command, (c) is a question, (d) has a free variable, so none of those carries a truth value.

2. **True.** A conditional is false only when the antecedent is true and the consequent is false. Here the antecedent is false, so P → Q is true.

3. Converse: "If I sleep well, it rains tonight" (Q → P). Inverse: "If it does not rain tonight, I will not sleep well" (¬P → ¬Q). Contrapositive: "If I do not sleep well, it does not rain tonight" (¬Q → ¬P). **Only the contrapositive** is equivalent to the original.

4. **(R ∧ S) → P.** "And" builds the conjunction; "if...then" makes the whole thing a conditional, so the conjunction sits inside the antecedent.

5. **∨.** The ∧ is trapped inside parentheses and the ¬ applies only to R, so the disjunction joins the two main parts.

6. **8 rows.** Rows = 2ⁿ with n = 3, and 2³ = 8.

7. Full table:

| P | Q | P ∨ Q | P → (P ∨ Q) |
|---|---|---|---|
| T | T | T | T |
| T | F | T | T |
| F | T | T | T |
| F | F | F | T |

   The final column is all T, so it is a **tautology**.

8. **Involution** (double negation): ¬¬P ≡ P.

9. **Modus Ponens.** From a conditional and its antecedent, conclude the consequent.

10. **∀x[B(x) → D(x)].** "All A are B" always uses ∀ with →.

11. **∃x[A(x) ∧ F(x)].** "Some A are B" always uses ∃ with ∧.

12. **A ∩ B = {3, 9}**, the elements in both sets.

13. **A − B = {1, 5, 7}** (in A but not in B). **B' = {1, 2, 4, 5, 7, 8}** (everything in U outside B).

14. **12.** |A × B| = |A| × |B| = 4 × 3.

15. At least one: |A ∪ B| = 30 + 28 − 12 = **46**. Neither: 50 − 46 = **4**.

The two full 30-item prelim mocks, two full 30-item final mocks, complete explained answer keys, and the trap drills below come with the subject unlock.
$md$, 2);

-- ============================================================
-- SECTION 3 (activity): Prelim Mock Exam A, 30 Items
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('b1000001-0001-0002-0001-0000000000e1','activity','Prelim Mock Exam A, 30 Items',$md$
Simulate the real thing: one sitting, 60 minutes, no notes. Coverage: Lessons 1–4. The full answer key with explanations is in the "Answer Key with Explanations" section.

### Part I, Multiple Choice (Items 1–10)

1. Which of the following is a proposition?
   a. "Close the door!"  b. "5 + 9 = 14"  c. "Why is the sky blue?"  d. "x < 10"

2. P → Q is false exactly when:
   a. P is true and Q is true  b. P is true and Q is false  c. P is false and Q is true  d. P is false and Q is false

3. What is the main connective of ¬(P ∨ Q) → R?
   a. ¬  b. ∨  c. →  d. It has no main connective

4. P ↔ Q is true exactly when:
   a. P and Q have the same truth value  b. P and Q have different truth values  c. P is true  d. Q is false

5. A formula contains 4 distinct variables. How many rows does its truth table need?
   a. 4  b. 8  c. 16  d. 32

6. Which formula is logically equivalent to P → Q?
   a. P ∨ ¬Q  b. ¬P ∨ Q  c. ¬P ∧ Q  d. Q → P

7. The contrapositive of "If it rains, then the ground is wet" is:
   a. "If the ground is wet, then it rains"
   b. "If it does not rain, then the ground is not wet"
   c. "If the ground is not wet, then it does not rain"
   d. "It rains and the ground is not wet"

8. P ∨ ¬P is a:
   a. contingency  b. contradiction  c. tautology  d. fallacy

9. Let D(x) = "x is a dog," F(x) = "x is friendly." "Some dogs are friendly" is:
   a. ∀x[D(x) → F(x)]  b. ∃x[D(x) ∧ F(x)]  c. ∃x[D(x) → F(x)]  d. ∀x[D(x) ∧ F(x)]

10. Let S(x) = "x is a student," H(x) = "x is hardworking." ∀x[S(x) → H(x)] reads:
    a. "Some students are hardworking"  b. "All students are hardworking"  c. "All hardworking people are students"  d. "No students are hardworking"

### Part II, True or False (Items 11–15)

11. The converse of P → Q is ¬P → ¬Q.
12. P ∧ Q ≡ Q ∧ P by the Commutative law.
13. The final column of a contingency's truth table contains only T.
14. If |A| = 5 and |B| = 3, then |A × B| = 15.
15. ¬(P ∧ Q) ≡ ¬P ∧ ¬Q.

### Part III, Translation (Items 16–20)

16. Let A = "Aki studies," B = "Bea plays." Symbolize: "Aki studies, but Bea plays."
17. Let D = "The server is down," S = "We can submit." Symbolize: "If the server is down, then we cannot submit."
18. Let P = "We pass," R = "We review." Symbolize: "We will pass if and only if we review."
19. Let R = "Rina reviews," L = "Rina relaxes." Write R → ¬L as an English sentence.
20. Let F(x) = "x is a freshman," T(x) = "x takes Discrete Structures." Symbolize: "All freshmen take Discrete Structures."

### Part IV, Identify the Rule (Items 21–24)

Name the rule of inference used in each argument form.

21. P → Q, P ∴ Q
22. P → Q, ¬Q ∴ ¬P
23. P ∨ Q, ¬P ∴ Q
24. P → Q, Q → R ∴ P → R

### Part V, Truth-Table Construction (Items 25–26)

25. Construct the full truth table for (P ∧ Q) → P. Classify it as a tautology, contradiction, or contingency.
26. Construct the full truth table for ¬P ∨ (Q ∧ P). Classify it, and name one familiar formula it is logically equivalent to.

### Part VI, Set Computations (Items 27–30)

For items 27–29, use U = {1,2,3,4,5,6,7,8}, A = {1,2,3,4}, B = {2,4,6,8}.

27. Find A ∪ B.
28. Find A − B.
29. Find (A ∪ B)'.
30. In a class of 80 students, 45 like basketball, 30 like volleyball, and 12 like both. How many like at least one of the two sports? How many like neither?
$md$, 3);

-- ============================================================
-- SECTION 4 (activity): Prelim Mock Exam B, 30 Items
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('b1000001-0001-0002-0001-0000000000e1','activity','Prelim Mock Exam B, 30 Items',$md$
Same scope as Mock A (Lessons 1–4), all-new items, a notch harder. One sitting, 60 minutes, no notes.

### Part I, Multiple Choice (Items 1–10)

1. Which of the following is NOT a proposition?
   a. "8 + 7 = 13"  b. "1 is an even number"  c. "x + 2 = 7"  d. "A grizzly is a bear"

2. "It is not the case that today is not Monday" simplifies to "Today is Monday" by which law?
   a. De Morgan's  b. Involution  c. Exportation  d. Idempotence

3. Let R = "You may ride," T = "You have a ticket." "You may ride only if you have a ticket" is:
   a. T → R  b. R → T  c. R ↔ T  d. R ∧ T

4. The inverse of P → Q is:
   a. Q → P  b. ¬Q → ¬P  c. ¬P → ¬Q  d. P ↔ Q

5. Which pair is logically equivalent?
   a. P → Q and Q → P  b. P → Q and ¬P → ¬Q  c. P → Q and ¬Q → ¬P  d. P ∧ Q and P ∨ Q

6. If P is false, then P → (Q ∧ ¬Q) is:
   a. true  b. false  c. sometimes true, sometimes false  d. not well-formed

7. ¬(P → Q) is logically equivalent to:
   a. ¬P → ¬Q  b. P ∧ ¬Q  c. ¬P ∨ Q  d. ¬P ∧ Q

8. In the 4-row truth table of P ↔ Q, how many rows come out true?
   a. 1  b. 2  c. 3  d. 4

9. The negation of "All programs compile" is:
   a. "No programs compile"  b. "All programs do not compile"  c. "Some program does not compile"  d. "Some program compiles"

10. Let S(x) = "x is a student," O(x) = "x attends online classes." ∃x[S(x) ∧ ¬O(x)] reads:
    a. "All students attend online classes"  b. "Some students do not attend online classes"  c. "No students attend online classes"  d. "Some non-students attend online classes"

### Part II, True or False (Items 11–15)

11. ((P ∧ Q) → R) ≡ (P → (Q → R)) is the Exportation law.
12. P ∨ TRUE ≡ P.
13. An argument is valid exactly when the conditional [(all premises conjoined) → conclusion] is a tautology.
14. |{1, 2, 2, 3, 3, 3}| = 6.
15. A × B = B × A for all sets A and B.

### Part III, Translation (Items 16–20)

16. Let D = "Mia debugs," T = "Mia tests," S = "The app ships." Symbolize: "If Mia debugs and tests, then the app ships."
17. Let P = "The printer works," S = "The scanner works." Symbolize: "Neither the printer nor the scanner works."
18. Let C = "You pass the course," P = "You pass the prelim." Symbolize: "Passing the prelim is a necessary condition for passing the course."
19. Let A = "The alarm rang," B = "The backup ran." Write ¬(A ∧ B) as an English sentence.
20. Let L(x) = "x is a laptop," C(x) = "x is cheap," D(x) = "x is durable." Symbolize: "Some laptops are neither cheap nor durable."

### Part IV, Identify the Rule or Law (Items 21–24)

21. (P → Q) ∧ (R → S), P ∨ R ∴ Q ∨ S
22. P ∴ P ∨ Q
23. P ∧ Q ∴ P
24. In a proof, a step moves from ¬(P ∨ Q) to ¬P ∧ ¬Q. Which law justifies it?

### Part V, Truth-Table Construction (Items 25–26)

25. Construct the full truth table for (P → Q) ∧ (Q → P), then compare its final column with the truth table of P ↔ Q. What do you conclude, and which named equivalence law says so?
26. Construct the full 8-row truth table for (P ∨ Q) → R. Classify it as a tautology, contradiction, or contingency.

### Part VI, Set Computations (Items 27–30)

For items 27–29, use U = {1,2,...,10}, A = {2,4,6,8,10}, B = {1,2,3,4,5}.

27. Find A' ∩ B.
28. Find A − B and B − A. Are they equal?
29. Compute both sides of (A ∩ B)' = A' ∪ B' and confirm they match.
30. Among 120 students: 60 take Java, 50 take Python, 40 take C++; 20 take Java and Python, 15 take Java and C++, 10 take Python and C++; 5 take all three. How many take at least one language? How many take none?
$md$, 4);

-- ============================================================
-- SECTION 5 (activity): Prelim Mock Exams, Answer Key
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('b1000001-0001-0002-0001-0000000000e1','activity','Prelim Mock Exams, Answer Key with Explanations',$md$
Mark your mocks honestly. Every wrong item points at a specific lesson section to re-read.

## Mock Exam A, Key

### Part I

1. **b.** "5 + 9 = 14" is a declarative statement with a definite truth value (true). A command, a question, and an open sentence with a free variable are not propositions.
2. **b.** The conditional's only false row is antecedent true, consequent false.
3. **c.** The ¬ is confined to (P ∨ Q); the arrow joins the two largest parts, so → is the main connective.
4. **a.** The biconditional is true when both sides match (T,T or F,F).
5. **c.** 2⁴ = 16 rows.
6. **b.** Material Implication: P → Q ≡ ¬P ∨ Q.
7. **c.** Contrapositive negates both parts and swaps them: ¬Q → ¬P.
8. **c.** One of P, ¬P is always true, so the disjunction is always true, a tautology.
9. **b.** "Some A are B" pairs ∃ with ∧: ∃x[D(x) ∧ F(x)].
10. **b.** ∀ with → is the "All A are B" pattern.

### Part II

11. **False.** ¬P → ¬Q is the inverse. The converse is Q → P.
12. **True.** Order does not matter for ∧.
13. **False.** A contingency's final column has both T and F. All-T is a tautology.
14. **True.** |A × B| = |A| × |B| = 5 × 3 = 15.
15. **False.** De Morgan's gives ¬(P ∧ Q) ≡ ¬P ∨ ¬Q, the connective flips.

### Part III

16. **A ∧ B.** "But" is a conjunction keyword.
17. **D → ¬S.** "Cannot submit" is the negation of "we can submit."
18. **P ↔ R.** "If and only if" is the biconditional.
19. **"If Rina reviews, then she does not relax."**
20. **∀x[F(x) → T(x)].**

### Part IV

21. **Modus Ponens.** Conditional plus its antecedent yields the consequent.
22. **Modus Tollens.** Conditional plus negated consequent yields the negated antecedent.
23. **Disjunctive Syllogism.** A disjunction with one side denied leaves the other side.
24. **Hypothetical Syllogism.** Conditionals chain: P → Q and Q → R give P → R.

### Part V

25. Full table for (P ∧ Q) → P:

| P | Q | P ∧ Q | (P ∧ Q) → P |
|---|---|---|---|
| T | T | T | T |
| T | F | F | T |
| F | T | F | T |
| F | F | F | T |

    All T, so it is a **tautology**. (A false antecedent in rows 2–4 makes the conditional true automatically.)

26. Full table for ¬P ∨ (Q ∧ P):

| P | Q | ¬P | Q ∧ P | ¬P ∨ (Q ∧ P) |
|---|---|---|---|---|
| T | T | F | T | T |
| T | F | F | F | F |
| F | T | T | F | T |
| F | F | T | F | T |

    The final column has both T and F, so it is a **contingency**. Its column T, F, T, T is exactly the column of **P → Q**, so the two are logically equivalent.

### Part VI

27. **A ∪ B = {1, 2, 3, 4, 6, 8}.** Merge both sets, list each element once.
28. **A − B = {1, 3}.** Remove from A everything that also appears in B (2 and 4 go).
29. **(A ∪ B)' = {5, 7}.** From item 27, A ∪ B misses only 5 and 7 in U.
30. |B ∪ V| = 45 + 30 − 12 = **63** like at least one. Neither: 80 − 63 = **17**.

## Mock Exam B, Key

### Part I

1. **c.** "x + 2 = 7" has a free variable, so it has no fixed truth value. The others are propositions (true or false, but definite).
2. **b.** Involution: ¬¬P ≡ P. The sentence is the double negation of "Today is Monday."
3. **b.** "Only if" introduces the consequent, so the ticket goes after the arrow: R → T.
4. **c.** The inverse negates both sides without swapping: ¬P → ¬Q.
5. **c.** A conditional is equivalent to its contrapositive ¬Q → ¬P. (Converse and inverse are not equivalent to it.)
6. **a.** False antecedent makes any conditional true, even one with a contradiction as its consequent.
7. **b.** Derivation: ¬(P → Q) ≡ ¬(¬P ∨ Q) (Material Implication) ≡ ¬¬P ∧ ¬Q (De Morgan's) ≡ P ∧ ¬Q (Involution).
8. **b.** True on T,T and F,F, two rows.
9. **c.** Denying "all" requires only one counterexample: some program fails to compile. "No programs compile" claims far more than the negation needs.
10. **b.** There exists a student who does not attend online classes.

### Part II

11. **True.** That is Exportation exactly as stated in the equivalence table.
12. **False.** The Identity law says P ∨ TRUE ≡ TRUE, not P.
13. **True.** That is the truth-table validity test from Lesson 2.
14. **False.** Sets hold distinct elements: the set is {1, 2, 3}, so cardinality is 3.
15. **False.** Cartesian products are sets of ordered pairs; (1, a) is not (a, 1). Equality holds only in special cases, not in general.

### Part III

16. **(D ∧ T) → S.** The "and" belongs inside the antecedent.
17. **¬P ∧ ¬S** (equivalently ¬(P ∨ S) by De Morgan's). "Neither...nor" denies both.
18. **C → P.** A necessary condition sits in the consequent: passing the course guarantees you passed the prelim.
19. **"It is not the case that both the alarm rang and the backup ran."** (Equivalently: "The alarm did not ring, or the backup did not run.")
20. **∃x[L(x) ∧ ¬C(x) ∧ ¬D(x)].** "Some" gives ∃ with ∧; "neither cheap nor durable" negates both predicates.

### Part IV

21. **Constructive Dilemma.**
22. **Addition.** From P you may weaken to P ∨ Q.
23. **Simplification.** A conjunction yields either conjunct.
24. **De Morgan's law.** Negation of a disjunction becomes a conjunction of negations.

### Part V

25. Full table:

| P | Q | P → Q | Q → P | (P → Q) ∧ (Q → P) | P ↔ Q |
|---|---|---|---|---|---|
| T | T | T | T | T | T |
| T | F | F | T | F | F |
| F | T | T | F | F | F |
| F | F | T | T | T | T |

    The last two columns are identical, so (P → Q) ∧ (Q → P) ≡ P ↔ Q. The named law is **Material Equivalence**.

26. Full 8-row table for (P ∨ Q) → R:

| P | Q | R | P ∨ Q | (P ∨ Q) → R |
|---|---|---|---|---|
| T | T | T | T | T |
| T | T | F | T | F |
| T | F | T | T | T |
| T | F | F | T | F |
| F | T | T | T | T |
| F | T | F | T | F |
| F | F | T | F | T |
| F | F | F | F | T |

    Mixed T and F, so it is a **contingency**.

### Part VI

27. A' = {1, 3, 5, 7, 9}, so **A' ∩ B = {1, 3, 5}**.
28. **A − B = {6, 8, 10}** and **B − A = {1, 3, 5}**. Not equal, set difference depends on order.
29. Left side: A ∩ B = {2, 4}, so (A ∩ B)' = **{1, 3, 5, 6, 7, 8, 9, 10}**. Right side: A' = {1, 3, 5, 7, 9}, B' = {6, 7, 8, 9, 10}, so A' ∪ B' = **{1, 3, 5, 6, 7, 8, 9, 10}**. They match, De Morgan's law confirmed.
30. Inclusion-exclusion for three sets: 60 + 50 + 40 − 20 − 15 − 10 + 5 = **110** take at least one. None: 120 − 110 = **10**.
$md$, 5);

-- ============================================================
-- SECTION 6 (activity): Common Prelim Traps
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('b1000001-0001-0002-0001-0000000000e1','activity','Common Prelim Traps & How to Avoid Them',$md$
These are the confusions that quietly kill prelim scores. Each trap comes with a one-minute drill, answer it before reading the solution.

### Trap 1, Converse vs. Inverse vs. Contrapositive

Students scramble the three forms because all of them "look like the original." Fix it with the memory hook: **converse swaps, inverse negates, contrapositive does both**, and only the contrapositive is equivalent to the original.

**Drill:** For "If n is divisible by 4, then n is even," write the converse, inverse, and contrapositive. Which one is logically equivalent to the original?

**Answer:** Converse: "If n is even, then n is divisible by 4." Inverse: "If n is not divisible by 4, then n is not even." Contrapositive: "If n is not even, then n is not divisible by 4." Only the **contrapositive** is equivalent. (Notice the converse is actually false, 6 is even but not divisible by 4.)

### Trap 2, "False Antecedent" Panic

Many students mark P → Q false whenever anything in it is false. Wrong: the conditional has exactly one false row, P true, Q false. When P is false, the conditional is true no matter what Q is.

**Drill:** P is false and Q is true. Evaluate P → Q and Q → P.

**Answer:** P → Q is **true** (false antecedent). Q → P is **false** (true antecedent, false consequent). This also shows a conditional and its converse can disagree.

### Trap 3, Pushing ¬ Inside Without Flipping

¬(P ∧ Q) is not ¬P ∧ ¬Q. De Morgan's law flips the connective: negation of a conjunction is a disjunction of negations, and vice versa.

**Drill:** Negate "The code compiles and the tests pass."

**Answer:** "The code does not compile **or** the tests do not pass." Symbolically: ¬(C ∧ T) ≡ ¬C ∨ ¬T. If you wrote "and," you claimed both fail, much stronger than the actual negation.

### Trap 4, Negating "All" and "Some" Statements

The negation of "All A are B" is not "No A are B." One counterexample is enough to falsify an "all" claim, so the negation is a "some ... not" statement. Likewise, negating "Some A are B" gives "All A are not B."

**Drill:** Negate (a) "All modules are graded" and (b) "Some students commute."

**Answer:** (a) "**Some module is not graded**", ∃x ¬G(x) territory, not "no modules are graded." (b) "**No student commutes**," i.e., every student does not commute.

### Trap 5, "Only If" Points the Wrong Way

"P only if Q" tempts you to write Q → P. It is the opposite: **"only if" introduces the consequent**, so "P only if Q" is P → Q. Related hook: a **sufficient** condition sits before the arrow; a **necessary** condition sits after it.

**Drill:** Let C = "You get the certificate," F = "You finish the course." Symbolize "You get the certificate only if you finish the course." Which letter is the antecedent?

**Answer:** **C → F**, and the antecedent is C. Finishing is the necessary condition, so it lands in the consequent.

### Trap 6, Treating A − B Like It Commutes

Set difference is directional: A − B keeps what is in A and throws out anything that is also in B. Swapping the order changes the answer almost every time.

**Drill:** A = {1, 2, 3, 4}, B = {3, 4, 5}. Find A − B and B − A.

**Answer:** A − B = **{1, 2}**; B − A = **{5}**. Different sets, never assume symmetry.

### Trap 7, Cardinality Miscounts

Two classic slips: counting duplicates (sets hold distinct elements), and adding instead of multiplying for Cartesian products.

**Drill:** (a) Find |{a, a, b, c, c, c}|. (b) If |A| = 3 and |B| = 2, find |A × B|.

**Answer:** (a) The set is {a, b, c}, so cardinality is **3**. (b) |A × B| = 3 × 2 = **6** ordered pairs, multiply, never add.

### Trap 8, Forgetting the Overlap in Inclusion-Exclusion

Adding |A| + |B| double-counts everyone in both sets. Always subtract |A ∩ B| once; for "how many in neither," subtract the union from the total.

**Drill:** In a block of 40 students, 25 like math quizzes, 22 like coding drills, and 12 like both. How many like at least one? How many like neither?

**Answer:** |A ∪ B| = 25 + 22 − 12 = **35** like at least one; 40 − 35 = **5** like neither. If you got 47, you forgot the subtraction, and 47 students in a block of 40 should have set off alarms.
$md$, 6);

-- ============================================================
-- SECTION 7 (activity): Final Exam Blueprint & Rapid Review
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('b1000001-0001-0002-0001-0000000000e1','activity','Final Exam Blueprint & Rapid Review Sheet',$md$
The final is cumulative over all nine lessons, but the weight sits on the second half of the course. Plan accordingly.

### Coverage and Weights

| Lessons | Typical Weight | What Gets Tested |
|---|---|---|
| Lessons 1–4 (logic, proofs, quantifiers, sets) | 25% | Quick items: rule identification, one translation, one set computation, contrapositive |
| Lesson 5: Relations and Their Properties | 15% | Classify relations (reflexive/symmetric/antisymmetric/transitive), partial orders, function evaluation, composition, pigeonhole |
| Lesson 6: Basic Counting Principles | 20% | Sum rule vs. product rule, permutations, combinations, repetition variants |
| Lesson 7: Summation and Series | 15% | Arithmetic and geometric progressions, sigma evaluation, series sums, Fibonacci |
| Lesson 8: Mathematical Induction | 10% | One full induction proof plus concept questions on the two steps |
| Lesson 9: Introduction to Graphs | 15% | Terminology, handshaking theorem, degree counts, trees |

### Rapid Review Sheet

#### Lessons 1–4 in Four Lines

- P → Q is false only on T → F; equivalent to ¬P ∨ Q and to its contrapositive ¬Q → ¬P.
- De Morgan's: ¬(P ∧ Q) ≡ ¬P ∨ ¬Q; ¬(P ∨ Q) ≡ ¬P ∧ ¬Q. Same shape for sets with ∪/∩.
- "All A are B": ∀x[A(x) → B(x)]. "Some A are B": ∃x[A(x) ∧ B(x)].
- |A ∪ B| = |A| + |B| − |A ∩ B|; |A × B| = |A| × |B|.

#### Lesson 5, Relation Property Tests

| Property | Test |
|---|---|
| Reflexive | Every (a, a) is in R, self-loop at every vertex of the digraph |
| Symmetric | (a, b) in R forces (b, a) in R |
| Antisymmetric | (a, b) and (b, a) both in R forces a = b |
| Transitive | (a, b) and (b, c) in R forces (a, c) in R |
| Partial order | Reflexive + antisymmetric + transitive (the set is then a poset) |

Functions: (f ∘ g)(x) = f(g(x)), apply g first. In general f ∘ g ≠ g ∘ f. Pigeonhole: n + 1 objects into n containers means some container holds at least two.

#### Lesson 6, Counting Formulas

| Situation | Formula |
|---|---|
| Either/or (disjoint options) | Sum rule: n₁ + n₂ |
| Sequential steps | Product rule: n₁ × n₂ |
| Ordered selection, no repetition | P(n, r) = n! / (n − r)! |
| Ordered selection, repetition allowed | nʳ |
| Unordered selection, no repetition | C(n, r) = n! / (r! × (n − r)!) |
| Unordered selection, repetition allowed | C(n + r − 1, r) |

Decision hook: order matters → permutation; order irrelevant → combination.

#### Lesson 7, Sequences and Series

| Item | Formula |
|---|---|
| Arithmetic nth term | aₙ = a₁ + d(n − 1) |
| Arithmetic series sum | S = n × (a₁ + aₙ) / 2 |
| Geometric nth term | aₙ = a · r⁽ⁿ⁻¹⁾ |
| Geometric series sum | S = a × (rⁿ − 1) / (r − 1) |
| Standard sums | ∑ 1 (i = 1 to n) = n; ∑ i (i = 1 to n) = n(n + 1)/2 |
| Fibonacci | xₙ = xₙ₋₁ + xₙ₋₂, starting 0, 1, 1, 2, 3, 5, 8, ... |

#### Lesson 8, Induction Template

Write this skeleton for every induction item:

1. **Basis Step:** verify P(1) by direct computation of both sides.
2. **Inductive Hypothesis:** "Assume P(k) holds for an arbitrary k," and write out what P(k) says.
3. **Inductive Step:** start from the P(k + 1) statement, substitute the hypothesis, and simplify algebraically until the target form appears.
4. **Conclusion:** "By mathematical induction, P(n) holds for all n ≥ 1."

Graders award the "assume P(k)" line and the substitution line, never skip writing them.

#### Lesson 9, Graph Facts

- Handshaking theorem: sum of all deg(v) = 2m, where m = number of edges.
- Corollary: the number of odd-degree vertices is always even.
- A loop contributes 2 to its vertex's degree. In digraphs, degree = in-degree + out-degree.
- A tree with n vertices has exactly n − 1 edges and exactly one path between any two vertices.
- Adjacency matrix of an undirected graph is symmetric; adjacency lists suit sparse graphs.

### How to Spend Your Final-Week Time

Weight your review like the exam: two sessions on counting (Lesson 6), one full induction proof written out by hand daily (Lesson 8 is few points but all-or-nothing), one session each on relations, series, and graphs, and a single fast pass over Lessons 1–4 using the prelim traps section.
$md$, 7);

-- ============================================================
-- SECTION 8 (activity): Final Mock Exam A, 30 Items
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('b1000001-0001-0002-0001-0000000000e1','activity','Final Mock Exam A, 30 Items',$md$
Cumulative, weighted to Lessons 5–9. One sitting, 90 minutes, no notes. Show full working on computation and proof items, that is where partial credit lives.

### Part I, Multiple Choice (Items 1–10)

1. The contrapositive of "If n is even, then n² is even" is:
   a. "If n² is even, then n is even"  b. "If n is not even, then n² is not even"  c. "If n² is not even, then n is not even"  d. "n is even and n² is not even"

2. Which rule of inference is P → Q, ¬Q ∴ ¬P?
   a. Modus Ponens  b. Modus Tollens  c. Disjunctive Syllogism  d. Addition

3. |A ∪ B| = |A| + |B| − |A ∩ B| is called:
   a. De Morgan's law  b. the product rule  c. the inclusion-exclusion principle  d. the handshaking theorem

4. R = {(1,1), (2,2), (3,3), (1,2)} on {1, 2, 3}. Which property does R fail?
   a. Reflexive  b. Symmetric  c. Antisymmetric  d. Transitive

5. (f ∘ g)(x) means:
   a. f(x) · g(x)  b. g(f(x))  c. f(g(x))  d. f(x) + g(x)

6. P(6, 2) equals:
   a. 15  b. 30  c. 36  d. 12

7. C(6, 2) equals:
   a. 15  b. 30  c. 36  d. 12

8. The common difference of {7, 3, −1, −5, ...} is:
   a. 4  b. −4  c. 3  d. −3

9. The first step of a mathematical induction proof is called the:
   a. Inductive Step  b. Basis Step  c. Inductive Hypothesis  d. Conclusion

10. A tree with 25 vertices has how many edges?
    a. 25  b. 26  c. 24  d. 50

### Part II, True or False (Items 11–15)

11. Every partial order is reflexive, antisymmetric, and transitive.
12. C(n, r) counts ordered selections of r items from n.
13. The Fibonacci sequence satisfies xₙ = xₙ₋₁ + xₙ₋₂.
14. Verifying P(1), P(2), and P(3) is enough to prove that P(n) holds for every natural number n.
15. A graph can have exactly three vertices of odd degree.

### Part III, Computation (Items 16–24)

16. Let f(x) = 2x² − 3x + 1. Find f(−2).
17. Let f(x) = 3x − 2 and g(x) = x². Find (f ∘ g)(2) and (g ∘ f)(2).
18. A drawer holds 12 blue socks and 12 black socks, and you pull socks in the dark. How many must you pull to guarantee a matching pair? Name the principle.
19. How many 4-digit PINs can be formed from digits 0–9 if digits may repeat?
20. How many ways can 5 books from a collection of 9 be arranged on a shelf?
21. How many 4-person committees can be formed from 11 people?
22. Evaluate: ∑ (2i + 1) for i = 1 to 6.
23. Find the sum of the arithmetic series 5 + 8 + 11 + ... + 62. (First find how many terms it has.)
24. A geometric progression has a = 3 and r = 2. Find its 8th term.

### Part IV, Graphs (Items 25–27)

25. A graph has 12 vertices, each of degree 5. How many edges does it have? Name the theorem you used.
26. What special structural property does the adjacency matrix of an undirected graph always have?
27. In a directed graph, a vertex has in-degree 3 and out-degree 2. What is its total degree?

### Part V, Proofs (Items 28–30)

28. **Guided induction.** Prove that 1 + 2 + 3 + ... + n = n(n + 1)/2 for all natural numbers n, by completing each step:
    a. State and verify the Basis Step.
    b. State the Inductive Hypothesis for an arbitrary k.
    c. Carry out the Inductive Step: show the formula holds for k + 1, and state the conclusion.

29. A classmate writes this proof that 2 + 4 + 6 + ... + 2n = n(n + 1):
    - Line 1: For n = 1, LHS = 2 and RHS = 1 × 2 = 2, so the claim holds.
    - Line 2: Assume 2 + 4 + ... + 2k = k(k + 1) for an arbitrary natural number k.
    - Line 3: Then 2 + 4 + ... + 2k + 2(k + 1) = k(k + 1) + 2(k + 1) = (k + 1)(k + 2), which is the claim for k + 1.
    Which line is the inductive hypothesis, and what proof technique names Lines 1 and 3?

30. Give a direct proof: if m and n are both even integers, then m + n is even.
$md$, 8);

-- ============================================================
-- SECTION 9 (activity): Final Mock Exam B, 30 Items
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('b1000001-0001-0002-0001-0000000000e1','activity','Final Mock Exam B, 30 Items',$md$
All-new items, same cumulative scope weighted to Lessons 5–9. One sitting, 90 minutes, no notes.

### Part I, Multiple Choice (Items 1–10)

1. ¬(P ∨ Q) is logically equivalent to:
   a. ¬P ∨ ¬Q  b. ¬P ∧ ¬Q  c. P ∧ Q  d. ¬P → ¬Q

2. Let I(x) = "x is an integer," P(x) = "x is prime." "Some integers are prime" is:
   a. ∀x[I(x) → P(x)]  b. ∃x[I(x) ∧ P(x)]  c. ∃x[I(x) → P(x)]  d. ∀x[I(x) ∧ P(x)]

3. The relation ≤ on the integers is reflexive, antisymmetric, and transitive. It is therefore a:
   a. symmetric relation  b. partial order  c. contradiction  d. multigraph

4. Which relation on {1, 2, 3} is symmetric?
   a. {(1,2), (2,1), (3,3)}  b. {(1,2), (2,3)}  c. {(1,1), (1,2)}  d. {(1,3), (2,3), (3,3)}

5. How many 2-letter codes can be made from the letters A, B, C, D, E with no repetition?
   a. 10  b. 25  c. 20  d. 24

6. How many ways can you choose 3 toppings from 8 available toppings (order irrelevant)?
   a. 336  b. 56  c. 24  d. 512

7. The common ratio of {2, −6, 18, −54, ...} is:
   a. 3  b. −3  c. −4  d. 12

8. An arithmetic progression has a₁ = 4 and d = 6. Its 15th term is:
   a. 88  b. 90  c. 94  d. 84

9. To prove 2ⁿ > n for all n ≥ 1 by induction, the Inductive Step must show:
   a. 2¹ > 1  b. 2ᵏ > k for every k  c. assuming 2ᵏ > k, that 2ᵏ⁺¹ > k + 1  d. that 2ⁿ grows quickly

10. What distinguishes a multigraph from a simple graph?
    a. Directed edges  b. Weighted edges  c. Multiple edges allowed between the same pair of vertices  d. Disconnected components

### Part II, True or False (Items 11–15)

11. (A ∪ B)' = A' ∩ B' for all sets A and B in a universal set U.
12. f ∘ g = g ∘ f for all functions f and g.
13. The number of ordered selections of r items from n items with repetition allowed is nʳ.
14. ∑ 1 for i = 1 to n equals n.
15. A loop contributes 1 to the degree of its vertex.

### Part III, Computation (Items 16–24)

16. R = {(1,1), (2,2), (3,3), (1,3), (3,1)} on {1, 2, 3}. Determine whether R is reflexive, symmetric, antisymmetric, and transitive, check all four, with reasons.
17. Let g(x) = (x + 3)/(x − 2). Find g(5), and explain why g(2) is undefined.
18. Let f(x) = x + 4 and g(x) = 2x − 1. Find (f ∘ g)(x) and (g ∘ f)(x).
19. How many people must be in a room to guarantee that at least two share a birth month? Name the principle.
20. A license plate has 3 letters (A–Z) followed by 2 digits (0–9), all repeatable. How many plates are possible?
21. A club has 7 men and 6 women. (a) How many ways to choose 1 leader of any gender? (b) How many ways to choose a pair of 1 man and 1 woman?
22. An ice cream stand offers 5 flavors. How many ways can you choose 3 scoops if repetition is allowed and order does not matter?
23. Evaluate: ∑ (4j − 3) for j = 2 to 5.
24. A geometric progression has a = 2 and r = 3. Find the sum of its first 6 terms.

### Part IV, Graphs (Items 25–27)

25. A graph has 21 edges. What is the sum of the degrees of all its vertices?
26. A tree has 500 edges. How many vertices does it have?
27. A graph has five vertices with degrees 3, 3, 2, 2, 2. How many edges does it have, and why is this degree list consistent with the handshaking corollary?

### Part V, Proofs (Items 28–30)

28. Prove by mathematical induction: 1 + 3 + 5 + ... + (2n − 1) = n² for all natural numbers n.
29. Prove by mathematical induction: 4ⁿ − 1 is divisible by 3 for all natural numbers n.
30. Prove by contrapositive: if n² is even, then n is even.
$md$, 9);

-- ============================================================
-- SECTION 10 (activity): Final Mock Exams, Answer Key
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('b1000001-0001-0002-0001-0000000000e1','activity','Final Mock Exams, Answer Key with Explanations',$md$
Full working for every item. If a computation item cost you points, redo it from scratch before reading the solution a second time.

## Final Mock A, Key

### Part I

1. **c.** Contrapositive: negate both parts and swap. "If n² is not even, then n is not even."
2. **b.** Modus Tollens: denying the consequent denies the antecedent.
3. **c.** Inclusion-exclusion, the subtraction removes the double-counted overlap.
4. **b.** (1, 2) is in R but (2, 1) is not, so symmetry fails. Reflexive holds (all three self-pairs present); antisymmetric holds (no two-way pair between distinct elements); transitive holds, the only nontrivial chains, such as (1, 1)(1, 2) and (1, 2)(2, 2), give (1, 2), which is in R.
5. **c.** Apply g first, then f: f(g(x)).
6. **b.** P(6, 2) = 6!/4! = 6 × 5 = 30.
7. **a.** C(6, 2) = 30/2! = 15.
8. **b.** d = 3 − 7 = −4, and each later gap confirms it.
9. **b.** Basis Step first, Inductive Step second.
10. **c.** A tree with n vertices has n − 1 edges: 24.

### Part II

11. **True.** That triple of properties is the definition of a partial order.
12. **False.** Combinations ignore order; P(n, r) counts ordered selections.
13. **True.** Each term is the sum of the two before it.
14. **False.** Finitely many checks show a pattern but prove nothing about all n, that is exactly why the Inductive Step exists.
15. **False.** The handshaking corollary: the count of odd-degree vertices is always even, so exactly three is impossible.

### Part III

16. f(−2) = 2(−2)² − 3(−2) + 1 = 2(4) + 6 + 1 = **15**.
17. (f ∘ g)(2) = f(g(2)) = f(4) = 3(4) − 2 = **10**. (g ∘ f)(2) = g(f(2)) = g(4) = 4² = **16**. Different answers, composition order matters.
18. **3 pulls.** With 2 colors (containers), 3 socks force two of the same color. This is the **pigeonhole principle**.
19. Product rule with repetition: 10⁴ = **10,000** PINs.
20. Ordered arrangement without repetition: P(9, 5) = 9 × 8 × 7 × 6 × 5 = **15,120**.
21. Order irrelevant: C(11, 4) = 11!/(4! × 7!) = (11 × 10 × 9 × 8)/24 = 7,920/24 = **330**.
22. ∑ (2i + 1) = 2 ∑ i + ∑ 1 = 2 × (6 × 7 / 2) + 6 = 42 + 6 = **48**. (Direct check: 3 + 5 + 7 + 9 + 11 + 13 = 48.)
23. Number of terms: 62 = 5 + 3(n − 1), so 3(n − 1) = 57, n − 1 = 19, n = **20**. Sum: S = n(a₁ + aₙ)/2 = 20 × (5 + 62)/2 = 20 × 33.5 = **670**.
24. a₈ = a · r⁷ = 3 × 2⁷ = 3 × 128 = **384**.

### Part IV

25. Handshaking theorem: sum of degrees = 12 × 5 = 60 = 2m, so m = **30 edges**.
26. It is **symmetric**, entry (i, j) equals entry (j, i), because an undirected edge runs both ways.
27. Total degree = in-degree + out-degree = 3 + 2 = **5**.

### Part V

28. **Complete proof.**
    a. **Basis Step (n = 1):** LHS = 1. RHS = 1 × 2 / 2 = 1. Equal, so P(1) holds.
    b. **Inductive Hypothesis:** assume for an arbitrary natural number k that 1 + 2 + ... + k = k(k + 1)/2.
    c. **Inductive Step:** consider n = k + 1.
       1 + 2 + ... + k + (k + 1)
       = k(k + 1)/2 + (k + 1)   (by the hypothesis)
       = (k + 1)(k/2 + 1)
       = (k + 1)(k + 2)/2,
       which is exactly the formula with n = k + 1. By mathematical induction, the formula holds for all natural numbers n.
29. **Line 2** is the inductive hypothesis. Line 1 is the **Basis Step** and Line 3 is the **Inductive Step**, together they form a proof by mathematical induction.
30. **Direct proof.** Let m and n be even, so m = 2a and n = 2b for integers a, b. Then m + n = 2a + 2b = 2(a + b). Since a + b is an integer, m + n is twice an integer, hence even.

## Final Mock B, Key

### Part I

1. **b.** De Morgan's law: ¬(P ∨ Q) ≡ ¬P ∧ ¬Q.
2. **b.** "Some A are B" pairs ∃ with ∧.
3. **b.** Reflexive + antisymmetric + transitive is a partial order (making the integers a poset under ≤).
4. **a.** Every pair present has its reverse: (1,2)/(2,1), and (3,3) is its own reverse. Each other option contains a pair whose reverse is missing.
5. **c.** P(5, 2) = 5 × 4 = 20.
6. **b.** C(8, 3) = (8 × 7 × 6)/6 = 56.
7. **b.** r = −6/2 = −3 (check: 18/−6 = −3).
8. **a.** a₁₅ = a₁ + d(n − 1) = 4 + 6 × 14 = 88.
9. **c.** The Inductive Step always has the shape "assume P(k), derive P(k + 1)."
10. **c.** Multigraphs allow multiple edges between the same pair; simple graphs forbid them (and self-loops).

### Part II

11. **True.** De Morgan's law for sets.
12. **False.** Composition is generally not commutative, Lesson 5's own example: g(x) = 2x, f(x) = x + 1 gives g ∘ f(1) = 4 but f ∘ g(1) = 3.
13. **True.** Each of the r positions has n independent choices.
14. **True.** Adding 1 to itself n times gives n.
15. **False.** A loop contributes **2** to its vertex's degree.

### Part III

16. **Reflexive: yes**, (1,1), (2,2), (3,3) are all present. **Symmetric: yes**, (1,3) and (3,1) are both present; every other pair is a self-pair. **Antisymmetric: no**, (1,3) and (3,1) are both in R but 1 does not equal 3. **Transitive: yes**, check the chains: (1,3)(3,1) gives (1,1) which is in R; (3,1)(1,3) gives (3,3) which is in R; (1,3)(3,3) gives (1,3); (3,1)(1,1) gives (3,1); chains through self-pairs give back the original pairs. All required pairs are present.
17. g(5) = (5 + 3)/(5 − 2) = **8/3**. g(2) is **undefined** because the denominator x − 2 becomes 0, and division by zero is not allowed.
18. (f ∘ g)(x) = f(2x − 1) = (2x − 1) + 4 = **2x + 3**. (g ∘ f)(x) = g(x + 4) = 2(x + 4) − 1 = **2x + 7**.
19. **13 people.** Twelve months are the containers; 12 + 1 = 13 people force two into the same month. This is the **pigeonhole principle**.
20. Product rule: 26 × 26 × 26 × 10 × 10 = 17,576 × 100 = **1,757,600** plates.
21. (a) One leader from either group is an either/or choice, sum rule: 7 + 6 = **13** ways. (b) Sequential choices, product rule: 7 × 6 = **42** pairs.
22. Combination with repetition: C(n + r − 1, r) = C(5 + 3 − 1, 3) = C(7, 3) = (7 × 6 × 5)/6 = **35**.
23. Terms: j = 2 gives 5; j = 3 gives 9; j = 4 gives 13; j = 5 gives 17. Sum = 5 + 9 + 13 + 17 = **44**.
24. S = a(rⁿ − 1)/(r − 1) = 2(3⁶ − 1)/(3 − 1) = 2 × 728/2 = **728**. (Check: 2 + 6 + 18 + 54 + 162 + 486 = 728.)

### Part IV

25. Handshaking theorem: sum of degrees = 2m = 2 × 21 = **42**.
26. A tree with n vertices has n − 1 edges, so n = 500 + 1 = **501 vertices**.
27. Sum of degrees = 3 + 3 + 2 + 2 + 2 = 12 = 2m, so m = **6 edges**. The list has exactly two odd-degree vertices (the two 3s), and two is an even count, consistent with the corollary that odd-degree vertices always come in even numbers.

### Part V

28. **Complete proof.**
    **Basis Step (n = 1):** LHS = 1 (the single term 2 × 1 − 1). RHS = 1² = 1. Equal, so P(1) holds.
    **Inductive Hypothesis:** assume 1 + 3 + 5 + ... + (2k − 1) = k² for an arbitrary natural number k.
    **Inductive Step:** for n = k + 1, the next odd term is 2(k + 1) − 1 = 2k + 1:
    1 + 3 + ... + (2k − 1) + (2k + 1)
    = k² + (2k + 1)   (by the hypothesis)
    = k² + 2k + 1
    = (k + 1)²,
    which is the formula for k + 1. By mathematical induction, the identity holds for all natural numbers n.
29. **Complete proof.**
    **Basis Step (n = 1):** 4¹ − 1 = 3, which is divisible by 3. P(1) holds.
    **Inductive Hypothesis:** assume 4ᵏ − 1 is divisible by 3, i.e., 4ᵏ − 1 = 3t for some integer t.
    **Inductive Step:** consider n = k + 1:
    4ᵏ⁺¹ − 1 = 4 × 4ᵏ − 1 = 4(4ᵏ − 1) + 4 − 1 = 4(3t) + 3 = 3(4t + 1).
    Since 4t + 1 is an integer, 4ᵏ⁺¹ − 1 is divisible by 3. By mathematical induction, 4ⁿ − 1 is divisible by 3 for all natural numbers n.
30. **Proof by contrapositive.** The contrapositive of "if n² is even, then n is even" is "if n is not even (odd), then n² is odd." Let n be odd, so n = 2a + 1 for some integer a. Then
    n² = (2a + 1)² = 4a² + 4a + 1 = 2(2a² + 2a) + 1,
    which is twice an integer plus one, odd. The contrapositive is proved, so the original statement holds.
$md$, 10);
