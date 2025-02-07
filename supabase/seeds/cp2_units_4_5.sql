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

insert into public.sections (id, module_id, kind, heading, body_md, sort_order)
values ('a3000002-0001-0002-0004-000000000003', 'a3000001-0001-0002-0001-000000000004', 'content', 'Arrays of Structures', $md$
A single structure variable holds one record. To hold a whole class, declare an **array of structures**:

```c
struct student cls[40];    /* 40 records, cls[0] to cls[39] */
```

Read `cls[i].gwa` from left to right: take element `i` of the array, then its `gwa` member. Writing `cls.gwa[i]` is wrong, because `cls` is the array, not a structure, and `gwa` is not an array.

The program below prints a class list, the class average, and the top student. In most Philippine colleges **1.00 is the highest grade**, so the best GWA is the **smallest** number, and the comparison uses `<`.

```c
#include <stdio.h>

struct student {
    char  name[30];
    int   year;
    float gwa;
};

int main(void) {
    struct student cls[4] = {
        {"Ana Reyes",    1, 1.75f},
        {"Ben Cruz",     1, 2.25f},
        {"Carla Santos", 1, 1.50f},
        {"Dan Lim",      1, 2.50f}
    };
    int i, best = 0;
    float total = 0;

    for (i = 0; i < 4; i++) {
        printf("%-13s %.2f\n", cls[i].name, cls[i].gwa);
        total += cls[i].gwa;
        if (cls[i].gwa < cls[best].gwa)
            best = i;
    }
    printf("Class average: %.2f\n", total / 4);
    printf("Top student:   %s\n", cls[best].name);
    return 0;
}
```

Output:
```
Ana Reyes     1.75
Ben Cruz      2.25
Carla Santos  1.50
Dan Lim       2.50
Class average: 2.00
Top student:   Carla Santos
```

Notice that `best` stores an **index**, not a GWA. Once you know the index, `cls[best]` gives you the whole record, name and all.

### Why This Beats Parallel Arrays

When you sort an array of structures, you swap whole records (`temp = cls[i]; cls[i] = cls[i + 1]; cls[i + 1] = temp;`). The name, year, and GWA always move together, so they can never get out of step.

### Common Mistakes

- `cls.gwa[i]` instead of `cls[i].gwa`.
- Running the loop to `i <= 4` for a 4-element array. Indexes still stop at size − 1, exactly as in Lesson 1 (Arrays).
- Initializing `total` or `best` inside the loop, which resets them on every pass.
$md$, 3)
on conflict (id) do update set
  module_id = excluded.module_id, kind = excluded.kind, heading = excluded.heading,
  body_md = excluded.body_md, sort_order = excluded.sort_order;

insert into public.sections (id, module_id, kind, heading, body_md, sort_order)
values ('a3000002-0001-0002-0004-000000000004', 'a3000001-0001-0002-0001-000000000004', 'content', 'typedef and Nested Structures', $md$
### `typedef`: A Shorter Name

Typing `struct student` every time gets tiring. `typedef` gives an existing type a second name:

```c
typedef struct {
    char  name[30];
    int   year;
    float gwa;
} Student;           /* Student is now a type name */

Student s;           /* no "struct" needed */
Student cls[40];
```

`typedef` does **not** create a new kind of data. It only adds a name. You can also name a tagged structure: `typedef struct student Student;` makes `Student` and `struct student` mean the same type.

A common convention is to start typedef names with a capital letter (`Student`, `Date`) so they stand out from variables.

### Nested Structures

A member can itself be a structure. A student has a birthday, and a birthday is a month, a day, and a year:

```c
#include <stdio.h>

typedef struct {
    int month, day, year;
} Date;

typedef struct {
    char name[30];
    Date birthday;          /* a structure inside a structure */
} Student;

int main(void) {
    Student s = {"Ana Reyes", {3, 14, 2006}};

    s.birthday.year = 2007;     /* outer member, then inner member */
    printf("%s was born on %d/%d/%d\n", s.name,
           s.birthday.month, s.birthday.day, s.birthday.year);
    return 0;
}
```

Output:
```
Ana Reyes was born on 3/14/2007
```

To reach a member of the inner structure, use one dot per level: `s.birthday.year` means "the `year` of the `birthday` of `s`". The initializer uses inner braces for the inner structure: `{3, 14, 2006}` fills `birthday`.

### Common Mistakes

- Writing `s.year` when `year` belongs to the inner structure. Every level needs its own dot.
- Defining `Date` **after** `Student`. The compiler reads from top to bottom, so the inner type must already exist when the outer one uses it.
- Forgetting the type name after the closing brace of a `typedef struct { ... }`, which leaves you with no name to use.
$md$, 4)
on conflict (id) do update set
  module_id = excluded.module_id, kind = excluded.kind, heading = excluded.heading,
  body_md = excluded.body_md, sort_order = excluded.sort_order;

insert into public.sections (id, module_id, kind, heading, body_md, sort_order)
values ('a3000002-0001-0002-0004-000000000005', 'a3000001-0001-0002-0001-000000000004', 'content', 'Structures and Functions', $md$
You can pass a structure to a function and return one from a function, just like an `int`.

### Passing by Value Copies the Whole Structure

When you pass a structure the normal way, the function gets a **copy** of every member. This is call by value from CP1 Lesson 6, applied to a structure. Changing the copy does nothing to the caller's variable. If you want the change, **return** the changed structure and assign it.

```c
#include <stdio.h>

typedef struct {
    int x, y;
} Point;

void move_copy(Point p) {
    p.x = p.x + 10;          /* changes the copy only */
}

Point moved(Point p, int dx) {
    p.x = p.x + dx;
    return p;                /* send the changed copy back */
}

int main(void) {
    Point a = {1, 2};

    move_copy(a);
    printf("after move_copy: (%d, %d)\n", a.x, a.y);

    a = moved(a, 10);
    printf("after moved:     (%d, %d)\n", a.x, a.y);
    return 0;
}
```

Output:
```
after move_copy: (1, 2)
after moved:     (11, 2)
```

`move_copy` changed its own copy and threw it away. `moved` returned its copy, and `a = moved(a, 10);` stored it back.

### Arrays of Structures Are Not Copied

An array parameter is really a pointer to the first element (Lesson 3, Pointers). So when you pass an array of structures, the function works on the caller's records directly:

```c
void curve(Student list[], int n) {
    int i;
    for (i = 0; i < n; i++)
        list[i].gwa -= 0.25f;     /* changes the caller's array */
}
```

If a function should only read the array, write the parameter as `const Student list[]`. The compiler will then refuse any line that tries to change a record.

### Common Mistakes

- Expecting a function to change a structure that was passed by value. It changed a copy.
- Returning a structure but forgetting to assign the result: `moved(a, 10);` alone throws the answer away.
- Passing a large structure by value inside a loop. Every call copies all of it. The next section shows the better way: pass its address.
$md$, 5)
on conflict (id) do update set
  module_id = excluded.module_id, kind = excluded.kind, heading = excluded.heading,
  body_md = excluded.body_md, sort_order = excluded.sort_order;

insert into public.sections (id, module_id, kind, heading, body_md, sort_order)
values ('a3000002-0001-0002-0004-000000000006', 'a3000001-0001-0002-0001-000000000004', 'content', 'Pointers to Structures: The Arrow Operator', $md$
A pointer can hold the address of a structure, the same way it holds the address of an `int` (Lesson 3, Pointers):

```c
Student s;
Student *p = &s;     /* p holds the address of the whole structure */
```

### Two Ways to Reach a Member Through a Pointer

- `(*p).gwa` follows the pointer to the structure, then picks the member. The parentheses are required: the dot runs **before** `*`, so `*p.gwa` would mean `*(p.gwa)`, which does not compile because `p` is not a structure.
- `p->gwa` means exactly the same thing and is easier to type and read. The arrow (a hyphen followed by `>`) is what C programmers use.

The rule is simple: **if you have the structure itself, use the dot. If you have a pointer to it, use the arrow.**

### Passing a Structure by Pointer

Pass `&s` when a function must **change** the caller's structure. It is also faster for big structures, because only one address is copied instead of every member.

```c
#include <stdio.h>
#include <string.h>

typedef struct {
    char  name[30];
    float balance;
} Account;

void deposit(Account *acc, float amount) {
    acc->balance += amount;      /* same as (*acc).balance += amount */
}

int main(void) {
    Account a;
    Account *p = &a;

    strcpy(a.name, "Ana Reyes");
    a.balance = 500.00f;

    deposit(&a, 250.50f);
    printf("%s: PHP %.2f\n", a.name, a.balance);
    printf("%s: PHP %.2f\n", p->name, (*p).balance);
    return 0;
}
```

Output:
```
Ana Reyes: PHP 750.50
Ana Reyes: PHP 750.50
```

Inside `deposit`, `acc` is a pointer, so it uses `acc->balance`. In `main`, `a` is the structure itself, so it uses `a.balance`. Both lines at the end print the same balance because `p` points at `a`.

![The structure a, of type Account, at example address 3000 holds name Ana Reyes and balance 750.50. The pointer p, set with p = &a, holds 3000 and points at the whole structure. With the variable, use the dot: a.balance. With the pointer, use the arrow: p->balance. Putting a star in front of p.balance without parentheses is an error, because the dot runs first.](/diagrams/cp2/lesson-4-struct-pointer.svg)

### Pointers and Arrays of Structures

If `p` points at `cls[0]`, then `p[i].gwa` and `(p + i)->gwa` both reach record `i`. Pointer arithmetic moves by one **whole record** at a time, not one byte.

### Common Mistakes

- Using the arrow on a structure variable (`a->balance`) or the dot on a pointer (`p.balance`). Both are compile errors.
- Writing `*p.balance` without parentheses.
- Using a pointer before it points anywhere. `Student *p;` alone holds a garbage address. Give it one with `p = &s;` first.
$md$, 6)
on conflict (id) do update set
  module_id = excluded.module_id, kind = excluded.kind, heading = excluded.heading,
  body_md = excluded.body_md, sort_order = excluded.sort_order;

insert into public.sections (id, module_id, kind, heading, body_md, sort_order)
values ('a3000002-0001-0002-0004-000000000007', 'a3000001-0001-0002-0001-000000000004', 'content', 'Key Takeaways', $md$
- A **structure** groups related variables, which may have different types, under one name. Each variable inside it is a **member**.
- A `struct` definition is only a template and must end with `;`. Memory is set aside only when you declare a variable of that type.
- Use the dot with a structure variable (`s.gwa`) and the arrow with a pointer to one (`p->gwa`, which means `(*p).gwa`). Nested members take one dot per level: `s.birthday.year`.
- You can copy a whole structure with `=`, but you cannot compare two with `==`, and a string member needs `strcpy`, not `=`.
- Passing a structure to a function passes a copy. Pass its address (`&s`) when the function must change it, and use `typedef` to give the type a shorter name.
$md$, 7)
on conflict (id) do update set
  module_id = excluded.module_id, kind = excluded.kind, heading = excluded.heading,
  body_md = excluded.body_md, sort_order = excluded.sort_order;

insert into public.sections (id, module_id, kind, heading, body_md, sort_order, ide_language, starter_code)
values ('a3000002-0001-0002-0004-000000000008', 'a3000001-0001-0002-0001-000000000004', 'content', 'Try It: Structures', $md$
Run the code below. Add a fourth student to the array (update `COUNT` too), then give the bonus to a different student and predict the output before you press Run.
$md$, 8, 'c', $code$#include <stdio.h>

#define COUNT 3

typedef struct {
    char name[20];
    int  score;
} Student;

void give_bonus(Student *s, int points) {
    s->score += points;
}

int main(void) {
    Student cls[COUNT] = {
        {"Ana", 82},
        {"Ben", 74},
        {"Carla", 91}
    };
    int i;

    give_bonus(&cls[1], 5);

    for (i = 0; i < COUNT; i++)
        printf("%-6s %d\n", cls[i].name, cls[i].score);
    return 0;
}$code$)
on conflict (id) do update set
  module_id = excluded.module_id, kind = excluded.kind, heading = excluded.heading,
  body_md = excluded.body_md, sort_order = excluded.sort_order,
  ide_language = excluded.ide_language, starter_code = excluded.starter_code;

insert into public.sections (id, module_id, kind, heading, body_md, sort_order)
values ('a3000002-0001-0002-0004-000000000009', 'a3000001-0001-0002-0001-000000000004', 'activity', 'Practice Exercises, Lesson 4', $md$
**Conceptual questions:**
1. What is a structure, and how is it different from an array?
2. What is a member? How do you reach a member of a structure variable, and of a pointer to a structure?
3. Does defining `struct student { ... };` set aside memory? When is memory set aside?
4. What does `typedef` do? Does it create a new kind of data?
5. A structure is passed to a function by value and the function changes one member. What happens to the caller's variable? How do you make the change stick?

**Find the errors (three of them):**
```c
#include <stdio.h>

struct item {
    char  name[20];
    float price;
}

int main(void) {
    struct item a, b;

    a.name = "Pancit Canton";
    a.price = 15.50;
    b = a;
    if (a == b)
        printf("same\n");
    return 0;
}
```

**Trace the output:**
```c
#include <stdio.h>

typedef struct { int x, y; } Point;

void f(Point p)  { p.x = 100; }
void g(Point *p) { p->y = 200; }

int main(void) {
    Point a = {1, 2}, b;

    b = a;
    b.x = 5;
    f(a);
    g(&a);
    printf("%d %d %d %d\n", a.x, a.y, b.x, b.y);
    return 0;
}
```

**Programming exercises:**
1. Define a `Book` structure with a title, an author, a year, and a price. Read 3 books from the keyboard and print the title of the most expensive one.
2. Using a nested `Date` structure, store the names and birthdays of 5 students. Ask for a month number and print everyone born in that month.
3. Write `void raise_salary(Employee *e, float percent)` that raises an employee's salary by the given percent. Test it from `main`.
4. Sort an array of 5 `Student` records by GWA, best (lowest) first, by swapping whole structures. Print the ranked list.
$md$, 9)
on conflict (id) do update set
  module_id = excluded.module_id, kind = excluded.kind, heading = excluded.heading,
  body_md = excluded.body_md, sort_order = excluded.sort_order;

insert into public.sections (id, module_id, kind, heading, body_md, sort_order)
values ('a3000002-0001-0002-0004-000000000010', 'a3000001-0001-0002-0001-000000000004', 'activity', 'Worked Exam Solutions + How-to-Pass Tips, Lesson 4', $md$
**Answer Key, Conceptual Questions**

1. A structure groups related variables of **possibly different types** under one name. An array holds items of **one** type reached by index; a structure holds members reached by name.
2. A member is one variable inside a structure. With a structure variable use the dot (`s.gwa`); with a pointer use the arrow (`p->gwa`, the same as `(*p).gwa`).
3. No. The definition only describes the shape of the type. Memory is set aside when you declare a variable of that type, such as `struct student a;`.
4. `typedef` gives an existing type another name, so `Student s;` can replace `struct student s;`. It does not create a new kind of data.
5. Nothing happens to the caller's variable, because the function changed a copy. Either return the changed structure and assign it (`a = moved(a);`) or pass its address (`&a`) and change it through `->`.

**Worked Exam-Style Problem, Find the Errors**

*Solution:* There are three compile errors.
1. The definition has no `;` after the closing brace.
2. `a.name = "Pancit Canton";` tries to assign to an array. Use `strcpy(a.name, "Pancit Canton");`.
3. `a == b` is not allowed on whole structures. Compare the members instead.

`b = a;` is **not** an error: copying a whole structure with `=` is allowed. Examiners plant that line to catch students who "fix" too much. The corrected program:

```c
#include <stdio.h>
#include <string.h>

struct item {
    char  name[20];
    float price;
};                                   /* 1. semicolon added */

int main(void) {
    struct item a, b;

    strcpy(a.name, "Pancit Canton");   /* 2. strcpy, not = */
    a.price = 15.50;
    b = a;                             /* copying a whole struct is fine */
    if (strcmp(a.name, b.name) == 0 && a.price == b.price)   /* 3. member by member */
        printf("same\n");
    return 0;
}
```

Output: `same`

**Worked Exam-Style Problem, The Trace**

*Solution:* Step 1: `b = a;` copies, so `b` is `{1, 2}`. Step 2: `b.x = 5;` changes only `b`, now `{5, 2}`. Step 3: `f(a)` gets a **copy** of `a` and sets the copy's `x` to 100, so `a` is still `{1, 2}`. Step 4: `g(&a)` gets the **address** of `a`, so `p->y = 200` changes `a` itself, now `{1, 200}`. Output:
```
1 200 5 2
```
If you can say why `f` changed nothing and `g` did ("copy versus address"), you can answer every trace in this lesson.

**Worked Programming Exercise (#4, Sort by GWA)**

```c
#include <stdio.h>

#define N 5

typedef struct {
    char  name[20];
    float gwa;
} Student;

int main(void) {
    Student cls[N] = {
        {"Ana", 1.75f}, {"Ben", 2.25f}, {"Carla", 1.25f},
        {"Dan", 2.50f}, {"Ella", 1.50f}
    };
    Student temp;
    int pass, i;

    for (pass = 0; pass < N - 1; pass++)
        for (i = 0; i < N - 1 - pass; i++)
            if (cls[i].gwa > cls[i + 1].gwa) {
                temp = cls[i];           /* swap the WHOLE record */
                cls[i] = cls[i + 1];
                cls[i + 1] = temp;
            }

    for (i = 0; i < N; i++)
        printf("%d. %-6s %.2f\n", i + 1, cls[i].name, cls[i].gwa);
    return 0;
}
```

Output:
```
1. Carla  1.25
2. Ella   1.50
3. Ana    1.75
4. Ben    2.25
5. Dan    2.50
```
This is bubble sort from Lesson 1 (Arrays) with one change: the comparison looks at `cls[i].gwa`, but the swap moves the **whole** record through a `Student temp`. If you swap only the GWAs, the names stay put and every student gets someone else's grade.

**Worked Programming Exercise (#3, raise_salary)**

```c
#include <stdio.h>

typedef struct {
    char  name[30];
    float salary;
} Employee;

void raise_salary(Employee *e, float percent) {
    e->salary = e->salary + e->salary * percent / 100;
}

int main(void) {
    Employee e = {"Liza Gomez", 20000.00f};

    raise_salary(&e, 10);
    printf("%s now earns PHP %.2f\n", e.name, e.salary);
    return 0;
}
```

Output: `Liza Gomez now earns PHP 22000.00`

The function takes a pointer, so it uses `e->salary`, and `main` passes `&e`. Ten percent of 20000.00 is 2000.00.

**How to Pass Tips**

- Count the semicolons: the one after a structure's closing brace is the most common syntax question about structures.
- For every member access, ask "do I have the structure or a pointer to it?" Structure: dot. Pointer: arrow.
- `=` copies a whole structure; `==` does not work on one. Strings inside still need `strcpy` and `strcmp`.
- In a trace, mark each call as **copy** or **address** before you follow it. Only the address calls can change `main`'s variables.
- When sorting records, swap whole structures, never just the field you compared.
$md$, 10)
on conflict (id) do update set
  module_id = excluded.module_id, kind = excluded.kind, heading = excluded.heading,
  body_md = excluded.body_md, sort_order = excluded.sort_order;

insert into public.sections (id, module_id, kind, heading, body_md, sort_order, ide_language, starter_code)
values ('a3000002-0001-0002-0004-000000000011', 'a3000001-0001-0002-0001-000000000004', 'activity', 'Code Lab, Lesson 4: Class Record', $md$
**Coding Drill:** Complete `average` and `find_top` so the program reports the class average and the top student. Remember that the best GWA is the **lowest** number. Press Run to compile real C right here, then add a fifth student and predict the new output before running again.

Expected output:
```
Average GWA: 2.00
Top student: Carla (1.50)
```
$md$, 11, 'c', $code$#include <stdio.h>

typedef struct {
    char  name[20];
    float gwa;
} Student;

/* Returns the average GWA of the first n students. */
float average(Student list[], int n) {
    float total = 0;
    int i;

    for (i = 0; i < n; i++) {
        /* TODO: add list[i].gwa to total */
    }
    return total / n;
}

/* Returns the index of the student with the best (lowest) GWA. */
int find_top(Student list[], int n) {
    int best = 0, i;

    for (i = 1; i < n; i++) {
        /* TODO: if list[i].gwa is lower than list[best].gwa, set best = i */
    }
    return best;
}

int main(void) {
    Student cls[4] = {
        {"Ana", 1.75f}, {"Ben", 2.25f}, {"Carla", 1.50f}, {"Dan", 2.50f}
    };
    int top = find_top(cls, 4);

    printf("Average GWA: %.2f\n", average(cls, 4));
    printf("Top student: %s (%.2f)\n", cls[top].name, cls[top].gwa);
    return 0;
}$code$)
on conflict (id) do update set
  module_id = excluded.module_id, kind = excluded.kind, heading = excluded.heading,
  body_md = excluded.body_md, sort_order = excluded.sort_order,
  ide_language = excluded.ide_language, starter_code = excluded.starter_code;

-- ============================================================
-- LESSON 5: FILE HANDLING
-- ============================================================

insert into public.modules (id, subject_id, title, slug, sort_order)
values
  ('a3000001-0001-0002-0001-000000000005', '10000000-0001-0002-0001-000000000001', 'Lesson 5: File Handling', 'lesson-5-file-handling', 5)
on conflict (id) do update set
  subject_id = excluded.subject_id,
  title      = excluded.title,
  slug       = excluded.slug,
  sort_order = excluded.sort_order;

insert into public.sections (id, module_id, kind, heading, body_md, sort_order)
values ('a3000002-0001-0002-0005-000000000001', 'a3000001-0001-0002-0001-000000000005', 'content', 'Why Files? Streams and the FILE Pointer', $md$
Every variable you have used so far lives in memory (RAM). When the program ends, it is gone. Type in 40 student records, close the program, and they are lost. A **file** stored on disk keeps data after the program ends, so the next run can read it back.

### Text Files and Binary Files

- A **text file** stores characters, line by line. You can open it in Notepad and read it. This lesson uses text files.
- A **binary file** stores raw bytes, the same way the data sits in memory. It is compact but not readable in a text editor.

### Streams and the `FILE` Pointer

C does not read the disk directly. It talks to a file through a **stream**: an object that remembers which file is open, where you are in it, and a buffer of data waiting to be read or written. The stream is a structure of type `FILE`, defined in `<stdio.h>`.

You never touch the members of a `FILE`. You only keep a **pointer** to it, which ties together Lesson 3 (Pointers) and Lesson 4 (Structures):

```c
FILE *fp;     /* fp will point at an open file's stream */
```

### Three Streams Are Already Open

Every C program starts with three streams open for you:

| Stream | Connected to | You have used it through |
|---|---|---|
| `stdin` | the keyboard | `scanf`, `getchar` |
| `stdout` | the screen | `printf`, `putchar` |
| `stderr` | the screen, for error messages | (new) |

So `fprintf(stdout, "Hi\n");` does the same thing as `printf("Hi\n");`. File functions take a `FILE *`, and `stdout` is one.

### The Four Steps

Every file program follows the same pattern:

1. Declare a `FILE *` variable.
2. Open the file with `fopen`, and check that it worked.
3. Read or write with the file functions.
4. Close the file with `fclose`.
$md$, 1)
on conflict (id) do update set
  module_id = excluded.module_id, kind = excluded.kind, heading = excluded.heading,
  body_md = excluded.body_md, sort_order = excluded.sort_order;

insert into public.sections (id, module_id, kind, heading, body_md, sort_order)
values ('a3000002-0001-0002-0005-000000000002', 'a3000001-0001-0002-0001-000000000005', 'content', 'Opening and Closing Files', $md$
### `fopen`

```c
FILE *fp = fopen("grades.txt", "w");
```

`fopen` takes two **strings**: the file name and the **mode**. It returns a `FILE *` you use from then on, or `NULL` if the file could not be opened.

| Mode | Meaning | If the file exists | If it does not exist |
|---|---|---|---|
| `"r"` | read | read from the start | `fopen` returns `NULL` |
| `"w"` | write | old contents are **erased** | a new file is created |
| `"a"` | append | writing goes to the end | a new file is created |
| `"r+"` | read and write | kept, start at the beginning | `fopen` returns `NULL` |
| `"w+"` | read and write | old contents are **erased** | a new file is created |
| `"a+"` | read and append | kept, writing goes to the end | a new file is created |

Add a `b` for a binary file, as in `"rb"` or `"wb"`.

![Before, log.txt holds one line, A. With mode r the file is only read and still holds A. With mode w the old contents are erased, so after writing B it holds only B. With mode a writing goes to the end, so after writing B it holds A then B. If the file is missing, mode r makes fopen return NULL, while w and a create a new file. Always check if fp == NULL.](/diagrams/cp2/lesson-5-fopen-modes.svg)

### Always Check for `NULL`

`fopen` fails more often than you might think: the file is missing (with `"r"`), the name or folder is wrong, or you have no permission to write there. Using a `NULL` pointer with any file function usually crashes the program, so check every time:

```c
#include <stdio.h>

int main(void) {
    FILE *fp = fopen("hello.txt", "w");

    if (fp == NULL) {
        printf("Could not open hello.txt\n");
        return 1;
    }
    fprintf(fp, "Mabuhay, BSIT!\n");
    fclose(fp);
    printf("Saved.\n");
    return 0;
}
```

Output on the screen: `Saved.`. The file hello.txt now holds one line, `Mabuhay, BSIT!`.

If the file cannot be opened, the program says so and stops. Here is the same check catching a missing file opened with `"r"`:

```c
#include <stdio.h>

int main(void) {
    FILE *fp = fopen("no_such_file.txt", "r");

    if (fp == NULL) {
        printf("Could not open no_such_file.txt\n");
        return 1;
    }
    fclose(fp);
    return 0;
}
```

Output: `Could not open no_such_file.txt`

`return 1;` from `main` tells the system the program did not finish normally. You can also call `perror("hello.txt");`, which prints your text followed by the system's reason, such as "No such file or directory".

### `fclose`

`fclose(fp);` finishes the job: it writes out anything still waiting in the buffer and releases the file. If you forget it, the last lines you wrote may never reach the disk. Close every file you opened, and never call `fclose` on a `NULL` pointer.

### Common Mistakes

- Opening with `"w"` when you meant `"a"`. `"w"` erases yesterday's records the moment the file opens, before you write anything.
- Writing the mode as a character, `'r'`, instead of a string, `"r"`.
- Skipping the `NULL` check.
- Windows paths in a string need doubled backslashes: `"C:\\data\\grades.txt"`. A single `\` starts an escape sequence.
$md$, 2)
on conflict (id) do update set
  module_id = excluded.module_id, kind = excluded.kind, heading = excluded.heading,
  body_md = excluded.body_md, sort_order = excluded.sort_order;

insert into public.sections (id, module_id, kind, heading, body_md, sort_order)
values ('a3000002-0001-0002-0005-000000000003', 'a3000001-0001-0002-0001-000000000005', 'content', 'Formatted File I/O: fprintf() and fscanf()', $md$
You already know `printf` and `scanf`. Their file versions take a `FILE *` as the **first** argument and otherwise work the same way.

```c
fprintf(fp, "%s %d\n", name, score);     /* write to the file   */
fscanf(fp, "%29s %d", name, &score);     /* read from the file  */
```

### What `fscanf` Returns

`fscanf` returns the number of items it successfully read. When it reaches the end of the file before reading anything, it returns `EOF` (a negative constant from `<stdio.h>`). That return value is how you know when to stop:

```c
while (fscanf(fp, "%29s %d", name, &score) == 2) {
    /* got a full record: use it */
}
```

The loop stops at the end of the file **and** at a badly formatted line, because either way the count is not 2.

### Write, Then Read Back

The program below writes three records, closes the file, opens it again for reading, and computes the average.

```c
#include <stdio.h>

int main(void) {
    FILE *fp;
    char name[30];
    int score, total = 0, count = 0;

    fp = fopen("scores.txt", "w");
    if (fp == NULL) {
        printf("Cannot create scores.txt\n");
        return 1;
    }
    fprintf(fp, "%s %d\n", "Ana", 88);
    fprintf(fp, "%s %d\n", "Ben", 75);
    fprintf(fp, "%s %d\n", "Carla", 93);
    fclose(fp);

    fp = fopen("scores.txt", "r");
    if (fp == NULL) {
        printf("Cannot open scores.txt\n");
        return 1;
    }
    while (fscanf(fp, "%29s %d", name, &score) == 2) {
        printf("%-6s %d\n", name, score);
        total += score;
        count++;
    }
    fclose(fp);

    printf("Average: %.2f\n", (float)total / count);
    return 0;
}
```

The file scores.txt now holds:
```
Ana 88
Ben 75
Carla 93
```

Output on the screen:
```
Ana    88
Ben    75
Carla  93
Average: 85.33
```

Opening the same file a second time with `"r"` starts reading from the beginning. That is why the program closes it after writing and opens it again.

### Common Mistakes

- Forgetting `&` before a number in `fscanf`, exactly as with `scanf`. A string (char array) still takes no `&`.
- `%s` stops at a space, so a line like `Ana Reyes 88` reads `Ana` as the name and then fails on `Reyes`. Use one-word fields, or read whole lines with `fgets` (two sections from now).
- Looping with `while (!feof(fp))`. `feof` only becomes true **after** a read has already failed, so the last record is usually processed twice. Test the value `fscanf` returns instead.
$md$, 3)
on conflict (id) do update set
  module_id = excluded.module_id, kind = excluded.kind, heading = excluded.heading,
  body_md = excluded.body_md, sort_order = excluded.sort_order;

insert into public.sections (id, module_id, kind, heading, body_md, sort_order)
values ('a3000002-0001-0002-0005-000000000004', 'a3000001-0001-0002-0001-000000000005', 'content', 'Character I/O: fgetc(), fputc(), and EOF', $md$
Sometimes you want a file one character at a time, for example to count letters or lines.

- `fgetc(fp)` returns the next character from the file, or `EOF` when there are no more.
- `fputc(c, fp)` writes one character to the file.

### Store `fgetc`'s Result in an `int`

`fgetc` returns an `int`, not a `char`. It has to: it must be able to return every possible character **plus** one extra value, `EOF`, that is different from all of them. Squeeze the result into a `char` and either a real character can look like `EOF` or `EOF` is never seen, depending on the system. Always declare `int c;`.

### The Classic Reading Loop

```c
while ((c = fgetc(fp)) != EOF) {
    /* use c */
}
```

Read it from the inside out: call `fgetc`, store the result in `c`, then compare `c` with `EOF`. The extra parentheses matter. Without them, `c = fgetc(fp) != EOF` compares first (`!=` runs before `=`), so `c` gets 1 or 0 instead of the character.

```c
#include <stdio.h>
#include <ctype.h>

int main(void) {
    FILE *fp;
    int c, chars = 0, lines = 0;    /* c is an int, not a char */

    fp = fopen("motto.txt", "w");
    if (fp == NULL) {
        printf("Cannot create motto.txt\n");
        return 1;
    }
    fprintf(fp, "Code daily.\nTest often.\n");
    fclose(fp);

    fp = fopen("motto.txt", "r");
    if (fp == NULL) {
        printf("Cannot open motto.txt\n");
        return 1;
    }
    while ((c = fgetc(fp)) != EOF) {
        fputc(toupper(c), stdout);   /* stdout is a FILE * too */
        chars++;
        if (c == '\n')
            lines++;
    }
    fclose(fp);

    printf("%d characters, %d lines\n", chars, lines);
    return 0;
}
```

Output:
```
CODE DAILY.
TEST OFTEN.
24 characters, 2 lines
```

Each line has 11 visible characters plus its `'\n'`, so 12 + 12 = 24 characters. Counting the `'\n'` characters counts the lines. Note `fputc(toupper(c), stdout)`: `stdout` is a `FILE *` too, so `fputc` can write to the screen.

### Common Mistakes

- `char c;` instead of `int c;`.
- Missing the parentheses around `c = fgetc(fp)`.
- Forgetting that `'\n'` is a character too. It counts toward the total.
$md$, 4)
on conflict (id) do update set
  module_id = excluded.module_id, kind = excluded.kind, heading = excluded.heading,
  body_md = excluded.body_md, sort_order = excluded.sort_order;

insert into public.sections (id, module_id, kind, heading, body_md, sort_order)
values ('a3000002-0001-0002-0005-000000000005', 'a3000001-0001-0002-0001-000000000005', 'content', 'Line I/O: fgets() and fputs()', $md$
Most text files are made of lines, so the most useful reading function reads one line at a time.

### `fgets`

```c
char line[80];
fgets(line, sizeof line, fp);
```

`fgets` reads characters into `line` until it has read a `'\n'` **or** has filled `size − 1` characters, then adds `'\0'`. Three things to remember:

- It **keeps** the `'\n'` at the end of the line (if there was room for it).
- It never writes past the buffer, which is why it is safe.
- It returns `NULL` when there is nothing left to read, so `while (fgets(...) != NULL)` reads a whole file.

To remove the newline, use `strcspn` from `<string.h>`, which returns the position of the first `'\n'` (or the string's length if there is none): `line[strcspn(line, "\n")] = '\0';`.

### `fputs`

`fputs(str, fp)` writes a string to the file and does **not** add a newline. (`puts` adds one when it prints to the screen; `fputs` does not.) Write the `'\n'` yourself.

```c
#include <stdio.h>
#include <string.h>

int main(void) {
    FILE *fp;
    char line[80];
    int n = 0;

    fp = fopen("names.txt", "w");
    if (fp == NULL) {
        printf("Cannot create names.txt\n");
        return 1;
    }
    fputs("Ana Reyes\n", fp);       /* fputs adds no newline, so we */
    fputs("Ben Dela Cruz\n", fp);   /* write each \n ourselves      */
    fputs("Carla Santos\n", fp);
    fclose(fp);

    fp = fopen("names.txt", "r");
    if (fp == NULL) {
        printf("Cannot open names.txt\n");
        return 1;
    }
    while (fgets(line, sizeof line, fp) != NULL) {
        line[strcspn(line, "\n")] = '\0';    /* cut off the newline */
        n++;
        printf("%d. %s (%d characters)\n", n, line, (int)strlen(line));
    }
    fclose(fp);
    return 0;
}
```

Output:
```
1. Ana Reyes (9 characters)
2. Ben Dela Cruz (13 characters)
3. Carla Santos (12 characters)
```

`fscanf(fp, "%s", ...)` would have read "Ben Dela Cruz" as three separate words. `fgets` reads the full line, spaces and all. If a line is longer than the buffer, `fgets` returns it in pieces, so give the buffer room.

### Reading a Line from the Keyboard

The keyboard is the stream `stdin`, so `fgets(name, sizeof name, stdin);` reads a full name with spaces. Never use `gets`: it has no size limit and was removed from the C language in C11.

### Common Mistakes

- Forgetting that the `'\n'` is still in the string, then wondering why a comparison with `strcmp` fails.
- Passing the wrong size. `sizeof line` works only when `line` is an actual array, not a pointer parameter.
- Expecting `fputs` to start a new line.
$md$, 5)
on conflict (id) do update set
  module_id = excluded.module_id, kind = excluded.kind, heading = excluded.heading,
  body_md = excluded.body_md, sort_order = excluded.sort_order;

insert into public.sections (id, module_id, kind, heading, body_md, sort_order)
values ('a3000002-0001-0002-0005-000000000006', 'a3000001-0001-0002-0001-000000000005', 'content', 'Putting It Together: A Small Records Program', $md$
Here is everything from this lesson and Lesson 4 (Structures) in one program. Each student is a `Student` structure. `save_student` **appends** one record to records.txt, and `list_students` reads every record back and reports the average.

```c
#include <stdio.h>

#define FILENAME "records.txt"

typedef struct {
    int   id;
    char  name[30];
    float gwa;
} Student;

/* Add one record to the end of the file. Returns 1 if it worked. */
int save_student(const Student *s) {
    FILE *fp = fopen(FILENAME, "a");

    if (fp == NULL)
        return 0;
    fprintf(fp, "%d %s %.2f\n", s->id, s->name, s->gwa);
    fclose(fp);
    return 1;
}

/* Print every record in the file and return how many there were. */
int list_students(void) {
    FILE *fp = fopen(FILENAME, "r");
    Student s;
    int count = 0;
    float total = 0;

    if (fp == NULL) {
        printf("No records yet.\n");
        return 0;
    }
    printf("%-6s %-8s %s\n", "ID", "Name", "GWA");
    while (fscanf(fp, "%d %29s %f", &s.id, s.name, &s.gwa) == 3) {
        printf("%-6d %-8s %.2f\n", s.id, s.name, s.gwa);
        total += s.gwa;
        count++;
    }
    fclose(fp);
    if (count > 0)
        printf("%d records, average GWA %.2f\n", count, total / count);
    return count;
}

int main(void) {
    Student batch[3] = {
        {1001, "Reyes", 1.75f},
        {1002, "Cruz", 2.25f},
        {1003, "Santos", 1.50f}
    };
    int i;

    remove(FILENAME);            /* start fresh for this demo */
    for (i = 0; i < 3; i++)
        if (!save_student(&batch[i]))
            printf("Could not save %s\n", batch[i].name);

    list_students();
    return 0;
}
```

The file records.txt holds:
```
1001 Reyes 1.75
1002 Cruz 2.25
1003 Santos 1.50
```

Output:
```
ID     Name     GWA
1001   Reyes    1.75
1002   Cruz     2.25
1003   Santos   1.50
3 records, average GWA 1.83
```

### How It Fits Together

- **One record per line, fields separated by spaces.** `fprintf` writes the line and `fscanf(... "%d %29s %f" ...) == 3` reads it back. The format used to write must match the format used to read.
- **`"a"` for adding, `"r"` for listing.** Because `save_student` uses `"a"`, every run adds to the file. `main` calls `remove(FILENAME)` (from `<stdio.h>`, it deletes a file) only so this demo starts the same way each time. Delete that line and run the program twice: you will see six records.
- **The functions take a pointer.** `save_student(const Student *s)` reads the record through `s->id`, without copying the whole structure. `const` promises it will not change it.
- **Every `fopen` has its own `NULL` check and its own `fclose`.** `list_students` treats a missing file as "no records yet", which is exactly what happens on the very first run.

### Limits of This Format

Names must be a single word, because `%s` stops at spaces. Real programs handle full names by reading lines with `fgets` and splitting them, or by using a separator character such as a comma. Try that in the exercises once this version makes sense.
$md$, 6)
on conflict (id) do update set
  module_id = excluded.module_id, kind = excluded.kind, heading = excluded.heading,
  body_md = excluded.body_md, sort_order = excluded.sort_order;

insert into public.sections (id, module_id, kind, heading, body_md, sort_order)
values ('a3000002-0001-0002-0005-000000000007', 'a3000001-0001-0002-0001-000000000005', 'content', 'Key Takeaways', $md$
- Data in variables disappears when the program ends; a file keeps it. C reaches a file through a stream, held in a `FILE *` pointer.
- `fopen(name, mode)` opens a file: `"r"` reads, `"w"` creates or **erases**, `"a"` adds to the end. Always check the pointer for `NULL`, and `fclose` every file you open.
- `fprintf` and `fscanf` work like `printf` and `scanf` with a `FILE *` first. `fscanf` returns how many items it read, so loop with `while (fscanf(...) == 2)`, not `while (!feof(fp))`.
- `fgetc` returns an `int`, so store it in an `int` and compare it with `EOF`; `fputc` writes one character.
- `fgets(buf, size, fp)` reads one line, keeps the `'\n'`, and returns `NULL` at the end of the file. `fputs` writes a string without adding a newline.
$md$, 7)
on conflict (id) do update set
  module_id = excluded.module_id, kind = excluded.kind, heading = excluded.heading,
  body_md = excluded.body_md, sort_order = excluded.sort_order;

insert into public.sections (id, module_id, kind, heading, body_md, sort_order, ide_language, starter_code)
values ('a3000002-0001-0002-0005-000000000008', 'a3000001-0001-0002-0001-000000000005', 'content', 'Try It: File Handling', $md$
**About files in the playground:** each run happens in a fresh, empty sandbox on a server. Nothing your program writes is kept or shown to you, and there is no way to give it a file to read. So this exercise writes to `stdout`, the screen, which is already a `FILE *`. Every `fprintf(out, ...)` below works exactly the way it would on a real file.

Run it, then add a fourth student. On your own computer (Code::Blocks, Dev-C++, or `gcc`), replace `stdout` with an `fopen` call as the comment shows, check the pointer for `NULL`, add `fclose(out);` before `return 0;`, and open report.txt afterwards to see the same report saved.
$md$, 8, 'c', $code$#include <stdio.h>

/* Works with ANY stream: a file from fopen, or stdout. */
void write_report(FILE *out, const char *names[], const int scores[], int n) {
    int i;

    fprintf(out, "%-6s %s\n", "Name", "Score");
    for (i = 0; i < n; i++)
        fprintf(out, "%-6s %d\n", names[i], scores[i]);
}

int main(void) {
    const char *names[] = {"Ana", "Ben", "Carla"};
    int scores[] = {88, 75, 93};

    /* The playground keeps no files, so this writes to the screen.
       On your own computer, try instead:
       FILE *out = fopen("report.txt", "w");
       check it for NULL, and call fclose(out) at the end. */
    FILE *out = stdout;

    write_report(out, names, scores, 3);
    fputs("End of report", out);    /* fputs adds no newline... */
    fputc('\n', out);                /* ...so add one with fputc */
    return 0;
}$code$)
on conflict (id) do update set
  module_id = excluded.module_id, kind = excluded.kind, heading = excluded.heading,
  body_md = excluded.body_md, sort_order = excluded.sort_order,
  ide_language = excluded.ide_language, starter_code = excluded.starter_code;

insert into public.sections (id, module_id, kind, heading, body_md, sort_order)
values ('a3000002-0001-0002-0005-000000000009', 'a3000001-0001-0002-0001-000000000005', 'activity', 'Practice Exercises, Lesson 5', $md$
**Conceptual questions:**
1. Why do programs need files when they already have variables?
2. What is the difference between the modes `"w"` and `"a"`? Between `"r"` and `"r+"`?
3. Give two situations in which `fopen` returns `NULL`. What should the program do then?
4. Why must the variable that stores the result of `fgetc` be an `int` and not a `char`?
5. A line in a file reads `Ben Dela Cruz`. What does `fscanf(fp, "%s", name)` store in `name`? What does `fgets(name, 30, fp)` store?

**Find the errors (seven in all: some stop it compiling, the rest are bugs):**
```c
#include <stdio.h>

int main(void) {
    FILE fp;
    char c;

    fp = fopen("data.txt", 'r');
    while (c = fgetc(fp) != EOF)
        putchar(c);
    return 0;
}
```

**Trace the output:**

(a) What does this print? Look closely at what the file holds.
```c
#include <stdio.h>

int main(void) {
    FILE *fp;
    int n, sum = 0, count = 0;

    fp = fopen("nums.txt", "w");
    if (fp == NULL) return 1;
    fprintf(fp, "4 7 x 9\n");
    fclose(fp);

    fp = fopen("nums.txt", "r");
    if (fp == NULL) return 1;
    while (fscanf(fp, "%d", &n) == 1) {
        sum += n;
        count++;
    }
    fclose(fp);
    printf("count=%d sum=%d\n", count, sum);
    return 0;
}
```

(b) What does this print?
```c
#include <stdio.h>

int main(void) {
    FILE *fp;
    char line[20];

    fp = fopen("log.txt", "w");  fputs("A\n", fp);  fclose(fp);
    fp = fopen("log.txt", "a");  fputs("B\n", fp);  fclose(fp);
    fp = fopen("log.txt", "a");  fputs("C\n", fp);  fclose(fp);
    fp = fopen("log.txt", "w");  fputs("D\n", fp);  fclose(fp);
    fp = fopen("log.txt", "a");  fputs("E\n", fp);  fclose(fp);

    fp = fopen("log.txt", "r");
    while (fgets(line, sizeof line, fp) != NULL)
        printf("%s", line);
    fclose(fp);
    return 0;
}
```

**Programming exercises:**
1. Ask the user for 5 integers and save them to numbers.txt, one per line. Close the file, open it again, and print the largest number.
2. Count the vowels (upper and lower case) in a text file using `fgetc`.
3. Copy in.txt to out.txt line by line, putting the line number and a colon in front of each line.
4. Extend the records program from the notes: add a function that prints only the students with a GWA of 2.00 or better (2.00 or lower), and one that returns how many records the file holds.
$md$, 9)
on conflict (id) do update set
  module_id = excluded.module_id, kind = excluded.kind, heading = excluded.heading,
  body_md = excluded.body_md, sort_order = excluded.sort_order;

insert into public.sections (id, module_id, kind, heading, body_md, sort_order)
values ('a3000002-0001-0002-0005-000000000010', 'a3000001-0001-0002-0001-000000000005', 'activity', 'Worked Exam Solutions + How-to-Pass Tips, Lesson 5', $md$
**Answer Key, Conceptual Questions**

1. Variables live in memory and disappear when the program ends. A file stays on disk, so data can be saved in one run and read back in the next.
2. `"w"` erases an existing file before writing; `"a"` keeps it and writes at the end. `"r"` only reads; `"r+"` reads **and** writes. Both fail with `NULL` if the file does not exist.
3. Any two of: the file does not exist and the mode is `"r"` or `"r+"`; the name or folder is wrong; there is no permission to create or write the file. The program should print a message and stop (or take another path), and it must not use the pointer.
4. `fgetc` returns every possible character plus `EOF`, which needs a value no character uses. A `char` cannot hold all of them, so either a real character is mistaken for `EOF` or `EOF` is never detected.
5. `fscanf` with `%s` stops at the first space and stores only `Ben`. `fgets` stores the whole line, `Ben Dela Cruz`, followed by `'\n'`.

**Worked Exam-Style Problem, Find the Errors**

*Solution:* A compiler rejects the first three:
1. `FILE fp;` declares a `FILE` object, not a pointer. `fopen` returns a `FILE *`, so declare `FILE *fp;`.
2. `'r'` is a character. The mode must be a string, `"r"`. (Some older compilers only warn here, but it is still wrong.)
3. Because `fp` is not a pointer, `fgetc(fp)` gets the wrong type too. Fixing error 1 fixes this line as well.

The other four compile but are bugs:

4. No `NULL` check after `fopen`.
5. `char c;` should be `int c;` so it can hold `EOF`.
6. `c = fgetc(fp) != EOF` compares before it assigns, so `c` becomes 1 or 0. Add parentheses: `(c = fgetc(fp)) != EOF`.
7. The file is never closed with `fclose`.

The corrected program:

```c
#include <stdio.h>

int main(void) {
    FILE *fp;                          /* a pointer to FILE */
    int c;                             /* int, so EOF fits */

    fp = fopen("data.txt", "r");       /* mode is a string */
    if (fp == NULL) {                  /* check before use */
        printf("Cannot open data.txt\n");
        return 1;
    }
    while ((c = fgetc(fp)) != EOF)     /* parentheses around the assignment */
        putchar(c);
    fclose(fp);                        /* close the file */
    return 0;
}
```

**Worked Exam-Style Problem, The Traces**

*(a) Solution:* The file holds `4 7 x 9`. `fscanf` reads 4 (returns 1), then 7 (returns 1). At `x` it cannot read a number, so it returns 0 and the loop stops. The 9 is never reached. Output: `count=2 sum=11`. The trap is assuming the loop reads "all the numbers".

*(b) Solution:* Follow the file after each open. `"w"` writes A: file is A. `"a"` adds B: A B. `"a"` adds C: A B C. `"w"` **erases** and writes D: file is just D. `"a"` adds E: D E. Output:
```
D
E
```
Each `"w"` wipes everything before it. Find the **last** `"w"` and start reading the history from there.

**Worked Programming Exercise (#3, Number the Lines)**

```c
#include <stdio.h>

int main(void) {
    FILE *in, *out;
    char line[100];
    int n = 0;

    in = fopen("in.txt", "r");
    if (in == NULL) {
        printf("Cannot open in.txt\n");
        return 1;
    }
    out = fopen("out.txt", "w");
    if (out == NULL) {
        printf("Cannot create out.txt\n");
        fclose(in);                  /* close what you already opened */
        return 1;
    }

    while (fgets(line, sizeof line, in) != NULL) {
        n++;
        fprintf(out, "%d: ", n);
        fputs(line, out);            /* line still ends in '\n' */
    }

    fclose(in);
    fclose(out);
    printf("Copied %d lines.\n", n);
    return 0;
}
```

If in.txt holds:
```
Bayan Ko
Lupang Hinirang
Pilipinas Kong Mahal
```
the screen shows `Copied 3 lines.` and out.txt holds:
```
1: Bayan Ko
2: Lupang Hinirang
3: Pilipinas Kong Mahal
```
Two details earn the marks. First, when the second `fopen` fails, the program closes the file it already opened before stopping. Second, it uses `fputs(line, out)` with no extra `'\n'`, because `fgets` kept the newline in `line`. Adding another would double-space the copy.

**How to Pass Tips**

- Write the four steps on every file answer: declare `FILE *`, `fopen` and check `NULL`, read or write, `fclose`. Checkers look for the `NULL` check and the `fclose` even when the question does not mention them.
- Know the mode table by heart, especially that `"w"` erases and `"r"` fails on a missing file.
- Loop on what the read function returns: `fscanf(...) == count`, `fgetc(...) != EOF`, `fgets(...) != NULL`. Never `while (!feof(fp))`.
- `int c` for `fgetc`, with parentheses around the assignment. This pair shows up in nearly every "find the error" item on files.
- Remember who keeps the newline: `fgets` keeps it, `fputs` does not add one.
$md$, 10)
on conflict (id) do update set
  module_id = excluded.module_id, kind = excluded.kind, heading = excluded.heading,
  body_md = excluded.body_md, sort_order = excluded.sort_order;

insert into public.sections (id, module_id, kind, heading, body_md, sort_order, ide_language, starter_code)
values ('a3000002-0001-0002-0005-000000000011', 'a3000001-0001-0002-0001-000000000005', 'activity', 'Code Lab, Lesson 5: Report to Any Stream', $md$
**Coding Drill:** Complete `write_record` so it writes a record as `name,score` on its own line to **any** stream, then count how many students passed (75 or higher). Press Run to compile real C right here.

The playground keeps no files, so `main` passes `stdout` and the records appear on the screen. Because `write_record` takes a `FILE *`, the same function would write to a real file if you passed it the pointer from `fopen("results.txt", "w")` on your own computer (with a `NULL` check and an `fclose`).

Expected output:
```
Ana,88
Ben,72
Carla,93
Dan,75
Passed: 3 of 4
```
$md$, 11, 'c', $code$#include <stdio.h>

typedef struct {
    char name[20];
    int  score;
} Record;

/* Write one record as name,score and a newline to ANY stream. */
void write_record(FILE *out, const Record *r) {
    /* TODO: fprintf r->name and r->score to out, as name,score */
}

int main(void) {
    Record cls[4] = {
        {"Ana", 88}, {"Ben", 72}, {"Carla", 93}, {"Dan", 75}
    };
    FILE *out = stdout;     /* on your own computer: fopen("results.txt", "w") */
    int i, passed = 0;

    for (i = 0; i < 4; i++) {
        write_record(out, &cls[i]);
        /* TODO: add 1 to passed if cls[i].score is 75 or higher */
    }
    fprintf(out, "Passed: %d of 4\n", passed);
    return 0;
}$code$)
on conflict (id) do update set
  module_id = excluded.module_id, kind = excluded.kind, heading = excluded.heading,
  body_md = excluded.body_md, sort_order = excluded.sort_order,
  ide_language = excluded.ide_language, starter_code = excluded.starter_code;
