// Deterministic quiz generation from lesson markdown. Pure functions, no I/O:
// the API route (app/api/quiz/route.ts) fetches sections and calls buildQuiz.

import type {
  CodeBlankQuestion,
  QuizQuestion,
  SourceRef,
} from "./types";

/** What the API route passes in: one entry per content section. */
export interface SectionInput {
  bodyMd: string;
  subjectTitle: string;
  moduleTitle: string;
}

/** A bold term together with the (cleaned) sentence that defines/uses it. */
export interface TermFact {
  term: string;
  sentence: string;
}

/** A fenced code block that had an explicit language tag. */
export interface CodeFact {
  language: string;
  code: string;
}

export interface ExtractedFacts {
  terms: TermFact[];
  codeBlocks: CodeFact[];
}

// ── Seeded PRNG ────────────────────────────────────────────────────────────────

/** mulberry32 — tiny deterministic PRNG so the same seed yields the same quiz. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher–Yates shuffle driven by the seeded PRNG. Returns a new array. */
function shuffle<T>(items: T[], rnd: () => number): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Extraction ─────────────────────────────────────────────────────────────────

const MIN_TERM_LEN = 3;
const MAX_TERM_LEN = 40;
const MIN_CODE_LINES = 2;
const MAX_CODE_LINES = 15;

/** Language tags whose comment style is not `//`-family. */
const COMMENT_PREFIXES: Record<string, string[]> = {
  python: ["#"],
  py: ["#"],
  sql: ["--"],
};
const DEFAULT_COMMENT_PREFIXES = ["//", "/*", "*"];

/**
 * Tokens a student who studied the lesson can plausibly recall: language
 * keywords and bread-and-butter library names. Arbitrary one-off variable
 * names ("ch1") are only blanked when they repeat within the block, where
 * the other occurrences give the answer away.
 */
const KNOWN_TOKENS: Record<string, string[]> = {
  c: [
    "int", "char", "float", "double", "long", "short", "void", "return",
    "if", "else", "while", "for", "do", "switch", "case", "default",
    "break", "continue", "struct", "sizeof", "const", "include", "define",
    "main", "printf", "scanf", "getchar", "putchar", "stdio", "stdlib",
    "string", "math", "strlen", "strcpy", "strcmp", "strcat", "sqrt", "pow",
  ],
  java: [
    "int", "char", "float", "double", "long", "short", "void", "return",
    "if", "else", "while", "for", "do", "switch", "case", "default",
    "break", "continue", "class", "public", "private", "static", "final",
    "new", "this", "extends", "implements", "import", "main", "String",
    "System", "out", "println", "print", "Scanner", "boolean",
  ],
  python: [
    "def", "return", "if", "elif", "else", "while", "for", "in", "range",
    "print", "input", "len", "int", "str", "float", "list", "dict", "set",
    "True", "False", "None", "import", "from", "class", "self", "lambda",
    "and", "not", "break", "continue", "pass", "append",
  ],
  sql: [
    "SELECT", "FROM", "WHERE", "INSERT", "INTO", "VALUES", "UPDATE", "SET",
    "DELETE", "CREATE", "TABLE", "ALTER", "DROP", "JOIN", "INNER", "LEFT",
    "RIGHT", "ORDER", "GROUP", "HAVING", "DISTINCT", "COUNT", "SUM", "AVG",
    "MIN", "MAX", "PRIMARY", "FOREIGN", "KEY", "NOT", "NULL", "AND",
  ],
};
KNOWN_TOKENS.py = KNOWN_TOKENS.python;

function isSkippableTerm(term: string): boolean {
  if (term.length < MIN_TERM_LEN) return true;
  if (term.length > MAX_TERM_LEN) return true;
  if (/^[\d\s.,%]+$/.test(term)) return true; // purely numeric
  if (term.endsWith(":")) return true; // header-as-bold
  return false;
}

/**
 * A term the student can reasonably type as an answer: words, digits,
 * spaces, hyphens, slashes, apostrophes. Terms with symbols ("true = any
 * non-zero value") stay in the pool for multi-choice but never become
 * typed fill-blanks.
 */
function isTypeableTerm(term: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9 '\-\/+#.]*$/.test(term);
}

/**
 * Parse one section's markdown into raw quiz material: bold-term/sentence
 * pairs and language-tagged code blocks. Tables, headings, blockquotes and
 * untagged ``` blocks are skipped. Defensive: malformed markdown just yields
 * fewer facts, never throws.
 */
export function extractFacts(bodyMd: string): ExtractedFacts {
  const lines = bodyMd.split(/\r?\n/);
  const codeBlocks: CodeFact[] = [];
  const textLines: string[] = [];

  // Pass 1 — pull out fenced code blocks so their contents are never
  // mistaken for prose. Only blocks with a language tag become code facts.
  let inFence = false;
  let fenceLang = "";
  let fenceLines: string[] = [];
  for (const line of lines) {
    const fence = line.match(/^\s*```(.*)$/);
    if (fence) {
      if (!inFence) {
        inFence = true;
        fenceLang = fence[1].trim().toLowerCase();
        fenceLines = [];
      } else {
        inFence = false;
        if (
          fenceLang &&
          fenceLines.length >= MIN_CODE_LINES &&
          fenceLines.length <= MAX_CODE_LINES
        ) {
          codeBlocks.push({ language: fenceLang, code: fenceLines.join("\n") });
        }
      }
      continue;
    }
    if (inFence) {
      fenceLines.push(line);
    } else {
      textLines.push(line);
    }
  }

  // Pass 2 — hunt sentences containing **bold terms** in the remaining prose.
  const terms: TermFact[] = [];
  for (const raw of textLines) {
    const line = raw.trim();
    if (!line || !line.includes("**")) continue;
    if (line.startsWith("#") || line.startsWith(">") || line.startsWith("|")) {
      continue; // heading, blockquote, table row
    }

    // "**1. Sequential** — ..." → strip the numbering (keeps "Sequential" and
    // avoids the sentence splitter breaking at "1."); "- **Source code** — ..."
    // → strip the list marker so it doesn't leak into prompts.
    const normalized = line
      .replace(/^[-*+]\s+/, "")
      .replace(/\*\*\s*\d+[.)]\s+/g, "**");

    for (const sentence of normalized.split(/(?<=[.!?])\s+/)) {
      const cleaned = sentence.replace(/\*\*/g, "").trim();
      for (const match of sentence.matchAll(/\*\*([^*]+)\*\*/g)) {
        const term = match[1].trim().replace(/^\d+[.)]\s*/, "");
        if (isSkippableTerm(term)) continue;
        terms.push({ term, sentence: cleaned });
      }
    }
  }

  return { terms, codeBlocks };
}

// ── Question building ──────────────────────────────────────────────────────────

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Replace every occurrence of the term (case-insensitive) with the blank. */
function blankTerm(sentence: string, term: string): string {
  return sentence.replace(new RegExp(escapeRegExp(term), "gi"), "_____");
}

interface CodeCandidate extends CodeFact {
  context: SourceRef;
}

/**
 * Blank one meaningful token (identifier/keyword, length >= 3) in a code
 * block. Skips comment lines and string-literal contents; the blank replaces
 * exactly one occurrence so restoring the answer reproduces the original.
 */
function makeCodeBlank(
  cand: CodeCandidate,
  rnd: () => number,
): CodeBlankQuestion | null {
  const lines = cand.code.split("\n");
  const commentPrefixes =
    COMMENT_PREFIXES[cand.language] ?? DEFAULT_COMMENT_PREFIXES;

  const tokens: { line: number; col: number; text: string }[] = [];
  lines.forEach((line, li) => {
    const trimmed = line.trimStart();
    if (commentPrefixes.some((p) => trimmed.startsWith(p))) return;
    // Mask string literals (same length, so columns stay valid) so words
    // inside them ("Hello, world!") are not candidates, then mask trailing
    // comments so their prose is not blanked either.
    let masked = line.replace(/(["'])(?:\\.|(?!\1).)*\1/g, (m) =>
      " ".repeat(m.length),
    );
    // ("*" marks block-comment continuation lines, not trailing comments —
    // using it here would truncate multiplication expressions.)
    for (const p of commentPrefixes.filter((x) => x !== "*")) {
      const at = masked.indexOf(p);
      if (at !== -1) masked = masked.slice(0, at) + " ".repeat(masked.length - at);
    }
    for (const m of masked.matchAll(/[A-Za-z_][A-Za-z0-9_]*/g)) {
      if (m[0].length >= 3 && m.index !== undefined) {
        tokens.push({ line: li, col: m.index, text: m[0] });
      }
    }
  });

  // Only blank tokens the student can plausibly recall: language keywords /
  // common library names, or identifiers that repeat within the block (the
  // other occurrences reveal the answer). A block with neither is skipped —
  // blanking a one-off variable name is a guessing game, not a question.
  const known = new Set(KNOWN_TOKENS[cand.language] ?? []);
  const counts = new Map<string, number>();
  for (const t of tokens) counts.set(t.text, (counts.get(t.text) ?? 0) + 1);
  const guessable = tokens.filter(
    (t) => known.has(t.text) || (counts.get(t.text) ?? 0) >= 2,
  );
  if (guessable.length === 0) return null;

  const pick = guessable[Math.floor(rnd() * guessable.length)];
  const src = lines[pick.line];
  const promptLines = lines.slice();
  promptLines[pick.line] =
    src.slice(0, pick.col) + "_____" + src.slice(pick.col + pick.text.length);

  return {
    kind: "code-blank",
    promptCode: promptLines.join("\n"),
    language: cand.language,
    answer: pick.text,
    context: cand.context,
  };
}

function answerOf(q: QuizQuestion): string {
  return q.kind === "multi-choice" ? q.options[q.answerIndex] : q.answer;
}

/**
 * Build a quiz from extracted section facts. Deterministic: the same seed and
 * input always produce the same questions in the same order.
 */
export function buildQuiz(
  sections: SectionInput[],
  opts: { count: number; seed: number },
): QuizQuestion[] {
  const rnd = mulberry32(opts.seed);

  const termCands: (TermFact & { context: SourceRef })[] = [];
  const codeCands: CodeCandidate[] = [];
  for (const s of sections) {
    const context: SourceRef = {
      subjectTitle: s.subjectTitle,
      moduleTitle: s.moduleTitle,
    };
    const facts = extractFacts(s.bodyMd);
    for (const t of facts.terms) termCands.push({ ...t, context });
    for (const c of facts.codeBlocks) codeCands.push({ ...c, context });
  }

  // Unique term pool (case-insensitive) — multi-choice needs >= 4 for
  // an answer plus 3 distinct distractors.
  const uniqueTerms = [
    ...new Map(termCands.map((t) => [t.term.toLowerCase(), t.term])).values(),
  ];
  const canMultiChoice = uniqueTerms.length >= 4;

  const questions: QuizQuestion[] = [];

  // Term facts: alternate fill-blank / multi-choice so kinds mix roughly
  // proportionally to the available material.
  shuffle(termCands, rnd).forEach((t, i) => {
    const blanked = blankTerm(t.sentence, t.term);
    if (!blanked.includes("_____")) return; // defensive: term not in sentence

    // Terms with symbols can't be typed as answers — multi-choice or nothing.
    const typeable = isTypeableTerm(t.term);
    if (canMultiChoice && (i % 2 === 1 || !typeable)) {
      const distractors = shuffle(
        uniqueTerms.filter((u) => u.toLowerCase() !== t.term.toLowerCase()),
        rnd,
      ).slice(0, 3);
      if (distractors.length === 3) {
        const options = shuffle([t.term, ...distractors], rnd);
        questions.push({
          kind: "multi-choice",
          prompt: blanked,
          options,
          answerIndex: options.indexOf(t.term),
          context: t.context,
        });
        return;
      }
    }
    if (!typeable) return;
    questions.push({
      kind: "fill-blank",
      prompt: blanked,
      answer: t.term,
      context: t.context,
    });
  });

  for (const c of codeCands) {
    const q = makeCodeBlank(c, rnd);
    if (q) questions.push(q);
  }

  // Dedupe by answer (case-insensitive), then seed-shuffle and cap.
  const seen = new Set<string>();
  const deduped = questions.filter((q) => {
    const key = answerOf(q).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return shuffle(deduped, rnd).slice(0, opts.count);
}
