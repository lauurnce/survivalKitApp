-- ============================================================
-- Computer Programming 2, Lessons 6-7: Recursion; Searching and Sorting
-- Subject ID: 10000000-0001-0002-0001-000000000001
-- Modules:    a3000001-0001-0002-0001-000000000006 (Lesson 6)
--             a3000001-0001-0002-0001-000000000007 (Lesson 7)
-- Sections:   a3000002-0001-0002-00LL-0000000000SS (LL lesson, SS order)
-- Run after cp2_modules_sections.sql (which clears every CP2 module).
-- Idempotent: fixed ids, upserted with ON CONFLICT (id). Deletes nothing.
-- Mirrored to production by migration 20261101001200_cp2_units_6_7.sql.
-- ============================================================

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('a3000001-0001-0002-0001-000000000006','10000000-0001-0002-0001-000000000001','Lesson 6: Recursion','lesson-6-recursion',6)
ON CONFLICT (id) DO UPDATE SET
  subject_id = excluded.subject_id,
  title      = excluded.title,
  slug       = excluded.slug,
  sort_order = excluded.sort_order;

-- ============================================================
-- LESSON 6: RECURSION
-- ============================================================

INSERT INTO sections (id, module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('a3000002-0001-0002-0006-000000000001','a3000001-0001-0002-0001-000000000006','content','What Is Recursion?',$md$
In CP1 Lesson 6 (Functions) you saw `main()` call other functions. Nothing in C stops a function from calling **itself**. A function that does this is called **recursive**, and the technique is called **recursion**.

Recursion is a way of solving a problem by turning it into a smaller copy of the same problem. You keep shrinking it until it is so small that the answer is obvious, then you build the full answer back up from there.

Think of the line at the registrar during enrollment. You want to know your place in line, but you can only see the person directly in front of you. So you ask them, "What number are you?" They do not know either, so they ask the person in front of them, and so on. The person at the very front knows they are number 1 without asking anyone. That answer travels back down the line, each person adding 1, until it reaches you. That is recursion: a chain of smaller questions that ends at one question with an obvious answer.

### A first example: counting down

```c
#include <stdio.h>

void countdown(int n) {
    if (n == 0) {              /* base case: stop here */
        printf("Liftoff!\n");
        return;
    }
    printf("%d\n", n);
    countdown(n - 1);          /* recursive case: a smaller problem */
}

int main(void) {
    countdown(3);
    return 0;
}
```

Output:

```
3
2
1
Liftoff!
```

`countdown(3)` prints 3 and calls `countdown(2)`, which prints 2 and calls `countdown(1)`, which prints 1 and calls `countdown(0)`. That last call prints `Liftoff!` and returns without calling anything, so the chain stops.

### The two parts every recursive function needs

1. **Base case**: the input so small that the function answers it directly, with no further recursive call. Here it is `n == 0`.
2. **Recursive case**: the function calls itself on a **smaller** input and uses that result. Here it is `countdown(n - 1)`.

Leave out the base case and the function calls itself forever. Leave out the "smaller" part and it never reaches the base case. Either way, the program crashes. You will see why in the Recursion vs. Iteration section.
$md$, 1, null, null),

('a3000002-0001-0002-0006-000000000002','a3000001-0001-0002-0001-000000000006','content','Base Case and Recursive Case: Factorial',$md$
The factorial of n, written n!, is the product of every whole number from 1 to n. So 4! = 4 × 3 × 2 × 1 = 24, and by definition 0! = 1.

Look at 4! closely: 4 × 3 × 2 × 1 is just 4 × (3 × 2 × 1), and 3 × 2 × 1 is 3!. So:

```
n! = n × (n - 1)!     for n ≥ 1
0! = 1
```

That definition already has a recursive case (n × (n - 1)!) and a base case (0! = 1). It translates almost word for word into C:

```c
#include <stdio.h>

long factorial(int n) {
    if (n <= 1)                      /* base case */
        return 1;
    return n * factorial(n - 1);     /* recursive case */
}

int main(void) {
    printf("4! = %ld\n", factorial(4));
    printf("0! = %ld\n", factorial(0));
    printf("10! = %ld\n", factorial(10));
    return 0;
}
```

Output:

```
4! = 24
0! = 1
10! = 3628800
```

The base case uses `n <= 1` instead of `n == 0`, because 1! is also 1. That saves one call, and it also stops safely if someone passes a negative number.

### A checklist for any recursive function

Before you trust a recursive function, check all three:

1. **There is a base case** that returns a value without calling the function again.
2. **Every recursive call uses a smaller input** (`n - 1`, `n / 10`, a shorter part of an array).
3. **The smaller inputs eventually hit the base case**, for every valid input.

### Common mistake: a base case you can step over

```c
long factorial(int n) {
    if (n == 0)                      /* only stops at exactly 0 */
        return 1;
    return n * factorial(n - 1);
}

/* factorial(-1) calls factorial(-2), then -3, -4, ...
   It never lands on 0, so it never stops. */
```

This version is correct for 0 and every positive n. But a negative argument skips right past 0 and keeps going down, so it never stops. Writing the base case as a range (`n <= 1`) instead of one exact value (`n == 0`) closes that gap.

One more limit to know: factorials grow very fast. On many compilers, including the common ones on Windows, `long` is only 32 bits, so 12! (479001600) is the largest factorial it can hold. 13! overflows and prints a wrong number.
$md$, 2, null, null),

('a3000002-0001-0002-0006-000000000003','a3000001-0001-0002-0001-000000000006','content','Tracing the Call Stack',$md$
To read recursive code you need to know what the computer does on every call.

Each time a function is called, C sets aside a small block of memory for that call, called a **stack frame**. The frame holds the call's own copy of its parameters, its local variables, and the spot to return to when it finishes. Frames are piled on top of each other in an area called the **call stack**. The newest call is always on top, and only the top call is running. When it returns, its frame is removed and the call below it continues from where it stopped.

This is why recursion works at all: `factorial(4)` and `factorial(3)` each have their **own** `n`. They do not overwrite each other.

### Tracing factorial(4)

A recursive call runs in two phases. First it **winds down**: each call is waiting for the answer to a smaller call. Then it **unwinds**: the answers come back up and each waiting call finishes its multiplication.

```
factorial(4) = 4 * factorial(3)          waits
  factorial(3) = 3 * factorial(2)        waits
    factorial(2) = 2 * factorial(1)      waits
      factorial(1) = 1                   base case, returns 1
    factorial(2) returns 2 * 1 = 2
  factorial(3) returns 3 * 2 = 6
factorial(4) returns 4 * 6 = 24
```

The same trace as a table, in the order things happen:

| Step | Call | n | What happens |
|---|---|---|---|
| 1 | factorial(4) | 4 | needs factorial(3), waits |
| 2 | factorial(3) | 3 | needs factorial(2), waits |
| 3 | factorial(2) | 2 | needs factorial(1), waits |
| 4 | factorial(1) | 1 | base case, returns 1 |
| 5 | factorial(2) | 2 | returns 2 × 1 = 2 |
| 6 | factorial(3) | 3 | returns 3 × 2 = 6 |
| 7 | factorial(4) | 4 | returns 4 × 6 = 24 |

At step 4 the stack is at its deepest: four `factorial` frames on top of the frame for `main()`. The last call made (factorial(1)) is the first one to finish. That "last in, first out" order is exactly how a stack of plates works.

![The call stack for factorial(4). Calls wind down from factorial(4) to factorial(3), factorial(2) and factorial(1), each waiting on the next. factorial(1) is the base case and returns 1. The answers unwind back up: factorial(2) returns 2, factorial(3) returns 6, and factorial(4) returns 24.](/diagrams/cp2/lesson-6-call-stack.svg)

### Before the call or after the call?

Where you put the `printf()` relative to the recursive call changes the output completely. This is a favorite exam question.

```c
void down(int n) {
    if (n == 0) return;
    printf("%d ", n);      /* print BEFORE the call */
    down(n - 1);
}

void up(int n) {
    if (n == 0) return;
    up(n - 1);
    printf("%d ", n);      /* print AFTER the call */
}
```

`down(3)` prints `3 2 1`: each call prints first, then goes deeper.

`up(3)` prints `1 2 3`: each call goes deeper first, and only prints while the stack unwinds. `up(3)` calls `up(2)`, which calls `up(1)`, which calls `up(0)` and returns at once. Then `up(1)` prints 1, returns to `up(2)`, which prints 2, then `up(3)` prints 3.

**Rule of thumb:** work done before the recursive call happens on the way down, in calling order. Work done after it happens on the way back up, in reverse order.
$md$, 3, null, null)
ON CONFLICT (id) DO UPDATE SET
  module_id     = excluded.module_id,
  kind          = excluded.kind,
  heading       = excluded.heading,
  body_md       = excluded.body_md,
  sort_order    = excluded.sort_order,
  ide_language  = excluded.ide_language,
  starter_code  = excluded.starter_code;
