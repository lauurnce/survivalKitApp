import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { timingSafeEqualStrings } from "@/lib/auth/timingSafeEqualStrings";
import { RETENTION_TABLES, pruneTable, retentionCutoff } from "./prune";

export const runtime = "nodejs";

// Daily Vercel cron (vercel.json). Deletes reading activity older than the
// 12 months the privacy policy promises; see ./prune.ts.
export async function GET(req: Request) {
  // Same gate as /api/cron/email. Fail closed: an unset secret rejects
  // everyone rather than matching "Bearer undefined".
  const secret = process.env.CRON_SECRET;
  if (!secret || !timingSafeEqualStrings(req.headers.get("authorization"), `Bearer ${secret}`)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();
  const cutoff = retentionCutoff(new Date());
  const removed: Record<string, number> = {};
  try {
    for (const { table, column } of RETENTION_TABLES) {
      removed[table] = await pruneTable(supabase, table, column, cutoff);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("retention prune failed:", message);
    return NextResponse.json({ ok: false, error: message, ...removed }, { status: 500 });
  }

  return NextResponse.json({ ok: true, cutoff: cutoff.toISOString(), ...removed });
}
