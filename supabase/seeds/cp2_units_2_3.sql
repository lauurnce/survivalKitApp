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
$md$, 1, null, null),
  ('a3000002-0001-0002-0003-000000000002', 'a3000001-0001-0002-0001-000000000003', 'content', 'Pointer Variables and the * Operator', $md$
A **pointer** is a variable that holds an address. You declare one by putting `*` before its name:

```c
int *p;        /* p can hold the address of an int */
double *q;     /* q can hold the address of a double */
char *c;       /* c can hold the address of a char */
```

Read `int *p` as "p is a pointer to int". The type matters: an `int *` should only point at `int`s, because the type tells C how many bytes to read when it follows the pointer.

### Pointing and following

```c
#include <stdio.h>

int main(void) {
    int x = 10;
    int *p = &x;      /* p holds the address of x */

    printf("x = %d\n", x);
    printf("*p = %d\n", *p);    /* read x through p */

    *p = 25;                    /* write x through p */
    printf("x = %d\n", x);

    printf("p == &x is %d\n", p == &x);
    return 0;
}
```

Output:
```
x = 10
*p = 10
x = 25
p == &x is 1
```

- **`p = &x`** makes `p` point to `x`. Now `p` holds `x`'s address.
- **`*p`** follows the pointer to the variable it points to. This is called **dereferencing**. `*p` reads `x`, and `*p = 25` changes `x`, even though the statement never mentions `x`.
- `p` itself never changed. It still holds the same address, as the last line shows.

The same program as boxes and an arrow (the addresses are examples):

![int x = 10; int *p = &x; *p = 25; as boxes. p, at address 2040, holds 1000, the address of x, drawn as an arrow to x. x, at address 1000, now holds 25. p is 1000, *p is 25, &x is 1000, and &p is 2040. *p = 25 changed x without naming it.](/diagrams/cp2/lesson-3-pointer-to-variable.svg)

### Two meanings of `*`

The same symbol does two different jobs, and mixing them up is the most common source of confusion:

| Where it appears | Meaning | Example |
|---|---|---|
| In a declaration | "this variable is a pointer" | `int *p;` |
| In an expression | "the value at this address" | `*p = 25;` |

So `int *p = &x;` means "declare a pointer `p` and store `&x` in it". It does **not** store anything in `*p`.

### `NULL`: pointing nowhere

A pointer that does not point to anything yet should hold `NULL` (defined in `<stdio.h>` and other standard headers):

```c
int *p = NULL;
if (p != NULL)
    printf("%d\n", *p);    /* only follow p when it points somewhere */
```

Following a `NULL` pointer crashes the program on most systems. A pointer that was **never initialized** is worse: it holds a leftover garbage address, and writing through it can silently damage other data. Give every pointer a value when you declare it, either a real address or `NULL`.

### One star per pointer

```c
int *p, q;     /* p is a pointer, q is a plain int */
int *r, *s;    /* both are pointers */
```

The `*` belongs to the name next to it, not to the type. Writing it as `int* p, q;` does not change this, and only makes it easier to misread.
$md$, 2, null, null),
  ('a3000002-0001-0002-0003-000000000003', 'a3000001-0001-0002-0001-000000000003', 'content', 'Pointers as Function Parameters', $md$
In CP1 Lesson 6 you met **call by reference**: pass `&x`, receive it as a pointer, and change the caller's variable with `*`. Now that you know what a pointer is, here is exactly why it works, and the two jobs it is used for.

### Why a plain swap fails

```c
#include <stdio.h>

void swap_copy(int a, int b) {    /* gets copies of x and y */
    int temp = a;
    a = b;
    b = temp;                     /* only the copies are swapped */
}

int main(void) {
    int x = 3, y = 8;

    swap_copy(x, y);
    printf("x = %d, y = %d\n", x, y);
    return 0;
}
```

Output:
```
x = 3, y = 8
```

`a` and `b` are new variables that start as copies. Swapping them does nothing to `x` and `y`, and the copies disappear when the function returns.

### Job 1: changing the caller's variables

Pass the **addresses**, and swap the values they point to:

```c
#include <stdio.h>

void swap(int *a, int *b) {
    int temp = *a;     /* value at a's address (x) */
    *a = *b;           /* x gets y's value */
    *b = temp;         /* y gets x's old value */
}

int main(void) {
    int x = 3, y = 8;

    swap(&x, &y);
    printf("x = %d, y = %d\n", x, y);
    return 0;
}
```

Output:
```
x = 8, y = 3
```

Inside `swap`, `a` holds the address of `x`, so `*a` **is** `x`. Every change through `*a` and `*b` lands directly on `main`'s variables.

### Job 2: returning more than one result

`return` gives back only one value. When a function must produce two or more results, the caller passes the addresses where they should go:

```c
#include <stdio.h>

void min_max(const int arr[], int n, int *min, int *max) {
    int i;
    *min = arr[0];
    *max = arr[0];
    for (i = 1; i < n; i++) {
        if (arr[i] < *min) *min = arr[i];
        if (arr[i] > *max) *max = arr[i];
    }
}

int main(void) {
    int temps[5] = {31, 28, 34, 30, 27};
    int lo, hi;

    min_max(temps, 5, &lo, &hi);
    printf("lowest %d, highest %d\n", lo, hi);
    return 0;
}
```

Output:
```
lowest 27, highest 34
```

`lo` and `hi` have no values before the call. The function fills them through the pointers. This is exactly what `scanf("%d %d", &a, &b)` does: it "returns" two numbers by writing them to the addresses you gave it.

### Checklist for pointer parameters

- In the **prototype**, the parameter type has a star: `void swap(int *a, int *b)`.
- In the **call**, pass addresses with `&`: `swap(&x, &y)`. (An array name is already an address, so `min_max(temps, ...)` needs no `&`.)
- In the **body**, use `*a` for the value. Writing `a = b;` would only change which address the local pointer holds, and the caller would see nothing.
$md$, 3, null, null),
  ('a3000002-0001-0002-0003-000000000004', 'a3000001-0001-0002-0001-000000000003', 'content', 'Pointer Arithmetic', $md$
When a pointer points into an array, you can move it with `+` and `-`. C does the size calculation for you: **adding 1 to a pointer moves it to the next element**, not the next byte. For an `int *`, `p + 1` is `sizeof(int)` bytes (usually 4) further along. For a `double *`, it is 8 bytes.

```c
#include <stdio.h>

int main(void) {
    int a[5] = {10, 20, 30, 40, 50};
    int *p = &a[0];
    int *q = &a[3];

    printf("%d\n", *p);            /* a[0] */
    printf("%d\n", *(p + 2));      /* two elements later: a[2] */
    p++;                           /* p now points at a[1] */
    printf("%d\n", *p);
    printf("%d\n", (int)(q - p));  /* elements between them */
    printf("%d\n", *q - *p);       /* difference of the values */
    printf("%d\n", p < q);         /* p comes before q */
    return 0;
}
```

Output:
```
10
30
20
2
20
1
```

### The four operations

| Operation | Meaning | Example (`p` at `a[1]`, `q` at `a[3]`) |
|---|---|---|
| `p + n`, `p - n` | the address `n` elements later or earlier | `p + 2` points at `a[3]` |
| `p++`, `p--` | move `p` itself one element | `p++` moves it to `a[2]` |
| `q - p` | how many elements apart (both in the same array) | `q - p` is 2 |
| `p < q`, `p == q` | which comes first, or the same place | `p < q` is 1 |

Adding two pointers, or multiplying them, has no meaning and does not compile.

### Stay inside the array

Pointer arithmetic is only defined inside one array, plus the single position just past its last element (which you may compare against but never dereference). `p + 10` on a 5-element array is undefined behavior even if you never read it. The array bounds rules from Lesson 1 apply to pointers too.

### Watch the parentheses

`*` and `++` are easy to misread. Compare these, all starting from `p` at `a[0]`:

```c
#include <stdio.h>

int main(void) {
    int a[3] = {5, 10, 15};
    int *p = a;

    printf("%d\n", *p + 1);    /* value at p, plus one: 6 */
    printf("%d\n", *(p + 1));  /* the next element: 10 */
    printf("%d\n", *p++);      /* use *p, then move p: 5 */
    printf("%d\n", *p);        /* p moved to a[1]: 10 */
    (*p)++;                    /* add 1 to the value at p */
    printf("%d\n", a[1]);      /* 11 */
    return 0;
}
```

Output:
```
6
10
5
10
11
```

- `*p + 1` adds to the **value**. `*(p + 1)` moves the **pointer**.
- `*p++` reads the value first, then moves the pointer (the `++` applies to `p`, not to `*p`).
- `(*p)++` increases the value and leaves the pointer where it is.

When in doubt, add parentheses. Nobody loses points for `*(p + 1)`.
$md$, 4, null, null),
  ('a3000002-0001-0002-0003-000000000005', 'a3000001-0001-0002-0001-000000000003', 'content', 'Pointers and Arrays', $md$
Pointers and arrays are closely linked in C. Once you see how, a lot of earlier rules suddenly make sense: why `scanf("%s", name)` needs no `&`, and why a function can change the array you pass it.

### The array name is the address of the first element

In almost every expression, an array name turns into a pointer to its first element. So for `int a[5];`:

- `a` is the same address as `&a[0]`.
- `a + i` is the address of `a[i]`.
- **`a[i]` is exactly `*(a + i)`.** The bracket notation is just a convenient way to write pointer arithmetic.

```c
#include <stdio.h>

int sum(const int *a, int n) {
    const int *p;
    int total = 0;
    for (p = a; p < a + n; p++)    /* walk from first to last */
        total += *p;
    return total;
}

int length(const char *s) {
    const char *start = s;
    while (*s != '\0')
        s++;
    return (int)(s - start);       /* how far s moved */
}

int main(void) {
    int nums[4] = {3, 6, 9, 12};
    char course[] = "BSIT";

    printf("%d %d\n", nums[2], *(nums + 2));
    printf("sum = %d\n", sum(nums, 4));
    printf("length = %d\n", length(course));
    printf("sizeof nums = %d\n", (int)sizeof nums);
    return 0;
}
```

Output (on a system with 4-byte ints, which is almost every one today):
```
9 9
sum = 30
length = 4
sizeof nums = 16
```

### Array parameters are pointers

In a parameter list, `int a[]` and `int *a` mean exactly the same thing. That is why:

- `sum(nums, 4)` passes only an address, and the function cannot tell how long the array is. You pass `n`.
- a function can change the caller's array: it has the address of the original elements.
- `sizeof` inside the function gives the size of a pointer, while `sizeof nums` in `main` gives the whole array, 16 bytes.

Inside the function you may use either notation. `a[i]` and `*(a + i)` compile to the same thing, so use whichever is clearer.

### Where arrays and pointers differ

A pointer is a variable; an array name is not. So:

```c
int nums[4] = {3, 6, 9, 12};
int *p = nums;    /* fine: p now points at nums[0] */
p++;              /* fine: p moves to nums[1] */
```

But `nums++` and `nums = p` do not compile. The array always stays where it was created.

### `char *` versus `char []` for strings

```c
char s[] = "BSIT";      /* an array: your own 5-byte copy of the text */
const char *t = "BSIT"; /* a pointer to the literal, which is read-only */
```

You may change `s[0]`, but not `t[0]`: changing a string literal is undefined behavior and usually crashes. Marking `t` as `const char *` makes the compiler catch the mistake for you. The `length` function above takes `const char *s`, so it accepts both kinds.
$md$, 5, null, null),
  ('a3000002-0001-0002-0003-000000000006', 'a3000001-0001-0002-0001-000000000003', 'content', 'Common Pointer Mistakes', $md$
Pointer bugs are hard to find because many of them compile, and some only fail sometimes. Learn to spot these on sight.

### 1. Using a pointer before it points anywhere

```c
int *p;
*p = 5;          /* WRONG: p holds a garbage address */

int x;
int *q = &x;
*q = 5;          /* right: q points at x first */
```

An uninitialized pointer holds whatever bits were left in memory. Writing through it may crash, or may overwrite some other variable and cause a strange bug much later. Compilers can warn about it (`-Wall` turns this on), which is one more reason to compile with warnings and read them.

### 2. Following a `NULL` pointer

`NULL` means "points nowhere", so `*p` on a `NULL` pointer crashes on most systems. When a function may return `NULL`, such as `strchr` when the character is not found, check before you use the result:

```c
#include <stdio.h>
#include <string.h>

int main(void) {
    char email[] = "juan@school.edu.ph";
    char *at = strchr(email, '@');

    if (at != NULL)
        printf("domain: %s\n", at + 1);
    else
        printf("no @ found\n");
    return 0;
}
```

Output:
```
domain: school.edu.ph
```

`strchr` returns a pointer to the `@` inside `email`, so `at + 1` is a pointer to the rest of the string, and `%s` prints from there to the `'\0'`.

### 3. Mixing up `p` and `*p`

```c
int x = 7;
int *p = &x;

if (*p == 7)     /* compares the VALUE: right */
if (p == 7)      /* compares the ADDRESS with 7: wrong */
p = 9;           /* tries to store 9 as an address: wrong */
*p = 9;          /* stores 9 in x: right */
```

When the left side is a pointer and the right side is a plain number (or the other way around), something is missing: a `*` or a `&`. Compilers warn about these, and newer ones refuse to compile `p = 9;`.

### 4. One star, one pointer

```c
int *p, q;       /* q is an int, not a pointer */
```

Writing `q = &x;` then mixes an address and an int, which is mistake 3 again. Declare each pointer with its own star: `int *p, *q;`.

### 5. Forgetting `&` in a call

```c
int n;
scanf("%d", n);      /* WRONG: passes n's garbage value as an address */
scanf("%d", &n);     /* right */
```

`scanf` writes to whatever address you give it. Passing the value of `n` makes it write to a random place. Compilers warn: "format specifies type `int *` but the argument has type `int`".

### 6. Returning the address of a local variable

```c
int *bad(void) {
    int result = 42;
    return &result;      /* WRONG: result disappears when bad() returns */
}
```

Local variables live only while their function runs. The pointer you get back points at memory that is about to be reused, so reading it gives garbage or crashes. Return the value itself (`int good(void) { return 42; }`), or let the caller pass a pointer to its own variable, as `min_max` did.

### 7. Going past the end of the array

`*(a + 5)` on a 5-element array is the same bug as `a[5]`: outside the array, undefined behavior. When you walk an array with a pointer, the loop test is `p < a + n`, never `p <= a + n`.
$md$, 6, null, null),
  ('a3000002-0001-0002-0003-000000000007', 'a3000001-0001-0002-0001-000000000003', 'content', 'Key Takeaways', $md$
- `&x` gives the address of `x`. A pointer is a variable that holds an address: `int *p = &x;` makes `p` point to `x`, and `%p` with a `(void *)` cast prints it.
- In a declaration `*` means "is a pointer"; in an expression `*p` means "the value at that address". `*p = 25;` changes `x` without naming it. Initialize every pointer to a real address or `NULL`, and never follow a `NULL` or uninitialized pointer.
- To let a function change the caller's variables, or give back more than one result, pass addresses (`swap(&x, &y)`) and work through `*` inside the function.
- Adding 1 to a pointer moves it one element, not one byte. `q - p` counts the elements between them, and pointer arithmetic is only valid inside one array.
- An array name is the address of its first element, so `a[i]` is `*(a + i)` and an array parameter is really a pointer. But an array name cannot be moved or reassigned, and `sizeof` only sees the whole array where it is declared.
$md$, 7, null, null),
  ('a3000002-0001-0002-0003-000000000008', 'a3000001-0001-0002-0001-000000000003', 'content', 'Try It: Pointers', $md$
Change where `p` points (try `&a[1]` or `a + 3`), then predict every line before you press Run.
$md$, 8, 'c', $code$#include <stdio.h>

void swap(int *x, int *y) {
    int temp = *x;
    *x = *y;
    *y = temp;
}

int main(void) {
    int a[5] = {10, 20, 30, 40, 50};
    int *p = &a[2];

    printf("*p = %d, it is element %d\n", *p, (int)(p - a));
    printf("*(p - 1) = %d, *(p + 1) = %d\n", *(p - 1), *(p + 1));

    *p = 99;                      /* change a[2] through p */
    swap(&a[0], &a[4]);           /* swap the first and last */

    printf("Array now:");
    for (p = a; p < a + 5; p++)   /* walk the array with p */
        printf(" %d", *p);
    printf("\n");
    return 0;
}$code$),
  ('a3000002-0001-0002-0003-000000000009', 'a3000001-0001-0002-0001-000000000003', 'activity', 'Practice Exercises, Lesson 3', $md$
**Review questions:**
1. Given `int x = 7; int *p = &x;`, what are the values of `x` and `*p`, and what does `p` hold?
2. Explain the two meanings of `*` in `int *p = &x;` and `*p = 10;`.
3. Given `double d[4];` and `double *p = d;`, if `p` holds the address 1000, what address does `p + 3` hold? (A `double` is 8 bytes.)
4. Which of these mean the same as `a[2]`: (a) `*(a + 2)` (b) `*a + 2` (c) `&a[2]` (d) `*(&a[2])`?
5. A function must give back both the quotient and the remainder of two integers. Why can it not do this with `return` alone, and what should its parameters be?

**Trace and predict the output:**
```c
// (a)
int a = 5, b = 10;
int *p = &a, *q = &b;
*p = *p + *q;
q = p;
*q = *q * 2;
printf("%d %d", a, b);

// (b)
int arr[5] = {2, 4, 6, 8, 10};
int *p = arr + 1;
printf("%d ", *p);
p += 2;
printf("%d ", *p);
printf("%d", *(p - 3));

// (c)
void f(int *x, int y) {
    *x = *x + y;
    y = y * 2;
}
/* in main: */
int m = 3, n = 4;
f(&m, n);
printf("%d %d", m, n);

// (d)
char s[] = "PUP";
char *p = s;
while (*p != '\0') {
    printf("%c", *p + 1);
    p++;
}
```

**Programming exercises:**
1. Write `void divide(int a, int b, int *q, int *r)` that stores the quotient and the remainder of `a / b`. Call it from `main` and print both.
2. Write `int sum(const int *a, int n)` using only pointer notation: no square brackets anywhere in the function.
3. Write `void reverse(int *a, int n)` that reverses an array in place using two pointers, one starting at each end.
4. Write `int count_char(const char *s, char c)` that walks the string with a pointer (no index variable) and returns how many times `c` appears.
$md$, 9, null, null),
  ('a3000002-0001-0002-0003-000000000010', 'a3000001-0001-0002-0001-000000000003', 'activity', 'Worked Exam Solutions + How-to-Pass Tips, Lesson 3', $md$
**Answer Key, Review Questions**

1. `x` is **7** and `*p` is **7** (the same variable, reached through `p`). `p` holds **the address of `x`**. Never write a number for an address: it changes from run to run.
2. In the declaration, `*` says "`p` is a pointer to int", and `= &x` stores the address in `p`. In `*p = 10;`, `*` means "the variable `p` points to", so 10 is stored in `x`.
3. **1024**. `p + 3` moves 3 elements, and each `double` is 8 bytes: 1000 + 3 × 8.
4. **(a) and (d)**. (b) is `a[0] + 2`, the first value plus two. (c) is the address of `a[2]`, not its value.
5. `return` gives back one value. Pass pointers for the results: `void divide(int a, int b, int *q, int *r)`, called as `divide(17, 5, &q, &r);`.

**Answer Key, Traces**

- (a) **`30 10`**. `*p = *p + *q` makes `a` 15. Then `q = p` points `q` at `a` as well (it no longer points at `b`), so `*q = *q * 2` doubles `a` to 30. `b` is never changed.
- (b) **`4 8 2`**. `arr + 1` points at `arr[1]` (4). `p += 2` moves it to `arr[3]` (8). `p - 3` is `arr[0]` (2).
- (c) **`7 4`**. `m` was passed by address, so `*x = *x + y` changes it to 7. `n` was passed by value: doubling the copy `y` has no effect on `n`.
- (d) **`QVQ`**. `*p + 1` adds 1 to each character code: `P` becomes `Q`, `U` becomes `V`. The string itself is not changed, only what is printed.

**Worked Exam-Style Problem, Spot the Broken Swap**

*Problem:* This swap compiles but does not work. Why?

```c
void swap(int *a, int *b) {
    int *temp = a;
    a = b;
    b = temp;
}
```

*Answer:* it swaps the **pointers**, not the values. `a` and `b` are local copies of the two addresses, so exchanging them changes nothing in the caller, exactly like the plain `int` swap that fails. The fix works on the values they point to: `int temp = *a; *a = *b; *b = temp;`. Rule of thumb: if a function's job is to change the caller's data, there must be a `*` on the left side of an assignment somewhere.

**Worked Programming Exercise (#3, Reverse with Two Pointers)**

```c
#include <stdio.h>

void reverse(int *a, int n) {
    int *left = a;            /* first element */
    int *right = a + n - 1;   /* last element */
    int temp;

    while (left < right) {
        temp = *left;
        *left = *right;
        *right = temp;
        left++;               /* move inward from both ends */
        right--;
    }
}

int main(void) {
    int nums[6] = {1, 2, 3, 4, 5, 6};
    int *p;

    reverse(nums, 6);
    for (p = nums; p < nums + 6; p++)
        printf("%d ", *p);
    printf("\n");
    return 0;
}
```

Output:
```
6 5 4 3 2 1
```

This is the reverse-in-place pattern from Lesson 1, written with pointers. `a + n - 1` is the last element (not `a + n`, which is one past the end). The loop runs while `left < right`: comparing two pointers into the same array is allowed, and it stops exactly when they meet or cross, so an odd-length array leaves its middle element alone.

**How to Pass Tips**

- Trace pointer questions with boxes and arrows. Draw each variable as a box, and each pointer as an arrow to a box. When a line says `q = p`, move the arrow. When it says `*q = ...`, change the box the arrow points to.
- Separate "which address" from "which value" in every line. `p = ...` changes where `p` points; `*p = ...` changes the variable it points to.
- For "what is printed" with pointer arithmetic, rewrite each pointer as `arr + k` and each `*(arr + k)` as `arr[k]`. Then it is an ordinary array trace.
- `*p++` reads first and then moves `p`. `(*p)++` changes the value. Exams use both on the same page.
- Never give a specific number as an address unless the question gives you one to start from.
$md$, 10, null, null),
  ('a3000002-0001-0002-0003-000000000011', 'a3000001-0001-0002-0001-000000000003', 'activity', 'Code Lab, Lesson 3: Sort Three Numbers', $md$
**Coding Drill:** `sort3` should rearrange three variables in `main` so they end up in ascending order. It receives their addresses, and `swap` is already written for you. Complete `sort3` with three compare-and-swap steps, then press Run to compile real C right here. Try other starting values, including ties such as `5, 5, 1`, to make sure your steps always work.

Expected output:
```
Before: 17 4 9
Sorted: 4 9 17
```
$md$, 11, 'c', $code$#include <stdio.h>

void swap(int *x, int *y) {
    int temp = *x;
    *x = *y;
    *y = temp;
}

void sort3(int *a, int *b, int *c) {
    /* TODO 1: if the value at a is greater than the value at b, swap them */
    /* TODO 2: if the value at b is greater than the value at c, swap them */
    /* TODO 3: if the value at a is greater than the value at b, swap them again */
}

int main(void) {
    int p = 17, q = 4, r = 9;

    printf("Before: %d %d %d\n", p, q, r);
    sort3(&p, &q, &r);
    printf("Sorted: %d %d %d\n", p, q, r);
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
