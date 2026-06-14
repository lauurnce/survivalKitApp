import type { Runner } from "@/lib/ide/types";
export const serverRunner: Runner = {
  async run() {
    return { stdout: "", stderr: "server runner not implemented", exitCode: 1, timedOut: false, durationMs: 0 };
  },
};
