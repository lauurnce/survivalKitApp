# Classes and Objects
<!-- subject: Object-Oriented Programming with Java | year: 2nd -->

<!-- kind: content -->
## Lesson Overview
This lesson explains classes, objects, instance variables, instance methods, object declaration, object creation, and the difference between instance and class members.

<!-- kind: content -->
## What Is a Class?
A class is a blueprint for creating objects. It describes what data an object can store and what actions it can perform.

For example, a `Phone` class might describe data such as brand, model, and screen size, and behavior such as power on, call, and send message.

<!-- kind: content -->
## What Is an Object?
An object is a specific instance of a class. If `Phone` is the class, then a specific phone model owned by a person can be represented as an object.

Objects usually have:

- **state**: values stored in variables
- **behavior**: actions implemented as methods

Software objects are modeled after real-world objects by combining data and behavior.

<!-- kind: content -->
## Creating a Class
A class header includes an optional access modifier, the keyword `class`, and the class name.

```java
public class Student {
    // fields and methods go here
}
```

Fields are variables that belong to the class or object.

```java
public class Student {
    int age = 18;
}
```

<!-- kind: content -->
## Access Modifiers and Information Hiding
Fields are often marked `private` so other classes cannot change them directly. This protects object data and encourages controlled access through methods.

Common modifiers:

| Modifier | Meaning |
|---|---|
| `public` | Accessible from other classes |
| `private` | Accessible only inside the same class |
| `protected` | Accessible in the same package or subclasses |
| no modifier | Package-level access |
| `static` | Belongs to the class rather than one object |
| `final` | Cannot be changed after assignment |

<!-- kind: content -->
## Instance Methods
Instance methods belong to objects. They are usually called after creating an object with `new`.

Setter methods store values. Getter methods return values.

<!-- kind: activity -->
## Activity: Student Class with Instance Methods
Create `Student.java`:

```java
public class Student {
    private int age = 18;

    public void setAge(int newAge) {
        age = newAge;
    }

    public int getAge() {
        return age;
    }
}
```

Create `StudentTest.java`:

```java
public class StudentTest {
    public static void main(String[] args) {
        Student learner = new Student();

        System.out.println("Before: age is " + learner.getAge());
        learner.setAge(19);
        System.out.println("After: age is " + learner.getAge());
    }
}
```

<!-- kind: content -->
## Declaring and Creating Objects
Declaring a variable of a class type does not create an object yet.

```java
Student learner;          // declaration only
learner = new Student();  // object creation
```

Both steps can be combined.

```java
Student learner = new Student();
```

The `new` operator reserves memory and calls a constructor.

<!-- kind: activity -->
## Activity: Class with Multiple Fields
Create `Employee.java`:

```java
public class Employee {
    private String lastName;
    private String firstName;
    private String job;
    private int age;

    public void setLastName(String value) {
        lastName = value;
    }

    public String getLastName() {
        return lastName;
    }

    public void setFirstName(String value) {
        firstName = value;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setJob(String value) {
        job = value;
    }

    public String getJob() {
        return job;
    }

    public void setAge(int value) {
        age = value;
    }

    public int getAge() {
        return age;
    }
}
```

Create `EmployeeTest.java`:

```java
public class EmployeeTest {
    public static void main(String[] args) {
        Employee employee = new Employee();

        employee.setLastName("Santos");
        employee.setFirstName("Mia");
        employee.setAge(27);
        employee.setJob("Developer");

        System.out.println("Name: " + employee.getLastName() + ", " + employee.getFirstName());
        System.out.println("Age: " + employee.getAge());
        System.out.println("Job: " + employee.getJob());
    }
}
```

<!-- kind: content -->
## Instance Members and Static Members
An instance variable belongs to one object. Each object gets its own copy.

A `static` variable belongs to the class. All objects share the same static variable.

```java
public class SchoolRecord {
    static int schoolCode = 100;
    int studentNumber;
}
```

If one object changes a static variable, all objects see the updated value.

<!-- kind: activity -->
## Activity: Static Variable Demonstration
```java
public class Record {
    static int code = 357;
    int number;

    public void setNumber(int value) {
        number = value;
    }

    public int getNumber() {
        return number;
    }

    public void setCode(int value) {
        code = value;
    }

    public int getCode() {
        return code;
    }
}
```

```java
public class RecordTest {
    public static void main(String[] args) {
        Record a = new Record();
        Record b = new Record();

        System.out.println(a.getCode());
        b.setCode(999);
        System.out.println(a.getCode());
    }
}
```

<!-- kind: activity -->
## Laboratory Exercises
1. Create a `Pizza` class with fields for topping, diameter, and price. Add setter and getter methods. Create `TestPizza` to instantiate and display one pizza object.
2. Create a program that displays employee IDs with first and last names. Use one class for employee data and another class for creating and displaying employee objects.
3. Create a `Circle` class with fields for radius, diameter, and area. Add methods to set/get radius, compute diameter, and compute area. Create `TestCircle` that creates three circle objects and displays their computed values.
