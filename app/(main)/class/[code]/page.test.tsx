import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));
vi.mock("./join/ClassJoinRequest", () => ({ ClassJoinRequest: () => null }));
vi.mock("./rep/RepDashboard", () => ({ RepDashboard: () => null }));

import JoinPage, { generateMetadata as joinMetadata } from "./join/page";
import RepPage, { generateMetadata as repMetadata } from "./rep/page";

const params = (code: string) => ({ params: Promise.resolve({ code }) });

describe.each([
  ["join", JoinPage, joinMetadata],
  ["rep", RepPage, repMetadata],
] as const)("/class/[code]/%s", (_name, Page, metadata) => {
  it.each(["FAKECODE", "ABC123", "a", "ABC-12", "<script>", "A".repeat(300)])(
    "404s the malformed code %s",
    async (code) => {
      await expect(Page(params(code))).rejects.toThrow("NEXT_NOT_FOUND");
      await expect(metadata(params(code))).rejects.toThrow("NEXT_NOT_FOUND");
    }
  );

  it("hands a well-formed code on, normalised to upper case", async () => {
    const el = await Page(params("abcdef"));
    expect(el.props.code).toBe("ABCDEF");
  });

  it("titles the page with the code and keeps it out of search", async () => {
    const meta = await metadata(params("abcdef"));
    expect(meta.title).toContain("ABCDEF");
    expect(meta.robots).toEqual({ index: false });
  });
});
