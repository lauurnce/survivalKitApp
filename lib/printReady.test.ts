// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { consumePrintParam, waitForPrintReady } from "./printReady";

afterEach(() => {
  document.body.innerHTML = "";
  window.history.replaceState(null, "", "/");
});

describe("consumePrintParam", () => {
  it("reports and strips print=1, keeping other params", () => {
    window.history.replaceState(null, "", "/m?a=1&print=1");
    expect(consumePrintParam()).toBe(true);
    expect(window.location.pathname + window.location.search).toBe("/m?a=1");
    expect(consumePrintParam()).toBe(false);
  });

  it("ignores other values", () => {
    window.history.replaceState(null, "", "/m?print=yes");
    expect(consumePrintParam()).toBe(false);
    expect(window.location.search).toBe("?print=yes");
  });
});

describe("waitForPrintReady", () => {
  it("resolves straight away with no pending marker", async () => {
    await expect(waitForPrintReady({ timeoutMs: 1000 })).resolves.toBeUndefined();
  });

  it("waits for the pending marker to clear", async () => {
    document.body.innerHTML = '<span data-reader-unlock="pending"></span>';
    let done = false;
    const p = waitForPrintReady({ timeoutMs: 2000, intervalMs: 10 }).then(() => {
      done = true;
    });
    await new Promise((r) => setTimeout(r, 60));
    expect(done).toBe(false);
    document.body.innerHTML = "";
    await p;
    expect(done).toBe(true);
  });

  it("gives up after the timeout rather than never printing", async () => {
    document.body.innerHTML = '<span data-reader-unlock="pending"></span>';
    const started = Date.now();
    await waitForPrintReady({ timeoutMs: 100, intervalMs: 10 });
    expect(Date.now() - started).toBeGreaterThanOrEqual(90);
  });
});
