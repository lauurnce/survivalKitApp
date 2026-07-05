# First-Year Activity Value Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the per-subject subscription obviously worth buying for first-year students by upgrading the paid `activity` sections of all four first-year major subjects to the quality bar already set by the newest seeds (TCW/STS/UTS/IPT1): answer keys, worked exam walkthroughs, how-to-pass tips, and runnable in-browser code labs.

**Architecture:** Pure seed-content work — no app code changes. Each subject has one idempotent seed file (`DELETE FROM modules WHERE subject_id = …` then re-INSERT everything), so "adding activities" means appending `INSERT INTO sections` rows to the existing seed file and re-applying it to the live DB. Free/paid gating is entirely data-driven: `kind='content'` is free, `kind='activity'` is paid (rendered behind `SubscribeGate`). The IDE playground activates whenever a section row sets `ide_language` + `starter_code`.

**Tech Stack:** Postgres seeds (Supabase project `mpdymglipgzuybtxuvhy`), `$md$…$md$` / `$code$…$code$` dollar-quoted markdown/code bodies, in-app IDE (`lib/ide/languages.ts`: `python` browser/Pyodide, `sql` browser/sql.js, `java` + `c` server/Piston).

## Audit Findings (live DB, 2026-07-05) — why this plan exists

Paid value per first-year subject today (`activity` = what a subscriber pays for):

| Subject | Kind | Modules | Paid activity sections | IDE drills | Paid chars |
|---|---|---|---|---|---|
| Computer Programming 1 | **major** | 7 | 7 (1/lesson) | **0** | 7,321 |
| Introduction to Computing | **major** | 8 | 8 (1/unit) | **0** | 5,656 |
| Computer Programming 2 | **major** | **1 (!)** | 4 | **0** | 3,609 |
| Discrete Structures 1 | **major** | 9 | 9 | **0** | 8,477 |
| The Contemporary World (benchmark) | minor | 5 | 19 | 0 | 31,624 |
| Science, Technology and Society | minor | 5 | 14 | 0 | 21,081 |
| Understanding the Self | minor | 5 | 14 | 0 | 21,673 |

Problems, in order of conversion damage:

1. **Paid activities are homework, not help.** Every major's activity is a bare question list with **no answer key and no worked solutions**. A student who pays gets more questions — the thing they can already get free from their professor. The new-generation seeds (TCW/UTS/STS, IPT1 in repo) sell *solutions*: worked exam-style problems with step-by-step reasoning plus "How to Pass Tips".
2. **Zero IDE drills in all of first year** even though CP1/CP2 are taught in C and the app ships a working C playground (Piston) plus Python/SQL/Java. Runnable code labs are the single most demo-able, screenshot-able reason to pay, and no competitor PDF/handout can match them.
3. **CP2 is essentially empty** — one module ("Unit 1: Arrays") for an entire semester subject. A 2nd-sem first-year who subscribes gets almost nothing.
4. **The flagship subjects have the least content.** TCW (a minor) has 4× the paid characters of CP1 (the flagship major). First-years judge the product by CP1/Intro to Computing.
5. **Locked sections only show their heading** (`SectionRenderer` renders heading + `SubscribeGate` when not subscribed). Current headings ("Practice Exercises — Lesson 3") don't sell. Headings are the only free sales surface per activity — they must state the benefit ("Worked Exam Solutions + How-to-Pass Tips").

Minors (Purposive Communication 3.5k, Filipinolohiya 2.6k paid chars) are also thin but are **out of scope** here — majors are what first-years buy.

## Value target (per major subject)

Match or beat the TCW bar: **≥ 15 paid activity sections and ≥ 20,000 paid chars per subject**, and for CP1/CP2 **≥ 2 runnable C drills per lesson**. Every existing question list gains a paired "Worked Solutions & Exam Walkthrough" section.

## Global Constraints

- Seed files are idempotent: they start with `DELETE FROM modules WHERE subject_id = '<subject uuid>';` and re-insert all modules + sections. Never change an existing module's UUID — `module_progress` is keyed on module id and must survive re-seeding. (Section ids regenerate on each apply; only analytics `section_views` reference them, acceptable.)
- Free/paid split: `kind='content'` = FREE, `kind='activity'` = PAID. Keep every lesson's teaching sections free; all new solution/drill sections are `kind='activity'` **except** the one designated free-preview drill per subject (Task 5).
- Section insert shapes (match existing seeds exactly):
  - Text-only: `INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES …`
  - IDE drill: `INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES …`
- `ide_language` must be one of `python`, `sql`, `java`, `c` (see `lib/ide/languages.ts`). C drills must compile with plain `gcc` (Piston C 10.2.0): use `int main(void)` + `return 0;`, **never** `void main()`, `conio.h`, or `clrscr()` in *new* starter code.
- Bodies use `$md$ … $md$` dollar-quoting (starter code uses `$code$ … $code$`); the literal strings `$md$`/`$code$` must never appear inside a body. Markdown is fully rendered (GFM + KaTeX via `SectionRenderer`), so use real markdown: `**bold**`, fenced code blocks, tables, `$…$` math for Discrete.
- New sections append after the lesson's existing max `sort_order` — never renumber existing sections.
- Tone/style: match the new-generation seeds (see IPT1 file) — Filipino context examples (GCash, LRT, sari-sari store, PhilHealth), exam-focused, "How to Pass Tips" bullets, worked problems labeled *Problem:* / *Solution:* with numbered steps.
- Commit cadence: one commit per lesson/unit, message pattern `feat(seeds): <Subject> — <Lesson N> activity upgrade` (baseline commits: `feat(seeds): <Subject> — <what>`). Solo author, no Co-Authored-By.
- Apply to live DB via Supabase MCP `execute_sql` (project `mpdymglipgzuybtxuvhy`) by running the updated seed file's full contents; verify with the audit query in Task 6 after each subject.

## ⚠️ Live-DB divergence discovered during Task 1 (applies to Tasks 2–4)

CP1's live data contained six "Try It" sections (sort_order 999) that existed **only in the live DB**, not in the seed file — a full re-run of the idempotent seed would have deleted them from production. Resolution: the Try It rows were backported into `cp1_modules_sections.sql`, and the new sections were applied to live as **delta INSERTs** (extracted from git diff) instead of re-running the whole file. **Before applying any other subject's seed file to live, first diff live sections against the file** (`SELECT heading, sort_order FROM sections … ORDER BY …` vs. the file) and backport any live-only rows. Never full-rerun a seed file until it matches live.

## Order of execution (conversion-driven)

PH school year starts August: incoming first-years hit **Semester 1** subjects first. So: CP1 → Intro to Computing → CP2 → Discrete Structures 1. The free-preview/heading task (5) and live-apply verification (6) close it out.

---

### Task 1: Computer Programming 1 — per-lesson activity upgrade (7 lessons, 7 commits)

**Files:**
- Modify: `supabase/seeds/cp1_modules_sections.sql` (subject `10000000-0001-0001-0001-000000000001`)

**Interfaces:**
- Consumes: existing module UUIDs `a1000001-0001-0001-0001-000000000001` … `…007` (Lessons 1–7) and each lesson's existing `Practice Exercises — Lesson N` activity (currently the max sort_order in each lesson).
- Produces: per lesson, two appended activity sections — `Worked Exam Solutions + How-to-Pass Tips — Lesson N` (text) and `Code Lab — Lesson N` (`ide_language='c'`).

Per-lesson drill topics (the C starter must target the lesson's own material):

| Lesson | Module UUID suffix | Worked-solutions source | Code Lab drill |
|---|---|---|---|
| 1 Programming Concepts | …001 | answer its 5 review questions + 1 exam scenario (trace the 5 programming steps for a tuition calculator) | complete a "pseudocode → C" hello-style program: print name, course, section from variables |
| 2 Introduction to C | …002 | solve the declaration/identifier-validity exercises with reasoning per item | fix 5 planted declaration errors (invalid identifiers, wrong types) so the program compiles and prints all values |
| 3 I/O & Program Structure | …003 | answer header/format-specifier questions; walk through one full scanf/printf trace | write `scanf`/`printf` program: read two grades, print average to 2 decimals (`%.2f`) |
| 4 Control Structures | …004 | solve the break/continue/switch questions; trace the loop outputs line by line | complete a grade-remark program (`if/else if` ladder: ≥90 A, ≥80 B, ≥75 C, else FAIL) then convert it to `switch` on grade/10 |
| 5 Arrays | …005 | full solutions to array-definition + trace exercises | complete `sum` and `largest` over a 10-element `int` array with a `for` loop (TODO markers) |
| 6 Functions | …006 | solve call-by-value vs call-by-reference questions with memory diagrams in markdown tables | implement `int square(int n)` and `void swap(int *a, int *b)`; main prints results before/after |
| 7 String/Char/Math | …007 | evaluate every `strrev/strupr/strncat/...` expression step by step; answer the TRUE/FALSE items | complete `count_vowels(char s[])` using `tolower` from `ctype.h` |

Every lesson repeats the same 5 steps; Lesson 5 is written out in full below as the concrete model — reproduce this exact structure (with the table's topics) for the other six lessons.

- [ ] **Step 1 (Lesson 5): Append the worked-solutions section** at the end of `cp1_modules_sections.sql`'s Lesson 5 block, `sort_order` = existing max in that module + 1 (Lesson 5's `Practice Exercises` is currently the last section — check the file; if it is sort_order 6, the new rows are 7 and 8):

```sql
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a1000001-0001-0001-0001-000000000005','activity','Worked Exam Solutions + How-to-Pass Tips — Lesson 5',$md$
**Answer Key — Review Questions**

1. *12-element array 1, 4, 7, …, 34:* `int C[12] = {1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34};` — arithmetic sequence, start 1, step 3. On exams, show the formula `a(n) = 1 + 3(n-1)` so the checker sees you did not just count.
2. *"NORTH" with null terminator:* `char point[6] = "NORTH";` — 5 letters + `'\0'` = 6 slots. Writing `char point[5]` is the classic mark-loser: it compiles but drops the terminator.
3. *4-character direction array:* `char letters[4] = {'N', 'S', 'E', 'W'};` — no terminator needed because it is a char *array*, not a string.

**Worked Exam-Style Problem**

*Problem:* Trace the output. `int a[5] = {2, 4, 6, 8, 10}; int i, s = 0; for (i = 0; i < 5; i += 2) s += a[i]; printf("%d", s);`

*Solution:* Step 1: `i = 0` → `s = 0 + a[0] = 2`. Step 2: `i = 2` → `s = 2 + a[2] = 8`. Step 3: `i = 4` → `s = 8 + a[4] = 18`. Step 4: `i = 6` fails `i < 5`, loop ends. Output: `18`. On tracing questions, make a two-column table (`i`, `s`) — professors give partial credit for a correct table even if the final number slips.

**How to Pass Tips**

- Array indices start at 0 and end at *size − 1*; nearly every CP1 exam plants an off-by-one trap.
- `int x[10]` reserves 10 slots but initializes nothing — reading `x[3]` before assignment is garbage, a favorite true/false item.
- For string questions, count the `'\0'` every single time.
- When asked to declare-and-initialize, prefer the brace form; when asked to fill via loop, write the loop — answering the wrong form costs points even when correct.
$md$, 7);
```

- [ ] **Step 2 (Lesson 5): Append the Code Lab drill** right after it:

```sql
INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('a1000001-0001-0001-0001-000000000005','activity','Code Lab — Lesson 5: Run It Yourself',$md$
**Coding Drill:** Complete `sum` and `largest` so the program reports the total and the highest quiz score. Press Run to compile real C right here — no installation needed.

Expected output:
```
Total: 61
Highest: 10
```
$md$, 8, 'c', $code$#include <stdio.h>

int main(void) {
    int scores[10] = {7, 5, 9, 3, 8, 6, 10, 4, 2, 7};
    int i, sum = 0, largest = scores[0];

    for (i = 0; i < 10; i++) {
        /* TODO: add scores[i] to sum */
        /* TODO: if scores[i] is greater than largest, update largest */
    }

    printf("Total: %d\n", sum);
    printf("Highest: %d\n", largest);
    return 0;
}$code$);
```

- [ ] **Step 3: Verify the SQL is well-formed** — run the whole updated file against live (it is idempotent): Supabase MCP `execute_sql` with the file contents. Expected: no error, and
  `SELECT COUNT(*) FROM sections sec JOIN modules m ON m.id=sec.module_id WHERE m.subject_id='10000000-0001-0001-0001-000000000001' AND sec.kind='activity';` returns previous count + 2.
- [ ] **Step 4: Spot-check gating** — confirm new sections have `kind='activity'` (paid) and `ide_language='c'` only on the Code Lab row.
- [ ] **Step 5: Commit**

```bash
git add supabase/seeds/cp1_modules_sections.sql
git commit -m "feat(seeds): Computer Programming 1 — Lesson 5 activity upgrade (worked solutions + C code lab)"
```

- [ ] **Repeat Steps 1–5 for Lessons 1, 2, 3, 4, 6, 7** using the per-lesson table above. Each lesson = its own commit. The worked-solutions section must actually answer *that lesson's existing* practice questions (read them from the file first); never write "refer to your notes".

**Done when:** CP1 has 21 activity sections (7 existing + 14 new), 7 of them runnable C drills.

**✅ COMPLETED 2026-07-05.** All 7 lessons upgraded and applied live. Verified: 21 paid activity sections, 7 C code labs, 30,464 paid chars (was 7/0/7,321). All 7 drills compiled with `cc -Wall` and matched their expected outputs; every published trace answer was machine-verified. Bonus: live-only "Try It" sections backported (see divergence warning above).

---

### Task 2: Introduction to Computing — per-unit activity upgrade (8 units, 8 commits)

**Files:**
- Modify: `supabase/seeds/introduction_to_computing_modules_sections.sql` (subject `10000000-0001-0001-0001-000000000002`)

**Interfaces:**
- Consumes: 8 existing unit modules (read their UUIDs from the file) and each unit's `Practice Exercises — Unit N` section.
- Produces: per unit, one `Worked Exam Solutions + How-to-Pass Tips — Unit N` activity section; Units II, III, and VI additionally get one IDE drill.

Structure of each worked-solutions section = identical to the CP1 Lesson 5 model in Task 1 (Answer Key → Worked Exam-Style Problem → How to Pass Tips), with unit-appropriate content. The three IDE drills:

| Unit | Drill | Language | Starter behavior |
|---|---|---|---|
| II Data Representation | Base-conversion checker | `python` | complete `to_binary(n)` / `to_hex(n)` (loop + remainder method, not `bin()`/`hex()` shortcuts — mirror the by-hand exam method, then compare with built-ins to self-check) |
| III Hardware / logic circuits | Truth-table generator | `python` | complete `Z(w, x, y, z)` returning `(w and x) or (y and z)`; loop prints the full 16-row truth table |
| VI Networks | Subnet/host counter | `python` | complete `usable_hosts(prefix)` returning `2**(32-prefix) - 2`; print a table for /24, /26, /28 |

Worked-solutions content requirements per unit (source = the unit's existing exercise list, already in the seed file):

- **Unit I:** answer the hardware/software/peopleware interdependence question with a jeepney analogy; classify 4 computer types.
- **Unit II:** fully convert the file's four numbers (10110110₂, 762₈, 785₁₀, BEE₁₆) to all four bases showing the division/remainder or positional work; solve the octal and hex additions digit by digit with carries.
- **Unit III:** RAM-vs-ROM and primary-vs-secondary tables; draw the Z = WX + YZ circuit as a markdown description (gate list + wiring) with its 16-row truth table.
- **Unit IV:** model answers for the 5 ICT job titles + "peopleware is most important" essay skeleton (thesis, 3 supports, conclusion — professors grade structure).
- **Unit V:** compiler-vs-interpreter table with one C and one Python example; system-vs-application software with 3 examples each; freeware/shareware/open-source distinctions.
- **Unit VI:** LAN/MAN/WAN/GAN table with PH examples (campus LAN, MRT line network, PLDT backbone, Internet); mesh advantages/disadvantages; ring-vs-star failure behavior.
- **Unit VII:** model paragraph for the 10-year-disruption essay (pick AI, give the grading rubric a thesis + 2 evidence points); cloud-in-education benefits/risks table.
- **Unit VIII:** AI vs ML vs DL nesting diagram in words + table; supervised-vs-unsupervised with a PH example each (loan scoring vs. customer clustering).

- [ ] **Step 1:** For Unit I, append the worked-solutions activity section (same SQL shape as Task 1 Step 1, that unit's module UUID, `sort_order` = unit max + 1).
- [ ] **Step 2:** For Units II/III/VI only, also append the IDE drill from the table (same SQL shape as Task 1 Step 2, `ide_language='python'`).
- [ ] **Step 3:** Re-apply the seed file live via `execute_sql`; expect activity count for subject `10000000-0001-0001-0001-000000000002` to increase by 1 (or 2 for II/III/VI).
- [ ] **Step 4: Commit** — `feat(seeds): Introduction to Computing — Unit I activity upgrade` (one commit per unit).
- [ ] **Repeat for Units II–VIII.**

**Done when:** Intro to Computing has 19 activity sections (8 existing + 8 solutions + 3 drills).

---

### Task 3: Computer Programming 2 — full rebuild (baseline + 6 new units, 7 commits)

**Files:**
- Modify: `supabase/seeds/cp2_modules_sections.sql` (subject `10000000-0001-0002-0001-000000000001`)

**Interfaces:**
- Consumes: existing Unit 1 module `a3000001-0001-0002-0001-000000000001` (**keep this UUID exactly** — students have progress on it) and its existing sections (keep unchanged).
- Produces: modules `a3000001-0001-0002-0001-000000000002` … `…000000000007` and full content for each.

New unit list (standard PH BSIT CP2-in-C syllabus, continuing CP1):

| # | Module UUID | Title | Slug |
|---|---|---|---|
| 2 | `a3000001-0001-0002-0001-000000000002` | Unit 2: Strings and Character Arrays | `unit-2-strings-and-character-arrays` |
| 3 | `a3000001-0001-0002-0001-000000000003` | Unit 3: Pointers | `unit-3-pointers` |
| 4 | `a3000001-0001-0002-0001-000000000004` | Unit 4: Structures and Unions | `unit-4-structures-and-unions` |
| 5 | `a3000001-0001-0002-0001-000000000005` | Unit 5: File Handling | `unit-5-file-handling` |
| 6 | `a3000001-0001-0002-0001-000000000006` | Unit 6: Recursion | `unit-6-recursion` |
| 7 | `a3000001-0001-0002-0001-000000000007` | Unit 7: Dynamic Memory and Linked Lists | `unit-7-dynamic-memory-and-linked-lists` |

Per new unit: **3 content sections (FREE)** teaching the topic in the house style (Filipino examples, exam-focused, ~1,200–2,000 chars each) + **2 activity sections (PAID)**: `Practice & Exam Drills — Unit N` (review questions AND their worked solutions in the same section, matching the IPT1 pattern) and `Code Lab — Unit N` (`ide_language='c'`). Code Lab drills per unit: 2 = complete `str_reverse` in place; 3 = fix pointer bugs in a swap/array-walk program; 4 = complete a `struct Student` array report (highest GWA); 5 = simulate record write/read with `tmpfile()` (Piston has no persistent FS — state this in the body); 6 = complete recursive `factorial` and `fibonacci` with a call-trace printout; 7 = complete `malloc`-based dynamic array growth + a 3-node linked-list traversal.

- [ ] **Step 1 (baseline): Extend the modules INSERT** in `cp2_modules_sections.sql` with the 6 new rows from the table (Unit 1's row untouched). Also update the header comment to describe the 7-unit split and free/paid rule.
- [ ] **Step 2: Re-apply live; verify** `SELECT COUNT(*) FROM modules WHERE subject_id='10000000-0001-0002-0001-000000000001';` returns 7 and Unit 1's id is unchanged.
- [ ] **Step 3: Commit** — `feat(seeds): Computer Programming 2 — 7-unit syllabus baseline`.
- [ ] **Step 4 (per unit, ×6):** Write Unit N's 3 content + 2 activity sections (SQL shapes identical to Task 1 Steps 1–2; Unit 1's existing style shows the content voice). Apply live, verify section counts, commit `feat(seeds): Computer Programming 2 — Unit N` (one commit per unit).
- [ ] **Step 5 (Unit 1 catch-up):** Unit 1 already has sample programs + exercises but no solutions and its samples use `void main()`/`conio.h`. Append a `Worked Exam Solutions + How-to-Pass Tips — Unit 1` activity (solve its Exercise 1 array declarations and trace one sample program; explicitly teach that `int main(void)` + `return 0;` is the portable form and old handouts' `clrscr()` won't compile on modern compilers) + a `Code Lab — Unit 1` C drill (matrix addition with TODO loops). Apply, verify, commit `feat(seeds): Computer Programming 2 — Unit 1 activity upgrade`.

**Done when:** CP2 has 7 modules, ≥ 18 content sections, ≥ 15 activity sections, 7 C code labs.

---

### Task 4: Discrete Structures 1 — per-lesson solutions + Python drills (9 lessons, 9 commits)

**Files:**
- Modify: `supabase/seeds/discrete_structures_1_modules_sections.sql` (subject `10000000-0001-0002-0001-000000000002`)

**Interfaces:**
- Consumes: 9 existing lesson modules (UUIDs in file) and each lesson's `Exercises — …` activity section.
- Produces: per lesson, one `Worked Exam Solutions + How-to-Pass Tips — Lesson N` activity; Lessons 1, 4, 6, 7, 9 additionally get a Python drill.

The solutions sections must solve the file's own exercises (e.g. Lesson 1: classify all 5 statements as propositions or not with reasons; Lesson 4: compute all 7 set expressions showing element-by-element work; Lesson 8: answer all induction true/false items and prove `1+2+…+n = n(n+1)/2` in the three-step format). Use `$…$` KaTeX for symbols (`\land`, `\lor`, `\neg`, `\subseteq`, `\sum`).

Python drills:

| Lesson | Drill |
|---|---|
| 1 Propositional Logic | complete `implies(p, q)` and print the 4-row truth table for `p → q` and `¬p ∨ q` side by side to *see* they match |
| 4 Set Concepts | complete union/intersection/complement with Python `set` ops for the exercise's exact U, A, B, C; compare with hand answers |
| 6 Counting | complete `factorial`, `P(n, r)`, `C(n, r)`; verify the menu/password exercise answers |
| 7 Summation & Series | complete `arith_term(a1, d, n)` and `geo_sum(a1, r, n)`; check the exercise sequences |
| 9 Graphs | complete degree-counting over an edge list; verify the handshaking theorem (sum of degrees = 2 × edges) |

- [ ] **Step 1:** For Lesson 1, append the worked-solutions activity (SQL shape from Task 1 Step 1, this lesson's module UUID).
- [ ] **Step 2:** For Lessons 1/4/6/7/9, also append the Python drill (SQL shape from Task 1 Step 2, `ide_language='python'`).
- [ ] **Step 3:** Re-apply seed live; verify the subject's activity count increased as expected.
- [ ] **Step 4: Commit** — `feat(seeds): Discrete Structures 1 — Lesson 1 activity upgrade` (one commit per lesson).
- [ ] **Repeat for Lessons 2–9.**

**Done when:** Discrete has 23 activity sections (9 existing + 9 solutions + 5 drills).

---

### Task 5: Free-preview hooks + benefit-led locked headings (4 commits, one per subject)

Locked activities show **only their heading** above the SubscribeGate — that heading is the ad. Two content-only changes, no app code:

- [ ] **Step 1 (per subject):** In each major's seed file, add ONE `kind='content'` (FREE) section at the end of Lesson/Unit 1 titled `Free Sample: One Worked Solution` containing a single fully worked mini-problem in the house style, ending with: `*Every lesson in this subject includes the full answer key, worked exam walkthroughs, how-to-pass tips, and runnable code labs — unlocked with the subject.*` (adjust "code labs" out for non-coding lessons). This gives every visitor proof of quality before the gate.
- [ ] **Step 2 (per subject):** Audit all PAID section headings in the file: every solutions section must be named `Worked Exam Solutions + How-to-Pass Tips — <Lesson/Unit N>` and every drill `Code Lab — <Lesson/Unit N>: Run It Yourself` (Tasks 1–4 already use these names; this step catches the pre-existing `Practice Exercises — …` headings, which stay as-is since they are real exercises — but confirm none of the *new* sections shipped with a flat heading).
- [ ] **Step 3:** Re-apply each seed live; verify each subject gained exactly 1 content section.
- [ ] **Step 4: Commit per subject** — `feat(seeds): <Subject> — free sample solution + conversion headings`.

---

### Task 6: Final verification + push

- [ ] **Step 1:** Re-run the audit query and paste results into this plan under "Post-upgrade numbers":

```sql
SELECT s.title, COUNT(sec.id) FILTER (WHERE sec.kind='activity') AS paid_sections,
       COUNT(sec.id) FILTER (WHERE sec.kind='activity' AND sec.ide_language IS NOT NULL) AS ide_drills,
       COALESCE(SUM(LENGTH(sec.body_md)) FILTER (WHERE sec.kind='activity'),0) AS paid_chars
FROM subjects s JOIN modules m ON m.subject_id=s.id JOIN sections sec ON sec.module_id=m.id
WHERE s.title IN ('Computer Programming 1','Introduction to Computing','Computer Programming 2','Discrete Structures 1')
GROUP BY s.id, s.title ORDER BY s.title;
```

Expected: every subject ≥ 15 paid sections and ≥ 20,000 paid chars; CP1/CP2 ≥ 7 IDE drills each.

- [ ] **Step 2:** In the running app (or prod), open CP1 Lesson 5 as a non-subscriber: the two new sections must render as heading + SubscribeGate; the Free Sample section must render in full. With `UNLOCK_ALL` (or a subscribed device), the Code Lab must show the C playground and the drill must compile and print the expected output when the TODOs are filled.
- [ ] **Step 3:** Push all commits (`gh auth token` piped into the HTTPS remote per project instructions).

## Self-Review Notes

- Spec coverage: audit ✔ (findings table), "more activities for each major" ✔ (Tasks 1–4), "attraction to persuade to pay" ✔ (worked-solutions value prop, IDE drills, Task 5 free samples + headings).
- All module UUIDs referenced exist in live DB except CP2 units 2–7, which Task 3 defines explicitly.
- Type consistency: all section inserts use the two shapes defined in Global Constraints; language ids restricted to `lib/ide/languages.ts` set.
