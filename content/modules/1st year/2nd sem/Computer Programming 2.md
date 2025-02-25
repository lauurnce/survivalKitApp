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

