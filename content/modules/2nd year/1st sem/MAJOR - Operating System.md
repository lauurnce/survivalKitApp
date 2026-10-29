# Module 1: Introduction to Operating Systems
<!-- subject: Operating Systems | year: 2nd -->

<!-- kind: content -->
## Overview

An operating system sits between you, and every app you run, and the raw hardware of a computer. Every time you open a program, save a file, or plug in a USB drive, the OS is the thing translating that action into something the hardware can actually execute. This module covers what an OS is and does, how operating systems evolved across decades of computing history, the different categories of OS depending on what kind of machine they're built for, and the internal components that make an OS work.

<!-- kind: content -->
## What Exactly Is an Operating System?

At its core, an operating system is the software that manages everything else on a computer, the hardware (CPU, memory, storage, input/output devices) and the other software running on top of it. It's the layer that turns a collection of electronic components into something a person can actually use.

Two things make this possible:

- **It talks to hardware so applications don't have to.** Apps don't send instructions directly to your disk or your RAM, they go through the OS via an application programming interface (API), and the OS translates those requests into whatever the hardware needs.
- **It gives people a way in.** Whether that's a command line where you type instructions, or a graphical interface with windows and icons, the OS is what you're actually interacting with, not the bare hardware.

Without an OS, a computer is just inert hardware. None of the software you depend on, browsers, office apps, games, could run, because nothing would load them into memory, give them CPU time, or let them talk to the screen, keyboard, or storage.

<!-- kind: content -->
## What Does an OS Actually Do? (Core Responsibilities)

An OS is constantly juggling multiple programs, deciding what runs when, and making sure everything gets a fair (and safe) share of the machine's resources. Its responsibilities break down roughly like this:

### Memory management
The OS keeps a running record of which parts of memory are in use and which are free. When a program starts, the OS finds it space; when the program ends, or pauses to wait on I/O, that space is reclaimed. In systems running several programs at once, the OS also decides the order in which processes get memory access and for how long.

A useful comparison here is primary memory (RAM) versus secondary storage:

| | RAM (Primary Memory) | Secondary Storage |
|---|---|---|
| Persistence | Temporary, cleared on power-off | Permanent |
| Typical capacity | Measured in MB–GB | Measured in GB–TB |
| Volatility | Volatile | Non-volatile |
| Speed | Fast | Slower |
| Role | Holds actively running programs and data | Long-term files, installed programs, the OS itself |

### Processor (CPU) management
Deciding *which* process gets the CPU, *when*, and *for how long* is called process scheduling. This involves keeping track of each process's status, handing the CPU to a process when its turn comes, and reclaiming the CPU once that turn ends or the process finishes.

### Device management
The OS talks to hardware devices through drivers, software written specifically for each device. For every connected device, the OS tracks its status, decides which process gets to use it and for how long, allocates it efficiently, and frees it once it's no longer needed.

### File management
Files live inside directories, which can themselves be nested inside other directories. The OS tracks where every file is, what it contains, who's allowed to access it, and its current status, while handling the allocation and release of storage space as files are created, edited, or deleted.

### Security
Because your data shares a machine with other processes, and sometimes other users, the OS enforces who's allowed to read, write, or delete what, typically through accounts, passwords, and permission systems, to prevent unauthorized access or tampering.

### Performance monitoring
The OS keeps track of how long it takes between a request being made and the system responding, which helps surface slowdowns or bottlenecks.

### Job accounting
On systems shared by multiple users, university labs, cloud servers, the OS records how much CPU time, memory, or storage each job or user consumes, which is useful for billing, auditing, or simply understanding usage patterns.

### Error detection and debugging support
When something goes wrong, the OS captures the diagnostic information needed to track down the problem later, error messages, memory dumps, execution traces.

### Coordinating software and users
On systems with many users and many development tools (compilers, interpreters, assemblers), the OS manages how those tools are assigned and shared.

<!-- kind: content -->
## The Two Big-Picture Goals of an OS

Everything above ultimately serves two overarching goals:

1. **Make the computer convenient to use**, this matters most on personal devices, where the user experience is the priority.
2. **Use the hardware efficiently**, this matters most when a machine is shared among many users or processes, where every wasted CPU cycle or byte of memory costs everyone.

These two goals can pull in opposite directions, and different operating systems have historically leaned one way or the other. Windows has traditionally prioritized convenience, a smooth, approachable experience, even at some cost to efficiency. UNIX-family systems, having grown up in multi-user, shared-machine environments, have traditionally leaned toward squeezing the most out of available hardware.

<!-- kind: content -->
## A Short History of Operating Systems

Before there were operating systems, there was barely "computing" as we'd recognize it. English mathematician Charles Babbage designed a mechanical computing device known as the Analytical Engine in the 1800s, slow and unreliable by modern standards, and never fully built in his lifetime, but often pointed to as the conceptual ancestor of the modern computer. From there, OS history is usually told in four generations, tracking alongside the hardware of each era.

### Generation 1 (1940s – early 1950s): No OS needed
The earliest electronic computers ran on vacuum tubes and had no operating system at all. Programming was done directly in machine language, sometimes by physically rewiring plugboards to configure the machine for a specific task. Because these machines were built for straightforward numeric calculations performed one at a time, there was no real need for an OS to coordinate multiple programs or users.

### Generation 2 (mid-1950s – mid-1960s): Transistors and batch processing
Transistors replaced vacuum tubes, making computers smaller, more reliable, and more powerful. This era saw some of the earliest operating-system-like software appear, General Motors built one of the first (commonly referred to as GMOS) for IBM mainframes, and the FORTRAN Monitor System emerged around the same time.

This generation is best known for **batch processing**: programs were written on paper, punched onto cards, and handed to an operator. Jobs with similar requirements were grouped into "batches" and run one after another with minimal human intervention, a single-stream batch processing system. High-level languages like FORTRAN and COBOL appeared toward the end of this era, and processing speed jumped from the millisecond range into microseconds.

### Generation 3 (mid-1960s – 1980): Integrated circuits and multiprogramming
Integrated circuits, many transistors on a single chip, defined this generation, pushing computers to be faster, smaller, and more reliable still.

The major OS breakthrough here was **multiprogramming**: keeping several programs in memory simultaneously and switching the CPU between them, so it's rarely sitting idle while one program waits on I/O. This was a huge efficiency gain.

This era also saw affordable minicomputers, DEC's PDP line being the most famous, bring computing power within reach of smaller organizations for the first time. And in 1969, the first version of UNIX appeared. Written in C, it was portable across different hardware in a way earlier systems weren't, which helped it spread quickly.

### Generation 4 (1980 – present): Personal computers and graphical interfaces
This is the generation most people recognize. Personal computers became affordable enough for individuals, not just institutions, to own. IBM partnered with Microsoft to put DOS, later MS-DOS, on its PCs, and it quickly dominated the early PC market, though it was entirely text-based.

The graphical user interface (GUI), icons, windows, menus, a mouse, originated from research at Xerox PARC, was popularized commercially by Apple's Macintosh, and was later adopted by Microsoft for Windows. From the mid-1980s onward, network and distributed operating systems also became increasingly common as machines were connected together rather than operating in isolation.

<!-- kind: content -->
## Types of Operating Systems

Not every OS is built the same way, the right design depends heavily on what the machine is for.

### Batch OS
There's no real-time interaction between user and computer. An operator collects jobs with similar requirements, groups them into "batches," and runs them sequentially without further input, payroll runs and bank statement generation are classic examples.

- **Strengths:** Efficient for large amounts of repetitive work; multiple users can share the same system; little idle time once a batch is running.
- **Weaknesses:** Hard to predict how long any individual job will take; difficult to debug; one failed job can hold up everything queued behind it.

### Time-Sharing OS
Also called a **multitasking** system. Each task gets a small, fixed slice of CPU time, a **quantum**, before control passes to the next task. Because these slices are so short, it *feels* like everything is running at once, even on a single CPU. Tasks can come from one user or be spread across many. UNIX and Multics are classic examples.

- **Strengths:** Every task gets a fair share of the CPU; CPU idle time is reduced; less duplicated software since users share the same system.
- **Weaknesses:** Reliability concerns; security and data integrity need careful handling since multiple users/programs share resources; inter-process communication adds overhead.

### Distributed OS
Several independent computers, each with its own CPU and memory, are connected over a network and can communicate, share files, and access each other's resources. Because each machine can largely run on its own, these are described as **loosely coupled** systems. LOCUS is a classic example.

- **Strengths:** One machine failing doesn't take down the others; shared resources speed up computation; easy to scale by adding more machines; reduces load on any single host.
- **Weaknesses:** If the network itself fails, communication between all the machines stops; the standards and protocols involved are less mature than for standalone systems; the hardware tends to be expensive.

### Network OS
A server manages users, data, applications, and shared resources (files, printers, etc.) for a small private network of client machines. Because everyone on the network needs to be aware of everyone else's configuration for things to run smoothly, these are described as **tightly coupled** systems. Examples include Windows Server, and general-purpose systems like UNIX, Linux, or macOS configured to serve a network.

- **Strengths:** Centralized, stable servers; security handled centrally; new hardware and technology are easier to roll out network-wide; remote access from different locations is possible.
- **Weaknesses:** Server hardware is costly; everything depends on that central server; ongoing maintenance and updates are required.

### Real-Time OS (RTOS)
Built for systems where the gap between receiving an input and producing the right response, the **response time**, is critical. Air traffic control, networked multimedia, and industrial command-and-control systems are typical examples. RTOS comes in two flavors:

- **Hard real-time:** Missing a deadline isn't just inconvenient, it's a failure, potentially a dangerous one. Automatic airbags and missile guidance systems fall here, where even the shortest delay is unacceptable. Virtual memory is essentially never used, since it introduces unpredictable delays.
- **Soft real-time:** Deadlines matter, but occasionally missing one is tolerable, the system degrades a bit rather than failing outright. Personal computers, audio, and video systems are typical examples.

| | Hard Real-Time | Soft Real-Time |
|---|---|---|
| Response time | Mandatory | Best-effort |
| Performance under peak load | Predictable | May degrade |
| What sets the pace | The environment | The computer itself |
| Safety implications | Often critical | Usually non-critical |
| Typical data file size | Small to medium | Large |
| Error recovery | Mostly automatic | May need user input |
| Data integrity window | Short-term | Long-term |

- **Strengths:** Maximizes use of devices and resources; very fast task-switching; tightly focused on the active task rather than queued ones; small footprint suits embedded systems; low error rates; efficient memory allocation.
- **Weaknesses:** Only a small number of tasks can realistically run at once; can require expensive resources; scheduling algorithms are complex; needs specialized device drivers and interrupt handling; thread priority is inflexible since the system avoids unnecessary task-switching.

### Handheld / Embedded OS
Built to run on devices with limited processing power, memory, and battery life, phones, PDAs, and similar gadgets. Palm OS, Symbian, and mobile builds of Linux or Windows are typical examples.

- **Strengths:** Lets users carry their work with them; cheaper overall since fewer resources are needed; doesn't depend on a constant external power source.
- **Weaknesses:** Limited memory means the OS has to manage it carefully; many handheld devices don't support virtual memory at all, so developers work within strict physical memory limits; faster processors draw more power, so processor speed is capped by what the battery can sustain.

<!-- kind: content -->
## The Building Blocks Inside an OS

Beyond its responsibilities, an OS is made up of distinct internal components, each handling a specific slice of the system:

### Shell
The user-facing layer, literally the "outer shell" wrapping the OS core, comes in two main styles:

- **GUI (Graphical User Interface):** windows, icons, buttons, and visual elements you interact with using a mouse or touch.
- **CLI (Command Line Interface):** a text-based interface where you type commands directly and the system executes them.

### Memory manager
Tracks which portions of RAM are allocated and which are free, allocates memory to processes that request it after verifying the request is valid, and reclaims that memory once it's no longer needed. It also protects memory so processes can't overwrite memory belonging to something else.

### Process manager
Handles process scheduling, deciding which process gets the CPU next, and keeps track of every process's status. It manages how processes share information, protects each process's resources from interference by others, and coordinates synchronization between processes. It operates at two levels: managing jobs as they enter the system, and managing the individual processes within those jobs.

### Security manager
Protects the system from unauthorized processes, applications, or users trying to access things they shouldn't.

### Secondary storage manager
Manages data that lives outside RAM, on disks or other persistent storage, that can be read, written, and manipulated as needed.

### Device manager
Controls how the OS interacts with peripherals like the mouse, monitor, and printers. When you save a file or print a document, this is the component instructing the right device driver to carry it out. It also handles allocating and freeing devices as processes need them.

### File system manager
Responsible for everything you do with files, creating, renaming, copying, moving, deleting, plus backup and recovery, along with allocating and freeing the storage space those files occupy.

---

<!-- kind: activity -->
## Activity 1: Sort These by Generation

For each item below, identify which generation of computing (First, Second, Third, or Fourth) it belongs to:

- Vacuum tubes, with no operating system at all
- Plugboards used to configure machine operations
- Punch cards and single-stream batch processing
- GMOS, one of the earliest operating-system-like programs
- The rise of multiprogramming
- DEC's PDP line of minicomputers
- The first version of UNIX, written in C
- Personal computers becoming widely affordable
- MS-DOS dominating the early PC market
- The graphical user interface (GUI) going mainstream

<!-- kind: activity -->
## Activity 2: Match the Description to the OS Type

Choices: (A) Batch OS, (B) Time-Sharing OS, (C) Distributed OS, (D) Network OS, (E) Real-Time OS, (F) Handheld OS

For each description, write the letter of the OS type it best matches:

1. Also referred to as a multitasking system.
2. A payroll system is a typical real-world example.
3. Made up of several independent, interconnected computers communicating over a shared network.
4. Described as "loosely coupled" because its components are largely independent of one another.
5. Described as "tightly coupled" because users need to be aware of each other's configurations.
6. Palm OS is an example of this type.
7. Built specifically for devices with limited processing power and memory.
8. Windows Server is an example of this type.
9. An operator groups similar jobs together before processing them.
10. Used where time constraints are extremely strict and cannot be missed.

<!-- kind: activity -->
## Activity 3: Hard vs. Soft Real-Time Examples

Fill in the table with at least three real-world examples for each category.

| # | Hard Real-Time OS Example | Soft Real-Time OS Example |
|---|---|---|
| 1 | | |
| 2 | | |
| 3 | | |
