import { describe, it, expect } from "vitest";
import {
  buildSuccessUrl,
  buildUnlockHref,
  modulePath,
  parseModuleRoute,
  safeReturnPath,
} from "./subscribeRedirect";

const ORIGIN = "https://survival-kit-app.vercel.app";
const YEAR = "11111111-1111-1111-1111-111111111111";
const SUBJECT = "22222222-2222-2222-2222-222222222222";
const MODULE = "33333333-3333-3333-3333-333333333333";
const validPath = `/year/${YEAR}/subjects/${SUBJECT}/modules/${MODULE}`;
const fallback = `${ORIGIN}/account?payment=success`;

describe("buildSuccessUrl", () => {
  it("returns the module path with ?payment=success for a valid matching subject-plan path", () => {
    expect(
      buildSuccessUrl({ origin: ORIGIN, yearId: YEAR, subjectId: SUBJECT, returnPath: validPath })
    ).toBe(`${ORIGIN}${validPath}?payment=success`);
  });

  it("returns the module path for a year-plan (subjectId null) when the year matches", () => {
    expect(
      buildSuccessUrl({ origin: ORIGIN, yearId: YEAR, subjectId: null, returnPath: validPath })
    ).toBe(`${ORIGIN}${validPath}?payment=success`);
  });

  it("falls back when returnPath is missing", () => {
    expect(
      buildSuccessUrl({ origin: ORIGIN, yearId: YEAR, subjectId: SUBJECT, returnPath: null })
    ).toBe(fallback);
  });

  it("falls back when the year segment does not match the paid year", () => {
    const otherYear = "99999999-9999-9999-9999-999999999999";
    const path = `/year/${otherYear}/subjects/${SUBJECT}/modules/${MODULE}`;
    expect(
      buildSuccessUrl({ origin: ORIGIN, yearId: YEAR, subjectId: SUBJECT, returnPath: path })
    ).toBe(fallback);
  });

  it("falls back when the subject segment does not match the paid subject", () => {
    const otherSubject = "44444444-4444-4444-4444-444444444444";
    const path = `/year/${YEAR}/subjects/${otherSubject}/modules/${MODULE}`;
    expect(
      buildSuccessUrl({ origin: ORIGIN, yearId: YEAR, subjectId: SUBJECT, returnPath: path })
    ).toBe(fallback);
  });

  it("falls back for a non-module path", () => {
    expect(
      buildSuccessUrl({ origin: ORIGIN, yearId: YEAR, subjectId: SUBJECT, returnPath: "/admin" })
    ).toBe(fallback);
  });

  it("falls back for a protocol-relative open-redirect attempt", () => {
    expect(
      buildSuccessUrl({ origin: ORIGIN, yearId: YEAR, subjectId: SUBJECT, returnPath: "//evil.com" })
    ).toBe(fallback);
  });

  it("falls back when a segment is a non-UUID", () => {
    const path = `/year/${YEAR}/subjects/not-a-uuid/modules/${MODULE}`;
    expect(
      buildSuccessUrl({ origin: ORIGIN, yearId: YEAR, subjectId: null, returnPath: path })
    ).toBe(fallback);
  });

  it("falls back for a path with extra trailing segments", () => {
    const path = `${validPath}/extra`;
    expect(
      buildSuccessUrl({ origin: ORIGIN, yearId: YEAR, subjectId: SUBJECT, returnPath: path })
    ).toBe(fallback);
  });

  // ── adversarial inputs: the open-redirect defense rests on the validator,
  // so lock in the nastiest cases against a future refactor reintroducing a hole.

  it("falls back for a backslash host-injection suffix", () => {
    const path = `${validPath}\\@evil.com`;
    expect(
      buildSuccessUrl({ origin: ORIGIN, yearId: YEAR, subjectId: SUBJECT, returnPath: path })
    ).toBe(fallback);
  });

  it("falls back when returnPath carries a query string", () => {
    const path = `${validPath}?x=1`;
    expect(
      buildSuccessUrl({ origin: ORIGIN, yearId: YEAR, subjectId: SUBJECT, returnPath: path })
    ).toBe(fallback);
  });

  it("falls back when returnPath carries a fragment", () => {
    const path = `${validPath}#x`;
    expect(
      buildSuccessUrl({ origin: ORIGIN, yearId: YEAR, subjectId: SUBJECT, returnPath: path })
    ).toBe(fallback);
  });

  it("falls back for a leading-whitespace path", () => {
    const path = `  ${validPath}`;
    expect(
      buildSuccessUrl({ origin: ORIGIN, yearId: YEAR, subjectId: SUBJECT, returnPath: path })
    ).toBe(fallback);
  });

  it("falls back for a path-traversal attempt", () => {
    const path = `${validPath}/../../../evil`;
    expect(
      buildSuccessUrl({ origin: ORIGIN, yearId: YEAR, subjectId: SUBJECT, returnPath: path })
    ).toBe(fallback);
  });
});

describe("safeReturnPath", () => {
  it("returns the path when it is a module route under the same year and subject", () => {
    expect(safeReturnPath(validPath, YEAR, SUBJECT)).toBe(validPath);
  });

  it("rejects a protocol-relative URL", () => {
    expect(safeReturnPath("//evil.com", YEAR, SUBJECT)).toBeNull();
  });

  it("rejects an absolute URL with a scheme", () => {
    expect(safeReturnPath("https://evil.com", YEAR, SUBJECT)).toBeNull();
  });

  it("rejects a same-origin path that is not a module route", () => {
    expect(safeReturnPath("/account", YEAR, SUBJECT)).toBeNull();
  });

  it("rejects a module route belonging to a different year", () => {
    const otherYear = "99999999-9999-9999-9999-999999999999";
    const path = `/year/${otherYear}/subjects/${SUBJECT}/modules/${MODULE}`;
    expect(safeReturnPath(path, YEAR, SUBJECT)).toBeNull();
  });

  it("rejects a module route belonging to a different subject", () => {
    const otherSubject = "44444444-4444-4444-4444-444444444444";
    const path = `/year/${YEAR}/subjects/${otherSubject}/modules/${MODULE}`;
    expect(safeReturnPath(path, YEAR, SUBJECT)).toBeNull();
  });

  it("rejects a backslash host-injection suffix", () => {
    expect(safeReturnPath(`${validPath}\\@evil.com`, YEAR, SUBJECT)).toBeNull();
  });

  it("rejects a path carrying a query string or fragment", () => {
    expect(safeReturnPath(`${validPath}?x=1`, YEAR, SUBJECT)).toBeNull();
    expect(safeReturnPath(`${validPath}#x`, YEAR, SUBJECT)).toBeNull();
  });

  it("rejects non-string input", () => {
    expect(safeReturnPath(undefined, YEAR, SUBJECT)).toBeNull();
    expect(safeReturnPath(["/a", "/b"], YEAR, SUBJECT)).toBeNull();
  });

  it("hands buildSuccessUrl a value it also accepts", () => {
    const accepted = safeReturnPath(validPath, YEAR, SUBJECT);
    expect(
      buildSuccessUrl({ origin: ORIGIN, yearId: YEAR, subjectId: SUBJECT, returnPath: accepted })
    ).toBe(`${ORIGIN}${validPath}?payment=success`);
  });
});

describe("modulePath", () => {
  it("builds the module route the app links to", () => {
    expect(modulePath(YEAR, SUBJECT, MODULE)).toBe(validPath);
  });

  it("builds a path the validator in this same file accepts", () => {
    // The builder and the validator drifting apart would send every payer to
    // /account instead of back to the reviewer they paid for, silently.
    const path = modulePath(YEAR, SUBJECT, MODULE);
    expect(parseModuleRoute(path)).toEqual({
      yearId: YEAR,
      subjectId: SUBJECT,
      moduleId: MODULE,
    });
    expect(safeReturnPath(path, YEAR, SUBJECT)).toBe(path);
    expect(
      buildSuccessUrl({ origin: ORIGIN, yearId: YEAR, subjectId: SUBJECT, returnPath: path })
    ).toBe(`${ORIGIN}${path}?payment=success`);
  });
});

describe("buildUnlockHref", () => {
  it("builds an /unlock URL carrying year, subject, and the origin path", () => {
    expect(buildUnlockHref({ yearId: YEAR, subjectId: SUBJECT, from: validPath })).toBe(
      `/unlock?year=${YEAR}&subject=${SUBJECT}&from=${encodeURIComponent(validPath)}`
    );
  });

  it("omits from when there is no origin path", () => {
    expect(buildUnlockHref({ yearId: YEAR, subjectId: SUBJECT })).toBe(
      `/unlock?year=${YEAR}&subject=${SUBJECT}`
    );
  });
});
