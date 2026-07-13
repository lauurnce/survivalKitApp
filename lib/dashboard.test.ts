import { describe, it, expect } from "vitest";
import {
  subjectStatus,
  groupByTerm,
  deriveCurrentTerm,
  pickRecommended,
  roadmapNodes,
  continueHref,
  type TermGroup,
  type CurrentTerm,
  type Recommendation,
} from "./dashboard";
import type { SubjectSummary, YearGroup, ModuleSummary } from "./account";

function mkSubject(overrides: Partial<SubjectSummary> = {}): SubjectSummary {
  const modules: ModuleSummary[] = overrides.modules ?? [
    { id: "m1", title: "Module 1", done: false },
    { id: "m2", title: "Module 2", done: false },
  ];
  const doneCount = overrides.doneCount ?? modules.filter((m) => m.done).length;
  const totalCount = overrides.totalCount ?? modules.length;
  return {
    id: "subj-1",
    title: "Subject 1",
    yearId: "year-1",
    unlocked: true,
    doneCount,
    totalCount,
    modules,
    semester: 1,
    kind: "major",
    ...overrides,
  };
}

describe("subjectStatus", () => {
  it("is ready when doneCount is 0", () => {
    expect(subjectStatus({ doneCount: 0, totalCount: 5 })).toBe("ready");
  });

  it("is ready when totalCount is 0", () => {
    expect(subjectStatus({ doneCount: 0, totalCount: 0 })).toBe("ready");
  });

  it("is in-progress when partially done", () => {
    expect(subjectStatus({ doneCount: 2, totalCount: 5 })).toBe("in-progress");
  });

  it("is done when doneCount >= totalCount and totalCount > 0", () => {
    expect(subjectStatus({ doneCount: 5, totalCount: 5 })).toBe("done");
  });
});

describe("groupByTerm", () => {
  it("emits terms in year-sort order, then semester order, preserving subject order", () => {
    const year2: YearGroup = {
      yearId: "y2",
      label: "Year 2",
      sortOrder: 2,
      subjects: [
        mkSubject({ id: "s3", yearId: "y2", semester: 1 }),
        mkSubject({ id: "s4", yearId: "y2", semester: 2 }),
      ],
    };
    const year1: YearGroup = {
      yearId: "y1",
      label: "Year 1",
      sortOrder: 1,
      subjects: [
        mkSubject({ id: "s1", yearId: "y1", semester: 1 }),
        mkSubject({ id: "s2", yearId: "y1", semester: 2 }),
      ],
    };
    // Pass years unsorted (year2 before year1) to verify groupByTerm sorts itself.
    const terms = groupByTerm([year2, year1]);
    expect(terms.map((t) => `${t.yearId}-${t.semester}`)).toEqual([
      "y1-1",
      "y1-2",
      "y2-1",
      "y2-2",
    ]);
    expect(terms[0].subjects.map((s) => s.id)).toEqual(["s1"]);
    expect(terms[0].yearSort).toBe(1);
    expect(terms[0].yearLabel).toBe("Year 1");
  });

  it("preserves subject order within a term", () => {
    const year: YearGroup = {
      yearId: "y1",
      label: "Year 1",
      sortOrder: 1,
      subjects: [
        mkSubject({ id: "a", yearId: "y1", semester: 1 }),
        mkSubject({ id: "b", yearId: "y1", semester: 1 }),
        mkSubject({ id: "c", yearId: "y1", semester: 1 }),
      ],
    };
    const terms = groupByTerm([year]);
    expect(terms[0].subjects.map((s) => s.id)).toEqual(["a", "b", "c"]);
  });

  it("omits empty terms (no subjects for that semester)", () => {
    const year: YearGroup = {
      yearId: "y1",
      label: "Year 1",
      sortOrder: 1,
      subjects: [mkSubject({ id: "s1", yearId: "y1", semester: 1 })],
    };
    const terms = groupByTerm([year]);
    expect(terms).toHaveLength(1);
    expect(terms[0].semester).toBe(1);
  });

  it("returns [] for years with no subjects", () => {
    const year: YearGroup = { yearId: "y1", label: "Year 1", sortOrder: 1, subjects: [] };
    expect(groupByTerm([year])).toEqual([]);
  });
});

describe("deriveCurrentTerm", () => {
  function term(overrides: Partial<TermGroup> = {}): TermGroup {
    return {
      yearId: "y1",
      yearLabel: "Year 1",
      yearSort: 1,
      semester: 1,
      subjects: [],
      ...overrides,
    };
  }

  it("picks the earliest term with unfinished unlocked work", () => {
    const t1 = term({
      yearId: "y1",
      semester: 1,
      subjects: [mkSubject({ id: "s1", doneCount: 2, totalCount: 2, unlocked: true })],
    });
    const t2 = term({
      yearId: "y1",
      semester: 2,
      subjects: [mkSubject({ id: "s2", doneCount: 0, totalCount: 2, unlocked: true })],
    });
    const result = deriveCurrentTerm([t1, t2]);
    expect(result?.semester).toBe(2);
  });

  it("skips terms whose only unfinished subjects are locked", () => {
    const t1 = term({
      yearId: "y1",
      semester: 1,
      subjects: [mkSubject({ id: "s1", doneCount: 0, totalCount: 2, unlocked: false })],
    });
    const t2 = term({
      yearId: "y1",
      semester: 2,
      subjects: [mkSubject({ id: "s2", doneCount: 1, totalCount: 2, unlocked: true })],
    });
    const result = deriveCurrentTerm([t1, t2]);
    expect(result?.semester).toBe(2);
  });

  it("falls back to the last term with any unlocked subject when all unlocked work is done", () => {
    const t1 = term({
      yearId: "y1",
      semester: 1,
      subjects: [mkSubject({ id: "s1", doneCount: 2, totalCount: 2, unlocked: true })],
    });
    const t2 = term({
      yearId: "y1",
      semester: 2,
      subjects: [mkSubject({ id: "s2", doneCount: 2, totalCount: 2, unlocked: true })],
    });
    const result = deriveCurrentTerm([t1, t2]);
    expect(result?.semester).toBe(2);
  });

  it("is null when no term has an unlocked subject", () => {
    const t1 = term({
      subjects: [mkSubject({ id: "s1", unlocked: false })],
    });
    expect(deriveCurrentTerm([t1])).toBeNull();
  });

  it("is null for an empty terms list", () => {
    expect(deriveCurrentTerm([])).toBeNull();
  });

  it("computes stats over unlocked subjects only, excluding locked subjects entirely", () => {
    const t1 = term({
      subjects: [
        mkSubject({ id: "locked", unlocked: false, doneCount: 0, totalCount: 10 }),
        mkSubject({ id: "in-progress", unlocked: true, doneCount: 1, totalCount: 2 }),
        mkSubject({ id: "ready", unlocked: true, doneCount: 0, totalCount: 2 }),
        mkSubject({ id: "done", unlocked: true, doneCount: 2, totalCount: 2 }),
      ],
    });
    const result = deriveCurrentTerm([t1]);
    expect(result).not.toBeNull();
    expect(result?.modulesDone).toBe(3); // 1 + 0 + 2, locked excluded
    expect(result?.modulesTotal).toBe(6); // 2 + 2 + 2, locked excluded
    expect(result?.inProgress).toBe(1);
    expect(result?.ready).toBe(1);
  });
});

describe("pickRecommended", () => {
  it("returns [] for a null term", () => {
    expect(pickRecommended(null)).toEqual([]);
  });

  it("returns [] for a term where all unlocked subjects are done", () => {
    const t: TermGroup = {
      yearId: "y1",
      yearLabel: "Year 1",
      yearSort: 1,
      semester: 1,
      subjects: [mkSubject({ id: "s1", doneCount: 2, totalCount: 2, unlocked: true })],
    };
    expect(pickRecommended(t)).toEqual([]);
  });

  it("recommends in-progress subjects' first not-done module before ready subjects", () => {
    const inProgressSubject = mkSubject({
      id: "s-inprog",
      unlocked: true,
      doneCount: 1,
      totalCount: 2,
      modules: [
        { id: "m1", title: "Module 1", done: true },
        { id: "m2", title: "Module 2", done: false },
      ],
    });
    const readySubject = mkSubject({
      id: "s-ready",
      unlocked: true,
      doneCount: 0,
      totalCount: 2,
      modules: [
        { id: "m3", title: "Module 3", done: false },
        { id: "m4", title: "Module 4", done: false },
      ],
    });
    // Ready subject listed first in term order, but in-progress must come first in output.
    const t: TermGroup = {
      yearId: "y1",
      yearLabel: "Year 1",
      yearSort: 1,
      semester: 1,
      subjects: [readySubject, inProgressSubject],
    };
    const recs = pickRecommended(t);
    expect(recs.map((r) => r.moduleId)).toEqual(["m2", "m3"]);
    expect(recs[0].status).toBe("in-progress");
    expect(recs[0].subjectId).toBe("s-inprog");
    expect(recs[1].status).toBe("ready");
  });

  it("excludes locked subjects", () => {
    const locked = mkSubject({
      id: "s-locked",
      unlocked: false,
      doneCount: 0,
      totalCount: 2,
      modules: [{ id: "mlock", title: "Locked module", done: false }],
    });
    const t: TermGroup = {
      yearId: "y1",
      yearLabel: "Year 1",
      yearSort: 1,
      semester: 1,
      subjects: [locked],
    };
    expect(pickRecommended(t)).toEqual([]);
  });

  it("caps at the default limit of 3", () => {
    const subjects = ["a", "b", "c", "d"].map((id) =>
      mkSubject({
        id,
        unlocked: true,
        doneCount: 0,
        totalCount: 1,
        modules: [{ id: `m-${id}`, title: `Module ${id}`, done: false }],
      }),
    );
    const t: TermGroup = {
      yearId: "y1",
      yearLabel: "Year 1",
      yearSort: 1,
      semester: 1,
      subjects,
    };
    expect(pickRecommended(t)).toHaveLength(3);
  });

  it("respects a custom limit", () => {
    const subjects = ["a", "b", "c", "d"].map((id) =>
      mkSubject({
        id,
        unlocked: true,
        doneCount: 0,
        totalCount: 1,
        modules: [{ id: `m-${id}`, title: `Module ${id}`, done: false }],
      }),
    );
    const t: TermGroup = {
      yearId: "y1",
      yearLabel: "Year 1",
      yearSort: 1,
      semester: 1,
      subjects,
    };
    expect(pickRecommended(t, 2)).toHaveLength(2);
  });

  it("respects module order within a subject (first not-done module)", () => {
    const subject = mkSubject({
      id: "s1",
      unlocked: true,
      doneCount: 1,
      totalCount: 3,
      modules: [
        { id: "m1", title: "Module 1", done: true },
        { id: "m2", title: "Module 2", done: false },
        { id: "m3", title: "Module 3", done: false },
      ],
    });
    const t: TermGroup = {
      yearId: "y1",
      yearLabel: "Year 1",
      yearSort: 1,
      semester: 1,
      subjects: [subject],
    };
    const recs = pickRecommended(t);
    expect(recs).toHaveLength(1);
    expect(recs[0].moduleId).toBe("m2");
  });
});

describe("roadmapNodes", () => {
  function term(yearId: string, semester: number, yearSort: number): TermGroup {
    return { yearId, yearLabel: `Year ${yearSort}`, yearSort, semester, subjects: [] };
  }

  it("assigns past/current/future relative to the current term, and appends a graduation node", () => {
    const terms = [term("y1", 1, 1), term("y1", 2, 1), term("y2", 1, 2)];
    const current: CurrentTerm = { ...terms[1], modulesDone: 0, modulesTotal: 0, inProgress: 0, ready: 0 };
    const nodes = roadmapNodes(terms, current);
    expect(nodes.map((n) => n.state)).toEqual(["past", "current", "future", "future"]);
    expect(nodes[nodes.length - 1]).toEqual({ key: "grad", short: "Graduation", state: "future" });
  });

  it("marks every term as future when current is null", () => {
    const terms = [term("y1", 1, 1), term("y1", 2, 1)];
    const nodes = roadmapNodes(terms, null);
    expect(nodes.map((n) => n.state)).toEqual(["future", "future", "future"]);
  });

  it("numbers yearPosition using distinct years ordered by yearSort, across 4 years", () => {
    const terms = [
      term("y1", 1, 1),
      term("y1", 2, 1),
      term("y2", 1, 2),
      term("y2", 2, 2),
      term("y3", 1, 3),
      term("y3", 2, 3),
      term("y4", 1, 4),
      term("y4", 2, 4),
    ];
    const nodes = roadmapNodes(terms, null);
    expect(nodes.map((n) => n.short)).toEqual([
      "1-1",
      "1-2",
      "2-1",
      "2-2",
      "3-1",
      "3-2",
      "4-1",
      "4-2",
      "Graduation",
    ]);
  });

  it("uses key `${yearId}-${semester}` for term nodes", () => {
    const terms = [term("year-a", 1, 1)];
    const nodes = roadmapNodes(terms, null);
    expect(nodes[0].key).toBe("year-a-1");
  });
});

describe("continueHref", () => {
  it("builds the module reader URL when a recommendation is present", () => {
    const rec: Recommendation = {
      moduleId: "mod-1",
      moduleTitle: "Module 1",
      subjectId: "subj-1",
      subjectTitle: "Subject 1",
      yearId: "year-1",
      status: "in-progress",
    };
    expect(continueHref(rec)).toBe("/year/year-1/subjects/subj-1/modules/mod-1");
  });

  it("falls back to /year when there is no recommendation", () => {
    expect(continueHref(undefined)).toBe("/year");
  });
});
