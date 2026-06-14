# Input and Control Statements
<!-- subject: Object-Oriented Programming with Java | year: 2nd -->

<!-- kind: content -->
## Lesson Overview
This lesson explains how Java programs receive input and how they control the order of execution using decision statements and loops.

<!-- kind: content -->
## Keyboard Input with BufferedReader
`BufferedReader` can read text from the keyboard. Since it reads input as text, numeric values must be converted before computation.

Common conversions:

| Needed value | Example conversion |
|---|---|
| `int` | `Integer.parseInt(reader.readLine())` |
| `double` | `Double.parseDouble(reader.readLine())` |
| `String` | `reader.readLine()` |

When using `BufferedReader`, import `java.io.*` and handle `IOException`.

<!-- kind: activity -->
## Activity: BufferedReader Input
```java
import java.io.*;

public class ReaderInputDemo {
    public static void main(String[] args) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));

        System.out.print("First name: ");
        String firstName = reader.readLine();

        System.out.print("Age: ");
        int age = Integer.parseInt(reader.readLine());

        System.out.print("Weight: ");
        double weight = Double.parseDouble(reader.readLine());

        System.out.println("Name: " + firstName);
        System.out.println("Age: " + age);
        System.out.println("Weight: " + weight);
    }
}
```

<!-- kind: content -->
## Keyboard Input with Scanner
`Scanner` is commonly used for beginner Java input because it provides methods for different data types.

| Method | Reads |
|---|---|
| `nextInt()` | An integer |
| `nextDouble()` | A decimal number |
| `next()` | One word |
| `nextLine()` | An entire line |

<!-- kind: activity -->
## Activity: Scanner Input
```java
import java.util.Scanner;

public class ScannerInputDemo {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);

        System.out.print("Enter your name: ");
        String name = input.nextLine();

        System.out.print("Enter your age: ");
        int age = input.nextInt();

        System.out.println("Hello, " + name + ". You are " + age + " years old.");
        input.close();
    }
}
```

<!-- kind: content -->
## Command-Line Arguments and Parsing
Values passed after the program name can be accessed through `args`. Since each command-line argument is a `String`, numeric input must be parsed.

Example run:

```text
java CommandLineDemo Ana 19 50.5
```

<!-- kind: activity -->
## Activity: Command-Line Argument Parsing
```java
public class CommandLineDemo {
    public static void main(String[] args) {
        String name = args[0];
        int age = Integer.parseInt(args[1]);
        double weight = Double.parseDouble(args[2]);

        System.out.println("Name: " + name);
        System.out.println("Age: " + age);
        System.out.println("Weight: " + weight);
    }
}
```

<!-- kind: content -->
## Dialog Box Input and Output
`JOptionPane` from `javax.swing` can show simple input and message dialog boxes.

Useful methods:

| Method | Purpose |
|---|---|
| `showInputDialog()` | Gets text input from the user |
| `showMessageDialog()` | Displays a message dialog |

Dialog message types include `ERROR_MESSAGE`, `INFORMATION_MESSAGE`, `WARNING_MESSAGE`, `QUESTION_MESSAGE`, and `PLAIN_MESSAGE`.

<!-- kind: activity -->
## Activity: Add Two Numbers with Dialog Boxes
```java
import javax.swing.JOptionPane;

public class DialogSumDemo {
    public static void main(String[] args) {
        String first = JOptionPane.showInputDialog("Enter first number:");
        String second = JOptionPane.showInputDialog("Enter second number:");

        int sum = Integer.parseInt(first) + Integer.parseInt(second);

        JOptionPane.showMessageDialog(
            null,
            "The sum is " + sum,
            "Result",
            JOptionPane.INFORMATION_MESSAGE
        );
    }
}
```

<!-- kind: content -->
## Control Flow Statements
Control flow statements decide which statements run, how often they run, and when execution should stop or jump.

| Category | Common statements |
|---|---|
| Decision | `if`, `else`, `switch` |
| Looping | `for`, `while`, `do-while` |
| Exception handling | `try`, `catch`, `finally`, `throw` |
| Flow change | `break`, `continue`, `return` |

<!-- kind: content -->
## If, Else, and Else If
An `if` statement runs code only when a condition is true. An `else` block runs when the condition is false. An `else if` chain checks multiple conditions in order.

```java
if (score >= 90) {
    grade = 'A';
} else if (score >= 80) {
    grade = 'B';
} else if (score >= 70) {
    grade = 'C';
} else {
    grade = 'D';
}
```

<!-- kind: content -->
## Switch Statement
A `switch` statement chooses a block of code based on a single expression. It is useful when comparing one value against several exact choices.

```java
switch (month) {
    case 1:
        System.out.println("January");
        break;
    case 2:
        System.out.println("February");
        break;
    default:
        System.out.println("Invalid month");
}
```

Use `break` to stop execution from falling into the next case.

<!-- kind: content -->
## Loop Statements
Loops repeat code while a condition is true.

| Loop | Best use |
|---|---|
| `for` | When the number of repetitions is known |
| `while` | When repetition depends on a condition checked before each run |
| `do-while` | When the loop body should run at least once |

```java
for (int i = 1; i <= 5; i++) {
    System.out.println(i);
}
```

```java
int i = 1;
while (i <= 5) {
    System.out.println(i);
    i++;
}
```

```java
int i = 1;
do {
    System.out.println(i);
    i++;
} while (i <= 5);
```

<!-- kind: content -->
## Break, Continue, and Nested Loops
`break` immediately exits a loop. `continue` skips the remaining statements in the current iteration and proceeds to the next iteration.

Nested loops are loops placed inside other loops. They are useful for tables, patterns, and grid-like output.

<!-- kind: activity -->
## Activity: Nested Loop Pattern
Write a program that prints:

```text
1
12
123
1234
12345
```

Sample solution:

```java
public class NumberPattern {
    public static void main(String[] args) {
        for (int row = 1; row <= 5; row++) {
            for (int col = 1; col <= row; col++) {
                System.out.print(col);
            }
            System.out.println();
        }
    }
}
```

<!-- kind: activity -->
## Laboratory Exercises
1. Create a program that reads two numbers and displays the larger number.
2. Create a program that reads a score and displays the equivalent letter grade.
3. Create a program that reads a month number and prints the month name using `switch`.
4. Create a program that uses a loop to display numbers from 1 to 100, but stops when it reaches a chosen limit.
5. Use nested loops to create at least two text patterns.
