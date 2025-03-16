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

---

# Key Takeaways, All Lessons

The same summaries that close each lesson, in one place for review the night before an exam.

## Lesson 1: Arrays in Depth

- Passing an array to a function passes the address of its first element, not a copy, so the function can change the caller's array. Call it with the name alone, `f(scores, n)`, and mark read-only parameters `const`.
- Always pass the number of elements as its own parameter: inside the function, `sizeof` sees an address, not the whole array.
- Linear search checks each element from first to last and returns the index of the first match, or `-1` when the key is missing. It needs up to `n` comparisons and works on unsorted arrays.
- For the largest value, keep its position and start from the first element. `>` keeps the first maximum and `>=` keeps the last; reversing in place swaps `a[i]` with `a[n - 1 - i]` for only `n / 2` passes.
- A 2-D array `t[ROWS][COLS]` is stored row by row, so `t[r][c]` sits at position `r × COLS + c`. A function parameter may leave out the rows but must state the columns: `int m[][COLS]`.

## Lesson 2: Strings and Character Arrays

- A string is a `char` array that ends with `'\0'`. A string of n characters needs at least n + 1 slots, and `'A'` (one character) is not `"A"` (two: `'A'` and `'\0'`).
- `strlen` counts the characters before the `'\0'`; `sizeof` gives the whole array's size. Walk any string with `for (i = 0; s[i] != '\0'; i++)`.
- `scanf("%19s", name)` reads one word with no `&`; `fgets(name, sizeof name, stdin)` reads a whole line and keeps the newline, which `name[strcspn(name, "\n")] = '\0';` removes. Never use `gets`.
- Copy with `strcpy`, join with `strcat` (or `snprintf`), and compare with `strcmp(a, b) == 0`. Never `=` or `==`, and always check that the destination has room for the text plus `'\0'`.
- Characters are small integers: `<ctype.h>` tests them (`isalpha`, `isdigit`, `isspace`) and converts them (`toupper`, `tolower`), and `c - '0'` turns a digit character into its value.

## Lesson 3: Pointers

- `&x` gives the address of `x`. A pointer is a variable that holds an address: `int *p = &x;` makes `p` point to `x`, and `%p` with a `(void *)` cast prints it.
- In a declaration `*` means "is a pointer"; in an expression `*p` means "the value at that address". `*p = 25;` changes `x` without naming it. Initialize every pointer to a real address or `NULL`, and never follow a `NULL` or uninitialized pointer.
- To let a function change the caller's variables, or give back more than one result, pass addresses (`swap(&x, &y)`) and work through `*` inside the function.
- Adding 1 to a pointer moves it one element, not one byte. `q - p` counts the elements between them, and pointer arithmetic is only valid inside one array.
- An array name is the address of its first element, so `a[i]` is `*(a + i)` and an array parameter is really a pointer. But an array name cannot be moved or reassigned, and `sizeof` only sees the whole array where it is declared.

## Lesson 4: Structures

- A **structure** groups related variables, which may have different types, under one name. Each variable inside it is a **member**.
- A `struct` definition is only a template and must end with `;`. Memory is set aside only when you declare a variable of that type.
- Use the dot with a structure variable (`s.gwa`) and the arrow with a pointer to one (`p->gwa`, which means `(*p).gwa`). Nested members take one dot per level: `s.birthday.year`.
- You can copy a whole structure with `=`, but you cannot compare two with `==`, and a string member needs `strcpy`, not `=`.
- Passing a structure to a function passes a copy. Pass its address (`&s`) when the function must change it, and use `typedef` to give the type a shorter name.

## Lesson 5: File Handling

- Data in variables disappears when the program ends; a file keeps it. C reaches a file through a stream, held in a `FILE *` pointer.
- `fopen(name, mode)` opens a file: `"r"` reads, `"w"` creates or **erases**, `"a"` adds to the end. Always check the pointer for `NULL`, and `fclose` every file you open.
- `fprintf` and `fscanf` work like `printf` and `scanf` with a `FILE *` first. `fscanf` returns how many items it read, so loop with `while (fscanf(...) == 2)`, not `while (!feof(fp))`.
- `fgetc` returns an `int`, so store it in an `int` and compare it with `EOF`; `fputc` writes one character.
- `fgets(buf, size, fp)` reads one line, keeps the `'\n'`, and returns `NULL` at the end of the file. `fputs` writes a string without adding a newline.

## Lesson 6: Recursion

- A **recursive** function calls itself. It needs a **base case** that answers without recursing, and a **recursive case** that calls itself on a smaller input.
- Every recursive call must move toward the base case. If it can skip past it or never reach it, the calls never end.
- Each call gets its own **stack frame** with its own copy of the parameters. Calls wind down until the base case, then the answers unwind back up in reverse order.
- Code before the recursive call runs on the way down (`down(3)` prints `3 2 1`); code after it runs on the way back up (`up(3)` prints `1 2 3`).
- Too many calls at once cause a **stack overflow**. Use recursion when the problem shrinks naturally or splits in half; use a loop when a loop is simpler or the depth could be large.

## Lesson 7: Searching and Sorting

- **Linear search** checks elements one by one and works on any array: up to n comparisons. **Binary search** halves the range each step, so it needs only about 20 comparisons for a million elements, but the array **must be sorted**.
- **Bubble sort** swaps neighbors that are out of order; each pass moves the largest remaining value to the end, and a `swapped` flag lets it stop early on sorted data.
- **Selection sort** finds the smallest value in the unsorted part and swaps it to the front: at most one swap per pass. **Insertion sort** shifts bigger values right and drops each key into place, which makes it fast on nearly sorted data.
- To sort structs, compare **one field** (use `strcmp()` for strings) but swap the **whole struct** with a temporary struct variable.
- Big-O describes how work grows with n: O(log n) barely grows, O(n) doubles when n doubles, and O(n²), the class of all three sorts here, quadruples.

---

# Preparing for Exams

| Exam | Lessons covered | Focus |
|---|---|---|
| Prelim | 1 to 3 | Arrays and functions, 2-D arrays, strings and `<string.h>`, pointers and pointer arithmetic |
| Final | 4 to 7, plus review of 1 to 3 | Structures, files, recursion, searching and sorting, and the earlier lessons as they are used there |

Both exams lean on the same four skills, so practice each one for every lesson:

1. **Rules and syntax.** Declarations, what compiles and what does not, which function does what.
2. **Output tracing.** Running loops, pointer moves, recursive calls and sort passes by hand, one line at a time.
3. **Finding errors.** Missing `'\0'`, `==` on strings, uninitialized pointers, a missing `;` after a `struct`, a skippable base case.
4. **Short programs.** Small functions that take an array or a structure and return an answer.

A study order that works:

1. Read a lesson's notes and its Key Takeaways.
2. Run its Try It program and change it until the output stops surprising you.
3. Answer its Practice Exercises on paper, then check them against the Worked Exam Solutions.
4. Finish its Code Lab without looking at the solution.
5. A week before the exam, take the mock exams in the Exam Prep module under time pressure and review every item you missed.
