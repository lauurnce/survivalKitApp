import { NextRequest, NextResponse } from "next/server";
import { truncateOutput } from "@/lib/ide/format";
import type { LanguageId } from "@/lib/ide/types";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_CODE_BYTES = 50_000;
const MAX_STDIN_BYTES = 10_000;
const SERVER_LANGS: LanguageId[] = ["java", "c"];

// Wandbox compilers — no API key, compilers pre-installed, fast
const WANDBOX_COMPILER: Partial<Record<LanguageId, string>> = {
  c:    "gcc-head",
  java: "openjdk-jdk-21+35",
};

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

// Wandbox requires the public class to be named "prog" (file is prog.java)
function prepareJavaCode(code: string): string {
  return code.replace(/public\s+class\s+\w+/g, "class prog");
}

export async function POST(req: NextRequest) {
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

  const compiler = WANDBOX_COMPILER[languageId];
  if (!compiler) {
    return NextResponse.json({ error: "Unsupported language" }, { status: 400 });
  }

  const sourceCode = languageId === "java" ? prepareJavaCode(code) : code;

  try {
    const start = Date.now();
    const res = await fetch("https://wandbox.org/api/compile.json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ compiler, code: sourceCode, stdin, options: "" }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `Execution service error (${res.status}): ${text.slice(0, 200)}` },
        { status: 502 }
      );
    }

    const raw = await res.json() as {
      status: string;
      compiler_error?: string;
      compiler_output?: string;
      program_output?: string;
      program_error?: string;
    };

    const compileFailed = raw.compiler_error && raw.status !== "0";
    const stdout = truncateOutput(raw.program_output ?? "").text;
    const stderr = truncateOutput(
      compileFailed ? (raw.compiler_error ?? "") : (raw.program_error ?? "")
    ).text;

    return NextResponse.json({
      stdout,
      stderr,
      exitCode: parseInt(raw.status ?? "0", 10),
      timedOut: false,
      durationMs: Date.now() - start,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Execution failed" },
      { status: 502 }
    );
  }
}
