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
