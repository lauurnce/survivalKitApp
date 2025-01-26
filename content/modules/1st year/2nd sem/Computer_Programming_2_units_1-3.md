# Computer Programming 2, Lessons 1 to 3
<!-- subject: Computer Programming 2 | year: 1st -->

Source of truth for the rows is `supabase/seeds/cp2_modules_sections.sql` (Lesson 1) and `supabase/seeds/cp2_units_2_3.sql` (Lessons 2 and 3). This file is the same content as one readable study guide.

---

# Lesson 1: Arrays in Depth

<!-- kind: content -->
## Arrays Recap: What Carries Over from CP1

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

---

<!-- kind: content -->
## Passing Arrays to Functions

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

---

<!-- kind: content -->
## Linear Search

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

---

<!-- kind: content -->
## Common Array Algorithms

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

---

<!-- kind: content -->
## Two-Dimensional Arrays

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

The same array, as a table and as it sits in memory:

![int score[3][4] as a table of 3 rows and 4 columns, and the same 12 values in memory in one line: row 0, then row 1, then row 2, at positions 0 to 11. score[2][1], the 20 in row 2, column 1, is at position 2 × 4 + 1 = 9.](/diagrams/cp2/lesson-1-2d-array-row-major.svg)

---

<!-- kind: content -->
## 2-D Arrays and Functions: Matrix Operations

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

---

<!-- kind: content -->
## Key Takeaways

- Passing an array to a function passes the address of its first element, not a copy, so the function can change the caller's array. Call it with the name alone, `f(scores, n)`, and mark read-only parameters `const`.
- Always pass the number of elements as its own parameter: inside the function, `sizeof` sees an address, not the whole array.
- Linear search checks each element from first to last and returns the index of the first match, or `-1` when the key is missing. It needs up to `n` comparisons and works on unsorted arrays.
- For the largest value, keep its position and start from the first element. `>` keeps the first maximum and `>=` keeps the last; reversing in place swaps `a[i]` with `a[n - 1 - i]` for only `n / 2` passes.
- A 2-D array `t[ROWS][COLS]` is stored row by row, so `t[r][c]` sits at position `r × COLS + c`. A function parameter may leave out the rows but must state the columns: `int m[][COLS]`.

---

<!-- kind: content -->
## Try It: Arrays in Depth

Change the key to search for, or edit a student's quiz scores, and predict the output before you press Run.

Starter code:

```c
#include <stdio.h>
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
}
```

---

<!-- kind: activity -->
## Practice Exercises, Lesson 1

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

---

<!-- kind: activity -->
## Worked Exam Solutions + How-to-Pass Tips, Lesson 1

**Answer Key, Review Questions**

1. `int sales[4][7] = {0};`, the single `0` sets the first element and the partial initializer zero-fills the other 27.
2. 3 × 5 = **15 elements**. Right after `m[0][4]` (the end of row 0) comes **`m[1][0]`** (the start of row 1). `m[2][3]` is at position 2 × 5 + 3 = **13**.
3. Inside the function the array parameter is only the address of the first element, so `sizeof` cannot tell the function how many elements there are. Without the count, the loop has no safe place to stop.
4. **(d)** `int m[][]`. A 2-D parameter must state the number of columns. (b) compiles, the `10` is simply ignored.
5. **50 comparisons**, when the key is the last element or is not in the array at all.

**Answer Key, Traces**

- (a) **`9 3`**. `9` appears at index 1 and index 3. Because the test is `>=`, the tie at index 3 also replaces `pos`. With `>` the answer would be `9 1`.
- (b) **`15`**. `m[i][2 - i]` visits `m[0][2]`, `m[1][1]`, `m[2][0]`, which hold 3, 5 and 7: the other diagonal.
- (c) **`4 2 3`**. `halve` changes the caller's array (no copy is made), and `/` on ints drops the fraction: 9/2 = 4, 4/2 = 2, 7/2 = 3.

**Worked Exam-Style Problem, Off by One in a Search**

*Problem:* A student wrote this search. Find the two bugs.

```c
int search(int a[], int n, int key) {
    int i;
    for (i = 1; i <= n; i++)
        if (a[i] == key)
            return i;
    return -1;
}
```

*Bug 1:* the loop starts at `i = 1`, so `a[0]` is never checked. *Bug 2:* `i <= n` reads `a[n]`, one past the end. The correct loop is `for (i = 0; i < n; i++)`. Whenever a loop walks an array, check both ends: the first index used must be 0 and the last must be `n - 1`.

**Worked Programming Exercise (#4, Jeepney Terminal)**

```c
#include <stdio.h>
#define DAYS 3
#define TRIPS 5

int main(void) {
    int p[DAYS][TRIPS] = {
        {12, 18, 22, 15, 9},
        {14, 20, 19, 17, 11},
        {10, 16, 25, 13, 8}
    };
    int d, t, total, best = 0, best_total = -1;

    for (d = 0; d < DAYS; d++) {               /* row totals */
        total = 0;
        for (t = 0; t < TRIPS; t++)
            total += p[d][t];
        printf("Day %d: %d passengers\n", d + 1, total);
    }

    for (t = 0; t < TRIPS; t++) {              /* column totals */
        total = 0;
        for (d = 0; d < DAYS; d++)
            total += p[d][t];
        if (total > best_total) {
            best_total = total;
            best = t;
        }
    }
    printf("Busiest: trip %d (%d passengers)\n", best + 1, best_total);
    return 0;
}
```

Output:
```
Day 1: 76 passengers
Day 2: 81 passengers
Day 3: 72 passengers
Busiest: trip 3 (66 passengers)
```

The two halves are the row-total and column-total patterns from the notes. The second half also uses the "largest value and its position" pattern, applied to the column totals instead of to array elements. Printing `best + 1` turns the 0-based index into the trip number a person would use.

**How to Pass Tips**

- Every array loop: first index 0, last index `n - 1`, condition `i < n`. Check both ends before you move on.
- In a 2-D trace, write the array as a table on your scratch paper first. Reading `m[i][2 - i]` off a table is easy, reading it off a flat list of 9 numbers is where mistakes happen.
- `>` versus `>=` in a "find the largest" loop decides which tie wins. Look for repeated values in the data, the examiner put them there on purpose.
- If the question says "write a function", the function must not use `scanf` or `printf` unless asked. Take the array and its size as parameters and return the answer.
- `return -1;` goes after the search loop, never in an `else` inside it.

---

<!-- kind: activity -->
## Code Lab, Lesson 1: Seat Plan Search

**Coding Drill:** Your adviser keeps the class seat plan in a 2-D array of student numbers. Complete the search so the program reports where student `2333` sits. Press Run to compile real C right here, then change `key` to a number that is not in the plan and check that the "not in the seat plan" message appears.

Expected output:
```
2333 sits in row 2, seat 3
```

Starter code:

```c
#include <stdio.h>
#define ROWS 3
#define SEATS 4

int main(void) {
    int seat[ROWS][SEATS] = {
        {2301, 2417, 2388, 2295},
        {2410, 2356, 2333, 2402},
        {2299, 2378, 2364, 2321}
    };
    int key = 2333;
    int r, c, found_row = -1, found_col = -1;

    for (r = 0; r < ROWS; r++) {
        for (c = 0; c < SEATS; c++) {
            /* TODO: if seat[r][c] equals key, save r in found_row and c in found_col */
        }
    }

    if (found_row == -1)
        printf("%d is not in the seat plan\n", key);
    else
        printf("%d sits in row %d, seat %d\n", key, found_row + 1, found_col + 1);
    return 0;
}
```

---

<!-- kind: activity -->
## Output Tracing Drills, Lesson 1

Trace questions are where most CP2 exam points are lost, because one wrong step changes the final answer. Work each one on paper before you look at the answers at the bottom. Write the array contents after every pass of the loop.

**Drill 1, Shift Left**
```c
int a[5] = {3, 8, 1, 6, 4};
int i, first = a[0];
for (i = 0; i < 4; i++)
    a[i] = a[i + 1];
a[4] = first;
for (i = 0; i < 5; i++)
    printf("%d ", a[i]);
```

**Drill 2, Running Totals**
```c
int a[5] = {2, 4, 6, 8, 10};
int i;
for (i = 1; i < 5; i++)
    a[i] = a[i] + a[i - 1];
printf("%d %d", a[2], a[4]);
```

**Drill 3, Row Maximums**
```c
int t[3][3] = { {4, 9, 2}, {3, 5, 7}, {8, 1, 6} };
int r, c, big;
for (r = 0; r < 3; r++) {
    big = t[r][0];
    for (c = 1; c < 3; c++)
        if (t[r][c] > big) big = t[r][c];
    printf("%d ", big);
}
```

**Drill 4, The Function Changes the Array**
```c
void mark(int a[], int n, int limit) {
    int i;
    for (i = 0; i < n; i++)
        if (a[i] < limit) a[i] = 0;
}
/* in main: */
int g[6] = {80, 70, 95, 60, 75, 88};
int i, count = 0;
mark(g, 6, 75);
for (i = 0; i < 6; i++)
    if (g[i] == 0) count++;
printf("%d %d", count, g[4]);
```

**Drill 5, Search Then Use the Result**
```c
int a[5] = {5, 10, 15, 10, 5};
int i, pos = -1;
for (i = 0; i < 5; i++)
    if (a[i] == 10) pos = i;
printf("%d %d", pos, a[pos - 1]);
```

---

**Answers**

1. **`8 1 6 4 3`**. Every element moves one place to the left, and the saved first element goes to the end. Saving `a[0]` before the loop matters: the loop overwrites it on the first pass.
2. **`12 30`**. After the loop the array is `2 6 12 20 30`. Each element becomes the sum of itself and the new value before it, so `a[i]` uses the already updated `a[i - 1]`.
3. **`9 7 8`**. Each row starts its own `big` from its first element, then keeps the largest.
4. **`2 75`**. Only 70 and 60 are below 75, so two zeros. `g[4]` is 75, which is not less than 75, so it stays. The function changed `g` in `main` directly.
5. **`3 15`**. There is no `return` or `break`, so the loop keeps going and `pos` ends at the **last** match, index 3. Then `a[pos - 1]` is `a[2]`, which is 15. Compare this with the linear search function in the notes, which returns the first match.

---

# Lesson 2: Strings and Character Arrays

<!-- kind: content -->
## Strings in C: Character Arrays with a Null Terminator

C has no separate "string" type. A **string** is simply a `char` array whose last used slot holds the **null character** `'\0'` (the character with value 0). Every string function, and `printf` with `%s`, reads characters until it reaches that `'\0'`. It is the only way C knows where the text stops.

### Declaring strings

```c
char name[6] = "Maria";   /* 5 letters + '\0' = 6 slots */
char name2[] = "Maria";   /* the compiler counts: also 6 */
char city[20] = "Cebu";   /* 4 letters, '\0', then 15 more '\0' */
```

When you write a string literal in double quotes, the compiler adds the `'\0'` for you. Your job is to leave room for it: **a string of n characters needs an array of at least n + 1**.

### `'A'` is not `"A"`

- `'A'` (single quotes) is **one character**, a small integer (65 in ASCII).
- `"A"` (double quotes) is a **string**: two characters, `'A'` and `'\0'`.

Use single quotes with `char` variables and comparisons like `s[i] == 'a'`. Use double quotes for text.

### Length versus size

```c
#include <stdio.h>
#include <string.h>

int main(void) {
    char name[] = "Maria";
    char city[20] = "Cebu";
    int i;

    printf("%s from %s\n", name, city);
    printf("strlen(name) = %d, sizeof name = %d\n", (int)strlen(name), (int)sizeof name);
    printf("strlen(city) = %d, sizeof city = %d\n", (int)strlen(city), (int)sizeof city);

    for (i = 0; name[i] != '\0'; i++)
        printf("[%c]", name[i]);
    printf("\n");
    return 0;
}
```

Output:
```
Maria from Cebu
strlen(name) = 5, sizeof name = 6
strlen(city) = 4, sizeof city = 20
[M][a][r][i][a]
```

- **`strlen`** counts the characters **before** the `'\0'`. It answers "how long is the text?"
- **`sizeof`** gives the size of the whole array in bytes, `'\0'` and unused slots included. It answers "how much room is there?"
- The loop `for (i = 0; name[i] != '\0'; i++)` is the standard way to visit every character. It works for any length, so you never need to know the size in advance.

The `(int)` casts let you print both values with `%d` on every compiler. (C99 also has `%zu` for these values, but some older Windows compilers do not support it.)

### Changing a single character

A string is still an array, so you can change one character by its index:

```c
#include <stdio.h>

int main(void) {
    char section[] = "BSIT-1A";

    section[6] = 'B';
    printf("%s\n", section);
    return 0;
}
```

Output:
```
BSIT-1B
```

---

<!-- kind: content -->
## Reading and Printing Strings

### Printing

- `printf("%s", name)` prints the characters up to the `'\0'`.
- `puts(name)` does the same and adds a newline at the end.
- Field widths work too: `%-10s` prints the text left-aligned in a 10-character column, which is handy for tables.

### Reading one word with `scanf`

```c
#include <stdio.h>

int main(void) {
    char first[20];

    printf("First name: ");
    scanf("%19s", first);          /* no & : first is already an address */
    printf("Hi, %s!\n", first);
    return 0;
}
```

Sample run (you type `Juan dela Cruz`):
```
First name: Juan dela Cruz
Hi, Juan!
```

Three things to notice:

1. **No `&` before the array name.** An array name already gives the address of its first element, which is exactly what `scanf` needs.
2. **`%s` stops at the first space.** Only `Juan` was stored. The rest of the line stays waiting in the input.
3. **`%19s` is a limit.** It reads at most 19 characters, leaving room for the `'\0'` in a 20-slot array. A plain `%s` keeps writing past the end of the array if the user types a long word.

### Reading a whole line with `fgets`

To read text with spaces, such as a full name or an address, use `fgets`:

```c
#include <stdio.h>
#include <string.h>

int main(void) {
    char full[40];

    printf("Full name: ");
    if (fgets(full, sizeof full, stdin) != NULL) {
        full[strcspn(full, "\n")] = '\0';   /* remove the Enter key */
        printf("Hello, %s! (%d characters)\n", full, (int)strlen(full));
    }
    return 0;
}
```

Sample run (you type `Juan dela Cruz`):
```
Full name: Juan dela Cruz
Hello, Juan dela Cruz! (14 characters)
```

- `fgets(full, sizeof full, stdin)` reads one line, spaces included, but never more than `sizeof full - 1` characters, so it cannot overflow the array.
- It **keeps the newline** from the Enter key when there is room for it. `strcspn(full, "\n")` finds the position of that newline (or of the `'\0'` if there is none), and storing `'\0'` there removes it. Without this step the newline would end up in the middle of your output.
- It returns `NULL` when there is nothing left to read, which is why the call sits inside an `if`.

**Never use `gets`.** It has no size limit at all, so any long input overflows the array. It was removed from the C language in 2011, and modern compilers warn when you use it.

### The leftover newline problem

If you read a number with `scanf("%d", ...)` and then a line with `fgets`, the `fgets` seems to be skipped. `scanf` leaves the Enter key's newline in the input, and `fgets` reads that empty line immediately. Clear the rest of the line before calling `fgets`:

```c
#include <stdio.h>
#include <string.h>

int main(void) {
    int age, ch;
    char name[40];

    printf("Age: ");
    scanf("%d", &age);
    while ((ch = getchar()) != '\n' && ch != EOF)
        ;                                /* throw away the rest of the line */

    printf("Name: ");
    if (fgets(name, sizeof name, stdin) != NULL) {
        name[strcspn(name, "\n")] = '\0';
        printf("%s is %d years old\n", name, age);
    }
    return 0;
}
```

Sample run (you type `19`, then `Ana Reyes`):
```
Age: 19
Name: Ana Reyes
Ana Reyes is 19 years old
```

---

<!-- kind: content -->
## The <string.h> Toolkit

Because a string is an array, you cannot copy, join or compare strings with `=`, `+` or `==`. The standard header `<string.h>` gives you functions for these jobs.

| Function | What it does | Watch out for |
|---|---|---|
| `strlen(s)` | Number of characters before the `'\0'` | Does not count the `'\0'` |
| `strcpy(dest, src)` | Copies `src` into `dest`, `'\0'` included | `dest` must be big enough |
| `strcat(dest, src)` | Adds `src` to the end of `dest` | `dest` needs room for both strings plus `'\0'` |
| `strcmp(a, b)` | Compares alphabetically: negative, `0`, or positive | `0` means **equal** |
| `strncpy(dest, src, n)` | Copies at most `n` characters | May leave `dest` without a `'\0'` |
| `strncat(dest, src, n)` | Adds at most `n` characters, then a `'\0'` | `n` counts only the added characters |
| `strchr(s, c)` | Finds the first `c` in `s` | Returns a pointer, or `NULL` if not found |

### Copy, join, compare

```c
#include <stdio.h>
#include <string.h>

int main(void) {
    char first[20] = "Jose";
    char last[] = "Rizal";
    char full[40];

    strcpy(full, first);        /* full = "Jose"       */
    strcat(full, " ");          /* full = "Jose "      */
    strcat(full, last);         /* full = "Jose Rizal" */
    printf("%s (%d)\n", full, (int)strlen(full));

    printf("%d\n", strcmp("apple", "apple"));
    printf("%d\n", strcmp("apple", "banana") < 0);
    printf("%d\n", strcmp("Zebra", "apple") < 0);
    return 0;
}
```

Output:
```
Jose Rizal (10)
0
1
1
```

### How `strcmp` decides

`strcmp` compares the two strings character by character, using their character codes, until it finds a difference or reaches the end:

- It returns **0** when the strings are equal. So the test for "same text" is `strcmp(a, b) == 0`, not `if (strcmp(a, b))`, which is true when they are *different*.
- It returns a **negative** number when the first string comes first, and a **positive** number when it comes second. Only the sign is guaranteed: one compiler may return `-1` and another `-15`, so always compare the result with 0.
- Case matters. In ASCII every uppercase letter (65 to 90) comes before every lowercase letter (97 to 122), so `"Zebra"` comes before `"apple"`.

### The `strncpy` trap

`strncpy(dest, src, n)` copies at most `n` characters. If `src` is longer than that, it does **not** add the `'\0'`. Add it yourself:

```c
#include <stdio.h>
#include <string.h>

int main(void) {
    char code[4];

    strncpy(code, "BSIT-1A", sizeof code - 1);
    code[sizeof code - 1] = '\0';   /* strncpy did not add it */
    printf("%s\n", code);
    return 0;
}
```

Output:
```
BSI
```

### A safer way to join: `snprintf`

`snprintf` works like `printf`, but writes into an array and never writes more than the size you give it, terminator included:

```c
#include <stdio.h>

int main(void) {
    char full[12];

    snprintf(full, sizeof full, "%s %s", "Andres", "Bonifacio");
    printf("%s\n", full);
    return 0;
}
```

Output:
```
Andres Boni
```

The full name needs 16 characters plus `'\0'`, but `full` has only 12 slots, so `snprintf` stored the first 11 characters and the `'\0'`. The text was cut short, but nothing outside the array was touched. With `strcpy` and `strcat`, the same mistake would overwrite memory that is not yours.

---

<!-- kind: content -->
## Character Handling with <ctype.h>

A `char` is a small integer: the code of a character. In ASCII, `'A'` is 65, `'a'` is 97, and the digit `'0'` is 48. That means you can do arithmetic with characters:

- **Letters are in order.** `'A' + 2` is `'C'`, and lowercase is always 32 more than uppercase (`'a' - 'A'` is 32).
- **Digit characters are in order too.** `'7' - '0'` is the number `7`. This is how you turn a typed digit into a value.

### The `<ctype.h>` functions

Instead of memorizing codes, use the standard character functions. The tests return non-zero (true) or 0 (false). They do not promise exactly `1`, so use them in an `if`, never compare them with `1`.

| Function | True when the character is... |
|---|---|
| `isalpha(c)` | a letter, `A` to `Z` or `a` to `z` |
| `isdigit(c)` | a digit, `0` to `9` |
| `isalnum(c)` | a letter or a digit |
| `isspace(c)` | a space, tab, or newline |
| `isupper(c)` / `islower(c)` | an uppercase / lowercase letter |
| `ispunct(c)` | punctuation, such as `,` `-` `!` |

`toupper(c)` and `tolower(c)` return the converted character. Anything that is not a letter comes back unchanged, so `toupper('5')` is still `'5'`.

### Counting kinds of characters

```c
#include <stdio.h>
#include <ctype.h>

int main(void) {
    char s[] = "BSIT 1-A, Room 204";
    int i, letters = 0, digits = 0, spaces = 0, others = 0;

    for (i = 0; s[i] != '\0'; i++) {
        if (isalpha(s[i]))
            letters++;
        else if (isdigit(s[i]))
            digits++;
        else if (isspace(s[i]))
            spaces++;
        else
            others++;
    }
    printf("letters %d, digits %d, spaces %d, others %d\n",
           letters, digits, spaces, others);

    for (i = 0; s[i] != '\0'; i++)
        s[i] = toupper(s[i]);           /* change the string in place */
    printf("%s\n", s);
    return 0;
}
```

Output:
```
letters 9, digits 4, spaces 3, others 2
BSIT 1-A, ROOM 204
```

The `else if` chain puts every character in exactly one group, so the four counts add up to `strlen(s)`, which is 18.

### Turning digit characters into a number

```c
#include <stdio.h>
#include <ctype.h>

int main(void) {
    char text[] = "2025";
    int i, value = 0;

    for (i = 0; text[i] != '\0'; i++)
        if (isdigit(text[i]))
            value = value * 10 + (text[i] - '0');

    printf("%d\n", value + 1);
    return 0;
}
```

Output:
```
2026
```

Each step shifts the number one place left (`* 10`) and adds the new digit: 2, then 20, 202, 2025. Subtracting `'0'` is what turns the character `'5'` into the number 5. Forget it and you add 53 instead (the code of `'5'`).

The standard library can do this for you: `atoi("2025")` from `<stdlib.h>` returns `2025`. Professors still ask for the loop, because it shows you understand character codes.

---

<!-- kind: content -->
## Writing Your Own String Functions

Exams often say "without using `<string.h>`". That is a test of whether you understand the `'\0'`. Every function below follows the same plan: walk the string with an index until you reach `'\0'`.

```c
#include <stdio.h>
#include <ctype.h>

int my_strlen(const char s[]) {
    int n = 0;
    while (s[n] != '\0')
        n++;
    return n;
}

void my_strcpy(char dest[], const char src[]) {
    int i = 0;
    while (src[i] != '\0') {
        dest[i] = src[i];
        i++;
    }
    dest[i] = '\0';                /* copy the terminator too */
}

void reverse(char s[]) {
    int i = 0, j = my_strlen(s) - 1;
    char temp;
    while (i < j) {                /* swap the ends, move inward */
        temp = s[i];
        s[i] = s[j];
        s[j] = temp;
        i++;
        j--;
    }
}

int count_words(const char s[]) {
    int i, words = 0, in_word = 0;
    for (i = 0; s[i] != '\0'; i++) {
        if (isspace(s[i])) {
            in_word = 0;           /* a space ends the current word */
        } else if (!in_word) {
            in_word = 1;           /* first letter of a new word */
            words++;
        }
    }
    return words;
}

int main(void) {
    char word[20];

    my_strcpy(word, "Mabuhay");
    printf("%s has %d letters\n", word, my_strlen(word));
    reverse(word);
    printf("Reversed: %s\n", word);
    printf("%d words\n", count_words("  Tara na,  kain tayo "));
    return 0;
}
```

Output:
```
Mabuhay has 7 letters
Reversed: yahubaM
4 words
```

### How each one works

- **`my_strlen`** counts until it sees `'\0'`. The count is also the index where the `'\0'` sits.
- **`my_strcpy`** copies character by character, then adds the terminator. The loop stops *at* the `'\0'` without copying it, so the last line is required. Leave it out and `dest` is not a string, and printing it runs on into whatever memory comes next.
- **`reverse`** is the reverse-in-place pattern from Lesson 1, applied to characters. The right end starts at `my_strlen(s) - 1`, the last real character, **not** at the `'\0'`. If you swapped the `'\0'` to the front, the string would become empty.
- **`count_words`** cannot just count spaces: there can be several spaces in a row, and spaces at the start and the end. Instead it counts the moments a word **starts**, which is a non-space character that comes right after a space (or at the very beginning). The `in_word` flag remembers whether we are inside a word.

### `const` on string parameters

`my_strlen` and `count_words` only read their string, so their parameter is `const char s[]`. That lets you pass string literals like `"Mabuhay"` safely, and the compiler stops you if the function tries to change the text. `my_strcpy` writes to `dest`, so only `src` is `const`.

---

<!-- kind: content -->
## Common String Bugs and How to Avoid Them

Almost every string bug comes down to one of these. Some are caught by the compiler. The dangerous ones compile fine and fail at run time, or only on someone else's computer.

### 1. No room for the `'\0'`

```c
char code[4] = "BSIT";    /* compiles, but there is no '\0' */
char ok[5] = "BSIT";      /* right: 4 letters + '\0' */
```

C allows the first line: when the letters exactly fill the array, the terminator is simply left out. Newer compilers warn about it, but older ones say nothing. `code` is then not a string, and `printf("%s", code)` or `strlen(code)` keeps reading past the end of the array. That is undefined behavior: you may see garbage after `BSIT`, or nothing wrong at all until it matters. The easy fix is to let the compiler count: `char code[] = "BSIT";`.

### 2. Assigning with `=`

```c
char name[20];
name = "Ana";             /* compile error: an array cannot be assigned */
strcpy(name, "Ana");      /* right */
```

`=` with a string literal only works in the **declaration** (`char name[20] = "Ana";`). After that, use `strcpy`, or `snprintf` when the size might not fit.

### 3. Comparing with `==`

```c
#include <stdio.h>
#include <string.h>

int main(void) {
    char pass[20] = "admin123";
    char typed[20] = "admin123";

    printf("== says %d\n", pass == typed);
    printf("strcmp says %d\n", strcmp(pass, typed) == 0);
    return 0;
}
```

Output:
```
== says 0
strcmp says 1
```

`pass == typed` compares the two arrays' **addresses**, and two different arrays never share an address, so it is always false even when the text matches. Compilers usually warn about it. Compare text with `strcmp(a, b) == 0`.

### 4. Writing past the end

`strcpy`, `strcat`, and `scanf("%s")` copy until the source ends, no matter how small the destination is. Before you copy, ask: does the destination have room for every character **plus** the `'\0'`?

- Read words with a width: `scanf("%19s", name)` for `char name[20]`.
- Read lines with `fgets(name, sizeof name, stdin)`.
- Build strings with `snprintf(dest, sizeof dest, ...)`.

### 5. Forgetting the `'\0'` when you build a string yourself

When you fill a `char` array one character at a time, the loop never writes a terminator unless you do:

```c
#include <stdio.h>

int main(void) {
    char digits[11];
    int i;

    for (i = 0; i < 10; i++)
        digits[i] = '0' + i;
    digits[10] = '\0';           /* without this, digits is not a string */
    printf("%s\n", digits);
    return 0;
}
```

Output:
```
0123456789
```

### 6. Changing a string literal through a pointer

```c
char *p = "hello";        /* p points to a literal, which is read-only */
char s[] = "hello";       /* s is your own copy, which you may change */
s[0] = 'H';               /* fine */
```

Writing `p[0] = 'H';` compiles, but changing a string literal is undefined behavior, and on most computers the program crashes. If you need to change the text, declare a `char` array. (Lesson 3 explains the difference between `char *p` and `char s[]`.)

### 7. `scanf("%d")` followed by `fgets`

`fgets` returns an empty line because `scanf` left the Enter key in the input. Clear the rest of the line first, as shown in the Reading and Printing Strings section.

---

<!-- kind: content -->
## Key Takeaways

- A string is a `char` array that ends with `'\0'`. A string of n characters needs at least n + 1 slots, and `'A'` (one character) is not `"A"` (two: `'A'` and `'\0'`).
- `strlen` counts the characters before the `'\0'`; `sizeof` gives the whole array's size. Walk any string with `for (i = 0; s[i] != '\0'; i++)`.
- `scanf("%19s", name)` reads one word with no `&`; `fgets(name, sizeof name, stdin)` reads a whole line and keeps the newline, which `name[strcspn(name, "\n")] = '\0';` removes. Never use `gets`.
- Copy with `strcpy`, join with `strcat` (or `snprintf`), and compare with `strcmp(a, b) == 0`. Never `=` or `==`, and always check that the destination has room for the text plus `'\0'`.
- Characters are small integers: `<ctype.h>` tests them (`isalpha`, `isdigit`, `isspace`) and converts them (`toupper`, `tolower`), and `c - '0'` turns a digit character into its value.

---
