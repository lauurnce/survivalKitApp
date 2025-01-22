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
