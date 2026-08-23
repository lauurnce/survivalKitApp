import { describe, it, expect } from "vitest";
import { buildSchema, type MigrationFile } from "./migrationSchema";

const file = (name: string, sql: string): MigrationFile => ({ name, sql });
const table = (schema: ReturnType<typeof buildSchema>, name: string) =>
  schema.find((t) => t.name === name);

describe("buildSchema", () => {
  it("records a created table and its columns", () => {
    const schema = buildSchema([
      file(
        "001_init.sql",
        `create table if not exists widgets (
           id uuid primary key,
           device_id text not null,
           label text
         );`
      ),
    ]);
    expect(table(schema, "widgets")?.createdIn).toBe("001_init.sql");
    expect(table(schema, "widgets")?.columns).toEqual(["id", "device_id", "label"]);
  });

  it("strips a public. prefix from the table name", () => {
    const schema = buildSchema([file("a.sql", "create table public.widgets (id uuid);")]);
    expect(table(schema, "widgets")).toBeDefined();
  });

  it("adds columns from a later alter table", () => {
    const schema = buildSchema([
      file("a.sql", "create table widgets (id uuid);"),
      file("b.sql", "alter table widgets add column if not exists user_id uuid;"),
    ]);
    expect(table(schema, "widgets")?.columns).toEqual(["id", "user_id"]);
  });

  it("records RLS enablement regardless of case", () => {
    const schema = buildSchema([
      file("a.sql", "create table widgets (id uuid);"),
      file("b.sql", "ALTER TABLE widgets ENABLE ROW LEVEL SECURITY;"),
    ]);
    expect(table(schema, "widgets")?.rlsEnabledIn).toBe("b.sql");
  });

  it("leaves rlsEnabledIn null when RLS is never enabled", () => {
    const schema = buildSchema([file("a.sql", "create table widgets (id uuid);")]);
    expect(table(schema, "widgets")?.rlsEnabledIn).toBeNull();
  });

  it("parses a policy's name, command, roles and using predicate", () => {
    const schema = buildSchema([
      file("a.sql", "create table widgets (id uuid);"),
      file(
        "b.sql",
        `create policy "widgets_read" on widgets
           for select to anon
           using (device_id = current_setting('app.device_id', true));`
      ),
    ]);
    const [policy] = table(schema, "widgets")!.policies;
    expect(policy.name).toBe("widgets_read");
    expect(policy.command).toBe("SELECT");
    expect(policy.roles).toEqual(["anon"]);
    expect(policy.using).toBe("device_id = current_setting('app.device_id', true)");
    expect(policy.withCheck).toBeNull();
    expect(policy.migration).toBe("b.sql");
  });

  it("parses an unquoted policy name and a with check clause", () => {
    const schema = buildSchema([
      file("a.sql", "create table widgets (id uuid);"),
      file("b.sql", "create policy widgets_insert on widgets for insert to anon with check (true);"),
    ]);
    const [policy] = table(schema, "widgets")!.policies;
    expect(policy.name).toBe("widgets_insert");
    expect(policy.command).toBe("INSERT");
    expect(policy.withCheck).toBe("true");
    expect(policy.using).toBeNull();
  });

  it("defaults the command to ALL and the role to public when unstated", () => {
    const schema = buildSchema([
      file("a.sql", "create table widgets (id uuid);"),
      file("b.sql", "create policy widgets_all on widgets using (true);"),
    ]);
    const [policy] = table(schema, "widgets")!.policies;
    expect(policy.command).toBe("ALL");
    expect(policy.roles).toEqual(["public"]);
  });

  it("parses several roles", () => {
    const schema = buildSchema([
      file("a.sql", "create table widgets (id uuid);"),
      file("b.sql", "create policy p on widgets for select to anon, authenticated using (true);"),
    ]);
    expect(table(schema, "widgets")![0 as never]).toBeUndefined();
    expect(table(schema, "widgets")!.policies[0].roles).toEqual(["anon", "authenticated"]);
  });

  it("tolerates an as permissive clause", () => {
    const schema = buildSchema([
      file("a.sql", "create table widgets (id uuid);"),
      file("b.sql", "create policy p on widgets as permissive for select to anon using (true);"),
    ]);
    expect(table(schema, "widgets")!.policies[0].command).toBe("SELECT");
  });

  it("removes a policy dropped by a later migration", () => {
    const schema = buildSchema([
      file("a.sql", "create table widgets (id uuid);"),
      file("b.sql", `create policy "leaky" on widgets for select to anon using (true);`),
      file("c.sql", `drop policy if exists "leaky" on widgets;`),
    ]);
    expect(table(schema, "widgets")!.policies).toEqual([]);
  });

  it("keeps the recreated policy when a file drops then creates the same name", () => {
    const schema = buildSchema([
      file("a.sql", "create table widgets (id uuid);"),
      file("b.sql", `create policy "p" on widgets for select to anon using (true);`),
      file(
        "c.sql",
        `drop policy if exists "p" on widgets;
         create policy "p" on widgets for select to anon using (owner = 'me');`
      ),
    ]);
    const policies = table(schema, "widgets")!.policies;
    expect(policies).toHaveLength(1);
    expect(policies[0].using).toBe("owner = 'me'");
    expect(policies[0].migration).toBe("c.sql");
  });

  it("does not drop a same-named policy belonging to another table", () => {
    const schema = buildSchema([
      file("a.sql", "create table widgets (id uuid); create table orders (id uuid);"),
      file("b.sql", `create policy "p" on widgets for select to anon using (true);`),
      file("c.sql", `create policy "p" on orders for select to anon using (true);`),
      file("d.sql", `drop policy if exists "p" on orders;`),
    ]);
    expect(table(schema, "widgets")!.policies).toHaveLength(1);
    expect(table(schema, "orders")!.policies).toHaveLength(0);
  });

  it("records a table it only ever sees in a policy or alter statement", () => {
    const schema = buildSchema([
      file("a.sql", "alter table legacy enable row level security;"),
    ]);
    expect(table(schema, "legacy")?.createdIn).toBeNull();
    expect(table(schema, "legacy")?.rlsEnabledIn).toBe("a.sql");
  });

  it("is not confused by semicolons inside a function body", () => {
    const schema = buildSchema([
      file(
        "a.sql",
        `create table widgets (id uuid);
         create function f() returns void language plpgsql as $$
         begin
           create policy "ghost" on widgets for select to anon using (true);
         end;
         $$;
         alter table widgets enable row level security;`
      ),
    ]);
    // The policy inside the function body is source text, not a live policy.
    expect(table(schema, "widgets")!.policies).toEqual([]);
    expect(table(schema, "widgets")!.rlsEnabledIn).toBe("a.sql");
  });

  it("returns tables sorted by name so the output is stable across runs", () => {
    const schema = buildSchema([
      file("a.sql", "create table zebra (id uuid); create table apple (id uuid);"),
    ]);
    expect(schema.map((t) => t.name)).toEqual(["apple", "zebra"]);
  });
});
