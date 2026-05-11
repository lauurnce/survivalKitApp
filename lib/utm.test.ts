import { describe, it, expect, afterEach, vi } from "vitest";
import { normaliseUtmValue, taggedUrl, withUtm } from "./utm";

const TAGS = { source: "tiktok", medium: "social", campaign: "finals-dec-2026" };

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("normaliseUtmValue", () => {
  it("lowercases and slugs so one channel never splits into several rows", () => {
    expect(normaliseUtmValue(" Facebook ")).toBe("facebook");
    expect(normaliseUtmValue("Group Chat!")).toBe("group-chat");
    expect(normaliseUtmValue("finals-dec-2026")).toBe("finals-dec-2026");
    expect(normaliseUtmValue("share_card")).toBe("share_card");
  });
});

describe("withUtm", () => {
  it("appends the three tags the enter event records", () => {
    const url = new URL(withUtm("https://tryi2i.com/", TAGS));
    expect(url.searchParams.get("utm_source")).toBe("tiktok");
    expect(url.searchParams.get("utm_medium")).toBe("social");
    expect(url.searchParams.get("utm_campaign")).toBe("finals-dec-2026");
  });

  it("does not add tags analytics would drop", () => {
    const url = new URL(withUtm("https://tryi2i.com/", TAGS));
    expect(url.searchParams.has("utm_content")).toBe(false);
    expect(url.searchParams.has("utm_term")).toBe(false);
  });

  it("keeps other params and the hash, and replaces stale tags", () => {
    const out = withUtm("https://tryi2i.com/year?x=1&utm_source=old#top", TAGS);
    const url = new URL(out);
    expect(url.searchParams.get("x")).toBe("1");
    expect(url.searchParams.getAll("utm_source")).toEqual(["tiktok"]);
    expect(url.hash).toBe("#top");
  });

  it("refuses an empty tag rather than ship an untagged link", () => {
    expect(() => withUtm("https://tryi2i.com/", { ...TAGS, campaign: "  " })).toThrow(/utm_campaign/);
  });
});

describe("taggedUrl", () => {
  it("builds on the canonical origin", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_ORIGIN", "");
    expect(taggedUrl("/", TAGS)).toBe(
      "https://tryi2i.com/?utm_source=tiktok&utm_medium=social&utm_campaign=finals-dec-2026"
    );
  });

  it("follows an origin override", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_ORIGIN", "https://staging.example.com");
    expect(taggedUrl("account", TAGS).startsWith("https://staging.example.com/account?utm_source=")).toBe(true);
  });
});
