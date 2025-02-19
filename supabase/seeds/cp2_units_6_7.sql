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
  ('a3000001-0001-0002-0001-000000000006','10000000-0001-0002-0001-000000000001','Lesson 6: Recursion','lesson-6-recursion',6),
  ('a3000001-0001-0002-0001-000000000007','10000000-0001-0002-0001-000000000001','Lesson 7: Searching and Sorting','lesson-7-searching-and-sorting',7)
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
$md$, 5, null, null),

('a3000002-0001-0002-0006-000000000006','a3000001-0001-0002-0001-000000000006','content','Key Takeaways',$md$
- A **recursive** function calls itself. It needs a **base case** that answers without recursing, and a **recursive case** that calls itself on a smaller input.
- Every recursive call must move toward the base case. If it can skip past it or never reach it, the calls never end.
- Each call gets its own **stack frame** with its own copy of the parameters. Calls wind down until the base case, then the answers unwind back up in reverse order.
- Code before the recursive call runs on the way down (`down(3)` prints `3 2 1`); code after it runs on the way back up (`up(3)` prints `1 2 3`).
- Too many calls at once cause a **stack overflow**. Use recursion when the problem shrinks naturally or splits in half; use a loop when a loop is simpler or the depth could be large.
$md$, 6, null, null),

('a3000002-0001-0002-0006-000000000007','a3000001-0001-0002-0001-000000000006','content','Try It: Recursion',$md$
Run it and read the indented trace: each level of indent is one more frame on the call stack. Then try `factorial(6, 0)`, or change the Fibonacci loop to stop at 20 instead of 10.
$md$, 7, 'c', $code$#include <stdio.h>

void indent(int depth) {
    int i;
    for (i = 0; i < depth; i++)
        printf("  ");
}

long factorial(int n, int depth) {
    long result;
    indent(depth);
    printf("factorial(%d) called\n", n);
    if (n <= 1)
        result = 1;                                 /* base case */
    else
        result = n * factorial(n - 1, depth + 1);   /* recursive case */
    indent(depth);
    printf("factorial(%d) returns %ld\n", n, result);
    return result;
}

int fib(int n) {
    if (n <= 1)
        return n;
    return fib(n - 1) + fib(n - 2);
}

int main(void) {
    int i;
    printf("Answer: %ld\n\n", factorial(4, 0));

    printf("Fibonacci: ");
    for (i = 0; i <= 10; i++)
        printf("%d ", fib(i));
    printf("\n");
    return 0;
}$code$),

('a3000002-0001-0002-0006-000000000008','a3000001-0001-0002-0001-000000000006','activity','Practice Exercises, Lesson 6',$md$
**Conceptual questions:**
1. What is a recursive function?
2. Name the two parts every recursive function needs, and say what each one does.
3. What happens when a recursive function has no base case, or its calls never get closer to it?
4. What is the call stack, and what does each stack frame hold?
5. Give one advantage and one disadvantage of recursion compared with a loop.

**Trace the output:**

a. What does `mystery(6)` return? What happens if you call `mystery(5)` instead?
```c
int mystery(int n) {
    if (n == 0)
        return 0;
    return n + mystery(n - 2);
}
```

b. What does `show(3)` print?
```c
void show(int n) {
    if (n > 0) {
        show(n - 1);
        printf("%d ", n);
        show(n - 1);
    }
}
```

**Programming exercises (solve each one recursively, no loops):**
1. Write `int sumTo(int n)` that returns 1 + 2 + … + n, and 0 when n is 0.
2. Write `int countDigits(int n)` that returns how many digits a non-negative integer has. `countDigits(0)` is 1 and `countDigits(90210)` is 5.
3. Write `void printReverse(int n)` that prints the digits of a non-negative integer backwards. `printReverse(1234)` prints `4321`.
4. Write `int gcd(int a, int b)` using Euclid's rule: gcd(a, 0) = a, and gcd(a, b) = gcd(b, a % b). Check that `gcd(48, 18)` is 6.
5. Write `int arraySum(int a[], int n)` that returns the sum of the first n elements of an array.
$md$, 8, null, null),

('a3000002-0001-0002-0006-000000000009','a3000001-0001-0002-0001-000000000006','activity','Worked Exam Solutions + How-to-Pass Tips, Lesson 6',$md$
**Answer Key, Conceptual Questions**

1. A recursive function is a function that calls itself, solving a problem by reducing it to a smaller copy of the same problem.
2. The **base case** is the smallest input, answered directly with no further call; it is what stops the recursion. The **recursive case** calls the function on a smaller input and builds the answer from that result.
3. The calls never end. Each one takes another stack frame until the call stack runs out of memory and the program crashes with a **stack overflow**.
4. The call stack is the area of memory where C keeps one **stack frame** for every function call that has started but not yet returned. A frame holds that call's parameters, its local variables, and where to return when it finishes. The newest frame is on top and is the only one running.
5. Advantage: the code is short and mirrors the problem's definition (factorial, gcd, binary search). Disadvantage: every call costs time and stack memory, so it is usually slower than a loop and can overflow when it goes deep.

**Worked Exam-Style Problem, Trace (a)**

*Solution:* Each call adds `n` and recurses on `n - 2`:
```
mystery(6) = 6 + mystery(4)
           = 6 + 4 + mystery(2)
           = 6 + 4 + 2 + mystery(0)
           = 6 + 4 + 2 + 0 = 12
```
So `mystery(6)` returns **12**. With 5 the calls go 5, 3, 1, -1, -3, and so on. They jump straight over 0, the base case never matches, and the program crashes with a stack overflow. The fix is a base case that cannot be skipped, such as `if (n <= 0) return 0;`.

**Worked Exam-Style Problem, Trace (b)**

*Solution:* `show(n)` does three things in order: `show(n - 1)`, print `n`, `show(n - 1)` again. `show(0)` does nothing.

- `show(1)`: `show(0)`, print 1, `show(0)`. Prints `1`.
- `show(2)`: `show(1)`, print 2, `show(1)`. Prints `1 2 1`.
- `show(3)`: `show(2)`, print 3, `show(2)`. Prints `1 2 1`, then `3`, then `1 2 1`.

Output:
```
1 2 1 3 1 2 1
```
Build the answer from the smallest case up. Tracing `show(3)` top-down in your head is where students lose track.

**Worked Programming Exercises**

```c
#include <stdio.h>

int sumTo(int n) {
    if (n <= 0)
        return 0;
    return n + sumTo(n - 1);
}

int countDigits(int n) {
    if (n < 10)                 /* 0 to 9: one digit */
        return 1;
    return 1 + countDigits(n / 10);
}

void printReverse(int n) {
    printf("%d", n % 10);       /* last digit first */
    if (n >= 10)
        printReverse(n / 10);   /* then the rest */
}

int gcd(int a, int b) {
    if (b == 0)
        return a;
    return gcd(b, a % b);
}

int arraySum(int a[], int n) {
    if (n == 0)                 /* empty array */
        return 0;
    return a[n - 1] + arraySum(a, n - 1);
}

int main(void) {
    int a[] = {4, 8, 15, 16, 23, 42};
    printf("sumTo(10) = %d\n", sumTo(10));
    printf("countDigits(0) = %d\n", countDigits(0));
    printf("countDigits(90210) = %d\n", countDigits(90210));
    printReverse(1234);
    printf("\n");
    printf("gcd(48, 18) = %d\n", gcd(48, 18));
    printf("arraySum = %d\n", arraySum(a, 6));
    return 0;
}
```

Output:
```
sumTo(10) = 55
countDigits(0) = 1
countDigits(90210) = 5
4321
gcd(48, 18) = 6
arraySum = 108
```

Notes on the trickier ones:

- **countDigits:** the base case is `n < 10`, not `n == 0`. With `n == 0` as the base case, `countDigits(0)` would wrongly return 0.
- **printReverse:** the digit is printed **before** the recursive call, so the last digit comes out first. Move the `printf()` after the call and it prints the number forwards.
- **gcd:** the trace for `gcd(48, 18)` is `gcd(18, 12)`, then `gcd(12, 6)`, then `gcd(6, 0)`, which returns 6. Each step the second number shrinks, so it must reach 0. If you call `gcd(18, 48)`, the first step just swaps them into `gcd(48, 18)`.
- **arraySum:** "the sum of n elements is the last element plus the sum of the first n - 1". The array never gets copied, only `n` shrinks.

**How to Pass Tips**

- For any recursive trace question, write one line per call, indented, exactly like the factorial trace in the notes. Fill in the return values on the way back **up**. Never try to hold the whole chain in your head.
- Check the base case first. If the input can skip over it (odd numbers stepping by 2, negatives into `n == 0`), the answer is "infinite recursion / stack overflow", and that is often the whole point of the question.
- Ask "is the `printf()` before or after the recursive call?" Before means calling order; after means reverse order.
- When you write a recursive function on paper, state the base case in a comment. Professors award partial credit for a correct base case and recursive case even if the syntax is off.
- If the question says "without loops", a `for` or `while` anywhere in your answer usually scores zero, even if the output is right.
$md$, 9, null, null),

('a3000002-0001-0002-0006-000000000010','a3000001-0001-0002-0001-000000000006','activity','Code Lab, Lesson 6: Finish the Recursion',$md$
**Coding Drill:** Finish `sumDigits` and `power` using recursion only, no loops. Each one needs a base case and a recursive case; the comments tell you both. If a call never returns, check that the recursive call uses a smaller input.

Expected output:
```
sumDigits(4096) = 19
sumDigits(7) = 7
power(2, 10) = 1024
power(5, 0) = 1
```
$md$, 10, 'c', $code$#include <stdio.h>

int sumDigits(int n) {
    /* TODO: base case, one digit left (n < 10): return n.
       Recursive case: last digit (n % 10) + sumDigits of the rest (n / 10). */
    return 0;
}

long power(int base, int exp) {
    /* TODO: base case, exp == 0: return 1.
       Recursive case: base * power(base, exp - 1). */
    return 0;
}

int main(void) {
    printf("sumDigits(4096) = %d\n", sumDigits(4096));
    printf("sumDigits(7) = %d\n", sumDigits(7));
    printf("power(2, 10) = %ld\n", power(2, 10));
    printf("power(5, 0) = %ld\n", power(5, 0));
    return 0;
}$code$)
ON CONFLICT (id) DO UPDATE SET
  module_id     = excluded.module_id,
  kind          = excluded.kind,
  heading       = excluded.heading,
  body_md       = excluded.body_md,
  sort_order    = excluded.sort_order,
  ide_language  = excluded.ide_language,
  starter_code  = excluded.starter_code;

-- ============================================================
-- LESSON 7: SEARCHING AND SORTING
-- ============================================================

INSERT INTO sections (id, module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('a3000002-0001-0002-0007-000000000001','a3000001-0001-0002-0001-000000000007','content','Linear Search',$md$
**Searching** means finding where a value (the **key**) sits in an array, or finding out that it is not there. **Sorting** means putting the elements in order. They go together: a sorted array can be searched much faster, as the next section shows.

### The idea

Linear search (also called sequential search) is what you do when you look for your name on a class list that is not in alphabetical order: start at the top and check each entry, one by one, until you find it or run out of list.

```c
#include <stdio.h>

int linearSearch(int a[], int n, int key) {
    int i;
    for (i = 0; i < n; i++) {
        if (a[i] == key)
            return i;          /* found: give back its index */
    }
    return -1;                 /* checked everything: not there */
}

int main(void) {
    int a[] = {29, 10, 14, 37, 13};
    printf("%d\n", linearSearch(a, 5, 37));
    printf("%d\n", linearSearch(a, 5, 50));
    return 0;
}
```

Output:

```
3
-1
```

The function returns the **index** where the key was found. It returns `-1` when the key is missing, because -1 can never be a real index. The caller must check for -1 before using the result as an index.

### Trace: searching for 37 in {29, 10, 14, 37, 13}

| i | a[i] | a[i] == 37? |
|---|---|---|
| 0 | 29 | no |
| 1 | 10 | no |
| 2 | 14 | no |
| 3 | 37 | **yes**, return 3 |

Four comparisons. Searching for 50 checks all five elements, finds nothing, and returns -1 after five comparisons.

### How fast is it?

- **Best case:** the key is the first element. 1 comparison.
- **Worst case:** the key is last, or missing. n comparisons for n elements.

So the work grows in step with the size of the array: twice the elements, twice the comparisons in the worst case.

### When to use it

- The array is **not sorted**. Linear search is the only choice that works on any order.
- The array is small, or you search it only once.

### Common mistakes

- Putting `return -1;` **inside** the loop (in an `else`). Then the function gives up after checking only `a[0]`.
- Looping with `i <= n`, which reads `a[n]`, one past the end of the array.
$md$, 1, null, null),

('a3000002-0001-0002-0007-000000000002','a3000001-0001-0002-0001-000000000007','content','Binary Search',$md$
Binary search is how you look up a word in a dictionary. You do not start at page 1. You open near the middle, see whether your word comes before or after that page, and throw away the half that cannot contain it. Then you repeat with the half that is left.

That trick only works because a dictionary is **in order**. Binary search has the same rule: **the array must be sorted first.** On an unsorted array it can miss values that are there.

```c
#include <stdio.h>

int binarySearch(int a[], int n, int key) {
    int low = 0, high = n - 1, mid;
    while (low <= high) {
        mid = low + (high - low) / 2;
        if (a[mid] == key)
            return mid;            /* found */
        else if (a[mid] < key)
            low = mid + 1;         /* key is in the right half */
        else
            high = mid - 1;        /* key is in the left half */
    }
    return -1;                     /* low passed high: not there */
}

int main(void) {
    int a[] = {3, 8, 15, 21, 27, 34, 42, 56, 61, 70};
    printf("%d\n", binarySearch(a, 10, 15));
    printf("%d\n", binarySearch(a, 10, 40));
    return 0;
}
```

Output:

```
2
-1
```

`low` and `high` mark the part of the array that could still hold the key. Each pass looks at the middle element, `mid`, and either finds the key or moves `low` or `high` past `mid`, cutting the range in half. When `low` passes `high`, the range is empty and the key is not there.

`mid = low + (high - low) / 2` gives the same answer as `(low + high) / 2` for normal sizes. Integer division drops the .5, so the middle of 0 and 9 is 4. The longer form just avoids overflow when `low + high` is bigger than an `int` can hold.

### Trace: searching for 15

The array, with its indexes:

| index | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|---|---|---|---|---|---|---|---|---|---|---|
| value | 3 | 8 | 15 | 21 | 27 | 34 | 42 | 56 | 61 | 70 |

| Step | low | high | mid | a[mid] | Decision |
|---|---|---|---|---|---|
| 1 | 0 | 9 | 4 | 27 | 27 > 15, so high = 3 |
| 2 | 0 | 3 | 1 | 8 | 8 < 15, so low = 2 |
| 3 | 2 | 3 | 2 | 15 | found, return 2 |

### Trace: searching for 40 (not in the array)

| Step | low | high | mid | a[mid] | Decision |
|---|---|---|---|---|---|
| 1 | 0 | 9 | 4 | 27 | 27 < 40, so low = 5 |
| 2 | 5 | 9 | 7 | 56 | 56 > 40, so high = 6 |
| 3 | 5 | 6 | 5 | 34 | 34 < 40, so low = 6 |
| 4 | 6 | 6 | 6 | 42 | 42 > 40, so high = 5 |
| | 6 | 5 | | | low > high, return -1 |

Four comparisons to prove 40 is missing. Linear search would have needed all ten.

### How fast is it?

Every step halves what is left, so the number of steps is how many times you can halve n before reaching 1:

| Elements | Linear search, worst | Binary search, worst |
|---|---|---|
| 10 | 10 | 4 |
| 1,000 | 1,000 | 10 |
| 1,000,000 | 1,000,000 | 20 |

### Binary search with recursion

Binary search is the "split in half" kind of problem from Lesson 6 (Recursion). The range shrinks every call, and there are two base cases: the range is empty, or the middle is the key.

```c
int binarySearchRec(int a[], int low, int high, int key) {
    int mid;
    if (low > high)                  /* base case 1: empty range */
        return -1;
    mid = low + (high - low) / 2;
    if (a[mid] == key)               /* base case 2: found */
        return mid;
    if (a[mid] < key)
        return binarySearchRec(a, mid + 1, high, key);
    return binarySearchRec(a, low, mid - 1, key);
}
```

Calling `binarySearchRec(a, 0, 9, 61)` on the same array returns 8.

### Common mistakes

- Using binary search on an **unsorted** array.
- Writing `while (low < high)`, which stops one step early and misses the key when it is the last element left.
- Writing `low = mid` or `high = mid` instead of `mid + 1` and `mid - 1`. The range can stop shrinking and the loop never ends.
$md$, 2, null, null)
ON CONFLICT (id) DO UPDATE SET
  module_id     = excluded.module_id,
  kind          = excluded.kind,
  heading       = excluded.heading,
  body_md       = excluded.body_md,
  sort_order    = excluded.sort_order,
  ide_language  = excluded.ide_language,
  starter_code  = excluded.starter_code;
