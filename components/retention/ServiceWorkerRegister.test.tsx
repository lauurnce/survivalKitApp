import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import {
  registerServiceWorker,
  saveLessonForOffline,
  ServiceWorkerRegister,
  SERVICE_WORKER_URL,
} from "./ServiceWorkerRegister";

vi.mock("next/navigation", () => ({ usePathname: () => "/year" }));

const logEvent = vi.fn();
vi.mock("@/lib/analytics", () => ({ logEvent: (...args: unknown[]) => logEvent(...args) }));

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

describe("ServiceWorkerRegister", () => {
  it("logs an install however it happened", () => {
    render(<ServiceWorkerRegister />);
    window.dispatchEvent(new Event("appinstalled"));
    expect(logEvent).toHaveBeenCalledWith("pwa_installed");
  });
});

describe("saveLessonForOffline", () => {
  function readyNavigator() {
    const postMessage = vi.fn();
    const nav = { serviceWorker: { ready: Promise.resolve({ active: { postMessage } }) } } as unknown as Navigator;
    return { nav, postMessage };
  }

  it("asks the worker to save a lesson", async () => {
    const { nav, postMessage } = readyNavigator();
    expect(saveLessonForOffline("/year/y/subjects/s/modules/m", nav, true)).toBe(true);
    await Promise.resolve();
    await Promise.resolve();
    expect(postMessage).toHaveBeenCalledWith({ type: "SAVE_LESSON", url: "/year/y/subjects/s/modules/m" });
  });

  it("ignores pages that are not lessons, and dev builds", () => {
    const { nav } = readyNavigator();
    expect(saveLessonForOffline("/year", nav, true)).toBe(false);
    expect(saveLessonForOffline("/year/y/subjects/s/modules/m", nav, false)).toBe(false);
  });
});
