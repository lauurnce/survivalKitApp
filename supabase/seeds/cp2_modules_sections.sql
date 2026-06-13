-- ============================================================
-- Computer Programming 2 — Modules & Sections
-- Subject ID: 10000000-0001-0002-0001-000000000001
-- Run after migration 002 and 1st_year_subjects.sql
-- ============================================================

DELETE FROM modules WHERE subject_id = '10000000-0001-0002-0001-000000000001';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('a3000001-0001-0002-0001-000000000001','10000000-0001-0002-0001-000000000001','Unit 1: Arrays','unit-1-arrays',1);

-- ============================================================
-- UNIT 1: Arrays
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a3000001-0001-0002-0001-000000000001','content','What is an Array and Why Do We Need One?',$md$
Suppose your program needs to work with 20 integers — reading them, processing them, and printing them. One approach is to declare 20 separate variables, each with its own name. That works for a small number, but it quickly becomes unmanageable. Imagine doing the same thing for 200, 2000, or 20,000 values. You'd need a separate variable declaration and a separate line of code for every single one of them.

Arrays solve this problem. Instead of giving each value its own name, an array groups many values of the same data type under a single name, and lets you refer to individual values by their position (called an **index** or **subscript**).
$md$, 1),

('a3000001-0001-0002-0001-000000000001','content','Characteristics of an Array',$md$
An array has three defining properties:

1. **Fixed size** — the number of elements is set at the time the array is declared and does not change during the program's execution.
2. **Same data type** — every element in the array must be of the same type (all integers, all floats, all characters, etc.).
3. **Contiguous storage** — the elements are stored one after another in memory, which makes it possible to calculate the address of any element efficiently.

Because elements are stored in sequence, you can refer to them by position: the first element, the second element, and so on. In C, positions are counted starting from zero. So for an array named `num` with 20 elements, the valid positions are `num[0]` through `num[19]`.

The notation `num[i]` — a name followed by an integer expression in square brackets — is called **index notation**. The value inside the brackets is the **index** (or subscript), and it tells the compiler which element you want. Using a variable like `i` as the index is what makes it possible to process entire arrays with loops.
$md$, 2),

('a3000001-0001-0002-0001-000000000001','content','Declaring an Array in C',$md$
Before an array can be used it must be declared. The declaration tells the compiler three things: the name of the array, the data type of its elements, and how many elements it holds.

**General form for a one-dimensional array:**

```c
data_type array_name[size];
```

- `data_type` — the type of each element (`int`, `float`, `char`, `double`, etc.)
- `array_name` — any valid C identifier
- `size` — a positive integer constant specifying the number of elements

**Examples:**

```c
int    scores[20];   /* 20-element integer array        */
char   labels[30];   /* 30-element character array       */
float  data[20];     /* 20-element floating-point array  */
double values[12];   /* 12-element double array          */
```

The storage class is optional and can be placed before the data type. If omitted, the default depends on where the array is declared (automatic inside a function, external outside).
$md$, 3),

('a3000001-0001-0002-0001-000000000001','content','How C Finds an Element in Memory',$md$
The array name itself is a symbolic reference to the address of the first element in memory. To locate any specific element, C uses this formula:

```
element address = base address + (size of one element × index)
```

For example, if an integer array starts at memory address 10,000 and each integer occupies 2 bytes, the element at index 3 is at:

```
10,000 + (2 × 3) = 10,006
```

This is why array indexing is fast — calculating an address from a base and an offset is a single arithmetic operation.
$md$, 4),

('a3000001-0001-0002-0001-000000000001','content','Storing Values in an Array',$md$
Declaring an array only reserves memory — it does not put any values in. There are three ways to get values into an array.

### 1. Initialization at Declaration

You can supply initial values in curly braces at the point of declaration:

```c
/* General form */
data_type array_name[size] = {value1, value2, ..., valueN};
```

**Rules:**
- You cannot supply more values than there are elements — that is a compile error.
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

Note that `&scores[i]` uses the address-of operator — required by `scanf()` just as it is for ordinary variables.

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
$md$, 5),

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
$md$, 6),

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

If a row's inner brace contains fewer values than the column count, the remaining elements in that row are set to zero. However, you cannot put *more* values in a row's inner brace than the declared column count — that is a compile error.
$md$, 7),

('a3000001-0001-0002-0001-000000000001','activity','Sample Program 1 — Sorting an Array',$md$
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
$md$, 8),

('a3000001-0001-0002-0001-000000000001','activity','Sample Program 2 — Counting Positives and Negatives',$md$
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
$md$, 9),

('a3000001-0001-0002-0001-000000000001','activity','Sample Program 3 — Adding Two Matrices',$md$
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
$md$, 10),

('a3000001-0001-0002-0001-000000000001','activity','Practice Exercises',$md$
### Exercise 1 — Array Definitions

Write appropriate array declarations for each of the following:

a. A 12-element integer array. Assign it the values 1, 4, 7, 10, … 34 (arithmetic sequence with step 3).

b. A character array to hold the string `"NORTH"`, including the null terminator.

c. A 4-element character array holding the compass characters `'N'`, `'S'`, `'E'`, and `'W'`.

---

### Exercise 2 — Trace the Output

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
