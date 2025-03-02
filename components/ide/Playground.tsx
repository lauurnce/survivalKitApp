"use client";

import { useState } from "react";
import { CodeEditor } from "./CodeEditor";
import { OutputPanel } from "./OutputPanel";
import { getRunner } from "@/lib/ide/runners";
import { getLanguage } from "@/lib/ide/languages";
import type { LanguageId, RunPhase, RunResult } from "@/lib/ide/types";
import { logEvent } from "@/lib/analytics";

interface Props {
  languageId: LanguageId;
  initialCode?: string;
  /** When set, each Run is logged as a code_run event for this module. */
  moduleId?: string;
}

export function Playground({ languageId, initialCode, moduleId }: Props) {
  const lang = getLanguage(languageId);
  const [code, setCode] = useState(initialCode ?? lang.starter);
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<RunPhase>("running");
  const [error, setError] = useState<string | null>(null);
  const [executedCode, setExecutedCode] = useState<string | null>(null);

  async function handleRun() {
    void logEvent("code_run", moduleId ? { module_id: moduleId } : {});
    setRunning(true);
    setPhase("running");
    setError(null);
    setResult(null);
    setExecutedCode(code);
    try {
      const runner = await getRunner(languageId);
      const res = await runner.run({ languageId, code, onPhase: setPhase });
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
    setExecutedCode(null);
  }

  return (
    <div className="border border-ink-faint/30">
      <div className="flex items-center justify-between bg-inverse px-4 py-2">
        <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-on-inverse/70">
          {lang.label}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="border border-on-inverse/20 text-on-inverse/70 font-sans text-xs uppercase tracking-widest px-3 py-1 hover:text-on-inverse transition-colors duration-150"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleRun}
            disabled={running}
            className="bg-accent-strong text-white font-sans text-xs uppercase tracking-widest px-4 py-1 disabled:opacity-50"
          >
            {running ? (phase === "loading" ? "Loading…" : "Running…") : "Run"}
          </button>
        </div>
      </div>
      <CodeEditor languageId={languageId} value={code} onChange={setCode} readOnly={running} />
      <OutputPanel result={result} running={running} phase={phase} error={error} executedCode={executedCode ?? undefined} />
    </div>
  );
}
