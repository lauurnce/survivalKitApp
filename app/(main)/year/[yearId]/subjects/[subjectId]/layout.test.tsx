import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/cache/queries", () => ({
  getSubjectWithYear: async (id: string) =>
    id === "s1" ? { id: "s1", title: "Computer Programming 1", year_id: "y1", years: { label: "1st Year", sort_order: 1 } } : null,
  getModulesBySubject: async () => [{ id: "m1" }, { id: "m2" }],
}));

import SubjectLayout, { generateMetadata } from "./layout";
import SubjectOpengraphImage, { size } from "./opengraph-image";

const params = (subjectId: string) => Promise.resolve({ yearId: "y1", subjectId });

describe("subject segment metadata", () => {
  it("gives every page in the subject a subject-level preview", async () => {
    const meta = await generateMetadata({ params: params("s1"), children: null });
    expect(meta.openGraph).toMatchObject({
      title: "Computer Programming 1 — BSIT Survival Kit",
      description: "Computer Programming 1 (1st Year): 2 lessons with free notes, plus reviewers with answer keys.",
    });
  });

  it("does not inherit the home page as og:url", async () => {
    const meta = await generateMetadata({ params: params("s1"), children: null });
    expect(meta.openGraph).not.toHaveProperty("url");
  });

  it("is empty for an unknown subject", async () => {
    expect(await generateMetadata({ params: params("missing"), children: null })).toEqual({});
  });

  it("renders its children unchanged", () => {
    const child = <p>lesson</p>;
    expect(SubjectLayout({ children: child, params: params("s1") })).toBe(child);
  });
});

describe("subject opengraph-image", () => {
  it("renders a 1200x630 PNG", async () => {
    const res = await SubjectOpengraphImage({ params: params("s1") });
    expect(size).toEqual({ width: 1200, height: 630 });
    expect(res.headers.get("content-type")).toBe("image/png");
  });

  it("still renders a card for an unknown subject", async () => {
    const res = await SubjectOpengraphImage({ params: params("missing") });
    expect(res.headers.get("content-type")).toBe("image/png");
  });
});
