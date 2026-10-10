-- Computer Programming 1, Lessons 1-6: Key Takeaways, one diagram per lesson,
-- and the free Try It playground moved above the locked reviewers.
--
-- Mirrors supabase/seeds/cp1_modules_sections.sql (the repo source of truth)
-- onto production, where the CP1 sections were created by that seed and so
-- carry random ids: every statement below is keyed by the production id read
-- on 2026-10-31, plus its module_id, so it can only touch the row it means.
--
-- 1. Key Takeaways: six new kind = 'content' rows (free to every reader) with
--    fixed ids, closing each lesson's notes. Upserted by id.
-- 2. Diagrams: a markdown image appended to the one notes section each diagram
--    explains. The SVGs ship in public/diagrams/cp1 with the app. Guarded by
--    the image path, so a second run appends nothing.
-- 3. Order: within each lesson the reader sorts content and reviewer rows
--    together by sort_order. New order: notes, Key Takeaways, Try It (Lessons
--    2-6; it sat at 999 under the reviewers), then the three reviewers.
--    Absolute values, so a second run changes nothing.
--
-- Gating is unchanged: no kind changes, the new rows are content, and the free
-- sample (lib/freeSample.ts) is every reviewer of Lesson 1 whatever its order.
-- Lesson 7 is untouched (no takeaways yet; its Try It stays at 999).
--
-- Idempotent. Not applied by this commit; see the .test.md for the run book.

-- 1. Key Takeaways ------------------------------------------------------

insert into public.sections (id, module_id, kind, heading, body_md, sort_order)
values
  ('a1000001-0001-0001-0002-000000000001', 'a1000001-0001-0001-0001-000000000001', 'content', 'Key Takeaways', $md$
- A **program** is an ordered set of instructions that turns data (raw facts) into information. Writing those instructions is **programming**.
- Work through the five steps in order: define the problem, design the solution, code it, test it, then document it.
- Plan before you code. A **flowchart** draws the logic with standard shapes (oval for start/stop, parallelogram for input/output, rectangle for a process, diamond for a decision). **Pseudocode** writes the same steps in plain English.
- Any program logic can be built from three structures: **sequence**, **selection**, and **repetition**.
- A **syntax error** breaks the rules of the language and is caught when compiling. A **logic error** runs fine but gives the wrong answer.
$md$, 4),
  ('a1000001-0001-0001-0002-000000000002', 'a1000001-0001-0001-0001-000000000002', 'content', 'Key Takeaways', $md$
- C is a general-purpose, structured language designed by Dennis Ritchie in 1972 at AT&T Bell Laboratories.
- Your `.c` source code passes through the preprocessor, the compiler, and the linker to become an executable. Syntax errors show up at compile time; run-time errors only show up when the program runs.
- An identifier starts with a letter or underscore, cannot be a keyword, and is case-sensitive: `sum` and `Sum` are two different names.
- Pick the type that fits the value: `int` for whole numbers, `float` or `double` for decimals, `char` for one character. A variable holds a garbage value until you give it one.
- Know the classic traps: `11 / 2` is `5` (integer division), `11 % 2` is `1`, and `y = x++` copies `x` before adding 1, while `y = ++x` adds 1 first.
$md$, 7),
  ('a1000001-0001-0001-0002-000000000003', 'a1000001-0001-0001-0001-000000000003', 'content', 'Key Takeaways', $md$
- Lines that start with `#` are handled before compiling: `#include` pulls in a header file such as `<stdio.h>`, and `#define` gives a constant a name.
- `printf()` prints formatted output. Match each conversion specifier to its type: `%d` for int, `%f` for float, `%lf` for double, `%c` for char, `%s` for a string. A number between `%` and the letter sets the field width.
- `scanf()` stores what the user types, so it needs the variable's address: `&num`. The one exception is a string (a char array): `scanf("%s", name)` takes no `&`.
- Escape sequences put special characters in text: `\n` for a new line, `\t` for a tab, `\\` for a backslash.
- Every C program starts running at `main()`, every statement ends with `;`, and `return 0;` tells the system the program finished successfully.
$md$, 6),
  ('a1000001-0001-0001-0002-000000000004', 'a1000001-0001-0001-0001-000000000004', 'content', 'Key Takeaways', $md$
- In C a condition is false when it is `0` and true when it is any non-zero value.
- `if` and `if-else` choose between paths. `switch` jumps to the `case` that matches an `int` or `char` value, and without `break` it falls through into the next case.
- A `while` loop checks its condition before each pass, so it can run zero times. A `do-while` loop checks after, so its body always runs at least once.
- A `for` loop runs its initialization once, checks the condition before every pass, and runs the increment after every pass.
- `break` leaves the loop (or `switch`) immediately; `continue` skips the rest of this pass and goes to the next one.
$md$, 5),
  ('a1000001-0001-0001-0002-000000000005', 'a1000001-0001-0001-0001-000000000005', 'content', 'Key Takeaways', $md$
- An array is a fixed-size group of values of the same type, stored side by side in memory under one name.
- Indexes start at 0, so an array of size `n` runs from `a[0]` to `a[n-1]`. Using `a[n]` goes past the end.
- Element address = array address + (size of one element × index). That is how C finds any element directly.
- In an initializer, missing values become 0, and `int b[] = {11, 21, 75};` lets the compiler count the size for you.
- A string is a `char` array that ends in `'\0'`, so `char college[6]` holds the 5 letters of `"CCMIT"` plus the terminator. Read, print, and copy arrays with a loop: one array cannot be assigned to another with `=`.
$md$, 4),
  ('a1000001-0001-0001-0002-000000000006', 'a1000001-0001-0001-0001-000000000006', 'content', 'Key Takeaways', $md$
- A function is a self-contained block of code that does one task. Functions make programs cleaner, reusable, and easier to debug.
- Declare a function with a prototype (return type, name, parameter types) before you use it, then define its body. A `void` function returns no value.
- Local variables exist only inside their function and must be initialized. Global variables are visible to every function and start at zero.
- **Call by value** passes a copy, so changing the parameter does not change the caller's variable.
- **Call by reference** passes an address with `&`, and the function uses `*` to change the caller's variable directly.
$md$, 4)
on conflict (id) do update set
  module_id  = excluded.module_id,
  kind       = excluded.kind,
  heading    = excluded.heading,
  body_md    = excluded.body_md,
  sort_order = excluded.sort_order;
