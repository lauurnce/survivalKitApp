import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  computePrice,
  MIN_SEATS,
  MAX_SEATS,
} from "../../app/(main)/for-blocks/pricing";
import {
  BLOCK_SOURCES,
  extractConstants,
  normaliseToCentavos,
  blockPriceCentavos,
  isBlockAmountFrom,
  compareSources,
  FORMULA_MARKERS,
  formulaMarkersPresent,
  seatBoundEnforcement,
  type BlockConstants,
} from "./blockPrice";

// process.cwd() rather than __dirname: vitest runs from the repo root (see
// vitest.config.ts, which excludes .claude worktrees precisely because it does)
// and __dirname is not reliably defined in a Vite-transformed test module.
const REPO_ROOT = process.cwd();

function readSource(relativePath: string): string {
  const full = join(REPO_ROOT, relativePath);
  if (!existsSync(full)) {
    throw new Error(
      `Block-price source not found at ${full}. Either the file moved — in which ` +
        `case update BLOCK_SOURCES — or vitest is running from somewhere other ` +
        `than the repo root.`
    );
  }
  return readFileSync(full, "utf8");
}

const CONSTANTS: BlockConstants = {
  baseSubjectCentavos: 79900,
  baseAllCentavos: 99900,
  perSeatCentavos: 5900,
  includedSeats: 11,
};

describe("extractConstants", () => {
  const spec = BLOCK_SOURCES[1]; // the centavos-named checkout spec

  it("reads constants declared one per statement", () => {
    const source = `
      const BASE_SUBJECT_CENTAVOS = 79900;
      const BASE_ALL_CENTAVOS = 99900;
      const PER_SEAT_CENTAVOS = 5900;
      const INCLUDED_SEATS = 11;
    `;
    expect(extractConstants(source, spec)).toEqual({
      ok: true,
      constants: {
        baseSubjectCentavos: 79900,
        baseAllCentavos: 99900,
        perSeatCentavos: 5900,
        includedSeats: 11,
      },
    });
  });

  it("reads a comma-declared list spanning several lines", () => {
    // This is the webhook's actual shape.
    const source = `
      const BASE_SUBJECT_CENTAVOS = 79900,
        BASE_ALL_CENTAVOS = 99900,
        PER_SEAT_CENTAVOS = 5900,
        INCLUDED_SEATS = 11;
    `;
    expect(extractConstants(source, spec).ok).toBe(true);
  });

  it("names every constant it could not find", () => {
    const result = extractConstants("const PER_SEAT_CENTAVOS = 5900;", spec);
    expect(result).toMatchObject({ ok: false });
    if (!result.ok) {
      expect(result.missing).toContain("BASE_SUBJECT_CENTAVOS");
      expect(result.missing).toContain("INCLUDED_SEATS");
    }
  });

  it("does not mistake a longer identifier for the one it wants", () => {
    // BASE_SUBJECT must not match inside BASE_SUBJECT_CENTAVOS.
    const pesosSpec = BLOCK_SOURCES[0];
    const result = extractConstants("const BASE_SUBJECT_CENTAVOS = 79900;", pesosSpec);
    expect(result).toMatchObject({ ok: false });
  });
});

describe("normaliseToCentavos", () => {
  it("scales pesos to centavos", () => {
    const scaled = normaliseToCentavos(
      { baseSubjectCentavos: 799, baseAllCentavos: 999, perSeatCentavos: 59, includedSeats: 11 },
      "pesos"
    );
    expect(scaled).toMatchObject({ baseSubjectCentavos: 79900, perSeatCentavos: 5900 });
  });

  it("leaves the seat count alone — it is a count, not money", () => {
    const scaled = normaliseToCentavos(
      { baseSubjectCentavos: 799, baseAllCentavos: 999, perSeatCentavos: 59, includedSeats: 11 },
      "pesos"
    );
    expect(scaled.includedSeats).toBe(11);
  });

  it("passes centavos through untouched", () => {
    expect(normaliseToCentavos(CONSTANTS, "centavos")).toEqual(CONSTANTS);
  });
});

describe("blockPriceCentavos", () => {
  it("charges the base at exactly the included seat count", () => {
    expect(blockPriceCentavos(CONSTANTS, "subject", 11)).toBe(79900);
  });

  it("uses the all-subjects base for an all-subjects block", () => {
    expect(blockPriceCentavos(CONSTANTS, "all", 11)).toBe(99900);
  });

  it("adds the per-seat price for every seat past the included count", () => {
    expect(blockPriceCentavos(CONSTANTS, "subject", 14)).toBe(79900 + 3 * 5900);
  });

  it("never goes below the base for a seat count under the included count", () => {
    expect(blockPriceCentavos(CONSTANTS, "subject", 2)).toBe(79900);
  });
});

describe("isBlockAmountFrom", () => {
  const isBlockAmount = isBlockAmountFrom(CONSTANTS);

  it("recognises the subject base", () => {
    expect(isBlockAmount(79900, "subject")).toBe(true);
  });

  it("recognises the all-subjects base", () => {
    expect(isBlockAmount(99900, "all")).toBe(true);
  });

  it("recognises a base plus whole extra seats", () => {
    expect(isBlockAmount(79900 + 4 * 5900, "subject")).toBe(true);
  });

  it("rejects an amount between two seat steps", () => {
    expect(isBlockAmount(79900 + 100, "subject")).toBe(false);
  });

  it("rejects a per-device plan price", () => {
    expect(isBlockAmount(9900, "subject")).toBe(false);
    expect(isBlockAmount(29900, "all")).toBe(false);
  });

  it("does not read a subject amount as an all-subjects block", () => {
    expect(isBlockAmount(79900, "all")).toBe(false);
  });
});

describe("compareSources", () => {
  it("finds no drift when every source agrees", () => {
    expect(
      compareSources([
        { path: "a", constants: CONSTANTS },
        { path: "b", constants: CONSTANTS },
      ])
    ).toEqual([]);
  });

  it("names the field and every value when a source disagrees", () => {
    const drift = compareSources([
      { path: "a", constants: CONSTANTS },
      { path: "b", constants: { ...CONSTANTS, perSeatCentavos: 6900 } },
    ]);
    expect(drift).toHaveLength(1);
    expect(drift[0].field).toBe("perSeatCentavos");
    expect(drift[0].values.map((entry) => entry.path).sort()).toEqual(["a", "b"]);
  });

  it("reports one drift per disagreeing field, not one per pair", () => {
    const drift = compareSources([
      { path: "a", constants: CONSTANTS },
      { path: "b", constants: { ...CONSTANTS, perSeatCentavos: 1, includedSeats: 2 } },
    ]);
    expect(drift.map((entry) => entry.field).sort()).toEqual([
      "includedSeats",
      "perSeatCentavos",
    ]);
  });
});

describe("formulaMarkersPresent", () => {
  it("accepts a source carrying the canonical expression", () => {
    expect(
      formulaMarkersPresent(
        "const extra = Math.max(0, seats - INCLUDED_SEATS) * PER_SEAT_CENTAVOS;"
      )
    ).toEqual([]);
  });

  it("names the markers a source is missing", () => {
    expect(formulaMarkersPresent("const extra = seats - 11;")).toEqual([
      ...FORMULA_MARKERS,
    ]);
  });
});

describe("seatBoundEnforcement", () => {
  it("reports a lower bound that is enforced", () => {
    const result = seatBoundEnforcement("if (seats < MIN_SEATS) return;", "if (seats < 11) return;");
    expect(result.minSeatsCheckout).toBe("MIN_SEATS");
    expect(result.minSeatsWebhookLiteral).toBe(11);
  });

  it("reports an unenforced upper bound rather than failing on it", () => {
    const result = seatBoundEnforcement("if (seats < MIN_SEATS) return;", "if (seats < 11) return;");
    expect(result.maxEnforcedAtCheckout).toBe(false);
    expect(result.maxEnforcedAtWebhook).toBe(false);
  });

  it("notices if an upper bound is ever added", () => {
    const result = seatBoundEnforcement("if (seats > MAX_SEATS) return;", "if (seats < 11) return;");
    expect(result.maxEnforcedAtCheckout).toBe(true);
  });
});

// ── The standing assertion. This is the point of the module. ────────────────

describe("the block price formula agrees across every source in the repo", () => {
  const sources = BLOCK_SOURCES.map((spec) => ({
    spec,
    text: readSource(spec.path),
  }));

  it("finds all three sources where the plan says they are", () => {
    expect(sources).toHaveLength(3);
    expect(sources.every((source) => source.text.length > 0)).toBe(true);
  });

  it("finds every constant in every source", () => {
    for (const { spec, text } of sources) {
      const result = extractConstants(text, spec);
      // If this fails, a constant was renamed or inlined. Update BLOCK_SOURCES
      // — do not delete the assertion.
      expect(result, `${spec.path} is missing constants`).toMatchObject({ ok: true });
    }
  });

  it("agrees on every constant once units are normalised", () => {
    const entries = sources.map(({ spec, text }) => {
      const result = extractConstants(text, spec);
      if (!result.ok) throw new Error(`${spec.path}: missing ${result.missing.join(", ")}`);
      return { path: spec.path, constants: normaliseToCentavos(result.constants, spec.unit) };
    });

    const drift = compareSources(entries);
    // A failure here is a P0 by the Finance escalation list: the webhook is
    // what rejects an underpayment, and a webhook that disagrees with checkout
    // either accepts short payments or rejects correct ones.
    expect(drift, `block price drift: ${JSON.stringify(drift)}`).toEqual([]);
  });

  it("agrees with the client preview at every seat count that can be sold", () => {
    const { spec, text } = sources[0];
    const result = extractConstants(text, spec);
    if (!result.ok) throw new Error("pricing.ts constants missing");
    const constants = normaliseToCentavos(result.constants, spec.unit);

    for (const seats of [MIN_SEATS, MIN_SEATS + 1, 20, 40, MAX_SEATS]) {
      for (const scope of ["subject", "all"] as const) {
        expect(
          Math.round(computePrice(scope, seats).total * 100),
          `computePrice disagrees at ${scope}/${seats} seats`
        ).toBe(blockPriceCentavos(constants, scope, seats));
      }
    }
  });

  it("still carries the canonical formula shape in both server copies", () => {
    for (const { spec, text } of sources.slice(1)) {
      expect(formulaMarkersPresent(text), `${spec.path} lost a formula marker`).toEqual([]);
    }
  });

  it("agrees on the seat minimum across all three copies, including the bare literal", () => {
    const checkout = sources[1].text;
    const webhook = sources[2].text;
    const bounds = seatBoundEnforcement(checkout, webhook);
    // The webhook hardcodes the minimum instead of importing it. That is a
    // fourth copy of a shared number and it is asserted, not merely reported.
    expect(bounds.minSeatsWebhookLiteral).toBe(MIN_SEATS);
  });
});
