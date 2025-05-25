import { readFileSync } from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Loads public/sw.js into a fake worker scope and drives its fetch handler.

const ORIGIN = "https://tryi2i.com";
const SOURCE = readFileSync(path.join(__dirname, "../../public/sw.js"), "utf8");

class FakeCache {
  store = new Map<string, Response>();
  async match(req: Request | string) {
    const hit = this.store.get(typeof req === "string" ? req : req.url);
    return hit ? hit.clone() : undefined;
  }
  async put(req: Request | string, res: Response) {
    this.store.set(typeof req === "string" ? req : req.url, res);
  }
  async delete(req: Request | string) {
    return this.store.delete(typeof req === "string" ? req : req.url);
  }
  async keys() {
    return [...this.store.keys()].map((url) => new Request(url));
  }
}

interface Worker {
  classify: (req: Request, origin: string) => string | null;
  pageKey: (url: string) => string;
  offlinePage: (lessons: { path: string; title: string }[]) => string;
  titleOf: (html: string) => string;
  trimCache: (cache: FakeCache, limit: number) => Promise<void>;
  listeners: Record<string, (e: unknown) => void>;
  caches: Map<string, FakeCache>;
}

function loadWorker(fetchImpl: (req: Request) => Promise<Response>): Worker {
  const listeners: Record<string, (e: unknown) => void> = {};
  const cacheMap = new Map<string, FakeCache>();
  const caches = {
    open: async (name: string) => {
      if (!cacheMap.has(name)) cacheMap.set(name, new FakeCache());
      return cacheMap.get(name)!;
    },
    keys: async () => [...cacheMap.keys()],
    delete: async (name: string) => cacheMap.delete(name),
  };
  const self = {
    location: { origin: ORIGIN },
    addEventListener: (type: string, fn: (e: unknown) => void) => (listeners[type] = fn),
    skipWaiting: vi.fn(),
    clients: { claim: vi.fn() },
  };
  const exported = new Function(
    "self",
    "caches",
    "fetch",
    `${SOURCE}\nreturn { classify, pageKey, offlinePage, titleOf, trimCache };`,
  )(self, caches, fetchImpl);
  return { ...exported, listeners, caches: cacheMap };
}

function navigate(url: string): Request {
  // jsdom's Request ignores `mode`, so stub it the way a browser sets it.
  const req = new Request(url);
  Object.defineProperty(req, "mode", { value: "navigate" });
  return req;
}

async function message(worker: Worker, data: unknown): Promise<void> {
  let pending: Promise<unknown> = Promise.resolve();
  worker.listeners.message({ data, waitUntil: (p: Promise<unknown>) => (pending = p) });
  await pending;
}

async function dispatch(worker: Worker, request: Request): Promise<Response | undefined> {
  let responded: Promise<Response> | undefined;
  worker.listeners.fetch({ request, respondWith: (p: Promise<Response>) => (responded = p) });
  return responded;
}

const flush = () => new Promise((r) => setTimeout(r, 0));

function htmlResponse(title: string) {
  const res = new Response(`<html><head><title>${title}</title></head></html>`, { status: 200 });
  Object.defineProperty(res, "type", { value: "basic" });
  return res;
}

const LESSON = `${ORIGIN}/year/y/subjects/s/modules/m1`;

describe("classify", () => {
  let w: Worker;
  beforeEach(() => (w = loadWorker(vi.fn())));

  it("handles navigations to public reading pages", () => {
    for (const p of ["/", "/year", "/year/y/subjects", LESSON.replace(ORIGIN, ""), "/search", "/faq", "/resources"]) {
      expect(w.classify(navigate(ORIGIN + p), ORIGIN)).toBe("page");
    }
  });

  it("leaves private and transactional pages alone", () => {
    for (const p of ["/account", "/login", "/signup", "/unlock", "/admin", "/class/X/join", "/quiz/subject/s"]) {
      expect(w.classify(navigate(ORIGIN + p), ORIGIN)).toBeNull();
    }
  });

  it("leaves API calls, RSC fetches, POSTs and other origins alone", () => {
    expect(w.classify(new Request(`${ORIGIN}/api/events`), ORIGIN)).toBeNull();
    expect(w.classify(new Request(`${LESSON}?_rsc=abc`), ORIGIN)).toBeNull();
    expect(w.classify(new Request(`${ORIGIN}/`, { method: "POST" }), ORIGIN)).toBeNull();
    expect(w.classify(navigate("https://cdn.jsdelivr.net/x"), ORIGIN)).toBeNull();
  });

  it("caches hashed static assets", () => {
    expect(w.classify(new Request(`${ORIGIN}/_next/static/chunks/a.js`), ORIGIN)).toBe("static");
  });

  it("keys pages by path so UTM-tagged links share one copy", () => {
    expect(w.pageKey(`${LESSON}?utm_source=gc`)).toBe(LESSON);
  });
});

describe("pages", () => {
  it("serves the network response online and saves a copy", async () => {
    const w = loadWorker(async () => htmlResponse("Arrays · CP1 — BSIT Survival Kit"));
    const res = await dispatch(w, navigate(LESSON));
    expect(await res!.text()).toContain("Arrays");
    await flush();
    await flush();
    expect(w.caches.get("bsit-pages-v1")!.store.has(LESSON)).toBe(true);
  });

  it("serves the saved copy offline", async () => {
    let online = true;
    const w = loadWorker(async () => {
      if (!online) throw new TypeError("offline");
      return htmlResponse("Arrays · CP1 — BSIT Survival Kit");
    });
    await dispatch(w, navigate(LESSON));
    await flush();
    await flush();
    online = false;
    const res = await dispatch(w, navigate(`${LESSON}?utm_source=gc`));
    expect(await res!.text()).toContain("<title>Arrays · CP1 — BSIT Survival Kit</title>");
  });

  it("offline with no copy, lists the saved lessons", async () => {
    let online = true;
    const w = loadWorker(async () => {
      if (!online) throw new TypeError("offline");
      return htmlResponse("Arrays · CP1 — BSIT Survival Kit");
    });
    await dispatch(w, navigate(LESSON));
    await flush();
    await flush();
    online = false;
    const res = await dispatch(w, navigate(`${ORIGIN}/year/y/subjects/s/modules/other`));
    expect(res!.status).toBe(503);
    const html = await res!.text();
    expect(html).toContain("You're offline");
    expect(html).toContain('href="/year/y/subjects/s/modules/m1"');
    expect(html).toContain("Arrays · CP1");
  });

  it("does not save error pages", async () => {
    const w = loadWorker(async () => new Response("nope", { status: 404 }));
    await dispatch(w, navigate(LESSON));
    await flush();
    expect(w.caches.get("bsit-pages-v1")?.store.size ?? 0).toBe(0);
  });

  it("does not intercept a non-page request", async () => {
    const w = loadWorker(vi.fn());
    expect(await dispatch(w, new Request(`${ORIGIN}/api/events`))).toBeUndefined();
  });
});

describe("SAVE_LESSON messages", () => {
  it("saves a lesson the page asks for, keyed by path", async () => {
    const fetchImpl = vi.fn(async () => htmlResponse("Arrays · CP1 — BSIT Survival Kit"));
    const w = loadWorker(fetchImpl);
    await message(w, { type: "SAVE_LESSON", url: "/year/y/subjects/s/modules/m1?utm_source=gc" });
    expect(fetchImpl).toHaveBeenCalledWith(LESSON, { credentials: "same-origin" });
    expect(w.caches.get("bsit-pages-v1")!.store.has(LESSON)).toBe(true);
  });

  it("does not download a lesson it already has", async () => {
    const fetchImpl = vi.fn(async () => htmlResponse("x · y — BSIT Survival Kit"));
    const w = loadWorker(fetchImpl);
    await message(w, { type: "SAVE_LESSON", url: LESSON });
    await message(w, { type: "SAVE_LESSON", url: LESSON });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("refuses anything but a same-origin lesson URL", async () => {
    const fetchImpl = vi.fn();
    const w = loadWorker(fetchImpl);
    await message(w, { type: "SAVE_LESSON", url: "/account" });
    await message(w, { type: "SAVE_LESSON", url: "https://evil.example/year/y/subjects/s/modules/m" });
    await message(w, { type: "OTHER", url: LESSON });
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});

describe("helpers", () => {
  const w = loadWorker(vi.fn());

  it("escapes lesson titles in the offline page", () => {
    const html = w.offlinePage([{ path: "/a", title: "<script>x</script>" }]);
    expect(html).not.toContain("<script>x");
    expect(html).toContain("&lt;script&gt;");
  });

  it("explains an empty offline list", () => {
    expect(w.offlinePage([])).toContain("No lessons are saved");
  });

  it("reads and unescapes the page title", () => {
    expect(w.titleOf("<title>Tips &amp; Tricks · CP1 — BSIT Survival Kit</title>")).toBe("Tips & Tricks · CP1");
  });

  it("trims the oldest entries", async () => {
    const cache = new FakeCache();
    for (const n of [1, 2, 3, 4]) await cache.put(`${ORIGIN}/${n}`, new Response(""));
    await w.trimCache(cache, 2);
    expect([...cache.store.keys()]).toEqual([`${ORIGIN}/3`, `${ORIGIN}/4`]);
  });
});
