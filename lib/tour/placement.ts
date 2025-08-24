/**
 * Pure geometry for `TourOverlay`: where the tooltip card goes, in viewport
 * coordinates, given the target's `getBoundingClientRect()` and the card's
 * rendered size. Kept free of the DOM so every case is unit-testable.
 *
 * The one guarantee: the returned position keeps the whole card inside the
 * viewport (minus a margin), on any screen size and wherever the target is.
 */

export interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface Size {
  width: number;
  height: number;
}

export type CardMode = "centered" | "below" | "above" | "dock-top" | "dock-bottom";

export interface CardPlacement {
  mode: CardMode;
  /** Card's left edge, viewport px. */
  x: number;
  /** Card's top edge, viewport px. */
  y: number;
}

export const HIGHLIGHT_PADDING = 8;
export const CARD_GAP = 16;
export const VIEWPORT_MARGIN = 16;

function clamp(value: number, min: number, max: number): number {
  // When the card is wider/taller than the room available, pin it to `min`
  // so its start (title, Skip) is the part that stays visible.
  return Math.max(min, Math.min(value, max));
}

/** How many px of the visible part of `[aTop, aBottom]` the band `[bTop, bBottom]` covers. */
function overlap(aTop: number, aBottom: number, bTop: number, bBottom: number): number {
  return Math.max(0, Math.min(aBottom, bBottom) - Math.max(aTop, bTop));
}

export function placeCard(rect: Box | null, card: Size, viewport: Size): CardPlacement {
  const M = VIEWPORT_MARGIN;
  const maxX = viewport.width - card.width - M;
  const maxY = viewport.height - card.height - M;

  if (!rect) {
    return {
      mode: "centered",
      x: clamp((viewport.width - card.width) / 2, M, maxX),
      y: clamp((viewport.height - card.height) / 2, M, maxY),
    };
  }

  const x = clamp(rect.left, M, maxX);
  const offset = HIGHLIGHT_PADDING + CARD_GAP;

  const below = rect.top + rect.height + offset;
  if (below >= M && below <= maxY) return { mode: "below", x, y: below };

  const above = rect.top - offset - card.height;
  if (above >= M && above <= maxY) return { mode: "above", x, y: above };

  // No room beside the target (small screen, or a target taller than the
  // viewport): dock the card to whichever viewport edge hides less of the
  // target. Ties go to the bottom, where thumbs already are.
  const visTop = Math.max(rect.top, 0);
  const visBottom = Math.min(rect.top + rect.height, viewport.height);
  const coverBottom = overlap(visTop, visBottom, maxY, maxY + card.height);
  const coverTop = overlap(visTop, visBottom, M, M + card.height);
  const dockX = clamp((viewport.width - card.width) / 2, M, maxX);
  return coverTop < coverBottom
    ? { mode: "dock-top", x: dockX, y: M }
    : { mode: "dock-bottom", x: dockX, y: clamp(maxY, M, maxY) };
}

/** Whether the target needs scrolling to sit fully on screen (with margin). */
export function needsScroll(rect: Box, viewport: Size): boolean {
  return rect.top < VIEWPORT_MARGIN || rect.top + rect.height > viewport.height - VIEWPORT_MARGIN;
}
