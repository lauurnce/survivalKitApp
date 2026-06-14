import type { Runner } from "@/lib/ide/types";
export const sqlRunner: Runner = {
  async run() {
    return { stdout: "", stderr: "sql runner not implemented", exitCode: null, timedOut: false, durationMs: 0 };
  },
};
