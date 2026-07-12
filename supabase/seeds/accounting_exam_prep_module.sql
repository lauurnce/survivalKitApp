-- ============================================================
-- Financial Accounting Principles — Exam Prep: Prelims & Finals
-- Subject ID: 10000000-0001-0001-0002-000000000002
-- Module ID:  a2000002-0001-0001-0002-0000000000e1
-- Purpose: prelim + final mock exams, blueprints, answer keys,
--          and trap drills built strictly from Units I–VI.
-- INSERT-only and idempotent: deletes only this module's row
-- (sections cascade), then re-inserts the module and sections.
-- Run after accounting_modules_sections.sql.
-- ============================================================

DELETE FROM modules WHERE id = 'a2000002-0001-0001-0002-0000000000e1';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('a2000002-0001-0001-0002-0000000000e1','10000000-0001-0001-0002-000000000002','Exam Prep: Prelims & Finals','exam-prep-prelims-finals',7);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES

-- ------------------------------------------------------------
-- Sort 1 — FREE: Prelim Exam Blueprint & Study Plan
-- ------------------------------------------------------------
('a2000002-0001-0001-0002-0000000000e1','content','Prelim Exam Blueprint & Study Plan',$md$
### What the Prelim Actually Covers

Your prelim exam is built from the first three units of this subject — nothing beyond them:

| Unit | Typical Weight | What Gets Tested |
|---|---|---|
| Unit I: Introduction to Accounting | ~25% | Definitions of accounting (AICPA, AAA, ASC viewpoints), history (Mesopotamia, Rome, Middle Ages, Pacioli 1494), the eight branches of accounting, strategic uses of financial information |
| Unit II: Generally Accepted Accounting Principles | ~30% | The 10 GAAP principles by name and application, international bodies (IFRS Foundation, IASB, Monitoring Board), the Philippine framework (PFRS/PAS, Board of Accountancy, BSP) |
| Unit III: Business Organizations and the Accounting Equation | ~45% | Forms of ownership (sole proprietorship, partnership, corporation, OPC), types of operations (service, merchandising, manufacturing), the accounting equation, debit/credit rules, normal balances, equity drivers |

Unit III carries the most weight because it contains everything computable — and professors love computation items.

### Question Types to Expect

- **Multiple choice** — mostly Unit I and II theory: match the definition to the body, match the scenario to the GAAP principle.
- **True or false** — statements with one twisted word ("conservatism anticipates *gains*" — false, it anticipates losses).
- **Classification** — given an account, name its element (Asset / Liability / Owner's Equity) and its normal balance.
- **Equation computations** — solve for the missing element of A = L + OE, or compute ending capital from investments, revenues, expenses, and drawings.

### Your Exact Memorize List

1. **The accounting equation and its variants.** Assets = Liabilities + Owner's Equity, and the rearranged form Assets − Liabilities = Owner's Equity. Remember: in liquidation, creditors are paid before owners.
2. **The 10 GAAP principles** — economic entity, monetary unit, time period, cost, full disclosure, going concern, matching, revenue recognition, materiality, conservatism. Know each by its one-line trigger scenario.
3. **Normal balances.** Assets — Debit. Liabilities — Credit. Owner's Capital — Credit. Revenues — Credit (they increase equity). Expenses — Debit (they decrease equity). Owner's Drawing — Debit (it decreases equity).
4. **Account classifications** — which side of the equation each common account (Cash, Accounts Receivable, Supplies, Accounts Payable, Service Revenue, Owner's Drawing) sits on.
5. **The four equity drivers** — owner investments (+), revenues (+), expenses (−), drawings (−).
6. **Business organization facts** — DTI registration for sole proprietorships, SEC registration for partnerships with capital above ₱3,000, limited vs. general partner liability, stock vs. non-stock vs. One Person Corporation.

### Top Mistakes That Cost Prelim Points

1. **Treating "debit" as "increase" for every account.** Debit increases assets, expenses, and drawings — but *decreases* liabilities, capital, and revenues.
2. **Confusing revenue with cash receipts.** Revenue is recognized when the service is performed, not when cash arrives. Collecting a receivable is not new revenue.
3. **Calling owner's drawings an expense.** Drawings reduce equity but are personal extractions, not costs of generating revenue.
4. **Mixing the owner's personal finances into the business** — the economic entity assumption makes them two separate entities for recording purposes, even in a sole proprietorship.
5. **Forgetting that some transactions change only one side of the equation.** Buying supplies with cash swaps one asset for another; totals stay the same.

### 7-Day Study Plan

| Day | Focus | What to Do |
|---|---|---|
| 1 | Unit I: Introduction to Accounting | Read the definitions and the branches table. Write each branch with its audience from memory. |
| 2 | Unit I (finish) | History timeline (Mesopotamia → Rome → Middle Ages → Pacioli 1494) and the four strategic uses of financial information. |
| 3 | Unit II: GAAP | Memorize all 10 principles. For each, write one scenario that triggers it. |
| 4 | Unit II (finish) | Standard-setting bodies: IASB vs. IFRS Foundation vs. Monitoring Board, then the Philippine side (PFRS/PAS, Board of Accountancy, BSP). |
| 5 | Unit III: Business Organizations and the Accounting Equation | Ownership forms and operation types. Drill the DTI / SEC / liability details. |
| 6 | Unit III (finish) | Debit/credit rules, normal balances table, equity drivers. Redo every equation computation in the unit. |
| 7 | Full rehearsal | Take the free 15-item practice set below under time pressure, then a full mock exam. Review every miss against the unit it came from. |
$md$, 1),

-- ------------------------------------------------------------
-- Sort 2 — FREE: Free Practice Set — 15 Items with Answer Key
-- ------------------------------------------------------------
('a2000002-0001-0001-0002-0000000000e1','content','Free Practice Set — 15 Items with Answer Key',$md$
### Instructions

Fifteen items covering Units I–III. Answer everything before scrolling to the key. Target: 20 minutes, no notes.

### Part 1 — Multiple Choice

1. Which body defines accounting as "the art of recording, classifying, and summarizing financial transactions and events in monetary terms, followed by interpretation of the results"?
   a) American Accounting Association  b) AICPA  c) Accounting Standards Council  d) IASB
2. The first formal published description of double-entry bookkeeping appeared in 1494 in a treatise written by:
   a) An IASB committee  b) Roman treasury clerks  c) Fra Luca Pacioli  d) The AICPA
3. Which branch of accounting is *not* bound by strict GAAP enforcement because its reports serve internal managers only?
   a) Financial accounting  b) Auditing  c) Managerial accounting  d) Tax accounting
4. A company records its delivery van at the ₱850,000 it paid three years ago, even though its market value has changed. Which principle applies?
   a) Cost principle  b) Materiality  c) Conservatism  d) Going concern
5. A partnership whose capital is ₱50,000 must register with the:
   a) DTI  b) SEC  c) BSP  d) Board of Accountancy

### Part 2 — True or False

6. Under the monetary unit assumption, peso amounts from different years are combined assuming a constant unit of purchasing power.
7. A limited partner in a limited partnership is liable for partnership debts beyond their capital contribution.
8. A merchandising business changes the physical form of the goods it sells.
9. Revenues have a normal credit balance because they increase owner's equity.

### Part 3 — Classification

For items 10–11, state the element (Asset, Liability, or Owner's Equity effect) and the normal balance.

10. Accounts Receivable
11. Owner's Drawing

### Part 4 — Equation Computations

12. Total liabilities are ₱180,000 and owner's equity is ₱420,000. Compute total assets.
13. Total assets are ₱750,000 and owner's equity is ₱480,000. Compute total liabilities.
14. Total assets are ₱240,000 and liabilities equal one-fourth of total assets. Compute owner's equity.
15. An owner invested ₱500,000 to start a service business. During the period the business earned ₱200,000 in revenues, incurred ₱120,000 in expenses, and the owner withdrew ₱30,000. Compute ending capital.

### Answer Key

| No. | Answer | One-Line Explanation |
|---|---|---|
| 1 | b | The "art of recording, classifying, and summarizing" wording is the AICPA viewpoint. |
| 2 | c | Pacioli's 1494 *Summa* contained the 27-page treatise *Particularis de Computis et Scripturis*. |
| 3 | c | Managerial accounting serves internal managers without strict GAAP enforcement. |
| 4 | a | The cost principle keeps assets at historical cost — no upward market revaluation. |
| 5 | b | Partnerships with capital above ₱3,000 register with the SEC; DTI handles sole proprietorship business names. |
| 6 | True | The assumption ignores inflation and treats the peso as a stable measuring unit. |
| 7 | False | Limited partners are liable only up to their explicit capital contribution. |
| 8 | False | Merchandisers resell finished goods without altering their form; manufacturers transform them. |
| 9 | True | Increases in equity are credits, so revenue's normal balance is a credit. |
| 10 | Asset; normal balance Debit | It is a claim to collect cash from customers for services performed. |
| 11 | Reduces Owner's Equity; normal balance Debit | Drawings decrease equity, so they carry a debit balance. |
| 12 | ₱600,000 | Assets = 180,000 + 420,000 = **₱600,000**. |
| 13 | ₱270,000 | Liabilities = 750,000 − 480,000 = **₱270,000**. |
| 14 | ₱180,000 | Liabilities = 240,000 × 1/4 = 60,000; Equity = 240,000 − 60,000 = **₱180,000**. |
| 15 | ₱550,000 | 500,000 + 200,000 − 120,000 − 30,000 = **₱550,000**. |

Scored 12/15 or better? You are ready for the full-length mocks. The complete prelim and final mock exams below come with the subject unlock.
$md$, 2),

-- ------------------------------------------------------------
-- Sort 3 — Prelim Mock Exam A — 30 Items
-- ------------------------------------------------------------
('a2000002-0001-0001-0002-0000000000e1','activity','Prelim Mock Exam A — 30 Items',$md$
### Instructions

Coverage: Units I–III. Time limit: 60 minutes. Work on paper exactly as you would in class — no notes, show your computations. The full answer key with explanations is in the Answer Key section of this module.

### Part I — Multiple Choice (Items 1–12)

1. Which body describes accounting as "the system of identifying, measuring, and communicating economic performance metrics to enable informed external judgments and decisions"?
   a) AICPA  b) American Accounting Association  c) Accounting Standards Council  d) IFRS Foundation
2. The 27-page treatise *Particularis de Computis et Scripturis* was published as part of which 1494 work?
   a) The Corporation Code  b) *Summa de Arithmetica, Geometria, Proportioni et Proportionalita*  c) The Civil Code  d) The first IFRS handbook
3. Which branch of accounting reconstructs broken or missing financial documentation and investigates corporate fraud?
   a) Fiduciary accounting  b) Auditing  c) Forensic accounting  d) Cost accounting
4. In cost accounting, factory rent is classified as a:
   a) Variable cost  b) Fixed cost  c) Revenue  d) Liability
5. A multi-million-peso corporation immediately expenses a low-cost printer instead of depreciating it over five years. Which principle permits this?
   a) Conservatism  b) Going concern  c) Materiality  d) Full disclosure
6. Deferring a prepaid expense across future periods is justified by which principle?
   a) Going concern  b) Monetary unit  c) Economic entity  d) Revenue recognition
7. Which independent technical body develops, publishes, and updates IFRS standards?
   a) The Monitoring Board  b) The IASB  c) The IFRS Advisory Council  d) The Trustees of the IFRS Foundation
8. In the Philippines, the PFRS Council issues standards under the professional supervision of the:
   a) DTI  b) SEC  c) Board of Accountancy  d) Bureau of Internal Revenue
9. A sole proprietor must verify the business name with which agency?
   a) SEC  b) DTI  c) BSP  d) The city treasurer
10. Which type of corporation does not issue stock shares to its members?
    a) Stock corporation  b) Non-stock corporation  c) One Person Corporation  d) Limited partnership
11. A barbershop that sells haircuts and grooming advice is a:
    a) Merchandising business  b) Manufacturing business  c) Service business  d) Fiduciary business
12. The normal balance of Accounts Payable is:
    a) Debit  b) Credit  c) Zero  d) It depends on the period

### Part II — True or False (Items 13–20)

13. Under the monetary unit assumption, transaction amounts from different chronological eras are combined assuming a constant unit of purchasing power.
14. The matching principle permits businesses to use the cash basis of accounting.
15. The conservatism principle instructs accountants to anticipate potential gains and ignore potential losses.
16. The single stockholder of a One Person Corporation may be another corporation.
17. In a business liquidation, owners are paid before creditors.
18. Expenses have a normal debit balance because they reduce owner's equity.
19. A merchandising business purchases finished goods and alters their physical form before resale.
20. Early accounting techniques in ancient Mesopotamia date back over 7,000 years.

### Part III — Classification (Items 21–25)

For each account, state (a) its element — Asset, Liability, or Owner's Equity effect — and (b) its normal balance.

21. Cash
22. Accounts Payable
23. Service Revenue
24. Owner's Drawing
25. Supplies

### Part IV — Computations (Items 26–30)

Show your solutions.

26. Total liabilities are ₱95,000 and owner's capital is ₱310,000. Compute total assets.
27. Total assets are ₱880,000 and total liabilities are ₱265,000. Compute owner's capital.
28. Total assets are ₱540,000, and total liabilities equal exactly one-third of total assets. Compute owner's capital.
29. A business collects ₱60,000 cash from a client who owed it ₱140,000 on account. What is the effect on *total* assets, and what receivable balance remains from this client?
30. Beginning capital is ₱720,000. During the year the owner made an additional investment of ₱100,000, the business earned revenues of ₱950,000, incurred expenses of ₱610,000, and the owner withdrew ₱45,000. Compute ending capital.
$md$, 3),

-- ------------------------------------------------------------
-- Sort 4 — Prelim Mock Exam B — 30 Items
-- ------------------------------------------------------------
('a2000002-0001-0001-0002-0000000000e1','activity','Prelim Mock Exam B — 30 Items',$md$
### Instructions

Coverage: Units I–III, all-new items and a notch harder than Mock A. Time limit: 60 minutes. Answers with explanations are in the Answer Key section.

### Part I — Multiple Choice (Items 1–12)

1. Which body defines accounting as "a quantitative service activity designed to provide structured financial data regarding economic entities, intended to assist in selecting optimal alternative courses of action"?
   a) AICPA  b) American Accounting Association  c) Accounting Standards Council  d) IASB
2. The transition from barter systems to formal monetary economies — which pushed merchants toward early double-entry bookkeeping — occurred in which period?
   a) Ancient Mesopotamia  b) The Roman Empire  c) The 13th-century Middle Ages  d) The 20th century
3. Which branch of accounting manages the architecture, deployment, and analysis of financial software and accounting workflows?
   a) Forensic accounting  b) Accounting Information Systems  c) Cost accounting  d) Financial accounting
4. The primary audience of fiduciary accounting is:
   a) Production managers  b) Beneficiaries, legal guardians, and bankruptcy courts  c) Tax authorities only  d) The general public
5. A business logs employee wages in the week the employees worked, even though payday falls in the following week. Which principle is applied?
   a) Materiality  b) Cost principle  c) Matching principle  d) Monetary unit assumption
6. Disclosing a pending corporate lawsuit in the financial statement footnotes applies which principle?
   a) Full disclosure  b) Conservatism  c) Going concern  d) Time period
7. When two valid accounting methods exist, choosing the one that avoids overstating net income applies which principle?
   a) Materiality  b) Conservatism  c) Matching  d) Revenue recognition
8. Which group provides a direct link between public entities and the IFRS Trustees to enforce public accountability?
   a) The Monitoring Board  b) The IASB  c) ASAF  d) The Interpretations Committee
9. Which institution mandates PFRS compliance for all financial entities it supervises?
   a) DTI  b) Bangko Sentral ng Pilipinas  c) The IFRS Foundation  d) The Monitoring Board
10. In which form of partnership do *all* partners bear unlimited liability for partnership obligations?
    a) Limited partnership  b) General partnership  c) One Person Corporation  d) Non-stock corporation
11. A workshop that buys lumber and transforms it into finished dining tables is a:
    a) Service business  b) Merchandising business  c) Manufacturing business  d) Fiduciary business
12. Which account *decreases* owner's equity but is not an expense?
    a) Salaries Expense  b) Owner's Drawing  c) Service Revenue  d) Accounts Payable

### Part II — True or False (Items 13–20)

13. Under the time period assumption, shorter reporting intervals depend more heavily on estimated accounting values.
14. The cost principle requires accountants to adjust asset values upward to match current market conditions.
15. Under the revenue recognition principle, revenue is logged the moment cash is received, regardless of when the service is performed.
16. A partnership is a juridical person with a legal personality separate from its members.
17. A stockholder's liability is capped at their individual share capital investment.
18. External auditing evaluates corporate policy, fraud control, and operational division of duties.
19. A decrease in an account is always recorded on the side opposite its normal balance.
20. Pacioli's treatise introduced symbols for plus and minus.

### Part III — Transaction Analysis (Items 21–25)

For each transaction, name the two accounts affected and state whether each increases (+) or decreases (−).

21. The owner invests ₱300,000 cash to start the business.
22. The business purchases equipment worth ₱80,000 on credit.
23. The business pays ₱25,000 of the amount owed on the equipment.
24. The business bills a client ₱45,000 on account for services rendered.
25. The owner withdraws ₱12,000 cash for personal use.

### Part IV — Computations (Items 26–30)

Show your solutions.

26. Total assets are ₱690,000, and owner's capital is exactly twice the total liabilities. Compute total liabilities and owner's capital.
27. During the year, total assets increased by ₱150,000 while total liabilities decreased by ₱40,000. By how much did owner's equity change?
28. At the start of the year: assets ₱500,000, liabilities ₱210,000. At year-end: assets ₱640,000, liabilities ₱255,000. The owner made no additional investments and no withdrawals. Compute net income for the year.
29. Revenues for the period total ₱830,000 and net income is ₱145,000. Compute total expenses.
30. Ending capital is ₱934,000. During the year the business earned net income of ₱268,000, the owner withdrew ₱60,000, and the owner made an additional investment of ₱150,000. Compute beginning capital.
$md$, 4),

-- ------------------------------------------------------------
-- Sort 5 — Prelim Mock Exams — Answer Key with Explanations
-- ------------------------------------------------------------
('a2000002-0001-0001-0002-0000000000e1','activity','Prelim Mock Exams — Answer Key with Explanations',$md$
### Mock Exam A — Answers

**Part I — Multiple Choice**

| No. | Answer | Why — and why the tempting choice is wrong |
|---|---|---|
| 1 | b | "Identifying, measuring, and communicating" is the American Accounting Association viewpoint. AICPA (a) is the "art of recording, classifying, and summarizing" wording. |
| 2 | b | The treatise was a 27-page section of Pacioli's *Summa de Arithmetica*. |
| 3 | c | Forensic accounting reconstructs records and investigates fraud. Auditing (b) verifies compliance — it does not reconstruct missing documentation. |
| 4 | b | Rent stays constant regardless of output, so it is a fixed cost; shipping is the classic variable cost. |
| 5 | c | Materiality permits deviating from standard treatment when the amount is too small to mislead readers. Conservatism (a) is about choosing between two *valid* methods. |
| 6 | a | Going concern assumes continued operations, which justifies spreading prepaid costs across future periods. |
| 7 | b | The IASB is the technical body under the IFRS Foundation that develops and publishes IFRS. The Trustees (d) handle governance and fundraising. |
| 8 | c | The PFRS Council operates under the Board of Accountancy's supervision. |
| 9 | b | DTI handles sole proprietorship business name verification; SEC (a) is for partnerships and corporations. |
| 10 | b | Non-stock corporations are formed for public, charitable, or educational purposes and issue no shares. |
| 11 | c | Haircuts are intangible skill-based products — a service business. |
| 12 | b | Accounts Payable is a liability; liabilities increase on the credit side, so their normal balance is a credit. |

**Part II — True or False**

| No. | Answer | Explanation |
|---|---|---|
| 13 | True | The monetary unit assumption ignores inflation and treats the peso as stable across eras. |
| 14 | False | The matching principle *mandates* the accrual basis, not the cash basis. |
| 15 | False | It is the reverse: anticipate and disclose potential losses; ignore gains until they occur. |
| 16 | False | An OPC stockholder must be a natural person of legal age, a trust, or an estate. |
| 17 | False | Creditors hold top priority; owners receive only the residual. |
| 18 | True | Anything that reduces equity carries a debit-nature balance. |
| 19 | False | Merchandisers resell goods *without* altering their physical form. |
| 20 | True | Mesopotamian agricultural record-keeping goes back over 7,000 years. |

**Part III — Classification**

| No. | Account | Element | Normal Balance |
|---|---|---|---|
| 21 | Cash | Asset | Debit |
| 22 | Accounts Payable | Liability | Credit |
| 23 | Service Revenue | Increases Owner's Equity | Credit |
| 24 | Owner's Drawing | Decreases Owner's Equity | Debit |
| 25 | Supplies | Asset | Debit |

**Part IV — Computations**

26. Assets = Liabilities + Capital = 95,000 + 310,000 = **₱405,000**.
27. Capital = Assets − Liabilities = 880,000 − 265,000 = **₱615,000**.
28. Liabilities = 540,000 × 1/3 = 180,000. Capital = 540,000 − 180,000 = **₱360,000**.
29. **No change in total assets** — Cash increases ₱60,000 while Accounts Receivable decreases ₱60,000; one asset simply replaces another. Remaining receivable = 140,000 − 60,000 = **₱80,000**. If you answered "assets increased ₱60,000," you forgot the receivable side of the swap.
30. Ending capital = 720,000 + 100,000 + 950,000 − 610,000 − 45,000 = **₱1,115,000**. All four equity drivers plus the additional investment must appear — the most common miss is dropping the ₱100,000 investment.

---

### Mock Exam B — Answers

**Part I — Multiple Choice**

| No. | Answer | Why — and why the tempting choice is wrong |
|---|---|---|
| 1 | c | "Quantitative service activity... alternative courses of action" is the Accounting Standards Council wording. |
| 2 | c | The 13th-century Middle Ages saw the barter-to-money shift and early double-entry development. Rome (b) tracked state finances but predates that shift. |
| 3 | b | AIS covers financial software architecture, deployment, and workflows. |
| 4 | b | Fiduciary accounting reports on property managed for others — estates, trusts, bankruptcies. |
| 5 | c | Matching recognizes expenses in the period of the revenues they helped generate, regardless of cash timing. |
| 6 | a | Full disclosure requires revealing anything capable of altering an investor's or lender's judgment. |
| 7 | b | Conservatism selects the option that avoids overstating income or assets. Materiality (a) is about small amounts, not method choice. |
| 8 | a | The Monitoring Board is the group of capital market authorities linking the public to the IFRS Trustees. |
| 9 | b | The BSP mandates compliance for all financial entities it supervises. |
| 10 | b | In a general partnership every partner has unlimited liability; a limited partnership (a) shields only its limited partners. |
| 11 | c | Transforming raw materials into new finished goods is manufacturing. |
| 12 | b | Drawings reduce equity but are personal extractions, not costs of earning revenue. Salaries Expense (a) also reduces equity but *is* an expense. |

**Part II — True or False**

| No. | Answer | Explanation |
|---|---|---|
| 13 | True | Monthly or quarterly statements lean more on estimates than annual ones. |
| 14 | False | Historical cost is kept; no upward revaluation for market conditions or inflation. |
| 15 | False | Revenue is recognized when the product is sold or the service is performed — not on cash receipt. |
| 16 | True | The Civil Code establishes it as a distinct juridical person. |
| 17 | True | That liability cap is the defining shield of the corporate form. |
| 18 | False | Those are *internal* auditing functions; external auditing independently verifies GAAP/IFRS compliance. |
| 19 | True | Increases go on the normal balance side; decreases go on the opposite side. |
| 20 | True | The *Summa* introduced symbols for plus and minus. |

**Part III — Transaction Analysis**

| No. | Account Debited | Effect | Account Credited | Effect |
|---|---|---|---|---|
| 21 | Cash (Asset) | + | Owner's Capital (Equity) | + |
| 22 | Equipment (Asset) | + | Accounts Payable (Liability) | + |
| 23 | Accounts Payable (Liability) | − | Cash (Asset) | − |
| 24 | Accounts Receivable (Asset) | + | Service Revenue (Equity) | + |
| 25 | Owner's Drawing (Equity) | − | Cash (Asset) | − |

**Part IV — Computations**

26. Let L = liabilities. Assets = L + 2L = 3L, so 3L = 690,000 → L = **₱230,000** and Capital = 2 × 230,000 = **₱460,000**.
27. Change in equity = change in assets − change in liabilities = 150,000 − (−40,000) = **increase of ₱190,000**. The trap: subtracting a *decrease* in liabilities means adding it back.
28. Beginning equity = 500,000 − 210,000 = 290,000. Ending equity = 640,000 − 255,000 = 385,000. With no investments or drawings, net income = 385,000 − 290,000 = **₱95,000**.
29. Expenses = Revenues − Net income = 830,000 − 145,000 = **₱685,000**.
30. Work the capital formula backwards: Beginning = Ending − Net income + Drawings − Additional investment = 934,000 − 268,000 + 60,000 − 150,000 = **₱576,000**. Check forward: 576,000 + 150,000 + 268,000 − 60,000 = 934,000. ✔
$md$, 5),

-- ------------------------------------------------------------
-- Sort 6 — Common Prelim Traps & How to Avoid Them
-- ------------------------------------------------------------
('a2000002-0001-0001-0002-0000000000e1','activity','Common Prelim Traps & How to Avoid Them',$md$
These six confusions sink more prelim scores than any hard computation. Each trap ends with a mini-drill — answer it before reading the solution line.

### Trap 1 — "Debit always means increase"

Debit is a *position* (the left side), not a direction. A debit increases assets, expenses, and drawings — but decreases liabilities, capital, and revenues. The rule: an increase is recorded on the account's *normal balance side*, whichever side that is.

**Mini-drill:** Your business pays a supplier ₱20,000 it owed. Does the debit to Accounts Payable increase or decrease that account?

**Answer:** It *decreases* it. Accounts Payable is a liability with a normal credit balance, so a debit reduces it.

### Trap 2 — Expense vs. liability

An expense is a cost consumed to generate revenue (income-statement side). A liability is an unpaid obligation (balance-sheet side). They often appear in the same transaction, which is why students merge them.

**Mini-drill:** You buy office supplies on credit. Is Accounts Payable the expense in this transaction?

**Answer:** No. Accounts Payable is the liability — the obligation to pay. Supplies is the asset acquired. Nothing here is an expense yet; the expense appears only as supplies are consumed.

### Trap 3 — Owner's drawings vs. expenses

Both reduce equity and both have normal debit balances, but drawings are personal extractions by the owner, not costs of running the business. Drawings never appear among expenses.

**Mini-drill:** The owner takes ₱5,000 from the business cash box to pay a personal bill. Debit Miscellaneous Expense?

**Answer:** No — debit Owner's Drawing ₱5,000, credit Cash ₱5,000. Personal use is never a business expense (this is also the economic entity assumption at work).

### Trap 4 — Revenue vs. cash receipts

Under the revenue recognition principle, revenue is logged the moment the service is performed — not when cash arrives. Billing a client creates revenue with zero cash; collecting a receivable creates cash with zero new revenue.

**Mini-drill:** In March you collect ₱30,000 from a client you billed (and recorded as revenue) in February. How much revenue do you record in March from this collection?

**Answer:** ₱0. The revenue belonged to February, when the service was performed. March records Cash + ₱30,000 and Accounts Receivable − ₱30,000.

### Trap 5 — Entity concept violations

The economic entity assumption separates the business from its owner — even a sole proprietorship is two entities for recording purposes. Personal assets and personal spending never enter the business books.

**Mini-drill:** A sole proprietor uses her personal savings to buy a family car, "since the business is mine anyway." Does the car appear in the business records?

**Answer:** No. It is a personal asset purchased with personal funds. Recording it would overstate business assets and violate the economic entity assumption.

### Trap 6 — "Every transaction changes both sides of the equation"

Some transactions move value *within* one side. Buying supplies for cash swaps one asset for another; collecting a receivable does the same. Totals stay identical, and the equation stays balanced without either side changing.

**Mini-drill:** A business buys ₱3,000 of supplies, paying by check. What happens to total assets, total liabilities, and total equity?

**Answer:** Nothing changes in total. Supplies + ₱3,000, Cash − ₱3,000 — an asset-for-asset swap. Liabilities and equity are untouched.
$md$, 6),

-- ------------------------------------------------------------
-- Sort 7 — Final Exam Blueprint & Rapid Review Sheet
-- ------------------------------------------------------------
('a2000002-0001-0001-0002-0000000000e1','activity','Final Exam Blueprint & Rapid Review Sheet',$md$
### Coverage and Weight

The final exam is cumulative over Units I–VI, but the weight sits firmly on the second half:

| Units | Typical Weight | Focus |
|---|---|---|
| Units I–III (prelim material) | ~25% | Quick theory recall: GAAP triggers, normal balances, equation computations |
| Unit IV: Accounting Information System and Cycle | ~25% | The 11 cycle steps in order, journalizing, posting, trial balance, chart of accounts classifications |
| Unit V: Period-End Adjustments | ~30% | All adjustment types with computations — the heart of the exam |
| Unit VI: Closing and Reversing Entries | ~20% | The 4-step closing sequence, what gets reversed and what never does |

Expect journal-entry problems and at least one multi-part adjusting-entries case with peso amounts.

### The 11 Cycle Steps — In Order, From Memory

1. Analyze transactions via source documents
2. Journalize into the General Journal
3. Post to the General Ledger
4. Prepare the unadjusted Trial Balance
5. Assemble adjustment data
6. Formulate the Worksheet
7. Generate the Financial Statements
8. Journalize and post Adjusting Entries
9. Journalize and post Closing Entries
10. Construct the Post-Closing Trial Balance
11. Journalize and post Reversing Entries (start of the new period)

### Normal Balances — Memorize This Table Cold

| Account Type | Normal Balance | To Increase | To Decrease |
|---|---|---|---|
| Assets | Debit | Debit | Credit |
| Contra-assets (Accumulated Depreciation) | Credit | Credit | Debit |
| Liabilities | Credit | Credit | Debit |
| Owner's Capital | Credit | Credit | Debit |
| Owner's Drawing | Debit | Debit | Credit |
| Revenues | Credit | Credit | Debit |
| Expenses | Debit | Debit | Credit |

### Adjustment Types with Pro-Forma Entries

| Type | Situation | Pro-Forma Adjusting Entry |
|---|---|---|
| Accrued expense | Consumed this period, unpaid/unbilled | Dr Expense / Cr Liability (e.g., Salaries Payable) |
| Accrued revenue | Performed this period, unbilled/uncollected | Dr Receivable / Cr Revenue |
| Prepaid expense — asset method | Payment parked in an asset (Prepaid Rent) | Dr Expense / Cr Asset — for the portion **used** |
| Prepaid expense — expense method | Payment parked in an expense (Rent Expense) | Dr Asset / Cr Expense — for the portion **unused** |
| Unearned revenue — liability method | Collection parked in a liability (Unearned Rent) | Dr Liability / Cr Revenue — for the portion **earned** |
| Unearned revenue — revenue method | Collection parked in a revenue account | Dr Revenue / Cr Liability — for the portion **unearned** |
| Depreciation | Allocating fixed-asset cost over useful life | Dr Depreciation Expense / Cr Accumulated Depreciation |

Two formulas to write on your scratch sheet the moment the exam starts:

- **Straight-line depreciation:** (Historical cost − Residual value) ÷ Useful life in years. Prorate by months for mid-year purchases. Land is never depreciated.
- **Interest accrual:** Interest = Principal × Rate × Time (with time as days over 360, or months over 12).

### The 4-Step Closing Sequence

1. **Close revenues:** Dr each revenue account / Cr Income Summary for the total.
2. **Close expenses:** Dr Income Summary for the total / Cr each expense account.
3. **Close Income Summary to Capital:** net income → Dr Income Summary / Cr Capital; net loss → Dr Capital / Cr Income Summary.
4. **Close Drawing to Capital:** Dr Capital / Cr Drawing.

Only temporary (nominal) accounts — revenues, expenses, drawings, Income Summary — are closed. Permanent accounts (assets, liabilities, capital) survive into the post-closing trial balance.

### Reversing Entries — The One Rule

Reverse on day one of the new period only the adjustments that created a *brand-new asset or liability*: accrued expenses, accrued revenues, prepayments recorded under the **expense method**, and advance collections recorded under the **revenue method**. Never reverse depreciation or allowance for bad debts adjustments — they trigger no future cash transaction.
$md$, 7),

-- ------------------------------------------------------------
-- Sort 8 — Final Mock Exam A — 30 Items
-- ------------------------------------------------------------
('a2000002-0001-0001-0002-0000000000e1','activity','Final Mock Exam A — 30 Items',$md$
### Instructions

Cumulative coverage, Units I–VI, weighted to Units IV–VI. Time limit: 90 minutes. For journal entries, use two-line form: debit account and amount first, then the indented credit. Full solutions are in the Final Answer Key section.

### Part I — Multiple Choice (Items 1–10)

1. In the accounting cycle, which step immediately follows journalizing transactions?
   a) Preparing the trial balance  b) Posting to the General Ledger  c) Formulating the worksheet  d) Closing entries
2. The unadjusted trial balance is prepared primarily to verify:
   a) Net income  b) The equality of total debits and total credits  c) Cash on hand  d) Compliance with PFRS
3. Which of the following is a contra-asset account?
   a) Prepaid Insurance  b) Accumulated Depreciation  c) Notes Receivable  d) Unearned Revenue
4. Unearned Revenue is classified as a:
   a) Current asset  b) Revenue  c) Current liability  d) Non-current asset
5. Which of the following is an intangible asset?
   a) Machinery  b) Land  c) Patent  d) Supplies
6. Every adjusting entry affects:
   a) Two balance sheet accounts only  b) Two income statement accounts only  c) At least one income statement account and one balance sheet account  d) Only the Cash account
7. Which asset is never depreciated?
   a) Buildings  b) Equipment  c) Furniture and fixtures  d) Land
8. The Income Summary account is used only during:
   a) Journalizing daily transactions  b) The year-end closing sequence  c) Posting  d) Preparing source documents
9. Which period-end adjustment is *never* reversed at the start of the new period?
   a) Accrued salaries  b) Accrued interest revenue  c) Depreciation  d) Prepaid insurance recorded via the expense method
10. The post-closing trial balance contains:
    a) Only temporary accounts  b) Only permanent (real) accounts  c) Revenues and expenses  d) The Drawing account

### Part II — True or False (Items 11–16)

11. Mortgage Payable is a current liability.
12. Under the expense method for prepayments, the year-end adjusting entry records the *unused* portion as an asset.
13. Closing entries reset permanent accounts to a zero balance.
14. A net loss is closed by debiting Owner's Capital and crediting Income Summary.
15. Reversing entries are journalized on the last day of the closing period.
16. A Note Receivable is a formal written claim for unconditional future cash collection.

### Part III — Journalizing (Items 17–22)

Journalize the December 2026 transactions of Cruz Consulting. Use these account titles: Cash; Accounts Receivable; Equipment; Accounts Payable; Cruz, Capital; Cruz, Drawing; Service Revenue.

17. Dec 1 — R. Cruz invested ₱400,000 cash to start the business.
18. Dec 3 — Purchased equipment for ₱150,000, paying ₱50,000 in cash with the balance on account.
19. Dec 10 — Performed consulting services and collected ₱70,000 cash.
20. Dec 15 — Billed a client ₱95,000 on account for services rendered.
21. Dec 20 — Paid ₱40,000 toward the equipment balance owed.
22. Dec 28 — Cruz withdrew ₱15,000 cash for personal use.

### Part IV — Adjusting-Entries Mini-Case (Items 23–27)

Ramos Services adjusts its books every December 31. Prepare the adjusting entry for each independent item, dated December 31, 2026. Show computations.

23. The business pays a total weekly payroll of ₱30,000 for a 5-day work week, every Friday. This year, December 31 falls on a Tuesday.
24. On September 1, 2026, the business paid ₱24,000 for a one-year insurance policy, debiting the full amount to Prepaid Insurance (asset method).
25. On October 1, 2026, the business collected ₱36,000 for twelve months of rent in advance, crediting the full amount to Unearned Rent (liability method).
26. Equipment costing ₱200,000 with a residual value of ₱20,000 and a useful life of 5 years was owned for the entire year.
27. Services worth ₱18,000 were performed for a client in late December but remain unbilled and uncollected.

### Part V — Closing and Capital (Items 28–30)

The adjusted balances of Ramos Services at December 31, 2026: Service Revenue ₱860,000; Salaries Expense ₱410,000; Rent Expense ₱96,000; Depreciation Expense ₱36,000; Ramos, Drawing ₱50,000; Ramos, Capital (beginning) ₱600,000.

28. Compute net income for the year.
29. Prepare the closing entry that transfers the Income Summary balance to capital.
30. Compute the ending balance of Ramos, Capital.
$md$, 8),

-- ------------------------------------------------------------
-- Sort 9 — Final Mock Exam B — 30 Items
-- ------------------------------------------------------------
('a2000002-0001-0001-0002-0000000000e1','activity','Final Mock Exam B — 30 Items',$md$
### Instructions

Cumulative coverage, Units I–VI, weighted to Units IV–VI — all-new items. Time limit: 90 minutes. Full solutions are in the Final Answer Key section.

### Part I — Multiple Choice (Items 1–10)

1. Which step comes *last* in the complete accounting cycle?
   a) Post-closing trial balance  b) Closing entries  c) Reversing entries  d) Financial statements
2. Invoices, receipts, and payroll records are examined in which cycle step?
   a) Posting  b) Analyzing transactions via source documents  c) Closing  d) Worksheet preparation
3. Goodwill is classified as:
   a) A current asset  b) Property, plant, and equipment  c) An intangible asset  d) A contra-asset
4. Salaries Payable arising from a year-end accrual is classified as:
   a) An expense  b) A current liability  c) A non-current liability  d) A contra-asset
5. Under which bookkeeping method is an advance rent *payment* debited entirely to Rent Expense on the payment date?
   a) Asset method  b) Expense method  c) Liability method  d) Revenue method
6. The adjusting entry for an accrued revenue is:
   a) Dr Cash / Cr Revenue  b) Dr Receivable / Cr Revenue  c) Dr Revenue / Cr Receivable  d) Dr Unearned Revenue / Cr Cash
7. Which entries clear all temporary nominal accounts to a zero balance?
   a) Adjusting entries  b) Reversing entries  c) Closing entries  d) Correcting entries
8. The multi-column worksheet is formulated:
   a) Before journalizing  b) After the unadjusted trial balance and adjustment data are assembled  c) After the post-closing trial balance  d) On the first day of the new period
9. Which adjustment *should* be reversed at the start of the new period?
   a) Depreciation of equipment  b) An adjustment to Allowance for Bad Debts  c) Accrued salaries  d) A prepayment recorded under the asset method
10. If the Income Summary account holds a net *debit* balance before it is closed to capital, the business has:
    a) Net income  b) Net loss  c) Zero profit  d) Excess cash

### Part II — True or False (Items 11–16)

11. Posting is the transfer of journal entries to the individual accounts in the General Ledger.
12. Prepaid Insurance is a current asset.
13. Under the liability method for advance collections, the year-end adjusting entry recognizes the *unearned* portion.
14. Accumulated Depreciation is closed to Income Summary at year-end.
15. Accrued interest on a note is computed as Principal × Rate × Time.
16. In closing step 4, the Drawing account is closed directly to Income Summary.

### Part III — Journalizing (Items 17–22)

Journalize the June 2026 transactions of Dela Peña Services. Use these account titles: Cash; Accounts Receivable; Supplies; Equipment; Notes Payable; Unearned Service Revenue; Dela Peña, Capital; Salaries Expense.

17. Jun 1 — The owner invested ₱250,000 cash plus equipment valued at ₱120,000.
18. Jun 4 — Purchased supplies for ₱9,000 cash.
19. Jun 8 — Received ₱48,000 cash for services to be performed in July; the business records advance collections as a liability.
20. Jun 12 — Borrowed ₱60,000 from a bank, issuing a formal written promise to pay.
21. Jun 18 — Collected ₱35,000 from a client previously billed on account.
22. Jun 30 — Paid employee salaries of ₱28,000.

### Part IV — Adjusting-Entries Mini-Case (Items 23–27)

Villanueva Services adjusts its books every December 31. Prepare the adjusting entry for each independent item, dated December 31, 2026. Show computations (use a 360-day year for interest).

23. On November 16, 2026, the business issued a 120-day, 12% Notes Payable with a face value of ₱150,000. No interest has been recorded.
24. On August 1, 2026, the business paid ₱54,000 for an 18-month insurance policy, debiting the full amount to Insurance Expense (expense method).
25. On July 1, 2026, the business collected ₱96,000 for a 12-month service contract, crediting the full amount to Service Revenue (revenue method).
26. The Equipment account shows a balance of ₱480,000, of which ₱120,000 was purchased on October 1, 2026. The business applies 20% straight-line depreciation per annum with zero residual value.
27. Daily payroll is ₱7,500 for a 5-day work week paid every Friday. This year, December 31 falls on a Thursday.

### Part V — Closing and Capital (Items 28–30)

The adjusted balances of Villanueva Services at December 31, 2026: Service Revenue ₱1,240,000; Interest Income ₱10,000; Salaries Expense ₱690,000; Rent Expense ₱120,000; Insurance Expense ₱15,000; Depreciation Expense ₱78,000; Interest Expense ₱2,250; Villanueva, Drawing ₱80,000; Villanueva, Capital (beginning) ₱905,000.

28. Prepare the closing entry for the revenue accounts.
29. Compute net income for the year.
30. Compute the ending balance of Villanueva, Capital.
$md$, 9),

-- ------------------------------------------------------------
-- Sort 10 — Final Mock Exams — Answer Key with Explanations
-- ------------------------------------------------------------
('a2000002-0001-0001-0002-0000000000e1','activity','Final Mock Exams — Answer Key with Explanations',$md$
### Final Mock Exam A — Answers

**Part I — Multiple Choice**

| No. | Answer | Why — and why the tempting choice is wrong |
|---|---|---|
| 1 | b | The recording phase runs analyze → journalize → post. The trial balance (a) comes only after posting. |
| 2 | b | It checks that total debits equal total credits after posting — nothing more. It does not prove net income. |
| 3 | b | Accumulated Depreciation reduces a linked long-term asset while preserving its historical cost. |
| 4 | c | It is cash collected before performance — an obligation, due within twelve months. The word "revenue" in the title is the trap. |
| 5 | c | Patents, copyrights, trademarks, and goodwill lack physical form. Machinery and land are tangible PPE. |
| 6 | c | Every adjustment touches at least one income statement line and one balance sheet line. |
| 7 | d | Land is never depreciated. |
| 8 | b | Income Summary is a temporary clearing account used solely in the closing sequence. |
| 9 | c | Depreciation causes no future cash transaction, so it is never reversed. Accrued salaries (a) *are* reversed. |
| 10 | b | Closing has emptied all temporary accounts, leaving only assets, liabilities, and capital. |

**Part II — True or False**

| No. | Answer | Explanation |
|---|---|---|
| 11 | False | Mortgage Payable is a long-term bank debt secured by real estate — non-current. |
| 12 | True | The expense method extracts the *unconsumed* portion into an asset at period-end. |
| 13 | False | Closing resets *temporary* accounts; permanent accounts carry forward. |
| 14 | True | With a net loss, Income Summary holds a debit balance, so Capital is debited and Income Summary credited. |
| 15 | False | Reversing entries are made on the *first day of the new* period. |
| 16 | True | That is the definition of Notes Receivable. |

**Part III — Journal Entries (Cruz Consulting)**

| Item | Date | Account Titles | Debit (₱) | Credit (₱) |
|---|---|---|---:|---:|
| 17 | Dec 1 | Cash | 400,000 | |
| | | Cruz, Capital | | 400,000 |
| 18 | Dec 3 | Equipment | 150,000 | |
| | | Cash | | 50,000 |
| | | Accounts Payable | | 100,000 |
| 19 | Dec 10 | Cash | 70,000 | |
| | | Service Revenue | | 70,000 |
| 20 | Dec 15 | Accounts Receivable | 95,000 | |
| | | Service Revenue | | 95,000 |
| 21 | Dec 20 | Accounts Payable | 40,000 | |
| | | Cash | | 40,000 |
| 22 | Dec 28 | Cruz, Drawing | 15,000 | |
| | | Cash | | 15,000 |

Item 18 is the discriminator: one compound entry with two credits totaling the ₱150,000 debit. Splitting it into two entries that each debit Equipment double-counts the asset.

**Part IV — Adjusting Entries (Ramos Services, Dec 31, 2026)**

23. Daily payroll = 30,000 ÷ 5 = ₱6,000. Days worked but unpaid (Monday–Tuesday) = 2. Accrual = 6,000 × 2 = **₱12,000**.

| Account Titles | Debit (₱) | Credit (₱) |
|---|---:|---:|
| Salaries Expense | 12,000 | |
| Salaries Payable | | 12,000 |

24. Monthly cost = 24,000 ÷ 12 = ₱2,000. Months expired (Sep–Dec) = 4. Expense = 2,000 × 4 = **₱8,000**. Asset method: transfer the *used* portion out of the asset.

| Account Titles | Debit (₱) | Credit (₱) |
|---|---:|---:|
| Insurance Expense | 8,000 | |
| Prepaid Insurance | | 8,000 |

25. Monthly rent = 36,000 ÷ 12 = ₱3,000. Months earned (Oct–Dec) = 3. Earned = 3,000 × 3 = **₱9,000**. Liability method: transfer the *earned* portion out of the liability.

| Account Titles | Debit (₱) | Credit (₱) |
|---|---:|---:|
| Unearned Rent | 9,000 | |
| Rent Income | | 9,000 |

26. Straight-line: (200,000 − 20,000) ÷ 5 = **₱36,000** per year. Do not forget to subtract the ₱20,000 residual value — 200,000 ÷ 5 = 40,000 is the planted wrong answer.

| Account Titles | Debit (₱) | Credit (₱) |
|---|---:|---:|
| Depreciation Expense | 36,000 | |
| Accumulated Depreciation — Equipment | | 36,000 |

27. Accrued revenue — performed but unbilled:

| Account Titles | Debit (₱) | Credit (₱) |
|---|---:|---:|
| Accounts Receivable | 18,000 | |
| Service Revenue | | 18,000 |

**Part V — Closing and Capital**

28. Total expenses = 410,000 + 96,000 + 36,000 = 542,000. Net income = 860,000 − 542,000 = **₱318,000**.
29. Income Summary holds a net credit of 318,000 (net income), so:

| Account Titles | Debit (₱) | Credit (₱) |
|---|---:|---:|
| Income Summary | 318,000 | |
| Ramos, Capital | | 318,000 |

30. Ending capital = 600,000 + 318,000 − 50,000 = **₱868,000**.

---

### Final Mock Exam B — Answers

**Part I — Multiple Choice**

| No. | Answer | Why — and why the tempting choice is wrong |
|---|---|---|
| 1 | c | Reversing entries are step 11, journalized at the start of the new period. The post-closing trial balance (a) is step 10. |
| 2 | b | Source-document analysis is step 1 of the recording phase. |
| 3 | c | Goodwill is a non-physical value — an intangible asset. |
| 4 | b | Accrued expenses like Salaries Payable are unpaid obligations due within twelve months. |
| 5 | b | The expense method parks the entire advance payment in the expense account; the asset method (a) parks it in Prepaid Rent. |
| 6 | b | Accrued revenue: service performed, not yet billed — debit a receivable, credit revenue. |
| 7 | c | Closing entries zero out revenues, expenses, and drawings. Adjusting entries (a) update balances but do not clear them. |
| 8 | b | The worksheet is step 6 — after the trial balance (step 4) and adjustment data (step 5). |
| 9 | c | Accrued salaries created a brand-new liability, so they are reversed. Depreciation (a) and bad-debts adjustments (b) never are; asset-method prepayments (d) are not reversed either — only *expense-method* prepayments are. |
| 10 | b | Expenses exceeded revenues, leaving a net debit — a net loss. |

**Part II — True or False**

| No. | Answer | Explanation |
|---|---|---|
| 11 | True | That is the definition of posting (cycle step 3). |
| 12 | True | It is an upfront payment for future benefits, convertible within the year — current asset. |
| 13 | False | The liability method recognizes the *earned* portion (Dr Unearned Revenue / Cr Revenue). |
| 14 | False | It is a permanent contra-asset account; it is never closed. |
| 15 | True | Interest = Principal × Rate × Time. |
| 16 | False | Drawing is closed directly to Capital, never through Income Summary. |

**Part III — Journal Entries (Dela Peña Services)**

| Item | Date | Account Titles | Debit (₱) | Credit (₱) |
|---|---|---|---:|---:|
| 17 | Jun 1 | Cash | 250,000 | |
| | | Equipment | 120,000 | |
| | | Dela Peña, Capital | | 370,000 |
| 18 | Jun 4 | Supplies | 9,000 | |
| | | Cash | | 9,000 |
| 19 | Jun 8 | Cash | 48,000 | |
| | | Unearned Service Revenue | | 48,000 |
| 20 | Jun 12 | Cash | 60,000 | |
| | | Notes Payable | | 60,000 |
| 21 | Jun 18 | Cash | 35,000 | |
| | | Accounts Receivable | | 35,000 |
| 22 | Jun 30 | Salaries Expense | 28,000 | |
| | | Cash | | 28,000 |

Item 19 is the classic trap: no revenue yet — the service happens in July, so the credit is a liability. Item 21 is a receivable collection, not new revenue (the revenue was recorded when the client was billed).

**Part IV — Adjusting Entries (Villanueva Services, Dec 31, 2026)**

23. Days outstanding, Nov 16 → Dec 31 = 14 + 31 = 45 days. Interest = 150,000 × 12% × 45/360 = **₱2,250**.

| Account Titles | Debit (₱) | Credit (₱) |
|---|---:|---:|
| Interest Expense | 2,250 | |
| Interest Payable | | 2,250 |

24. Monthly cost = 54,000 ÷ 18 = ₱3,000. Months expired (Aug–Dec) = 5, so expense consumed = 15,000; unused portion = 54,000 − 15,000 = **₱39,000**. Expense method: extract the *unused* portion into the asset.

| Account Titles | Debit (₱) | Credit (₱) |
|---|---:|---:|
| Prepaid Insurance | 39,000 | |
| Insurance Expense | | 39,000 |

25. Monthly revenue = 96,000 ÷ 12 = ₱8,000. Months earned (Jul–Dec) = 6, so earned = 48,000; unearned portion = 96,000 − 48,000 = **₱48,000**. Revenue method: remove the *unearned* portion from revenue.

| Account Titles | Debit (₱) | Credit (₱) |
|---|---:|---:|
| Service Revenue | 48,000 | |
| Unearned Service Revenue | | 48,000 |

26. Split the ledger balance by acquisition date.
   - Group A (full year): 480,000 − 120,000 = 360,000; depreciation = 360,000 × 20% = 72,000.
   - Group B (Oct 1, active 3 months): 120,000 × 20% × 3/12 = 6,000.
   - Total = 72,000 + 6,000 = **₱78,000**.

| Account Titles | Debit (₱) | Credit (₱) |
|---|---:|---:|
| Depreciation Expense | 78,000 | |
| Accumulated Depreciation — Equipment | | 78,000 |

27. Days worked but unpaid (Monday–Thursday) = 4. Accrual = 7,500 × 4 = **₱30,000**.

| Account Titles | Debit (₱) | Credit (₱) |
|---|---:|---:|
| Salaries Expense | 30,000 | |
| Salaries Payable | | 30,000 |

**Part V — Closing and Capital**

28. Close both revenue accounts into Income Summary:

| Account Titles | Debit (₱) | Credit (₱) |
|---|---:|---:|
| Service Revenue | 1,240,000 | |
| Interest Income | 10,000 | |
| Income Summary | | 1,250,000 |

29. Total revenues = 1,240,000 + 10,000 = 1,250,000. Total expenses = 690,000 + 120,000 + 15,000 + 78,000 + 2,250 = 905,250. Net income = 1,250,000 − 905,250 = **₱344,750**.
30. Ending capital = 905,000 + 344,750 − 80,000 = **₱1,169,750**.
$md$, 10);
