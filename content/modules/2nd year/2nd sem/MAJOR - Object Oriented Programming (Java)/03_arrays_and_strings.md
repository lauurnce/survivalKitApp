# Arrays and Strings
<!-- subject: Object-Oriented Programming with Java | year: 2nd -->

<!-- kind: content -->
## Lesson Overview
This lesson introduces arrays, strings, common string methods, number parsing, and arrays of strings.

<!-- kind: content -->
## Arrays
An array stores multiple values of the same data type under one variable name. Each value is accessed by an index. Java array indexes start at `0`.

Example declaration:

```java
int[] scores = new int[5];
```

This creates an integer array with five elements: `scores[0]` through `scores[4]`.

Alternative syntax:

```java
int scores[] = new int[5];
```

Both forms work, but `int[] scores` is commonly preferred because it makes the type clearer.

<!-- kind: content -->
## Assigning and Initializing Array Values
Values can be assigned one at a time.

```java
scores[0] = 90;
scores[1] = 85;
scores[2] = 92;
scores[3] = 88;
scores[4] = 95;
```

An array can also be initialized immediately.

```java
int[] scores = {90, 85, 92, 88, 95};
```

Do not place an explicit size when using an initializer list. Java counts the elements automatically.

<!-- kind: activity -->
## Activity: Print Array Values
```java
public class ArrayPrintDemo {
    public static void main(String[] args) {
        int[] numbers = {2, 4, 70, 33, 3};

        System.out.println("Array contents:");
        for (int i = 0; i < numbers.length; i++) {
            System.out.println("numbers[" + i + "] = " + numbers[i]);
        }
    }
}
```

<!-- kind: content -->
## Strings
`String` is a Java class used to store text. It is available automatically through the `java.lang` package.

A string can be created using a constructor:

```java
String greeting = new String("Hello");
```

Most Java code uses the shorter literal form:

```java
String greeting = "Hello";
```

Strings can be reassigned:

```java
greeting = "Hi";
```

They can also be combined using concatenation:

```java
String message = greeting + ", learner!";
```

When at least one side of `+` is a string, Java usually converts the other value to text and joins them.

<!-- kind: activity -->
## Activity: String Assignment and Concatenation
```java
public class StringDemo {
    public static void main(String[] args) {
        String text = "Hi";
        System.out.println(text);

        text = "Hello";
        text = text + ", Java!";
        System.out.println(text);
    }
}
```

<!-- kind: content -->
## Common String Methods
| Method | Purpose |
|---|---|
| `equals()` | Compares two strings exactly |
| `equalsIgnoreCase()` | Compares strings without considering uppercase/lowercase differences |
| `toUpperCase()` | Converts text to uppercase |
| `toLowerCase()` | Converts text to lowercase |
| `indexOf()` | Finds the first index of a character or substring; returns `-1` if not found |
| `replace()` | Replaces matching characters or text |

<!-- kind: activity -->
## Activity: String Method Practice
```java
public class StringMethodDemo {
    public static void main(String[] args) {
        String name = "Kira";
        String input = "kira";

        System.out.println(name.equals(input));           // false
        System.out.println(name.equalsIgnoreCase(input)); // true
        System.out.println(name.toUpperCase());           // KIRA
        System.out.println(name.indexOf('r'));            // 2
        System.out.println(name.replace('K', 'M'));       // Mira
    }
}
```

<!-- kind: content -->
## Converting Strings to Numbers
If a string contains numeric characters, it can be converted into a numeric type.

```java
String value = "2470";
int number = Integer.parseInt(value);
number++;
System.out.println(number); // 2471
```

Use the correct parsing method for the target type:

| Target type | Method |
|---|---|
| `int` | `Integer.parseInt(text)` |
| `double` | `Double.parseDouble(text)` |
| `long` | `Long.parseLong(text)` |

<!-- kind: content -->
## Arrays of Strings
An array can store strings just like it can store numbers.

```java
String[] names = new String[4];
names[0] = "Ana";
names[1] = "Ben";
names[2] = "Cia";
names[3] = "Dan";
```

It can also be initialized in one line:

```java
String[] names = {"Ana", "Ben", "Cia", "Dan"};
```

<!-- kind: activity -->
## Activity: Print an Array of Strings
```java
public class StringArrayDemo {
    public static void main(String[] args) {
        String[] heroes = {"Atlas", "Nova", "Blaze", "Echo"};

        System.out.println("Team members:");
        for (int i = 0; i < heroes.length; i++) {
            System.out.println(heroes[i]);
        }
    }
}
```

<!-- kind: activity -->
## Practice Exercises
Write Java statements for the following:

1. Declare an integer array named `numbers` with 10 elements.
2. Declare an integer array named `evenNumbers` with initial values `2, 4, 6, 8, 10`.
3. Store `10` in the first element of `numbers`.
4. Declare a `String` array named `characters` with 4 elements.
5. Store a name in the first element of `characters`.
6. Declare a `String` array named `team` with three names.
7. Display the first value of `team`.
8. Use a loop to display all values of `numbers`.
9. Increase every value of `numbers` by `1`, then display the updated values.

<!-- kind: activity -->
## Laboratory Exercises
Given this integer array:

```java
int[] n = {33, 2, 70, 4, 52, 42, 8, 35, 9, 211};
```

Create separate programs that:

1. Separate odd and even numbers.
2. Display the highest number without sorting.
3. Display the lowest number without sorting.
4. Sort the values in ascending order.

Each program should first display the original array before showing the result.
