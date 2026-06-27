-- ============================================================
-- Database Administration — Modules & Sections
-- Subject ID: 0a7947c5-6b9d-4a9c-8980-3d4187ec8d82
-- 3rd Year, Semester 1 — major
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

- **Integrity** — the data stays correct and consistent
- **Availability** — the database stays usable when needed
- **Security** — only the right people can access the right data
- **Performance** — transactions and reports finish in acceptable time
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

- **development** — where systems are built and tested
- **testing / staging** — where changes are validated before release
- **production** — the live environment serving actual users

This separation matters because unsafe testing in production can damage real data. In practice, one of the earliest signs of good administration is discipline in environments, naming, and change control.
$md$, 2),

('65311dcc-72f1-50c9-80de-3f200a73f099','activity','The Database Administration Lifecycle',$md$
Database Administration is not one single task. It is a lifecycle.

A typical administration cycle looks like this:

1. **Plan** — Understand requirements, workload, security needs, and expected growth.
2. **Design** — Review schema, constraints, indexing strategy, and storage layout.
3. **Implement** — Create objects, configure accounts, apply permissions, load initial data.
4. **Operate** — Monitor health, capacity, locks, slow queries, and usage patterns.
5. **Protect** — Run backups, verify recoverability, harden access, audit activity.
6. **Improve** — Tune performance, archive old data, revise indexes, adjust policies.

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
('65311dcc-72f1-50c9-80de-3f200a73f099','activity','Practice & Exam Drills — Lesson 1',$md$
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

