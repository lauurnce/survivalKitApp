# Constructors and Constructor Overloading
<!-- subject: Object-Oriented Programming with Java | year: 2nd -->

<!-- kind: content -->
## Lesson Overview
This lesson explains constructors, default values, constructors with arguments, multiple constructor arguments, and constructor overloading.

<!-- kind: content -->
## What Is a Constructor?
A constructor is a special method-like block that runs when an object is created. Java calls it automatically when `new` is used.

When `new` creates an object, Java normally:

1. Allocates memory for the object.
2. Assigns default values to fields.
3. Calls the matching constructor.

Default field values include:

| Field type | Default value |
|---|---|
| numeric types | `0` or `0.0` |
| object references | `null` |
| `boolean` | `false` |
| `char` | `\u0000` |

A constructor must have the same name as the class and cannot have a return type.

<!-- kind: content -->
## No-Argument Constructor
A no-argument constructor accepts no values. It is often used to set initial field values.

<!-- kind: activity -->
## Activity: Constructor with Initial Values
Create `Employee.java`:

```java
public class Employee {
    private String lastName;
    private String firstName;
    private String job;
    private int age;

    public Employee() {
        lastName = "Rivera";
        firstName = "Alex";
        job = "Teacher";
        age = 35;
    }

    public String getLastName() {
        return lastName;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getJob() {
        return job;
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

        System.out.println("Name: " + employee.getLastName() + ", " + employee.getFirstName());
        System.out.println("Age: " + employee.getAge());
        System.out.println("Job: " + employee.getJob());
    }
}
```

<!-- kind: content -->
## Constructor with One Argument
A constructor can receive a value when an object is created.

```java
EmployeeId record = new EmployeeId(2470);
```

The value inside the parentheses is passed to the constructor.

<!-- kind: activity -->
## Activity: Constructor with One Argument
```java
public class EmployeeId {
    private int id;

    public EmployeeId(int employeeId) {
        id = employeeId;
    }

    public int getId() {
        return id;
    }
}
```

```java
public class EmployeeIdTest {
    public static void main(String[] args) {
        EmployeeId one = new EmployeeId(2470);
        EmployeeId two = new EmployeeId(2113);

        System.out.println("Employee ID: " + one.getId());
        System.out.println("Employee ID: " + two.getId());
    }
}
```

<!-- kind: content -->
## Constructor with Multiple Arguments
Constructors can receive several values separated by commas. The order and type of arguments must match the constructor parameters.

<!-- kind: activity -->
## Activity: Constructor with Multiple Arguments
```java
public class EmployeeRecord {
    private int id;
    private int age;
    private String department;

    public EmployeeRecord(int idNumber, int employeeAge, String dept) {
        id = idNumber;
        age = employeeAge;
        department = dept;
    }

    public int getId() {
        return id;
    }

    public int getAge() {
        return age;
    }

    public String getDepartment() {
        return department;
    }
}
```

```java
public class EmployeeRecordTest {
    public static void main(String[] args) {
        EmployeeRecord employee = new EmployeeRecord(1234, 25, "Payroll");

        System.out.println("Employee ID: " + employee.getId());
        System.out.println("Age: " + employee.getAge());
        System.out.println("Department: " + employee.getDepartment());
    }
}
```

<!-- kind: content -->
## Constructor Overloading
Constructor overloading means writing multiple constructors in the same class with different parameter lists.

If you write a constructor with parameters, Java no longer automatically provides the no-argument constructor. Add your own no-argument constructor if you still need one.

<!-- kind: activity -->
## Activity: Overloaded Constructors
```java
public class CourseRecord {
    private int studentNumber;
    private int age;
    private String course;

    public CourseRecord() {
        studentNumber = 999;
        age = 17;
        course = "Undeclared";
    }

    public CourseRecord(int number) {
        studentNumber = number;
    }

    public CourseRecord(int number, int studentAge) {
        studentNumber = number;
        age = studentAge;
    }

    public CourseRecord(int number, int studentAge, String studentCourse) {
        studentNumber = number;
        age = studentAge;
        course = studentCourse;
    }

    public int getStudentNumber() {
        return studentNumber;
    }

    public int getAge() {
        return age;
    }

    public String getCourse() {
        return course;
    }
}
```

```java
public class CourseRecordTest {
    public static void main(String[] args) {
        CourseRecord a = new CourseRecord();
        CourseRecord b = new CourseRecord(2470);
        CourseRecord c = new CourseRecord(2470, 33);
        CourseRecord d = new CourseRecord(2113, 25, "BSIT");

        display(a);
        display(b);
        display(c);
        display(d);
    }

    public static void display(CourseRecord record) {
        System.out.println("Student number: " + record.getStudentNumber());
        System.out.println("Age: " + record.getAge());
        System.out.println("Course: " + record.getCourse());
        System.out.println();
    }
}
```

<!-- kind: activity -->
## Laboratory Exercises
1. Create a `Circle` class with radius, area, and diameter fields. Add a constructor that sets the radius to `1`. Add methods to set/get radius, compute diameter, and compute area. Create `TestCircle` with three circle objects. Set two radius values manually and leave the third object using the constructor value.
2. Create a `House` class with fields for number of occupants and annual income. Add setters and getters. Add three constructors: no arguments, one integer argument for occupants, and two arguments for occupants and income. Create `HouseTest` to verify each constructor.
