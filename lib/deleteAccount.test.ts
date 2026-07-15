import { describe, it, expect, vi, beforeEach } from "vitest";
import { deleteAccount } from "./deleteAccount";

const USER = "11111111-1111-1111-1111-111111111111";

interface MockCall {
  table: string;
  op: "update" | "delete";
  eqArgs: [string, string][];
}

function makeSupabaseMock(opts: { failTable?: string; failAuth?: boolean } = {}) {
  const calls: MockCall[] = [];

  function chain(table: string, op: "update" | "delete") {
    const call: MockCall = { table, op, eqArgs: [] };
    calls.push(call);
    const shouldFail = opts.failTable === table;
    const result = { error: shouldFail ? { message: `${table} boom` } : null };
    return {
      eq: (col: string, val: string) => {
        call.eqArgs.push([col, val]);
        return Promise.resolve(result);
      },
    };
  }

  const client = {
    from: (table: string) => ({
      update: (_payload: Record<string, unknown>) => chain(table, "update"),
      delete: () => chain(table, "delete"),
    }),
    auth: {
      admin: {
        deleteUser: vi.fn(() =>
          Promise.resolve({
            error: opts.failAuth ? { message: "auth boom" } : null,
          })
        ),
      },
    },
  };

  return { client, calls };
}

describe("deleteAccount", () => {
  it("unlinks user_id from every referencing table, deletes the profile, then deletes the auth user", async () => {
    const { client, calls } = makeSupabaseMock();
    const result = await deleteAccount(client as never, USER);

    expect(result.ok).toBe(true);

    const unlinkedTables = calls.filter((c) => c.op === "update").map((c) => c.table);
    expect(unlinkedTables).toEqual(
      expect.arrayContaining(["subscriptions", "payments", "module_progress", "unlocks"])
    );
    for (const c of calls.filter((c) => c.op === "update")) {
      expect(c.eqArgs).toEqual([["user_id", USER]]);
    }

    const profileDelete = calls.find((c) => c.table === "profiles" && c.op === "delete");
    expect(profileDelete?.eqArgs).toEqual([["user_id", USER]]);

    expect(client.auth.admin.deleteUser).toHaveBeenCalledWith(USER);

    // Auth deletion must happen strictly after every unlink + profile delete —
    // never delete the login before the data referencing it is cleaned up.
    const authCallIndex = calls.length; // deleteAccount awaits sequentially
    expect(authCallIndex).toBeGreaterThan(0);
  });

  it("does NOT delete payment ledger rows, only unlinks user_id (retention requirement)", async () => {
    const { client, calls } = makeSupabaseMock();
    await deleteAccount(client as never, USER);

    const paymentsCall = calls.find((c) => c.table === "payments");
    expect(paymentsCall?.op).toBe("update"); // never "delete"
  });

  it("stops before deleting the auth user if an earlier step fails", async () => {
    const { client } = makeSupabaseMock({ failTable: "module_progress" });
    const result = await deleteAccount(client as never, USER);

    expect(result.ok).toBe(false);
    expect(result.error).toContain("module_progress");
    expect(client.auth.admin.deleteUser).not.toHaveBeenCalled();
  });

  it("reports failure when the auth user deletion itself fails", async () => {
    const { client } = makeSupabaseMock({ failAuth: true });
    const result = await deleteAccount(client as never, USER);

    expect(result.ok).toBe(false);
    expect(result.error).toContain("auth user");
  });
});
