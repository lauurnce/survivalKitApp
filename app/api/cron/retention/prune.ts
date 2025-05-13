import type { createServerClient } from "@/lib/supabase/server";

// Enforces the privacy policy's promise that reading activity is "retained
// for up to 12 months, then deleted or anonymized": the events table, and
// the device ids in counter_log (pruned by last read, so a module a device
// still reads keeps its dedup row and isn't counted twice).
export const RETENTION_MONTHS = 12;

// Rows removed per DELETE. Each batch is bounded by a timestamp (the Nth
// oldest expired row), not by an id list, so the request URL stays short
// and Postgres deletes by index range on events.created_at.
export const RETENTION_BATCH_SIZE = 1000;

// A daily run that falls behind (first run on a year of backlog) picks up
// the rest the next day rather than running past the function timeout.
export const MAX_BATCHES_PER_TABLE = 50;

export const RETENTION_TABLES = [
  { table: "events", column: "created_at" },
  { table: "counter_log", column: "last_read_at" },
] as const;

export function retentionCutoff(now: Date): Date {
  const cutoff = new Date(now);
  cutoff.setUTCMonth(cutoff.getUTCMonth() - RETENTION_MONTHS);
  return cutoff;
}

type Supabase = ReturnType<typeof createServerClient>;

/** Deletes rows older than `cutoff` in batches. Returns the number removed. */
export async function pruneTable(
  supabase: Supabase,
  table: string,
  column: string,
  cutoff: Date,
): Promise<number> {
  const cutoffIso = cutoff.toISOString();
  let removed = 0;

  for (let batch = 0; batch < MAX_BATCHES_PER_TABLE; batch++) {
    // The Nth-oldest expired row marks the end of this batch. Fewer than N
    // left means this is the final batch, bounded by the cutoff itself.
    const { data, error } = await supabase
      .from(table)
      .select(column)
      .lt(column, cutoffIso)
      .order(column, { ascending: true })
      .range(RETENTION_BATCH_SIZE - 1, RETENTION_BATCH_SIZE - 1);
    if (error) throw new Error(`${table}: ${error.message}`);

    const boundary = (data?.[0] as unknown as Record<string, string> | undefined)?.[column];
    const del = supabase.from(table).delete({ count: "exact" });
    const { count, error: delError } = boundary
      ? await del.lte(column, boundary)
      : await del.lt(column, cutoffIso);
    if (delError) throw new Error(`${table}: ${delError.message}`);

    removed += count ?? 0;
    if (!boundary) break;
  }
  return removed;
}
