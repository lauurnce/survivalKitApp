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
