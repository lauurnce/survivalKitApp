import { describe, it, expect, vi, beforeEach } from "vitest";

import { getDeviceId, getClientDeviceSignals, __resetDeviceSyncForTests } from "./device";

describe("getDeviceId", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    __resetDeviceSyncForTests();
    vi.restoreAllMocks();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", { status: 200 }));
  });

  it("generates a UUID and persists it in localStorage", () => {
    const id = getDeviceId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
    expect(localStorage.getItem("bsit_device_id")).toBe(id);
  });

  it("returns the same id on subsequent calls", () => {
    const first = getDeviceId();
    expect(getDeviceId()).toBe(first);
  });

  it("reuses an id already present in localStorage", () => {
    localStorage.setItem("bsit_device_id", "11111111-1111-1111-1111-111111111111");
    expect(getDeviceId()).toBe("11111111-1111-1111-1111-111111111111");
  });
});

// CR-05: /api/device used to be POSTed on every full page load, and the
// per-IP limit returned 429s to whole classrooms behind one campus NAT.
describe("device cookie sync", () => {
  const ID = "11111111-1111-4111-8111-111111111111";
  let fetchMock: ReturnType<typeof vi.fn>;

  function clearMarkerCookie() {
    document.cookie = "bsit_device_ok=; max-age=0; path=/";
  }

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    clearMarkerCookie();
    __resetDeviceSyncForTests();
    vi.restoreAllMocks();
    vi.useRealTimers();
    localStorage.setItem("bsit_device_id", ID);
    fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
  });

  it("POSTs once when the browser has never registered", async () => {
    getDeviceId();
    getDeviceId();
    await Promise.resolve();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/device");
  });

  it("skips the POST when the server's marker cookie already names this id", () => {
    document.cookie = `bsit_device_ok=${ID}; path=/`;
    getDeviceId();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("still POSTs when the marker cookie names a different id", () => {
    document.cookie = "bsit_device_ok=22222222-2222-4222-8222-222222222222; path=/";
    getDeviceId();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("skips the POST on a later page load in the same browser session", async () => {
    getDeviceId();
    await vi.waitFor(() => expect(sessionStorage.getItem("bsit_device_synced")).toBe(ID));
    // A new document load resets module state, as a hard navigation would.
    __resetDeviceSyncForTests();
    getDeviceId();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("retries once, after a backoff, when the server answers 429", async () => {
    vi.useFakeTimers();
    fetchMock.mockResolvedValue(new Response("{}", { status: 429 }));
    getDeviceId();
    await vi.advanceTimersByTimeAsync(0);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(29_000);
    expect(fetchMock).toHaveBeenCalledTimes(1); // not before the backoff

    await vi.advanceTimersByTimeAsync(60_000);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // Only once: a second 429 doesn't start a retry loop.
    await vi.advanceTimersByTimeAsync(10 * 60_000);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(sessionStorage.getItem("bsit_device_synced")).toBeNull();
  });

  it("does not mark the session synced after a failed POST", async () => {
    fetchMock.mockResolvedValue(new Response("{}", { status: 500 }));
    getDeviceId();
    await Promise.resolve();
    await Promise.resolve();
    expect(sessionStorage.getItem("bsit_device_synced")).toBeNull();
  });
});

describe("getClientDeviceSignals", () => {
  it("reports the viewport width", () => {
    const signals = getClientDeviceSignals();
    expect(typeof signals.screen_width).toBe("number");
  });

  it("maps a missing maxTouchPoints to null", () => {
    // jsdom does not define navigator.maxTouchPoints
    expect(getClientDeviceSignals().max_touch_points).toBeNull();
  });

  it("reports maxTouchPoints when the browser provides it", () => {
    Object.defineProperty(navigator, "maxTouchPoints", {
      value: 5,
      configurable: true,
    });
    expect(getClientDeviceSignals().max_touch_points).toBe(5);
    // @ts-expect-error cleanup of the test-only property
    delete navigator.maxTouchPoints;
  });
});
