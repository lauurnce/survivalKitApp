-- ============================================================
-- Computer Programming 2, Lessons 4-5: Structures, File Handling
-- Subject ID: 10000000-0001-0002-0001-000000000001
-- Modules:    a3000001-0001-0002-0001-000000000004 (Lesson 4)
--             a3000001-0001-0002-0001-000000000005 (Lesson 5)
-- Sections:   a3000002-0001-0002-00LL-0000000000SS
--             (LL = lesson, SS = position in the lesson)
--
-- Per lesson, like CP1: free notes, a free Key Takeaways recap, a free
-- Try It playground, then three paid reviewers (Practice Exercises,
-- Worked Exam Solutions + How-to-Pass Tips, Code Lab).
--
-- Every row has a fixed id and is upserted, so this file is safe to
-- re-run and deletes nothing. Run after cp2_modules_sections.sql (which
-- clears the subject's modules).
--
-- Every C program shown here was compiled with cc -std=c99 -Wall -Wextra
-- and run, and its output checked against the text.
-- ============================================================

-- ============================================================
-- LESSON 4: STRUCTURES
-- ============================================================

insert into public.modules (id, subject_id, title, slug, sort_order)
values
  ('a3000001-0001-0002-0001-000000000004', '10000000-0001-0002-0001-000000000001', 'Lesson 4: Structures', 'lesson-4-structures', 4)
on conflict (id) do update set
  subject_id = excluded.subject_id,
  title      = excluded.title,
  slug       = excluded.slug,
  sort_order = excluded.sort_order;

insert into public.sections (id, module_id, kind, heading, body_md, sort_order)
values ('a3000002-0001-0002-0004-000000000001', 'a3000001-0001-0002-0001-000000000004', 'content', 'What Is a Structure?', $md$
In Lesson 1 (Arrays) you kept many values of the **same** type under one name. Real records are not like that. A student has a name (text), a year level (a whole number), and a GWA (a decimal). Those are three different types, but they describe one person and belong together.

You could keep them in three parallel arrays, `names[]`, `years[]`, and `gwas[]`, where index 2 in each array is the same student. That works until you sort one array and forget the others: now Ana's name sits next to Ben's GWA, and the bug is hard to spot.

A **structure** (`struct`) fixes this. It groups related variables, which may have different types, under one name. Each variable inside a structure is called a **member** (some books say *field*).

Think of a structure definition as a blank enrollment form. The form lists the blanks (name, year, GWA) but holds no data yet. Every variable you declare with that structure type is one filled-in copy of the form.

| | Array | Structure |
|---|---|---|
| Types of the items | all the same | can be different |
| How you reach one item | by index: `a[2]` | by member name: `s.gwa` |
| Copy the whole thing with `=` | not allowed | allowed, copies every member |
| Typical use | a list of scores | one record (a student, a book, an item) |

You will often combine the two: an **array of structures** is a whole class list, one record per student.
$md$, 1)
on conflict (id) do update set
  module_id = excluded.module_id, kind = excluded.kind, heading = excluded.heading,
  body_md = excluded.body_md, sort_order = excluded.sort_order;

insert into public.sections (id, module_id, kind, heading, body_md, sort_order)
values ('a3000002-0001-0002-0004-000000000002', 'a3000001-0001-0002-0001-000000000004', 'content', 'Declaring Structures and Accessing Members', $md$
### Defining the Structure

```c
struct student {
    char  name[30];
    int   year;
    float gwa;
};          /* the semicolon after the brace is required */
```

This creates a new type called `struct student`. The word after `struct` (`student`) is the **tag**. Defining the type sets aside **no memory**. It only describes the shape. Put the definition above `main()` so every function can use it.

### Declaring and Initializing Variables

```c
struct student a, b;                          /* two variables, garbage inside */
struct student c = {"Ana Reyes", 1, 1.75f};   /* values in member order */
```

The values in braces go into the members in the order they were listed in the definition. Members you leave out become 0, just like a partly filled array.

### The Dot Operator

Use a dot between the variable and the member name to reach one member: `c.year`, `c.gwa`, `c.name`. A member works like any ordinary variable of its type.

```c
#include <stdio.h>
#include <string.h>

struct student {
    char  name[30];
    int   year;
    float gwa;
};

int main(void) {
    struct student a = {"Ana Reyes", 1, 1.75f};
    struct student b;

    strcpy(b.name, "Ben Cruz");   /* b.name = "Ben Cruz"; does not compile */
    b.year = 1;
    b.gwa  = 2.25f;

    printf("%s, year %d, GWA %.2f\n", a.name, a.year, a.gwa);
    printf("%s, year %d, GWA %.2f\n", b.name, b.year, b.gwa);
    return 0;
}
```

Output:
```
Ana Reyes, year 1, GWA 1.75
Ben Cruz, year 1, GWA 2.25
```

### Reading Members with `scanf`

```c
scanf("%d", &a.year);    /* & goes in front of the whole a.year */
scanf("%29s", a.name);   /* name is a char array: no & (one word only) */
```

The dot runs before `&`, so `&a.year` means "the address of `a.year`", which is what you want.

### Copying and Comparing

`b = a;` copies **every** member of `a` into `b`, even the `name` array. That is something plain arrays cannot do. But `if (a == b)` does **not** compile: C has no `==` for whole structures. Compare member by member, with `strcmp` for the strings.

### Common Mistakes

- Forgetting the `;` after the closing `}` of the definition.
- Writing `student a;` instead of `struct student a;`. In C the word `struct` is part of the type name (unless you use `typedef`, coming up later in this lesson).
- Assigning a string with `=`, as in `a.name = "Ana";`. Use `strcpy(a.name, "Ana");` from `<string.h>`.
- Comparing two structures with `==`.
$md$, 2)
on conflict (id) do update set
  module_id = excluded.module_id, kind = excluded.kind, heading = excluded.heading,
  body_md = excluded.body_md, sort_order = excluded.sort_order;
