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

How `"Maria"` sits in a 6-slot array:

![char name[6] = "Maria" in memory: M, a, r, i, a at indexes 0 to 4 and the null character at index 5. strlen(name) counts the 5 letters, sizeof name is the whole array, 6. char bad[5] = "Maria" has no room for the null character, so it is not a string.](/diagrams/cp2/lesson-2-string-null-terminator.svg)

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
$md$, 2, null, null),
  ('a3000002-0001-0002-0002-000000000003', 'a3000001-0001-0002-0001-000000000002', 'content', 'The <string.h> Toolkit', $md$
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
$md$, 3, null, null),
  ('a3000002-0001-0002-0002-000000000004', 'a3000001-0001-0002-0001-000000000002', 'content', 'Character Handling with <ctype.h>', $md$
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
$md$, 4, null, null),
  ('a3000002-0001-0002-0002-000000000005', 'a3000001-0001-0002-0001-000000000002', 'content', 'Writing Your Own String Functions', $md$
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
$md$, 5, null, null),
  ('a3000002-0001-0002-0002-000000000006', 'a3000001-0001-0002-0001-000000000002', 'content', 'Common String Bugs and How to Avoid Them', $md$
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
$md$, 6, null, null),
  ('a3000002-0001-0002-0002-000000000007', 'a3000001-0001-0002-0001-000000000002', 'content', 'Key Takeaways', $md$
- A string is a `char` array that ends with `'\0'`. A string of n characters needs at least n + 1 slots, and `'A'` (one character) is not `"A"` (two: `'A'` and `'\0'`).
- `strlen` counts the characters before the `'\0'`; `sizeof` gives the whole array's size. Walk any string with `for (i = 0; s[i] != '\0'; i++)`.
- `scanf("%19s", name)` reads one word with no `&`; `fgets(name, sizeof name, stdin)` reads a whole line and keeps the newline, which `name[strcspn(name, "\n")] = '\0';` removes. Never use `gets`.
- Copy with `strcpy`, join with `strcat` (or `snprintf`), and compare with `strcmp(a, b) == 0`. Never `=` or `==`, and always check that the destination has room for the text plus `'\0'`.
- Characters are small integers: `<ctype.h>` tests them (`isalpha`, `isdigit`, `isspace`) and converts them (`toupper`, `tolower`), and `c - '0'` turns a digit character into its value.
$md$, 7, null, null),
  ('a3000002-0001-0002-0002-000000000008', 'a3000001-0001-0002-0001-000000000002', 'content', 'Try It: Strings', $md$
Put your own name in `first` and `last`, then predict the length, the uppercase version and the reversed name before you press Run.
$md$, 8, 'c', $code$#include <stdio.h>
#include <string.h>
#include <ctype.h>

int main(void) {
    char first[20] = "Juan";
    char last[20] = "dela Cruz";
    char full[40];
    char upper[40];
    int i, n;

    snprintf(full, sizeof full, "%s %s", first, last);
    n = (int)strlen(full);
    printf("Full name: %s (%d characters)\n", full, n);

    for (i = 0; full[i] != '\0'; i++)
        upper[i] = toupper(full[i]);
    upper[i] = '\0';
    printf("Uppercase: %s\n", upper);

    printf("Reversed:  ");
    for (i = n - 1; i >= 0; i--)
        printf("%c", full[i]);
    printf("\n");

    if (strcmp(first, last) < 0)
        printf("\"%s\" comes before \"%s\"\n", first, last);
    else
        printf("\"%s\" comes after \"%s\"\n", first, last);
    return 0;
}$code$),
  ('a3000002-0001-0002-0002-000000000009', 'a3000001-0001-0002-0001-000000000002', 'activity', 'Practice Exercises, Lesson 2', $md$
**Review questions:**
1. Declare a `char` array named `prov` that holds `"Pangasinan"` with no wasted slots. How many slots does it have?
2. Explain the difference between `'B'` and `"B"`.
3. Given `char s[15] = "Hi BSIT";`, what are `strlen(s)` and `sizeof s`?
4. Why is `if (pass == "admin123")` wrong? Rewrite it correctly.
5. A student reads a full name with `scanf("%s", name);` and types `Maria Clara`. What is stored in `name`, and which function should they use instead?

**Trace and predict the output:**
```c
// (a)
char w[] = "Laguna";
int i, n = 0;
for (i = 0; w[i] != '\0'; i++)
    if (w[i] == 'a') n++;
printf("%d %d", n, (int)strlen(w));

// (b)  uses <string.h> and <ctype.h>
char a[20] = "Iloilo";
strcat(a, " City");
a[0] = tolower(a[0]);
printf("%s %d", a, (int)strlen(a));

// (c)
char s[] = "2B-C4";
int i, sum = 0;
for (i = 0; s[i] != '\0'; i++)
    if (isdigit(s[i])) sum += s[i] - '0';
printf("%d", sum);

// (d)
printf("%d %d", strcmp("CAT", "Cat") < 0, strcmp("dog", "dog"));
```

**Programming exercises:**
1. Read a line with `fgets` and count its vowels and consonants (letters that are not vowels). Ignore spaces, digits and punctuation.
2. Write `int is_strong(const char pw[])` that returns 1 when the password has at least 8 characters, at least one digit, and at least one uppercase letter, and 0 otherwise.
3. Write `void to_title_case(char s[])` that capitalizes the first letter of every word and makes the other letters lowercase: `"bAtAnGaS cITY"` becomes `"Batangas City"`.
4. Without using `<string.h>`, write `int my_strcmp(const char a[], const char b[])` that returns 0 when the strings are equal, a negative number when `a` comes first, and a positive number otherwise.
$md$, 9, null, null),
  ('a3000002-0001-0002-0002-000000000010', 'a3000001-0001-0002-0001-000000000002', 'activity', 'Worked Exam Solutions + How-to-Pass Tips, Lesson 2', $md$
**Answer Key, Review Questions**

1. `char prov[] = "Pangasinan";` (or `char prov[11]`). 10 letters + `'\0'` = **11 slots**.
2. `'B'` is a single `char`, the number 66. `"B"` is a string: an array of two characters, `'B'` and `'\0'`.
3. `strlen(s)` is **7** (`H`, `i`, space, `B`, `S`, `I`, `T`). `sizeof s` is **15**, the declared size, no matter how much of it is used.
4. `==` compares addresses, not text, so it is false even when the user typed the right password. Correct: `if (strcmp(pass, "admin123") == 0)`.
5. Only **`"Maria"`**: `%s` stops at the space. Use `fgets(name, sizeof name, stdin)` and remove the newline.

**Answer Key, Traces**

- (a) **`2 6`**. `Laguna` has two lowercase `a`s (positions 1 and 5) and 6 characters.
- (b) **`iloilo City 11`**. After `strcat` the text is `"Iloilo City"` (6 + 5 = 11 characters), then only the first letter is lowercased.
- (c) **`6`**. The digit characters are `'2'` and `'4'`, and subtracting `'0'` turns them into 2 and 4. Without `- '0'` the answer would be 50 + 52 = 102.
- (d) **`1 0`**. The first difference is at position 1: `'A'` (65) against `'a'` (97), and 65 is smaller, so `strcmp` is negative and `< 0` prints 1. Identical strings give exactly 0.

**Worked Exam-Style Problem, The Missing Terminator**

*Problem:* What is wrong with this function, and how do you fix it?

```c
void copy_upper(char dest[], const char src[]) {
    int i;
    for (i = 0; src[i] != '\0'; i++)
        dest[i] = toupper(src[i]);
}
```

*Answer:* the loop stops when it reaches `src`'s `'\0'` and never copies it, so `dest` has no terminator. Printing `dest` runs past the copied letters into leftover memory. Add `dest[i] = '\0';` after the loop. At that point `i` is exactly the index where the terminator belongs, because the loop ended there. This "forgot the `'\0'`" bug is the most common deduction on hand-written string code.

**Worked Programming Exercise (#2, Strong Password Check)**

```c
#include <stdio.h>
#include <ctype.h>

int is_strong(const char pw[]) {
    int i, has_digit = 0, has_upper = 0;

    for (i = 0; pw[i] != '\0'; i++) {
        if (isdigit(pw[i]))
            has_digit = 1;
        if (isupper(pw[i]))
            has_upper = 1;
    }
    /* here i is the length of pw */
    return i >= 8 && has_digit && has_upper;
}

int main(void) {
    printf("%d\n", is_strong("Mabuhay2025"));   /* 1 */
    printf("%d\n", is_strong("mabuhay2025"));   /* 0: no uppercase */
    printf("%d\n", is_strong("Bsit1"));         /* 0: too short */
    return 0;
}
```

Output:
```
1
0
0
```

One loop collects all three facts. Each flag starts at 0 and becomes 1 the moment a matching character appears, which is the "found" flag idea from linear search. After the loop, `i` already holds the length, so the function does not need `strlen`. The return line combines the three conditions with `&&`, and a true comparison in C gives exactly 1.

**How to Pass Tips**

- For every string array you declare, count the `'\0'`. "n characters needs n + 1" is worth points on every exam.
- `strlen` versus `sizeof` is a favorite trace question. `strlen` counts text, `sizeof` measures the array.
- `strcmp` returns 0 for **equal**. Writing `if (strcmp(a, b))` to mean "equal" gets it exactly backwards.
- In traces with `isdigit` and digit characters, watch for `- '0'`. With it you get the digit's value, without it you get its character code.
- When you write a string function by hand, finish with `dest[i] = '\0';` and say why in a comment. Checkers look for that line.
$md$, 10, null, null),
  ('a3000002-0001-0002-0002-000000000011', 'a3000001-0001-0002-0001-000000000002', 'activity', 'Code Lab, Lesson 2: Make the Initials', $md$
**Coding Drill:** Complete the loop so the program builds the initials of a full name: the first letter of every word, in uppercase, each followed by a period. Press Run to compile real C right here, then try other names such as `"maria clara de los santos"` and check that the result is still correct.

Expected output:
```
Initials of Juan dela Cruz: J.D.C.
```
$md$, 11, 'c', $code$#include <stdio.h>
#include <ctype.h>

int main(void) {
    char name[] = "Juan dela Cruz";
    char initials[20];
    int i, k = 0;

    for (i = 0; name[i] != '\0'; i++) {
        /* TODO: if name[i] is a letter AND it is the first character
           (i == 0) or comes right after a space, store toupper(name[i])
           and then '.' in initials, using k as the next free slot */
    }
    initials[k] = '\0';    /* always end the string you built */

    printf("Initials of %s: %s\n", name, initials);
    return 0;
}$code$)
on conflict (id) do update set
  module_id    = excluded.module_id,
  kind         = excluded.kind,
  heading      = excluded.heading,
  body_md      = excluded.body_md,
  sort_order   = excluded.sort_order,
  ide_language = excluded.ide_language,
  starter_code = excluded.starter_code;

-- ============================================================
-- LESSON 3: POINTERS
-- ============================================================

insert into public.modules (id, subject_id, title, slug, sort_order)
values
  ('a3000001-0001-0002-0001-000000000003', '10000000-0001-0002-0001-000000000001', 'Lesson 3: Pointers', 'lesson-3-pointers', 3)
on conflict (id) do update set
  subject_id = excluded.subject_id,
  title      = excluded.title,
  slug       = excluded.slug,
  sort_order = excluded.sort_order;

insert into public.sections (id, module_id, kind, heading, body_md, sort_order, ide_language, starter_code)
values
  ('a3000002-0001-0002-0003-000000000001', 'a3000001-0001-0002-0001-000000000003', 'content', 'Memory Addresses and the & Operator', $md$
Think of memory as a long row of numbered boxes, one byte each. Every variable you declare is given some of those boxes, and the number of its first box is its **address**. An `int` usually takes 4 boxes, a `double` 8, a `char` 1.

The **address-of operator `&`** gives you a variable's address. You have used it since CP1 without thinking about it: `scanf("%d", &num)` hands `scanf` the address of `num` so it knows where to store what you type.

### Printing addresses

```c
#include <stdio.h>

int main(void) {
    int units = 21;
    double gwa = 1.75;

    printf("units = %d, stored at %p\n", units, (void *)&units);
    printf("gwa = %.2f, stored at %p\n", gwa, (void *)&gwa);
    printf("an int uses %d bytes, a double uses %d bytes\n",
           (int)sizeof units, (int)sizeof gwa);
    return 0;
}
```

Sample output (your addresses will be different):
```
units = 21, stored at 0x7ffd5e8a3b4c
gwa = 1.75, stored at 0x7ffd5e8a3b40
an int uses 4 bytes, a double uses 8 bytes
```

- **`%p`** is the conversion for addresses. C expects a `void *` there, hence the `(void *)` cast.
- **Addresses change** from run to run and from computer to computer. Never write a specific address as the answer to a trace question. What stays the same is the *relationship*: for example, `a[1]` is always `sizeof a[0]` bytes after `a[0]`.
- The sizes 4 and 8 are what almost every current computer uses. The C standard only sets minimums, so always use `sizeof` in code instead of writing 4.

### What `&` can be used on

`&` needs something that has a place in memory:

- a variable: `&units`
- an array element: `&scores[2]`

It cannot be used on a constant or the result of a calculation. `&5` and `&(x + 1)` are compile errors, because those values are not stored in a box of their own.

### Why addresses matter

So far, a function could only receive **copies** of your variables (call by value). An address lets a function reach the original variable and change it. That is what `scanf` does, and it is what the rest of this lesson builds on: you will store addresses in variables (pointers), follow them with `*`, and move them through arrays.
$md$, 1, null, null)
on conflict (id) do update set
  module_id    = excluded.module_id,
  kind         = excluded.kind,
  heading      = excluded.heading,
  body_md      = excluded.body_md,
  sort_order   = excluded.sort_order,
  ide_language = excluded.ide_language,
  starter_code = excluded.starter_code;
