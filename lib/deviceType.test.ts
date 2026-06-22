import { describe, it, expect } from "vitest";
import { getDeviceType } from "./deviceType";

describe("getDeviceType — UA fallback (no client signals)", () => {
  it("detects iPhone as mobile", () => {
    expect(getDeviceType("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)")).toBe("mobile");
  });

  it("detects Android as mobile", () => {
    expect(getDeviceType("Mozilla/5.0 (Linux; Android 14; Pixel 8)")).toBe("mobile");
  });

  it("detects iPad as mobile", () => {
    expect(getDeviceType("Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)")).toBe("mobile");
  });

  it("detects generic Mobile token as mobile", () => {
    expect(getDeviceType("Mozilla/5.0 (Linux; Mobile)")).toBe("mobile");
  });

  it("detects Windows desktop as desktop", () => {
    expect(getDeviceType("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")).toBe("desktop");
  });

  it("detects Mac desktop as desktop", () => {
    expect(getDeviceType("Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15")).toBe("desktop");
  });

  it("returns desktop for empty string", () => {
    expect(getDeviceType("")).toBe("desktop");
  });

  it("does not false-positive on a stray 'mobile' substring", () => {
    // No \bMobile\b boundary match — 'automobile' should not count.
    expect(getDeviceType("Mozilla/5.0 (Windows NT 10.0) automobile-bot/1.0")).toBe("desktop");
  });
});

describe("getDeviceType — client signals take precedence", () => {
  const laptopUA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

  it("wide, non-touch screen is desktop", () => {
    expect(getDeviceType(laptopUA, { screenWidth: 1512, maxTouchPoints: 0 })).toBe("desktop");
  });

  it("touch-enabled laptop with wide screen is still desktop", () => {
    // The exact false-positive case the user hit: touch laptop misread as mobile.
    expect(getDeviceType(laptopUA, { screenWidth: 1440, maxTouchPoints: 10 })).toBe("desktop");
  });

  it("narrow screen is mobile regardless of UA", () => {
    expect(getDeviceType(laptopUA, { screenWidth: 390, maxTouchPoints: 5 })).toBe("mobile");
  });

  it("phone with narrow screen is mobile", () => {
    expect(
      getDeviceType("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)", {
        screenWidth: 390,
        maxTouchPoints: 5,
      })
    ).toBe("mobile");
  });

  it("falls back to UA when signals are null", () => {
    expect(getDeviceType(laptopUA, { screenWidth: null, maxTouchPoints: null })).toBe("desktop");
  });

  it("falls back to UA when width is inconclusive (wide but touch, no width data path)", () => {
    // width undefined -> UA fallback
    expect(getDeviceType("Mozilla/5.0 (Linux; Android 14)", { maxTouchPoints: 5 })).toBe("mobile");
  });
});
