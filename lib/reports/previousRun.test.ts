import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readPreviousRun } from "./previousRun";

let dir: string;

const write = (name: string, body: unknown) =>
  writeFileSync(join(dir, name), JSON.stringify(body), "utf8");

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "previous-run-"));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe("readPreviousRun", () => {
  it("returns null when the directory does not exist", () => {
    expect(readPreviousRun(join(dir, "absent"), "2026-08-05.json")).toBeNull();
  });

  it("returns null when there is no earlier run", () => {
    write("2026-08-05.json", { metrics: [] });
    expect(readPreviousRun(dir, "2026-08-05.json")).toBeNull();
  });

  it("never returns the current run itself", () => {
    write("2026-08-05.json", { metrics: [{ label: "Today", value: 1 }] });
    expect(readPreviousRun(dir, "2026-08-05.json")).toBeNull();
  });

  it("picks the latest run that sorts before the current filename", () => {
    write("2026-08-01.json", { metrics: [{ label: "A", value: 1 }] });
    write("2026-08-04.json", { metrics: [{ label: "A", value: 2 }] });
    write("2026-08-05.json", { metrics: [{ label: "A", value: 3 }] });
    const previous = readPreviousRun(dir, "2026-08-05.json");
    expect(previous?.key).toBe("2026-08-04");
    expect(previous?.metrics).toEqual([{ label: "A", value: 2 }]);
  });

  it("orders monthly filenames correctly", () => {
    write("2026-06.json", { metrics: [{ label: "A", value: 1 }] });
    write("2026-07.json", { metrics: [{ label: "A", value: 2 }] });
    const previous = readPreviousRun(dir, "2026-08.json");
    expect(previous?.key).toBe("2026-07");
  });

  it("ignores subdirectories such as superseded/ and weekly/", () => {
    mkdirSync(join(dir, "superseded"));
    writeFileSync(
      join(dir, "superseded", "2026-08-04.1.json"),
      JSON.stringify({ metrics: [{ label: "Archived", value: 9 }] }),
      "utf8"
    );
    mkdirSync(join(dir, "weekly"));
    expect(readPreviousRun(dir, "2026-08-05.json")).toBeNull();
  });

  it("ignores files that are not .json", () => {
    writeFileSync(join(dir, "2026-08-04.md"), "not json", "utf8");
    expect(readPreviousRun(dir, "2026-08-05.json")).toBeNull();
  });

  it("degrades to a baseline when the previous file is malformed JSON", () => {
    writeFileSync(join(dir, "2026-08-04.json"), "{ not json", "utf8");
    expect(readPreviousRun(dir, "2026-08-05.json")).toBeNull();
  });

  it("degrades to a baseline when metrics is missing or not an array", () => {
    write("2026-08-04.json", { collectedAt: "whenever" });
    expect(readPreviousRun(dir, "2026-08-05.json")).toBeNull();

    write("2026-08-03.json", { metrics: "nope" });
    expect(readPreviousRun(dir, "2026-08-05.json")).toBeNull();
  });
});
