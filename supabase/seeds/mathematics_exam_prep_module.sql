-- ============================================================
-- Mathematics in the Modern World, Exam Prep: Prelims & Finals
-- Module ID:  a2000001-0001-0001-0002-0000000000e1
-- Subject ID: 10000000-0001-0001-0002-000000000001
-- Purpose: prelim/final blueprints, mock exams, and fully worked
--          answer keys covering only Units I–VI of this subject.
-- Idempotent: deletes this one module first (sections cascade),
--             then re-inserts. INSERT-only otherwise; never touches
--             the six content units.
-- Run after mathematics_modules_sections.sql
-- ============================================================

DELETE FROM modules WHERE id = 'a2000001-0001-0001-0002-0000000000e1';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('a2000001-0001-0001-0002-0000000000e1','10000000-0001-0001-0002-000000000001','Exam Prep: Prelims & Finals','exam-prep-prelims-finals',7);

-- ============================================================
-- FREE SECTIONS (kind = 'content'): blueprint + free practice set
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a2000001-0001-0001-0002-0000000000e1','content','Prelim Exam Blueprint & Study Plan',$md$
Your prelim in Mathematics in the Modern World is built almost entirely from the first three units of this subject. If you can do everything on this page, you can pass the prelim. Here is exactly what to expect and how to prepare for it in one week.

### What a Typical Prelim Covers

| Unit | Typical Weight | What Gets Tested |
|---|---|---|
| Unit I: Patterns and Numbers in Nature | ~30% | Identifying symmetry types, classifying frieze patterns by Conway name, generating Fibonacci terms, using Binet's formula, golden ratio facts |
| Unit II: Logic and Sets | ~40% | Deciding what counts as a proposition, building truth tables, converse/inverse/contrapositive, De Morgan's laws, set operations, Venn diagram counting |
| Unit III: Mathematical Problem Solving | ~30% | Telling inductive from deductive reasoning, forming and testing conjectures, counterexamples, Polya's four steps applied to word problems |

### Typical Question-Type Breakdown

- **Multiple choice (~35–40%):** fast definition and classification items. These are free points if you memorized the lists below.
- **True or false (~20–25%):** almost always aimed at the classic confusions, converse vs. contrapositive, inductive vs. deductive, inclusive "or".
- **Computations and constructions (~35–45%):** truth tables, set operations, a Venn diagram word problem, Fibonacci calculations, and one Polya-style word problem. This is where exams are won or lost, so most of your practice time should go here.

### The Exact Memorize List

Everything below appears repeatedly on prelims. Write this on one sheet and drill it until it is automatic.

**Unit I**

- Fibonacci definition: $F_1 = 1$, $F_2 = 1$, and $F_n = F_{n-1} + F_{n-2}$ for $n > 2$. Know the first twelve terms cold: $1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144$.
- Golden ratio: $\varphi = \dfrac{1 + \sqrt{5}}{2} \approx 1.618$, and its conjugate $\bar{\varphi} = \dfrac{1 - \sqrt{5}}{2} \approx -0.618$.
- Binet's formula: $F_n = \dfrac{\varphi^n - \bar{\varphi}^n}{\sqrt{5}}$.
- Symmetry types: bilateral (one mirror axis) vs. radial (repeats around a center).
- Rosette patterns: cyclic $C_n$ (rotations only) vs. dihedral $D_n$ (rotations and reflections).
- The seven Conway frieze names: hop, step, sidle, spinning hop, spinning sidle, jump, spinning jump, and which symmetries each allows.
- Exactly **7** frieze groups and exactly **17** wallpaper pattern types exist.

**Unit II**

- Truth table rules in one line each: $p \wedge q$ is true only when both are true; $p \vee q$ is false only when both are false; $p \longrightarrow q$ is false only when a true premise meets a false conclusion; $p \longleftrightarrow q$ is true when both values match.
- A false premise makes any conditional true by default.
- From $p \longrightarrow q$: converse is $q \longrightarrow p$, inverse is $\neg p \longrightarrow \neg q$, contrapositive is $\neg q \longrightarrow \neg p$. **Only the contrapositive is equivalent to the original.** The converse and inverse are equivalent to each other.
- De Morgan's laws: $\neg(p \vee q) \iff (\neg p \wedge \neg q)$ and $\neg(p \wedge q) \iff (\neg p \vee \neg q)$.
- Tautology (all rows true), contradiction (all rows false), contingency (mixed).
- Set operations: $A \cup B$ (either), $A \cap B$ (both), $A \setminus B$ (in $A$ but not $B$), $A'$ (everything in $U$ outside $A$). Cardinality $n(A)$ counts distinct elements.
- Venn counting for two sets: $n(A \cup B) = n(A) + n(B) - n(A \cap B)$. For three-set word problems, always fill the diagram starting from the center (all three) outward.

**Unit III**

- Inductive reasoning: specific observations $\to$ general conjecture (never guaranteed; one counterexample kills it). Deductive reasoning: general principles $\to$ specific certainty.
- Polya's four steps, in order: (1) understand the problem, (2) devise a plan, (3) execute the plan, (4) review and reflect.
- Handshake-type counting: $n$ people each shaking hands once means $\dfrac{n(n-1)}{2}$ handshakes.

### Top Mistakes Students Actually Make

1. Treating the converse as equivalent to the original conditional. It is not, only the contrapositive is.
2. Marking $p \vee q$ false when both parts are true. The "or" in logic is inclusive: both true means the disjunction is true.
3. Forgetting that a false premise makes the whole conditional true, and marking $F \longrightarrow F$ as false.
4. Off-by-one Fibonacci indexing: the 10th term is 55, not 89. Count carefully from $F_1 = 1$.
5. Adding $n(A) + n(B)$ in Venn problems without subtracting the overlap, double-counting the intersection.
6. Writing $x \subseteq A$ when they mean $x \in A$. Elements belong with $\in$; only sets sit inside $\subseteq$.
7. "Proving" a conjecture with three examples. Inductive evidence is not proof; a single counterexample disproves it.

### A Realistic 7-Day Study Plan

| Day | Focus | What To Do |
|---|---|---|
| 1 | Unit I: Patterns and Numbers in Nature | Re-read the symmetry and frieze sections. Drill the seven Conway names and the $C_n$/$D_n$ distinction. |
| 2 | Unit I: Patterns and Numbers in Nature | Fibonacci day: generate 20 terms by hand, practice the "given two distant terms, find the middle one" trick, run Binet's formula twice with a calculator. |
| 3 | Unit II: Logic and Sets | Logic half: build truth tables for 4–5 compound propositions, write converse/inverse/contrapositive for 5 statements, verify De Morgan's laws yourself. |
| 4 | Unit II: Logic and Sets | Sets half: set operations with a concrete universal set, then two full Venn diagram word problems, filled from the center outward. |
| 5 | Unit III: Mathematical Problem Solving | Classify 10 scenarios as inductive or deductive, then solve 3 word problems writing out all four Polya steps explicitly. |
| 6 | Mixed practice | Take the free 15-item set below under time pressure (25 minutes), check every answer, and re-study whatever you missed. |
| 7 | Full dress rehearsal | Take a full 30-item mock exam in 60 minutes, mark it honestly, and spend the rest of the day only on your wrong answers. |
$md$, 1),

('a2000001-0001-0001-0002-0000000000e1','content','Free Practice Set, 15 Items with Answer Key',$md$
Work through these under exam conditions first, 25 minutes, no notes, then check the key. Every item is drawn straight from Units I–III.

### Items

**1.** The Fibonacci sequence begins $1, 1, 2, 3, 5, 8, 13, 21, \dots$ Write the next two terms.

**2.** Which of the following exhibits radial (rotational) symmetry? (A) a butterfly (B) a snowflake (C) a human face (D) a swan

**3.** Given $F_{14} = 377$ and $F_{16} = 987$, determine $F_{15}$.

**4.** Exactly how many distinct frieze pattern groups exist, and exactly how many distinct wallpaper pattern types exist?

**5.** Write the exact expression for the golden ratio $\varphi$ and its approximate decimal value.

**6.** Decide whether each sentence is a proposition. If it is, give its truth value.
- (a) "Manila is the capital of the Philippines."
- (b) "Please submit your homework."
- (c) "Is 91 a prime number?"
- (d) "$15 - 6 = 8$."

**7.** Suppose $p$ is true and $q$ is false. Evaluate: (a) $p \wedge q$ (b) $p \vee q$ (c) $p \longrightarrow q$ (d) $p \longleftrightarrow q$

**8.** Write the contrapositive of: "If it rains, then the class is suspended."

**9.** Use De Morgan's law to write the negation of: "The number is even or the number is positive."

**10.** Let $U = \{1,2,3,4,5,6,7,8\}$, $A = \{1,2,3,4\}$, $B = \{3,4,5,6\}$. Find: (a) $A \cap B$ (b) $A \cup B$ (c) $(A \cup B)'$ (d) $A \setminus B$

**11.** Using the same set $A = \{1,2,3,4\}$: (a) state $n(A)$; (b) true or false: $\{1,2\} \subseteq A$.

**12.** Construct the truth table for $p \vee \neg p$ and classify the proposition as a tautology, contradiction, or contingency.

**13.** Classify each argument as inductive or deductive:
- (a) "Our last three quizzes each had a Venn diagram problem, so the prelim will have one too."
- (b) "Every multiple of 10 ends in 0. The number 570 is a multiple of 10. Therefore 570 ends in 0."

**14.** At a meeting, 10 people each shake hands with every other person exactly once. How many handshakes occur?

**15.** A number is doubled and then increased by 6, giving 20. Working backwards, find the number.

### Answer Key

**1.** $34$ and $55$. Each term is the sum of the previous two: $13 + 21 = 34$, then $21 + 34 = 55$.

**2.** **(B) a snowflake.** It repeats around a central point. The butterfly, face, and swan are the textbook bilateral (mirror) examples.

**3.** Since $F_{16} = F_{15} + F_{14}$, rearrange: $F_{15} = F_{16} - F_{14} = 987 - 377 = \mathbf{610}$.

**4.** Exactly **7** frieze groups (Conway's hop through spinning jump) and exactly **17** wallpaper types.

**5.** $\varphi = \dfrac{1 + \sqrt{5}}{2} \approx 1.618$.

**6.** (a) Proposition, true. (b) Not a proposition, imperative. (c) Not a proposition, interrogative. (d) Proposition, **false** (the equation fails, but it still has a definite truth value, so it qualifies).

**7.** (a) $p \wedge q$ is **false** (needs both true). (b) $p \vee q$ is **true** (one true is enough). (c) $p \longrightarrow q$ is **false** (true premise, false conclusion, the only failing row). (d) $p \longleftrightarrow q$ is **false** (values differ).

**8.** Swap and negate both parts: "If the class is not suspended, then it does not rain." (Order matters: negated conclusion first.)

**9.** $\neg(p \vee q) \iff (\neg p \wedge \neg q)$: "The number is not even **and** the number is not positive."

**10.** (a) $A \cap B = \{3,4\}$ (b) $A \cup B = \{1,2,3,4,5,6\}$ (c) $(A \cup B)' = \{7,8\}$ (d) $A \setminus B = \{1,2\}$.

**11.** (a) $n(A) = 4$. (b) **True**, every element of $\{1,2\}$ is in $A$.

**12.** | $p$ | $\neg p$ | $p \vee \neg p$ |
|---|---|---|
| 1 | 0 | 1 |
| 0 | 1 | 1 |

True in every row, so it is a **tautology**.

**13.** (a) **Inductive**, a general expectation drawn from a few specific observations, and not guaranteed. (b) **Deductive**, a general rule applied to a specific case, giving certainty.

**14.** Each of the 10 people shakes 9 hands, but that counts every handshake twice: $\dfrac{10 \times 9}{2} = \mathbf{45}$.

**15.** Reverse the operations in reverse order: $20 - 6 = 14$, then $14 \div 2 = \mathbf{7}$. Check forward: $7 \times 2 + 6 = 20$. ✓

Scored below 12? Go back to the blueprint's memorize list before attempting a full mock. The four full 30-item mock exams below, with completely worked answer keys, come with the subject unlock.
$md$, 2);

-- ============================================================
-- LOCKED SECTIONS (kind = 'activity'): prelim mock exams
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a2000001-0001-0001-0002-0000000000e1','activity','Prelim Mock Exam A, 30 Items',$md$
Simulate the real thing: 60 minutes, no notes, calculator allowed for Part III. Answers are in the answer key section, do not peek until you finish.

### Part I, Multiple Choice (Items 1–10)

**1.** Which natural structure is the classic example of a tessellation?
(A) a honeycomb  (B) a sunflower seed head  (C) a hurricane  (D) butterfly wings

**2.** A starfish primarily exhibits which type of symmetry?
(A) bilateral  (B) radial  (C) translational  (D) glide reflection

**3.** A rosette pattern that admits only rotational symmetries around its center is classified as:
(A) dihedral  (B) frieze  (C) cyclic  (D) wallpaper

**4.** In Conway's naming system, a frieze pattern whose only symmetry is translation is called a:
(A) hop  (B) step  (C) sidle  (D) jump

**5.** With $F_1 = F_2 = 1$, the value of $F_{12}$ is:
(A) 89  (B) 121  (C) 144  (D) 233

**6.** The golden ratio $\varphi$ equals:
(A) $\dfrac{1+\sqrt{3}}{2}$  (B) $\dfrac{1+\sqrt{5}}{2}$  (C) $\dfrac{1-\sqrt{5}}{2}$  (D) $\dfrac{\sqrt{5}}{2}$

**7.** Which of the following is a proposition?
(A) "Close the window."  (B) "What time is it?"  (C) "9 is a prime number."  (D) "Algebra is boring."

**8.** The conditional $p \longrightarrow q$ is false exactly when:
(A) $p$ true, $q$ true  (B) $p$ true, $q$ false  (C) $p$ false, $q$ true  (D) $p$ false, $q$ false

**9.** The converse of $p \longrightarrow q$ is:
(A) $\neg p \longrightarrow \neg q$  (B) $\neg q \longrightarrow \neg p$  (C) $q \longrightarrow p$  (D) $p \longrightarrow \neg q$

**10.** The second step of Polya's problem-solving strategy is:
(A) review and reflect  (B) devise a plan  (C) execute the plan  (D) understand the problem

### Part II, True or False (Items 11–18)

**11.** Every conditional statement is logically equivalent to its converse.

**12.** The disjunction $p \vee q$ is false only when both $p$ and $q$ are false.

**13.** For any set $A$ inside a universal set $U$, $A \cap A' = \emptyset$.

**14.** A conjecture reached by inductive reasoning is guaranteed to be true.

**15.** Exactly 17 distinct wallpaper pattern types exist in two-dimensional space.

**16.** The biconditional $p \longleftrightarrow q$ is true whenever $p$ and $q$ have the same truth value.

**17.** Deductive reasoning moves from specific observations to a general conjecture.

**18.** A single counterexample is enough to disprove a conjecture.

### Part III, Computations (Items 19–30)

**19.** List the first ten terms of the Fibonacci sequence, starting from $F_1 = 1$ and $F_2 = 1$.

**20.** Given $F_{20} = 6{,}765$ and $F_{22} = 17{,}711$, use the sequence's addition principle to determine $F_{21}$.

**21.** Use Binet's formula, $F_n = \dfrac{\varphi^n - \bar{\varphi}^n}{\sqrt{5}}$, to evaluate $F_5$. Show your intermediate values to four decimal places.

**22.** Construct the complete truth table for $(p \wedge q) \longrightarrow p$ and classify it as a tautology, contradiction, or contingency.

**23.** Construct the complete truth table for $(p \vee q) \wedge \neg p$ and classify it as a tautology, contradiction, or contingency.

**24.** For the statement "If a number is divisible by 4, then it is even," write the converse, the inverse, and the contrapositive.

**25.** Let $U = \{1,2,3,4,5,6,7,8,9,10\}$, $A = \{2,4,6,8,10\}$, and $B = \{1,2,3,4,5\}$. Find: (a) $A \cap B$ (b) $A \cup B$ (c) $A'$ (d) $B \setminus A$

**26.** Two sets satisfy $n(A) = 12$, $n(B) = 9$, and $n(A \cap B) = 4$. Compute $n(A \cup B)$.

**27.** In a class of 40 students, 25 like basketball, 20 like volleyball, and 12 like both. Using a Venn diagram, determine: (a) how many like basketball only, (b) how many like volleyball only, (c) how many like neither sport.

**28.** Consider the sequence $3, 7, 11, 15, \dots$ (a) Write the next term. (b) Conjecture a formula for the $n$-th term. (c) Use your conjecture to find the 25th term.

**29.** At a company assembly, 12 employees each shake hands with every other employee exactly once. Apply Polya's four steps (state each step briefly) and compute the total number of handshakes.

**30.** A number is tripled and then decreased by 5, giving 22. Work backwards to find the number, and verify your answer forwards.
$md$, 3),

('a2000001-0001-0001-0002-0000000000e1','activity','Prelim Mock Exam B, 30 Items',$md$
Same scope as Mock A (Units I–III), all-new items, and slightly harder, take this one after reviewing your Mock A mistakes. 60 minutes.

### Part I, Multiple Choice (Items 1–10)

**1.** Complex, self-similar geometric patterns that repeat at ever-smaller scales are called:
(A) tessellations  (B) spirals  (C) fractals  (D) frieze patterns

**2.** In Conway's naming system, a frieze pattern allowing only translation and vertical reflection symmetries is called a:
(A) hop  (B) sidle  (C) spinning hop  (D) step

**3.** A dihedral rosette pattern $D_n$ admits:
(A) rotations only  (B) reflections only  (C) both rotations and reflections  (D) translations in two directions

**4.** Tracing a male drone bee's family tree backward through the generations produces which number pattern?
(A) powers of two  (B) the Fibonacci sequence  (C) square numbers  (D) prime numbers

**5.** As $n$ grows without bound, the ratio $\dfrac{F_n}{F_{n-1}}$ approaches:
(A) $1.414$  (B) $1.618$  (C) $2.718$  (D) $3.141$

**6.** The golden ratio conjugate $\bar{\varphi} = \dfrac{1-\sqrt{5}}{2}$ is approximately:
(A) $0.618$  (B) $-0.618$  (C) $-1.618$  (D) $0.382$

**7.** Which of the following is NOT a proposition?
(A) "7 is odd."  (B) "The sum of 2 and 2 is 5."  (C) "Statistics is the most exciting subject."  (D) "Every square has four sides."

**8.** By De Morgan's law, $\neg(p \wedge q)$ is logically equivalent to:
(A) $\neg p \wedge \neg q$  (B) $\neg p \vee \neg q$  (C) $p \vee q$  (D) $\neg(p \vee q)$

**9.** The inverse of $p \longrightarrow q$ is:
(A) $q \longrightarrow p$  (B) $\neg q \longrightarrow \neg p$  (C) $\neg p \longrightarrow \neg q$  (D) $q \longrightarrow \neg p$

**10.** A compound proposition that evaluates as true in every row of its truth table is a:
(A) contingency  (B) contradiction  (C) conjecture  (D) tautology

### Part II, True or False (Items 11–18)

**11.** Spirals are continuous, widening curves that radiate outward from a central point.

**12.** A frieze pattern repeats along two independent directions in the plane.

**13.** If $p$ is false, then $p \longrightarrow q$ is true regardless of the truth value of $q$.

**14.** The converse and the inverse of a conditional statement are logically equivalent to each other.

**15.** For all sets $A$ and $B$, $A \setminus B = B \setminus A$.

**16.** The universal set $U$ contains all possible entities under consideration in a given analysis.

**17.** Polya's first step is to devise a plan.

**18.** Deductive reasoning applies general principles to reach a specific, certain conclusion.

### Part III, Computations (Items 19–30)

**19.** Given $F_{10} = 55$ and $F_{11} = 89$, compute $F_{12}$ and $F_{13}$.

**20.** Given $F_{28} = 317{,}811$ and $F_{30} = 832{,}040$, determine both $F_{29}$ and $F_{27}$. Show the reasoning for each.

**21.** Use Binet's formula to evaluate $F_6$. Show your intermediate powers of $\varphi$ and $\bar{\varphi}$ to four decimal places.

**22.** Construct the truth table for $(p \longrightarrow q) \wedge (q \longrightarrow p)$ and show, row by row, that it is logically equivalent to $p \longleftrightarrow q$.

**23.** Construct the complete eight-row truth table for $(p \wedge q) \vee \neg r$ and classify the proposition.

**24.** Classify each proposition using a truth table: (a) $p \wedge \neg p$ (b) $(p \longrightarrow q) \vee p$

**25.** Let $A$ be the set of distinct letters in the word "pattern" and $B$ the set of distinct letters in the word "problem." Find: (a) $A$ and $B$ in roster form (b) $A \cap B$ (c) $A \setminus B$ (d) $n(A \cup B)$

**26.** Sixty students were surveyed about programming electives: 25 take Java, 22 take Python, 18 take C++; 8 take Java and Python, 6 take Python and C++, 7 take Java and C++; 3 take all three. Using a Venn diagram filled from the center outward, find: (a) how many take at least one language, (b) how many take none, (c) how many take exactly one, (d) how many take exactly two.

**27.** Let $A = \{1, 3, 5, 7, 9\}$. Decide whether each statement is true or false: (a) $3 \in A$ (b) $\{3, 5\} \subseteq A$ (c) $9 \subseteq A$ (d) $n(A) = 5$

**28.** Observe: $1 = 1^2$; $1 + 3 = 4 = 2^2$; $1 + 3 + 5 = 9 = 3^2$. (a) Formulate a conjecture about the sum of the first $n$ odd numbers. (b) Use it to evaluate $1 + 3 + 5 + \dots + 99$ without adding term by term.

**29.** A league has 15 teams, and every team plays every other team exactly once. Apply Polya's four steps (state each briefly) and compute the total number of games.

**30.** Maria spent half of her money on a book, then paid ₱30 for lunch, leaving her with ₱45. Work backwards to find how much she started with, and verify forwards.
$md$, 4);

-- ============================================================
-- LOCKED SECTIONS: prelim answer key + traps drill
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a2000001-0001-0001-0002-0000000000e1','activity','Prelim Mock Exams, Answer Key with Explanations',$md$
Check your work item by item. For every computation, compare your working against the steps shown, a right answer with wrong reasoning will not survive a harder version of the same item.

### Mock Exam A, Answers

**1. (A) a honeycomb.** Regular hexagons tile the plane completely with no gaps or overlaps, the defining property of a tessellation. Sunflower heads and hurricanes are spiral examples; butterfly wings show bilateral symmetry.

**2. (B) radial.** A starfish repeats around a fixed central point. Bilateral symmetry needs a single mirror axis, which a starfish does not rely on.

**3. (C) cyclic.** $C_n$ rosettes admit rotations only; once reflections are also allowed the pattern becomes dihedral $D_n$.

**4. (A) hop.** In Conway's table, hop is the frieze group with translation symmetry only.

**5. (C) 144.** Count up: $1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144$, the 12th entry is 144.

**6. (B).** $\varphi = \dfrac{1+\sqrt{5}}{2} \approx 1.618$. Option (C) is the conjugate $\bar{\varphi}$.

**7. (C).** "9 is a prime number" is declarative with a definite truth value (false, since $9 = 3 \times 3$), so it is a proposition. (A) is imperative, (B) interrogative, (D) subjective.

**8. (B).** A conditional fails only when a true premise leads to a false conclusion.

**9. (C).** The converse swaps premise and conclusion: $q \longrightarrow p$. Option (A) is the inverse, (B) the contrapositive.

**10. (B) devise a plan.** Polya's order: understand, plan, execute, review.

**11. FALSE.** A conditional is equivalent to its **contrapositive**, not its converse.

**12. TRUE.** Disjunction is inclusive: any true component makes it true, so only the all-false row fails.

**13. TRUE.** No element can be both inside $A$ and outside $A$, so the intersection is empty.

**14. FALSE.** Inductive conjectures are unproven generalizations; a single counterexample can destroy one.

**15. TRUE.** Mathematicians proved exactly 17 wallpaper types exist.

**16. TRUE.** That is the definition of the biconditional: true when both values match.

**17. FALSE.** Specific-to-general is **inductive**. Deduction runs from general principles to a specific certainty.

**18. TRUE.** One exception that satisfies the premises but breaks the conclusion disproves the conjecture.

**19.** $1, 1, 2, 3, 5, 8, 13, 21, 34, 55$. Each term after the second is the sum of the two before it.

**20.** Since $F_{22} = F_{21} + F_{20}$:

$$F_{21} = F_{22} - F_{20} = 17{,}711 - 6{,}765 = \mathbf{10{,}946}$$

**21.** With $\varphi \approx 1.6180$ and $\bar{\varphi} \approx -0.6180$:

$$\varphi^5 \approx 11.0902, \qquad \bar{\varphi}^5 \approx -0.0902$$

$$F_5 = \frac{11.0902 - (-0.0902)}{\sqrt{5}} = \frac{11.1804}{2.2361} \approx 5.0000$$

So $F_5 = \mathbf{5}$, matching the sequence $1, 1, 2, 3, 5$.

**22.** | $p$ | $q$ | $p \wedge q$ | $(p \wedge q) \longrightarrow p$ |
|---|---|---|---|
| 1 | 1 | 1 | 1 |
| 1 | 0 | 0 | 1 |
| 0 | 1 | 0 | 1 |
| 0 | 0 | 0 | 1 |

True in every row: **tautology**. (Rows 2–4 have a false premise, so the conditional defaults to true.)

**23.** | $p$ | $q$ | $p \vee q$ | $\neg p$ | $(p \vee q) \wedge \neg p$ |
|---|---|---|---|---|
| 1 | 1 | 1 | 0 | 0 |
| 1 | 0 | 1 | 0 | 0 |
| 0 | 1 | 1 | 1 | 1 |
| 0 | 0 | 0 | 1 | 0 |

Mixed outputs (true only when $p$ is false and $q$ is true): **contingency**.

**24.**
- Converse: "If a number is even, then it is divisible by 4." (False in general, 6 is a counterexample.)
- Inverse: "If a number is not divisible by 4, then it is not even." (Also false, again, 6.)
- Contrapositive: "If a number is not even, then it is not divisible by 4." (True, and equivalent to the original.)

**25.** (a) $A \cap B = \{2, 4\}$ (b) $A \cup B = \{1,2,3,4,5,6,8,10\}$ (c) $A' = \{1,3,5,7,9\}$ (d) $B \setminus A = \{1,3,5\}$.

**26.** $n(A \cup B) = n(A) + n(B) - n(A \cap B) = 12 + 9 - 4 = \mathbf{17}$. Subtracting the overlap prevents double-counting.

**27.** Fill the diagram from the overlap outward: both $= 12$; basketball only $= 25 - 12 = \mathbf{13}$; volleyball only $= 20 - 12 = \mathbf{8}$. Total who like at least one sport $= 13 + 8 + 12 = 33$, so neither $= 40 - 33 = \mathbf{7}$.

**28.** (a) The terms rise by 4 each time, so the next term is $\mathbf{19}$. (b) Starting at 3 with common step 4: $a_n = 4n - 1$ (check: $n=1$ gives 3 ✓). (c) $a_{25} = 4(25) - 1 = \mathbf{99}$.

**29.**
1. *Understand:* 12 people, each pair shakes hands exactly once; count the pairs.
2. *Plan:* each person shakes 11 hands, but each handshake involves two people, so halve the total.
3. *Execute:* $\dfrac{12 \times 11}{2} = \mathbf{66}$.
4. *Review:* test on a small case, 3 people give $\frac{3 \times 2}{2} = 3$ handshakes, which is correct, so the method is sound.

**30.** Undo the operations in reverse: $22 + 5 = 27$, then $27 \div 3 = \mathbf{9}$. Forward check: $9 \times 3 - 5 = 27 - 5 = 22$. ✓

### Mock Exam B, Answers

**1. (C) fractals**, self-similar structures repeated at shrinking scales.

**2. (B) sidle.** Translation plus vertical reflection only. A step uses glide reflection; a spinning hop uses half-turns.

**3. (C).** Dihedral $D_n$ admits both rotational and reflectional symmetries; rotations-only is cyclic.

**4. (B) the Fibonacci sequence.** Drones have one parent and workers two, so the ancestor counts grow Fibonacci-style generation by generation.

**5. (B) 1.618.** The ratio of consecutive Fibonacci terms stabilizes at $\varphi$.

**6. (B) $-0.618$.** $\bar{\varphi} = \frac{1 - \sqrt{5}}{2} = \frac{1 - 2.2361}{2} \approx -0.618$, note the negative sign.

**7. (C).** "Most exciting subject" is a subjective claim with no objective truth value. (B) is false but still a proposition.

**8. (B).** De Morgan: negating a conjunction gives a disjunction of negations, $\neg p \vee \neg q$.

**9. (C).** The inverse negates both parts in place: $\neg p \longrightarrow \neg q$.

**10. (D) tautology.**

**11. TRUE.** That is the definition of a spiral pattern.

**12. FALSE.** Frieze patterns repeat along a *single* direction; two independent directions defines a **wallpaper** pattern.

**13. TRUE.** A false premise makes the conditional true by default.

**14. TRUE.** Converse $q \longrightarrow p$ and inverse $\neg p \longrightarrow \neg q$ are contrapositives of each other, hence equivalent.

**15. FALSE.** Set difference is not symmetric. Example: $A = \{1,2\}$, $B = \{2,3\}$ gives $A \setminus B = \{1\}$ but $B \setminus A = \{3\}$.

**16. TRUE.** By definition of the universal set.

**17. FALSE.** Step one is to *understand the problem*; devising a plan is step two.

**18. TRUE.** That is exactly what distinguishes deduction from induction.

**19.** $F_{12} = F_{11} + F_{10} = 89 + 55 = \mathbf{144}$; then $F_{13} = F_{12} + F_{11} = 144 + 89 = \mathbf{233}$.

**20.** From $F_{30} = F_{29} + F_{28}$:

$$F_{29} = F_{30} - F_{28} = 832{,}040 - 317{,}811 = \mathbf{514{,}229}$$

From $F_{29} = F_{28} + F_{27}$:

$$F_{27} = F_{29} - F_{28} = 514{,}229 - 317{,}811 = \mathbf{196{,}418}$$

**21.** $\varphi^6 = \varphi^5 \cdot \varphi \approx 11.0902 \times 1.6180 \approx 17.9443$, and $\bar{\varphi}^6 \approx (-0.0902)(-0.6180) \approx 0.0557$:

$$F_6 = \frac{17.9443 - 0.0557}{2.2361} = \frac{17.8886}{2.2361} \approx 8.0000$$

So $F_6 = \mathbf{8}$. ✓

**22.** | $p$ | $q$ | $p \longrightarrow q$ | $q \longrightarrow p$ | $(p \to q) \wedge (q \to p)$ | $p \longleftrightarrow q$ |
|---|---|---|---|---|---|
| 1 | 1 | 1 | 1 | 1 | 1 |
| 1 | 0 | 0 | 1 | 0 | 0 |
| 0 | 1 | 1 | 0 | 0 | 0 |
| 0 | 0 | 1 | 1 | 1 | 1 |

The last two columns are identical in every row, so the two propositions are logically equivalent, a biconditional is exactly a two-way conditional.

**23.** | $p$ | $q$ | $r$ | $p \wedge q$ | $\neg r$ | $(p \wedge q) \vee \neg r$ |
|---|---|---|---|---|---|
| 1 | 1 | 1 | 1 | 0 | 1 |
| 1 | 1 | 0 | 1 | 1 | 1 |
| 1 | 0 | 1 | 0 | 0 | 0 |
| 1 | 0 | 0 | 0 | 1 | 1 |
| 0 | 1 | 1 | 0 | 0 | 0 |
| 0 | 1 | 0 | 0 | 1 | 1 |
| 0 | 0 | 1 | 0 | 0 | 0 |
| 0 | 0 | 0 | 0 | 1 | 1 |

Mixed true and false rows: **contingency**.

**24.** (a) $p \wedge \neg p$ is false in both rows (a statement and its negation can never hold together): **contradiction**. (b) $(p \longrightarrow q) \vee p$: when $p$ is true the right disjunct is true; when $p$ is false the conditional is true by default, every row is true: **tautology**.

**25.** (a) $A = \{p, a, t, e, r, n\}$ and $B = \{p, r, o, b, l, e, m\}$ (duplicates dropped, sets keep distinct elements only). (b) $A \cap B = \{p, e, r\}$. (c) $A \setminus B = \{a, t, n\}$. (d) $A \cup B = \{p,a,t,e,r,n,o,b,l,m\}$, so $n(A \cup B) = \mathbf{10}$.

**26.** Fill from the center: all three $= 3$. Java–Python only $= 8-3 = 5$; Python–C++ only $= 6-3 = 3$; Java–C++ only $= 7-3 = 4$. Java only $= 25 - 5 - 4 - 3 = 13$; Python only $= 22 - 5 - 3 - 3 = 11$; C++ only $= 18 - 3 - 4 - 3 = 8$.
- (a) At least one: $13+11+8+5+3+4+3 = \mathbf{47}$.
- (b) None: $60 - 47 = \mathbf{13}$.
- (c) Exactly one: $13+11+8 = \mathbf{32}$.
- (d) Exactly two: $5+3+4 = \mathbf{12}$. (Check: $32 + 12 + 3 = 47$ ✓)

**27.** (a) **True**, 3 is an element of $A$. (b) **True**, both 3 and 5 belong to $A$, so $\{3,5\}$ is a subset. (c) **False**, 9 is an element, not a set; the correct statement is $9 \in A$. (d) **True**, $A$ has five distinct elements.

**28.** (a) Conjecture: the sum of the first $n$ odd numbers is $n^2$. (b) The odd numbers from 1 to 99 are $1, 3, \dots, 99$; since $99 = 2(50) - 1$, there are 50 terms, so the sum is $50^2 = \mathbf{2{,}500}$.

**29.**
1. *Understand:* 15 teams, every pair plays exactly once; count the pairings.
2. *Plan:* each team plays 14 games, but each game involves two teams, so halve the product.
3. *Execute:* $\dfrac{15 \times 14}{2} = \mathbf{105}$.
4. *Review:* small case check, 4 teams give $\frac{4 \times 3}{2} = 6$ games, which matches listing them out.

**30.** Work backwards from ₱45: before lunch she had $45 + 30 = 75$; that was half her money, so she started with $75 \times 2 = \mathbf{₱150}$. Forward check: $150 \div 2 = 75$, then $75 - 30 = 45$. ✓
$md$, 5),

('a2000001-0001-0001-0002-0000000000e1','activity','Common Prelim Traps & How to Avoid Them',$md$
These are the mistakes that cost the most points on this exam, in roughly the order examiners exploit them. Each trap comes with a 30-second drill, do the drill *before* reading its answer.

### Trap 1, Treating the converse as the contrapositive

From $p \longrightarrow q$, only the contrapositive $\neg q \longrightarrow \neg p$ is equivalent to the original. The converse $q \longrightarrow p$ merely swaps the parts and can be false while the original is true. Exams love offering the converse as a tempting "equivalent" choice.

**Drill:** For "If a shape is a square, then it has four sides," which one of the converse, inverse, and contrapositive is logically equivalent to it? Write that statement out.

**Answer:** Only the contrapositive: "If a shape does not have four sides, then it is not a square." The converse ("If a shape has four sides, then it is a square") fails, a rectangle is a counterexample.

### Trap 2, Reading "or" as exclusive

In logic, $p \vee q$ is **inclusive**: it is true when either part is true *and also when both are*. It is false only when both parts are false. Students trained on everyday "either-or" wrongly mark the both-true row as false.

**Drill:** Let $p$: "10 is divisible by 5" and $q$: "10 is divisible by 2." Both are true. What is the truth value of $p \vee q$?

**Answer:** **True.** Both components being true makes a disjunction true, the only false row is false-false.

### Trap 3, Confusing $\in$ with $\subseteq$

Elements *belong to* a set ($\in$); only sets can be *subsets* ($\subseteq$). Writing $2 \subseteq A$ instead of $2 \in A$ is an automatic deduction on many rubrics.

**Drill:** Let $A = \{2, 4, 6\}$. Mark each true or false: (a) $2 \in A$ (b) $\{2\} \subseteq A$ (c) $\{2\} \in A$ (d) $\emptyset \subseteq A$

**Answer:** (a) True. (b) True, every element of $\{2\}$ is in $A$. (c) **False**, the set $\{2\}$ is not itself listed as an element of $A$. (d) True, the empty set has no element that could fail the subset test, so by the definition it is a subset of every set.

### Trap 4, Swapping union and intersection

Union $A \cup B$ collects everything in *either* set; intersection $A \cap B$ keeps only what is in *both*. Under time pressure students compute the wrong one, especially inside bigger expressions.

**Drill:** $A = \{a, b, c\}$, $B = \{b, c, d\}$. Find $A \cup B$, $A \cap B$, and $n(A \cup B)$.

**Answer:** $A \cup B = \{a, b, c, d\}$, $A \cap B = \{b, c\}$, and $n(A \cup B) = 4$, not 6, because shared elements are listed once.

### Trap 5, Fibonacci off-by-one

With $F_1 = 1$ and $F_2 = 1$, "the 10th term" means $F_{10} = 55$. Students who start counting from 0, or who miscount the two starting 1s, land one position off and answer 89 or 34.

**Drill:** Without listing all terms aloud, state $F_9$ and $F_{10}$.

**Answer:** $1, 1, 2, 3, 5, 8, 13, 21, 34, 55$, so $F_9 = 34$ and $F_{10} = 55$. If you wrote 55 and 89, you started one index too late.

### Trap 6, Marking a false-premise conditional as false

When the premise is false, $p \longrightarrow q$ is **true by default**, whatever $q$ says. The only failing row of a conditional is true-premise, false-conclusion.

**Drill:** What is the truth value of: "If $2 + 2 = 5$, then Manila is in Mindanao"?

**Answer:** **True.** The premise is false, so the conditional holds by default, even though the conclusion is also false.

### Trap 7, Believing three examples prove a conjecture

Inductive evidence suggests; it never proves. One counterexample is fatal, and exam writers pick conjectures that survive several small cases before failing.

**Drill:** The expression $n^2 + n + 11$ gives primes for $n = 1$ (13), $n = 2$ (17), and $n = 3$ (23). Does that prove it is always prime? Test $n = 10$.

**Answer:** No. At $n = 10$: $100 + 10 + 11 = 121 = 11 \times 11$, which is not prime. The conjecture is disproved by this single counterexample despite nine straight successes before it.

### Trap 8, Double-counting the overlap in Venn problems

Adding $n(A) + n(B)$ counts the intersection twice. Always subtract it once: $n(A \cup B) = n(A) + n(B) - n(A \cap B)$. In three-set problems, fill the diagram from the center outward instead of trusting raw totals.

**Drill:** In a survey, 20 students like math, 15 like programming, and 8 like both. How many like at least one of the two?

**Answer:** $20 + 15 - 8 = \mathbf{27}$, not 35. The 8 students who like both were inside both totals and must be subtracted once.
$md$, 6);

-- ============================================================
-- LOCKED SECTIONS: final blueprint + final mock exams
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a2000001-0001-0001-0002-0000000000e1','activity','Final Exam Blueprint & Rapid Review Sheet',$md$
The final is cumulative across all six units, but it is weighted toward what you learned after the prelim. Expect roughly this distribution:

| Coverage | Typical Weight | Focus |
|---|---|---|
| Units I–III (prelim material) | ~25–30% | Fast recall items: Fibonacci, truth tables, sets, Polya |
| Unit IV: Data Analytics and Statistical Management | ~25–30% | Sampling design, sample-size formulas, central tendency, dispersion |
| Unit V: Optimization via Linear Programming | ~20% | Model formulation and the graphical corner-point method |
| Unit VI: Graph Theory and Network Models | ~20–25% | Euler/Hamilton conditions, TSP algorithms, Kruskal, coloring |

Your prelim review still counts, skim the prelim blueprint and traps sections first, then spend most of your time on the material below. The final is **computation-heavy**: sample sizes, standard deviations, corner-point evaluations, and network algorithms make up most of the points.

### Rapid Review, Unit IV: Statistics

**Branches and terms.** Descriptive statistics summarizes data you have; inferential statistics uses a sample to draw conclusions about a population. Know population vs. sample, and simple random sampling.

**Sampling designs.** Probability methods: simple random, systematic (every $k$-th from a random start), stratified (proportional random draws from subgroups), cluster (randomly chosen groups, everyone inside). Non-probability methods: convenience, purposive, quota, snowball. Exams test these by scenario, identify the design, do not describe it.

**Levels of measurement**, lowest to highest: nominal (labels), ordinal (ranked, unequal gaps), interval (equal gaps, no true zero, Celsius), ratio (true zero, weight, salary, age).

**Sample-size formulas:**

$$\text{Slovin: } n = \frac{N}{1 + N E^2} \qquad \text{Mean: } n = \frac{(z_{\alpha/2})^2 \sigma^2}{E^2} \qquad \text{Proportion (Cochran): } n_0 = \frac{(z_{\alpha/2})^2 \hat{p}(1 - \hat{p})}{E^2}$$

Always **round sample sizes up** to the next whole number, and use $\hat{p} = 0.5$ when no prior estimate exists. Common z-scores: $z = 1.645$ for 90%, $z = 1.96$ for 95%, $z = 2.575$ for 99% confidence.

**Central tendency and dispersion:**

$$\bar{x} = \frac{\sum x_i}{n} \qquad \text{Weighted: } \bar{x} = \frac{\sum wx}{\sum w} \qquad s^2 = \frac{\sum (x_i - \bar{x})^2}{n-1} \qquad s = \sqrt{s^2}$$

Median: middle value of the ordered list (average the two central values when $n$ is even). Mode: most frequent value. Range: maximum minus minimum. Remember the sample variance divides by $n - 1$, not $n$.

### Rapid Review, Unit V: Linear Programming

**Every LP model has four parts**, write all four or lose formulation points:
1. Decision variables ($x_1, x_2, \dots$): define them in words with units.
2. Objective function: maximize profit or minimize cost, linear in the variables.
3. Structural constraints: one inequality per limited resource or requirement.
4. Non-negativity: $x_i \ge 0$.

**Graphical method:** plot each constraint's boundary line, shade using a test point (the origin is easiest when it is not on the line), intersect the shaded regions to get the feasible region, find every corner point (vertex), and evaluate the objective function at each. **If an optimum exists, it occurs at a corner point**, that sentence alone is often an exam item.

Corner points on the interior come from solving pairs of boundary equations simultaneously (elimination or substitution).

### Rapid Review, Unit VI: Graph Theory

**Core counts:**
- Sum of all vertex degrees $= 2 \times$ (number of edges). Hence the number of odd-degree vertices is always even.
- Complete graph $K_n$: every vertex has degree $n-1$ and there are $\dfrac{n(n-1)}{2}$ edges.
- A tree with $n$ vertices has exactly $n - 1$ edges, no circuits, and every edge is a bridge.

**Euler rules (about edges):** a connected graph has an Euler *circuit* iff every vertex has even degree; it has an Euler *path* iff exactly two vertices have odd degree (start at one odd vertex, end at the other). Fleury's algorithm: never cross a bridge unless there is no other option.

**Hamilton (about vertices):** a Hamilton path visits every vertex once; a Hamilton circuit returns to the start. No simple degree test exists, that asymmetry with Euler is a favorite true/false item.

**Traveling Salesman algorithms:** brute force (all circuits, guaranteed optimal, impractical when large); nearest neighbor (always move to the closest unvisited vertex, then return); cheapest link (take the lowest-weight edges one by one, rejecting any edge that closes a circuit early or gives a vertex degree 3).

**Kruskal's MST:** sort edges by weight, repeatedly take the lightest edge that does not form a circuit, stop when all vertices are connected ($n - 1$ edges taken).

**Coloring:** chromatic number = minimum colors with no two adjacent vertices sharing one. Four-Color Theorem: any planar map needs at most 4 colors.

### The Night Before

Recompute one of each by hand: a Slovin sample size, a standard deviation, a corner-point evaluation, a nearest-neighbor circuit, and a Kruskal tree. If all five run clean without notes, you are ready. Then sleep, a rested pass through easy MCQ items beats a groggy pass through everything.
$md$, 7),

('a2000001-0001-0001-0002-0000000000e1','activity','Final Mock Exam A, 30 Items',$md$
Cumulative coverage, weighted like the real final: items 1–6 review Units I–III, items 7–14 cover statistics, 15–20 linear programming, 21–30 graph theory. Allow 90 minutes; a calculator is expected from item 9 onward.

### Part I, Units I–III Review (Items 1–6)

**1.** Given $F_{11} = 89$ and $F_{12} = 144$, compute $F_{13}$ and $F_{14}$.

**2.** Construct the truth table for $(p \wedge q) \longrightarrow q$ and classify the proposition.

**3.** Write the contrapositive of: "If a graph is a tree, then it contains no circuits."

**4.** Let $U = \{1, 2, \dots, 12\}$, $A$ the even numbers in $U$, and $B$ the multiples of 3 in $U$. Find $A \cap B$ and $(A \cup B)'$.

**5.** Of 50 students, 30 drink coffee, 25 drink tea, and 12 drink both. How many drink coffee only, and how many drink neither?

**6.** For the sequence $2, 6, 12, 20, 30, \dots$, give the next term and a formula for the $n$-th term.

### Part II, Unit IV: Statistics (Items 7–14)

**7.** Classify the level of measurement of each: (a) temperature in degrees Celsius (b) basketball jersey numbers (c) class standing (1st, 2nd, 3rd) (d) monthly salary in pesos.

**8.** Identify the sampling design in each scenario: (a) the registrar lists all 4,000 students alphabetically and selects every 40th name; (b) the population is split by year level and a random sample proportional to each level's size is drawn; (c) a surveyor interviews whoever happens to be in the canteen at lunch; (d) 5 of a city's 30 barangays are chosen at random and every household in those 5 is surveyed.

**9.** A population has $N = 2{,}000$ members. Use Slovin's formula with a 5% margin of error to find the required sample size.

**10.** A researcher wants to estimate a population mean within $E = 3$ units at 95% confidence ($z = 1.96$), with known $\sigma = 15$. Find the minimum sample size.

**11.** Using Cochran's formula at 95% confidence ($z = 1.96$), margin of error 5%, and no prior estimate of the proportion, find the required sample size.

**12.** For the data set $72, 75, 75, 80, 84, 90, 91$: find the mean, median, and mode.

**13.** A student's grades: 1.50 in a 3-unit course, 2.00 in a 3-unit course, 2.50 in a 2-unit course, and 1.00 in a 2-unit course. Compute the weighted mean (GWA).

**14.** For the sample $4, 8, 6, 5, 2$: compute the range, the sample variance, and the sample standard deviation.

### Part III, Unit V: Linear Programming (Items 15–20)

**15.** In the model below, identify (a) the decision variables, (b) the objective function, (c) the structural constraints, and (d) the non-negativity restrictions.

$$\text{Maximize } P = 120x + 90y \quad \text{subject to} \quad 3x + 2y \le 180, \quad x + y \le 80, \quad x \ge 0, \; y \ge 0$$

**16.** Explain in one or two sentences why LP models include non-negativity restrictions.

**17.** A feasible region has corner points $(0,0)$, $(0,5)$, $(4,3)$, and $(6,0)$. Maximize $P = 3x + 4y$ over this region and state where the maximum occurs.

**18.** A bakery makes batches of pandesal ($x$, profit ₱40 per batch) and ensaymada ($y$, profit ₱60 per batch). Each pandesal batch needs 2 kg of flour and 1 oven-hour; each ensaymada batch needs 3 kg of flour and 2 oven-hours. Daily limits: 60 kg of flour and 32 oven-hours. Formulate the complete LP model (formulation only).

**19.** Solve graphically: maximize $P = 2x + 3y$ subject to $x + y \le 6$, $x + 2y \le 8$, $x \ge 0$, $y \ge 0$. List all corner points, evaluate $P$ at each, and state the optimal solution.

**20.** Find the exact intersection point of the boundary lines $3x + 2y = 12$ and $x + 2y = 8$.

### Part IV, Unit VI: Graph Theory (Items 21–30)

**21.** A graph has vertices $\{A, B, C, D\}$ and edges $(A\text{-}B), (A\text{-}C), (A\text{-}D), (B\text{-}C), (C\text{-}D)$. (a) State the degree of each vertex. (b) Does the graph have an Euler circuit, an Euler path only, or neither? If a path exists, where must it start and end?

**22.** A connected graph has vertices of degrees $2, 2, 4, 2, 2$. Does it have an Euler circuit, an Euler path only, or neither? Justify.

**23.** A graph has 7 edges. What is the sum of the degrees of all its vertices?

**24.** Can any graph have exactly three vertices of odd degree? Explain.

**25.** How many edges does the complete graph $K_5$ have? Show the computation.

**26.** In one sentence each, state the difference between an Euler circuit and a Hamilton circuit.

**27.** Four cities have these pairwise distances: $AB = 5$, $AC = 4$, $AD = 7$, $BC = 6$, $BD = 3$, $CD = 8$. Apply the Nearest Neighbor method starting from $A$ to find a circuit and its total distance.

**28.** A network has nodes $a, b, c, d, e$ and weighted edges: $(a\text{-}b) = 4$, $(a\text{-}c) = 2$, $(b\text{-}c) = 5$, $(b\text{-}d) = 10$, $(c\text{-}d) = 8$, $(c\text{-}e) = 3$, $(d\text{-}e) = 7$. Apply Kruskal's algorithm: list the edges in selection order and give the total weight of the minimum spanning tree.

**29.** A tree has 12 vertices. (a) How many edges does it have? (b) True or false: removing any single edge disconnects it. Justify briefly.

**30.** A graph consists of a triangle $A\text{-}B\text{-}C$ plus a fourth vertex $D$ adjacent only to $A$. Determine its chromatic number and exhibit a valid coloring.
$md$, 8),

('a2000001-0001-0001-0002-0000000000e1','activity','Final Mock Exam B, 30 Items',$md$
All-new items, same cumulative structure as Final Mock A: items 1–6 review Units I–III, 7–14 statistics, 15–20 linear programming, 21–30 graph theory. 90 minutes.

### Part I, Units I–III Review (Items 1–6)

**1.** Given $F_{17} = 1{,}597$ and $F_{19} = 4{,}181$, compute $F_{18}$ and $F_{20}$.

**2.** Construct the truth table for $(p \vee q) \longleftrightarrow (q \vee p)$ and classify the proposition.

**3.** Let $U = \{a, b, c, d, e, f, g, h, i, j\}$, $A = \{a, b, c, d, e\}$, $B = \{d, e, f, g\}$. Find: (a) $A \cap B$ (b) $B \setminus A$ (c) $A'$ (d) $n(A \cup B)$

**4.** Write the inverse of: "If $n$ is even, then $n^2$ is even."

**5.** Of 80 respondents, 45 use Facebook, 38 use TikTok, and 20 use both. How many use Facebook only, and how many use neither platform?

**6.** For the sequence $5, 8, 11, 14, \dots$, conjecture a formula for the $n$-th term and compute the 20th term.

### Part II, Unit IV: Statistics (Items 7–14)

**7.** Classify each statement as descriptive or inferential statistics: (a) "The average score of the 40 students in this section is 82." (b) "Based on a sample of 400 voters, we estimate that 56% of all registered voters favor the candidate."

**8.** Identify the sampling design: (a) initial freelancer respondents are asked to refer other freelancers they know; (b) a researcher deliberately hand-picks the ten top-performing students to study their habits; (c) interviewers keep recruiting until they reach exactly 50 male and 50 female respondents.

**9.** A population has $N = 1{,}500$ members. Use Slovin's formula with a 4% margin of error to find the required sample size.

**10.** Estimate a population mean within $E = 2$ units at 90% confidence ($z = 1.645$) with $\sigma = 8$. Find the minimum sample size.

**11.** Using Cochran's formula at 95% confidence ($z = 1.96$), margin of error 5%, and a prior estimate $\hat{p} = 0.3$, find the required sample size.

**12.** For the data set $12, 15, 18, 20, 22, 25, 30, 34$: find the mean, the median, and the mode (if any).

**13.** A shop sold 20 units at ₱50, 30 units at ₱60, and 50 units at ₱80. Compute the weighted mean selling price.

**14.** For the sample $10, 12, 14, 16, 18$: compute the range, the sample variance, and the sample standard deviation.

### Part III, Unit V: Linear Programming (Items 15–20)

**15.** Given the constraints $x + y \le 5$, $2x + y \le 8$, $x \ge 0$, $y \ge 0$: determine whether each of the points $(2, 2)$ and $(4, 2)$ lies in the feasible region. Show the checks.

**16.** A home business makes trays of puto and trays of kutsinta for daily sale. Define appropriate decision variables (in words, with units) for an LP model of this business.

**17.** A feasible region for a minimization problem has corner points $(0, 8)$, $(2, 3)$, and $(6, 0)$. Minimize $C = 4x + 5y$ and state where the minimum occurs.

**18.** A furniture shop makes tables ($x$, profit ₱200 each) and chairs ($y$, profit ₱80 each). Each table uses 8 board-feet of wood and 4 labor-hours; each chair uses 3 board-feet and 2 labor-hours. Available daily: 240 board-feet and 140 labor-hours. Formulate the complete LP model (formulation only).

**19.** Solve graphically: maximize $P = 5x + 4y$ subject to $2x + y \le 10$, $x + 3y \le 15$, $x \ge 0$, $y \ge 0$. List all corner points, evaluate $P$ at each, and state the optimal solution.

**20.** Find the exact intersection point of the boundary lines $x + y = 7$ and $2x + 3y = 18$.

### Part IV, Unit VI: Graph Theory (Items 21–30)

**21.** A graph has vertices $\{P, Q, R, S, T\}$ and edges $(P\text{-}Q), (P\text{-}R), (Q\text{-}R), (Q\text{-}S), (R\text{-}S), (S\text{-}T)$. (a) State the degree of each vertex. (b) Does the graph have an Euler circuit, an Euler path only, or neither? Justify.

**22.** True or false: every connected graph in which all vertices have even degree has an Euler circuit. Cite the relevant theorem.

**23.** A graph has 9 vertices, each of degree 4. How many edges does it have? Show the computation.

**24.** True or false: every edge of a tree is a bridge. Justify briefly.

**25.** For the complete graph $K_6$: (a) what is the degree of each vertex? (b) how many edges does it have?

**26.** State the key rule of Fleury's algorithm concerning bridges.

**27.** Five cities have these pairwise distances: $PQ = 6$, $PR = 3$, $PS = 9$, $PT = 5$, $QR = 4$, $QS = 7$, $QT = 8$, $RS = 5$, $RT = 6$, $ST = 4$. Apply the Nearest Neighbor method starting from $P$ to find a circuit and its total distance.

**28.** Using the same distance table as item 27, apply the Cheapest Link algorithm: list the edges in the order considered (noting any rejections and why), and give the resulting circuit and total distance.

**29.** A network has nodes $v, w, x, y, z$ and weighted edges: $(v\text{-}w) = 7$, $(v\text{-}x) = 2$, $(w\text{-}x) = 4$, $(w\text{-}y) = 6$, $(x\text{-}y) = 3$, $(x\text{-}z) = 8$, $(y\text{-}z) = 5$. Apply Kruskal's algorithm: list the edges in selection order and give the total weight of the minimum spanning tree.

**30.** (a) Four territories form a ring: each borders exactly its two neighbors. What is the chromatic number of the corresponding graph? (b) By the Four-Color Theorem, what is the maximum number of colors any planar map can require?
$md$, 9);

-- ============================================================
-- LOCKED SECTION: final answer key
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a2000001-0001-0001-0002-0000000000e1','activity','Final Mock Exams, Answer Key with Explanations',$md$
Full working for every item of both final mocks. Where a computation appears, redo it on paper alongside the solution, final exams award method points, and this is where you earn them.

### Final Mock Exam A, Answers

**1.** $F_{13} = F_{12} + F_{11} = 144 + 89 = \mathbf{233}$; then $F_{14} = F_{13} + F_{12} = 233 + 144 = \mathbf{377}$.

**2.** | $p$ | $q$ | $p \wedge q$ | $(p \wedge q) \longrightarrow q$ |
|---|---|---|---|
| 1 | 1 | 1 | 1 |
| 1 | 0 | 0 | 1 |
| 0 | 1 | 0 | 1 |
| 0 | 0 | 0 | 1 |

True in every row: **tautology**. Whenever the premise $p \wedge q$ holds, $q$ automatically holds; every other row has a false premise.

**3.** Negate both parts and swap them: "If a graph contains a circuit, then it is not a tree."

**4.** $A = \{2,4,6,8,10,12\}$ and $B = \{3,6,9,12\}$. So $A \cap B = \{6, 12\}$. Then $A \cup B = \{2,3,4,6,8,9,10,12\}$, giving $(A \cup B)' = \{1, 5, 7, 11\}$.

**5.** Coffee only $= 30 - 12 = \mathbf{18}$; tea only $= 25 - 12 = 13$. At least one $= 18 + 13 + 12 = 43$, so neither $= 50 - 43 = \mathbf{7}$.

**6.** The gaps are $4, 6, 8, 10$, so the next gap is 12 and the next term is $30 + 12 = \mathbf{42}$. Each term is $a_n = n(n+1)$: check $1 \cdot 2 = 2$, $2 \cdot 3 = 6$, ..., $6 \cdot 7 = 42$. ✓

**7.** (a) **Interval**, equal degree gaps but 0°C is not "no temperature." (b) **Nominal**, the numbers are labels, not quantities. (c) **Ordinal**, ranked, but the gap between 1st and 2nd need not equal the gap between 2nd and 3rd. (d) **Ratio**, a true zero exists and ₱40,000 is genuinely twice ₱20,000.

**8.** (a) **Systematic**, every $k$-th member from an ordered list. (b) **Stratified random**, proportional random draws from subgroups. (c) **Convenience**, chosen by ease of access. (d) **Cluster**, random groups selected, then everyone inside them.

**9.** $$n = \frac{N}{1 + NE^2} = \frac{2000}{1 + 2000(0.05)^2} = \frac{2000}{1 + 2000(0.0025)} = \frac{2000}{6} \approx 333.33$$

Round **up**: $n = \mathbf{334}$.

**10.** $$n = \frac{(z_{\alpha/2})^2 \sigma^2}{E^2} = \frac{(1.96)^2 (15)^2}{3^2} = \frac{3.8416 \times 225}{9} = \frac{864.36}{9} = 96.04$$

Round up: $n = \mathbf{97}$.

**11.** With no prior estimate, use $\hat{p} = 0.5$:

$$n_0 = \frac{(1.96)^2 (0.5)(0.5)}{(0.05)^2} = \frac{3.8416 \times 0.25}{0.0025} = \frac{0.9604}{0.0025} = 384.16$$

Round up: $n_0 = \mathbf{385}$.

**12.** Sum $= 72+75+75+80+84+90+91 = 567$, so mean $= 567/7 = \mathbf{81}$. With $n = 7$ ordered values, the median is the 4th: $\mathbf{80}$. The mode is $\mathbf{75}$ (appears twice).

**13.** $$\bar{x} = \frac{\sum wx}{\sum w} = \frac{(1.50)(3) + (2.00)(3) + (2.50)(2) + (1.00)(2)}{3+3+2+2} = \frac{4.5 + 6.0 + 5.0 + 2.0}{10} = \frac{17.5}{10} = \mathbf{1.75}$$

**14.** Ordered: $2, 4, 5, 6, 8$. Range $= 8 - 2 = \mathbf{6}$. Mean $= 25/5 = 5$. Squared deviations: $(4-5)^2 + (8-5)^2 + (6-5)^2 + (5-5)^2 + (2-5)^2 = 1 + 9 + 1 + 0 + 9 = 20$.

$$s^2 = \frac{20}{5-1} = \mathbf{5} \qquad s = \sqrt{5} \approx \mathbf{2.24}$$

(Divide by $n - 1 = 4$, not by 5, this is a sample.)

**15.** (a) Decision variables: $x$ and $y$. (b) Objective function: $P = 120x + 90y$, to be maximized. (c) Structural constraints: $3x + 2y \le 180$ and $x + y \le 80$. (d) Non-negativity: $x \ge 0$, $y \ge 0$.

**16.** The decision variables represent physical quantities such as units produced or resources used, and producing a negative quantity is meaningless, so the model restricts every variable to zero or above.

**17.** Evaluate $P = 3x + 4y$ at every corner: $(0,0) \to 0$; $(0,5) \to 20$; $(4,3) \to 12 + 12 = 24$; $(6,0) \to 18$. Maximum $P = \mathbf{24}$ at $(4, 3)$, the optimum sits at a vertex, as LP theory guarantees.

**18.** Let $x$ = batches of pandesal per day, $y$ = batches of ensaymada per day.

$$\text{Maximize } P = 40x + 60y$$

$$\text{subject to } 2x + 3y \le 60 \; \text{(flour)}, \quad x + 2y \le 32 \; \text{(oven-hours)}, \quad x \ge 0, \; y \ge 0$$

**19.** Corner points: $(0,0)$; $(6,0)$ from $x + y = 6$ (check: $6 \le 8$ ✓); $(0,4)$ from $x + 2y = 8$ (check: $4 \le 6$ ✓); and the intersection of the two boundary lines, subtracting $x + y = 6$ from $x + 2y = 8$ gives $y = 2$, so $x = 4$: the point $(4,2)$.

| Corner | $P = 2x + 3y$ |
|---|---|
| $(0,0)$ | $0$ |
| $(6,0)$ | $12$ |
| $(4,2)$ | $8 + 6 = \mathbf{14}$ |
| $(0,4)$ | $12$ |

Optimal solution: $x = 4$, $y = 2$, maximum $P = \mathbf{14}$.

**20.** Subtract the equations: $(3x + 2y) - (x + 2y) = 12 - 8$ gives $2x = 4$, so $x = 2$. Substitute back: $2 + 2y = 8$, so $y = 3$. Intersection: $\mathbf{(2, 3)}$.

**21.** (a) $\deg(A) = 3$ (edges to $B, C, D$), $\deg(B) = 2$, $\deg(C) = 3$, $\deg(D) = 2$. (b) Exactly two vertices ($A$ and $C$) have odd degree, so the graph has an **Euler path only**, no circuit. The path must start at one of $A, C$ and end at the other.

**22.** Every degree is even, so by Euler's theorem the connected graph has an **Euler circuit** (which is also an Euler path, traversed from any starting vertex back to itself).

**23.** The sum of all degrees is twice the number of edges: $2 \times 7 = \mathbf{14}$.

**24.** **No.** The degree sum equals twice the edge count, which is even; if exactly three vertices were odd, the total would be odd. The number of odd-degree vertices must always be even.

**25.** $K_5$ has $\dfrac{n(n-1)}{2} = \dfrac{5 \times 4}{2} = \mathbf{10}$ edges, each of the 5 vertices connects to the other 4, and halving corrects the double count.

**26.** An Euler circuit traverses every **edge** exactly once and returns to the start; a Hamilton circuit visits every **vertex** exactly once and returns to the start (it need not use every edge).

**27.** From $A$, the nearest city is $C$ (4). From $C$, unvisited options are $B$ (6) and $D$ (8), pick $B$. From $B$, only $D$ remains (3). Return $D \to A$ (7).

$$A \to C \to B \to D \to A: \quad 4 + 6 + 3 + 7 = \mathbf{20}$$

**28.** Sort the edges: $(a\text{-}c)=2$, $(c\text{-}e)=3$, $(a\text{-}b)=4$, $(b\text{-}c)=5$, $(d\text{-}e)=7$, $(c\text{-}d)=8$, $(b\text{-}d)=10$.

1. Take $(a\text{-}c) = 2$.
2. Take $(c\text{-}e) = 3$.
3. Take $(a\text{-}b) = 4$.
4. Reject $(b\text{-}c) = 5$, it would close the circuit $a\text{-}b\text{-}c$.
5. Take $(d\text{-}e) = 7$, now all five vertices are connected with $5 - 1 = 4$ edges.

MST edges: $\{a\text{-}c, \; c\text{-}e, \; a\text{-}b, \; d\text{-}e\}$, total weight $2 + 3 + 4 + 7 = \mathbf{16}$.

**29.** (a) A tree with $n = 12$ vertices has $n - 1 = \mathbf{11}$ edges. (b) **True**, a tree contains no circuits, so no edge has an alternate route around it; every edge is a bridge.

**30.** The triangle $A, B, C$ has mutually adjacent vertices, forcing three distinct colors. $D$ touches only $A$, so it can reuse $B$'s color. Chromatic number $= \mathbf{3}$; one valid coloring: $A = 1$, $B = 2$, $C = 3$, $D = 2$.

### Final Mock Exam B, Answers

**1.** From $F_{19} = F_{18} + F_{17}$: $F_{18} = 4{,}181 - 1{,}597 = \mathbf{2{,}584}$. Then $F_{20} = F_{19} + F_{18} = 4{,}181 + 2{,}584 = \mathbf{6{,}765}$.

**2.** | $p$ | $q$ | $p \vee q$ | $q \vee p$ | $(p \vee q) \longleftrightarrow (q \vee p)$ |
|---|---|---|---|---|
| 1 | 1 | 1 | 1 | 1 |
| 1 | 0 | 1 | 1 | 1 |
| 0 | 1 | 1 | 1 | 1 |
| 0 | 0 | 0 | 0 | 1 |

The two disjunctions match in every row (disjunction is order-independent), so the biconditional is a **tautology**.

**3.** (a) $A \cap B = \{d, e\}$. (b) $B \setminus A = \{f, g\}$. (c) $A' = \{f, g, h, i, j\}$. (d) $A \cup B = \{a,b,c,d,e,f,g\}$, so $n(A \cup B) = \mathbf{7}$.

**4.** Negate both parts in place: "If $n$ is not even, then $n^2$ is not even."

**5.** Facebook only $= 45 - 20 = \mathbf{25}$; TikTok only $= 38 - 20 = 18$. At least one $= 25 + 18 + 20 = 63$; neither $= 80 - 63 = \mathbf{17}$.

**6.** Common difference 3 starting at 5: $a_n = 3n + 2$ (check $n = 1$: $5$ ✓). Then $a_{20} = 3(20) + 2 = \mathbf{62}$.

**7.** (a) **Descriptive**, it summarizes the data actually collected from that section. (b) **Inferential**, it generalizes from a 400-voter sample to the whole voting population.

**8.** (a) **Snowball**, participants recruit further participants from their networks. (b) **Purposive**, the researcher's judgment selects specific well-suited subjects. (c) **Quota**, recruiting continues until preset category targets are filled.

**9.** $$n = \frac{1500}{1 + 1500(0.04)^2} = \frac{1500}{1 + 1500(0.0016)} = \frac{1500}{1 + 2.4} = \frac{1500}{3.4} \approx 441.18$$

Round up: $n = \mathbf{442}$.

**10.** $$n = \frac{(1.645)^2 (8)^2}{2^2} = \frac{2.7060 \times 64}{4} = \frac{173.19}{4} = 43.30$$

Round up: $n = \mathbf{44}$.

**11.** $$n_0 = \frac{(1.96)^2 (0.3)(0.7)}{(0.05)^2} = \frac{3.8416 \times 0.21}{0.0025} = \frac{0.8067}{0.0025} = 322.69$$

Round up: $n_0 = \mathbf{323}$.

**12.** Sum $= 12+15+18+20+22+25+30+34 = 176$, so mean $= 176/8 = \mathbf{22}$. With $n = 8$, the median averages the 4th and 5th ordered values: $(20 + 22)/2 = \mathbf{21}$. Every value appears once, so there is **no mode**.

**13.** $$\bar{x} = \frac{(20)(50) + (30)(60) + (50)(80)}{20 + 30 + 50} = \frac{1000 + 1800 + 4000}{100} = \frac{6800}{100} = \mathbf{₱68}$$

**14.** Range $= 18 - 10 = \mathbf{8}$. Mean $= 70/5 = 14$. Squared deviations: $16 + 4 + 0 + 4 + 16 = 40$.

$$s^2 = \frac{40}{4} = \mathbf{10} \qquad s = \sqrt{10} \approx \mathbf{3.16}$$

**15.** Point $(2,2)$: $2 + 2 = 4 \le 5$ ✓ and $2(2) + 2 = 6 \le 8$ ✓, with both coordinates non-negative, **feasible**. Point $(4,2)$: $4 + 2 = 6 > 5$ ✗, the first constraint already fails, so it is **not feasible**.

**16.** Let $x$ = number of trays of puto produced per day and $y$ = number of trays of kutsinta produced per day. (Any clearly worded pair naming the quantity, the product, and the time unit earns full credit.)

**17.** Evaluate $C = 4x + 5y$ at each corner: $(0,8) \to 40$; $(2,3) \to 8 + 15 = 23$; $(6,0) \to 24$. Minimum $C = \mathbf{23}$ at $(2, 3)$.

**18.** Let $x$ = tables made per day, $y$ = chairs made per day.

$$\text{Maximize } P = 200x + 80y$$

$$\text{subject to } 8x + 3y \le 240 \; \text{(wood)}, \quad 4x + 2y \le 140 \; \text{(labor-hours)}, \quad x \ge 0, \; y \ge 0$$

**19.** Corner points: $(0,0)$; $(5,0)$ from $2x + y = 10$ (check: $5 \le 15$ ✓); $(0,5)$ from $x + 3y = 15$ (check: $5 \le 10$ ✓); and the intersection, substitute $y = 10 - 2x$ into $x + 3y = 15$: $x + 30 - 6x = 15$, so $-5x = -15$, $x = 3$, $y = 4$: the point $(3,4)$.

| Corner | $P = 5x + 4y$ |
|---|---|
| $(0,0)$ | $0$ |
| $(5,0)$ | $25$ |
| $(3,4)$ | $15 + 16 = \mathbf{31}$ |
| $(0,5)$ | $20$ |

Optimal solution: $x = 3$, $y = 4$, maximum $P = \mathbf{31}$.

**20.** From $x + y = 7$, $y = 7 - x$. Substitute: $2x + 3(7 - x) = 18$ gives $2x + 21 - 3x = 18$, so $-x = -3$ and $x = 3$, $y = 4$. Intersection: $\mathbf{(3, 4)}$.

**21.** (a) $\deg(P) = 2$, $\deg(Q) = 3$, $\deg(R) = 3$, $\deg(S) = 3$, $\deg(T) = 1$. (Check: degree sum $= 12 = 2 \times 6$ edges ✓.) (b) Four vertices ($Q, R, S, T$) have odd degree, more than two, so the graph has **neither** an Euler circuit nor an Euler path.

**22.** **True.** This is exactly Euler's circuit theorem: a connected graph has an Euler circuit if and only if every vertex has even degree.

**23.** Degree sum $= 9 \times 4 = 36 = 2E$, so $E = \mathbf{18}$ edges.

**24.** **True.** A tree has no circuits, so between the endpoints of any edge there is no alternate route; removing the edge disconnects them.

**25.** (a) Each vertex connects to the other 5, so every degree is $\mathbf{5}$. (b) Edges: $\dfrac{6 \times 5}{2} = \mathbf{15}$.

**26.** Never traverse a bridge unless no other edge remains available, crossing a bridge too early strands the edges on the far side.

**27.** From $P$: nearest is $R$ (3). From $R$: unvisited are $Q$ (4), $S$ (5), $T$ (6), pick $Q$. From $Q$: $S$ (7) or $T$ (8), pick $S$. From $S$: only $T$ (4). Return $T \to P$ (5).

$$P \to R \to Q \to S \to T \to P: \quad 3 + 4 + 7 + 4 + 5 = \mathbf{23}$$

**28.** Sorted edges: $PR = 3$, $QR = 4$, $ST = 4$, $PT = 5$, $RS = 5$, $PQ = 6$, $RT = 6$, $QS = 7$, $QT = 8$, $PS = 9$.

1. Take $PR = 3$.
2. Take $QR = 4$.
3. Take $ST = 4$.
4. Take $PT = 5$, no early circuit; the selected edges form the path $Q\text{-}R\text{-}P\text{-}T\text{-}S$.
5. Reject $RS = 5$, $R$ already has degree 2.
6. Reject $PQ = 6$, $P$ already has degree 2.
7. Reject $RT = 6$, both $R$ and $T$ already have degree 2.
8. Take $QS = 7$, it closes the circuit only now, when all five cities are included.

Circuit: $P \to R \to Q \to S \to T \to P$, total $3 + 4 + 4 + 5 + 7 = \mathbf{23}$, in this network, the same result the Nearest Neighbor method found.

**29.** Sorted edges: $(v\text{-}x)=2$, $(x\text{-}y)=3$, $(w\text{-}x)=4$, $(y\text{-}z)=5$, $(w\text{-}y)=6$, $(v\text{-}w)=7$, $(x\text{-}z)=8$.

1. Take $(v\text{-}x) = 2$.
2. Take $(x\text{-}y) = 3$.
3. Take $(w\text{-}x) = 4$.
4. Take $(y\text{-}z) = 5$, all five nodes are now connected with 4 edges, so stop.

MST edges: $\{v\text{-}x, \; x\text{-}y, \; w\text{-}x, \; y\text{-}z\}$, total weight $2 + 3 + 4 + 5 = \mathbf{14}$.

**30.** (a) A four-territory ring is an even cycle: alternate two colors around the ring, and no neighbors clash. Chromatic number $= \mathbf{2}$. (b) By the Four-Color Theorem, at most $\mathbf{4}$ colors are ever required for a planar map.
$md$, 10);
