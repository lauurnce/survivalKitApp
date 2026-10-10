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

-- 2. Diagrams -----------------------------------------------------------

-- Lesson 1, Program Logic Formulation
update public.sections
set body_md = body_md || $md$
The three structures as flowcharts:

![Flowcharts of the three control structures. Sequence: input, process, output. Selection: a diamond asks if A < 0, TRUE prints NEGATIVE, FALSE prints POSITIVE. Repetition: N = N + 1 repeats while N < 10, then the loop stops.](/diagrams/cp1/lesson-1-control-structures.svg)
$md$
where id = '6284402e-ab92-43f5-b626-ce43523bfac8'
  and module_id = 'a1000001-0001-0001-0001-000000000001'
  and position('/diagrams/cp1/lesson-1-control-structures.svg' in body_md) = 0;

-- Lesson 2, The Compilation Process
update public.sections
set body_md = body_md || $md$
The same pipeline, showing where each kind of error shows up:

![The path from hello.c to a running program: preprocessor, compiler, linker with library code such as printf, executable hello.exe, then run. Syntax errors are caught at the compiler. Run-time errors only appear when the program runs.](/diagrams/cp1/lesson-2-compile-pipeline.svg)
$md$
where id = 'f245b951-8a39-44c8-b285-91f5d107a097'
  and module_id = 'a1000001-0001-0001-0001-000000000002'
  and position('/diagrams/cp1/lesson-2-compile-pipeline.svg' in body_md) = 0;

-- Lesson 3, Standard Input: scanf()
update public.sections
set body_md = body_md || $md$
Why `scanf` needs `&` but `printf` does not:

![You type 42. scanf with %d and &num stores 42 in the variable num, because &num tells it where num lives. printf with %5d and num only needs the value, and prints 42 at the right of a 5-column field: three blanks, then 4, then 2.](/diagrams/cp1/lesson-3-scanf-printf-memory.svg)
$md$
where id = '1975bdf2-b5fd-49a9-8cd9-24f3f5e5c4d9'
  and module_id = 'a1000001-0001-0001-0001-000000000003'
  and position('/diagrams/cp1/lesson-3-scanf-printf-memory.svg' in body_md) = 0;

-- Lesson 4, Loop Structures
update public.sections
set body_md = body_md || $md$
Tracing a `for` loop step by step:

![Flowchart and trace of for (i = 1; i <= 3; i++) printf i. i = 1 runs once. The check i <= 3 is true for i = 1, 2 and 3, so it prints 1 2 3, doing i++ after each pass. At i = 4 the check is false and the loop ends: checked 4 times, body ran 3 times.](/diagrams/cp1/lesson-4-for-loop-trace.svg)
$md$
where id = 'bbb300f2-2cc1-4b24-88a8-aa7c852a5147'
  and module_id = 'a1000001-0001-0001-0001-000000000004'
  and position('/diagrams/cp1/lesson-4-for-loop-trace.svg' in body_md) = 0;

-- Lesson 5, What Is an Array?
update public.sections
set body_md = body_md || $md$
The formula, worked on a real array:

![int a[5] = {5, 3, 2, 7, 9} in memory. Indexes a[0] to a[4] hold 5, 3, 2, 7 and 9 at example addresses 1000, 1004, 1008, 1012 and 1016. Each int is 4 bytes, so the address of a[3] is 1000 + 4 × 3 = 1012. a[5] would be past the end of the array.](/diagrams/cp1/lesson-5-array-indexing.svg)
$md$
where id = '989716a3-8d09-43eb-92f8-935de90074ff'
  and module_id = 'a1000001-0001-0001-0001-000000000005'
  and position('/diagrams/cp1/lesson-5-array-indexing.svg' in body_md) = 0;

-- Lesson 6, Call by Value vs. Call by Reference
update public.sections
set body_md = body_md || $md$
Both calls side by side:

![Call by value: main has n = 5, funct_sample gets a copy y, triples it to 15, and n is still 5 afterwards. Call by reference: main passes the address of fin_grd, compute_rating stores through that address, and fin_grd in main becomes 85.0 for a midterm of 80 and a final of 90.](/diagrams/cp1/lesson-6-value-vs-reference.svg)
$md$
where id = '4b8b37b3-a486-48e7-a324-ef2c5ca144b8'
  and module_id = 'a1000001-0001-0001-0001-000000000006'
  and position('/diagrams/cp1/lesson-6-value-vs-reference.svg' in body_md) = 0;

-- 3. Order -------------------------------------------------------------

update public.sections s
set sort_order = v.sort_order
from (values
  ('035347a5-e27f-4eba-83bd-efb2079865e7', 'a1000001-0001-0001-0001-000000000001', 'activity', 5),  -- L1 Practice Exercises
  ('02c16eab-c022-4537-ac01-0f1955c5c4a6', 'a1000001-0001-0001-0001-000000000001', 'activity', 6),  -- L1 Worked Exam Solutions
  ('a73447e3-f71b-4172-ae8b-3073fe586253', 'a1000001-0001-0001-0001-000000000001', 'activity', 7),  -- L1 Code Lab
  ('40389029-1607-4b93-ab4c-ee1d2919a0b0', 'a1000001-0001-0001-0001-000000000002', 'content',  8),  -- L2 Try It
  ('3231301f-2d25-4d0a-bc6d-9455b07714b1', 'a1000001-0001-0001-0001-000000000002', 'activity', 9),  -- L2 Practice Exercises
  ('0f76717e-55c4-4335-9159-f25490eff43c', 'a1000001-0001-0001-0001-000000000002', 'activity', 10),  -- L2 Worked Exam Solutions
  ('73e78670-17bf-4d9e-9d97-d5670d08ce14', 'a1000001-0001-0001-0001-000000000002', 'activity', 11),  -- L2 Code Lab
  ('f82cd129-af5a-475c-9aa1-957e60b93a5c', 'a1000001-0001-0001-0001-000000000003', 'content',  7),  -- L3 Try It
  ('3cd61dc6-706f-4764-b6f8-f94caea5a02d', 'a1000001-0001-0001-0001-000000000003', 'activity', 8),  -- L3 Practice Exercises
  ('9cb9a313-a3de-4d88-aeb4-35f31a59b311', 'a1000001-0001-0001-0001-000000000003', 'activity', 9),  -- L3 Worked Exam Solutions
  ('39392f7e-a601-47f6-aeda-9861fa09a8aa', 'a1000001-0001-0001-0001-000000000003', 'activity', 10),  -- L3 Code Lab
  ('7af3f945-7ec3-4730-b105-65c281ff34e2', 'a1000001-0001-0001-0001-000000000004', 'content',  6),  -- L4 Try It
  ('f85c2a3f-191f-4c7c-8b42-ce419102cf69', 'a1000001-0001-0001-0001-000000000004', 'activity', 7),  -- L4 Practice Exercises
  ('bd2976c1-cd14-4e78-9867-b1e7f08d1dd8', 'a1000001-0001-0001-0001-000000000004', 'activity', 8),  -- L4 Worked Exam Solutions
  ('ea39fdb9-74aa-44b9-94bd-a576b1ea81fc', 'a1000001-0001-0001-0001-000000000004', 'activity', 9),  -- L4 Code Lab
  ('1d8ceb95-9e2a-4ed7-9054-ea6cc3abe25a', 'a1000001-0001-0001-0001-000000000005', 'content',  5),  -- L5 Try It
  ('03d4b6c4-6bfc-40c1-a3b5-b13c72ccc633', 'a1000001-0001-0001-0001-000000000005', 'activity', 6),  -- L5 Practice Exercises
  ('dfcddf02-4959-4f91-b5fe-196ff77d3e0d', 'a1000001-0001-0001-0001-000000000005', 'activity', 7),  -- L5 Worked Exam Solutions
  ('fe6af405-8533-48c1-b686-a69c483da7ca', 'a1000001-0001-0001-0001-000000000005', 'activity', 8),  -- L5 Code Lab
  ('c644effa-2a01-4b0c-a2bf-193b9b8fb1f5', 'a1000001-0001-0001-0001-000000000006', 'content',  5),  -- L6 Try It
  ('82e801ef-48a8-45d1-af74-651ef3df02bd', 'a1000001-0001-0001-0001-000000000006', 'activity', 6),  -- L6 Practice Exercises
  ('c97f0c82-afef-4c09-bd2c-60e17ef85bef', 'a1000001-0001-0001-0001-000000000006', 'activity', 7),  -- L6 Worked Exam Solutions
  ('66846830-cb70-4691-b5c5-595dedcd1538', 'a1000001-0001-0001-0001-000000000006', 'activity', 8)   -- L6 Code Lab
) as v(id, module_id, kind, sort_order)
where s.id = v.id::uuid
  and s.module_id = v.module_id::uuid
  and s.kind = v.kind
  and s.sort_order is distinct from v.sort_order;
