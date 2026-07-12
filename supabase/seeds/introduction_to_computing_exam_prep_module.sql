-- ============================================================
-- Introduction to Computing — Exam Prep: Prelims & Finals
-- Subject ID: 10000000-0001-0001-0001-000000000002
-- Module ID:  a1000002-0001-0001-0001-0000000000e1
-- Purpose: dedicated exam-prep module (blueprints, mock exams,
--          answer keys, trap drills) covering only material taught
--          in Units I-VIII of introduction_to_computing_modules_sections.sql
-- Idempotent: deletes only this module (sections cascade), then re-inserts.
-- Run after introduction_to_computing_modules_sections.sql
-- ============================================================

DELETE FROM modules WHERE id = 'a1000002-0001-0001-0001-0000000000e1';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('a1000002-0001-0001-0001-0000000000e1','10000000-0001-0001-0001-000000000002','Exam Prep: Prelims & Finals','exam-prep-prelims-finals',9);

-- ============================================================
-- FREE SECTIONS (kind = 'content')
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a1000002-0001-0001-0001-0000000000e1','content','Prelim Exam Blueprint & Study Plan',$md$
Your prelim exam for Introduction to Computing almost always draws from the first three units of this subject:

- **Unit I: Overview of Information and Communications Technology** — definitions, elements of a computer system, classifications, capabilities and limitations, history and generations.
- **Unit II: Data Representation** — number systems, conversions, arithmetic, complements, BCD/UDF/PDF, signed numbers, IEEE floating point, ASCII/EBCDIC, parity.
- **Unit III: Hardware** — components of the system unit, memory types, secondary storage, Boolean algebra, logic gates, De Morgan's theorems.

### Typical Question-Type Breakdown

| Question Type | Usual Share | Where It Comes From |
|---|---|---|
| Multiple choice | 30-40% | All three units — definitions, classifications, "which of the following" |
| Number-system conversions and arithmetic | 25-30% | Unit II — this is where prelims are won or lost |
| Identification / fill-in-the-blank | 15-20% | Inventors, generations, CPU parts, gate names |
| True or false | 10-15% | Capability/limitation statements, memory facts, complement rules |
| Short essay | 0-10% | "Trace the generations", "differentiate data and information" |

### The Exact Memorize List

If you memorize nothing else, memorize these cold:

1. **Number systems** — binary (base 2: 0,1), octal (base 8: 0-7), decimal (base 10), hexadecimal (base 16: 0-9, A=10 up to F=15).
2. **Powers of 2** up to 1024, and the conversion directions: decimal to base-N = divide and read remainders bottom-up; base-N to decimal = multiply by place values.
3. **Grouping rules** — binary to octal in groups of 3, binary to hex in groups of 4, always starting from the right.
4. **Complement rules** — 1's complement: flip every bit; 2's complement: flip and add 1. Carry out = positive (add it back for 1's, discard for 2's); no carry = negative (recomplement).
5. **ASCII anchors** — A=65, a=97, 0=48, space=32. The character 8 is code 56, not the number 8.
6. **Generations table** — vacuum tubes (1946-1959, milliseconds), transistors (1959-1965, microseconds), integrated circuits (1965-1971, nanoseconds), microprocessors (1971-1980), ULSI + AI (1980-present).
7. **Inventor matches** — Babbage (Difference Engine), Hollerith (punch card machine), Napier (Napier's Bones), Oughtred (slide rule), Bush (Differential Analyzer), Eckert and Mauchly (ENIAC), von Neumann (EDVAC, stored program), Noyce and Kilby (integrated circuit).
8. **Classification bases** — by size (super, mainframe, mini, micro), by functionality (server, workstation, information appliance, embedded), by data handling (analog, digital, hybrid), by purpose (general, special).
9. **CPU internals** — control unit (traffic controller), ALU (arithmetic and logic), registers (tiny high-speed storage), system clock (pace-setter). Memory types: RAM (volatile, in-use data), cache (fast holding area), ROM (boot instructions, non-volatile), CMOS (configuration data).
10. **Storage access** — magnetic tape is serial access; magnetic disk is direct access; optical discs use lasers; SSDs have no moving parts.
11. **Gate behavior** — AND: all 1s in, 1 out. OR: any 1 in, 1 out. NAND: 0 only when all inputs are 1. NOR: 1 only when all inputs are 0. XOR: 1 when inputs differ. NAND and NOR are the universal gates.
12. **Boolean essentials** — A + A' = 1, A • A' = 0, and both De Morgan theorems: (X + Y)' = X'Y' and (XY)' = X' + Y'.
13. **Speed measures** — everyday computers in MIPS, supercomputers in FLOPS.

### Top Mistakes That Sink Prelim Scores

1. **Reading remainders top-down** in decimal-to-binary conversion. Always read bottom-up (last remainder is the most significant bit).
2. **Grouping binary from the left** when converting to octal or hex. Group from the right, pad the left.
3. **Converting a whole number to binary when BCD is asked.** BCD encodes each decimal digit separately in 4 bits — this mix-up is a classic zero-credit answer.
4. **Mixing up the carry rules** — adding the carry back in 2's complement (you discard it) or discarding it in 1's complement (you add it back).
5. **Saying information is raw and data is processed.** It is the reverse: data = raw facts, information = processed, meaningful data.
6. **Confusing RAM and ROM** — RAM forgets (volatile, working data), ROM remembers (non-volatile, boot instructions).
7. **Answering classification questions without stating the basis.** Say the basis first ("By size, ..."), then the type — answers without the basis earn partial credit only.

### Realistic 7-Day Study Plan

| Day | Focus | What To Do |
|---|---|---|
| 1 | Unit I — Overview of ICT | Definitions (data vs. information), elements (hardware/software/peopleware), all four classification bases, capabilities and limitations. Recite the classification bases out loud. |
| 2 | Unit I — History | Early devices table (device + inventor pairs) and the five generations (component + years + speed unit). Write the generations table from memory twice. |
| 3 | Unit II — Number systems and conversions | Do every conversion direction by hand: binary/octal/decimal/hex, both ways, including one fractional conversion. |
| 4 | Unit II — Arithmetic and complements | Binary, octal, and hex addition with carries; subtraction by direct method, 1's complement, and 2's complement. Drill the carry rules until automatic. |
| 5 | Unit II — Data representation | BCD, unpacked and packed decimal, sign-magnitude, the IEEE single-precision layout (1-8-23, bias 127), ASCII anchors, even and odd parity. |
| 6 | Unit III — Hardware and digital logic | CPU parts, memory types, secondary storage. Then gates, truth tables, Boolean identities, De Morgan. Build one truth table from scratch. |
| 7 | Mock exams | Take Prelim Mock Exam A timed. Check with the answer key, re-drill every miss, then take Mock B the same evening or the next morning. |
$md$, 1),

('a1000002-0001-0001-0001-0000000000e1','content','Free Practice Set — 15 Items with Answer Key',$md$
Treat this like the real thing: cover the answer key, time yourself (20 minutes), and write conversion solutions out by hand.

### Items

1. **(MCQ)** Which generation of computers introduced transistors as the core electronic component?
   a) First   b) Second   c) Third   d) Fourth
2. **(True/False)** Data is processed information that has been organized into something meaningful.
3. **(Identification)** Who designed the Difference Engine, intended to calculate and print mathematical tables?
4. **(MCQ)** The speed of supercomputers is measured in:
   a) MIPS   b) FLOPS   c) nanoseconds   d) gigabytes
5. **(Conversion)** Convert 1101 in binary to decimal.
6. **(Conversion)** Convert 52 in decimal to binary. Show the division steps.
7. **(Conversion)** Convert 2E in hexadecimal to decimal.
8. **(Conversion)** Convert 117 in octal to binary using the grouping method.
9. **(MCQ)** Which memory loses its contents when power is removed?
   a) ROM   b) CMOS   c) RAM   d) SSD
10. **(Identification)** Which CPU component performs all arithmetic calculations and logical comparisons?
11. **(MCQ)** Which logic gate outputs 1 only when ALL of its inputs are 1?
    a) OR   b) XOR   c) NOR   d) AND
12. **(True/False)** NAND and NOR are universal gates — any other gate can be built from either one alone.
13. **(MCQ)** The decimal ASCII code for the uppercase letter A is:
    a) 41   b) 65   c) 97   d) 48
14. **(Conversion)** Find the 2's complement of 0110.
15. **(MCQ)** MICR readers are input devices used primarily for processing:
    a) barcodes   b) exam answer sheets   c) bank checks   d) photographs

### Answer Key

1. **b) Second** — transistors defined the second generation (1959-1965); the first used vacuum tubes.
2. **False** — it is the reverse: data is raw facts; information is data that has been processed into something meaningful.
3. **Charles Babbage** — the Difference Engine; do not confuse him with Hollerith (punch cards).
4. **b) FLOPS** — Floating Point Operations Per Second; MIPS is used for everyday computers.
5. **13** — 1x8 + 1x4 + 0x2 + 1x1 = 8 + 4 + 0 + 1 = 13.
6. **110100** — 52/2=26 r0, 26/2=13 r0, 13/2=6 r1, 6/2=3 r0, 3/2=1 r1, 1/2=0 r1; read remainders bottom-up: 110100 (check: 32+16+4 = 52).
7. **46** — 2x16 + E(14)x1 = 32 + 14 = 46.
8. **1001111** — each octal digit becomes 3 bits: 1=001, 1=001, 7=111, giving 001 001 111 = 1001111 (check: both equal 79 in decimal).
9. **c) RAM** — RAM is volatile; ROM and CMOS retain their contents, and SSDs are permanent secondary storage.
10. **The ALU (Arithmetic and Logic Unit)** — the control unit only directs traffic; it does not compute.
11. **d) AND** — OR fires on at least one 1, XOR fires when inputs differ, NOR fires only when all inputs are 0.
12. **True** — that is exactly what makes them universal; manufacturers exploit this to simplify fabrication.
13. **b) 65** — uppercase A-Z run from 65 to 90; 97 is lowercase a, 48 is the digit 0.
14. **1010** — flip every bit of 0110 to get 1001 (the 1's complement), then add 1: 1010.
15. **c) bank checks** — MICR stands for Magnetic Ink Character Recognition.

Scored 12 or better? You are on track — the two full 30-item prelim mocks, two final mocks, complete worked answer keys, and the trap drills below come with the subject unlock.
$md$, 2);

-- ============================================================
-- LOCKED SECTIONS (kind = 'activity')
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a1000002-0001-0001-0001-0000000000e1','activity','Prelim Mock Exam A — 30 Items',$md$
**Coverage:** Units I-III. **Suggested time:** 60 minutes. Answer everything before opening the answer key. For Part III, write full solutions — real exams grade the working, not just the final answer.

### Part I — Multiple Choice (10 items)

1. The ability of a computer to repeat the same operation indefinitely without fatigue or decline in quality is called:
   a) speed   b) accuracy   c) reliability   d) versatility
2. Which classification of computer has its speed measured in FLOPS rather than MIPS?
   a) mainframe   b) supercomputer   c) minicomputer   d) workstation
3. Large, high-throughput systems sometimes called "big iron," used for bulk data processing such as census computations, are:
   a) supercomputers   b) minicomputers   c) mainframe computers   d) embedded computers
4. Operating systems, time-sharing, and multiprogramming first emerged during which computer generation?
   a) first   b) second   c) third   d) fourth
5. The integrated circuit was invented in 1958-1959 by:
   a) Eckert and Mauchly   b) Robert Noyce and Jack Kilby   c) Babbage and Lovelace   d) Boole and Shannon
6. Which set correctly lists the digits used by the hexadecimal system?
   a) 0-9 only   b) 0-7 only   c) 0-9 and A-F   d) 1-16
7. Which memory stores configuration information such as RAM capacity, date/time, and drive types, read every time the computer powers on?
   a) cache   b) ROM   c) RAM   d) CMOS
8. Which secondary storage medium is serial access, meaning data can only be read in order?
   a) magnetic tape   b) magnetic disk   c) SSD   d) optical disc
9. Which logic gate outputs 1 only when ALL of its inputs are 0?
   a) NAND   b) NOR   c) XOR   d) AND
10. Registers are best described as:
    a) permanent storage on the motherboard   b) tiny high-speed storage locations inside the processor   c) a type of secondary storage   d) the pulses generated by the system clock

### Part II — True or False (8 items)

11. An analog clock, whose hands move continuously, is an example of an analog computing device.
12. Errors in computer output almost always trace back to errors in the input data or the program itself.
13. First-generation computers used transistors as their core electronic component.
14. In 2's complement subtraction, if a carry results, you add it back to the result.
15. ROM is volatile — its contents are lost when power is removed.
16. The system clock generates regular electronic pulses that set the operating pace for the components in the system unit.
17. An XOR gate outputs 1 when its inputs are the same.
18. A parity bit can both detect and correct a single-bit transmission error.

### Part III — Conversions and Computation (6 items, show all working)

19. Convert 10111 in binary to decimal.
20. Convert 156 in decimal to binary.
21. Convert 3D in hexadecimal to decimal.
22. Convert 245 in octal to decimal.
23. Convert 110101101 in binary to hexadecimal using the grouping method.
24. Compute 1010 minus 0111 in binary using the 2's complement method.

### Part IV — Identification (6 items)

25. The 1896 device by Herman Hollerith that read information punched into cards automatically.
26. The two people who built ENIAC, the first large-scale vacuum tube computer.
27. The CPU component that acts like a traffic controller, directing the flow of data and instructions.
28. The decimal coding scheme in which each decimal digit is encoded separately using exactly 4 bits.
29. Complete the Boolean complement law: A + A' = ___.
30. The input device that reads magnetic ink characters, used for processing bank checks.
$md$, 3),

('a1000002-0001-0001-0001-0000000000e1','activity','Prelim Mock Exam B — 30 Items',$md$
**Coverage:** Units I-III, all-new items, a notch harder than Mock A. **Suggested time:** 60 minutes. Same rules: no answer key until you finish, full solutions in Part III.

### Part I — Multiple Choice (10 items)

1. Which of the following is NOT one of the three essential elements of a computer system?
   a) hardware   b) software   c) peopleware   d) firmware
2. A hospital ECG machine reads continuous electrical signals from the heart and digitizes them for analysis. It is best classified as:
   a) an analog computer   b) a digital computer   c) a hybrid computer   d) an embedded computer
3. Minicomputers of the mid-1960s were designed primarily for:
   a) large-scale batch processing   b) control systems, instrumentation, and human-machine interaction   c) weather forecasting   d) personal home use
4. The key concept EDVAC introduced under John von Neumann was:
   a) the punch card   b) the stored-program concept   c) the vacuum tube   d) time-sharing
5. Fifth-generation computers are built on which chip technology?
   a) VLSI   b) ULSI   c) transistor arrays   d) magnetic drums
6. In IEEE single-precision floating point, the stored exponent is biased by:
   a) 64   b) 100   c) 127   d) 255
7. EBCDIC is best described as:
   a) a 7-bit code for microcomputers   b) an 8-bit code developed by IBM for the System/360   c) a parity scheme   d) a compression format
8. The small, very fast holding area for data the CPU uses frequently is:
   a) ROM   b) CMOS   c) cache memory   d) magnetic disk
9. By De Morgan's second theorem, (XY)' equals:
   a) X'Y'   b) X' + Y'   c) XY   d) (X + Y)
10. The main advantage of a solid state drive over a magnetic disk is that it:
    a) uses laser beams   b) is serial access   c) has no moving parts, making it faster and more durable   d) is volatile

### Part II — True or False (8 items)

11. Embedded computers run instructions stored in non-volatile memory and rarely require rebooting.
12. Workstations are high-performance machines designed for many users at the same time.
13. In unpacked decimal format, each decimal digit occupies one full byte.
14. In unpacked decimal format, zone bits 1101 in the last digit indicate a positive number.
15. Claude Shannon showed in 1938 that Boolean algebra could be applied to electronic switching circuits.
16. Boolean algebra includes subtraction and division operations.
17. Under even parity, if the data bits contain an odd number of 1s, the parity bit is set to 1.
18. The implied "hidden bit" gives IEEE single precision 24 bits of precision from only 23 stored mantissa bits.

### Part III — Conversions and Computation (6 items, show all working)

19. Convert 11011.101 in binary to decimal (handle the fractional part with negative powers of 2).
20. Convert 500 in decimal to hexadecimal.
21. Convert 736 in octal to hexadecimal (go through binary).
22. Add in binary: 1101 + 1011.
23. Add in hexadecimal: 2A7 + 15B.
24. Compute 1000 minus 1110 in binary using the 1's complement method. State the sign of the result.

### Part IV — Identification (6 items)

25. The 1930 analog machine by Vannevar Bush built for calculating artillery trajectories.
26. In packed decimal format, the sign code is stored in which 4 bits of the number?
27. The universal gate formed by an AND operation followed by a NOT.
28. Simplify the Boolean expression F = AB + AB'.
29. The 8-bit signed representation in which the leftmost bit is the sign and the remaining 7 bits are the value, with the known flaw that zero has two representations.
30. The decimal ASCII code for the lowercase letter a.
$md$, 4),

('a1000002-0001-0001-0001-0000000000e1','activity','Prelim Mock Exams — Answer Key with Explanations',$md$
Check every item, not just your misses — the explanations tell you why the tempting wrong choices are wrong, which is exactly what the real exam tests.

### Mock Exam A — Answers

**Part I — Multiple Choice**

1. **c) reliability** — speed is about how fast, accuracy is about correctness of a single operation; reliability is about repeating without decline.
2. **b) supercomputer** — FLOPS measures floating-point performance; everyday machines including mainframes are compared in MIPS.
3. **c) mainframe computers** — "big iron" is the mainframe nickname; supercomputers are the tempting wrong pick, but they are performance machines, not bulk-transaction machines.
4. **c) third** — integrated circuits enabled operating systems, time-sharing, and multiprogramming; the fourth generation is when GUIs arrived, a classic distractor.
5. **b) Robert Noyce and Jack Kilby** — Eckert and Mauchly built ENIAC, one generation earlier.
6. **c) 0-9 and A-F** — sixteen symbols total, where A=10 through F=15.
7. **d) CMOS** — ROM holds the startup instructions themselves; CMOS holds the configuration data those instructions check against.
8. **a) magnetic tape** — tape must be read in order; magnetic disk is the direct-access counterpart.
9. **b) NOR** — NOR is the inverse of OR: any 1 input forces a 0 out. NAND (choice a) outputs 0 only when all inputs are 1 — the mirror-image trap.
10. **b) tiny high-speed storage locations inside the processor** — registers hold data and instructions currently being processed.

**Part II — True or False**

11. **True** — the hands move continuously, representing time through physical position.
12. **True** — garbage in, garbage out; the machine itself computes with near-perfect precision.
13. **False** — first generation used vacuum tubes; transistors are second generation.
14. **False** — in 2's complement you discard the carry; adding it back (end-around carry) is the 1's complement rule. Swapping these two rules is the single most common complement error.
15. **False** — ROM is non-volatile; RAM is the volatile one.
16. **True** — the clock's pulses set the pace for all components in the system unit.
17. **False** — XOR outputs 1 when inputs differ; XNOR outputs 1 when they are the same.
18. **False** — parity detects single-bit errors but cannot correct them, and it misses even numbers of flipped bits.

**Part III — Conversions (full working)**

19. **23** — 1x16 + 0x8 + 1x4 + 1x2 + 1x1 = 16 + 4 + 2 + 1 = 23.
20. **10011100** — 156/2=78 r0; 78/2=39 r0; 39/2=19 r1; 19/2=9 r1; 9/2=4 r1; 4/2=2 r0; 2/2=1 r0; 1/2=0 r1. Read bottom-up: 10011100. Check: 128+16+8+4 = 156.
21. **61** — 3x16 + D(13)x1 = 48 + 13 = 61.
22. **165** — 2x64 + 4x8 + 5x1 = 128 + 32 + 5 = 165.
23. **1AD** — group in 4s from the right, padding the left: 0001 1010 1101 = 1, A, D. Check: 110101101 in binary is 429, and 1AD is 256 + 160 + 13 = 429. If you got 6B or similar, you grouped from the left — the classic mistake.
24. **0011** — 2's complement of 0111: flip to 1000, add 1 to get 1001. Then 1010 + 1001 = 10011. A carry occurred, so discard it: **0011**. Check in decimal: 10 - 7 = 3.

**Part IV — Identification**

25. **Punch card machine** — Hollerith, 1896.
26. **Eckert and Mauchly** — ENIAC, 1943-1946.
27. **Control unit** — it directs traffic; the ALU does the actual computing.
28. **BCD (Binary Coded Decimal)** — 4 bits per decimal digit, each digit encoded separately.
29. **1** — the complement law for OR: a value ORed with its complement always yields true.
30. **MICR (Magnetic Ink Character Recognition) reader**.

### Mock Exam B — Answers

**Part I — Multiple Choice**

1. **d) firmware** — the three essential elements are hardware, software, and peopleware. Firmware (like the BIOS) is software stored on hardware, not a third pillar of the system model.
2. **c) a hybrid computer** — it accepts analog input signals and converts them to digital form for processing, the textbook definition of hybrid.
3. **b) control systems, instrumentation, and human-machine interaction** — bulk batch processing (choice a) is the mainframe's job, the intended trap.
4. **b) the stored-program concept** — EDVAC was the refined successor to ENIAC built on this idea.
5. **b) ULSI** — Ultra Large Scale Integration, with chips containing tens of millions of components.
6. **c) 127** — true exponent = stored exponent minus 127.
7. **b) an 8-bit code developed by IBM for the System/360** — it uses a zone-and-digit structure; ASCII is the 7-bit code (choice a describes ASCII's width).
8. **c) cache memory** — it sits between the CPU and regular RAM to cut fetch time.
9. **b) X' + Y'** — break the bar, flip the operator: a NAND is a bubbled OR. Choice a is Theorem 1's right-hand side, the mirror trap.
10. **c) has no moving parts, making it faster and more durable** — lasers (choice a) belong to optical discs.

**Part II — True or False**

11. **True** — that is what makes them suitable to be built into other machines.
12. **False** — workstations are designed for use by one person at a time (they run multi-user operating systems, but the design point is a single professional user — read carefully).
13. **True** — one byte per digit: 4 zone bits plus 4 digit bits.
14. **False** — 1101 is the negative sign code; 1100 means positive or zero.
15. **True** — Shannon's 1938 work made Boolean algebra the foundation of digital circuit design.
16. **False** — Boolean algebra has complement (NOT), AND, and OR; there is no subtraction or division.
17. **True** — the parity bit tops up the count of 1s to an even total.
18. **True** — the leading 1 in normalized form is implied, so it never needs to be stored.

**Part III — Conversions (full working)**

19. **27.625** — integer part: 16 + 8 + 0 + 2 + 1 = 27. Fraction part: 1x0.5 + 0x0.25 + 1x0.125 = 0.625. Total 27.625.
20. **1F4** — 500/16 = 31 r4; 31/16 = 1 r15 = F; 1/16 = 0 r1. Read bottom-up: 1F4. Check: 256 + 15x16 + 4 = 256 + 240 + 4 = 500.
21. **1DE** — octal to binary, 3 bits per digit: 7=111, 3=011, 6=110 gives 111011110. Regroup in 4s from the right: 0001 1101 1110 = 1DE. Check: both equal 478 in decimal.
22. **11000** — rightmost column: 1+1=10, write 0 carry 1; 0+1+1=10, write 0 carry 1; 1+0+1=10, write 0 carry 1; 1+1+1=11, write 1 carry 1. Result 11000. Check: 13 + 11 = 24.
23. **402** — 7+B: 7+11=18, which is 16+2, write 2 carry 1. A+5+1: 10+5+1=16, write 0 carry 1. 2+1+1=4. Result 402. Check: 679 + 347 = 1026 = 402 in hex.
24. **-0110 (negative six)** — 1's complement of 1110 is 0001. Add: 1000 + 0001 = 1001. NO carry occurred, so the answer is negative: take the 1's complement of 1001 to get 0110 and attach the minus sign. Check: 8 - 14 = -6. The no-carry-means-negative rule is the entire point of this item.

**Part IV — Identification**

25. **Differential Analyzer** — Bush, 1930; do not confuse with Babbage's Difference Engine, a mechanical calculating design from a century earlier.
26. **The least significant 4 bits** of the entire number hold the sign code.
27. **NAND** — AND followed by NOT; universal because any other gate can be built from NANDs alone.
28. **F = A** — factor: A(B + B') = A(1) = A. Show the B + B' = 1 step; that is where the mark is.
29. **Absolute value representation** — the double-zero flaw (00000000 and 10000000) is its known limitation.
30. **97** — lowercase a-z run 97-122; 65 is uppercase A.

### Scoring Guide

- **27-30:** Exam-ready. Do the traps section below once and rest properly the night before.
- **22-26:** Solid. Re-drill only your missed topics, then retake the mock you scored lower on.
- **Below 22:** Go back to the unit lessons for the parts you missed (usually Unit II conversions), then repeat both mocks in two days.
$md$, 5),

('a1000002-0001-0001-0001-0000000000e1','activity','Common Prelim Traps & How to Avoid Them',$md$
These are the confusions that professors deliberately bait — every one of them is drawn straight from Units I-V material. Each trap comes with a mini-drill; do the drill before reading its answer.

### Trap 1 — Bits vs. bytes in decimal representation

BCD uses **4 bits per decimal digit**. Unpacked decimal (UDF) uses **one full byte (8 bits) per digit**. Packed decimal squeezes **two digits into one byte**, with the sign in the last 4 bits. Exams love asking "how many bits" to catch students who answer in the wrong unit.

**Mini-drill:** How many bits are needed to represent 946 in BCD? In unpacked decimal format?

**Answer:** BCD: 3 digits x 4 bits = **12 bits**. UDF: 3 digits x 1 byte = 3 bytes = **24 bits**.

### Trap 2 — RAM vs. ROM vs. secondary storage

Three different jobs: **RAM** holds data currently being processed and is volatile. **ROM** holds the basic startup instructions and is non-volatile. **Secondary storage** (disk, SSD, tape) holds data permanently and is never read directly by the CPU. Mnemonic: RAM forgets, ROM remembers, storage keeps.

**Mini-drill:** The operating system itself — where does it live when the computer is off, and where must it be before it can run?

**Answer:** It lives in **secondary storage** when off, and is loaded into **RAM (main memory)** to run; the startup instructions that load it come from **ROM**.

### Trap 3 — System software vs. application software

System software controls and maintains the computer itself (operating systems, utility programs like antivirus and disk scanners). Application software helps the user accomplish a specific task (word processing, payroll). The bait: utilities feel like "apps" but they are system software.

**Mini-drill:** Classify each: Avast antivirus, payroll system, Ubuntu, Microsoft Word.

**Answer:** Avast antivirus — **system** (utility program). Payroll system — **application**. Ubuntu — **system** (operating system). Microsoft Word — **application**.

### Trap 4 — ASCII vs. EBCDIC, and character vs. number

ASCII is the **7-bit** standard code (extended to 8); EBCDIC is the **8-bit IBM** code with a zone-and-digit structure. Separately: the character 8 is ASCII code 56 — it is not the integer 8, and uppercase and lowercase letters have different codes.

**Mini-drill:** What is the decimal ASCII code for the character 5?

**Answer:** **53** — digits 0-9 run from 48 to 57, so 48 + 5 = 53. Answering "5" is the trap.

### Trap 5 — MIPS vs. FLOPS

MIPS (Million Instructions Per Second) measures and compares everyday computers. FLOPS (Floating Point Operations Per Second) measures supercomputers. Attaching FLOPS to a mainframe is the standard wrong choice.

**Mini-drill:** True or false — mainframe performance is expressed in FLOPS.

**Answer:** **False** — mainframes, like other everyday machines, are compared in MIPS; FLOPS is the supercomputer measure.

### Trap 6 — The complement carry rules

**1's complement:** carry out means positive — remove the carry and **add 1** to the result (end-around carry). **2's complement:** carry out means positive — simply **discard** the carry. In both methods, **no carry means the answer is negative** and you must recomplement. Students constantly swap the add-back and discard rules.

**Mini-drill:** Compute 1100 minus 0101 using BOTH methods and confirm they agree.

**Answer:** (12 - 5 = 7.) **1's complement:** complement of 0101 is 1010; 1100 + 1010 = 10110; carry occurred, so 0110 + 1 = **0111**. **2's complement:** complement of 0101 is 1011; 1100 + 1011 = 10111; discard the carry: **0111**. Both give 7.

### Trap 7 — NAND and NOR outputs

NAND outputs **0 only when all inputs are 1** (inverse of AND). NOR outputs **1 only when all inputs are 0** (inverse of OR). Exams flip the wording — "outputs 1 only when all inputs are 1" describes AND, not NAND.

**Mini-drill:** What is NOR(1, 0)?

**Answer:** **0** — OR(1,0) = 1, and NOR inverts it. NOR gives 1 for exactly one input row: (0,0).

### Trap 8 — Grouping direction in binary-octal-hex shortcuts

Binary to octal: groups of **3**. Binary to hex: groups of **4**. Always group **starting from the right**, padding zeros on the left. Grouping from the left silently produces a wrong answer that looks plausible.

**Mini-drill:** Convert 1101011 in binary to octal.

**Answer:** Pad and group from the right: 001 101 011 = **153** in octal. Check: 1101011 is 107 in decimal, and 153 in octal is 64 + 40 + 3 = 107. Grouping from the left (110 101 1..) gives garbage.

### Trap 9 — Data vs. information

**Data** = raw, unorganized facts with no context. **Information** = data that has been processed into something useful and meaningful. This near-guaranteed item is often worded in reverse to catch skim-readers.

**Mini-drill:** A stack of filled-out enrollment forms vs. a report saying "1,240 students enrolled this semester, up 8%." Which is which?

**Answer:** The forms are **data**; the report is **information** — processed, organized, and meaningful.
$md$, 6),

('a1000002-0001-0001-0001-0000000000e1','activity','Final Exam Blueprint & Rapid Review Sheet',$md$
The final exam is **cumulative across Units I-VIII**, but weighted toward the units after the prelim:

- **Unit IV: Peopleware** — ICT careers and the code of ethics.
- **Unit V: Software** — system vs. application software, OS functions, distribution types, programming languages, compiler vs. interpreter.
- **Unit VI: Network, Internet, and Internet Protocols** — network types, models, topologies, Internet and Web history, protocols.
- **Unit VII: Trends and Issues in ICT** — cloud, IoT, mobile, HCI, analytics, AI, security, privacy, and the two Philippine laws.
- **Unit VIII: Special Interest Topics** — AI/ML/deep learning, data science and big data, social networking and society.

### Typical Weighting

| Scope | Usual Share |
|---|---|
| Units IV-VIII (new material) | 70-85% |
| Units I-III (prelim carry-over: definitions, one or two conversions, a gate item) | 15-30% |

Do not skip the prelim carry-over: a quick pass through the prelim blueprint above protects those easy points.

### Rapid Review Sheet — Memorize These

**Unit IV — Peopleware**
- Peopleware is considered the **most important** element of a computer system.
- Role match-ups exams love: **Business Analyst** (bridges business needs and technical implementation), **Database Administrator** (secure, efficient database environment), **Systems Analyst** (understands client needs, designs and tests solutions), **Systems Administrator** (servers and multi-user environment), **Network Administrator** (network equipment and connectivity), **Project Manager** (scope, deliverables, cross-functional teams), and the web quartet: **Architect** (structure), **Designer** (visual layout/UX), **Programmer** (code), **Administrator** (maintenance and reliability).
- Ethics highlights: public good first, comply with intellectual property law, truthful claims about capabilities, protect confidential information (disclose only with consent or as required by law), never build systems that facilitate fraud, keep skills current.

**Unit V — Software**
- **Boot sequence:** power on → BIOS (firmware in ROM) runs **POST** (Power-On Self Test) → results compared with **CMOS** configuration data → BIOS loads the **OS kernel** from storage into memory → OS takes control.
- **Three user interface types:** command-line, menu-driven, GUI.
- **Program management modes:** single-user/single-tasking, single-user/multitasking, multiuser, multiprocessing.
- **OS functions list:** boot, user interface, program management, memory management, job scheduling, device configuration (drivers), file management and utilities, network control, security administration, performance monitoring.
- **Distribution types:** packaged (mass-produced, sold), custom (one organization), open source (free to use/modify/redistribute), shareware (free trial, then pay), freeware (free forever, creator keeps rights), public domain (no copyright at all).
- **Language generations:** machine language (1st, raw binary), assembly (2nd, English-like abbreviations), procedural (3rd — COBOL, C), object-oriented (Java, C++, C#).
- **Compiler vs. interpreter:** compiler translates the whole program at once (faster programs, errors reported together); interpreter translates one statement at a time (slower, but errors appear immediately).

**Unit VI — Networks and the Internet**
- **Network elements:** protocols, data/messages, communications medium, devices.
- **By geographic scope:** PAN (~10 m around a person) → LAN (building/campus) → MAN (city) → WAN (between cities/countries) → GAN (worldwide, e.g., the Internet).
- **Models:** peer-to-peer (all share equally, no dedicated server) vs. client-server (servers provide, clients request).
- **Topologies one-liners:** point-to-point (two devices); star (central hub — hub dies, network dies); bus (one shared cable — cheap, but breaks and collisions hurt); ring (closed loop — one break disrupts all); mesh (everyone to everyone — most reliable, most expensive); tree (hierarchical, root on top); hybrid (combination, inherits pros and cons).
- **Protocols:** TCP/IP (foundation of the Internet — packaging, addressing, transmission), HTTP (browser-server web pages), HTTPS (encrypted HTTP for secure transactions), FTP (file transfer), SMTP (email transmission). **Intranet** = private network using Internet technologies for an organization.
- **Key concepts:** IPv4 address = four groups of numbers 0-255 separated by dots; DNS translates domain names to IP addresses; URL = complete address of a resource; ISP provides Internet access.
- **History anchors — data communications:** Morse invents the telegraph 1832, first line 1844 ("What hath God wrought!"), Bell's telephone 1875, Marconi's radio telegraph 1899, Sputnik-1 1957, Syncom-1 (first geostationary telecom satellite) 1963.
- **History anchors — Internet:** Licklider's vision 1962, ARPANET operational 1969, TCP/IP adopted 1983, SSL and commercialization 1995. **Web:** Tim Berners-Lee invents the WWW 1989 with HTML + URI/URL + HTTP; W3C (~350 members) sets standards.

**Unit VII — Trends and Issues**
- **Cloud service forms:** IaaS (virtual hardware), PaaS (development platform), SaaS (finished applications via browser).
- **IoT:** physical objects with sensors, software, and connectivity exchanging data; falling component costs accelerated innovation.
- **HCI:** multidisciplinary field (computer science + cognitive science + human factors) making interaction natural; emerged in the 1980s.
- **Analytics:** data analytics (raw data → insights), predictive analytics (forecasts future events), social media analytics (customer behavior and sentiment).
- **Laws:** **RA 10173 = Data Privacy Act of 2012**; **RA 10175 = Cybercrime Prevention Act**. Swapping these two numbers is the single most common finals error.

**Unit VIII — Special Interest Topics**
- **Nesting:** AI ⊃ machine learning ⊃ deep learning. ML learns from data without explicit rules; deep learning uses multi-layered neural networks.
- **ML categories:** supervised (labeled examples), unsupervised (finds structure, no labels), reinforcement (rewards and penalties from an environment).
- **AI history anchors:** McCulloch and Pitts neuron model 1943, Turing Test 1950, Logic Theorist 1955, McCarthy coins "Artificial Intelligence" at the Dartmouth Conference 1956, ELIZA (first chatbot) 1966, Deep Blue beats Kasparov 1997, Watson wins Jeopardy 2011. Two "AI winters": 1974-1980 and 1987-1993.
- **Data science:** statistics + programming + domain expertise applied to big data. **Three V's of big data:** Volume, Velocity, Variety.
- **Social networking:** know a few platform one-liners (Facebook = largest network; YouTube = second most-used search engine; Reddit = communities with voting) and be ready to name positive effects (connectivity, education, community, information, advertising, charity) and negative ones (cyberbullying, privacy breaches, addiction, fraud, reputation damage, polarization).

### 5-Day Finals Plan

| Day | Focus |
|---|---|
| 1 | Units IV-V: careers, ethics, OS functions, boot sequence, software types, languages |
| 2 | Unit VI: network types, topologies, protocols, both history tables |
| 3 | Units VII-VIII: trends, the two laws, AI/ML/DL, big data, social media effects |
| 4 | Prelim carry-over: redo 10 conversions and one truth table from the prelim mocks |
| 5 | Final Mock A timed; review misses; Final Mock B the next morning |
$md$, 7),

('a1000002-0001-0001-0001-0000000000e1','activity','Final Mock Exam A — 30 Items',$md$
**Coverage:** cumulative Units I-VIII, weighted to Units IV-VIII. **Suggested time:** 60 minutes. Complete everything before opening the answer key.

### Part I — Multiple Choice (12 items)

1. Which ICT professional evaluates customer business needs and bridges the gap between business requirements and technical implementation?
   a) Database Administrator   b) Business Analyst   c) Animator   d) Web Administrator
2. Maintaining a secure and efficient database environment — managing data storage, access, and security — is the job of the:
   a) Systems Architect   b) Network Administrator   c) Database Administrator   d) Training Officer
3. During boot, the check of hardware components such as RAM, the clock, and the keyboard is called:
   a) CMOS   b) POST   c) kernel loading   d) job scheduling
4. Software provided free for use, modification, and redistribution, with no restrictions imposed on modification, is:
   a) shareware   b) freeware   c) packaged software   d) open source software
5. A translator that executes one statement at a time, reporting errors immediately as they are encountered, is:
   a) a compiler   b) an interpreter   c) an assembler   d) a device driver
6. A network covering a city or a cluster of cities, often using telecom provider infrastructure, is a:
   a) LAN   b) PAN   c) MAN   d) WAN
7. The topology in which every device has a direct connection to every other device is:
   a) star   b) bus   c) ring   d) mesh
8. The protocol that handles the transmission of email messages and attachments is:
   a) FTP   b) SMTP   c) HTTP   d) DNS
9. The cloud service form that delivers fully deployed applications accessible via a browser is:
   a) IaaS   b) PaaS   c) SaaS   d) HCI
10. The machine learning category in which the algorithm is trained on inputs paired with correct outputs is:
    a) unsupervised learning   b) reinforcement learning   c) supervised learning   d) deep learning
11. The three V's that characterize big data are:
    a) volume, velocity, variety   b) value, vision, volume   c) velocity, validity, variety   d) volume, variety, verification
12. The CPU component that performs logical comparisons such as AND, OR, and NOT is the:
    a) control unit   b) ALU   c) register   d) system clock

### Part II — True or False (8 items)

13. Peopleware is often considered the most critical element of a computer and communications system.
14. A device driver is a small program that tells the operating system how to communicate with a specific device.
15. Shareware may be used free of charge indefinitely, with no payment ever required.
16. In a star topology, if the central device fails, the entire network goes down.
17. Tim Berners-Lee invented the Internet in 1989.
18. Republic Act No. 10173 is the Cybercrime Prevention Act.
19. Deep learning uses multi-layered artificial neural networks loosely inspired by biological neurons.
20. Computers use 2's complement for negative numbers because it lets subtraction be performed entirely with addition circuits.

### Part III — Identification (10 items)

21. The first-generation programming language whose instructions are raw binary, directly executable by hardware.
22. The type of user interface that uses windows, icons, pointers, and menus.
23. The system that translates human-readable domain names into IP addresses.
24. The inventor of the telephone (1875).
25. A private network that uses the same basic technologies as the Internet but is accessible only to authorized members of an organization.
26. The cloud service form that provides virtual hardware — servers, storage, and networking.
27. The 1950 test for machine intelligence proposed by Alan Turing.
28. The first chatbot, created by Joseph Weizenbaum in 1966.
29. The ICT role that defines project scope, plans deliverables, manages resources, and leads cross-functional teams.
30. Convert 11001 in binary to decimal.
$md$, 8),

('a1000002-0001-0001-0001-0000000000e1','activity','Final Mock Exam B — 30 Items',$md$
**Coverage:** cumulative Units I-VIII, all-new items, weighted to Units IV-VIII. **Suggested time:** 60 minutes.

### Part I — Multiple Choice (12 items)

1. Creating the visual layout and user experience of websites is the job of the:
   a) Web Architect   b) Web Designer   c) Web Programmer   d) Web Administrator
2. An ICT professional refuses to reveal a client's records to an outside party without consent. Which ethics principle applies?
   a) pursuing continuing professional development   b) protecting confidential information obtained through professional work   c) promoting public understanding of IT   d) striving for the highest quality
3. Which of the following is system software?
   a) payroll system   b) Microsoft Word   c) Ubuntu   d) photo editing program
4. Which statement correctly describes a compiler?
   a) it translates and executes one statement at a time   b) it converts the entire source program into machine code at once   c) it reports each error immediately when encountered   d) compiled programs run more slowly than interpreted ones
5. Which set contains only object-oriented programming languages?
   a) COBOL and C   b) machine language and assembly   c) Java, C++, and C#   d) HTML and HTTP
6. The first telegraph message, sent in 1844 from Baltimore to Washington D.C., was:
   a) "Mr. Watson, come here"   b) "What hath God wrought!"   c) "SOS"   d) "Hello, world"
7. The hierarchical topology with a root node at the top, branching downward through multiple levels, is:
   a) mesh   b) ring   c) tree   d) bus
8. An IPv4 address consists of:
   a) four groups of numbers from 0 to 255 separated by dots   b) letters and digits separated by colons   c) a domain name and a path   d) exactly 16 binary digits
9. The Philippine law enacted in 2012 to protect personal information is:
   a) RA 10175   b) RA 10173   c) RA 9165   d) RA 8792
10. The machine learning category in which an algorithm interacts with an environment and learns from rewards and penalties is:
    a) supervised learning   b) unsupervised learning   c) reinforcement learning   d) predictive analytics
11. In 1997, IBM's Deep Blue defeated world champion Garry Kasparov at:
    a) Jeopardy   b) Go   c) chess   d) debating
12. The cloud service form that provides a development environment in the cloud is:
    a) SaaS   b) PaaS   c) IaaS   d) DNS

### Part II — True or False (8 items)

13. A systems administrator handles network setup and server maintenance to ensure a reliable multi-user computing environment.
14. Freeware creators give up all rights to their software, placing it in the public domain.
15. Assembly language is a third-generation programming language.
16. In a peer-to-peer network, one dedicated server manages resources for all other computers.
17. HTTPS protects data in transit from eavesdropping by encrypting it.
18. The rapid drop in the cost of IoT components has allowed people and businesses to innovate at an unprecedented pace.
19. Unsupervised learning requires training data that has been labeled with correct outputs.
20. YouTube is the second most-used search engine globally.

### Part III — Identification (10 items)

21. The firmware stored in ROM that a computer relies on when it is powered on.
22. The type of network operating system that resides on a server.
23. Earth's first artificial satellite, launched in 1957.
24. The protocol used for transferring files between systems interactively.
25. The organization of about 350 members that sets standards and guidelines for the web.
26. The type of analytics that uses historical and current data to forecast future events.
27. The person who coined the term "Artificial Intelligence," and the 1956 conference where he coined it.
28. The discipline that combines statistics, computer programming, and domain expertise to extract knowledge from large, complex datasets.
29. The logic gate whose output is 1 when its inputs are the same.
30. Find the 2's complement of 01100.
$md$, 9),

('a1000002-0001-0001-0001-0000000000e1','activity','Final Mock Exams — Answer Key with Explanations',$md$
### Final Mock Exam A — Answers

**Part I — Multiple Choice**

1. **b) Business Analyst** — the "bridge" wording is the giveaway; the DBA (choice a) manages databases, not requirements.
2. **c) Database Administrator** — "secure and efficient database environment" is the DBA's defining phrase.
3. **b) POST** — Power-On Self Test. CMOS (choice a) is the stored configuration data POST results are compared against, the intended trap.
4. **d) open source software** — freeware (choice b) is also free but the creator retains all rights and modification is not part of the deal.
5. **b) an interpreter** — a compiler (choice a) translates everything at once and reports errors together afterward.
6. **c) MAN** — Metropolitan Area Network; a WAN spans between cities or countries, one level larger.
7. **d) mesh** — everyone-to-everyone; maximum reliability, maximum cable and cost.
8. **b) SMTP** — Simple Mail Transfer Protocol; FTP moves files, HTTP moves web pages, and DNS is not a transfer protocol at all.
9. **c) SaaS** — Software as a Service; IaaS is virtual hardware, PaaS is a development platform.
10. **c) supervised learning** — labeled examples (input plus correct output) define supervision.
11. **a) volume, velocity, variety** — amount, speed of generation, and diversity of types and sources.
12. **b) ALU** — the Arithmetic and Logic Unit does both arithmetic and logical comparisons; the control unit only directs the flow.

**Part II — True or False**

13. **True** — without people, no hardware is designed, no software written, no output meaningful.
14. **True** — each peripheral has its own driver, loaded during boot.
15. **False** — shareware is free only for a trial period; payment is required to continue using it. Free-forever describes freeware.
16. **True** — the central hub or switch is the star topology's single point of failure.
17. **False** — Berners-Lee invented the **World Wide Web** in 1989; the Internet grew from ARPANET, operational in 1969. The Web is a service on top of the Internet, not the Internet itself.
18. **False** — RA 10173 is the **Data Privacy Act of 2012**; the Cybercrime Prevention Act is RA 10175.
19. **True** — data flows through multiple layers, each transforming the previous layer's output.
20. **True** — this eliminates dedicated subtraction hardware and simplifies CPU design.

**Part III — Identification**

21. **Machine language** — 1st generation, raw 0s and 1s.
22. **Graphical User Interface (GUI)**.
23. **DNS (Domain Name System)**.
24. **Alexander Graham Bell** — 1875; Marconi (radio, 1899) is the usual wrong guess.
25. **Intranet**.
26. **IaaS (Infrastructure as a Service)**.
27. **The Turing Test**.
28. **ELIZA**.
29. **Project Manager**.
30. **25** — 1x16 + 1x8 + 0x4 + 0x2 + 1x1 = 16 + 8 + 1 = 25.

### Final Mock Exam B — Answers

**Part I — Multiple Choice**

1. **b) Web Designer** — the architect designs the structural foundation, the programmer writes the code, the administrator maintains the site. Match the verb: visual layout and UX = designer.
2. **b) protecting confidential information** — disclosure requires consent, except as required by law.
3. **c) Ubuntu** — it is an operating system. Payroll, Word, and photo editors all help the user accomplish tasks, making them application software.
4. **b) it converts the entire source program into machine code at once** — choices a and c describe an interpreter, and d has the speed comparison backwards.
5. **c) Java, C++, and C#** — COBOL and C (choice a) are procedural third-generation languages.
6. **b) "What hath God wrought!"** — Morse's first message on the Baltimore-Washington line.
7. **c) tree** — the root is the only node with nothing above it.
8. **a) four groups of numbers from 0 to 255 separated by dots** — for example 72.48.108.101.
9. **b) RA 10173** — the Data Privacy Act of 2012; RA 10175 (choice a) is the Cybercrime Prevention Act, the standard swap trap.
10. **c) reinforcement learning** — feedback in the form of rewards or penalties, maximized over time.
11. **c) chess** — Watson's Jeopardy win came later, in 2011.
12. **b) PaaS** — Platform as a Service.

**Part II — True or False**

13. **True** — mail servers, file servers, and a reliable multi-user environment are the systems administrator's territory.
14. **False** — freeware creators retain all rights; only public-domain software has no copyright at all.
15. **False** — assembly is second generation; procedural languages like COBOL and C are third generation.
16. **False** — peer-to-peer means all computers share their resources equally with no dedicated server; the statement describes client-server.
17. **True** — that is precisely why it is used for online banking and shopping.
18. **True** — cheap sensors and connectivity components drove the IoT innovation boom.
19. **False** — unsupervised learning has no labels; the algorithm finds structure on its own. Labeled data defines supervised learning.
20. **True** — as stated in the social networking lesson.

**Part III — Identification**

21. **BIOS (Basic Input/Output System)** — firmware in ROM that runs POST and loads the OS kernel.
22. **Dedicated network OS** — as opposed to a standalone OS that works with or without a network.
23. **Sputnik-1**.
24. **FTP (File Transfer Protocol)**.
25. **W3C (World Wide Web Consortium)**.
26. **Predictive analytics**.
27. **John McCarthy**, at the **Dartmouth Conference**.
28. **Data science**.
29. **XNOR (Exclusive NOR)** — the inverse of XOR, which fires when inputs differ.
30. **10100** — flip every bit of 01100 to get 10011 (the 1's complement), then add 1: 10100.

### Scoring Guide

- **27-30 on both mocks:** you are ready. Skim the rapid review sheet the morning of the exam and nothing else.
- **22-26:** re-read the rapid review lines for every topic you missed, then retake your weaker mock after one day.
- **Below 22:** your misses will cluster — usually Unit V (OS functions and software types) or Unit VI (protocols and topologies). Reopen those unit lessons before retaking anything.
$md$, 10);
