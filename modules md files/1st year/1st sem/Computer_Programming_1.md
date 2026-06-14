# Computer Programming 1 — Complete Study Guide
<!-- subject: Computer Programming 1 | year: 1st -->

---

# Lesson 1: Programming Concepts

<!-- kind: content -->
## What Is a Computer?

A computer is an electronic device that accepts data from the user, processes it, produces results, and stores those results for future use. Data is raw, unorganized facts; information is data that has been processed into something meaningful.

### Hardware and Software

**Hardware** refers to the physical, mechanical parts of a computer — the devices you can touch. This includes the CPU, keyboard, mouse, hard drive, and other components. At the core, hardware consists of the CPU and its peripheral devices.

**Software** is the set of instructions that drives the computer to perform tasks. Software is written in a programming language, translated into machine language (binary), and then executed by the hardware. Software falls into two categories:
- **System software** — operates directly on the hardware and provides the platform for applications to run (e.g., Windows, Linux, Unix).
- **Application software** — designed to help users perform specific tasks (e.g., word processors, spreadsheets, database tools).

### Programs and Programming

A **program** is the ordered set of instructions a computer follows to process data into information. Writing that set of instructions is called **programming**. Programming is fundamentally problem-solving: you define the problem clearly, then develop the detailed step-by-step logic to solve it.

**The five-step programming process:**
1. **Define the problem** — understand what needs to be solved. Specify objectives, identify users, define inputs and outputs, and assess feasibility.
2. **Design the solution** — plan the logic using tools like hierarchy charts, flowcharts, or pseudocode. A structural walkthrough (review with other developers) helps catch issues early.
3. **Code the program** — translate the design into a specific programming language, following its syntax and rules.
4. **Test the program** — check the program manually (desk checking), debug it (find and remove errors), and run it with real data to confirm it works correctly.
5. **Document the program** — write user documentation (how to use it), operator documentation (how to manage errors), and programmer documentation (how the code works internally, for future maintenance).

**Types of errors:**
- **Syntax errors** — incorrect formatting or usage of language statements, caught during compilation.
- **Logic errors** — the code runs but produces wrong results due to incorrect program flow or faulty reasoning.

---

<!-- kind: content -->
## Program Logic Formulation

Before writing code, you need to plan the logic. Two common tools for this are **flowcharts** and **pseudocode (algorithms)**.

### Flowcharts

A flowchart is a visual representation of a solution, using standardized shapes connected by arrows to show the flow of execution.

**Common flowchart symbols:**

| Symbol | Name | Purpose |
|---|---|---|
| Oval | Terminal | Marks the start or stop of the program |
| Parallelogram | Input/Output | Represents input from the user or output of results |
| Rectangle | Process | Represents a computation or data manipulation step |
| Diamond | Decision | Represents a condition — two paths: TRUE or FALSE |
| Arrow | Flow Line | Shows direction of execution |
| Circle | Connector | Connects parts of the flowchart across pages |
| Hexagon (special) | Loop Limit | Marks the start and end of a loop |

**Two types of flowcharts:**
- **System flowchart** — shows an entire system at a high level (data flow between processes, storage, reports).
- **Program flowchart** — shows the detailed logic of a specific program. This is the type used in programming.

**Three fundamental control structures used in flowcharts (and code):**

**1. Sequential** — steps execute one after another in order, each exactly once. This is the simplest structure.

Example flowchart for computing the product of three numbers:
```
START → Initialize A=0, B=0, C=0, P=0 → INPUT A, B, C → P = A * B * C → OUTPUT P → STOP
```

**2. Selection** — a decision point where one of two or more paths is taken based on a condition. Uses the diamond (decision) symbol.

Example (determine if a number is positive, negative, or zero):
```
START → INPUT A
  IF A < 0 → OUTPUT "NEGATIVE"
  ELSE IF A == 0 → OUTPUT "INVALID"
  ELSE → OUTPUT "POSITIVE"
STOP
```

**3. Repetition** — one or more steps are performed repeatedly until a condition is met.

Example (print all odd numbers from 1 to 10):
```
START → N=0, ODD=0
  LOOP while N < 10:
    N = N + 1
    ODD = N % 2
    IF ODD == 1: OUTPUT N
STOP
```

These three structures — sequence, selection, and repetition — are sufficient to construct any program logic.

---

<!-- kind: content -->
## Algorithms (Pseudocode)

An **algorithm** is a step-by-step description of a solution written in a structured, English-like language rather than a formal programming language. Also called **pseudocode**, it uses a mixture of natural language and programming-style notation.

**Common pseudocode conventions:**
- Arithmetic: `+`, `-`, `*`, `/`
- Assignment: `→` (arrow pointing to the variable storing the result)
- Input: `INPUT` or `READ`
- Output: `OUTPUT`, `PRINT`, or `DISPLAY`
- Indentation shows grouping of related steps

**The same three control structures apply in pseudocode:**

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

---

<!-- kind: activity -->
## Practice Exercises — Lesson 1

**Review questions (write answers in your own words):**
1. Differentiate hardware and software.
2. Differentiate program and programming.
3. What are the components of hardware?
4. What are the five steps of programming?
5. What is the difference between a syntax error and a logic error?

**Algorithm exercises — write a flowchart AND pseudocode for each:**

1. The volume of a rectangular box is V = length × width × height. Design an algorithm that takes the three dimensions from the user and displays the volume.

2. Design an algorithm that converts hours to minutes. A typical output should read: "3 hours is equal to 180 minutes."

3. Given three numbers a, b, and c, design an algorithm that computes and displays their sum, difference, product, quotient (a/b/c), and sum of their squares.

4. A store sells four types of candy: Type A at ₱35/kg, Type B at ₱45/kg, Type C at ₱56/kg, and Type D at ₱57.50/kg. Design an algorithm that takes the weight of each type purchased and calculates the total cost.

5. On Mars, a person who weighs 100 pounds on Earth weighs 38 pounds. On Jupiter, the same person weighs 264 pounds. Design an algorithm that takes a person's Earth weight and displays their weight on Mars and Jupiter.

---

---

# Lesson 2: Introduction to C

<!-- kind: content -->
## What Is C?

C is a general-purpose, structured programming language known for its efficiency and close-to-hardware control. It uses economy of expression, modern control structures, and a rich set of operations. C is often called a "systems programming language" because it is well-suited for writing operating systems, compilers, and other low-level software. At the same time, it is classified as high-level because it allows programmers to focus on the problem logic rather than machine details.

### Brief History

- **BCPL** — developed by Martin Richards in 1967; influenced the development of B.
- **B** — created by Ken Thompson in 1970 for early UNIX systems on the DEC PDP-7; typeless (no data types).
- **C** — designed by Dennis Ritchie in 1972 at AT&T Bell Laboratories; expanded B by adding data types.
- **Turbo C** — a version of C developed by Borland International Corporation in 1987 for MS-DOS systems.

### Key Definitions

- **Interpreter** — reads and executes source code one line at a time.
- **Compiler** — reads the entire program and converts it to object code (machine-executable binary).
- **Compile time** — when compilation happens; syntax errors are caught here.
- **Object code** — the machine-language translation of source code; also called binary code or machine code.
- **Source code** — the human-readable text of a program.
- **Run time** — when the compiled program is actually executing; run-time (semantic) errors appear here.
- **Library** — a collection of pre-written functions available for use in programs.

---

<!-- kind: content -->
## The Compilation Process

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

---

<!-- kind: content -->
## Components of the C Environment

A full C development environment typically includes:
1. **Editor** — creates and edits the source code.
2. **C Language** — the actual language standard (ANSI C or extended versions).
3. **Compiler** — translates source to machine code.
4. **Debugger** — helps locate and fix programming errors.
5. **Run-time environment** — the capability to run programs within the development system.
6. **User interface** — integrates all components so you can move smoothly from editing to compiling to debugging to running.

---

<!-- kind: content -->
## Identifiers

An identifier is a name used to reference a variable, function, or other user-defined element. Rules for naming identifiers in C:

1. The first character must be a letter or underscore (`_`).
2. Subsequent characters can be letters, digits, or underscores.
3. Spaces and hyphens are not allowed.
4. The first 63 characters are significant.
5. C is case-sensitive: `Sname`, `SNAME`, and `sname` are three different identifiers.
6. An identifier cannot be the same as a C keyword (e.g., `int`, `float`, `if`, `while`).

---

<!-- kind: content -->
## Data Types

C provides several fundamental (scalar) data types:

| Type | Size | Range | Use |
|---|---|---|---|
| `short int` | 2 bytes | −32,768 to +32,767 | Small integers |
| `int` | 4 bytes | −2,147,483,648 to +2,147,483,647 | General integers |
| `long int` | 4 bytes | Same as int | Large integers |
| `unsigned int` | 2–4 bytes | 0 to 65,535 (or larger) | Non-negative integers |
| `float` | 4 bytes | ≈ 3.4E−38 to 3.4E+38 | Decimal numbers |
| `double` | 8 bytes | ≈ 1.7E−308 to 1.7E+308 | Higher-precision decimals |
| `char` | 1 byte | −128 to +127 | Single characters |
| `void` | — | — | No value (used for functions returning nothing) |

---

<!-- kind: content -->
## Variables and Constants

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
Variables are not automatically set to zero — they contain garbage values until explicitly assigned. Three ways to initialize:

**1. Assignment statement:**
```c
x = -1;
ch1 = 'A';
```

**2. Using `scanf`:**
```c
scanf("%d", &x);
scanf("%lf", &y);
```

**3. At declaration:**
```c
int x = 3;
char y = 'x';
double a, b = 100.00;
```

### Global and Local Variables
- **Global variables** — declared outside all functions; accessible throughout the entire program; initialized to zero if no value is specified.
- **Local variables** — declared inside a function; accessible only within that function; must be explicitly initialized.

### Constants
Constants are fixed values that cannot be changed during execution.

| Type | Example |
|---|---|
| Character constant | `'a'`, `'P'` |
| Integer constant | `10`, `-100`, `25` |
| Floating-point constant | `11.123`, `1.25` |
| String constant | `"hello"`, `"BSIT"` |
| Declared constant (`#define`) | `#define PI 3.14159` |
| Const modifier | `const float version = 3.20;` |

**Using `#define`:**
```c
#define LIMIT 100
#define PI 3.14159
#define LETTER 'M'
```

**Using `const`:**
```c
const float version = 3.20;
```
Both declare constants, but have different syntax. With `#define`, the type is inferred from the value. With `const`, the type is explicitly declared.

---

<!-- kind: content -->
## Operators

### Arithmetic Operators

| Operator | Operation |
|---|---|
| `*` | Multiplication |
| `/` | Division |
| `+` | Addition |
| `-` | Subtraction |
| `%` | Modulus (remainder) — integer types only |
| `++` | Increment (add 1) |
| `--` | Decrement (subtract 1) |

**Important notes:**
- Integer division truncates the result: `11/2 = 5`, `10/3 = 3`
- Modulus gives the remainder: `11 % 2 = 1`, `147 % 20 = 7`

**Increment/Decrement — prefix vs. postfix:**
```c
x = 10;
y = ++x;   // x becomes 11 first, then y = 11
x = 10;
y = x++;   // y = 10 first, then x becomes 11
```

**Combined (shorthand) operators:**
```c
x = x + y;  →  x += y;
x = x - y;  →  x -= y;
x = x * y;  →  x *= y;
x = x / y;  →  x /= y;
x = x % y;  →  x %= y;
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

In C, **true is any non-zero value** and **false is 0**.

Example:
```c
N = 10 > 5 && !(10 < 9) || 3 <= 4
  = 1   && !(0)         || 1
  = 1   &&  1           || 1
  = 1
```

### Ternary Operator

```c
expression1 ? expression2 : expression3;
```
If `expression1` is true (non-zero), the result is `expression2`; otherwise it is `expression3`.

```c
x = 10; y = 5;
x > y ? sum = x + y : diff = x - y;
// Since x > y is true, sum = 15
```

### Operator Precedence (highest to lowest)

```
! ++ --               (unary)
* / %
+ -
< <= > >=
== !=
&&
||
? :
= += -= *= /=
```

---

<!-- kind: activity -->
## Practice Exercises — Lesson 2

**Review questions:**
1. Show the C declaration statement that associates each of these identifiers with its value:
   - `counter` → 7, `length` → 12, `offset` → 12.3723, `sname` → "Sonnet", `group` → 'A'

2. Are these identifiers valid or invalid?
   - `JETT`, `gRAde_`, `float`, `qty_sold`, `_ _`, `integer`, `x_tra`, `1311Nov`, `Rating`, `@_First!`

3. What data type should be used for: `'A'`, `32769`, `32.55`, `21482.93`, `-123`, `632179`

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

---

---

# Lesson 3: Input/Output Statements and Program Structure

<!-- kind: content -->
## The C Preprocessor

Lines that start with `#` in a C file are preprocessor directives — handled before compilation begins.

### `#define`
Replaces a symbolic name with a value throughout the file wherever that name appears. By convention, symbolic constants are written in uppercase.

```c
#define LIMIT 100
#define PI 3.14159
```

This makes programs more readable and easier to update — change the `#define` in one place and it takes effect everywhere.

### `#include`
Causes the contents of another file (a header file) to be inserted at that point during compilation. Header file names end in `.h`.

```c
#include <stdio.h>   // standard input/output functions (printf, scanf)
#include <conio.h>   // console input/output functions (getch, clrscr)
```

---

<!-- kind: content -->
## Standard Output: `printf()`

`printf()` sends formatted text to the screen. The "f" stands for "formatted."

**Syntax:**
```c
printf("format string", variable1, variable2, ...);
```

**Conversion specifications** control how variables are displayed:

| Specifier | Meaning |
|---|---|
| `%c` | Character |
| `%d` | Decimal integer |
| `%f` | Floating point (float) |
| `%lf` | Double |
| `%e` | Scientific notation |
| `%s` | String |

**Field width** can be specified between `%` and the conversion character:
```c
printf("%c %3c %5c\n", 'A', 'B', 'C');
// Output: A  _B _ _ _ _C   (B printed right-justified in 3 chars, C in 5)
```

---

<!-- kind: content -->
## Standard Input: `scanf()`

`scanf()` reads formatted input from the keyboard. The `&` operator (address-of) is required before each variable so `scanf()` knows where to store the value.

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
scanf("%s", name);       // read a string (no & needed for arrays)
```

`scanf()` returns the number of successful conversions. When reading characters, whitespace (spaces, tabs, newlines) is **not** skipped automatically, unlike when reading numbers.

---

<!-- kind: content -->
## Escape Sequences

Special characters embedded in strings using a backslash:

| Sequence | Meaning |
|---|---|
| `\n` | Newline |
| `\t` | Tab |
| `\\` | Backslash |
| `\"` | Double quote |
| `\'` | Single quote |
| `\a` | Bell (sound) |
| `\xhh` | Character with hex code hh |

---

<!-- kind: content -->
## Console I/O (`conio.h`)

Functions for direct console (screen/keyboard) interaction:

| Function | Behavior |
|---|---|
| `gets(str)` | Reads a string from keyboard until Enter; stores without the newline |
| `getchar()` | Reads one character; waits for Enter |
| `getch()` | Reads one character without echo; does NOT wait for Enter |
| `getche()` | Reads one character with echo; does NOT wait for Enter |
| `puts(str)` | Writes a string to screen followed by a newline |
| `putchar(ch)` | Writes a single character to screen |
| `clrscr()` | Clears the screen |

---

<!-- kind: content -->
## General C Program Structure

```c
global declarations;

function1() {
    local variables;
    statements;
}

function2() {
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

/* Sample program demonstrating I/O */
main() {
    char c1, c2, c3;    // declare character variables
    int i;              // declare integer variable
    float x;            // declare float variable
    double y;           // declare double variable

    printf("\nInput three characters, an int, a float, and a double:");
    scanf("%c %c %c %d %f %lf", &c1, &c2, &c3, &i, &x, &y);

    printf("Here is the data you entered:\n");
    printf("%3c %3c %3c %5d %12f %12lf", c1, c2, c3, i, x, y);

    return 0;
}
```

**Key parts explained:**
- `#include <stdio.h>` — tells the compiler to include standard I/O declarations
- `main()` — the entry point; every C program starts here
- `/* ... */` — a comment; ignored by the compiler, useful for documentation
- `{` and `}` — mark the start and end of a function body
- `;` — terminates every statement
- `return 0;` — exits `main()` and returns a value to the calling environment

---

<!-- kind: activity -->
## Practice Exercises — Lesson 3

**Conceptual questions:**
1. What is a header file? What does `stdio.h` provide? What does `conio.h` provide?
2. What is the purpose of `printf()`? Of `scanf()`?
3. What does the `%d` format specifier mean? What about `%c`, `%f`, `%lf`?
4. What do these escape sequences do: `\n`, `\"`, `\'`, `\\`?
5. Describe the console functions: `gets()`, `getch()`, `getche()`, `puts()`, `putchar()`.
6. How do you begin and end a block of code in C?

**Predict the output:**
```c
printf("Hello!\n");
printf("The value of %5d is five.", 5);
printf("\n\n Do you know the next number? \n");
printf("\n %5d %6.2f", 6, 6.5);
```

**Programming exercises — write complete C programs for each:**
1. Calculate and display the volume of a rectangular box (V = length × width × height).
2. Convert hours to minutes (e.g., "3 hours is equal to 180 minutes").
3. Given a, b, c: compute and display sum, difference, product, quotient, and sum of squares.
4. Calculate the cost of a candy bag with four candy types at different prices per kg.
5. Convert Earth weight to Mars weight (multiply by 0.38) and Jupiter weight (multiply by 2.64).

---

---

# Lesson 4: Program Control Structures

<!-- kind: content -->
## Flow of Control

By default, statements in a program execute in sequence, one after another. Control structures change this:
- **Selection** (`if`, `if-else`, `switch`) — choose which code to execute based on a condition.
- **Repetition** (`while`, `for`, `do`) — repeat code as long as a condition holds.

---

<!-- kind: content -->
## Operators Revisited

### Relational Operators
```
<   less than
>   greater than
<=  less than or equal to
>=  greater than or equal to
```

### Equality Operators
```
==  equal to
!=  not equal to
```

### Logical Operators
```
!   NOT (unary)
&&  AND (binary)
||  OR (binary)
```

In C: **false = 0**, **true = any non-zero value**.

### Operator Associativity (control-relevant)
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

---

<!-- kind: content -->
## Compound Statements

A compound statement is a group of statements enclosed in braces `{ }`, treated as a single unit. Wherever a single statement is syntactically valid, a compound statement can be used instead.

```c
if (a < b) {
    ave = a;
    printf("a is smaller than b\n");
}
```

---

<!-- kind: content -->
## Conditional Statements

### The `if` Statement

```c
if (condition)
    statement;
```

If the condition is true (non-zero), the statement executes; otherwise it is skipped.

```c
if (grade >= 90)
    printf("Congratulations!");
printf("Your grade is %d\n", grade);
```

### The `if-else` Statement

```c
if (condition)
    statement1;
else
    statement2;
```

Executes `statement1` if the condition is true, `statement2` if it is false.

```c
if (a > b) {
    b++;
    printf("Value is smaller: %d\n", b);
} else {
    printf("You got a bigger value: %d\n", a);
}
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

A multi-way conditional that tests an expression against a list of constant values.

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

- The `switch` expression must evaluate to an `int`, `char`, or similar discrete type (not a float or string).
- `case` values must be constants, not variables or expressions.
- `break` exits the switch after a case executes. Without it, execution "falls through" to the next case.
- `default` handles any value not matched by the listed cases.

**Example — print month name from a number:**
```c
switch (number) {
    case 1:  printf("January\n");   break;
    case 2:  printf("February\n");  break;
    case 3:  printf("March\n");     break;
    /* ... cases 4–10 ... */
    case 11: printf("November\n");  break;
    case 12: printf("December\n");  break;
    default: printf("Invalid entry!");
}
```

**Grouping cases (fall-through intentional):**
```c
switch (QUIZ) {
    case 10:
    case 9:  printf("A"); break;   // score 9 or 10 both get "A"
    case 8:  printf("B"); break;
    case 7:  printf("C"); break;
    case 6:  printf("D"); break;
    default: printf("F");
}
```

---

<!-- kind: content -->
## Unconditional Transfer Statements

### `break`
Two uses:
1. Exits a `switch` statement after a matching case runs.
2. Immediately exits the innermost loop — execution continues at the statement after the loop.

```c
while (1) {
    scanf("%lf", &x);
    if (x < 0.0)
        break;
    printf("%f\n", sqrt(x));
}
```

### `continue`
Skips the rest of the current loop iteration and jumps to the next iteration. Can only be used inside `for`, `while`, and `do-while` loops.

```c
do {
    scanf("%d", &num);
    if (num < 0)
        continue;
    printf("%d", num);
} while (num != 100);
```

---

<!-- kind: content -->
## Loop Structures

### `while` Loop

```c
while (condition)
    statement;
```

The condition is checked **before** each iteration. If the condition is false initially, the body never runs.

```c
while (number != 0) {
    scanf("%d", &number);
    sum += number;
}
printf("Sum: %d", sum);
```

### `for` Loop

```c
for (initialization; condition; increment)
    statement;
```

Three parts:
1. **Initialization** — runs once before the loop starts; sets the loop control variable.
2. **Condition** — checked before each iteration; loop runs as long as it is true.
3. **Increment** — runs after each iteration; updates the control variable.

```c
for (x = 100; x != 65; x += 5) {
    z = sqrt(x);
    printf("Square root of %d is %f", x, z);
}
```

The condition is always tested at the **top** of the loop. If false from the start, the loop body never runs.

**Multiple loop variables (using comma operator):**
```c
for (x = 0, y = 0; x + y < 10; x++) {
    scanf("%d", &y);
    sum = x + y;
}
```

**Nested `for` loops:**
```c
for (i = 0; i < rows; i++) {
    for (j = 0; j < cols; j++) {
        /* inner loop body */
    }
}
```

### `do-while` Loop

```c
do {
    statement;
} while (condition);
```

The body runs **at least once** — the condition is checked after each iteration.

```c
do {
    scanf("%d", &num);
    sum += num;
} while (num > 100);
printf("Sum: %d", sum);
```

**Full example — sum integers until 0 is entered:**
```c
#include <stdio.h>
#include <conio.h>

void main() {
    int a, sum;
    clrscr();
    printf("Enter integers (enter 0 to stop):\n");
    sum = 0;
    do {
        printf("Enter a number: ");
        scanf("%d", &a);
        sum = sum + a;
    } while (a != 0);
    printf("\nThe sum is %d", sum);
    getch();
}
```
Sample run:
```
Enter a number: 7
Enter a number: 3
Enter a number: 9
Enter a number: 0
The sum is 19
```

---

<!-- kind: activity -->
## Practice Exercises — Lesson 4

**Conceptual questions:**
1. What is the difference between `break` and `continue`?
2. What happens if you omit `break` from a `switch` case?
3. What is a compound statement?
4. When does the body of a `while` loop never execute?
5. How does `do-while` differ from `while`?

**Trace the output of these program segments:**
```c
// (a)
x = 7; y = 8;
if (x <= y)
    if (x == y)
        x++;
    else
        y++;
printf("%d %d\n", x, y);

// (b)
for (i = 1; i <= 5; i++)
    printf("%2d", i);

// (c)
ctr = 0;
do {
    ctr = ctr + 1;
    if ((ctr % 2) != 0)
        continue;
    else
        printf("%2d", ctr);
} while (ctr != 10);
```

**Programming exercises:**
1. Determine whether a person is a child (0–12), teenager (13–19), or adult (20+) based on age input.
2. A pizza shop offers 10", 12", and 14" pizzas. Given a diameter and price, compute the price per square inch (area = π × (d/2)²) and identify the best value.
3. Input 3 integers and print them in descending order.
4. Print all numbers from N1 to N2 that are divisible by M, and count how many there are.
5. Given the number of days a rental is late, calculate the fine: ≤2 days → ₱10, ≤4 days → ₱15, ≤5 days → ₱20, ≥7 days → cost of the rental (CD = ₱50, VHS = ₱35).

---

---

# Lesson 5: Arrays

<!-- kind: content -->
## What Is an Array?

Imagine storing 20 integers in 20 separate named variables — you would need 20 different `scanf` calls to read them and 20 more `printf` calls to display them. For 200 or 2000 values, that becomes completely impractical.

An **array** solves this problem. An array is a fixed-size, sequenced collection of elements all of the same data type, stored in contiguous memory locations and accessed through a single name plus an index.

**Key characteristics:**
- All elements are the same type.
- Elements are indexed starting from **0**.
- The index can be a variable, allowing loops to process every element efficiently.
- The array name refers to the address of the first element in memory.

**Element address formula:**
```
element address = array address + (sizeof(element) × index)
```

---

<!-- kind: content -->
## Declaring and Defining Arrays

**Syntax:**
```c
data_type array_name[size];
```

Examples:
```c
int scores[20];      // 20-element integer array
char name[30];       // 30-element character array
float averages[10];  // 10-element float array
double values[12];   // 12-element double array
```

### Initializing Arrays at Declaration

```c
int first_array[5] = {5, 3, 2, 7, 9};
int second_array[] = {11, 21, 75, 24, 5};  // size inferred automatically
int third_array[15] = {3, 7, 4, 6, 1};     // remaining 10 elements → 0
```

If fewer initializers are provided than elements, the remaining elements are set to zero. You can use this to zero-initialize an array:
```c
int zeroed[100] = {0};
```

### Character Arrays and Strings

A string in C is a character array terminated by the null character `'\0'`. When you assign a string literal, the null terminator is added automatically.

```c
char college[6] = "CCMIT";
// Stores: college[0]='C', college[1]='C', college[2]='M',
//         college[3]='I', college[4]='T', college[5]='\0'

char college[] = "CCMIT";  // size determined automatically
```

---

<!-- kind: content -->
## Accessing and Using Array Elements

Access individual elements using an index in square brackets:

```c
scores[0]     // first element
scores[9]     // tenth element (for a 10-element array)
scores[i]     // element at index i (using a variable)
```

**Reading values into an array:**
```c
int scores[10];
for (i = 0; i < 10; i++)
    scanf("%d", &scores[i]);
```

**Printing array values:**
```c
for (i = 0; i < 10; i++)
    printf("%d\n", scores[i]);
```

**Assigning to individual elements:**
```c
scores[4] = 23;
```

**Copying one array to another** (element by element — you cannot assign arrays directly):
```c
for (i = 0; i < 25; i++)
    second[i] = first[i];
```

**Assigning a pattern:**
```c
for (i = 0; i < 25; i++)
    scores[i] = i * 2;    // each element = twice its index
```

---

<!-- kind: content -->
## Sorting Example

**Bubble sort — sorts an array in ascending order:**
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
Output:
```
3
5
7
```

---

<!-- kind: content -->
## Counting Example

**Count positive and negative values in an array:**
```c
#include <stdio.h>
#include <conio.h>

void main() {
    int a[50], n, count_neg = 0, count_pos = 0, i;
    clrscr();
    printf("Enter the size of the array: ");
    scanf("%d", &n);
    printf("Enter the elements: ");
    for (i = 0; i < n; i++)
        scanf("%d", &a[i]);

    for (i = 0; i < n; i++) {
        if (a[i] < 0)
            count_neg++;
        else
            count_pos++;
    }

    printf("Negative numbers: %d\n", count_neg);
    printf("Positive numbers: %d\n", count_pos);
    getch();
}
```

---

<!-- kind: activity -->
## Practice Exercises — Lesson 5

**Review questions:**
1. Write an array definition for a 12-element integer array called `C` with values 1, 4, 7, 10, …, 34.
2. Write a character array called `point` initialized with "NORTH" (including the null terminator).
3. Write a 4-character array called `letters` with values 'N', 'S', 'E', 'W'.

**Trace and predict the output:**
```c
// (a)
int a, b = 0;
static int c[10] = {1,2,3,4,5,6,7,8,9,10};
for (a = 0; a < 10; a++)
    if ((c[a] % 2) == 0)
        b += c[a];
printf("%d", b);

// (b)
int a, b = 0;
static int c[10] = {1,2,3,4,5,6,7,8,9,10};
for (a = 0; a < 10; a++)
    if ((a % 2) == 0)
        b += c[a];
printf("%d", b);
```

**Programming exercises:**
1. Input 20 values into array BSIT. Sum all elements at even indexes and print both the array and the sum.
2. Write a function `REVERSE` that copies array X into array Y in reverse order.
3. Read two equal-length arrays X and Y (sentinel-terminated). Store the products of corresponding elements in array Z. Display the square root of the sum of Z's elements.
4. Store 11 numbers in an array. Store the sum of each successive pair (element 0+1, element 1+2, etc.) in a second array of 10 elements. Print both arrays.

---

---

# Lesson 6: Functions

<!-- kind: content -->
## What Is a Function?

A function is a self-contained section of code that performs a specific task. Functions are the primary tool for breaking large programs into manageable pieces (top-down design). When the program encounters a function call, control passes to that function; when the function finishes, control returns to where it was called.

**Advantages of using functions:**
1. **Cleaner design** — functions hide implementation details and make the overall program logic easier to follow.
2. **Reusability** — a function written once can be called anywhere in the program or in other programs.
3. **Team development** — each function can be defined as an independent unit with clear inputs and outputs, allowing multiple developers to work in parallel.
4. **Easier debugging** — functions can be tested individually, isolating errors to specific pieces of functionality.

---

<!-- kind: content -->
## Function Declaration (Prototype)

A function prototype tells the compiler the function's name, return type, and parameter types before the function is used. This allows the compiler to check calls to the function for correctness.

**Syntax:**
```c
return_type function_name(parameter_type_list);
```

Examples:
```c
int ccmit(int bsit, int bscs);
void ccmit();
float ccmit(float x, float y);
double sqrt(double);
```

---

<!-- kind: content -->
## Function Definition

The function definition contains the actual code that runs when the function is called.

**Structure:**
```c
return_type function_name(parameter list) {
    local variable declarations;
    statements;
    return value;   // optional, depending on return type
}
```

Example:
```c
double twice(double x) {
    return 2.0 * x;
}

int all_add(int a, int b) {
    int c = 0;
    return a + b + c;
}
```

**Notes:**
- If the return type is `void`, the function returns no value.
- A function can have zero or more `return` statements.
- If there is no `return` statement, the function returns when it reaches the closing brace (`}`).

---

<!-- kind: content -->
## Local and Global Variables

**Local variables** are declared inside a function body. They:
- Are accessible only within the function where they are declared.
- Are created when the function is called and destroyed when it returns.
- Must be explicitly initialized (they do not start at zero automatically).
- Are also called automatic variables.

**Global variables** are declared outside all functions. They:
- Are accessible from any function in the program.
- Are initialized to zero if no value is specified.
- Persist for the entire lifetime of the program.
- Should be used sparingly: they consume memory continuously, make functions less self-contained, and can cause hard-to-trace side effects.

```c
int a = 33;   // global

main() {
    int b = 77;   // local to main
    printf("a = %d\n", a);   // can access global
    printf("b = %d\n", b);
}
```

---

<!-- kind: content -->
## The `return` Statement

```c
return;               // exits the function, returns no value
return (expression);  // exits and returns the value of expression
```

The returned value is automatically converted to the function's declared return type if necessary.

```c
float f(char a, char b, char c) {
    int i;
    /* ... */
    return i;   // i is converted to float before returning
}
```

---

<!-- kind: content -->
## Call by Value

When a function is called in C, arguments are passed **by value** — the function receives a copy of each argument, not the original variable. Changes made to the copy inside the function do not affect the original.

```c
void funct_sample(int y) {
    y *= 3;
    printf("New value of y: %d", y);  // prints 15
}

main() {
    int n = 5;
    printf("n before call: %d", n);   // prints 5
    funct_sample(n);
    printf("n after call: %d", n);    // still 5 — unchanged
}
```

---

<!-- kind: content -->
## Call by Reference (Pointers)

To allow a function to modify a variable in the calling environment, pass the **address** of the variable using the address-of operator `&`. Inside the function, a pointer (indicated by `*`) is used to access the value at that address.

- `&variable` — "the address of variable"
- `*pointer` — "the value at the address held by pointer"

```c
void compute_rating(float midterm, float final, float *rating) {
    *rating = (midterm + final) / 2;
}

main() {
    char name[25];
    float mid, fin, fin_grd;
    puts("Enter your name: ");
    gets(name);
    printf("Enter midterm grade: ");
    scanf("%f", &mid);
    printf("Enter final grade: ");
    scanf("%f", &fin);
    compute_rating(mid, fin, &fin_grd);
    printf("%s: final rating = %f", name, fin_grd);
    return 0;
}
```

Here, `&fin_grd` passes the address of `fin_grd` to the function. Inside the function, `*rating = ...` stores a value directly into that memory location, so the change is visible in `main()` after the function returns.

---

<!-- kind: activity -->
## Practice Exercises — Lesson 6

**Conceptual questions:**
1. What is a function and what is its syntax?
2. What does the return type `void` indicate?
3. Explain call by value — what happens to the original variable?
4. What is a pointer? What do `&` and `*` mean?
5. Explain call by reference — how does it differ from call by value?

**Trace the output of each program:**
```c
// (a)
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
2. Write a function `is_prime` that returns 1 if N is prime, 0 otherwise. Hint: N is divisible by k if `N % k == 0`.
3. Write a program that proves the Goldbach conjecture for all even integers between two defined constants START and FINISH (e.g., 700–1100): show each even number as the sum of two primes.
4. Write a function `rel_prime` that returns 1 if two integers i and j are relatively prime (no integer > 1 divides both), 0 otherwise.

---

---

# Lesson 7: String, Character, and Math Functions

<!-- kind: content -->
## String Functions (`<string.h>`)

C's standard library provides ready-made functions for common string operations. Include `<string.h>` to use them.

### Copy Functions
```c
strcpy(destination, source)    // copy source into destination
strncpy(target, source, n)     // copy at most n characters
```

### Concatenation Functions
```c
strcat(str1, str2)             // append str2 to the end of str1
strncat(str1, str2, n)         // append at most n characters of str2 to str1
```

### Comparison Functions
```c
strcmp(str1, str2)             // compare str1 and str2
                               // returns: < 0 if str1 < str2
                               //          0 if equal
                               //          > 0 if str1 > str2
stricmp(str1, str2)            // compare, ignoring case
strncmp(str1, str2, n)         // compare at most n characters
```

### Case Functions
```c
strlwr(str)                    // convert string to lowercase
strupr(str)                    // convert string to uppercase
```

### Length and Other Functions
```c
strlen(str)                    // return the length (not counting '\0')
strrev(str)                    // reverse the string in place
strdup(str)                    // return a duplicate of the string
strchr(str, c)                 // return pointer to first occurrence of c in str
```

### Set Functions
```c
strset(str, ch)                // set all characters to ch
strnset(str, ch, n)            // set first n characters to ch
```

---

<!-- kind: content -->
## Mathematical Functions (`<math.h>`)

Include `<math.h>` to use these:

| Function | Syntax | Description |
|---|---|---|
| `abs()` | `int abs(int num)` | Absolute value of an integer |
| `fabs()` | `double fabs(double num)` | Absolute value of a float |
| `ceil()` | `double ceil(double num)` | Smallest integer ≥ num (rounded up) |
| `floor()` | `double floor(double num)` | Largest integer ≤ num (rounded down) |
| `fmod()` | `double fmod(double x, double y)` | Remainder of x/y (float version of %) |
| `pow()` | `double pow(double base, double exp)` | base raised to the power exp |
| `pow10()` | `double pow10(int n)` | 10 raised to the power n |
| `sqrt()` | `double sqrt(double num)` | Square root of num (num must be ≥ 0) |

---

<!-- kind: content -->
## Character Functions (`<ctype.h>`)

These functions test or transform single characters. They return non-zero (true) if the condition holds, zero (false) otherwise.

| Function | Tests/Does |
|---|---|
| `isalnum(ch)` | True if ch is a letter or digit |
| `isalpha(ch)` | True if ch is a letter |
| `isdigit(ch)` | True if ch is a digit (0–9) |
| `islower(ch)` | True if ch is a lowercase letter |
| `isupper(ch)` | True if ch is an uppercase letter |
| `ispunct(ch)` | True if ch is a punctuation character (not space) |
| `isspace(ch)` | True if ch is whitespace (space, tab, newline, etc.) |
| `tolower(ch)` | Returns the lowercase version of ch (unchanged if not a letter) |
| `toupper(ch)` | Returns the uppercase version of ch (unchanged if not a letter) |

---

<!-- kind: content -->
## Conventional/Conversion Functions (`<stdlib.h>`)

| Function | Syntax | Description |
|---|---|---|
| `atof()` | `double atof(const char *str)` | Convert string to double |
| `atoi()` | `int atoi(const char *str)` | Convert string to int |
| `atol()` | `long atol(const char *str)` | Convert string to long int |
| `itoa()` | `char *itoa(int num, char *str, int radix)` | Convert int to string in given base |

---

<!-- kind: activity -->
## Practice Exercises — Lesson 7

**Evaluate the following (given: `char third[20] = "God Loves U"`, `char fourth[20] = "GOD BLESS U"`):**
```
a. strrev(fourth)
b. strupr(third)
c. strncat(fourth, third, 5)
d. strlwr(fourth)
e. strncpy(first, fourth, 5)
f. strlen(third)
g. strncat(third, fourth, 4)
```

**Answer TRUE or FALSE (given: `char c='C', m='?', i='t', b='5'`):**
```
a. isdigit(b)
b. isalpha(c)
c. isspace(m)
d. isupper(c)
e. isalnum(b)
f. ispunct(m)
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
1. Write a function that returns 1 if a string is a palindrome (reads the same forwards and backwards), 0 otherwise.
2. Write a program that reads lines of text and counts the total number of words as well as how many have 1 letter, 2 letters, 3 letters, etc.
3. Write a function that finds the longest common prefix of two words (e.g., "global" and "glossary" → "glo").
4. Write a program that reads text and replaces all four-letter words with asterisks.
5. Write a program that pluralizes nouns by these rules: (a) ends in "y" → remove "y", add "ies"; (b) ends in "s", "ch", or "sh" → add "es"; (c) otherwise → add "s".
