import { describe, it, expect } from "vitest";
import { buildSuccessUrl } from "./subscribeRedirect";

const ORIGIN = "https://survival-kit-app.vercel.app";
const YEAR = "11111111-1111-1111-1111-111111111111";
const SUBJECT = "22222222-2222-2222-2222-222222222222";
const MODULE = "33333333-3333-3333-3333-333333333333";
const validPath = `/year/${YEAR}/subjects/${SUBJECT}/modules/${MODULE}`;
const fallback = `${ORIGIN}/year/${YEAR}/subjects?payment=success`;

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
