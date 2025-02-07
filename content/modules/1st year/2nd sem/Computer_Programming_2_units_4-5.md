# Computer Programming 2, Lessons 4-5 Study Guide
<!-- subject: Computer Programming 2 | year: 1st -->

---

# Lesson 4: Structures

<!-- kind: content -->
## What Is a Structure?

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

---

<!-- kind: content -->
## Declaring Structures and Accessing Members

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

---

<!-- kind: content -->
## Arrays of Structures

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

---

<!-- kind: content -->
## typedef and Nested Structures

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

---

<!-- kind: content -->
## Structures and Functions

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

---

<!-- kind: content -->
## Pointers to Structures: The Arrow Operator

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

---

<!-- kind: content -->
## Key Takeaways

- A **structure** groups related variables, which may have different types, under one name. Each variable inside it is a **member**.
- A `struct` definition is only a template and must end with `;`. Memory is set aside only when you declare a variable of that type.
- Use the dot with a structure variable (`s.gwa`) and the arrow with a pointer to one (`p->gwa`, which means `(*p).gwa`). Nested members take one dot per level: `s.birthday.year`.
- You can copy a whole structure with `=`, but you cannot compare two with `==`, and a string member needs `strcpy`, not `=`.
- Passing a structure to a function passes a copy. Pass its address (`&s`) when the function must change it, and use `typedef` to give the type a shorter name.

---

<!-- kind: activity -->
## Practice Exercises, Lesson 4

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

---

---
