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
  ('a3000001-0001-0002-0001-000000000001','10000000-0001-0002-0001-000000000001','Unit 1: Arrays','unit-1-arrays',1);

-- ============================================================
-- UNIT 1: Arrays
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

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a3000001-0001-0002-0001-000000000001','content','Declaring an Array in C',$md$
Before an array can be used it must be declared. The declaration tells the compiler three things: the name of the array, the data type of its elements, and how many elements it holds.

**General form for a one-dimensional array:**

```c
data_type array_name[size];
```

- `data_type`, the type of each element (`int`, `float`, `char`, `double`, etc.)
- `array_name`, any valid C identifier
- `size`, a positive integer constant specifying the number of elements

**Examples:**

```c
int    scores[20];   /* 20-element integer array        */
char   labels[30];   /* 30-element character array       */
float  data[20];     /* 20-element floating-point array  */
double values[12];   /* 12-element double array          */
```

The storage class is optional and can be placed before the data type. If omitted, the default depends on where the array is declared (automatic inside a function, external outside).
$md$, 3);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a3000001-0001-0002-0001-000000000001','content','How C Finds an Element in Memory',$md$
The array name itself is a symbolic reference to the address of the first element in memory. To locate any specific element, C uses this formula:

```
element address = base address + (size of one element × index)
```

For example, if an integer array starts at memory address 10,000 and each integer occupies 2 bytes, the element at index 3 is at:

```
10,000 + (2 × 3) = 10,006
```

This is why array indexing is fast, calculating an address from a base and an offset is a single arithmetic operation.
$md$, 4);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a3000001-0001-0002-0001-000000000001','content','Storing Values in an Array',$md$
Declaring an array only reserves memory, it does not put any values in. There are three ways to get values into an array.

### 1. Initialization at Declaration

You can supply initial values in curly braces at the point of declaration:

```c
/* General form */
data_type array_name[size] = {value1, value2, ..., valueN};
```

**Rules:**
- You cannot supply more values than there are elements, that is a compile error.
- If you supply fewer values than the declared size, the remaining elements are automatically set to zero.
- If you initialize all elements, you can omit the size and the compiler will count them for you.

**Examples:**

```c
int a[5] = {5, 3, 2, 7, 9};       /* all 5 elements initialized         */
int b[]  = {11, 21, 75, 24, 5};   /* size inferred as 5                 */
int c[15] = {3, 7, 4, 6, 1};      /* first 5 set; elements 5–14 = 0     */
```

### 2. Reading Values from the Keyboard

Use a loop combined with `scanf()` to fill an array at runtime:

```c
int scores[10];
int i;

for (i = 0; i < 10; i++) {
    scanf("%d", &scores[i]);
}
```

Note that `&scores[i]` uses the address-of operator, required by `scanf()` just as it is for ordinary variables.

### 3. Assigning Values Individually

You can assign a value to any single element using the assignment operator:

```c
scores[4] = 23;
```

You cannot assign one array directly to another (e.g., `second = first;` is illegal). To copy an array you must loop through it element by element:

```c
for (i = 0; i < 25; i++)
    second[i] = first[i];
```
$md$, 5);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a3000001-0001-0002-0001-000000000001','content','Character Arrays and Strings',$md$
A string in C is stored as a character array. The key difference from other arrays is the **null terminator**: every string ends with the special character `'\0'`, which the compiler adds automatically when you initialize with a string literal.

```c
char city[6] = "HELLO";
```

This creates a 6-element array: `'H'`, `'E'`, `'L'`, `'L'`, `'O'`, `'\0'`. You can also let the compiler determine the size:

```c
char city[] = "HELLO";   /* compiler sets size to 6 automatically */
```

If you declare the array without an initial value and enter the size yourself, make sure to add one extra slot for the null terminator.
$md$, 6);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a3000001-0001-0002-0001-000000000001','content','Multidimensional Arrays',$md$
C supports arrays with more than one dimension. A **two-dimensional array** is the most common and can be thought of as a table with rows and columns.

**Declaration:**

```c
data_type array_name[rows][columns];
```

**Examples:**

```c
float grid[5][3];   /* 5 rows, 3 columns of floats  */
int   table[3][3];  /* 3×3 integer table             */
```

### Initialization of 2D Arrays

Values are assigned row by row (the last subscript increases fastest):

```c
int mat[3][3] = {1, 2, 3, 4, 5, 6, 7, 8, 9};
```

This produces:

| | Col 0 | Col 1 | Col 2 |
|---|---|---|---|
| Row 0 | 1 | 2 | 3 |
| Row 1 | 4 | 5 | 6 |
| Row 2 | 7 | 8 | 9 |

You can also use nested braces to make the row grouping explicit:

```c
int mat[3][3] = { {1,2,3}, {4,5,6}, {7,8,9} };
```

If a row's inner brace contains fewer values than the column count, the remaining elements in that row are set to zero. However, you cannot put *more* values in a row's inner brace than the declared column count, that is a compile error.
$md$, 7);

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

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a3000001-0001-0002-0001-000000000001','activity','Practice Exercises',$md$
### Exercise 1, Array Definitions

Write appropriate array declarations for each of the following:

a. A 12-element integer array. Assign it the values 1, 4, 7, 10, … 34 (arithmetic sequence with step 3).

b. A character array to hold the string `"NORTH"`, including the null terminator.

c. A 4-element character array holding the compass characters `'N'`, `'S'`, `'E'`, and `'W'`.

---

### Exercise 2, Trace the Output

Determine what each program prints without running it. Write your answer in the box provided.

**Program A:**

```c
#include <stdio.h>
#include <conio.h>

main() {
    int a, b = 0;
    static int c[10] = {1,2,3,4,5,6,7,8,9,10};
    clrscr();
    for (a = 0; a < 10; a++)
        if ((c[a] % 2) == 0)
            b += c[a];
    printf("%d", b);
    getch();
    return 1;
}
```

> **Output:** `[ ]`

---

**Program B:**

```c
#include <stdio.h>
#include <conio.h>

void main() {
    int a, b = 0;
    static int c[10] = {1,2,3,4,5,6,7,8,9,10};
    clrscr();
    for (a = 0; a < 10; a++)
        if ((a % 2) == 0)
            b += c[a];
    printf("%d", b);
    getch();
}
```

> **Output:** `[ ]`

---

**Program C:**

```c
#include <stdio.h>
#include <conio.h>
#define R 3
#define C 4

int z[R][C] = {1,2,3,4,5,6,7,8,9,10,11,12};

main() {
    int a, b, smallest = 999;
    clrscr();
    for (a = 0; a < R; ++a)
        for (b = 0; b < C; ++b)
            if (z[a][b] < smallest)
                smallest = z[a][b];
    printf("%d", smallest);
    getch();
    return 1;
}
```

> **Output:** `[ ]`
$md$, 11);
