# Computer Programming 2, Complete Study Guide
<!-- subject: Computer Programming 2 | year: 1st -->

Computer Programming 2 (CP2) picks up where CP1 stopped. CP1 taught you the building blocks of C: variables, input and output, decisions, loops, functions, and simple arrays. CP2 uses those to handle real data: lists and tables of values, text, records, files, and the classic searching and sorting algorithms.

This file is the map of the subject. The full notes, practice exercises, worked exam solutions and code labs for every lesson live in three companion guides in this folder, and each one mirrors the lesson rows on the site:

| Guide | Lessons | Mirrors |
|---|---|---|
| `Computer_Programming_2_units_1-3.md` | 1 to 3 | `supabase/seeds/cp2_modules_sections.sql`, `supabase/seeds/cp2_units_2_3.sql` |
| `Computer_Programming_2_units_4-5.md` | 4 and 5 | `supabase/seeds/cp2_units_4_5.sql` |
| `Computer_Programming_2_units_6-7.md` | 6 and 7 | `supabase/seeds/cp2_units_6_7.sql` |

The exam prep module (`supabase/seeds/cp2_exam_prep_module.sql`) covers all seven lessons.

---

# The Seven Lessons

| Lesson | What you learn | Builds on |
|---|---|---|
| 1. Arrays in Depth | Passing arrays to functions, linear search, the classic array algorithms, 2-D arrays and matrix operations | CP1 arrays and functions |
| 2. Strings and Character Arrays | The null terminator, reading and printing text, `<string.h>`, `<ctype.h>`, writing your own string functions | Lesson 1 |
| 3. Pointers | Addresses, `&` and `*`, pointer parameters, pointer arithmetic, how arrays and pointers relate | Lessons 1 and 2 |
| 4. Structures | `struct`, members, arrays of structures, `typedef`, nested structures, the arrow operator | Lessons 1 to 3 |
| 5. File Handling | Streams and `FILE *`, `fopen` modes, `fprintf`/`fscanf`, `fgetc`/`fputc`, `fgets`/`fputs` | Lessons 2 to 4 |
| 6. Recursion | Base and recursive cases, the call stack, classic recursive functions, recursion versus loops | CP1 functions |
| 7. Searching and Sorting | Linear and binary search, bubble, selection and insertion sort, sorting structures, Big-O | Lessons 1, 4 and 6 |

Take them in order. Each lesson assumes the ones before it: strings are character arrays, pointers explain why arrays and strings behave the way they do, structures and files use all three, and Lesson 7 sorts arrays of structures and searches recursively.

## Where Each Topic Lives

Every lesson follows the same shape: the notes, then Key Takeaways, then Try It (a program you can run), Practice Exercises, Worked Exam Solutions + How-to-Pass Tips, and a Code Lab.

**Lesson 1: Arrays in Depth** (`Computer_Programming_2_units_1-3.md`)

- Arrays Recap: What Carries Over from CP1
- Passing Arrays to Functions
- Linear Search
- Common Array Algorithms
- Two-Dimensional Arrays
- 2-D Arrays and Functions: Matrix Operations

**Lesson 2: Strings and Character Arrays** (`Computer_Programming_2_units_1-3.md`)

- Strings in C: Character Arrays with a Null Terminator
- Reading and Printing Strings
- The <string.h> Toolkit
- Character Handling with <ctype.h>
- Writing Your Own String Functions
- Common String Bugs and How to Avoid Them

**Lesson 3: Pointers** (`Computer_Programming_2_units_1-3.md`)

- Memory Addresses and the & Operator
- Pointer Variables and the * Operator
- Pointers as Function Parameters
- Pointer Arithmetic
- Pointers and Arrays
- Common Pointer Mistakes

**Lesson 4: Structures** (`Computer_Programming_2_units_4-5.md`)

- What Is a Structure?
- Declaring Structures and Accessing Members
- Arrays of Structures
- typedef and Nested Structures
- Structures and Functions
- Pointers to Structures: The Arrow Operator

**Lesson 5: File Handling** (`Computer_Programming_2_units_4-5.md`)

- Why Files? Streams and the FILE Pointer
- Opening and Closing Files
- Formatted File I/O: fprintf() and fscanf()
- Character I/O: fgetc(), fputc(), and EOF
- Line I/O: fgets() and fputs()
- Putting It Together: A Small Records Program

**Lesson 6: Recursion** (`Computer_Programming_2_units_6-7.md`)

- What Is Recursion?
- Base Case and Recursive Case: Factorial
- Tracing the Call Stack
- Classic Recursive Functions
- Recursion vs. Iteration

**Lesson 7: Searching and Sorting** (`Computer_Programming_2_units_6-7.md`)

- Linear Search
- Binary Search
- Bubble Sort
- Selection Sort and Insertion Sort
- Sorting an Array of Structs by a Field
- Comparing the Algorithms: Big-O in Plain Words

