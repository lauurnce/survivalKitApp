// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";
import { savePosition, loadPosition, clearPosition, RESUME_MAX_AGE_MS } from "./resume";

const NOW = 1_750_000_000_000;

describe("resume position", () => {
  beforeEach(() => localStorage.clear());

  it("round-trips a mid-lesson position", () => {
    savePosition("m1", 0.4, "Algorithms", NOW);
    expect(loadPosition("m1", NOW + 1000)).toEqual({ fraction: 0.4, heading: "Algorithms", savedAt: NOW });
  });

  it("keeps modules apart", () => {
    savePosition("m1", 0.4, null, NOW);
    expect(loadPosition("m2", NOW)).toBeNull();
  });

  it("does not offer a barely-started or finished lesson", () => {
    savePosition("m1", 0.05, null, NOW);
    expect(loadPosition("m1", NOW)).toBeNull();
    savePosition("m1", 0.99, null, NOW);
    expect(loadPosition("m1", NOW)).toBeNull();
  });

  it("expires old positions", () => {
    savePosition("m1", 0.5, null, NOW);
    expect(loadPosition("m1", NOW + RESUME_MAX_AGE_MS + 1)).toBeNull();
  });

  it("ignores corrupt or future-dated entries", () => {
    localStorage.setItem("bsit:lesson-pos:m1", "{not json");
    expect(loadPosition("m1", NOW)).toBeNull();
    localStorage.setItem("bsit:lesson-pos:m1", JSON.stringify({ fraction: 0.5, savedAt: NOW + 10_000 }));
    expect(loadPosition("m1", NOW)).toBeNull();
  });

  it("clears", () => {
    savePosition("m1", 0.5, null, NOW);
    clearPosition("m1");
    expect(loadPosition("m1", NOW)).toBeNull();
  });

  it("survives storage that throws", () => {
    const get = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const set = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(() => savePosition("m1", 0.5, null, NOW)).not.toThrow();
    expect(loadPosition("m1", NOW)).toBeNull();
    get.mockRestore();
    set.mockRestore();
  });
});
