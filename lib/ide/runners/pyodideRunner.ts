import type { Runner, RunRequest, RunResult } from "@/lib/ide/types";
import { truncateOutput } from "@/lib/ide/format";

// Pyodide is heavy (~6MB). Load once, cache the promise.
let pyodidePromise: Promise<any> | null = null;

async function loadPyodide(): Promise<any> {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mod: any = await (
        // @ts-expect-error dynamic https import not resolvable by TS
        import(/* webpackIgnore: true */ "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.mjs")
      );
      const { loadPyodide } = mod;
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
