import { describe, it, expect } from "vitest";
import { viewportConfig } from "./viewport";

describe("viewport config", () => {
  it("prevents zoom-out but allows zoom-in", () => {
    expect(viewportConfig.minimumScale).toBe(1);
    expect(viewportConfig.maximumScale).toBeUndefined();
    expect(viewportConfig.userScalable).toBeUndefined();
    expect(viewportConfig.viewportFit).toBe("cover");
  });
});