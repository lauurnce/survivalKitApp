-- ============================================================
-- Information Management, Modules & Sections
-- Subject ID: 20000000-0002-0002-0001-000000000003
-- 2nd Year, Semester 2, major
-- 10 lessons. Split: S1+S2 = content (FREE); remaining teaching blocks
--   (S3, S4) + the Practice & Exam Drills activity = activity (PAID).
--   Each lesson -> 2 free / 3 paid.
-- Every drill has a SQL playground (ide_language=sql + starter_code), so the
--   drill is inserted via the 7-column form in its own INSERT statement.
-- Re-running is safe (DELETE clears prior rows for this subject first).
-- ============================================================

DELETE FROM modules WHERE subject_id = '20000000-0002-0002-0001-000000000003';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('9ae38391-0460-5ea5-a8f2-2401ab1b110e','20000000-0002-0002-0001-000000000003','Lesson 1: Introduction to Information Systems','lesson-1-introduction-to-information-systems',1),
  ('458c437f-cf15-591b-8a21-a0899a839158','20000000-0002-0002-0001-000000000003','Lesson 2: Data Modeling with ER Diagrams','lesson-2-data-modeling-with-er-diagrams',2),
  ('b0ace7f9-03ae-5c15-b397-b319d705bc24','20000000-0002-0002-0001-000000000003','Lesson 3: Relational Design and Normalization','lesson-3-relational-design-and-normalization',3),
  ('44be57f8-adf1-57d2-80cd-39d62aa91636','20000000-0002-0002-0001-000000000003','Lesson 4: SQL – Data Definition and Data Manipulation','lesson-4-sql-data-definition-and-data-manipulation',4),
  ('21829336-6581-56fb-866e-61c03652d346','20000000-0002-0002-0001-000000000003','Lesson 5: SQL Queries (SELECT, Joins, and Aggregates)','lesson-5-sql-queries-select-joins-and-aggregates',5),
  ('b3cfdb35-2b57-59c7-9388-4007215630eb','20000000-0002-0002-0001-000000000003','Lesson 6: Transactions and Concurrency Control','lesson-6-transactions-and-concurrency-control',6),
  ('40f4d906-7c40-5024-abb5-a5b883c02237','20000000-0002-0002-0001-000000000003','Lesson 7: Database Administration','lesson-7-database-administration',7),
  ('a7ecc400-acc1-5fb4-a3a0-2698e5f59bab','20000000-0002-0002-0001-000000000003','Lesson 8: Data Governance and Information Lifecycle','lesson-8-data-governance-and-information-lifecycle',8),
  ('bc4465f2-dd0f-515b-b0e3-6a55a7f04e11','20000000-0002-0002-0001-000000000003','Lesson 9: Data Warehousing and Business Intelligence','lesson-9-data-warehousing-and-business-intelligence',9),
  ('8886ec70-db30-591b-be11-4085b1169cfd','20000000-0002-0002-0001-000000000003','Lesson 10: Legal and Ethical Issues in Information Management','lesson-10-legal-and-ethical-issues-in-information-management',10);

-- ============================================================
-- LESSON 1: Introduction to Information Systems
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('9ae38391-0460-5ea5-a8f2-2401ab1b110e','content','What Are Data and Information?',$md$
Data are raw facts or figures (names, numbers, dates) stored in computers. When data are processed, organized, or analyzed, they become information – meaningful insights that help decision-making. For example, individual exam scores are data; a student's grade report is information. In organizations, managing information (the "how" and "why" of data use) is as important as storing the data itself. Good information management ensures that the right people get the right data at the right time.
$md$, 1),
('9ae38391-0460-5ea5-a8f2-2401ab1b110e','content','Information Systems in Organizations',$md$
An information system combines people, hardware, software, data, and procedures to collect, process, store, and distribute information. Key components include databases (for storing data), applications (for processing), networks (for communication), and users. For instance, a bank's information system includes the database of customer accounts, the teller and online apps to update balances, the network connecting branches, and the bank employees and customers using the system. In the Philippines, government agencies (NBI fingerprint database, PhilHealth records) and companies (banks, airlines, hospitals) rely on information systems to run operations smoothly. A database management system (DBMS) is the software that helps create, query, and maintain databases reliably.
$md$, 2),
('9ae38391-0460-5ea5-a8f2-2401ab1b110e','activity','Why Use a Database Management System (DBMS)?',$md$
Without a DBMS, organizations might store records in scattered files (spreadsheets, text files), which leads to data duplication and errors. A DBMS provides a centralized and consistent way to manage data. Advantages include: **multi-user access control** (so many people can read/write data at the same time), **data integrity** (constraints like primary key prevent duplicate records), and **security** (user accounts and permissions). For example, BIR's tax database uses a DBMS to prevent duplicate taxpayer IDs and to let many clerks update records at once. The DBMS also handles **backup and recovery**: if a computer crashes, the database can be restored from saved logs. Overall, databases make information reliable and easier to manage than disorganized files.
$md$, 3),
('9ae38391-0460-5ea5-a8f2-2401ab1b110e','activity','Data Models in Database Systems',$md$
A data model defines how data are logically stored and organized. Common data models include:

- **Hierarchical model** – data arranged in a tree (one parent, many children) like an organizational chart. (Used in old file systems and some government systems.)
- **Network model** – similar to hierarchical but allows many-to-many links (a student can be linked to many clubs, and clubs to many students).
- **Entity-Relationship (ER) model** – a conceptual diagram (ERD) using entities (things) and relationships (e.g. Student enrolls in Course).
- **Relational model** – data stored in tables (rows and columns). Each table has a primary key and relationships are managed through matching key fields (foreign keys). Modern systems (MySQL, SQL Server, Oracle) use the relational model.

In practice, most information management systems today use the relational model. Other models (hierarchical/network) are mostly legacy. As you learn SQL, you'll see how tables (relations) can represent entities and their relationships. By choosing an appropriate data model, system designers ensure the database reflects real-world business rules and allows efficient querying.

*Ready to apply this? The practice set below walks through exam-style problems with step-by-step solutions and a live coding playground.*
$md$, 4);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('9ae38391-0460-5ea5-a8f2-2401ab1b110e','activity','Practice & Exam Drills, Lesson 1',$md$
**Review Questions**

1. What is the difference between data and information? Give a local example.
2. Name the main components of an information system. Which component stores data?
3. List two advantages of using a DBMS over file storage.
4. What are the four basic data models (hierarchical, network, relational, ER)? Which one do most modern databases use?

**Worked Problems (Exam-Style)**

**[Concept]** Describe a scenario where a network data model might fit better than a hierarchical model.

*Solution Sketch:* Many-to-many relationships, e.g. Students and Clubs, where each student can join multiple clubs and each club has many students; the network model allows multiple parents.

**[Concept]** If a student's basic info (ID, name) is stored in a flat file on one computer, explain two problems that could occur without a DBMS.

*Solution:* Duplication if backups are scattered; inconsistency if changes are not propagated; no multi-user control; difficulty enforcing unique keys.

**[SQL Query]** Using the sample database in the playground, write a query to list all courses taken by "Juan dela Cruz" (by name, not ID).

*Solution:*
```sql
SELECT s.name AS student, c.course_name
FROM Enrollment e
JOIN Student s ON e.student_id = s.student_id
JOIN Course c ON e.course_id = c.course_id
WHERE s.name = 'Juan dela Cruz';
```
*Explanation:* We join Enrollment with Student and Course to match names and course titles.

**[Design]** A table repeats course names for each student. Normalize it by creating two tables.

*Solution:* Split into `Student(student_id, name)` and `Enrollment(enrollment_id, student_id, course_name)`, or better yet create a separate `Course` table and link via `course_id`. Ensure no repeating student names or courses.

**Hands-On Exercises** (run in the SQL playground)

1. List all students and their programs. (Hint: `SELECT * FROM Student;`)
2. Show the department names by joining Student and Department.
3. Insert a new course (e.g. `INSERT INTO Course VALUES (401, 'Database Admin', 3, 1);`) and then query all courses to see the result.

**How to Pass Info Systems Topics**

- Understand key terms by heart (DBMS, relational model, primary key, foreign key). Professors love definitions.
- Practice drawing simple ER diagrams and converting them to tables. Always label primary/foreign keys.
- Learn basic SQL commands (SELECT, JOIN, INSERT, UPDATE) fluently, since many exam questions involve writing or analyzing them.
- Avoid mixing up terms: e.g., know that a table is a relation, and a column is a field. Use full SQL syntax (capitalize keywords for clarity).
$md$, 5, 'sql', $code$-- Sample database for Information Management hands-on exercises
CREATE TABLE Department (
    dept_id INT PRIMARY KEY,
    dept_name VARCHAR(100)
);

CREATE TABLE Student (
    student_id INT PRIMARY KEY,
    name VARCHAR(50),
    program VARCHAR(50),
    year INT,
    dept_id INT REFERENCES Department(dept_id)
);

CREATE TABLE Course (
    course_id INT PRIMARY KEY,
    course_name VARCHAR(100),
    credits INT,
    dept_id INT REFERENCES Department(dept_id)
);

CREATE TABLE Enrollment (
    enrollment_id INT PRIMARY KEY,
    student_id INT REFERENCES Student(student_id),
    course_id INT REFERENCES Course(course_id),
    semester VARCHAR(10),
    year INT,
    grade CHAR(2)
);

INSERT INTO Department VALUES
(1, 'Computer Science'),
(2, 'Information Technology'),
(3, 'Mathematics');

INSERT INTO Student VALUES
(1, 'Juan dela Cruz', 'BSIT', 3, 2),
(2, 'Maria Santos', 'BSCS', 2, 1),
(3, 'Jose Rizal', 'BSCS', 4, 1),
(4, 'Anna Reyes', 'BSIT', 2, 2);

INSERT INTO Course VALUES
(101, 'Database Systems', 3, 1),
(102, 'Web Programming', 3, 1),
(201, 'Network Security', 3, 2),
(202, 'Systems Analysis', 3, 2),
(301, 'Algorithms', 3, 1);

INSERT INTO Enrollment VALUES
(1001, 1, 101, 'First', 2026, 'B'),
(1002, 1, 201, 'First', 2026, 'A'),
(1003, 2, 101, 'First', 2026, 'C'),
(1004, 2, 301, 'First', 2026, 'B'),
(1005, 3, 101, 'First', 2026, 'A'),
(1006, 3, 202, 'First', 2026, 'A'),
(1007, 4, 102, 'First', 2026, 'B'),
(1008, 4, 201, 'First', 2026, 'A');$code$);

-- ============================================================
-- LESSON 2: Data Modeling with ER Diagrams
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('458c437f-cf15-591b-8a21-a0899a839158','content','Conceptual Data Modeling',$md$
Data modeling is the process of defining how real-world entities (people, places, things) and their relationships are represented in a database. The goal is to create a conceptual blueprint of the data. At this level, we identify **entities** (for example, Student, Course, Instructor), **attributes** of those entities (a student's name, ID, program), and **relationships** between entities (a student enrolls in a course). We use diagrams to map out these ideas before writing any SQL. A conceptual model is independent of the database system – it focuses on business rules (e.g. each student can enroll in many courses).
$md$, 1),
('458c437f-cf15-591b-8a21-a0899a839158','content','Entity-Relationship Diagrams (ERD)',$md$
An Entity-Relationship Diagram (ERD) visually shows entities as boxes and relationships as lines (often with diamonds). Attributes are listed in or near the entity boxes, with a **primary key** underlined (it uniquely identifies each entity). **Cardinality** (one-to-one, one-to-many, many-to-many) is marked on relationship lines. For example, in a school database, Student and Course might be entities, and the relationship "enrolls in" connects them. Each course can have many students (one-to-many) and each student can take many courses (so the relationship is many-to-many, usually implemented via an Enrollment table).

A typical ERD for this would model three tables:

- **STUDENT**, `student_id` (PK), `name`, `program`, `year`
- **ENROLLMENT**, `enrollment_id` (PK), `student_id` (FK), `course_id` (FK), `semester`, `year`, `grade`
- **COURSE**, `course_id` (PK), `course_name`, `credits`

A student can enroll in many courses, and each course can have many students; the ENROLLMENT table breaks the many-to-many relationship into two one-to-many links.
$md$, 2),
('458c437f-cf15-591b-8a21-a0899a839158','activity','Converting ERD to Relational Schema',$md$
After drawing an ERD, we translate it into tables (relational schema). Each entity becomes a table, and each relationship is handled via keys. In the example above, we created tables `Student`, `Course`, and a junction table `Enrollment` with foreign keys referencing both. For one-to-many relationships, the many-side table simply has a foreign key to the one-side table. For many-to-many, we introduce an extra table (as shown) to break it into two one-to-many relationships. This ensures no duplicate data. The attributes of each entity become columns in that table.
$md$, 3),
('458c437f-cf15-591b-8a21-a0899a839158','activity','Keys and Constraints',$md$
In the relational model, a **primary key** uniquely identifies each record in a table (e.g. `student_id` in Student). A **foreign key** is a column in one table that refers to a primary key in another table, enforcing relationships (e.g. `course_id` in Enrollment refers to `Course(course_id)`). By defining keys, the database ensures that data stays consistent: you cannot enroll a student in a course that doesn't exist (the foreign key will fail). Other constraints include **NOT NULL** (a column must have a value) and **UNIQUE** (values must be distinct). Properly setting keys and constraints is crucial for reliable data models.

*Ready to apply this? The practice set below walks through exam-style problems with step-by-step solutions and a live coding playground.*
$md$, 4);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('458c437f-cf15-591b-8a21-a0899a839158','activity','Practice & Exam Drills, Lesson 2',$md$
**Review Questions**

1. Define an entity and a relationship in data modeling. Give an example of each.
2. What does it mean when a relationship is many-to-many? How is that implemented in a relational database?
3. What is the difference between a primary key and a foreign key?

**Worked Problems (Exam-Style)**

**[ERD Design]** A bookstore keeps track of Books and Authors. Each book can have multiple authors, and each author can write multiple books. Draw an ER diagram for this situation.

*Solution:* Entities: BOOK, AUTHOR; relationship WRITES; cardinality many-to-many, implemented via a BOOK_AUTHOR table with foreign keys to both.

**[Translation]** Given the ERD: STUDENT —(enrolls)— COURSE (many-to-many). Write the CREATE TABLE statements for the relational schema (Student, Course, Enrollment) including primary/foreign keys.

*Solution:* `CREATE TABLE Student(student_id PRIMARY KEY, name, ...);` `Course(course_id PRIMARY KEY, ...);` `Enrollment(enrollment_id PRIMARY KEY, student_id, course_id, ... FOREIGN KEY references Student, FOREIGN KEY references Course)`.

**[Identification]** Consider a table that stores student grades in an exam (columns: ExamID, StudentID, StudentName, Score):

| ExamID | StudentID | StudentName | Score |
|--------|-----------|-------------|-------|
| 2001 | 1 | Juan Cruz | 85 |
| 2001 | 2 | Maria Santos | 90 |

Identify the flaw in this design. How would you fix it?

*Solution:* Redundancy, StudentName repeats for each Exam. Fix by separating STUDENT into its own table (StudentID, StudentName), and have the grade table reference StudentID only.

**Hands-On Exercises** (using the SQL playground)

1. Create a new table `Professor(prof_id INT PRIMARY KEY, name VARCHAR(50), dept_id INT REFERENCES Department(dept_id));`
2. Insert a professor (e.g. `(10, 'Liza dela Cruz', 1)`) and run `SELECT * FROM Professor;` to confirm.
3. Try adding an enrollment for a non-existent student (e.g. `INSERT INTO Enrollment VALUES (2001, 99, 101, 'First', 2026, 'A');`). Explain why the DBMS prevents this. (Hint: foreign key constraint.)

**How to Pass Data Modeling Topics**

- Practice drawing ER diagrams on paper. Label entities and relationship cardinalities clearly (1:N, N:M, etc.). Professors often give scenarios to diagram first.
- Memorize the rules for converting ER diagrams to tables (one table per entity, add junction table for M:N relationships).
- When writing CREATE TABLE in exams, always show primary key (PK) and foreign key (FK) with correct references. Use uppercase keywords to avoid syntax errors.
- Check for correctness: after drawing or coding, ask "Would this prevent storing invalid data?" (e.g., can a student enroll in a non-existent course?). Good modeling answers these checks.
$md$, 5, 'sql', $code$-- Uses the same sample database as Lesson 1 (Department, Student, Course, Enrollment).
-- Recreate it here if your session is fresh:
CREATE TABLE Department (dept_id INT PRIMARY KEY, dept_name VARCHAR(100));
CREATE TABLE Student (student_id INT PRIMARY KEY, name VARCHAR(50), program VARCHAR(50), year INT, dept_id INT REFERENCES Department(dept_id));
CREATE TABLE Course (course_id INT PRIMARY KEY, course_name VARCHAR(100), credits INT, dept_id INT REFERENCES Department(dept_id));
CREATE TABLE Enrollment (enrollment_id INT PRIMARY KEY, student_id INT REFERENCES Student(student_id), course_id INT REFERENCES Course(course_id), semester VARCHAR(10), year INT, grade CHAR(2));

INSERT INTO Department VALUES (1,'Computer Science'),(2,'Information Technology'),(3,'Mathematics');
INSERT INTO Student VALUES (1,'Juan dela Cruz','BSIT',3,2),(2,'Maria Santos','BSCS',2,1),(3,'Jose Rizal','BSCS',4,1),(4,'Anna Reyes','BSIT',2,2);
INSERT INTO Course VALUES (101,'Database Systems',3,1),(102,'Web Programming',3,1),(201,'Network Security',3,2),(202,'Systems Analysis',3,2),(301,'Algorithms',3,1);
INSERT INTO Enrollment VALUES (1001,1,101,'First',2026,'B'),(1002,1,201,'First',2026,'A'),(1003,2,101,'First',2026,'C'),(1004,2,301,'First',2026,'B'),(1005,3,101,'First',2026,'A'),(1006,3,202,'First',2026,'A'),(1007,4,102,'First',2026,'B'),(1008,4,201,'First',2026,'A');$code$);

-- ============================================================
-- LESSON 3: Relational Design and Normalization
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('b0ace7f9-03ae-5c15-b397-b319d705bc24','content','Relational Model Basics',$md$
In the relational model, data are stored in **tables** (relations) made up of **rows** (tuples) and **columns** (attributes). Each table has a **primary key** column (or set of columns) whose value uniquely identifies each row. Other columns are fields like name or date. Tables can be related by keys: a **foreign key** in one table points to the primary key of another. For example, a `Student(student_id, name, program)` table might have `student_id` as primary key. An `Enrollment(enrollment_id, student_id, course_id)` table would have `student_id` as a foreign key linking to `Student.student_id`. The DBMS enforces these relationships to prevent, say, enrolling a student ID that doesn't exist.
$md$, 1),
('b0ace7f9-03ae-5c15-b397-b319d705bc24','content','Functional Dependencies (FD)',$md$
A **functional dependency** describes a relationship between columns: "X → Y" means that for any two rows, if X is the same then Y must also be the same. For example, in a Student table, `student_id → name, program` (student ID determines the student's name and program). Understanding FDs helps in designing tables without redundancy. If part of a composite primary key determines a column, that's a **partial dependency**. If a non-key column depends on another non-key column, that's a **transitive dependency**. These situations can cause data anomalies (like updates and insertions failing to correctly propagate).
$md$, 2),
('b0ace7f9-03ae-5c15-b397-b319d705bc24','activity','Normal Forms (1NF, 2NF, 3NF)',$md$
Normalization is the process of organizing tables to reduce redundancy. Key normal forms are:

- **1NF (First Normal Form):** Each column holds atomic (indivisible) values, and each row-column intersection has exactly one value. (E.g., do not store "Course1,Course2" in one field.)
- **2NF (Second NF):** It is in 1NF and no partial dependency exists. That means if the primary key is composite, no subset of it should determine any column. (E.g., in table (StudentID, CourseID, Grade), neither StudentID nor CourseID alone should determine something about Grade.)
- **3NF (Third NF):** It is in 2NF and no transitive dependency exists. No non-key attribute depends on another non-key attribute. (E.g., if StudentID determines AdvisorName, and AdvisorName determines AdvisorOffice, then splitting AdvisorOffice into a separate table might be needed.)

By enforcing these forms, we ensure tables store each fact in only one place. This prevents update anomalies and keeps the database consistent.
$md$, 3),
('b0ace7f9-03ae-5c15-b397-b319d705bc24','activity','Normalization Example',$md$
Consider this unnormalized table `EnrollmentRaw`:

| StudentID | Name | Course | Instructor | Location |
|-----------|------|--------|------------|----------|
| 1 | Juan Cruz | Math101 | Dr. Santos | QC Campus |
| 2 | Maria Santos | Math101 | Dr. Santos | QC Campus |
| 3 | Joe Dela Cruz | Eng202 | Ms. Reyes | Makati |

Here, the instructor and location repeat for each course, causing redundancy. Applying normalization:

1. **Convert to 1NF:** ensure atomic values. (Already atomic in this example.)
2. **Convert to 2NF:** Remove partial dependencies. For instance, (Course, Instructor, Location) depends only on Course, not on the full key (StudentID, Course). Split into a `Course` table and a `StudentCourse` table.
3. **Convert to 3NF:** If any non-key columns depended on other non-key columns, split them (not needed in this simple example).

After splitting, the schema might be:

- `Student(student_id PK, name)`
- `Course(course_id PK, instructor, location)`
- `Enrollment(student_id FK, course_id FK, PRIMARY KEY(student_id, course_id))`

This design eliminates the repeated instructor and location values, and ensures each fact appears only once.

*Ready to apply this? The practice set below walks through exam-style problems with step-by-step solutions and a live coding playground.*
$md$, 4);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('b0ace7f9-03ae-5c15-b397-b319d705bc24','activity','Practice & Exam Drills, Lesson 3',$md$
**Review Questions**

1. What is a functional dependency? Give an example using student records.
2. Explain 1NF, 2NF, and 3NF in your own words. Why does a database need normalization?
3. In a table with composite key (A, B), what is a partial dependency? How does 2NF address it?

**Worked Problems (Exam-Style)**

**[Normalization]** The table `OrderRaw(order_id, product_id, product_name, quantity)` is given, where each order has one product. Identify any normalization issue. Rewrite it into proper normalized tables.

*Solution:* `Order(order_id, product_id, quantity)`, `Product(product_id, product_name)`. We separated product details into their own table.

**[Functional Dependency]** If a table `Book(book_id, title, author, price)` has primary key `book_id`, list the non-trivial FDs.

*Solution:* `book_id → title, author, price`. The key is a single column, so there is no partial dependency.

**[Given Table]** Consider a table `Employee(emp_id, name, dept, dept_head)` with primary key `emp_id`. Is this in 3NF? If not, how would you fix it?

*Solution:* No, because `dept_head` depends on `dept` (a non-key column) instead of `emp_id`. Fix by creating a separate `Department(dept, dept_head)` table, and referencing `dept` from Employee.

**Hands-On Exercises** (using the SQL playground)

1. Check normalization: query the sample tables and see if any redundancy is obvious. (For example, in Course, the dept_id repeats, but we already have a Department table.)
2. (Bonus) Try inserting a duplicate primary key row into any table (e.g. `INSERT INTO Course VALUES (101, 'Algo2', 3, 1);` twice) and observe the error. Why is this important?

**How to Pass Normalization Topics**

- Always remember the definition of each normal form. Professors often ask "Explain 2NF/3NF."
- Practice simple normalization exercises on paper (breaking one table into two). Understand why each dependency is broken.
- Note that answer tables should have PKs and all FKs labeled. Show that no unwanted duplication remains.
- Use abbreviations carefully: 1NF means atomic values, 2NF means no partial FD, etc. Exact terminology can earn points.
$md$, 5, 'sql', $code$-- Same sample database as Lesson 1 (Department, Student, Course, Enrollment).
CREATE TABLE Department (dept_id INT PRIMARY KEY, dept_name VARCHAR(100));
CREATE TABLE Student (student_id INT PRIMARY KEY, name VARCHAR(50), program VARCHAR(50), year INT, dept_id INT REFERENCES Department(dept_id));
CREATE TABLE Course (course_id INT PRIMARY KEY, course_name VARCHAR(100), credits INT, dept_id INT REFERENCES Department(dept_id));
CREATE TABLE Enrollment (enrollment_id INT PRIMARY KEY, student_id INT REFERENCES Student(student_id), course_id INT REFERENCES Course(course_id), semester VARCHAR(10), year INT, grade CHAR(2));

INSERT INTO Department VALUES (1,'Computer Science'),(2,'Information Technology'),(3,'Mathematics');
INSERT INTO Student VALUES (1,'Juan dela Cruz','BSIT',3,2),(2,'Maria Santos','BSCS',2,1),(3,'Jose Rizal','BSCS',4,1),(4,'Anna Reyes','BSIT',2,2);
INSERT INTO Course VALUES (101,'Database Systems',3,1),(102,'Web Programming',3,1),(201,'Network Security',3,2),(202,'Systems Analysis',3,2),(301,'Algorithms',3,1);
INSERT INTO Enrollment VALUES (1001,1,101,'First',2026,'B'),(1002,1,201,'First',2026,'A'),(1003,2,101,'First',2026,'C'),(1004,2,301,'First',2026,'B'),(1005,3,101,'First',2026,'A'),(1006,3,202,'First',2026,'A'),(1007,4,102,'First',2026,'B'),(1008,4,201,'First',2026,'A');$code$);

-- ============================================================
-- LESSON 4: SQL – Data Definition and Data Manipulation
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('44be57f8-adf1-57d2-80cd-39d62aa91636','content','SQL Data Definition Language (DDL)',$md$
SQL DDL statements let us create and modify database structures. The main commands are **CREATE**, **ALTER**, and **DROP**. For example, to create a table you write:

```sql
CREATE TABLE Student (
  student_id INT PRIMARY KEY,
  name VARCHAR(50),
  program VARCHAR(20)
);
```

This creates a Student table with a primary key. Common data types include `INT` for integers, `VARCHAR(n)` for text up to n characters, `DATE` for dates, etc. You can also add constraints: `NOT NULL` (column must have a value), `UNIQUE` (no duplicates), and `FOREIGN KEY` (to link tables). For example, adding a foreign key to Enrollment might look like:

```sql
ALTER TABLE Enrollment
ADD FOREIGN KEY (student_id) REFERENCES Student(student_id);
```

DDL changes the schema but does not handle table rows (data).
$md$, 1),
('44be57f8-adf1-57d2-80cd-39d62aa91636','content','SQL Data Manipulation Language (DML)',$md$
DML statements let us manage the data inside tables. The main commands are **INSERT**, **UPDATE**, **DELETE**, and **SELECT** (SELECT is technically a query but used in DML context to retrieve data). Examples:

**INSERT**, Add new rows:
```sql
INSERT INTO Student VALUES (1, 'Ana Lopez', 'BSIT');
```

**UPDATE**, Change existing rows:
```sql
UPDATE Student SET program = 'BSCS' WHERE student_id = 1;
```

**DELETE**, Remove rows:
```sql
DELETE FROM Student WHERE student_id = 1;
```

Always use `WHERE` to specify which rows to update/delete; omitting it affects **all** rows!
$md$, 2),
('44be57f8-adf1-57d2-80cd-39d62aa91636','activity','Altering and Dropping Tables',$md$
To modify table structure after creation, use `ALTER TABLE`. You can add or drop columns. For example:

```sql
ALTER TABLE Course ADD COLUMN description VARCHAR(100);
ALTER TABLE Course DROP COLUMN credits;
```

Dropping an entire table is done with `DROP TABLE table_name;`. Use these with caution, as dropping a table or column cannot be undone easily (unless you have a backup). For exams, showing correct `ALTER` syntax can earn points.
$md$, 3),
('44be57f8-adf1-57d2-80cd-39d62aa91636','activity','Example DDL/DML Workflow',$md$
A typical workflow is: first design the table (DDL), then insert data (DML), and later update or delete as needed. For example, after creating the Student table, you might run multiple INSERT statements for each student. If you realize you need a new field later, you `ALTER TABLE` to add it. Remember to always test your SQL (exam tip: check syntax and remember commas, parentheses). Writing clean, syntactically correct SQL in exams is crucial – one missing comma or quote is a common mistake.

*Ready to apply this? The practice set below walks through exam-style problems with step-by-step solutions and a live coding playground.*
$md$, 4);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('44be57f8-adf1-57d2-80cd-39d62aa91636','activity','Practice & Exam Drills, Lesson 4',$md$
**Review Questions**

1. What is the difference between DDL and DML in SQL? Give an example of each.
2. What SQL statement would you use to prevent null values in a column? (e.g., making a column mandatory)
3. True or False: `TRUNCATE TABLE Student;` deletes all rows without logging individual row deletions. *(Answer: True.)*

**Worked Problems (Exam-Style)**

**[CREATE TABLE]** Write a SQL statement to create a table `Professor` with columns: `prof_id` (integer primary key), `name` (text), and `dept_id` (integer, foreign key to Department).

*Solution:* `CREATE TABLE Professor (prof_id INT PRIMARY KEY, name VARCHAR(50), dept_id INT, FOREIGN KEY(dept_id) REFERENCES Department(dept_id));`

**[ALTER TABLE]** Given table `Student(id, name, age)`, write a command to add a column `email` (varchar).

*Solution:* `ALTER TABLE Student ADD COLUMN email VARCHAR(100);`

**[INSERT]** You have table `Course(course_id, course_name)`. Show how to insert a new course with ID=501 and name='Data Science'.

*Solution:* `INSERT INTO Course (course_id, course_name) VALUES (501, 'Data Science');`

**[UPDATE]** If you need to change student 4's year to 3, write the SQL.

*Solution:* `UPDATE Student SET year = 3 WHERE student_id = 4;`

**[Error Checking]** What is wrong with this statement? `CREATE TABLE Student (id INT PRIMARY KEY, name VARCHAR(50) UNIQUE, program);`

*Solution:* Missing a data type for `program`; it should be like `program VARCHAR(20)`. Also watch for missing commas if more columns follow.

**Hands-On Exercises** (using the SQL playground)

1. Try creating a new table and inserting some data:
```sql
CREATE TABLE Test (x INT PRIMARY KEY, y VARCHAR(10));
INSERT INTO Test VALUES (1, 'Hello'), (2, 'World');
SELECT * FROM Test;
```
2. Attempt an illegal DDL change (e.g., `ALTER TABLE Enrollment DROP student_id;`) and note the error. Why does the DBMS complain?
3. Update a row and then delete it. (E.g., `UPDATE Student SET program='BSCS' WHERE student_id=2;` then `DELETE FROM Student WHERE student_id=2;`)

**How to Pass SQL DDL/DML Topics**

- Memorize the basic SQL statements and their syntax. In exams you may be asked to write or correct them.
- Remember commas between columns, matching parentheses, and semicolons at the end. Many mistakes are simple typos.
- Pay attention to the order: `CREATE TABLE name (cols, constraints)`, `INSERT INTO table(cols) VALUES(...)`.
- For `ALTER TABLE`, know `ADD COLUMN` vs `DROP COLUMN`. Practice these in the playground so you spot syntax issues quickly.
$md$, 5, 'sql', $code$-- Same sample database as Lesson 1 (Department, Student, Course, Enrollment).
CREATE TABLE Department (dept_id INT PRIMARY KEY, dept_name VARCHAR(100));
CREATE TABLE Student (student_id INT PRIMARY KEY, name VARCHAR(50), program VARCHAR(50), year INT, dept_id INT REFERENCES Department(dept_id));
CREATE TABLE Course (course_id INT PRIMARY KEY, course_name VARCHAR(100), credits INT, dept_id INT REFERENCES Department(dept_id));
CREATE TABLE Enrollment (enrollment_id INT PRIMARY KEY, student_id INT REFERENCES Student(student_id), course_id INT REFERENCES Course(course_id), semester VARCHAR(10), year INT, grade CHAR(2));

INSERT INTO Department VALUES (1,'Computer Science'),(2,'Information Technology'),(3,'Mathematics');
INSERT INTO Student VALUES (1,'Juan dela Cruz','BSIT',3,2),(2,'Maria Santos','BSCS',2,1),(3,'Jose Rizal','BSCS',4,1),(4,'Anna Reyes','BSIT',2,2);
INSERT INTO Course VALUES (101,'Database Systems',3,1),(102,'Web Programming',3,1),(201,'Network Security',3,2),(202,'Systems Analysis',3,2),(301,'Algorithms',3,1);
INSERT INTO Enrollment VALUES (1001,1,101,'First',2026,'B'),(1002,1,201,'First',2026,'A'),(1003,2,101,'First',2026,'C'),(1004,2,301,'First',2026,'B'),(1005,3,101,'First',2026,'A'),(1006,3,202,'First',2026,'A'),(1007,4,102,'First',2026,'B'),(1008,4,201,'First',2026,'A');$code$);

-- ============================================================
-- LESSON 5: SQL Queries (SELECT, Joins, and Aggregates)
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('21829336-6581-56fb-866e-61c03652d346','content','Basic SELECT Queries',$md$
The `SELECT` statement retrieves data from tables. Basic syntax:

```sql
SELECT column1, column2
FROM table_name
WHERE condition;
```

For example, `SELECT name, program FROM Student WHERE year = 3;` lists names and programs of all 3rd-year students. The `WHERE` clause filters rows (using `=`, `<`, `>`, `LIKE`, etc.). You can select all columns with `SELECT *`, but in exams it's better to list needed columns. Always test your WHERE conditions.
$md$, 1),
('21829336-6581-56fb-866e-61c03652d346','content','JOIN Operations',$md$
To query multiple tables, use JOINs. The most common is **INNER JOIN**, which combines rows with matching keys. Example:

```sql
SELECT s.name, c.course_name
FROM Student s
JOIN Enrollment e ON s.student_id = e.student_id
JOIN Course c ON e.course_id = c.course_id;
```

This lists each student with each course they are enrolled in. There are also **LEFT JOIN** (includes all left-table rows even if no match) and **RIGHT/FULL JOIN** (right or both sides). In exams, INNER JOIN is most common. Use table aliases (like `s`, `e`, `c`) for brevity. Ensure you join on the correct key columns.
$md$, 2),
('21829336-6581-56fb-866e-61c03652d346','activity','Aggregation and GROUP BY',$md$
SQL provides functions to summarize data: `COUNT()`, `SUM()`, `AVG()`, `MIN()`, `MAX()`. To apply these to groups, use `GROUP BY`. For example, to count students per program:

```sql
SELECT program, COUNT(*) AS num_students
FROM Student
GROUP BY program;
```

This shows one row per program. If you want a condition on groups, use `HAVING`, e.g. to show programs with more than 1 student:

```sql
SELECT program, COUNT(*)
FROM Student
GROUP BY program
HAVING COUNT(*) > 1;
```
$md$, 3),
('21829336-6581-56fb-866e-61c03652d346','activity','Subqueries (Nested Queries)',$md$
A **subquery** is a query inside another. For example, to find students taking the same courses as student 1:

```sql
SELECT name
FROM Student
WHERE student_id IN (
  SELECT student_id
  FROM Enrollment
  WHERE course_id IN (
    SELECT course_id FROM Enrollment WHERE student_id = 1
  )
);
```

Subqueries can be used in `WHERE`, `FROM`, or `SELECT` clauses. A **correlated subquery** refers to columns from the outer query (like a loop). If unfamiliar, focus on simple ones, e.g. "students above the average year":

```sql
SELECT name
FROM Student
WHERE year > (SELECT AVG(year) FROM Student);
```

*Exam tip:* Subqueries are often written using `IN` (for multiple values) or `=` (for a single value).

*Ready to apply this? The practice set below walks through exam-style problems with step-by-step solutions and a live coding playground.*
$md$, 4);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('21829336-6581-56fb-866e-61c03652d346','activity','Practice & Exam Drills, Lesson 5',$md$
**Review Questions**

1. What does JOIN do in SQL? What is the difference between INNER JOIN and LEFT JOIN?
2. Explain the purpose of GROUP BY and HAVING. Can you use HAVING without GROUP BY?
3. Give an example of a subquery in a WHERE clause (written in English).

**Worked Problems (Exam-Style)**

**[Join Query]** Write a query to list each student name along with their department name.

*Solution:*
```sql
SELECT s.name, d.dept_name
FROM Student s
JOIN Department d ON s.dept_id = d.dept_id;
```
*Explanation:* We join Student with Department on the matching `dept_id`.

**[Aggregation]** How many courses has each student enrolled in? (columns: student_id, total_courses)

*Solution:*
```sql
SELECT student_id, COUNT(*) AS total_courses
FROM Enrollment
GROUP BY student_id;
```
*Explanation:* Count the number of enrollment records per student.

**[Subquery]** List the students who are not enrolled in any course.

*Solution:*
```sql
SELECT name
FROM Student
WHERE student_id NOT IN (SELECT student_id FROM Enrollment);
```
*Explanation:* The subquery finds students with enrollments; the outer query picks those not in that list.

**[Query Result]** What is the result of:
```sql
SELECT program, AVG(year)
FROM Student
GROUP BY program;
```
*Solution:* The average year level for each program (e.g. BSIT, BSCS) from the sample data.

**Hands-On Exercises** (using the SQL playground)

1. Find the names of all courses offered by the 'Computer Science' department. (Hint: join Course with Department on dept_id where dept_name = 'Computer Science'.)
2. Count how many enrollments each course has:
```sql
SELECT c.course_name, COUNT(*) AS num_enrolled
FROM Course c
JOIN Enrollment e ON c.course_id = e.course_id
GROUP BY c.course_name;
```
3. Try a subquery: find the student(s) with the highest student_id:
```sql
SELECT name
FROM Student
WHERE student_id = (SELECT MAX(student_id) FROM Student);
```

**How to Pass Complex SQL Topics**

- For joins, qualify column names with table aliases to avoid ambiguity. Professors might give multiple tables, so always write `table.column`.
- Practice grouping queries: every column in SELECT must be either aggregated or in GROUP BY.
- For subqueries, ensure your logic is clear. A common exam pattern is "find X not in Y" or "find X greater than average of Y." Write it out step by step.
- Know functions like COUNT, SUM, AVG, MIN, MAX by memory, they often appear in questions.
$md$, 5, 'sql', $code$-- Same sample database as Lesson 1 (Department, Student, Course, Enrollment).
CREATE TABLE Department (dept_id INT PRIMARY KEY, dept_name VARCHAR(100));
CREATE TABLE Student (student_id INT PRIMARY KEY, name VARCHAR(50), program VARCHAR(50), year INT, dept_id INT REFERENCES Department(dept_id));
CREATE TABLE Course (course_id INT PRIMARY KEY, course_name VARCHAR(100), credits INT, dept_id INT REFERENCES Department(dept_id));
CREATE TABLE Enrollment (enrollment_id INT PRIMARY KEY, student_id INT REFERENCES Student(student_id), course_id INT REFERENCES Course(course_id), semester VARCHAR(10), year INT, grade CHAR(2));

INSERT INTO Department VALUES (1,'Computer Science'),(2,'Information Technology'),(3,'Mathematics');
INSERT INTO Student VALUES (1,'Juan dela Cruz','BSIT',3,2),(2,'Maria Santos','BSCS',2,1),(3,'Jose Rizal','BSCS',4,1),(4,'Anna Reyes','BSIT',2,2);
INSERT INTO Course VALUES (101,'Database Systems',3,1),(102,'Web Programming',3,1),(201,'Network Security',3,2),(202,'Systems Analysis',3,2),(301,'Algorithms',3,1);
INSERT INTO Enrollment VALUES (1001,1,101,'First',2026,'B'),(1002,1,201,'First',2026,'A'),(1003,2,101,'First',2026,'C'),(1004,2,301,'First',2026,'B'),(1005,3,101,'First',2026,'A'),(1006,3,202,'First',2026,'A'),(1007,4,102,'First',2026,'B'),(1008,4,201,'First',2026,'A');$code$);

-- ============================================================
-- LESSON 6: Transactions and Concurrency Control
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('b3cfdb35-2b57-59c7-9388-4007215630eb','content','Transactions and ACID Properties',$md$
A **transaction** is a sequence of database operations (inserts, updates, deletes) that must all succeed as a unit. The **ACID** properties ensure transaction reliability: **Atomicity** (all or nothing – if any part fails, the whole transaction rolls back), **Consistency** (the database moves from one valid state to another, respecting all rules), **Isolation** (transactions do not interfere – interim changes are not visible to others until commit), and **Durability** (once committed, changes survive system crashes). For example, transferring ₱1000 from Account A to B involves two updates; ACID ensures that either both updates happen or neither does, so money is never lost or created. In SQL, transactions are demarcated by `BEGIN`/`COMMIT`/`ROLLBACK` (e.g. `BEGIN TRANSACTION; UPDATE ...; COMMIT;`).
$md$, 1),
('b3cfdb35-2b57-59c7-9388-4007215630eb','content','Concurrency Control (Locks, Isolation)',$md$
When multiple users access the database, concurrency issues can arise (like lost updates, dirty reads). DBMSs use **locking** and **isolation levels** to prevent these anomalies. Basic isolation levels include:

- **Read Uncommitted:** Lowest level, transactions see others' uncommitted changes (allows dirty reads).
- **Read Committed:** A transaction only sees data committed by others (prevents dirty reads).
- **Repeatable Read:** Ensures that if you read the same row twice in one transaction, you get the same value (prevents non-repeatable reads).
- **Serializable:** Highest isolation, transactions are fully isolated (no anomalies).

In practice, the PostgreSQL/MySQL default is usually Read Committed. Exams may describe scenarios like two students trying to register at the same time; discuss how locks prevent duplicate seats.
$md$, 2),
('b3cfdb35-2b57-59c7-9388-4007215630eb','activity','Recovery and Backups',$md$
If a crash occurs, databases must recover to a consistent state. The DBMS uses **logs** (a history of changes) to undo or redo transactions. Regular **backups** are essential: a full backup copies the entire database; incremental backups copy only changes since the last backup. In the Philippines, critical systems (e.g. bank databases, government records) perform nightly backups and keep copies offsite. For exams, know terms like **checkpoint**, **rollforward/rollback**, and the differences between types of backups.
$md$, 3),
('b3cfdb35-2b57-59c7-9388-4007215630eb','activity','Example Transaction Scenario',$md$
Consider transferring funds:

```sql
BEGIN TRANSACTION;
UPDATE Account SET balance = balance - 1000 WHERE account_id = 123;
UPDATE Account SET balance = balance + 1000 WHERE account_id = 456;
COMMIT;
```

If the second update fails (e.g. account 456 doesn't exist), the DBMS will `ROLLBACK`, leaving both balances unchanged (atomicity). Without transactions, one update might succeed and the other fail, causing inconsistency. Always wrap related updates in a transaction to maintain integrity.

*Ready to apply this? The practice set below walks through exam-style problems with step-by-step solutions and a live coding playground.*
$md$, 4);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('b3cfdb35-2b57-59c7-9388-4007215630eb','activity','Practice & Exam Drills, Lesson 6',$md$
**Review Questions**

1. What are the four ACID properties of transactions? Why is each important?
2. Explain the difference between a dirty read and a non-repeatable read. Give an example of each.
3. What SQL statements mark the start and end of a transaction?

**Worked Problems (Exam-Style)**

**[Scenario]** Two transactions run concurrently: T1 reads Account A balance and then updates it; T2 updates Account A balance at the same time. What problem could occur if isolation is at Read Uncommitted?

*Solution:* Dirty read, T1 might see T2's uncommitted change and use it, even if T2 later rolls back.

**[ACID]** In your own words, what does Durability ensure after a transaction commits?

*Solution:* Once a transaction is committed, its changes remain in the database permanently, even if the system crashes immediately afterwards.

**[Rollback]** You run these statements:
```sql
BEGIN;
INSERT INTO Course VALUES (999, 'TempCourse', 1, 1);
ROLLBACK;
SELECT * FROM Course WHERE course_id = 999;
```
What is the result of the SELECT? Explain.

*Solution:* No rows returned, because the INSERT was undone by ROLLBACK.

**Hands-On Exercises** (using the SQL playground)

1. Simulate a simple transaction:
```sql
BEGIN;
INSERT INTO Student VALUES (5, 'Mark Reyes', 'BSIT', 1, 2);
DELETE FROM Student WHERE student_id = 5;
ROLLBACK;
```
After running, check `SELECT * FROM Student;` to confirm that Mark Reyes is not added (both operations were rolled back).
2. (Conceptual) Try setting two sessions to UPDATE the same row at the same time. Observe that one must wait or causes an error.

**How to Pass Transactions Topics**

- Remember definitions: ACID terms are frequently asked. A small mnemonic (A: All or Nothing, C: Consistent, I: Isolated, D: Durable) helps.
- Understand common anomalies (lost update, dirty/non-repeatable read) and which isolation level fixes them. Professors may give a scenario and ask "Which level is needed?"
- Mention SQL syntax: practice writing `BEGIN`, `COMMIT`, `ROLLBACK`. Even though not all professors expect exact commands, it shows your understanding of how transactions work.
$md$, 5, 'sql', $code$-- Same sample database as Lesson 1 (Department, Student, Course, Enrollment).
CREATE TABLE Department (dept_id INT PRIMARY KEY, dept_name VARCHAR(100));
CREATE TABLE Student (student_id INT PRIMARY KEY, name VARCHAR(50), program VARCHAR(50), year INT, dept_id INT REFERENCES Department(dept_id));
CREATE TABLE Course (course_id INT PRIMARY KEY, course_name VARCHAR(100), credits INT, dept_id INT REFERENCES Department(dept_id));
CREATE TABLE Enrollment (enrollment_id INT PRIMARY KEY, student_id INT REFERENCES Student(student_id), course_id INT REFERENCES Course(course_id), semester VARCHAR(10), year INT, grade CHAR(2));

INSERT INTO Department VALUES (1,'Computer Science'),(2,'Information Technology'),(3,'Mathematics');
INSERT INTO Student VALUES (1,'Juan dela Cruz','BSIT',3,2),(2,'Maria Santos','BSCS',2,1),(3,'Jose Rizal','BSCS',4,1),(4,'Anna Reyes','BSIT',2,2);
INSERT INTO Course VALUES (101,'Database Systems',3,1),(102,'Web Programming',3,1),(201,'Network Security',3,2),(202,'Systems Analysis',3,2),(301,'Algorithms',3,1);
INSERT INTO Enrollment VALUES (1001,1,101,'First',2026,'B'),(1002,1,201,'First',2026,'A'),(1003,2,101,'First',2026,'C'),(1004,2,301,'First',2026,'B'),(1005,3,101,'First',2026,'A'),(1006,3,202,'First',2026,'A'),(1007,4,102,'First',2026,'B'),(1008,4,201,'First',2026,'A');$code$);

-- ============================================================
-- LESSON 7: Database Administration
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('40f4d906-7c40-5024-abb5-a5b883c02237','content','Security and Access Control',$md$
Database administration includes managing who can do what. A **DBA** (Database Admin) creates user accounts and assigns privileges (e.g. SELECT, INSERT, UPDATE) on tables. In SQL, `GRANT SELECT ON Student TO user1;` gives permission to view the Student table. **Roles** (groups of privileges) are often used. Strong passwords and encrypting sensitive columns (like citizens' personal identifiers under PH law) are part of security too. In exams, you may list common grants or be asked how to prevent unauthorized data access.
$md$, 1),
('40f4d906-7c40-5024-abb5-a5b883c02237','content','Indexing and Performance',$md$
An **index** is like a book's index: it speeds up data retrieval. Creating an index on a column (e.g. `CREATE INDEX idx_name ON Student(name);`) helps queries that search by name. However, indexes take storage space and slow down updates/inserts (every change must update the index). Use indexes on columns that are often searched or joined. In database admin questions, know that a `PRIMARY KEY` automatically creates a unique index. You might be asked the effect of an index or how it helps a query run faster (lower search time).
$md$, 2),
('40f4d906-7c40-5024-abb5-a5b883c02237','activity','Backup and Recovery',$md$
A DBA must ensure data isn't lost. **Full backups** (copy the whole database) and **incremental backups** (just changes since the last backup) are scheduled regularly. In critical PH systems (e.g. Bangko Sentral ng Pilipinas), backups are done nightly. Also understand **point-in-time recovery**: logs allow restoring to just before a failure. Exam tips: distinguish **hot backup** (while DB is running) vs **cold backup** (when offline). A common question is describing a backup strategy or why backups are necessary.
$md$, 3),
('40f4d906-7c40-5024-abb5-a5b883c02237','activity','Views and Other Administration Tasks',$md$
A **view** is a virtual table defined by a query (e.g. `CREATE VIEW Sophomores AS SELECT * FROM Student WHERE year=2;`). It can simplify data access or restrict sensitive columns. Views help in security (users see only what they should). Other DBA tasks include performance tuning (monitoring slow queries), and possibly defining stored procedures or triggers. Knowing terminology (view vs table, index types) and basic commands (`DROP INDEX`, `CREATE VIEW`) can earn marks.

*Ready to apply this? The practice set below walks through exam-style problems with step-by-step solutions and a live coding playground.*
$md$, 4);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('40f4d906-7c40-5024-abb5-a5b883c02237','activity','Practice & Exam Drills, Lesson 7',$md$
**Review Questions**

1. Why are indexes used in databases? What is a potential downside?
2. How would you back up a database before performing a risky operation? List two methods.
3. What SQL command gives a user permission to insert rows into the Student table? *(Answer: `GRANT INSERT ON Student TO userX;`)*

**Worked Problems (Exam-Style)**

**[Index]** Many queries search by name in Student. Write the SQL to create an index on that column. Explain when this index is used.

*Solution:* `CREATE INDEX idx_student_name ON Student(name);` It will speed up queries like `WHERE name = '...'`.

**[Backup Strategy]** Describe a backup strategy for a university registration database so that it can be recovered after a corruption during finals week.

*Solution:* Take nightly full backups and hourly incremental backups. Keep backups offsite. Use transaction logs for point-in-time recovery.

**[GRANT]** A new analyst, Anna, needs to run SELECT queries only on the Enrollment table. What commands would you use?

*Solution:*
```sql
CREATE USER anna;
GRANT SELECT ON Enrollment TO anna;
```
*Explanation:* We grant only the SELECT privilege on Enrollment.

**Hands-On Exercises** (using the SQL playground)

1. Create an index on `Course(course_name)` and run `EXPLAIN SELECT * FROM Course WHERE course_name = 'Algorithms';` to see how the index is used.
2. Create a view of 3rd-year IT students:
```sql
CREATE VIEW ThirdYearIT AS
  SELECT name, program, year
  FROM Student
  WHERE program='BSIT' AND year=3;
SELECT * FROM ThirdYearIT;
```
Check that it shows the expected rows.
3. (Conceptual) List the steps to recover data if the database accidentally dropped the Student table (assume a backup exists).

**How to Pass Admin Topics**

- Memorize common SQL commands for security and management (`CREATE INDEX`, `CREATE VIEW`, `GRANT`, `BACKUP`). These often appear in short-answer form.
- Understand when to use each tool: e.g., "Use an index to speed a query, but drop it if writing speed matters."
- For backup questions, mention things like "cold vs hot backup," "offsite storage," and "test restores." Real-world detail earns points.
- In answers, be clear about consequences (e.g., "Without a backup, data cannot be recovered.").
$md$, 5, 'sql', $code$-- Same sample database as Lesson 1 (Department, Student, Course, Enrollment).
CREATE TABLE Department (dept_id INT PRIMARY KEY, dept_name VARCHAR(100));
CREATE TABLE Student (student_id INT PRIMARY KEY, name VARCHAR(50), program VARCHAR(50), year INT, dept_id INT REFERENCES Department(dept_id));
CREATE TABLE Course (course_id INT PRIMARY KEY, course_name VARCHAR(100), credits INT, dept_id INT REFERENCES Department(dept_id));
CREATE TABLE Enrollment (enrollment_id INT PRIMARY KEY, student_id INT REFERENCES Student(student_id), course_id INT REFERENCES Course(course_id), semester VARCHAR(10), year INT, grade CHAR(2));

INSERT INTO Department VALUES (1,'Computer Science'),(2,'Information Technology'),(3,'Mathematics');
INSERT INTO Student VALUES (1,'Juan dela Cruz','BSIT',3,2),(2,'Maria Santos','BSCS',2,1),(3,'Jose Rizal','BSCS',4,1),(4,'Anna Reyes','BSIT',2,2);
INSERT INTO Course VALUES (101,'Database Systems',3,1),(102,'Web Programming',3,1),(201,'Network Security',3,2),(202,'Systems Analysis',3,2),(301,'Algorithms',3,1);
INSERT INTO Enrollment VALUES (1001,1,101,'First',2026,'B'),(1002,1,201,'First',2026,'A'),(1003,2,101,'First',2026,'C'),(1004,2,301,'First',2026,'B'),(1005,3,101,'First',2026,'A'),(1006,3,202,'First',2026,'A'),(1007,4,102,'First',2026,'B'),(1008,4,201,'First',2026,'A');$code$);

-- ============================================================
-- LESSON 8: Data Governance and Information Lifecycle
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a7ecc400-acc1-5fb4-a3a0-2698e5f59bab','content','Information Life Cycle Management',$md$
Data goes through a life cycle: from creation/acquisition to use, storage, archiving, and eventually disposal. For example, a patient's medical record is created at first visit (creation), then updated with each visit (use), stored in a hospital database (storage), moved to long-term archives after a certain time (archiving), and finally deleted when legally allowed (disposal). Good information management policies define how long data must be kept (**records retention**) and how to dispose of it securely. In the Philippines, laws like RA 9470 (National Archives) require some documents to be kept for many years.

The simplified life cycle flow is: **Data Creation → Storage & Maintenance → Use & Sharing → Archiving → Disposition.** After disposition (secure deletion or shredding), the cycle ends.
$md$, 1),
('a7ecc400-acc1-5fb4-a3a0-2698e5f59bab','content','Data Quality and Governance',$md$
**Data governance** is the framework of rules and responsibilities ensuring data is accurate, consistent, and used properly. Key aspects include: **data ownership** (who is responsible for data), **data quality** (correctness, completeness), and **security policies**. For instance, a government agency might assign a **Data Steward** to ensure all addresses are correctly formatted. **Master Data Management (MDM)** is a practice to maintain a single source of truth for core entities (customers, products). Good governance means fewer errors: if a province records student info wrong, it affects planning and resource allocation.
$md$, 2),
('a7ecc400-acc1-5fb4-a3a0-2698e5f59bab','activity','Metadata and Catalogs',$md$
**Metadata** is "data about data": e.g., a **data dictionary** describing each column's meaning and type. **Catalogs** list all datasets and their schemas. In a university, a data catalog might describe the Enrollment table's columns, who can access it, and what it's used for. Well-documented metadata helps developers and analysts understand the data context. In exams, you might be asked why metadata matters – for instance, to prevent misuse (e.g. not confusing year level with a calendar year).
$md$, 3),
('a7ecc400-acc1-5fb4-a3a0-2698e5f59bab','activity','Compliance and Legal Considerations',$md$
Managing information also involves legal rules. The Philippines' **Data Privacy Act (RA 10173)** protects personal data: only authorized use is allowed, and data subjects (citizens) have rights (access, correction). Databases storing personal info (e.g. school, health records) must ensure data is kept secure and only used for declared purposes. Non-compliance can lead to fines. Other laws, like the e-Commerce Act and intellectual property laws, may also affect how electronic data is handled. In exams, mention of RA 10173 and related policies shows understanding of the Filipino context.

*Ready to apply this? The practice set below walks through exam-style problems with step-by-step solutions and a live coding playground.*
$md$, 4);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('a7ecc400-acc1-5fb4-a3a0-2698e5f59bab','activity','Practice & Exam Drills, Lesson 8',$md$
**Review Questions**

1. Describe the stages of the information life cycle. Why is archiving important?
2. What is metadata? Give two examples of metadata for a database table.
3. Name one Philippine law related to information management and its key requirement.

**Worked Problems (Exam-Style)**

**[Life Cycle]** A school stores student records. Outline a policy for how long the records should be kept, archived, and disposed, citing any relevant laws.

*Solution (example):* Keep active student data for 10 years after graduation for audit purposes; then move to archive. Retain archived records for 50 years (following National Archives guidelines, RA 9470), then securely delete personal data per RA 10173.

**[Data Quality]** Explain how data governance can prevent errors in a customer database.

*Solution:* By establishing rules (e.g., mandatory fields, format checks) and assigning owners, governance ensures each customer entry is valid. For example, enforcing a rule that email addresses contain "@" prevents faulty data entry.

**[Metadata Use]** If you see a column `amount` in a database without context, how could metadata help you?

*Solution:* Metadata (like a table comment or data dictionary) would tell you `amount` is in Philippine pesos, representing a payment or fine, and possibly its currency format. This prevents guessing.

**Hands-On Exercises** (using the SQL playground)

1. (Conceptual) Create a simple data catalog entry for the Student table: list its columns and a short description (e.g., `student_id`: unique student number, `year`: current year level). This could be a markdown list or comment.
2. (Analysis) Pick any column from the sample DB (e.g. `year`) and write a metadata description: what values it holds and constraints (e.g. year level 1–4).

**How to Pass Governance Topics**

- Always mention the Data Privacy Act (RA 10173) when talking about legal rules in PH. Professors expect it.
- Know the difference between data (content) and metadata (documentation). Clear examples get you credit.
- Emphasize "why" policies exist (e.g. preventing data loss, ensuring accuracy). Generic answers may lose marks.
- If given a policy question (e.g. retention period), tie it to standards or laws if you can.
$md$, 5, 'sql', $code$-- This lesson is conceptual, no SQL is strictly required.
-- You may still explore the sample database to practice describing metadata:
CREATE TABLE Department (dept_id INT PRIMARY KEY, dept_name VARCHAR(100));
CREATE TABLE Student (student_id INT PRIMARY KEY, name VARCHAR(50), program VARCHAR(50), year INT, dept_id INT REFERENCES Department(dept_id));

INSERT INTO Department VALUES (1,'Computer Science'),(2,'Information Technology'),(3,'Mathematics');
INSERT INTO Student VALUES (1,'Juan dela Cruz','BSIT',3,2),(2,'Maria Santos','BSCS',2,1),(3,'Jose Rizal','BSCS',4,1),(4,'Anna Reyes','BSIT',2,2);

-- Try: SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'student';$code$);

-- ============================================================
-- LESSON 9: Data Warehousing and Business Intelligence
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('bc4465f2-dd0f-515b-b0e3-6a55a7f04e11','content','Data Warehouses vs Transactional Databases',$md$
A **data warehouse** is a specialized database designed for analysis and reporting (**OLAP**), unlike an operational (**OLTP**) database which handles day-to-day transactions. A warehouse consolidates data from multiple sources (sales, inventory, finance) into a unified schema, often using a **star schema**: a central fact table linked to dimension tables (e.g. FactSales with dimensions Date, Product, Store). This design allows fast queries on large datasets. For example, a retailer's data warehouse can quickly compute total sales per region per quarter. In contrast, an OLTP system (like a point-of-sale) is optimized for fast inserts/updates.
$md$, 1),
('bc4465f2-dd0f-515b-b0e3-6a55a7f04e11','content','ETL Process (Extract, Transform, Load)',$md$
Building a data warehouse involves **ETL**:

1. **Extract** data from source systems (databases, spreadsheets).
2. **Transform** data by cleaning (fixing errors), aggregating, and converting formats.
3. **Load** the cleaned data into the warehouse.

For instance, if different hospital branches use varied codes for departments, the ETL process would map them to a common standard before loading. Philippine companies often use ETL tools (like Pentaho or Informatica) to automate this nightly or weekly. In exams, you might outline ETL steps or explain its purpose (ensuring consistent, analysis-ready data).
$md$, 2),
('bc4465f2-dd0f-515b-b0e3-6a55a7f04e11','activity','Business Intelligence Concepts',$md$
**Business Intelligence (BI)** refers to the tools and techniques for analyzing warehouse data (charts, dashboards, OLAP cubes). It includes reporting (pre-defined reports), ad-hoc querying, and **data mining** (finding patterns). For example, an airline might use BI to analyze booking trends, producing graphs of sales over time. Key terms to know: **OLAP cube** (multidimensional view of data), **slice and dice** (filtering pivot tables), **KPIs** (Key Performance Indicators). Even if you haven't used BI software, knowing these concepts can help answer questions about how businesses turn data into decisions.
$md$, 3),
('bc4465f2-dd0f-515b-b0e3-6a55a7f04e11','activity','Data Visualization and Reporting',$md$
**Visualization** is a part of BI: turning numbers into charts (bar, line, pie) or maps. Tools like Excel PivotTables, Tableau, or Power BI are common (in the Philippines, even government agencies publish dashboards for public statistics). When answering exam questions, you could mention how charts make trends obvious (e.g. a line graph showing rising sales). Understanding simple charts (histogram vs pie, etc.) may be asked. Also note that data warehouses often include **aggregate tables** or **materialized views** to speed up frequent reports.

*Ready to apply this? The practice set below walks through exam-style problems with step-by-step solutions and a live coding playground.*
$md$, 4);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('bc4465f2-dd0f-515b-b0e3-6a55a7f04e11','activity','Practice & Exam Drills, Lesson 9',$md$
**Review Questions**

1. What is the difference between an OLTP database and an OLAP (data warehouse) system?
2. Briefly describe the ETL process. Why is it necessary for a data warehouse?
3. What is a star schema in data warehousing? Give an example of fact and dimension tables.

**Worked Problems (Exam-Style)**

**[ETL]** An online retailer collects sales data in multiple regional databases. Outline the steps you would take to consolidate this into a single analysis database.

*Solution:* Use ETL, Extract daily sales from each region, Transform currency/units to a common format, Load into a central data warehouse with dimensions like Product, Region.

**[Star Schema]** A company's sales fact table includes (SaleID, ProductID, StoreID, Date, Quantity, Amount). List what dimension tables you might create.

*Solution:* Dimensions, Product (ProductID, Name, Category), Store (StoreID, Location, Manager), Date (Date, Month, Quarter, Year), etc.

**[Cube Query]** Explain how you would use an OLAP cube to find total sales per month.

*Solution:* An OLAP cube with dimension Date and a Sales measure can be "sliced" by year and "diced" by month to aggregate sales for each month.

**Hands-On Exercises** (using the SQL playground)

1. (Case Study) Using the sample data, write a SQL query to get total enrollments per course. Then, to optimize this report monthly, create a summary view:
```sql
CREATE VIEW CourseCounts AS
  SELECT course_id, COUNT(*) AS num_enrolled
  FROM Enrollment
  GROUP BY course_id;
SELECT * FROM CourseCounts;
```
2. (Conceptual) Sketch a simple table of your own design and list how it might fit into a data warehouse (identify fact vs dimension).

**How to Pass BI/Data Warehouse Topics**

- Learn key terms (star schema, ETL, OLAP) and be able to explain them simply. Definitions often come up.
- Relate to real scenarios: e.g., "BIR uses BI to detect tax trends" or "a telecom uses data warehousing to analyze usage." Specific examples help.
- Remember that BI is about analysis: be ready to say how charts or cubes help decision-makers.
- If asked to design, clearly list fact vs dimension attributes, and ensure the granularity is consistent (e.g., one row per sale in the fact table).
$md$, 5, 'sql', $code$-- Same sample database as Lesson 1 (Department, Student, Course, Enrollment).
CREATE TABLE Department (dept_id INT PRIMARY KEY, dept_name VARCHAR(100));
CREATE TABLE Student (student_id INT PRIMARY KEY, name VARCHAR(50), program VARCHAR(50), year INT, dept_id INT REFERENCES Department(dept_id));
CREATE TABLE Course (course_id INT PRIMARY KEY, course_name VARCHAR(100), credits INT, dept_id INT REFERENCES Department(dept_id));
CREATE TABLE Enrollment (enrollment_id INT PRIMARY KEY, student_id INT REFERENCES Student(student_id), course_id INT REFERENCES Course(course_id), semester VARCHAR(10), year INT, grade CHAR(2));

INSERT INTO Department VALUES (1,'Computer Science'),(2,'Information Technology'),(3,'Mathematics');
INSERT INTO Student VALUES (1,'Juan dela Cruz','BSIT',3,2),(2,'Maria Santos','BSCS',2,1),(3,'Jose Rizal','BSCS',4,1),(4,'Anna Reyes','BSIT',2,2);
INSERT INTO Course VALUES (101,'Database Systems',3,1),(102,'Web Programming',3,1),(201,'Network Security',3,2),(202,'Systems Analysis',3,2),(301,'Algorithms',3,1);
INSERT INTO Enrollment VALUES (1001,1,101,'First',2026,'B'),(1002,1,201,'First',2026,'A'),(1003,2,101,'First',2026,'C'),(1004,2,301,'First',2026,'B'),(1005,3,101,'First',2026,'A'),(1006,3,202,'First',2026,'A'),(1007,4,102,'First',2026,'B'),(1008,4,201,'First',2026,'A');$code$);

-- ============================================================
-- LESSON 10: Legal and Ethical Issues in Information Management
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('8886ec70-db30-591b-be11-4085b1169cfd','content','Data Privacy and Protection (RA 10173)',$md$
The Philippine **Data Privacy Act of 2012 (RA 10173)** protects personal data. It requires organizations to secure personal information and notify individuals if their data is breached. Key points: **consent** is needed to collect personal data; **sensitive personal info** (health, biometrics) has stricter rules; individuals have rights to access and correct their data. In an exam, mention **NPC (National Privacy Commission)** guidelines. For example, a school's database of students must be protected; only authorized staff should view grades or personal records. Violating the law can lead to fines or jail, so compliance is a big concern in information management.
$md$, 1),
('8886ec70-db30-591b-be11-4085b1169cfd','content','Intellectual Property and Copyright',$md$
Databases themselves can be copyrighted if there is substantial original content. Copying a proprietary database or its schema without permission can violate copyright laws. In practice, this means you cannot legally copy an entire software vendor's database design, but relying on public standards (like SQL syntax) is fine. Also, be aware of **software licenses** (using Oracle or MySQL under the right license). In exams, this topic might appear as "discuss ethical issues," where you can mention piracy or respecting database ownership.
$md$, 2),
('8886ec70-db30-591b-be11-4085b1169cfd','activity','Ethical Data Use and Security',$md$
Beyond laws, information managers must act ethically. This means not abusing data (e.g. not selling contact lists without consent), and ensuring fairness (avoiding biased algorithms). Security-wise, encrypting sensitive columns (like ID numbers or credit card numbers) is best practice. Some professors ask what *not* to do – common mistakes include insecure default passwords or sharing accounts. Use the **principle of least privilege** (users get only the access they need).
$md$, 3),
('8886ec70-db30-591b-be11-4085b1169cfd','activity','Records Management Laws (P.D. 1728, R.A. 9470)',$md$
Certain records have mandated retention periods. For example, presidential papers and historical documents must go to the National Archives. In business, R.A. 8291 (GSIS) and BIR regulations specify how long payroll, tax returns, etc. are kept. Nowadays, many records are electronic, but even digital files must follow these rules. Information managers should know basic retention rules (e.g., BIR requires 10-year retention of tax books). In exams, a question might list record types and ask how long to keep them according to law.

*Ready to apply this? The practice set below walks through exam-style problems with step-by-step solutions and a live coding playground.*
$md$, 4);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('8886ec70-db30-591b-be11-4085b1169cfd','activity','Practice & Exam Drills, Lesson 10',$md$
**Review Questions**

1. What does the Data Privacy Act (RA 10173) require organizations to do with personal data?
2. Give two examples of sensitive personal information under Philippine law.
3. Name a type of record and how long it must be retained according to Philippine regulations (e.g., tax records).

**Worked Problems (Exam-Style)**

**[Scenario]** A hospital's patient database was hacked. What steps must the hospital take under RA 10173, and what are the possible penalties for violating the law?

*Solution:* They must inform the NPC and affected patients. Possible penalties include fines (up to ₱5 million) or imprisonment, depending on the offense.

**[Ethical]** If you find a security flaw that exposes student grades, what should you do?

*Solution:* Report it immediately to the responsible authority. It is unethical (and illegal) to exploit or share this vulnerability. Following the responsible disclosure policy is expected.

**[Records Retention]** A university has alumni grades from 1990. Suppose academic records become archival property after 50 years. When can these be transferred to archives?

*Solution:* If 1990 was the graduation year, then in 2040 they may be transferred to archives; disposal only follows the National Archives' approval.

**Hands-On Exercises** (mostly conceptual)

1. (Policy Summary) Write a one-paragraph data privacy policy for a small business that collects customer emails. Include consent and security measures.
2. (Compliance Check) List the personal data fields (e.g., name, email, birthdate) in a Student table. For each, decide if it's personal information and who can view it under a good privacy policy.

**How to Pass Legal/Ethical Topics**

- Explicitly mention RA 10173 when asked about privacy or security laws in the Philippines. Include key terms (consent, NPC, breach notification).
- Ethics questions often have "explain what you should do" answers. Show awareness of confidentiality and professional standards.
- For retention questions, link them to actual laws or regulations if possible. If unsure, say "as per guidelines" to show you recall that such rules exist.
$md$, 5, 'sql', $code$-- This lesson is conceptual, no SQL is strictly required.
-- You may still explore the sample Student table to reason about personal data:
CREATE TABLE Student (student_id INT PRIMARY KEY, name VARCHAR(50), program VARCHAR(50), year INT, dept_id INT);
INSERT INTO Student VALUES (1,'Juan dela Cruz','BSIT',3,2),(2,'Maria Santos','BSCS',2,1);

-- Which columns count as personal information under RA 10173?
-- Try: SELECT name FROM Student;  -- 'name' is personal data; restrict who can read it.$code$);

-- ============================================================
-- SOURCES
-- CHED CMO 25 s.2015, revised policies for BSIT/BSIS/BSCS (Information Management course specification)
-- Polytechnic University of the Philippines, BSIT program description
-- Cavite State University, Information Management (BSIT 2D) course summary
-- Isabela State University, IT221 Information Management syllabus (2nd Sem SY 2023–2024)
-- ============================================================
