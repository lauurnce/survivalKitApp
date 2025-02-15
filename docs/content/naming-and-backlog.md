# Module naming, order, and the thin-content backlog

QA findings CT-09 (mixed naming), CT-11 (odd order), and CT-10 (thin subjects).
Snapshot: production, read-only, 2026-10-31. 36 subjects, 274 modules, 1602 sections.

The SQL for every rename and reorder below was generated from that snapshot and
kept out of the repo, because it is a one-off data change and not a migration:
`naming.sql` and `naming.rollback.sql` in the QA fix-content folder. Each
statement is keyed by id and guarded by the row's current title, heading and
sort order, so a row someone has edited since the snapshot is skipped, not
overwritten. **Nothing has been applied.**

## 1. Naming scheme, one per subject type

Today the 36 subjects use six schemes: "Lesson N:", "Unit I:" (Roman), "Unit 1:",
"Module 1:", "Kabanata N:", and bare titles. DSA and COBOL list bare titles but
open each page with a numbered heading ("Module 10: Quick Sort", "Lesson 4: …").

| subject type | module title | example |
|---|---|---|
| Lecture lessons, English (every subject except Filipinolohiya) | `Lesson N: Topic`, Arabic N equal to `sort_order` | `Lesson 3: Hardware` |
| Lecture lessons, Filipino-medium (Filipinolohiya) | `Aralin N: Paksa` | `Aralin 2: Mga Batayang Perspektibo…` |
| Closing exam module | `Exam Prep: Focus`, never numbered, always last | `Exam Prep: Prelims & Finals` |
| Closing exam module, Filipino-medium | `Paghahanda sa Eksamen: Focus` (unchanged) | `Paghahanda sa Eksamen: Prelim at Finals` |

Rules that follow from it:

- **One colon.** A topic that has its own colon becomes an em dash:
  `Case Study: The Tejeros Convention of 1897` becomes
  `Lesson 3: Case Study — The Tejeros Convention of 1897`.
- **The in-page heading matches the list title.** DSA's first section heading
  `Module N: Topic` becomes `Lesson N: Topic`. COBOL's already says
  `Lesson N: Topic`, so only its list titles change.
- **Practice sections use the lesson number, not the unit number.**
  `Practice Exercises — Unit I` becomes `Practice Exercises — Lesson 1` (the same
  wording CP1 uses). The scaffolded subjects' `Practice & Exam Drills — Lesson N`
  keeps its wording. The two names belong to two kinds of section: hand-written
  exercises and generated drills. Merging the wording is an editorial choice,
  not a numbering fix, so I left it for you.
- **The number is the order.** `Lesson N` always equals `sort_order`. That is
  why a reorder (IPT1) renumbers titles and drill headings together.
- `Kabanata` means *chapter*, so `Aralin` (*lesson*) is the Filipino match for
  `Lesson`. If you would rather keep `Kabanata`, delete the three Filipinolohiya
  lines from `naming.sql`. Nothing else depends on them.

### Not covered by the SQL (follow-ups)

- **Body text that names old numbers.** Up to about 40 section bodies mention
  `Unit I…`, `Unit 1`, `Kabanata`, or `Module 1`. Most of them are Exam Prep
  blueprints such as "covers Units I–III" and "everything in the currently
  published **Unit 1**". Rewrite them in the same pass as the renames, or the
  exam prep will refer to units that no longer exist.
- **Reading in Philippine History** modules 5–10 open with `### Lesson 1:` and
  `### Lesson 2:` sub-headings. Once the modules are `Lesson 5…10`, those inner
  numbers clash. Rename them to `### Part 1:` and so on.
- `lib/lesson/quickChecks.ts` mentions "Unit I" in comments only. Its keys are
  ids, so nothing breaks.

## 2. Module titles and order to change

115 module rows and 42 section headings change. Titles that already follow the
scheme are not listed. An order cell with an arrow is a move.

### Order changes (CT-11)

- **IPT1:** The six "Python Refresher" lessons (now 9–14) move to the front as
  Lessons 1–6, and the eight integration lessons become 7–14. A refresher placed
  after the lessons that use it reads backwards. Their drill headings are
  renumbered to match.
  **Side effect to accept first:** `lib/freeSample.ts` makes the first module
  with activities the free sample. After the move, IPT1's free sample becomes
  the Python refresher instead of "Introduction to Integrative Programming".
- **DSA:** The module order is fine. The problem is that Lesson 1's only activity,
  "Activity 1: Positive or Negative Number", has nothing to do with data
  structures. That needs a content rewrite, not SQL, so it is in the backlog
  below (item 3).
- **DCN** keeps its order. It follows the Cisco ITN v7 chapter order, with
  ITN's "Number Systems" chapter left out.


#### Introduction to Computing

| order | current title | proposed title |
|---|---|---|
| 1 | Unit I: Overview of Information and Communications Technology | Lesson 1: Overview of Information and Communications Technology |
| 2 | Unit II: Data Representation | Lesson 2: Data Representation |
| 3 | Unit III: Hardware | Lesson 3: Hardware |
| 4 | Unit IV: Peopleware | Lesson 4: Peopleware |
| 5 | Unit V: Software | Lesson 5: Software |
| 6 | Unit VI: Network, Internet, and Internet Protocols | Lesson 6: Network, Internet, and Internet Protocols |
| 7 | Unit VII: Trends and Issues in ICT | Lesson 7: Trends and Issues in ICT |
| 8 | Unit VIII: Special Interest Topics in ICT | Lesson 8: Special Interest Topics in ICT |

#### Mathematics in the Modern World

| order | current title | proposed title |
|---|---|---|
| 1 | Unit I: Patterns and Numbers in Nature | Lesson 1: Patterns and Numbers in Nature |
| 2 | Unit II: Logic and Sets | Lesson 2: Logic and Sets |
| 3 | Unit III: Mathematical Problem Solving | Lesson 3: Mathematical Problem Solving |
| 4 | Unit IV: Data Analytics and Statistical Management | Lesson 4: Data Analytics and Statistical Management |
| 5 | Unit V: Optimization via Linear Programming | Lesson 5: Optimization via Linear Programming |
| 6 | Unit VI: Graph Theory and Network Models | Lesson 6: Graph Theory and Network Models |

#### Accounting Principles

| order | current title | proposed title |
|---|---|---|
| 1 | Unit I: Introduction to Accounting | Lesson 1: Introduction to Accounting |
| 2 | Unit II: Generally Accepted Accounting Principles | Lesson 2: Generally Accepted Accounting Principles |
| 3 | Unit III: Business Organizations and the Accounting Equation | Lesson 3: Business Organizations and the Accounting Equation |
| 4 | Unit IV: The Accounting Information System and Cycle | Lesson 4: The Accounting Information System and Cycle |
| 5 | Unit V: Period-End Adjustments | Lesson 5: Period-End Adjustments |
| 6 | Unit VI: Year-End Closing and Reversing Entries | Lesson 6: Year-End Closing and Reversing Entries |

#### Purposive Communication

| order | current title | proposed title |
|---|---|---|
| 1 | Unit I: Understanding the Communication Process | Lesson 1: Understanding the Communication Process |
| 2 | Unit II: Global and Intercultural Communication | Lesson 2: Global and Intercultural Communication |
| 3 | Unit III: Digital Communication Frameworks | Lesson 3: Digital Communication Frameworks |
| 4 | Unit IV: Professional and Business Writing | Lesson 4: Professional and Business Writing |

#### Filipinolohiya

| order | current title | proposed title |
|---|---|---|
| 1 | Kabanata 1: Kamalayan, Kultura, at ang Kasaysayan ng Kolonyal na Edukasyon | Aralin 1: Kamalayan, Kultura, at ang Kasaysayan ng Kolonyal na Edukasyon |
| 2 | Kabanata 2: Mga Batayang Perspektibo sa Indihenisasyon ng Kaalaman | Aralin 2: Mga Batayang Perspektibo sa Indihenisasyon ng Kaalaman |
| 3 | Kabanata 3: Filipinolohiya, Pambansang Industriyalisasyon, at Kaunlaran | Aralin 3: Filipinolohiya, Pambansang Industriyalisasyon, at Kaunlaran |

#### Computer Programming 2

| order | current title | proposed title |
|---|---|---|
| 1 | Unit 1: Arrays | Lesson 1: Arrays |

#### Reading in Philippine History

| order | current title | proposed title |
|---|---|---|
| 1 | The Meaning and Relevance of History | Lesson 1: The Meaning and Relevance of History |
| 2 | Tests of Authenticity and Credibility | Lesson 2: Tests of Authenticity and Credibility |
| 3 | Case Study: The Tejeros Convention of 1897 | Lesson 3: Case Study — The Tejeros Convention of 1897 |
| 4 | Early Philippine Chronicles — Pigafetta and Plasencia | Lesson 4: Early Philippine Chronicles — Pigafetta and Plasencia |
| 5 | The Katipunan — Revolution and Its Documents | Lesson 5: The Katipunan — Revolution and Its Documents |
| 6 | Visual and Documentary Sources in Philippine History | Lesson 6: Visual and Documentary Sources in Philippine History |
| 7 | Historic Controversies | Lesson 7: Historic Controversies |
| 8 | Philippine Constitutions, Indigenous Peoples, and Agrarian Reform | Lesson 8: Philippine Constitutions, Indigenous Peoples, and Agrarian Reform |
| 9 | Colonial Legacies — Applied Historical Analysis | Lesson 9: Colonial Legacies — Applied Historical Analysis |
| 10 | Local History and Philippine Heritage | Lesson 10: Local History and Philippine Heritage |

#### Data Communications and Networking

| order | current title | proposed title |
|---|---|---|
| 1 | Networking Today | Lesson 1: Networking Today |
| 2 | Basic Switch and End Device Configuration | Lesson 2: Basic Switch and End Device Configuration |
| 3 | Protocols and Models | Lesson 3: Protocols and Models |
| 4 | Physical Layer | Lesson 4: Physical Layer |
| 5 | Data Link Layer | Lesson 5: Data Link Layer |
| 6 | Ethernet Switching | Lesson 6: Ethernet Switching |
| 7 | Network Layer | Lesson 7: Network Layer |
| 8 | Address Resolution Protocol | Lesson 8: Address Resolution Protocol |
| 9 | Basic Router Configuration | Lesson 9: Basic Router Configuration |
| 10 | IPv4 Addressing | Lesson 10: IPv4 Addressing |
| 11 | IPv6 Addressing | Lesson 11: IPv6 Addressing |
| 12 | Internet Control Message Protocol | Lesson 12: Internet Control Message Protocol |
| 13 | Transport Layer | Lesson 13: Transport Layer |
| 14 | Application Layer | Lesson 14: Application Layer |
| 15 | Network Security Fundamentals | Lesson 15: Network Security Fundamentals |
| 16 | Build a Small Network | Lesson 16: Build a Small Network |

#### Data Structures and Algorithms

| order | current title | proposed title |
|---|---|---|
| 1 | Introduction to Data Structures | Lesson 1: Introduction to Data Structures |
| 2 | Costs, Benefits, and Choosing Data Structures | Lesson 2: Costs, Benefits, and Choosing Data Structures |
| 3 | Arrays and Linked Lists | Lesson 3: Arrays and Linked Lists |
| 4 | Array-Based Linked List Storage | Lesson 4: Array-Based Linked List Storage |
| 5 | Stack Data Structure | Lesson 5: Stack Data Structure |
| 6 | Queue Data Structure | Lesson 6: Queue Data Structure |
| 7 | Tree Data Structure | Lesson 7: Tree Data Structure |
| 8 | Tree Traversal | Lesson 8: Tree Traversal |
| 9 | Selection Sort | Lesson 9: Selection Sort |
| 10 | Quick Sort | Lesson 10: Quick Sort |

#### Structured Programming (COBOL)

| order | current title | proposed title |
|---|---|---|
| 1 | COBOL Overview, Program Structure, and Coding Form | Lesson 1: COBOL Overview, Program Structure, and Coding Form |
| 2 | COBOL Character Set and COBOL Words | Lesson 2: COBOL Character Set and COBOL Words |
| 3 | Identification Division and Environment Division | Lesson 3: Identification Division and Environment Division |
| 4 | Data Division, Data Fields, and PICTURE Clauses | Lesson 4: Data Division, Data Fields, and PICTURE Clauses |
| 5 | Procedure Division and COBOL Statements | Lesson 5: Procedure Division and COBOL Statements |

#### Operating Systems

| order | current title | proposed title |
|---|---|---|
| 1 | Module 1: Introduction to Operating Systems | Lesson 1: Introduction to Operating Systems |

#### World Literature

| order | current title | proposed title |
|---|---|---|
| 1 | Introduction to World Literature | Lesson 1: Introduction to World Literature |
| 2 | European and Russian Literature | Lesson 2: European and Russian Literature |
| 3 | Anglo-American Literature | Lesson 3: Anglo-American Literature |
| 4 | East Asian Literature | Lesson 4: East Asian Literature |
| 5 | Latin American Literature | Lesson 5: Latin American Literature |
| 6 | Middle Eastern Literature | Lesson 6: Middle Eastern Literature |
| 7 | African Literature | Lesson 7: African Literature |
| 8 | Southeast Asian Literature | Lesson 8: Southeast Asian Literature |
| 9 | Cross-Module Review | Exam Prep: Cross-Lesson Review |

#### Object-Oriented Programming with Java

| order | current title | proposed title |
|---|---|---|
| 1 | Introduction to Object-Oriented Programming and Java Basics | Lesson 1: Introduction to Object-Oriented Programming and Java Basics |
| 2 | Input and Control Statements | Lesson 2: Input and Control Statements |
| 3 | Arrays and Strings | Lesson 3: Arrays and Strings |
| 4 | Methods | Lesson 4: Methods |
| 5 | Classes and Objects | Lesson 5: Classes and Objects |
| 6 | Constructors and Constructor Overloading | Lesson 6: Constructors and Constructor Overloading |
| 7 | Prewritten Classes and Methods | Lesson 7: Prewritten Classes and Methods |
| 8 | GUI Frames and Swing | Lesson 8: GUI Frames and Swing |
| 9 | Database and JDBC | Lesson 9: Database and JDBC |

#### Network Administration

| order | current title | proposed title |
|---|---|---|
| 1 | Basic Device Configuration | Lesson 1: Basic Device Configuration |
| 2 | Switching Concepts | Lesson 2: Switching Concepts |
| 3 | VLANs | Lesson 3: VLANs |
| 4 | Inter-VLAN Routing | Lesson 4: Inter-VLAN Routing |
| 5 | STP Concepts | Lesson 5: STP Concepts |
| 6 | EtherChannel | Lesson 6: EtherChannel |
| 7 | DHCPv4 | Lesson 7: DHCPv4 |
| 8 | LAN Security Concepts | Lesson 8: LAN Security Concepts |
| 9 | Switch Security Configuration | Lesson 9: Switch Security Configuration |
| 10 | WLAN Concepts | Lesson 10: WLAN Concepts |
| 11 | WLAN Configuration | Lesson 11: WLAN Configuration |
| 12 | Routing Concepts | Lesson 12: Routing Concepts |
| 13 | IP Static Routing | Lesson 13: IP Static Routing |

#### Integrative Programming and Technologies 1

| order | current title | proposed title |
|---|---|---|
| 1 → **7** | Lesson 1: Introduction to Integrative Programming | Lesson 7: Introduction to Integrative Programming |
| 2 → **8** | Lesson 2: Data Interchange Formats — JSON and XML | Lesson 8: Data Interchange Formats — JSON and XML |
| 3 → **9** | Lesson 3: Web Services and REST APIs | Lesson 9: Web Services and REST APIs |
| 4 → **10** | Lesson 4: Server-Side Scripting and Backend Integration | Lesson 10: Server-Side Scripting and Backend Integration |
| 5 → **11** | Lesson 5: Database Integration and Data Access | Lesson 11: Database Integration and Data Access |
| 6 → **12** | Lesson 6: Sessions, Authentication, and Secure Integration | Lesson 12: Sessions, Authentication, and Secure Integration |
| 7 → **13** | Lesson 7: Middleware and Message-Based Integration | Lesson 13: Middleware and Message-Based Integration |
| 8 → **14** | Lesson 8: Integration Testing, Error Handling, and Best Practices | Lesson 14: Integration Testing, Error Handling, and Best Practices |
| 9 → **1** | Lesson 9: Python Refresher — Programming and Problem Solving | Lesson 1: Python Refresher — Programming and Problem Solving |
| 10 → **2** | Lesson 10: Python Refresher — Variables and Data Types | Lesson 2: Python Refresher — Variables and Data Types |
| 11 → **3** | Lesson 11: Python Refresher — Control Structures and Functions | Lesson 3: Python Refresher — Control Structures and Functions |
| 12 → **4** | Lesson 12: Python Refresher — Lists, Tuples, and Dictionaries | Lesson 4: Python Refresher — Lists, Tuples, and Dictionaries |
| 13 → **5** | Lesson 13: Python Refresher — File I/O and Exception Handling | Lesson 5: Python Refresher — File I/O and Exception Handling |
| 14 → **6** | Lesson 14: Python Refresher — Integrating Python with Technologies | Lesson 6: Python Refresher — Integrating Python with Technologies |

#### Section headings

- Intro to Computing (8), MMW (6), Purposive Communication (4):
  `Practice Exercises — Unit <Roman>` becomes `Practice Exercises — Lesson <N>`.
- DSA (10): `Module N: Topic` becomes `Lesson N: Topic`.
- IPT1 (14): `Practice & Exam Drills — Lesson N` is renumbered to the new order.

## 3. Thin-content backlog (CT-10), ranked

The ranking weighs **reach** (subject reads, summed from module reads, as of
2026-10-31) against **how far below the bar** the content is. The bar is the
median lesson: **1,834 characters** of free lesson text, counting `content`
sections only and excluding exam-prep modules. Across 265 lesson modules the
maximum is 15,930.

| # | item | gap | reach | the work |
|---|---|---|---|---|
| 1 | **Computer Programming 2**: 1 lesson ("Unit 1: Arrays", 6,305 chars) plus Exam Prep | A Y1 major with one topic, which repeats CP1 "Lesson 5: Arrays" by title | 106 module reads, Y1 S2 major | Add the rest of a CP2 term: strings and string functions, pointers, structures, file handling, and recursion. Retitle Lesson 1 so it clearly goes beyond CP1's arrays (2-D arrays, sorting). |
| 2 | **Operating Systems**: 1 module ("Module 1: Introduction", 15,930 chars) and 3 reviewers | Lesson 1 is the longest lesson on the site, but the subject stops there, so the free sample is every reviewer it has (CT-07) | 97 module reads, Y2 S1 major | Add process management, CPU scheduling, synchronization and deadlocks, memory management, virtual memory, file systems, and I/O. Each new lesson also restores a real "rest" behind the paywall. |
| 3 | **DSA: Quick Sort** (898 chars), **Selection Sort** (1,070), Stack/Queue/Tree Traversal (about 1,200–1,260) | Quick Sort shows "Original / Sorted" with no partition trace. Lesson 1's activity is off-topic. | 541 module reads, the highest of the thin subjects | Add a step-by-step partition trace, best/average/worst complexity and pivot choice. Replace "Activity 1: Positive or Negative Number" with a data-structure-choice activity. Give the sorting pair the same trace treatment. |
| 4 | **Information Management L5: SQL Queries** (1,041) and **L7: Database Administration** (1,061) | The lesson is titled for aggregates, but GROUP BY and subqueries exist only in locked drills | 45 module reads | Put SELECT, WHERE, JOIN, GROUP BY and HAVING into the free lesson text, with one worked query each. |
| 5 | **Systems Administration and Maintenance**: L1 830, L2 971, L3 964, L4 1,029, L6 1,052 | Five of its eight lessons sit in the shortest 15 | 20 module reads, Y4 | Write procedures (install steps, `useradd`/AD, patch cycles) rather than definitions. |
| 6 | **Applications Development and Emerging Technologies**: L2 919, L3 1,007, L4 999, L6 989 | Four of its seven lessons sit in the shortest 15 | 19 module reads, Y3 | Add a worked example to each, for example an actual requirements doc or test plan. |
| 7 | **World Literature: Cross-Module Review** (869) and **Middle Eastern Literature** (1,029) | The review is a list of themes. The literature lesson names few works. | 22 module reads | Turn the review into a real exam-prep module, which the rename already implies. Add 2–3 named works with context to Middle Eastern Literature. |
| 8 | **Fundamentals of Research L1** (900) and **L2** (1,056); **IAS2 L3** (1,052) | Short lessons, each with 2–3 reviewers | 26 and 6 module reads | Expand when you next touch the subject. |
| — | **4th Year, Sem 2: 0 subjects** | /faq says "Every year is open now." | n/a | Owner decision: add the term's lecture subjects, or reword /faq. Capstone and practicum were removed on purpose as non-lecturable (migration `20260702000000`). |

### The 15 shortest lesson modules

Measured as the database length of the free `content` sections. QA's CT-10
table measured visible text, so its numbers differ slightly, but it ranks the
same modules.

| # | chars | reads | subject | module |
|---|---|---|---|---|
| 1 | 830 | 10 | Systems Administration and Maintenance | Lesson 1: Introduction to Systems Administration and Maintenance |
| 2 | 869 | 1 | World Literature | Cross-Module Review |
| 3 | 898 | 16 | Data Structures and Algorithms | Quick Sort |
| 4 | 900 | 8 | Fundamentals of Research | Lesson 1: Introduction to Research |
| 5 | 919 | 7 | Applications Development and Emerging Technologies | Lesson 2: Requirements Analysis and Planning |
| 6 | 964 | 1 | Systems Administration and Maintenance | Lesson 3: Installing and Configuring Linux Operating Systems |
| 7 | 971 | 3 | Systems Administration and Maintenance | Lesson 2: Installing and Configuring Windows Operating Systems |
| 8 | 989 | 2 | Applications Development and Emerging Technologies | Lesson 6: Testing, Deployment, and Security |
| 9 | 999 | 1 | Applications Development and Emerging Technologies | Lesson 4: Server-side Development and Databases |
| 10 | 1,007 | 2 | Applications Development and Emerging Technologies | Lesson 3: Design Principles and User Interfaces |
| 11 | 1,029 | 0 | World Literature | Middle Eastern Literature |
| 12 | 1,029 | 2 | Systems Administration and Maintenance | Lesson 4: User and Group Account Management |
| 13 | 1,041 | 2 | Information Management | Lesson 5: SQL Queries (SELECT, Joins, and Aggregates) |
| 14 | 1,052 | 0 | Information Assurance and Security 2 | Lesson 3: Secure Systems and Virtualization |
| 15 | 1,052 | 1 | Systems Administration and Maintenance | Lesson 6: System Updates, Patching, and Maintenance |

Why CP2 and OS rank above the shortest modules: a one-lesson *subject* fails a
whole term's worth of students, while a short lesson inside a full subject fails
one topic. Within the short modules, reach decides the order. DSA has about 25
times the module reads of SAM or ADET.
