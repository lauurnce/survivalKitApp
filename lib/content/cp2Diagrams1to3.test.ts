// @vitest-environment jsdom
// The CP2 Lessons 1-3 diagrams (public/diagrams/cp2/lesson-1..3-*.svg) are
// static SVGs shown through a markdown image, so the browser renders them as
// <img>: no page CSS, no currentColor, no theme class reaches inside. These
// checks pin what keeps them usable for every reader, the same rules as the
// CP1 diagrams: an accessible name, a phone-sized canvas, legible text, every
// label on a solid fill (so it reads on the light and the dark theme), a
// transparent page background, and nothing executable. Other lessons' diagrams
// share the folder and have their own tests.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";

const DIR = join(__dirname, "..", "..", "public", "diagrams", "cp2");
const files = readdirSync(DIR)
  .filter((f) => /^lesson-[123]-[a-z0-9-]+\.svg$/.test(f))
  .sort();

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

describe("CP2 Lessons 1-3 diagrams", () => {
  it("has one diagram for each of Lessons 1, 2 and 3", () => {
    expect(files.map((f) => f.match(/^lesson-(\d)-/)?.[1])).toEqual(["1", "2", "3"]);
  });

  describe.each(files)("%s", (file) => {
    it("is an image with a title and a description as its accessible name", () => {
      const svg = parse(file);
      expect(svg.getAttribute("role")).toBe("img");
      expect((svg.getAttribute("aria-labelledby") ?? "").split(/\s+/)).toEqual(["title", "desc"]);
      expect(svg.querySelector("title")?.id).toBe("title");
      expect(svg.querySelector("desc")?.id).toBe("desc");
      expect(svg.querySelector("title")?.textContent?.trim().length).toBeGreaterThan(10);
      expect(svg.querySelector("desc")?.textContent?.trim().length).toBeGreaterThan(80);
    });

    it("is drawn for a phone column, 360 wide plus stroke room, and scales down", () => {
      const svg = parse(file);
      const [, , w, h] = viewBox(svg);
      expect(w).toBeLessThanOrEqual(400);
      expect(h).toBeGreaterThan(0);
      expect(Number(svg.getAttribute("width"))).toBe(w);
      expect(Number(svg.getAttribute("height"))).toBe(h);
    });

    it("keeps every font at 12px or more", () => {
      const css = parse(file).querySelector("style")?.textContent ?? "";
      const sizes = [...css.matchAll(/(\d+(?:\.\d+)?)px/g)].map((m) => Number(m[1]));
      expect(sizes.length).toBeGreaterThan(0);
      for (const size of sizes) expect(size).toBeGreaterThanOrEqual(12);
    });

    it("puts every label on a filled shape, so white text never sits on the page", () => {
      const svg = parse(file);
      const rects = Array.from(svg.querySelectorAll("rect")).map((r) => ({
        x: Number(r.getAttribute("x")),
        y: Number(r.getAttribute("y")),
        w: Number(r.getAttribute("width")),
        h: Number(r.getAttribute("height")),
      }));
      for (const t of Array.from(svg.querySelectorAll("text"))) {
        const x = Number(t.getAttribute("x"));
        const y = Number(t.getAttribute("y"));
        const inside = rects.some((r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h);
        expect(inside, t.textContent ?? "").toBe(true);
      }
    });

    it("leaves the page background showing through (no full-canvas backdrop)", () => {
      const svg = parse(file);
      const [, , w, h] = viewBox(svg);
      for (const rect of Array.from(svg.querySelectorAll("rect"))) {
        const covers =
          Number(rect.getAttribute("width")) >= w - 4 && Number(rect.getAttribute("height")) >= h - 4;
        expect(covers).toBe(false);
      }
    });

    it("never uses currentColor, and contains nothing executable or external", () => {
      expect(readFileSync(join(DIR, file), "utf8")).not.toMatch(/currentColor/i);
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
