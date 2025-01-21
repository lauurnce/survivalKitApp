import { describe, it, expect, vi } from "vitest";

const { notFound, permanentRedirect } = vi.hoisted(() => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  permanentRedirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT 308 ${path}`);
  }),
}));
vi.mock("next/navigation", () => ({ notFound, permanentRedirect }));

import {
  enforceChain,
  moduleChain,
  modulesPath,
  subjectChain,
  subjectsPath,
  wellFormedIds,
} from "./canonicalChain";

const YEAR = "11111111-1111-1111-1111-111111111111";
const SUBJECT = "22222222-2222-2222-2222-222222222222";
const MODULE = "33333333-3333-3333-3333-333333333333";
const OTHER_YEAR = "44444444-4444-4444-4444-444444444444";
const OTHER_SUBJECT = "55555555-5555-5555-5555-555555555555";

const lesson = `/year/${YEAR}/subjects/${SUBJECT}/modules/${MODULE}`;

describe("paths", () => {
  it("builds the subject list and module list paths", () => {
    expect(subjectsPath(YEAR)).toBe(`/year/${YEAR}/subjects`);
    expect(modulesPath(YEAR, SUBJECT)).toBe(`/year/${YEAR}/subjects/${SUBJECT}/modules`);
  });
});

describe("wellFormedIds", () => {
  it("accepts UUIDs and rejects anything else", () => {
    expect(wellFormedIds(YEAR, SUBJECT, MODULE)).toBe(true);
    expect(wellFormedIds(YEAR, "garbage")).toBe(false);
    expect(wellFormedIds("")).toBe(false);
  });
});

describe("subjectChain", () => {
  const subject = { id: SUBJECT, year_id: YEAR };

  it("is ok when the subject belongs to the year in the path", () => {
    expect(subjectChain({ yearId: YEAR, subjectId: SUBJECT }, subject)).toEqual({
      kind: "ok",
      path: modulesPath(YEAR, SUBJECT),
    });
  });

  it("redirects to the subject's real year", () => {
    expect(subjectChain({ yearId: OTHER_YEAR, subjectId: SUBJECT }, subject)).toEqual({
      kind: "redirect",
      path: modulesPath(YEAR, SUBJECT),
    });
  });

  it("is not found when the subject does not exist", () => {
    expect(subjectChain({ yearId: YEAR, subjectId: SUBJECT }, null)).toEqual({ kind: "notFound" });
    expect(subjectChain({ yearId: YEAR, subjectId: SUBJECT }, undefined)).toEqual({ kind: "notFound" });
  });

  it("is not found when the row is for a different subject", () => {
    expect(subjectChain({ yearId: YEAR, subjectId: OTHER_SUBJECT }, subject)).toEqual({ kind: "notFound" });
  });
});

describe("moduleChain", () => {
  const owner = { moduleId: MODULE, subjectId: SUBJECT, yearId: YEAR };

  it("is ok when every id matches the module's real parents", () => {
    expect(moduleChain({ yearId: YEAR, subjectId: SUBJECT, moduleId: MODULE }, owner)).toEqual({
      kind: "ok",
      path: lesson,
    });
  });

  it("redirects a wrong year to the canonical lesson", () => {
    expect(moduleChain({ yearId: OTHER_YEAR, subjectId: SUBJECT, moduleId: MODULE }, owner)).toEqual({
      kind: "redirect",
      path: lesson,
    });
  });

  it("redirects a wrong subject (and year) to the canonical lesson", () => {
    expect(moduleChain({ yearId: YEAR, subjectId: OTHER_SUBJECT, moduleId: MODULE }, owner)).toEqual({
      kind: "redirect",
      path: lesson,
    });
    expect(moduleChain({ yearId: OTHER_YEAR, subjectId: OTHER_SUBJECT, moduleId: MODULE }, owner)).toEqual({
      kind: "redirect",
      path: lesson,
    });
  });

  it("is not found when the module does not exist or has no parents", () => {
    const requested = { yearId: YEAR, subjectId: SUBJECT, moduleId: MODULE };
    expect(moduleChain(requested, null)).toEqual({ kind: "notFound" });
    expect(moduleChain(requested, { ...owner, yearId: "" })).toEqual({ kind: "notFound" });
    expect(moduleChain(requested, { ...owner, moduleId: OTHER_SUBJECT })).toEqual({ kind: "notFound" });
  });
});

describe("enforceChain", () => {
  it("returns the canonical path for an ok verdict", () => {
    expect(enforceChain({ kind: "ok", path: lesson })).toBe(lesson);
  });

  it("permanently redirects a redirect verdict", () => {
    expect(() => enforceChain({ kind: "redirect", path: lesson })).toThrow(`NEXT_REDIRECT 308 ${lesson}`);
    expect(permanentRedirect).toHaveBeenCalledWith(lesson);
  });

  it("404s a notFound verdict", () => {
    expect(() => enforceChain({ kind: "notFound" })).toThrow("NEXT_NOT_FOUND");
    expect(notFound).toHaveBeenCalled();
  });
});
