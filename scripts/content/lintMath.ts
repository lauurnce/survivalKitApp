/**
 * Content lint for section bodies (QA CT-01, CT-02).
 *
 * Renders a body through the exact pipeline the module reader uses
 * (components/SectionRenderer.tsx → BodyMarkdown: react-markdown with
 * remark-gfm + remark-math, then rehype-katex) and reports what a reader
 * would see broken:
 *
 * - katex-error       KaTeX could not parse a math node. rehype-katex renders
 *                     every node with throwOnError: true and records the
 *                     failure on the vfile before falling back to the red
 *                     source text, so the vfile message is the thrown error.
 * - dollar-fence      A line that opens or closes `$$` display math while
 *                     sharing the line with other content. When the matching
 *                     fence is lost, everything up to the next `$$` is parsed
 *                     as one expression (the CT-01 bug class).
 * - leaked-bold       `**` survived rendering as literal text.
 * - leaked-heading    A `##` heading marker survived rendering as text.
 * - collapsed-table   A GFM table separator row (`|---|`) rendered as text,
 *                     so the table was never parsed (CT-02).
 *
 * Pure: no I/O. The CLI (lint-math.ts) feeds it database rows.
 */

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export type LintRule =
  | "katex-error"
  | "dollar-fence"
  | "leaked-bold"
  | "leaked-heading"
  | "collapsed-table";

export interface LintIssue {
  rule: LintRule;
  /** 1-based source line, when known. */
  line?: number;
  message: string;
  /** A short excerpt of the offending source or rendered text. */
  excerpt: string;
}

// Minimal hast shapes: enough to walk the tree without importing @types/hast,
// which is only a transitive dependency.
interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: { className?: unknown };
  children?: HastNode[];
  position?: { start?: { line?: number } };
}

interface VFileLike {
  messages: Array<{
    reason: string;
    line?: number | null;
    source?: string | null;
    cause?: unknown;
  }>;
}

const EXCERPT_MAX = 120;

function excerpt(text: string): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > EXCERPT_MAX ? `${flat.slice(0, EXCERPT_MAX - 1)}…` : flat;
}

function classes(node: HastNode): string[] {
  const c = node.properties?.className;
  return Array.isArray(c) ? c.map(String) : [];
}

// Text inside these is code or already-reported math, not leaked markup.
function isOpaque(node: HastNode): boolean {
  if (node.tagName === "code" || node.tagName === "pre") return true;
  const c = classes(node);
  return c.includes("katex") || c.includes("katex-display") || c.includes("katex-error");
}

function collectText(node: HastNode, out: Array<{ text: string; line?: number }>, inherited?: number) {
  const line = node.position?.start?.line ?? inherited;
  if (node.type === "text" && node.value) {
    out.push({ text: node.value, line });
    return;
  }
  if (node.type === "element" && isOpaque(node)) return;
  for (const child of node.children ?? []) collectText(child, out, line);
}

/**
 * The math fence check works on source, not the rendered tree: once a fence
 * is lost the tree no longer says where it should have been. Code fences are
 * skipped so `$$` inside a code sample is not flagged.
 */
function checkDollarFences(body: string): LintIssue[] {
  const issues: LintIssue[] = [];
  let inCode = false;
  body.split("\n").forEach((raw, i) => {
    const line = raw.trim();
    if (/^(```|~~~)/.test(line)) {
      inCode = !inCode;
      return;
    }
    if (inCode || !line.includes("$$")) return;
    const fences = line.split("$$").length - 1;
    // `$$` alone is a proper fence; `$$x$$` is a complete one-line expression.
    // An odd count with other content opens or closes a block mid-line.
    if (line === "$$" || fences % 2 === 0) return;
    issues.push({
      rule: "dollar-fence",
      line: i + 1,
      message: "`$$` display-math fence shares its line with other content; put `$$` on its own line",
      excerpt: excerpt(raw),
    });
  });
  return issues;
}

const TABLE_SEPARATOR = /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/;

/**
 * Mechanical repair for the two source-level bug classes, so the database fix
 * and the repo seed fix are byte-for-byte the same transform:
 *
 * - `$$\begin{…}` / `\end{…}$$`: move the fence onto its own line.
 * - `**12.** | a | b |` directly above a `|---|` row: put the label on its own
 *   paragraph so the table starts at column 0 after a blank line.
 *
 * Code fences are left alone. Anything else (a real KaTeX syntax error) needs
 * a human, so lintBody should be run again on the output.
 */
export function fixBody(body: string): string {
  const lines = body.split("\n");
  const out: string[] = [];
  let inCode = false;
  lines.forEach((raw, i) => {
    const line = raw.trim();
    if (/^(```|~~~)/.test(line)) inCode = !inCode;
    if (inCode) {
      out.push(raw);
      return;
    }

    const fences = line.split("$$").length - 1;
    if (line !== "$$" && fences % 2 === 1) {
      if (line.startsWith("$$")) {
        out.push("$$", line.slice(2));
        return;
      }
      if (line.endsWith("$$")) {
        out.push(line.slice(0, -2), "$$");
        return;
      }
    }

    const next = lines[i + 1]?.trim() ?? "";
    const labelled = /^([^|]*\S)\s+(\|.*\|)\s*$/.exec(raw);
    if (labelled && TABLE_SEPARATOR.test(next)) {
      out.push(labelled[1], "", labelled[2]);
      return;
    }

    out.push(raw);
  });
  return out.join("\n");
}

/** Render one section body and return every problem a reader would see. */
export function lintBody(body: string): LintIssue[] {
  let tree: HastNode | undefined;
  let file: VFileLike | undefined;

  // Runs last, after rehype-katex, so it sees the tree and the vfile exactly
  // as the reader would render them.
  const capture = () => (t: HastNode, f: VFileLike) => {
    tree = t;
    file = f;
  };

  renderToStaticMarkup(
    createElement(
      ReactMarkdown,
      { remarkPlugins: [remarkGfm, remarkMath], rehypePlugins: [rehypeKatex, capture] },
      body
    )
  );

  const issues: LintIssue[] = [];
  const lines = body.split("\n");

  for (const m of file?.messages ?? []) {
    if (m.source !== "rehype-katex") continue;
    const cause = m.cause instanceof Error ? m.cause.message : m.reason;
    const line = m.line ?? undefined;
    issues.push({
      rule: "katex-error",
      line,
      message: cause.split("\n")[0],
      excerpt: excerpt(line ? lines[line - 1] ?? "" : ""),
    });
  }

  issues.push(...checkDollarFences(body));

  const texts: Array<{ text: string; line?: number }> = [];
  if (tree) collectText(tree, texts);
  for (const { text, line } of texts) {
    if (text.includes("**")) {
      issues.push({ rule: "leaked-bold", line, message: "Literal `**` in rendered text", excerpt: excerpt(text) });
    }
    if (/(^|\n|\s)#{2,6}\s+\S/.test(text)) {
      issues.push({ rule: "leaked-heading", line, message: "Literal `##` heading marker in rendered text", excerpt: excerpt(text) });
    }
    if (/\|\s*:?-{3,}:?\s*\|/.test(text)) {
      issues.push({
        rule: "collapsed-table",
        line,
        message: "Table separator rendered as text: the table needs a blank line before it and one row per line",
        excerpt: excerpt(text),
      });
    }
  }

  return issues.sort((a, b) => (a.line ?? 0) - (b.line ?? 0));
}
