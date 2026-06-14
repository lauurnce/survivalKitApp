import { NextRequest, NextResponse } from "next/server";
import { buildPistonPayload, mapPistonResponse } from "@/lib/ide/piston";
import { truncateOutput } from "@/lib/ide/format";
import type { LanguageId } from "@/lib/ide/types";

export const runtime = "nodejs";

const MAX_CODE_BYTES = 50_000;
const SERVER_LANGS: LanguageId[] = ["java", "c"];

export async function POST(req: NextRequest) {
  const pistonUrl = process.env.PISTON_URL;
  if (!pistonUrl) {
    return NextResponse.json({ error: "Execution engine not configured" }, { status: 503 });
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
    return NextResponse.json({ error: "Code too large" }, { status: 413 });
  }

  const payload = buildPistonPayload(languageId, code, stdin);
  const start = Date.now();

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20_000);
    const pistonRes = await fetch(`${pistonUrl}/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!pistonRes.ok) {
      const detail = await pistonRes.text();
      return NextResponse.json({ error: `Engine error: ${detail}` }, { status: 502 });
    }

    const data = await pistonRes.json();
    const result = mapPistonResponse(data, Date.now() - start);
    result.stdout = truncateOutput(result.stdout).text;
    result.stderr = truncateOutput(result.stderr).text;
    return NextResponse.json(result);
  } catch (e) {
    const aborted = e instanceof Error && e.name === "AbortError";
    return NextResponse.json(
      { error: aborted ? "Execution timed out" : "Execution failed" },
      { status: aborted ? 504 : 502 },
    );
  }
}
