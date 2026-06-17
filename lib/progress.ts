"use client";

import { getDeviceId } from "./device";

// Fetch the set of completed module_ids for the current device.
// Optionally restrict to a specific set of module_ids (for per-subject bars).
export async function fetchCompletedModules(moduleIds?: string[]): Promise<Set<string>> {
  const device_id = getDeviceId();
  if (!device_id) return new Set();

  try {
    const params = new URLSearchParams({ device_id });
    if (moduleIds && moduleIds.length > 0) {
      params.set("module_ids", moduleIds.join(","));
    }
    const res = await fetch(`/api/progress?${params.toString()}`);
    if (!res.ok) return new Set();
    const json = (await res.json()) as { completed?: string[] };
    return new Set(json.completed ?? []);
  } catch {
    return new Set();
  }
}

// Toggle (or explicitly set) completion for a module. Returns the new state,
// or null if the request could not be made.
export async function setModuleCompleted(
  moduleId: string,
  completed?: boolean
): Promise<boolean | null> {
  const device_id = getDeviceId();
  if (!device_id) return null;

  try {
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device_id, module_id: moduleId, completed }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { completed?: boolean };
    return typeof json.completed === "boolean" ? json.completed : null;
  } catch {
    return null;
  }
}
