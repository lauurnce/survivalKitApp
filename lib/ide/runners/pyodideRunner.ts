import type { Runner, RunRequest, RunResult } from "@/lib/ide/types";
import { truncateOutput } from "@/lib/ide/format";

/** Limit on running the student's code. Starts only once Python has loaded. */
export const TIMEOUT_MS = 8_000;

/**
 * Limit on loading the runtime (~5.4 MB from the CDN). Deliberately generous:
 * at 1.6 Mbps the download alone takes ~30 s. It exists only so a stalled CDN
 * request ends in a message instead of a spinner that never stops.
 */
export const LOAD_TIMEOUT_MS = 180_000;

// public/pyodideWorker.js loads Pyodide on its first message and answers every
// message with { id, stdout, stderr, exitCode }. Sending it empty code is how
// the runner waits for the load on its own, outside the execution timeout.
const LOAD_ID = "load";
const LOAD_FAILED = "Python failed to load. Check your connection and run again.";

type WorkerReply = { id: string | number; stdout: string; stderr: string; exitCode: number };

// One worker, kept loaded between runs. It is terminated, and so reloaded on
// the next run, only when a run times out: the one way to stop an infinite loop.
let worker: Worker | null = null;
let ready: Promise<Worker> | null = null;

// Every Playground on a page shares the one worker, which handles one message
// at a time. Runs queue up so their replies and timers never cross.
let queue: Promise<unknown> = Promise.resolve();

function discardWorker(w: Worker) {
  w.terminate();
  if (worker === w) {
    worker = null;
    ready = null;
  }
}

function loadWorker(): Promise<Worker> {
  if (ready) return ready;

  const w = new Worker("/pyodideWorker.js");
  worker = w;
  ready = new Promise<Worker>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      discardWorker(w);
      reject(
        new Error(
          `Python took longer than ${LOAD_TIMEOUT_MS / 1000}s to load. Check your connection and run again.`
        )
      );
    }, LOAD_TIMEOUT_MS);

    w.onmessage = (e: MessageEvent<WorkerReply>) => {
      if (e.data.id !== LOAD_ID) return;
      clearTimeout(timeoutId);
      if (e.data.exitCode === 0) {
        resolve(w);
        return;
      }
      discardWorker(w);
      reject(new Error(LOAD_FAILED));
    };

    w.onerror = () => {
      clearTimeout(timeoutId);
      discardWorker(w);
      reject(new Error(LOAD_FAILED));
    };

    w.postMessage({ id: LOAD_ID, code: "" });
  });
  return ready;
}

function execute(w: Worker, code: string): Promise<RunResult> {
  return new Promise<RunResult>((resolve) => {
    const id = Date.now();
    const start = performance.now();

    const timeoutId = setTimeout(() => {
      // Killing the worker is the only way to stop a runaway program, and it
      // takes the loaded runtime with it. The next run loads a fresh one.
      discardWorker(w);
      resolve({
        stdout: "",
        stderr:
          `Execution timed out (${TIMEOUT_MS / 1000}s limit). Avoid infinite loops.\n` +
          "Python was restarted to stop it and will reload on your next run.",
        exitCode: 1,
        timedOut: true,
        durationMs: TIMEOUT_MS,
      });
    }, TIMEOUT_MS);

    w.onmessage = (e: MessageEvent<WorkerReply>) => {
      if (e.data.id !== id) return;
      clearTimeout(timeoutId);
      const out = truncateOutput(e.data.stdout);
      const err = truncateOutput(e.data.stderr);
      resolve({
        stdout: out.text,
        stderr: err.text,
        exitCode: e.data.exitCode,
        timedOut: false,
        durationMs: Math.round(performance.now() - start),
      });
    };

    w.onerror = () => {
      clearTimeout(timeoutId);
      discardWorker(w);
      resolve({
        stdout: "",
        stderr: "Python runtime error — please try again",
        exitCode: 1,
        timedOut: false,
        durationMs: Math.round(performance.now() - start),
      });
    };

    w.postMessage({ id, code });
  });
}

async function runOnce(req: RunRequest): Promise<RunResult> {
  const start = performance.now();
  if (!ready) req.onPhase?.("loading");
  let w: Worker;
  try {
    w = await loadWorker();
  } catch (e) {
    return {
      stdout: "",
      stderr: e instanceof Error ? e.message : LOAD_FAILED,
      exitCode: 1,
      timedOut: false,
      durationMs: Math.round(performance.now() - start),
    };
  }
  req.onPhase?.("running");
  return execute(w, req.code);
}

export const pyodideRunner: Runner = {
  run(req: RunRequest): Promise<RunResult> {
    const result = queue.then(() => runOnce(req));
    queue = result.catch(() => undefined);
    return result;
  },
};
