import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// The client half of the reader counters: a signed-out read must reach
// /api/events even when the visitor has no stored device id, and a page
// prerendered behind the reader's back must not send anything until viewed.

let storedDeviceId = "";
vi.mock("./device", () => ({
  getDeviceId: () => storedDeviceId,
}));

import { logEvent, resetPageLoadDeviceId } from "./analytics";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const lesson = {
  year_id: "00000000-0000-0000-0000-000000000001",
  subject_id: "11111111-1111-4111-8111-111111111111",
  module_id: "22222222-2222-4222-8222-222222222222",
};

let fetchMock: ReturnType<typeof vi.fn>;
function sentBodies() {
  return fetchMock.mock.calls.map(([, init]) => JSON.parse((init as RequestInit).body as string));
}

beforeEach(() => {
  storedDeviceId = "";
  resetPageLoadDeviceId();
  fetchMock = vi.fn(() => Promise.resolve(new Response("{}")));
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete (document as { prerendering?: boolean }).prerendering;
});

describe("logEvent — signed-out reads always reach the counter", () => {
  it("sends module_open with the stored device id", async () => {
    storedDeviceId = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
    await logEvent("module_open", lesson);
    expect(sentBodies()).toEqual([
      { device_id: storedDeviceId, event_type: "module_open", ...lesson },
    ]);
  });

  it("still sends the read when storage is blocked, with one id for the page load", async () => {
    await logEvent("module_open", lesson);
    await logEvent("section_view", { module_id: lesson.module_id, section_id: "33333333-3333-4333-8333-333333333333" });
    const [first, second] = sentBodies();
    expect(first.event_type).toBe("module_open");
    expect(first.device_id).toMatch(UUID);
    expect(second.device_id).toBe(first.device_id);
  });

  it("falls back to getRandomValues when randomUUID is unavailable", async () => {
    const original = crypto.randomUUID;
    Object.defineProperty(crypto, "randomUUID", { value: undefined, configurable: true });
    try {
      await logEvent("module_open", lesson);
    } finally {
      Object.defineProperty(crypto, "randomUUID", { value: original, configurable: true });
    }
    expect(sentBodies()[0].device_id).toMatch(UUID);
  });
});

describe("logEvent — prerendered pages", () => {
  it("holds the read until the prerendered page is actually shown", async () => {
    storedDeviceId = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
    Object.defineProperty(document, "prerendering", { value: true, configurable: true });

    const pending = logEvent("module_open", lesson);
    await new Promise((r) => setTimeout(r, 0));
    expect(fetchMock).not.toHaveBeenCalled();

    Object.defineProperty(document, "prerendering", { value: false, configurable: true });
    document.dispatchEvent(new Event("prerenderingchange"));
    await pending;
    expect(sentBodies()).toHaveLength(1);
  });

  it("never sends for a prerender that is never shown", async () => {
    storedDeviceId = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
    Object.defineProperty(document, "prerendering", { value: true, configurable: true });
    void logEvent("module_open", lesson);
    await new Promise((r) => setTimeout(r, 10));
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
