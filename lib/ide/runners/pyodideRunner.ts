import type { Runner } from "@/lib/ide/types";
export const pyodideRunner: Runner = {
  async run() {
    return { stdout: "", stderr: "python runner not implemented", exitCode: 1, timedOut: false, durationMs: 0 };
  },
};
