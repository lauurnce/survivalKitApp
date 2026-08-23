import { describe, it, expect } from "vitest";
import { splitSqlStatements, extractParenthesized } from "./sqlStatements";

describe("splitSqlStatements", () => {
  it("splits plain statements and strips the trailing semicolon", () => {
    expect(splitSqlStatements("select 1; select 2;")).toEqual(["select 1", "select 2"]);
  });

  it("normalises newlines and runs of whitespace to single spaces", () => {
    const sql = `create policy "p"\n  on widgets\n  for select to anon\n  using (true);`;
    expect(splitSqlStatements(sql)).toEqual([
      `create policy "p" on widgets for select to anon using (true)`,
    ]);
  });

  it("drops a trailing fragment that is only whitespace", () => {
    expect(splitSqlStatements("select 1;\n\n")).toEqual(["select 1"]);
  });

  it("keeps a final statement that has no trailing semicolon", () => {
    expect(splitSqlStatements("select 1")).toEqual(["select 1"]);
  });

  it("removes line comments without eating the statement", () => {
    const sql = "-- a comment\nselect 1; -- trailing\nselect 2;";
    expect(splitSqlStatements(sql)).toEqual(["select 1", "select 2"]);
  });

  it("removes block comments", () => {
    expect(splitSqlStatements("select /* inline */ 1;")).toEqual(["select 1"]);
  });

  it("does not split on a semicolon inside a single-quoted string", () => {
    const sql = "insert into widgets (note) values ('a;b');";
    expect(splitSqlStatements(sql)).toEqual(["insert into widgets (note) values ('a;b')"]);
  });

  it("survives the doubled-quote escape inside a string", () => {
    const sql = "insert into widgets (note) values ('it''s; fine');";
    expect(splitSqlStatements(sql)).toEqual([
      "insert into widgets (note) values ('it''s; fine')",
    ]);
  });

  it("does not treat a double dash inside a string as a comment", () => {
    const sql = "insert into widgets (note) values ('a -- b');";
    expect(splitSqlStatements(sql)).toEqual(["insert into widgets (note) values ('a -- b')"]);
  });

  it("keeps a dollar-quoted function body as ONE statement", () => {
    const sql = `
      create function f() returns void language plpgsql as $$
      begin
        insert into widgets values (1);
        update widgets set n = 2;
      end;
      $$;
      alter table widgets enable row level security;
    `;
    const statements = splitSqlStatements(sql);
    expect(statements).toHaveLength(2);
    expect(statements[0]).toContain("insert into widgets values (1)");
    expect(statements[0]).toContain("update widgets set n = 2");
    expect(statements[1]).toBe("alter table widgets enable row level security");
  });

  it("handles a tagged dollar quote", () => {
    const sql = `create function f() as $body$ select 1; select 2; $body$; select 3;`;
    const statements = splitSqlStatements(sql);
    expect(statements).toHaveLength(2);
    expect(statements[1]).toBe("select 3");
  });

  it("keeps comments that live inside a dollar-quoted body", () => {
    const sql = `create function f() as $$ -- kept\n select 1; $$;`;
    expect(splitSqlStatements(sql)[0]).toContain("-- kept");
  });

  it("returns an empty array for input that is only comments", () => {
    expect(splitSqlStatements("-- nothing here\n/* nor here */\n")).toEqual([]);
  });
});

describe("extractParenthesized", () => {
  it("returns the contents of a simple group", () => {
    expect(extractParenthesized("using (device_id = 'x')", 6)).toBe("device_id = 'x'");
  });

  it("balances nested parentheses", () => {
    expect(extractParenthesized("using (char_length(name) <= (10 + 2))", 6)).toBe(
      "char_length(name) <= (10 + 2)"
    );
  });

  it("ignores parentheses inside a quoted string", () => {
    expect(extractParenthesized("using (note = ')')", 6)).toBe("note = ')'");
  });

  it("returns null when the group never closes", () => {
    expect(extractParenthesized("using (unclosed", 6)).toBeNull();
  });

  it("returns null when openIndex is not an open paren", () => {
    expect(extractParenthesized("using (x)", 0)).toBeNull();
  });
});
