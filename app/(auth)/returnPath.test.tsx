import { describe, expect, it, vi } from "vitest";

vi.mock("./actions", () => ({ signUpAction: vi.fn(), signInAction: vi.fn() }));

const { default: SignupPage } = await import("./signup/page");
const { default: LoginPage } = await import("./login/page");

const MODULE = "/year/y1/subjects/s1/modules/m1";

async function nextProp(
  Page: typeof SignupPage,
  next: string | string[] | undefined,
): Promise<string> {
  const el = await Page({ searchParams: Promise.resolve({ next }) });
  return (el.props as { next: string }).next;
}

describe("auth pages — the ?next= return path", () => {
  for (const [name, Page] of [
    ["signup", SignupPage],
    ["login", LoginPage],
  ] as const) {
    it(`${name}: passes a module path with ?print=1 through intact`, async () => {
      expect(await nextProp(Page, `${MODULE}?print=1`)).toBe(`${MODULE}?print=1`);
    });

    it(`${name}: refuses a backslash host the old check let through`, async () => {
      expect(await nextProp(Page, "/\\evil.com")).toBe("/account");
    });

    it(`${name}: refuses protocol-relative and absolute URLs`, async () => {
      expect(await nextProp(Page, "//evil.com")).toBe("/account");
      expect(await nextProp(Page, "https://evil.com")).toBe("/account");
    });

    it(`${name}: refuses an encoded protocol-relative path`, async () => {
      expect(await nextProp(Page, "/%2F%2Fevil.com")).toBe("/account");
    });

    it(`${name}: defaults to the account page`, async () => {
      expect(await nextProp(Page, undefined)).toBe("/account");
    });
  }
});
