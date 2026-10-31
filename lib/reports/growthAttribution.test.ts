import { describe, it, expect } from "vitest";
import {
  ENTER_REDEFINED_ON,
  REACTIVATION_CAMPAIGN,
  campaignEnters,
  enterDefinitionFor,
  enterDefinitionNote,
  type UtmTripleRow,
} from "./growthAttribution";

describe("enterDefinitionFor", () => {
  it("dates the redefinition to 2026-10-31", () => {
    expect(ENTER_REDEFINED_ON).toBe("2026-10-31");
  });

  it("classifies a window that ends before the change as the old definition", () => {
    expect(enterDefinitionFor("2026-10-19 → 2026-10-25")).toBe("per-home-visit");
    expect(enterDefinitionFor("2026-10-24 → 2026-10-30")).toBe("per-home-visit");
  });

  it("classifies a window that starts on or after the change as the new one", () => {
    expect(enterDefinitionFor("2026-10-31 → 2026-11-06")).toBe("per-session-landing");
    expect(enterDefinitionFor("2026-11-02 → 2026-11-08")).toBe("per-session-landing");
  });

  it("flags a window that straddles the change as mixed", () => {
    expect(enterDefinitionFor("2026-10-26 → 2026-11-01")).toBe("mixed");
    expect(enterDefinitionFor("2026-10-30 → 2026-10-31")).toBe("mixed");
  });

  it("refuses a label it cannot parse rather than guessing", () => {
    expect(() => enterDefinitionFor("2026-10-26")).toThrow(/Unparseable/);
  });
});

describe("enterDefinitionNote", () => {
  it("is comparable when both weeks share the new definition", () => {
    const note = enterDefinitionNote("2026-11-09 → 2026-11-15", "2026-11-02 → 2026-11-08");
    expect(note.comparable).toBe(true);
    expect(note.note).toMatch(/comparable/);
  });

  it("is not comparable across the break, and says the drop is not reach", () => {
    const note = enterDefinitionNote("2026-11-02 → 2026-11-08", "2026-10-26 → 2026-11-01");
    expect(note).toMatchObject({
      changedOn: "2026-10-31",
      current: "per-session-landing",
      previous: "mixed",
      comparable: false,
    });
    expect(note.note).toMatch(/not a change in reach/);
  });

  it("is not comparable when the current week itself is mixed", () => {
    expect(
      enterDefinitionNote("2026-10-26 → 2026-11-01", "2026-10-19 → 2026-10-25").comparable
    ).toBe(false);
  });

  it("is comparable for two old-definition weeks", () => {
    expect(
      enterDefinitionNote("2026-10-19 → 2026-10-25", "2026-10-12 → 2026-10-18").comparable
    ).toBe(true);
  });
});

const row = (over: Partial<UtmTripleRow>): UtmTripleRow => ({
  utm_source: "groupchat",
  utm_medium: "social",
  utm_campaign: "finals-dec-2026",
  enters: 3,
  devices: 2,
  ...over,
});

describe("campaignEnters", () => {
  it("tracks the finals reactivation email tags", () => {
    expect(REACTIVATION_CAMPAIGN).toEqual({
      utm_source: "reactivation",
      utm_medium: "email",
      utm_campaign: "finals-dec-2026",
    });
  });

  it("returns the enters of an exact triple match", () => {
    const byUtm = {
      rows: [row({}), row({ utm_source: "reactivation", utm_medium: "email", enters: 7 })],
      total_groups: 2,
    };
    expect(campaignEnters(byUtm, REACTIVATION_CAMPAIGN)).toBe(7);
  });

  it("does not match on a partial triple", () => {
    const byUtm = {
      rows: [row({ utm_source: "reactivation", utm_medium: "social" })],
      total_groups: 1,
    };
    expect(campaignEnters(byUtm, REACTIVATION_CAMPAIGN)).toBe(0);
  });

  it("returns 0 for a complete list without the triple, including an empty one", () => {
    expect(campaignEnters({ rows: [row({})], total_groups: 1 }, REACTIVATION_CAMPAIGN)).toBe(0);
    expect(campaignEnters({ rows: null, total_groups: 0 }, REACTIVATION_CAMPAIGN)).toBe(0);
  });

  it("returns null when the triple may be below a truncated list's cap", () => {
    expect(campaignEnters({ rows: [row({})], total_groups: 16 }, REACTIVATION_CAMPAIGN)).toBeNull();
  });

  it("returns null when the breakdown was not read", () => {
    expect(campaignEnters(null, REACTIVATION_CAMPAIGN)).toBeNull();
    expect(campaignEnters(undefined, REACTIVATION_CAMPAIGN)).toBeNull();
  });
});
