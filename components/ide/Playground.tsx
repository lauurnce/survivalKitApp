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
            className="border border-paper/20 text-paper/70 font-sans text-xs uppercase tracking-widest px-3 py-1 hover:text-paper transition-colors duration-150"
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
