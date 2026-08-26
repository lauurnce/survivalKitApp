"use client";

import type { ReactNode } from "react";
import type { RunResult } from "@/lib/ide/types";

interface Props {
  result: RunResult | null;
  running: boolean;
  error: string | null;
  executedCode?: string;
}

export function OutputPanel({ result, running, error, executedCode }: Props) {
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
      {executedCode?.trim() && (
        <div className="mb-3">
          <div className="text-label-sm uppercase tracking-widest text-taupe/60">Executed Script</div>
          <pre className="whitespace-pre-wrap mt-1 text-paper/50">{executedCode}</pre>
        </div>
      )}
      {result.statements
        ? result.statements.map((stmt, i) => (
            <div key={i} className="mb-3">
              <pre className="whitespace-pre-wrap mb-1 text-taupe/60">{stmt.sql}</pre>
              {stmt.columns && (
                <SqlTable table={{ columns: stmt.columns, rows: stmt.rows ?? [] }} />
              )}
            </div>
          ))
        : result.table && <SqlTable table={result.table} />}
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
  const rowCount = table.rows.length;
  return (
    <div className="overflow-x-auto mb-3">
      <table className="w-full text-sm border-collapse">
        <caption className="sr-only">
          Query result, {rowCount} {rowCount === 1 ? "row" : "rows"}
        </caption>
        <thead>
          <tr>
            {table.columns.map((c, j) => (
              <th key={`${c}-${j}`} scope="col" className="text-left py-1 pr-4 border-b border-paper/20 text-taupe">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="py-1 pr-4 border-b border-paper/10">
                  {cell == null ? <span className="italic text-taupe/40">NULL</span> : String(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-1 text-label-sm text-taupe/60">
        {rowCount} {rowCount === 1 ? "row" : "rows"}
      </div>
    </div>
  );
}
