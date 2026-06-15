import type { Runner, RunRequest, RunResult } from "@/lib/ide/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sqlPromise: Promise<any> | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
