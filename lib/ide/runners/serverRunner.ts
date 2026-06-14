import type { Runner, RunRequest, RunResult } from "@/lib/ide/types";

export const serverRunner: Runner = {
  async run(req: RunRequest, signal?: AbortSignal): Promise<RunResult> {
    const res = await fetch("/api/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
      signal,
    });

    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Execution failed" }));
      throw new Error(error ?? "Execution failed");
    }
    return (await res.json()) as RunResult;
  },
};
