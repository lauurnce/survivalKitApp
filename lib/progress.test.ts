import { describe, it, expect, vi, beforeEach } from "vitest";

let mockDeviceId = "device-abc";
vi.mock("./device", () => ({
  getDeviceId: () => mockDeviceId,
}));

import { fetchCompletedModules, setModuleCompleted } from "./progress";

describe("fetchCompletedModules", () => {
  beforeEach(() => {
    mockDeviceId = "device-abc";
    vi.restoreAllMocks();
  });

  it("returns an empty set when there is no device id", async () => {
    mockDeviceId = "";
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    expect(await fetchCompletedModules()).toEqual(new Set());
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("fetches completed modules for the device", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ completed: ["m1", "m2"] }), { status: 200 })
    );
    const result = await fetchCompletedModules();
    expect(result).toEqual(new Set(["m1", "m2"]));
    const url = String(fetchSpy.mock.calls[0][0]);
    expect(url).toContain("device_id=device-abc");
  });

  it("restricts the query to the given module ids", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ completed: [] }), { status: 200 })
    );
    await fetchCompletedModules(["m1", "m2"]);
    const url = decodeURIComponent(String(fetchSpy.mock.calls[0][0]));
    expect(url).toContain("module_ids=m1,m2");
  });

  it("returns an empty set on a non-ok response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("nope", { status: 500 })
    );
    expect(await fetchCompletedModules()).toEqual(new Set());
  });

  it("returns an empty set when the request throws", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network down"));
    expect(await fetchCompletedModules()).toEqual(new Set());
  });
});

describe("setModuleCompleted", () => {
  beforeEach(() => {
    mockDeviceId = "device-abc";
    vi.restoreAllMocks();
  });

  it("returns null when there is no device id", async () => {
    mockDeviceId = "";
    expect(await setModuleCompleted("m1", true)).toBeNull();
  });

  it("posts the completion state and returns the new value", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ completed: true }), { status: 200 })
    );
    expect(await setModuleCompleted("m1", true)).toBe(true);
    const [, init] = fetchSpy.mock.calls[0];
    expect(JSON.parse(String(init?.body))).toEqual({
      device_id: "device-abc",
      module_id: "m1",
      completed: true,
    });
  });

  it("returns null on a non-ok response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("nope", { status: 429 })
    );
    expect(await setModuleCompleted("m1")).toBeNull();
  });

  it("returns null when the response has no boolean completed field", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({}), { status: 200 })
    );
    expect(await setModuleCompleted("m1")).toBeNull();
  });
});
