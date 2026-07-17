import { describe, it, expect } from "vitest";
import { computePrice, MIN_SEATS, MAX_SEATS, INCLUDED_SEATS } from "./pricing";

// These numbers must match app/api/class/checkout/route.ts's computeAmount
// (in centavos there: 79900 / 99900 / 5900 — here in whole pesos).
describe("computePrice", () => {
  it("returns the ₱799 base for scope='subject' at the 11-seat minimum", () => {
    const result = computePrice("subject", MIN_SEATS);
    expect(result.base).toBe(799);
    expect(result.extraSeats).toBe(0);
    expect(result.extra).toBe(0);
    expect(result.total).toBe(799);
  });

  it("returns the ₱999 base for scope='all' at the 11-seat minimum", () => {
    const result = computePrice("all", MIN_SEATS);
    expect(result.base).toBe(999);
    expect(result.total).toBe(999);
  });

  it("adds ₱59 per seat above the 11 included seats (subject scope)", () => {
    const result = computePrice("subject", 20);
    expect(result.extraSeats).toBe(9);
    expect(result.extra).toBe(9 * 59);
    expect(result.total).toBe(799 + 9 * 59);
    expect(result.total).toBe(1330); // matches server test: 133000 centavos
  });

  it("adds ₱59 per seat above the 11 included seats (all scope)", () => {
    const result = computePrice("all", MAX_SEATS);
    const expectedExtra = (MAX_SEATS - INCLUDED_SEATS) * 59;
    expect(result.total).toBe(999 + expectedExtra);
  });

  it("never charges for negative extra seats even if seats < included", () => {
    // Defensive: the slider never goes below MIN_SEATS === INCLUDED_SEATS,
    // but the formula itself should not go negative if misused.
    const result = computePrice("subject", 5);
    expect(result.extraSeats).toBe(0);
    expect(result.extra).toBe(0);
    expect(result.total).toBe(799);
  });

  it("computes perHead as total divided by seats", () => {
    const result = computePrice("subject", 20);
    expect(result.perHead).toBeCloseTo(1330 / 20, 5);
  });
});
