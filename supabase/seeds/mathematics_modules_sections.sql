-- ============================================================
-- Mathematics in the Modern World, Modules & Sections
-- Subject ID: 10000000-0001-0001-0002-000000000001
-- Run after migration 002 and 1st_year_subjects.sql
-- ============================================================

DELETE FROM modules WHERE subject_id = '10000000-0001-0001-0002-000000000001';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('a2000001-0001-0001-0002-000000000001','10000000-0001-0001-0002-000000000001','Unit I: Patterns and Numbers in Nature','unit-1-patterns-nature',1),
  ('a2000001-0001-0001-0002-000000000002','10000000-0001-0001-0002-000000000001','Unit II: Logic and Sets','unit-2-logic-sets',2),
  ('a2000001-0001-0001-0002-000000000003','10000000-0001-0001-0002-000000000001','Unit III: Mathematical Problem Solving','unit-3-problem-solving',3),
  ('a2000001-0001-0001-0002-000000000004','10000000-0001-0001-0002-000000000001','Unit IV: Data Analytics and Statistical Management','unit-4-statistics',4),
  ('a2000001-0001-0001-0002-000000000005','10000000-0001-0001-0002-000000000001','Unit V: Optimization via Linear Programming','unit-5-linear-programming',5),
  ('a2000001-0001-0001-0002-000000000006','10000000-0001-0001-0002-000000000001','Unit VI: Graph Theory and Network Models','unit-6-graph-theory',6);

-- ============================================================
-- UNIT I: Patterns and Numbers in Nature
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a2000001-0001-0001-0002-000000000001','content','The Scope and Nature of Mathematics',$md$
Mathematics is far more than a collection of arithmetic drills and computational routines. While it forms the bedrock for calculations and quantitative measurements, it functions fundamentally as a systematic language, a framework for logical thinking, and a creative tool for discovering structural regularities. The core objective of mathematics is to bring order to information, allowing us to perceive underlying principles that govern physical reality and abstract configurations. Through the synthesis of intuition, imagination, and structural logic, mathematics reveals deep relationships within both human-designed systems and the natural world.
$md$, 1),

('a2000001-0001-0001-0002-000000000001','content','Pattern Recognition in Nature',$md$
A pattern is an organized configuration or repeating sequence that creates predictability. Humans are naturally predisposed to recognize these occurrences, using them to interpret disorder and anticipate structural changes. Within the natural world, regularities of form manifest in multiple mathematical arrangements.

### Visual Classifications of Geometric Regularities

- **Symmetries:** Balanced proportions or spatial configurations where an object looks identical after undergoing specific transformations like flipping, rotating, or shifting.
- **Fractals:** Complex, self-similar geometric patterns where a structure is repeated infinitely at shrinking scales.
- **Spirals:** Continuous, widening curves that radiate outward from a central point, frequently visible in biological growth forms.
- **Tessellations (Tilings):** Repeating arrangements of shapes that tile a flat plane completely without leaving gaps or creating overlaps. A common example found in biology is a honeycomb, where regular hexagons partition space with geometric precision.
$md$, 2),

('a2000001-0001-0001-0002-000000000001','content','The Mathematics of Symmetry',$md$
Symmetry serves as a primary structural language for patterns, explaining why certain shapes feel inherently organized and orderly. It occurs when an object exhibits congruence in its proportions, spatial distribution, or dimensions.

### Core Symmetry Classifications

#### 1. Bilateral (Reflection) Symmetry

This represents the most intuitive form of geometric balance, often called mirror symmetry. An object exhibits bilateral symmetry if a single line of symmetry (an axis) can divide it into two halves that act as exact mirror images.

Examples: The physical structure of a butterfly, a human face, or a swan.

#### 2. Radial (Rotational) Symmetry

This configuration occurs when a pattern repeats around a fixed central point. An object possesses rotational symmetry if it can be turned around its center by an angle less than 360° and still look completely unchanged.

Examples: A snowflake, a starfish, or a cross-section of a citrus fruit.

```
Bilateral Symmetry (Reflection)        Radial Symmetry (Rotational)
        |                                      \   |   /
    .---|---.                                   \  |  /
   /    |    \                                .----X----.
  |  L  |  R  |                              / \ /   \ / \
   \    |    /                              |---|--O--|---|
    '---|---'                                \ / \   / \ /
        |                                     /  |  \
   Single Axis                               /   |   \
                                         Multiple Axes
```
$md$, 3),

('a2000001-0001-0001-0002-000000000001','content','Planar Symmetries and Conway Classifications',$md$
When geometric elements repeat across a flat plane, they are categorized into three structural groups based on how they extend through space.

### Rosette Patterns

These patterns take a central design motif and rotate or reflect it around a fixed point without expanding into infinity.

- **Cyclic ($C_n$):** Admits only rotational symmetries around the center.
- **Dihedral ($D_n$):** Admits both rotational symmetries and reflectional (bilateral) symmetries.

### Frieze (Border) Patterns

A frieze pattern consists of a foundational design motif that repeats continuously along a single, linear direction. These configurations map onto themselves via horizontal translation. Using a system popularized by mathematician John Conway, these patterns are classified into seven distinct structural groups based on their active symmetries:

| Conway Name | Allowed Symmetries |
|---|---|
| Hop | Translation symmetry only. |
| Step | Translation and glide reflection symmetries only. |
| Sidle | Translation and vertical reflection symmetries only. |
| Spinning Hop | Translation and 180° rotational symmetries (half-turns) only. |
| Spinning Sidle | Translation, vertical reflection, rotation, and glide reflection symmetries. |
| Jump | Translation, horizontal reflection, and glide reflection symmetries. |
| Spinning Jump | Translation, vertical reflection, horizontal reflection, rotation, and glide reflection symmetries. |

### Wallpaper Patterns

These patterns possess translation symmetries along two independent, distinct directions, effectively stacking linear borders to blanket a two-dimensional plane. Combinations of rotation, reflection, and glide reflection govern these structures. Mathematicians have proven that exactly 17 unique, distinct types of wallpaper patterns can exist in a two-dimensional space.
$md$, 4),

('a2000001-0001-0001-0002-000000000001','content','The Fibonacci Sequence and the Golden Ratio',$md$
The Fibonacci sequence is an infinite progression of numbers where each term is generated recursively by summing the two immediate predecessor terms.

### Mathematical Definition

The sequence sets its initial terms as:

$$F_1 = 1, \quad F_2 = 1$$

For any integer index $n > 2$, the terms follow the recursive relation:

$$F_n = F_{n-1} + F_{n-2}$$

Using this definition, the early values of the sequence unfold as follows:

$$1, \, 1, \, 2, \, 3, \, 5, \, 8, \, 13, \, 21, \, 34, \, 55, \, 89, \, 144, \, \dots$$

### The Golden Ratio ($\varphi$)

As the sequence expands toward infinity, the ratio of any term to its immediate predecessor stabilizes into an irrational mathematical constant known as the Golden Ratio, symbolized by the Greek letter $\varphi$ (phi).

$$\varphi = \lim_{n \to \infty} \frac{F_n}{F_{n-1}} = \frac{1 + \sqrt{5}}{2} \approx 1.6180339887\dots$$

### Direct Calculation: Binet's Formula

To compute the $n$-th Fibonacci number directly without calculating every preceding term recursively, we use Binet's Formula:

$$F_n = \frac{\varphi^n - \bar{\varphi}^n}{\sqrt{5}}$$

Where $\bar{\varphi}$ represents the golden ratio conjugate value:

$$\bar{\varphi} = \frac{1 - \sqrt{5}}{2} \approx -0.6180339887\dots$$
$md$, 5),

('a2000001-0001-0001-0002-000000000001','content','Manifestations in Nature and Design',$md$
The numerical patterns of the Fibonacci sequence and the proportions of the Golden Ratio appear throughout physical and biological structures.

- **Sunflower Seed Heads:** The seeds in the center of a sunflower curve in opposing left-handed and right-handed spirals. Counting the total spirals in each direction typically yields two adjacent Fibonacci numbers.
- **Plant Anatomy and Leaf Arrangement:** The total count of petals on many flower species matches a Fibonacci number (e.g., lilies have 3, buttercups have 5, delphiniums have 8). Similarly, the branching patterns of specific trees split into growth tracks that increment along the sequence.
- **Honeybee Genealogy:** Because male drones hatch from unfertilized eggs (having a mother but no father) while female worker bees have two parents, tracking a drone's family tree backward through successive generations follows the exact numerical progression of the Fibonacci sequence.
- **Macro-scale Phenological Systems:** The geometric growth curves observed in low-pressure weather systems, hurricanes, ocean waves, and the structural arms of spiral galaxies approximate a Golden Spiral, which is built out of sequential Golden Rectangles.
- **Historical Architecture:** Geometric analyses of ancient monuments, such as the Great Pyramid of Giza or the structural columns of the Parthenon in Athens, indicate that structural design dimensions closely approximate Golden Ratio proportions to emphasize balance and visual harmony.
$md$, 6),

('a2000001-0001-0001-0002-000000000001','content','Practical Applications of Mathematics',$md$
Far from being confined to an academic environment, mathematical frameworks are essential for managing, understanding, and organizing modern systems.

1. **Systematizing Patterns:** Mathematics provides a formal language to classify and interpret structural observations, allowing engineers to guide satellites efficiently, optimize mechanical assets, and design complex household technologies.
2. **Predictive Environmental Analytics:** By modeling historic data patterns linearly or through advanced geometry like fractals, scientists create probability forecasts to predict weather conditions and evaluate the timing or severity of natural hazards.
3. **Environmental Optimization and Control Theory:** Quantitative models allow industries to map operational inputs against real-world outputs. Applied math fields, such as control theory, use these equations to stabilize physical, industrial, and digital systems safely.
4. **Daily Logistics and Financial Decisions:** Mathematical literacy underpins everyday operations, ranging from household budgeting and calculating travel logistics to analyzing chemical solutions in laboratories or computing complex banking transactions.
$md$, 7),

('a2000001-0001-0001-0002-000000000001','activity','Practice Exercises, Unit I',$md$
**Question 1: Symmetry Classification**

Analyze your immediate physical surroundings and identify five distinct objects that exhibit bilateral symmetry, and five distinct objects that exhibit radial symmetry. For each object, explicitly identify the location of its axis or center of symmetry.

**Question 2: Transformations Compared**

In your own words, outline the structural differences between:

- A rotational transformation and a reflectional transformation.
- A translational transformation and a rotational transformation.

**Question 3: Alphanumeric Rotations**

Examine the standard uppercase letters of the English alphabet:

$$\text{A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z}$$

- Identify every letter that looks identical after a rotational transformation of exactly 90°.
- Identify every letter that looks identical after a rotational transformation of exactly 180°.

**Question 4: Frieze Classification Exercises**

Classify each of the repeating border patterns illustrated below using the Conway system of naming:

```
Pattern A:  >>> >>> >>> >>> >>>

Pattern B:  /\  /\  /\  /\  /\
            \/  \/  \/  \/  \/

Pattern C:  L   Г   L   Г   L   Г
```

**Question 5: Fibonacci Sequence Generation**

Using the recursive formula $F_n = F_{n-1} + F_{n-2}$, calculate and list the first twenty terms of the Fibonacci sequence, starting with $F_1 = 1$ and $F_2 = 1$.

**Question 6: Consecutive Terms Calculation**

Assume you are given two distant, consecutive numbers from the Fibonacci sequence:

$$F_{38} = 39,088,169$$

$$F_{40} = 63,245,986$$

Using the sequence's structural addition principle, show your step-by-step reasoning to determine the exact value of $F_{39}$.

**Question 7: Binet's Formula Verification**

Apply Binet's explicit algebraic formula to evaluate the value of $F_4$. Show all intermediate radical calculations to verify that your final result matches the sequence's fourth term.
$md$, 8);

-- ============================================================
-- UNIT II: Logic and Sets
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a2000001-0001-0001-0002-000000000002','content','Mathematical Propositions',$md$
To communicate mathematical ideas with absolute precision, we rely on structured statements called propositions.

### Definition: Proposition

A proposition is a declarative sentence that is objectively either true ($T$/$1$) or false ($F$/$0$), but cannot simultaneously be both. Sentences that are interrogative, exclamatory, imperative, or highly subjective do not qualify as propositions.

- **Valid Proposition:** "The number $\sqrt{2}$ is irrational." (This is a declarative statement with an objective truth value of True).
- **Invalid Statement:** "Matrix algebra is a beautiful subject." (This is a subjective claim that cannot be evaluated objectively).

### Negation ($\neg p$)

The negation of a proposition $p$ is a statement that reverses the original truth value of $p$. It is written symbolically as $\neg p$ or $\sim p$. If $p$ is true, then $\neg p$ is false, and vice versa.
$md$, 1),

('a2000001-0001-0001-0002-000000000002','content','Logical Connectives and Compound Propositions',$md$
Simple propositions contain a single subject and a single predicate. We can combine multiple simple statements using logical connectives to build compound propositions.

### 1. Conjunction ($p \wedge q$)

A conjunction represents an logical "and" statement. The compound proposition $p \wedge q$ is true if and only if both component propositions $p$ and $q$ are true. If either statement is false, the entire conjunction is false.

### 2. Disjunction ($p \vee q$)

A disjunction represents an inclusive logical "or" statement. The compound proposition $p \vee q$ is false if and only if both component propositions $p$ and $q$ are false. If at least one statement is true, the disjunction evaluates as true.

### 3. Conditional Implication ($p \longrightarrow q$)

A conditional statement takes the form "If $p, \text{ then } q$". The component statement $p$ is called the premise (or antecedent), and $q$ is the conclusion (or consequent).

The conditional expression $p \longrightarrow q$ is false only when a true premise leads to a false conclusion. If the premise $p$ is false, the conditional statement evaluates as true by default, regardless of the truth value of $q$.

### 4. Biconditional ($p \longleftrightarrow q$)

A biconditional statement is read as "$p \text{ if and only if } q$". The expression $p \longleftrightarrow q$ is true when both component statements share identical truth values (meaning both are true, or both are false).
$md$, 2),

('a2000001-0001-0001-0002-000000000002','content','Related Conditional Variations',$md$
From a primary conditional statement $p \longrightarrow q$, we can construct three related conditional structures:

- **Converse:** $q \longrightarrow p$
- **Inverse:** $(\neg p) \longrightarrow (\neg q)$
- **Contrapositive:** $(\neg q) \longrightarrow (\neg p)$

> **Note on Equivalence:** A conditional statement $p \longrightarrow q$ is always logically equivalent to its contrapositive $(\neg q) \longrightarrow (\neg p)$. Its converse and inverse are also logically equivalent to each other.
$md$, 3),

('a2000001-0001-0001-0002-000000000002','content','Standard Truth Tables',$md$
The tables below define the outputs for basic logical connectives across all possible input combinations ($1 = \text{True}, 0 = \text{False}$):

| p | q | Negation (¬p) | Conjunction (p∧q) | Disjunction (p∨q) | Conditional (p⟶q) | Biconditional (p⟷q) |
|---|---|---|---|---|---|---|
| 1 | 1 | 0 | 1 | 1 | 1 | 1 |
| 1 | 0 | 0 | 0 | 1 | 0 | 0 |
| 0 | 1 | 1 | 0 | 1 | 1 | 0 |
| 0 | 0 | 1 | 0 | 0 | 1 | 1 |
$md$, 4),

('a2000001-0001-0001-0002-000000000002','content','Classifying Compound Propositions',$md$
- **Tautology:** A compound proposition that evaluates as true across every single row of a truth table, regardless of the individual truth values of its components.
- **Contradiction:** A compound proposition that evaluates as false across every single row of a truth table.
- **Contingency:** A compound statement that yields a mix of true and false outputs depending on its input parameters.
- **Logical Equivalence ($p \iff q$):** Two propositions are logically equivalent if they share identical truth values across all analytical conditions. This occurs if and only if the statement $p \longleftrightarrow q$ forms a tautology.
$md$, 5),

('a2000001-0001-0001-0002-000000000002','content','Set Theory Fundamentals',$md$
A set is a well-defined gathering of distinct entities termed elements. The phrase "well-defined" means that an objective standard exists to determine whether any given entity belongs to the set.

### Notations for Defining Sets

- **Roster (Listing) Method:** Enumerates every element explicitly between braces, separated by commas (e.g., $A = \{a, e, i, o, u\}$).
- **Set-Builder Notation:** Uses a variable and a conditional rule to describe a set's parameters (e.g., $\{x \mid x \text{ is an integer and } x > 5\}$).
- **Descriptive Method:** Uses a clear sentence to state the membership rules of the set.

### Special Sets and Attributes

- **Empty Set ($\emptyset$ or $\{\}$):** A set containing no elements.
- **Universal Set ($U$):** The comprehensive set containing all possible entities under consideration for a specific analysis.
- **Cardinality ($n(A)$):** The total number of distinct elements present within a finite set $A$.
- **Subset ($A \subseteq B$):** Set $A$ is a subset of $B$ if every element contained in $A$ is also found in $B$.
$md$, 6),

('a2000001-0001-0001-0002-000000000002','content','Core Set Operations',$md$
Let $A$ and $B$ be sets existing within a universal space $U$.

### Union ($A \cup B$)

Combines all elements from both sets:

$$A \cup B = \{x \mid x \in A \text{ or } x \in B\}$$

### Intersection ($A \cap B$)

Isolates the shared elements common to both sets:

$$A \cap B = \{x \mid x \in A \text{ and } x \in B\}$$

### Relative Complement / Set Difference ($A \setminus B$)

Isolates elements that belong to set $A$ but do not exist in set $B$:

$$A \setminus B = \{x \mid x \in A \text{ and } x \notin B\}$$

### Absolute Complement ($A'$)

Isolates all elements in the universal set $U$ that do not belong to set $A$:

$$A' = U \setminus A = \{x \mid x \in U \text{ and } x \notin A\}$$
$md$, 7),

('a2000001-0001-0001-0002-000000000002','activity','Practice Exercises, Unit II',$md$
**Question 1: Constructing Compound Truth Tables**

Construct a complete truth table for the following compound proposition:

$$[p \vee (q \wedge \neg r)] \longrightarrow (p \wedge q)$$

**Question 2: Verifying De Morgan's Laws**

Use truth tables to prove De Morgan's Laws for logic:

- $\neg(p \vee q) \longleftrightarrow (\neg p \wedge \neg q)$
- $\neg(p \wedge q) \longleftrightarrow (\neg p \vee \neg q)$

**Question 3: Set Algebra Calculations**

Let our Universal Set be the English alphabet: $U = \{a, b, c, \dots, z\}$. Let three specific subsets be defined as:

- $A = \{t, r, i, a, n, g, l, e, s\}$
- $B = \{s, q, u, a, r, e\}$
- $C = \{h, e, x, a, g, o, n, s\}$

Compute the exact members or values for the following operations:

- $A \cup (B \cap C)$
- $(A \cup B)' \cap C$
- $A \setminus (C \cap U)$
- $n[(A \cup B) \cap (B \cup C)]$

**Question 4: Venn Diagram Application**

A market survey evaluates the reading choices of 90 bookstore consumers. The collected records show:

- 44 consumers purchase mysteries
- 33 consumers purchase science fiction
- 29 consumers purchase romance novels
- 13 consumers purchase both mysteries and science fiction
- 5 consumers purchase science fiction and romance
- 11 consumers purchase mysteries and romance
- 2 consumers purchase all three genres

- Draw a complete Venn diagram to represent this data distribution.
- Determine how many consumers purchased mysteries exclusively.
- Determine how many consumers purchased romance or mystery options, but avoided science fiction.
- Calculate how many consumers purchased exactly two categories of books.
$md$, 8);

-- ============================================================
-- UNIT III: Mathematical Problem Solving
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a2000001-0001-0001-0002-000000000003','content','Inductive vs. Deductive Reasoning',$md$
### Inductive Reasoning

The process of deriving a broad, generalized conclusion (termed a conjecture) by observing specific patterns or a limited sequence of samples.

**Risk:** Conjectures generated via inductive workflows are not guaranteed to be true. They can be completely disproved if a single counterexample is found, an exception that satisfies all premises but invalidates the conclusion.

### Deductive Reasoning

The process of establishing a definitive, specific conclusion by applying established premises, rules, axioms, or mathematical definitions. It processes general truths to confirm a specific fact.

```
INDUCTIVE METHOD                        DEDUCTIVE METHOD
Specific Observations                   General Principles / Axioms
       |                                       |
       v                                       v
Pattern Detection                       Logical Application
       |                                       |
       v                                       v
General Conjecture (Unproven)           Specific Certainty (Proven)
```
$md$, 1),

('a2000001-0001-0001-0002-000000000003','content','Polya''s Problem-Solving Strategy',$md$
In 1945, mathematician George Polya introduced a four-stage process to systematically analyze and solve complex mathematical problems.

```
+------------------------+      +------------------------+
| 1. Understand Problem  | ---> |    2. Devise a Plan    |
+------------------------+      +------------------------+
                                             |
                                             v
+------------------------+      +------------------------+
|    4. Review & Reflect | <--- |   3. Execute the Plan  |
+------------------------+      +------------------------+
```

### 1. Understand the Problem

Read the problem carefully to identify the core question. Separate the given information from the unknown values. Restate the scenario in your own words to clarify the requirements.

### 2. Devise a Plan

Select an appropriate strategy to tackle the problem. Useful techniques include: searching for a pattern, drawing a diagram, constructing a table, simplifying the parameters, working backward, or setting up an algebraic equation.

### 3. Execute the Plan

Apply your chosen strategy and perform the necessary calculations. Verify the precision of each step as you proceed.

### 4. Review and Reflect (Look Back)

Evaluate your final answer to verify it makes sense within the context of the problem. Double-check your calculations and check for alternative, more efficient solution paths.
$md$, 2),

('a2000001-0001-0001-0002-000000000003','activity','Practice Exercises, Unit III',$md$
**Question 1: Consecutive Analytical Sums**

Observe the following arithmetic products and sums inductively:

$$\frac{1}{1 \cdot 2} = \frac{1}{2}$$

$$\frac{1}{1 \cdot 2} + \frac{1}{2 \cdot 3} = \frac{2}{3}$$

$$\frac{1}{1 \cdot 2} + \frac{1}{2 \cdot 3} + \frac{1}{3 \cdot 4} = \frac{3}{4}$$

- Formulate a general conjecture based on these observations.
- Use your conjecture to determine the exact sum of the following extended sequence without calculating each term individually:

$$\frac{1}{1 \cdot 2} + \frac{1}{2 \cdot 3} + \frac{1}{3 \cdot 4} + \dots + \frac{1}{99 \cdot 100}$$

**Question 2: Geometric Area Scaling**

A square has an initial side length of 1 unit.

- If the side lengths are doubled, determine the new area relative to the original square.
- If the side lengths are tripled, determine the new area relative to the original square.
- Formulate a general conjecture regarding how the area scales when the side length is multiplied by an arbitrary integer value $k$.

**Question 3: Polya Application (Handshake Problem)**

A business assembly contains 30 professional attendees. During a networking segment, every person shakes hands with every other person in the room exactly once.

- Use Polya's four-step process to model this problem.
- Calculate the total number of handshakes that took place.

**Question 4: Working Backwards**

A collector has a collection of trading cards.

- Alan has 2 cards more than double the amount owned by Bob.
- Charlie owns 2 cards fewer than Alan.
- David possesses 4 cards fewer than double the cards owned by Charlie.

If records show that Charlie owns exactly 8 cards, apply a backward analytics workflow to determine how many trading cards Bob owns.
$md$, 3);

-- ============================================================
-- UNIT IV: Data Analytics and Statistical Management
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a2000001-0001-0001-0002-000000000004','content','Foundations of Statistical Analysis',$md$
Statistics is the mathematical science centered on the collection, organization, condensation, analysis, and interpretation of quantitative data.

### Core Branches of Statistics

- **Descriptive Statistics:** Focuses on organizing, summarizing, and presenting data using tables, charts, and summary values.
- **Inferential Statistics:** Focuses on drawing conclusions about a larger population based on data collected from a representative sample. This includes testing hypotheses and making predictions.

### Key Terms

- **Population:** The complete set of all elements, items, or individuals under analysis.
- **Sample:** A subset selected from a population to be analyzed in detail.
- **Simple Random Sample:** A sample chosen such that every possible subset of a given size has an equal probability of selection.
$md$, 1),

('a2000001-0001-0001-0002-000000000004','content','Sampling Frameworks',$md$
### Probability Sampling (Random Methods)

- **Simple Random Sampling:** Every member of the population has an equal chance of selection.
- **Systematic Sampling:** Members are selected at regular intervals from an ordered list, starting from a randomly chosen initial point (e.g., picking every $k$-th item).
- **Stratified Random Sampling:** The population is divided into distinct subgroups (strata), and random samples are drawn from each subgroup proportional to its size.
- **Cluster Sampling:** The population is divided into geographic or operational groups (clusters). A random sample of clusters is chosen, and all members within those selected clusters are analyzed.

### Non-Probability Sampling (Non-Random Methods)

- **Convenience (Accidental) Sampling:** Samples are chosen based on ease of access rather than random selection.
- **Purposive Sampling:** The researcher uses personal judgment to select individuals who seem best suited for the study's goals.
- **Quota Sampling:** Participants are sampled within specific categories until a predetermined target number is reached.
- **Snowball Sampling:** Initial participants recruit additional subjects from their networks, a technique often used to study hard-to-reach groups.
$md$, 2),

('a2000001-0001-0001-0002-000000000004','content','Sample Size Formulations',$md$
### 1. Slovin's Formula

Used to estimate the required sample size ($n$) when analyzing a finite population ($N$) given a maximum allowable margin of error ($E$):

$$n = \frac{N}{1 + N E^2}$$

### 2. Estimation for a Population Mean

To estimate a population mean within a specific margin of error ($E$) at a chosen confidence level ($1-\alpha$), the minimum required sample size is:

$$n = \frac{(z_{\alpha/2})^2 \sigma^2}{E^2}$$

Where $\sigma$ represents the known population standard deviation and $z_{\alpha/2}$ is the standard normal z-score corresponding to the confidence level.

### 3. Cochran's Formula for Proportions

To estimate a population proportion within a target margin of error ($E$), the required sample size is calculated as:

$$n_0 = \frac{(z_{\alpha/2})^2 \hat{p}(1-\hat{p})}{E^2}$$

Where $\hat{p}$ is the estimated baseline proportion. If no prior estimate is available, setting $\hat{p} = 0.5$ provides the most conservative sample size estimate.
$md$, 3),

('a2000001-0001-0001-0002-000000000004','content','Levels of Data Measurement',$md$
Data is classified into four levels of measurement, which dictate the types of statistical analysis that can be performed.

```
[Highest Level]   Ratio      -> True zero point, meaningful ratios (e.g., Weight, Age)
                    |
                  Interval   -> Consistent intervals, no true zero (e.g., Temperature Celsius)
                    |
                  Ordinal    -> Meaningful ranking, unequal intervals (e.g., Customer Ratings)
[Lowest Level]    Nominal    -> Categorical labeling only, no order (e.g., Eye Color)
```

- **Nominal:** Categorical classification with no inherent order or numerical ranking (e.g., gender, nationality, or text labels).
- **Ordinal:** Categorical data that can be logically ranked or ordered, though the mathematical differences between ranks cannot be quantified (e.g., performance ratings like excellent, good, or poor).
- **Interval:** Numerical data with consistent differences between values, but without a true, meaningful zero point (e.g., temperature scales like Celsius or Fahrenheit).
- **Ratio:** Numerical data featuring both consistent intervals and a true zero point, which allows for direct comparison of ratios (e.g., height, weight, salary, or age).
$md$, 4),

('a2000001-0001-0001-0002-000000000004','content','Measures of Central Tendency and Dispersion',$md$
### Central Tendency Measures (Averages)

- **Arithmetic Mean ($\bar{x}$):** The sum of all values divided by the total number of observations.
- **Weighted Mean:** Used when observations carry varying degrees of importance or frequency:

$$\bar{x} = \frac{\sum w x}{\sum w}$$

- **Median ($\tilde{x}$):** The middle value when data points are arranged in ascending or descending order. For an even number of observations, it is the average of the two central values.
- **Mode ($\hat{x}$):** The most frequently occurring value in a data set.

### Dispersion Measures (Variability)

- **Range:** The absolute difference between the largest and smallest values in a data set.
- **Sample Variance ($s^2$):** Measures the average squared deviation of data points from the sample mean:

$$s^2 = \frac{\sum (x_i - \bar{x})^2}{n - 1}$$

- **Sample Standard Deviation ($s$):** The square root of the sample variance, providing a measure of spread in the original units of the data:

$$s = \sqrt{s^2}$$
$md$, 5),

('a2000001-0001-0001-0002-000000000004','activity','Practice Exercises, Unit IV',$md$
**Question 1: Classifying Sampling Designs**

Identify the specific sampling technique used in each of the following scenarios:

- A researcher divides a city's population into low, middle, and high-income households, then draws a random sample from each category proportional to its size.
- A quality-assurance officer tests the internet connection speed of a local office by dividing the workday into four periods and selecting 5 random times to test within each period.
- An administrator stands outside a lecture hall and hands a feedback survey to every fifth student who arrives.

**Question 2: Slovin and Sample Determinations**

- A school district has a population of 1,000 students. Calculate the required sample size using Slovin's formula with an allowable margin of error of 5%.
- A researcher wants to estimate the average age of a student cohort with 99% confidence and a margin of error of 0.2 years. Prior studies suggest the population standard deviation ($\sigma$) is 1.3 years. Calculate the minimum required sample size.

**Question 3: Central Tendency Analytics**

An experimental assessment measures how long (in seconds) it takes 8 participants to solve a structural puzzle. The recorded times are:

$$15.2, \, 18.8, \, 19.3, \, 19.7, \, 20.2, \, 21.8, \, 22.1, \, 29.4$$

- Calculate the sample mean and median puzzle-solving times.
- Calculate the range and sample standard deviation for this data set.
$md$, 6);

-- ============================================================
-- UNIT V: Optimization via Linear Programming
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a2000001-0001-0001-0002-000000000005','content','Foundations of Linear Programming',$md$
Linear programming is an optimization technique used to allocate scarce resources to maximize an objective (such as profit) or minimize an objective (such as cost). The problem must be modeled using linear equations and inequalities.

### Core Components of an LP Model

- **Decision Variables:** Unknown values ($x_1, x_2, \dots$) that represent the quantities to be determined to solve the optimization problem.
- **Objective Function:** A linear equation that defines the primary goal to be maximized or minimized.
- **Structural Constraints:** A set of linear inequalities that define the limits, resource caps, or performance requirements of the system.
- **Non-Negativity Restrictions:** Mathematical constraints ensuring that decision variables cannot take on negative values ($x_i \ge 0$).
$md$, 1),

('a2000001-0001-0001-0002-000000000005','content','Graphical Solution Method',$md$
For linear programming models with two decision variables, the optimal solution can be found by graphing the system of inequalities on a two-dimensional plane.

### Step-by-Step Graphical Process

1. **Graph the Boundary Lines:** Convert each constraint inequality into a linear equation and plot its line on the coordinate plane.
2. **Identify the Feasible Region:** Use test points (such as the origin $(0,0)$) to determine which side of each line satisfies the inequality constraint. The intersection of all satisfying regions forms the feasible region.
3. **Locate the Corner Points (Vertices):** Find the exact coordinates of the intersection points that form the boundaries of the feasible region.
4. **Evaluate the Objective Function:** Calculate the value of the objective function at each corner point. According to fundamental LP theory, if an optimal solution exists, it must occur at one of these vertices.

```
         x2 ^
            |       \ Line 1
            |----\   \
            |     \   \
            | Feasible \
            |  Region   \
            |___________ \______>
            0           Corner Points occur at vertices
```
$md$, 2),

('a2000001-0001-0001-0002-000000000005','activity','Practice Exercises, Unit V',$md$
**Question 1: Manufacturing Optimization Modeling**

A production facility manufactures two styles of traditional fans: Small ($x_1$) and Large ($x_2$). Production relies on three distinct raw material types ($R_1, R_2, R_3$) with fixed daily availability:

| Material Resource | Required per Small Unit | Required per Large Unit | Total Daily Availability |
|---|---|---|---|
| Raw Material $R_1$ | $80\text{ g}$ | $70\text{ g}$ | $5,000\text{ g}$ |
| Raw Material $R_2$ | $100\text{ g}$ | $150\text{ g}$ | $9,000\text{ g}$ |
| Raw Material $R_3$ | $175\text{ g}$ | $250\text{ g}$ | $13,000\text{ g}$ |
| Unit Profit | $\text{PhP } 5.00$ | $\text{PhP } 7.00$ | |

Market metrics dictate that the daily production of Small fans cannot exceed 50 units.

- Formulate the complete linear programming model to maximize total daily profit.
- Graph the constraints to find the feasible region and identify all corner points.
- Calculate the optimal production mix to achieve the maximum possible profit.

**Question 2: Cost Minimization (The Diet Problem)**

An athlete wants to minimize the cost of their daily diet while meeting four baseline nutritional requirements: calories, sugar, carbohydrates, and protein. The athlete mixes three food types: Eggs ($x_1$), Rice ($x_2$), and Chicken ($x_3$):

| Metric Nutrient | Per Unit Egg | Per Unit Rice | Per Unit Chicken | Minimum Daily Demand |
|---|---|---|---|---|
| Calories | 72 | 204 | 195 | 600 |
| Sugar (g) | 1.1 | 0.08 | 0 | 100 |
| Carbs (g) | 0.4 | 44.0 | 80 | 283 |
| Protein (g) | 7 | 4.2 | 29.5 | 5300 |
| Unit Price | $\text{PhP } 7.00$ | $\text{PhP } 10.00$ | $\text{PhP } 25.00$ | |

Formulate the complete linear programming model to find the most cost-effective food mix that satisfies all nutritional targets (Note: You only need to write the model equations).

**Question 3: Graphical Systems Analysis**

Sketch the feasible region and determine the exact coordinates of all corner points for the following system of linear inequalities:

$$x + 2y \le 4$$

$$3x + 2y \le 6$$

$$x \ge 0, \quad y \ge 0$$
$md$, 3);

-- ============================================================
-- UNIT VI: Graph Theory and Network Models
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a2000001-0001-0001-0002-000000000006','content','Core Concepts of Graph Theory',$md$
A graph $G = (V, E)$ is a mathematical structure consisting of a non-empty set of vertices ($V$, or nodes) and a set of edges ($E$, or arcs) that connect pairs of vertices.

```
   (A)---------(B)       Vertex Set V = {A, B, C}
    |         /          Edge Set E = {(A,B), (B,C), (A,C)}
    |        /           Degree of Vertex A = 2
    |       /
   (C)-----/             Connected Graph
```

### Key Structural Terms

- **Adjacent Vertices:** Two nodes connected directly by a shared edge.
- **Loop:** An edge that connects a vertex to itself.
- **Degree of a Vertex:** The total number of edges connected to a specific vertex.
- **Path:** A sequence of connected vertices where no edge is repeated.
- **Circuit:** A path that begins and ends at the exact same vertex.
- **Connected Graph:** A graph where a continuous path exists between any pair of vertices.
- **Bridge:** An edge in a connected graph whose removal disconnects the graph.
$md$, 1),

('a2000001-0001-0001-0002-000000000006','content','Eulerian and Hamiltonian Networks',$md$
### Eulerian Frameworks

- **Euler Path:** A path that traverses every single edge in a graph exactly once.
- **Euler Circuit:** A circuit that traverses every edge in a graph exactly once and returns to the starting vertex.

### Euler's Graph Theorems

- A connected graph has an Euler Circuit if and only if the degree of every single vertex is even.
- A connected graph has an Euler Path if and only if it has exactly two vertices with an odd degree. The path must start at one of these odd-degree vertices and end at the other.
- The sum of the degrees of all vertices in any graph equals twice the total number of edges. Consequently, the number of vertices with an odd degree must be even.

### Fleury's Algorithm

Used to find an Euler circuit or path in an eligible graph: Start at an appropriate vertex (an odd-degree vertex if finding a path). Traverse edges one by one, following a key rule: never cross a bridge edge unless there are no other remaining options.
$md$, 2),

('a2000001-0001-0001-0002-000000000006','content','Hamiltonian Frameworks and the Traveling Salesman Problem',$md$
- **Hamilton Path:** A path that visits every vertex in a graph exactly once.
- **Hamilton Circuit:** A circuit that visits every vertex in a graph exactly once and returns to the starting vertex.
- **Complete Graph ($K_n$):** A graph with $n$ vertices where every vertex is directly connected to every other vertex.
- **Traveling Salesman Problem:** The goal of finding a Hamilton circuit in a weighted complete graph that minimizes the total edge weight (cost, distance, or time).

```
         (B)             Brute Force: List every circuit
      5 / | \ 6          Nearest Neighbor: Always pick closest unvisited node
       /  |  \           Cheapest Link: Sort all edges, pick lowest without
     (A)  |7 (C)                        creating premature circuits or
       \  |  /                          vertex degrees > 2
      4 \ | / 3
         (D)
```

### Algorithms for Solving TSPs

- **Brute Force Method:** List every possible Hamilton circuit, calculate the total weight of each, and select the one with the lowest sum. This guarantees an optimal solution but becomes inefficient as the number of vertices grows.
- **Nearest Neighbor Method:** Start at a designated vertex, then move to the nearest unvisited vertex. Repeat this process until all vertices are visited, then return to the start. This provides a fast, approximate solution.
- **Cheapest Link Algorithm:** Sort all edges in the graph by weight from smallest to largest. Select the shortest available edge, provided it does not create a closed circuit before all vertices are visited, and does not give a single vertex a degree greater than two. Repeat until a complete circuit is formed.
$md$, 3),

('a2000001-0001-0001-0002-000000000006','content','Spanning Trees and Kruskal''s Algorithm',$md$
A tree is a connected graph that contains no circuits. A tree with $n$ vertices always contains exactly $n-1$ edges, and every single edge functions as a structural bridge.

- **Spanning Tree:** A subgraph that connects all vertices of the original graph while forming a tree structure.
- **Minimum Spanning Tree (MST):** In a weighted graph, the spanning tree that has the lowest possible total edge weight.

### Kruskal's Algorithm

Used to find the Minimum Spanning Tree of a weighted graph:

1. Identify the edge with the lowest weight in the graph and select it.
2. Select the next lowest weight edge that does not form a closed circuit with your already selected edges.
3. Repeat this process until all vertices are connected in a single tree structure.
$md$, 4),

('a2000001-0001-0001-0002-000000000006','content','Graph Coloring and Planar Adjacency',$md$
A graph is planar if it can be drawn on a flat plane without any of its edges crossing over each other.

- **Graph Coloring:** Assigning colors to the vertices of a graph such that no two adjacent vertices share the same color.
- **Chromatic Number:** The minimum number of colors required to properly color a graph.

```
           (Color 1)               Vertex Coloring Rules:
            /     \                 1. Pick highest degree node
           /       \                2. Color non-adjacent nodes same color
       (Color 2)---(Color 3)        3. Repeat for remaining nodes
```

### The Four-Color Theorem

Every planar graph (and by extension, any standard geographic map) can be colored using at most four distinct colors such that no two adjacent regions share the same color.
$md$, 5),

('a2000001-0001-0001-0002-000000000006','activity','Practice Exercises, Unit VI',$md$
**Question 1: Eulerian Lifecycle Assessment**

Determine whether an Euler circuit, an Euler path, or neither exists for each of the following graphs. If a path or circuit exists, write out the sequence of vertices using Fleury's algorithm:

```
Graph A Parameters:
Vertices: {A, B, C, D, E}
Edges: (A-B), (B-C), (C-D), (D-E), (E-A), (A-C), (C-E)

Graph B Parameters:
Vertices: {W, X, Y, Z}
Degrees: deg(W)=3, deg(X)=3, deg(Y)=4, deg(Z)=2
```

**Question 2: Traveling Salesman Execution**

A consultant must visit five cities ($A, B, C, D, E$) exactly once before returning to their starting point at city $A$. The distance matrix (in hundreds of miles) between the cities is given below:

| | A | B | C | D | E |
|---|---|---|---|---|---|
| A | * | 7 | 6 | 8 | 4 |
| B | 7 | * | 8 | 5 | 6 |
| C | 6 | 8 | * | 9 | 7 |
| D | 8 | 5 | 9 | * | 8 |
| E | 4 | 6 | 7 | 8 | * |

- Find the optimal travel circuit and total distance using the Nearest Neighbor Method, starting from city $A$.
- Find the optimal travel circuit and total distance using the Cheapest Link Algorithm.

**Question 3: Kruskal's MST Determination**

A network has 5 nodes ($a, b, c, d, e$) connected by the following weighted edges:

$(a-b) = 3$, $(a-c) = 5$, $(b-c) = 1$

$(b-d) = 6$, $(c-d) = 2$, $(c-e) = 4$, $(d-e) = 5$

Apply Kruskal's algorithm to find the Minimum Spanning Tree. List the edges in the order they are selected and calculate the total weight of the tree.

**Question 4: Chromatic Mapping**

A regional map contains five distinct territories ($V = \{V_1, V_2, V_3, V_4, V_5\}$). The adjacency relationships show that:

- $V_1$ shares a border with all other four territories.
- $V_2, V_3, V_4, V_5$ form a circular ring around $V_1$, where $V_2$ links to $V_3$, $V_3$ links to $V_4$, $V_4$ links to $V_5$, and $V_5$ links back to $V_2$.

- Draw the graph that represents this map's adjacencies.
- Use the vertex coloring algorithm to determine the exact chromatic number of the map.
$md$, 6);
