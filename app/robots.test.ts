import { describe, expect, it } from "vitest";
import robots from "./robots";

describe("robots", () => {
  it("points crawlers at the sitemap on the canonical custom domain", () => {
    expect(robots().sitemap).toBe("https://tryi2i.com/sitemap.xml");
  });
});
