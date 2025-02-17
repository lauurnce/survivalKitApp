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
$md$, 3, null, null),

('a3000002-0001-0002-0006-000000000004','a3000001-0001-0002-0001-000000000006','content','Classic Recursive Functions',$md$
These come up again and again in quizzes and lab exams. For each one, find the base case and the smaller problem first, and the code almost writes itself.

```c
#include <stdio.h>

int sumDigits(int n) {
    if (n < 10)                          /* one digit left */
        return n;
    return n % 10 + sumDigits(n / 10);   /* last digit + the rest */
}

long power(int base, int exp) {
    if (exp == 0)                        /* anything to the 0 is 1 */
        return 1;
    return base * power(base, exp - 1);
}

int fib(int n) {
    if (n <= 1)                          /* fib(0) = 0, fib(1) = 1 */
        return n;
    return fib(n - 1) + fib(n - 2);
}

int main(void) {
    int i;
    printf("sumDigits(4096) = %d\n", sumDigits(4096));
    printf("power(2, 5) = %ld\n", power(2, 5));
    for (i = 0; i <= 9; i++)
        printf("%d ", fib(i));
    printf("\n");
    return 0;
}
```

Output:

```
sumDigits(4096) = 19
power(2, 5) = 32
0 1 1 2 3 5 8 13 21 34
```

### Sum of digits

`n % 10` is the last digit and `n / 10` is everything except the last digit (integer division drops the remainder). A one-digit number is its own sum, so that is the base case.

```
sumDigits(4096) = 6 + sumDigits(409)
                = 6 + 9 + sumDigits(40)
                = 6 + 9 + 0 + sumDigits(4)
                = 6 + 9 + 0 + 4
                = 19
```

### Power

Raising `base` to `exp` means multiplying `base` by itself `exp` times. So 2 to the 5th is 2 × (2 to the 4th), and anything to the 0th is 1.

```
power(2, 5) = 2 * power(2, 4)
            = 2 * 2 * power(2, 3)
            = 2 * 2 * 2 * power(2, 2)
            = 2 * 2 * 2 * 2 * power(2, 1)
            = 2 * 2 * 2 * 2 * 2 * power(2, 0)
            = 2 * 2 * 2 * 2 * 2 * 1 = 32
```

### Fibonacci

Each Fibonacci number is the sum of the two before it: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, and so on. This function has **two** recursive calls, so it needs two starting values: `fib(0) = 0` and `fib(1) = 1`. The test `n <= 1` returning `n` covers both.

Two calls per level means the work branches like a tree. `fib(5)` calls `fib(4)` and `fib(3)`, but `fib(4)` also calls `fib(3)`, so the same values get recomputed again and again:

| Call | Result | Total calls made |
|---|---|---|
| fib(5) | 5 | 15 |
| fib(10) | 55 | 177 |
| fib(20) | 6765 | 21,891 |
| fib(30) | 832040 | 2,692,537 |

Going from `fib(20)` to `fib(30)` multiplies the work by more than 100. A simple loop that keeps the last two numbers needs only about 30 steps for `fib(30)`. Keep this example in mind: recursion is elegant, but it is not automatically efficient.
$md$, 4, null, null),

('a3000002-0001-0002-0006-000000000005','a3000001-0001-0002-0001-000000000006','content','Recursion vs. Iteration',$md$
Anything you can do with recursion you can also do with a loop (iteration), and the other way around. Here is factorial both ways:

```c
long factorialLoop(int n) {
    long result = 1;
    int i;
    for (i = 2; i <= n; i++)
        result = result * i;
    return result;
}
```

Same answer, no stack of waiting calls: one frame, one loop.

| | Recursion | Iteration (loop) |
|---|---|---|
| How it repeats | the function calls itself | `for`, `while`, `do-while` |
| How it stops | reaching the base case | the loop condition becomes false |
| Memory | one stack frame per active call | one frame, reused |
| Speed | slower: every call has overhead | usually faster |
| Code | short and close to the math definition | sometimes longer |
| If it never stops | stack overflow, the program crashes | infinite loop, the program hangs |

### Stack overflow

The call stack is small (often around 1 MB on Windows and 8 MB on Linux or macOS). Every active call takes a frame from it. If recursion goes too deep, the stack runs out of room and the program crashes. This is called a **stack overflow**. On Linux or macOS you usually see `Segmentation fault`; on Windows the program just stops, often with a non-zero exit code.

It happens in two ways:

1. **Infinite recursion**: no base case, or a recursive call that never gets closer to it, like `factorial(-1)` with an `n == 0` base case.
2. **Recursion that is correct but too deep:**

```c
#include <stdio.h>

long sumTo(long n) {
    if (n == 0)
        return 0;
    return n + sumTo(n - 1);
}

int main(void) {
    printf("%ld\n", sumTo(100));
    printf("%ld\n", sumTo(1000000));   /* far too deep: likely crashes */
    return 0;
}
```

The first call is fine and prints 5050. The second needs a million frames waiting at the same time, so the program crashes before printing anything else. (Built with heavy optimization, some compilers rewrite this function into a loop and it survives. Do not count on it.)

### When should you use recursion?

Use it when:

- The problem is naturally defined in terms of a smaller version of itself: factorial, power, sum of digits, greatest common divisor.
- The problem **splits in half** each step, like binary search in Lesson 7 (Searching and Sorting). The depth stays tiny: about 20 calls for a million items.
- The data has a branching shape, like folders inside folders, which you will meet in later data structures courses.

Prefer a loop when:

- A simple loop does the same job clearly, like summing 1 to n.
- The input can be large, so the depth could be large.
- The recursion repeats work, like the naive `fib()`.

### Common mistakes

- Forgetting the base case, or writing one the input can skip over.
- Recursing on the same input (`f(n)` inside `f(n)`) or a bigger one (`f(n + 1)`) instead of a smaller one.
- Forgetting `return` in front of the recursive call in a function that returns a value. `factorial(n - 1);` alone throws the answer away.
- Assuming the base case runs first. It runs **last** on the way down, and its result is the first one returned.
$md$, 5, null, null)
ON CONFLICT (id) DO UPDATE SET
  module_id     = excluded.module_id,
  kind          = excluded.kind,
  heading       = excluded.heading,
  body_md       = excluded.body_md,
  sort_order    = excluded.sort_order,
  ide_language  = excluded.ide_language,
  starter_code  = excluded.starter_code;
