import type { Runner, RunRequest, RunResult } from "@/lib/ide/types";
import { getDeviceId } from "@/lib/device";

export const serverRunner: Runner = {
  async run(req: RunRequest, signal?: AbortSignal): Promise<RunResult> {
    // Ensure the signed device cookie is synced before hitting /api/run —
    // the endpoint requires it (denies anonymous/scripted abuse of the free
    // shared Judge0 instance it proxies to). Calling getDeviceId() here
    // covers callers (like the standalone playground harness) that never
    // triggered the sync via SubscribeGate/ModuleDoneToggle elsewhere.
    getDeviceId();

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
