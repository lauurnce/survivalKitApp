-- ============================================================
-- Computer Programming 1 — Exam Prep: Prelims & Finals
-- Subject ID: 10000000-0001-0001-0001-000000000001
-- Module ID:  a1000001-0001-0001-0001-0000000000e1
-- Purpose: exam-review module — 2 free sections (blueprint +
--          15-item practice set) and 8 activity sections
--          (4 x 30-item mock exams, keys, traps, review sheet).
-- Idempotent: deletes only this module's row (sections cascade),
--             then re-inserts everything. INSERT-only otherwise;
--             never touches the seven lesson modules.
-- Run after cp1_modules_sections.sql.
-- Every item is answerable from Lessons 1-7 of this subject.
-- ============================================================

DELETE FROM modules WHERE id = 'a1000001-0001-0001-0001-0000000000e1';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('a1000001-0001-0001-0001-0000000000e1','10000000-0001-0001-0001-000000000001','Exam Prep: Prelims & Finals','exam-prep-prelims-finals',8);

-- ============================================================
-- FREE SECTIONS (sort 1-2)
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a1000001-0001-0001-0001-0000000000e1','content','Prelim Exam Blueprint & Study Plan',$md$
Your CP1 prelim covers the first three lessons of this subject — nothing more:

- **Lesson 1: Programming Concepts** — hardware vs. software, the five-step programming process, syntax vs. logic errors, flowcharts, pseudocode
- **Lesson 2: Introduction to C** — history, compilation, identifiers, data types, variables, constants, operators, precedence
- **Lesson 3: Input/Output and Program Structure** — `printf`, `scanf`, format specifiers, escape sequences, `conio.h` functions, the anatomy of a C program

### How a Typical CP1 Prelim Is Built

| Question type | Usual share | What it really tests |
|---|---|---|
| Multiple choice | 30–40% | Definitions, history, symbols, "which is valid" |
| True or false | 15–20% | Rules with a twist (keywords, case sensitivity) |
| Evaluate the expression | 15–20% | Integer division, `%`, precedence, TRUE/FALSE |
| Predict the output | 15–20% | `printf` field widths, escape sequences, `++` |
| Flowchart / pseudocode | 10–15% | Draw or trace a simple algorithm |

### The Memorize List (Non-Negotiable)

If it is in a table in the lessons, it is fair game. Before the exam you should be able to write these from memory:

- **Flowchart symbols:** oval = terminal, parallelogram = input/output, rectangle = process, diamond = decision, arrow = flow line, circle = connector
- **Five steps of programming, in order:** define → design → code → test → document
- **Format specifiers:** `%c` char, `%d` decimal integer, `%f` float, `%lf` double, `%e` scientific, `%s` string
- **Escape sequences:** `\n` newline, `\t` tab, `\\` backslash, `\"` double quote, `\'` single quote, `\a` bell
- **Data types and sizes:** `char` 1 byte, `short int` 2 bytes (−32,768 to +32,767), `int` 4 bytes, `float` 4 bytes, `double` 8 bytes, `void` no value
- **Identifier rules:** starts with a letter or `_`; then letters, digits, `_`; no spaces or hyphens; case-sensitive; never a keyword
- **Precedence ladder:** `! ++ --` then `* / %` then `+ -` then `< <= > >=` then `== !=` then `&&` then `||` then `? :` then assignment
- **C history:** BCPL (Martin Richards, 1967) → B (Ken Thompson, 1970, typeless) → C (Dennis Ritchie, 1972, Bell Labs) → Turbo C (Borland, 1987)

### Top Mistakes That Cost Prelim Points

1. Writing `1.5` for `3/2` — integer division truncates to `1`.
2. Forgetting `&` in `scanf("%d", &num);` on fill-in-the-blank items.
3. Calling `integer` a keyword — the keyword is `int`; `integer` is a valid identifier.
4. Pairing the wrong flowchart shape (parallelogram is I/O, **not** process).
5. Ignoring field widths — `%5d` questions are graded space by space.

### 7-Day Study Plan

| Day | Do this |
|---|---|
| 1 | Reread **Lesson 1: Programming Concepts**. Redraw the six flowchart symbols and the three control structures from memory. |
| 2 | Redo the Lesson 1 practice exercises on paper, then check against the worked solutions. |
| 3 | Reread **Lesson 2: Introduction to C**. Write the data-type table and precedence ladder from memory, twice. |
| 4 | Redo the Lesson 2 expression evaluations without looking. Every wrong answer: find which precedence rule you broke. |
| 5 | Reread **Lesson 3: Input/Output and Program Structure**. Hand-trace every `printf` example, counting spaces. |
| 6 | Take the free 15-item practice set below under time pressure (20 minutes, no notes). |
| 7 | Take a full mock exam under exam conditions, mark it with the answer key, and restudy only the items you missed. |

Light review the night before, sleep, and bring two pens. Kaya mo 'yan — the prelim is the most predictable exam of the semester.
$md$, 1),

('a1000001-0001-0001-0001-0000000000e1','content','Free Practice Set — 15 Items with Answer Key',$md$
Answer all 15 on paper before scrolling to the key. Target: 20 minutes, closed notes. Scope: Lessons 1–3 only.

### Items

1. Which flowchart symbol represents a decision?
   a) rectangle  b) parallelogram  c) diamond  d) oval
2. TRUE or FALSE: A syntax error is caught during compilation.
3. Who designed the C language at AT&T Bell Laboratories in 1972?
   a) Ken Thompson  b) Dennis Ritchie  c) Martin Richards  d) Borland
4. Which identifier is INVALID?
   a) `_count`  b) `qty_sold`  c) `2ndYear`  d) `Rating`
5. Evaluate: `11 / 2` = ______
6. Evaluate: `11 % 2` = ______
7. Which format specifier reads a `double` with `scanf`?
   a) `%d`  b) `%f`  c) `%lf`  d) `%e`
8. Write the exact output (mark spaces): `printf("%5d", 42);`
9. TRUE or FALSE: `int` and `integer` are both C keywords.
10. Fill in the missing character: `scanf("%d", ___num);`
11. Which escape sequence prints a tab?
12. After `x = 10; y = x++;` what are the values of `y` and `x`?
13. Name the three fundamental control structures that can build any program logic.
14. What data type is the constant `'A'`?
15. Evaluate: `2 + 3 * 4 % 5` = ______

### Answer Key

1. **c) diamond** — the diamond is the decision symbol; the rectangle is process, the parallelogram is I/O.
2. **TRUE** — syntax errors break language rules and the compiler catches them; only testing catches logic errors.
3. **b) Dennis Ritchie** — Thompson made B (1970), Richards made BCPL (1967), Borland made Turbo C (1987).
4. **c) `2ndYear`** — identifiers cannot start with a digit; the rest are all legal.
5. **5** — integer division truncates; there is no 5.5 in `int` math.
6. **1** — modulus gives the remainder of 11 ÷ 2.
7. **c) `%lf`** — `%f` is for `float`; a `double` in `scanf` needs `%lf`.
8. **`   42`** — three spaces then 42: `%5d` right-justifies the number in a field of width 5.
9. **FALSE** — `int` is a keyword; `integer` is not (it is actually a valid identifier).
10. **`&`** — `scanf` needs the address-of operator before a plain variable.
11. **`\t`** — backslash-t; `\n` is newline, `\a` is the bell.
12. **y = 10, x = 11** — postfix `x++` hands over the old value first, then increments.
13. **Sequence, selection, repetition** — per Lesson 1, these three are sufficient for any logic.
14. **`char`** — single quotes mean a single character; `"A"` in double quotes would be a string.
15. **4** — `*` and `%` share the same level, left to right: `3*4=12`, `12%5=2`, then `2+2=4`.

Scored 12 or better? You are on track. Below that, redo the lesson the missed items came from before trying a full mock. The four full 30-item mock exams below — two prelim and two final, each with a fully explained answer key — are included when you unlock this subject.
$md$, 2);

-- ============================================================
-- LOCKED ACTIVITIES — PRELIM (sort 3-6)
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a1000001-0001-0001-0001-0000000000e1','activity','Prelim Mock Exam A — 30 Items',$md$
Simulate the real thing: 45 minutes, closed notes, answers on paper. Scope: Lessons 1–3. Assume needed headers and declarations are in place unless shown. The full key with explanations is in the **Answer Key** section — no peeking until you finish.

### Part I — Multiple Choice (1–10)

1. In the five-step programming process, which step comes immediately after "design the solution"?
   a) define the problem  b) code the program  c) test the program  d) document the program
2. Data that has been processed into something meaningful is called:
   a) input  b) information  c) hardware  d) a variable
3. Who created the B language in 1970?
   a) Dennis Ritchie  b) Martin Richards  c) Ken Thompson  d) Borland International
4. Which stage of compilation combines your object code with library code?
   a) preprocessor  b) compiler  c) linker  d) interpreter
5. Which of the following is a VALID identifier?
   a) `4you`  b) `qty-sold`  c) `_total`  d) `int`
6. What is the data type of the constant `'M'`?
   a) `char`  b) string  c) `int`  d) `float`
7. Which operator gives the remainder of integer division?
   a) `/`  b) `%`  c) `\`  d) `//`
8. Which data type occupies exactly 1 byte?
   a) `int`  b) `char`  c) `float`  d) `short int`
9. Which header file declares `printf` and `scanf`?
   a) `conio.h`  b) `math.h`  c) `stdio.h`  d) `stdlib.h`
10. In C, false is represented by:
    a) 0  b) −1  c) any non-zero value  d) the character 'F'

### Part II — True or False (11–16)

11. A flowchart parallelogram represents a process.
12. Global variables are automatically initialized to zero if unspecified.
13. `#define PI 3.14159` must end with a semicolon.
14. C is case-sensitive, so `Total` and `total` are different identifiers.
15. `getch()` waits for the Enter key before returning the character.
16. A logic error is caught by the compiler.

### Part III — Predict the Output (17–22)

Write the exact output, spaces included.

17.
```c
int x = 7, y = 2;
printf("%d", x / y);
```
18.
```c
int a = 10;
int b = ++a;
printf("%d %d", a, b);
```
19.
```c
printf("Sum:\t%d\n", 5 + 3);
printf("\"Done\"");
```
20.
```c
int x = 9 % 4 + 12 / 5;
printf("%d", x);
```
21.
```c
float f = 7 / 2;
printf("%.1f", f);
```
22.
```c
printf("%3d%3d", 5, 25);
```

### Part IV — Fill in the Code (23–26)

23. `price` is a `float`. Complete: `scanf("____", &price);`
24. Define a preprocessor constant `RATE` with value 0.12: `#define RATE ____`
25. Declare a character array that holds `"CCMIT"` including its terminator: `char college[____] = "CCMIT";`
26. Complete the ternary so `y` gets 1 when `x` is positive, else 0: `y = (x > 0) ____ 1 ____ 0;`

### Part V — Flowchart & Pseudocode (27–30)

27. The oval symbol in a flowchart marks:
    a) a computation  b) start or stop  c) user input  d) a decision
28. Trace this pseudocode. What is the output?
```
N → 1, S → 0
LOOP while N <= 4:
  S → S + N
  N → N + 1
OUTPUT S
```
29. `IF grade >= 75 THEN OUTPUT "PASSED" ELSE OUTPUT "FAILED"` is an example of which control structure?
30. What is the circle (connector) symbol used for in a flowchart?
$md$, 3),

('a1000001-0001-0001-0001-0000000000e1','activity','Prelim Mock Exam B — 30 Items',$md$
Same scope (Lessons 1–3), all-new items, one notch harder. 45 minutes, closed notes. Take this a day or two after Mock A so the key from A has sunk in.

### Part I — Multiple Choice (1–10)

1. Which runs FIRST when a `.c` file is built?
   a) linker  b) compiler  c) preprocessor  d) loader
2. Object code is best described as:
   a) the human-readable program text  b) the machine-language translation of source code  c) a collection of library functions  d) a list of syntax errors
3. Which language in C's family tree was typeless (no data types)?
   a) BCPL  b) B  c) C  d) Turbo C
4. Which identifier is INVALID?
   a) `_2nd`  b) `main2`  c) `qty sold`  d) `SNAME`
5. `unsigned int` is appropriate when the value is:
   a) always negative  b) never negative  c) always a decimal  d) a single character
6. Which of these is a string constant?
   a) `'A'`  b) `"A"`  c) `A`  d) `65`
7. In `2 + 3 * 4`, which operation is evaluated first, and why?
   a) `+`, left to right  b) `*`, higher precedence  c) `+`, lower precedence  d) they tie
8. `x %= 3;` is shorthand for:
   a) `x = x % 3;`  b) `x = 3 % x;`  c) `x = x / 3;`  d) `x = x * 3;`
9. Which format specifier prints in scientific notation?
   a) `%s`  b) `%e`  c) `%lf`  d) `%c`
10. The difference between `getch()` and `getche()` is:
    a) `getche()` echoes the typed character; `getch()` does not
    b) `getch()` reads strings; `getche()` reads characters
    c) `getche()` waits for Enter; `getch()` does not
    d) there is none

### Part II — True or False (11–16)

11. In the Lesson 2 data-type table, `long int` has the same size as `int` (4 bytes).
12. When reading a string into a char array with `scanf("%s", name);`, no `&` is needed.
13. The escape sequence `\a` produces a bell (sound).
14. Only the first 31 characters of a C identifier are significant.
15. `const float version = 3.20;` is handled by the preprocessor.
16. `puts()` writes the string to the screen and adds a newline.

### Part III — Predict the Output (17–22)

17.
```c
int x = 5;
x += 2;
x *= 3;
printf("%d", x);
```
18.
```c
int a = 4, b = 9;
printf("%d", a > b ? a - b : b - a);
```
19.
```c
int x = 10, y = 3;
printf("%d %d", x / y, x % y);
```
20.
```c
printf("%6.2f", 3.14159);
```
21.
```c
int p = 2, q;
q = ++p * 2;
printf("%d %d", p, q);
```
22.
```c
printf("%d", 8 + 2 * 5 < 2 * 2 * 5 && 3 > 1);
```

### Part IV — Fill in the Code (23–26)

23. `y` is a `double`. Complete: `scanf("%____", &y);`
24. Complete the statement so it prints exactly `He said "hi"` — quotes included: `printf("He said ______");`
25. Subtract 5 from `total` using a shorthand operator: `total ____ 5;`
26. `getch()` and `clrscr()` need which header? `#include <____>`

### Part V — Flowchart & Pseudocode (27–30)

27. Trace this pseudocode. What is the output?
```
A → 8, B → 3
IF A > B THEN
  IF A % B == 2 THEN
    OUTPUT "X"
  ELSE
    OUTPUT "Y"
ELSE
  OUTPUT "Z"
```
28. Trace this pseudocode. What is the output?
```
N → 10
LOOP while N > 0:
  N → N - 3
OUTPUT N
```
29. Which combination of control structures is sufficient to construct ANY program logic?
    a) sequence only  b) sequence and selection  c) sequence, selection, and repetition  d) selection and repetition
30. In a flowchart, what does the arrow symbol represent, and what is its proper name?
$md$, 4),

('a1000001-0001-0001-0001-0000000000e1','activity','Prelim Mock Exams — Answer Key with Explanations',$md$
Mark your paper honestly — the explanation matters more than the score. Every trap answer here is one your professor will also offer as a choice.

## Mock Exam A

### Part I — Multiple Choice

1. **b) code the program.** Order: define → design → **code** → test → document. Choice (c) tempts because coding and testing feel simultaneous in the lab, but the process lists them separately and in order.
2. **b) information.** Data is raw facts; information is processed data. "Input" tempts because data enters as input — but the question asks what it becomes.
3. **c) Ken Thompson.** He built B for early UNIX. Ritchie (a) is the trap — he made C (1972), not B.
4. **c) linker.** The linker combines object code with library code to produce the executable. The compiler (b) only gets you to object code.
5. **c) `_total`.** A leading underscore is legal. `4you` starts with a digit, `qty-sold` has a hyphen, and `int` is a keyword.
6. **a) `char`.** Single quotes = single character. "String" tempts, but strings use double quotes.
7. **b) `%`.** Modulus returns the remainder. `/` (a) is the trap — it returns the quotient.
8. **b) `char`** — 1 byte. `short int` (d) tempts but is 2 bytes.
9. **c) `stdio.h`.** Standard input/output. `conio.h` (a) is console extras like `getch` and `clrscr`.
10. **a) 0.** False is exactly zero; TRUE is any non-zero value — which is why (c) describes true, not false.

### Part II — True or False

11. **FALSE.** The parallelogram is input/output; the rectangle is process. Most-swapped pair in symbol questions.
12. **TRUE.** Globals default to zero; it is *locals* that hold garbage until assigned.
13. **FALSE.** `#define` is a preprocessor directive, not a statement — no semicolon. Adding one pastes the `;` into every use site.
14. **TRUE.** `Sname`, `SNAME`, and `sname` are three different identifiers.
15. **FALSE.** `getch()` returns immediately without echo and without Enter. The function that *does* wait for Enter is `getchar()`.
16. **FALSE.** Logic errors compile and run fine but produce wrong results; only testing reveals them.

### Part III — Predict the Output

17. **`3`** — integer division: 7/2 truncates. Writing 3.5 is the classic mark-loser.
18. **`11 11`** — prefix `++a` increments first, so `b` receives the already-incremented 11.
19. Two lines:
```
Sum:	8
"Done"
```
`\t` prints a tab, `\n` ends line 1, and `\"` prints literal double quotes around Done.
20. **`3`** — `%` and `/` outrank `+`: `9%4 = 1`, `12/5 = 2` (truncated), `1 + 2 = 3`. Answering 4 means you computed 12/5 as 2.4.
21. **`3.0`** — the trap: `7 / 2` is integer division and yields 3 *before* being stored in the float. `3.5` is exactly the wrong answer this item is fishing for.
22. **`  5 25`** — `%3d` pads 5 to `  5` (two spaces) and 25 to ` 25` (one space). Total: two spaces, 5, one space, 25.

### Part IV — Fill in the Code

23. **`%f`** — `float` uses `%f` in `scanf`; `%lf` is for `double`.
24. **`0.12`** — just the value: `#define RATE 0.12`. No `=` and no `;` — both are traps.
25. **`6`** — five letters plus `'\0'`. Writing 5 compiles but drops the terminator.
26. **`?`** then **`:`** — `y = (x > 0) ? 1 : 0;`
27. **b) start or stop.** The oval is the terminal symbol.
28. **`10`** — S accumulates 1+2+3+4 while N goes 1→5. If you got 15, you looped once too many (N ≤ 4 stops before adding 5).
29. **Selection** — a decision chooses between two paths; nothing repeats.
30. **Connecting parts of a flowchart** — e.g., continuing the flow across pages, so you avoid long crossing arrows.

## Mock Exam B

### Part I — Multiple Choice

1. **c) preprocessor.** It handles `#include`/`#define` before the compiler runs; the linker (a) is last, not first.
2. **b) the machine-language translation of source code.** Also called binary or machine code. (a) describes *source* code.
3. **b) B.** Thompson's B had no data types; C's big addition was types. BCPL (a) tempts because it is oldest, but the lesson calls B the typeless one.
4. **c) `qty sold`.** Spaces are never allowed. `_2nd` is fine (digit is not *first*), and `SNAME` is just uppercase.
5. **b) never negative.** Unsigned types trade the sign for a bigger positive range.
6. **b) `"A"`.** Double quotes make a string (even one character long); `'A'` is a char constant.
7. **b) `*`, higher precedence.** Multiplication outranks addition, so it evaluates first regardless of position.
8. **a) `x = x % 3;`** — shorthand expands with `x` on the left. (b) reverses the operands, which matters for `%`.
9. **b) `%e`** — scientific notation. `%lf` (c) is double in normal notation.
10. **a).** `getche()` = "get char with **e**cho"; neither one waits for Enter, which kills choice (c).

### Part II — True or False

11. **TRUE.** The lesson's table lists `long int` at 4 bytes, same as `int`.
12. **TRUE.** An array name already refers to the address of its first element, so `&` is not needed.
13. **TRUE.** `\a` is the bell/alert.
14. **FALSE.** The lesson says the first **63** characters are significant.
15. **FALSE.** `const` is a language keyword handled by the compiler; `#define` is the preprocessor mechanism.
16. **TRUE.** `puts` writes the string plus a newline — that trailing newline is the difference from `printf("%s", ...)`.

### Part III — Predict the Output

17. **`21`** — shorthand in sequence: `x = 5+2 = 7`, then `x = 7*3 = 21`. If you got 11, you applied `*=` before `+=`; statements run top to bottom.
18. **`5`** — `4 > 9` is false, so the ternary takes the third expression: `b - a = 9 - 4 = 5`. Getting −5 means you took the true branch.
19. **`3 1`** — quotient 3 (truncated), remainder 1. The pair `/` and `%` together recover the whole division.
20. **`  3.14`** — width 6, 2 decimals: "3.14" is 4 characters, padded with 2 leading spaces. Count the spaces; `3.14` alone loses the width point.
21. **`3 6`** — prefix: p becomes 3 first, then q = 3*2 = 6. Postfix would have given q = 4 with p = 3 — the difference is the entire question.
22. **`1`** — precedence: `8+2*5 = 18`, `2*2*5 = 20`, `18 < 20` → 1; `3 > 1` → 1; `1 && 1` → 1. Relational operators bind before `&&`, so no parentheses are needed.

### Part IV — Fill in the Code

23. **`lf`** — a `double` in `scanf` must use `%lf`; plain `%f` corrupts the value.
24. **`\"hi\"`** — full statement: `printf("He said \"hi\"");` — the escape `\"` prints the quote instead of ending the string.
25. **`-=`** — `total -= 5;` is `total = total - 5;`
26. **`conio.h`** — the console I/O header (Turbo C).

### Part V — Flowchart & Pseudocode

27. **`X`** — `8 > 3` is true, enter the inner IF; `8 % 3 = 2`, so the condition holds and X prints. Answering Y means you computed the remainder wrong; Z means you misread the outer condition.
28. **`-2`** — N: 10 → 7 → 4 → 1 → −2. The subtle part: at N = 1 the condition `N > 0` is still true, so one more subtraction runs *before* the test can fail. Answering 1 means you stopped a step early.
29. **c)** — sequence, selection, and repetition; Lesson 1 states these three are sufficient for any program logic.
30. **Direction of execution; it is called a flow line.** Both halves are needed for full credit.

### Scoring Guide (per 30-item exam)

- **27–30:** exam-ready; just do a light review the night before.
- **21–26:** solid — restudy only the lessons your misses came from.
- **Below 21:** reread the weakest lesson end to end, redo its practice set, then retake the other mock cold.
$md$, 5);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('a1000001-0001-0001-0001-0000000000e1','activity','Common Prelim Traps & How to Avoid Them',$md$
Professors reuse the same six traps every semester because they keep working. Learn to smell each one and you pick up 5–10 points without learning anything new. Each trap comes with a mini-drill — answer before reading the solution line.

### Trap 1: `=` vs `==`

`=` assigns; `==` compares. Inside an `if`, an assignment still "works" — the condition becomes the assigned value, and any non-zero value is true.

**Drill:** What prints, and what is `x` afterward?
```c
int x = 0;
if (x = 5)
    printf("A");
else
    printf("B");
```
**Answer:** `A`, and x is now 5. `x = 5` assigns 5, the condition sees 5 (non-zero = true). The tempting answer `B` assumes a comparison that never happened.

### Trap 2: Integer division

When both operands are integers, `/` throws away the decimal part — even if the result is stored in a `float`.

**Drill:** What is stored in `avg`?
```c
float avg = (80 + 85) / 2;
```
**Answer:** `82.0`, not 82.5. `165 / 2` happens in integer math first. Fix: divide by `2.0`, or make one operand a float.

### Trap 3: Missing `&` in `scanf`

`scanf` needs the **address** of a plain variable — that is what `&` provides. Forget it and the program compiles but reads into a garbage location.

**Drill:** Spot the error:
```c
int num;
scanf("%d", num);
```
**Answer:** It must be `scanf("%d", &num);`. Exception to remember: char arrays (strings) drop the `&` because the array name is already an address.

### Trap 4: `%d` vs `%f` mismatch

The specifier must match the type. Printing a `float` with `%d` (or reading a `double` with `%f`) produces garbage — the lesson calls this undefined behavior.

**Drill:** `y` is a `double`. Which specifier is correct in `scanf("%__", &y);` — `d`, `f`, or `lf`?
**Answer:** `lf`. In scanf, `%f` is only for `float`; `%d` is only for integers.

### Trap 5: Off-by-one loop counts

`<` and `<=` differ by exactly one iteration, and that one iteration is where the points are.

**Drill:** How many times does each loop body run?
```c
for (i = 1; i < 5; i++)   /* (a) */
for (i = 0; i <= 10; i++) /* (b) */
```
**Answer:** (a) **4** times (i = 1,2,3,4); (b) **11** times (i = 0 through 10 — counting zero is what people forget).

### Trap 6: Semicolon after `if`

A `;` right after the condition is an **empty statement** — the `if` controls nothing, and the "body" below always runs.

**Drill:** What prints when `score` is 60?
```c
if (score >= 75);
    printf("Passed");
```
**Answer:** `Passed` prints anyway. The `if` executed the empty statement; the `printf` is just the next statement, indented or not. Same trap works on `while (...);` — that one becomes an infinite or do-nothing loop.

### Drill Lab

The playground below contains Traps 1, 2, and 6 planted in one program. Fix all three so it prints `half = 3.5` and only the messages that should appear for a score of 80 — then rerun with `score = 100` and check it still behaves.
$md$, 6, 'c', $code$#include <stdio.h>

int main(void) {
    int score = 80;
    float half = 0.0f;

    /* Trap 1: this should COMPARE score to 100, not assign */
    if (score = 100)
        printf("Perfect!\n");

    /* Trap 2: this should store 3.5, not 3.0 */
    half = 7 / 2;
    printf("half = %.1f\n", half);

    /* Trap 6: "Passed" should print only when score >= 75 */
    if (score >= 75);
        printf("Passed\n");

    return 0;
}$code$);

-- ============================================================
-- LOCKED ACTIVITIES — FINALS (sort 7-10)
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a1000001-0001-0001-0001-0000000000e1','activity','Final Exam Blueprint & Rapid Review Sheet',$md$
The final is **cumulative** — Lessons 1 through 7 — but weighted hard toward the second half. Expect something close to:

| Coverage | Typical weight |
|---|---|
| Lessons 1–3 (concepts, C basics, I/O) | 15–25% |
| Lesson 4: Program Control Structures | 25–30% |
| Lesson 5: Arrays | 20–25% |
| Lesson 6: Functions | 15–20% |
| Lesson 7: String, Character, and Math Functions | 10–15% |

Code tracing dominates. If the prelim asked "what is the rule," the final asks "what does this code print" — so practice tracing on paper, line by line, with a variables table.

### Rapid Review: Loops (Lesson 4)

- `while` — tests **before**; body may run zero times.
- `do-while` — tests **after**; body always runs at least once; ends with `;` after the condition.
- `for (init; condition; increment)` — init once, test before each pass, increment after each pass.
- `break` exits the innermost loop (or a `switch`); `continue` skips to the next iteration.
- `switch`: expression must be `int` or `char`; `case` labels must be constants; a missing `break` falls through; `default` catches the rest. Ranges need if/else-if ladders — `case` cannot match `age <= 12`.

**Three loop patterns to know cold:**
```c
sum = 0;                     /* running total          */
for (i = 0; i < n; i++) sum += a[i];

count = 0;                   /* count matches          */
for (i = 0; i < n; i++) if (a[i] < 0) count++;

max = a[0];                  /* largest element        */
for (i = 1; i < n; i++) if (a[i] > max) max = a[i];
```

### Rapid Review: Arrays (Lesson 5)

- Indexes run **0 to size − 1**; `int x[10]` ends at `x[9]`.
- Partial initializer zero-fills the rest: `int a[5] = {1, 2};` → a[2..4] are 0. Uninitialized locals are garbage; `static` and globals start at zero.
- A string is a char array ending in `'\0'` — "NORTH" needs 6 slots.
- Arrays cannot be assigned with `=`; copy element by element in a loop.
- Reverse/mirror index formula: `n - 1 - i`.
- Bubble sort ascending: compare `num[i] > num[i+1]`, swap through a `temp`.

### Rapid Review: Functions (Lesson 6)

```c
return_type name(parameter list) {   /* definition */
    declarations; statements;
    return value;                    /* omit for void */
}
```
- Prototype before `main`, definition anywhere after — or define the whole function first.
- **Call by value:** the function gets a copy; the caller's variable never changes.
- **Call by reference:** pass `&x`, receive `int *p`, write through `*p` — the caller's variable changes.
- `&x` = "address of x"; `*p` = "value at the address in p".
- Locals die at return; globals live for the whole program and default to zero.

### Rapid Review: Library Functions (Lesson 7)

| Header | Must-knows |
|---|---|
| `string.h` | `strcpy`, `strncpy` (copies n chars, adds no terminator), `strcat`/`strncat`, `strcmp` (0 = equal), `strlen` (excludes the terminator), `strrev`, `strupr`, `strlwr` |
| `ctype.h` | `isdigit`, `isalpha`, `isalnum`, `isupper`, `islower`, `ispunct`, `isspace`, `toupper`, `tolower` |
| `math.h` | `abs` (int), `fabs` (double), `ceil` (round up), `floor` (round down), `fmod` (float remainder), `pow`, `sqrt` |
| `stdlib.h` | `atoi`, `atof`, `atol` — string to number |

Watch-outs: `strlen("BSIT")` is 4, not 5; `strcmp` returning 0 means EQUAL (feels backwards); `isdigit('5')` tests the character symbol, not the number; work nested calls inside-out (`sqrt(floor(25.12))` → `sqrt(25.0)` → `5.0`); `strrev`/`strupr`/`strlwr`/`stricmp` are Turbo C extensions, not standard C.

### 5-Day Final Countdown

| Day | Do this |
|---|---|
| 1 | Reread Lesson 4; hand-trace every loop and `switch` example with a variables table. |
| 2 | Reread Lesson 5; redo the value-vs-index twin traces and one bubble sort pass on paper. |
| 3 | Reread Lessons 6–7; write the call-by-value vs call-by-reference trace from memory; recite the library tables. |
| 4 | Take Final Mock Exam A, timed. Mark it. Restudy every miss the same day. |
| 5 | Take Final Mock Exam B cold. Skim Lessons 1–3 tables (specifiers, escapes, precedence) for the carried-over 20%. |
$md$, 7),

('a1000001-0001-0001-0001-0000000000e1','activity','Final Mock Exam A — 30 Items',$md$
Cumulative, weighted to Lessons 4–7, heavy on tracing and debugging — exactly like the real final. 60 minutes, closed notes, trace on paper with a variables table. Assume `stdio.h`, `string.h`, `ctype.h`, and `math.h` are included and variables are declared unless shown.

### Part I — Multiple Choice (1–8)

1. Which loop always executes its body at least once?
   a) `for`  b) `while`  c) `do-while`  d) none of these
2. A `switch` expression may NOT evaluate to:
   a) `int`  b) `char`  c) `float`  d) a constant expression
3. Inside a loop, `continue`:
   a) exits the loop  b) skips the rest of the current iteration  c) restarts the program  d) exits the function
4. For `int x[8]`, valid indexes run from:
   a) 1 to 8  b) 0 to 8  c) 0 to 7  d) 1 to 7
5. A function with return type `void`:
   a) returns zero  b) returns no value  c) cannot take parameters  d) cannot call other functions
6. `strcmp("abc", "abc")` returns:
   a) 1  b) 0  c) −1  d) "abc"
7. Which function returns the smallest integer greater than or equal to its argument?
   a) `floor()`  b) `fabs()`  c) `ceil()`  d) `fmod()`
8. In `scanf("%s", name);` for a char array, no `&` is written because:
   a) strings cannot use `&`  b) the array name is already an address  c) `%s` forbids it  d) it is a syntax error otherwise

### Part II — True or False (9–14)

9. Without `break`, a matched `switch` case falls through into the next case.
10. The body of `while (0) { ... }` executes exactly once.
11. `int a[5] = {1, 2};` sets `a[4]` to 0.
12. Call by value lets a function modify the caller's variable.
13. `strlen("BSIT")` returns 5.
14. `isdigit('7')` is true.

### Part III — Trace the Code (15–24)

Write the exact output.

15.
```c
int i, s = 0;
for (i = 1; i <= 5; i++)
    s += i;
printf("%d", s);
```
16.
```c
int n = 6;
while (n > 1) {
    printf("%d ", n);
    n -= 2;
}
```
17.
```c
int x = 3;
switch (x) {
    case 1: printf("A");
    case 3: printf("B");
    case 5: printf("C"); break;
    default: printf("D");
}
```
18.
```c
int i;
for (i = 0; i < 10; i++) {
    if (i % 3 != 0)
        continue;
    printf("%d ", i);
}
```
19.
```c
int a[] = {2, 4, 6, 8, 10};
int i, t = 0;
for (i = 1; i < 4; i++)
    t += a[i];
printf("%d", t);
```
20.
```c
int a[5] = {1, 2, 3, 4, 5};
int i;
for (i = 0; i < 5; i++)
    if (i % 2 == 0)
        printf("%d", a[i]);
```
21.
```c
int f(int n) {
    if (n > 5)
        return n - 1;
    return n + 1;
}
/* in main: */
printf("%d", f(f(7)));
```
22.
```c
void change(int a, int *b) {
    a = a + 10;
    *b = *b + 10;
}
/* in main: */
int x = 1, y = 1;
change(x, &y);
printf("%d %d", x, y);
```
23. After these lines run, what string does `s` contain, and what does `strlen(s)` return?
```c
char s[10] = "BS";
strcat(s, "IT");
```
24.
```c
printf("%.0f %.0f", floor(4.7), ceil(4.1));
```

### Part IV — Find and Fix the Bug (25–28)

State what goes wrong and give the one-line fix.

25.
```c
int i = 0;
while (i < 3)
    printf("%d", i);
    i++;
```
26. `grade` is 90. The program is supposed to print only `A`:
```c
switch (grade) {
    case 90: printf("A");
    case 80: printf("B");
}
```
27.
```c
int nums[3] = {10, 20, 30};
for (i = 0; i <= 3; i++)
    printf("%d ", nums[i]);
```
28.
```c
int total(int a, int b);      /* prototype */

void total(int a, int b) {    /* definition */
    return a + b;
}
```

### Part V — Fill in the Code (29–30)

29. Complete the classic swap through pointers:
```c
void swap(int *a, int *b) {
    int temp;
    temp = *a;
    *a = *b;
    *b = ______;
}
```
30. Complete the condition so `max` ends up holding the largest element:
```c
int max = arr[0];
for (i = 1; i < n; i++)
    if (______)
        max = arr[i];
```
$md$, 8),

('a1000001-0001-0001-0001-0000000000e1','activity','Final Mock Exam B — 30 Items',$md$
All-new items, same cumulative scope weighted to Lessons 4–7. Take it a day or two after marking Mock A. 60 minutes, closed notes. Assume the usual headers and declarations unless shown.

### Part I — Multiple Choice (1–8)

1. Which loop tests its condition BEFORE each iteration and may therefore run zero times?
   a) `do-while`  b) `while`  c) both a and b  d) neither
2. `case` labels in a `switch` must be:
   a) variables  b) constants  c) floats  d) strings
3. A `break` inside the inner loop of two nested loops exits:
   a) both loops  b) only the innermost loop  c) the function  d) the program
4. Per Lesson 5, the address of element `i` equals the array address plus:
   a) `i`  b) `sizeof(element) * i`  c) `sizeof(array)`  d) `i / sizeof(element)`
5. Which is an advantage of functions listed in Lesson 6?
   a) faster compilation  b) reusability — write once, call anywhere  c) no need for variables  d) automatic error correction
6. The pitfall of `strncpy(target, source, n)` when the source is longer than n:
   a) it crashes  b) it copies nothing  c) it does not add a null terminator  d) it reverses the string
7. `fmod(7.0, 2.0)` returns:
   a) 3.5  b) 3.0  c) 1.0  d) 0.5
8. `toupper('a')` returns:
   a) `'A'`  b) `"A"`  c) 1  d) `'a'`

### Part II — True or False (9–14)

9. `for (i = 0, j = 10; i < j; i++)` — initializing two variables with the comma operator is legal.
10. A `do-while` statement ends with a semicolon after the condition.
11. You can copy one array into another with a single assignment: `b = a;`
12. A local variable is automatically initialized to zero.
13. `stricmp("BSIT", "bsit")` returns 0.
14. `abs()` takes a `double` argument.

### Part III — Trace the Code (15–24)

Write the exact output.

15.
```c
int i = 1, s = 0;
do {
    s += i;
    i++;
} while (i < 4);
printf("%d %d", i, s);
```
16. How many `*` characters does this print in total?
```c
int i, j;
for (i = 1; i <= 3; i++)
    for (j = 1; j <= i; j++)
        printf("*");
```
17.
```c
int x = 2;
switch (x + 1) {
    case 2: printf("two"); break;
    case 3: printf("three"); break;
    default: printf("other");
}
```
18.
```c
int a[6] = {5, 10, 15};
printf("%d %d", a[2], a[4]);
```
19.
```c
int v[] = {7, -2, 0, -9, 4};
int i, c = 0;
for (i = 0; i < 5; i++)
    if (v[i] < 0)
        c++;
printf("%d", c);
```
20.
```c
int mystery(int n) {
    int r = 1, i;
    for (i = 1; i <= n; i++)
        r *= i;
    return r;
}
/* in main: */
printf("%d", mystery(4));
```
21.
```c
void twice(int *n) {
    *n = *n * 2;
}
/* in main: */
int v = 6;
twice(&v);
twice(&v);
printf("%d", v);
```
22. After these lines run, what string does `w` contain, and what does `strlen(w)` return?
```c
char w[10] = "exam";
w[0] = toupper(w[0]);
```
23.
```c
printf("%.1f", pow(2, 3) + sqrt(9));
```
24.
```c
int i = 0;
while (i++ < 3)
    printf("%d", i);
```

### Part IV — Find and Fix the Bug (25–28)

State what goes wrong and give the one-line fix.

25.
```c
do {
    scanf("%d", &n);
} while (n != 0)
```
26.
```c
float scores[5];
scanf("%f", scores[0]);
```
27. The function is supposed to return the sum:
```c
int getsum(int a, int b) {
    int s = a + b;
}
```
28. The condition is supposed to be true only when `ch` is 'a' or 'e':
```c
if (ch == 'a' || 'e')
    printf("vowel");
```

### Part V — Fill in the Code (29–30)

29. Complete the bubble-sort comparison for ASCENDING order:
```c
if (num[i] ____ num[i + 1]) {
    temp = num[i];
    num[i] = num[i + 1];
    num[i + 1] = temp;
}
```
30. Complete the reverse copy so `y` receives `x` backwards (n elements):
```c
for (i = 0; i < n; i++)
    y[i] = x[______];
```
$md$, 9);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('a1000001-0001-0001-0001-0000000000e1','activity','Final Mock Exams — Answer Key with Explanations',$md$
Mark one mock at a time. For every trace you missed, redo it on paper with a variables table before reading the explanation — the retrace teaches more than the answer.

## Final Mock Exam A

### Part I — Multiple Choice

1. **c) `do-while`.** It tests *after* the body. Both `for` and `while` test first and can run zero times.
2. **c) `float`.** A `switch` works on `int` or `char` only. (d) tempts, but case labels being constant expressions is exactly what IS required.
3. **b) skips the rest of the current iteration.** Exiting the loop entirely (a) is `break` — the classic swap.
4. **c) 0 to 7.** Size 8 means last index 7. Choosing (b) is the off-by-one this item exists to catch.
5. **b) returns no value.** `void` says nothing about parameters (c) — `void f(int x)` is perfectly fine.
6. **b) 0.** `strcmp` returns 0 for EQUAL strings. Answer (a) tempts because "equal feels like true = 1", but the return convention is negative/zero/positive.
7. **c) `ceil()`.** Rounds up. `floor()` (a) is the mirror trap — largest integer ≤ num.
8. **b) the array name is already an address.** That is also why plain variables DO need `&` — scanf always wants addresses.

### Part II — True or False

9. **TRUE.** Fall-through is the whole reason `break` exists in a `switch`.
10. **FALSE.** `while` tests first; 0 is false, so the body never runs. The loop that guarantees one pass is `do-while`.
11. **TRUE.** A partial initializer zero-fills the remaining elements — a[2], a[3], a[4] are all 0.
12. **FALSE.** The function receives a copy; only call by *reference* (an address plus `*`) can modify the caller's variable.
13. **FALSE.** 4 — `strlen` never counts the `'\0'`.
14. **TRUE.** `'7'` is a digit character, which is precisely what `isdigit` tests.

### Part III — Trace the Code

15. **`15`** — s accumulates 1+2+3+4+5. `<=` includes the 5; misreading it as `<` gives the trap answer 10.
16. **`6 4 2 `** — n prints then drops by 2: 6, 4, 2; at n = 0 the test `0 > 1` fails. Printing the 0 means you tested after printing instead of before.
17. **`BC`** — x matches `case 3`, prints B, and with no `break` falls through to print C, where the `break` finally stops it. `B` alone ignores fall-through; `BCD` ignores the `break`.
18. **`0 3 6 9 `** — `continue` skips every i not divisible by 3; 0 counts because 0 % 3 is 0. Leaving out the 0 is the usual miss.
19. **`18`** — the loop starts at index **1**, so it sums a[1]+a[2]+a[3] = 4+6+8. The trap answer 20 (2+4+6+8) starts at index 0.
20. **`135`** — the condition tests the INDEX i, not the value: indexes 0, 2, 4 hold 1, 3, 5. Answering 24 (2+4... wrong altogether) or picking even VALUES (2, 4) means you fell into the value-vs-index trap from Lesson 5.
21. **`5`** — inside out: f(7) → 7 > 5 → 6; then f(6) → 6 > 5 → 5. Stopping after one call gives the trap answer 6.
22. **`1 11`** — `a` is a copy (x stays 1); `*b` writes through the address (y becomes 11). If you answered `11 11`, reread call by value; `1 1`, reread call by reference.
23. **`s` contains `"BSIT"`, `strlen(s)` returns `4`** — `strcat` appends onto the existing "BS"; the terminator is never counted by `strlen`.
24. **`4 5`** — `floor(4.7)` drops to 4; `ceil(4.1)` rises to 5. Swapping them is the standard confusion — floor goes down like the floor, ceil goes up like the ceiling.

### Part IV — Find and Fix the Bug

25. **Infinite loop printing `0` forever.** Without braces, only the `printf` belongs to the `while`; `i++` sits outside and never runs. Fix: wrap both statements in `{ }`.
26. **It prints `AB`** — case 90 matches, then falls through into case 80. Fix: add `break;` after `printf("A");` (and after "B" for good style).
27. **Out-of-bounds read.** `i <= 3` accesses `nums[3]`, one past the last valid index (2). Fix: `i < 3`.
28. **The prototype says `int` but the definition says `void`, and a void function cannot `return a + b;`.** Fix: make the definition `int total(int a, int b)`.
29. **`temp`** — the saved original of `*a` completes the three-line swap: temp = *a; *a = *b; *b = temp;
30. **`arr[i] > max`** — strictly greater keeps the first occurrence of the maximum and still finds the largest value.

## Final Mock Exam B

### Part I — Multiple Choice

1. **b) `while`.** `do-while` (a) always runs once, which rules out (c) too.
2. **b) constants.** That is why range conditions like `days <= 4` can never be `case` labels — ranges need an if/else-if ladder.
3. **b) only the innermost loop.** Escaping both loops (a) needs an extra mechanism; a single `break` never does it.
4. **b) `sizeof(element) * i`** — straight from the element address formula in Lesson 5.
5. **b) reusability.** The lesson's advantages are cleaner design, reusability, team development, easier debugging — nothing about speed (a).
6. **c) it does not add a null terminator** — printing that target as a string then runs past the end. Mentioning this is the lesson's "bonus point" fact.
7. **c) 1.0** — floating-point remainder of 7 ÷ 2 (7 = 3×2 + 1). Answer (b) 3.0 is the *quotient*, not the remainder.
8. **a) `'A'`** — a character result, not a string (b) and not a truth value (c) — the is/to confusion in one item.

### Part II — True or False

9. **TRUE.** The comma operator lets `for` initialize (or update) several variables — shown in Lesson 4.
10. **TRUE.** `} while (condition);` — forgetting that semicolon is Bug 25 in Mock B, so this pair of items should have paid for itself.
11. **FALSE.** Arrays cannot be assigned directly; copy element by element in a loop.
12. **FALSE.** Locals hold garbage until you assign them; it is GLOBALS (and `static` arrays) that default to zero.
13. **TRUE.** `stricmp` compares ignoring case, so "BSIT" vs "bsit" are equal → 0. (Turbo C extension, like `strrev`.)
14. **FALSE.** `abs()` is for `int`; the double version is `fabs()`.

### Part III — Trace the Code

15. **`4 6`** — passes: (s=1, i=2), (s=3, i=3), (s=6, i=4); then `4 < 4` fails. Note i finishes at 4, not 3 — the increment runs before the test.
16. **`6`** — the inner loop runs i times per pass: 1 + 2 + 3. This triangle pattern is the standard nested-loop counter.
17. **`three`** — the switch evaluates `x + 1 = 3` first. Answering "two" means you matched on x instead of the switch expression.
18. **`15 0`** — a[2] is 15 from the initializer; a[4] was zero-filled because the initializer was partial. "Garbage" is wrong precisely because SOME values were given.
19. **`2`** — negatives are −2 and −9. Zero is not negative; counting it gives the trap answer 3.
20. **`24`** — r multiplies 1×2×3×4: this is factorial in disguise (Lesson 6's exercise). Answering 10 means you added instead of multiplied.
21. **`24`** — 6 doubled through the pointer twice: 12, then 24. If you said 6, the `*` writes did not register — reread call by reference.
22. **`w` contains `"Exam"`, `strlen(w)` returns `4`** — only w[0] is uppercased; length is unchanged (the terminator is not counted).
23. **`11.0`** — inside out: `pow(2,3) = 8.0`, `sqrt(9) = 3.0`, sum 11.0, printed with one decimal.
24. **`123`** — the tricky one. Each test increments i *after* comparing: test 0<3 (i becomes 1) print 1; test 1<3 (i→2) print 2; test 2<3 (i→3) print 3; test 3<3 fails. Answering `012` means you printed before the increment took effect.

### Part IV — Find and Fix the Bug

25. **Missing semicolon** — a `do-while` must end `while (n != 0);`. Without it the compiler complains at the next line.
26. **Missing `&` on a single element** — `scores[0]` is a value, not an address. Fix: `scanf("%f", &scores[0]);`. (The no-`&` rule covers the array NAME, not an indexed element.)
27. **No `return`** — the function computes `s` and throws it away; callers get garbage. Fix: add `return s;`.
28. **`ch == 'a' || 'e'` is ALWAYS true** — `'e'` is a non-zero value, so the `||` succeeds no matter what ch is. Fix: `ch == 'a' || ch == 'e'`. Each side of `||` needs its own complete comparison.
29. **`>`** — for ascending order you swap when the left neighbor is BIGGER. Using `<` sorts descending, which is the mirror trap.
30. **`n - 1 - i`** — check the endpoints: i = 0 reads the last element (n−1), i = n−1 reads the first (0). Endpoint-testing the formula is how you derive it under exam pressure.

### Scoring Guide (per 30-item exam)

- **27–30:** ready — do the Rapid Review Sheet once the night before and stop there.
- **21–26:** trace practice is what you need; redo every Part III item you missed by hand.
- **Below 21:** go back to the lesson the misses cluster in (usually Lesson 4 or 5), redo its exercises, then retake the other mock cold.

### Trace Checker

Not convinced by an answer? Retype the item into the playground below and run it. It starts loaded with Mock A item 17 (the switch fall-through) — predict on paper first, then press Run and compare.
$md$, 10, 'c', $code$#include <stdio.h>

/* Trace checker — starts with Final Mock A, item 17.
   Predict the output on paper FIRST, then press Run.
   Swap in any other trace item you want to verify. */

int main(void) {
    int x = 3;

    switch (x) {
        case 1: printf("A");
        case 3: printf("B");
        case 5: printf("C"); break;
        default: printf("D");
    }
    printf("\n");

    return 0;
}$code$);
