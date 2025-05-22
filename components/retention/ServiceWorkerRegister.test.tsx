import { describe, expect, it, vi } from "vitest";
import { registerServiceWorker, SERVICE_WORKER_URL } from "./ServiceWorkerRegister";

function fakeNavigator(register = vi.fn(() => Promise.resolve({}))) {
  return { nav: { serviceWorker: { register } } as unknown as Navigator, register };
}

describe("registerServiceWorker", () => {
  it("registers /sw.js at the root scope in production", () => {
    const { nav, register } = fakeNavigator();
    expect(registerServiceWorker(nav, true)).toBe(true);
    expect(register).toHaveBeenCalledWith(SERVICE_WORKER_URL, { scope: "/" });
  });

  it("does nothing outside production", () => {
    const { nav, register } = fakeNavigator();
    expect(registerServiceWorker(nav, false)).toBe(false);
    expect(register).not.toHaveBeenCalled();
  });

  it("does nothing where service workers are unsupported", () => {
    expect(registerServiceWorker({} as Navigator, true)).toBe(false);
  });

  it("swallows a rejected registration", async () => {
    const { nav } = fakeNavigator(vi.fn(() => Promise.reject(new Error("blocked"))));
    expect(() => registerServiceWorker(nav, true)).not.toThrow();
    await Promise.resolve();
  });
});
