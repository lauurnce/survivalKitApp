-- ============================================================
-- Computer Programming 2, Exam Prep: Prelims & Finals
-- Subject ID: 10000000-0001-0002-0001-000000000001
-- Module ID:  a3000001-0001-0002-0001-0000000000e1
-- Purpose: exam-prep module for Lessons 1-7: prelim (Lessons 1-3) and
--          final (Lessons 4-7 plus review) blueprints, a free practice
--          set, two mock exams per term with full answer keys, and the
--          common traps with a runnable program.
-- Idempotent: every row is upserted by its fixed id (the production
--             ids), so a re-run changes nothing and deletes nothing.
-- Run after the lesson seeds. sort_order 99 keeps Exam Prep last.
-- ============================================================

insert into public.modules (id, subject_id, title, slug, sort_order)
values ('a3000001-0001-0002-0001-0000000000e1', '10000000-0001-0002-0001-000000000001', 'Exam Prep: Prelims & Finals', 'exam-prep-prelims-finals', 99)
on conflict (id) do update set
  title = excluded.title, slug = excluded.slug, sort_order = excluded.sort_order
where public.modules.subject_id = excluded.subject_id;

insert into public.sections (id, module_id, kind, heading, body_md, sort_order, ide_language, starter_code)
values ('015f9fa3-189a-4ea2-b241-d3a0df8914ea', 'a3000001-0001-0002-0001-0000000000e1', 'content', 'Prelim Exam Blueprint & Study Plan', $md$
This module preps you for both CP2 major exams. The **prelim** covers Lessons 1 to 3: **Arrays in Depth**, **Strings and Character Arrays**, and **Pointers**. The **final** covers Lessons 4 to 7 (Structures, File Handling, Recursion, Searching and Sorting) plus some cumulative review. This section and the two prelim mock exams below focus on Lessons 1 to 3.

### How a CP2 Prelim on Lessons 1 to 3 Is Usually Structured

Different professors shuffle the weights, but almost every CP2 prelim on arrays, strings, and pointers is built from the same four parts:

| Part | Format | Typical Weight | What It Really Tests |
|---|---|---|---|
| I | Multiple choice / identification | 25-30% | Rules: array parameters, `strlen` vs `sizeof`, what `strcmp` returns, the two meanings of `*` |
| II | Output tracing | 30-35% | Running loops over 1-D and 2-D arrays, string loops, and pointer arithmetic in your head |
| III | Find the error | 15-20% | Strings compared with `==`, a missing `'\0'`, an uninitialized pointer, `int m[][]` in a parameter |
| IV | Short programming | 20-25% | Writing a small function from memory: a search, a string function, a function with pointer parameters |

Tracing plus programming is usually more than half the exam. You cannot pass by memorizing definitions alone: you have to practice running code on paper and writing small functions without notes.

### Your Exact Memorize List

If you can do all ten of these cold, you are ready:

1. **Passing an array passes its address.** Call with the name alone, `f(scores, n)`, and the function can change the caller's array. Mark read-only parameters `const`.
2. **Always pass the size.** Inside the function, `sizeof a` gives the size of an address, not the array. `sizeof a / sizeof a[0]` only works where the array is declared.
3. **Linear search** returns the index of the first match, or `-1`. The `return -1` goes **after** the loop. Up to `n` comparisons, and the array does not need to be sorted.
4. **Max/min patterns:** keep the position, start from the first element. `>` keeps the first maximum, `>=` keeps the last. Reverse in place swaps `a[i]` with `a[n - 1 - i]` for only `n / 2` passes.
5. **2-D arrays are stored row by row:** `t[r][c]` sits at position `r × COLS + c`. A parameter may leave out the rows but must state the columns: `int m[][COLS]`.
6. **A string is a `char` array ending in `'\0'`.** n characters need n + 1 slots. `strlen` counts the characters before `'\0'`; `sizeof` gives the whole array.
7. **Never `=` or `==` on strings.** Copy with `strcpy`, join with `strcat`, compare with `strcmp(a, b) == 0`. `strcmp` returns 0 for equal, negative if the first comes first, positive if it comes second.
8. **`'7' - '0'` is the number 7**, and `value = value * 10 + (c - '0')` builds a number from digit characters. `<ctype.h>` tests (`isdigit`, `isalpha`, `isupper`...) return non-zero for true.
9. **Pointers:** `&x` is the address of `x`, `int *p = &x;` makes `p` point to `x`, and `*p = 25;` changes `x`. Pass addresses (`swap(&x, &y)`) to let a function change the caller's variables or return more than one result.
10. **Pointer arithmetic and arrays:** `p + 1` moves one element, not one byte. `a[i]` is exactly `*(a + i)`, and `q - p` counts the elements between two pointers. An array name cannot be moved (`a++` does not compile).

### Top Mistakes That Cost Points

- Writing `return -1;` in an `else` inside the search loop, so only `a[0]` is ever checked.
- Calling `print_array(scores[], n)` or `print_array(scores[4], n)` instead of `print_array(scores, n)`.
- Resetting a row or column total **outside** the outer loop, so every total includes the ones before it.
- Forgetting the `'\0'` when you copy or build a string one character at a time.
- Testing `if (strcmp(a, b))` for "same text". That is true when the strings are **different**.
- Mixing up `*p + 1` (the value plus one) with `*(p + 1)` (the next element), and `*p++` (read, then move `p`) with `(*p)++` (add one to the value).
- Writing through a pointer that was never given an address, or returning the address of a local variable.

### Realistic 7-Day Study Plan

Each day names the exact lesson sections to read. Around 45 to 60 minutes a day is enough.

| Day | Study These Sections | What To Actually Do |
|---|---|---|
| 1 | Lesson 1: Arrays in Depth → Arrays Recap: What Carries Over from CP1, Passing Arrays to Functions | Write `print_array` and `add_bonus` from memory. Explain in one sentence why `sizeof` fails inside a function. |
| 2 | Lesson 1: Arrays in Depth → Linear Search, Common Array Algorithms | Write `linear_search` and `count_matches` from memory. Trace the max-position loop once with `>` and once with `>=` on an array with a repeated maximum. |
| 3 | Lesson 1: Arrays in Depth → Two-Dimensional Arrays, 2-D Arrays and Functions: Matrix Operations | Compute row totals, column totals, both diagonals, and a transpose by hand. Work out `r × COLS + c` for five cells. |
| 4 | Lesson 2: Strings and Character Arrays → Strings in C: Character Arrays with a Null Terminator, Reading and Printing Strings, The `<string.h>` Toolkit | Draw the memory picture of three strings including `'\0'`. Predict `strlen`, `sizeof`, and three `strcmp` signs before running them. |
| 5 | Lesson 2: Strings and Character Arrays → Character Handling with `<ctype.h>`, Writing Your Own String Functions, Common String Bugs and How to Avoid Them | Write `my_strlen`, `my_strcpy`, and `reverse` without looking. Find all seven string bugs in the bugs section without reading the fixes first. |
| 6 | Lesson 3: Pointers → Memory Addresses and the & Operator, Pointer Variables and the * Operator, Pointers as Function Parameters | Draw boxes and arrows for `x`, `p`, and `*p`. Write `swap` and `min_max` from memory and explain why `swap_copy` fails. |
| 7 | Lesson 3: Pointers → Pointer Arithmetic, Pointers and Arrays, Common Pointer Mistakes | Trace the `*p + 1`, `*(p + 1)`, `*p++`, `(*p)++` program by hand. Then take the **Free Practice Set** below: 30 minutes, no notes. |

After Day 7, take **Prelim Mock Exam A** under exam conditions, check it with the answer key, re-read the sections behind every miss, then take **Prelim Mock Exam B** a day or two later.

### How to Use This Module

- **Free Practice Set (next section):** 15 items sampling all seven lessons. Use it as a diagnostic: the answer key tells you which lesson each item came from.
- **Prelim Mock Exams A and B:** 25 items each, Lessons 1 to 3 only, in the same four parts as the table above. Do them on paper, timed, before opening the key.
- **Answer Key with Explanations:** every answer with a one-line reason, a trace table for the tricky tracing items, and a complete, tested program for every programming item. When you miss an item, find the exact line where your trace went wrong.
- **Traps and final exam sections:** after the prelim mocks, the rest of the module covers the common traps and the final exam on Lessons 4 to 7.
$md$, 1, null, null)
on conflict (id) do update set
  kind = excluded.kind, heading = excluded.heading, body_md = excluded.body_md,
  sort_order = excluded.sort_order, ide_language = excluded.ide_language, starter_code = excluded.starter_code
where public.sections.module_id = excluded.module_id;

insert into public.sections (id, module_id, kind, heading, body_md, sort_order, ide_language, starter_code)
values ('09ee8ff2-b245-49fc-a26d-7376818d2000', 'a3000001-0001-0002-0001-0000000000e1', 'content', 'Free Practice Set, 15 Items with Answer Key', $md$
Fifteen genuine exam-style items sampling all seven lessons, about two per lesson. Do all fifteen before looking at the key, and treat it like the real thing: 30 minutes, no notes. The key tells you which lesson each item came from, so every miss points you to the lesson to review.

### Part I, Multiple Choice (Items 1-4)

**1.** Given `int scores[10];` and the function `void show(const int a[], int n);`, which call is correct?

- A. `show(scores[10], 10);`
- B. `show(scores[], 10);`
- C. `show(scores, 10);`
- D. `show(&scores[], 10);`

**2.** Given `int x = 5;` and `int *p = &x;`, which statement changes `x` to 9?

- A. `p = 9;`
- B. `*p = 9;`
- C. `&x = 9;`
- D. `p* = 9;`

**3.** Given the declarations below, which statement correctly sets the GWA **through `ps`**?

```c
typedef struct {
    char name[30];
    double gwa;
} Student;

Student s;
Student *ps = &s;
```

- A. `ps.gwa = 1.25;`
- B. `ps->gwa = 1.25;`
- C. `*ps.gwa = 1.25;`
- D. `ps->gwa == 1.25;`

**4.** Which `fopen` mode **erases** the file if it already exists?

- A. `"r"`
- B. `"a"`
- C. `"w"`
- D. All three

### Part II, Output Tracing (Items 5-9)

Write exactly what each fragment prints.

**5.**
```c
int a[6] = {4, 9, 2, 9, 5, 1};
int i, pos = 0;
for (i = 1; i < 6; i++)
    if (a[i] >= a[pos])
        pos = i;
printf("%d %d", a[pos], pos);
```

**6.**
```c
char s[20] = "Davao";
printf("%d %d", (int)strlen(s), (int)sizeof s);
```

**7.**
```c
int a[4] = {2, 4, 6, 8};
int *p = a;
p += 2;
*p = *p * 3;
printf("%d %d", *p, *(p - 1));
```

**8.**
```c
int f(int n) {
    if (n <= 1)
        return 1;
    return n + f(n - 2);
}

/* in main: */
printf("%d", f(7));
```

**9.** Bubble sort, ascending. One pass compares `a[0]` with `a[1]`, then `a[1]` with `a[2]`, and so on to the last pair, swapping whenever the left value is bigger. The array is `{7, 3, 9, 2, 5}`. Write the array **after pass 1** and the number of swaps made.

### Part III, Find the Error (Items 10-13)

For each one, say what is wrong and write the fix.

**10.** The user's name really is `"Ana"`, but the program prints `Who are you?`.

```c
char name[20] = "Ana";
if (name == "Ana")
    printf("Welcome, Ana!\n");
else
    printf("Who are you?\n");
```

**11.** Using the `Student` type from Item 3:

```c
Student s;
s.name = "Liza";
```

**12.** This function is supposed to return 1 + 2 + ... + n.

```c
int sumTo(int n) {
    return n + sumTo(n - 1);
}
```

**13.** This loop is supposed to print a text file one character at a time. `fp` was opened correctly.

```c
char ch;
while ((ch = fgetc(fp)) != EOF)
    putchar(ch);
```

### Part IV, Identification (Items 14-15)

**14.** Binary search for the key `31` in the sorted array `{4, 9, 13, 18, 25, 31, 40}`, using `low = 0`, `high = 6` and `mid = low + (high - low) / 2`. List every index that becomes `mid`, in order, and give the value the search returns.

**15.** Given `int t[4][5];`, counting from 0, at what position in memory is `t[2][3]` stored?

---

### Answer Key

| # | Answer | Lesson | One-Line Why |
|---|---|---|---|
| 1 | C | 1 | Pass an array by its name alone: no brackets and no `&` in the call. |
| 2 | B | 3 | `*p` follows the pointer to `x`, so `*p = 9` stores 9 in `x`. `p = 9` would try to store 9 as an address. |
| 3 | B | 4 | Use the arrow with a pointer to a structure. `*ps.gwa` fails because `.` binds tighter than `*`; the long form is `(*ps).gwa`. |
| 4 | C | 5 | `"w"` creates the file or erases an existing one. `"r"` only reads and `"a"` adds to the end. |
| 5 | `9 3` | 1 | `>=` keeps the **last** maximum: 9 appears at index 1 and index 3, so `pos` ends at 3. With `>` the answer would be `9 1`. |
| 6 | `5 20` | 2 | `strlen` counts the 5 letters before `'\0'`; `sizeof` is the whole 20-slot array. |
| 7 | `18 4` | 3 | `p += 2` moves `p` to `a[2]` (6), which becomes 6 × 3 = 18. `*(p - 1)` is `a[1]`, which is 4. |
| 8 | `16` | 6 | f(7) = 7 + f(5) = 7 + 5 + f(3) = 7 + 5 + 3 + f(1) = 7 + 5 + 3 + 1 = 16. |
| 9 | `3 7 2 5 9`, 3 swaps | 7 | Swap 7 and 3; 7 and 9 stay; swap 9 and 2; swap 9 and 5. The largest value, 9, ends up last. |
| 10 | Use `strcmp(name, "Ana") == 0` | 2 | `==` compares two addresses, which are never equal, so it is always false even when the text matches. |
| 11 | Use `strcpy(s.name, "Liza");` | 4 | `name` is a `char` array, and an array cannot be assigned with `=` (compile error). |
| 12 | Add a base case: `if (n == 0) return 0;` | 6 | With no base case the calls never stop, and the program crashes with a stack overflow. |
| 13 | Declare `int ch;` | 5 | `fgetc` returns an `int` so `EOF` can be told apart from every real character. In a `char`, the loop can stop early on a real character or never stop at all, depending on the compiler. |
| 14 | `mid` = 3, then 5; returns `5` | 7 | Step 1: `a[3]` is 18 < 31, so `low = 4`. Step 2: mid = 4 + (6 - 4) / 2 = 5, and `a[5]` is 31: found. |
| 15 | 13 | 1 | Row-major order: position = r × COLS + c = 2 × 5 + 3 = 13. |

Scored 12 or better? You are on track. Below that, note which lessons your misses came from and re-read those lessons first. The full mock exams below (two for the prelim, two for the final, each with a complete answer key, trace tables and tested solutions) come with the subject unlock.
$md$, 2, null, null)
on conflict (id) do update set
  kind = excluded.kind, heading = excluded.heading, body_md = excluded.body_md,
  sort_order = excluded.sort_order, ide_language = excluded.ide_language, starter_code = excluded.starter_code
where public.sections.module_id = excluded.module_id;

insert into public.sections (id, module_id, kind, heading, body_md, sort_order, ide_language, starter_code)
values ('14cc02a9-0d4a-47ab-857e-b1ba37c54faa', 'a3000001-0001-0002-0001-0000000000e1', 'activity', 'Prelim Mock Exam A, 25 Items', $md$
Simulate the real thing: 60 minutes, no notes, answers on paper. This exam covers Lessons 1 to 3 (Arrays in Depth, Strings and Character Arrays, Pointers). The full answer key with trace tables and worked solutions is two sections down: do not open it until you finish.

Assume every fragment sits inside `main()` with `<stdio.h>`, `<string.h>` and `<ctype.h>` included, and that an `int` is 4 bytes.

### Part I, Multiple Choice (Items 1-8)

**1.** In `void add_bonus(int a[], int n, int bonus)`, what does the function actually receive for `a` when you call `add_bonus(scores, 4, 5)`?

- A. A copy of the whole array
- B. The address of the first element of `scores`
- C. The value of `scores[0]`
- D. The number of elements in `scores`

**2.** Inside a function whose parameter is `int a[]`, the expression `sizeof a` gives:

- A. The size of the whole array in bytes
- B. The number of elements
- C. The size of an address (a pointer)
- D. Zero

**3.** A linear search runs on a 50-element array, and the key is **not** in the array. How many comparisons with the key does it make?

- A. 1
- B. 25
- C. 49
- D. 50

**4.** Which is a valid prototype for a function that receives a 2-D `int` array with 4 columns?

- A. `void f(int m[][], int rows);`
- B. `void f(int m[][4], int rows);`
- C. `void f(int m[4][], int rows);`
- D. `void f(int m, int rows);`

**5.** How many elements does `char code[] = "IT-101";` have?

- A. 5
- B. 6
- C. 7
- D. It depends on the compiler

**6.** The result of `strcmp("Cruz", "cruz")` is:

- A. 0
- B. A negative number
- C. A positive number
- D. A compile error

**7.** Given `int x = 4;` and `int *p = &x;`, which expression has the value 4?

- A. `p`
- B. `&p`
- C. `*p`
- D. `&x`

**8.** For `int a[5];`, which expression means exactly the same as `a[3]`?

- A. `*a + 3`
- B. `*(a + 3)`
- C. `&a + 3`
- D. `a + 3`

### Part II, Output Tracing (Items 9-17)

Write exactly what each fragment prints.

**9.**
```c
void double_odd(int a[], int n) {
    int i;
    for (i = 0; i < n; i++)
        if (a[i] % 2 != 0)
            a[i] *= 2;
}

/* in main: */
int v[5] = {3, 4, 7, 10, 1};
int i;
double_odd(v, 5);
for (i = 0; i < 5; i++)
    printf("%d ", v[i]);
```

**10.**
```c
#define N 5
int a[N] = {10, 20, 30, 40, 50};
int i, temp;
for (i = 0; i < N / 2; i++) {
    temp = a[i];
    a[i] = a[N - 1 - i];
    a[N - 1 - i] = temp;
}
printf("%d %d %d", a[0], a[1], a[2]);
```

**11.**
```c
int t[3][3] = { {1, 2, 3}, {4, 5, 6}, {7, 8, 9} };
int r, c, total;
for (c = 0; c < 3; c += 2) {
    total = 0;
    for (r = 0; r < 3; r++)
        total += t[r][c];
    printf("%d ", total);
}
```

**12.**
```c
int m[3][3] = { {4, 1, 7}, {2, 6, 3}, {8, 5, 9} };
int i, main_diag = 0, other_diag = 0;
for (i = 0; i < 3; i++) {
    main_diag += m[i][i];
    other_diag += m[i][3 - 1 - i];
}
printf("%d %d", main_diag, other_diag);
```

**13.**
```c
char s[] = "Bulacan";
int i, count = 0;
for (i = 0; s[i] != '\0'; i++)
    if (s[i] == 'a' || s[i] == 'A')
        count++;
printf("%d %d", count, i);
```

**14.**
```c
char full[30];
strcpy(full, "Lapu");
strcat(full, "-");
strcat(full, "Lapu");
printf("%s %d", full, (int)strlen(full));
```

**15.**
```c
char t[] = "A1b2C3";
int i, sum = 0;
for (i = 0; t[i] != '\0'; i++) {
    if (isdigit(t[i]))
        sum += t[i] - '0';
    else
        t[i] = tolower(t[i]);
}
printf("%s %d", t, sum);
```

**16.**
```c
int a[5] = {5, 10, 15, 20, 25};
int *p = a + 1;
int *q = &a[4];
printf("%d %d %d", *p, (int)(q - p), *(q - 2));
```

**17.**
```c
void update(int *p, int n) {
    *p = *p * 2;
    n = n * 2;
}

/* in main: */
int a = 5, b = 5;
update(&a, b);
printf("%d %d", a, b);
```

### Part III, Find the Error (Items 18-21)

For each one, explain what goes wrong and write the fix.

**18.** This search is supposed to return the index of `key`, or `-1` if it is missing. Searching `{1042, 2210, 1873, 3301, 1500}` for `3301` returns `-1`.

```c
int find(const int a[], int n, int key) {
    int i;
    for (i = 0; i < n; i++) {
        if (a[i] == key)
            return i;
        else
            return -1;
    }
    return -1;
}
```

**19.**
```c
char section[10];
section = "BSIT-1A";
printf("%s\n", section);
```

**20.** This function is supposed to work like `strcpy`.

```c
void copy(char dest[], const char src[]) {
    int i = 0;
    while (src[i] != '\0') {
        dest[i] = src[i];
        i++;
    }
}
```

**21.**
```c
int *p;
*p = 50;
printf("%d\n", *p);
```

### Part IV, Short Programming (Items 22-25)

Write each function. You do not need to write `main()` unless the item asks for it.

**22.** Write `int count_above(const int a[], int n, int limit)` that returns how many elements of `a` are **greater than** `limit`.

**23.** Without using `<string.h>`, write `int count_vowels(const char s[])` that returns how many vowels (`a`, `e`, `i`, `o`, `u`, in uppercase or lowercase) are in `s`. You may use `<ctype.h>`.

**24.** Write `void sum_avg(const int a[], int n, int *sum, double *avg)` that gives back both the sum and the average of the `n` elements through the two pointer parameters. Then show the call in `main()` for `int allowance[5] = {150, 200, 120, 180, 100};`.

**25.** With `#define QUIZZES 4`, write `void row_totals(int m[][QUIZZES], int rows, int totals[])` that stores the total of each row of `m` in `totals`, so `totals[0]` is the total of row 0, and so on.
$md$, 3, null, null)
on conflict (id) do update set
  kind = excluded.kind, heading = excluded.heading, body_md = excluded.body_md,
  sort_order = excluded.sort_order, ide_language = excluded.ide_language, starter_code = excluded.starter_code
where public.sections.module_id = excluded.module_id;

insert into public.sections (id, module_id, kind, heading, body_md, sort_order, ide_language, starter_code)
values ('c56ae624-54a4-47cc-927d-249557e659c9', 'a3000001-0001-0002-0001-0000000000e1', 'activity', 'Prelim Mock Exam B, 25 Items', $md$
All-new items, a step harder than Exam A, with more of the details professors love for the last page of a prelim: the found-flag off-by-one, `snprintf` cutting text short, and `*p++` next to `(*p)++`. Same rules: 60 minutes, no notes, Lessons 1 to 3 only.

Assume every fragment sits inside `main()` with `<stdio.h>`, `<string.h>` and `<ctype.h>` included, and that an `int` is 4 bytes.

### Part I, Multiple Choice (Items 1-7)

**1.** Inside `main()`, after `int quiz[] = {18, 15, 20, 12, 17, 19, 16};`, the value of `sizeof quiz / sizeof quiz[0]` is:

- A. 4
- B. 7
- C. 8
- D. 28

**2.** A function parameter is written `const int a[]`. This means:

- A. The array cannot be passed to the function
- B. The function may only read the elements; writing `a[i] = 0;` inside it will not compile
- C. The function receives its own copy of the array
- D. The array must be exactly 10 elements long

**3.** After `int t[][3] = { {1, 2, 3}, {4, 5, 6}, {7} };`, the value of `t[2][1]` is:

- A. 7
- B. 0
- C. Garbage (unpredictable)
- D. Compile error, the number of rows is missing

**4.** Given `int t[5][4];`, counting from 0, at what position in memory is `t[3][2]` stored?

- A. 11
- B. 14
- C. 17
- D. 20

**5.** After `char s[25] = "Tagum City";`, what are `strlen(s)` and `sizeof s`?

- A. 10 and 25
- B. 11 and 25
- C. 10 and 11
- D. 25 and 25

**6.** Given `char name[20];`, which statement about `scanf("%19s", name);` is TRUE?

- A. It needs `&name` to work
- B. It reads a whole line, spaces included
- C. It stops at the first space and stores at most 19 characters
- D. It keeps the newline from the Enter key

**7.** Given `int a[4] = {1, 2, 3, 4};` and `int *p = a;`, which statement does **not** compile?

- A. `p++;`
- B. `a++;`
- C. `p = a + 2;`
- D. `*(a + 1) = 5;`

### Part II, Output Tracing (Items 8-17)

Write exactly what each fragment prints.

**8.**
```c
int g[8] = {72, 85, 90, 64, 78, 99, 70, 81};
int keep[8];
int i, k = 0;
for (i = 0; i < 8; i++)
    if (g[i] >= 80)
        keep[k++] = g[i];
printf("%d %d %d", k, keep[0], keep[k - 1]);
```

**9.**
```c
int a[6] = {14, 7, 22, 7, 30, 5};
int i, found = 0, key = 7;
for (i = 0; i < 6 && !found; i++)
    if (a[i] == key)
        found = 1;
printf("%d %d", found, i);
```

**10.**
```c
int a[2][3] = { {1, 2, 3}, {4, 5, 6} };
int t[3][2];
int r, c;
for (r = 0; r < 2; r++)
    for (c = 0; c < 3; c++)
        t[c][r] = a[r][c];
printf("%d %d %d", t[0][1], t[2][0], t[1][1]);
```

**11.**
```c
int max_pos(const int a[], int n) {
    int i, pos = 0;
    for (i = 1; i < n; i++)
        if (a[i] > a[pos])
            pos = i;
    return pos;
}

/* in main: */
int v[6] = {3, 12, 5, 12, 8, 1};
int p = max_pos(v, 6);
v[p] = 0;
printf("%d %d", p, max_pos(v, 6));
```

**12.**
```c
char a[] = "Santos", b[] = "Santiago";
int r = strcmp(a, b);
if (r == 0)
    printf("same");
else if (r < 0)
    printf("%s first", a);
else
    printf("%s first", b);
```

**13.**
```c
char code[] = "CCS-2026";
int i, value = 0;
for (i = 0; code[i] != '\0'; i++)
    if (isdigit(code[i]))
        value = value * 10 + (code[i] - '0');
printf("%d", value / 2);
```

**14.**
```c
char tag[8];
snprintf(tag, sizeof tag, "%s-%d", "BSIT", 2026);
printf("%s %d", tag, (int)strlen(tag));
```

**15.**
```c
int a[4] = {3, 6, 9, 12};
int *p = a;
int x, y;
x = *p++;
(*p)++;
y = *(p + 1) + 1;
printf("%d %d %d %d", x, *p, y, a[1]);
```

**16.**
```c
char s[] = "PALAWAN";
char *p = strchr(s, 'W');
printf("%s %d", p, (int)(p - s));
```

**17.**
```c
void split(int total, int *hundreds, int *rest) {
    *hundreds = total / 100;
    *rest = total % 100;
}

/* in main: */
int h, r;
split(1275, &h, &r);
printf("%d %d", h, r);
```

### Part III, Find the Error (Items 18-21)

For each one, explain what goes wrong and write the fix.

**18.**
```c
void show(int m[][], int rows) {
    int r, c;
    for (r = 0; r < rows; r++) {
        for (c = 0; c < 3; c++)
            printf("%d ", m[r][c]);
        printf("\n");
    }
}
```

**19.** This loop is supposed to reverse `int a[6] = {1, 2, 3, 4, 5, 6};` in place, but the array prints as `1 2 3 4 5 6`, unchanged.

```c
for (i = 0; i < N; i++) {      /* N is 6 */
    temp = a[i];
    a[i] = a[N - 1 - i];
    a[N - 1 - i] = temp;
}
```

**20.** The user types `19`, presses Enter, and the program never waits for the name. It prints `Name: ` and then ` is 19 years old` with an empty name.

```c
int age;
char name[40];

printf("Age: ");
scanf("%d", &age);
printf("Name: ");
if (fgets(name, sizeof name, stdin) != NULL) {
    name[strcspn(name, "\n")] = '\0';
    printf("%s is %d years old\n", name, age);
}
```

**21.**
```c
int *make_total(int a, int b) {
    int total = a + b;
    return &total;
}
```

### Part IV, Short Programming (Items 22-25)

Write each function. You do not need to write `main()`.

**22.** Write `int last_index_of(const int a[], int n, int key)` that returns the index of the **last** element equal to `key`, or `-1` if there is none. For `{1042, 2210, 1873, 3301, 2210, 1500}` and key `2210`, it returns 4.

**23.** Write `int is_palindrome(const char s[])` that returns 1 if `s` reads the same forwards and backwards, ignoring uppercase and lowercase, and 0 otherwise. `"Racecar"` and `"Anna"` give 1; `"Maria"` gives 0.

**24.** Write `void count_case(const char *s, int *upper, int *lower)` that walks the string **with the pointer `s`** (no index variable) and gives back the number of uppercase and lowercase letters through `upper` and `lower`.

**25.** With `#define COLS 4`, write `void col_max(int m[][COLS], int rows, int out[])` that stores the largest value of each column of `m` in `out`, so `out[0]` is the largest value in column 0, and so on.
$md$, 4, null, null)
on conflict (id) do update set
  kind = excluded.kind, heading = excluded.heading, body_md = excluded.body_md,
  sort_order = excluded.sort_order, ide_language = excluded.ide_language, starter_code = excluded.starter_code
where public.sections.module_id = excluded.module_id;

insert into public.sections (id, module_id, kind, heading, body_md, sort_order, ide_language, starter_code)
values ('3383e72a-94ef-4e41-9978-64384b13d586', 'a3000001-0001-0002-0001-0000000000e1', 'activity', 'Prelim Mock Exams, Answer Key with Explanations', $md$
Check your work item by item. For tracing items, follow the trace table row by row and find the exact line where your trace went wrong: that tells you which lesson section to re-read. Every programming solution below is a complete program that was compiled and run, and its output is shown underneath. Your function does not have to match line for line; it has to give the same results.

## Exam A

### Part I, Multiple Choice

| # | Answer | Why |
|---|---|---|
| 1 | B | Passing an array passes the address of its first element. No copy is made, which is why `add_bonus` can change `scores`. |
| 2 | C | An array parameter is really a pointer, so `sizeof a` is the size of an address (usually 8 bytes), not of the array. Pass the count instead. |
| 3 | D | When the key is missing, linear search must check every element: 50 comparisons, the worst case. |
| 4 | B | The rows may be left empty, but the columns must be stated: `int m[][4]`. C needs the column count to find where each row starts. |
| 5 | C | 6 characters (`I`, `T`, `-`, `1`, `0`, `1`) plus the `'\0'` the compiler adds: 7. |
| 6 | B | The first characters differ: `'C'` is 67 and `'c'` is 99. Every uppercase letter comes before every lowercase letter, so the result is negative. |
| 7 | C | `*p` follows the pointer to `x`, which holds 4. `p` and `&x` are addresses, and `&p` is the address of the pointer itself. |
| 8 | B | `a[i]` is exactly `*(a + i)`. Choice A is `a[0] + 3`, the value plus three. |

### Part II, Output Tracing

**9. Answer: `6 4 14 10 2`**, the function changes `main`'s array directly, because it received the array's address.

| i | v[i] before | odd? | v[i] after |
|---|---|---|---|
| 0 | 3 | yes | 6 |
| 1 | 4 | no | 4 |
| 2 | 7 | yes | 14 |
| 3 | 10 | no | 10 |
| 4 | 1 | yes | 2 |

**10. Answer: `50 40 30`**, reverse in place. `N / 2` is 2, so only two swaps happen and the middle element stays put.

| i | swaps | array after |
|---|---|---|
| 0 | a[0] and a[4] | 50 20 30 40 10 |
| 1 | a[1] and a[3] | 50 40 30 20 10 |

**11. Answer: `12 18`**, column totals, but `c += 2` visits only columns 0 and 2. Column 0: 1 + 4 + 7 = 12. Column 2: 3 + 6 + 9 = 18. `total = 0;` is inside the outer loop, so each column starts fresh.

**12. Answer: `19 21`**

| i | m[i][i] | m[i][2 - i] |
|---|---|---|
| 0 | 4 | 7 |
| 1 | 6 | 6 |
| 2 | 9 | 8 |
| sum | 19 | 21 |

**13. Answer: `2 7`**, B-u-l-a-c-a-n has two lowercase `'a'` characters (no uppercase `'A'`). The loop stops when `s[7]` is `'\0'`, so `i` ends at 7, the length of the string.

**14. Answer: `Lapu-Lapu 9`**, `strcpy` gives `"Lapu"`, the first `strcat` gives `"Lapu-"`, the second gives `"Lapu-Lapu"`. 4 + 1 + 4 = 9 characters; `strlen` does not count the `'\0'`.

**15. Answer: `a1b2c3 6`**

| i | t[i] | digit? | action | sum after |
|---|---|---|---|---|
| 0 | `A` | no | becomes `a` | 0 |
| 1 | `1` | yes | add 1 | 1 |
| 2 | `b` | no | stays `b` | 1 |
| 3 | `2` | yes | add 2 | 3 |
| 4 | `C` | no | becomes `c` | 3 |
| 5 | `3` | yes | add 3 | 6 |

`t[i] - '0'` turns the character `'3'` into the number 3. Without the `- '0'` you would add the character codes (49, 50, 51) instead.

**16. Answer: `10 3 15`**, `p` points at `a[1]` (10) and `q` at `a[4]`. `q - p` counts elements, not bytes: 4 - 1 = 3. `q - 2` points at `a[2]`, which holds 15.

**17. Answer: `10 5`**, `a` was passed by address, so `*p = *p * 2` doubles the real `a`. `b` was passed by value: `n` is only a copy, and doubling it does nothing to `b`.

### Part III, Find the Error

**18.** The `else` returns `-1` on the very first pass, so the function only ever checks `a[0]`. It finds `1042` (index 0) but nothing else. The `return -1` belongs **after** the loop, once every element has been checked:

```c
int find(const int a[], int n, int key) {
    int i;
    for (i = 0; i < n; i++)
        if (a[i] == key)
            return i;
    return -1;
}
```

**19.** Compile error: an array cannot be assigned with `=`. A string literal can only be given with `=` in the declaration. Fix: `strcpy(section, "BSIT-1A");` (7 characters plus `'\0'` fit in 10 slots), or declare it as `char section[10] = "BSIT-1A";`.

**20.** The loop stops **at** the `'\0'` without copying it, so `dest` is never terminated. Printing it runs past the copied letters into whatever is left in the array (garbage). Add the terminator after the loop:

```c
    dest[i] = '\0';     /* i is now the index where src had its '\0' */
```

**21.** `p` was never given an address, so it holds a garbage address, and `*p = 50` writes to a random place in memory: a crash, or silent damage to other data. (`-Wall` warns that `p` is uninitialized.) Make it point at a real variable first:

```c
int x;
int *p = &x;
*p = 50;
printf("%d\n", *p);
```

### Part IV, Short Programming

**22.** Counting with a condition, from Common Array Algorithms.

```c
#include <stdio.h>

int count_above(const int a[], int n, int limit) {
    int i, count = 0;
    for (i = 0; i < n; i++)
        if (a[i] > limit)
            count++;
    return count;
}

int main(void) {
    int scores[8] = {78, 92, 85, 60, 75, 99, 88, 74};

    printf("Above 80: %d\n", count_above(scores, 8, 80));
    printf("Above 75: %d\n", count_above(scores, 8, 75));
    return 0;
}
```

Output:
```
Above 80: 4
Above 75: 5
```

Grading points: the counter starts at 0, the test is `>` (not `>=`, because the item says "greater than"), the loop is `i < n`, and the parameter is `const` because the function only reads. Note that 75 is **not** counted for "above 75".

**23.** Walk the string until `'\0'`, and lower the case of each character once so you only test five letters.

```c
#include <stdio.h>
#include <ctype.h>

int count_vowels(const char s[]) {
    int i, count = 0;
    char c;
    for (i = 0; s[i] != '\0'; i++) {
        c = tolower(s[i]);
        if (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u')
            count++;
    }
    return count;
}

int main(void) {
    printf("%d\n", count_vowels("Ateneo de Manila"));
    printf("%d\n", count_vowels("BSIT"));
    return 0;
}
```

Output:
```
8
1
```

Grading points: the loop condition is `s[i] != '\0'` (no `strlen` needed), the comparisons use single quotes (`'a'`, not `"a"`), and uppercase vowels are counted too (the `A` in `"Ateneo"` and the `I` in `"BSIT"`).

**24.** Two results, so both come back through pointers, like `min_max` in Pointers as Function Parameters.

```c
#include <stdio.h>

void sum_avg(const int a[], int n, int *sum, double *avg) {
    int i;
    *sum = 0;
    for (i = 0; i < n; i++)
        *sum += a[i];
    *avg = (double)*sum / n;
}

int main(void) {
    int allowance[5] = {150, 200, 120, 180, 100};
    int total;
    double average;

    sum_avg(allowance, 5, &total, &average);
    printf("Total: PHP %d\n", total);
    printf("Average: PHP %.2f\n", average);
    return 0;
}
```

Output:
```
Total: PHP 750
Average: PHP 150.00
```

Grading points: `*sum = 0;` before the loop (the caller's `total` starts as garbage), every use of the results goes through `*`, the `(double)` cast avoids integer division, and the call passes `&total` and `&average` but the array name alone.

**25.** Nested loops: the outer loop picks a row, the inner loop walks across its columns. Reset the total for each row.

```c
#include <stdio.h>
#define QUIZZES 4

void row_totals(int m[][QUIZZES], int rows, int totals[]) {
    int r, c;
    for (r = 0; r < rows; r++) {
        totals[r] = 0;
        for (c = 0; c < QUIZZES; c++)
            totals[r] += m[r][c];
    }
}

int main(void) {
    int score[3][QUIZZES] = {
        {18, 15, 20, 17},
        {12, 19, 16, 14},
        {20, 20, 18, 19}
    };
    int totals[3];
    int r;

    row_totals(score, 3, totals);
    for (r = 0; r < 3; r++)
        printf("Student %d: %d\n", r + 1, totals[r]);
    return 0;
}
```

Output:
```
Student 1: 70
Student 2: 61
Student 3: 77
```

Grading points: the parameter states the column count (`int m[][QUIZZES]`), `totals[r] = 0;` sits inside the outer loop, and the function writes straight into the caller's `totals` array (a function cannot return an array).

**Passing bar:** 18/25. Below 15? Redo Days 1 to 6 of the study plan before attempting Exam B.

## Exam B

### Part I, Multiple Choice

| # | Answer | Why |
|---|---|---|
| 1 | B | `sizeof quiz` is 28 bytes and `sizeof quiz[0]` is 4, so 28 / 4 = 7 elements. This works because it is in the function where the array is declared. |
| 2 | B | `const` is a promise that the function only reads the array. The array is still passed by address, not copied. |
| 3 | B | Leaving out the rows is fine (the compiler counts 3). Row 2 has only `{7}`, so its missing values become 0: row 2 is `7 0 0`. |
| 4 | B | Row-major order: 3 × 4 + 2 = 14. |
| 5 | A | `strlen` counts the 10 characters (the space counts); `sizeof` is the whole 25-slot array. |
| 6 | C | `%s` stops at the first space, and the width 19 leaves room for the `'\0'` in a 20-slot array. No `&`: the array name is already an address. |
| 7 | B | An array name is not a variable and can never be moved. `p++` is fine because `p` is a pointer variable, and `*(a + 1) = 5` just sets `a[1]`. |

### Part II, Output Tracing

**8. Answer: `4 85 81`**, `k` moves only when a grade is stored.

| i | g[i] | g[i] >= 80? | stored | k after |
|---|---|---|---|---|
| 0 | 72 | no | | 0 |
| 1 | 85 | yes | keep[0] = 85 | 1 |
| 2 | 90 | yes | keep[1] = 90 | 2 |
| 3 | 64 | no | | 2 |
| 4 | 78 | no | | 2 |
| 5 | 99 | yes | keep[2] = 99 | 3 |
| 6 | 70 | no | | 3 |
| 7 | 81 | yes | keep[3] = 81 | 4 |

`keep[k - 1]` is `keep[3]`, the last grade stored.

**9. Answer: `1 2`**, the found-flag trap. The match is at index 1, but after setting `found = 1` the loop still runs `i++` before it tests the condition again, so `i` ends at 2. The match is at `i - 1`.

| i | a[i] | a[i] == 7? | found after | next test |
|---|---|---|---|---|
| 0 | 14 | no | 0 | i becomes 1, keep going |
| 1 | 7 | yes | 1 | i becomes 2, `!found` is false: stop |

**10. Answer: `4 3 5`**, the transpose rule `t[c][r] = a[r][c]` means `t[x][y]` is `a[y][x]`. So `t[0][1]` is `a[1][0]` = 4, `t[2][0]` is `a[0][2]` = 3, and `t[1][1]` is `a[1][1]` = 5.

**11. Answer: `1 3`**, `>` keeps the **first** maximum: 12 appears at index 1 and index 3, and the first call returns 1. Then `v[1] = 0` changes the array to `{3, 0, 5, 12, 8, 1}`, and the second call finds the remaining 12 at index 3.

**12. Answer: `Santiago first`**, `strcmp` compares character by character. `S`, `a`, `n`, `t` match; then `'o'` (111) meets `'i'` (105). `'o'` is bigger, so the result is positive: `"Santos"` comes **after** `"Santiago"`, and the `else` branch prints `b`.

**13. Answer: `1013`**, only the digits build the number, so `C`, `C` and `-` are skipped.

| character | value after |
|---|---|
| `2` | 0 × 10 + 2 = 2 |
| `0` | 2 × 10 + 0 = 20 |
| `2` | 20 × 10 + 2 = 202 |
| `6` | 202 × 10 + 6 = 2026 |

Then 2026 / 2 = 1013.

**14. Answer: `BSIT-20 7`**, the full text `"BSIT-2026"` needs 9 characters plus `'\0'`, but `tag` has only 8 slots. `snprintf` stores the first 7 characters and the `'\0'`, and touches nothing outside the array.

**15. Answer: `3 7 10 7`**

| Statement | p points at | Effect |
|---|---|---|
| `int *p = a;` | a[0] | |
| `x = *p++;` | a[1] | reads a[0] (3) into x, **then** moves p |
| `(*p)++;` | a[1] | adds 1 to the value: a[1] becomes 7 |
| `y = *(p + 1) + 1;` | a[1] | a[2] is 9, plus 1: y is 10 (p does not move) |

So `x` is 3, `*p` is `a[1]` = 7, `y` is 10, and `a[1]` is 7.

**16. Answer: `WAN 4`**, P-A-L-A-W-A-N has `'W'` at index 4. `strchr` returns a pointer to that `'W'` inside `s`, so `%s` prints from there to the `'\0'`, and `p - s` is the number of elements between them: 4.

**17. Answer: `12 75`**, PHP 1275 is twelve 100-peso bills (1275 / 100 = 12) with PHP 75 left over (1275 % 100 = 75). The function "returns" two results by writing to the addresses of `h` and `r`.

### Part III, Find the Error

**18.** `int m[][]` does not compile: a 2-D array parameter may leave out the number of rows but must state the number of columns, because C needs it to find where each row starts. Fix the header:

```c
void show(int m[][3], int rows) {
```

**19.** The loop runs `N` times, so every pair is swapped **twice**: once on the way to the middle and again on the way back, which puts every element back where it started. Swap only up to the middle:

```c
for (i = 0; i < N / 2; i++) {
```

**20.** `scanf("%d")` reads the `19` but leaves the Enter key's newline in the input. `fgets` reads that empty line immediately, so the name is an empty string. Throw away the rest of the line before calling `fgets`:

```c
int age, ch;
char name[40];

printf("Age: ");
scanf("%d", &age);
while ((ch = getchar()) != '\n' && ch != EOF)
    ;                         /* throw away the rest of the line */
printf("Name: ");
if (fgets(name, sizeof name, stdin) != NULL) {
    name[strcspn(name, "\n")] = '\0';
    printf("%s is %d years old\n", name, age);
}
```

**21.** It returns the address of a local variable. `total` disappears when `make_total` returns, so the caller gets a pointer to memory that is about to be reused: reading it gives garbage or crashes. (The compiler warns about this.) Return the value itself:

```c
int make_total(int a, int b) {
    return a + b;
}
```

### Part IV, Short Programming

**22.** Search from the right end. The first match found going backwards is the last match in the array.

```c
#include <stdio.h>

int last_index_of(const int a[], int n, int key) {
    int i;
    for (i = n - 1; i >= 0; i--)
        if (a[i] == key)
            return i;      /* first match from the right is the last one */
    return -1;
}

int main(void) {
    int ids[6] = {1042, 2210, 1873, 3301, 2210, 1500};

    printf("%d\n", last_index_of(ids, 6, 2210));
    printf("%d\n", last_index_of(ids, 6, 1042));
    printf("%d\n", last_index_of(ids, 6, 9999));
    return 0;
}
```

Output:
```
4
0
-1
```

Grading points: the loop starts at `n - 1` (not `n`) and runs while `i >= 0` so index 0 is checked, and `return -1` comes after the loop. A forward loop that keeps updating a `pos` variable (starting at `-1`) is also correct.

**23.** Two indexes moving inward, the same shape as `reverse` in Writing Your Own String Functions, but comparing instead of swapping.

```c
#include <stdio.h>
#include <string.h>
#include <ctype.h>

int is_palindrome(const char s[]) {
    int i = 0, j = (int)strlen(s) - 1;
    while (i < j) {
        if (tolower(s[i]) != tolower(s[j]))
            return 0;      /* one mismatch is enough */
        i++;
        j--;
    }
    return 1;
}

int main(void) {
    printf("%d\n", is_palindrome("Racecar"));
    printf("%d\n", is_palindrome("Anna"));
    printf("%d\n", is_palindrome("Maria"));
    return 0;
}
```

Output:
```
1
1
0
```

Grading points: `j` starts at the last real character (`strlen(s) - 1`), not at the `'\0'`; both sides go through `tolower` so `R` matches `r`; and `return 1` comes only after the loop has checked every pair.

**24.** Walk with the pointer itself: `*s` is the current character and `s++` moves to the next one, as in the `length` function from Pointers and Arrays.

```c
#include <stdio.h>
#include <ctype.h>

void count_case(const char *s, int *upper, int *lower) {
    *upper = 0;
    *lower = 0;
    while (*s != '\0') {
        if (isupper(*s))
            (*upper)++;
        else if (islower(*s))
            (*lower)++;
        s++;
    }
}

int main(void) {
    int up, low;

    count_case("Bayang Magiliw, BSIT 1-A", &up, &low);
    printf("upper %d, lower %d\n", up, low);
    return 0;
}
```

Output:
```
upper 7, lower 11
```

Grading points: `(*upper)++` needs the parentheses (`*upper++` would move the pointer instead of adding to the count), both counts start at 0 through the pointers, and spaces, digits and punctuation are counted in neither group.

**25.** Work column by column: the outer loop picks a column, the inner loop walks down its rows. Start each maximum from the first row, never from 0.

```c
#include <stdio.h>
#define COLS 4

void col_max(int m[][COLS], int rows, int out[]) {
    int r, c;
    for (c = 0; c < COLS; c++) {
        out[c] = m[0][c];              /* start from the first row */
        for (r = 1; r < rows; r++)
            if (m[r][c] > out[c])
                out[c] = m[r][c];
    }
}

int main(void) {
    int score[3][COLS] = {
        {18, 15, 20, 17},
        {12, 19, 16, 14},
        {20, 11, 18, 19}
    };
    int best[COLS];
    int c;

    col_max(score, 3, best);
    for (c = 0; c < COLS; c++)
        printf("Quiz %d best: %d\n", c + 1, best[c]);
    return 0;
}
```

Output:
```
Quiz 1 best: 20
Quiz 2 best: 19
Quiz 3 best: 20
Quiz 4 best: 19
```

Grading points: the column loop is outside and the row loop inside, the index order stays `m[r][c]` even though the loops are swapped, `out[c]` starts at `m[0][c]` (so it also works when every value is negative), and the parameter states the column count.

**Passing bar:** 17/25 on Exam B (it is harder). If both A and B are at or above the bar, you are prelim-ready.
$md$, 5, null, null)
on conflict (id) do update set
  kind = excluded.kind, heading = excluded.heading, body_md = excluded.body_md,
  sort_order = excluded.sort_order, ide_language = excluded.ide_language, starter_code = excluded.starter_code
where public.sections.module_id = excluded.module_id;

insert into public.sections (id, module_id, kind, heading, body_md, sort_order, ide_language, starter_code)
values ('a0cfbf26-9576-49ea-873e-93a5d4a1ae8b', 'a3000001-0001-0002-0001-0000000000e1', 'activity', 'Common CP2 Traps & How to Avoid Them', $md$
Most points lost on CP2 exams come from a short list of mistakes. Some stop the compiler. The dangerous ones compile fine and then print the wrong thing, or crash. Here they are, lesson by lesson, each with the wrong line, the right line, and the reason. Lessons 1 to 3 are prelim topics, but they come back on the final inside structures, files, and sorts, so do not skip them.

### Lesson 1, Arrays in Depth

| Trap | Wrong | Right | Why |
|---|---|---|---|
| Off-by-one loop | `for (i = 0; i <= n; i++)` | `for (i = 0; i < n; i++)` | Indexes run 0 to n - 1. `a[n]` is outside the array, and C will not stop you. |
| `sizeof` on an array parameter | `n = sizeof a / sizeof a[0];` inside the function | pass `n` as its own parameter | Inside the function `a` is really a pointer, so `sizeof a` is the size of an address. |
| Giving up too early in a search | `else return -1;` inside the loop | `return -1;` after the loop | The `else` quits after checking only `a[0]`. |
| Swap without a temp | `a[i] = a[j]; a[j] = a[i];` | `t = a[i]; a[i] = a[j]; a[j] = t;` | The first assignment destroys `a[i]` before anything saves it. |

### Lesson 2, Strings and Character Arrays

| Trap | Wrong | Right | Why |
|---|---|---|---|
| No room for `'\0'` | `char code[4] = "BSIT";` | `char code[] = "BSIT";` | 4 letters need 5 slots. Without the `'\0'`, `printf("%s")` keeps reading past the end. |
| Assigning with `=` | `name = "Ana";` | `strcpy(name, "Ana");` | An array cannot be assigned after its declaration. |
| Comparing with `==` | `if (pass == typed)` | `if (strcmp(pass, typed) == 0)` | `==` compares the two addresses, so it is false even when the text matches. |
| Reading `strcmp` backwards | `if (strcmp(a, b))` to mean "same" | `if (strcmp(a, b) == 0)` | `strcmp` returns **0** when the strings match, and 0 is false. |
| Using `gets` | `gets(name);` | `fgets(name, sizeof name, stdin);` | `gets` has no size limit and was removed from C in C11. Never use it. |
| Building a string with no terminator | a loop fills `digits[0]` to `digits[9]` and stops | add `digits[10] = '\0';` | A loop never writes the `'\0'` unless you do. |

### Lesson 3, Pointers

| Trap | Wrong | Right | Why |
|---|---|---|---|
| Uninitialized pointer | `int *p; *p = 5;` | `int *p = &x; *p = 5;` | `p` holds a garbage address until you give it a real one. |
| `p` versus `*p` | `p = 9;` | `*p = 9;` | `p` is the address; `*p` is the value stored there. |
| One star, one pointer | `int *p, q;` | `int *p, *q;` | In the wrong line `q` is a plain `int`. |
| Forgetting `&` in a call | `swap(x, y);` | `swap(&x, &y);` | A function can only change the caller's variables through their addresses. |
| Returning a local's address | `return &result;` | `return result;` | Locals disappear when the function returns. |

### Lesson 4, Structures

| Trap | Wrong | Right | Why |
|---|---|---|---|
| Missing `;` after the definition | `struct student { ... }` | `struct student { ... };` | The semicolon after the closing brace is required. |
| Dropping the word `struct` | `student a;` | `struct student a;` (or use `typedef`) | Without `typedef`, `struct` is part of the type name. |
| Assigning a string member | `a.name = "Ana";` | `strcpy(a.name, "Ana");` | `name` is still a `char` array (Lesson 2). |
| Comparing whole structures | `if (a == b)` | compare member by member, `strcmp` for strings | C has no `==` for structures. It does have `=` (copy). |
| Dot on a pointer, arrow on a variable | `p.gwa`, `a->gwa` | `p->gwa`, `a.gwa` | Structure itself: dot. Pointer to it: arrow. |
| Star without parentheses | `*p.gwa` | `(*p).gwa` or `p->gwa` | The dot runs before `*`, so `*p.gwa` means `*(p.gwa)`. |
| Index in the wrong place | `cls.gwa[i]` | `cls[i].gwa` | Pick the element first, then its member. |
| Expecting a by-value function to change the caller | `void improve(Student s)` | `void improve(Student *s)`, called with `improve(&s)` | Passing a structure normally passes a copy. |

### Lesson 5, File Handling

| Trap | Wrong | Right | Why |
|---|---|---|---|
| No `NULL` check | `fp = fopen("grades.txt", "r");` then read at once | `if (fp == NULL) { printf("Cannot open grades.txt\n"); return 1; }` | A missing file makes `fopen` return `NULL`, and using `NULL` usually crashes. |
| `"w"` when you meant `"a"` | `fopen("log.txt", "w")` to add a line | `fopen("log.txt", "a")` | `"w"` erases the old contents the moment the file opens. |
| Mode as a character | `fopen("a.txt", 'r')` | `fopen("a.txt", "r")` | The mode is a string. |
| `char` for `fgetc` | `char c;` | `int c;` | `fgetc` returns an `int` so that `EOF` can differ from every real character. |
| Missing parentheses in the read loop | `while (c = fgetc(fp) != EOF)` | `while ((c = fgetc(fp)) != EOF)` | `!=` runs before `=`, so `c` gets 1 or 0 instead of the character. |
| Looping on `feof` | `while (!feof(fp))` | `while (fscanf(fp, "%d", &x) == 1)` | `feof` turns true only after a read fails, so the last value is usually counted twice. |
| Forgetting the newline from `fgets` | `strcmp(line, "Ana") == 0` straight after `fgets` | `line[strcspn(line, "\n")] = '\0';` first | `fgets` keeps the `'\n'`. |
| Expecting `fputs` to end the line | `fputs("Ana", fp);` | `fputs("Ana\n", fp);` | `fputs` adds no newline. |
| Forgetting `fclose` | (nothing at the end) | `fclose(fp);` | The last lines may never reach the disk. |
| Single backslashes in a path | `"C:\data\grades.txt"` | `"C:\\data\\grades.txt"` | A single `\` starts an escape sequence. |

### Lesson 6, Recursion

| Trap | Wrong | Right | Why |
|---|---|---|---|
| No base case | `return n * fact(n - 1);` with no `if` | `if (n <= 1) return 1;` first | The calls never stop, and the program crashes with a stack overflow. |
| A base case you can step over | `if (n == 0)` while the calls go `n - 2` or start negative | `if (n <= 1)` or `if (n <= 0)` | A range catches every value; one exact value can be jumped over. |
| Not getting smaller | `f(n)` or `f(n + 1)` inside `f` | `f(n - 1)`, `f(n / 10)` | Every call must move toward the base case. |
| Missing `return` on the recursive call | `n * fact(n - 1);` | `return n * fact(n - 1);` | Without `return`, the answer is thrown away and the function returns garbage. |
| Printing in the wrong place | `printf` after the call when you wanted `3 2 1` | `printf` before the call | Before the call runs on the way down; after it runs on the way back up, in reverse. |
| Recursing too deep | `sumTo(1000000)` | a loop | A million waiting frames overflow the stack even when the code is correct. |

### Lesson 7, Searching and Sorting

| Trap | Wrong | Right | Why |
|---|---|---|---|
| Binary search on unsorted data | searching `{9, 2, 7, 4, 5}` directly | sort first, then binary search | Throwing away "the wrong half" only works when the array is in order. |
| Loop stops one step early | `while (low < high)` | `while (low <= high)` | When one element is left, `low == high`, and it still has to be checked. |
| Range never shrinks | `low = mid;` or `high = mid;` | `low = mid + 1;`, `high = mid - 1;` | `mid` was already checked; keeping it can loop forever. |
| Bubble inner loop too long | `for (j = 0; j < n; j++)` | `for (j = 0; j < n - 1 - i; j++)` | `a[j + 1]` reads past the end when `j` is `n - 1`. |
| Flag reset in the wrong place | `swapped = 0;` before the outer loop | `swapped = 0;` at the start of every pass | The flag must describe one pass. |
| Swapping inside selection's inner loop | swap each time a smaller value appears | remember `min`, swap once after the inner loop | Extra swaps; it is no longer selection sort. |
| Losing insertion sort's key | `while (j >= 0 && a[j] > a[i])` | save `key = a[i];` and test `a[j] > key` | The first shift overwrites `a[i]`. |
| Swapping only the field | `tmp = s[i].gwa; s[i].gwa = s[min].gwa; ...` | `temp = s[i]; s[i] = s[min]; s[min] = temp;` with `Student temp;` | Moving only the GWAs attaches grades to the wrong names. |
| Comparing names with `>` | `if (s[j].name > s[j + 1].name)` | `if (strcmp(s[j].name, s[j + 1].name) > 0)` | `>` on arrays compares addresses, not alphabetical order. |

---

### Five-Second Drills

Answer each before you read the answer.

**Drill 1 (Lesson 3).** What does this print?

```c
int x = 5;
int *p = &x;

*p = *p + 3;
printf("%d %d", x, *p);
```

**Answer:** `8 8`. `p` points at `x`, so changing `*p` changes `x`. There is only one value, reached two ways.

**Drill 2 (Lesson 5).** The file nums.txt holds `10` and `20` on two lines. What does this print?

```c
FILE *fp;
int x, sum = 0;

fp = fopen("nums.txt", "r");
while (!feof(fp)) {
    fscanf(fp, "%d", &x);
    sum += x;
}
fclose(fp);
printf("%d", sum);
```

**Answer:** `50`, not 30. After reading 20, `feof` is still false, so the loop runs once more. That `fscanf` fails and leaves `x` at 20, which gets added a second time. Fix: `while (fscanf(fp, "%d", &x) == 1) sum += x;` prints `30`.

**Drill 3 (Lesson 6).** What happens with `f(4)`? With `f(5)`?

```c
int f(int n) {
    if (n == 0)
        return 0;
    return n + f(n - 2);
}
```

**Answer:** `f(4)` returns 4 + 2 + 0 = 6. `f(5)` goes 5, 3, 1, -1, -3, ... and never lands on 0, so it keeps calling until the stack overflows and the program crashes. Fix the base case to `if (n <= 0)`.

**Drill 4 (Lesson 7).** `binarySearch` is the standard version from Lesson 7. What does `binarySearch(a, 5, 9)` return for `int a[5] = {9, 2, 7, 4, 5};`?

**Answer:** `-1`, even though 9 is at index 0. The first `mid` is index 2 (value 7). Since 7 < 9, the search throws away the left half, which is exactly where 9 sits. Binary search needs a sorted array.

**Drill 5 (Lesson 2).** Is `strcmp("Cruz", "Bautista")` positive, negative, or zero?

**Answer:** Positive. "Cruz" comes **after** "Bautista" alphabetically ('C' is after 'B'). In a sort by name, a positive result means the pair is out of order and must be swapped.

---

### Now Fix Them Yourself

The playground below compiles without errors, yet it has five live bugs: one each from Lessons 2, 4 and 6, and two from Lesson 7. Each is marked with a `BUG` comment and a `TODO`. It writes only to the screen, so it runs fine in the playground.

Run it once before changing anything. You should see:

```
Trap 1: improve Carla's GWA by 0.50
Carla's GWA is now 1.75

Trap 2: rank by GWA, best first
1. Ana    1.50
2. Ben    1.75
3. Carla  2.25

Trap 3: look for student ID 2015
ID 2015 not found

Trap 4: countdown from 3
1 2 3 

Trap 5: check the PIN
Wrong PIN
```

Every block is wrong. Carla's GWA did not change (a copy was changed). Ana did not earn a 1.50 (only the GWAs moved, the names stayed put). ID 2015 is in the array. The countdown runs up. And the PIN matches but is rejected.

Fix all five TODOs and run again. The output should be:

```
Trap 1: improve Carla's GWA by 0.50
Carla's GWA is now 1.25

Trap 2: rank by GWA, best first
1. Carla  1.25
2. Ben    1.50
3. Ana    2.25

Trap 3: look for student ID 2015
ID 2015 found at index 1

Trap 4: countdown from 3
3 2 1 

Trap 5: check the PIN
Access granted
```

Fix one bug at a time and run after each fix. Notice that fixing Trap 1 also changes Trap 2's ranking, because the ranking uses Carla's new GWA.
$md$, 6, 'c', $code$#include <stdio.h>
#include <string.h>

typedef struct {
    char  name[20];
    float gwa;
} Student;

/* BUG 1 (Lesson 4): s is a COPY of the caller's student, so the
   change is thrown away when the function returns.
   TODO: take a pointer (Student *s), use s->gwa, and call it
   with &cls[2] in main. */
void improve(Student s, float points) {
    s.gwa -= points;
}

/* BUG 2 (Lesson 7): this sort moves the GWAs but leaves the names
   where they were, so grades end up on the wrong students.
   TODO: swap the WHOLE struct through a Student temp variable. */
void sortByGwa(Student s[], int n) {
    int i, j, min;
    float temp;
    for (i = 0; i < n - 1; i++) {
        min = i;
        for (j = i + 1; j < n; j++)
            if (s[j].gwa < s[min].gwa)
                min = j;
        if (min != i) {
            temp = s[i].gwa;
            s[i].gwa = s[min].gwa;
            s[min].gwa = temp;
        }
    }
}

/* This one is correct: bubble sort, ascending. */
void sortInts(int a[], int n) {
    int i, j, temp;
    for (i = 0; i < n - 1; i++)
        for (j = 0; j < n - 1 - i; j++)
            if (a[j] > a[j + 1]) {
                temp = a[j];
                a[j] = a[j + 1];
                a[j + 1] = temp;
            }
}

/* This one is correct too, but only on a SORTED array. */
int binarySearch(int a[], int n, int key) {
    int low = 0, high = n - 1, mid;
    while (low <= high) {
        mid = low + (high - low) / 2;
        if (a[mid] == key)
            return mid;
        else if (a[mid] < key)
            low = mid + 1;
        else
            high = mid - 1;
    }
    return -1;
}

/* BUG 4 (Lesson 6): this should print 3 2 1 but prints 1 2 3.
   TODO: move the printf so it runs BEFORE the recursive call. */
void countdown(int n) {
    if (n == 0)
        return;
    countdown(n - 1);
    printf("%d ", n);
}

int main(void) {
    Student cls[3] = {
        {"Ana",   2.25f},
        {"Ben",   1.50f},
        {"Carla", 1.75f}
    };
    int ids[5] = {2041, 2007, 2033, 2015, 2050};
    char pin[] = "1234";
    char typed[] = "1234";
    int i, pos;

    printf("Trap 1: improve Carla's GWA by 0.50\n");
    improve(cls[2], 0.50f);
    printf("Carla's GWA is now %.2f\n\n", cls[2].gwa);

    printf("Trap 2: rank by GWA, best first\n");
    sortByGwa(cls, 3);
    for (i = 0; i < 3; i++)
        printf("%d. %-6s %.2f\n", i + 1, cls[i].name, cls[i].gwa);
    printf("\n");

    /* BUG 3 (Lesson 7): binary search on an UNSORTED array.
       TODO: call sortInts(ids, 5); on the line below this comment. */
    printf("Trap 3: look for student ID 2015\n");
    pos = binarySearch(ids, 5, 2015);
    if (pos == -1)
        printf("ID 2015 not found\n\n");
    else
        printf("ID 2015 found at index %d\n\n", pos);

    printf("Trap 4: countdown from 3\n");
    countdown(3);
    printf("\n\n");

    /* BUG 5 (Lesson 2): strcmp returns 0 when the strings MATCH,
       so this test is backwards.
       TODO: change the condition to strcmp(typed, pin) == 0 */
    printf("Trap 5: check the PIN\n");
    if (strcmp(typed, pin))
        printf("Access granted\n");
    else
        printf("Wrong PIN\n");

    return 0;
}$code$)
on conflict (id) do update set
  kind = excluded.kind, heading = excluded.heading, body_md = excluded.body_md,
  sort_order = excluded.sort_order, ide_language = excluded.ide_language, starter_code = excluded.starter_code
where public.sections.module_id = excluded.module_id;

insert into public.sections (id, module_id, kind, heading, body_md, sort_order, ide_language, starter_code)
values ('187b08ad-d1a2-4794-8473-77a7ff09242b', 'a3000001-0001-0002-0001-0000000000e1', 'activity', 'Final Exam Blueprint & Rapid Review Sheet', $md$
The final covers **Lesson 4 (Structures), Lesson 5 (File Handling), Lesson 6 (Recursion), and Lesson 7 (Searching and Sorting)**. About a fifth of it reaches back to Lessons 1 to 3, but not as separate topics: you will meet arrays, strings, and pointers again **inside** the new material, like `cls[i].gwa`, `strcpy(s.name, ...)`, `p->gwa`, and sorting an array of records.

### Typical Final Exam Blueprint

Professors shuffle the weights, but a CP2 final on these lessons is usually built from the same five parts. Both Final Mock Exams in this module follow this layout item for item.

| Part | Format | Items in the mocks | Typical Weight | Focus |
|---|---|---|---|---|
| I | Multiple choice / identification | 1 to 6 | 20% | Struct syntax, dot vs arrow, `fopen` modes, `EOF`, what a sort or search needs |
| II | Output tracing | 7 to 14 | 30% | Struct copies, by-value vs by-pointer, nested members, file write-then-read, recursion traces |
| III | Search and sort traces | 15 to 18 | 15% | Array after pass k, swap counts, binary search steps |
| IV | Find the error | 19 to 22 | 15% | The mistakes in Common CP2 Traps, found and fixed |
| V | Write the program | 23 to 25 | 20% | One structures program, one file program, one recursion or sort-and-search program |

Rough coverage by lesson:

| Lesson | Share of the final | Where it shows up most |
|---|---|---|
| 4, Structures | about 25% | Parts I, II, IV, V |
| 5, File Handling | about 20% | Parts I, II, IV, V |
| 6, Recursion | about 15% | Parts II, IV, V |
| 7, Searching and Sorting | about 20% | Parts I, III, IV, V |
| 1 to 3, cumulative | about 20% | mixed into every part |

Tracing plus programming is half the exam. Reading the review sheet is not enough: trace each mock on paper with a pencil, then check yourself against the key.

---

## Rapid Review Sheet

### Lesson 4, Structures

**Syntax on one screen** (from Declaring Structures and Accessing Members, typedef and Nested Structures, and Pointers to Structures: The Arrow Operator):

```c
struct student {              /* definition: a template, no memory yet */
    char  name[30];
    int   year;
    float gwa;
};                            /* the ; is required */

typedef struct {              /* typedef: Date is now a type name */
    int month, day, year;
} Date;

struct student a = {"Ana Reyes", 1, 1.75f};   /* values in member order */
struct student cls[40];                       /* array of structures */
struct student *p = &a;                       /* pointer to a structure */

a.year = 2;                   /* structure variable: dot */
p->gwa = 1.50f;               /* pointer: arrow, same as (*p).gwa */
cls[3].gwa = 2.00f;           /* element first, then member */
strcpy(a.name, "Ana");        /* string member: strcpy, never = */
scanf("%d", &a.year);         /* & goes in front of the whole a.year */
```

**Rules to know cold:**

- A definition sets aside no memory. Declaring a variable does. Members left out of an initializer become 0.
- `b = a;` copies every member, even a `char` array. `a == b` does **not** compile; compare member by member.
- Nested members take one dot per level: `s.birthday.year`. Define the inner type (`Date`) before the outer one.
- Passing a structure to a function passes a **copy**. To keep a change, either return the changed copy and assign it (`a = moved(a, 10);`) or pass the address (`deposit(&a, 250.50f)`) and use `->` inside.
- An **array** of structures passed to a function is not copied: the function works on the caller's records. Mark it `const Student list[]` if it should only read.
- If `p` points at `cls[0]`, then `p[i].gwa` and `(p + i)->gwa` both reach record `i`. `p++` moves one whole record.
- In Philippine grading, 1.00 is the best GWA, so "best student" means **smallest** GWA: use `<`.

### Lesson 5, File Handling

**The four steps:** declare `FILE *fp;`, open with `fopen` and check for `NULL`, read or write, `fclose(fp);`.

| Mode | Meaning | File exists | File missing |
|---|---|---|---|
| `"r"` | read | read from the start | `fopen` returns `NULL` |
| `"w"` | write | contents **erased** | created |
| `"a"` | append | writing goes to the end | created |
| `"r+"` | read and write | kept, start at the beginning | `NULL` |
| `"w+"` | read and write | contents **erased** | created |
| `"a+"` | read and append | kept, writing goes to the end | created |

**The three reading loops** (from Formatted File I/O, Character I/O, and Line I/O):

```c
FILE *fp = fopen("scores.txt", "r");
if (fp == NULL) {
    printf("Cannot open scores.txt\n");
    return 1;
}

/* 1. records: fscanf returns how many items it read */
while (fscanf(fp, "%29s %d", name, &score) == 2)
    total += score;

/* 2. characters: c must be an int */
while ((c = fgetc(fp)) != EOF)
    chars++;

/* 3. lines: fgets keeps the '\n' and returns NULL at the end */
while (fgets(line, sizeof line, fp) != NULL)
    line[strcspn(line, "\n")] = '\0';

fclose(fp);
```

(These are three separate patterns. In a real program you pick one per pass through the file.)

**Writing:** `fprintf(fp, "%s %d\n", name, score);` (like `printf`, file first), `fputc(c, fp);` (one character), `fputs(str, fp);` (a string, **no** newline added).

**Rules to know cold:**

- `stdin`, `stdout`, and `stderr` are already-open `FILE *` streams. `fprintf(stdout, ...)` is the same as `printf(...)`, and `fgets(name, sizeof name, stdin)` reads a full name with spaces.
- Write and read with matching formats: if you wrote `"%d %s %.2f\n"`, read with `"%d %29s %f"` and test for `== 3`.
- `%s` stops at a space, so "Ana Reyes" is two words to `fscanf`. Use one-word fields or `fgets`.
- To read back what you just wrote, `fclose` the file and `fopen` it again with `"r"`.
- Never `while (!feof(fp))`. Never `fclose(NULL)`. Never `gets`.

### Lesson 6, Recursion

**The checklist** (from Base Case and Recursive Case: Factorial):

1. There is a base case that returns without calling again.
2. Every recursive call uses a smaller input.
3. The smaller inputs reach the base case for every valid input (use a range like `n <= 1`, not one exact value, when you can).

**The classic functions** (from Classic Recursive Functions):

```c
long factorial(int n) {
    if (n <= 1)
        return 1;
    return n * factorial(n - 1);
}

int sumDigits(int n) {
    if (n < 10)
        return n;
    return n % 10 + sumDigits(n / 10);
}

long power(int base, int exp) {
    if (exp == 0)
        return 1;
    return base * power(base, exp - 1);
}

int fib(int n) {
    if (n <= 1)
        return n;
    return fib(n - 1) + fib(n - 2);
}
```

**Tracing** (from Tracing the Call Stack):

- Each call gets its own stack frame with its own copy of the parameters.
- Calls **wind down** to the base case, then **unwind**: the last call made is the first to finish.
- Work **before** the recursive call happens on the way down (`down(3)` prints `3 2 1`). Work **after** it happens on the way back up (`up(3)` prints `1 2 3`).
- For a value-returning function, write the chain out: `factorial(4) = 4 * factorial(3) = 4 * 3 * factorial(2) = ...`, then multiply back up.

**Recursion vs. iteration:** recursion stops at the base case and costs one frame per waiting call; a loop stops when its condition is false and reuses one frame. Too many waiting calls cause a **stack overflow** (a crash). Naive `fib` repeats work: `fib(30)` makes about 2.7 million calls.

### Lesson 7, Searching and Sorting

**Searches:**

```c
int linearSearch(int a[], int n, int key) {
    int i;
    for (i = 0; i < n; i++)
        if (a[i] == key)
            return i;
    return -1;                       /* after the loop, not inside it */
}

int binarySearch(int a[], int n, int key) {   /* a must be sorted */
    int low = 0, high = n - 1, mid;
    while (low <= high) {
        mid = low + (high - low) / 2;
        if (a[mid] == key)
            return mid;
        else if (a[mid] < key)
            low = mid + 1;
        else
            high = mid - 1;
    }
    return -1;
}
```

**Sorts (ascending):**

```c
/* Bubble: swap neighbors; the largest bubbles to the end */
for (i = 0; i < n - 1; i++) {
    swapped = 0;
    for (j = 0; j < n - 1 - i; j++)
        if (a[j] > a[j + 1]) {
            temp = a[j];
            a[j] = a[j + 1];
            a[j + 1] = temp;
            swapped = 1;
        }
    if (!swapped)
        break;
}

/* Selection: find the smallest, swap it to the front */
for (i = 0; i < n - 1; i++) {
    min = i;
    for (j = i + 1; j < n; j++)
        if (a[j] < a[min])
            min = j;
    if (min != i) {
        temp = a[i];
        a[i] = a[min];
        a[min] = temp;
    }
}

/* Insertion: shift bigger values right, drop the key in the gap */
for (i = 1; i < n; i++) {
    key = a[i];
    j = i - 1;
    while (j >= 0 && a[j] > key) {
        a[j + 1] = a[j];
        j--;
    }
    a[j + 1] = key;
}
```

For **descending** order, flip the comparison that decides the move: `a[j] < a[j + 1]` (bubble), `a[j] > a[min]` (selection), `a[j] < key` (insertion).

**Which sort made this pass?** (from Selection Sort and Insertion Sort, Telling the three apart in an exam). Look at the array after pass 1:

| Sort | After pass 1 |
|---|---|
| Bubble | the **largest** value is at the **end** |
| Selection | the **smallest** value is at the **front**, swapped with whatever was there |
| Insertion | only the **first two** elements are in order; the rest is untouched |

**Sorting structs** (from Sorting an Array of Structs by a Field): compare **one field**, swap the **whole struct**.

```c
struct Student temp;                    /* temp has the struct type */

if (s[j].gwa < s[min].gwa)              /* compare ONE field */
    min = j;

temp = s[i];                            /* swap the WHOLE record */
s[i] = s[min];
s[min] = temp;
```

For names the comparison becomes `strcmp(s[j].name, s[j + 1].name) > 0`. Using `>` on two `char` arrays compares their addresses, not alphabetical order.

**Complexities** (from Comparing the Algorithms: Big-O in Plain Words):

| Algorithm | Best case | Worst case | Good to know |
|---|---|---|---|
| Linear search | O(1) | O(n) | works on unsorted data |
| Binary search | O(1) | O(log n) | array must be sorted; about 20 steps for 1,000,000 |
| Bubble sort (with flag) | O(n) | O(n²) | many swaps; O(n) best case only with the flag |
| Selection sort | O(n²) | O(n²) | at most n - 1 swaps; not stable |
| Insertion sort | O(n) | O(n²) | fastest of the three on nearly sorted data; stable |

Comparisons for selection sort, or for bubble sort with no early stop, on n elements: n(n - 1) / 2, so 10 for 5 elements and 45 for 10.

| Big-O | Double n and the work... |
|---|---|
| O(1) | stays the same |
| O(log n) | goes up by one step |
| O(n) | doubles |
| O(n²) | quadruples |

### Cumulative Review, Lessons 1 to 3 as They Appear on the Final

- **Arrays (Lesson 1):** indexes run 0 to n - 1; array parameters are not copied, so pass `n` separately; `return -1` goes after the search loop.
- **Strings (Lesson 2):** `strcpy` to assign, `strcmp(a, b) == 0` to compare, `strcat` to join, `strlen` stops before `'\0'`; a string of n letters needs n + 1 slots.
- **Pointers (Lesson 3):** `&` gives an address, `*p` follows it; pass `&x` when a function must change `x`; `a[i]` is `*(a + i)`, and pointer arithmetic moves one element (or one whole struct) at a time.

### The Seven Facts You Must Not Blank On

1. A `struct` definition ends with `};`.
2. Structure variable: dot. Pointer to a structure: arrow. `p->gwa` is `(*p).gwa`.
3. A structure passed by value is a copy; pass `&s` to change it.
4. Check every `fopen` for `NULL`; `"w"` erases, `"a"` adds.
5. `int c` for `fgetc`, and loop on what the read function returns, not on `feof`.
6. Every recursive function needs a base case that every input eventually reaches.
7. Binary search needs sorted data; when sorting records, swap the whole struct.
$md$, 7, null, null)
on conflict (id) do update set
  kind = excluded.kind, heading = excluded.heading, body_md = excluded.body_md,
  sort_order = excluded.sort_order, ide_language = excluded.ide_language, starter_code = excluded.starter_code
where public.sections.module_id = excluded.module_id;

insert into public.sections (id, module_id, kind, heading, body_md, sort_order, ide_language, starter_code)
values ('92de4076-fa42-4e4c-bd33-2e9912bf056b', 'a3000001-0001-0002-0001-0000000000e1', 'activity', 'Final Mock Exam A, 25 Items', $md$
Covers Lessons 4 to 7 with about 20% cumulative review from Lessons 1 to 3, laid out exactly like the blueprint in the Final Exam Blueprint & Rapid Review Sheet. 90 minutes, no notes. Items 23 to 25 are write-the-program items; write complete programs, not fragments.

Ground rules for the whole exam:

- Every fragment is inside `main()` of a complete program with `#include <stdio.h>` and `#include <string.h>`. Type definitions and functions shown above a fragment sit above `main()`.
- In file items, `fopen` always succeeds. The `NULL` checks are left out only to save space; in your own programs, always include them.
- For sorting items, **one pass** means one run of the outer loop of the standard Lesson 7 code (bubble, selection, or insertion, as named), sorting **ascending**.

### Part I, Multiple Choice (Items 1 to 6)

**1.** Which structure definition compiles?

- A. `struct book { char title[40]; float price; }`
- B. `struct book { char title[40]; float price; };`
- C. `struct { char title[40], float price };`
- D. `book struct { char title[40]; float price; };`

**2.** Given `Student s;` and `Student *p = &s;`, which expression reaches the `gwa` member **through the pointer** `p`?

- A. `p.gwa`
- B. `*p.gwa`
- C. `p->gwa`
- D. `&p.gwa`

**3.** Given `struct student cls[40];`, which expression is the GWA of the **third** student in the list?

- A. `cls.gwa[3]`
- B. `cls[3].gwa`
- C. `cls[2].gwa`
- D. `cls.gwa[2]`

**4.** Which `fopen` mode erases a file's old contents the moment the file is opened?

- A. `"r"`
- B. `"a"`
- C. `"w"`
- D. `"r+"`

**5.** In the loop `while ((c = fgetc(fp)) != EOF)`, the variable `c` should be declared as:

- A. `char c;`
- B. `int c;`
- C. `float c;`
- D. `FILE *c;`

**6.** Binary search on a **sorted** array of 1,000,000 elements needs, in the worst case, about how many comparisons?

- A. 20
- B. 1,000
- C. 500,000
- D. 1,000,000

### Part II, Output Tracing (Items 7 to 14)

Write exactly what each fragment prints.

**7.**
```c
struct student {
    char name[20];
    int  year;
};

/* inside main() */
struct student a = {"Ana", 1};
struct student b;

b = a;
b.year = 2;
strcpy(b.name, "Ben");
printf("%s %d %s %d", a.name, a.year, b.name, b.year);
```

**8.**
```c
typedef struct {
    int x, y;
} Point;

void shiftCopy(Point p) {
    p.x += 5;
}

void shiftPtr(Point *p) {
    p->y += 5;
}

int main(void) {
    Point a = {1, 2};

    shiftCopy(a);
    shiftPtr(&a);
    printf("(%d, %d)", a.x, a.y);
    return 0;
}
```

**9.**
```c
typedef struct {
    int month, day, year;
} Date;

typedef struct {
    char name[20];
    Date due;
} Task;

/* inside main() */
Task t = {"Lab 5", {10, 31, 2026}};

t.due.day = t.due.day - 10;
t.due.month++;
printf("%s: %d/%d/%d", t.name, t.due.month, t.due.day, t.due.year);
```

**10.**
```c
typedef struct {
    char name[20];
    int  price;
} Item;

/* inside main() */
Item menu[3] = {{"Pancit", 45}, {"Lumpia", 30}, {"Turon", 15}};
Item *p = menu;

p++;
printf("%s %d %d", p->name, (p + 1)->price, menu[0].price + p->price);
```

**11.**
```c
void show(int n) {
    if (n == 0)
        return;
    printf("%d ", n);
    show(n - 1);
    printf("%d ", n);
}

/* inside main() */
show(3);
```

**12.**
```c
int g(int a, int b) {
    if (b == 0)
        return 0;
    return a + g(a, b - 1);
}

/* inside main() */
printf("%d %d", g(4, 3), g(7, 0));
```

**13.**
```c
FILE *fp;
int x, sum = 0, count = 0;

fp = fopen("pts.txt", "w");
fprintf(fp, "%d %d\n", 4, 9);
fprintf(fp, "%d\n", 7);
fclose(fp);

fp = fopen("pts.txt", "r");
while (fscanf(fp, "%d", &x) == 1) {
    sum += x;
    count++;
}
fclose(fp);
printf("%d %d", count, sum);
```

**14.**
```c
FILE *fp;
int c, chars = 0, lines = 0;

fp = fopen("note.txt", "w");
fputs("Hi\nBSIT\n", fp);
fclose(fp);

fp = fopen("note.txt", "r");
while ((c = fgetc(fp)) != EOF) {
    chars++;
    if (c == '\n')
        lines++;
}
fclose(fp);
printf("%d %d", chars, lines);
```

### Part III, Search and Sort Traces (Items 15 to 18)

Items 15 to 17 each start from the **original** array `{41, 17, 30, 8, 25}`.

**15.** Bubble sort: write the array **after pass 1**, and say how many swaps pass 1 made.

**16.** Selection sort: write the array **after pass 1** and **after pass 2**.

**17.** Insertion sort: write the array **after pass 2**.

**18.** Binary search (the iterative Lesson 7 version) looks for `61` in this sorted array:

| index | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|---|
| value | 5 | 12 | 19 | 26 | 33 | 40 | 47 | 54 | 61 |

List the values of `a[mid]` in the order they are checked, and give the value the function returns.

### Part IV, Find the Error (Items 19 to 22)

For each item, name every error and write the corrected line(s).

**19.** This program should print `Kape 35.00`. It does not compile. Find **two** errors.

```c
#include <stdio.h>

struct item {
    char  name[20];
    float price;
}

int main(void) {
    struct item a;

    a.name = "Kape";
    a.price = 35.00f;
    printf("%s %.2f\n", a.name, a.price);
    return 0;
}
```

**20.** `addLog` should **add** one line to the end of log.txt without erasing earlier lines, and must not crash if the file cannot be opened. Calling it twice, with `"Login: Ana"` then `"Login: Ben"`, leaves only `Login: Ben` in the file. Find **two** errors.

```c
void addLog(const char *msg) {
    FILE *fp = fopen("log.txt", "w");

    fprintf(fp, "%s\n", msg);
    fclose(fp);
}
```

**21.** `power(2, 5)` correctly returns 32, but `power(7, 0)` crashes the program. Explain why and fix the function.

```c
long power(int base, int exp) {
    if (exp == 1)
        return base;
    return base * power(base, exp - 1);
}
```

**22.** This should sort the menu by price, cheapest first. It prints `Pancit 15`, `Lumpia 30`, `Turon 45`: the prices are in order, but Pancit does not cost 15. Find the error and rewrite the lines that need to change.

```c
typedef struct {
    char name[20];
    int  price;
} Item;

void sortByPrice(Item s[], int n) {
    int i, j, temp;
    for (i = 0; i < n - 1; i++)
        for (j = 0; j < n - 1 - i; j++)
            if (s[j].price > s[j + 1].price) {
                temp = s[j].price;
                s[j].price = s[j + 1].price;
                s[j + 1].price = temp;
            }
}
```

### Part V, Write the Program (Items 23 to 25)

Write each as a complete C program. Rubric per item (10 points): correct declarations and types (2), correct input or file opening with checks (2), correct core logic (4), correct output (2).

**23.** Define a structure `Product` with a name (one word), a price (`float`), and a quantity (`int`). Read 3 products, then print each product's name, price, quantity, and line total (price × quantity), followed by the grand total in pesos.

**24.** Ask for the name (one word) and score of 3 students and write them to scores.txt, one student per line. Close the file, open it again for reading, read every record back with `fscanf`, and print the name and score of the top scorer. Check every `fopen` for `NULL`.

**25.** Read 6 integers into an array. Sort them in ascending order with **insertion sort** (in its own function), print the sorted array, then read a key and use **binary search** (in its own function) to print either the index where the key was found or that it was not found.
$md$, 8, null, null)
on conflict (id) do update set
  kind = excluded.kind, heading = excluded.heading, body_md = excluded.body_md,
  sort_order = excluded.sort_order, ide_language = excluded.ide_language, starter_code = excluded.starter_code
where public.sections.module_id = excluded.module_id;

insert into public.sections (id, module_id, kind, heading, body_md, sort_order, ide_language, starter_code)
values ('8ff0bff1-d150-4a44-bd44-e59fda1ca286', 'a3000001-0001-0002-0001-0000000000e1', 'activity', 'Final Mock Exam B, 25 Items', $md$
All-new items, same blueprint and coverage as Final Mock Exam A. 90 minutes, no notes. The same ground rules apply: fragments sit inside `main()` with `<stdio.h>` and `<string.h>` included, `fopen` always succeeds in the file items, one pass means one run of the outer loop of the named Lesson 7 sort (ascending), and items 23 to 25 use the same 10-point rubric (declarations 2, input or file checks 2, logic 4, output 2).

### Part I, Multiple Choice (Items 1 to 6)

**1.** If `p` is a pointer to a structure, `p->gwa` means exactly the same as:

- A. `(*p).gwa`
- B. `*p.gwa`
- C. `&p.gwa`
- D. `p.gwa`

**2.** Given these types, which statement sets the student's birth year?

```c
typedef struct {
    int month, day, year;
} Date;

typedef struct {
    char name[30];
    Date birthday;
} Student;

Student s;
```

- A. `s.year = 2007;`
- B. `s.birthday.year = 2007;`
- C. `s->birthday->year = 2007;`
- D. `birthday.s.year = 2007;`

**3.** Which `fopen` mode keeps a file's old contents, writes new data at the end, and creates the file if it does not exist?

- A. `"r"`
- B. `"w"`
- C. `"a"`
- D. `"r+"`

**4.** A file's first line is `Ana Reyes`, and `line` is a `char[80]`. After `fgets(line, sizeof line, fp);`, the array `line` holds:

- A. `"Ana"` only
- B. `"Ana Reyes"` with no newline
- C. `"Ana Reyes\n"`, newline included
- D. Nothing, because `fgets` returned `EOF`

**5.** A recursive function has no base case. When it is called, the program will most likely:

- A. Return 0
- B. Stop by itself after 100 calls
- C. Keep calling itself until the call stack runs out, then crash
- D. Be rejected by the compiler

**6.** The array `{35, 12, 48, 7, 20}` becomes `{7, 12, 48, 35, 20}` after pass 1 of a sort. Which sort was it?

- A. Bubble sort
- B. Selection sort
- C. Insertion sort
- D. Binary search

### Part II, Output Tracing (Items 7 to 14)

Write exactly what each fragment prints.

**7.**
```c
typedef struct {
    int x, y;
} Point;

/* inside main() */
Point a = {3, 4}, b;
Point *p = &a;

b = a;
p->x = 10;
printf("%d %d %d", a.x, b.x, (*p).y);
```

**8.**
```c
typedef struct {
    char  name[20];
    float gwa;
} Student;

/* inside main() */
Student cls[5] = {{"Ana", 1.75f}, {"Ben", 2.50f}, {"Carla", 1.25f},
                  {"Dan", 1.75f}, {"Ella", 3.00f}};
int i, count = 0;

for (i = 0; i < 5; i++)
    if (cls[i].gwa <= 1.75f) {
        printf("%c", cls[i].name[0]);
        count++;
    }
printf(" %d", count);
```

**9.**
```c
typedef struct {
    char  name[20];
    float balance;
} Account;

Account add(Account a, float amt) {
    a.balance += amt;
    return a;
}

int main(void) {
    Account x = {"Ana", 100.00f};

    add(x, 50.00f);
    printf("%.2f ", x.balance);
    x = add(x, 25.00f);
    printf("%.2f", x.balance);
    return 0;
}
```

**10.**
```c
struct city {
    char name[20];
    int  len;
};

/* inside main() */
struct city c;

strcpy(c.name, "Cebu");
strcat(c.name, " City");
c.len = (int)strlen(c.name);
printf("%s %d %c", c.name, c.len, c.name[c.len - 1]);
```

**11.**
```c
int f(int n) {
    if (n <= 1)
        return 1;
    return n + f(n - 2);
}

/* inside main() */
printf("%d %d", f(7), f(6));
```

**12.**
```c
void r(int n) {
    if (n > 0) {
        r(n / 2);
        printf("%d", n % 2);
    }
}

/* inside main() */
r(13);
```

**13.**
```c
FILE *fp;
char line[50];

fp = fopen("rec.txt", "w");
fputs("Juan Dela Cruz 95\n", fp);
fclose(fp);

fp = fopen("rec.txt", "r");
fgets(line, sizeof line, fp);
printf("%d ", (int)strlen(line));
line[strcspn(line, "\n")] = '\0';
printf("%d", (int)strlen(line));
fclose(fp);
```

**14.**
```c
FILE *fp;
char line[20];

fp = fopen("log.txt", "w");
fputs("A\n", fp);
fclose(fp);
fp = fopen("log.txt", "a");
fputs("B\n", fp);
fclose(fp);
fp = fopen("log.txt", "w");
fputs("C\n", fp);
fclose(fp);
fp = fopen("log.txt", "a");
fputs("D\n", fp);
fclose(fp);

fp = fopen("log.txt", "r");
while (fgets(line, sizeof line, fp) != NULL) {
    line[strcspn(line, "\n")] = '\0';
    printf("%s", line);
}
fclose(fp);
```

### Part III, Search and Sort Traces (Items 15 to 18)

Items 15 to 17 each start from the **original** array `{16, 42, 9, 30, 21}`.

**15.** Insertion sort: write the array **after pass 1** and **after pass 2**.

**16.** Bubble sort **with the swapped flag**: write the array **after pass 2**, then say how many passes run in total before the flag stops the sort.

**17.** Selection sort: write the array **after pass 1**, and give the **total number of swaps** for the complete sort.

**18.** Binary search (the iterative Lesson 7 version) looks for `14` in this sorted array:

| index | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|---|
| value | 2 | 6 | 11 | 17 | 23 | 30 | 38 |

Copy and complete the table, one row per pass of the loop, then give the value the function returns.

| Step | low | high | mid | a[mid] | Decision |
|---|---|---|---|---|---|
| 1 | | | | | |

### Part IV, Find the Error (Items 19 to 22)

For each item, name every error and write the corrected line(s).

**19.** This program should give Rosa a 10% raise and print `Rosa: PHP 22000.00`. It does not compile. Find **two** errors (one in the function, one in the call).

```c
typedef struct {
    char  name[30];
    float salary;
} Employee;

void giveRaise(Employee *e) {
    e.salary = e.salary * 1.10f;
}

int main(void) {
    Employee emp = {"Rosa", 20000.00f};

    giveRaise(emp);
    printf("%s: PHP %.2f\n", emp.name, emp.salary);
    return 0;
}
```

**20.** This should print the contents of motto.txt (which holds `Code daily.`) to the screen. It compiles with a warning, then prints strange invisible characters instead of the text. Find **two** errors.

```c
FILE *fp;
char c;

fp = fopen("motto.txt", "r");
if (fp == NULL)
    return 1;
while (c = fgetc(fp) != EOF)
    putchar(c);
fclose(fp);
```

**21.** With `int a[5] = {1, 3, 5, 7, 9};`, `binarySearch(a, 5, 5)` returns 2, but `binarySearch(a, 5, 9)` returns -1. Find the error.

```c
int binarySearch(int a[], int n, int key) {
    int low = 0, high = n - 1, mid;
    while (low < high) {
        mid = low + (high - low) / 2;
        if (a[mid] == key)
            return mid;
        else if (a[mid] < key)
            low = mid + 1;
        else
            high = mid - 1;
    }
    return -1;
}
```

**22.** `sumDigits(4096)` should return 19. The compiler warns that the function "does not return a value in all control paths", and the program prints a wrong number. Find the error.

```c
int sumDigits(int n) {
    if (n < 10)
        return n;
    n % 10 + sumDigits(n / 10);
}
```

### Part V, Write the Program (Items 23 to 25)

**23.** Using `typedef`, define a `Student` structure with a name (one word) and a GWA. Read 4 students, sort them **best GWA first** (remember: 1.00 is the best grade) with bubble sort in its own function, and print the ranking as `1. Name GWA`, one student per line.

**24.** Ask for one expense (a one-word description and an amount in pesos) and **append** it to expenses.txt without erasing earlier expenses. Then read the whole file back and print every expense, followed by how many there are and their total. Check every `fopen` for `NULL`. Run the program twice to make sure the first expense is still there.

**25.** Write a **recursive** function `int countOccur(int a[], int n, int key)` that returns how many times `key` appears among the first `n` elements of `a`. No loops inside the function. In `main()`, read 8 integers and a key, then print the count.
$md$, 9, null, null)
on conflict (id) do update set
  kind = excluded.kind, heading = excluded.heading, body_md = excluded.body_md,
  sort_order = excluded.sort_order, ide_language = excluded.ide_language, starter_code = excluded.starter_code
where public.sections.module_id = excluded.module_id;

insert into public.sections (id, module_id, kind, heading, body_md, sort_order, ide_language, starter_code)
values ('a1311800-32de-44bb-bcc2-8c7965d526e1', 'a3000001-0001-0002-0001-0000000000e1', 'activity', 'Final Mock Exams, Answer Key with Explanations', $md$
Full key for both final mocks, including complete model programs for the write-the-program items. Model solutions follow the same style as the Unit 1 sample programs (`conio.h`, `void main()`, `clrscr()`, `getch()`); if your compiler is not Turbo C, remove those three and use `int main(void)` with `return 0;`, the array logic is identical either way.

## Final Mock Exam A

### Part I, Multiple Choice

| # | Answer | Why |
|---|---|---|
| 1 | B | 4 rows × 6 columns = 24 elements. |
| 2 | B | Rows first, columns second: `float g[3][5];`. |
| 3 | C | Row 1 = {5, 6, 7, 8}; index 2 within that row is 7. |
| 4 | B | Row 0's inner brace has only {1, 2}; the rest of that row is zero-filled. |
| 5 | B | Five letters plus `'\0'` needs 6 slots. |
| 6 | B | Ascending: swap when the left neighbor is bigger. |

### Part II, Output Tracing

**7. Answer: `8 10`**, c becomes {6, 8; 10, 12}; the program prints `c[0][1]` then `c[1][0]`.

**8. Answer: `18`**, main diagonal of {4, 1, 2; 3, 5, 6; 7, 8, 9}: 4 + 5 + 9 = 18.

**9. Answer:**
```
123
456
```
Row-by-row printing with a newline after each inner loop.

**10. Answer: `2`**, the smallest of {9, 4, 8, 2, 7, 3, 6, 5}, found exactly as in Practice Exercises Program C.

**11. Answer: `3`**, the values greater than 5 are 7, 9, and 6.

**12. Answer: `8`**, column 1 holds 8, 2, 6; `big` starts at 8 and nothing beats it.

**13. Answer: `2 1 4 3 5`**, this is one sorting pass.

| Compare | Swap? | Array after |
|---|---|---|
| 2, 5 | no | 2 5 1 4 3 |
| 5, 1 | yes | 2 1 5 4 3 |
| 5, 4 | yes | 2 1 4 5 3 |
| 5, 3 | yes | 2 1 4 3 5 |

**14. Answer: `6`**, the loop counts characters until `'\0'`; MATRIX has 6 letters.

**15. Answer: `0 2 3 8`**, each element is multiplied by (row + column): 1 × 0 = 0, 2 × 1 = 2, 3 × 1 = 3, 4 × 2 = 8.

**16. Answer: `9`**, (4 − 1) + (5 − 2) + (6 − 3) = 3 + 3 + 3 = 9.

### Part III, Sorting Traces

Start: `{6, 3, 8, 1, 4}`.

**17. Answer: `3 6 1 4 8`**

| Compare | Swap? | Array after |
|---|---|---|
| 6, 3 | yes | 3 6 8 1 4 |
| 6, 8 | no | 3 6 8 1 4 |
| 8, 1 | yes | 3 6 1 8 4 |
| 8, 4 | yes | 3 6 1 4 8 |

**18. Answer: `3 1 4 6 8`**

| Compare | Swap? | Array after |
|---|---|---|
| 3, 6 | no | 3 6 1 4 8 |
| 6, 1 | yes | 3 1 6 4 8 |
| 6, 4 | yes | 3 1 4 6 8 |
| 6, 8 | no | 3 1 4 6 8 |

**19. Answer: `1 3 4 6 8`**, pass 3 only swaps the first pair (3, 1); the array is now fully sorted.

### Part IV, Fill in the Blank

| # | Answer | Why |
|---|---|---|
| 20 | `&a[i][j]` | Address-of operator, 2D version, as in Sample Program 3. |
| 21 | `sum += a[i];` | Accumulate inside the loop; the average is computed after. (Check: sum = 30, avg = 6.0.) |
| 22 | `a[i] == key` | Comparison uses `==`; a single `=` assigns instead. |

### Part V, Model Solutions

**23. Largest and smallest of 10 integers.**

```c
#include <stdio.h>
#include <conio.h>

void main() {
    int a[10], i, big, small;
    clrscr();

    printf("Enter 10 integers: ");
    for (i = 0; i < 10; i++)
        scanf("%d", &a[i]);

    big   = a[0];
    small = a[0];
    for (i = 1; i < 10; i++) {
        if (a[i] > big)
            big = a[i];
        if (a[i] < small)
            small = a[i];
    }

    printf("Largest: %d\n", big);
    printf("Smallest: %d\n", small);
    getch();
}
```

Rubric notes: both `big` and `small` must start from `a[0]`, starting `big` at 0 is a graded classic that fails when every input is negative.

**24. Sum of a 3×3 matrix.**

```c
#include <stdio.h>
#include <conio.h>

void main() {
    int m[3][3], i, j, sum = 0;
    clrscr();

    printf("Enter the 9 elements of the matrix:\n");
    for (i = 0; i < 3; i++)
        for (j = 0; j < 3; j++)
            scanf("%d", &m[i][j]);

    for (i = 0; i < 3; i++)
        for (j = 0; j < 3; j++)
            sum += m[i][j];

    printf("Sum of all elements: %d\n", sum);
    getch();
}
```

Rubric notes: nested loops for input *and* for the sum; `&m[i][j]` in `scanf()`.

**25. Sort 5 integers ascending.**

```c
#include <stdio.h>
#include <conio.h>

void main() {
    int a[5], i, j, temp;
    clrscr();

    printf("Enter 5 integers: ");
    for (i = 0; i < 5; i++)
        scanf("%d", &a[i]);

    for (i = 0; i < 4; i++)
        for (j = 0; j < 4 - i; j++)
            if (a[j] > a[j + 1]) {
                temp     = a[j];
                a[j]     = a[j + 1];
                a[j + 1] = temp;
            }

    printf("Sorted: ");
    for (i = 0; i < 5; i++)
        printf("%d ", a[i]);
    getch();
}
```

Rubric notes: the swap must go through `temp` (three assignments); the outer loop repeats the pass, the inner loop does the compare-and-swap.

## Final Mock Exam B

### Part I, Multiple Choice

| # | Answer | Why |
|---|---|---|
| 1 | C | 6 × 2 = 12 elements × 4 bytes = 48 bytes. |
| 2 | A | First subscript selects the row, second the column. |
| 3 | B | Rows run 0–2, columns 0–3: last element is `m[2][3]`. |
| 4 | C | Row 0's inner brace has only {9}; the rest of row 0 is zero-filled. |
| 5 | B | 4,000 + (4 × 9) = 4,036. |
| 6 | B | I-L-O-I-L-O is 6 letters, plus the automatic `'\0'` = 7 elements. |

### Part II, Output Tracing

**7. Answer: `22`**, `i += 2` starting at 1 visits indices 1, 3, 5: 7 + 9 + 6 = 22.

**8. Answer: `3`**, adjacent pairs where left > right: (5, 3), (8, 6), (6, 2). The pair (3, 8) does not count.

**9. Answer: `9`**, `m[0][2]` is 4 and `m[1][1]` is 5.

**10. Answer: `8 4 6 2`**, the loop swaps row 0 with row 1, column by column.

| j | Matrix after |
|---|---|
| 0 | {8, 2; 6, 4} |
| 1 | {8, 4; 6, 2} |

**11. Answer: `55`**, sum of squares: 1 + 4 + 9 + 16 + 25 = 55.

**12. Answer: `3`**, C-O-D-I-N-G: the only `'I'` sits at index 3, so the loop prints 3 once.

**13. Answer: `15`**, `i + j == 2` picks the anti-diagonal: m[0][2] + m[1][1] + m[2][0] = 3 + 5 + 7 = 15.

**14. Answer: `3 1`**, find-the-minimum by index: the smallest value 1 sits at index 3; the program prints the index, then the value.

**15. Answer: `1 2 2 2 2`**, the loop runs *backwards*, so each subtraction uses the still-original left neighbor.

| i | a[i] before | a[i - 1] | a[i] after |
|---|---|---|---|
| 4 | 9 | 7 | 2 |
| 3 | 7 | 5 | 2 |
| 2 | 5 | 3 | 2 |
| 1 | 3 | 1 | 2 |

**16. Answer: `36`**, sum of everything in both matrices: (2 + 4 + 6 + 8) + (1 + 3 + 5 + 7) = 20 + 16 = 36.

### Part III, Sorting Traces

Start: `{7, 2, 9, 5, 3}`.

**17. Answer: `2 7 5 3 9`**

| Compare | Swap? | Array after |
|---|---|---|
| 7, 2 | yes | 2 7 9 5 3 |
| 7, 9 | no | 2 7 9 5 3 |
| 9, 5 | yes | 2 7 5 9 3 |
| 9, 3 | yes | 2 7 5 3 9 |

**18. Answer: `2 5 3 7 9`**

| Compare | Swap? | Array after |
|---|---|---|
| 2, 7 | no | 2 7 5 3 9 |
| 7, 5 | yes | 2 5 7 3 9 |
| 7, 3 | yes | 2 5 3 7 9 |
| 7, 9 | no | 2 5 3 7 9 |

**19. Answer: `5`**, pass 1 had 3 swaps, pass 2 had 2 swaps.

### Part IV, Fill in the Blank

| # | Answer | Why |
|---|---|---|
| 20 | `a[i] < a[i + 1]` | Descending: swap when the left value is *smaller*, so bigger values move left. |
| 21 | `count++` | One increment per match. |
| 22 | `printf("\n")` | The newline goes after the inner loop, once per row, not once per element. |

### Part V, Model Solutions

**23. Sum and average of 8 integers.**

```c
#include <stdio.h>
#include <conio.h>

void main() {
    int a[8], i, sum = 0;
    float avg;
    clrscr();

    printf("Enter 8 integers: ");
    for (i = 0; i < 8; i++)
        scanf("%d", &a[i]);

    for (i = 0; i < 8; i++)
        sum += a[i];
    avg = sum / 8.0;

    printf("Sum: %d\n", sum);
    printf("Average: %.2f\n", avg);
    getch();
}
```

Rubric notes: dividing by `8.0` (not `8`) keeps the decimal part; `avg` must be a `float` printed with `%f` or `%.2f`.

**24. Sum of two 2×2 matrices.**

```c
#include <stdio.h>
#include <conio.h>

void main() {
    int a[2][2], b[2][2], c[2][2];
    int i, j;
    clrscr();

    printf("Enter elements of matrix A:\n");
    for (i = 0; i < 2; i++)
        for (j = 0; j < 2; j++)
            scanf("%d", &a[i][j]);

    printf("Enter elements of matrix B:\n");
    for (i = 0; i < 2; i++)
        for (j = 0; j < 2; j++)
            scanf("%d", &b[i][j]);

    printf("Sum of A and B:\n");
    for (i = 0; i < 2; i++) {
        for (j = 0; j < 2; j++) {
            c[i][j] = a[i][j] + b[i][j];
            printf("%d\t", c[i][j]);
        }
        printf("\n");
    }
    getch();
}
```

Rubric notes: this is Sample Program 3 with fixed 2×2 dimensions, the `printf("\n")` after the inner loop earns the "one row per line" output points.

**25. Sort 5 integers descending.**

```c
#include <stdio.h>
#include <conio.h>

void main() {
    int a[5], i, j, temp;
    clrscr();

    printf("Enter 5 integers: ");
    for (i = 0; i < 5; i++)
        scanf("%d", &a[i]);

    for (i = 0; i < 4; i++)
        for (j = 0; j < 4 - i; j++)
            if (a[j] < a[j + 1]) {
                temp     = a[j];
                a[j]     = a[j + 1];
                a[j + 1] = temp;
            }

    printf("Sorted (descending): ");
    for (i = 0; i < 5; i++)
        printf("%d ", a[i]);
    getch();
}
```

Rubric notes: identical to the ascending sort except the comparison flips to `<`. Writing the ascending version by mistake loses the logic points but keeps declaration, input, and output points.

---

Scored 20+ on both finals? You are walking into that exam room ready. Anything you missed, chase it back to the exact Unit 1 section named in the Rapid Review Sheet and re-trace it by hand, that is how the points come back.
$md$, 10, null, null)
on conflict (id) do update set
  kind = excluded.kind, heading = excluded.heading, body_md = excluded.body_md,
  sort_order = excluded.sort_order, ide_language = excluded.ide_language, starter_code = excluded.starter_code
where public.sections.module_id = excluded.module_id;
