# Methods
<!-- subject: Object-Oriented Programming with Java | year: 2nd -->

<!-- kind: content -->
## Lesson Overview
This lesson explains how to define and call methods, pass arguments, return values, pass arrays, and overload methods.

<!-- kind: content -->
## What Is a Method?
A method is a named block of code that performs a specific task. In procedural languages, similar blocks may be called procedures, functions, or subroutines. In Java, they are called methods.

Methods help make programs easier to read, test, and reuse.

<!-- kind: content -->
## Parts of a Method Header
A method header usually contains:

| Part | Example | Meaning |
|---|---|---|
| Access modifier | `public` | Controls visibility |
| `static` optional keyword | `static` | Allows the method to belong to the class rather than an object |
| Return type | `void`, `int`, `double` | Type of value returned by the method |
| Method name | `greet` | Identifier used to call the method |
| Parameter list | `(int number)` | Values the method can receive |

Example:

```java
public static void greet() {
    System.out.println("Welcome!");
}
```

<!-- kind: activity -->
## Activity: Simple Method with No Argument and No Return Value
```java
public class SimpleMethodDemo {
    public static void main(String[] args) {
        greet();
    }

    public static void greet() {
        System.out.println("Greetings from a method!");
    }
}
```

<!-- kind: content -->
## Methods with Arguments
A method can receive values through parameters. The values sent during the method call are called arguments.

The number and type of arguments in the call must match the method's parameter list.

<!-- kind: activity -->
## Activity: Method with One Argument
```java
public class SquareDemo {
    public static void main(String[] args) {
        square(20);
        int value = 30;
        square(value);
    }

    public static void square(int number) {
        System.out.println("The square of " + number + " is " + (number * number));
    }
}
```

<!-- kind: activity -->
## Activity: Method with Multiple Arguments
```java
public class ComputeDemo {
    public static void main(String[] args) {
        compute(1, 5);
        compute(2, 5);
        compute(3, 5);
    }

    public static void compute(int option, int value) {
        if (option == 1) {
            System.out.println("Square: " + (value * value));
        } else if (option == 2) {
            System.out.println("Cube: " + (value * value * value));
        } else {
            System.out.println("Value: " + value);
        }
    }
}
```

<!-- kind: content -->
## Methods That Return Values
A method can send a value back to the statement that called it. The method's return type must match the returned value.

```java
public static int square(int x) {
    return x * x;
}
```

A `void` method does not return a value.

<!-- kind: activity -->
## Activity: Method That Returns a Value
```java
public class ReturnValueDemo {
    public static void main(String[] args) {
        int result = isOdd(5);

        if (result == 1) {
            System.out.println("The number is odd.");
        } else {
            System.out.println("The number is even.");
        }
    }

    public static int isOdd(int number) {
        if (number % 2 == 0) {
            return 0;
        }
        return 1;
    }
}
```

<!-- kind: content -->
## Calling Class Methods from Another Class
A `static` method belongs to a class. It can be called inside its own class using its name, or from another class using the class name followed by a dot.

```java
Utility.greet();
```

The class containing the method must be compiled and available to the other class.

<!-- kind: activity -->
## Activity: Calling a Method from Another Class
Create `Utility.java`:

```java
public class Utility {
    public static void greet() {
        System.out.println("Hello from Utility!");
    }
}
```

Create `UseUtility.java`:

```java
public class UseUtility {
    public static void main(String[] args) {
        Utility.greet();
    }
}
```

Compile both files, then run `UseUtility`.

<!-- kind: content -->
## Passing Arrays to Methods
An entire array can be passed to a method by using the array name without brackets.

When an array is passed to a method, the method receives access to the same array object. Changes made to the array elements inside the method affect the original array.

<!-- kind: activity -->
## Activity: Pass an Array to a Method
```java
public class ArrayMethodDemo {
    public static void main(String[] args) {
        int[] values = {1, 2, 3, 4};

        System.out.println("Before method call:");
        printArray(values);

        increaseAll(values);

        System.out.println("After method call:");
        printArray(values);
    }

    public static void increaseAll(int[] data) {
        for (int i = 0; i < data.length; i++) {
            data[i]++;
        }
    }

    public static void printArray(int[] data) {
        for (int value : data) {
            System.out.print(value + " ");
        }
        System.out.println();
    }
}
```

<!-- kind: content -->
## Method Overloading
Method overloading means creating multiple methods with the same name but different parameter lists. The compiler chooses which method to run based on the arguments used.

Methods can differ by:

- number of parameters
- parameter types
- parameter order

Return type alone is not enough to overload a method.

<!-- kind: activity -->
## Activity: Overloaded Methods
```java
public class OverloadDemo {
    public static void main(String[] args) {
        greet();
        greet(3);
        double doubled = greet(6.0);
        System.out.println(doubled);
    }

    public static void greet() {
        System.out.println("Hello!");
    }

    public static void greet(int times) {
        for (int i = 1; i <= times; i++) {
            System.out.println("Hello #" + i);
        }
    }

    public static double greet(double value) {
        return value + value;
    }
}
```

<!-- kind: activity -->
## Practice Exercises
Write the proper method declaration or method call for each item.

1. A method named `CS` that accepts no value and returns no value.
2. A call to `CS`.
3. A method named `IT` that accepts no value and returns an `int`.
4. A call to `IT` that stores the returned value in a variable.
5. A method named `CSIT` that accepts an `int` and returns a `char`.
6. A method named `CCMIT` that accepts two integers and returns a `double`.
7. A method named `passArray` that accepts an integer array and returns no value.
8. A call to `passArray` using an array named `x`.
9. A method named `max` that accepts two integers and returns an integer.
10. A method named `test` that accepts an integer and returns a boolean.

<!-- kind: activity -->
## Laboratory Exercises
1. Create a class with two integer variables. Write `sum()` and `difference()` methods that accept the values and display results. Add a `product()` method that returns the product to `main()` for display.
2. Create a program with an integer array of 10 values. Write `lowest()` and `highest()` methods that accept the array and return the lowest and highest values without sorting.
3. Create a class named `Commission` with overloaded `computeCommission()` methods. One method should accept sales and rate as doubles. Another should accept sales as a double and commission rate as an integer percentage.
