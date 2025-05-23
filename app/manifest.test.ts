import { describe, expect, it } from "vitest";
import manifest from "./manifest";
import { PWA_START_URL } from "@/lib/retention/pwa";

describe("manifest", () => {
  const m = manifest();

  it("has the 192px and 512px icons Android requires to offer install", () => {
    const sizes = (m.icons ?? []).map((i) => i.sizes);
    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");
    expect(m.icons?.some((i) => i.purpose === "maskable")).toBe(true);
  });

  it("tags home-screen launches so they show up as their own source", () => {
    expect(m.start_url).toBe(PWA_START_URL);
    const url = new URL(PWA_START_URL, "https://tryi2i.com");
    expect(url.pathname).toBe("/");
    expect(url.searchParams.get("utm_source")).toBe("pwa");
    expect(url.searchParams.get("utm_medium")).toBe("homescreen");
  });

  it("is a standalone app scoped to the whole site", () => {
    expect(m).toMatchObject({ id: "/", scope: "/", display: "standalone" });
  });
});
