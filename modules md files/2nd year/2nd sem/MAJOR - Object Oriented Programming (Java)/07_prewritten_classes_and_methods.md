# Prewritten Classes and Methods
<!-- subject: Object-Oriented Programming with Java | year: 2nd -->

<!-- kind: content -->
## Lesson Overview
This lesson explains how to use Java's built-in classes, constants, imported packages, mathematical methods, and date/time-related classes.

<!-- kind: content -->
## Automatically Available Classes
Java provides many ready-made classes. Some are available automatically because every Java program imports the `java.lang` package by default.

Examples of commonly used classes from `java.lang` include:

- `System`
- `String`
- `Math`
- `Integer`
- `Double`
- `Character`
- `Boolean`

A package is a group of related classes. Packages help organize Java's class library.

<!-- kind: content -->
## Math Constants and Methods
The `Math` class provides useful constants and methods for numeric calculations. Its members are static, so they are called using the class name.

```java
Math.PI
Math.sqrt(25)
Math.max(5, 3)
```

Common `Math` members:

| Member | Purpose |
|---|---|
| `Math.PI` | Value of pi |
| `Math.abs(x)` | Absolute value |
| `Math.sqrt(x)` | Square root |
| `Math.pow(x, y)` | x raised to the y power |
| `Math.round(x)` | Nearest whole number |
| `Math.ceil(x)` | Smallest whole number not less than x |
| `Math.floor(x)` | Largest whole number not greater than x |
| `Math.max(x, y)` | Larger of two values |
| `Math.min(x, y)` | Smaller of two values |
| `Math.sin(x)` | Sine, using radians |
| `Math.cos(x)` | Cosine, using radians |
| `Math.random()` | Random decimal from 0.0 up to but not including 1.0 |

<!-- kind: activity -->
## Activity: Math Class Demonstration
```java
public class MathClassDemo {
    public static void main(String[] args) {
        double number = -26.9;
        int x = 5;
        int y = 3;

        System.out.println("Absolute value: " + Math.abs(number));
        System.out.println("Square root of 25: " + Math.sqrt(25));
        System.out.println("Rounded value: " + Math.round(26.9));
        System.out.println("PI: " + Math.PI);
        System.out.println("5 raised to 2: " + Math.pow(x, 2));
        System.out.println("Larger value: " + Math.max(x, y));
        System.out.println("Smaller value: " + Math.min(x, y));
    }
}
```

<!-- kind: content -->
## Importing Prewritten Classes
Not every Java class is imported automatically. To use classes outside `java.lang`, you can:

1. Use the full package path.
2. Import a specific class.
3. Import all classes from a package using `*`.

Examples:

```java
java.util.Date today = new java.util.Date();
```

```java
import java.util.Date;
Date today = new Date();
```

```java
import java.util.*;
Date today = new Date();
```

Import statements are placed before the class declaration.

<!-- kind: content -->
## Date and Time Classes
Older Java programs may use `java.util.Date`, but many of its methods are now considered legacy. For modern Java, prefer the `java.time` package, such as `LocalDate` and `LocalDateTime`.

<!-- kind: activity -->
## Activity: Modern Date Example
```java
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class DateDemo {
    public static void main(String[] args) {
        LocalDate today = LocalDate.now();
        LocalDate tomorrow = today.plusDays(1);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM d, yyyy");

        System.out.println("Today is " + today.format(formatter));
        System.out.println("Tomorrow is " + tomorrow.format(formatter));
        System.out.println("Month number: " + today.getMonthValue());
        System.out.println("Day of week: " + today.getDayOfWeek());
    }
}
```

<!-- kind: activity -->
## Laboratory Exercises
1. Write a Java program that calculates and displays:
   - the square of `30`
   - the sine and cosine of `100`
   - the floor, ceiling, and rounded value of `44.7`
   - the larger and smaller value between a character and an integer after appropriate comparison or casting
2. Write a program that counts how many days remain from today until the end of the current year.
3. Write a program that counts how many days remain from today until your next birthday.
4. Write a program that displays the current date in a readable format, such as:

```text
Today is October 1, 2021
It is the 1st day of October
Today is Friday
```
