export async function register() {
  // Node 22+ ships an experimental globalThis.localStorage. Without a
  // --localstorage-file path, MERELY ACCESSING the getter throws, and even
  // when it returns an object the Storage methods (getItem, setItem, …) are
  // not callable. @supabase/auth-js/locks.js calls localStorage.getItem at
  // MODULE EVALUATION TIME (not inside a function), so the crash happens
  // before any application code (or our try-catch in device.ts) runs.
  //
  // This register() hook runs once at startup AND during `next build`'s page
  // data collection — which is exactly where Vercel's build was crashing.
  // We force a plain in-memory no-op Storage so Supabase's module-level code
  // always sees a working interface, regardless of Node version or flags.
  if (typeof globalThis === "undefined") return;

  let needsStub = true;
  try {
    const ls = (globalThis as Record<string, unknown>).localStorage;
    // Reading .getItem can itself throw on the experimental stub.
    if (ls && typeof (ls as Record<string, unknown>).getItem === "function") {
      needsStub = false;
    }
  } catch {
    // Accessing globalThis.localStorage threw — definitely needs a stub.
    needsStub = true;
  }

  if (needsStub) {
    const _data: Record<string, string> = {};
    try {
      (globalThis as Record<string, unknown>).localStorage = {
        getItem: (k: string) => _data[k] ?? null,
        setItem: (k: string, v: string) => { _data[k] = v; },
        removeItem: (k: string) => { delete _data[k]; },
        clear: () => { Object.keys(_data).forEach((k) => delete _data[k]); },
        key: (_i: number) => null,
        get length() { return Object.keys(_data).length; },
      };
    } catch {
      // Some runtimes mark localStorage as a non-writable accessor. Fall back
      // to redefining the property descriptor directly.
      Object.defineProperty(globalThis, "localStorage", {
        configurable: true,
        value: {
          getItem: (k: string) => _data[k] ?? null,
          setItem: (k: string, v: string) => { _data[k] = v; },
          removeItem: (k: string) => { delete _data[k]; },
          clear: () => { Object.keys(_data).forEach((k) => delete _data[k]); },
          key: (_i: number) => null,
          get length() { return Object.keys(_data).length; },
        },
      });
    }
  }
}
