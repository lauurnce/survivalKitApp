// Shared by the client (lib/device.ts) and the server (app/api/device).
//
// The signed device cookie is HttpOnly, so the browser can't tell whether it
// already holds one. /api/device sets this readable marker beside it, with
// the same lifetime, holding the same UUID. The UUID already lives in
// localStorage, so the marker exposes nothing new to page scripts. It is
// never trusted server-side: only the signed cookie is.
export const DEVICE_SYNCED_COOKIE = "bsit_device_ok";
