# Database and JDBC
<!-- subject: Object-Oriented Programming with Java | year: 2nd -->

<!-- kind: content -->
## Lesson Overview
This lesson introduces databases, SQL, and Java Database Connectivity (JDBC). It covers creating databases and tables, connecting Java programs to a database, and performing basic CRUD operations.

<!-- kind: content -->
## What Is a Database?
A database is an organized collection of data stored so it can be searched, updated, and managed efficiently. A database management system (DBMS) controls access to the database.

Many relational databases use SQL, which stands for Structured Query Language.

<!-- kind: content -->
## What Is JDBC?
JDBC stands for Java Database Connectivity. It is a Java API that allows Java programs to connect to databases, run SQL statements, and process results.

Common JDBC tasks include:

1. Connect to a database.
2. Create a SQL statement or prepared statement.
3. Execute a query or update.
4. Read returned records.
5. Insert, update, or delete data.
6. Close database resources.

<!-- kind: content -->
## Basic JDBC Workflow
A typical JDBC program follows this structure:

```java
Connection connection = DriverManager.getConnection(url, user, password);
Statement statement = connection.createStatement();
ResultSet result = statement.executeQuery("SELECT * FROM students");
```

Important JDBC classes and interfaces:

| JDBC item | Purpose |
|---|---|
| `DriverManager` | Creates a connection to the database |
| `Connection` | Represents the active database connection |
| `Statement` | Runs SQL statements |
| `PreparedStatement` | Runs SQL with placeholders; safer for user input |
| `ResultSet` | Holds query results |
| `SQLException` | Represents database-related errors |

<!-- kind: content -->
## SQL Basics
SQL statements are used to create and manage data.

Common SQL commands:

| Command | Purpose |
|---|---|
| `CREATE DATABASE` | Creates a new database |
| `DROP DATABASE` | Deletes a database |
| `CREATE TABLE` | Creates a table |
| `DROP TABLE` | Deletes a table |
| `INSERT INTO` | Adds records |
| `SELECT` | Retrieves records |
| `UPDATE` | Changes existing records |
| `DELETE FROM` | Deletes records |

<!-- kind: activity -->
## Activity: SQL Syntax Examples
```sql
CREATE DATABASE school_db;
```

```sql
CREATE TABLE students (
    id INT PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    age INT
);
```

```sql
INSERT INTO students (id, first_name, last_name, age)
VALUES (1, 'Ana', 'Santos', 19);
```

```sql
SELECT * FROM students;
```

```sql
UPDATE students
SET age = 20
WHERE id = 1;
```

```sql
DELETE FROM students
WHERE id = 1;
```

<!-- kind: content -->
## Connecting Java to a Database
The exact connection string depends on the database and driver being used. For MySQL, the connection string usually follows this pattern:

```text
jdbc:mysql://localhost:3306/database_name
```

Before running a JDBC program, make sure the database server is running and the correct JDBC driver is included in the project.

<!-- kind: activity -->
## Activity: JDBC Connection Template
```java
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class ConnectDemo {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/school_db";
        String user = "root";
        String password = "";

        try (Connection connection = DriverManager.getConnection(url, user, password)) {
            System.out.println("Connected successfully.");
        } catch (SQLException error) {
            System.out.println("Connection failed: " + error.getMessage());
        }
    }
}
```

<!-- kind: activity -->
## Activity: Insert Record with PreparedStatement
```java
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class InsertStudentDemo {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/school_db";
        String user = "root";
        String password = "";

        String sql = "INSERT INTO students (id, first_name, last_name, age) VALUES (?, ?, ?, ?)";

        try (Connection connection = DriverManager.getConnection(url, user, password);
             PreparedStatement statement = connection.prepareStatement(sql)) {

            statement.setInt(1, 1);
            statement.setString(2, "Ana");
            statement.setString(3, "Santos");
            statement.setInt(4, 19);

            int rows = statement.executeUpdate();
            System.out.println(rows + " record inserted.");
        } catch (SQLException error) {
            System.out.println("Insert failed: " + error.getMessage());
        }
    }
}
```

<!-- kind: activity -->
## Activity: Read Records
```java
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

public class SelectStudentDemo {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/school_db";
        String user = "root";
        String password = "";

        String sql = "SELECT id, first_name, last_name, age FROM students";

        try (Connection connection = DriverManager.getConnection(url, user, password);
             Statement statement = connection.createStatement();
             ResultSet result = statement.executeQuery(sql)) {

            while (result.next()) {
                System.out.println(
                    result.getInt("id") + " - " +
                    result.getString("first_name") + " " +
                    result.getString("last_name") + ", age " +
                    result.getInt("age")
                );
            }
        } catch (SQLException error) {
            System.out.println("Query failed: " + error.getMessage());
        }
    }
}
```

<!-- kind: activity -->
## Activity: Update Record
```java
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class UpdateStudentDemo {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/school_db";
        String user = "root";
        String password = "";

        String sql = "UPDATE students SET age = ? WHERE id = ?";

        try (Connection connection = DriverManager.getConnection(url, user, password);
             PreparedStatement statement = connection.prepareStatement(sql)) {

            statement.setInt(1, 20);
            statement.setInt(2, 1);

            int rows = statement.executeUpdate();
            System.out.println(rows + " record updated.");
        } catch (SQLException error) {
            System.out.println("Update failed: " + error.getMessage());
        }
    }
}
```

<!-- kind: activity -->
## Activity: Delete Record
```java
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class DeleteStudentDemo {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/school_db";
        String user = "root";
        String password = "";

        String sql = "DELETE FROM students WHERE id = ?";

        try (Connection connection = DriverManager.getConnection(url, user, password);
             PreparedStatement statement = connection.prepareStatement(sql)) {

            statement.setInt(1, 1);

            int rows = statement.executeUpdate();
            System.out.println(rows + " record deleted.");
        } catch (SQLException error) {
            System.out.println("Delete failed: " + error.getMessage());
        }
    }
}
```

<!-- kind: content -->
## Notes on Safe Database Programming
For user input, prefer `PreparedStatement` instead of building SQL by concatenating strings. Prepared statements reduce errors and help prevent SQL injection.

Always close database resources. The examples above use `try-with-resources`, which closes resources automatically.

<!-- kind: activity -->
## Laboratory Exercise
Create a small sales database program.

Required table fields:

- product or employee ID
- name
- first quarter sales
- second quarter sales
- third quarter sales
- fourth quarter sales
- total sales

Program requirements:

1. Add a new record.
2. Search for an existing record by ID.
3. If the record exists, ask whether to update or delete it.
4. Compute total sales from the four quarterly sales values.
5. Display all records in a readable format.
