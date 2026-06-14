# Introduction to Object-Oriented Programming and Java Basics
<!-- subject: Object-Oriented Programming with Java | year: 2nd -->

<!-- kind: content -->
## Lesson Overview
This lesson introduces object-oriented programming (OOP), the Java platform, the structure of a basic Java program, variables, data types, and operators.

By the end of the lesson, a learner should be able to explain common OOP features, describe how Java source code becomes executable bytecode, write valid variable declarations, choose appropriate primitive data types, and use basic Java operators.

<!-- kind: content -->
## Procedural Programming and Object-Oriented Programming
Procedural programming organizes a program as a sequence of instructions. The program often moves step by step through statements, decisions, loops, and procedure calls.

Object-oriented programming organizes a program around **objects**. An object combines data and behavior in one unit. In Java, objects are created from classes. This style is useful for larger programs because it lets developers model real-world entities, reuse code, and keep related logic together.

<!-- kind: content -->
## Major Features of OOP
- **Encapsulation** keeps data and the methods that work on that data together. It also helps protect data from direct outside access.
- **Inheritance** allows one class to reuse and extend the features of another class.
- **Polymorphism** allows the same operation or method name to behave differently depending on the object or parameters involved.
- **Abstraction** focuses on important details while hiding unnecessary implementation details.
- **Message passing** happens when objects communicate by calling methods and passing values as arguments.

<!-- kind: content -->
## Java as a Language and Platform
Java is both a programming language and a platform. Java source code is written in `.java` files, compiled into **bytecode**, and then executed by the **Java Virtual Machine (JVM)**.

The main idea is portability: the same compiled bytecode can run on any system that has a compatible JVM. This is often described as **write once, run anywhere**.

The Java platform includes:

| Component | Purpose |
|---|---|
| JVM | Runs Java bytecode on a specific machine |
| Java API | Provides ready-made classes and packages for common tasks such as input, math, strings, GUI, files, and networking |

<!-- kind: content -->
## Java Program Structure
A basic Java application normally contains a class and a `main` method. The `main` method is the starting point of execution.

Important parts of a simple Java program:

| Part | Meaning |
|---|---|
| `public class ClassName` | Defines a class. If the class is public, the filename should match the class name. |
| `{ }` | Curly braces mark the beginning and end of a class or method body. |
| `public static void main(String[] args)` | Main method where program execution starts. |
| `System.out.println()` | Prints output and moves to the next line. |
| `;` | Ends most Java statements. |

<!-- kind: activity -->
## Activity: First Java Program
Create a file named `HelloJava.java` and run it.

```java
public class HelloJava {
    public static void main(String[] args) {
        System.out.println("Hello, Java learner!");
    }
}
```

Expected output:

```text
Hello, Java learner!
```

<!-- kind: content -->
## Java Comments
Comments are notes for human readers. The Java compiler ignores them.

| Comment type | Syntax | Common use |
|---|---|---|
| Line comment | `// comment` | Short note on one line |
| Block comment | `/* comment */` | Multi-line explanation |
| Documentation comment | `/** comment */` | API-style documentation for classes and methods |

<!-- kind: content -->
## Variables and Data Types
A variable is a named storage location. In Java, every variable must have a data type.

Example:

```java
int age = 20;
double price = 99.75;
char grade = 'A';
boolean isPassed = true;
```

Common primitive data types:

| Type | Typical use |
|---|---|
| `byte` | Very small integers |
| `short` | Small integers |
| `int` | Standard whole numbers |
| `long` | Very large whole numbers |
| `float` | Decimal values with less precision |
| `double` | Standard decimal values |
| `char` | A single character |
| `boolean` | `true` or `false` |

<!-- kind: content -->
## Variable Naming Rules and Conventions
A Java variable name must be a valid identifier. It cannot be a reserved keyword, and it cannot duplicate another variable name in the same scope.

Common naming conventions:

- Variable names usually start with a lowercase letter: `score`, `totalAmount`.
- Class names usually start with an uppercase letter: `StudentRecord`.
- Use camelCase for multi-word variable names: `isVisible`, `studentAge`.

<!-- kind: content -->
## Initialization and Final Variables
A variable may be given a value when it is declared.

```java
int count = 0;
```

A `final` variable can be assigned only once.

```java
final double TAX_RATE = 0.15;
```

After a final variable receives a value, attempting to assign a new value will cause a compile-time error.

<!-- kind: content -->
## Java Operators
Arithmetic operators perform numeric calculations.

| Operator | Meaning | Example |
|---|---|---|
| `+` | Addition | `a + b` |
| `-` | Subtraction | `a - b` |
| `*` | Multiplication | `a * b` |
| `/` | Division | `a / b` |
| `%` | Remainder | `a % b` |

Relational operators compare values and produce a boolean result.

| Operator | Meaning |
|---|---|
| `>` | Greater than |
| `>=` | Greater than or equal to |
| `<` | Less than |
| `<=` | Less than or equal to |
| `==` | Equal to |
| `!=` | Not equal to |

Conditional operators combine or reverse boolean expressions.

| Operator | Meaning |
|---|---|
| `&&` | True when both conditions are true; short-circuits |
| `||` | True when at least one condition is true; short-circuits |
| `!` | Reverses a boolean value |
| `?:` | Ternary shorthand for simple if-else decisions |

Assignment shortcuts combine calculation and assignment.

```java
x += 2;  // same as x = x + 2
x -= 1;  // same as x = x - 1
x *= 3;  // same as x = x * 3
x /= 2;  // same as x = x / 2
x %= 5;  // same as x = x % 5
```

<!-- kind: content -->
## Expressions
An expression is a combination of values, variables, operators, and method calls that evaluates to one result.

Examples:

```java
int total = price * quantity;
boolean isAdult = age >= 18;
int larger = (a > b) ? a : b;
```

<!-- kind: activity -->
## Practice Exercises
Write Java statements for the following tasks.

1. Declare three `int` variables named `x`, `y`, and `z` with values `5`, `10`, and `15`.
2. Store the result of `x > y` in a boolean variable.
3. Store the sum of `x` and `y` in a variable named `sum`.
4. Print this message using one `println` statement: `The sum of 5 and 10 is 15`.
5. Declare a boolean variable named `isActive` and initialize it to `true`.

<!-- kind: activity -->
## Laboratory Exercises
1. Write a program that prints a triangle pattern using asterisks.
2. Write a program that prints your name on the first line and your course/year information on the second line using one `System.out.println()` statement.
3. Declare variables for a boolean value, two integers, one character, and one decimal value. Print each value in a readable sentence, then update the boolean value using a comparison.
4. Write a payroll program that asks for hourly rate and hours worked. Compute gross pay, withholding tax at 15%, and net pay.
5. Convert a number of minutes into hours and remaining minutes. Example: `125` minutes becomes `2 hours and 5 minutes`.
6. Break a cash amount into denominations such as 1000, 500, 100, 50, 20, 10, 5, and 1.
