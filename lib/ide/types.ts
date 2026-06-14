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
