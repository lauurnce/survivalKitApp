-- ============================================================
-- Computer Programming 2, Modules & Sections
-- Subject ID: 10000000-0001-0002-0001-000000000001
-- Run after migration 002 and 1st_year_subjects.sql
--
-- Lesson 1 rows carry fixed ids: the production ids of the original
-- Unit 1 rows (rewritten in place, so every id is kept) plus one new
-- Key Takeaways row. Migration 20261101001000_cp2_units_1_3 applies the
-- same rows to production; the two must stay identical.
--
-- Lessons 2 and 3 live in cp2_units_2_3.sql. This file deletes every CP2
-- module, so run cp2_exam_prep_module.sql and cp2_units_2_3.sql after it.
-- ============================================================

DELETE FROM modules WHERE subject_id = '10000000-0001-0002-0001-000000000001';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('a3000001-0001-0002-0001-000000000001','10000000-0001-0002-0001-000000000001','Lesson 1: Arrays in Depth','lesson-1-arrays-in-depth',1);

-- ============================================================
-- LESSON 1: Arrays in Depth
-- ============================================================

INSERT INTO sections (id, module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('9138ee20-21db-47bc-8f0f-aa5e7d5ad6ba','a3000001-0001-0002-0001-000000000001','content','Arrays Recap: What Carries Over from CP1',$md$
This lesson picks up where CP1 Lesson 5 stopped. Here is the short version of what you already know, so we can spend this lesson on the CP2 material: passing arrays to functions, searching, the classic array algorithms, and two-dimensional arrays.

**What you already know:**
- An array is a fixed-size group of values of the **same type**, stored side by side in memory under one name.
- Indexes start at **0**, so `int quiz[5]` has `quiz[0]` to `quiz[4]`.
- A partial initializer fills the rest with zeros: `int a[10] = {0};` gives ten zeros.
- You read, print, and copy an array with a loop. `b = a;` does not copy an array.

### One program that uses all of it

```c
#include <stdio.h>
#define SIZE 5

int main(void) {
    int quiz[SIZE] = {18, 15, 20, 12, 17};
    int i, total = 0;

    for (i = 0; i < SIZE; i++)
        total += quiz[i];

    printf("Total: %d\n", total);
    printf("Average: %.2f\n", (double)total / SIZE);
    return 0;
}
```

Output:
```
Total: 82
Average: 16.40
```

Two habits in this program are worth copying for the rest of CP2:

1. **Name the size once with `#define`.** If your professor changes the class size from 5 to 40, you edit one line instead of hunting for every `5` in the program.
2. **Cast before dividing.** `total / SIZE` is integer division and gives `16`. `(double)total / SIZE` gives `16.40`.

### Counting elements with `sizeof`

`sizeof quiz` is the size of the whole array in bytes, and `sizeof quiz[0]` is the size of one element. Dividing them gives the number of elements:

```c
#include <stdio.h>

int main(void) {
    int quiz[] = {18, 15, 20, 12, 17};
    int count = (int)(sizeof quiz / sizeof quiz[0]);

    printf("%d elements\n", count);
    return 0;
}
```

Output:
```
5 elements
```

This trick only works in the function where the array is declared. Once you pass the array to another function, `sizeof` no longer sees the whole array (the next section explains why), so you pass the count yourself.

### C does not check your indexes

Valid indexes run from `0` to `SIZE - 1`. C will happily compile `quiz[5]` or `quiz[-1]`, but reading or writing there is **undefined behavior**: the program might print garbage, crash, or seem to work today and fail during your lab exam. The usual cause is a loop written with `<=`:

```c
for (i = 0; i <= SIZE; i++)   /* WRONG: the last pass uses quiz[5] */
for (i = 0; i < SIZE; i++)    /* right: stops after quiz[4] */
```
$md$, 1, NULL, NULL);

INSERT INTO sections (id, module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('cab8b50f-c709-4359-9013-39d4c619bf0a','a3000001-0001-0002-0001-000000000001','content','Passing Arrays to Functions',$md$
In CP1 you passed plain variables to functions, and each function got a **copy**. Arrays work differently: when you pass an array, C passes the **address of its first element**. The function works on the caller's actual array, not on a copy.

### The pattern

```c
#include <stdio.h>

void print_array(const int a[], int n) {
    int i;
    for (i = 0; i < n; i++)
        printf("%d ", a[i]);
    printf("\n");
}

void add_bonus(int a[], int n, int bonus) {
    int i;
    for (i = 0; i < n; i++)
        a[i] += bonus;
}

int main(void) {
    int scores[4] = {70, 82, 65, 90};

    print_array(scores, 4);
    add_bonus(scores, 4, 5);
    print_array(scores, 4);
    return 0;
}
```

Output:
```
70 82 65 90
75 87 70 95
```

Read it line by line:

- **The parameter is written `int a[]`.** You can put a number inside the brackets, but the compiler ignores it, so most programmers leave it empty.
- **The size travels as a separate parameter (`int n`).** The function has no other way to know how many elements there are.
- **The call uses the array name alone:** `add_bonus(scores, 4, 5)`. No brackets and no `&`.
- **`add_bonus` changed `scores` in `main`.** There is no copy, so the change sticks. That is why the second line printed 5 points higher.
- **`const int a[]` is a promise.** It tells the reader and the compiler that `print_array` only reads the array. If you write `a[i] = 0;` inside it, the program will not compile.

### Why `sizeof` does not work inside the function

Inside `print_array`, `a` is really a pointer to the first element (Lesson 3 explains pointers). So `sizeof a` gives the size of an address, usually 8 bytes on a 64-bit computer, not the size of the array. Modern compilers even warn you about it. The fix is the one above: pass the count.

### You cannot return an array

A function cannot return a whole array. Instead, the caller creates the array and the function fills it:

```c
#include <stdio.h>

void fill_squares(int out[], int n) {
    int i;
    for (i = 0; i < n; i++)
        out[i] = (i + 1) * (i + 1);
}

int main(void) {
    int sq[5];
    int i;

    fill_squares(sq, 5);
    for (i = 0; i < 5; i++)
        printf("%d ", sq[i]);
    printf("\n");
    return 0;
}
```

Output:
```
1 4 9 16 25
```

### Common mistakes

- `print_array(scores[4], 4);` passes one element (and `scores[4]` does not even exist). The compiler stops with an error or a warning about converting an `int` to a pointer. Pass `scores`.
- `print_array(scores[], 4);` is a syntax error. Brackets belong in the parameter list, not in the call.
- Forgetting that the function can change the caller's array. If a function should only read, mark the parameter `const`.
$md$, 2, NULL, NULL);

INSERT INTO sections (id, module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('826655d5-2deb-44cd-b24c-55a97aea9601','a3000001-0001-0002-0001-000000000001','content','Linear Search',$md$
**Searching** means finding where a value is stored in an array, or learning that it is not there. The simplest method is **linear search** (also called sequential search): look at the elements one by one, from the first to the last, and stop as soon as you find a match.

### The standard linear search function

```c
#include <stdio.h>

int linear_search(const int a[], int n, int key) {
    int i;
    for (i = 0; i < n; i++) {
        if (a[i] == key)
            return i;      /* found: stop right away */
    }
    return -1;             /* checked everything, not found */
}

int main(void) {
    int ids[6] = {1042, 2210, 1873, 3301, 2210, 1500};

    printf("%d\n", linear_search(ids, 6, 3301));
    printf("%d\n", linear_search(ids, 6, 2210));
    printf("%d\n", linear_search(ids, 6, 9999));
    return 0;
}
```

Output:
```
3
1
-1
```

### Tracing a search

Searching for `3301`:

| i | a[i] | a[i] == 3301? |
|---|---|---|
| 0 | 1042 | no |
| 1 | 2210 | no |
| 2 | 1873 | no |
| 3 | 3301 | **yes, return 3** |

Things to notice:

- **It returns the index, not the value.** The caller already knows the value (it is the key). What it needs is the position.
- **`-1` means "not found"** because a real index is never negative. Always check for it before using the result as an index.
- **It returns the first match.** `2210` appears at index 1 and index 4, and the function returns 1 because it stops there.
- **How many comparisons?** Best case 1 (the key is first). Worst case `n` (the key is last, or not in the array at all). On average about `n / 2` when the key is present.
- **The array does not need to be sorted.** That is the main advantage of linear search. Lesson 7 covers binary search, which is much faster but only works on a sorted array.

### Two variations you will be asked to write

**Count every match** instead of stopping at the first:

```c
int count_matches(const int a[], int n, int key) {
    int i, count = 0;
    for (i = 0; i < n; i++)
        if (a[i] == key)
            count++;
    return count;
}
```

**Search with a found flag**, the style some professors prefer because the loop has one exit:

```c
int i, found = 0;
for (i = 0; i < n && !found; i++)
    if (a[i] == key)
        found = 1;
```

Careful with this one: when the loop ends, `i` has already been moved one step past the match, so the match is at `i - 1`.

### The classic bug: giving up too early

```c
for (i = 0; i < n; i++) {
    if (a[i] == key)
        return i;
    else
        return -1;   /* WRONG: quits after checking only a[0] */
}
```

The `else` returns on the very first pass, so this "search" only ever checks `a[0]`. The `return -1` belongs **after** the loop, once every element has been checked.
$md$, 3, NULL, NULL);

INSERT INTO sections (id, module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('97673d3f-e063-4cc7-96a2-7f9a279f8526','a3000001-0001-0002-0001-000000000001','content','Common Array Algorithms',$md$
Most array questions on a CP2 exam are built from a handful of patterns. Learn these well and you can combine them to solve almost anything.

```c
#include <stdio.h>
#define N 7

int main(void) {
    int grades[N] = {88, 74, 91, 65, 79, 91, 70};
    int i, max_pos = 0, passed = 0, temp;

    /* 1. Largest value and its position */
    for (i = 1; i < N; i++)
        if (grades[i] > grades[max_pos])
            max_pos = i;
    printf("Highest: %d at index %d\n", grades[max_pos], max_pos);

    /* 2. Count the grades that pass (75 and up) */
    for (i = 0; i < N; i++)
        if (grades[i] >= 75)
            passed++;
    printf("Passed: %d of %d\n", passed, N);

    /* 3. Reverse in place: swap the ends, move inward */
    for (i = 0; i < N / 2; i++) {
        temp = grades[i];
        grades[i] = grades[N - 1 - i];
        grades[N - 1 - i] = temp;
    }
    for (i = 0; i < N; i++)
        printf("%d ", grades[i]);
    printf("\n");
    return 0;
}
```

Output:
```
Highest: 91 at index 2
Passed: 4 of 7
70 91 79 65 91 74 88
```

### 1. Largest (or smallest) value and its position

- **Remember the position, not just the value.** Keeping `max_pos` gives you both: the value is `grades[max_pos]`.
- **Start from the first element**, not from `0`. If every value were negative, a starting maximum of `0` would be wrong.
- **`>` keeps the first maximum, `>=` keeps the last.** Here `91` appears at index 2 and index 5. With `>` the answer is 2. Change it to `>=` and the answer becomes 5. Exams love this detail.
- For the smallest value, flip the comparison to `<`.

### 2. Counting (and summing) with a condition

Start a counter at 0, and add 1 every time the condition is true. The same shape gives you "sum of the passing grades" (`sum += grades[i]` instead of `passed++`) or "how many students are absent".

### 3. Reversing in place

Swap the first and last elements, then the second and second-to-last, and keep moving inward. The partner of index `i` is `N - 1 - i`.

The loop runs only `N / 2` times. With 7 elements that is 3 swaps, and the middle element (index 3) stays where it is. If you loop all `N` times, every pair gets swapped twice and the array ends up back in its original order.

### 4. Copying the elements that pass a test

To keep only some elements, use a second index that moves only when you store something:

```c
#include <stdio.h>

int main(void) {
    int grades[7] = {88, 74, 91, 65, 79, 91, 70};
    int passing[7];
    int i, k = 0;

    for (i = 0; i < 7; i++)
        if (grades[i] >= 75)
            passing[k++] = grades[i];   /* store, then move k */

    for (i = 0; i < k; i++)
        printf("%d ", passing[i]);
    printf("(%d kept)\n", k);
    return 0;
}
```

Output:
```
88 91 79 91 (4 kept)
```

`i` walks through every grade, while `k` counts how many were kept. At the end, `k` is also the number of valid elements in `passing`, so print only up to `k`.
$md$, 4, NULL, NULL);

INSERT INTO sections (id, module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('954aac16-2cbf-4c3c-b5f2-1e8162ba9bdc','a3000001-0001-0002-0001-000000000001','content','Two-Dimensional Arrays',$md$
A one-dimensional array is a single row of values. A **two-dimensional (2-D) array** is a table: it has rows and columns, like a class record where each row is a student and each column is a quiz.

### Declaring and initializing

```
data_type name[ROWS][COLUMNS];
```

The first size is the number of rows and the second is the number of columns. Use nested braces so each row is easy to see:

```c
int score[3][4] = {
    {18, 15, 20, 17},   /* row 0 */
    {12, 19, 16, 14},   /* row 1 */
    {20, 20, 18, 19}    /* row 2 */
};
```

- `score[1][2]` is row 1, column 2, which holds `16`. Both indexes start at 0.
- Missing values become 0, just like 1-D arrays: `int t[2][3] = { {1}, {4, 5} };` gives rows `1 0 0` and `4 5 0`.
- You may leave out the number of rows, but **never the number of columns**: `int t[][3] = { {1, 2, 3}, {4, 5, 6} };` makes 2 rows.
- A flat list such as `int t[2][3] = {1, 2, 3, 4, 5, 6};` also works and fills the array row by row, but most compilers warn about the missing inner braces. Use the nested form in your own code, and be ready to read the flat form on an exam.

### Nested loops: row totals and column totals

The outer loop picks a row, and the inner loop walks across its columns. Swap the loops to work column by column.

```c
#include <stdio.h>
#define STUDENTS 3
#define QUIZZES 4

int main(void) {
    int score[STUDENTS][QUIZZES] = {
        {18, 15, 20, 17},
        {12, 19, 16, 14},
        {20, 20, 18, 19}
    };
    int r, c, total;

    for (r = 0; r < STUDENTS; r++) {          /* one student at a time */
        total = 0;
        for (c = 0; c < QUIZZES; c++)
            total += score[r][c];
        printf("Student %d total: %d\n", r + 1, total);
    }

    for (c = 0; c < QUIZZES; c++) {           /* one quiz at a time */
        total = 0;
        for (r = 0; r < STUDENTS; r++)
            total += score[r][c];
        printf("Quiz %d total: %d\n", c + 1, total);
    }
    return 0;
}
```

Output:
```
Student 1 total: 70
Student 2 total: 61
Student 3 total: 77
Quiz 1 total: 50
Quiz 2 total: 54
Quiz 3 total: 54
Quiz 4 total: 50
```

Notice that `total = 0;` sits **inside** the outer loop. Each student (or quiz) starts from zero. Put it before the outer loop and every total after the first would include the ones before it.

### How a 2-D array sits in memory

Memory is one long line, so C stores a 2-D array **row by row** (this is called row-major order): all of row 0, then all of row 1, and so on. In the array above, `score[1][0]` comes right after `score[0][3]`.

That gives a formula for where any element sits, counting from the start of the array:

```
position of t[r][c] = r × COLUMNS + c
```

For `score[2][1]`: 2 × 4 + 1 = 9, so it is the 10th value in memory (position 9, counting from 0). This is also why C needs the number of columns: without it, it cannot work out where each row starts.
$md$, 5, NULL, NULL);

INSERT INTO sections (id, module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('6594930a-f6ff-400f-a6a4-c7628f8c4d91','a3000001-0001-0002-0001-000000000001','content','2-D Arrays and Functions: Matrix Operations',$md$
A 2-D array is passed to a function the same way as a 1-D array: by name, with no copy made. The one new rule is that the parameter **must state the number of columns**.

```c
void print_matrix(int m[][COLS], int rows);   /* right */
void print_matrix(int m[][], int rows);       /* compile error */
```

The row count can be left empty and passed as a separate parameter, just like the size of a 1-D array. The column count cannot, because C needs it to find where each row starts (the `r × COLUMNS + c` formula from the previous section).

### Matrix addition and transpose

```c
#include <stdio.h>
#define ROWS 2
#define COLS 3

void add_matrix(int a[][COLS], int b[][COLS], int sum[][COLS], int rows) {
    int r, c;
    for (r = 0; r < rows; r++)
        for (c = 0; c < COLS; c++)
            sum[r][c] = a[r][c] + b[r][c];
}

void print_matrix(int m[][COLS], int rows) {
    int r, c;
    for (r = 0; r < rows; r++) {
        for (c = 0; c < COLS; c++)
            printf("%4d", m[r][c]);
        printf("\n");
    }
}

int main(void) {
    int a[ROWS][COLS] = { {1, 2, 3}, {4, 5, 6} };
    int b[ROWS][COLS] = { {10, 20, 30}, {40, 50, 60} };
    int sum[ROWS][COLS];
    int t[COLS][ROWS];
    int r, c;

    add_matrix(a, b, sum, ROWS);
    print_matrix(sum, ROWS);

    /* Transpose: row r of a becomes column r of t */
    for (r = 0; r < ROWS; r++)
        for (c = 0; c < COLS; c++)
            t[c][r] = a[r][c];

    printf("Transpose of a:\n");
    for (r = 0; r < COLS; r++) {
        for (c = 0; c < ROWS; c++)
            printf("%4d", t[r][c]);
        printf("\n");
    }
    return 0;
}
```

Output:
```
  11  22  33
  44  55  66
Transpose of a:
   1   4
   2   5
   3   6
```

- **Addition** only works when both matrices have the same number of rows and columns. Each result cell is the sum of the two cells in the same position.
- **`%4d`** prints each number in a 4-character column, so the rows line up like a table.
- **The transpose swaps rows and columns.** A 2 × 3 matrix becomes 3 × 2, so `t` is declared `[COLS][ROWS]`, the other way around. The whole operation is the single line `t[c][r] = a[r][c];`.
- `sum` is filled by `add_matrix` and read back in `main`. As with 1-D arrays, the function writes straight into the caller's array.

### Diagonals of a square matrix

In a square matrix (same number of rows and columns), the **main diagonal** is every cell where the row equals the column, and the **other diagonal** is every cell where `c == N - 1 - r`. One loop is enough for each:

```c
#include <stdio.h>
#define N 3

int main(void) {
    int m[N][N] = { {2, 7, 6}, {9, 5, 1}, {4, 3, 8} };
    int i, main_diag = 0, other_diag = 0;

    for (i = 0; i < N; i++) {
        main_diag += m[i][i];
        other_diag += m[i][N - 1 - i];
    }
    printf("Main: %d, Other: %d\n", main_diag, other_diag);
    return 0;
}
```

Output:
```
Main: 15, Other: 15
```

(That matrix is a magic square: every row, column and diagonal adds up to 15.)

### Common mistakes

- Swapping the indexes: `score[c][r]` when you meant `score[r][c]`. If the array is not square, this reads outside the array.
- Declaring the transpose with the same shape as the original.
- Leaving out the column size in a function parameter.
$md$, 6, NULL, NULL);

INSERT INTO sections (id, module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('a3000002-0001-0002-0001-000000000001','a3000001-0001-0002-0001-000000000001','content','Key Takeaways',$md$
- Passing an array to a function passes the address of its first element, not a copy, so the function can change the caller's array. Call it with the name alone, `f(scores, n)`, and mark read-only parameters `const`.
- Always pass the number of elements as its own parameter: inside the function, `sizeof` sees an address, not the whole array.
- Linear search checks each element from first to last and returns the index of the first match, or `-1` when the key is missing. It needs up to `n` comparisons and works on unsorted arrays.
- For the largest value, keep its position and start from the first element. `>` keeps the first maximum and `>=` keeps the last; reversing in place swaps `a[i]` with `a[n - 1 - i]` for only `n / 2` passes.
- A 2-D array `t[ROWS][COLS]` is stored row by row, so `t[r][c]` sits at position `r × COLS + c`. A function parameter may leave out the rows but must state the columns: `int m[][COLS]`.
$md$, 7, NULL, NULL);

INSERT INTO sections (id, module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('01addedc-aa4b-4409-b99b-c00f5cbb7a8e','a3000001-0001-0002-0001-000000000001','content','Try It: Arrays in Depth',$md$
Change the key to search for, or edit a student's quiz scores, and predict the output before you press Run.
$md$, 8, 'c', $code$#include <stdio.h>
#define STUDENTS 3
#define QUIZZES 4

int linear_search(const int a[], int n, int key) {
    int i;
    for (i = 0; i < n; i++)
        if (a[i] == key)
            return i;
    return -1;
}

int main(void) {
    int id[STUDENTS] = {2301, 2417, 2388};
    int score[STUDENTS][QUIZZES] = {
        {18, 15, 20, 17},
        {12, 19, 16, 14},
        {20, 20, 18, 19}
    };
    int key = 2417;
    int pos = linear_search(id, STUDENTS, key);
    int c, total = 0;

    if (pos == -1) {
        printf("Student %d not found\n", key);
        return 0;
    }

    printf("Student %d is at index %d\n", key, pos);
    printf("Scores: ");
    for (c = 0; c < QUIZZES; c++) {
        printf("%d ", score[pos][c]);
        total += score[pos][c];
    }
    printf("\nTotal: %d, Average: %.2f\n", total, (double)total / QUIZZES);
    return 0;
}$code$);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a3000001-0001-0002-0001-000000000001','activity','Sample Program 1, Sorting an Array',$md$
This program sorts a small integer array using a basic comparison-and-swap approach.

```c
#include <stdio.h>
#include <conio.h>

void main() {
    clrscr();
    int num[3] = {5, 3, 7};
    int h, i, temp;

    for (h = 0; h < 3; ++h)
        for (i = 0; i < h; ++i) {
            if (num[i] > num[i + 1]) {
                temp     = num[i];
                num[i]   = num[i + 1];
                num[i+1] = temp;
            }
        }

    for (i = 0; i < 3; i++)
        printf("%d\n", num[i]);

    getch();
}
```

**Expected output:**
```
3
5
7
```
$md$, 8);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a3000001-0001-0002-0001-000000000001','activity','Sample Program 2, Counting Positives and Negatives',$md$
This program reads `n` integers into an array, then counts how many are negative and how many are non-negative.

```c
#include <stdio.h>
#include <conio.h>

void main() {
    int a[50], n, count_neg = 0, count_pos = 0, i;
    clrscr();

    printf("Enter the size of the array: ");
    scanf("%d", &n);

    printf("Enter the elements of the array: ");
    for (i = 0; i < n; i++)
        scanf("%d", &a[i]);

    for (i = 0; i < n; i++) {
        if (a[i] < 0)
            count_neg++;
        else
            count_pos++;
    }

    printf("Negative numbers: %d\n", count_neg);
    printf("Non-negative numbers: %d\n", count_pos);

    getch();
}
```
$md$, 9);

INSERT INTO sections (id, module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('2c4624c1-ee88-4f58-a442-106626c76ac8','a3000001-0001-0002-0001-000000000001','activity','Practice Exercises, Lesson 1',$md$
**Review questions:**
1. Declare a 2-D integer array `sales` for 4 branches and 7 days, with every element set to zero.
2. Given `int m[3][5];`: how many elements does it have, which element is stored right after `m[0][4]`, and at what position (counting from 0) is `m[2][3]` stored?
3. Why must you pass the number of elements to a function that receives an array?
4. Which of these parameter declarations will not compile: (a) `int a[]` (b) `int a[10]` (c) `int m[][4]` (d) `int m[][]`?
5. A linear search runs on an array of 50 elements. What is the largest number of comparisons it can make, and when does that happen?

**Trace and predict the output:**
```c
// (a)
int a[6] = {4, 9, 2, 9, 7, 1};
int i, pos = 0;
for (i = 1; i < 6; i++)
    if (a[i] >= a[pos]) pos = i;
printf("%d %d", a[pos], pos);

// (b)
int m[3][3] = { {1, 2, 3}, {4, 5, 6}, {7, 8, 9} };
int i, s = 0;
for (i = 0; i < 3; i++)
    s += m[i][2 - i];
printf("%d", s);

// (c)
void halve(int a[], int n) {
    int i;
    for (i = 0; i < n; i++)
        a[i] /= 2;
}
/* in main: */
int x[3] = {9, 4, 7};
halve(x, 3);
printf("%d %d %d", x[0], x[1], x[2]);
```

**Programming exercises:**
1. Write `int count_value(const int a[], int n, int key)` that returns how many times `key` appears in the array.
2. Write `int index_of_min(const int a[], int n)` that returns the position of the smallest element.
3. Read a 3 × 3 matrix from the keyboard. Print the sum of its main diagonal, and print whether the matrix is symmetric (`m[r][c] == m[c][r]` for every cell).
4. A jeepney terminal records the passengers of 5 trips a day for 3 days in a 3 × 5 array. Print each day's total, then the trip number (column) with the most passengers over all 3 days.
$md$, 9, NULL, NULL);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a3000001-0001-0002-0001-000000000001','activity','Sample Program 3, Adding Two Matrices',$md$
This program reads two matrices of equal dimensions from the user, adds them element by element, and stores the result in a third matrix.

```c
#include <stdio.h>
#include <conio.h>

void main() {
    int a[10][10], b[10][10], c[10][10];
    int i, j, m, n;
    clrscr();

    printf("Enter the number of rows and columns: ");
    scanf("%d %d", &m, &n);

    printf("Enter elements of matrix A:\n");
    for (i = 0; i < m; i++)
        for (j = 0; j < n; j++)
            scanf("%d", &a[i][j]);

    printf("Enter elements of matrix B:\n");
    for (i = 0; i < m; i++)
        for (j = 0; j < n; j++)
            scanf("%d", &b[i][j]);

    printf("Sum of A and B:\n");
    for (i = 0; i < m; i++) {
        for (j = 0; j < n; j++) {
            c[i][j] = a[i][j] + b[i][j];
            printf("%d\t", c[i][j]);
        }
        printf("\n");
    }

    getch();
}
```
$md$, 10);
