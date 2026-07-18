import { describe, it, expect, vi, beforeEach } from "vitest";

import { getDeviceId, getClientDeviceSignals } from "./device";

describe("getDeviceId", () => {
  beforeEach(() => {
    localStorage.clear();
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
