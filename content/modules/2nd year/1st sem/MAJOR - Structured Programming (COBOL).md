# COBOL Structured Programming Study Guide
<!-- subject: Structured Programming (COBOL) | year: 2nd -->

> Draft status: rewritten study material for review. School names, staff names, course codes, lab rooms, form fields, institutional headings, and classroom-management directions have been removed or generalized.

---

<!-- kind: content -->
## Lesson 1: COBOL Overview, Program Structure, and Coding Form

### Learning goals
After studying this lesson, learners should be able to:

1. Describe what COBOL is and why it is still used.
2. Identify major features of COBOL programs.
3. Explain the four main COBOL divisions.
4. Read the traditional COBOL coding form and understand Area A and Area B.

### What COBOL is
COBOL stands for **Common Business-Oriented Language**. It was designed mainly for business, finance, government, and administrative data processing. Because many organizations built large, long-running systems in COBOL, the language remains important in legacy systems, especially where reliability and large-volume file processing matter.

COBOL is known for:

- English-like statements such as `ADD`, `MOVE`, `READ`, `WRITE`, and `DISPLAY`.
- A highly organized program structure divided into major sections called **divisions**.
- Strong support for file processing and report generation.
- Fixed-format coding traditions that came from punched-card systems.

### A short history of COBOL
COBOL was specified in 1959 by a committee that wanted a common language for business applications. Early COBOL work was influenced by earlier business-oriented languages, including FLOW-MATIC. The first COBOL compilers appeared around 1960, and later standards were published to reduce incompatibilities between vendors.

Important standard milestones include:

- COBOL-68
- COBOL-74
- COBOL-85
- COBOL 2002

Modern COBOL implementations may include features such as object-oriented programming, Unicode support, XML processing, and interoperability with other languages or platforms.

### Why COBOL became widely used
COBOL succeeded because it matched the needs of business computing:

- **Readability:** Many statements resemble English instructions.
- **Maintainability:** The rigid structure makes old programs easier to inspect and modify.
- **Portability:** Standard COBOL can be moved across different machines with fewer changes than many machine-specific languages.
- **File handling:** COBOL is strong at reading, writing, sorting, and producing reports from large files.
- **Business-rule focus:** COBOL programs often encode rules for payroll, billing, inventory, banking, insurance, and records processing.

### Common COBOL features
COBOL programs often have the following characteristics:

- They can be long and verbose compared with programs in C, Java, or Python.
- They are column-sensitive in older fixed-format style.
- They rely heavily on divisions, sections, paragraphs, records, and data descriptions.
- They separate data declarations from processing instructions.
- They use punctuation carefully; in many older examples, periods terminate divisions, sections, paragraphs, and sentences.

### COBOL syntax examples
COBOL can express common operations using English-like statements.

```cobol
ADD YEARS TO AGE.
```

This is similar in meaning to:

```text
AGE = AGE + YEARS
```

A COBOL condition may also use abbreviated comparisons. For example:

```cobol
IF SALARY > 9000 OR > SUPERVISOR-SALARY OR = PREVIOUS-SALARY
```

This means:

```cobol
IF SALARY > 9000
   OR SALARY > SUPERVISOR-SALARY
   OR SALARY = PREVIOUS-SALARY
```

### The hierarchy of COBOL code
COBOL code is organized from small units to large units:

| Unit | Meaning |
|---|---|
| Character | A single symbol, letter, digit, or space. |
| Word | One or more characters forming a COBOL word or user-defined name. |
| Clause | A group of words that describes an attribute of an entry. |
| Statement | A valid instruction, usually beginning with a COBOL verb in the Procedure Division. |
| Sentence | One or more statements ending with a period. |
| Paragraph | One or more sentences under a paragraph name. |
| Section | A named grouping of related paragraphs or entries. |
| Division | A major part of the program. |

### The four COBOL divisions
Every traditional COBOL program is organized into four main divisions in this order:

1. **IDENTIFICATION DIVISION** - identifies the program and usually contains the program name.
2. **ENVIRONMENT DIVISION** - describes the computer environment and file assignments.
3. **DATA DIVISION** - defines files, records, constants, variables, and storage areas.
4. **PROCEDURE DIVISION** - contains the executable instructions.

### Common sections and paragraphs
A simple COBOL program may use the following structure:

```text
IDENTIFICATION DIVISION
  PROGRAM-ID
  AUTHOR (optional in older examples)
  DATE-WRITTEN (optional in older examples)
  DATE-COMPILED (optional in older examples)

ENVIRONMENT DIVISION
  CONFIGURATION SECTION
    SOURCE-COMPUTER
    OBJECT-COMPUTER
    SPECIAL-NAMES
  INPUT-OUTPUT SECTION
    FILE-CONTROL

DATA DIVISION
  FILE SECTION
  WORKING-STORAGE SECTION

PROCEDURE DIVISION
  User-defined paragraphs and statements
```

For modern learning material, student-facing examples can focus on `PROGRAM-ID`, file assignment, data definitions, and executable logic rather than author, school, or lab documentation fields.

### Traditional 80-column coding form
Older COBOL uses a fixed-format layout based on 80 columns:

| Columns | Area | Purpose |
|---|---|---|
| 1-6 | Sequence area | Historically used for page/line numbers. Usually ignored in modern editing. |
| 7 | Indicator area | Holds special indicators such as comment, page break, or continuation. |
| 8-11 | Area A | Used for division names, section names, paragraph names, and level numbers such as `01`. |
| 12-72 | Area B | Used for most statements and subordinate entries. |
| 73-80 | Identification area | Historically used for card identification; ignored by the compiler in fixed format. |

### Column 7 indicators
In fixed-format COBOL, column 7 has special meanings:

| Indicator | Meaning |
|---|---|
| `*` | Comment line; ignored by the compiler. |
| `/` | Page break for listing/report output in older environments. |
| `-` | Continuation of the previous line. |

### Area A and Area B
In traditional fixed-format COBOL:

- **Area A** begins at column 8. Use it for divisions, sections, paragraph names, file descriptions, and level `01` records.
- **Area B** begins at column 12. Use it for most statements and subordinate data items.

Example structure:

```cobol
       IDENTIFICATION DIVISION.
       PROGRAM-ID. HELLO-WORLD.
       PROCEDURE DIVISION.
       MAIN-PARAGRAPH.
           DISPLAY "Hello, world.".
           STOP RUN.
```

### Simple COBOL template
A basic COBOL template can be written as:

```cobol
       IDENTIFICATION DIVISION.
       PROGRAM-ID. SAMPLE-PROGRAM.

       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT INPUT-FILE ASSIGN TO "INPUT.DAT".
           SELECT OUTPUT-FILE ASSIGN TO "OUTPUT.DAT".

       DATA DIVISION.
       FILE SECTION.
       FD  INPUT-FILE.
       01  INPUT-RECORD.
           05 INPUT-FIELD        PIC X(20).

       FD  OUTPUT-FILE.
       01  OUTPUT-RECORD         PIC X(80).

       WORKING-STORAGE SECTION.
       01  EOF-SW                PIC 9 VALUE 0.

       PROCEDURE DIVISION.
       MAIN-PROCEDURE.
           STOP RUN.
```

<!-- kind: activity -->
## Activity 1: COBOL Basics Review

Answer the following in your own words:

1. What does COBOL stand for, and what type of applications was it designed for?
2. List two reasons COBOL programs can be maintainable.
3. Name the four divisions of a COBOL program in order.
4. Explain the difference between Area A and Area B.
5. Write a simple `Hello, world` COBOL program using the four-line structure shown above.

---

<!-- kind: content -->
## Lesson 2: COBOL Character Set and COBOL Words

### Learning goals
After studying this lesson, learners should be able to:

1. Identify the basic COBOL character set.
2. Distinguish between user-defined words and reserved words.
3. Apply naming rules for files, records, and data fields.
4. Read a basic average-grade COBOL example.

### COBOL character set
Traditional COBOL uses letters, digits, spaces, and selected special symbols.

| Character type | Examples |
|---|---|
| Digits | `0 1 2 3 4 5 6 7 8 9` |
| Letters | `A B C ... Z` |
| Space | blank space |
| Special symbols | `(` `)` `"` `=` `$` `,` `;` `+` `-` `*` `/` `>` `<` |

### Types of COBOL words
COBOL words can be grouped into two major categories:

1. **User-defined words** - names created by the programmer.
2. **Reserved words** - words that already have a defined meaning in COBOL.

### User-defined words
A user-defined word is a name chosen by the programmer. It may name a file, record, field, paragraph, section, or program.

Rules for user-defined words:

- Use only letters, digits, and hyphens.
- Do not use spaces.
- Do not begin or end with a hyphen.
- Include at least one letter.
- Keep the name within the allowed length; many COBOL references use a 30-character limit.
- Do not use a COBOL reserved word.

Examples:

| Name | Valid? | Reason |
|---|---:|---|
| `SALES-AMT` | Yes | Uses letters and hyphen correctly. |
| `3STUD-NAME` | Yes in many COBOL systems | Begins with a digit but includes letters; check compiler rules. |
| `143` | No | Contains no alphabetic character. |
| `STUDENT ID` | No | Contains a space. |
| `SALES*REP` | No | Contains `*`, which is not allowed in user-defined names. |
| `AMOUNT-DUE-` | No | Ends with a hyphen. |

### Reserved words
A reserved word has a built-in COBOL meaning. Programmers cannot freely reuse it as a data name or file name.

Reserved words include:

- **Keywords:** Required words in a statement, such as `READ`, `AT END`, `STOP RUN`, `MOVE`, and `DISPLAY`.
- **Optional words:** Words that improve readability but may not be required by the compiler in some formats.
- **Figurative constants:** Reserved words representing common values, such as `ZERO`, `ZEROS`, `ZEROES`, `SPACE`, `SPACES`, `QUOTE`, and `QUOTES`.

Example:

```cobol
READ MASTER-FILE AT END
    MOVE 1 TO EOF-SW.
```

In this example, `READ`, `AT END`, and `MOVE` are COBOL words. `MASTER-FILE` and `EOF-SW` are user-defined names.

### Figurative constants
Figurative constants are readable substitutes for common values.

| Constant | Meaning |
|---|---|
| `ZERO`, `ZEROS`, `ZEROES` | Numeric zero or repeated zeroes. |
| `SPACE`, `SPACES` | One or more blank spaces. |
| `QUOTE`, `QUOTES` | Quotation mark character. |
| `HIGH-VALUE`, `HIGH-VALUES` | Highest value in the system's collating sequence. |
| `LOW-VALUE`, `LOW-VALUES` | Lowest value in the system's collating sequence. |

Example:

```cobol
MOVE ZEROS TO TOTAL-SALES.
MOVE SPACES TO CUSTOMER-NAME.
```

### Average-grade case study
A simple COBOL exercise can ask the program to:

1. Accept a student's name.
2. Accept a midterm grade.
3. Accept a final grade.
4. Compute the average.
5. Display the average.
6. Ask whether another record should be entered.

A generic screen layout might be:

```text
ENTER NAME: __________
ENTER MIDTERM GRADE: __________
ENTER FINAL GRADE: __________
AVERAGE: __________
INPUT MORE? (Y/N): __________
```

<!-- kind: activity -->
## Activity 2: Validate COBOL Names

Write `Valid` or `Invalid`, then explain the reason.

| Item | Answer | Reason |
|---|---|---|
| `CUST-REPORT` |  |  |
| `SPACES` |  |  |
| `STUDCOURSE` |  |  |
| `143` |  |  |
| `STUDENT ID` |  |  |
| `SALES-AMT` |  |  |
| `3STUD-NAME` |  |  |
| `AMOUNT-DUE-` |  |  |
| `ACCT-NAME` |  |  |
| `SALES*REP` |  |  |

### Suggested answer key

| Item | Answer | Reason |
|---|---|---|
| `CUST-REPORT` | Valid | Letters and hyphen only; does not start/end with hyphen. |
| `SPACES` | Invalid | It is a figurative constant/reserved word. |
| `STUDCOURSE` | Valid | Letters only. |
| `143` | Invalid | No alphabetic character. |
| `STUDENT ID` | Invalid | Contains a space. |
| `SALES-AMT` | Valid | Letters and hyphen only. |
| `3STUD-NAME` | Usually valid | Has letters and allowed characters; confirm compiler rules if digits at start are restricted. |
| `AMOUNT-DUE-` | Invalid | Ends with a hyphen. |
| `ACCT-NAME` | Valid | Letters and hyphen only. |
| `SALES*REP` | Invalid | Contains `*`. |

<!-- kind: activity -->
## Activity 3: Average Grade Program Skeleton

Complete the program so it accepts a name, midterm grade, and final grade, then displays the average.

```cobol
       IDENTIFICATION DIVISION.
       PROGRAM-ID. AVERAGE-GRADE.

       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  STUDENT-NAME       PIC X(30).
       01  MIDTERM-GRADE      PIC 9V99.
       01  FINAL-GRADE        PIC 9V99.
       01  AVERAGE-GRADE      PIC 9V99.
       01  DISPLAY-AVERAGE    PIC 9.99.
       01  ANSWER             PIC X VALUE "Y".

       PROCEDURE DIVISION.
       MAIN-PROCEDURE.
           PERFORM PROCESS-STUDENT
               UNTIL ANSWER = "N" OR ANSWER = "n".
           STOP RUN.

       PROCESS-STUDENT.
           DISPLAY "ENTER NAME: ".
           ACCEPT STUDENT-NAME.
           DISPLAY "ENTER MIDTERM GRADE: ".
           ACCEPT MIDTERM-GRADE.
           DISPLAY "ENTER FINAL GRADE: ".
           ACCEPT FINAL-GRADE.

           COMPUTE AVERAGE-GRADE =
               (MIDTERM-GRADE + FINAL-GRADE) / 2.
           MOVE AVERAGE-GRADE TO DISPLAY-AVERAGE.

           DISPLAY "AVERAGE: " DISPLAY-AVERAGE.
           DISPLAY "INPUT MORE? (Y/N): ".
           ACCEPT ANSWER.
```

---

<!-- kind: content -->
## Lesson 3: Identification Division and Environment Division

### Learning goals
After studying this lesson, learners should be able to:

1. Read instruction-format notation used in COBOL references.
2. Write the basic syntax of the Identification Division.
3. Explain the purpose of the Environment Division.
4. Use `FILE-CONTROL` and `SELECT ... ASSIGN TO` for file assignments.

### Reading COBOL syntax formats
COBOL references often use special formatting conventions:

| Convention | Meaning |
|---|---|
| Uppercase words | COBOL reserved words. |
| Lowercase or placeholder words | Programmer-supplied values. |
| Brackets `[ ]` | Optional part. |
| Braces `{ }` | Placeholder or required choice, depending on reference style. |
| Ellipsis `...` | More entries of the same kind may follow. |
| Punctuation | If shown in the syntax, it must be typed. |

Example:

```text
PROGRAM-ID. program-name.
```

This means `PROGRAM-ID.` is typed as shown, while `program-name` is replaced by the chosen program name.

### Identification Division
The **Identification Division** names and identifies the program. In many beginner programs, the only required paragraph is `PROGRAM-ID`.

Basic form:

```cobol
       IDENTIFICATION DIVISION.
       PROGRAM-ID. program-name.
```

Older examples may include documentation paragraphs such as `AUTHOR`, `DATE-WRITTEN`, or `SECURITY`, but student-facing study material should avoid personal or institutional identifiers.

Generic example:

```cobol
       IDENTIFICATION DIVISION.
       PROGRAM-ID. SALES-REPORT.
```

### Environment Division
The **Environment Division** describes external resources used by the program, especially files and machine-related details.

Common parts:

```cobol
       ENVIRONMENT DIVISION.
       CONFIGURATION SECTION.
       SOURCE-COMPUTER. computer-name.
       OBJECT-COMPUTER. computer-name.

       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT file-name ASSIGN TO "external-file-name".
```

In many simple modern learning examples, the `CONFIGURATION SECTION` may be omitted unless the compiler requires it. The `INPUT-OUTPUT SECTION` is important when the program reads or writes files.

### Configuration Section
The Configuration Section may document the source and object computers:

- `SOURCE-COMPUTER` - the machine used to compile the program.
- `OBJECT-COMPUTER` - the machine used to run the program.
- `SPECIAL-NAMES` - optional special device or symbolic-name definitions.

Generic example:

```cobol
       CONFIGURATION SECTION.
       SOURCE-COMPUTER. GENERIC-PC.
       OBJECT-COMPUTER. GENERIC-PC.
```

### Input-Output Section
The Input-Output Section connects COBOL file names to external files or devices.

The most common paragraph is `FILE-CONTROL`.

```cobol
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT STUDENT-FILE
               ASSIGN TO "STUDENT.DAT".
           SELECT REPORT-FILE
               ASSIGN TO "REPORT.TXT".
```

### Internal file name vs. external file name
A COBOL program often uses two names for a file:

| Name type | Example | Purpose |
|---|---|---|
| Internal file name | `STUDENT-FILE` | Name used inside the COBOL program. |
| External file name | `"STUDENT.DAT"` | Actual file or device known to the operating system. |

### Tips for file names
Use meaningful names that describe the file's role:

- `SALES-INPUT`
- `SALES-REPORT`
- `STUDENT-FILE`
- `PAYROLL-OUTPUT`

Avoid names that are too vague, personal, or unrelated to the program.

<!-- kind: activity -->
## Activity 4: Write Identification and Environment Snippets

Write COBOL snippets for the following:

1. A program named `PAYROLL-APP`.
2. A source and object computer both named `GENERIC-PC`.
3. An input file whose internal name is `EMPLOYEE-FILE` and external file is `EMPLOYEE.DAT`.
4. An output file whose internal name is `PAYROLL-REPORT` and external file is `PAYROLL.TXT`.

Suggested answer:

```cobol
       IDENTIFICATION DIVISION.
       PROGRAM-ID. PAYROLL-APP.

       ENVIRONMENT DIVISION.
       CONFIGURATION SECTION.
       SOURCE-COMPUTER. GENERIC-PC.
       OBJECT-COMPUTER. GENERIC-PC.

       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT EMPLOYEE-FILE
               ASSIGN TO "EMPLOYEE.DAT".
           SELECT PAYROLL-REPORT
               ASSIGN TO "PAYROLL.TXT".
```

---

<!-- kind: content -->
## Lesson 4: Data Division, Data Fields, and PICTURE Clauses

### Learning goals
After studying this lesson, learners should be able to:

1. Form valid COBOL data names.
2. Explain files, records, and fields.
3. Distinguish numeric, alphabetic, and alphanumeric data fields.
4. Use the File Section and Working-Storage Section.
5. Apply common `PIC` characters and editing characters.

### Naming rules for data names
A COBOL data name should:

- Use letters, digits, and hyphens only.
- Avoid embedded spaces.
- Contain at least one letter.
- Not begin or end with a hyphen.
- Not be a reserved word.
- Be meaningful and specific.

Good examples:

```cobol
STUDENT-NO
STUDENT-NAME
TOTAL-SALES
NET-PAY
EOF-SW
```

Weak examples:

```text
A1        too vague
SID       unclear abbreviation
JOHN      person-specific and not descriptive
TOTAL     too broad if several totals exist
```

### Variable data and constant data
COBOL programs use both changing and fixed data.

| Type | Meaning | Example |
|---|---|---|
| Variable data | Data that can change during processing. | `TOTAL-SALES`, `COUNTER`, `AVERAGE-GRADE` |
| Constant data | Fixed data coded into the program. | `VALUE 0`, `VALUE "YES"`, report headings |

### Data organization: file, record, field
Business programs usually organize data in layers:

1. **File** - a collection of related records.
2. **Record** - one complete unit inside a file, such as one student or one employee.
3. **Field** - one piece of data inside a record, such as name, ID number, or grade.

Example:

```text
File: STUDENT-FILE
Record: STUDENT-RECORD
Fields: STUDENT-NO, STUDENT-NAME, MIDTERM-GRADE, FINAL-GRADE
```

### Types of data fields
COBOL commonly uses three field categories:

| Field type | PIC symbol | Use |
|---|---|---|
| Numeric | `9` | Numbers used for arithmetic. |
| Alphabetic | `A` | Letters and spaces. |
| Alphanumeric | `X` | Letters, digits, spaces, and symbols. |

Examples:

```cobol
05  STUDENT-NAME     PIC X(30).
05  AGE              PIC 99.
05  SECTION-CODE     PIC X(10).
05  LAST-NAME        PIC A(20).
```

### Numeric literals
Rules for numeric literals:

- Use digits `0` through `9`.
- Do not use commas in the stored numeric literal.
- A sign may appear on the left, such as `-125` or `+50`.
- A decimal point may appear inside a numeric literal but not as the final character.

Examples:

| Valid | Invalid | Reason invalid |
|---|---|---|
| `10.50` | `10,000` | Commas are not allowed in numeric literals. |
| `-387.58` | `$225` | Currency symbol is not part of the numeric literal. |
| `+10000` | `175-` | Sign must not appear at the right. |

### Group and elementary fields
A **group field** contains smaller fields. An **elementary field** cannot be subdivided further.

Example:

```cobol
01  STUDENT-RECORD.
    05 STUDENT-NO        PIC X(10).
    05 STUDENT-NAME.
       10 LAST-NAME      PIC X(15).
       10 FIRST-NAME     PIC X(15).
       10 MIDDLE-INITIAL PIC X.
    05 FINAL-GRADE       PIC 9V99.
```

Here, `STUDENT-RECORD` and `STUDENT-NAME` are group items. `STUDENT-NO`, `LAST-NAME`, `FIRST-NAME`, `MIDDLE-INITIAL`, and `FINAL-GRADE` are elementary items.

### Data Division structure
A common Data Division contains two major sections:

```cobol
       DATA DIVISION.
       FILE SECTION.
       FD  file-name.
       01  record-name.
           05 field-name PIC clause.

       WORKING-STORAGE SECTION.
       01  variable-name PIC clause VALUE initial-value.
```

### File Section
The **File Section** describes input and output files and their records.

```cobol
       FILE SECTION.
       FD  STUDENT-FILE
           LABEL RECORD IS STANDARD
           RECORD CONTAINS 41 CHARACTERS
           DATA RECORD IS STUDENT-RECORD.
       01  STUDENT-RECORD.
           05 STUDENT-NO      PIC X(10).
           05 STUDENT-NAME    PIC X(25).
           05 MIDTERM-GRADE   PIC 9V99.
           05 FINAL-GRADE     PIC 9V99.
```

Common File Description entries:

| Entry | Meaning |
|---|---|
| `FD` | Begins the file description and names the file. |
| `LABEL RECORD` | Describes whether system labels are standard or omitted. |
| `RECORD CONTAINS` | Indicates record size. |
| `DATA RECORD IS` | Names the record associated with the file. |
| `01 record-name` | Starts the record description. |

### Working-Storage Section
The **Working-Storage Section** stores variables, counters, switches, report headings, and intermediate results that are not directly part of an input file.

```cobol
       WORKING-STORAGE SECTION.
       01  EOF-SW             PIC 9 VALUE 0.
       01  RECORD-COUNT       PIC 9(4) VALUE 0.
       01  TOTAL-GRADE        PIC 9(5)V99 VALUE 0.
       01  AVERAGE-GRADE      PIC 9V99 VALUE 0.
```

Common uses:

- Counters
- Totals
- End-of-file switches
- Report headings
- Display/output formatting fields
- Temporary calculation storage

### PICTURE clause
The `PICTURE` or `PIC` clause defines the type and size of an elementary data item.

```cobol
05  CUSTOMER-NAME     PIC X(30).
05  QUANTITY          PIC 9(3).
05  PRICE             PIC 9(5)V99.
```

Rules:

- A group item should not have a `PIC` clause.
- An elementary item normally needs a `PIC` clause.
- `PIC 9999` and `PIC 9(4)` mean the same thing.
- Numeric fields used in arithmetic should use `9`, not `X`.

### Common PICTURE characters

| Character | Meaning | Example |
|---|---|---|
| `9` | Numeric digit | `PIC 9(3)` stores three digits. |
| `V` | Assumed decimal point | `PIC 999V99` treats stored `12345` as `123.45`. |
| `X` | Alphanumeric character | `PIC X(20)` stores up to 20 characters. |
| `A` | Alphabetic character | `PIC A(15)` stores letters/spaces. |
| `S` | Signed numeric value | `PIC S9(4)` allows positive/negative values. |
| `P` | Decimal scaling position | Used for special scaling cases. |

### Assumed decimal point with `V`
The `V` character marks a decimal location without storing an actual decimal point.

| Stored digits | PIC clause | Interpreted value |
|---|---|---:|
| `12050` | `PIC 999V99` | `120.50` |
| `020050` | `PIC 999V999` | `020.050` |
| `125` | `PIC 99V9` | `12.5` |

### FILLER
`FILLER` reserves positions that do not need a unique name.

Example:

```cobol
01  PRINT-LINE.
    05 FILLER       PIC X(10) VALUE SPACES.
    05 PRINT-NAME   PIC X(25).
    05 FILLER       PIC X(5)  VALUE SPACES.
    05 PRINT-GRADE  PIC ZZ9.99.
```

Use `FILLER` for spacing, labels, or unused areas in report records.

### VALUE clause
The `VALUE` clause gives an initial value to a Working-Storage item.

```cobol
05  WS-DISCOUNT        PIC V99 VALUE .15.
05  WS-LAB-FEE         PIC 9(3) VALUE 350.
05  WS-MORE-RECORDS    PIC X(3) VALUE "YES".
05  WS-TITLE           PIC X(14) VALUE "MONTHLY REPORT".
```

### Data editing
Data editing formats values for output. It is usually done by moving a raw numeric value into an edited field.

Common editing symbols:

| Symbol | Use |
|---|---|
| `.` | Actual decimal point in displayed output. |
| `,` | Comma insertion. |
| `Z` | Suppress leading zeroes. |
| `B` | Insert blank. |
| `0` | Insert zero. |
| `/` | Insert slash, often for dates. |
| `$` | Insert currency symbol. |
| `+` or `-` | Show sign. |

Examples:

```cobol
05  AMOUNT-IN       PIC 9(5)V99 VALUE 0250025.
05  AMOUNT-OUT      PIC ZZ,ZZ9.99.

05  DATE-IN         PIC 9(6) VALUE 011591.
05  DATE-OUT        PIC 99/99/99.
```

After moving `DATE-IN` to `DATE-OUT`, the displayed date is formatted as `01/15/91`.

<!-- kind: activity -->
## Activity 5: Choose the Correct PIC Clause

Write a suitable COBOL declaration for each item.

1. A student name up to 30 characters.
2. A whole-number counter up to 9999.
3. A grade with one digit before the decimal point and two after it.
4. A printed amount like `12,345.67` with leading zero suppression.
5. A date stored as six digits but printed as `MM/DD/YY`.

Suggested answers:

```cobol
05  STUDENT-NAME     PIC X(30).
05  RECORD-COUNT     PIC 9(4).
05  GRADE-IN         PIC 9V99.
05  AMOUNT-OUT       PIC ZZ,ZZ9.99.
05  DATE-IN          PIC 9(6).
05  DATE-OUT         PIC 99/99/99.
```

<!-- kind: activity -->
## Activity 6: File and Working-Storage Declarations

Create Data Division entries for this requirement:

- Input file: `STUDENT-FILE-IN`
- Output file: `STUDENT-FILE-OUT`
- Input record fields:
  - student number: 10 characters
  - student name: 25 characters
  - midterm grade: `9V99`
  - final grade: `9V99`
- Working-storage fields:
  - end-of-file switch
  - total students
  - count of students with average less than 3.00
  - average grade

Suggested skeleton:

```cobol
       DATA DIVISION.
       FILE SECTION.
       FD  STUDENT-FILE-IN
           LABEL RECORD IS STANDARD
           DATA RECORD IS STUDENT-IN-REC.
       01  STUDENT-IN-REC.
           05 STUDENT-NO       PIC X(10).
           05 STUDENT-NAME     PIC X(25).
           05 MIDTERM-GRADE    PIC 9V99.
           05 FINAL-GRADE      PIC 9V99.

       FD  STUDENT-FILE-OUT
           LABEL RECORD IS OMITTED
           DATA RECORD IS STUDENT-OUT-REC.
       01  STUDENT-OUT-REC     PIC X(80).

       WORKING-STORAGE SECTION.
       01  EOF-SW              PIC 9 VALUE 0.
       01  TOTAL-STUDENTS      PIC 9(3) VALUE 0.
       01  BELOW-THREE-COUNT   PIC 9(2) VALUE 0.
       01  AVERAGE-GRADE       PIC 9V99 VALUE 0.
```

---

<!-- kind: content -->
## Lesson 5: Procedure Division and COBOL Statements

### Learning goals
After studying this lesson, learners should be able to:

1. Use common Procedure Division statements.
2. Read and write file-processing statements.
3. Apply arithmetic statements and the `COMPUTE` statement.
4. Use condition statements and relational operators.
5. Use `PERFORM` for repeated processing.
6. Understand basic one-dimensional and two-dimensional COBOL tables.

### Procedure Division
The **Procedure Division** contains the executable part of a COBOL program. It tells the computer what to do with the data described in the Data Division.

A simple Procedure Division may look like this:

```cobol
       PROCEDURE DIVISION.
       MAIN-PROCEDURE.
           OPEN INPUT STUDENT-FILE
                OUTPUT REPORT-FILE.
           PERFORM PROCESS-RECORDS UNTIL EOF-SW = 1.
           CLOSE STUDENT-FILE REPORT-FILE.
           STOP RUN.
```

### OPEN statement
`OPEN` connects a program's file name to the actual physical file and prepares it for processing.

Formats:

```cobol
OPEN INPUT file-name.
OPEN OUTPUT file-name.
OPEN I-O file-name.
OPEN EXTEND file-name.
```

Modes:

| Mode | Use |
|---|---|
| `INPUT` | Read existing data. |
| `OUTPUT` | Create or write output. |
| `I-O` | Read and update direct-access files. |
| `EXTEND` | Add records to the end of an existing file. |

Examples:

```cobol
OPEN INPUT STUDENT-FILE.
OPEN OUTPUT REPORT-FILE.
OPEN INPUT STUDENT-FILE OUTPUT REPORT-FILE.
```

### READ statement
`READ` gets one record from an input file.

```cobol
READ STUDENT-FILE
    AT END MOVE 1 TO EOF-SW.
```

For a sequential file, the first `READ` gets the first record, the next `READ` gets the next record, and so on. The `AT END` clause handles the end of the file.

### MOVE statement
`MOVE` copies a literal or data-field value into another data field.

Direct move:

```cobol
MOVE 1 TO EOF-SW.
MOVE "Y" TO ANSWER.
MOVE 20 TO COUNTER.
```

Indirect move:

```cobol
MOVE EMPLOYEE-NAME TO PRINT-NAME.
MOVE SALARY TO PRINT-SALARY.
```

Important rules:

- Numeric values should be moved into numeric fields.
- Alphanumeric values should be moved into alphanumeric fields.
- If the receiving alphanumeric field is longer, blanks are added on the right.
- If the receiving numeric field is longer, zeroes are added on the left.
- If the receiving field is too short, truncation can occur.

Example:

| Receiving field | Move statement | Result |
|---|---|---|
| `PIC X(10)` | `MOVE "PASSED" TO REMARKS` | `PASSED` plus four blanks |
| `PIC 999` | `MOVE 20 TO COUNTER` | `020` |
| `PIC 9` | `MOVE 123 TO COUNTER` | `3` after left truncation |

### WRITE statement
`WRITE` sends a record to an output file.

```cobol
WRITE REPORT-RECORD.
WRITE REPORT-RECORD FROM PRINT-LINE.
WRITE REPORT-RECORD FROM HEADER-LINE AFTER PAGE.
WRITE REPORT-RECORD FROM DETAIL-LINE AFTER 1 LINE.
```

Use the output record name from the File Section after `WRITE`, not the file name itself.

### CLOSE statement
`CLOSE` makes a file unavailable for further processing and releases it properly.

```cobol
CLOSE STUDENT-FILE.
CLOSE STUDENT-FILE REPORT-FILE.
```

Do not write `INPUT` or `OUTPUT` in the `CLOSE` statement.

### STOP RUN statement
`STOP RUN` ends program execution.

```cobol
STOP RUN.
```

### Arithmetic statements
COBOL has several arithmetic statements:

- `ADD`
- `SUBTRACT`
- `MULTIPLY`
- `DIVIDE`
- `COMPUTE`

Fields used in arithmetic should be numeric, usually declared with `PIC 9`, optionally with `S` or `V`.

### ADD
Format:

```cobol
ADD data-field-1 TO data-field-2.
```

This adds the first value to the second and stores the result in the second field.

```cobol
ADD SALARY TO TOTAL-SALARY.
ADD 1 TO RECORD-COUNT.
ADD QUIZ1 QUIZ2 QUIZ3 TO TOTAL-QUIZ.
```

With `GIVING`:

```cobol
ADD QUIZ1 QUIZ2 GIVING TOTAL-QUIZ.
```

`GIVING` stores the result in a separate receiving field, so the source values do not need to be changed.

### SUBTRACT
Format:

```cobol
SUBTRACT data-field-1 FROM data-field-2.
```

This subtracts the first value from the second and stores the result in the second field.

```cobol
SUBTRACT DISCOUNT FROM PRICE.
SUBTRACT TAX LOAN FROM GROSS-PAY.
```

With `GIVING`:

```cobol
SUBTRACT DEDUCTION FROM GROSS-PAY GIVING NET-PAY.
```

### MULTIPLY
Format:

```cobol
MULTIPLY data-field-1 BY data-field-2.
```

This multiplies the first value by the second and stores the result in the second field.

```cobol
MULTIPLY RATE BY HOURS.
```

With `GIVING`:

```cobol
MULTIPLY RATE BY HOURS GIVING GROSS-PAY.
```

### DIVIDE
Two common forms:

```cobol
DIVIDE data-field-1 BY data-field-2.
DIVIDE data-field-1 INTO data-field-2.
```

With `BY`, the first field is divided by the second. With `INTO`, the second field is divided by the first. In the simple form, the quotient is stored in the dividend field.

With `GIVING`:

```cobol
DIVIDE TOTAL-GRADE BY NUMBER-OF-GRADES GIVING AVERAGE-GRADE.
DIVIDE 12 INTO ANNUAL-SALES GIVING MONTHLY-SALES.
```

### ROUNDED clause
Use `ROUNDED` when the receiving field has fewer decimal places than the result and you want rounding instead of simple truncation.

```cobol
DIVIDE TOTAL-GRADE BY SUBJECT-COUNT
    GIVING AVERAGE-GRADE ROUNDED.
```

### REMAINDER clause
Use `REMAINDER` with `DIVIDE ... GIVING` to store the remainder.

```cobol
DIVIDE TOTAL-ITEMS BY ITEMS-PER-BOX
    GIVING FULL-BOXES
    REMAINDER LEFTOVER-ITEMS.
```

### ON SIZE ERROR clause
Use `ON SIZE ERROR` to handle a result too large for the receiving field.

```cobol
MULTIPLY SALES BY RATE
    GIVING COMMISSION
    ON SIZE ERROR
        MOVE 1 TO ERROR-SW.
```

### COMPUTE statement
`COMPUTE` allows a full arithmetic expression in one statement.

```cobol
COMPUTE TOTAL-GRADE = GRADE-1 + GRADE-2.
COMPUTE DISCOUNT = PRICE * DISCOUNT-RATE.
COMPUTE NET-SALES = GROSS-SALES - EXPENSES.
COMPUTE AVERAGE-GRADE = TOTAL-GRADE / SUBJECT-COUNT.
COMPUTE GROSS-PAY = RATE-PER-HOUR * HOURS-WORKED.
```

Order of operations:

1. Parentheses
2. Exponentiation, if supported by the compiler
3. Multiplication and division
4. Addition and subtraction
5. Equal-priority operations from left to right

### IF statement
`IF` executes statements when a condition is true.

```cobol
IF GRADE > 74
    MOVE "PASSED" TO REMARKS.
```

With `ELSE`:

```cobol
IF TRANSACTION-CODE = "D"
    ADD AMOUNT TO BALANCE
ELSE
    SUBTRACT AMOUNT FROM BALANCE.
```

### Relational operators
COBOL can compare values using words or symbols:

| Meaning | COBOL form |
|---|---|
| Equal | `IS EQUAL TO` or `=` |
| Not equal | `IS NOT EQUAL TO` or `NOT =` |
| Less than | `IS LESS THAN` or `<` |
| Not less than | `IS NOT LESS THAN` or `NOT <` |
| Greater than | `IS GREATER THAN` or `>` |
| Not greater than | `IS NOT GREATER THAN` or `NOT >` |
| Greater than or equal | `IS GREATER THAN OR EQUAL TO` or `>=` |
| Less than or equal | `IS LESS THAN OR EQUAL TO` or `<=` |

### Class conditions
Class conditions test whether a field contains numeric or alphabetic data.

```cobol
IF INPUT-AMOUNT IS NUMERIC
    MOVE INPUT-AMOUNT TO AMOUNT.

IF CUSTOMER-NAME IS ALPHABETIC
    MOVE CUSTOMER-NAME TO PRINT-NAME.
```

### Sign conditions
Sign conditions test whether a numeric field is positive, negative, or zero.

```cobol
IF BALANCE IS NEGATIVE
    DISPLAY "ACCOUNT IS OVERDRAWN".

IF TOTAL IS ZERO
    DISPLAY "NO RECORDS PROCESSED".
```

### Condition names with level 88
Level `88` can name a condition for readability.

```cobol
01  EOF-SW             PIC X VALUE "N".
    88 END-OF-FILE     VALUE "Y".
    88 NOT-END-OF-FILE VALUE "N".
```

Then the Procedure Division can say:

```cobol
IF END-OF-FILE
    DISPLAY "NO MORE RECORDS".

SET END-OF-FILE TO TRUE.
```

### Compound conditions
Use `AND` and `OR` when more than one condition must be tested.

```cobol
IF AGE >= 18 AND ACCOUNT-STATUS = "A"
    MOVE "APPROVED" TO RESULT.

IF OPTION = "Y" OR OPTION = "y"
    PERFORM PROCESS-RECORD.
```

### PERFORM statement
`PERFORM` transfers control to another paragraph, executes it, and then returns.

Unconditional form:

```cobol
PERFORM PRINT-HEADING.
```

Repeat a fixed number of times:

```cobol
PERFORM PRINT-LINE 5 TIMES.
```

Perform a range of paragraphs:

```cobol
PERFORM INITIALIZE-ROUTINE THRU INITIALIZE-END.
```

Repeat until a condition becomes true:

```cobol
PERFORM PROCESS-RECORDS UNTIL EOF-SW = 1.
```

### PERFORM with VARYING
Use `PERFORM ... VARYING` to repeat a paragraph while changing a counter or subscript.

```cobol
PERFORM PRINT-QUIZ
    VARYING I FROM 1 BY 1 UNTIL I > 5.
```

This means:

1. Set `I` to 1.
2. Check whether `I > 5`.
3. If false, perform the paragraph.
4. Add 1 to `I`.
5. Repeat until the condition becomes true.

### Tables and OCCURS
A COBOL table is similar to an array. It stores repeated data items.

One-dimensional table:

```cobol
01  QUIZ-SCORES.
    05 QUIZ-SCORE OCCURS 5 TIMES PIC 99.

01  I PIC 9 VALUE 0.
01  TOTAL-QUIZ PIC 9(3) VALUE 0.
```

Processing example:

```cobol
PERFORM ADD-QUIZ-SCORE
    VARYING I FROM 1 BY 1 UNTIL I > 5.

ADD-QUIZ-SCORE.
    ADD QUIZ-SCORE(I) TO TOTAL-QUIZ.
```

Rules:

- `OCCURS` defines how many elements the table has.
- A subscript identifies which element is being used.
- The subscript is written in parentheses after the table item name.
- The subscript must be within the table's range.

### Two-dimensional tables
A two-dimensional table uses two subscripts, commonly row and column.

Example:

```cobol
01  STUDENT-COUNTS.
    05 YEAR-LEVEL OCCURS 4 TIMES.
       10 COURSE-COUNT OCCURS 2 TIMES PIC 999.
```

Access an element using two subscripts:

```cobol
ADD COURSE-COUNT(I, J) TO YEAR-TOTAL(I).
```

Use nested `PERFORM ... VARYING ... AFTER` for two-dimensional processing:

```cobol
PERFORM ADD-COUNTS
    VARYING I FROM 1 BY 1 UNTIL I > 4
    AFTER J FROM 1 BY 1 UNTIL J > 2.
```

In this pattern, one subscript represents the row and the other represents the column.

### DISPLAY statement
`DISPLAY` prints output to the screen.

```cobol
DISPLAY "Average Grade is: ".
DISPLAY AVERAGE-GRADE.
DISPLAY "Average Grade is: " AVERAGE-GRADE.
```

Some compilers support screen position syntax:

```cobol
DISPLAY "Average Grade is: " LINE 5 COLUMN 15.
DISPLAY AVERAGE-GRADE LINE 5 COLUMN 40.
```

### ACCEPT statement
`ACCEPT` gets input from the keyboard.

```cobol
ACCEPT STUDENT-NAME.
ACCEPT MIDTERM-GRADE.
ACCEPT FINAL-GRADE.
```

Some compilers support screen position syntax:

```cobol
ACCEPT STUDENT-NAME LINE 7 COLUMN 11.
```

<!-- kind: activity -->
## Activity 7: File Processing Pattern

Study this common sequential-file pattern:

```cobol
       PROCEDURE DIVISION.
       MAIN-PROCEDURE.
           OPEN INPUT STUDENT-FILE
                OUTPUT REPORT-FILE.

           READ STUDENT-FILE
               AT END MOVE 1 TO EOF-SW.

           PERFORM PROCESS-STUDENT
               UNTIL EOF-SW = 1.

           CLOSE STUDENT-FILE REPORT-FILE.
           STOP RUN.

       PROCESS-STUDENT.
           PERFORM WRITE-DETAIL.
           READ STUDENT-FILE
               AT END MOVE 1 TO EOF-SW.
```

Questions:

1. Why is the first `READ` placed before the `PERFORM` loop?
2. What happens when `EOF-SW` becomes `1`?
3. Why should files be closed before `STOP RUN`?

<!-- kind: activity -->
## Activity 8: Arithmetic Practice

Write a COBOL statement for each task.

1. Add `AMOUNT` to `TOTAL-AMOUNT`.
2. Subtract `DEDUCTION` from `GROSS-PAY` and store the result in `NET-PAY`.
3. Multiply `RATE` by `HOURS` and store the result in `GROSS-PAY`.
4. Divide `TOTAL-GRADE` by `SUBJECT-COUNT` and store the result in `AVERAGE-GRADE`.
5. Compute net salary as gross salary minus total deductions.

Suggested answers:

```cobol
ADD AMOUNT TO TOTAL-AMOUNT.
SUBTRACT DEDUCTION FROM GROSS-PAY GIVING NET-PAY.
MULTIPLY RATE BY HOURS GIVING GROSS-PAY.
DIVIDE TOTAL-GRADE BY SUBJECT-COUNT GIVING AVERAGE-GRADE.
COMPUTE NET-SALARY = GROSS-SALARY - TOTAL-DEDUCTIONS.
```

<!-- kind: activity -->
## Activity 9: Grade Input Using ACCEPT and DISPLAY

This program accepts grades from the keyboard and displays the average. It does not use input or output files.

```cobol
       IDENTIFICATION DIVISION.
       PROGRAM-ID. GRADE-INPUT.

       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  STUDENT-NAME       PIC X(25).
       01  MIDTERM-GRADE      PIC 9V99.
       01  FINAL-GRADE        PIC 9V99.
       01  AVERAGE-GRADE      PIC 9V99.
       01  PRINT-AVERAGE      PIC 9.99.
       01  ANSWER             PIC X VALUE "Y".

       PROCEDURE DIVISION.
       MAIN-PROCEDURE.
           PERFORM PROCESS-STUDENT
               UNTIL ANSWER = "N" OR ANSWER = "n".
           STOP RUN.

       PROCESS-STUDENT.
           DISPLAY "Enter Name: ".
           ACCEPT STUDENT-NAME.
           DISPLAY "Enter Midterm Grade: ".
           ACCEPT MIDTERM-GRADE.
           DISPLAY "Enter Final Grade: ".
           ACCEPT FINAL-GRADE.

           COMPUTE AVERAGE-GRADE =
               (MIDTERM-GRADE + FINAL-GRADE) / 2.
           MOVE AVERAGE-GRADE TO PRINT-AVERAGE.

           DISPLAY "Average Grade is: " PRINT-AVERAGE.
           DISPLAY "Enter another? (Y/N): ".
           ACCEPT ANSWER.
```

### Sample run

```text
Enter Name: Sample Student
Enter Midterm Grade: 1.75
Enter Final Grade: 2.25
Average Grade is: 2.00
Enter another? (Y/N): N
```

<!-- kind: activity -->
## Activity 10: Payroll Exercise

Create a COBOL program design for this requirement.

### Input screen fields

| Field | Suggested PIC |
|---|---|
| Employee number | `X(5)` |
| Employee name | `X(25)` |
| Rate per hour | `9(3)V99` |
| Number of hours worked | `9(3)` |
| Contribution 1 | `9(4)V99` |
| Contribution 2 | `9(3)V99` |
| Contribution 3 | `9(4)V99` |
| Withholding tax | `9(4)V99` |
| Enter another? | `X(3)` |

### Required computations

```text
GROSS-SALARY = RATE-PER-HOUR * HOURS-WORKED
TOTAL-DEDUCTIONS = CONTRIBUTION-1 + CONTRIBUTION-2 + CONTRIBUTION-3 + WITHHOLDING-TAX
NET-PAY = GROSS-SALARY - TOTAL-DEDUCTIONS
```

### Output report fields

| Field | Suggested edited PIC |
|---|---|
| Employee number | `X(5)` |
| Employee name | `X(25)` |
| Net pay | `ZZ,999.99` |
| Total number of employees | `ZZ,ZZ9` |
| Total accumulated salaries | `Z,ZZZ,999.99` |

### Suggested Procedure Division outline

```cobol
       PROCEDURE DIVISION.
       MAIN-PROCEDURE.
           OPEN OUTPUT PAYROLL-REPORT.
           PERFORM WRITE-HEADINGS.
           PERFORM PROCESS-EMPLOYEE
               UNTIL ANSWER = "NO" OR ANSWER = "No" OR ANSWER = "no".
           PERFORM WRITE-TOTALS.
           CLOSE PAYROLL-REPORT.
           STOP RUN.

       PROCESS-EMPLOYEE.
           DISPLAY "ENTER EMPLOYEE NO.: ".
           ACCEPT EMPLOYEE-NO.
           DISPLAY "ENTER EMPLOYEE NAME: ".
           ACCEPT EMPLOYEE-NAME.
           DISPLAY "RATE PER HOUR: ".
           ACCEPT RATE-PER-HOUR.
           DISPLAY "NO. OF HOURS WORKED: ".
           ACCEPT HOURS-WORKED.
           DISPLAY "CONTRIBUTION 1: ".
           ACCEPT CONTRIBUTION-1.
           DISPLAY "CONTRIBUTION 2: ".
           ACCEPT CONTRIBUTION-2.
           DISPLAY "CONTRIBUTION 3: ".
           ACCEPT CONTRIBUTION-3.
           DISPLAY "WITHHOLDING TAX: ".
           ACCEPT WITHHOLDING-TAX.

           COMPUTE GROSS-SALARY = RATE-PER-HOUR * HOURS-WORKED.
           COMPUTE TOTAL-DEDUCTIONS =
               CONTRIBUTION-1 + CONTRIBUTION-2 + CONTRIBUTION-3
               + WITHHOLDING-TAX.
           COMPUTE NET-PAY = GROSS-SALARY - TOTAL-DEDUCTIONS.

           ADD 1 TO EMPLOYEE-COUNT.
           ADD NET-PAY TO ACCUMULATED-NET-PAY.

           PERFORM WRITE-EMPLOYEE-LINE.

           DISPLAY "ENTER ANOTHER? (YES/NO): ".
           ACCEPT ANSWER.
```

---

<!-- kind: content -->
## Review Notes and Items Flagged for Human Review

⚠️ REVIEW: The source included compiler-specific DOSBox and old COBOL compiler workflow steps. I did not merge these into the main lesson because they may not match the app's target environment.

Original excerpt:

```text
Z:\>mount c: c:\
C:\> cd COBOL
C:\> REALCOB filename.cob
LINK filename.obj
filename.exe
```

⚠️ REVIEW: Some original code examples appear to contain syntax or spelling errors. I rewrote the examples into cleaner teaching-style snippets instead of preserving the exact faulty code.

Original excerpts:

```cobol
SELECT OUTFILE ASIGN TO ...
COMPUTE AVE = (MIDGRD = FINGRD) / 2.
```

### Dropped or generalized material
The following categories were removed or generalized:

- School, department, author, lab, and location names.
- School-specific report headings and institutional output layouts.
- Name/date/year/section/rating answer-sheet fields.
- Classroom-management instructions and classroom logistics.
- Real person names from sample runs.
- Brand/location-specific sample report labels, replaced with generic report examples.

