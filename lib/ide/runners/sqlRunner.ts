import type { Runner, RunRequest, RunResult } from "@/lib/ide/types";
import type { SqlJsStatic } from "sql.js";

let sqlPromise: Promise<SqlJsStatic> | null = null;

async function initFrom(base: string): Promise<SqlJsStatic> {
  const initSqlJs = (await import("sql.js")).default;
  return initSqlJs({ locateFile: (f: string) => `${base}${f}` });
}

// sql.js ships its wasm separately. It is self-hosted at /sqljs/ because the
// sql.js.org GitHub-Pages CDN intermittently fails with "both async and sync
// fetching of the wasm failed"; the CDN is kept only as a fallback. On total
// failure the cached promise is reset so the next call can retry.
async function loadSql(): Promise<SqlJsStatic> {
  if (!sqlPromise) {
    sqlPromise = initFrom("/sqljs/")
      .catch(() => initFrom("https://sql.js.org/dist/"))
      .catch((e: unknown) => {
        sqlPromise = null;
        throw e;
      });
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
