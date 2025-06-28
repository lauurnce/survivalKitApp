// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import {
  consumePrintAfterUnlock,
  consumePrintParam,
  PRINT_AFTER_UNLOCK_KEY,
  PRINT_AFTER_UNLOCK_TTL_MS,
  rememberPrintAfterUnlock,
  waitForPrintReady,
} from "./printReady";

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

describe("print-after-unlock intent", () => {
  const PATH = "/year/y/subjects/s/modules/m";

  afterEach(() => {
    sessionStorage.clear();
  });

  it("fires once for the module it was parked for", () => {
    rememberPrintAfterUnlock(PATH, 1_000);
    expect(consumePrintAfterUnlock(PATH, 2_000)).toBe(true);
    expect(consumePrintAfterUnlock(PATH, 2_000)).toBe(false);
  });

  it("is cleared, not honoured, on a different module", () => {
    rememberPrintAfterUnlock(PATH, 1_000);
    expect(consumePrintAfterUnlock("/year/y/subjects/s/modules/other", 2_000)).toBe(false);
    expect(sessionStorage.getItem(PRINT_AFTER_UNLOCK_KEY)).toBeNull();
  });

  it("expires after the TTL", () => {
    rememberPrintAfterUnlock(PATH, 0);
    expect(consumePrintAfterUnlock(PATH, PRINT_AFTER_UNLOCK_TTL_MS + 1)).toBe(false);
  });

  it("treats junk in storage as no intent", () => {
    sessionStorage.setItem(PRINT_AFTER_UNLOCK_KEY, "{not json");
    expect(consumePrintAfterUnlock(PATH)).toBe(false);
    expect(sessionStorage.getItem(PRINT_AFTER_UNLOCK_KEY)).toBeNull();
  });
});
