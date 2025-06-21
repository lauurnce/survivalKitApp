import { describe, it, expect } from "vitest";
import { counterVisitsFor } from "./readCounting";

const YEAR = "00000000-0000-0000-0000-000000000001";
const SUBJECT = "11111111-1111-4111-8111-111111111111";
const MODULE = "22222222-2222-4222-8222-222222222222";
const SECTION = "33333333-3333-4333-8333-333333333333";

describe("counterVisitsFor", () => {
  it("counts a module read AND the year reader for a deep-linked lesson", () => {
    expect(
      counterVisitsFor({ event_type: "module_open", year_id: YEAR, subject_id: SUBJECT, module_id: MODULE }),
    ).toEqual([
      { type: "module", id: MODULE },
      { type: "year", id: YEAR },
    ]);
  });

  it("counts the year reader from the subjects list page", () => {
    expect(counterVisitsFor({ event_type: "subject_open", year_id: YEAR })).toEqual([
      { type: "year", id: YEAR },
    ]);
  });

  it("counts a subject read and the year reader from the modules list page", () => {
    expect(counterVisitsFor({ event_type: "subject_open", year_id: YEAR, subject_id: SUBJECT })).toEqual([
      { type: "subject", id: SUBJECT },
      { type: "year", id: YEAR },
    ]);
  });

  it("counts a section read", () => {
    expect(counterVisitsFor({ event_type: "section_view", module_id: MODULE, section_id: SECTION })).toEqual([
      { type: "section", id: SECTION },
    ]);
  });

  it.each(["enter", "year_select", "paywall_teaser_view", "unlock_click", "print_click"])(
    "counts nothing for %s",
    (event_type) => {
      expect(counterVisitsFor({ event_type, year_id: YEAR, module_id: MODULE })).toEqual([]);
    },
  );

  it("counts nothing when the resource id is missing", () => {
    expect(counterVisitsFor({ event_type: "module_open" })).toEqual([]);
    expect(counterVisitsFor({ event_type: "section_view", module_id: MODULE })).toEqual([]);
  });
});
