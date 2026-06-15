import { NextRequest, NextResponse } from "next/server";
import { runInSandbox } from "@/lib/ide/sandboxRunner";
import { truncateOutput } from "@/lib/ide/format";
import type { LanguageId } from "@/lib/ide/types";

export const runtime = "nodejs";

const MAX_CODE_BYTES = 50_000;
const SERVER_LANGS: LanguageId[] = ["java", "c"];

export async function POST(req: NextRequest) {
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
