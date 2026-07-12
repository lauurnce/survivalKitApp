-- ============================================================
-- Database Administration, Modules & Sections
-- Subject ID: 0a7947c5-6b9d-4a9c-8980-3d4187ec8d82
-- 3rd Year, Semester 1, major
--
-- Free/paid split: per lesson, sections 1-2 are FREE (kind='content'),
-- section 3 + the practice drills are PAID (kind='activity').
-- Re-running is safe (the DELETE clears prior rows for this subject).
-- ============================================================

DELETE FROM modules WHERE subject_id = '0a7947c5-6b9d-4a9c-8980-3d4187ec8d82';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('65311dcc-72f1-50c9-80de-3f200a73f099','0a7947c5-6b9d-4a9c-8980-3d4187ec8d82','Lesson 1: Foundations of Database Administration','lesson-1-foundations-of-database-administration',1),
  ('db58ec7e-702f-569a-96e8-0bb0740187a3','0a7947c5-6b9d-4a9c-8980-3d4187ec8d82','Lesson 2: Logical Design, Normalization, and Metadata Control','lesson-2-logical-design-normalization-metadata',2),
  ('13310768-cc33-5dfc-9388-2e853ba6766c','0a7947c5-6b9d-4a9c-8980-3d4187ec8d82','Lesson 3: Physical Storage, File Organization, and Indexing','lesson-3-physical-storage-file-organization-indexing',3),
  ('59f57eb3-cab9-5bbe-bd26-7880e4e43763','0a7947c5-6b9d-4a9c-8980-3d4187ec8d82','Lesson 4: Administrative SQL and Schema Objects','lesson-4-administrative-sql-schema-objects',4),
  ('32c49f63-b4f0-50b1-8297-4a4c762514fd','0a7947c5-6b9d-4a9c-8980-3d4187ec8d82','Lesson 5: Transactions, Concurrency Control, and Recovery Basics','lesson-5-transactions-concurrency-recovery',5),
  ('eeadbcc4-8c57-57c5-ae6c-e645a339b44f','0a7947c5-6b9d-4a9c-8980-3d4187ec8d82','Lesson 6: Backup, Restore, Availability, and Disaster Recovery','lesson-6-backup-restore-availability-disaster-recovery',6),
  ('8e3f6912-f3d9-5fe2-919e-13fd37628889','0a7947c5-6b9d-4a9c-8980-3d4187ec8d82','Lesson 7: Security, Access Control, Auditing, and Data Privacy','lesson-7-security-access-control-auditing-privacy',7),
  ('369553ac-ecd5-5dc7-8a94-3538e96c8e0c','0a7947c5-6b9d-4a9c-8980-3d4187ec8d82','Lesson 8: Monitoring, Performance Tuning, and Capacity Planning','lesson-8-monitoring-performance-tuning-capacity-planning',8);

-- ============================================================
-- LESSON 1: Foundations of Database Administration
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('65311dcc-72f1-50c9-80de-3f200a73f099','content','The DBA Role in an Organization',$md$
Database Administration is the discipline of keeping a database available, secure, correct, and fast enough for real work. In a class on programming, your main concern is often whether your code runs. In Database Administration, the concern is wider: Can users trust the data? Can the system recover after failure? Can it handle growth?

A Database Administrator (DBA) usually works on these responsibilities:

- installing and configuring the DBMS
- creating and maintaining databases and users
- enforcing security and access rules
- designing backup and recovery procedures
- monitoring performance
- tuning storage, queries, and indexes
- planning for capacity, maintenance, and high availability

In Philippine settings, think of a student information system, an LGU records system, a payroll platform, or a hospital registry. The database is not just a file cabinet. It is a core service. If it goes down, enrollment stops, payroll is delayed, or records become unreliable.

A useful way to remember the DBA mindset is this:

> Developers build features. DBAs protect service quality.

That does not mean the DBA works alone. The DBA collaborates with system analysts, developers, network administrators, security officers, and management. In many organizations, especially smaller ones, one person may wear multiple hats. Still, the administration perspective remains distinct because it focuses on continuity, control, and operational readiness.

A strong DBA balances four goals:

- **Integrity**, the data stays correct and consistent
- **Availability**, the database stays usable when needed
- **Security**, only the right people can access the right data
- **Performance**, transactions and reports finish in acceptable time
$md$, 1),

('65311dcc-72f1-50c9-80de-3f200a73f099','content','How a Database System Is Organized',$md$
A database system has several layers, and a DBA must understand how they fit together.

At the top are the users and applications. These may be web apps, mobile apps, desktop systems, or reporting tools. They do not usually touch data files directly. Instead, they send requests to the Database Management System (DBMS).

The DBMS handles major services such as:

- parsing SQL statements
- checking permissions
- reading and writing data
- enforcing constraints
- managing transactions
- controlling concurrent access
- writing logs for recovery

Under the DBMS are the physical files, memory structures, and storage devices where data is actually stored.

You should also distinguish common database objects:

| Object | Purpose |
|---|---|
| Database | The overall container of related data |
| Table | Stores rows and columns |
| View | A virtual table based on a query |
| Index | Speeds up data access for certain searches |
| Constraint | Enforces rules such as keys and valid values |
| Transaction log | Records changes for recovery |
| User / Role | Controls access permissions |
| Backup copy | Restorable copy of data and sometimes logs |

A DBA also works across environments:

- **development**, where systems are built and tested
- **testing / staging**, where changes are validated before release
- **production**, the live environment serving actual users

This separation matters because unsafe testing in production can damage real data. In practice, one of the earliest signs of good administration is discipline in environments, naming, and change control.
$md$, 2),

('65311dcc-72f1-50c9-80de-3f200a73f099','activity','The Database Administration Lifecycle',$md$
Database Administration is not one single task. It is a lifecycle.

A typical administration cycle looks like this:

1. **Plan**, Understand requirements, workload, security needs, and expected growth.
2. **Design**, Review schema, constraints, indexing strategy, and storage layout.
3. **Implement**, Create objects, configure accounts, apply permissions, load initial data.
4. **Operate**, Monitor health, capacity, locks, slow queries, and usage patterns.
5. **Protect**, Run backups, verify recoverability, harden access, audit activity.
6. **Improve**, Tune performance, archive old data, revise indexes, adjust policies.

Students often imagine database work as "write SQL and done." Real administration is more like managing a living service. Even a correct schema can fail in production if backups are missing, permissions are too broad, or the indexes no longer match the workload.

You should also think in terms of risk:

- hardware failure
- accidental delete or update
- application bug
- unauthorized access
- poor performance during peak use
- data growth beyond expected storage

A DBA reduces these risks through standards, routines, and testing. Administration becomes professional when tasks are repeatable, not improvised.
$md$, 3);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('65311dcc-72f1-50c9-80de-3f200a73f099','activity','Practice & Exam Drills, Lesson 1',$md$
**Review Questions**

1. What is the main difference between a developer's perspective and a DBA's perspective?
2. Why should development, testing, and production be separated?
3. Give four core responsibilities of a DBA.
4. What does the DBMS do between the application and the data files?
5. Why is a transaction log important?
6. What is the difference between a table and a view?
7. Why is index management considered an administration concern?
8. What does "availability" mean in database administration?

**Worked Exam-Style Problems**

**Problem 1.** A university office says: "Our database is correct, so we don't need a DBA." Explain why this statement is incomplete.

*Step-by-step solution*
1. A correct schema is only one part of database success.
2. The database must also remain available to users, secure from unauthorized access, recoverable after failure, and fast enough during real workloads.
3. These are operational concerns, not just design concerns.
4. Therefore, a DBA is needed to manage the database after design and deployment.

*Final answer:* The statement is incomplete because correctness alone does not guarantee service quality. A DBA is needed for security, backups, recovery, monitoring, tuning, and availability.

**Problem 2.** Classify each task as primarily Development or Administration: writing the enrollment module; creating user accounts; tuning a slow reporting query; defining business rules for student data entry; scheduling nightly backups; checking failed login attempts.

*Step-by-step solution*
- writing the enrollment module → Development
- creating user accounts → Administration
- tuning a slow reporting query → usually Administration
- defining business rules for student data entry → Development / Systems Analysis
- scheduling nightly backups → Administration
- checking failed login attempts → Administration

*Final answer:* Administration focuses on security, reliability, recovery, and performance in operation.

**Hands-on Exercise**

Use the `systems` table in the playground.

1. Show all systems in the production environment.
2. Count how many systems belong to each environment.
3. Update the ClinicDB environment from testing to production.
4. Display only the `system_name` and `owner_unit` of active systems.

*Suggested solution path*
```sql
SELECT * FROM systems WHERE environment = 'production';

SELECT environment, COUNT(*) AS total_systems
FROM systems
GROUP BY environment;

UPDATE systems
SET environment = 'production'
WHERE system_name = 'ClinicDB';

SELECT system_name, owner_unit
FROM systems
WHERE status = 'active';
```

**How to Pass This Topic**

- Memorize the four priorities: integrity, availability, security, performance.
- Expect short essays asking you to compare developer vs DBA roles.
- Professors often ask for examples from real organizations, not just textbook definitions.
- Do not define the database and DBMS as the same thing. They are related but not identical.
- In identification quizzes, be ready to define table, view, index, transaction log, backup, user, role clearly and briefly.
$md$, 4, 'sql', $code$CREATE TABLE systems (
    system_id INTEGER PRIMARY KEY,
    system_name VARCHAR(50),
    owner_unit VARCHAR(50),
    environment VARCHAR(20),
    status VARCHAR(20)
);

INSERT INTO systems VALUES
(1, 'EnrollmentDB', 'Registrar', 'production', 'active'),
(2, 'PayrollDB', 'HR', 'production', 'active'),
(3, 'ClinicDB', 'Health Services', 'testing', 'active'),
(4, 'LibraryDB', 'Library', 'development', 'active');$code$);

-- ============================================================
-- LESSON 2: Logical Design, Normalization, and Metadata Control
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('db58ec7e-702f-569a-96e8-0bb0740187a3','content','From Business Rules to Relational Design',$md$
Good administration starts before performance tuning. It starts with a schema that reflects business rules clearly.

Suppose a school says:

- one student can enroll in many subjects
- one subject can have many students
- each enrollment has a grade
- each student belongs to one program

These statements become part of the logical design. In a relational database, we usually represent them with tables, keys, and constraints.

A simple design may look like this:

```
students(student_id, student_name, program_code)
subjects(subject_code, subject_title, units)
enrollments(student_id, subject_code, term_code, grade)
```

The `enrollments` table resolves the many-to-many relationship between students and subjects.

A DBA does not always create the business model from scratch, but the DBA must be able to read and evaluate the model. Weak design creates long-term operational problems such as:

- duplicate data
- inconsistent updates
- difficult reporting
- wasted storage
- unclear constraints

That is why logical design and administration are connected. A badly designed table may still work at first, but it becomes harder to secure, index, and maintain as the database grows.
$md$, 1),

('db58ec7e-702f-569a-96e8-0bb0740187a3','content','Functional Dependence and Normalization',$md$
Normalization is the process of organizing tables so that data is stored with fewer unnecessary duplicates and clearer dependencies.

The core idea is this: a fact should be stored in the table where it naturally belongs.

Look at this bad table:

```
student_id  student_name  program_name  subject_code  subject_title  instructor_name
```

This mixes student facts, subject facts, and teaching facts in one place. The result is repetition. If `subject_title` changes, many rows must be updated. If one update is missed, the database becomes inconsistent.

Normalization addresses this using forms such as:

- **First Normal Form (1NF)**, values are atomic; no repeating groups
- **Second Normal Form (2NF)**, non-key attributes depend on the whole key
- **Third Normal Form (3NF)**, non-key attributes do not depend on other non-key attributes

A practical DBA should know the symptoms of poor normalization:

- same descriptive values repeated in many rows
- update anomalies
- insert anomalies
- delete anomalies

Normalization is not about making unlimited small tables. It is about choosing a structure that protects integrity while still supporting performance and reporting.
$md$, 2),

('db58ec7e-702f-569a-96e8-0bb0740187a3','activity','Constraints, Naming Standards, and the Data Dictionary',$md$
A schema becomes administratively strong when it is not only normalized but also well controlled. Three control tools are especially important.

### Constraints

Constraints turn business rules into enforceable rules. Examples:

- `PRIMARY KEY`, each row has a unique identifier
- `FOREIGN KEY`, references only valid parent rows
- `NOT NULL`, value is required
- `UNIQUE`, duplicates not allowed
- `CHECK`, values must satisfy a condition

Without constraints, applications may insert invalid data and the database stops being trustworthy.

### Naming standards

A database should use consistent names. For example:

- table names in plural or singular, but one style only
- key names like `student_id`, `subject_code`
- junction tables named clearly, such as `enrollments`
- no vague column names like `data1`, `desc`, or `misc`

Consistent naming helps administration, debugging, and onboarding.

### Data dictionary and metadata

The data dictionary is documentation about the data:

- table meanings
- column meanings
- data types
- constraints
- owners
- allowed values
- dependencies

Metadata matters because administration is not just about storing data; it is about understanding what the data means. In larger systems, undocumented structures become a serious maintenance risk.
$md$, 3);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('db58ec7e-702f-569a-96e8-0bb0740187a3','activity','Practice & Exam Drills, Lesson 2',$md$
**Review Questions**

1. Why is normalization relevant to database administration?
2. What problem does a junction table solve?
3. Differentiate 1NF, 2NF, and 3NF in simple terms.
4. What is an update anomaly?
5. Why are foreign keys important?
6. What is metadata?
7. Give two examples of poor naming practice.
8. Why is documentation important even if the SQL already exists?

**Worked Exam-Style Problems**

**Problem 1.** A table stores: `student_id, student_name, subject_code, subject_title, instructor_name, instructor_office`. Explain why this design is problematic and give a better decomposition.

*Step-by-step solution*
1. Student information and subject information are mixed in one table.
2. Instructor information repeats every time the subject appears.
3. If an instructor changes office, many rows must be updated.
4. Better design separates entities.

*Better decomposition*
```
students(student_id, student_name)
subjects(subject_code, subject_title, instructor_id)
instructors(instructor_id, instructor_name, instructor_office)
enrollments(student_id, subject_code, term_code)
```

*Final answer:* The original design causes redundancy and update anomalies. Breaking it into students, subjects, instructors, and enrollments reduces duplication and improves control.

**Problem 2.** Why is `grade` acceptable in `enrollments`, but `student_name` is not?

*Step-by-step solution*
1. The purpose of `enrollments` is to record the relationship between a student and a subject in a term.
2. `grade` belongs to that relationship.
3. `student_name` belongs to the student entity, not to the enrollment event.
4. Therefore, `grade` should stay in `enrollments`, while `student_name` should stay in `students`.

**Hands-on Exercise**

1. List all enrolled students with their subject titles.
2. Show all students who took Database Administration.
3. Attempt to insert an enrollment for a nonexistent student. Observe why the foreign key matters.
4. Add a new subject called Systems Administration with 3 units.

*Suggested solution path*
```sql
SELECT s.student_name, sub.subject_title, e.term_code, e.grade
FROM enrollments e
JOIN students s ON e.student_id = s.student_id
JOIN subjects sub ON e.subject_code = sub.subject_code;

SELECT s.student_name
FROM enrollments e
JOIN students s ON e.student_id = s.student_id
WHERE e.subject_code = 'IT331';

-- This should fail if foreign keys are enforced:
INSERT INTO enrollments VALUES (99, 'IT331', '2026-1', 2.00);

INSERT INTO subjects VALUES ('IT333', 'Systems Administration', 3);
```

**How to Pass This Topic**

- In design questions, always ask: Where does this fact naturally belong?
- Professors often reward students who mention anomalies correctly.
- Do not memorize normalization as abstract theory only. Apply it to a messy table.
- If asked to justify decomposition, use the language of redundancy, integrity, and maintainability.
- Many exams include one item on keys and constraints. Identify PK, FK, and probable CHECK rules confidently.
$md$, 4, 'sql', $code$CREATE TABLE students (
    student_id INTEGER PRIMARY KEY,
    student_name VARCHAR(50) NOT NULL,
    program_code VARCHAR(10) NOT NULL
);

CREATE TABLE subjects (
    subject_code VARCHAR(10) PRIMARY KEY,
    subject_title VARCHAR(50) NOT NULL,
    units INTEGER NOT NULL CHECK (units > 0)
);

CREATE TABLE enrollments (
    student_id INTEGER,
    subject_code VARCHAR(10),
    term_code VARCHAR(10),
    grade DECIMAL(4,2),
    PRIMARY KEY (student_id, subject_code, term_code),
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (subject_code) REFERENCES subjects(subject_code)
);

INSERT INTO students VALUES
(1, 'Ana Cruz', 'BSIT'),
(2, 'Marco Reyes', 'BSIT');

INSERT INTO subjects VALUES
('IT331', 'Database Administration', 3),
('IT332', 'Networking 2', 3);

INSERT INTO enrollments VALUES
(1, 'IT331', '2026-1', 1.75),
(2, 'IT331', '2026-1', 2.25),
(1, 'IT332', '2026-1', 2.00);$code$);

-- ============================================================
-- LESSON 3: Physical Storage, File Organization, and Indexing
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('13310768-cc33-5dfc-9388-2e853ba6766c','content','Why Physical Design Matters',$md$
Logical design answers *what* data should exist. Physical design answers *how* that data is stored and accessed efficiently.

A database may have correct tables and still perform poorly if the physical design is weak. This is where a DBA starts thinking about:

- data pages and blocks
- file organization
- storage allocation
- access paths
- indexes

At a simple level, when the DBMS stores table data, it places rows into storage structures. Reading the needed rows may involve scanning many pages or using shortcuts such as indexes.

A full table scan is sometimes acceptable, especially for small tables. But for large operational tables like payments, admissions, or transactions, repeated full scans can overload the system.

Physical design is a trade-off:

- more indexes may improve reads
- but extra indexes usually slow inserts, updates, and deletes
- wide rows may reduce joins
- but also increase storage and I/O cost

The DBA's job is not to "add indexes everywhere." The DBA studies workload patterns first.
$md$, 1),

('13310768-cc33-5dfc-9388-2e853ba6766c','content','Indexes and Access Paths',$md$
An index is a structure that helps the DBMS locate rows faster for certain search conditions.

A common analogy is a book index. Instead of reading every page to find a topic, you check the index and jump closer to the target.

Indexes are especially useful for:

- equality filters such as `WHERE student_id = 101`
- range filters such as `WHERE payment_date >= '2026-06-01'`
- join columns
- columns used in sorting or grouping

But indexes are not magic. They work best when:

- the column is selective enough
- the query actually uses that column in a searchable way
- the workload justifies the maintenance cost

Example:

```sql
SELECT *
FROM payments
WHERE student_id = 101;
```

An index on `student_id` is often useful here.

But if you write:

```sql
WHERE UPPER(student_name) = 'ANA CRUZ'
```

the DBMS may not use a basic index on `student_name` efficiently, depending on the system and index type.

DBAs also consider composite indexes, where multiple columns are indexed together. These can be powerful, but the column order matters.
$md$, 2),

('13310768-cc33-5dfc-9388-2e853ba6766c','activity','Choosing a Good Physical Design',$md$
A good physical design starts from workload questions:

- Which queries run most often?
- Which reports take too long?
- Which tables receive heavy inserts?
- Which columns appear repeatedly in joins and filters?
- Which data is historical and which is high-traffic?

Some practical guidelines:

**Index columns often used for joins and lookups.** Foreign keys and search fields are common index candidates.

**Avoid unnecessary indexes.** Every extra index adds maintenance overhead.

**Keep row size reasonable.** Very wide tables waste storage and increase I/O.

**Archive old data when needed.** Huge transactional tables may need partitioning or archiving strategies.

**Revisit design after workload changes.** A good design for 5,000 rows may fail at 5 million rows.

DBA work becomes stronger when physical design decisions are based on evidence, not guesses. That is why monitoring and query analysis are important later in the course.
$md$, 3);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('13310768-cc33-5dfc-9388-2e853ba6766c','activity','Practice & Exam Drills, Lesson 3',$md$
**Review Questions**

1. Why is physical design different from logical design?
2. What problem does an index solve?
3. Why can too many indexes be harmful?
4. Give two kinds of queries that usually benefit from indexing.
5. What is a composite index?
6. Why should a DBA study workload before adding indexes?
7. What is archiving?
8. Why can a full scan still be acceptable sometimes?

**Worked Exam-Style Problems**

**Problem 1.** A table `payments` is queried heavily by `student_id`, but inserts happen all day. Should you create an index on `student_id`? Explain.

*Step-by-step solution*
1. The column is frequently used in lookups.
2. That makes it a strong index candidate.
3. However, inserts happen all day, and every insert also updates the index.
4. So the DBA should compare the read benefit against the write overhead.
5. If lookups are frequent and important, the index is usually justified.

*Final answer:* Yes, an index on `student_id` is usually justified if the system frequently searches payments by student ID. The DBA must still consider insert overhead and test the workload.

**Problem 2.** Choose the more appropriate index for this query:
```sql
SELECT *
FROM payments
WHERE payment_date BETWEEN '2026-06-01' AND '2026-06-30';
```

*Step-by-step solution*
1. The filter uses a date range.
2. A date index supports range access better than an unrelated column.
3. Therefore an index on `payment_date` is the better fit.

*Final answer:* Use an index on `payment_date`.

**Hands-on Exercise**

1. List all payments of student 101.
2. Show all June payments with amount greater than 2000.
3. Count payments by status.
4. Create a composite index on `(status, payment_date)` and explain what kind of query it may help.

*Suggested solution path*
```sql
SELECT *
FROM payments
WHERE student_id = 101;

SELECT *
FROM payments
WHERE payment_date BETWEEN '2026-06-01' AND '2026-06-30'
  AND amount > 2000;

SELECT status, COUNT(*) AS total
FROM payments
GROUP BY status;

CREATE INDEX idx_payments_status_date
ON payments(status, payment_date);
```

**How to Pass This Topic**

- In exams, always connect indexes to specific queries.
- Avoid the common mistake: "More indexes always mean better performance." That is false.
- When asked to recommend an index, mention the filter, join, or sort column.
- Many professors give scenario questions. Use the phrase *read performance vs write overhead*.
- Be ready to distinguish logical design errors from physical tuning issues.
$md$, 4, 'sql', $code$CREATE TABLE payments (
    payment_id INTEGER PRIMARY KEY,
    student_id INTEGER,
    payment_date DATE,
    amount DECIMAL(10,2),
    status VARCHAR(20)
);

INSERT INTO payments VALUES
(1, 101, '2026-06-01', 3500.00, 'PAID'),
(2, 102, '2026-06-02', 4200.00, 'PAID'),
(3, 101, '2026-06-15', 1500.00, 'PARTIAL'),
(4, 103, '2026-06-20', 5000.00, 'PAID'),
(5, 104, '2026-06-25', 2800.00, 'UNPAID');

CREATE INDEX idx_payments_student_id ON payments(student_id);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);$code$);

-- ============================================================
-- LESSON 4: Administrative SQL and Schema Objects
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('59f57eb3-cab9-5bbe-bd26-7880e4e43763','content','DDL, DML, and Administrative Control',$md$
A DBA must know SQL not only for querying data, but also for controlling database structures.

Three categories are especially important:

| Category | Meaning | Common commands |
|---|---|---|
| DDL | Data Definition Language | `CREATE`, `ALTER`, `DROP` |
| DML | Data Manipulation Language | `INSERT`, `UPDATE`, `DELETE`, `SELECT` |
| TCL | Transaction Control Language | `COMMIT`, `ROLLBACK`, `SAVEPOINT` |

For database administration, DDL is central because schema changes affect the whole system. Creating a table is easy in class. In production, it requires more care:

- Is the table name consistent?
- Are constraints included?
- Will it affect existing applications?
- Is there a rollback plan?

A careless `ALTER TABLE` can break reports, increase downtime, or invalidate application code. That is why DBAs prefer controlled changes, documented versions, and test validation before production release.
$md$, 1),

('59f57eb3-cab9-5bbe-bd26-7880e4e43763','content','Views, Stored Routines, and Triggers',$md$
Schema objects help organize logic and control access.

### Views

A view is a saved query presented like a table. Views are useful when:

- you want users to see only selected columns
- you want to simplify repeated joins
- you want to enforce a more stable interface for reports

Example idea: a cashier may need student balances, but not confidential profile details.

### Stored routines

Depending on the DBMS, you may create stored procedures or functions. These package SQL logic on the server side. DBAs care about them because they affect:

- maintainability
- consistency
- permissions
- performance patterns

### Triggers

A trigger runs automatically when an event occurs, such as an insert or update. Triggers can support:

- audit logging
- automatic timestamps
- rule enforcement

But triggers should be used carefully. Hidden automatic behavior can make systems harder to debug. A DBA should ask whether the logic is truly best placed in the database.
$md$, 2),

('59f57eb3-cab9-5bbe-bd26-7880e4e43763','activity','Change Management and Data Quality Checks',$md$
Administration SQL is not only about creating new objects. It is also about changing them safely and verifying data quality.

Good schema change practice includes:

- write the change script clearly
- test it in a non-production environment
- back up the affected database or objects
- schedule deployment carefully
- validate the result after execution
- prepare rollback steps if possible

A DBA also writes SQL for validation tasks such as:

- finding nulls in required columns
- checking orphan child rows
- detecting duplicate values
- verifying totals before and after a migration

Example data-quality query:

```sql
SELECT student_id, COUNT(*)
FROM students
GROUP BY student_id
HAVING COUNT(*) > 1;
```

Even when applications already validate input, DBAs should still check the database directly. Trust is important, but verification is better.
$md$, 3);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('59f57eb3-cab9-5bbe-bd26-7880e4e43763','activity','Practice & Exam Drills, Lesson 4',$md$
**Review Questions**

1. Why is DDL especially important for DBAs?
2. What is the difference between DDL and DML?
3. What is a view?
4. Give one advantage and one risk of triggers.
5. Why should schema changes be tested first?
6. What is rollback in change management?
7. Why do DBAs run data-quality queries?
8. When might a view be better than giving direct table access?

**Worked Exam-Style Problems**

**Problem 1.** A professor asks: "Why is `ALTER TABLE` in production riskier than `SELECT` in production?"

*Step-by-step solution*
1. `SELECT` reads data without changing structure.
2. `ALTER TABLE` changes structure shared by applications and users.
3. Structural changes may fail, lock objects, or break compatibility.
4. Therefore, `ALTER TABLE` carries wider operational risk.

*Final answer:* `ALTER TABLE` is riskier because it changes the schema itself, which can affect applications, performance, locking, and compatibility, while `SELECT` is usually read-only.

**Problem 2.** A report user only needs `student_id`, `student_name`, and `program_code`. Should you give direct full-table access or create a view?

*Step-by-step solution*
1. The user needs limited data only.
2. Direct table access exposes unnecessary columns like email or future sensitive fields.
3. A view can restrict the visible columns.
4. This supports least privilege and cleaner reporting.

*Final answer:* Create a view that exposes only the required columns.

**Hands-on Exercise**

1. Add a `created_at` column to students.
2. Create a view named `student_directory` showing only `student_id`, `student_name`, and `program_code`.
3. Find all students with missing email addresses.
4. Update the missing email of Lia Santos.

*Suggested solution path*
```sql
ALTER TABLE students
ADD COLUMN created_at DATE;

CREATE VIEW student_directory AS
SELECT student_id, student_name, program_code
FROM students;

SELECT *
FROM students
WHERE email IS NULL;

UPDATE students
SET email = 'lia@school.edu'
WHERE student_id = 3;
```

**How to Pass This Topic**

- Memorize command classes: DDL, DML, TCL.
- In practical exams, read the requirement carefully before writing `ALTER` statements.
- For essay questions, emphasize controlled change, testing, and rollback planning.
- Use views in answers when the scenario involves limited access or simplified reporting.
- Common mistake: forgetting constraints and documentation when creating new objects.
$md$, 4, 'sql', $code$CREATE TABLE students (
    student_id INTEGER PRIMARY KEY,
    student_name VARCHAR(50),
    program_code VARCHAR(10),
    email VARCHAR(60)
);

INSERT INTO students VALUES
(1, 'Ana Cruz', 'BSIT', 'ana@school.edu'),
(2, 'Marco Reyes', 'BSIT', 'marco@school.edu'),
(3, 'Lia Santos', 'BSCS', NULL);$code$);

-- ============================================================
-- LESSON 5: Transactions, Concurrency Control, and Recovery Basics
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('32c49f63-b4f0-50b1-8297-4a4c762514fd','content','Why Transactions Matter',$md$
A transaction is a logical unit of work that should either complete properly or not take effect at all.

Example: during enrollment, the system may need to:

- add the student's subject record
- update available slots
- record assessment data

If the first two steps succeed but the third fails, the database may become inconsistent. Transactions prevent this by grouping related operations.

The classic properties of transactions are called **ACID**:

- **Atomicity**, all or nothing
- **Consistency**, valid state before and after
- **Isolation**, concurrent work should not interfere improperly
- **Durability**, committed work survives failures

For DBAs, transactions are essential because they connect application behavior to correctness, locking, logging, and recovery.
$md$, 1),

('32c49f63-b4f0-50b1-8297-4a4c762514fd','content','Concurrency Problems and Isolation',$md$
In real systems, many users act at the same time. This is called concurrency. Without proper control, one user's action can interfere with another's.

Common anomalies include:

**Lost update**, Two users read the same row, both modify it, and one update overwrites the other.

**Dirty read**, A transaction reads data written by another transaction that has not yet committed.

**Non-repeatable read**, A transaction reads the same row twice and gets different values because another transaction changed it in between.

**Phantom read**, A transaction reruns a query and finds new rows added by another transaction.

DBMSs manage these issues through locking, timestamps, or other concurrency methods, and expose different isolation levels. Higher isolation can increase correctness but may reduce concurrency and speed.

A DBA must understand that performance tuning is not only about speed. Sometimes the correct question is:

> "What level of isolation does this business process really need?"
$md$, 2),

('32c49f63-b4f0-50b1-8297-4a4c762514fd','activity','Logging, Checkpoints, and Recovery Concepts',$md$
Databases recover from failure using logs and recovery mechanisms.

A transaction log records important changes. If a crash occurs, the DBMS can use the log to decide:

- which committed changes must be redone
- which incomplete changes must be undone

A checkpoint helps mark a known recovery position so the system does not need to scan the entire history unnecessarily.

Basic recovery situations include:

- transaction failure
- system crash
- media failure
- user error

The DBA's role is to understand recovery logic well enough to support backup strategy, restore procedures, and incident response. Recovery is not magic. It depends on planned logging and tested procedures.
$md$, 3);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('32c49f63-b4f0-50b1-8297-4a4c762514fd','activity','Practice & Exam Drills, Lesson 5',$md$
**Review Questions**

1. What is a transaction?
2. What does atomicity mean?
3. Give one example of consistency in a school or payroll system.
4. What is a dirty read?
5. What is a lost update?
6. Why can higher isolation reduce performance?
7. What is the purpose of the transaction log?
8. What is a checkpoint?

**Worked Exam-Style Problems**

**Problem 1.** Transfer ₱5,000 from Registrar Collections to Scholarship Fund. Explain why the update must be inside one transaction.

*Step-by-step solution*
1. The transfer has two dependent actions: subtract from account 1, add to account 2.
2. If only one action succeeds, balances become incorrect.
3. A transaction ensures both succeed together or both are cancelled.

*Example SQL*
```sql
BEGIN;

UPDATE account_balance
SET balance = balance - 5000
WHERE account_id = 1;

UPDATE account_balance
SET balance = balance + 5000
WHERE account_id = 2;

COMMIT;
```

*Final answer:* The two updates must be in one transaction so the transfer is atomic and the balances remain consistent.

**Problem 2.** Transaction T1 updates a grade but has not committed yet. Transaction T2 reads that updated grade. What anomaly occurred, and why is it dangerous?

*Step-by-step solution*
1. T2 read uncommitted data from T1.
2. That is a dirty read.
3. If T1 later rolls back, then T2 acted on a value that never really became valid.
4. This can cause wrong reports or incorrect business decisions.

**Hands-on Exercise**

1. Display all account balances.
2. Simulate a transfer of ₱2,000 from account 1 to account 2 using `BEGIN` and `COMMIT`.
3. Write the same transfer again, but think about what should happen if the second update fails.
4. Compute the total balance before and after the transfer.

*Suggested solution path*
```sql
SELECT * FROM account_balance;

BEGIN;

UPDATE account_balance
SET balance = balance - 2000
WHERE account_id = 1;

UPDATE account_balance
SET balance = balance + 2000
WHERE account_id = 2;

COMMIT;

SELECT SUM(balance) AS total_balance
FROM account_balance;
```

**How to Pass This Topic**

- Always connect ACID to real scenarios, not memorized words alone.
- Many exams ask for anomaly identification. Practice the terms: dirty read, lost update, non-repeatable read, phantom read.
- When asked why logs matter, say *redo committed work and undo incomplete work*.
- If a process has multiple dependent updates, your answer should mention transaction boundaries.
- A common error is confusing durability with backup. Durability is about committed data surviving ordinary failure; backup is a broader protection strategy.
$md$, 4, 'sql', $code$CREATE TABLE account_balance (
    account_id INTEGER PRIMARY KEY,
    account_name VARCHAR(50),
    balance DECIMAL(10,2)
);

INSERT INTO account_balance VALUES
(1, 'Registrar Collections', 50000.00),
(2, 'Scholarship Fund', 30000.00);$code$);

-- ============================================================
-- LESSON 6: Backup, Restore, Availability, and Disaster Recovery
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('eeadbcc4-8c57-57c5-ae6c-e645a339b44f','content','Backup Is Not the Same as Recovery',$md$
Students often use "backup" and "recovery" as if they mean the same thing. They are related, but not identical.

- A **backup** is a copy used for restoration.
- **Recovery** is the process of bringing the database back to a required state after failure.

A good DBA asks not only, "Do we have backups?" but also:

- Can we actually restore them?
- How long will restore take?
- How much data can we afford to lose?
- Are logs available for point-in-time recovery?

Important backup ideas include:

- **full backup**, complete copy of the database
- **incremental backup**, captures changes since a baseline
- **differential backup**, captures changes since the last full backup
- **logical backup**, exports schema/data as logical statements or dumps
- **physical backup**, copies physical database files or blocks, depending on DBMS support

A backup that has never been tested is only a promise, not proof.
$md$, 1),

('eeadbcc4-8c57-57c5-ae6c-e645a339b44f','content','Restore Planning, RPO, and RTO',$md$
When organizations recover from failure, two measures are very important:

| Term | Meaning |
|---|---|
| RPO | Recovery Point Objective, how much data loss is acceptable |
| RTO | Recovery Time Objective, how long downtime can last |

Example:

- If an enrollment system has RPO = 15 minutes, the institution can tolerate at most 15 minutes of lost data.
- If it has RTO = 2 hours, the system must be restored within 2 hours.

These values shape the backup plan. A weekly backup alone is not enough for a system with strict RPO and RTO.

Restore planning should include:

- where backup files are stored
- who is authorized to restore
- what order steps must happen
- how to verify a successful restore
- how to communicate during incident response

DBAs are expected to think in service terms, not just file terms.
$md$, 2),

('eeadbcc4-8c57-57c5-ae6c-e645a339b44f','activity','High Availability and Disaster Recovery',$md$
**High availability (HA)** aims to reduce downtime. **Disaster recovery (DR)** prepares for serious failures such as site loss, major corruption, or infrastructure disaster.

Common HA/DR ideas include:

- standby servers
- replication
- failover systems
- offsite backups
- geographically separate recovery sites
- documented incident procedures

Do not confuse replication with backup. Replication copies current changes to another system, but if bad data or accidental deletes are replicated, the error may spread too. That is why backups are still required.

For a DBA, a mature protection plan usually combines:

- backups
- logs
- restore testing
- HA where needed
- DR procedures for worst-case events
$md$, 3);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('eeadbcc4-8c57-57c5-ae6c-e645a339b44f','activity','Practice & Exam Drills, Lesson 6',$md$
**Review Questions**

1. Differentiate backup and recovery.
2. What is a full backup?
3. What is an incremental backup?
4. Why must backups be verified?
5. What does RPO measure?
6. What does RTO measure?
7. Why is replication not a substitute for backup?
8. Why should backups be stored offsite or in the cloud?

**Worked Exam-Style Problems**

**Problem 1.** A school database can tolerate at most 30 minutes of data loss, and must be restored within 1 hour. State the RPO and RTO.

*Step-by-step solution*
1. "At most 30 minutes of data loss" refers to RPO.
2. "Must be restored within 1 hour" refers to RTO.

*Final answer:* RPO = 30 minutes; RTO = 1 hour.

**Problem 2.** A DBA says, "We replicate to another server, so we no longer need backups." Why is this incorrect?

*Step-by-step solution*
1. Replication copies current data changes.
2. If a user accidentally deletes rows, that delete may also replicate.
3. If corruption spreads, the standby may also become corrupted.
4. Backups are still needed for older restorable states and true recovery options.

*Final answer:* Replication improves availability, but it does not replace backup because bad changes can also be replicated.

**Hands-on Exercise**

1. Show all unverified backups.
2. Count backups by type.
3. List all backups stored in cloud storage.
4. Write a query that shows the latest backup date in the inventory.

*Suggested solution path*
```sql
SELECT *
FROM backup_inventory
WHERE verified = 'NO';

SELECT backup_type, COUNT(*) AS total
FROM backup_inventory
GROUP BY backup_type;

SELECT *
FROM backup_inventory
WHERE storage_location = 'Cloud Storage';

SELECT MAX(backup_date) AS latest_backup
FROM backup_inventory;
```

**How to Pass This Topic**

- Professors love asking RPO vs RTO. Master the distinction.
- In essay questions, write: *backup without restore testing is incomplete*.
- If asked to evaluate a protection strategy, mention both onsite and offsite copies.
- Do not say replication and backup are the same.
- In practical exams, expect inventory or reporting queries related to backup records.
$md$, 4, 'sql', $code$CREATE TABLE backup_inventory (
    backup_id INTEGER PRIMARY KEY,
    backup_date DATE,
    backup_type VARCHAR(20),
    storage_location VARCHAR(50),
    verified VARCHAR(5)
);

INSERT INTO backup_inventory VALUES
(1, '2026-06-20', 'FULL', 'Onsite NAS', 'YES'),
(2, '2026-06-21', 'INCREMENTAL', 'Onsite NAS', 'YES'),
(3, '2026-06-22', 'INCREMENTAL', 'Cloud Storage', 'NO'),
(4, '2026-06-23', 'FULL', 'Cloud Storage', 'YES');$code$);

-- ============================================================
-- LESSON 7: Security, Access Control, Auditing, and Data Privacy
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('8e3f6912-f3d9-5fe2-919e-13fd37628889','content','Security Principles for Database Administration',$md$
Database security is the protection of data against unauthorized access, misuse, disclosure, alteration, or destruction.

A DBA supports security using practical principles such as:

- **least privilege**, users get only the access they need
- **separation of duties**, sensitive powers are not concentrated unnecessarily
- **accountability**, actions can be traced
- **defense in depth**, combine controls, do not rely on only one

In actual environments, not every staff member should see complete records. For example:

- a cashier may see payment status
- a registrar may manage enrollment records
- a faculty member may view grades for assigned classes only
- a system operator may manage service status without seeing confidential student details

The DBA implements these boundaries through users, roles, permissions, and carefully designed views.
$md$, 1),

('8e3f6912-f3d9-5fe2-919e-13fd37628889','content','Authentication, Authorization, and Least Privilege',$md$
Two terms should be clear:

- **Authentication**, proving identity
- **Authorization**, deciding what that identity is allowed to do

After login, the DBMS checks permissions such as:

- `SELECT`
- `INSERT`
- `UPDATE`
- `DELETE`
- object creation rights
- administrative privileges

The safest practice is to assign permissions through roles, then assign roles to users. This is easier to maintain than granting rights one person at a time.

Examples of poor practice:

- shared admin accounts
- giving all users full access because it is "faster"
- allowing the application to connect as a superuser
- leaving old employee accounts active

A DBA should also protect service accounts, rotate credentials where required, and review access regularly.
$md$, 2),

('8e3f6912-f3d9-5fe2-919e-13fd37628889','activity','Auditing, Logging, and the Philippine Data Privacy Mindset',$md$
Security is not complete without visibility. A database should support auditing and logging so administrators can answer questions like:

- Who accessed this data?
- Who changed this record?
- When did the action happen?
- Was the attempt authorized?

Audit information may include:

- login attempts
- failed access attempts
- schema changes
- sensitive data access
- update/delete activity on critical tables

For Philippine IT practice, database administration should also respect the mindset of the **Data Privacy Act**: collect and use personal information responsibly, protect it with appropriate safeguards, and avoid unnecessary exposure.

In practical terms, that means:

- do not expose full data when only partial data is needed
- protect backups because backups also contain personal data
- avoid copying production data carelessly into development
- mask or limit access to sensitive information when appropriate

A DBA does not become a lawyer in this course, but the DBA must act as a careful custodian of institutional data.
$md$, 3);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('8e3f6912-f3d9-5fe2-919e-13fd37628889','activity','Practice & Exam Drills, Lesson 7',$md$
**Review Questions**

1. What is least privilege?
2. Differentiate authentication and authorization.
3. Why are roles better than individually granting every permission?
4. Why are shared admin accounts risky?
5. What is the purpose of auditing?
6. Why is a backup also a security concern?
7. Why should production data not be copied casually to development?
8. Give one example of using a view for security.

**Worked Exam-Style Problems**

**Problem 1.** A faculty user only needs `student_id`, `student_name`, and `program_code` for advising. Should the user receive access to the full table containing email and mobile number?

*Step-by-step solution*
1. The faculty need is limited.
2. The full table contains more personal data than required.
3. Least privilege says provide only necessary access.
4. A restricted view is better than exposing the complete table.

*Final answer:* No. The safer design is to grant access to a restricted view such as `student_public_directory`.

**Problem 2.** Why is it bad practice for an application to connect using a superuser account?

*Step-by-step solution*
1. A superuser can do far more than the application normally needs.
2. If the application is compromised, the attacker gains excessive power.
3. This violates least privilege.
4. It also makes auditing and risk containment harder.

*Final answer:* Applications should use limited service accounts, not superuser accounts, because excessive privilege increases security risk.

**Hands-on Exercise**

1. Query the `student_public_directory` view.
2. Explain which columns are hidden compared with `student_records`.
3. Write a query that returns only program counts, not personal identifiers.
4. Add one more student and verify that the view reflects the new row.

*Suggested solution path*
```sql
SELECT * FROM student_public_directory;

SELECT program_code, COUNT(*) AS total_students
FROM student_records
GROUP BY program_code;

INSERT INTO student_records VALUES
(3, 'Lia Santos', 'BSCS', 'lia@school.edu', '09191234567');

SELECT * FROM student_public_directory;
```

**How to Pass This Topic**

- In security questions, your safest keywords are: least privilege, role-based access, audit trail, accountability.
- Always compare business need versus data exposure.
- If a question mentions personal data, mention restricted access, masking, or limited views.
- Professors often test whether you can distinguish authentication from authorization.
- Common mistake: treating security as only "having a password." In database admin, security also includes permissions, audit, backup protection, and environment control.
$md$, 4, 'sql', $code$CREATE TABLE student_records (
    student_id INTEGER PRIMARY KEY,
    student_name VARCHAR(50),
    program_code VARCHAR(10),
    email VARCHAR(60),
    mobile_no VARCHAR(20)
);

INSERT INTO student_records VALUES
(1, 'Ana Cruz', 'BSIT', 'ana@school.edu', '09171234567'),
(2, 'Marco Reyes', 'BSIT', 'marco@school.edu', '09181234567');

CREATE VIEW student_public_directory AS
SELECT student_id, student_name, program_code
FROM student_records;$code$);

-- ============================================================
-- LESSON 8: Monitoring, Performance Tuning, and Capacity Planning
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('369553ac-ecd5-5dc7-8a94-3538e96c8e0c','content','What DBAs Monitor',$md$
A database should not be tuned blindly. Good tuning starts with observation.

A DBA commonly monitors:

- response time of important queries
- CPU and memory usage
- disk I/O and storage growth
- active sessions and locks
- long-running transactions
- deadlocks or blocking
- backup success/failure
- replication or standby health
- unusual access patterns

The main goal is not to collect every possible metric. The goal is to identify what affects service quality most.

For example, if an enrollment system slows down during peak registration, the DBA must determine whether the cause is:

- poor query design
- missing indexes
- locking contention
- insufficient hardware
- oversized reports running during peak hours

Monitoring gives evidence for decisions.
$md$, 1),

('369553ac-ecd5-5dc7-8a94-3538e96c8e0c','content','A Practical Tuning Workflow',$md$
A good tuning workflow is usually:

1. **Identify the symptom**, Example: "Student ledger query takes 18 seconds."
2. **Measure the current behavior**, Which query? How often? At what time? On which tables?
3. **Find probable causes**, Missing indexes? Too many joins? Old statistics? Blocking? Large scans?
4. **Apply one change at a time**, Add or revise index, rewrite query, archive data, adjust schedule.
5. **Measure again**, Did the change actually help? Did it create side effects?

This method is better than random tweaking.

Typical tuning actions include:

- indexing the right columns
- reducing unnecessary `SELECT *`
- filtering earlier
- simplifying joins
- updating statistics where applicable
- archiving old records
- moving heavy reports outside peak hours

A DBA also needs discipline: performance is not permanent. A query that was fast last semester may become slow after table growth or workload change.
$md$, 2),

('369553ac-ecd5-5dc7-8a94-3538e96c8e0c','activity','Capacity Planning and the Mature DBA Mindset',$md$
Capacity planning means preparing for future demand.

Questions include:

- How much storage growth is expected each month?
- When will the current server become insufficient?
- Which tables are growing fastest?
- Are backup windows becoming too long?
- Will more concurrent users appear next term?

This matters in real institutions. A system designed for one campus may become inadequate after new departments, online services, or analytics features are added.

A mature DBA also keeps operational routines such as:

- maintenance schedules
- index review
- backup verification
- access review
- incident documentation
- change logs
- service checklists

At this point, you can see the full picture of the course: database administration is really the art of making data systems dependable under pressure.
$md$, 3);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('369553ac-ecd5-5dc7-8a94-3538e96c8e0c','activity','Practice & Exam Drills, Lesson 8',$md$
**Review Questions**

1. Why should tuning begin with monitoring?
2. Give four examples of metrics DBAs monitor.
3. What is capacity planning?
4. Why should DBAs avoid random tuning changes?
5. What is blocking?
6. Why can old data affect performance?
7. Why is storage growth part of DBA work?
8. Give one reason a previously fast query may become slow later.

**Worked Exam-Style Problems**

**Problem 1.** A report becomes slow every enrollment week. Give a structured tuning approach.

*Step-by-step solution*
1. Identify the exact slow report and execution time.
2. Measure when it becomes slow and under what workload.
3. Check query design, join conditions, and filters.
4. Review indexes on commonly filtered/joined columns.
5. Check whether locks or hardware bottlenecks contribute.
6. Apply one change at a time.
7. Re-measure performance after each change.

*Final answer:* Use a measured tuning workflow: identify, measure, diagnose, change carefully, then verify.

**Problem 2.** Why is "add more hardware" not always the best first answer?

*Step-by-step solution*
1. Slow performance may be caused by poor schema design, missing indexes, blocking, or bad SQL.
2. Hardware can hide some issues temporarily but not fix the root cause.
3. Efficient tuning usually starts with workload analysis and better design choices.

*Final answer:* Hardware may help, but the DBA should first diagnose the real cause of slowness.

**Hands-on Exercise**

1. Show all queries taking more than 10 seconds.
2. Compute the average execution time per module.
3. Find the slowest query in the log.
4. Count how many query runs were recorded.

*Suggested solution path*
```sql
SELECT *
FROM query_log
WHERE execution_seconds > 10;

SELECT module_name, AVG(execution_seconds) AS avg_seconds
FROM query_log
GROUP BY module_name;

SELECT *
FROM query_log
WHERE execution_seconds = (
    SELECT MAX(execution_seconds) FROM query_log
);

SELECT COUNT(*) AS total_runs
FROM query_log;
```

**How to Pass This Topic**

- Use the phrase *measure before and after tuning*.
- In scenario questions, give a workflow, not just a guess.
- Mention both technical metrics and operational habits.
- For essay items, connect performance to growth, peak periods, and changing workloads.
- Common mistake: assuming query slowness always means indexing. Sometimes the problem is locking, oversized reports, or weak scheduling.
$md$, 4, 'sql', $code$CREATE TABLE query_log (
    query_id INTEGER PRIMARY KEY,
    module_name VARCHAR(50),
    execution_seconds DECIMAL(6,2),
    run_time VARCHAR(20),
    status VARCHAR(20)
);

INSERT INTO query_log VALUES
(1, 'Enrollment Report', 12.50, '08:00', 'SUCCESS'),
(2, 'Ledger Report', 18.20, '09:15', 'SUCCESS'),
(3, 'Subject Load Query', 1.10, '09:20', 'SUCCESS'),
(4, 'Enrollment Report', 15.00, '10:30', 'SUCCESS'),
(5, 'Audit Summary', 22.00, '11:00', 'SUCCESS');$code$);

-- SOURCES (metadata, not inserted):
-- CHED CMO 25 s. 2015; UP Mindanao BSCS; PUP CCIS BSIT; FEU/FEU Tech BSIT;
-- Adamson University BSIT 2022; Ateneo BS ITE/MIS; DLSU STADVDB.
