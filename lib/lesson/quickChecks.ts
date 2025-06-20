// Inline "Quick check" questions for the lessons readers actually open:
// CP1 Lessons 1–6, Intro to Computing Unit I and MMW Unit I (the 60-day
// traction leaders). Two recall questions each, answerable from that
// lesson's free notes alone, with the reason shown after any answer.
//
// Retrieval practice (answering, not rereading) is one of the best-supported
// study techniques, and the subject quizzes behind the dashboard are almost
// unused — so the questions come to the reader, inside the lesson, with no
// sign-up. Kept in code, not content/**, until the format proves itself; a
// `quick_check` section kind is the long-term home.

export interface QuickCheckQuestion {
  /** Stable within its module; never reuse an id for a different question. */
  id: string;
  prompt: string;
  /** Optional code shown under the prompt. */
  code?: string;
  choices: string[];
  /** Index into `choices`. */
  answer: number;
  /** One or two sentences: why the answer is right. */
  why: string;
}

const CP1 = "a1000001-0001-0001-0001-00000000000";

export const QUICK_CHECKS: Readonly<Record<string, readonly QuickCheckQuestion[]>> = {
  // CP1 Lesson 1: Programming Concepts
  [`${CP1}1`]: [
    {
      id: "flowchart-decision",
      prompt: "In a flowchart, which shape marks a decision with TRUE and FALSE paths?",
      choices: ["Rectangle", "Diamond", "Parallelogram", "Oval"],
      answer: 1,
      why: "A diamond is a decision. Rectangles are processes, parallelograms are input/output, ovals are start/stop.",
    },
    {
      id: "logic-error",
      prompt: "Your program compiles and runs, but prints the wrong total. What kind of error is that?",
      choices: ["Syntax error", "Logic error", "Compile-time error", "No error"],
      answer: 1,
      why: "The compiler only catches syntax errors. Code that runs but gives wrong results has a logic error, which only testing finds.",
    },
  ],
  // CP1 Lesson 2: Introduction to C
  [`${CP1}2`]: [
    {
      id: "integer-division",
      prompt: "What do these print in C?",
      code: "printf(\"%d %d\", 11 / 2, 11 % 2);",
      choices: ["5.5 and 1", "5 and 1", "6 and 1", "5 and 0"],
      answer: 1,
      why: "Integer division truncates, so 11 / 2 is 5, and % gives the remainder, 1.",
    },
    {
      id: "postfix-increment",
      prompt: "After this runs, what are x and y?",
      code: "int x = 10;\nint y = x++;",
      choices: ["x = 11, y = 11", "x = 10, y = 11", "x = 11, y = 10", "x = 10, y = 10"],
      answer: 2,
      why: "Postfix x++ hands over the old value first (y = 10), then increments x to 11. Prefix ++x would give 11 to both.",
    },
  ],
  // CP1 Lesson 3: Input/Output and Program Structure
  [`${CP1}3`]: [
    {
      id: "scanf-ampersand",
      prompt: "Which line correctly reads an integer into num?",
      choices: ['scanf("%d", num);', 'scanf("%d", &num);', 'scanf(&num, "%d");', 'printf("%d", &num);'],
      answer: 1,
      why: "scanf needs the variable's address, so & goes before each variable (arrays like a string name are the exception).",
    },
    {
      id: "double-specifier",
      prompt: "Which conversion specifier reads a double with scanf?",
      choices: ["%d", "%f", "%lf", "%c"],
      answer: 2,
      why: "%lf is for double; %f is for float, %d for int and %c for a single character.",
    },
  ],
  // CP1 Lesson 4: Program Control Structures
  [`${CP1}4`]: [
    {
      id: "continue",
      prompt: "Inside a loop, what does continue do?",
      choices: [
        "Exits the loop completely",
        "Skips the rest of this iteration and starts the next one",
        "Restarts the loop from its first iteration",
        "Ends the program",
      ],
      answer: 1,
      why: "continue jumps to the next iteration. break is the one that exits the innermost loop (or a switch).",
    },
    {
      id: "equality",
      prompt: "Which operator compares two values for equality in an if condition?",
      choices: ["=", "==", "!=", "=>"],
      answer: 1,
      why: "== compares. A single = assigns, which compiles but quietly changes the variable — a classic logic error.",
    },
  ],
  // CP1 Lesson 5: Arrays
  [`${CP1}5`]: [
    {
      id: "last-index",
      prompt: "For int scores[10];, what is the index of the last element?",
      choices: ["10", "9", "11", "1"],
      answer: 1,
      why: "C arrays start at index 0, so ten elements run from scores[0] to scores[9].",
    },
    {
      id: "same-type",
      prompt: "Which statement about a C array is true?",
      choices: [
        "Its elements can mix ints and chars",
        "Its size can grow while the program runs",
        "All its elements share one data type and sit in contiguous memory",
        "Its first element is at index 1",
      ],
      answer: 2,
      why: "An array is a fixed-size run of same-type elements in contiguous memory, reached by one name plus an index from 0.",
    },
  ],
  // CP1 Lesson 6: Functions
  [`${CP1}6`]: [
    {
      id: "call-by-value",
      prompt: "A function changes its int parameter. Called by value, does the caller's variable change?",
      choices: [
        "Yes, always",
        "No — the function received a copy",
        "Only if the function returns it",
        "Only for global variables",
      ],
      answer: 1,
      why: "Call by value passes a copy, so the caller's variable is untouched. Call by reference passes its address, so changes stick.",
    },
    {
      id: "void-return",
      prompt: "What return type does a function that returns nothing have?",
      choices: ["int", "null", "void", "empty"],
      answer: 2,
      why: "void means no value is returned.",
    },
  ],
  // Intro to Computing, Unit I: Overview of ICT
  "a1000002-0001-0001-0001-000000000001": [
    {
      id: "peopleware",
      prompt: "Which element of a computer system refers to the people who build, operate and use it?",
      choices: ["Hardware", "Software", "Peopleware", "Firmware"],
      answer: 2,
      why: "Peopleware is the human element — often called the most critical, since hardware and software do nothing without people.",
    },
    {
      id: "data-vs-information",
      prompt: "Raw, unorganized facts are called…",
      choices: ["Information", "Data", "Knowledge", "Output"],
      answer: 1,
      why: "Data is raw facts; information is data that has been processed into something meaningful.",
    },
  ],
  // Mathematics in the Modern World, Unit I: Patterns and Numbers in Nature
  "a2000001-0001-0001-0002-000000000001": [
    {
      id: "fibonacci-next",
      prompt: "What comes next in the Fibonacci sequence 1, 1, 2, 3, 5, 8, 13, …?",
      choices: ["18", "20", "21", "26"],
      answer: 2,
      why: "Each term is the sum of the two before it: 8 + 13 = 21.",
    },
    {
      id: "golden-ratio",
      prompt: "The ratio of consecutive Fibonacci terms approaches the golden ratio, which is about…",
      choices: ["1.414", "1.618", "2.718", "3.142"],
      answer: 1,
      why: "φ = (1 + √5) / 2 ≈ 1.618. (1.414 is √2, 2.718 is e, 3.142 is π.)",
    },
  ],
};

/** This lesson's quick-check questions, or an empty list. */
export function quickChecksFor(moduleId: string): readonly QuickCheckQuestion[] {
  return QUICK_CHECKS[moduleId] ?? [];
}
