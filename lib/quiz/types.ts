// Shared contract between the quiz generator (lib/quiz/generate.ts), the
// API route (app/api/quiz/route.ts), and the UI (components/account/ReviewQuiz.tsx).

/** Where a question came from, so feedback can point back to the lesson. */
export interface SourceRef {
  subjectTitle: string;
  moduleTitle: string;
}

/** A sentence with one term blanked out; the student types the term. */
export interface FillBlankQuestion {
  kind: "fill-blank";
  /** Sentence with the answer replaced by "_____". */
  prompt: string;
  answer: string;
  context: SourceRef;
}

/** A definition shown with four candidate terms; the student picks one. */
export interface MultiChoiceQuestion {
  kind: "multi-choice";
  prompt: string;
  options: string[];
  answerIndex: number;
  context: SourceRef;
}

/** A code snippet with one token blanked out; the student types the token. */
export interface CodeBlankQuestion {
  kind: "code-blank";
  /** Code with the answer replaced by "_____". */
  promptCode: string;
  language: string;
  answer: string;
  context: SourceRef;
}

export type QuizQuestion =
  | FillBlankQuestion
  | MultiChoiceQuestion
  | CodeBlankQuestion;

/** Response shape of GET /api/quiz. */
export interface QuizResponse {
  questions: QuizQuestion[];
  /** Present when questions is empty. */
  reason?: "no-progress" | "no-facts";
}

/** Case-insensitive, whitespace-tolerant answer check for typed answers. */
export function isAnswerCorrect(given: string, expected: string): boolean {
  return given.trim().toLowerCase() === expected.trim().toLowerCase();
}
