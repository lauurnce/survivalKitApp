"use client";

import type { ReactNode } from "react";
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

function Shell({ children }: { children: ReactNode }) {
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
