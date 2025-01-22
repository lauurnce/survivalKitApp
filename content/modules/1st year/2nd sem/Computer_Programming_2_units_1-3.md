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
