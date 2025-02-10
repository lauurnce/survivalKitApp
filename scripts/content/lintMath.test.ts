import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { fixBody, lintBody } from "./lintMath";

function fixture(name: string): string {
  return readFileSync(path.join(__dirname, "fixtures", name), "utf8");
}

function rules(body: string): string[] {
  return lintBody(body).map((i) => i.rule);
}

describe("lintBody", () => {
  it("passes a clean body with display math, a table and a code block", () => {
    expect(lintBody(fixture("clean.md"))).toEqual([]);
  });

  it("flags the CT-01 fence-on-a-shared-line bug as a KaTeX error plus each stray fence", () => {
    // Shape of the live Accounting Unit VI answer key: remark-math drops the
    // text after an opening `$$` as fence metadata, so the array loses its
    // \begin and KaTeX sees a bare `&`.
    const issues = lintBody(fixture("ct01-fence-shares-line.md"));
    const katex = issues.filter((i) => i.rule === "katex-error");
    expect(katex).toHaveLength(1);
    expect(katex[0].message).toMatch(/KaTeX parse error: Expected 'EOF', got '&'/);
    expect(issues.filter((i) => i.rule === "dollar-fence").map((i) => i.line)).toEqual([7, 10, 14, 17]);
  });

  it("does not flag a complete one-line $$x$$ expression", () => {
    expect(rules("Inline display $$x^2$$ here.")).not.toContain("dollar-fence");
  });

  it("flags the CT-02 collapsed table", () => {
    const issues = lintBody(fixture("ct02-collapsed-table.md"));
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({ rule: "collapsed-table", line: 3 });
  });

  it("flags literal ** and ## that survive rendering", () => {
    const r = rules(fixture("leaked-markup.md"));
    expect(r).toContain("leaked-bold");
    expect(r).toContain("leaked-heading");
  });

  it("reports a KaTeX parse error with its source line", () => {
    const issues = lintBody(fixture("bad-latex.md"));
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({ rule: "katex-error", line: 1 });
  });

  it("fixBody repairs the CT-01 and CT-02 fixtures so they lint clean", () => {
    for (const name of ["ct01-fence-shares-line.md", "ct02-collapsed-table.md"]) {
      expect(lintBody(fixBody(fixture(name)))).toEqual([]);
    }
  });

  it("fixBody leaves a clean body unchanged", () => {
    const clean = fixture("clean.md");
    expect(fixBody(clean)).toBe(clean);
  });

  it("ignores markup inside code spans", () => {
    expect(lintBody("Use `**kwargs` and `## heading` and `|---|`.")).toEqual([]);
  });
});
