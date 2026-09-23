// @vitest-environment jsdom
// The CP1 lesson diagrams (public/diagrams/cp1) are static SVGs shown through
// a markdown image, so the browser renders them as <img>: no page CSS, no
// currentColor, no theme class reaches inside. These checks pin what keeps
// them usable for every reader: an accessible name, a phone-sized canvas,
// legible text, a transparent page background, and nothing executable.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";

const DIR = join(__dirname, "..", "..", "public", "diagrams", "cp1");
const files = readdirSync(DIR).filter((f) => f.endsWith(".svg")).sort();

function parse(file: string): SVGSVGElement {
  const doc = new DOMParser().parseFromString(readFileSync(join(DIR, file), "utf8"), "image/svg+xml");
  expect(doc.getElementsByTagName("parsererror")).toHaveLength(0);
  return doc.documentElement as unknown as SVGSVGElement;
}

function viewBox(svg: SVGSVGElement): [number, number, number, number] {
  const parts = (svg.getAttribute("viewBox") ?? "").trim().split(/[\s,]+/).map(Number);
  expect(parts).toHaveLength(4);
  return parts as [number, number, number, number];
}

describe("CP1 lesson diagrams", () => {
  it("has one diagram per lesson, Lessons 1 to 6, named lesson-N-<slug>.svg", () => {
    expect(files.map((f) => f.match(/^lesson-(\d)-[a-z0-9-]+\.svg$/)?.[1])).toEqual([
      "1", "2", "3", "4", "5", "6",
    ]);
  });

  describe.each(files)("%s", (file) => {
    it("is an image with a title and a description as its accessible name", () => {
      const svg = parse(file);
      expect(svg.tagName).toBe("svg");
      expect(svg.getAttribute("role")).toBe("img");
      const ids = (svg.getAttribute("aria-labelledby") ?? "").split(/\s+/);
      expect(ids).toEqual(["title", "desc"]);
      const title = svg.querySelector("title");
      const desc = svg.querySelector("desc");
      expect(title?.id).toBe("title");
      expect(desc?.id).toBe("desc");
      expect(title?.textContent?.trim().length).toBeGreaterThan(10);
      expect(desc?.textContent?.trim().length).toBeGreaterThan(80);
    });

    it("is drawn for a phone column and scales down, not sideways", () => {
      const svg = parse(file);
      const [, , w, h] = viewBox(svg);
      expect(w).toBeLessThanOrEqual(400);
      expect(h).toBeGreaterThan(0);
      // Intrinsic size equals the viewBox, so Tailwind's preflight
      // (img { max-width: 100%; height: auto }) keeps the aspect ratio.
      expect(Number(svg.getAttribute("width"))).toBe(w);
      expect(Number(svg.getAttribute("height"))).toBe(h);
    });

    it("keeps every font at 12px or more", () => {
      const css = parse(file).querySelector("style")?.textContent ?? "";
      const sizes = [...css.matchAll(/(\d+(?:\.\d+)?)px/g)].map((m) => Number(m[1]));
      expect(sizes.length).toBeGreaterThan(0);
      for (const size of sizes) expect(size).toBeGreaterThanOrEqual(12);
    });

    it("leaves the page background showing through (no full-canvas backdrop)", () => {
      const svg = parse(file);
      const [, , w, h] = viewBox(svg);
      for (const rect of Array.from(svg.querySelectorAll("rect"))) {
        const covers =
          Number(rect.getAttribute("width")) >= w - 4 && Number(rect.getAttribute("height")) >= h - 4;
        expect(covers).toBe(false);
      }
      expect(svg.getAttribute("style") ?? "").not.toMatch(/background/);
    });

    it("never uses currentColor, which an <img> resolves to black on the dark theme", () => {
      expect(readFileSync(join(DIR, file), "utf8")).not.toMatch(/currentColor/i);
    });

    it("contains nothing executable or external", () => {
      const svg = parse(file);
      expect(svg.querySelectorAll("script, foreignObject, image, a")).toHaveLength(0);
      for (const el of Array.from(svg.querySelectorAll("*"))) {
        for (const attr of Array.from(el.attributes)) {
          expect(attr.name.startsWith("on")).toBe(false);
          expect(attr.value).not.toMatch(/^(https?:|javascript:|data:)/i);
        }
      }
    });
  });
});
