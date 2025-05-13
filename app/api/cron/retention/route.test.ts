import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// In-memory stand-in for the two tables the job prunes. Each query records
// its filters, so the tests can assert the job never touches recent rows.
type Row = Record<string, string>;
let tables: Record<string, Row[]> = {};
const deletes: Array<{ table: string; op: "lt" | "lte"; col: string; value: string }> = [];
let failTable: string | null = null;

function query(table: string) {
  let col = "";
  let op: "lt" | "lte" = "lt";
  let value = "";
  let ascending = true;
  let isDelete = false;
  const matches = () =>
    tables[table].filter((r) => (op === "lt" ? r[col] < value : r[col] <= value));
  const q = {
    select: () => q,
    delete: () => {
      isDelete = true;
      return q;
    },
    lt: (c: string, v: string) => {
      col = c;
      value = v;
      op = "lt";
      return isDelete ? run() : q;
    },
    lte: (c: string, v: string) => {
      col = c;
      value = v;
      op = "lte";
      return run();
    },
    order: (_c: string, opts: { ascending: boolean }) => {
      ascending = opts.ascending;
      return q;
    },
    range: (from: number, to: number) => {
      if (failTable === table) return Promise.resolve({ data: null, error: { message: "boom" } });
      const sorted = [...matches()].sort((a, b) =>
        ascending ? a[col].localeCompare(b[col]) : b[col].localeCompare(a[col])
      );
      return Promise.resolve({ data: sorted.slice(from, to + 1), error: null });
    },
  };
  function run() {
    if (failTable === table) return Promise.resolve({ count: null, error: { message: "boom" } });
    const doomed = matches();
    deletes.push({ table, op, col, value });
    tables[table] = tables[table].filter((r) => !doomed.includes(r));
    return Promise.resolve({ count: doomed.length, error: null });
  }
  return q;
}

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => ({ from: (t: string) => query(t) }),
}));

import { GET } from "./route";
import { RETENTION_BATCH_SIZE, retentionCutoff } from "./prune";

const NOW = new Date("2026-10-31T01:00:00.000Z");

function authed() {
  return new Request("http://x/api/cron/retention", {
    headers: { authorization: "Bearer s3cret" },
  });
}

function iso(d: string) {
  return new Date(d).toISOString();
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(NOW);
  vi.stubEnv("CRON_SECRET", "s3cret");
  tables = { events: [], counter_log: [] };
  deletes.length = 0;
  failTable = null;
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe("GET /api/cron/retention — authorization", () => {
  it("rejects a caller with no authorization header", async () => {
    const res = await GET(new Request("http://x/api/cron/retention"));
    expect(res.status).toBe(401);
  });

  it("rejects a wrong secret", async () => {
    const res = await GET(
      new Request("http://x/api/cron/retention", { headers: { authorization: "Bearer nope" } })
    );
    expect(res.status).toBe(401);
  });

  it("rejects every caller when CRON_SECRET is unset", async () => {
    vi.stubEnv("CRON_SECRET", "");
    const res = await GET(
      new Request("http://x/api/cron/retention", { headers: { authorization: "Bearer undefined" } })
    );
    expect(res.status).toBe(401);
  });

  it("deletes nothing when unauthorized", async () => {
    tables.events = [{ id: "a", created_at: iso("2024-01-01") }];
    await GET(new Request("http://x/api/cron/retention"));
    expect(deletes).toHaveLength(0);
    expect(tables.events).toHaveLength(1);
  });
});

describe("retentionCutoff", () => {
  it("is 12 calendar months before now", () => {
    expect(retentionCutoff(NOW).toISOString()).toBe("2025-10-31T01:00:00.000Z");
  });
});

describe("GET /api/cron/retention — pruning", () => {
  it("deletes events older than 12 months and keeps newer ones", async () => {
    tables.events = [
      { id: "old1", created_at: iso("2024-03-01") },
      { id: "old2", created_at: iso("2025-10-30T23:59:59Z") },
      { id: "edge", created_at: iso("2025-10-31T01:00:00Z") },
      { id: "new", created_at: iso("2026-10-01") },
    ];
    const res = await GET(authed());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.events).toBe(2);
    expect(tables.events.map((r) => r.id).sort()).toEqual(["edge", "new"]);
  });

  it("deletes counter_log rows whose last read is older than 12 months", async () => {
    tables.counter_log = [
      { device_id: "d1", last_read_at: iso("2024-12-01") },
      { device_id: "d2", last_read_at: iso("2026-01-01") },
    ];
    const body = await (await GET(authed())).json();
    expect(body.counter_log).toBe(1);
    expect(tables.counter_log.map((r) => r.device_id)).toEqual(["d2"]);
  });

  it("works through a backlog in bounded batches", async () => {
    const total = RETENTION_BATCH_SIZE * 2 + 7;
    tables.events = Array.from({ length: total }, (_, i) => ({
      id: `e${i}`,
      created_at: new Date(Date.UTC(2024, 0, 1) + i * 1000).toISOString(),
    }));
    tables.events.push({ id: "keep", created_at: iso("2026-06-01") });

    const body = await (await GET(authed())).json();
    expect(body.events).toBe(total);
    expect(tables.events.map((r) => r.id)).toEqual(["keep"]);

    const eventDeletes = deletes.filter((d) => d.table === "events");
    expect(eventDeletes).toHaveLength(3);
    // Every delete is bounded by the cutoff, never wider.
    const cutoff = retentionCutoff(NOW).toISOString();
    for (const d of eventDeletes) expect(d.value <= cutoff).toBe(true);
  });

  it("reports a failure as 500 without claiming success", async () => {
    tables.events = [{ id: "old", created_at: iso("2024-01-01") }];
    failTable = "events";
    const res = await GET(authed());
    expect(res.status).toBe(500);
    expect((await res.json()).ok).toBe(false);
  });
});
