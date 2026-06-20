import { describe, it, expect } from "vitest";
import { getDeviceType } from "./deviceType";

describe("getDeviceType", () => {
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
});
