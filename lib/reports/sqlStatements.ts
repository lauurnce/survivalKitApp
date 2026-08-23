/**
 * Statement-level SQL splitting for migration analysis.
 *
 * The obvious implementation — sql.split(";") — is wrong here in a way that
 * fails quietly. supabase/migrations/ contains plpgsql bodies wrapped in
 * `$$ … $$` that are full of semicolons, and splitting on those shreds one
 * function into fragments. A fragment can start with words the policy parser
 * matches, so the schema model ends up describing policies that do not exist
 * and missing ones that do. A security report built on that is confidently
 * wrong, which is worse than having no report.
 *
 * So: a small state machine that knows about line comments, block comments,
 * single-quoted strings with the '' escape, and dollar quotes with optional
 * tags. Comments *inside* a dollar-quoted body are preserved, because there
 * they are part of the function source rather than commentary about it.
 */

/** True when `text` at `i` opens a dollar quote; returns the full tag. */
function dollarTagAt(text: string, i: number): string | null {
  const match = /^\$[a-zA-Z_][a-zA-Z0-9_]*\$|^\$\$/.exec(text.slice(i));
  return match ? match[0] : null;
}

/** Index just past the closing quote of the single-quoted string at `i`. */
function endOfQuotedString(text: string, i: number): number {
  let j = i + 1;
  while (j < text.length) {
    if (text[j] === "'") {
      // A doubled quote is an escaped quote, not the end of the string.
      if (text[j + 1] === "'") {
        j += 2;
        continue;
      }
      return j + 1;
    }
    j += 1;
  }
  return text.length;
}

function normalize(fragment: string): string {
  return fragment.replace(/\s+/g, " ").trim();
}

export function splitSqlStatements(sql: string): string[] {
  const statements: string[] = [];
  let buffer = "";
  let i = 0;

  const flush = () => {
    const statement = normalize(buffer);
    if (statement) statements.push(statement);
    buffer = "";
  };

  while (i < sql.length) {
    const tag = dollarTagAt(sql, i);
    if (tag) {
      const close = sql.indexOf(tag, i + tag.length);
      const end = close === -1 ? sql.length : close + tag.length;
      // Copied through verbatim: whatever is in here is function source, not
      // SQL we are parsing, and its semicolons are not statement boundaries.
      buffer += sql.slice(i, end);
      i = end;
      continue;
    }

    if (sql.startsWith("--", i)) {
      const newline = sql.indexOf("\n", i);
      i = newline === -1 ? sql.length : newline;
      // Replace the comment with a space so `select 1--c\n+2` cannot fuse.
      buffer += " ";
      continue;
    }

    if (sql.startsWith("/*", i)) {
      const close = sql.indexOf("*/", i + 2);
      i = close === -1 ? sql.length : close + 2;
      buffer += " ";
      continue;
    }

    if (sql[i] === "'") {
      const end = endOfQuotedString(sql, i);
      buffer += sql.slice(i, end);
      i = end;
      continue;
    }

    if (sql[i] === ";") {
      flush();
      i += 1;
      continue;
    }

    buffer += sql[i];
    i += 1;
  }

  flush();
  return statements;
}

/**
 * Contents of the balanced parenthesis group opening at `openIndex`, or null
 * when the group never closes or `openIndex` is not "(". Quoted strings are
 * skipped so a ")" inside one does not close the group early — RLS predicates
 * such as `note = ')'` are legal and would otherwise truncate.
 */
export function extractParenthesized(text: string, openIndex: number): string | null {
  if (text[openIndex] !== "(") return null;

  let depth = 0;
  let i = openIndex;
  while (i < text.length) {
    const char = text[i];
    if (char === "'") {
      i = endOfQuotedString(text, i);
      continue;
    }
    if (char === "(") depth += 1;
    if (char === ")") {
      depth -= 1;
      if (depth === 0) return text.slice(openIndex + 1, i).trim();
    }
    i += 1;
  }
  return null;
}
