import { describe, it, expect, vi } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { deleteAccount } from "./deleteAccount";
import { buildSchema } from "./reports/migrationSchema";
import {
  RETENTION_REGISTER,
  erasureResidue,
  extractDeletionTargets,
  inventoryIdentityTables,
} from "./reports/privacyPosture";

const USER = "11111111-1111-1111-1111-111111111111";
const DEV_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const DEV_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const DEV_COOKIE = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";

type Op = "select" | "update" | "delete";

interface MockCall {
  table: string;
  op: Op;
  payload?: Record<string, unknown>;
  filters: [string, string, unknown][];
}

interface MockOpts {
  failTable?: string;
  failOp?: Op;
  failAuth?: boolean;
  failLookup?: boolean;
  email?: string | null;
  /** device_id rows returned by the discovery selects, per table. */
  linked?: Record<string, string[]>;
}

function makeSupabaseMock(opts: MockOpts = {}) {
  const calls: MockCall[] = [];
  const order: string[] = [];

  function builder(table: string, op: Op, payload?: Record<string, unknown>) {
    const call: MockCall = { table, op, payload, filters: [] };
    calls.push(call);
    order.push(`${op}:${table}`);
    const fail = opts.failTable === table && (!opts.failOp || opts.failOp === op);
    const result = () => ({
      data:
        op === "select"
          ? (opts.linked?.[table] ?? []).map((device_id) => ({ device_id }))
          : null,
      error: fail ? { message: `${table} boom` } : null,
    });
    const b = {
      eq: (col: string, val: unknown) => {
        call.filters.push(["eq", col, val]);
        return b;
      },
      in: (col: string, val: unknown) => {
        call.filters.push(["in", col, val]);
        return b;
      },
      then: (resolve: (v: unknown) => unknown, reject?: (e: unknown) => unknown) =>
        Promise.resolve(result()).then(resolve, reject),
    };
    return b;
  }

  const client = {
    from: (table: string) => ({
      select: () => builder(table, "select"),
      update: (payload: Record<string, unknown>) => builder(table, "update", payload),
      delete: () => builder(table, "delete"),
    }),
    auth: {
      admin: {
        getUserById: vi.fn(() => {
          order.push("auth:lookup");
          return Promise.resolve(
            opts.failLookup
              ? { data: { user: null }, error: { message: "lookup boom" } }
              : {
                  data: { user: { id: USER, email: opts.email === undefined ? "Student@Example.com" : opts.email } },
                  error: null,
                }
          );
        }),
        deleteUser: vi.fn(() => {
          order.push("auth:delete");
          return Promise.resolve({ error: opts.failAuth ? { message: "auth boom" } : null });
        }),
      },
    },
  };

  return { client, calls, order };
}

const writes = (calls: MockCall[], op: Op) => calls.filter((c) => c.op === op);

describe("deleteAccount", () => {
  it("deletes personal content, unlinks entitlement and progress rows, then deletes the auth user", async () => {
    const { client, calls, order } = makeSupabaseMock();
    const result = await deleteAccount(client as never, USER);

    expect(result).toEqual({ ok: true });

    const deleted = writes(calls, "delete").filter((c) => c.filters[0]?.[1] === "user_id");
    expect(deleted.map((c) => c.table).sort()).toEqual(
      ["email_outbox", "email_unsubscribes", "profiles", "subject_quiz_progress", "user_feedback"].sort()
    );
    for (const c of deleted) expect(c.filters).toEqual([["eq", "user_id", USER]]);

    const unlinked = writes(calls, "update").filter((c) => c.payload && "user_id" in c.payload);
    expect(unlinked.map((c) => c.table).sort()).toEqual(
      [
        "module_progress",
        "module_quiz_answers",
        "module_quiz_progress",
        "payments",
        "subscriptions",
        "unlocks",
      ].sort()
    );
    for (const c of unlinked) {
      expect(c.payload).toEqual({ user_id: null });
      expect(c.filters).toEqual([["eq", "user_id", USER]]);
    }

    expect(client.auth.admin.deleteUser).toHaveBeenCalledWith(USER);
    expect(order[order.length - 1]).toBe("auth:delete");
  });

  it("never deletes payment or subscription rows — they are unlinked (retention requirement)", async () => {
    const { client, calls } = makeSupabaseMock({ linked: { payments: [DEV_A] } });
    await deleteAccount(client as never, USER);

    for (const table of ["payments", "subscriptions"]) {
      const ops = calls.filter((c) => c.table === table).map((c) => c.op);
      expect(ops).not.toContain("delete");
      expect(ops).toContain("update");
    }
  });

  it("unlinks module_quiz_* before the auth delete, since their FK has no ON DELETE clause", async () => {
    const { client, order } = makeSupabaseMock();
    await deleteAccount(client as never, USER);
    const authAt = order.indexOf("auth:delete");
    expect(order.indexOf("update:module_quiz_progress")).toBeLessThan(authAt);
    expect(order.indexOf("update:module_quiz_answers")).toBeLessThan(authAt);
  });

  it("discovers devices from linked rows plus the verified cookie, and scrubs device-keyed tables", async () => {
    const { client, calls } = makeSupabaseMock({
      linked: { subscriptions: [DEV_A], module_progress: [DEV_A, DEV_B] },
    });
    let n = 0;
    await deleteAccount(client as never, USER, {
      extraDeviceIds: [DEV_COOKIE, "not-a-uuid"],
      newToken: () => `token-${++n}`,
    });

    const devices = [DEV_COOKIE, DEV_A, DEV_B];
    for (const table of ["waitlist", "class_join_requests"]) {
      const del = calls.find(
        (c) => c.table === table && c.op === "delete" && c.filters[0]?.[1] === "device_id"
      );
      expect(del?.filters).toEqual([["in", "device_id", devices]]);
    }

    // Analytics are re-keyed, never deleted: one fresh token per device, the
    // same token in events and counter_log for that device.
    for (const table of ["events", "counter_log"]) {
      expect(calls.some((c) => c.table === table && c.op === "delete")).toBe(false);
      const rekeys = calls.filter((c) => c.table === table && c.op === "update");
      expect(rekeys.map((c) => c.filters)).toEqual(devices.map((d) => [["eq", "device_id", d]]));
      expect(rekeys.map((c) => c.payload)).toEqual([
        { device_id: "token-1" },
        { device_id: "token-2" },
        { device_id: "token-3" },
      ]);
    }
  });

  it("skips device-scoped work when the user has no known device", async () => {
    const { client, calls } = makeSupabaseMock({ email: null });
    await deleteAccount(client as never, USER);
    for (const table of ["events", "counter_log", "class_join_requests", "waitlist"]) {
      expect(calls.some((c) => c.table === table && c.op !== "select")).toBe(false);
    }
  });

  it("deletes waitlist rows by exact account email, never by pattern", async () => {
    const { client, calls } = makeSupabaseMock({ email: "Student@Example.com" });
    await deleteAccount(client as never, USER);
    const del = calls.find((c) => c.table === "waitlist" && c.filters[0]?.[1] === "email");
    expect(del?.op).toBe("delete");
    expect(del?.filters).toEqual([["in", "email", ["Student@Example.com", "student@example.com"]]]);
  });

  it("stops before deleting the auth user if an earlier step fails", async () => {
    const { client } = makeSupabaseMock({ failTable: "module_progress", failOp: "update" });
    const result = await deleteAccount(client as never, USER);

    expect(result.ok).toBe(false);
    expect(result.error).toContain("module_progress");
    expect(client.auth.admin.deleteUser).not.toHaveBeenCalled();
  });

  it("stops before any write if device discovery fails", async () => {
    const { client, calls } = makeSupabaseMock({ failTable: "payments", failOp: "select" });
    const result = await deleteAccount(client as never, USER);

    expect(result.ok).toBe(false);
    expect(calls.some((c) => c.op !== "select")).toBe(false);
    expect(client.auth.admin.deleteUser).not.toHaveBeenCalled();
  });

  it("stops before any write if the auth lookup fails", async () => {
    const { client, calls } = makeSupabaseMock({ failLookup: true });
    const result = await deleteAccount(client as never, USER);

    expect(result).toEqual({ ok: false, error: "auth lookup: lookup boom" });
    expect(calls.some((c) => c.op !== "select")).toBe(false);
  });

  it("reports failure when the auth user deletion itself fails", async () => {
    const { client } = makeSupabaseMock({ failAuth: true });
    const result = await deleteAccount(client as never, USER);

    expect(result.ok).toBe(false);
    expect(result.error).toContain("auth user");
  });
});

describe("standing assertion: erasure reaches every identity table", () => {
  it("leaves no residue against the real migration schema", () => {
    const repo = join(__dirname, "..");
    const migrationsDir = join(repo, "supabase", "migrations");
    const schema = buildSchema(
      readdirSync(migrationsDir)
        .filter((name) => name.endsWith(".sql"))
        .sort()
        .map((name) => ({ name, sql: readFileSync(join(migrationsDir, name), "utf8") }))
    );
    const known = new Set(schema.map((t) => t.name));
    const targets = extractDeletionTargets(
      readFileSync(join(repo, "lib", "deleteAccount.ts"), "utf8")
    ).filter((name) => known.has(name));

    // A new table with a user_id/device_id/email column fails here until
    // lib/deleteAccount.ts handles it or RETENTION_REGISTER records why not.
    const residue = erasureResidue(inventoryIdentityTables(schema), targets, RETENTION_REGISTER);
    expect(residue.map((r) => r.table)).toEqual([]);
  });
});
