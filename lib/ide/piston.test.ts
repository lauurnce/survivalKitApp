import { describe, it, expect } from "vitest";
import { buildPistonPayload, mapPistonResponse } from "./piston";

describe("buildPistonPayload", () => {
  it("builds a java payload with Main.java filename", () => {
    const p = buildPistonPayload("java", "class Main{}", "");
    expect(p.language).toBe("java");
    expect(p.version).toBe("15.0.2");
    expect(p.files[0].name).toBe("Main.java");
    expect(p.files[0].content).toBe("class Main{}");
  });

  it("builds a c payload with main.c filename", () => {
    const p = buildPistonPayload("c", "int main(){}", "");
    expect(p.files[0].name).toBe("main.c");
  });

  it("rejects a browser-only language", () => {
    // @ts-ignore python is not a server language
    expect(() => buildPistonPayload("python", "", "")).toThrow();
  });
});

describe("mapPistonResponse", () => {
  it("maps run+compile output into a RunResult", () => {
    const res = mapPistonResponse(
      { compile: { stdout: "", stderr: "", code: 0 }, run: { stdout: "hi\n", stderr: "", code: 0 } },
      42,
    );
    expect(res.stdout).toBe("hi\n");
    expect(res.exitCode).toBe(0);
    expect(res.durationMs).toBe(42);
  });

  it("surfaces compile errors in stderr", () => {
    const res = mapPistonResponse(
      { compile: { stdout: "", stderr: "error: expected ';'", code: 1 }, run: null },
      10,
    );
    expect(res.stderr).toContain("expected ';'");
    expect(res.exitCode).toBe(1);
  });
});
