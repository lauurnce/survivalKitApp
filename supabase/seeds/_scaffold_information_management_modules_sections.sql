-- ============================================================
-- Information Management — Modules & Sections
-- Subject ID: 20000000-0002-0002-0001-000000000003
-- 2nd Year, Semester 2 — major
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
('9ae38391-0460-5ea5-a8f2-2401ab1b110e','activity','Practice & Exam Drills — Lesson 1',$md$
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

- **STUDENT** — `student_id` (PK), `name`, `program`, `year`
- **ENROLLMENT** — `enrollment_id` (PK), `student_id` (FK), `course_id` (FK), `semester`, `year`, `grade`
- **COURSE** — `course_id` (PK), `course_name`, `credits`

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
('458c437f-cf15-591b-8a21-a0899a839158','activity','Practice & Exam Drills — Lesson 2',$md$
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

*Solution:* Redundancy — StudentName repeats for each Exam. Fix by separating STUDENT into its own table (StudentID, StudentName), and have the grade table reference StudentID only.

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

