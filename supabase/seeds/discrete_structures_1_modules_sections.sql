-- ============================================================
-- Discrete Structures 1, Modules & Sections
-- Subject ID: 10000000-0001-0002-0001-000000000002
-- Run after 1st_year_subjects.sql
-- ============================================================

DELETE FROM modules WHERE subject_id = '10000000-0001-0002-0001-000000000002';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('b1000001-0001-0002-0001-000000000001','10000000-0001-0002-0001-000000000002','Lesson 1: Propositional Logic','lesson-1-propositional-logic',1),
  ('b1000001-0001-0002-0001-000000000002','10000000-0001-0002-0001-000000000002','Lesson 2: Proof Techniques in Propositional Logic','lesson-2-proof-techniques',2),
  ('b1000001-0001-0002-0001-000000000003','10000000-0001-0002-0001-000000000002','Lesson 3: Predicate Logic and Quantifiers','lesson-3-predicate-logic',3),
  ('b1000001-0001-0002-0001-000000000004','10000000-0001-0002-0001-000000000002','Lesson 4: Set Concepts','lesson-4-set-concepts',4),
  ('b1000001-0001-0002-0001-000000000005','10000000-0001-0002-0001-000000000002','Lesson 5: Relations and Their Properties','lesson-5-relations',5),
  ('b1000001-0001-0002-0001-000000000006','10000000-0001-0002-0001-000000000002','Lesson 6: Basic Counting Principles','lesson-6-counting',6),
  ('b1000001-0001-0002-0001-000000000007','10000000-0001-0002-0001-000000000002','Lesson 7: Summation and Series','lesson-7-summation',7),
  ('b1000001-0001-0002-0001-000000000008','10000000-0001-0002-0001-000000000002','Lesson 8: Mathematical Induction','lesson-8-induction',8),
  ('b1000001-0001-0002-0001-000000000009','10000000-0001-0002-0001-000000000002','Lesson 9: Introduction to Graphs','lesson-9-graphs',9);

-- ============================================================
-- LESSON 1: Propositional Logic
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('b1000001-0001-0002-0001-000000000001','content','Propositional Logic',$md$
Logic gives mathematical statements precise meaning and lets us judge whether arguments are valid. It has practical uses in circuit design, program construction, and program verification.

### What Is a Proposition?

A **proposition** is a declarative statement that carries a truth value, it is either true or false, with no middle ground. Propositions are sometimes called atomic statements.

Example: Consider three propositions:
- P: A grizzly is a bear.
- Q: A bear is a mammal.
- R: A grizzly is a mammal.

These can be combined: P ∧ Q → R ("If a grizzly is a bear and a bear is a mammal, then a grizzly is a mammal.")

### Simple vs. Complex Statements

A **simple statement** contains only a single idea with no logical connectives. They are typically represented by uppercase letters (P, Q, R, ...).

A **complex statement** combines two or more simple statements using one or more logical connectives. There are five connective types in propositional logic:

- Negation
- Conjunction
- Disjunction
- Conditional
- Biconditional

### Logical Connectives

#### Negation (¬ or ~)
A negation reverses the truth value of a statement. If P is true, then ¬P is false, and vice versa.

The negation symbol represents phrases like: "not", "it is not the case that", "it is false that".

> **Tip:** When translating to symbolic form, keep simple statements positive where possible. Negating a statement is different from simply denying it.

#### Conjunction (∧ or &)
A conjunction claims that **both** of two statements are true simultaneously. It is represented by ∧, &, or •.

Conjunction keywords: *and, but, also, however, yet, still, moreover, although, nevertheless, both*

Example: "It is raining and my sunroof is open" → R ∧ O

#### Disjunction (∨)
A disjunction claims that **at least one** of two statements is true. It uses the symbol ∨ (called "vel").

Disjunction keywords: *or, unless, either, neither*

Example: "I will go to the movies or stay home" is true as long as at least one option is chosen.

#### Conditional (→)
A conditional (or implication) is false **only** when the hypothesis (antecedent) is true but the conclusion (consequent) is false.

Form: P → Q ("If P, then Q")

- **Antecedent** (P): the part before the arrow
- **Consequent** (Q): the part after the arrow

Conditional keywords: *if, if…then, only if, whenever, when, implies, provided that, means, entails, is a sufficient condition for, is a necessary condition for, given that, on the condition that, in case*

> **Important:** Order matters in a conditional. Unlike conjunction and disjunction, swapping P and Q changes meaning and truth value.

##### The Three Related Forms of a Conditional

Given: "If it rains tonight (P), I will sleep well (Q)."

| Form | Structure | Example |
|---|---|---|
| Inverse | ¬P → ¬Q | "If it does not rain tonight, I will not sleep well." |
| Converse | Q → P | "I will sleep well if it rains tonight." |
| Contrapositive | ¬Q → ¬P | "I will not sleep well if it does not rain tonight." |

#### Necessary and Sufficient Conditions
- A **sufficient condition** guarantees the truth of something else (P → Q: P is sufficient for Q).
- A **necessary condition** must hold for something else to be true (P → Q: Q is necessary for P).
- "Only if" introduces the **consequent**, not the antecedent.

#### Biconditional (↔)
A biconditional holds when a condition is both necessary **and** sufficient. It is true whenever both sides have the same truth value.

Form: P ↔ Q ("P if and only if Q")

Biconditional keywords: *if and only if, when and only when, just in case, is a necessary and sufficient condition for*

> Unlike conditionals, order does not change the meaning of a biconditional.

### Translating English into Propositional Logic

Assign letter variables to simple statements, then build compound statements using connectives.

Example, define:
- V: Victor hit the ball.
- R: Reineil caught the ball.
- L: Lucas chased the ball.

| English sentence | Symbolic form |
|---|---|
| Victor did not hit the ball | ¬V |
| Either Victor hit or Reineil caught | V ∨ R |
| Lucas chased, but Reineil caught | L ∧ R |
| If Reineil caught, Lucas did not chase | R → ¬L |
| Lucas chased if and only if Victor hit | L ↔ V |

**Identifying the main connective:**

| Formula | Main Operator | Sentence Type |
|---|---|---|
| P | None | Simple |
| ¬P ∧ Q | ∧ | Conjunction |
| ¬(P ∧ Q) | ¬ | Negation |
| P ∨ (Q → R) | ∨ | Disjunction |
| [(P ∧ ¬Q) ↔ R] → P | → | Conditional |

### Syntax and Semantics

**Syntax** describes the formal structure of logical expressions, the rules for building valid formulas.

**Semantics** deals with the meaning of those expressions, specifically, their truth values.

**Symbols used:**
- Proposition letters: P, Q, R, ..., X, Y, Z
- Unary operator: ¬ (negation)
- Binary connectives: ∧, ∨, →, ↔
- Grouping symbols: ( ), [ ]

#### Well-Formed Formulas (WFF)

A formula is well-formed if it satisfies these rules:
1. Any single capital letter is a WFF.
2. If φ is a WFF, then ¬φ is also a WFF.
3. If φ and ψ are WFFs, then (φ ∧ ψ), (φ ∨ ψ), (φ → ψ), and (φ ↔ ψ) are all WFFs.

> **Parentheses matter:** ¬(P ∧ Q) and ¬P ∧ Q are different formulas with different truth values.

### Truth Tables

A truth table lists every possible combination of truth values for the variables in a formula, and shows the resulting truth value of the whole formula.

Number of rows = 2ⁿ, where n = number of distinct variables.

#### Negation (¬P)
| P | ¬P |
|---|---|
| T | F |
| F | T |

#### Conjunction (P ∧ Q)
True only when both P and Q are true.
| P | Q | P ∧ Q |
|---|---|---|
| T | T | T |
| T | F | F |
| F | T | F |
| F | F | F |

#### Disjunction (P ∨ Q)
False only when both P and Q are false.
| P | Q | P ∨ Q |
|---|---|---|
| T | T | T |
| T | F | T |
| F | T | T |
| F | F | F |

#### Conditional (P → Q)
False only when P is true and Q is false.
| P | Q | P → Q |
|---|---|---|
| T | T | T |
| T | F | F |
| F | T | T |
| F | F | T |

#### Contrapositive (¬Q → ¬P)
| P | Q | ¬Q → ¬P |
|---|---|---|
| T | T | T |
| T | F | F |
| F | T | T |
| F | F | T |

#### Biconditional (P ↔ Q)
True when P and Q have the same truth value.
| P | Q | P ↔ Q |
|---|---|---|
| T | T | T |
| T | F | F |
| F | T | F |
| F | F | T |

### Nature of Propositions

- **Tautology:** A proposition that is always true regardless of variable values. The last column of its truth table contains only T.
- **Contradiction:** A proposition that is always false. The last column contains only F.
- **Contingency:** A proposition that is neither always true nor always false, the last column contains both T and F.

### Logically Equivalent Statements

Two compound statements are **logically equivalent** (≡) when they have identical truth values for every possible combination of variable values.

Example: P → Q ≡ ¬P ∨ Q

Proof by truth table:

| P | Q | P → Q | ¬P | ¬P ∨ Q |
|---|---|---|---|---|
| T | T | T | F | T |
| T | F | F | F | F |
| F | T | T | T | T |
| F | F | T | T | T |

Both columns match, confirming the equivalence.
$md$, 1),

('b1000001-0001-0002-0001-000000000001','activity','Exercises, Propositional Logic',$md$
## Exercise 1.1, Identifying Propositions

Which of the following are propositions?
1. Study hard!
2. The Apple Macintosh is a 16-bit computer.
3. 1 is an even number.
4. Why are we here?
5. 8 + 7 = 13

## Exercise 1.2, Negation and Symbolization

Let p = "x < 50" and q = "x > 40". Write as simply as you can:
a. ¬p
b. ¬q
c. p ∧ q
d. p ∨ q
e. ¬p ∧ q
f. ¬p ∧ ¬q

## Exercise 1.3, Symbolic Notation

Let C = "Critical thinker", D = "Dota player", S = "Studying well".

1. Von is a Dota player.
2. If Miguel is a critical thinker and not studying well, then he is a Dota player.
3. Sae is studying well and a Dota player.
4. What is the negation of "All cows eat grass"?
5. If p = "You tell everyone to support the government" and q = "You are blinded by privilege", write the symbolic notation for "If you tell everyone to support the government, then you are blinded by privilege."

## Exercise 1.4, Truth Tables (Construction)

Construct the truth table for each of the following:
1. P ∧ (Q ∨ R)
2. (P ∧ Q) ∨ R
3. (P ∧ ¬Q) ∨ ¬P
4. P ⇒ (Q ∨ ¬R)
5. ¬((¬P ⇒ Q) ∨ (P ⇒ R))
$md$, 2);

-- ============================================================
-- LESSON 2: Proof Techniques in Propositional Logic
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('b1000001-0001-0002-0001-000000000002','content','Proof Techniques in Propositional Logic',$md$
### Propositional Equivalences

Propositional equivalences are tools for replacing a statement with another that has the same truth value. They are used to simplify and validate arguments.

| Name | Law |
|---|---|
| Idempotence | P ≡ P ∨ P ; P ≡ P ∧ P |
| Commutative | (P ∨ Q) ≡ (Q ∨ P) ; (P ∧ Q) ≡ (Q ∧ P) |
| Associative | (P ∨ (Q ∨ R)) ≡ ((P ∨ Q) ∨ R) ; similar for ∧ |
| De Morgan's | ¬(P ∨ Q) ≡ (¬P ∧ ¬Q) ; ¬(P ∧ Q) ≡ (¬P ∨ ¬Q) |
| Distributive | (P ∧ (Q ∨ R)) ≡ ((P ∧ Q) ∨ (P ∧ R)) ; similar for ∨ |
| Material Equivalence | (P ↔ Q) ≡ ((P → Q) ∧ (Q → P)) |
| Involution | P ≡ ¬¬P |
| Material Implication | (P → Q) ≡ (¬P ∨ Q) |
| Exportation | ((P ∧ Q) → R) ≡ (P → (Q → R)) |
| Identity (OR True) | (P ∨ TRUE) ≡ TRUE |
| Identity (OR False) | (P ∨ FALSE) ≡ P |
| Identity (AND True) | (P ∧ TRUE) ≡ P |
| Identity (AND False) | (P ∧ FALSE) ≡ FALSE |
| Contradiction | (P ∧ ¬P) ≡ FALSE |

**What each law means in plain language:**

- **Idempotence:** "A is smart" is equivalent to "A is smart or A is smart." Redundant but logically valid.
- **Commutative:** Order doesn't matter in ∧ and ∨: "A and B" is the same as "B and A."
- **Associative:** Grouping doesn't matter in ∧ and ∨: (A ∨ B) ∨ C = A ∨ (B ∨ C).
- **De Morgan's:** The negation of a conjunction is a disjunction of negations, and vice versa.
- **Distributive:** AND distributes over OR, and OR over AND.
- **Material Implication:** P → Q is equivalent to ¬P ∨ Q. Useful for converting conditionals.
- **Involution:** Double negation cancels: ¬¬P = P.
- **Exportation:** "If A and B, then C" can be rewritten as "If A, then if B then C."

### Rules of Inference

Rules of inference allow us to derive new true statements from known premises.

| Rule | Form |
|---|---|
| Addition | P ∴ P ∨ Q |
| Simplification | P ∧ Q ∴ P (or ∴ Q) |
| Conjunction | P, Q ∴ P ∧ Q |
| Absorption | P → Q ∴ P → (P ∧ Q) |
| Modus Ponens | P → Q, P ∴ Q |
| Modus Tollens | P → Q, ¬Q ∴ ¬P |
| Disjunctive Syllogism | P ∨ Q, ¬P ∴ Q |
| Hypothetical Syllogism | P → Q, Q → R ∴ P → R |
| Constructive Dilemma | (P → Q) ∧ (R → S), P ∨ R ∴ Q ∨ S |
| Destructive Dilemma | (P → Q) ∧ (R → S), ¬Q ∨ ¬S ∴ ¬P ∨ ¬R |
| Decomposing a Conjunction | P ∧ Q, P ∴ Q |

**Rule explanations:**

- **Modus Ponens:** "If P then Q; P is true; therefore Q is true." The workhorse of logical deduction.
- **Modus Tollens:** "If P then Q; Q is false; therefore P must be false." Uses contrapositive reasoning.
- **Hypothetical Syllogism (Chain):** If A leads to B and B leads to C, then A leads to C.
- **Disjunctive Syllogism:** "Either A or B is true; A is false; therefore B must be true."

#### Worked Example: Proof of Validity

Given premises:
- a. ¬Q → R
- b. ¬R ∧ P
- c. ¬(Q ∧ ¬R) / ∴ R

| Step | Statement | Justification |
|---|---|---|
| 1 | ¬Q → R | Premise (a) |
| 2 | ¬R ∧ P | Premise (b) |
| 3 | ¬(Q ∧ ¬R) | Premise (c) |
| 4 | ¬R | Simplification (from 2) |
| 5 | ¬Q ∨ ¬¬R | De Morgan's (from 3) |
| 6 | ¬Q ∨ R | Double Negation (from 5) |
| 7 | ¬¬Q | Modus Tollens (from 1 and 4) |
| 8 | R | Disjunctive Syllogism (from 6 and 7) |

### Arguments and Validity

An **argument** has two components: one or more **premises** (the given statements) and a **conclusion**.

An argument is **valid** when the conclusion is true whenever all premises are true. If it fails this test, it's a **fallacy**.

**Method for checking validity using truth tables:**

1. Rewrite the argument as a conditional: [(P₁ ∧ P₂ ∧ ... ∧ Pₙ) → C]
2. Build the truth table.
3. If the final column is all T (a tautology), the argument is valid.

**Example:**

Premises: P → Q (If one loves biology, one loves science), P (loves biology)
Conclusion: ∴ Q (loves science)

Conditional to test: [(P → Q) ∧ P] → Q

| P | Q | P→Q | (P→Q) ∧ P | [(P→Q) ∧ P] → Q |
|---|---|---|---|---|
| T | T | T | T | T |
| T | F | F | F | T |
| F | T | T | F | T |
| F | F | T | F | T |

All T → tautology → argument is **valid**.
$md$, 1),

('b1000001-0001-0002-0001-000000000002','activity','Exercises, Proof Techniques',$md$
## Exercise 2.1, Identify the Law

Identify which equivalence law applies in each case:

a. (P ∧ Q) ∧ T ≡ P ∧ Q
b. P ∧ (Q ∧ R) ≡ (P ∧ Q) ∧ R
c. ¬(P ∨ Q) ≡ ¬P ∧ ¬Q
d. P ∧ Q ≡ Q ∧ P
e. [¬(¬P) ∨ Q] ≡ P ∨ Q

## Exercise 2.2, Prove Equivalences Using Laws

Use propositional equivalence laws to prove each of the following:

1. P ∧ (¬P ∨ Q) ≡ P ∧ Q
2. P ∨ (¬P ∧ Q) ≡ P ∨ Q
3. ¬(P ∧ Q) ∧ (¬P ∨ Q) ≡ ¬P
4. P ∨ (P ∧ Q) ≡ P
5. [(P ∨ Q) ∧ (P ∨ ¬Q)] ∨ R ≡ P ∨ (Q ∨ R)

## Exercise 2.3, Validity Using Truth Tables

Use truth tables to determine whether each argument form is a tautology and whether the argument is valid or a fallacy.

1. P → Q, Q → R ∴ ¬R → ¬P
2. P → Q, ¬P ∴ P
3. (P ∧ Q) ∧ (Q ∧ P), P ∴ P ∨ Q
4. [(P→Q) ∧ (Q→R)] → (¬Q → ¬R)
5. (P ∧ Q) → R, ¬P ∨ ¬Q ∴ ¬R
$md$, 2);

-- ============================================================
-- LESSON 3: Predicate Logic and Quantifiers
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('b1000001-0001-0002-0001-000000000003','content','Predicate Logic and Quantifiers',$md$
### Why Predicate Logic?

Propositional logic handles individual statements, but it cannot express relationships involving general quantities like "all" or "some." Predicate logic extends propositional logic to handle these kinds of statements.

For example, from "Every computer on a network is functioning normally" and "Machine X is on the network," we can conclude "Machine X is functioning normally." Propositional logic alone cannot make this deduction, predicate logic can.

### Predicates

In everyday grammar, a sentence has a subject and a predicate. In logic, a **predicate** describes a property that a subject (variable) may or may not have. Predicates are functions that return a truth value.

Example:
- Statement: "Y is greater than 5."
- Subject: Y
- Predicate: "is greater than 5" → K(Y)
- K(Y) is true when Y > 5 and false otherwise.

The **domain** of a predicate variable is the set of all values the variable can take.

### Quantifiers

Quantifiers specify how broadly a predicate applies across a domain.

#### Universal Quantifier (∀)
Means "for all" or "for every." The expression ∀x ∈ D, P(x) is true only if P(x) holds for **every** element in the domain D.

Example: "All foxes are sly."
- F(x): x is a fox.
- S(x): x is sly.
- Symbolic form: ∀x[F(x) → S(x)]

#### Existential Quantifier (∃)
Means "there exists at least one." The expression ∃x ∈ D, P(x) is true if P(x) holds for **at least one** element in D.

Example: "Some students are attending online classes."
- S(x): x is a student.
- O(x): x attends online classes.
- Symbolic form: ∃x[S(x) ∧ O(x)]

### Rules of Inference for Quantifiers

| Rule | Form |
|---|---|
| Universal Instantiation | ∀x P(x) ∴ P(c) |
| Universal Generalization | P(c) for arbitrary c ∴ ∀x P(x) |
| Existential Generalization | P(c) for some c ∴ ∃x P(x) |
| Existential Instantiation | ∃x P(x) ∴ P(c) for some c in the domain |

**Universal Instantiation** says: if something is true for all elements of a domain, it is true for any specific element.

Worked example:
- All fish are orange. (∀x)[F(x) → O(x)]
- Nemo is a fish. F(n)

Proof:
1. (∀x)[F(x) → O(x)], Hypothesis
2. F(n), Hypothesis
3. F(n) → O(n), Universal Instantiation (1)
4. O(n), Modus Ponens (2, 3)

### Proof Techniques

A **proof** is a logical argument that uses hypotheses, definitions, axioms, and inference rules to demonstrate that a conclusion is true.

#### Direct Proof
Assume the hypothesis is true, then use logical reasoning to show the conclusion follows.

Example: Prove that if k and g are both odd integers, then k + g is even.
- Let k = 2h + 1 and g = 2b + 1
- k + g = (2h + 1) + (2b + 1) = 2h + 2b + 2 = 2(h + b + 1)
- Since this is twice an integer, k + g is even.

#### Proof by Contrapositive
To prove P → Q, instead prove ¬Q → ¬P.

Example: Prove that if rl is even, then r is even or l is even.
- Contrapositive: If both r and l are odd, then rl is odd.
- Let r = 2a + 1 and l = 2b + 1
- rl = (2a+1)(2b+1) = 4ab + 2a + 2b + 1 = 2(2ab + a + b) + 1 (odd) ✓

#### Proof by Cases
When the hypothesis can be divided into separate cases, prove each case separately.

Example: Prove that if integer y is not divisible by 3, then y² = 3k + 1 for some integer k.
- Case 1: y = 3m + 1 → y² = (3m+1)² = 3(3m² + 2m) + 1 ✓
- Case 2: y = 3m + 2 → y² = (3m+2)² = 3(3m² + 4m + 1) + 1 ✓

#### Existence Proof
Proves ∃x P(x). Two types:
1. **Constructive:** Find a specific value c and show P(c) is true.
2. **Nonconstructive (Proof by Contradiction):** Show that the negation leads to a contradiction.

#### Biconditional Proof
To prove P ↔ Q, prove both P → Q and Q → P separately.

Example: Prove that for any integer h, h is odd if and only if h² is odd.
- (→) Direct proof: h = 2a + 1 → h² = 4a² + 4a + 1 = 2(2a² + 2a) + 1, which is odd.
- (←) Contrapositive: If h is even (h = 2a), then h² = 4a², which is even.
$md$, 1),

('b1000001-0001-0002-0001-000000000003','activity','Exercises, Predicate Logic and Proofs',$md$
## Exercise 3.1, Quantifier Translation

Using H(x): "x is a student", E(x): "x is happy", Y(x): "x likes Taylor Swift":

Express symbolically:
1. All students are happy.
2. Some happy students like Taylor Swift.
3. Everyone who likes Taylor Swift is a sad student.
4. Only happy students like Taylor Swift.
5. Some happy students don't like Taylor Swift.

## Exercise 3.2, Proofs

1. Write the contrapositive of: "For all integers p and q, if p + q is even, then p and q are both even."
2. Is the original statement true or false? Prove your answer.
3. Is the contrapositive true or false? Prove your answer.
4. Show that √2 is irrational. (Use proof by contradiction.)
5. Show that if p and q are both perfect squares, then pq is also a perfect square. (Use direct proof.)
$md$, 2);

-- ============================================================
-- LESSON 4: Set Concepts
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('b1000001-0001-0002-0001-000000000004','content','Set Concepts',$md$
### What Is a Set?

A **set** is an unordered collection of distinct elements. Sets group objects that share (or are selected by) some property. Sets are the foundational structure of discrete mathematics.

### Representing Sets

#### 1. Roster (Tabular) Form
List all elements, separated by commas, enclosed in curly braces.

Examples:
- First six natural numbers: N = {1, 2, 3, 4, 5, 6}
- Vowels: V = {a, e, i, o, u}
- Even numbers less than 9: X = {2, 4, 6, 8}

#### 2. Set-Builder Notation
Describe all elements using a rule or condition.

Examples:
- P = {x | x is a counting number and x > 12}
- A = {x | x is an even number, 4 < x < 16}

#### 3. Cardinality
The **cardinality** of a set is its size, the number of distinct elements. Written as |A|.

Examples:
- A = {2, 4, 6, 8, 12} → |A| = 5
- B = {1, 2, 3, 3, 4, 6, 8} → |B| = 6 (3 appears twice but counts once)

### Set Operations

#### Union (∪)
All elements belonging to either set A or set B (or both).

A ∪ B = {x | x ∈ A or x ∈ B}

Example: A = {1, 2, 5, 8}, B = {1, 3, 4, 6, 7}
A ∪ B = {1, 2, 3, 4, 5, 6, 7, 8}

#### Intersection (∩)
Only the elements that appear in **both** A and B.

A ∩ B = {x | x ∈ A and x ∈ B}

Example: A = {1, 2, 3, 4}, B = {2, 4, 6, 8}
A ∩ B = {2, 4}

#### Complement (Aᶜ or A')
All elements in the universal set U that are **not** in A.

Example: A = {1, 2, 3, 4}, U = {1, 2, 3, 4, 5, 6, 7, 8}
A' = {5, 6, 7, 8}

#### Difference (A − B)
Elements in A that are **not** in B.

A − B = {x | x ∈ A and x ∉ B}

Example: A = {1, 2, 3, 4, 5}, B = {3, 4}
A − B = {1, 2, 5}

#### Cartesian Product (A × B)
The set of all ordered pairs (a, b) where a ∈ A and b ∈ B.

|A × B| = |A| × |B|

Example: A = {1, 2}, B = {a, b}
A × B = {(1,a), (1,b), (2,a), (2,b)}

### De Morgan's Laws for Sets

- (A ∪ B)ᶜ = Aᶜ ∩ Bᶜ
- (A ∩ B)ᶜ = Aᶜ ∪ Bᶜ

These mirror De Morgan's laws for propositional logic.

### Inclusion-Exclusion Principle

When counting the union of two sets where some elements overlap:

|A ∪ B| = |A| + |B| − |A ∩ B|

For three sets:

|A ∪ B ∪ C| = |A| + |B| + |C| − |A ∩ B| − |A ∩ C| − |B ∩ C| + |A ∩ B ∩ C|
$md$, 1),

('b1000001-0001-0002-0001-000000000004','activity','Exercises, Set Concepts',$md$
## Exercise 4.1, Set Operations

Given: U = {1,2,3,4,5}, A = {1,2,3}, B = {5}
1. A'
2. A ∩ B
3. A' ∩ B

Given: U = {1,2,3,4,5,6}, A = {1,2,3}, B = {2,3,4}, C = {1,5}
4. A ∩ B ∪ C
5. A' ∪ B ∩ C'
6. B ∪ C ∩ A
7. A' ∪ B' ∩ C'

## Exercise 4.2, Set Representation

Write each set in both Roster Form and Set-Builder Notation:
1. Natural numbers that divide 12.
2. Odd numbers between 18 and 30.
3. Even natural numbers less than 15.
4. Names of the last five months of a year.
5. Letters used in the word "DUPLICATE".

## Exercise 4.3, Inclusion-Exclusion Problems

1. In a group of 65 people, 40 like hockey and 35 like cricket. 20 like both. How many like neither?

2. In a survey of 200 students: 105 study math, 155 study science, 30 study both. How many study neither?

3. In a group of 75 people, 28 speak English, 47 speak Italian. Find how many speak: (a) English only, (b) Italian only, (c) both languages.

4. Art students earned medals: 40 in dancing, 12 in theater, 18 in painting. 50 students got medals total, 8 received all three. How many received exactly two?
$md$, 2);

-- ============================================================
-- LESSON 5: Relations and Their Properties
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('b1000001-0001-0002-0001-000000000005','content','Relations and Their Properties',$md$
### What Is a Relation?

A **relation** describes how elements from one set correspond to elements of another (or the same) set. A **binary relation** is a set of ordered pairs (a, b).

Notation: a R b means (a, b) ∈ R. The **domain** of a relation is the set of all first elements; the **range** is the set of all second elements.

### Representing Relations

1. **Relation as a Table**, Mark each ordered pair with 1 (true) or 0 (false).
2. **Arrow Diagram**, Draw arrows from each domain element to its range elements.
3. **Directed Graph (Digraph)**, Vertices for elements, arrows for ordered pairs. A pair (a, a) creates a **self-loop**.

### Properties of Relations

#### Reflexive
Every element is related to itself: ∀a, (a, a) ∈ R.

Common reflexive relations: =, ≥, ≤; Non-reflexive: >, <

**Irreflexive:** No element is related to itself: ∀a, (a, a) ∉ R.

In a digraph, reflexive relations have a self-loop at every vertex.

#### Symmetric
If (a, b) ∈ R then (b, a) ∈ R for all a, b.

**Asymmetric:** If (a, b) ∈ R then (b, a) ∉ R.

#### Antisymmetric
If both (a, b) ∈ R and (b, a) ∈ R, then a = b.

#### Transitive
If (a, b) ∈ R and (b, c) ∈ R, then (a, c) ∈ R.

### Ordering Relations

#### Partial Order
A relation R on set A is a **partial order** if it is reflexive, antisymmetric, and transitive. A set with a partial order is called a **poset**.

#### Total Order (Linear Order)
A partial order where every pair of elements is comparable.

### Function Notation

A **function** f from set A to set B maps every element of A to exactly one element of B.

Example 1: Given f(x) = 3x − 5, find f(2).
- f(2) = 3(2) − 5 = 1

Example 2: Find g(4w) when g(x) = x² − 2x + 1.
- g(4w) = (4w)² − 2(4w) + 1 = 16w² − 8w + 1

### Operations on Functions

Given functions f and g:
- (f + g)(x) = f(x) + g(x)
- (f − g)(x) = f(x) − g(x)
- (f · g)(x) = f(x) · g(x)
- (f/g)(x) = f(x)/g(x), where g(x) ≠ 0

### Composition of Functions

The **composition** (f ∘ g)(x) = f(g(x)), apply g first, then feed the result into f.

In general, f ∘ g ≠ g ∘ f.

Example: Let g(x) = 2x and f(x) = x + 1.
- g ∘ f(1) = g(f(1)) = g(2) = 4
- f ∘ g(1) = f(g(1)) = f(2) = 3

### Pigeonhole Principle

**Statement:** If n + 1 or more objects are distributed into n containers, then at least one container holds two or more objects.

Example 1: In a room with more than 366 people, at least two share the same birthday.

Example 2: If a class has 14 boys and 22 girls (36 total), at minimum 15 members guarantees at least one female.
$md$, 1),

('b1000001-0001-0002-0001-000000000005','activity','Exercises, Relations and Functions',$md$
## Exercise 5.1, Relation Properties

For each relation, determine whether it is reflexive, symmetric, antisymmetric, or transitive:

1. R₁ = {(1,1), (1,2), (2,1)}
2. R₂ = {(1,2), (2,3), (3,4), (1,3), (2,4)}
3. R₃ = {(1,1), (2,2), (1,3), (3,1), (3,4), (3,3), (4,4)}

## Exercise 5.2, Function Evaluation

1. f(x) = x² + 7x − 24; find f(0), f(−1), f(3)
2. f(x) = (x+5)/(x−5); find f(4), f(6), f(15)
3. Given f(x) = x² − x + 16 and f(w) = 12, find w.

## Exercise 5.3, Composition of Functions

1. Let f(x) = 3x + 4. Find (f ∘ f)(x).
2. Let f(x) = 2x + 1 and g(x) = x + 3.
   A. Find (f ∘ g)(x)
   B. Find (g ∘ f)(x)
   C. Find (g ∘ g)(x)

## Exercise 5.4, Pigeonhole Principle

1. How many handkerchiefs must John pull from a box containing 1 pair each of yellow, red, blue, and black handkerchiefs to guarantee he has a matching pair?
2. How many cards must you draw from a standard deck to guarantee at least two spades?
3. A woman has 45 pairs of sandals and wears one pair per day. How many days before she must repeat?
$md$, 2);

-- ============================================================
-- LESSON 6: Basic Counting Principles
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('b1000001-0001-0002-0001-000000000006','content','Basic Counting Principles',$md$
### The Sum Rule

When a task can be done by **one of two mutually exclusive methods** (you do method A *or* method B, but not both), the total number of ways equals n₁ + n₂.

More generally: |A₁ ∪ A₂ ∪ ... ∪ Aₖ| when the sets are disjoint.

### The Product Rule

When a procedure consists of **sequential steps**, first do task A, then do task B, the total number of ways is n₁ × n₂.

More generally: n₁ × n₂ × n₃ × ... × nₖ for k sequential, independent tasks.

### Permutations

A **permutation** is an ordered arrangement of r items selected from n distinct items.

Formula: P(n, r) = n! / (n − r)!

Example: How many ways can 3 books be arranged on a shelf from a collection of 8?
P(8, 3) = 8! / 5! = 8 × 7 × 6 = 336

**Permutations with Repetition:**
If repetition is allowed, the count for r selections from n items = nʳ.

### Combinations

A **combination** is a selection of r items from n distinct items where **order does not matter**.

Formula: C(n, r) = n! / (r! × (n − r)!)

Example: How many ways can 3 students be chosen from a group of 10 for a committee?
C(10, 3) = 10! / (3! × 7!) = 120

**Combinations with Repetition:**
When repetition is allowed:
C(n + r − 1, r) = (n + r − 1)! / (r! × (n − 1)!)

Example: How many ways can you choose 4 items from 5 categories (repetition allowed)?
C(5 + 4 − 1, 4) = C(8, 4) = 70
$md$, 1),

('b1000001-0001-0002-0001-000000000006','activity','Exercises, Counting Principles',$md$
## Exercise 6.1, Sum and Product Rules

1. A menu has 23 dishes and 6 desserts. If you can choose only one item per day, how many days before you've tried everything?
2. How many 3-digit numeric passwords (0–9) can be created (digits can repeat)?
3. A club of 40 males and 20 females must pick 1 leader. How many ways to choose?
4. If 2 leaders are needed (1 male, 1 female), how many pairs are possible?

## Exercise 6.2, Permutations and Combinations

1. A house of 10 people: how many ordered arrangements of 4 can be made?
2. 15 participants in a raffle: how many ways can 3 names be drawn (order matters)?
3. From 12 books, how many ways can you choose 5?
4. On a circle with 24 points, how many squares have all corners on the circle?
5. 6 non-collinear points on a plane: how many line segments can be formed?
$md$, 2);

-- ============================================================
-- LESSON 7: Summation and Series
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('b1000001-0001-0002-0001-000000000007','content','Summation and Series',$md$
### Sequences

A **sequence** is an ordered list of numbers. It may be finite or infinite.

Notation: a₁, a₂, a₃, ..., aₙ

Example: {1, 2, 3, 4, ...} where aₙ = n.

### Arithmetic Progression

An **arithmetic progression** is a sequence where consecutive terms have a constant difference called the **common difference (d)**.

d = a₂ − a₁

**Recursive formula (nth term):**
aₙ = a₁ + d(n − 1)

Example: {40, 37, 34, 31, ...}
d = 37 − 40 = −3
a₄ = 40 + (−3)(3) = 31

### Geometric Progression

A **geometric progression** multiplies each term by a constant called the **common ratio (r)**.

r = a₂ / a₁

**nth term formula:**
aₙ = a · r^(n−1)

Example: a = 15, r = 3, find the 5th term.
a₅ = 15 × 3⁴ = 15 × 81 = 1215

### Fibonacci Sequence

A sequence where each term is the sum of the two preceding terms:

xₙ = xₙ₋₁ + xₙ₋₂

Starting from: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, ...

Example: x₈ = x₇ + x₆ = 13 + 8 = 21

### Summation (Sigma Notation)

Summation (∑) is a compact way to write the sum of terms in a sequence.

∑(i=k to n) aᵢ = a_k + a_(k+1) + ... + a_n

Where i = index, k = lower limit, n = upper limit.

Example: ∑(j=3 to 5) (3j − 1) = (3(3)−1) + (3(4)−1) + (3(5)−1) = 8 + 11 + 14 = 33

**Useful standard results:**
- ∑ 1 (from i=1 to n) = n
- ∑ i (from i=1 to n) = n(n+1)/2

### Arithmetic Series

The sum of the first n terms of an arithmetic progression:

S = n × (a₁ + aₙ) / 2

Example: Sum of 2 + 4 + 6 + ... + 100 (n = 50):
S = 50 × (2 + 100) / 2 = 50 × 51 = 2550

### Geometric Series

The sum of the first n terms of a geometric progression:

S = a × (rⁿ − 1) / (r − 1)
$md$, 1),

('b1000001-0001-0002-0001-000000000007','activity','Exercises, Summation and Series',$md$
## Exercise 7.1, Arithmetic Sequences

A. Find the next three terms:
1. {3, 6, 9, 12, 15, ...}
2. {−21, −14, −7, 0, ...}
3. {15, 11, 7, 3, −1, ...}

B. Find the common difference:
4. {99, 199, 299, 399}
5. {266, 282, 298, 314}

## Exercise 7.2, Geometric Sequences

1. Given a₁ = 10 and r = −1, find a₂, a₃, a₄, a₅.
2. Given a₁ = 45 and r = 5, find the 10th term.
3. Find the common ratio: 1, 2/4, 4/16, ...
4. Find the common ratio: 1, 3/4, 9/16, ...

## Exercise 7.3, Fibonacci

1. Find the 15th term of the Fibonacci sequence.
2. Find the 10th term.
3. Find the 20th term.
4. Fill in the blanks: 21, 34, 55, 89, ___, ___
5. Fill in the blanks: 5, 8, 13, 21, ___, ___

## Exercise 7.4, Summation Evaluation

Evaluate:

1. ∑ 2i (i = 1 to 5)
2. ∑ 6i (i = 1 to 10)
3. ∑ (4i − 1) (i = 0 to 5)
4. ∑ (−5i + 12) (i = 1 to 50)
5. ∑ (−5i + 12) (i = 1 to 275)
$md$, 2);

-- ============================================================
-- LESSON 8: Mathematical Induction
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('b1000001-0001-0002-0001-000000000008','content','Mathematical Induction',$md$
### What Is Mathematical Induction?

**Mathematical induction** is a proof technique used to verify that a statement P(n) is true for **every** natural number n.

It works on the same logic as dominos: if the first domino falls (base case), and each falling domino causes the next to fall (inductive step), then all dominos eventually fall.

### The Two Steps of Mathematical Induction

**Step 1, Basis Step:**
Show that the statement P(1) is true (or P(0), depending on the starting value).

**Step 2, Inductive Step:**
Assume P(k) is true for an arbitrary natural number k (the **inductive hypothesis**). Then prove that P(k+1) must also be true.

**Formal expression:**
(P(1) ∧ ∀k[P(k) → P(k+1)]) → ∀n P(n)

### Why Two Steps Are Needed

Testing a few values shows a pattern, but does not prove it holds for **all** values. Induction provides the general argument:

1. The statement holds for some specific k (Basis Step says k = 1 works).
2. The statement holding for k forces it to hold for k+1 (Inductive Step).
3. Therefore, it holds for all n ≥ 1.

### What Mathematical Induction Can Prove

- Summation formulas (e.g., 1 + 2 + 3 + ... + n = n(n+1)/2)
- Inequalities (e.g., 2ⁿ > n for all n ≥ 1)
- Divisibility arguments (e.g., 3 | n³ + 2n)
- Properties of algorithms and graphs

> **Note:** Mathematical induction proves existing conjectures; it is not a method for discovering new formulas.

### Worked Example

Prove: 1³ + 2³ + 3³ + ... + n³ = n²(n+1)² / 4

**Basis Step (n = 1):**
LHS = 1³ = 1
RHS = 1²(1+1)² / 4 = 1 × 4 / 4 = 1 ✓

**Inductive Step:**
Assume P(k) is true: 1³ + 2³ + ... + k³ = k²(k+1)² / 4

Show P(k+1): 1³ + 2³ + ... + k³ + (k+1)³ = (k+1)²(k+2)² / 4

Using the inductive hypothesis:
= k²(k+1)²/4 + (k+1)³
= (k+1)²[k²/4 + (k+1)]
= (k+1)²[(k² + 4k + 4) / 4]
= (k+1)²(k+2)² / 4 ✓

Both steps verified, the formula holds for all n.
$md$, 1),

('b1000001-0001-0002-0001-000000000008','activity','Exercises, Mathematical Induction',$md$
## Exercise 8.1, Concept Check

Answer True or False and explain:
1. Mathematical induction confirms a statement is true for every natural number k.
2. There is only one step needed in mathematical induction.
3. In the Basis Step, we verify P(k+10), not P(1).
4. We use k and k+1 in the Inductive Step and Basis Step, respectively.
5. Mathematical induction can be used to discover new formulas.

## Exercise 8.2, Prove Using Induction

1. Prove: n³ + 2n is divisible by 3 for any integer n.
2. Prove: 1³ + 2³ + 3³ + ... + n³ = n²(n+1)² / 4
3. Prove: 1/(1·2) + 1/(2·3) + ... + 1/(n(n+1)) = n/(n+1)
4. Prove: 2^(n+2) + 3^(2n+1) is divisible by 7 for all positive integers n.
5. Is 9ⁿ + 3 divisible by 4? Prove it.
$md$, 2);

-- ============================================================
-- LESSON 9: Introduction to Graphs
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('b1000001-0001-0002-0001-000000000009','content','Introduction to Graphs',$md$
### What Is a Graph?

A **graph** is a structure made of **vertices** (nodes) connected by **edges** (links). Graphs model relationships in almost every field: social networks, transportation, circuits, scheduling, and more.

### Types of Graphs

| Type | Description |
|---|---|
| Simple Graph | No multiple edges between the same pair; no self-loops. |
| Multigraph | Allows multiple edges between the same pair of vertices. |
| Directed Graph (Digraph) | Edges have direction (arrows); relation goes one way. |
| Undirected Graph | Edges have no direction; relation is two-way. |
| Connected Graph | There is a path between any two vertices. |
| Disconnected Graph | At least one pair of vertices has no path between them. |
| Weighted Graph | Edges are assigned numerical values. |

### Graph Terminology

| Term | Definition |
|---|---|
| Vertex | A node or point in the graph. |
| Edge | A connection between two vertices. |
| Adjacent | Two vertices connected by an edge. |
| Degree (deg(v)) | Number of edges incident on vertex v. |
| In-degree | Number of directed edges arriving at a vertex. |
| Out-degree | Number of directed edges leaving a vertex. |
| Loop | An edge that connects a vertex to itself. Contributes 2 to degree. |
| Path | A sequence of vertices connected by edges. |
| Simple Path | A path with no repeated vertices. |
| Circuit | A path that starts and ends at the same vertex. |

Note: degree = in-degree + out-degree (for directed graphs)

### The Handshaking Theorem

For any undirected graph G = (V, E) with m edges:

Sum of all deg(v) = 2m

The sum of all vertex degrees equals twice the number of edges.

**Corollary:** An undirected graph always has an even number of vertices with odd degree.

Example: A graph with 10 vertices each of degree 6:
Sum of degrees = 6 × 10 = 60 = 2m → m = 30 edges.

### Representing Graphs

#### Adjacency Matrix
An n × n matrix where entry (i, j) = 1 if there is an edge from vertex i to vertex j, and 0 otherwise.

- For undirected graphs, the matrix is symmetric.

#### Adjacency List
Each vertex stores a list of its neighbors. More space-efficient for sparse graphs.

### Trees

A **tree** is a connected, acyclic graph, it has no simple circuits.

Properties:
- A tree with n vertices has exactly n − 1 edges.
- There is exactly one path between any two vertices.

#### Types of Trees

| Type | Description |
|---|---|
| General Tree | Each vertex can have any number of children. |
| Rooted Tree | A directed tree with exactly one root (in-degree 0). |
| External Node (Leaf) | A vertex with out-degree 0 (no children). |
| Internal Node | A vertex with out-degree ≥ 1 (has at least one child). |

### Real-World Applications of Graphs

- **Social Networks:** Vertices = people; edges = connections/friendships.
- **Transportation Networks:** Vertices = stops/locations; edges = routes. (Used in GPS mapping.)
- **Network Security:** Vertices = IP addresses; edges = data packets.
- **Compilers:** Used for data flow analysis and code optimization.
- **Robot Planning:** Vertices = robot states; edges = transitions between states.
$md$, 1),

('b1000001-0001-0002-0001-000000000009','activity','Exercises, Introduction to Graphs',$md$
## Exercise 9.1, Graph Types and Terminology

1. A graph's vertex set and edge set are both finite in a ______ graph.
2. In a directed graph modeling a round-robin tournament, what do in-degree and out-degree represent?
3. If a full binary tree has 1000 internal vertices, how many edges does it have?
4. If a tree has 10,000 vertices, how many edges does it have?

## Exercise 9.2, Handshaking Theorem

1. How many edges does a graph have if it has 10 vertices each of degree 4?
2. Can a graph have exactly 5 vertices with odd degree? Explain why or why not.

## Exercise 9.3, Application Problems

1. A tournament uses single-elimination (lose once and you're out). If 1000 people enter, how many games must be played to determine a champion?

2. An email with malicious content automatically sends to 5 new people each time it is opened. Suppose 10,000 people send it before the chain ends. How many people receive the email, and how many mark it as spam?

3. For a course prerequisite system at a university: should edges be directed or undirected? How would you identify courses with no prerequisites? How would you identify courses that are not a prerequisite for any other course?

4. Model a company gathering where we track whether each employee knows the name of every other person. Should edges be directed or undirected? Should loops be allowed?
$md$, 2);
