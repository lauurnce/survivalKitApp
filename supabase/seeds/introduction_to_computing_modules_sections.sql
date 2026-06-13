-- ============================================================
-- Introduction to Computing — Modules & Sections
-- Subject ID: 10000000-0001-0001-0001-000000000002
-- Run after migration 002 and 1st_year_subjects.sql
-- ============================================================

DELETE FROM modules WHERE subject_id = '10000000-0001-0001-0001-000000000002';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('a1000002-0001-0001-0001-000000000001','10000000-0001-0001-0001-000000000002','Unit I: Overview of Information and Communications Technology','unit-1-overview-ict',1),
  ('a1000002-0001-0001-0001-000000000002','10000000-0001-0001-0001-000000000002','Unit II: Data Representation','unit-2-data-representation',2),
  ('a1000002-0001-0001-0001-000000000003','10000000-0001-0001-0001-000000000002','Unit III: Hardware','unit-3-hardware',3),
  ('a1000002-0001-0001-0001-000000000004','10000000-0001-0001-0001-000000000002','Unit IV: Peopleware','unit-4-peopleware',4),
  ('a1000002-0001-0001-0001-000000000005','10000000-0001-0001-0001-000000000002','Unit V: Software','unit-5-software',5),
  ('a1000002-0001-0001-0001-000000000006','10000000-0001-0001-0001-000000000002','Unit VI: Network, Internet, and Internet Protocols','unit-6-network-internet',6),
  ('a1000002-0001-0001-0001-000000000007','10000000-0001-0001-0001-000000000002','Unit VII: Trends and Issues in ICT','unit-7-trends-issues',7),
  ('a1000002-0001-0001-0001-000000000008','10000000-0001-0001-0001-000000000002','Unit VIII: Special Interest Topics in ICT','unit-8-special-topics',8);

-- ============================================================
-- UNIT I: Overview of Information and Communications Technology
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a1000002-0001-0001-0001-000000000001','content','What Is a Computer?',$md$
A computer is an electronic system that accepts raw data, processes it through a set of instructions, and returns meaningful results. The word itself traces back to "compute" — originally, computers were seen primarily as calculation machines. Today they do much more: sorting, selecting, comparing, and transforming all kinds of data — numeric, alphabetic, and otherwise.

A working definition: a computer is a fast, accurate data-processing system that can accept data, apply operations to it, store results, and produce output — all driven by step-by-step instructions provided in advance.

**Key terms:**
- **Data** — raw, unorganized facts and figures with no context applied yet.
- **Information** — data that has been processed and organized into something useful and meaningful.
$md$, 1),

('a1000002-0001-0001-0001-000000000001','content','Elements of a Computer System',$md$
Every computer system has three essential components that must work together:

### Hardware
Hardware is the physical, tangible side of a computer — the machinery you can touch. It includes electronic components like integrated circuits (ICs), storage media, input devices (keyboard, mouse, scanner), and output devices (monitor, printer, speakers). All of these physical parts link together to form a functional system. Hardware has evolved enormously over time, from room-filling vacuum tubes to today's microscopic chips.

### Software
Hardware on its own cannot do anything useful — it needs instructions. Software is the collection of programs, procedures, and documentation that tells the hardware what to do. It controls and extends everything the hardware is physically capable of. Without software, the hardware just sits idle.

### Peopleware
Peopleware refers to the human side of computing — the people who conceive, build, program, operate, maintain, and use computer systems. It is often considered the most critical element: without human involvement, no hardware would ever be designed, no software would ever be written, and no outputs would mean anything. Pioneers like Charles Babbage, Ada Lovelace, and Alan Turing are among those who made modern computing possible through their foundational contributions.
$md$, 2),

('a1000002-0001-0001-0001-000000000001','content','Classification of Computers',$md$
Computers can be grouped in several ways depending on what you're measuring.

### By Size

**Supercomputers** are the highest-performance machines available. Their speed is measured in FLOPS (Floating Point Operations Per Second) rather than the MIPS used for everyday computers. They handle the most demanding computational tasks: weather forecasting, climate research, molecular simulations, quantum mechanics, oil and gas exploration, and cryptanalysis. Nearly all top-ranked supercomputers run Linux-based operating systems.

**Mainframe computers** — sometimes called "big iron" — are large, high-throughput systems used by major organizations for bulk data processing like census computations, large-scale financial transactions, and statistical analysis. The basic mainframe architecture was established in the 1960s and has been continuously refined since.

**Minicomputers** appeared in the mid-1960s at much lower prices than mainframes. They were designed primarily for control systems, instrumentation, and human-machine interaction rather than large-scale batch processing. They typically occupied one or a few rack cabinets, far smaller than the room-sized mainframes of the era. The term "minicomputer" was coined to describe these smaller machines made possible by transistor and core memory technology.

**Microcomputers** are the small, relatively affordable computers built around a microprocessor as their CPU. They combine the processor, memory, and essential I/O circuitry on a single printed circuit board. Microcomputers laid the groundwork for today's personal computers and smart devices.

### By Functionality

**Servers** are dedicated machines configured to provide specific services — file storage, web hosting, email, databases — to other machines (clients) on a network. They are named after the type of service they provide.

**Workstations** are high-performance machines designed for use by one person at a time. They run multi-user operating systems and are used for professional or commercial work.

**Information appliances** are portable devices built for a narrow set of functions: calculations, media playback, web browsing, and similar tasks. They have limited memory and flexibility. Mobile phones and tablets fall into this category.

**Embedded computers** are computing units built directly into other machines to serve a specific, limited set of functions. They run instructions stored in non-volatile memory and rarely require rebooting. Their processors are purpose-built and differ from those in general-purpose computers.

### By Data Handling Type

**Analog computers** work with continuously varying physical quantities — electrical voltage, mechanical motion, hydraulic pressure — to model and solve problems. An analog clock is a simple example: the hands move continuously, representing time through physical position.

**Digital computers** operate on discrete values, typically in binary (0s and 1s). By processing combinations of these values, they can perform calculations, organize data, control systems, and simulate complex systems like weather patterns.

**Hybrid computers** combine both analog and digital processing. They accept analog input signals, convert them to digital form, and then process them digitally — useful in environments where real-world signals need precise computational analysis.

### By Purpose

**General-purpose computers** handle a wide variety of ordinary tasks — word processing, record keeping, database management, report generation. Most personal computers fall into this category.

**Special-purpose computers** are designed and optimized for one specific function. Their hardware (and sometimes additional processors) is tailored to that task. Examples include navigation computers in aircraft, medical imaging equipment, or industrial control systems.
$md$, 3),

('a1000002-0001-0001-0001-000000000001','content','Capabilities and Limitations of Computers',$md$
### What Computers Do Well

**Speed** — Computers complete operations far faster than humans ever could. Performance is measured in MIPS (Million Instructions Per Second), and different machines are compared and classified on this basis.

**Accuracy** — With correct input and a properly written program, computers perform operations with near-perfect precision. Errors in output almost always trace back to errors in the input data or the program itself.

**Reliability** — Computers don't get fatigued, bored, or distracted. They can repeat the same operation indefinitely without decline in quality. Most systems also include backup mechanisms to protect data if hardware fails.

**Versatility** — The same machine can serve scientific research, financial accounting, communication, entertainment, and creative work — simply by running different software.

**Storage** — Computers can hold vast amounts of data in various media: hard drives, SSDs, optical discs, RAM, ROM, and cloud storage.

### What Computers Cannot Do

**Think independently** — Computers only do what they are explicitly programmed to do. Every behavior must be defined in advance by a human programmer. They cannot generate new approaches to problems without instruction.

**Make genuine decisions** — True decision-making requires judgment, contextual understanding, and wisdom — none of which computers possess on their own. They can follow decision rules coded by humans, but they cannot exercise real independent judgment.

**Feel** — Computers process data about emotions but experience nothing themselves. They have no subjective inner life.

**Implement policy** — Even with access to enormous information stores, only humans can determine how that information should be acted upon and then carry those decisions out in the real world.
$md$, 4),

('a1000002-0001-0001-0001-000000000001','content','History of Computing',$md$
### Early Computing Devices

Long before electronic machines, humans developed mechanical tools to assist with calculation:

| Period | Device | Inventor | What It Did |
|---|---|---|---|
| Ancient China | Abacus | — | Frame with beads on wires; arithmetic by physically moving beads |
| 17th century | Napier's Bones | John Napier | Simple physical aid for multiplication |
| 17th century | Slide Rule | William Oughtred | Two logarithmic rulers enabling multiplication and division |
| 1642 | Mechanical Calculator | Wilhelm von Leibniz | Could add, subtract, multiply, and divide |
| 19th century | Difference Engine | Charles Babbage | Designed to calculate and print mathematical tables |
| 1930 | Differential Analyzer | Vannevar Bush | Analog machine for calculating artillery trajectories |
| 1896 | Punch Card Machine | Herman Hollerith | Read information punched into cards automatically |
| 1897 | Automatic Calculating Machine | Howard Aiken | Handled 23-decimal-place numbers; built-in trigonometric routines |
| 1943–1946 | ENIAC | Eckert & Mauchly | First large-scale vacuum tube computer |
| 1946 | EDVAC | John von Neumann | Refined successor to ENIAC using stored-program concept |

### Generations of Computers

**First Generation (1946–1959) — Vacuum Tubes**
These machines used vacuum tubes as their core electronic components and magnetic drums for memory. They were massive — some weighed around 30 tons — consumed huge amounts of electricity, needed large cooling systems, and broke down frequently. Programming relied on punch cards. Despite their limitations, they could calculate in milliseconds, a tremendous leap at the time.

**Second Generation (1959–1965) — Transistors**
Transistors replaced vacuum tubes, dramatically shrinking size and power consumption. These machines were faster (operating in microseconds), more reliable, and cheaper. Assembly language replaced raw machine code as the primary way to program them. Cooling and maintenance were still required but less intensively.

**Third Generation (1965–1971) — Integrated Circuits**
The invention of the integrated circuit (IC) by Robert Noyce and Jack Kilby in 1958–1959 packed many transistors onto a single chip. Computers shrank further, became faster (now operating in nanoseconds), and dropped in cost. Operating systems emerged, enabling time-sharing and multiprogramming. Keyboards and mice replaced punch cards as the primary input method.

**Fourth Generation (1971–1980) — Microprocessors**
The microprocessor — a complete CPU on a single chip — defined this era. Computers became small enough to sit on a desk and be affordable to individuals. Graphical User Interfaces (GUIs) made computers accessible to people without technical training. Features like multiprocessing, virtual storage, and time-sharing became standard.

**Fifth Generation (1980–present) — Artificial Intelligence**
Built on Ultra Large Scale Integration (ULSI) technology, with chips containing tens of millions of components. The defining ambition of this era is machines that can learn, adapt, and respond to natural language — artificial intelligence. Computers now appear in countless form factors and are embedded in nearly every aspect of daily life.
$md$, 5),

('a1000002-0001-0001-0001-000000000001','activity','Practice Exercises — Unit I',$md$
1. In your own words, explain how hardware, software, and peopleware depend on each other. What happens if any one of the three is missing?
2. For each classification category (size, functionality, data handling, purpose), identify one type of computer not covered in the examples above and describe where it fits.
3. Choose two capabilities and two limitations of computers and give a real-world example for each that illustrates why it matters.
4. Trace the progression from first- to fifth-generation computers. For each transition, identify the single most important change that defined the new generation.
5. Research one recent hardware or software advancement (from the past two years). Explain what problem it solves and what its impact might be on computing.
$md$, 6);

-- ============================================================
-- UNIT II: Data Representation
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a1000002-0001-0001-0001-000000000002','content','Number Systems',$md$
Computers and digital systems work with several number systems. Each is defined by its **base** (or radix) — the number of unique digits it uses.

| System | Base | Digits Used |
|---|---|---|
| Binary | 2 | 0, 1 |
| Octal | 8 | 0–7 |
| Decimal | 10 | 0–9 |
| Hexadecimal | 16 | 0–9, A–F (where A=10, B=11, C=12, D=13, E=14, F=15) |

In any positional number system, the value of a digit depends on both the digit itself and its position. The rightmost position carries weight base⁰, the next carries base¹, and so on moving left.
$md$, 1),

('a1000002-0001-0001-0001-000000000002','content','Number System Conversions',$md$
### Any Base → Decimal
Multiply each digit by its positional weight (base raised to that position's power) and sum the results.

**Binary to Decimal:**
```
1001₂ = 1×2³ + 0×2² + 0×2¹ + 1×2⁰ = 8 + 0 + 0 + 1 = 9₁₀
11000₂ = 1×2⁴ + 1×2³ + 0×2² + 0×2¹ + 0×2⁰ = 16 + 8 = 24₁₀
```

**Octal to Decimal:**
```
345₈ = 3×8² + 4×8¹ + 5×8⁰ = 192 + 32 + 5 = 229₁₀
```

**Hexadecimal to Decimal:**
```
A3₁₆ = 10×16¹ + 3×16⁰ = 160 + 3 = 163₁₀
```

### Decimal → Any Base
Repeatedly divide the decimal number by the target base. The remainders, read from last to first, give the result.

**Decimal to Binary:**
```
36 ÷ 2 = 18 r 0  (LSB)
18 ÷ 2 = 9  r 0
 9 ÷ 2 = 4  r 1
 4 ÷ 2 = 2  r 0
 2 ÷ 2 = 1  r 0
 1 ÷ 2 = 0  r 1  (MSB)
Result: 100100₂
```

**Decimal to Octal:**
```
229 ÷ 8 = 28 r 5  (LSB)
 28 ÷ 8 = 3  r 4
  3            (MSB)
Result: 345₈
```

**Decimal to Hexadecimal:**
```
759 ÷ 16 = 47 r 7   (LSB)
 47 ÷ 16 = 2  r 15 = F
  2             (MSB)
Result: 2F7₁₆
```

### Binary ↔ Octal
Group binary digits in sets of 3 (from the right, padding with leading zeros if needed). Each group maps to one octal digit.
```
100 010 111₂  →  4  2  7₈
```

### Binary ↔ Hexadecimal
Group binary digits in sets of 4 (from the right). Each group maps to one hex digit.
```
1001 1110 0111 0000₂  →  9  E  7  0₁₆
```

### Hexadecimal → Octal
Convert hex → binary first, then binary → octal.
$md$, 2),

('a1000002-0001-0001-0001-000000000002','content','Fractional Number Conversion',$md$
For numbers with a fractional part, handle the integer and fractional portions separately.

**Fractional Binary to Decimal:**
Digits to the right of the binary point carry negative powers of 2: 2⁻¹ = 0.5, 2⁻² = 0.25, 2⁻³ = 0.125, etc.

```
1110.011₂ = 1×2³ + 1×2² + 1×2¹ + 0×2⁰ + 0×2⁻¹ + 1×2⁻² + 1×2⁻³
           = 8 + 4 + 2 + 0 + 0 + 0.25 + 0.125
           = 14.375₁₀
```

**Decimal Fraction → Binary:**
Repeatedly multiply the fractional part by 2. The digit before the decimal point in each result (0 or 1) becomes the next binary digit after the point.

```
0.2 × 2 = 0.4  → 0
0.4 × 2 = 0.8  → 0
0.8 × 2 = 1.6  → 1
0.6 × 2 = 1.2  → 1
(pattern repeats: 0011...)

So 0.2₁₀ ≈ 0.001100110011...₂
```
$md$, 3),

('a1000002-0001-0001-0001-000000000002','content','Number System Arithmetic',$md$
### Addition
Addition in any base works the same way as decimal — add column by column from right to left, carrying when the sum reaches or exceeds the base.

Binary carries when the sum reaches 2:
```
  1011
+ 0110
------
 10001
```

Hexadecimal carries when the sum reaches 16:
```
  ACE
+ BEA
-----
 16B8  (A+B=21=15+carry, etc.)
```

### Subtraction: Direct Method
Borrow from the next higher position when the digit being subtracted is larger than the digit above it — exactly as in decimal subtraction.

### Binary Subtraction Using Complements

**1's Complement:** Flip every bit (0→1, 1→0).
```
1's complement of 10110₂  →  01001₂
```

**2's Complement:** Take the 1's complement and add 1.
```
1's complement of 10110₂ = 01001₂
01001₂ + 1 = 01010₂
```

**Subtraction via 1's Complement:**
1. Find the 1's complement of the number being subtracted.
2. Add it to the other number.
3. If a carry results, remove it and add 1 to the result.
4. If no carry results, the answer is negative: take the 1's complement of the result and add a minus sign.

**Subtraction via 2's Complement:**
1. Find the 2's complement of the number being subtracted.
2. Add it to the other number.
3. If a carry results, discard it — the remaining bits are the answer.
4. If no carry, the result is in 2's complement form (negative).

The reason computers use 2's complement for negative numbers: subtraction can be performed entirely using addition circuits, eliminating the need for dedicated subtraction hardware and simplifying the CPU design.

### Multiplication and Division
Binary multiplication is repeated addition of partial products — simpler than decimal since each partial product is either 0 or the multiplicand itself. Binary division follows the same long-division procedure as decimal division.
$md$, 4),

('a1000002-0001-0001-0001-000000000002','content','Data Representation',$md$
Everything a computer stores and processes is ultimately represented as binary sequences. The same bit pattern can mean different things depending on which encoding is being used — context and the agreed-upon code are what give the bits their meaning.

### Decimal Digit Representation

**Binary Coded Decimal (BCD)**
Each decimal digit is encoded separately using exactly 4 bits. This avoids conversion errors when working with decimal numbers.

| Decimal | BCD |
|---|---|
| 0 | 0000 |
| 1 | 0001 |
| ... | ... |
| 9 | 1001 |

Example: 789 in BCD = `0111 1000 1001`

**Unpacked Decimal Format (UDF / Zoned Decimal)**
Each decimal digit occupies one full byte. The high 4 bits are always `1111` (the "zone" bits) except in the least significant digit, where the zone bits represent the sign (`1100` = positive/zero, `1101` = negative).

Example: 789 → `11110111 11111000 11001001`

**Packed Decimal Format (PDF)**
Two decimal digits are packed into one byte, saving space. The least significant 4 bits of the entire number hold the sign code.

Example: 789 → `0111 1000 1001 1100`
$md$, 5),

('a1000002-0001-0001-0001-000000000002','content','Signed Binary Number Representation',$md$
### Sign-Magnitude
An extra bit is used as the sign: 0 for positive, 1 for negative. The remaining bits hold the magnitude.

```
+44₁₀ = 0101100₂ (sign bit 0, magnitude 101100)
 -7₁₀ = 1000111₂ (sign bit 1, magnitude 0000111)
```

### Absolute Value Representation
An 8-bit scheme where the leftmost bit is the sign and the remaining 7 bits are the number's value. Limitation: zero has two representations (`00000000` and `10000000`), which complicates arithmetic.

### Complement Representation
Covered in the arithmetic section above. 2's complement is the standard approach used in modern computers because it allows subtraction to be handled by addition circuits.
$md$, 6),

('a1000002-0001-0001-0001-000000000002','content','Floating Point Representation',$md$
Real numbers (numbers with fractional parts) are stored in a format similar to scientific notation, standardized by IEEE.

**Single precision (32-bit) layout:**
```
| S | EEEEEEEE | FFFFFFFFFFFFFFFFFFFFFFF |
  1 bit  8 bits         23 bits
```

- **S (Sign):** 0 = positive, 1 = negative
- **E (Exponent):** Stored as a biased value. True exponent = E − 127
- **F (Mantissa/Fraction):** The digits after the binary point in normalized form. A leading 1 is always implied (the "hidden bit"), giving 24 bits of precision from 23 stored bits.

**True value = (−1)ˢ × 1.F × 2^(E−127)**

**Example — converting 64.2₁₀ to single precision:**
1. Convert: 64 = 1000000₂; 0.2 ≈ 0.001100110011...₂ → combined: 1000000.00110011...₂
2. Normalize: 1.00000000110011... × 2⁶
3. Biased exponent: 6 + 127 = 133 → `10000101` in binary
4. Mantissa (23 bits after the point): `00000000110011001100110`
5. Final: `0 10000101 00000000110011001100110`

**Overflow** occurs when a computed value is too large to fit in the available bits. For example, in an unsigned 3-bit system, the value 9 requires 4 bits and cannot be represented — any arithmetic that produces it has overflowed.
$md$, 7),

('a1000002-0001-0001-0001-000000000002','content','Character Representation',$md$
Characters are stored using agreed-upon binary codes. Two major standards:

### ASCII (American Standard Code for Information Interchange)
Uses 7-bit patterns (extended to 8 bits) to represent uppercase and lowercase letters, digits 0–9, punctuation, and control characters. Key ranges:
- Uppercase A–Z: 65–90 (decimal)
- Lowercase a–z: 97–122
- Digits 0–9: 48–57
- Space: 32

Important: the character `'8'` (ASCII 56) is completely different from the integer 8. Uppercase and lowercase letters are also distinct (`'A'` ≠ `'a'`).

### EBCDIC (Extended Binary Coded Decimal Interchange Code)
An 8-bit code developed by IBM for their System/360 line. Uses a zone-and-digit structure where the high 4 bits indicate the character group and the low 4 bits identify the specific character.
$md$, 8),

('a1000002-0001-0001-0001-000000000002','content','Parity Bits',$md$
During data transmission, noise can accidentally flip bits from 0 to 1 or vice versa. A parity bit is an extra bit added to a group of bits so that the total count of 1s is either always even (even parity) or always odd (odd parity). The receiver checks the parity and flags an error if it doesn't match.

**Even parity rule:** Count the 1s in the data bits.
- If odd, set parity bit = 1 (making the total even)
- If even, set parity bit = 0

**Odd parity rule:** Count the 1s in the data bits.
- If even, set parity bit = 1 (making the total odd)
- If odd, set parity bit = 0

Parity detection can catch single-bit errors but cannot correct them, and it cannot reliably detect even numbers of flipped bits.
$md$, 9),

('a1000002-0001-0001-0001-000000000002','activity','Practice Exercises — Unit II',$md$
**Number conversion table:** Convert each of the following to all four bases (binary, octal, decimal, hexadecimal):
- 101101102, 7628, 78510, BEE16

**Arithmetic:**
1. Add in octal: 756 + 345
2. Add in hexadecimal: ACE + BEAD
3. Add in binary: 101010 + 111111 + 101
4. Subtract in binary using direct method, 1's complement, and 2's complement: 1111 − 101
5. Subtract in binary using 1's complement and 2's complement: 1001 − 1101

**Data representation:**
1. Represent the decimal numbers 3421 and 7684 in BCD.
2. Represent +3245 and −7448 in Unpacked Decimal Format.
3. Represent +33485 and −7438 in Packed Decimal Format.
4. Represent −87 in 8-bit sign-magnitude, 1's complement, and 2's complement.
5. Convert 64.2₁₀ to IEEE single-precision floating point (show all steps).
6. What is the ASCII code for "bSCs"? What is the hex equivalent?
7. Add even parity to the ASCII code for "roxas".
$md$, 10);

-- ============================================================
-- UNIT III: Hardware
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a1000002-0001-0001-0001-000000000003','content','Part 1 — Components of the System Unit',$md$
### Main Units of a Computer

A physical computer system consists of four main functional units working together:

**Processor (CPU)** — interprets and executes instructions. It contains:
- **Control Unit** — acts like a traffic controller, directing the flow of data and instructions throughout the CPU and coordinating operations.
- **Arithmetic and Logic Unit (ALU)** — performs all arithmetic calculations (addition, subtraction, etc.) and logical comparisons (AND, OR, NOT, etc.).
- **Registers** — tiny, high-speed storage locations inside the processor that temporarily hold data and instructions currently being processed.
- **System Clock** — generates regular electronic pulses (ticks) that set the operating pace for all components in the system unit.

**Main Storage (Memory)** — holds the data and instructions currently in use. Memory stores three types of content: the operating system and system software, application programs, and the data being processed.

Types of memory:
- **RAM (Random Access Memory)** — stores data and instructions currently in use; volatile (contents are lost when power is removed).
- **Cache Memory** — a small, very fast holding area for data the CPU uses frequently, reducing the time needed to fetch it from regular RAM.
- **ROM (Read-Only Memory)** — contains the basic instructions a computer needs to start up; non-volatile (retained without power).
- **CMOS** — stores configuration information (RAM capacity, date/time, drive types) that is read every time the computer is powered on.

**Input Devices** — hardware used to send data into a computer. Examples: keyboard, mouse, scanner, optical mark reader, touch screen, light pen, microphone, MICR (Magnetic Ink Character Recognition) readers used for processing bank checks.

**Output Devices** — hardware used to send processed data out from the computer. Examples: monitor, printer, speakers, projector.

### Secondary (Auxiliary) Storage
Secondary storage holds data permanently, outside of the main memory. It exists because RAM can only hold limited data and loses everything when power is cut.

Types of secondary storage:
- **Magnetic tape** — serial access; data can only be read in order; high capacity; inexpensive.
- **Magnetic disk** — direct access; data can be read from any location quickly; uses electromagnetic read/write heads.
- **Optical disc (CD, DVD, Blu-ray)** — reads and writes data using laser beams.
- **Solid State Drive (SSD)** — uses integrated circuit assemblies with no moving parts; faster and more durable than magnetic disks.
- **Flash drives and external drives** — portable storage.
- **Cloud storage** — data stored on remote servers accessible over the internet.
$md$, 1),

('a1000002-0001-0001-0001-000000000003','content','Part 2 — Digital Logic System',$md$
### Boolean Algebra

George Boole (1815–1864) developed an algebraic system for handling logical statements, now called Boolean algebra. Claude Shannon (1916–2001) later showed in 1938 that Boolean algebra could be applied directly to electronic switching circuits, which became the foundation of digital circuit design.

Boolean algebra differs from ordinary algebra in key ways:
- It deals with only two values: **0** (false) and **1** (true).
- It includes a **complement** operation (NOT) that has no equivalent in ordinary algebra.
- There is no subtraction or division.

The three fundamental operations are:
| Operation | Symbol | Also called |
|---|---|---|
| Complement | ' or overbar | NOT / Inversion |
| Multiplication | • | AND |
| Addition | + | OR |

Truth table for basic operations:
```
NOT:   0' = 1,  1' = 0

AND:   0•0=0,  0•1=0,  1•0=0,  1•1=1

OR:    0+0=0,  0+1=1,  1+0=1,  1+1=1
```

### Logic Gates

Logic circuits are often called gates. Each gate takes one or more binary input signals and produces a single binary output.

**NOT Gate (Inverter):** Flips the input. Input A → Output A'

**AND Gate:** Output is 1 only when ALL inputs are 1.

**OR Gate:** Output is 1 when AT LEAST ONE input is 1.

**NAND Gate:** AND followed by NOT. Output is 0 only when all inputs are 1 (the inverse of AND). NAND is a universal gate — any other gate can be built from NAND gates alone.

**NOR Gate:** OR followed by NOT. Output is 1 only when all inputs are 0 (the inverse of OR). NOR is also a universal gate.

**XOR Gate (Exclusive OR):** Output is 1 when inputs are different. If inputs are the same, output is 0.

**XNOR Gate (Exclusive NOR):** The inverse of XOR. Output is 1 when inputs are the same.

Using universal gates reduces the variety of physical gates needed in manufacturing and simplifies circuit fabrication.

### Boolean Postulates and Theorems

Key identities for simplifying Boolean expressions:

| Identity | Law |
|---|---|
| A + 0 = A | Identity for OR |
| A • 1 = A | Identity for AND |
| A + 1 = 1 | Domination for OR |
| A • 0 = 0 | Domination for AND |
| A + A = A | Idempotent for OR |
| A • A = A | Idempotent for AND |
| A + A' = 1 | Complement for OR |
| A • A' = 0 | Complement for AND |
| (A')' = A | Double negation |
| A + B = B + A | Commutative |
| A • B = B • A | Commutative |
| A + (B + C) = (A + B) + C | Associative |
| A(B + C) = AB + AC | Distributive |

**Example simplification using Distributive and Complement:**
```
F = AB + BC + B'C
  = AB + C(B + B')    ← factor out C
  = AB + C            ← because B + B' = 1
```

### De Morgan's Theorems

Two essential rules for converting between AND and OR forms:

**Theorem 1:** (X + Y)' = X'Y'
→ A NOR gate is equivalent to a bubbled AND gate (AND with inverted inputs)

**Theorem 2:** (XY)' = X' + Y'
→ A NAND gate is equivalent to a bubbled OR gate (OR with inverted inputs)

Double inversion has no effect: inverting a signal twice returns it to its original state. This principle is used to convert circuits between equivalent forms without changing logical behavior.
$md$, 2),

('a1000002-0001-0001-0001-000000000003','activity','Practice Exercises — Unit III',$md$
1. Differentiate primary storage from secondary storage.
2. Differentiate RAM from ROM.
3. Explain the four main units of a computer and what each does.
4. Give three examples of cloud storage services.
5. For the Boolean expression Z = WX + YZ, draw the corresponding logic circuit.
6. Create a truth table for the XOR gate.
7. Using De Morgan's Theorem 1, show what a NOR gate is equivalent to.
8. Simplify the expression: F = A'B'C + A'BC + AB'
9. Draw the OR function implemented using only NOR gates.
10. Draw the AND function implemented using only NAND gates.
11. Create the truth table for the circuit: two inverters (NOT gates) feeding into an AND gate.
$md$, 3);

-- ============================================================
-- UNIT IV: Peopleware
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a1000002-0001-0001-0001-000000000004','content','People in ICT',$md$
Peopleware — the human element of computing — is considered the most important component of any computer and communications system. Without people, no hardware would be designed, no software would be written, and no output would carry any meaning. As ICT continues to evolve, a wide range of professional roles has emerged to design, operate, maintain, and use these systems.

Most professional ICT work falls into three broad areas: **Information Systems / Information Technology**, **Computer Systems Engineering**, and **Computer Science**.

### ICT Career Categories

**Business Analysis**
- *Business Analyst* — evaluates customer business needs and recommends solutions using data analysis. They bridge the gap between business requirements and technical implementation.
- *Business Systems Analyst* — addresses organizational information problems by analyzing requirements and designing systems that meet those needs.

**Computer Engineering**
- *Computer Engineer* — designs, tests, and maintains both hardware and software systems, including processors, circuit boards, and networks.
- *Hardware Design Engineer* — develops, tests, and improves physical components like processors, memory cards, and circuit boards.
- *Technical Support Engineer* — resolves technical issues across software, hardware, and network systems.
- *Computer Systems Engineer* — combines engineering, computer science, and mathematics to develop and evaluate computing systems.

**Database Administration**
- *Database Administrator* — maintains a secure and efficient database environment, managing data storage, access, and security.

**ICT Education**
- *IT Lecturer* — teaches how computers work, from foundational science and mathematics to hardware and software.
- *Training Officer* — identifies staff development needs and plans and delivers appropriate training programs.
- *Education Manager* — develops policy, manages educational systems, and oversees curricula and resources.

**Internet and E-Commerce**
- *Web Architect* — designs and implements the structural foundation of web applications.
- *Web Designer* — creates the visual layout and user experience of websites.
- *Web Programmer* — writes code in various programming languages to build web applications.
- *Web Administrator* — maintains, updates, and ensures the reliability of websites.

**Multimedia**
- *Multimedia Graphics Designer* — creates visual content combining text, audio, animation, photography, and video.
- *Multimedia Content Author* — develops and produces cohesive multimedia programs from diverse media types.
- *Animator* — creates sequences of images that form animation for films, games, commercials, and television.

**Software Development**
- *Programmer* — writes and tests code for software applications and mobile apps.
- *Software Engineer* — analyzes problems, designs solutions, and develops and installs software systems.

**Project Management**
- *Project Manager* — defines project scope, plans deliverables, manages resources, and leads cross-functional teams to deliver on requirements.

**Systems Analysis and Design**
- *Systems Analyst* — works with clients to understand their needs, designs system solutions, and tests the results.
- *Systems Architect* — designs, implements, and maintains the overall technical architecture of computer systems, customized to specific organizational needs.

**Systems Management and Administration**
- *Systems Administrator* — handles network setup, server maintenance (mail servers, file servers), and ensures a reliable multi-user computing environment.
- *Network Administrator* — assists in network design and implementation, installs and configures network equipment, and maintains connectivity for all workstations.
$md$, 1),

('a1000002-0001-0001-0001-000000000004','content','Code of Ethics for ICT Professionals',$md$
ICT professionals carry significant responsibilities because of the power their work has over individuals and society. Ethical principles that guide the profession include:

- Promoting public understanding and appreciation of information technology.
- Considering general welfare and the public good in all professional work.
- Complying with intellectual property laws, patent laws, and other related regulations.
- Accepting full responsibility for the work undertaken and delivering it with competence.
- Making truthful statements about one's own capabilities and the capabilities of one's products.
- Protecting confidential information obtained through professional work — not disclosing it without consent, except as required by law.
- Striving for the highest quality in all products and services.
- Not participating in the development of systems that facilitate fraud or unlawful acts.
- Pursuing continuing professional development to keep skills and standards current.
$md$, 2),

('a1000002-0001-0001-0001-000000000004','activity','Practice Exercises — Unit IV',$md$
1. Identify five ICT job titles not covered above and describe their specific responsibilities.
2. In your own words, why is peopleware considered the most important element of a computer system?
3. Which ICT profession most appeals to you, and why? What skills would you need to develop to pursue it?
4. Interview someone working in an ICT-related field. Describe a typical workday in their role (without disclosing personal or company details).
$md$, 3);

-- ============================================================
-- UNIT V: Software
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a1000002-0001-0001-0001-000000000005','content','What Is Software?',$md$
Software is the collection of programs — sets of step-by-step instructions — that tell hardware what to do. Hardware cannot function usefully on its own; it needs software to direct its operations.

Software falls into two main categories: **system software** and **application software**.
$md$, 1),

('a1000002-0001-0001-0001-000000000005','content','System Software',$md$
System software consists of programs that control and maintain the computer's own operations and act as the bridge between users, applications, and hardware.

### Operating System (OS)
An operating system is a collection of programs that coordinates all computer hardware activities, manages the system's internal workings (memory, processors, file system, devices), and provides a means for users and other programs to communicate with the computer.

**Functions of an Operating System:**

**1. Boot Operation**
When a computer is powered on, it relies on firmware stored in ROM called the BIOS (Basic Input/Output System). The BIOS performs POST (Power-On Self Test) — checking hardware components like RAM, the clock, keyboard, and adapter cards. POST results are compared against configuration data stored in CMOS. If POST passes, the BIOS loads the OS kernel from storage into memory, and the OS takes over control.

**2. User Interface**
The OS provides the means by which users interact with the computer. Three types:
- *Command-line interface* — the user types text commands; the computer displays text output.
- *Menu-driven interface* — the user selects from a list of options.
- *Graphical User Interface (GUI)* — uses windows, icons, pointers, and menus for visual interaction.

**3. Program Management**
The OS controls how programs run:
- *Single-user/single-tasking* — one user, one program at a time.
- *Single-user/multitasking* — one user, multiple programs simultaneously.
- *Multiuser* — multiple users running programs at the same time.
- *Multiprocessing* — multiple processors running programs simultaneously.

**4. Memory Management**
The OS allocates RAM to programs and data while they are being processed and releases memory when it is no longer needed, optimizing the use of available RAM.

**5. Job Scheduling**
The OS determines the order in which jobs (input processing, instruction execution, output delivery, storage transfers) are handled.

**6. Device Configuration**
A device driver is a small program that tells the OS how to communicate with a specific device. Each peripheral has its own driver, which is loaded during boot.

**7. File Management and Utilities**
The OS provides file management capabilities — creating, organizing, copying, moving, and deleting files — as well as other utility functions like disk scanning and image viewing.

**8. Network Control**
A network OS coordinates how multiple users access and share resources over a network. It can be standalone (works with or without a network) or dedicated network OS (resides on a server).

**9. Security Administration**
The network OS allows administrators to set permissions that control which users can access which resources.

**10. Performance Monitoring**
The OS tracks and reports usage of the processor, memory, disk, and network to help identify bottlenecks.

### Utility Programs
Utility programs are a second type of system software focused on maintenance tasks — managing the computer, its devices, or its programs. Examples include antivirus software, spyware removers, and file compression tools. While the OS includes built-in utilities, standalone utilities often offer more features.
$md$, 2),

('a1000002-0001-0001-0001-000000000005','content','Application Software',$md$
Application software (end-user software) consists of programs that help users accomplish specific tasks — creating documents, managing finances, playing games, communicating, and so on.

### Categories of Application Software
- **Business** — word processing, spreadsheets, databases, project management, accounting.
- **Graphics and Multimedia** — CAD (computer-aided design), desktop publishing, image/video editing, web page authoring.
- **Home/Personal/Educational** — photo editing, personal finance, educational games, entertainment.
- **Communications** — email clients, chat tools, video conferencing.

### How Application Software Is Distributed
- **Packaged software** — mass-produced, copyrighted software sold commercially.
- **Custom software** — developed specifically for one organization's unique needs.
- **Open source software** — provided free for use, modification, and redistribution; the copyright holder imposes no restrictions on modification.
- **Shareware** — copyrighted software distributed free for a trial period; payment required to continue using it.
- **Freeware** — copyrighted software provided at no cost; the creator retains all rights but makes it freely available.
- **Public-domain software** — no copyright, trademark, or patent applies; anyone can use, modify, distribute, or sell it without restriction.
$md$, 3),

('a1000002-0001-0001-0001-000000000005','content','Programming Languages',$md$
**Low-Level Languages**
- *Machine Language (1st generation)* — instructions in raw binary (0s and 1s); directly executable by the hardware.
- *Assembly Language (2nd generation)* — uses short English-like abbreviations to represent machine code instructions; more readable than binary but still hardware-specific.

**Procedural Languages (3rd generation)**
Use English-like words to write instructions. Examples: COBOL, C.

**Object-Oriented Programming Languages**
Organize code around objects — bundles of data and behavior — that can be reused across many projects. Examples: Java, C++, C#.

### Compiler vs. Interpreter
- **Compiler** — converts the entire source program into machine code (object code) at once. The resulting program runs independently and typically faster, but errors are reported all at once after full compilation.
- **Interpreter** — translates and executes one statement at a time. Errors appear immediately when encountered, making debugging easier, but interpreted programs run more slowly than compiled ones.
$md$, 4),

('a1000002-0001-0001-0001-000000000005','activity','Practice Exercises — Unit V',$md$
1. List 10 available operating systems and describe what each is primarily used for.
2. Explain the difference between a compiler and an interpreter.
3. Differentiate system software from application software and give an example of each.
4. Explain the difference between freeware, shareware, and open source software.
5. Categorize each of the following as system software or application software: Payroll system, Avast antivirus, Ubuntu, Microsoft Word, MySQL, Image viewer, Screen saver, Disk scanner.
6. Describe the steps that happen during the boot operation before the OS takes control.
7. Explain how an OS manages memory.
$md$, 5);

-- ============================================================
-- UNIT VI: Network, Internet, and Internet Protocols
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a1000002-0001-0001-0001-000000000006','content','Data Communications',$md$
Data communications refers to the transmission of digital data between two or more connected devices. A computer network is a telecommunications infrastructure that allows computers to exchange data.

### Brief History of Data Communication

| Year | Development |
|---|---|
| 1753 | Proposal to connect villages using 26 parallel wires (one per letter) |
| 1833 | Carl Friedrich Gauss developed a 5×5 matrix system to send messages over a single wire |
| 1832 | Samuel Morse invented the telegraph; also developed Morse code (dots and dashes) |
| 1840 | Morse secured an American patent for the telegraph |
| 1844 | First telegraph line established (Baltimore to Washington D.C.); first message: "What hath God wrought!" |
| 1875 | Alexander Graham Bell invented the telephone |
| 1899 | Guglielmo Marconi transmitted radio (wireless) telegraph messages |
| 1920 | First radio transmission of the human voice |
| 1957 | Launch of Sputnik-1, Earth's first artificial satellite |
| 1963 | Launch of Syncom-1, the first geostationary telecommunications satellite |
$md$, 1),

('a1000002-0001-0001-0001-000000000006','content','Computer Network Elements',$md$
The key elements of a computer network are:
- **Protocols** — rules and agreements governing how devices communicate. A protocol stack is the ordered set of protocols a system uses.
- **Data and Messages** — the information being transmitted across the network.
- **Communications Medium** — the physical or wireless channels connecting devices (e.g., copper cables, fiber optic cables, radio waves).
- **Devices** — the hardware in the network: computers, routers, switches, hubs, bridges.
$md$, 2),

('a1000002-0001-0001-0001-000000000006','content','Network Classification by Geographic Scope',$md$
| Type | Coverage | Characteristics |
|---|---|---|
| PAN (Personal Area Network) | ~10 meters around an individual | Short-range device interconnection |
| LAN (Local Area Network) | One building or campus | High speed; usually privately owned |
| MAN (Metropolitan Area Network) | A city or cluster of cities | Often uses telecom provider infrastructure |
| WAN (Wide Area Network) | Between cities or countries | Lower speed; uses public networks |
| GAN (Global Area Network) | Worldwide (e.g., the Internet) | — |
$md$, 3),

('a1000002-0001-0001-0001-000000000006','content','Network Models',$md$
**Peer-to-Peer** — all computers in the network share their resources equally with all other computers. No dedicated server.

**Client-Server** — one or more powerful machines act as servers, with the rest as clients. The server manages and provides resources; clients request and use those resources.
$md$, 4),

('a1000002-0001-0001-0001-000000000006','content','Network Topologies',$md$
A network topology describes how the devices in a network are arranged and connected.

**Physical topology** — the actual physical layout of devices and cables.
**Logical topology** — how data actually flows through the network, which may differ from the physical arrangement.

### Point-to-Point
Two devices connected directly. Simple and always available for those two stations, but only those two can communicate directly.

### Star Topology
All devices connect to a central hub or switch.
- **Advantages:** failure of one link doesn't affect others; easier fault isolation; less cable than mesh.
- **Disadvantages:** if the central device fails, the entire network goes down; requires more cable than bus.

### Bus Topology
All devices share a single cable.
- **Advantages:** minimal cable; easy installation; no routing needed.
- **Disadvantages:** cable break disrupts the whole network; collisions occur when multiple devices transmit simultaneously.

### Ring Topology
Devices connect in a closed loop — each device connects to exactly two others.
- **Advantages:** less cable than mesh; relatively easy installation.
- **Disadvantages:** a break anywhere in the ring disrupts the whole network; slower for non-adjacent stations.

### Mesh Topology
Every device has a direct connection to every other device.
- **Advantages:** no contention for the medium; highly reliable; alternate paths available if one link fails; good security.
- **Disadvantages:** requires the most cable; most communication ports; most complex installation; highest cost.

### Tree Topology
A hierarchical structure with a root node at the top, branching downward through multiple levels via point-to-point links. The root is the only node with nothing above it.

### Hybrid Topology
Combines two or more of the topologies above. Inherits both the advantages and disadvantages of the topologies combined.
$md$, 5),

('a1000002-0001-0001-0001-000000000006','content','The Internet',$md$
The Internet is a global network of networks that allows any connected device to send and receive data from any other connected device.

### Brief Internet History

| Year | Event |
|---|---|
| 1962 | J.C.R. Licklider (MIT) envisioned a globally interconnected computer network |
| 1969 | ARPANET became operational, linking academic and research institutions |
| 1972 | First public demo of ARPANET; email introduced |
| 1983 | ARPANET adopted TCP/IP; LANs and workstations began proliferating |
| 1987 | Nearly 30,000 hosts on the Internet |
| 1995 | SSL encryption developed (enabling secure online transactions); Internet commercialized |

### The World Wide Web
The Web is a collection of interlinked multimedia documents stored on the Internet, accessed using HTTP. Each document is a web page; a collection of web pages is a website.

Sir Tim Berners-Lee invented the World Wide Web in 1989 and defined its three core technologies:
- **HTML** (HyperText Markup Language) — the formatting language for web pages.
- **URI/URL** (Uniform Resource Identifier/Locator) — a unique address identifying each resource on the web.
- **HTTP** (HyperText Transfer Protocol) — the protocol for retrieving linked resources across the web.

The World Wide Web Consortium (W3C), with about 350 member organizations, sets standards and guidelines for the web.
$md$, 6),

('a1000002-0001-0001-0001-000000000006','content','Key Internet Concepts',$md$
**IP Address** — a unique numerical label identifying every device on the Internet. IPv4 addresses consist of four groups of numbers (0–255) separated by dots. Example: `72.48.108.101`

**Domain Name** — a human-readable text name for an IP address. The Domain Name System (DNS) translates domain names to their corresponding IP addresses. Example: `www.google.com`

**URL (Uniform Resource Locator)** — the complete address of a specific resource on the web. Structure:
```
https://www.example.com/path/filename
```

**ISP (Internet Service Provider)** — a company that provides Internet access using connections such as dial-up, DSL, cable modem, or wireless.
$md$, 7),

('a1000002-0001-0001-0001-000000000006','content','Internet Protocols',$md$
**TCP/IP (Transmission Control Protocol / Internet Protocol)** — the foundational protocols of the Internet; manage how data is packaged, addressed, transmitted, and received.

**HTTP (HyperText Transfer Protocol)** — the protocol browsers and web servers use to exchange web pages and resources. Operates between client (browser) and server.

**HTTPS (HTTP Secure)** — an encrypted version of HTTP that protects data in transit from eavesdropping. Used for secure transactions (e.g., online banking, shopping).

**FTP (File Transfer Protocol)** — used for transferring files between systems interactively.

**SMTP (Simple Mail Transfer Protocol)** — handles the transmission of email messages and attachments.

**Intranet** — a private network using the same basic technologies as the Internet, accessible only to authorized members of an organization (e.g., employees).
$md$, 8),

('a1000002-0001-0001-0001-000000000006','activity','Practice Exercises — Unit VI',$md$
1. Differentiate LAN, MAN, WAN, and GAN with examples of each.
2. Compare peer-to-peer and client-server network models. When would you use each?
3. Describe the advantages and disadvantages of mesh topology.
4. Differentiate a ring topology from a star topology.
5. Explain the difference between the Internet and an intranet, and give examples of where intranets are used.
6. What is the role of DNS in the Internet?
7. Explain the difference between HTTP and HTTPS. Why does HTTPS matter?
$md$, 9);

-- ============================================================
-- UNIT VII: Trends and Issues in ICT
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a1000002-0001-0001-0001-000000000007','content','Current Trends in ICT',$md$
Technology in the 21st century has been shaped significantly by information and communication technology. ICT has become integral to business, government, education, and daily personal life.

### 1. Cloud Computing
Cloud computing means accessing computing services — software, storage, and processing power — over a network (typically the Internet) rather than running them locally on your own hardware.

Organizations adopt cloud computing to offload data management and back-end operations, letting their teams focus on higher-value work. Cloud services come in three broad forms:
- **IaaS (Infrastructure as a Service)** — virtual hardware (servers, storage, networking).
- **PaaS (Platform as a Service)** — a development environment in the cloud.
- **SaaS (Software as a Service)** — fully deployed applications accessible via a browser.

Key benefits: reduced IT infrastructure costs, virtualization of resources, easier software maintenance (no installation on each user's device). Key concerns: privacy, compliance, security, and governance.

### 2. Internet of Things (IoT)
The IoT refers to the network of physical objects embedded with sensors, software, and connectivity that allows them to collect and exchange data with other devices and systems over the Internet.

Examples range from micro-cameras that image the inside of the body, to sensors that monitor crop health on farms, to smart home devices that control lighting or temperature. The rapid drop in the cost of IoT components has allowed people and businesses to innovate at an unprecedented pace.

### 3. Mobile Applications
Mobile apps — software designed to run on smartphones, tablets, and similar devices — represent one of the most significant computing shifts of recent decades. They are distributed through platform app stores (Apple App Store, Google Play, etc.), with revenue shared between the app distributor and developer.

### 4. Human-Computer Interaction (HCI)
HCI is a multidisciplinary field studying how people interact with computers, with the goal of making that interaction as effective and natural as possible. It emerged in the 1980s alongside the rise of personal computing, and has expanded from desktop computers to mobile devices, wearables, voice interfaces, and beyond.

Research in HCI draws on computer science, cognitive science, and human-factors engineering. The aim is to make the human-computer dialogue feel less like operating a machine and more like a natural conversation.

### 5. Data Analytics
Analytics is the process of discovering patterns in data to support better decisions.
- **Data analytics** — converts raw data into actionable insights for decision-making.
- **Predictive analytics** — uses historical and current data to forecast future events.
- **Social media analytics** — helps organizations understand customer behavior and sentiment from social platform data.

### 6. Artificial Intelligence
AI brings together cloud computing resources (for scale), machine learning algorithms (for learning), and contextual data (from IoT or large datasets) to add intelligent behavior to technical systems. Companies are incorporating AI to manage more complex IT architectures and solve problems that would be impractical to address through traditional programming.

### 7. Data Security
As technology evolves faster, keeping systems secure becomes both more important and more difficult. Data security requires a combination of technical defenses, secure processes, and ongoing education. Organizations need to shift from purely technology-based defenses to a broader mindset that integrates technology, workflow design, and user awareness.
$md$, 1),

('a1000002-0001-0001-0001-000000000007','content','Key Issues in ICT',$md$
### 1. Data Privacy
Data privacy is concerned with how personal information is collected, stored, processed, and shared. It involves balancing the legitimate use of data against individuals' rights to control their own information.

The Philippines enacted the **Data Privacy Act of 2012 (Republic Act No. 10173)** to protect personal information. Key principles include ensuring the integrity, confidentiality, and availability of personal data and limiting who can access it.

### 2. Cybersecurity
Cyberattacks are growing in both scale and sophistication. Organizations that fail to protect data risk losing customers: studies show significant percentages of users would switch providers after a data breach.

The shortage of qualified cybersecurity professionals is a compounding challenge. Many organizations find cybersecurity the hardest IT role to hire for. A long-term solution is investing in training and developing current IT staff into cybersecurity specialists, rather than relying entirely on external hiring.

In the Philippines, the **Cybercrime Prevention Act (Republic Act No. 10175)** provides the legal framework for addressing online crimes.
$md$, 2),

('a1000002-0001-0001-0001-000000000007','activity','Practice Exercises — Unit VII',$md$
1. What new technology in the next 10 years do you think will most disrupt the global IT industry? Explain your reasoning.
2. Describe how cloud computing is being applied in education. What are the benefits and risks for students?
3. Give three examples of IoT devices and explain what data they collect and what they do with it.
4. Give a recent example of a major cybersecurity incident (local or international). What was the impact and how was it addressed?
5. Explain what data privacy means to you personally. What personal data do you share online (e.g., through social media) and what are the risks?
6. Why do you think access to accurate and verified information is especially important in today's environment?
$md$, 3);

-- ============================================================
-- UNIT VIII: Special Interest Topics in ICT
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a1000002-0001-0001-0001-000000000008','content','Part 1 — Artificial Intelligence',$md$
### What Is Artificial Intelligence?

Artificial Intelligence (AI) refers to the design and development of computer systems that can perform tasks typically associated with human intelligence — reasoning, recognizing patterns, learning from experience, understanding natural language, and making decisions.

John McCarthy, widely credited as one of AI's founding figures, defined it as "the science and engineering of making intelligent machines."

Other working definitions:
- A branch of computer science concerned with simulating intelligent behavior.
- The capability of a machine to replicate human-like cognitive tasks.
- Systems able to handle tasks like visual recognition, speech understanding, language translation, and decision-making.

### Milestones in AI History

| Year | Event |
|---|---|
| 1943 | Warren McCulloch and Walter Pitts proposed the first mathematical model of artificial neurons. |
| 1949 | Donald Hebb described a learning rule for updating neuron connection strengths — now called Hebbian learning. |
| 1950 | Alan Turing published a test for machine intelligence — later called the Turing Test. |
| 1955 | Allen Newell and Herbert A. Simon created the "Logic Theorist," the first AI program. |
| 1956 | John McCarthy coined the term "Artificial Intelligence" at the Dartmouth Conference. |
| 1966 | Joseph Weizenbaum created ELIZA, the first chatbot. |
| 1972 | WABOT-1, the first intelligent humanoid robot, was built in Japan. |
| 1974–1980 | First "AI winter" — funding and interest declined due to unmet expectations. |
| 1980 | Expert systems revived AI; first US national AI conference held at Stanford. |
| 1987–1993 | Second "AI winter" — costs exceeded results, funding dropped again. |
| 1997 | IBM's Deep Blue beat world chess champion Garry Kasparov. |
| 2002 | Roomba, the first AI-based consumer robot vacuum, launched. |
| 2011 | IBM's Watson won Jeopardy!, demonstrating natural language understanding. |
| 2014 | Chatbot "Eugene Goostman" passed the Turing Test in a competition. |
| 2018 | IBM's "Project Debater" argued complex topics against human debaters; Google Duplex made real phone calls on behalf of users. |

### Applications of AI

AI is being applied across virtually every sector:

- **Healthcare** — AI systems analyze patient data to generate diagnostic hypotheses (e.g., IBM Watson Health).
- **Finance** — fraud detection, algorithm-driven trading, chatbots for customer service.
- **Business** — robotic process automation, CRM analytics, customer-facing chatbots.
- **Education** — automated grading, adaptive learning systems that adjust to each student's pace.
- **Automotive** — self-driving car systems using radar, cameras, and LiDAR to perceive and navigate the environment.
- **Gaming** — AI opponents that think ahead and adapt to player behavior.
- **Data Security** — AI-driven systems that detect software vulnerabilities and cyberattacks in real time.
- **Social Media** — content organization, trend identification, and personalized feed curation for billions of profiles.
- **Travel** — AI chatbots for booking, route recommendations, and real-time travel assistance.
- **Robotics** — intelligent humanoid robots (e.g., Sophia) capable of autonomous, experience-based learning.
- **Entertainment** — recommendation systems on streaming platforms (Netflix, Amazon) powered by ML algorithms.
$md$, 1),

('a1000002-0001-0001-0001-000000000008','content','Machine Learning',$md$
Machine learning (ML) is a subset of AI in which computer systems learn to perform tasks by building models from data, without being explicitly programmed with rules for each situation.

A machine learning algorithm improves its performance on a task (T), as measured by a performance metric (P), through accumulated experience (E).

### Categories of Machine Learning

**Supervised Learning** — the algorithm is trained on labeled examples (input paired with the correct output). The goal is to learn a general rule that maps new inputs to outputs. Example: training a spam filter on emails labeled "spam" or "not spam."

**Unsupervised Learning** — no labels are provided. The algorithm finds structure or patterns in the data on its own. Example: grouping customers into segments based on purchasing behavior without predefined categories.

**Reinforcement Learning** — the algorithm interacts with an environment and receives feedback (rewards or penalties) based on its actions. It learns to maximize rewards over time. Example: teaching a program to play a game by rewarding it for winning moves.
$md$, 2),

('a1000002-0001-0001-0001-000000000008','content','Deep Learning',$md$
Deep learning is a subset of machine learning that uses multi-layered artificial neural networks — structures loosely inspired by biological neurons in the brain. Data flows through multiple layers, with each layer transforming the output of the previous one. The deeper the network, the more abstract the patterns it can detect.

Key characteristics:
- Networks can process enormous amounts of unstructured or unlabeled data.
- Accuracy typically improves as more data is processed — the network "learns" from its results.
- Hidden layers perform the mathematical transformations that convert raw input into meaningful output.

Deep learning powers many of the most impressive modern AI applications: image recognition, speech recognition, language translation, and autonomous driving.
$md$, 3),

('a1000002-0001-0001-0001-000000000008','content','Part 2 — Data Science',$md$
### What Is Data Science?

Data science combines statistics, computer programming, and domain expertise to extract useful knowledge from large, complex datasets — especially from "big data." It supports decision-making by turning unstructured, high-volume data into actionable insights.

Data is generated from countless sources: mobile phones, social media, e-commerce platforms, healthcare systems, search engines, and more. As the volume of data grew, traditional analysis methods became insufficient — giving rise to data science as a distinct professional discipline.

### What Is Big Data?

Big data refers to datasets so large, fast-moving, and varied that conventional data-processing tools cannot handle them. It is characterized by three V's:
- **Volume** — the sheer amount of data.
- **Velocity** — the speed at which data is generated and collected.
- **Variety** — the diversity of data types and sources (text, images, video, sensor readings, etc.).

Companies that successfully harness big data — Amazon, Google, Facebook, Twitter — use it to gain competitive advantages and serve users better.

### Brief History of Data Science

- **1962** — John Tukey wrote that data analysis should be treated as an empirical science.
- **1974** — Peter Naur defined "data science" as the discipline of working with data after it has been collected.
- **1989** — First Knowledge Discovery in Databases (KDD) workshop organized.
- **1997** — Professor C.F. Jeff Wu proposed that "statistics" be renamed "data science."
- **2009** — Google's Chief Economist described the ability to understand and extract value from data as a critical skill for the coming decades.
- **2012** — "Data Scientist: The Sexiest Job of the 21st Century" published in the Harvard Business Review.

### The Data Scientist

A data scientist collects, analyzes, and interprets very large amounts of data to support business and research decisions. The role combines skills from mathematics, statistics, computer science, and domain knowledge.

Core responsibilities include:
- Asking the right data-centric questions.
- Cleaning and processing raw data.
- Applying statistical analysis and machine learning to uncover patterns.
- Communicating findings to stakeholders.

Data scientists are critical to organizations pursuing machine learning and AI adoption because they customize algorithms, make sense of complex datasets, and guide data-driven decisions.
$md$, 4),

('a1000002-0001-0001-0001-000000000008','content','Part 3 — Social Networking and Society',$md$
### What Is Social Networking?

A social networking service is an online platform where people build networks and relationships with others who share similar interests, backgrounds, or real-life connections. These platforms let users share ideas, photos, videos, and updates — connecting people globally in ways previously impossible.

### Major Social Media Platforms

- **Facebook** — the largest social network by monthly active users (2.3+ billion as of recent data). Widely used by individuals and businesses alike for communication and marketing.
- **Twitter** — a micro-blogging platform centered on short posts; used for news, commentary, and real-time communication.
- **YouTube** — the dominant video-sharing platform; the second most-used search engine globally.
- **Instagram** — image and video-focused platform owned by Meta; widely used for lifestyle, fashion, travel, and brand content.
- **TikTok** — a short-form video platform popular especially with younger audiences; known for viral, music-driven content.
- **WhatsApp** — a cross-platform instant messaging app used globally for personal and business communication.
- **Pinterest** — a visual discovery platform organized around "boards"; heavily used for design inspiration, recipes, and DIY content.
- **Reddit** — a community-based platform where users submit and vote on content; organized into topic-specific communities ("subreddits").
- **Snapchat** — an image and video messaging app where content disappears after viewing; popular among younger users.
- **Tumblr** — a microblogging platform supporting multiple post formats (text, images, video, audio).
- **Flickr** — an image and video hosting platform popular with photographers.

### Impact of Social Media on Society

Research shows that social media has produced significant effects — both positive and negative — on individuals and society.

**Positive effects:**
- **Connectivity** — enables communication with people anywhere in the world regardless of geography.
- **Education** — experts can teach and share knowledge freely across borders.
- **Community** — brings together people with shared interests or identities who might never meet otherwise.
- **Information** — rapid access to news and current events.
- **Advertising** — cost-effective way for businesses of all sizes to reach large audiences.
- **Charitable causes** — effective for fundraising and organizing support for those in need.

**Negative effects:**
- **Cyberbullying** — anonymity online makes harassment easier.
- **Hacking and privacy breaches** — personal information can be stolen or misused.
- **Addiction** — users may spend far more time than intended, reducing productivity.
- **Fraud and scams** — financial deception takes many forms online.
- **Reputation damage** — false information spreads quickly and can irreparably harm individuals or organizations.
- **Polarization** — research suggests social media may contribute to increased societal polarization by reinforcing existing beliefs.

Responsible use — strong passwords, limited sharing of personal details, critical evaluation of content, and setting time boundaries — can mitigate many of the negative effects.
$md$, 5),

('a1000002-0001-0001-0001-000000000008','activity','Practice Exercises — Unit VIII',$md$
**Artificial Intelligence:**
1. Explain the difference between AI, machine learning, and deep learning using your own words.
2. Describe one AI application in healthcare and one in education that were not mentioned above.
3. How does supervised learning differ from unsupervised learning? Give an example of each.
4. What is the Turing Test, and why is it significant?

**Data Science:**
1. What fields of knowledge come together in data science?
2. What are the three V's of big data? Give a real-world example illustrating each.
3. What kinds of data do you generate through your social media usage? Who benefits from that data and how?

**Social Networking:**
1. Choose three social media platforms and compare their primary purpose, typical user base, and main content format.
2. Based on available research, do you think the benefits of social media outweigh the harms? Support your answer with specific points.
3. Describe one positive and one negative effect of social media that you have personally observed or experienced.
$md$, 6);
