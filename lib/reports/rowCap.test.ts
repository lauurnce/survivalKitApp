import { describe, it, expect } from "vitest";
import { SELECT_ROW_CAP, assertUnderCap } from "./rowCap";

describe("SELECT_ROW_CAP", () => {
  it("is Supabase's documented select ceiling", () => {
    expect(SELECT_ROW_CAP).toBe(1000);
  });
});

describe("assertUnderCap", () => {
  it("accepts an empty table", () => {
    expect(() => assertUnderCap("payments", 0)).not.toThrow();
  });

  it("accepts a row count one below the cap", () => {
    expect(() => assertUnderCap("payments", 999)).not.toThrow();
  });

  it("throws at exactly the cap, because that result may be truncated", () => {
    expect(() => assertUnderCap("payments", 1000)).toThrow();
  });

  it("throws above the cap", () => {
    expect(() => assertUnderCap("subscriptions", 1500)).toThrow();
  });

  it("names the table in the message so the fix is obvious", () => {
    expect(() => assertUnderCap("subscriptions", 1000)).toThrow(/subscriptions/);
  });

  it("tells the reader to add an aggregate RPC rather than raise the limit", () => {
    expect(() => assertUnderCap("payments", 1000)).toThrow(/RPC/);
  });
});
