# In-App Code Playground Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let students type and run **Python, SQL, Java, and C** code with live output, entirely inside the BSIT Survival Kit app (no redirect to W3Schools/replit).

**Architecture:** One shared `Playground` UI (CodeMirror editor + output pane) backed by a pluggable **Runner** interface. Python and SQL execute **in the browser** via WebAssembly (Pyodide, sql.js) — zero backend, works offline once loaded. Java and C cannot run in a browser, so they execute through a single Next.js API route (`/api/run`) that proxies to a sandboxed **Piston** execution engine. From the student's point of view nothing ever leaves the app — the only external hop is server→Piston, hidden behind our own route.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind, Supabase. New: CodeMirror 6 (`@uiw/react-codemirror` + language packs), Pyodide (WASM Python), sql.js (WASM SQLite), Piston (server exec for Java/C). Testing: Vitest + React Testing Library.

---

## Why this split (read before coding)

| Language | Where it runs | Engine | In-app? |
|----------|---------------|--------|---------|
| Python | Browser (WASM) | Pyodide | Fully — no server |
| SQL | Browser (WASM) | sql.js (SQLite) | Fully — no server |
| Java | Server proxy | Piston | UX-wise yes; server→Piston hop hidden |
| C | Server proxy | Piston | UX-wise yes; server→Piston hop hidden |

**Hard constraint:** Java and C need a real compiler toolchain. We do **NOT** compile/run untrusted student code on our own Next.js server (arbitrary code execution = security disaster, and Vercel-style serverless can't run gcc/javac anyway). Piston is a purpose-built sandbox. Two ways to get Piston:

- **Option A (zero infra, start here):** public endpoint `https://emkc.org/api/v2/piston`. Rate-limited (~5 req/sec shared). Fine for a class, not for scale.
- **Option B (recommended for production):** self-host Piston via Docker on Railway/Fly.io/a VPS. Full control, no shared rate limit. Same API shape, just swap `PISTON_URL`.

The code is identical for both — only the `PISTON_URL` env var changes. Start with A, switch to B later without touching app code.

---

## File Structure

**New — runner core (pure logic, framework-free where possible):**
- `lib/ide/types.ts` — `LanguageId`, `Language`, `RunRequest`, `RunResult`, `Runner` interface
- `lib/ide/languages.ts` — `LANGUAGES` registry: id, label, CodeMirror extension loader, runtime kind, starter code
- `lib/ide/format.ts` — `truncateOutput`, `normalizeResult` (pure helpers, unit-tested)
- `lib/ide/runners/index.ts` — `getRunner(languageId)` → picks browser vs server runner
- `lib/ide/runners/pyodideRunner.ts` — Python in browser
- `lib/ide/runners/sqlRunner.ts` — SQL in browser (sql.js)
- `lib/ide/runners/serverRunner.ts` — Java/C → `POST /api/run`

**New — UI components (client):**
- `components/ide/CodeEditor.tsx` — CodeMirror wrapper
- `components/ide/OutputPanel.tsx` — stdout/stderr/exit/timing display
- `components/ide/Playground.tsx` — composes editor + toolbar + output + runner wiring
- `components/ide/LanguageSelect.tsx` — dropdown when a section allows multiple langs

**New — server:**
- `app/api/run/route.ts` — execution proxy for Java/C (calls Piston, enforces limits)

**New — standalone test harness page:**
- `app/playground/page.tsx` — full-screen playground; built early so each runner is testable in isolation before wiring into modules

**New — persistence (optional, Phase 7):**
- `supabase/migrations/003_add_code_submissions.sql` — `code_submissions` table
- `app/api/submissions/route.ts` — save/load student code

**Modified — integration:**
- `supabase/migrations/004_add_ide_fields_to_sections.sql` — add `ide_language`, `starter_code` columns
- `components/SectionRenderer.tsx` — render `<Playground>` when a section has `ide_language`
- `app/year/[yearId]/subjects/[subjectId]/modules/[moduleId]/page.tsx` — select new section columns
- `app/api/activity/[sectionId]/route.ts` — return `ide_language`/`starter_code` for gated activities
- `lib/supabase/types.ts` — add new column types
- `package.json` — new deps + `test` script

**Self-hosted assets (optional, for offline):**
- `public/pyodide/**` — pinned Pyodide build (otherwise load from CDN)

---

## Phase 0 — Foundation

### Task 0.1: Install dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install runtime + editor deps**

```bash
npm install @uiw/react-codemirror @codemirror/lang-python @codemirror/lang-sql @codemirror/lang-java @codemirror/lang-cpp sql.js pyodide
```

- [ ] **Step 2: Install test + types deps**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react @types/sql.js
```

- [ ] **Step 3: Add test script to `package.json`**

In the `"scripts"` block add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Verify install**

Run: `npm run build`
Expected: build still succeeds (no usage yet, just deps present).

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add codemirror, pyodide, sql.js, vitest for code playground"
```

---

### Task 0.2: Vitest config

**Files:**
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`

- [ ] **Step 1: Create `vitest.config.ts`**

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
```

- [ ] **Step 2: Create `vitest.setup.ts`**

```typescript
import "@testing-library/jest-dom";
```

- [ ] **Step 3: Smoke test**

Run: `npm test`
Expected: "No test files found" (config valid, exits 0).

- [ ] **Step 4: Commit**

```bash
git add vitest.config.ts vitest.setup.ts
git commit -m "chore: configure vitest with jsdom and @ alias"
```

---

### Task 0.3: Environment variables

**Files:**
- Modify: `.env.example` (create if absent)

- [ ] **Step 1: Document new env vars**

Add to `.env.example`:

```bash
# Piston execution engine for Java / C (browser-run langs need nothing)
# Option A (start here): public shared instance
PISTON_URL=https://emkc.org/api/v2/piston
# Option B (production): your self-hosted Piston base URL, e.g. https://piston.yourapp.dev
```

- [ ] **Step 2: Commit**

```bash
git add .env.example
git commit -m "docs: add PISTON_URL env var for code execution"
```

---

## Phase 1 — Runner contract + language registry (pure logic, TDD)

This phase has no UI and no WASM — pure TypeScript, fully unit-testable.

### Task 1.1: Define core types

**Files:**
- Create: `lib/ide/types.ts`

- [ ] **Step 1: Write the types**

```typescript
import type { Extension } from "@codemirror/state";

export type LanguageId = "python" | "sql" | "java" | "c";

/** Where this language executes. */
export type RuntimeKind = "browser" | "server";

export interface Language {
  id: LanguageId;
  label: string;            // "Python", "SQL (SQLite)", "Java", "C"
  runtime: RuntimeKind;
  starter: string;          // default code shown in a fresh editor
  /** Lazy CodeMirror language extension (dynamic import → smaller bundles). */
  loadExtension: () => Promise<Extension>;
  /** Piston language name + version (server runtimes only). */
  piston?: { language: string; version: string; filename: string };
}

export interface RunRequest {
  languageId: LanguageId;
  code: string;
  stdin?: string;
}

export interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;  // null when not applicable (e.g. SQL)
  timedOut: boolean;
  durationMs: number;
  /** Tabular result for SQL; undefined otherwise. */
  table?: { columns: string[]; rows: unknown[][] };
}

export interface Runner {
  run(req: RunRequest, signal?: AbortSignal): Promise<RunResult>;
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/ide/types.ts
git commit -m "feat(ide): add runner contract types"
```

---

### Task 1.2: Output formatting helpers (TDD)

**Files:**
- Create: `lib/ide/format.ts`
- Test: `lib/ide/format.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect } from "vitest";
import { truncateOutput } from "./format";

describe("truncateOutput", () => {
  it("returns short output unchanged", () => {
    expect(truncateOutput("hello", 100)).toEqual({ text: "hello", truncated: false });
  });

  it("truncates output longer than the cap and flags it", () => {
    const big = "x".repeat(50);
    const out = truncateOutput(big, 10);
    expect(out.truncated).toBe(true);
    expect(out.text.startsWith("xxxxxxxxxx")).toBe(true);
    expect(out.text).toContain("output truncated");
  });

  it("treats empty string as not truncated", () => {
    expect(truncateOutput("", 10)).toEqual({ text: "", truncated: false });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/ide/format.test.ts`
Expected: FAIL — `truncateOutput` not exported.

- [ ] **Step 3: Implement `lib/ide/format.ts`**

```typescript
export interface Truncated {
  text: string;
  truncated: boolean;
}

/** Cap output length so a runaway loop can't freeze the UI. */
export function truncateOutput(text: string, maxChars = 50_000): Truncated {
  if (text.length <= maxChars) return { text, truncated: false };
  return {
    text: text.slice(0, maxChars) + "\n\n… output truncated …",
    truncated: true,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/ide/format.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/ide/format.ts lib/ide/format.test.ts
git commit -m "feat(ide): add output truncation helper with tests"
```

---

### Task 1.3: Language registry (TDD)

**Files:**
- Create: `lib/ide/languages.ts`
- Test: `lib/ide/languages.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect } from "vitest";
import { LANGUAGES, getLanguage } from "./languages";

describe("language registry", () => {
  it("defines exactly python, sql, java, c", () => {
    expect(Object.keys(LANGUAGES).sort()).toEqual(["c", "java", "python", "sql"]);
  });

  it("marks python and sql as browser runtimes", () => {
    expect(LANGUAGES.python.runtime).toBe("browser");
    expect(LANGUAGES.sql.runtime).toBe("browser");
  });

  it("marks java and c as server runtimes with piston config", () => {
    expect(LANGUAGES.java.runtime).toBe("server");
    expect(LANGUAGES.c.runtime).toBe("server");
    expect(LANGUAGES.java.piston?.language).toBe("java");
    expect(LANGUAGES.c.piston?.language).toBe("c");
  });

  it("getLanguage returns the language for a valid id", () => {
    expect(getLanguage("python").label).toBe("Python");
  });

  it("getLanguage throws for an unknown id", () => {
    // @ts-expect-error testing runtime guard
    expect(() => getLanguage("ruby")).toThrow();
  });

  it("every language ships non-empty starter code", () => {
    for (const lang of Object.values(LANGUAGES)) {
      expect(lang.starter.trim().length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/ide/languages.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `lib/ide/languages.ts`**

```typescript
import type { Language, LanguageId } from "./types";

export const LANGUAGES: Record<LanguageId, Language> = {
  python: {
    id: "python",
    label: "Python",
    runtime: "browser",
    starter: 'print("Hello, BSIT!")\n',
    loadExtension: async () => (await import("@codemirror/lang-python")).python(),
  },
  sql: {
    id: "sql",
    label: "SQL (SQLite)",
    runtime: "browser",
    starter:
      "CREATE TABLE students (id INTEGER, name TEXT);\n" +
      "INSERT INTO students VALUES (1, 'Ana'), (2, 'Ben');\n" +
      "SELECT * FROM students;\n",
    loadExtension: async () => (await import("@codemirror/lang-sql")).sql(),
  },
  java: {
    id: "java",
    label: "Java",
    runtime: "server",
    starter:
      "public class Main {\n" +
      "    public static void main(String[] args) {\n" +
      '        System.out.println("Hello, BSIT!");\n' +
      "    }\n" +
      "}\n",
    loadExtension: async () => (await import("@codemirror/lang-java")).java(),
    piston: { language: "java", version: "15.0.2", filename: "Main.java" },
  },
  c: {
    id: "c",
    label: "C",
    runtime: "server",
    starter:
      "#include <stdio.h>\n\n" +
      "int main(void) {\n" +
      '    printf("Hello, BSIT!\\n");\n' +
      "    return 0;\n" +
      "}\n",
    loadExtension: async () => (await import("@codemirror/lang-cpp")).cpp(),
    piston: { language: "c", version: "10.2.0", filename: "main.c" },
  },
};

export function getLanguage(id: LanguageId): Language {
  const lang = LANGUAGES[id];
  if (!lang) throw new Error(`Unknown language: ${id}`);
  return lang;
}
```

> **Note on Piston versions:** the `version` strings must match what your Piston instance reports. After Piston is reachable (Phase 4), confirm with `GET {PISTON_URL}/runtimes` and update these if needed.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/ide/languages.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/ide/languages.ts lib/ide/languages.test.ts
git commit -m "feat(ide): add language registry for python/sql/java/c"
```

---

## Phase 2 — Editor + output shell (UI, no execution yet)

### Task 2.1: CodeEditor component

**Files:**
- Create: `components/ide/CodeEditor.tsx`

- [ ] **Step 1: Implement the editor wrapper**

```tsx
"use client";

import { useEffect, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import type { Extension } from "@codemirror/state";
import { getLanguage } from "@/lib/ide/languages";
import type { LanguageId } from "@/lib/ide/types";

interface Props {
  languageId: LanguageId;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export function CodeEditor({ languageId, value, onChange, readOnly }: Props) {
  const [langExt, setLangExt] = useState<Extension[]>([]);

  useEffect(() => {
    let active = true;
    getLanguage(languageId)
      .loadExtension()
      .then((ext) => {
        if (active) setLangExt([ext]);
      });
    return () => {
      active = false;
    };
  }, [languageId]);

  return (
    <CodeMirror
      value={value}
      height="280px"
      theme="dark"
      extensions={langExt}
      editable={!readOnly}
      onChange={onChange}
      basicSetup={{ lineNumbers: true, foldGutter: false, highlightActiveLine: true }}
    />
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/ide/CodeEditor.tsx
git commit -m "feat(ide): add CodeMirror editor wrapper"
```

---

### Task 2.2: OutputPanel component

**Files:**
- Create: `components/ide/OutputPanel.tsx`

- [ ] **Step 1: Implement the output panel**

```tsx
"use client";

import type { RunResult } from "@/lib/ide/types";

interface Props {
  result: RunResult | null;
  running: boolean;
  error: string | null;
}

export function OutputPanel({ result, running, error }: Props) {
  if (running) {
    return <Shell><span className="text-taupe">Running…</span></Shell>;
  }
  if (error) {
    return <Shell><span className="text-red-400">{error}</span></Shell>;
  }
  if (!result) {
    return <Shell><span className="text-taupe/60">Output will appear here.</span></Shell>;
  }

  return (
    <Shell>
      {result.table && <SqlTable table={result.table} />}
      {result.stdout && <pre className="whitespace-pre-wrap text-paper">{result.stdout}</pre>}
      {result.stderr && <pre className="whitespace-pre-wrap text-red-400">{result.stderr}</pre>}
      <div className="mt-2 text-label-sm text-taupe/60">
        {result.timedOut ? "Timed out" : `exit ${result.exitCode ?? "—"}`} · {result.durationMs}ms
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-ink text-paper font-mono text-sm p-4 min-h-[120px] overflow-x-auto">
      {children}
    </div>
  );
}

function SqlTable({ table }: { table: NonNullable<RunResult["table"]> }) {
  return (
    <div className="overflow-x-auto mb-3">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            {table.columns.map((c) => (
              <th key={c} className="text-left py-1 pr-4 border-b border-paper/20 text-taupe">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="py-1 pr-4 border-b border-paper/10">{String(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/ide/OutputPanel.tsx
git commit -m "feat(ide): add output panel with SQL table rendering"
```

---

### Task 2.3: Stub runner registry + Playground shell

**Files:**
- Create: `lib/ide/runners/index.ts`
- Create: `components/ide/Playground.tsx`
- Create: `app/playground/page.tsx`

- [ ] **Step 1: Stub `lib/ide/runners/index.ts`**

```typescript
import type { LanguageId, Runner } from "@/lib/ide/types";
import { getLanguage } from "@/lib/ide/languages";

/** Returns the runner for a language. Real runners wired in Phases 3-4. */
export async function getRunner(languageId: LanguageId): Promise<Runner> {
  const lang = getLanguage(languageId);
  if (lang.runtime === "browser") {
    if (languageId === "python") {
      return (await import("./pyodideRunner")).pyodideRunner;
    }
    return (await import("./sqlRunner")).sqlRunner;
  }
  return (await import("./serverRunner")).serverRunner;
}
```

> This import will fail until Phases 3-4 create those files. To keep this task self-contained and committable, create **temporary stub files** now and replace them in later phases:

`lib/ide/runners/pyodideRunner.ts`:
```typescript
import type { Runner } from "@/lib/ide/types";
export const pyodideRunner: Runner = {
  async run() {
    return { stdout: "", stderr: "python runner not implemented", exitCode: 1, timedOut: false, durationMs: 0 };
  },
};
```

`lib/ide/runners/sqlRunner.ts`:
```typescript
import type { Runner } from "@/lib/ide/types";
export const sqlRunner: Runner = {
  async run() {
    return { stdout: "", stderr: "sql runner not implemented", exitCode: null, timedOut: false, durationMs: 0 };
  },
};
```

`lib/ide/runners/serverRunner.ts`:
```typescript
import type { Runner } from "@/lib/ide/types";
export const serverRunner: Runner = {
  async run() {
    return { stdout: "", stderr: "server runner not implemented", exitCode: 1, timedOut: false, durationMs: 0 };
  },
};
```

- [ ] **Step 2: Implement `components/ide/Playground.tsx`**

```tsx
"use client";

import { useState } from "react";
import { CodeEditor } from "./CodeEditor";
import { OutputPanel } from "./OutputPanel";
import { getRunner } from "@/lib/ide/runners";
import { getLanguage } from "@/lib/ide/languages";
import type { LanguageId, RunResult } from "@/lib/ide/types";

interface Props {
  languageId: LanguageId;
  initialCode?: string;
}

export function Playground({ languageId, initialCode }: Props) {
  const lang = getLanguage(languageId);
  const [code, setCode] = useState(initialCode ?? lang.starter);
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const runner = await getRunner(languageId);
      const res = await runner.run({ languageId, code });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to run");
    } finally {
      setRunning(false);
    }
  }

  function handleReset() {
    setCode(initialCode ?? lang.starter);
    setResult(null);
    setError(null);
  }

  return (
    <div className="border border-ink-faint/30">
      <div className="flex items-center justify-between bg-navy px-4 py-2">
        <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-taupe">
          {lang.label}
        </span>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="border border-paper/20 text-paper/70 font-sans text-xs uppercase tracking-widest px-3 py-1 hover:text-paper"
          >
            Reset
          </button>
          <button
            onClick={handleRun}
            disabled={running}
            className="bg-accent text-navy font-sans text-xs uppercase tracking-widest px-4 py-1 disabled:opacity-50"
          >
            {running ? "Running…" : "Run"}
          </button>
        </div>
      </div>
      <CodeEditor languageId={languageId} value={code} onChange={setCode} readOnly={running} />
      <OutputPanel result={result} running={running} error={error} />
    </div>
  );
}
```

- [ ] **Step 3: Implement `app/playground/page.tsx` (test harness)**

```tsx
"use client";

import { useState } from "react";
import { Playground } from "@/components/ide/Playground";
import type { LanguageId } from "@/lib/ide/types";

const LANGS: LanguageId[] = ["python", "sql", "java", "c"];

export default function PlaygroundTestPage() {
  const [lang, setLang] = useState<LanguageId>("python");
  return (
    <main className="min-h-screen bg-paper px-6 py-12 md:px-16 max-w-wide">
      <h1 className="font-serif text-2xl text-ink mb-6">Playground (dev harness)</h1>
      <div className="flex gap-2 mb-6">
        {LANGS.map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`px-3 py-1 text-xs uppercase tracking-widest border ${
              lang === l ? "bg-navy text-paper" : "border-ink-faint/30 text-ink-muted"
            }`}
          >
            {l}
          </button>
        ))}
      </div>
      <Playground key={lang} languageId={lang} />
    </main>
  );
}
```

- [ ] **Step 4: Manual verification**

Run: `npm run dev`, open `http://localhost:3000/playground`.
Expected: editor loads with starter code for each language; switching tabs swaps starter code; clicking **Run** shows the "not implemented" stub message in the output panel. Editor syntax highlighting works per language.

- [ ] **Step 5: Commit**

```bash
git add lib/ide/runners components/ide/Playground.tsx app/playground/page.tsx
git commit -m "feat(ide): add playground shell with stub runners and dev harness"
```

---

## Phase 3 — Browser runners (Python + SQL via WASM)

### Task 3.1: Pyodide Python runner

**Files:**
- Replace: `lib/ide/runners/pyodideRunner.ts`

- [ ] **Step 1: Implement the Pyodide runner**

```typescript
import type { Runner, RunRequest, RunResult } from "@/lib/ide/types";
import { truncateOutput } from "@/lib/ide/format";

// Pyodide is heavy (~6MB). Load once, cache the promise.
let pyodidePromise: Promise<any> | null = null;

async function loadPyodide(): Promise<any> {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      // @ts-expect-error no types for the CDN module
      const { loadPyodide } = await import(
        /* webpackIgnore: true */ "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.mjs"
      );
      return loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/" });
    })();
  }
  return pyodidePromise;
}

export const pyodideRunner: Runner = {
  async run(req: RunRequest): Promise<RunResult> {
    const start = performance.now();
    const py = await loadPyodide();

    let stdout = "";
    let stderr = "";
    py.setStdout({ batched: (s: string) => (stdout += s + "\n") });
    py.setStderr({ batched: (s: string) => (stderr += s + "\n") });

    let exitCode = 0;
    try {
      await py.runPythonAsync(req.code);
    } catch (e) {
      stderr += (e instanceof Error ? e.message : String(e)) + "\n";
      exitCode = 1;
    }

    const out = truncateOutput(stdout);
    const err = truncateOutput(stderr);
    return {
      stdout: out.text,
      stderr: err.text,
      exitCode,
      timedOut: false,
      durationMs: Math.round(performance.now() - start),
    };
  },
};
```

> **Offline option:** to avoid the CDN, copy the pinned Pyodide `full/` build into `public/pyodide/v0.26.2/` and change both URLs to `/pyodide/v0.26.2/...`. Document in README. CDN is the default to keep the repo small.
>
> **Infinite-loop caveat:** Pyodide runs on the main thread, so a `while True:` will hang the tab. Phase 6 (hardening) moves this into a Web Worker with a kill timer. For now, document "avoid infinite loops" in the UI.

- [ ] **Step 2: Manual verification**

Run: `npm run dev`, open `/playground`, select **python**, click Run.
Expected: `Hello, BSIT!` in output. Edit to `print(2**10)` → `1024`. Introduce a `NameError` → red stderr text.

- [ ] **Step 3: Commit**

```bash
git add lib/ide/runners/pyodideRunner.ts
git commit -m "feat(ide): implement Python runner via Pyodide"
```

---

### Task 3.2: SQL runner (sql.js)

**Files:**
- Replace: `lib/ide/runners/sqlRunner.ts`

- [ ] **Step 1: Implement the SQL runner**

```typescript
import type { Runner, RunRequest, RunResult } from "@/lib/ide/types";

let sqlPromise: Promise<any> | null = null;

async function loadSql(): Promise<any> {
  if (!sqlPromise) {
    sqlPromise = (async () => {
      const initSqlJs = (await import("sql.js")).default;
      return initSqlJs({
        // sql.js ships its wasm separately; load from CDN (or self-host in /public).
        locateFile: (f: string) => `https://sql.js.org/dist/${f}`,
      });
    })();
  }
  return sqlPromise;
}

export const sqlRunner: Runner = {
  async run(req: RunRequest): Promise<RunResult> {
    const start = performance.now();
    const SQL = await loadSql();
    const db = new SQL.Database();

    try {
      // exec returns results for the LAST statement(s) that produce rows.
      const results = db.exec(req.code);
      const last = results[results.length - 1];

      const result: RunResult = {
        stdout: results.length === 0 ? "(no rows returned)" : "",
        stderr: "",
        exitCode: null,
        timedOut: false,
        durationMs: Math.round(performance.now() - start),
      };
      if (last) {
        result.table = { columns: last.columns, rows: last.values };
      }
      return result;
    } catch (e) {
      return {
        stdout: "",
        stderr: e instanceof Error ? e.message : String(e),
        exitCode: null,
        timedOut: false,
        durationMs: Math.round(performance.now() - start),
      };
    } finally {
      db.close();
    }
  },
};
```

- [ ] **Step 2: Manual verification**

Run: `/playground`, select **sql**, Run.
Expected: a 2-row table (Ana, Ben). Break the SQL (`SELCT * ...`) → red error text.

- [ ] **Step 3: Commit**

```bash
git add lib/ide/runners/sqlRunner.ts
git commit -m "feat(ide): implement SQL runner via sql.js with table output"
```

---

## Phase 4 — Server runner (Java + C via Piston)

### Task 4.1: `/api/run` execution proxy (TDD on the request builder)

**Files:**
- Create: `lib/ide/piston.ts` (pure request/response mapping)
- Test: `lib/ide/piston.test.ts`
- Create: `app/api/run/route.ts`

- [ ] **Step 1: Write the failing test for the Piston payload builder**

```typescript
import { describe, it, expect } from "vitest";
import { buildPistonPayload, mapPistonResponse } from "./piston";

describe("buildPistonPayload", () => {
  it("builds a java payload with Main.java filename", () => {
    const p = buildPistonPayload("java", "class Main{}", "");
    expect(p.language).toBe("java");
    expect(p.version).toBe("15.0.2");
    expect(p.files[0].name).toBe("Main.java");
    expect(p.files[0].content).toBe("class Main{}");
  });

  it("builds a c payload with main.c filename", () => {
    const p = buildPistonPayload("c", "int main(){}", "");
    expect(p.files[0].name).toBe("main.c");
  });

  it("rejects a browser-only language", () => {
    // @ts-expect-error python is not a server language
    expect(() => buildPistonPayload("python", "", "")).toThrow();
  });
});

describe("mapPistonResponse", () => {
  it("maps run+compile output into a RunResult", () => {
    const res = mapPistonResponse(
      { compile: { stdout: "", stderr: "", code: 0 }, run: { stdout: "hi\n", stderr: "", code: 0 } },
      42,
    );
    expect(res.stdout).toBe("hi\n");
    expect(res.exitCode).toBe(0);
    expect(res.durationMs).toBe(42);
  });

  it("surfaces compile errors in stderr", () => {
    const res = mapPistonResponse(
      { compile: { stdout: "", stderr: "error: expected ';'", code: 1 }, run: null },
      10,
    );
    expect(res.stderr).toContain("expected ';'");
    expect(res.exitCode).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/ide/piston.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `lib/ide/piston.ts`**

```typescript
import type { LanguageId, RunResult } from "./types";
import { getLanguage } from "./languages";

export interface PistonPayload {
  language: string;
  version: string;
  files: { name: string; content: string }[];
  stdin: string;
  run_timeout: number;
  compile_timeout: number;
}

interface PistonStage {
  stdout: string;
  stderr: string;
  code: number | null;
}

export interface PistonResponse {
  compile?: PistonStage | null;
  run?: PistonStage | null;
}

export function buildPistonPayload(
  languageId: LanguageId,
  code: string,
  stdin: string,
): PistonPayload {
  const lang = getLanguage(languageId);
  if (lang.runtime !== "server" || !lang.piston) {
    throw new Error(`${languageId} does not run on the server`);
  }
  return {
    language: lang.piston.language,
    version: lang.piston.version,
    files: [{ name: lang.piston.filename, content: code }],
    stdin,
    run_timeout: 5000,
    compile_timeout: 10000,
  };
}

export function mapPistonResponse(res: PistonResponse, durationMs: number): RunResult {
  const compile = res.compile;
  const run = res.run;
  const compileFailed = compile && compile.code !== 0;

  const stdout = run?.stdout ?? "";
  const stderr =
    (compileFailed ? compile!.stderr : "") + (run?.stderr ?? "");
  const exitCode = compileFailed ? compile!.code : run?.code ?? null;

  return {
    stdout,
    stderr,
    exitCode,
    timedOut: false,
    durationMs,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/ide/piston.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Implement `app/api/run/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { buildPistonPayload, mapPistonResponse } from "@/lib/ide/piston";
import { truncateOutput } from "@/lib/ide/format";
import type { LanguageId } from "@/lib/ide/types";

export const runtime = "nodejs";

const MAX_CODE_BYTES = 50_000;
const SERVER_LANGS: LanguageId[] = ["java", "c"];

export async function POST(req: NextRequest) {
  const pistonUrl = process.env.PISTON_URL;
  if (!pistonUrl) {
    return NextResponse.json({ error: "Execution engine not configured" }, { status: 503 });
  }

  let body: { languageId?: LanguageId; code?: string; stdin?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { languageId, code = "", stdin = "" } = body;
  if (!languageId || !SERVER_LANGS.includes(languageId)) {
    return NextResponse.json({ error: "Unsupported language" }, { status: 400 });
  }
  if (new TextEncoder().encode(code).length > MAX_CODE_BYTES) {
    return NextResponse.json({ error: "Code too large" }, { status: 413 });
  }

  const payload = buildPistonPayload(languageId, code, stdin);
  const start = Date.now();

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20_000);
    const pistonRes = await fetch(`${pistonUrl}/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!pistonRes.ok) {
      const detail = await pistonRes.text();
      return NextResponse.json({ error: `Engine error: ${detail}` }, { status: 502 });
    }

    const data = await pistonRes.json();
    const result = mapPistonResponse(data, Date.now() - start);
    result.stdout = truncateOutput(result.stdout).text;
    result.stderr = truncateOutput(result.stderr).text;
    return NextResponse.json(result);
  } catch (e) {
    const aborted = e instanceof Error && e.name === "AbortError";
    return NextResponse.json(
      { error: aborted ? "Execution timed out" : "Execution failed" },
      { status: aborted ? 504 : 502 },
    );
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add lib/ide/piston.ts lib/ide/piston.test.ts app/api/run/route.ts
git commit -m "feat(ide): add /api/run Piston proxy for Java and C"
```

---

### Task 4.2: Server runner client

**Files:**
- Replace: `lib/ide/runners/serverRunner.ts`

- [ ] **Step 1: Implement the server runner**

```typescript
import type { Runner, RunRequest, RunResult } from "@/lib/ide/types";

export const serverRunner: Runner = {
  async run(req: RunRequest, signal?: AbortSignal): Promise<RunResult> {
    const res = await fetch("/api/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
      signal,
    });

    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Execution failed" }));
      throw new Error(error ?? "Execution failed");
    }
    return (await res.json()) as RunResult;
  },
};
```

- [ ] **Step 2: Set `PISTON_URL` locally**

Add to `.env.local`: `PISTON_URL=https://emkc.org/api/v2/piston`

- [ ] **Step 3: Manual verification**

Run: `npm run dev`, `/playground`, select **java**, Run → `Hello, BSIT!`. Select **c**, Run → `Hello, BSIT!`. Introduce a syntax error in C → compile error in stderr.

- [ ] **Step 4: Confirm Piston runtime versions**

Run: `curl https://emkc.org/api/v2/piston/runtimes` and check the reported `version` for `java` and `c`. If they differ from `languages.ts`, update the `piston.version` values and re-test.

- [ ] **Step 5: Commit**

```bash
git add lib/ide/runners/serverRunner.ts
git commit -m "feat(ide): implement server runner calling /api/run"
```

---

## Phase 5 — Curriculum integration (attach playgrounds to module sections)

### Task 5.1: Schema — add IDE fields to sections

**Files:**
- Create: `supabase/migrations/004_add_ide_fields_to_sections.sql`
- Modify: `lib/supabase/types.ts`

- [ ] **Step 1: Write the migration**

```sql
-- Attach an interactive playground to a section.
-- ide_language NULL  => plain content section (current behaviour)
-- ide_language set   => render a Playground with the given language + starter code
alter table sections add column if not exists ide_language text
  check (ide_language in ('python', 'sql', 'java', 'c'));
alter table sections add column if not exists starter_code text;
```

- [ ] **Step 2: Apply the migration**

Run: `npx supabase db push` (or run the SQL in the Supabase SQL editor).
Expected: columns added, no error.

- [ ] **Step 3: Add the types in `lib/supabase/types.ts`**

Locate the `sections` row type and add:

```typescript
ide_language: "python" | "sql" | "java" | "c" | null;
starter_code: string | null;
```

> Check the existing shape of `lib/supabase/types.ts` first and follow its exact convention (generated types vs hand-written). Match the surrounding style.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/004_add_ide_fields_to_sections.sql lib/supabase/types.ts
git commit -m "feat(ide): add ide_language and starter_code columns to sections"
```

---

### Task 5.2: Render playground in content sections

**Files:**
- Modify: `components/SectionRenderer.tsx`
- Modify: `app/year/[yearId]/subjects/[subjectId]/modules/[moduleId]/page.tsx`

- [ ] **Step 1: Extend the `Section` interface and select in the page**

In `app/.../[moduleId]/page.tsx`, change the content-sections select to include the new columns:

```typescript
const { data: contentSections } = await supabase
  .from("sections")
  .select("id, kind, heading, body_md, sort_order, ide_language, starter_code")
  .eq("module_id", moduleId)
  .eq("kind", "content")
  .order("sort_order");
```

And update the merged-section mapping so activity placeholders carry the same (null) fields:

```typescript
const allSections = [
  ...(contentSections ?? []),
  ...(activityMeta ?? []).map((s) => ({ ...s, body_md: "", ide_language: null, starter_code: null })),
].sort((a, b) => a.sort_order - b.sort_order);
```

- [ ] **Step 2: Render `<Playground>` in `SectionRenderer.tsx`**

Extend the `Section` interface:

```typescript
interface Section {
  id: string;
  kind: string;
  heading: string;
  body_md: string;
  sort_order: number;
  ide_language?: "python" | "sql" | "java" | "c" | null;
  starter_code?: string | null;
}
```

Then, inside the returned `<section>`, after the `<BodyMarkdown>` block, add:

```tsx
{section.ide_language && (
  <div className="mt-6 pl-10 md:pl-12">
    <Playground
      languageId={section.ide_language}
      initialCode={section.starter_code ?? undefined}
    />
  </div>
)}
```

And add the import at the top:

```tsx
import { Playground } from "./ide/Playground";
```

- [ ] **Step 3: Seed a test playground section**

In the Supabase SQL editor, attach a playground to any existing content section:

```sql
update sections
set ide_language = 'python',
    starter_code = 'name = "BSIT"\nprint(f"Hello, {name}!")\n'
where id = '<some-existing-content-section-id>';
```

- [ ] **Step 4: Manual verification**

Run: `npm run dev`, open that module page.
Expected: the section renders its markdown body, then a working Python playground below it. Run produces output inline.

- [ ] **Step 5: Commit**

```bash
git add components/SectionRenderer.tsx "app/year/[yearId]/subjects/[subjectId]/modules/[moduleId]/page.tsx"
git commit -m "feat(ide): render playground inside module content sections"
```

---

### Task 5.3: Support playgrounds in gated activity sections

**Files:**
- Modify: `app/api/activity/[sectionId]/route.ts`
- Modify: the client component that fetches activity bodies (the one calling `/api/activity/...`)

- [ ] **Step 1: Return IDE fields from the activity API**

In `app/api/activity/[sectionId]/route.ts`, extend the select and response:

```typescript
const { data: section } = await supabase
  .from("sections")
  .select("id, module_id, kind, heading, body_md, ide_language, starter_code")
  .eq("id", sectionId)
  .single();
```

```typescript
return NextResponse.json({
  id: section.id,
  heading: section.heading,
  body_md: section.body_md,
  ide_language: section.ide_language,
  starter_code: section.starter_code,
});
```

- [ ] **Step 2: Render the playground after unlock**

In the client component that displays the fetched activity (the success branch after the `fetch("/api/activity/...")` resolves), render:

```tsx
{activity.ide_language && (
  <Playground languageId={activity.ide_language} initialCode={activity.starter_code ?? undefined} />
)}
```

> Find this component by searching for `"/api/activity/"` usages. Match its existing state/types; add `ide_language` and `starter_code` to whatever interface types the fetched activity.

- [ ] **Step 3: Manual verification**

With `UNLOCK_ALL=true` in `.env.local`, attach `ide_language='java'` to an activity section, open the module, confirm the Java playground renders and runs after unlock.

- [ ] **Step 4: Commit**

```bash
git add "app/api/activity/[sectionId]/route.ts"
git commit -m "feat(ide): serve playground fields for unlocked activity sections"
```

---

## Phase 6 — Hardening

### Task 6.1: Run Pyodide and sql.js inside a Web Worker (kill infinite loops)

**Files:**
- Create: `lib/ide/workers/browserExec.worker.ts`
- Modify: `lib/ide/runners/pyodideRunner.ts`, `lib/ide/runners/sqlRunner.ts` to post to the worker
- Modify: `components/ide/Playground.tsx` to support an Abort/Stop button + a hard timeout that terminates the worker

- [ ] **Step 1: Move WASM execution into a Worker**

A Worker runs off the main thread, so an infinite loop no longer freezes the tab — and the Worker can be `.terminate()`d by a timeout. Implement a single worker that handles both `python` and `sql` messages, returning a `RunResult`. The runner posts `{ languageId, code }`, starts a `setTimeout(… terminate, 10_000)`, and resolves on the worker's `message` event (set `timedOut: true` if the timer fires first).

- [ ] **Step 2: Add a Stop button in `Playground.tsx`**

While `running`, show **Stop**; clicking it aborts the server fetch (via `AbortController`) or terminates the worker.

- [ ] **Step 3: Manual verification**

Python `while True: pass` → after ~10s, output shows "Timed out", tab stays responsive, Stop works.

- [ ] **Step 4: Commit**

```bash
git add lib/ide/workers components/ide/Playground.tsx lib/ide/runners
git commit -m "feat(ide): run browser languages in a Web Worker with timeout + stop"
```

---

### Task 6.2: Rate-limit `/api/run`

**Files:**
- Modify: `app/api/run/route.ts`

- [ ] **Step 1: Add a simple per-device rate limit**

Read `x-device-id` header (same pattern as `app/api/activity/[sectionId]/route.ts`). Keep an in-memory token bucket (e.g. 1 run / 2s, burst 5) keyed by device id. On limit, return `429`. (For multi-instance deploys, back this with a Supabase table or Upstash; note that in a comment.)

- [ ] **Step 2: Send `x-device-id` from `serverRunner.ts`**

Import `getDeviceId` from `@/lib/device` and add the header to the fetch.

- [ ] **Step 3: Manual verification**

Spam Run on Java → after burst, output shows a "slow down" message (429 surfaced via the thrown error).

- [ ] **Step 4: Commit**

```bash
git add app/api/run/route.ts lib/ide/runners/serverRunner.ts
git commit -m "feat(ide): rate-limit code execution per device"
```

---

### Task 6.3: Analytics + mobile/a11y polish

**Files:**
- Modify: `lib/analytics.ts` (add a `code_run` event), `components/ide/Playground.tsx`

- [ ] **Step 1: Log a `code_run` event**

Follow the existing `events` table pattern. Add `'code_run'` to the `event_type` check constraint via a new migration `supabase/migrations/005_add_code_run_event.sql`, and fire it from `handleRun`.

- [ ] **Step 2: Mobile + a11y pass**

Confirm the editor scrolls horizontally on a narrow viewport, Run/Reset/Stop have `aria-label`s, output panel uses `role="status"` / `aria-live="polite"`, and contrast meets the existing design tokens.

- [ ] **Step 3: Commit**

```bash
git add lib/analytics.ts supabase/migrations/005_add_code_run_event.sql components/ide/Playground.tsx
git commit -m "feat(ide): log code_run analytics and polish mobile/a11y"
```

---

## Phase 7 — Optional: save student code

Skip unless you want students' work to persist across reloads/devices.

### Task 7.1: `code_submissions` table + API

**Files:**
- Create: `supabase/migrations/006_add_code_submissions.sql`
- Create: `app/api/submissions/route.ts`
- Modify: `components/ide/Playground.tsx` (load on mount, debounce save on change)

- [ ] **Step 1: Migration**

```sql
create table if not exists code_submissions (
  id          uuid primary key default gen_random_uuid(),
  device_id   text not null,
  section_id  uuid not null references sections(id) on delete cascade,
  language    text not null check (language in ('python', 'sql', 'java', 'c')),
  code        text not null,
  updated_at  timestamptz not null default now(),
  unique(device_id, section_id)
);
alter table code_submissions enable row level security;
-- Writes/reads go through a server route using the service role, so no anon policy.
create index if not exists idx_submissions_device on code_submissions(device_id, section_id);
```

- [ ] **Step 2: API route**

`GET /api/submissions?sectionId=…` (reads by `x-device-id` + sectionId) and `PUT /api/submissions` (upsert). Use `createServerClient` (service role) — mirror `app/api/activity/[sectionId]/route.ts`.

- [ ] **Step 3: Wire into Playground**

Add an optional `sectionId` prop. On mount, GET saved code (fall back to `initialCode`/starter). On change, debounce (~1.5s) a PUT.

- [ ] **Step 4: Manual verification**

Type code, reload page → code persists. Reset returns to starter.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/006_add_code_submissions.sql app/api/submissions/route.ts components/ide/Playground.tsx
git commit -m "feat(ide): persist student code per device and section"
```

---

## Production checklist (Piston self-host — Option B)

When ready to move off the public endpoint:

1. Deploy Piston via its official Docker image on Railway/Fly.io/a VPS (it needs privileged containers for sandboxing — Vercel cannot host it).
2. Install only the runtimes you need: `python`, `java`, `c` (SQL stays in-browser).
3. Confirm versions: `GET {PISTON_URL}/runtimes` → update `lib/ide/languages.ts` `piston.version` values.
4. Set `PISTON_URL` in your hosting env to the new base URL. No app code changes.
5. Keep `run_timeout`/`compile_timeout` and the `/api/run` rate limit; Piston also enforces its own per-run CPU/memory/process caps — review its config.

---

## Self-Review notes (author)

- **Curriculum coverage:** Python, SQL, Java, C — all four, no more (registry test enforces exactly these). ✅
- **"Inside the app":** Python/SQL never leave the browser; Java/C only hop server→Piston behind `/api/run`, never a client redirect. ✅
- **Security:** untrusted code never runs on our Next server; Piston sandbox + timeouts + size cap + rate limit. ✅
- **Naming consistency:** `RunResult`, `Runner`, `getRunner`, `getLanguage`, `LANGUAGES` used identically across all tasks. ✅
- **Type consistency:** `ide_language` union `'python'|'sql'|'java'|'c'|null` matches DB check constraint and TS types in Tasks 5.1/5.2/5.3. ✅
- **Known limitation:** main-thread WASM blocks until Phase 6.1 (worker) — flagged in Task 3.1. Do Phase 6.1 before shipping to students.
```
