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
$md$, 2, null, null),

('a3000002-0001-0002-0007-000000000003','a3000001-0001-0002-0001-000000000007','content','Bubble Sort',$md$
Bubble sort walks through the array comparing each pair of **neighbors**, and swaps them when they are out of order. After one full pass the largest value has "bubbled up" to the last position. Repeat, and the next largest settles just before it, and so on.

```c
#include <stdio.h>

void bubbleSort(int a[], int n) {
    int i, j, temp, swapped;
    for (i = 0; i < n - 1; i++) {          /* one pass per i */
        swapped = 0;
        for (j = 0; j < n - 1 - i; j++) {  /* the last i are already in place */
            if (a[j] > a[j + 1]) {         /* neighbors out of order: swap */
                temp = a[j];
                a[j] = a[j + 1];
                a[j + 1] = temp;
                swapped = 1;
            }
        }
        if (!swapped)                      /* a pass with no swaps: done */
            break;
    }
}

int main(void) {
    int a[] = {29, 10, 14, 37, 13};
    int i;
    bubbleSort(a, 5);
    for (i = 0; i < 5; i++)
        printf("%d ", a[i]);
    printf("\n");
    return 0;
}
```

Output:

```
10 13 14 29 37
```

### Pass 1, comparison by comparison

Start: `29 10 14 37 13`

| Compare | Out of order? | Array after |
|---|---|---|
| 29 and 10 | yes, swap | 10 29 14 37 13 |
| 29 and 14 | yes, swap | 10 14 29 37 13 |
| 29 and 37 | no | 10 14 29 37 13 |
| 37 and 13 | yes, swap | 10 14 29 13 **37** |

37, the largest, is now in its final place.

### Every pass

| Pass | Comparisons | Array after the pass |
|---|---|---|
| 1 | 4 | 10 14 29 13 **37** |
| 2 | 3 | 10 14 13 **29 37** |
| 3 | 2 | 10 13 **14 29 37** |
| 4 | 1 | **10 13 14 29 37** |

Bold marks the sorted end of the array: each pass locks one more value into place there, and the last pass locks in the first two together. Each pass compares one pair fewer, because the inner loop stops at `n - 1 - i`: the end of the array is already sorted. In total: 10 comparisons and 5 swaps.

![Bubble sort on 29, 10, 14, 37, 13. Pass 1 makes three swaps and moves 37 to the end. Pass 2 moves 29 into place, pass 3 moves 14, and pass 4 compares 10 and 13 and swaps nothing. Sorted result: 10, 13, 14, 29, 37, after 10 comparisons and 5 swaps.](/diagrams/cp2/lesson-7-bubble-sort-passes.svg)

### The swapped flag

If a whole pass makes **no swaps**, every neighbor is already in order, so the array is sorted and the loop can stop early. On an already sorted array like `1 2 3 4 5` the flag ends bubble sort after one pass of 4 comparisons. Without the flag, it would still run all 4 passes.

### Common mistakes

- Running the inner loop to `j < n` instead of `j < n - 1 - i`. Then `a[j + 1]` reads past the end of the array.
- Swapping without a temporary variable: `a[j] = a[j + 1]; a[j + 1] = a[j];` copies the same value into both places.
- Resetting `swapped = 0` outside the outer loop instead of at the start of every pass.
$md$, 3, null, null),

('a3000002-0001-0002-0007-000000000004','a3000001-0001-0002-0001-000000000007','content','Selection Sort and Insertion Sort',$md$
### Selection sort: find the smallest, put it in front

Selection sort splits the array into a sorted part (on the left, empty at first) and an unsorted part. Each pass **scans the unsorted part for its smallest value** and swaps it into the first unsorted position.

```c
void selectionSort(int a[], int n) {
    int i, j, min, temp;
    for (i = 0; i < n - 1; i++) {
        min = i;                           /* assume a[i] is the smallest */
        for (j = i + 1; j < n; j++) {      /* scan the unsorted part */
            if (a[j] < a[min])
                min = j;                   /* remember where the smallest is */
        }
        if (min != i) {                    /* one swap per pass, at most */
            temp = a[i];
            a[i] = a[min];
            a[min] = temp;
        }
    }
}
```

Same starting array, `29 10 14 37 13`:

| Pass | Smallest in the unsorted part | Swap | Array after |
|---|---|---|---|
| 1 | 10 (index 1) | a[0] with a[1] | **10** 29 14 37 13 |
| 2 | 13 (index 4) | a[1] with a[4] | **10 13** 14 37 29 |
| 3 | 14 (index 2) | none, already there | **10 13 14** 37 29 |
| 4 | 29 (index 4) | a[3] with a[4] | **10 13 14 29 37** |

10 comparisons and only 3 swaps. Selection sort always makes the same number of comparisons whatever the order, but **at most one swap per pass**. That makes it a good choice when swapping is expensive, such as large records.

### Insertion sort: like arranging cards in your hand

Insertion sort also keeps a sorted part on the left. Each pass picks up the next value (the **key**), shifts every bigger value in the sorted part one place to the right, and drops the key into the gap. It is how most people sort a hand of playing cards.

```c
void insertionSort(int a[], int n) {
    int i, j, key;
    for (i = 1; i < n; i++) {
        key = a[i];                        /* the card being inserted */
        j = i - 1;
        while (j >= 0 && a[j] > key) {     /* shift bigger values right */
            a[j + 1] = a[j];
            j--;
        }
        a[j + 1] = key;                    /* drop key into the gap */
    }
}
```

Same starting array:

| Pass | Key | Shifted right | Array after |
|---|---|---|---|
| 1 | 10 | 29 | **10 29** 14 37 13 |
| 2 | 14 | 29 | **10 14 29** 37 13 |
| 3 | 37 | nothing | **10 14 29 37** 13 |
| 4 | 13 | 37, 29, 14 | **10 13 14 29 37** |

Bold is the sorted part. In pass 3, 37 is already bigger than everything before it, so one comparison is enough and nothing moves. In total: 8 comparisons and 5 shifts.

Insertion sort is fast when the array is **almost sorted**: each key only moves a step or two. On `1 2 3 4 5` it makes just 4 comparisons and moves nothing.

### Telling the three apart in an exam

A trace question often shows the array after each pass and asks which sort produced it. Look at pass 1:

- **Bubble:** the **largest** value is now at the **end**.
- **Selection:** the **smallest** value is now at the **front**, swapped with whatever was there.
- **Insertion:** only the **first two** elements are in order; the rest has not been touched.

### Common mistakes

- Selection sort: swapping inside the inner loop every time a smaller value turns up. That is extra swaps, and no longer selection sort.
- Insertion sort: writing `a[j] > a[i]` in the `while`. `a[i]` gets overwritten by the first shift, which is why the key is saved in `key` first.
- Insertion sort: checking `a[j] > key` before `j >= 0`. The order matters: `j >= 0 && a[j] > key` stops before reading `a[-1]`.
$md$, 4, null, null),

('a3000002-0001-0002-0007-000000000005','a3000001-0001-0002-0001-000000000007','content','Sorting an Array of Structs by a Field',$md$
In real programs you rarely sort bare numbers. You sort **records**: students by GWA, products by price, names A to Z. With the structures from Lesson 4 (Structures), the sorting algorithm stays exactly the same. Only two lines change:

1. **Compare one field**, such as `s[j].gwa < s[min].gwa`.
2. **Swap the whole struct**, using a temporary variable of the struct type.

```c
#include <stdio.h>
#include <string.h>

struct Student {
    char name[20];
    float gwa;
};

/* Selection sort by GWA, lowest (best) first */
void sortByGwa(struct Student s[], int n) {
    int i, j, min;
    struct Student temp;
    for (i = 0; i < n - 1; i++) {
        min = i;
        for (j = i + 1; j < n; j++) {
            if (s[j].gwa < s[min].gwa)      /* compare ONE field... */
                min = j;
        }
        if (min != i) {
            temp = s[i];                     /* ...but swap the WHOLE struct */
            s[i] = s[min];
            s[min] = temp;
        }
    }
}

/* Bubble sort by name, A to Z */
void sortByName(struct Student s[], int n) {
    int i, j;
    struct Student temp;
    for (i = 0; i < n - 1; i++) {
        for (j = 0; j < n - 1 - i; j++) {
            if (strcmp(s[j].name, s[j + 1].name) > 0) {
                temp = s[j];
                s[j] = s[j + 1];
                s[j + 1] = temp;
            }
        }
    }
}

void printAll(struct Student s[], int n) {
    int i;
    for (i = 0; i < n; i++)
        printf("%-10s %.2f\n", s[i].name, s[i].gwa);
}

int main(void) {
    struct Student s[4] = {
        {"Santos", 1.75f}, {"Reyes", 1.25f},
        {"Cruz", 2.00f},   {"Bautista", 1.50f}
    };

    sortByGwa(s, 4);
    printf("By GWA:\n");
    printAll(s, 4);

    sortByName(s, 4);
    printf("By name:\n");
    printAll(s, 4);
    return 0;
}
```

Output:

```
By GWA:
Reyes      1.25
Bautista   1.50
Santos     1.75
Cruz       2.00
By name:
Bautista   1.50
Cruz       2.00
Reyes      1.25
Santos     1.75
```

A few things to notice:

- In the Philippine grading system a **lower** GWA is better, so sorting from lowest to highest lists the best student first. To sort the other way, flip `<` to `>`.
- `temp = s[i];` copies a whole struct in one assignment, name and GWA together. C allows `=` between structs of the same type, even though it does not allow it between arrays.
- Strings cannot be compared with `<` or `>`. Use `strcmp()` from `<string.h>` (Lesson 2, Strings): it returns a positive number when the first string comes **after** the second alphabetically, which is exactly when the pair is out of order.

### Common mistake: swapping only the field

```c
temp_gwa = s[i].gwa;        /* WRONG */
s[i].gwa = s[min].gwa;
s[min].gwa = temp_gwa;
```

The GWAs end up sorted, but the names stay where they were, so every grade is now attached to the wrong student. Always move the whole record.

### Ties

When two records have the same key (two students with a 1.50 GWA), bubble sort and insertion sort keep them in their original order, because they only move a record past a strictly bigger one. Sorts that do this are called **stable**. Selection sort as written here is not: its long-distance swap can jump one record over an equal one.
$md$, 5, null, null),

('a3000002-0001-0002-0007-000000000006','a3000001-0001-0002-0001-000000000007','content','Comparing the Algorithms: Big-O in Plain Words',$md$
Saying "bubble sort took 0.2 seconds" is not very useful: the same code runs at a different speed on every computer. Instead, programmers describe **how the work grows as the input grows**. That is what **Big-O notation** says.

You read O(n) as "order n". In plain words:

| Big-O | Plain words | Example |
|---|---|---|
| O(1) | the same work no matter how big n is | reading `a[5]` |
| O(log n) | the work goes up by one step each time n **doubles** | binary search |
| O(n) | double n, double the work | linear search |
| O(n²) | double n, **four times** the work | bubble, selection, insertion sort |

Rough step counts as n grows:

| n | O(log n) | O(n) | O(n²) |
|---|---|---|---|
| 10 | about 3 | 10 | 100 |
| 1,000 | about 10 | 1,000 | 1,000,000 |
| 1,000,000 | about 20 | 1,000,000 | 1,000,000,000,000 |

Big-O ignores small details, such as whether a sort makes n² or n²/2 comparisons. It only cares about the shape of the growth, because for large n the shape is what decides whether a program finishes in a blink or in hours.

### Where does n² come from?

All three sorts have a loop inside a loop. For 5 elements, bubble and selection sort make 4 + 3 + 2 + 1 = 10 comparisons. For n elements, that is n(n - 1) / 2, about half of n². Half of n² still grows like n², so the class is O(n²).

### The lesson's algorithms side by side

| Algorithm | Best case | Worst case | Good to know |
|---|---|---|---|
| Linear search | O(1) | O(n) | works on unsorted data |
| Binary search | O(1) | O(log n) | the array must be sorted |
| Bubble sort (with flag) | O(n) | O(n²) | many swaps; best case only with the flag |
| Selection sort | O(n²) | O(n²) | at most n - 1 swaps |
| Insertion sort | O(n) | O(n²) | fastest of the three on nearly sorted data |

Real counts from the traces in this lesson, all on 5 elements:

| Input | Bubble | Selection | Insertion |
|---|---|---|---|
| 29 10 14 37 13 | 10 comparisons, 5 swaps | 10 comparisons, 3 swaps | 8 comparisons, 5 shifts |
| 1 2 3 4 5 (sorted) | 4 comparisons, 0 swaps | 10 comparisons, 0 swaps | 4 comparisons, 0 shifts |
| 5 4 3 2 1 (reversed) | 10 comparisons, 10 swaps | 10 comparisons, 2 swaps | 10 comparisons, 10 shifts |

### Which one should you use?

- **Searching once in unsorted data:** linear search. Sorting first just to search once costs more than it saves.
- **Searching many times:** sort once, then use binary search every time.
- **Small or nearly sorted arrays:** insertion sort.
- **Swaps are expensive (big structs):** selection sort.
- **Large arrays:** none of these three. Faster sorts such as merge sort and quick sort run in O(n log n) and come up in Data Structures and Algorithms. The C library also has `qsort()` in `<stdlib.h>`.
$md$, 6, null, null),

('a3000002-0001-0002-0007-000000000007','a3000001-0001-0002-0001-000000000007','content','Key Takeaways',$md$
- **Linear search** checks elements one by one and works on any array: up to n comparisons. **Binary search** halves the range each step, so it needs only about 20 comparisons for a million elements, but the array **must be sorted**.
- **Bubble sort** swaps neighbors that are out of order; each pass moves the largest remaining value to the end, and a `swapped` flag lets it stop early on sorted data.
- **Selection sort** finds the smallest value in the unsorted part and swaps it to the front: at most one swap per pass. **Insertion sort** shifts bigger values right and drops each key into place, which makes it fast on nearly sorted data.
- To sort structs, compare **one field** (use `strcmp()` for strings) but swap the **whole struct** with a temporary struct variable.
- Big-O describes how work grows with n: O(log n) barely grows, O(n) doubles when n doubles, and O(n²), the class of all three sorts here, quadruples.
$md$, 7, null, null),

('a3000002-0001-0002-0007-000000000008','a3000001-0001-0002-0001-000000000007','content','Try It: Searching & Sorting',$md$
Run it to watch bubble sort pass by pass, then binary search narrowing `low` and `high`. Change the array (keep `n` equal to its size), or change `key` to a value that is not there and see what the search returns.
$md$, 8, 'c', $code$#include <stdio.h>

void printArray(int a[], int n) {
    int i;
    for (i = 0; i < n; i++)
        printf("%d ", a[i]);
    printf("\n");
}

void bubbleSort(int a[], int n) {
    int i, j, temp, swapped;
    for (i = 0; i < n - 1; i++) {
        swapped = 0;
        for (j = 0; j < n - 1 - i; j++) {
            if (a[j] > a[j + 1]) {
                temp = a[j];
                a[j] = a[j + 1];
                a[j + 1] = temp;
                swapped = 1;
            }
        }
        printf("After pass %d: ", i + 1);
        printArray(a, n);
        if (!swapped)
            break;
    }
}

int binarySearch(int a[], int n, int key) {
    int low = 0, high = n - 1, mid;
    while (low <= high) {
        mid = low + (high - low) / 2;
        printf("  low=%d high=%d mid=%d a[mid]=%d\n", low, high, mid, a[mid]);
        if (a[mid] == key)
            return mid;
        else if (a[mid] < key)
            low = mid + 1;
        else
            high = mid - 1;
    }
    return -1;
}

int main(void) {
    int a[] = {29, 10, 14, 37, 13};
    int n = 5, key = 29;

    bubbleSort(a, n);

    printf("\nSearching for %d:\n", key);
    printf("Found at index %d\n", binarySearch(a, n, key));
    return 0;
}$code$),

('a3000002-0001-0002-0007-000000000009','a3000001-0001-0002-0001-000000000007','activity','Practice Exercises, Lesson 7',$md$
**Conceptual questions:**
1. What must be true about an array before you can use binary search on it? Why?
2. An array has 500 elements. What is the most comparisons linear search can need? Binary search?
3. In one sentence each, describe what one pass of bubble sort, selection sort, and insertion sort does.
4. Why does bubble sort with a `swapped` flag finish after a single pass on an array that is already sorted?
5. What does O(n²) mean in plain words? If n doubles, roughly how much more work does an O(n²) sort do?

**Trace the output:**

a. Use the iterative `binarySearch()` from the notes on `{4, 9, 13, 18, 25, 31, 40}`. Show `low`, `high` and `mid` at every step when searching for 31, then for 10. What does each search return?

b. Show the array after every pass when `{7, 3, 9, 1, 5}` is sorted by (i) bubble sort with the `swapped` flag, (ii) selection sort, (iii) insertion sort.

**Programming exercises:**
1. Write `int countOccurrences(int a[], int n, int key)` that returns how many times `key` appears in an unsorted array.
2. Change selection sort so it sorts in **descending** order (largest first).
3. Given `struct Product { char name[20]; float price; };`, write a function that sorts an array of products from cheapest to most expensive with insertion sort, and print the result.
4. Write a recursive binary search (see Lesson 6, Recursion) and test it on a sorted array for one key that is present and one that is not.
$md$, 9, null, null),

('a3000002-0001-0002-0007-000000000010','a3000001-0001-0002-0001-000000000007','activity','Worked Exam Solutions + How-to-Pass Tips, Lesson 7',$md$
**Answer Key, Conceptual Questions**

1. The array must be **sorted**. Binary search throws away half of the range after each comparison, assuming everything left of `mid` is smaller and everything right of it is bigger. In an unsorted array that assumption is false, so it can throw away the half that holds the key.
2. Linear search: **500** (the key is last or missing). Binary search: **9**, because halving 500 down to 1 takes 9 steps (2 to the 9th is 512).
3. **Bubble:** compares neighbors left to right and swaps any pair out of order, carrying the largest remaining value to the end. **Selection:** finds the smallest value in the unsorted part and swaps it into the first unsorted position. **Insertion:** takes the next value and shifts bigger sorted values right until it can drop the value into its place.
4. In a sorted array no neighbors are out of order, so the first pass makes no swaps, `swapped` stays 0, and the `break` ends the sort after n - 1 comparisons.
5. The work grows with the **square** of the input size. Double n and the work is about **four times** as much (2 × 2); ten times n is about a hundred times the work.

**Worked Exam-Style Problem, Trace (a)**

Array with indexes: 4 (0), 9 (1), 13 (2), 18 (3), 25 (4), 31 (5), 40 (6).

*Searching for 31:*

| Step | low | high | mid | a[mid] | Decision |
|---|---|---|---|---|---|
| 1 | 0 | 6 | 3 | 18 | 18 < 31, so low = 4 |
| 2 | 4 | 6 | 5 | 31 | found, return **5** |

*Searching for 10:*

| Step | low | high | mid | a[mid] | Decision |
|---|---|---|---|---|---|
| 1 | 0 | 6 | 3 | 18 | 18 > 10, so high = 2 |
| 2 | 0 | 2 | 1 | 9 | 9 < 10, so low = 2 |
| 3 | 2 | 2 | 2 | 13 | 13 > 10, so high = 1 |
| | 2 | 1 | | | low > high, return **-1** |

**Worked Exam-Style Problem, Trace (b)**

Start: `7 3 9 1 5`

| Pass | (i) Bubble | (ii) Selection | (iii) Insertion |
|---|---|---|---|
| 1 | 3 7 1 5 9 | 1 3 9 7 5 | 3 7 9 1 5 |
| 2 | 3 1 5 7 9 | 1 3 9 7 5 | 3 7 9 1 5 |
| 3 | 1 3 5 7 9 | 1 3 5 7 9 | 1 3 7 9 5 |
| 4 | 1 3 5 7 9 | 1 3 5 7 9 | 1 3 5 7 9 |

How to get each column:

- **Bubble:** in pass 1, 7 and 3 swap, 7 and 9 stay, 9 and 1 swap, 9 and 5 swap, so 9 ends up last. Pass 3 still made a swap, so pass 4 runs: it compares 1 and 3 and swaps nothing. Total: 10 comparisons, 6 swaps.
- **Selection:** pass 1 finds 1 (index 3) and swaps it with 7. In pass 2 the smallest of `3 9 7 5` is 3, already in place, so nothing moves. Pass 3 swaps 5 with 9. In pass 4 the smallest of `7 9` is 7, already in place. Only 2 swaps.
- **Insertion:** pass 1 inserts 3 before 7. Pass 2 inserts 9, which is already bigger than 7, so nothing changes. Pass 3 shifts 9, 7 and 3 right and puts 1 at the front. Pass 4 shifts 9 and 7 and puts 5 after 3.

Notice that rows 1 and 2 look identical for selection and for insertion. That is correct, and it is a common trap: "the array did not change" is a valid answer for a pass.

**Worked Programming Exercises (#1 to #3)**

```c
#include <stdio.h>

struct Product {
    char name[20];
    float price;
};

int countOccurrences(int a[], int n, int key) {
    int i, count = 0;
    for (i = 0; i < n; i++) {
        if (a[i] == key)
            count++;            /* do not return early: keep counting */
    }
    return count;
}

void selectionSortDesc(int a[], int n) {
    int i, j, max, temp;
    for (i = 0; i < n - 1; i++) {
        max = i;
        for (j = i + 1; j < n; j++) {
            if (a[j] > a[max])  /* look for the LARGEST instead */
                max = j;
        }
        temp = a[i];
        a[i] = a[max];
        a[max] = temp;
    }
}

void sortByPrice(struct Product p[], int n) {
    int i, j;
    struct Product key;
    for (i = 1; i < n; i++) {
        key = p[i];                         /* the whole record */
        j = i - 1;
        while (j >= 0 && p[j].price > key.price) {
            p[j + 1] = p[j];                /* shift the bigger record right */
            j--;
        }
        p[j + 1] = key;
    }
}

int main(void) {
    int a[] = {5, 2, 5, 9, 5, 1};
    int b[] = {7, 3, 9, 1, 5};
    struct Product p[4] = {
        {"Notebook", 45.00f}, {"Ballpen", 12.50f},
        {"Folder", 8.75f},    {"Calculator", 499.00f}
    };
    int i;

    printf("5 appears %d times\n", countOccurrences(a, 6, 5));

    selectionSortDesc(b, 5);
    for (i = 0; i < 5; i++)
        printf("%d ", b[i]);
    printf("\n");

    sortByPrice(p, 4);
    for (i = 0; i < 4; i++)
        printf("%-10s %7.2f\n", p[i].name, p[i].price);
    return 0;
}
```

Output:
```
5 appears 3 times
9 7 5 3 1
Folder        8.75
Ballpen      12.50
Notebook     45.00
Calculator  499.00
```

- **#1:** unlike `linearSearch()`, the loop must not `return` when it finds a match, or it counts at most one.
- **#2:** the only real change is `>` instead of `<`. Renaming `min` to `max` keeps the code honest for whoever reads it next.
- **#3:** `key` is a whole `struct Product`, the comparison reads `.price`, and the shift `p[j + 1] = p[j]` moves the whole record. The name and price always travel together.
- **#4** is the `binarySearchRec()` function from the Binary Search notes: base cases `low > high` (return -1) and `a[mid] == key` (return `mid`).

**How to Pass Tips**

- Draw the array with its **indexes** above it before any binary search trace. Most wrong answers come from mixing up an index with the value stored there.
- For a sort trace, write the whole array again after **every** pass, even when nothing changed. Examiners often include a pass with no change to see who skips it.
- Know the pass-1 fingerprints: largest at the end means bubble, smallest at the front means selection, only the first two in order means insertion.
- Memorize the inner-loop bounds, because they are what you lose marks on: bubble `j < n - 1 - i`, selection `j = i + 1; j < n`, insertion `while (j >= 0 && a[j] > key)`.
- For "which algorithm is better" questions, always mention the condition: binary search needs sorted data, insertion sort shines on nearly sorted data, selection sort makes the fewest swaps.
$md$, 10, null, null),

('a3000002-0001-0002-0007-000000000011','a3000001-0001-0002-0001-000000000007','activity','Code Lab, Lesson 7: Sort, Then Search',$md$
**Coding Drill:** Finish `insertionSort()` and `binarySearch()`. The program sorts the array, then searches it twice: once for a value that is there and once for one that is not. Binary search only works because the sort runs first, so get the sort right before you test the search.

Expected output:
```
before: 42 7 19 88 3 56 21
after : 3 7 19 21 42 56 88
search 56: index 5
search 20: not found
```
$md$, 11, 'c', $code$#include <stdio.h>

void insertionSort(int a[], int n) {
    /* TODO: for i = 1 to n-1, save key = a[i], shift every bigger
       element one place right, then drop key into the gap. */
}

int binarySearch(int a[], int n, int key) {
    /* TODO: keep low and high, check the middle, throw away the half
       that cannot hold key. Return the index, or -1 if not found. */
    return -1;
}

void printArray(const char *label, int a[], int n) {
    int i;
    printf("%s", label);
    for (i = 0; i < n; i++)
        printf(" %d", a[i]);
    printf("\n");
}

int main(void) {
    int a[] = {42, 7, 19, 88, 3, 56, 21};
    int n = 7, pos;

    printArray("before:", a, n);
    insertionSort(a, n);
    printArray("after :", a, n);

    pos = binarySearch(a, n, 56);
    if (pos != -1) printf("search 56: index %d\n", pos);
    else           printf("search 56: not found\n");

    pos = binarySearch(a, n, 20);
    if (pos != -1) printf("search 20: index %d\n", pos);
    else           printf("search 20: not found\n");
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
