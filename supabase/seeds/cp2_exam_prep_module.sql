-- ============================================================
-- Computer Programming 2 — Exam Prep: Prelims & Finals
-- Subject ID: 10000000-0001-0002-0001-000000000001
-- Module ID:  a3000001-0001-0002-0001-0000000000e1
-- Purpose: exam-prep module (blueprints, free practice set,
--          prelim + final mock exams with full answer keys)
--          covering the currently published Unit 1: Arrays.
-- Idempotent: deletes only this module (sections cascade),
--             then re-inserts everything. Safe to re-run.
-- Run after cp2_modules_sections.sql.
-- ============================================================

DELETE FROM modules WHERE id = 'a3000001-0001-0002-0001-0000000000e1';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('a3000001-0001-0002-0001-0000000000e1','10000000-0001-0002-0001-000000000001','Exam Prep: Prelims & Finals','exam-prep-prelims-finals',2);

-- ============================================================
-- FREE SECTIONS (content)
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a3000001-0001-0002-0001-0000000000e1','content','Prelim Exam Blueprint & Study Plan',$md$
This module preps you for exams on everything in the currently published **Unit 1: Arrays**. Coverage will expand as new units are published.

### How a CP2 Prelim on Arrays Is Usually Structured

Different professors shuffle the weights, but almost every CP2 prelim on arrays is built from the same four parts:

| Part | Format | Typical Weight | What It Really Tests |
|---|---|---|---|
| I | Multiple choice / identification | 25–35% | Rules: declaration syntax, indexing, initialization behavior |
| II | Output tracing | 25–35% | Can you run a loop over an array in your head, line by line |
| III | Debugging / spot-the-error | 10–20% | Off-by-one loops, missing `&` in `scanf()`, illegal array assignment |
| IV | Fill-in-the-blank / write-the-code | 20–30% | Producing the standard array idioms from memory |

Tracing plus write-the-code is usually more than half the exam. You cannot pass by memorizing definitions alone — you have to practice running code on paper.

### Your Exact Memorize List

If you can do all ten of these cold, you are ready:

1. **Declaration syntax** — `data_type array_name[size];` for 1D and `data_type array_name[rows][columns];` for 2D.
2. **The three initialization rules** — more values than elements is a compile error; fewer values means the rest become zero; if you initialize everything you may omit the size.
3. **Indexing starts at zero** — for `int num[20]`, valid positions are `num[0]` through `num[19]`. There is no `num[20]`.
4. **The address formula** — element address = base address + (size of one element × index). Expect one arithmetic item on this.
5. **The loop-over-array idiom** — `for (i = 0; i < n; i++)`, and `scanf("%d", &a[i]);` with the address-of operator.
6. **No whole-array assignment** — `second = first;` is illegal; copy element by element with a loop.
7. **Strings end with `'\0'`** — a string literal of `n` letters needs `n + 1` array slots.
8. **2D traversal** — nested loops, rows outside, columns inside; a flat initializer list fills row by row (the last subscript increases fastest).
9. **Swapping needs a temp variable** — three assignments: `temp = a; a = b; b = temp;`.
10. **The compare-and-swap sorting logic** from Sample Program 1 — if the left neighbor is bigger, swap the pair.

### Top Mistakes That Cost Points

- Writing `a[size]` as if it were the last element — the last element is `a[size - 1]`.
- Using `<=` where `<` belongs in a loop condition, reading one slot past the end.
- Forgetting `&` in `scanf("%d", &a[i]);`.
- Filling a 2D initializer column-first instead of row-first when tracing.
- Assuming a declared-but-uninitialized array holds zeros (only *partially initialized* arrays zero-fill the remainder).
- "Swapping" with two assignments and no temp — one value gets destroyed.

### Realistic 7-Day Study Plan

Each day is keyed to section titles in Unit 1. Around 45–60 minutes a day is enough.

| Day | Study These Sections | What To Actually Do |
|---|---|---|
| 1 | "What is an Array and Why Do We Need One?" + "Characteristics of an Array" | Read both, then write the three defining properties from memory. Explain index notation out loud in one sentence. |
| 2 | "Declaring an Array in C" + "How C Finds an Element in Memory" | Write 10 declarations of your own (mix `int`, `float`, `char`, `double`). Compute 5 element addresses by hand with the formula. |
| 3 | "Storing Values in an Array" | Memorize the three ways to store values and the three initialization rules. Write the array-copy loop from memory twice. |
| 4 | "Character Arrays and Strings" + "Multidimensional Arrays" | Draw the memory picture of a string including `'\0'`. Fill a 3×3 table from a flat initializer list by hand. |
| 5 | "Sample Program 1 — Sorting an Array" + "Sample Program 2 — Counting Positives and Negatives" | Trace both programs on paper with your own input values before checking the expected output. |
| 6 | "Sample Program 3 — Adding Two Matrices" + "Practice Exercises" | Do all three trace exercises (Programs A, B, C) with a timer — 5 minutes each. |
| 7 | The **Free Practice Set** below | Simulate exam conditions: 30 minutes, no notes. Review every miss against the Unit 1 section it came from. |
$md$, 1),

('a3000001-0001-0002-0001-0000000000e1','content','Free Practice Set — 15 Items with Answer Key',$md$
Fifteen genuine exam-style items on one-dimensional arrays. Do all fifteen before looking at the key — treat it like the real thing: 30 minutes, no notes.

### Part I — Multiple Choice (Items 1–5)

**1.** Given `int num[20];`, which positions are valid?

- A. `num[1]` through `num[20]`
- B. `num[0]` through `num[19]`
- C. `num[0]` through `num[20]`
- D. `num[1]` through `num[19]`

**2.** Which declaration correctly creates a 20-element integer array?

- A. `int scores(20);`
- B. `array int scores[20];`
- C. `int scores[20];`
- D. `int[20] scores;`

**3.** After `int c[15] = {3, 7, 4, 6, 1};`, what is the value of `c[9]`?

- A. 0
- B. 1
- C. Garbage (unpredictable)
- D. Compile error

**4.** How many elements does `int b[] = {11, 21, 75, 24, 5};` have?

- A. Unknown until runtime
- B. 4
- C. 5
- D. Compile error — size is required

**5.** An integer array starts at memory address 5,000 and each integer occupies 4 bytes. What is the address of the element at index 6?

- A. 5,006
- B. 5,020
- C. 5,024
- D. 5,028

### Part II — Output Tracing (Items 6–9)

Write exactly what each fragment prints.

**6.**
```c
int a[6] = {4, 9, 2, 7, 6, 3};
int i, s = 0;
for (i = 0; i < 6; i++)
    if (a[i] % 2 == 0)
        s += a[i];
printf("%d", s);
```

**7.**
```c
int c[5] = {2, 4, 6, 8, 10};
int a, b = 0;
for (a = 0; a < 5; a++)
    if ((a % 2) == 0)
        b += c[a];
printf("%d", b);
```

**8.**
```c
int a[5] = {12, 5, 19, 8, 15};
int i, big = a[0];
for (i = 1; i < 5; i++)
    if (a[i] > big)
        big = a[i];
printf("%d", big);
```

**9.**
```c
int a[4] = {3, 1, 4, 1};
int i;
for (i = 3; i >= 0; i--)
    printf("%d", a[i]);
```

### Part III — Spot the Error (Items 10–12)

**10.** `int a[10];` is declared. What is wrong here, and what is the fix?

```c
for (i = 0; i <= 10; i++)
    scanf("%d", &a[i]);
```

**11.** What is wrong here, and what is the fix?

```c
for (i = 0; i < 10; i++)
    scanf("%d", a[i]);
```

**12.** Is this declaration legal? Why or why not?

```c
int a[5] = {1, 2, 3, 4, 5, 6};
```

### Part IV — Fill in the Blank (Items 13–15)

**13.** `char city[] = "CEBU";` — how many elements does `city` have?

**14.** Complete the loop so that every element of `first` is copied into `second` (both are 25-element `int` arrays):

```c
for (i = 0; i < 25; i++)
    ____;
```

**15.** Complete the statement so the program counts the negative values in `a` (size `n`):

```c
for (i = 0; i < n; i++)
    if (____)
        count_neg++;
```

---

### Answer Key

| # | Answer | One-Line Why |
|---|---|---|
| 1 | B | Indexing starts at 0, so 20 elements occupy positions 0 through 19. |
| 2 | C | `data_type array_name[size];` — square brackets after the name. |
| 3 | A | Only 5 of 15 elements are initialized; the remaining elements (indices 5–14) are automatically set to zero. |
| 4 | C | When all elements are initialized, the compiler counts them — 5 values means size 5. |
| 5 | C | 5,000 + (4 × 6) = 5,024, straight from the address formula. |
| 6 | `12` | The even values are 4, 2, and 6; 4 + 2 + 6 = 12. |
| 7 | `18` | The condition tests the *index*, not the value: indices 0, 2, 4 give 2 + 6 + 10 = 18. |
| 8 | `19` | Classic find-the-largest: 19 beats 12; 5, 8, 15 never do. |
| 9 | `1413` | Printed in reverse index order: a[3], a[2], a[1], a[0] = 1, 4, 1, 3. |
| 10 | Change `<=` to `<` | `i <= 10` reads into `a[10]`, one slot past the last element `a[9]`. |
| 11 | Add `&`: `&a[i]` | `scanf()` needs the address-of operator, just as with ordinary variables. |
| 12 | Illegal — compile error | Six initializers for five elements; you cannot supply more values than there are elements. |
| 13 | 5 | Four letters plus the automatic null terminator `'\0'`. |
| 14 | `second[i] = first[i]` | Arrays cannot be assigned whole; copy element by element. |
| 15 | `a[i] < 0` | Test each element against zero, exactly as in Sample Program 2. |

Scored 12 or better? You are on track. Below that, go back to the Day-by-day plan above and re-trace the sample programs. The four full mock exams below — 100 fresh items with complete answer keys and worked traces — come with the subject unlock.
$md$, 2);

-- ============================================================
-- PRELIM MOCK EXAMS (activities)
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a3000001-0001-0002-0001-0000000000e1','activity','Prelim Mock Exam A — 25 Items',$md$
Simulate the real thing: 60 minutes, no notes, answers on paper. The full answer key with worked traces is two sections down — do not open it until you finish.

### Part I — Multiple Choice (Items 1–8)

**1.** Every element of an array must be:

- A. Initialized at declaration
- B. Of the same data type
- C. An integer
- D. Smaller than the array size

**2.** The index of the *first* element of any C array is:

- A. 1
- B. 0
- C. −1
- D. Chosen by the programmer

**3.** How many elements does `float grid[5][3];` hold in total?

- A. 8
- B. 5
- C. 15
- D. 53

**4.** Given `int first[25], second[25];` which statement is **illegal** in C?

- A. `second[0] = first[0];`
- B. `second[24] = first[24];`
- C. `second = first;`
- D. `second[3] = first[7];`

**5.** After `int c[8] = {2, 4, 6};`, the value of `c[5]` is:

- A. 6
- B. Garbage (unpredictable)
- C. 0
- D. Compile error

**6.** An integer array starts at address 6,000 and each element occupies 4 bytes. The element at index 7 is at address:

- A. 6,007
- B. 6,024
- C. 6,028
- D. 6,032

**7.** Given `char word[7] = "MANILA";`, the value of `word[6]` is:

- A. `'A'`
- B. `'\0'`
- C. Garbage (unpredictable)
- D. `'6'`

**8.** Given `int mat[2][3] = {1, 2, 3, 4, 5, 6};`, the value of `mat[1][0]` is:

- A. 2
- B. 3
- C. 4
- D. 5

### Part II — Output Tracing (Items 9–18)

Write exactly what each fragment prints.

**9.**
```c
int a[5] = {3, 8, 1, 6, 2};
int i, s = 0;
for (i = 0; i < 5; i++)
    s += a[i];
printf("%d", s);
```

**10.**
```c
int a[5] = {3, 8, 1, 6, 2};
printf("%d", a[1] + a[3]);
```

**11.**
```c
int a[6] = {5, 2, 9, 4, 7, 1};
int i, count = 0;
for (i = 0; i < 6; i++)
    if (a[i] > 4)
        count++;
printf("%d", count);
```

**12.**
```c
int a[4] = {10, 20, 30, 40};
int i;
for (i = 0; i < 4; i++)
    a[i] = a[i] + i;
printf("%d %d", a[0], a[3]);
```

**13.**
```c
int a[5] = {1, 2, 3, 4, 5};
int i;
for (i = 1; i < 5; i++)
    a[i] = a[i - 1] + a[i];
printf("%d", a[4]);
```

**14.**
```c
char word[] = "ARRAY";
printf("%c%c", word[0], word[4]);
```

**15.**
```c
int m[2][3] = { {2, 4, 6}, {1, 3, 5} };
int i, j, s = 0;
for (i = 0; i < 2; i++)
    for (j = 0; j < 3; j++)
        if (i == j)
            s += m[i][j];
printf("%d", s);
```

**16.**
```c
int z[3][2] = {7, 8, 9, 10, 11, 12};
printf("%d", z[2][0]);
```

**17.**
```c
int a[2] = {5, 9};
int temp;
temp = a[0];
a[0] = a[1];
a[1] = temp;
printf("%d %d", a[0], a[1]);
```

**18.**
```c
int m[3][3] = {1, 2, 3, 4, 5, 6, 7, 8, 9};
int i, s = 0;
for (i = 0; i < 3; i++)
    s += m[i][1];
printf("%d", s);
```

### Part III — Fill in the Blank (Items 19–25)

Write the exact code that belongs in each blank.

**19.** Read `n` integers into array `a`:

```c
for (i = 0; i < n; i++)
    scanf("%d", ____);
```

**20.** Print the `n` elements of array `a` in reverse order — complete the entire loop header:

```c
for (____)
    printf("%d\n", a[i]);
```

**21.** Find the smallest value in a 2D array `z` with `R` rows and `C` columns:

```c
for (a = 0; a < R; ++a)
    for (b = 0; b < C; ++b)
        if (____)
            smallest = z[a][b];
```

**22.** Add two matrices `a` and `b` element by element into `c` (inside the nested loops over `i` and `j`):

```c
____ = a[i][j] + b[i][j];
```

**23.** Copy the 25-element array `first` into `second` (inside the loop over `i`):

```c
____ = first[i];
```

**24.** Count the negative values in array `a` of size `n`:

```c
for (i = 0; i < n; i++) {
    if (____)
        count_neg++;
    else
        count_pos++;
}
```

**25.** Write a declaration for a 12-element array of `float` values named `rates`.
$md$, 3),

('a3000001-0001-0002-0001-0000000000e1','activity','Prelim Mock Exam B — 25 Items',$md$
All-new items, a step harder than Exam A — this one includes sorting traces, the kind professors love for the last page of a prelim. Same rules: 60 minutes, no notes.

For the sorting items, **one pass** means: compare `a[0]` with `a[1]`, then `a[1]` with `a[2]`, and so on up to the last pair, swapping whenever the left value is greater than the right value (ascending order) — the same compare-and-swap logic as Sample Program 1.

### Part I — Multiple Choice (Items 1–7)

**1.** If an `int` occupies 4 bytes, how many bytes does `int a[10];` reserve?

- A. 10
- B. 14
- C. 40
- D. 44

**2.** After `int c[15] = {3, 7, 4, 6, 1};`, how many elements of `c` are equal to zero?

- A. 0
- B. 5
- C. 10
- D. 15

**3.** Which declaration is a **compile error**?

- A. `int r[2][2] = { {1, 2}, {3, 4} };`
- B. `int r[2][2] = {1, 2, 3, 4};`
- C. `int r[2][2] = { {1}, {3, 4} };`
- D. `int r[2][2] = { {1, 2, 3}, {4} };`

**4.** A `double` array starts at address 8,000 and each `double` occupies 8 bytes. The element at index 5 is at address:

- A. 8,005
- B. 8,040
- C. 8,048
- D. 8,058

**5.** Given `char s[] = "BAGUIO";`, the value of `s[3]` is:

- A. `'G'`
- B. `'U'`
- C. `'I'`
- D. `'\0'`

**6.** The *last* valid element of `int t[4][5];` is:

- A. `t[4][5]`
- B. `t[3][4]`
- C. `t[4][4]`
- D. `t[3][5]`

**7.** After `int a[5] = {9};`, the value of `a[0] + a[4]` is:

- A. 9
- B. 18
- C. Garbage (unpredictable)
- D. 0

### Part II — Output Tracing (Items 8–17)

Write exactly what each fragment prints.

**8.**
```c
int a[6] = {1, 4, 2, 8, 5, 7};
int i, s = 0;
for (i = 0; i < 6; i += 2)
    s += a[i];
printf("%d", s);
```

**9.**
```c
int a[5] = {2, 3, 5, 7, 11};
int i, p = 0;
for (i = 4; i >= 0; i--)
    if (a[i] % 2 != 0)
        p = a[i];
printf("%d", p);
```

**10.**
```c
int a[5] = {6, 1, 9, 4, 3};
int i, pos = 0;
for (i = 1; i < 5; i++)
    if (a[i] > a[pos])
        pos = i;
printf("%d", pos);
```

**11.**
```c
int a[4] = {1, 2, 3, 4};
int i;
for (i = 0; i < 3; i++)
    a[i + 1] = a[i] * 2;
printf("%d %d %d %d", a[0], a[1], a[2], a[3]);
```

**12.**
```c
char s[] = "PROGRAMMING";
int i = 0, count = 0;
while (s[i] != '\0') {
    if (s[i] == 'M')
        count++;
    i++;
}
printf("%d %d", count, i);
```

**13.**
```c
int m[2][2] = { {1, 2}, {3, 4} };
int t = m[0][1];
m[0][1] = m[1][0];
m[1][0] = t;
printf("%d%d%d%d", m[0][0], m[0][1], m[1][0], m[1][1]);
```

**14.**
```c
int m[2][3] = {5, 1, 4, 2, 6, 3};
int j, r0 = 0, r1 = 0;
for (j = 0; j < 3; j++) {
    r0 += m[0][j];
    r1 += m[1][j];
}
printf("%d %d", r0, r1);
```

**15.**
```c
int a[5] = {10, 20, 30, 40, 50};
int i = 2;
printf("%d", a[a[i] / 10]);
```

**16.**
```c
int a[7] = {3, 3, 1, 3, 2, 3, 1};
int i, c = 0;
for (i = 0; i < 7; i++)
    if (a[i] == 3)
        c++;
printf("%d", c);
```

**17.**
```c
int z[3][3] = {2, 5, 8, 1, 4, 7, 6, 9, 3};
int i, j, s = 0;
for (i = 0; i < 3; i++)
    for (j = 0; j < 3; j++)
        if (z[i][j] % 3 == 0)
            s += z[i][j];
printf("%d", s);
```

### Part III — Sorting Traces (Items 18–21)

Use the one-pass definition given at the top of this exam. Sort is **ascending**.

**18.** The array is `{9, 4, 7, 2, 6}`. Write the state of the array **after pass 1**.

**19.** Continuing from your answer to Item 18, write the state of the array **after pass 2**.

**20.** For the same starting array `{9, 4, 7, 2, 6}`, how many **swaps** happened during pass 1?

**21.** A different array is `{5, 1, 8, 3}`. Write the state of the array **after pass 1**.

### Part IV — Debugging & Fill in the Blank (Items 22–25)

**22.** `int a[5];` is declared. This input loop has **two** problems. Name both and write the corrected loop header.

```c
for (i = 1; i <= 5; i++)
    scanf("%d", &a[i]);
```

**23.** This code is supposed to swap `a[0]` and `a[1]`, but it does not work. Explain what actually happens, then write a correct version using a variable `temp`.

```c
a[0] = a[1];
a[1] = a[0];
```

**24.** Complete the linear search so that `found` is set when the value `key` is in array `a` of size `n`:

```c
int found = 0;
for (i = 0; i < n; i++)
    if (____)
        found = 1;
```

**25.** Complete the statement that reads one element of a 2D integer array `b` inside nested loops over `i` and `j`:

```c
scanf("%d", ____);
```
$md$, 4),

('a3000001-0001-0002-0001-0000000000e1','activity','Prelim Mock Exams — Answer Key with Explanations',$md$
Check your work item by item. For tracing items, follow the trace table row by row and find the exact line where your trace went wrong — that tells you which Unit 1 section to re-read.

## Exam A

### Part I — Multiple Choice

| # | Answer | Why |
|---|---|---|
| 1 | B | Same data type is one of the three defining properties of an array. |
| 2 | B | C counts positions starting from zero. |
| 3 | C | 5 rows × 3 columns = 15 elements. |
| 4 | C | Whole-array assignment is illegal; copy element by element with a loop. |
| 5 | C | Partial initialization sets the remaining elements (indices 3–7) to zero. |
| 6 | C | 6,000 + (4 × 7) = 6,028 by the address formula. |
| 7 | B | A string literal is stored with an automatic null terminator in the last slot. |
| 8 | C | A flat list fills row by row: row 0 = {1, 2, 3}, row 1 = {4, 5, 6}, so `mat[1][0]` is 4. |

### Part II — Output Tracing

**9. Answer: `20`** — sum of all elements.

| i | a[i] | s after |
|---|---|---|
| 0 | 3 | 3 |
| 1 | 8 | 11 |
| 2 | 1 | 12 |
| 3 | 6 | 18 |
| 4 | 2 | 20 |

**10. Answer: `14`** — `a[1]` is 8 and `a[3]` is 6; 8 + 6 = 14. No loop, just indexing.

**11. Answer: `3`** — the values greater than 4 are 5, 9, and 7.

| i | a[i] | a[i] > 4? | count after |
|---|---|---|---|
| 0 | 5 | yes | 1 |
| 1 | 2 | no | 1 |
| 2 | 9 | yes | 2 |
| 3 | 4 | no | 2 |
| 4 | 7 | yes | 3 |
| 5 | 1 | no | 3 |

**12. Answer: `10 43`** — each element gets its own index added: a[0] = 10 + 0 = 10 and a[3] = 40 + 3 = 43.

**13. Answer: `15`** — a running sum builds along the array, because each step uses the *already updated* `a[i - 1]`.

| i | a[i - 1] | a[i] before | a[i] after |
|---|---|---|---|
| 1 | 1 | 2 | 3 |
| 2 | 3 | 3 | 6 |
| 3 | 6 | 4 | 10 |
| 4 | 10 | 5 | 15 |

**14. Answer: `AY`** — A-R-R-A-Y occupies indices 0–4 (with `'\0'` at index 5), so `word[0]` is `'A'` and `word[4]` is `'Y'`.

**15. Answer: `5`** — `i == j` only holds at m[0][0] = 2 and m[1][1] = 3 (there is no row 2), so s = 2 + 3 = 5.

**16. Answer: `11`** — the flat list fills row by row: row 0 = {7, 8}, row 1 = {9, 10}, row 2 = {11, 12}; `z[2][0]` is 11.

**17. Answer: `9 5`** — the standard three-step swap with `temp`; the two values exchange places.

| Step | temp | a[0] | a[1] |
|---|---|---|---|
| start | — | 5 | 9 |
| temp = a[0] | 5 | 5 | 9 |
| a[0] = a[1] | 5 | 9 | 9 |
| a[1] = temp | 5 | 9 | 5 |

**18. Answer: `15`** — the loop sums column 1: m[0][1] + m[1][1] + m[2][1] = 2 + 5 + 8 = 15.

### Part III — Fill in the Blank

| # | Answer | Why |
|---|---|---|
| 19 | `&a[i]` | `scanf()` requires the address-of operator. |
| 20 | `i = n - 1; i >= 0; i--` | Start at the last index, stop after index 0, count down. |
| 21 | `z[a][b] < smallest` | Update `smallest` only when the current element is smaller — same logic as Practice Exercises Program C. |
| 22 | `c[i][j]` | The sum of each element pair lands in the same position of the result matrix. |
| 23 | `second[i]` | Element-by-element copy; whole-array assignment is illegal. |
| 24 | `a[i] < 0` | Negative test first; everything else falls into the `else`, as in Sample Program 2. |
| 25 | `float rates[12];` | Straight from the general form `data_type array_name[size];`. |

**Passing bar:** 18/25. Below 15? Redo Days 3–5 of the study plan before attempting Exam B.

## Exam B

### Part I — Multiple Choice

| # | Answer | Why |
|---|---|---|
| 1 | C | 10 elements × 4 bytes = 40 bytes of contiguous storage. |
| 2 | C | Indices 5–14 are automatically set to zero: 10 elements. |
| 3 | D | An inner brace may hold *fewer* values than the column count, never more — `{1, 2, 3}` has 3 values for 2 columns. |
| 4 | B | 8,000 + (8 × 5) = 8,040. |
| 5 | B | B-A-G-U at indices 0, 1, 2, 3 — so `s[3]` is `'U'`. |
| 6 | B | Rows run 0–3 and columns 0–4, so the last element is `t[3][4]`. |
| 7 | A | `a[0]` is 9 and `a[4]` is auto-zeroed, so the sum is 9. |

### Part II — Output Tracing

**8. Answer: `8`** — `i += 2` visits only indices 0, 2, 4: 1 + 2 + 5 = 8. Check the step size before you trace.

**9. Answer: `3`** — the loop runs *downward*, so `p` keeps getting overwritten; the odd value at the smallest index wins.

| i | a[i] | odd? | p after |
|---|---|---|---|
| 4 | 11 | yes | 11 |
| 3 | 7 | yes | 7 |
| 2 | 5 | yes | 5 |
| 1 | 3 | yes | 3 |
| 0 | 2 | no | 3 |

**10. Answer: `2`** — this prints the *index* of the largest value (9 sits at index 2), not the value itself. Read the `printf` carefully.

**11. Answer: `1 2 4 8`** — each new element is double the *already updated* previous one.

| i | a[i] (source) | a[i + 1] becomes |
|---|---|---|
| 0 | 1 | 2 |
| 1 | 2 | 4 |
| 2 | 4 | 8 |

**12. Answer: `2 11`** — P-R-O-G-R-A-M-M-I-N-G has two `'M'` characters, and `i` stops at 11, the number of letters before `'\0'`.

**13. Answer: `1324`** — the two off-diagonal elements m[0][1] and m[1][0] exchange their values 2 and 3; the diagonal stays put.

**14. Answer: `10 11`** — row sums: row 0 = {5, 1, 4} gives 10; row 1 = {2, 6, 3} gives 11 (flat list fills row by row).

**15. Answer: `40`** — work inside out: `a[2]` is 30, then 30 / 10 = 3, then `a[3]` is 40. An index can be any integer expression.

**16. Answer: `4`** — the value 3 appears at indices 0, 1, 3, and 5.

**17. Answer: `18`** — the multiples of 3 in the table are 6, 9, and 3: 6 + 9 + 3 = 18.

### Part III — Sorting Traces

**18. Answer: `4 7 2 6 9`** — the largest value bubbles to the end.

| Compare | Swap? | Array after |
|---|---|---|
| 9, 4 | yes | 4 9 7 2 6 |
| 9, 7 | yes | 4 7 9 2 6 |
| 9, 2 | yes | 4 7 2 9 6 |
| 9, 6 | yes | 4 7 2 6 9 |

**19. Answer: `4 2 6 7 9`**

| Compare | Swap? | Array after |
|---|---|---|
| 4, 7 | no | 4 7 2 6 9 |
| 7, 2 | yes | 4 2 7 6 9 |
| 7, 6 | yes | 4 2 6 7 9 |
| 7, 9 | no | 4 2 6 7 9 |

**20. Answer: `4`** — every comparison in pass 1 caused a swap (see the Item 18 table).

**21. Answer: `1 5 3 8`**

| Compare | Swap? | Array after |
|---|---|---|
| 5, 1 | yes | 1 5 8 3 |
| 5, 8 | no | 1 5 8 3 |
| 8, 3 | yes | 1 5 3 8 |

### Part IV — Debugging & Fill in the Blank

**22.** Problem 1: starting at `i = 1` skips `a[0]`, so the first slot never receives a value. Problem 2: `i <= 5` writes into `a[5]`, one slot past the last element `a[4]`. Corrected header: `for (i = 0; i < 5; i++)`.

**23.** The first line destroys the original `a[0]` before anything saves it — after both lines, `a[0]` and `a[1]` hold the *same* value (the old `a[1]`). Correct version:

```c
temp = a[0];
a[0] = a[1];
a[1] = temp;
```

**24.** `a[i] == key` — compare with `==`, not `=`. A single `=` would *assign* `key` into the array instead of comparing.

**25.** `&b[i][j]` — 2D elements need the address-of operator in `scanf()` too, exactly as in Sample Program 3.

**Passing bar:** 17/25 on Exam B (it is harder). If both A and B are at or above the bar, you are prelim-ready.
$md$, 5);

-- ============================================================
-- COMMON TRAPS (activity, with runnable C playground)
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('a3000001-0001-0002-0001-0000000000e1','activity','Common Array Traps & How to Avoid Them',$md$
Six traps account for most of the points lost on array exams. Each one comes with a mini-drill — do the drill *before* reading its answer.

### Trap 1 — Index Out of Bounds

For `int a[10];` the valid positions are `a[0]` through `a[9]`. There is no `a[10]` — the size is the *count* of elements, not the last index. C will not stop you from writing `a[10]`; it will silently read or overwrite memory that does not belong to the array.

**Drill:** Given `int a[10];`, which of these are invalid? `a[10]`, `a[0]`, `a[9]`, `a[-1]`

**Answer:** `a[10]` and `a[-1]`. The valid range is 0 through 9 — nothing below zero, nothing at or above the size.

### Trap 2 — Off-by-One in Loops

The loop condition `i <= size` visits one slot too many. The safe idiom is always `i < size`.

**Drill:** With `int a[5];`, how many elements does `for (i = 0; i <= 5; i++)` visit, and which access is illegal?

**Answer:** Six visits (i = 0, 1, 2, 3, 4, 5); the last one touches `a[5]`, which is out of bounds. Fix: `i < 5`.

### Trap 3 — Confusing Elements with Bytes

The address formula multiplies the index by the *size of one element in bytes*. Mixing up "number of elements" with "number of bytes" wrecks address items — and if you use `sizeof`, remember that `sizeof(a)` gives the total **bytes**, not the element count.

**Drill:** `int a[10];` and an `int` occupies 4 bytes. What is `sizeof(a)`? How do you get the element count from `sizeof`?

**Answer:** `sizeof(a)` is 40 (10 elements × 4 bytes). Element count = `sizeof(a) / sizeof(a[0])` = 40 / 4 = 10.

### Trap 4 — Row vs Column Confusion in 2D

In `m[rows][columns]`, the **first** subscript is the row. And a flat initializer list fills **row by row** — the last subscript increases fastest. Filling column-first is the single most common 2D tracing mistake.

**Drill:** For `int m[3][4];`, is `m[3][2]` valid? And given `int m[2][3] = {1, 2, 3, 4, 5, 6};`, what is `m[1][0]`?

**Answer:** `m[3][2]` is invalid — rows run 0 through 2 only. `m[1][0]` is 4: row 0 = {1, 2, 3}, row 1 = {4, 5, 6}.

### Trap 5 — Uninitialized Elements

Two different situations that students constantly mix up:

- **Partial initialization** — `int a[5] = {1, 2};` — the remaining elements are automatically set to **zero**.
- **No initialization at all** — `int b[5];` inside a function — the elements hold **garbage** (whatever was in that memory before).

**Drill:** After `int a[5] = {1, 2};` what is `a[4]`? After `int b[5];` (declared inside a function, no initializer) what is `b[4]`?

**Answer:** `a[4]` is 0 (partial initialization zero-fills). `b[4]` is garbage — unpredictable. Never assume zeros unless at least one initializer is present.

### Trap 6 — Swapping Without a Temp

Two plain assignments cannot exchange two values — the first assignment destroys one of them. A correct swap is always three steps through a temporary variable.

**Drill:** `int a[2] = {4, 9};` then `a[0] = a[1]; a[1] = a[0];` — what does `printf("%d %d", a[0], a[1]);` print?

**Answer:** `9 9`. The first line overwrote the 4 before anything saved it. Correct: `temp = a[0]; a[0] = a[1]; a[1] = temp;`

---

### Now Fix Them Yourself

The playground below contains Trap 2 and Trap 6 as live bugs. Run it once and watch what happens: the print loop walks past the end of the array (you will likely see a garbage sixth value), and the "swap" produces a duplicate. Fix the loop condition, complete the swap with `temp`, and run again — the final line should read `5 3 9 1 7`.
$md$, 6, 'c', $code$#include <stdio.h>

int main(void) {
    int a[5] = {7, 3, 9, 1, 5};
    int i, temp;

    /* BUG 1 (Trap 2): this loop walks one slot past the end.
       Run it once to see the garbage, then fix the condition. */
    for (i = 0; i <= 5; i++)
        printf("a[%d] = %d\n", i, a[i]);

    /* BUG 2 (Trap 6): this "swap" of a[0] and a[4] loses a value.
       Rewrite it as a three-step swap using temp. */
    a[0] = a[4];
    a[4] = a[0];

    printf("After swap: ");
    for (i = 0; i < 5; i++)
        printf("%d ", a[i]);
    printf("\n");

    return 0;
}$code$);

-- ============================================================
-- FINAL EXAM SECTIONS (activities)
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a3000001-0001-0002-0001-0000000000e1','activity','Final Exam Blueprint & Rapid Review Sheet',$md$
The final is cumulative over the currently published **Unit 1: Arrays**, with extra weight on the material closest to the exam: 2D arrays, matrices, and sorting. Coverage of this module will expand as new units are published.

### Typical Final Exam Blueprint

| Part | Format | Typical Weight | Focus |
|---|---|---|---|
| I | Multiple choice | 20–25% | 2D declarations, initialization rules, address formula |
| II | Output tracing | 30–35% | Nested loops over matrices, in-place array updates |
| III | Sorting traces | 10–15% | Array state after k passes, swap counts |
| IV | Fill-in-the-blank | 10–15% | The idioms below, verbatim |
| V | Write the program | 20–25% | Complete programs graded by rubric |

### Rapid Review — Every Idiom on One Sheet

Everything below comes straight from Unit 1. If you can write these from memory, Part IV and Part V are free points.

**Declarations:**

```c
int    a[20];             /* 1D: 20 integers               */
float  g[3][5];           /* 2D: 3 rows, 5 columns          */
char   name[5] = "CEBU";  /* 4 letters + '\0'               */
int    b[] = {1, 2, 3};   /* size inferred as 3             */
int    c[10] = {1, 2};    /* c[2]..c[9] auto-zeroed         */
```

**Find the maximum (for the minimum, flip the comparison to `<`):**

```c
big = a[0];
for (i = 1; i < n; i++)
    if (a[i] > big)
        big = a[i];
```

**Sum and average:**

```c
sum = 0;
for (i = 0; i < n; i++)
    sum += a[i];
avg = sum / (float) n;
```

**Count matching values:**

```c
count = 0;
for (i = 0; i < n; i++)
    if (a[i] == key)
        count++;
```

**Linear search:**

```c
found = 0;
for (i = 0; i < n; i++)
    if (a[i] == key)
        found = 1;
```

**Bubble-sort skeleton (ascending — one full sort):**

```c
for (i = 0; i < n - 1; i++)
    for (j = 0; j < n - 1 - i; j++)
        if (a[j] > a[j + 1]) {
            temp     = a[j];
            a[j]     = a[j + 1];
            a[j + 1] = temp;
        }
```

For **descending** order, change the condition to `a[j] < a[j + 1]`. For a **single pass** (the tracing favorite), keep only the inner loop with `j` running from 0 to n − 2.

**Matrix traversal (read, process, or print — same shape every time):**

```c
for (i = 0; i < rows; i++) {
    for (j = 0; j < cols; j++)
        printf("%d\t", m[i][j]);
    printf("\n");   /* new line after each row */
}
```

**Matrix addition (from Sample Program 3):**

```c
for (i = 0; i < m; i++)
    for (j = 0; j < n; j++)
        c[i][j] = a[i][j] + b[i][j];
```

### The Five Facts You Must Not Blank On

1. Indices run 0 to size − 1. Always.
2. Element address = base + (element size × index).
3. Partial initialization zero-fills; no initialization means garbage.
4. Flat 2D initializers fill row by row.
5. `scanf()` needs `&` — for 1D and 2D elements alike.
$md$, 7);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a3000001-0001-0002-0001-0000000000e1','activity','Final Mock Exam A — 25 Items',$md$
Cumulative over Unit 1, weighted toward 2D arrays, matrices, and sorting — like the real final. 90 minutes, no notes. Items 23–25 are write-the-program items; write complete programs, not fragments.

For sorting items, **one pass** means comparing each adjacent pair left to right, swapping when the left value is greater (ascending).

### Part I — Multiple Choice (Items 1–6)

**1.** How many elements does `int t[4][6];` hold?

- A. 10
- B. 24
- C. 46
- D. 20

**2.** Which declaration creates a table of `float` values with 3 rows and 5 columns?

- A. `float g[5][3];`
- B. `float g[3][5];`
- C. `float g[3, 5];`
- D. `g float[3][5];`

**3.** Given `int m[2][4] = {1, 2, 3, 4, 5, 6, 7, 8};`, the value of `m[1][2]` is:

- A. 3
- B. 6
- C. 7
- D. 8

**4.** Given `int m[3][3] = { {1, 2}, {4, 5, 6}, {7} };`, the value of `m[0][2]` is:

- A. 3
- B. 0
- C. 6
- D. Garbage (unpredictable)

**5.** To store the string `"DAVAO"`, a character array needs at least how many elements?

- A. 5
- B. 6
- C. 7
- D. 4

**6.** In an ascending bubble sort, a pair of adjacent elements is swapped when:

- A. The left value is less than the right value
- B. The left value is greater than the right value
- C. The two values are equal
- D. On every comparison

### Part II — Output Tracing (Items 7–16)

Write exactly what each fragment prints.

**7.**
```c
int a[2][2] = {1, 2, 3, 4};
int b[2][2] = {5, 6, 7, 8};
int c[2][2];
int i, j;
for (i = 0; i < 2; i++)
    for (j = 0; j < 2; j++)
        c[i][j] = a[i][j] + b[i][j];
printf("%d %d", c[0][1], c[1][0]);
```

**8.**
```c
int m[3][3] = {4, 1, 2, 3, 5, 6, 7, 8, 9};
int i, s = 0;
for (i = 0; i < 3; i++)
    s += m[i][i];
printf("%d", s);
```

**9.**
```c
int m[2][3] = {1, 2, 3, 4, 5, 6};
int i, j;
for (i = 0; i < 2; i++) {
    for (j = 0; j < 3; j++)
        printf("%d", m[i][j]);
    printf("\n");
}
```

**10.**
```c
int z[2][4] = {9, 4, 8, 2, 7, 3, 6, 5};
int a, b, smallest = 999;
for (a = 0; a < 2; ++a)
    for (b = 0; b < 4; ++b)
        if (z[a][b] < smallest)
            smallest = z[a][b];
printf("%d", smallest);
```

**11.**
```c
int m[3][2] = {4, 7, 2, 9, 6, 1};
int i, j, c = 0;
for (i = 0; i < 3; i++)
    for (j = 0; j < 2; j++)
        if (m[i][j] > 5)
            c++;
printf("%d", c);
```

**12.**
```c
int m[3][2] = {3, 8, 5, 2, 4, 6};
int i, big = m[0][1];
for (i = 1; i < 3; i++)
    if (m[i][1] > big)
        big = m[i][1];
printf("%d", big);
```

**13.**
```c
int a[5] = {2, 5, 1, 4, 3};
int i, temp;
for (i = 0; i < 4; i++)
    if (a[i] > a[i + 1]) {
        temp = a[i];
        a[i] = a[i + 1];
        a[i + 1] = temp;
    }
printf("%d %d %d %d %d", a[0], a[1], a[2], a[3], a[4]);
```

**14.**
```c
char s[] = "MATRIX";
int i = 0;
while (s[i] != '\0')
    i++;
printf("%d", i);
```

**15.**
```c
int m[2][2] = {1, 2, 3, 4};
int i, j;
for (i = 0; i < 2; i++)
    for (j = 0; j < 2; j++)
        m[i][j] = m[i][j] * (i + j);
printf("%d %d %d %d", m[0][0], m[0][1], m[1][0], m[1][1]);
```

**16.**
```c
int m[2][3] = {1, 2, 3, 4, 5, 6};
int j, s = 0;
for (j = 0; j < 3; j++)
    s += m[1][j] - m[0][j];
printf("%d", s);
```

### Part III — Sorting Traces (Items 17–19)

The array is `{6, 3, 8, 1, 4}`, sorted **ascending**.

**17.** Write the state of the array **after pass 1**.

**18.** Write the state of the array **after pass 2**.

**19.** Write the state of the array **after pass 3**.

### Part IV — Fill in the Blank (Items 20–22)

**20.** Read every element of an `m`-row, `n`-column matrix `a`:

```c
for (i = 0; i < m; i++)
    for (j = 0; j < n; j++)
        scanf("%d", ____);
```

**21.** Complete the loop body so `avg` becomes the average of the five elements:

```c
int a[5] = {4, 8, 6, 2, 10};
int i, sum = 0;
float avg;
for (i = 0; i < 5; i++)
    ____
avg = sum / 5.0;
```

**22.** Complete the linear search condition:

```c
for (i = 0; i < n; i++)
    if (____)
        found = 1;
```

### Part V — Write the Program (Items 23–25)

Write each as a complete C program. Rubric per item (10 points): correct declarations (2), correct input loop with `&` (2), correct core logic (4), correct output (2).

**23.** Read 10 integers into an array, then print the **largest** and the **smallest** value.

**24.** Read a 3×3 integer matrix, then print the **sum of all nine elements**.

**25.** Read 5 integers into an array, sort them in **ascending** order using compare-and-swap passes, then print the sorted array on one line.
$md$, 8);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a3000001-0001-0002-0001-0000000000e1','activity','Final Mock Exam B — 25 Items',$md$
All-new items, same blueprint as Final Mock Exam A. 90 minutes, no notes. The same one-pass definition applies to the sorting items, and the same 10-point rubric (declarations 2, input 2, logic 4, output 2) applies to items 23–25.

### Part I — Multiple Choice (Items 1–6)

**1.** If an `int` occupies 4 bytes, how many bytes does `int g[6][2];` reserve?

- A. 12
- B. 24
- C. 48
- D. 8

**2.** In the expression `m[i][j]`, the subscript `i` selects the:

- A. Row
- B. Column
- C. Address
- D. Data type

**3.** The *last* valid element of `int m[3][4];` is:

- A. `m[3][4]`
- B. `m[2][3]`
- C. `m[3][3]`
- D. `m[2][4]`

**4.** Given `int r[2][3] = { {9}, {8, 7} };`, the value of `r[0][1]` is:

- A. 9
- B. 8
- C. 0
- D. Garbage (unpredictable)

**5.** A `float` array starts at address 4,000 and each `float` occupies 4 bytes. The element at index 9 is at address:

- A. 4,009
- B. 4,036
- C. 4,040
- D. 4,032

**6.** How many elements does `char q[] = "ILOILO";` have?

- A. 6
- B. 7
- C. 8
- D. Unknown until runtime

### Part II — Output Tracing (Items 7–16)

Write exactly what each fragment prints.

**7.**
```c
int a[6] = {2, 7, 4, 9, 1, 6};
int i, s = 0;
for (i = 1; i < 6; i += 2)
    s += a[i];
printf("%d", s);
```

**8.**
```c
int a[5] = {5, 3, 8, 6, 2};
int i, c = 0;
for (i = 0; i < 4; i++)
    if (a[i] > a[i + 1])
        c++;
printf("%d", c);
```

**9.**
```c
int m[2][3] = { {3, 1, 4}, {1, 5, 9} };
printf("%d", m[0][2] + m[1][1]);
```

**10.**
```c
int m[2][2] = {6, 2, 8, 4};
int j, t;
for (j = 0; j < 2; j++) {
    t = m[0][j];
    m[0][j] = m[1][j];
    m[1][j] = t;
}
printf("%d %d %d %d", m[0][0], m[0][1], m[1][0], m[1][1]);
```

**11.**
```c
int a[5] = {1, 2, 3, 4, 5};
int i, s = 0;
for (i = 0; i < 5; i++)
    s += a[i] * a[i];
printf("%d", s);
```

**12.**
```c
char s[] = "CODING";
int i;
for (i = 0; s[i] != '\0'; i++)
    if (s[i] == 'I')
        printf("%d", i);
```

**13.**
```c
int m[3][3] = {1, 2, 3, 4, 5, 6, 7, 8, 9};
int i, j, s = 0;
for (i = 0; i < 3; i++)
    for (j = 0; j < 3; j++)
        if (i + j == 2)
            s += m[i][j];
printf("%d", s);
```

**14.**
```c
int a[4] = {8, 3, 5, 1};
int i, pos = 0;
for (i = 1; i < 4; i++)
    if (a[i] < a[pos])
        pos = i;
printf("%d %d", pos, a[pos]);
```

**15.**
```c
int a[5] = {1, 3, 5, 7, 9};
int i;
for (i = 4; i > 0; i--)
    a[i] = a[i] - a[i - 1];
printf("%d %d %d %d %d", a[0], a[1], a[2], a[3], a[4]);
```

**16.**
```c
int a[2][2] = {2, 4, 6, 8};
int b[2][2] = {1, 3, 5, 7};
int i, j, s = 0;
for (i = 0; i < 2; i++)
    for (j = 0; j < 2; j++)
        s += a[i][j] + b[i][j];
printf("%d", s);
```

### Part III — Sorting Traces (Items 17–19)

The array is `{7, 2, 9, 5, 3}`, sorted **ascending**.

**17.** Write the state of the array **after pass 1**.

**18.** Write the state of the array **after pass 2**.

**19.** How many **swaps** happened in total across pass 1 and pass 2 combined?

### Part IV — Fill in the Blank (Items 20–22)

**20.** Complete the condition so one pass moves values toward **descending** order (largest first):

```c
for (i = 0; i < n - 1; i++)
    if (____) {
        temp = a[i];
        a[i] = a[i + 1];
        a[i + 1] = temp;
    }
```

**21.** Complete the statement so the program counts how many elements equal `key`:

```c
for (i = 0; i < n; i++)
    if (a[i] == key)
        ____;
```

**22.** Complete the statement so each row of the matrix prints on its own line:

```c
for (i = 0; i < m; i++) {
    for (j = 0; j < n; j++)
        printf("%d\t", x[i][j]);
    ____;
}
```

### Part V — Write the Program (Items 23–25)

**23.** Read 8 integers into an array, then print their **sum** and their **average** (the average must show decimal places).

**24.** Read two 2×2 integer matrices A and B, then print their **sum matrix**, one row per line.

**25.** Read 5 integers into an array, sort them in **descending** order using compare-and-swap passes, then print the sorted array on one line.
$md$, 9);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a3000001-0001-0002-0001-0000000000e1','activity','Final Mock Exams — Answer Key with Explanations',$md$
Full key for both final mocks, including complete model programs for the write-the-program items. Model solutions follow the same style as the Unit 1 sample programs (`conio.h`, `void main()`, `clrscr()`, `getch()`); if your compiler is not Turbo C, remove those three and use `int main(void)` with `return 0;` — the array logic is identical either way.

## Final Mock Exam A

### Part I — Multiple Choice

| # | Answer | Why |
|---|---|---|
| 1 | B | 4 rows × 6 columns = 24 elements. |
| 2 | B | Rows first, columns second: `float g[3][5];`. |
| 3 | C | Row 1 = {5, 6, 7, 8}; index 2 within that row is 7. |
| 4 | B | Row 0's inner brace has only {1, 2}; the rest of that row is zero-filled. |
| 5 | B | Five letters plus `'\0'` needs 6 slots. |
| 6 | B | Ascending: swap when the left neighbor is bigger. |

### Part II — Output Tracing

**7. Answer: `8 10`** — c becomes {6, 8; 10, 12}; the program prints `c[0][1]` then `c[1][0]`.

**8. Answer: `18`** — main diagonal of {4, 1, 2; 3, 5, 6; 7, 8, 9}: 4 + 5 + 9 = 18.

**9. Answer:**
```
123
456
```
Row-by-row printing with a newline after each inner loop.

**10. Answer: `2`** — the smallest of {9, 4, 8, 2, 7, 3, 6, 5}, found exactly as in Practice Exercises Program C.

**11. Answer: `3`** — the values greater than 5 are 7, 9, and 6.

**12. Answer: `8`** — column 1 holds 8, 2, 6; `big` starts at 8 and nothing beats it.

**13. Answer: `2 1 4 3 5`** — this is one sorting pass.

| Compare | Swap? | Array after |
|---|---|---|
| 2, 5 | no | 2 5 1 4 3 |
| 5, 1 | yes | 2 1 5 4 3 |
| 5, 4 | yes | 2 1 4 5 3 |
| 5, 3 | yes | 2 1 4 3 5 |

**14. Answer: `6`** — the loop counts characters until `'\0'`; MATRIX has 6 letters.

**15. Answer: `0 2 3 8`** — each element is multiplied by (row + column): 1 × 0 = 0, 2 × 1 = 2, 3 × 1 = 3, 4 × 2 = 8.

**16. Answer: `9`** — (4 − 1) + (5 − 2) + (6 − 3) = 3 + 3 + 3 = 9.

### Part III — Sorting Traces

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

**19. Answer: `1 3 4 6 8`** — pass 3 only swaps the first pair (3, 1); the array is now fully sorted.

### Part IV — Fill in the Blank

| # | Answer | Why |
|---|---|---|
| 20 | `&a[i][j]` | Address-of operator, 2D version — as in Sample Program 3. |
| 21 | `sum += a[i];` | Accumulate inside the loop; the average is computed after. (Check: sum = 30, avg = 6.0.) |
| 22 | `a[i] == key` | Comparison uses `==`; a single `=` assigns instead. |

### Part V — Model Solutions

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

Rubric notes: both `big` and `small` must start from `a[0]` — starting `big` at 0 is a graded classic that fails when every input is negative.

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

### Part I — Multiple Choice

| # | Answer | Why |
|---|---|---|
| 1 | C | 6 × 2 = 12 elements × 4 bytes = 48 bytes. |
| 2 | A | First subscript selects the row, second the column. |
| 3 | B | Rows run 0–2, columns 0–3: last element is `m[2][3]`. |
| 4 | C | Row 0's inner brace has only {9}; the rest of row 0 is zero-filled. |
| 5 | B | 4,000 + (4 × 9) = 4,036. |
| 6 | B | I-L-O-I-L-O is 6 letters, plus the automatic `'\0'` = 7 elements. |

### Part II — Output Tracing

**7. Answer: `22`** — `i += 2` starting at 1 visits indices 1, 3, 5: 7 + 9 + 6 = 22.

**8. Answer: `3`** — adjacent pairs where left > right: (5, 3), (8, 6), (6, 2). The pair (3, 8) does not count.

**9. Answer: `9`** — `m[0][2]` is 4 and `m[1][1]` is 5.

**10. Answer: `8 4 6 2`** — the loop swaps row 0 with row 1, column by column.

| j | Matrix after |
|---|---|
| 0 | {8, 2; 6, 4} |
| 1 | {8, 4; 6, 2} |

**11. Answer: `55`** — sum of squares: 1 + 4 + 9 + 16 + 25 = 55.

**12. Answer: `3`** — C-O-D-I-N-G: the only `'I'` sits at index 3, so the loop prints 3 once.

**13. Answer: `15`** — `i + j == 2` picks the anti-diagonal: m[0][2] + m[1][1] + m[2][0] = 3 + 5 + 7 = 15.

**14. Answer: `3 1`** — find-the-minimum by index: the smallest value 1 sits at index 3; the program prints the index, then the value.

**15. Answer: `1 2 2 2 2`** — the loop runs *backwards*, so each subtraction uses the still-original left neighbor.

| i | a[i] before | a[i - 1] | a[i] after |
|---|---|---|---|
| 4 | 9 | 7 | 2 |
| 3 | 7 | 5 | 2 |
| 2 | 5 | 3 | 2 |
| 1 | 3 | 1 | 2 |

**16. Answer: `36`** — sum of everything in both matrices: (2 + 4 + 6 + 8) + (1 + 3 + 5 + 7) = 20 + 16 = 36.

### Part III — Sorting Traces

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

**19. Answer: `5`** — pass 1 had 3 swaps, pass 2 had 2 swaps.

### Part IV — Fill in the Blank

| # | Answer | Why |
|---|---|---|
| 20 | `a[i] < a[i + 1]` | Descending: swap when the left value is *smaller*, so bigger values move left. |
| 21 | `count++` | One increment per match. |
| 22 | `printf("\n")` | The newline goes after the inner loop — once per row, not once per element. |

### Part V — Model Solutions

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

Rubric notes: this is Sample Program 3 with fixed 2×2 dimensions — the `printf("\n")` after the inner loop earns the "one row per line" output points.

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

Scored 20+ on both finals? You are walking into that exam room ready. Anything you missed, chase it back to the exact Unit 1 section named in the Rapid Review Sheet and re-trace it by hand — that is how the points come back.
$md$, 10);
