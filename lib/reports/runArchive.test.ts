import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { archiveExistingRun } from "./runArchive";

let dir: string;

const writeRun = (name: string, collectedAt: string): void => {
  writeFileSync(join(dir, name), JSON.stringify({ collectedAt, metrics: [] }), "utf8");
};

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "run-archive-"));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe("archiveExistingRun", () => {
  it("returns null when there is no run to displace", () => {
    expect(archiveExistingRun(dir, "2026-08-05.json")).toBeNull();
  });

  it("moves an existing run into superseded/ instead of leaving it to be overwritten", () => {
    writeRun("2026-08-05.json", "2026-08-04T18:25:14.000Z");

    const archived = archiveExistingRun(dir, "2026-08-05.json");

    expect(archived).toBe(join(dir, "superseded", "2026-08-05.1.json"));
    expect(existsSync(join(dir, "2026-08-05.json"))).toBe(false);
    expect(JSON.parse(readFileSync(archived!, "utf8")).collectedAt).toBe(
      "2026-08-04T18:25:14.000Z"
    );
  });

  it("keeps every superseded run of the same day, numbered in order", () => {
    writeRun("2026-08-05.json", "first");
    archiveExistingRun(dir, "2026-08-05.json");
    writeRun("2026-08-05.json", "second");
    archiveExistingRun(dir, "2026-08-05.json");
    writeRun("2026-08-05.json", "third");
    archiveExistingRun(dir, "2026-08-05.json");

    const archived = readdirSync(join(dir, "superseded")).sort();
    expect(archived).toEqual(["2026-08-05.1.json", "2026-08-05.2.json", "2026-08-05.3.json"]);
    expect(
      archived.map(
        (name) => JSON.parse(readFileSync(join(dir, "superseded", name), "utf8")).collectedAt
      )
    ).toEqual(["first", "second", "third"]);
  });

  it("keeps superseded runs out of the directory a previous run is chosen from", () => {
    writeRun("2026-08-05.json", "earlier today");
    archiveExistingRun(dir, "2026-08-05.json");

    // readPreviousRun globs *.json in this directory only. An archived run
    // must not surface there or a same-day re-run would diff against itself.
    expect(readdirSync(dir).filter((name) => name.endsWith(".json"))).toEqual([]);
  });
});
