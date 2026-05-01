import { describe, it, expect } from "vitest";
import { PLANS } from "./paymongo";
import { cheapestSubjectPrice, formatPeso } from "./pricing";

describe("formatPeso", () => {
  it("drops centavos on whole pesos and keeps them otherwise", () => {
    expect(formatPeso(4900)).toBe("₱49");
    expect(formatPeso(29950)).toBe("₱299.50");
    expect(formatPeso(150000)).toBe("₱1,500");
  });
});

describe("cheapestSubjectPrice", () => {
  it("quotes the lowest single-subject plan straight from PLANS", () => {
    const price = cheapestSubjectPrice();
    const floor = Math.min(PLANS.subject_month.amount, PLANS.subject_sem.amount);
    expect(PLANS[price.plan].amount).toBe(floor);
    expect(price.amountLabel).toBe(formatPeso(floor));
  });

  it("never quotes the all-subjects plan as a subject's starting price", () => {
    expect(cheapestSubjectPrice().plan).not.toBe("year_sem");
  });

  it("says what the quoted plan buys", () => {
    const price = cheapestSubjectPrice();
    expect(price.term).toBe(price.plan === "subject_month" ? "for a month" : "for the whole semester");
  });
});
