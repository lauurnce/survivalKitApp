import type { Runner, RunRequest, RunResult } from "@/lib/ide/types";
import { truncateOutput } from "@/lib/ide/format";

const TIMEOUT_MS = 8_000;

// One worker instance — terminated and recreated whenever a run times out
let worker: Worker | null = null;
let pendingResolve: ((r: RunResult) => void) | null = null;
let pendingStart = 0;

function spawnWorker(): Worker {
  const w = new Worker("/pyodideWorker.js");

  w.onmessage = (e: MessageEvent<{ stdout: string; stderr: string; exitCode: number }>) => {
    if (!pendingResolve) return;
    const resolve = pendingResolve;
    pendingResolve = null;
    const out = truncateOutput(e.data.stdout);
    const err = truncateOutput(e.data.stderr);
    resolve({
      stdout: out.text,
      stderr: err.text,
      exitCode: e.data.exitCode,
      timedOut: false,
      durationMs: Math.round(performance.now() - pendingStart),
    });
  };

  w.onerror = () => {
    if (pendingResolve) {
      pendingResolve({
        stdout: "",
        stderr: "Python runtime error — please try again",
        exitCode: 1,
        timedOut: false,
        durationMs: Math.round(performance.now() - pendingStart),
      });
      pendingResolve = null;
    }
    worker = null;
  };

  return w;
}

function getWorker(): Worker {
  if (!worker) worker = spawnWorker();
  return worker;
}

export const pyodideRunner: Runner = {
  async run(req: RunRequest): Promise<RunResult> {
    return new Promise<RunResult>((resolve) => {
      const w = getWorker();
      pendingStart = performance.now();
      pendingResolve = resolve;

      const timeoutId = setTimeout(() => {
        // Terminate the frozen worker and clear state so the next run gets a fresh one
        w.terminate();
        worker = null;
        pendingResolve = null;
        resolve({
          stdout: "",
          stderr: `Execution timed out (${TIMEOUT_MS / 1000}s limit). Avoid infinite loops.`,
          exitCode: 1,
          timedOut: true,
          durationMs: TIMEOUT_MS,
        });
      }, TIMEOUT_MS);

      w.onmessage = (e: MessageEvent<{ stdout: string; stderr: string; exitCode: number }>) => {
        clearTimeout(timeoutId);
        pendingResolve = null;
        const out = truncateOutput(e.data.stdout);
        const err = truncateOutput(e.data.stderr);
        resolve({
          stdout: out.text,
          stderr: err.text,
          exitCode: e.data.exitCode,
          timedOut: false,
          durationMs: Math.round(performance.now() - pendingStart),
        });
      };

      w.postMessage({ id: Date.now(), code: req.code });
    });
  },
};
