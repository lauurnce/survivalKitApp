import { NextRequest, NextResponse } from "next/server";
import { runInSandbox } from "@/lib/ide/sandboxRunner";
import { truncateOutput } from "@/lib/ide/format";
import type { LanguageId } from "@/lib/ide/types";

export const runtime = "nodejs";

// Give the function enough time to outlive the sandbox (60s timeout inside)
export const maxDuration = 90;

const MAX_CODE_BYTES = 50_000;
const MAX_STDIN_BYTES = 10_000;
const SERVER_LANGS: LanguageId[] = ["java", "c"];

// IP-based rate limiter — 10 executions per minute per IP
const runRateMap = new Map<string, number[]>();
const RUN_WINDOW_MS = 60_000;
const RUN_MAX_PER_WINDOW = 10;
const MAX_MAP_SIZE = 5_000;

function getIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0].trim() : "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();

  if (runRateMap.size >= MAX_MAP_SIZE) {
    for (const [k, ts] of runRateMap) {
      if (ts.every((t) => now - t >= RUN_WINDOW_MS)) runRateMap.delete(k);
      if (runRateMap.size < MAX_MAP_SIZE * 0.8) break;
    }
  }

  const ts = (runRateMap.get(ip) ?? []).filter((t) => now - t < RUN_WINDOW_MS);
  if (ts.length >= RUN_MAX_PER_WINDOW) return true;
  ts.push(now);
  runRateMap.set(ip, ts);
  return false;
}

export async function POST(req: NextRequest) {
  // Rate limit before parsing the body
  const ip = getIp(req);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded — try again in a minute" },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  let body: { languageId?: LanguageId; code?: string; stdin?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { languageId, code = "", stdin = "" } = body;

  if (!languageId || !SERVER_LANGS.includes(languageId)) {
    return NextResponse.json({ error: "Unsupported language" }, { status: 400 });
  }
  if (new TextEncoder().encode(code).length > MAX_CODE_BYTES) {
    return NextResponse.json({ error: "Code too large (max 50 KB)" }, { status: 413 });
  }
  if (new TextEncoder().encode(stdin).length > MAX_STDIN_BYTES) {
    return NextResponse.json({ error: "stdin too large (max 10 KB)" }, { status: 413 });
  }

  try {
    const result = await runInSandbox(languageId, code, stdin);
    result.stdout = truncateOutput(result.stdout).text;
    result.stderr = truncateOutput(result.stderr).text;
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Execution failed" },
      { status: 502 },
    );
  }
}
