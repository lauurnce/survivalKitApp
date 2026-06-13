export async function register() {
  // Node.js 22+ ships globalThis.localStorage as an object, but without a
  // --localstorage-file path the Storage methods (getItem, setItem, …) are
  // not callable. @supabase/auth-js/locks.js calls localStorage.getItem at
  // MODULE EVALUATION TIME (not inside a function), so even our try-catch in
  // device.ts can't save us — the crash happens before any application code runs.
  //
  // This register() hook runs once at server startup, before any route module
  // is imported. We replace the broken stub with a plain in-memory no-op so
  // Supabase's module-level code sees a working Storage interface.
  if (typeof globalThis !== "undefined") {
    const ls = (globalThis as Record<string, unknown>).localStorage;
    if (ls !== undefined && typeof (ls as Record<string, unknown>)?.getItem !== "function") {
      const _data: Record<string, string> = {};
      (globalThis as Record<string, unknown>).localStorage = {
        getItem: (k: string) => _data[k] ?? null,
        setItem: (k: string, v: string) => { _data[k] = v; },
        removeItem: (k: string) => { delete _data[k]; },
        clear: () => { Object.keys(_data).forEach((k) => delete _data[k]); },
        key: (_i: number) => null,
        get length() { return Object.keys(_data).length; },
      };
    }
  }
}
