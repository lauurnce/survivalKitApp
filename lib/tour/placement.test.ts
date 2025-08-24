import { describe, it, expect } from "vitest";
import { placeCard, needsScroll } from "./placement";

const PHONE = { width: 390, height: 664 };
const SE = { width: 320, height: 568 };
const DESKTOP = { width: 1440, height: 900 };

/** Card size as rendered at each width: w-[calc(100%-2rem)] max-w-xs. */
const cardFor = (vw: number, height = 216) => ({ width: Math.min(320, vw - 32), height });

function inside(p: { x: number; y: number }, card: { width: number; height: number }, vp: { width: number; height: number }) {
  return p.x >= 16 && p.y >= 16 && p.x + card.width <= vp.width - 16 && p.y + card.height <= vp.height - 16;
}

describe("placeCard", () => {
  it("centers an unanchored card in the viewport", () => {
    const card = cardFor(PHONE.width);
    const p = placeCard(null, card, PHONE);
    expect(p.mode).toBe("centered");
    expect(p.x).toBe((PHONE.width - card.width) / 2);
    expect(p.y).toBe((PHONE.height - card.height) / 2);
  });

  it("places the card below a target near the top of the viewport", () => {
    const card = cardFor(DESKTOP.width);
    const rect = { top: 100, left: 300, width: 200, height: 40 };
    const p = placeCard(rect, card, DESKTOP);
    expect(p.mode).toBe("below");
    expect(p.y).toBe(100 + 40 + 8 + 16);
    expect(p.x).toBe(300);
  });

  it("places the card above a target near the bottom of the viewport", () => {
    const card = cardFor(DESKTOP.width);
    const rect = { top: 760, left: 300, width: 200, height: 40 };
    const p = placeCard(rect, card, DESKTOP);
    expect(p.mode).toBe("above");
    expect(p.y + card.height).toBe(760 - 8 - 16);
  });

  it("never pushes the card past the left edge on a 320px screen", () => {
    // The old code clamped against a fixed 320px card width, giving left = -16.
    const card = cardFor(SE.width);
    const rect = { top: 80, left: 200, width: 100, height: 40 };
    const p = placeCard(rect, card, SE);
    expect(p.x).toBe(16);
    expect(inside(p, card, SE)).toBe(true);
  });

  it("docks to the bottom of the viewport when neither side has room and the target sits high", () => {
    // Tall section (the landing page's "Popular right now" is ~664px) scrolled to its top.
    const card = cardFor(PHONE.width);
    const rect = { top: 16, left: 16, width: 358, height: 664 };
    const p = placeCard(rect, card, PHONE);
    expect(p.mode).toBe("dock-bottom");
    expect(p.y).toBe(PHONE.height - 16 - card.height);
    expect(inside(p, card, PHONE)).toBe(true);
  });

  it("docks to the top of the viewport when the target fills the lower part", () => {
    const card = cardFor(SE.width, 240);
    const rect = { top: 250, left: 16, width: 288, height: 300 };
    const p = placeCard(rect, card, SE);
    expect(p.mode).toBe("dock-top");
    expect(p.y).toBe(16);
    expect(inside(p, card, SE)).toBe(true);
  });

  it("keeps the card fully inside the viewport for any target position", () => {
    for (const vp of [SE, PHONE, DESKTOP]) {
      const card = cardFor(vp.width);
      for (let top = -400; top <= vp.height + 400; top += 37) {
        for (const height of [20, 120, 400, 1500]) {
          const p = placeCard({ top, left: 40, width: 120, height }, card, vp);
          expect(inside(p, card, vp), `${vp.width}x${vp.height} top=${top} h=${height}`).toBe(true);
        }
      }
    }
  });
});

describe("needsScroll", () => {
  it("is false for a target already comfortably on screen", () => {
    expect(needsScroll({ top: 200, left: 0, width: 100, height: 40 }, PHONE)).toBe(false);
  });

  it("is true for a target below the fold or above the top", () => {
    expect(needsScroll({ top: 700, left: 0, width: 100, height: 40 }, PHONE)).toBe(true);
    expect(needsScroll({ top: -50, left: 0, width: 100, height: 40 }, PHONE)).toBe(true);
    expect(needsScroll({ top: 640, left: 0, width: 100, height: 40 }, PHONE)).toBe(true);
  });
});
