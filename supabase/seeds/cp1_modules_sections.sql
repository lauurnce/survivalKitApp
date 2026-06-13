-- ============================================================
-- Computer Programming 1 — Modules & Sections
-- Subject ID: 10000000-0001-0001-0001-000000000001
-- Run after migration 002 and 1st_year_subjects.sql
-- ============================================================

DELETE FROM modules WHERE subject_id = '10000000-0001-0001-0001-000000000001';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('a1000001-0001-0001-0001-000000000001','10000000-0001-0001-0001-000000000001','Lesson 1: Programming Concepts','lesson-1-programming-concepts',1),
  ('a1000001-0001-0001-0001-000000000002','10000000-0001-0001-0001-000000000001','Lesson 2: Introduction to C','lesson-2-introduction-to-c',2),
  ('a1000001-0001-0001-0001-000000000003','10000000-0001-0001-0001-000000000001','Lesson 3: Input/Output and Program Structure','lesson-3-input-output-program-structure',3),
  ('a1000001-0001-0001-0001-000000000004','10000000-0001-0001-0001-000000000001','Lesson 4: Program Control Structures','lesson-4-control-structures',4),
  ('a1000001-0001-0001-0001-000000000005','10000000-0001-0001-0001-000000000001','Lesson 5: Arrays','lesson-5-arrays',5),
  ('a1000001-0001-0001-0001-000000000006','10000000-0001-0001-0001-000000000001','Lesson 6: Functions','lesson-6-functions',6),
  ('a1000001-0001-0001-0001-000000000007','10000000-0001-0001-0001-000000000001','Lesson 7: String, Character, and Math Functions','lesson-7-string-char-math-functions',7);

-- ============================================================
-- LESSON 1: Programming Concepts
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a1000001-0001-0001-0001-000000000001','content','What Is a Computer?',$md$
A computer is an electronic device that accepts data from the user, processes it, produces results, and stores those results for future use. Data is raw, unorganized facts; information is data that has been processed into something meaningful.

### Hardware and Software

**Hardware** refers to the physical, mechanical parts of a computer — the devices you can touch. This includes the CPU, keyboard, mouse, hard drive, and other components.

**Software** is the set of instructions that drives the computer to perform tasks. Software falls into two categories:
- **System software** — operates directly on the hardware (e.g., Windows, Linux, Unix).
- **Application software** — designed to help users perform specific tasks (e.g., word processors, spreadsheets).

### Programs and Programming

A **program** is the ordered set of instructions a computer follows to process data into information. Writing that set of instructions is called **programming**.

**The five-step programming process:**
1. **Define the problem** — understand what needs to be solved. Specify objectives, identify users, define inputs and outputs, and assess feasibility.
2. **Design the solution** — plan the logic using tools like hierarchy charts, flowcharts, or pseudocode.
3. **Code the program** — translate the design into a specific programming language.
4. **Test the program** — desk check, debug, and run with real data to confirm correctness.
5. **Document the program** — write user, operator, and programmer documentation.

**Types of errors:**
- **Syntax errors** — incorrect formatting, caught during compilation.
- **Logic errors** — code runs but produces wrong results due to faulty reasoning.
$md$, 1),

('a1000001-0001-0001-0001-000000000001','content','Program Logic Formulation',$md$
Before writing code, plan the logic. Two common tools: **flowcharts** and **pseudocode**.

### Flowcharts

A flowchart is a visual representation of a solution using standardized shapes connected by arrows.

| Symbol | Name | Purpose |
|---|---|---|
| Oval | Terminal | Marks start or stop |
| Parallelogram | Input/Output | User input or output of results |
| Rectangle | Process | Computation or data manipulation |
| Diamond | Decision | Condition — TRUE or FALSE paths |
| Arrow | Flow Line | Direction of execution |
| Circle | Connector | Connects parts across pages |

**Three fundamental control structures:**

**1. Sequential** — steps execute one after another in order.
```
START → Initialize → INPUT → PROCESS → OUTPUT → STOP
```

**2. Selection** — a decision point where one of two paths is taken.
```
START → INPUT A
  IF A < 0 → OUTPUT "NEGATIVE"
  ELSE IF A == 0 → OUTPUT "INVALID"
  ELSE → OUTPUT "POSITIVE"
STOP
```

**3. Repetition** — steps are repeated until a condition is met.
```
START → N=0
  LOOP while N < 10:
    N = N + 1
    IF N is odd: OUTPUT N
STOP
```

These three structures — sequence, selection, repetition — are sufficient to construct any program logic.
$md$, 2),

('a1000001-0001-0001-0001-000000000001','content','Algorithms (Pseudocode)',$md$
An **algorithm** is a step-by-step description of a solution written in structured English-like language. Also called **pseudocode**.

**Common pseudocode conventions:**
- Arithmetic: `+`, `-`, `*`, `/`
- Assignment: `→` (arrow pointing to the variable)
- Input: `INPUT` or `READ`
- Output: `OUTPUT`, `PRINT`, or `DISPLAY`
- Indentation shows grouping of related steps

**Sequential example — sum of two numbers:**
```
ALGORITHM sum
  A → 0, B → 0, SUM → 0
  INPUT A, B
  SUM → A + B
  OUTPUT SUM
END sum
```

**Sequential example — product of three numbers:**
```
ALGORITHM product
  A → 0, B → 0, C → 0, PRODUCT → 0
  INPUT A, B, C
  PRODUCT → A * B * C
  OUTPUT PRODUCT
END product
```

**Selection example — positive or negative number:**
```
ALGORITHM pos_neg
  N → 0
  INPUT N
  IF N < 0 THEN
    OUTPUT "NEGATIVE"
  END IF
  IF N == 0 THEN
    OUTPUT "INVALID"
  ELSE
    OUTPUT "POSITIVE"
  END IF
END pos_neg
```
$md$, 3),

('a1000001-0001-0001-0001-000000000001','activity','Practice Exercises — Lesson 1',$md$
**Review questions (write answers in your own words):**
1. Differentiate hardware and software.
2. Differentiate program and programming.
3. What are the components of hardware?
4. What are the five steps of programming?
5. What is the difference between a syntax error and a logic error?

**Algorithm exercises — write a flowchart AND pseudocode for each:**

1. The volume of a rectangular box is V = length × width × height. Design an algorithm that takes the three dimensions and displays the volume.

2. Design an algorithm that converts hours to minutes. Output: "3 hours is equal to 180 minutes."

3. Given three numbers a, b, and c, design an algorithm that computes their sum, difference, product, quotient, and sum of their squares.

4. A store sells four candy types: Type A ₱35/kg, Type B ₱45/kg, Type C ₱56/kg, Type D ₱57.50/kg. Design an algorithm to calculate total cost from the weight of each type purchased.

5. On Mars, a 100-pound Earth person weighs 38 pounds. On Jupiter, 264 pounds. Design an algorithm that takes Earth weight and displays Mars and Jupiter weight.
$md$, 4);

-- ============================================================
-- LESSON 2: Introduction to C
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a1000001-0001-0001-0001-000000000002','content','What Is C?',$md$
C is a general-purpose, structured programming language known for efficiency and close-to-hardware control. It uses economy of expression, modern control structures, and a rich set of operations. Often called a "systems programming language" because it is well-suited for writing operating systems and compilers.

### Brief History

- **BCPL** — developed by Martin Richards in 1967; influenced B.
- **B** — created by Ken Thompson in 1970 for early UNIX on the DEC PDP-7; typeless (no data types).
- **C** — designed by Dennis Ritchie in 1972 at AT&T Bell Laboratories; expanded B by adding data types.
- **Turbo C** — developed by Borland International in 1987 for MS-DOS.

### Key Definitions

- **Interpreter** — reads and executes source code one line at a time.
- **Compiler** — reads the entire program and converts it to object code.
- **Compile time** — when compilation happens; syntax errors are caught here.
- **Object code** — machine-language translation of source code; also called binary or machine code.
- **Source code** — the human-readable text of a program.
- **Run time** — when the compiled program executes; run-time (semantic) errors appear here.
- **Library** — a collection of pre-written functions available for use in programs.
$md$, 1),

('a1000001-0001-0001-0001-000000000002','content','The Compilation Process',$md$
When you write a C program and want to run it, it goes through these stages:

```
Source code (.c file)
      ↓
  Preprocessor   ← handles #include, #define directives
      ↓
  Compiler       ← converts to object code; catches syntax errors
      ↓
  Object code
      ↓
  Linker         ← combines object code with library code
      ↓
  Executable code
```
$md$, 2),

('a1000001-0001-0001-0001-000000000002','content','Identifiers',$md$
An identifier is a name used to reference a variable, function, or other user-defined element.

**Rules for naming identifiers in C:**
1. The first character must be a letter or underscore (`_`).
2. Subsequent characters can be letters, digits, or underscores.
3. Spaces and hyphens are not allowed.
4. The first 63 characters are significant.
5. C is **case-sensitive**: `Sname`, `SNAME`, and `sname` are three different identifiers.
6. An identifier cannot be the same as a C keyword (e.g., `int`, `float`, `if`, `while`).
$md$, 3),

('a1000001-0001-0001-0001-000000000002','content','Data Types',$md$
C provides several fundamental (scalar) data types:

| Type | Size | Range | Use |
|---|---|---|---|
| `short int` | 2 bytes | −32,768 to +32,767 | Small integers |
| `int` | 4 bytes | −2,147,483,648 to +2,147,483,647 | General integers |
| `long int` | 4 bytes | Same as int | Large integers |
| `unsigned int` | 2–4 bytes | 0 to 65,535+ | Non-negative integers |
| `float` | 4 bytes | ≈ 3.4E−38 to 3.4E+38 | Decimal numbers |
| `double` | 8 bytes | ≈ 1.7E−308 to 1.7E+308 | Higher-precision decimals |
| `char` | 1 byte | −128 to +127 | Single characters |
| `void` | — | — | No value (functions returning nothing) |
$md$, 4),

('a1000001-0001-0001-0001-000000000002','content','Variables and Constants',$md$
### Variables

A variable is an identifier that holds a value which can change during program execution.

**Declaration syntax:**
```c
data_type variable1, variable2;
```

Examples:
```c
int x, y, z;
char a, b;
double s;
float ave;
char Sname[30];
```

### Initializing Variables

Variables contain garbage values until explicitly assigned. Three ways:

**1. Assignment statement:**
```c
x = -1;
ch1 = 'A';
```

**2. Using `scanf`:**
```c
scanf("%d", &x);
```

**3. At declaration:**
```c
int x = 3;
char y = 'x';
double a, b = 100.00;
```

### Global vs. Local Variables

- **Global variables** — declared outside all functions; accessible throughout the program; initialized to zero if unspecified.
- **Local variables** — declared inside a function; accessible only within that function; must be explicitly initialized.

### Constants

| Type | Example |
|---|---|
| Character constant | `'a'`, `'P'` |
| Integer constant | `10`, `-100` |
| Floating-point | `11.123` |
| String constant | `"hello"` |
| `#define` | `#define PI 3.14159` |
| `const` modifier | `const float version = 3.20;` |
$md$, 5),

('a1000001-0001-0001-0001-000000000002','content','Operators',$md$
### Arithmetic Operators

| Operator | Operation |
|---|---|
| `*` | Multiplication |
| `/` | Division |
| `+` | Addition |
| `-` | Subtraction |
| `%` | Modulus (remainder) — integers only |
| `++` | Increment (add 1) |
| `--` | Decrement (subtract 1) |

**Important:** Integer division truncates: `11/2 = 5`. Modulus gives remainder: `11 % 2 = 1`.

**Prefix vs. postfix increment:**
```c
x = 10;
y = ++x;   // x becomes 11 first, then y = 11
x = 10;
y = x++;   // y = 10 first, then x becomes 11
```

**Shorthand operators:**
```c
x += y;   // x = x + y
x -= y;   // x = x - y
x *= y;   // x = x * y
x /= y;   // x = x / y
x %= y;   // x = x % y
```

### Relational Operators

| Operator | Meaning |
|---|---|
| `>` | Greater than |
| `<` | Less than |
| `>=` | Greater than or equal to |
| `<=` | Less than or equal to |
| `==` | Equal to |
| `!=` | Not equal to |

### Logical Operators

| Operator | Meaning |
|---|---|
| `&&` | AND |
| `\|\|` | OR |
| `!` | NOT |

In C, **true = any non-zero value**, **false = 0**.

### Ternary Operator

```c
expression1 ? expression2 : expression3;
```

If `expression1` is true, result is `expression2`; otherwise `expression3`.

### Operator Precedence (highest to lowest)
```
! ++ --           (unary)
* / %
+ -
< <= > >=
== !=
&&
||
? :
= += -= *= /=
```
$md$, 6),

('a1000001-0001-0001-0001-000000000002','activity','Practice Exercises — Lesson 2',$md$
**Review questions:**
1. Show the C declaration that associates each identifier with its value:
   - `counter` → 7, `length` → 12, `offset` → 12.3723, `sname` → "Sonnet", `group` → 'A'

2. Are these identifiers valid or invalid?
   - `JETT`, `gRAde_`, `float`, `qty_sold`, `_ _`, `integer`, `x_tra`, `1311Nov`, `Rating`, `@_First!`

3. What data type for: `'A'`, `32769`, `32.55`, `21482.93`, `-123`, `632179`?

**Evaluate the following C arithmetic expressions:**
```
a.  5 * 6 + 8 – 4 % 3
b.  9 * 2 + (8 – 5) / 2 < 1 * (7 + 4) && 6 + 7 * 4 / 5 > 7 * 2 + 5 – 4
c.  6*5/(9-3) != (2*3+10)/4+1 || 8+2*5 < 2*2*5 && 6+2*9%4 == 2*3-4
d.  6 * 5 / 2 == 15 ? 100 : 200
e.  (15 > 26) || !(7 >= 8) && (4 <= 2)
```

**Evaluate as TRUE or FALSE:**
```
a.  2 – 4 > + 3
b.  17 == 35
c.  22/3 == 5 + 2*2 – 4
d.  TRUE && FALSE || TRUE
e.  (6 > 3) && (7 != 7)
f.  (7 == 2) || (7 > 4) && (6 == 5)
```
$md$, 7);

-- ============================================================
-- LESSON 3: Input/Output and Program Structure
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a1000001-0001-0001-0001-000000000003','content','The C Preprocessor',$md$
Lines that start with `#` in a C file are preprocessor directives — handled before compilation begins.

### `#define`

Replaces a symbolic name with a value throughout the file. By convention, constants are written in UPPERCASE.

```c
#define LIMIT 100
#define PI 3.14159
```

Changing the `#define` in one place takes effect everywhere — makes programs easier to update.

### `#include`

Inserts the contents of another file (a header file) at that point during compilation. Header files end in `.h`.

```c
#include <stdio.h>   // standard input/output: printf, scanf
#include <conio.h>   // console I/O: getch, clrscr
```
$md$, 1),

('a1000001-0001-0001-0001-000000000003','content','Standard Output: printf()',$md$
`printf()` sends formatted text to the screen. The "f" stands for "formatted."

**Syntax:**
```c
printf("format string", variable1, variable2, ...);
```

**Conversion specifications:**

| Specifier | Meaning |
|---|---|
| `%c` | Character |
| `%d` | Decimal integer |
| `%f` | Floating point (float) |
| `%lf` | Double |
| `%e` | Scientific notation |
| `%s` | String |

**Field width** — specified between `%` and the conversion character:
```c
printf("%c %3c %5c\n", 'A', 'B', 'C');
// A printed normally, B right-justified in 3 chars, C in 5
```
$md$, 2),

('a1000001-0001-0001-0001-000000000003','content','Standard Input: scanf()',$md$
`scanf()` reads formatted input from the keyboard. The `&` operator (address-of) is required before each variable.

**Syntax:**
```c
scanf("%conversion_spec", &variable);
```

Examples:
```c
scanf("%d", &num);       // read an integer
scanf("%f", &x);         // read a float
scanf("%lf", &y);        // read a double
scanf("%c", &ch);        // read a character
scanf("%s", name);       // read a string (no & for arrays)
```

`scanf()` returns the number of successful conversions. When reading characters, whitespace is **not** skipped automatically (unlike numbers).
$md$, 3),

('a1000001-0001-0001-0001-000000000003','content','Escape Sequences and Console I/O',$md$
### Escape Sequences

| Sequence | Meaning |
|---|---|
| `\n` | Newline |
| `\t` | Tab |
| `\\` | Backslash |
| `\"` | Double quote |
| `\'` | Single quote |
| `\a` | Bell (sound) |

### Console I/O (`conio.h`)

| Function | Behavior |
|---|---|
| `gets(str)` | Reads a string until Enter; no newline stored |
| `getchar()` | Reads one character; waits for Enter |
| `getch()` | Reads one character without echo; no Enter needed |
| `getche()` | Reads one character with echo; no Enter needed |
| `puts(str)` | Writes string to screen + newline |
| `putchar(ch)` | Writes one character |
| `clrscr()` | Clears the screen |
$md$, 4),

('a1000001-0001-0001-0001-000000000003','content','General C Program Structure',$md$
```c
global declarations;

function1() {
    local variables;
    statements;
}

main() {
    local variables;
    statements;
}
```

**Annotated sample program:**

```c
#include <stdio.h>
#include <conio.h>

main() {
    char c1, c2, c3;
    int i;
    float x;
    double y;

    printf("\nInput three characters, an int, a float, and a double:");
    scanf("%c %c %c %d %f %lf", &c1, &c2, &c3, &i, &x, &y);

    printf("Here is the data you entered:\n");
    printf("%3c %3c %3c %5d %12f %12lf", c1, c2, c3, i, x, y);

    return 0;
}
```

**Key parts:**
- `#include <stdio.h>` — includes standard I/O declarations
- `main()` — entry point; every C program starts here
- `/* ... */` — comment; ignored by compiler
- `{` and `}` — mark start and end of a function body
- `;` — terminates every statement
- `return 0;` — exits `main()` and signals success
$md$, 5),

('a1000001-0001-0001-0001-000000000003','activity','Practice Exercises — Lesson 3',$md$
**Conceptual questions:**
1. What is a header file? What does `stdio.h` provide? What does `conio.h` provide?
2. What is the purpose of `printf()`? Of `scanf()`?
3. What does the `%d` format specifier mean? What about `%c`, `%f`, `%lf`?
4. What do these escape sequences do: `\n`, `\"`, `\'`, `\\`?
5. Describe: `gets()`, `getch()`, `getche()`, `puts()`, `putchar()`.
6. How do you begin and end a block of code in C?

**Predict the output:**
```c
printf("Hello!\n");
printf("The value of %5d is five.", 5);
printf("\n\n Do you know the next number? \n");
printf("\n %5d %6.2f", 6, 6.5);
```

**Programming exercises — write complete C programs:**
1. Calculate and display the volume of a rectangular box (V = length × width × height).
2. Convert hours to minutes (e.g., "3 hours is equal to 180 minutes").
3. Given a, b, c: compute sum, difference, product, quotient, and sum of squares.
4. Calculate cost of candy: 4 types at different prices per kg.
5. Convert Earth weight to Mars (× 0.38) and Jupiter (× 2.64).
$md$, 6);

-- ============================================================
-- LESSON 4: Program Control Structures
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a1000001-0001-0001-0001-000000000004','content','Flow of Control and Operators',$md$
By default, statements execute in sequence. Control structures change this:
- **Selection** (`if`, `if-else`, `switch`) — choose which code to execute based on a condition.
- **Repetition** (`while`, `for`, `do`) — repeat code while a condition holds.

### Relational and Equality Operators
```
<   less than          >   greater than
<=  less than/equal    >=  greater than/equal
==  equal to           !=  not equal to
```

### Logical Operators
```
!   NOT (unary)
&&  AND (binary)
||  OR (binary)
```

In C: **false = 0**, **true = any non-zero value**.

### Operator Associativity
```
+ - ++ -- !       right to left
* / %             left to right
+ -               left to right
< <= > >=         left to right
== !=             left to right
&&                left to right
||                left to right
= += -= *= /=     right to left
```
$md$, 1),

('a1000001-0001-0001-0001-000000000004','content','Conditional Statements',$md$
### The `if` Statement

```c
if (condition)
    statement;
```

If the condition is true (non-zero), the statement executes; otherwise skipped.

### The `if-else` Statement

```c
if (condition)
    statement1;
else
    statement2;
```

**Nested `if-else`:**
```c
if (x == 50) {
    if (y >= 120) {
        sum = x + y;
        printf("Sum: %d", sum);
    } else {
        diff = x - y;
        printf("Difference: %d", diff);
    }
} else {
    printf("Next time");
}
```

### The `switch` Statement

```c
switch (expression) {
    case constant1:
        statement;
        break;
    case constant2:
        statement;
        break;
    default:
        statement;
}
```

- `switch` expression must evaluate to `int` or `char` (not float or string).
- `case` values must be constants.
- `break` exits the switch; without it, execution "falls through" to the next case.
- `default` handles unmatched values.

**Grouping cases (intentional fall-through):**
```c
switch (QUIZ) {
    case 10:
    case 9:  printf("A"); break;   // 9 or 10 → A
    case 8:  printf("B"); break;
    case 7:  printf("C"); break;
    default: printf("F");
}
```
$md$, 2),

('a1000001-0001-0001-0001-000000000004','content','Unconditional Transfer: break and continue',$md$
### `break`

Two uses:
1. Exits a `switch` after a matching case.
2. Immediately exits the innermost loop.

```c
while (1) {
    scanf("%lf", &x);
    if (x < 0.0)
        break;
    printf("%f\n", sqrt(x));
}
```

### `continue`

Skips the rest of the current loop iteration and jumps to the next iteration.

```c
do {
    scanf("%d", &num);
    if (num < 0)
        continue;
    printf("%d", num);
} while (num != 100);
```
$md$, 3),

('a1000001-0001-0001-0001-000000000004','content','Loop Structures',$md$
### `while` Loop

Condition checked **before** each iteration. If false initially, body never runs.

```c
while (condition)
    statement;

// Example:
while (number != 0) {
    scanf("%d", &number);
    sum += number;
}
```

### `for` Loop

```c
for (initialization; condition; increment)
    statement;
```

1. **Initialization** — runs once before the loop.
2. **Condition** — checked before each iteration.
3. **Increment** — runs after each iteration.

```c
for (x = 100; x != 65; x += 5) {
    z = sqrt(x);
    printf("Square root of %d is %f", x, z);
}
```

**Multiple variables (comma operator):**
```c
for (x = 0, y = 0; x + y < 10; x++) { ... }
```

### `do-while` Loop

Body runs **at least once** — condition checked after each iteration.

```c
do {
    statement;
} while (condition);

// Example:
do {
    printf("Enter a number: ");
    scanf("%d", &a);
    sum = sum + a;
} while (a != 0);
printf("The sum is %d", sum);
```
$md$, 4),

('a1000001-0001-0001-0001-000000000004','activity','Practice Exercises — Lesson 4',$md$
**Conceptual questions:**
1. What is the difference between `break` and `continue`?
2. What happens if you omit `break` from a `switch` case?
3. What is a compound statement?
4. When does the body of a `while` loop never execute?
5. How does `do-while` differ from `while`?

**Trace the output:**
```c
// (a)
x = 7; y = 8;
if (x <= y)
    if (x == y) x++;
    else y++;
printf("%d %d\n", x, y);

// (b)
for (i = 1; i <= 5; i++)
    printf("%2d", i);

// (c)
ctr = 0;
do {
    ctr = ctr + 1;
    if ((ctr % 2) != 0) continue;
    else printf("%2d", ctr);
} while (ctr != 10);
```

**Programming exercises:**
1. Determine if a person is a child (0–12), teenager (13–19), or adult (20+) based on age.
2. Pizza shop: 10", 12", 14" pizzas. Compute price per sq inch (area = π × (d/2)²) and identify best value.
3. Input 3 integers and print them in descending order.
4. Print all numbers from N1 to N2 divisible by M, and count how many there are.
5. Rental late fee: ≤2 days → ₱10, ≤4 days → ₱15, ≤5 days → ₱20, ≥7 days → cost of rental (CD=₱50, VHS=₱35).
$md$, 5);

-- ============================================================
-- LESSON 5: Arrays
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a1000001-0001-0001-0001-000000000005','content','What Is an Array?',$md$
An **array** is a fixed-size, sequenced collection of elements all of the same data type, stored in contiguous memory locations and accessed through a single name plus an index.

**Key characteristics:**
- All elements are the same type.
- Elements are indexed starting from **0**.
- The index can be a variable, allowing loops to process every element efficiently.
- The array name refers to the address of the first element in memory.

**Element address formula:**
```
element address = array address + (sizeof(element) × index)
```
$md$, 1),

('a1000001-0001-0001-0001-000000000005','content','Declaring, Defining, and Accessing Arrays',$md$
### Declaration Syntax

```c
data_type array_name[size];

int scores[20];      // 20-element integer array
char name[30];       // 30-element character array
float averages[10];  // 10-element float array
```

### Initializing at Declaration

```c
int first_array[5] = {5, 3, 2, 7, 9};
int second_array[] = {11, 21, 75, 24, 5};  // size inferred
int third_array[15] = {3, 7, 4, 6, 1};     // remaining 10 → 0
```

### Character Arrays (Strings)

A string in C is a character array terminated by `'\0'` (null character). The null terminator is added automatically from string literals.

```c
char college[6] = "CCMIT";
// college[0]='C', college[1]='C', ..., college[5]='\0'
```

### Accessing Elements

```c
scores[0]     // first element
scores[9]     // tenth element (for a 10-element array)
scores[i]     // element at variable index i
```

**Reading into an array:**
```c
for (i = 0; i < 10; i++)
    scanf("%d", &scores[i]);
```

**Printing:**
```c
for (i = 0; i < 10; i++)
    printf("%d\n", scores[i]);
```

**Copying (element by element — arrays cannot be assigned directly):**
```c
for (i = 0; i < 25; i++)
    second[i] = first[i];
```
$md$, 2),

('a1000001-0001-0001-0001-000000000005','content','Array Examples: Sorting and Counting',$md$
### Bubble Sort — Ascending Order

```c
#include <stdio.h>
#include <conio.h>

void main() {
    clrscr();
    int num[3] = {5, 3, 7};
    int h, i, temp;

    for (h = 0; h < 3; h++)
        for (i = 0; i < h; i++)
            if (num[i] > num[i + 1]) {
                temp = num[i];
                num[i] = num[i + 1];
                num[i + 1] = temp;
            }

    for (i = 0; i < 3; i++)
        printf("%d\n", num[i]);
    getch();
}
```
Output: `3`, `5`, `7`

### Count Positive and Negative Values

```c
void main() {
    int a[50], n, count_neg = 0, count_pos = 0, i;
    printf("Enter the size of the array: ");
    scanf("%d", &n);
    for (i = 0; i < n; i++) scanf("%d", &a[i]);

    for (i = 0; i < n; i++) {
        if (a[i] < 0) count_neg++;
        else count_pos++;
    }

    printf("Negative numbers: %d\n", count_neg);
    printf("Positive numbers: %d\n", count_pos);
}
```
$md$, 3),

('a1000001-0001-0001-0001-000000000005','activity','Practice Exercises — Lesson 5',$md$
**Review questions:**
1. Write an array definition for a 12-element integer array `C` with values 1, 4, 7, 10, …, 34.
2. Write a character array `point` initialized with "NORTH" (including null terminator).
3. Write a 4-character array `letters` with values 'N', 'S', 'E', 'W'.

**Trace and predict the output:**
```c
// (a)
int a, b = 0;
static int c[10] = {1,2,3,4,5,6,7,8,9,10};
for (a = 0; a < 10; a++)
    if ((c[a] % 2) == 0) b += c[a];
printf("%d", b);

// (b)
int a, b = 0;
static int c[10] = {1,2,3,4,5,6,7,8,9,10};
for (a = 0; a < 10; a++)
    if ((a % 2) == 0) b += c[a];
printf("%d", b);
```

**Programming exercises:**
1. Input 20 values into array BSIT. Sum elements at even indexes. Print the array and the sum.
2. Write a function `REVERSE` that copies array X into array Y in reverse order.
3. Read two equal-length arrays X and Y (sentinel-terminated). Store products of corresponding elements in Z. Display the square root of the sum of Z.
4. Store 11 numbers in an array. Store the sum of each successive pair in a second array of 10 elements. Print both arrays.
$md$, 4);

-- ============================================================
-- LESSON 6: Functions
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a1000001-0001-0001-0001-000000000006','content','What Is a Function?',$md$
A function is a self-contained section of code that performs a specific task. Functions are the primary tool for breaking large programs into manageable pieces (top-down design).

**Advantages of using functions:**
1. **Cleaner design** — hide implementation details; overall logic is easier to follow.
2. **Reusability** — write once, call anywhere.
3. **Team development** — each function can be developed as an independent unit.
4. **Easier debugging** — functions can be tested individually.
$md$, 1),

('a1000001-0001-0001-0001-000000000006','content','Function Declaration, Definition, and Variables',$md$
### Function Declaration (Prototype)

Tells the compiler the function name, return type, and parameter types before use.

```c
return_type function_name(parameter_type_list);

// Examples:
int ccmit(int bsit, int bscs);
void ccmit();
float ccmit(float x, float y);
```

### Function Definition

```c
return_type function_name(parameter list) {
    local variable declarations;
    statements;
    return value;
}

// Example:
double twice(double x) {
    return 2.0 * x;
}
```

If return type is `void`, the function returns no value.

### Local vs. Global Variables

**Local variables:**
- Declared inside a function body.
- Accessible only within that function.
- Created on call, destroyed on return.
- Must be explicitly initialized (no automatic zero).

**Global variables:**
- Declared outside all functions.
- Accessible from any function.
- Initialized to zero if unspecified.
- Persist for the program's lifetime. Use sparingly — they make functions less self-contained.
$md$, 2),

('a1000001-0001-0001-0001-000000000006','content','Call by Value vs. Call by Reference',$md$
### Call by Value

Arguments are passed as **copies** — changes inside the function do not affect the original.

```c
void funct_sample(int y) {
    y *= 3;
    printf("New value of y: %d", y);  // prints 15
}

main() {
    int n = 5;
    printf("n before call: %d", n);   // 5
    funct_sample(n);
    printf("n after call: %d", n);    // still 5 — unchanged
}
```

### Call by Reference (Pointers)

To allow a function to modify a variable in the caller, pass the **address** using `&`. Inside the function, use `*` to access the value at that address.

- `&variable` — "the address of variable"
- `*pointer` — "the value at the address held by pointer"

```c
void compute_rating(float midterm, float final, float *rating) {
    *rating = (midterm + final) / 2;
}

main() {
    float mid, fin, fin_grd;
    scanf("%f", &mid);
    scanf("%f", &fin);
    compute_rating(mid, fin, &fin_grd);
    printf("Final rating = %f", fin_grd);
}
```

`&fin_grd` passes the address. `*rating = ...` stores a value directly into that memory location, so the change is visible in `main()` after the call.
$md$, 3),

('a1000001-0001-0001-0001-000000000006','activity','Practice Exercises — Lesson 6',$md$
**Conceptual questions:**
1. What is a function and what is its syntax?
2. What does the return type `void` indicate?
3. Explain call by value — what happens to the original variable?
4. What is a pointer? What do `&` and `*` mean?
5. Explain call by reference — how does it differ from call by value?

**Trace the output:**
```c
void trace1(int x, int *y) {
    x = 5; *y = 2;
    printf("%2d %2d\n", x, *y);
}
main() {
    int x, y;
    x = y = 3;
    trace1(x, &y);
    printf("%2d %2d\n", x, y);
}
```

**Programming exercises:**
1. Write a function `factorial` that takes N and returns N! (where 0! = 1). Validate that N is non-negative.
2. Write a function `is_prime` that returns 1 if N is prime, 0 otherwise.
3. Prove the Goldbach conjecture for all even integers between START and FINISH (e.g., 700–1100): show each as the sum of two primes.
4. Write a function `rel_prime` that returns 1 if two integers are relatively prime (no integer > 1 divides both), 0 otherwise.
$md$, 4);

-- ============================================================
-- LESSON 7: String, Character, and Math Functions
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a1000001-0001-0001-0001-000000000007','content','String Functions (<string.h>)',$md$
Include `<string.h>` to use these functions.

### Copy
```c
strcpy(destination, source)    // copy source into destination
strncpy(target, source, n)     // copy at most n characters
```

### Concatenation
```c
strcat(str1, str2)             // append str2 to end of str1
strncat(str1, str2, n)         // append at most n characters
```

### Comparison
```c
strcmp(str1, str2)             // returns: <0 if str1<str2, 0 if equal, >0 if str1>str2
stricmp(str1, str2)            // compare, ignoring case
strncmp(str1, str2, n)         // compare at most n characters
```

### Case
```c
strlwr(str)                    // convert to lowercase
strupr(str)                    // convert to uppercase
```

### Length and Other
```c
strlen(str)                    // return length (not counting '\0')
strrev(str)                    // reverse the string in place
strdup(str)                    // return a duplicate
strchr(str, c)                 // pointer to first occurrence of c
strset(str, ch)                // set all characters to ch
strnset(str, ch, n)            // set first n characters to ch
```
$md$, 1),

('a1000001-0001-0001-0001-000000000007','content','Math Functions (<math.h>) and Character Functions (<ctype.h>)',$md$
### Mathematical Functions — include `<math.h>`

| Function | Syntax | Description |
|---|---|---|
| `abs()` | `int abs(int num)` | Absolute value of integer |
| `fabs()` | `double fabs(double num)` | Absolute value of float |
| `ceil()` | `double ceil(double num)` | Smallest integer ≥ num (round up) |
| `floor()` | `double floor(double num)` | Largest integer ≤ num (round down) |
| `fmod()` | `double fmod(double x, double y)` | Remainder of x/y (float modulus) |
| `pow()` | `double pow(double base, double exp)` | base raised to exp |
| `sqrt()` | `double sqrt(double num)` | Square root (num must be ≥ 0) |

### Character Functions — include `<ctype.h>`

| Function | Tests/Does |
|---|---|
| `isalnum(ch)` | True if letter or digit |
| `isalpha(ch)` | True if letter |
| `isdigit(ch)` | True if digit (0–9) |
| `islower(ch)` | True if lowercase letter |
| `isupper(ch)` | True if uppercase letter |
| `ispunct(ch)` | True if punctuation (not space) |
| `isspace(ch)` | True if whitespace |
| `tolower(ch)` | Returns lowercase version |
| `toupper(ch)` | Returns uppercase version |

### Conversion Functions — include `<stdlib.h>`

| Function | Description |
|---|---|
| `atof(str)` | Convert string to double |
| `atoi(str)` | Convert string to int |
| `atol(str)` | Convert string to long int |
| `itoa(num, str, radix)` | Convert int to string in given base |
$md$, 2),

('a1000001-0001-0001-0001-000000000007','activity','Practice Exercises — Lesson 7',$md$
**Given: `char third[20] = "God Loves U"`, `char fourth[20] = "GOD BLESS U"` — evaluate:**
```
a. strrev(fourth)
b. strupr(third)
c. strncat(fourth, third, 5)
d. strlwr(fourth)
e. strncpy(first, fourth, 5)
f. strlen(third)
g. strncat(third, fourth, 4)
```

**TRUE or FALSE (given: `char c='C', m='?', i='t', b='5'`):**
```
a. isdigit(b)      b. isalpha(c)
c. isspace(m)      d. isupper(c)
e. isalnum(b)      f. ispunct(m)
g. islower(i)
```

**Evaluate the math expressions:**
```
a. abs(5)
b. floor(5.5)
c. ceil(5)
d. sqrt(floor(25.12))
e. fabs(-44.98)
f. ceil(pow(5, 3))
```

**Programming exercises:**
1. Write a function that returns 1 if a string is a palindrome, 0 otherwise.
2. Read lines of text; count total words and how many have 1, 2, 3, … letters.
3. Find the longest common prefix of two words (e.g., "global" and "glossary" → "glo").
4. Read text and replace all four-letter words with asterisks.
5. Pluralize nouns: ends in "y" → remove y, add "ies"; ends in "s/ch/sh" → add "es"; otherwise → add "s".
$md$, 3);
