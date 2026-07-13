import { describe, it, expect } from "vitest";
import {
  parseProgressCardParams,
  buildProgressCardUrl,
  progressCardFilename,
  PROGRESS_CARD_LIMITS,
} from "./shareCard";

function sp(entries: Record<string, string>): URLSearchParams {
  return new URLSearchParams(entries);
}

describe("parseProgressCardParams", () => {
  it("accepts minimal valid params", () => {
    const r = parseProgressCardParams(sp({ subject: "Computer Programming 1", count: "8" }));
    expect(r).toEqual({
      ok: true,
      value: { subject: "Computer Programming 1", count: 8 },
    });
  });

  it("carries optional module and name through", () => {
    const r = parseProgressCardParams(
      sp({ subject: "CP1", count: "3", module: "Loops & Iteration", name: "Andrea" })
    );
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.module).toBe("Loops & Iteration");
      expect(r.value.name).toBe("Andrea");
    }
  });

  it("rejects missing or blank subject", () => {
    expect(parseProgressCardParams(sp({ count: "3" })).ok).toBe(false);
    expect(parseProgressCardParams(sp({ subject: "   ", count: "3" })).ok).toBe(false);
  });

  it("rejects missing, non-integer, and sub-1 count", () => {
    expect(parseProgressCardParams(sp({ subject: "CP1" })).ok).toBe(false);
    expect(parseProgressCardParams(sp({ subject: "CP1", count: "abc" })).ok).toBe(false);
    expect(parseProgressCardParams(sp({ subject: "CP1", count: "2.5" })).ok).toBe(false);
    expect(parseProgressCardParams(sp({ subject: "CP1", count: "0" })).ok).toBe(false);
  });

  it("clamps count to countMax", () => {
    const r = parseProgressCardParams(sp({ subject: "CP1", count: "5000" }));
    expect(r.ok && r.value.count).toBe(PROGRESS_CARD_LIMITS.countMax);
  });

  it("truncates over-length subject/module/name with an ellipsis", () => {
    const r = parseProgressCardParams(
      sp({
        subject: "S".repeat(60),
        count: "1",
        module: "M".repeat(100),
        name: "N".repeat(40),
      })
    );
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.subject).toBe("S".repeat(PROGRESS_CARD_LIMITS.subject) + "…");
      expect(r.value.module).toBe("M".repeat(PROGRESS_CARD_LIMITS.module) + "…");
      expect(r.value.name).toBe("N".repeat(PROGRESS_CARD_LIMITS.name) + "…");
    }
  });

  it("drops empty optional params instead of keeping empty strings", () => {
    const r = parseProgressCardParams(sp({ subject: "CP1", count: "1", module: "", name: " " }));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.module).toBeUndefined();
      expect(r.value.name).toBeUndefined();
    }
  });
});

describe("buildProgressCardUrl", () => {
  it("builds a relative URL with encoded params, omitting absent optionals", () => {
    const url = buildProgressCardUrl({ subject: "Computer Programming 1", count: 8 });
    expect(url).toBe("/api/card/progress?subject=Computer+Programming+1&count=8");
  });

  it("includes module and name when present", () => {
    const url = buildProgressCardUrl({
      subject: "CP1",
      count: 3,
      module: "Loops & Iteration",
      name: "Andrea",
    });
    const parsed = new URLSearchParams(url.split("?")[1]);
    expect(parsed.get("module")).toBe("Loops & Iteration");
    expect(parsed.get("name")).toBe("Andrea");
  });
});

describe("progressCardFilename", () => {
  it("slugifies the subject title", () => {
    expect(progressCardFilename("Computer Programming 1")).toBe(
      "bsit-progress-computer-programming-1.png"
    );
  });

  it("strips symbols and collapses whitespace", () => {
    expect(progressCardFilename("  IT Élective: Networking & Security!! ")).toBe(
      "bsit-progress-it-lective-networking-security.png"
    );
  });
});
