"use client";

export function getDeviceId(): string {
  try {
    if (typeof window === "undefined") return "";
    if (typeof localStorage === "undefined") return "";
    let id = localStorage.getItem("bsit_device_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("bsit_device_id", id);
    }
    return id;
  } catch {
    return "";
  }
}
