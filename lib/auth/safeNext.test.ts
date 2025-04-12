import { describe, expect, it } from "vitest";
import { safeAdminNext, safeNextParam, safeNextPath } from "./safeNext";

const MODULE = "/year/y1/subjects/s1/modules/m1";

describe("safeNextPath — accepted", () => {
  it("keeps an internal path", () => {
    expect(safeNextPath("/account")).toBe("/account");
  });

  it("keeps the query string, so ?print=1 survives the round trip", () => {
    expect(safeNextPath(`${MODULE}?print=1`)).toBe(`${MODULE}?print=1`);
  });

  it("keeps several query parameters and a hash", () => {
    expect(safeNextPath(`${MODULE}?from=dashboard&print=1#reviewer-2`)).toBe(
      `${MODULE}?from=dashboard&print=1#reviewer-2`,
    );
  });

  it("keeps an encoded space inside a query value", () => {
    expect(safeNextPath("/faq?q=a%20b")).toBe("/faq?q=a%20b");
  });
});

describe("safeNextPath — rejected (open redirect)", () => {
  const evil = [
    "//evil.com",
    "//evil.com/path",
    "https://evil.com",
    "http://evil.com",
    "javascript:alert(1)",
    "evil.com",
    "/\\evil.com",
    "/\\/evil.com",
    "\\\\evil.com",
    "/%2F%2Fevil.com",
    "/%2f%2fevil.com",
    "/%5Cevil.com",
    "/%5cevil.com",
    "/%252F%252Fevil.com",
    "%2F%2Fevil.com",
    "/\t/evil.com",
    "/\n/evil.com",
    "/\r\n/evil.com",
    " /account",
    "/%E0%A4%A", // malformed escape
  ];
  for (const value of evil) {
    it(`refuses ${JSON.stringify(value)}`, () => {
      expect(safeNextPath(value)).toBe("/account");
    });
  }

  it("refuses the literal strings null and undefined", () => {
    expect(safeNextPath("null")).toBe("/account");
    expect(safeNextPath("undefined")).toBe("/account");
  });

  it("refuses non-strings and empty values", () => {
    expect(safeNextPath(null)).toBe("/account");
    expect(safeNextPath(undefined)).toBe("/account");
    expect(safeNextPath("")).toBe("/account");
    expect(safeNextPath(new File([], "x"))).toBe("/account");
  });

  it("refuses an absurdly long value", () => {
    expect(safeNextPath(`/${"a".repeat(5000)}`)).toBe("/account");
  });

  it("does not send a signed-in student back to the auth forms", () => {
    expect(safeNextPath("/login")).toBe("/account");
    expect(safeNextPath("/signup?next=/x")).toBe("/account");
  });

  it("honours a caller-supplied fallback", () => {
    expect(safeNextPath("//evil.com", "/")).toBe("/");
  });
});

describe("safeNextParam", () => {
  it("uses the first of a repeated parameter", () => {
    expect(safeNextParam([`${MODULE}?print=1`, "//evil.com"])).toBe(`${MODULE}?print=1`);
  });

  it("falls back when absent", () => {
    expect(safeNextParam(undefined)).toBe("/account");
  });
});

describe("safeAdminNext (QA GT-21)", () => {
  it("keeps an admin destination, query included", () => {
    expect(safeAdminNext("/admin/feedback")).toBe("/admin/feedback");
    expect(safeAdminNext("/admin/feedback?x=1")).toBe("/admin/feedback?x=1");
    expect(safeAdminNext("/admin")).toBe("/admin");
  });

  it("refuses anything outside /admin", () => {
    expect(safeAdminNext("/account")).toBe("/admin");
    expect(safeAdminNext("/administrator")).toBe("/admin");
    expect(safeAdminNext("//evil.example/admin")).toBe("/admin");
    expect(safeAdminNext("https://evil.example/admin")).toBe("/admin");
    expect(safeAdminNext("/admin/../account")).toBe("/admin");
  });

  it("never returns to the login page itself", () => {
    expect(safeAdminNext("/admin/login")).toBe("/admin");
    expect(safeAdminNext("/admin/login?next=/admin/feedback")).toBe("/admin");
  });

  it("falls back when missing, and takes the first of a repeated param", () => {
    expect(safeAdminNext(undefined)).toBe("/admin");
    expect(safeAdminNext(["/admin/feedback", "/x"])).toBe("/admin/feedback");
  });
});
