import { describe, expect, it } from "vitest";
import OpengraphImage, { alt, contentType, size } from "./opengraph-image";

describe("opengraph-image", () => {
  it("uses the standard 1200x630 OG size", () => {
    expect(size).toEqual({ width: 1200, height: 630 });
  });

  it("declares a PNG content type", () => {
    expect(contentType).toBe("image/png");
  });

  it("has alt text that names the product for accessibility clients", () => {
    expect(alt).toMatch(/BSIT Survival Kit/);
  });

  it("renders a PNG image response at the declared size", async () => {
    const response = await OpengraphImage();

    expect(response).toBeInstanceOf(Response);
    expect(response.headers.get("content-type")).toBe("image/png");
  });
});
