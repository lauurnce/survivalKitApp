import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Runner } from "@/lib/ide/types";

type Msg = { id: string | number; code: string };

// Stand-in for public/pyodideWorker.js: answers each message only when the
// test says so, so loading and running can take as long as a test needs.
class FakeWorker {
  static all: FakeWorker[] = [];
  onmessage: ((e: MessageEvent) => void) | null = null;
  onerror: ((e: unknown) => void) | null = null;
  posted: Msg[] = [];
  terminated = false;
  constructor(public url: string) {
    FakeWorker.all.push(this);
  }
  postMessage(msg: Msg) {
    this.posted.push(msg);
  }
  terminate() {
    this.terminated = true;
  }
  reply(msg: Msg, data: { stdout?: string; stderr?: string; exitCode?: number } = {}) {
    this.onmessage?.({
      data: { id: msg.id, stdout: data.stdout ?? "", stderr: data.stderr ?? "", exitCode: data.exitCode ?? 0 },
    } as MessageEvent);
  }
  last(): Msg {
    return this.posted[this.posted.length - 1];
  }
}

let runner: Runner;
let TIMEOUT_MS: number;
let LOAD_TIMEOUT_MS: number;

beforeEach(async () => {
  vi.useFakeTimers();
  FakeWorker.all = [];
  vi.stubGlobal("Worker", FakeWorker);
  vi.resetModules();
  const mod = await import("./pyodideRunner");
  runner = mod.pyodideRunner;
  TIMEOUT_MS = mod.TIMEOUT_MS;
  LOAD_TIMEOUT_MS = mod.LOAD_TIMEOUT_MS;
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

/** Let pending promise callbacks run without advancing the clock. */
const flush = () => vi.advanceTimersByTimeAsync(0);

describe("pyodideRunner", () => {
  it("does not count a slow Python download against the execution timeout", async () => {
    const phases: string[] = [];
    const done = runner.run({ languageId: "python", code: 'print("hi")', onPhase: (p) => phases.push(p) });
    await flush();

    const w = FakeWorker.all[0];
    // The first message is the load, carrying no student code.
    expect(w.posted).toHaveLength(1);
    expect(w.last().code).toBe("");
    expect(phases).toEqual(["loading"]);

    // 30 s of downloading at slow-4G speeds: far past the 8 s run limit.
    await vi.advanceTimersByTimeAsync(30_000);
    expect(w.terminated).toBe(false);
    w.reply(w.posted[0]);
    await flush();

    expect(phases).toEqual(["loading", "running"]);
    expect(w.posted).toHaveLength(2);
    expect(w.last().code).toBe('print("hi")');
    w.reply(w.last(), { stdout: "hi\n" });

    const res = await done;
    expect(res.timedOut).toBe(false);
    expect(res.stdout).toBe("hi\n");
    expect(res.exitCode).toBe(0);
  });

  it("reuses the loaded runtime for the next run without reloading", async () => {
    const first = runner.run({ languageId: "python", code: "1" });
    await flush();
    const w = FakeWorker.all[0];
    w.reply(w.posted[0]);
    await flush();
    w.reply(w.last());
    await first;

    const phases: string[] = [];
    const second = runner.run({ languageId: "python", code: "2", onPhase: (p) => phases.push(p) });
    await flush();
    expect(FakeWorker.all).toHaveLength(1);
    expect(phases).toEqual(["running"]);
    expect(w.last().code).toBe("2");
    w.reply(w.last());
    expect((await second).timedOut).toBe(false);
  });

  it("times out user code after 8 s of running, then reloads cleanly on the next run", async () => {
    const looping = runner.run({ languageId: "python", code: "while True: pass" });
    await flush();
    const w = FakeWorker.all[0];
    w.reply(w.posted[0]);
    await flush();

    await vi.advanceTimersByTimeAsync(TIMEOUT_MS - 1);
    expect(w.terminated).toBe(false);
    await vi.advanceTimersByTimeAsync(1);

    const res = await looping;
    expect(res.timedOut).toBe(true);
    expect(res.stderr).toMatch(/timed out \(8s limit\)/i);
    expect(res.stderr).toMatch(/restarted .* reload on your next run/i);
    // The only way to stop the loop.
    expect(w.terminated).toBe(true);

    const phases: string[] = [];
    const next = runner.run({ languageId: "python", code: 'print("ok")', onPhase: (p) => phases.push(p) });
    await flush();
    expect(FakeWorker.all).toHaveLength(2);
    const fresh = FakeWorker.all[1];
    expect(phases).toEqual(["loading"]);
    fresh.reply(fresh.posted[0]);
    await flush();
    fresh.reply(fresh.last(), { stdout: "ok\n" });
    expect((await next).stdout).toBe("ok\n");
  });

  it("reports a failed load as a load problem, not the student's code, and retries next run", async () => {
    const done = runner.run({ languageId: "python", code: "1" });
    await flush();
    const w = FakeWorker.all[0];
    w.reply(w.posted[0], { exitCode: 1, stderr: "NetworkError" });

    const res = await done;
    expect(res.timedOut).toBe(false);
    expect(res.stderr).toMatch(/python failed to load/i);
    expect(res.stderr).not.toMatch(/infinite loop/i);
    expect(w.posted).toHaveLength(1); // the code never ran

    void runner.run({ languageId: "python", code: "1" });
    await flush();
    expect(FakeWorker.all).toHaveLength(2);
  });

  it("gives up on a load that stalls past its own, generous limit", async () => {
    const done = runner.run({ languageId: "python", code: "1" });
    await vi.advanceTimersByTimeAsync(LOAD_TIMEOUT_MS);
    const res = await done;
    expect(LOAD_TIMEOUT_MS).toBeGreaterThanOrEqual(60_000);
    expect(res.stderr).toMatch(/took longer than .* to load/i);
    expect(FakeWorker.all[0].terminated).toBe(true);
  });

  it("queues runs from two editors so neither steals the other's reply", async () => {
    const a = runner.run({ languageId: "python", code: "a" });
    const b = runner.run({ languageId: "python", code: "b" });
    await flush();
    const w = FakeWorker.all[0];
    w.reply(w.posted[0]);
    await flush();
    expect(w.last().code).toBe("a");
    w.reply(w.last(), { stdout: "A" });
    await flush();
    expect(w.last().code).toBe("b");
    w.reply(w.last(), { stdout: "B" });
    expect((await a).stdout).toBe("A");
    expect((await b).stdout).toBe("B");
  });
});
