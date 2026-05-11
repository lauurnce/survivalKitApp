import { describe, it, expect } from "vitest";
import { MAX_REACTIVATION_PER_DAY, scheduleFor, selectReactivationAudience, type AudienceUser } from "./reactivationAudience";

const NOW = new Date("2026-11-20T00:00:00Z");
const user = (id: string, over: Partial<AudienceUser> = {}): AudienceUser => ({
  id, email: `${id}@x.test`, emailConfirmedAt: "2026-07-01T00:00:00Z", createdAt: `2026-07-0${id.length}T00:00:00Z`, ...over,
});
const none = new Set<string>();

describe("selectReactivationAudience", () => {
  it("puts each confirmed account in exactly one bucket, highest-priority reason first", () => {
    const r = selectReactivationAudience({
      users: [
        user("a"),
        user("b"),
        user("c"),
        user("d"),
        user("e"),
        user("u", { emailConfirmedAt: null }),
        user("n", { email: null }),
        user("x", { bannedUntil: "2099-01-01T00:00:00Z" }),
      ],
      unsubscribed: new Set(["b", "c"]),
      bounced: new Set(["c", "d"]),
      activeBuyers: new Set(["d", "e"]),
      alreadyQueued: none,
      now: NOW,
    });
    expect(r.counts).toEqual({
      accounts: 8, unconfirmed: 2, banned: 1, confirmed: 5,
      excludedUnsubscribed: 2, excludedBounced: 1, excludedActiveBuyer: 1, excludedAlreadyQueued: 0,
      eligible: 1,
    });
    expect(r.eligible).toEqual([{ id: "a", email: "a@x.test" }]);
  });

  it("does not re-queue anyone already queued for this campaign", () => {
    const r = selectReactivationAudience({
      users: [user("a"), user("b")], unsubscribed: none, bounced: none, activeBuyers: none,
      alreadyQueued: new Set(["a"]), now: NOW,
    });
    expect(r.counts.excludedAlreadyQueued).toBe(1);
    expect(r.eligible.map((e) => e.id)).toEqual(["b"]);
  });

  it("treats an expired ban as not banned", () => {
    const r = selectReactivationAudience({
      users: [user("a", { bannedUntil: "2026-01-01T00:00:00Z" })],
      unsubscribed: none, bounced: none, activeBuyers: none, alreadyQueued: none, now: NOW,
    });
    expect(r.counts.eligible).toBe(1);
  });

  it("orders eligible users oldest account first", () => {
    const r = selectReactivationAudience({
      users: [user("ccc"), user("a"), user("bb")],
      unsubscribed: none, bounced: none, activeBuyers: none, alreadyQueued: none, now: NOW,
    });
    expect(r.eligible.map((e) => e.id)).toEqual(["a", "bb", "ccc"]);
  });
});

describe("scheduleFor", () => {
  const start = new Date("2026-11-20T00:00:00Z");

  it("spreads rows perDay at a time across consecutive days", () => {
    expect(scheduleFor(0, 40, start).toISOString()).toBe("2026-11-20T00:00:00.000Z");
    expect(scheduleFor(39, 40, start).toISOString()).toBe("2026-11-20T00:00:00.000Z");
    expect(scheduleFor(40, 40, start).toISOString()).toBe("2026-11-21T00:00:00.000Z");
    expect(scheduleFor(85, 40, start).toISOString()).toBe("2026-11-22T00:00:00.000Z");
  });

  it("refuses a daily rate the drain and Resend free tier cannot absorb", () => {
    expect(() => scheduleFor(0, MAX_REACTIVATION_PER_DAY + 1, start)).toThrow();
    expect(() => scheduleFor(0, 0, start)).toThrow();
  });
});
