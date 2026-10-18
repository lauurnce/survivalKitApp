import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// A minimal browser cookie jar (RFC 6265 §5.1.4 path-match, Max-Age=0
// deletion), so the tests below exercise the cookie the way a browser would
// rather than just reading the option the code passed.
// ---------------------------------------------------------------------------
type JarCookie = { name: string; value: string; path: string };
let jar: JarCookie[] = [];

function pathMatches(requestPath: string, cookiePath: string): boolean {
  if (requestPath === cookiePath) return true;
  if (!requestPath.startsWith(cookiePath)) return false;
  return cookiePath.endsWith("/") || requestPath[cookiePath.length] === "/";
}

function storeSetCookies(headers: Headers) {
  for (const raw of headers.getSetCookie()) {
    const [pair, ...attrs] = raw.split(";").map((s) => s.trim());
    const eq = pair.indexOf("=");
    const name = pair.slice(0, eq);
    const value = pair.slice(eq + 1);
    const attr = (key: string) =>
      attrs.find((a) => a.toLowerCase().startsWith(`${key.toLowerCase()}=`))?.split("=")[1];
    const path = attr("Path") ?? "/";
    jar = jar.filter((c) => !(c.name === name && c.path === path));
    if (attr("Max-Age") !== "0") jar.push({ name, value, path });
  }
}

// What the browser sends on a request to `requestPath`: longest path first,
// as RFC 6265 §5.4 orders them.
function cookiesFor(requestPath: string): JarCookie[] {
  return jar
    .filter((c) => pathMatches(requestPath, c.path))
    .sort((a, b) => b.path.length - a.path.length);
}

// next/headers' cookies() for the route under test reads whatever the jar
// would send to the path currently being requested.
let currentPath = "/";
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => cookiesFor(currentPath).find((c) => c.name === name),
  }),
}));

const rpcMock = vi.hoisted(() => vi.fn());
vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => ({ rpc: rpcMock }),
}));

const isServerRateLimitedMock = vi.hoisted(() => vi.fn());
vi.mock("@/lib/serverRateLimit", () => ({
  isServerRateLimited: isServerRateLimitedMock,
}));

const { POST: login } = await import("./route");
const { POST: logout } = await import("../logout/route");
const { POST: reconcile } = await import("../reconcile/route");
const { createSessionToken } = await import("@/lib/auth/adminSession");

const PASSWORD = "correct-horse-battery-staple";

function loginRequest(password: string, ip = "203.0.113.9") {
  return new NextRequest("http://localhost/api/admin/login", {
    method: "POST",
    headers: { "content-type": "application/json", "x-real-ip": ip },
    body: JSON.stringify({ password }),
  });
}

function reconcileRequest() {
  return new NextRequest("http://localhost/api/admin/reconcile", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({}),
  });
}

beforeEach(() => {
  process.env.ADMIN_SESSION_SECRET = "test-admin-session-secret-at-least-32";
  process.env.ADMIN_PASSWORD = PASSWORD;
  jar = [];
  currentPath = "/";
  rpcMock.mockReset();
  rpcMock.mockResolvedValue({ data: false, error: null });
  isServerRateLimitedMock.mockReset();
  isServerRateLimitedMock.mockResolvedValue(false);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.ADMIN_SESSION_SECRET;
  delete process.env.ADMIN_PASSWORD;
});

describe("admin session cookie reaches the admin API", () => {
  it("delivers the login cookie to /api/admin/* and the request passes auth", async () => {
    const res = await login(loginRequest(PASSWORD));
    expect(res.status).toBe(200);
    storeSetCookies(res.headers);

    for (const path of ["/admin", "/api/admin/reconcile", "/api/admin/feedback"]) {
      expect(cookiesFor(path).map((c) => c.name)).toContain("admin_session");
    }

    // The dashboard's manual-reconcile call: past the 401 gate, it fails
    // only on the empty body.
    currentPath = "/api/admin/reconcile";
    const rec = await reconcile(reconcileRequest());
    expect(rec.status).toBe(400);
  });

  it("would not have reached /api/admin/* under the old Path=/admin scope", async () => {
    jar = [{ name: "admin_session", value: createSessionToken(), path: "/admin" }];
    currentPath = "/api/admin/reconcile";
    const rec = await reconcile(reconcileRequest());
    expect(rec.status).toBe(401);
  });

  it("logout expires both the / cookie and a leftover Path=/admin cookie", async () => {
    jar = [{ name: "admin_session", value: createSessionToken(), path: "/admin" }];
    storeSetCookies((await login(loginRequest(PASSWORD))).headers);
    // Login already drops the legacy cookie, leaving one session cookie.
    expect(jar).toEqual([expect.objectContaining({ path: "/" })]);

    jar.push({ name: "admin_session", value: createSessionToken(), path: "/admin" });
    storeSetCookies((await logout()).headers);
    expect(jar).toEqual([]);
    expect(cookiesFor("/admin")).toEqual([]);
  });
});

describe("login lockout", () => {
  const RPC_ERROR = { data: null, error: { message: "connection refused" } };

  function rpcCalls(name: string) {
    return rpcMock.mock.calls.filter(([fn]) => fn === name);
  }

  it("returns 429 without checking the password when the IP is locked out", async () => {
    rpcMock.mockImplementation(async (fn: string) =>
      fn === "check_login_lockout" ? { data: true, error: null } : { data: null, error: null },
    );
    const res = await login(loginRequest(PASSWORD));
    expect(res.status).toBe(429);
    expect(res.headers.getSetCookie()).toEqual([]);
    expect(isServerRateLimitedMock).not.toHaveBeenCalled();
  });

  it("does not consult the fallback limiter when the lockout RPC succeeds", async () => {
    const res = await login(loginRequest(PASSWORD));
    expect(res.status).toBe(200);
    expect(isServerRateLimitedMock).not.toHaveBeenCalled();
  });

  describe("when check_login_lockout errors", () => {
    beforeEach(() => {
      rpcMock.mockImplementation(async (fn: string) =>
        fn === "check_login_lockout" ? RPC_ERROR : { data: null, error: null },
      );
    });

    it("logs the error and falls back to the distributed limiter for the IP", async () => {
      await login(loginRequest(PASSWORD, "198.51.100.7"));
      expect(console.error).toHaveBeenCalledWith(
        "check_login_lockout RPC error:",
        RPC_ERROR.error,
      );
      expect(isServerRateLimitedMock).toHaveBeenCalledWith(
        "admin-login:ip:198.51.100.7",
        { max: 5, windowSeconds: 900 },
      );
    });

    it("returns 429 once the fallback limiter is exhausted", async () => {
      isServerRateLimitedMock.mockResolvedValue(true);
      const res = await login(loginRequest(PASSWORD));
      expect(res.status).toBe(429);
      expect(res.headers.getSetCookie()).toEqual([]);
    });

    it("still lets a correct password through while the fallback has budget", async () => {
      const res = await login(loginRequest(PASSWORD));
      expect(res.status).toBe(200);
    });

    it("stays fail-closed when the RPC throws instead of returning an error", async () => {
      rpcMock.mockImplementation(async (fn: string) => {
        if (fn === "check_login_lockout") throw new Error("fetch failed");
        return { data: null, error: null };
      });
      isServerRateLimitedMock.mockResolvedValue(true);
      const res = await login(loginRequest(PASSWORD));
      expect(res.status).toBe(429);
    });

    it("never opens unlimited guessing: the fallback budget caps wrong guesses", async () => {
      // A real fixed-window limiter at max 5: the sixth attempt is refused.
      let attempts = 0;
      isServerRateLimitedMock.mockImplementation(async () => ++attempts > 5);
      vi.useFakeTimers();
      try {
        const statuses: number[] = [];
        for (let i = 0; i < 6; i++) {
          const pending = login(loginRequest("wrong-password"));
          await vi.runAllTimersAsync();
          statuses.push((await pending).status);
        }
        expect(statuses).toEqual([401, 401, 401, 401, 401, 429]);
      } finally {
        vi.useRealTimers();
      }
    });
  });

  it("logs, rather than swallows, a record_login_attempt failure", async () => {
    rpcMock.mockImplementation(async (fn: string) =>
      fn === "record_login_attempt" ? RPC_ERROR : { data: false, error: null },
    );
    vi.useFakeTimers();
    try {
      const pending = login(loginRequest("wrong-password"));
      await vi.runAllTimersAsync();
      expect((await pending).status).toBe(401);
    } finally {
      vi.useRealTimers();
    }
    expect(rpcCalls("record_login_attempt")).toHaveLength(1);
    expect(console.error).toHaveBeenCalledWith(
      "record_login_attempt RPC error:",
      RPC_ERROR.error,
    );
  });
});
