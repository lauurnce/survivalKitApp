-- ============================================================
-- Computer Programming 2, Lessons 2-3: Strings and Character Arrays, Pointers
-- Subject ID: 10000000-0001-0002-0001-000000000001
-- Modules:    a3000001-0001-0002-0001-000000000002 (Lesson 2)
--             a3000001-0001-0002-0001-000000000003 (Lesson 3)
-- Sections:   a3000002-0001-0002-00LL-0000000000SS
--             (LL = lesson, SS = position in the lesson)
--
-- Per lesson, like CP1: free notes, a free Key Takeaways recap, a free
-- Try It playground, then three paid reviewers (Practice Exercises,
-- Worked Exam Solutions + How-to-Pass Tips, Code Lab).
--
-- Every row has a fixed id and is upserted, so this file is safe to
-- re-run and deletes nothing. Run after cp2_modules_sections.sql (which
-- clears the subject's modules). Migration
-- 20261101001000_cp2_units_1_3.sql carries the same rows to production.
--
-- Every C program shown here was compiled with cc -std=c99 -Wall -Wextra
-- and run, and its output checked against the text.
-- ============================================================

-- ============================================================
-- LESSON 2: STRINGS AND CHARACTER ARRAYS
-- ============================================================

insert into public.modules (id, subject_id, title, slug, sort_order)
values
  ('a3000001-0001-0002-0001-000000000002', '10000000-0001-0002-0001-000000000001', 'Lesson 2: Strings and Character Arrays', 'lesson-2-strings-and-character-arrays', 2)
on conflict (id) do update set
  subject_id = excluded.subject_id,
  title      = excluded.title,
  slug       = excluded.slug,
  sort_order = excluded.sort_order;

insert into public.sections (id, module_id, kind, heading, body_md, sort_order, ide_language, starter_code)
values
  ('a3000002-0001-0002-0002-000000000001', 'a3000001-0001-0002-0001-000000000002', 'content', 'Strings in C: Character Arrays with a Null Terminator', $md$
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
$md$, 1, null, null),
  ('a3000002-0001-0002-0002-000000000002', 'a3000001-0001-0002-0001-000000000002', 'content', 'Reading and Printing Strings', $md$
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
$md$, 2, null, null)
on conflict (id) do update set
  module_id    = excluded.module_id,
  kind         = excluded.kind,
  heading      = excluded.heading,
  body_md      = excluded.body_md,
  sort_order   = excluded.sort_order,
  ide_language = excluded.ide_language,
  starter_code = excluded.starter_code;
