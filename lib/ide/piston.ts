import type { LanguageId, RunResult } from "./types";
import { getLanguage } from "./languages";

export interface PistonPayload {
  language: string;
  version: string;
  files: { name: string; content: string }[];
  stdin: string;
  run_timeout: number;
  compile_timeout: number;
}

interface PistonStage {
  stdout: string;
  stderr: string;
  code: number | null;
}

export interface PistonResponse {
  compile?: PistonStage | null;
  run?: PistonStage | null;
}

export function buildPistonPayload(
  languageId: LanguageId,
  code: string,
  stdin: string,
): PistonPayload {
  const lang = getLanguage(languageId);
  if (lang.runtime !== "server" || !lang.piston) {
    throw new Error(`${languageId} does not run on the server`);
  }
  return {
    language: lang.piston.language,
    version: lang.piston.version,
    files: [{ name: lang.piston.filename, content: code }],
    stdin,
    run_timeout: 5000,
    compile_timeout: 10000,
  };
}

export function mapPistonResponse(res: PistonResponse, durationMs: number): RunResult {
  const compile = res.compile;
  const run = res.run;
  const compileFailed = compile && compile.code !== 0;

  const stdout = run?.stdout ?? "";
  const stderr =
    (compileFailed ? compile!.stderr : "") + (run?.stderr ?? "");
  const exitCode = compileFailed ? compile!.code : run?.code ?? null;

  return {
    stdout,
    stderr,
    exitCode,
    timedOut: false,
    durationMs,
  };
}
