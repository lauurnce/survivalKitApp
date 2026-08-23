import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import {
  classifyRoute,
  cookieScopeConflicts,
  crossReferenceRoutes,
  middlewareCoverage,
  renderRouteGuardTable,
  routeSummaryLine,
  ROUTE_EXPECTATIONS,
  type Expectation,
  type RouteRecord,
} from "./routeGuards";

const expectations: Record<string, Expectation> = {
  "/api/thing": { auth: ["device"], rateLimit: true, validation: true },
  "/api/open": { auth: "none", rateLimit: false, validation: false },
};

describe("classifyRoute", () => {
  it("records the exported HTTP methods", () => {
    const route = classifyRoute(
      "/api/thing",
      `export async function GET() {}\nexport async function POST() {}`
    );
    expect(route.methods).toEqual(["GET", "POST"]);
  });

  it("detects a device guard", () => {
    const route = classifyRoute("/api/thing", `verifyDeviceCookie(jar.get(DEVICE_COOKIE)?.value)`);
    expect(route.guards.device).toContain("verifyDeviceCookie");
  });

  it("detects an admin guard", () => {
    const route = classifyRoute("/api/thing", `if (!(await getAdminSession())) return;`);
    expect(route.guards.admin).toContain("getAdminSession");
  });

  it("detects a user-session guard", () => {
    const route = classifyRoute("/api/thing", `const userId = await getCurrentUserId();`);
    expect(route.guards.user).toContain("getCurrentUserId");
  });

  it("detects a webhook signature guard", () => {
    const route = classifyRoute("/api/thing", `if (!verifyPaymongoWebhook(raw, sig)) return;`);
    expect(route.guards.signature).toContain("verifyPaymongoWebhook");
  });

  it("detects validation via isUuid", () => {
    const route = classifyRoute("/api/thing", `if (!isUuid(id)) return bad();`);
    expect(route.guards.validation).toContain("isUuid");
  });

  it("detects validation via an explicit typeof check", () => {
    const route = classifyRoute("/api/thing", `if (typeof body.name !== "string") return bad();`);
    expect(route.guards.validation.length).toBeGreaterThan(0);
  });

  it("classifies an in-memory limiter as per-instance", () => {
    const route = classifyRoute("/api/thing", `const limiter = createRateLimiter(60);`);
    expect(route.guards.ratelimit).toContain("createRateLimiter");
    expect(route.rateLimitScope).toBe("per-instance");
  });

  it("classifies the RPC limiter as shared", () => {
    const route = classifyRoute("/api/thing", `await isServerRateLimited(key, opts);`);
    expect(route.rateLimitScope).toBe("shared");
  });

  it("classifies the login lockout RPC as a shared rate limit", () => {
    const route = classifyRoute("/api/thing", `await supabase.rpc("check_login_lockout", { p_ip: ip });`);
    expect(route.guards.ratelimit.length).toBeGreaterThan(0);
    expect(route.rateLimitScope).toBe("shared");
  });

  it("prefers shared when a route carries both kinds", () => {
    const route = classifyRoute(
      "/api/thing",
      `const limiter = createRateLimiter(60); await isServerRateLimited(k, o);`
    );
    expect(route.rateLimitScope).toBe("shared");
  });

  it("reports none when there is no limiter at all", () => {
    expect(classifyRoute("/api/thing", `export async function GET() {}`).rateLimitScope).toBe("none");
  });

  it("does not count a guard named only in a comment", () => {
    const route = classifyRoute("/api/thing", `// getAdminSession() is handled by middleware\n`);
    expect(route.guards.admin).toEqual([]);
  });
});

describe("crossReferenceRoutes", () => {
  const route = (overrides: Partial<RouteRecord> = {}): RouteRecord => ({
    path: "/api/thing",
    methods: ["POST"],
    guards: { device: [], admin: [], user: [], ratelimit: [], validation: [], signature: [] },
    rateLimitScope: "none",
    ...overrides,
  });

  it("reports a route meeting its expectation as satisfied", () => {
    const [assessment] = crossReferenceRoutes(
      [
        route({
          guards: {
            device: ["verifyDeviceCookie"],
            admin: [],
            user: [],
            ratelimit: ["createRateLimiter"],
            validation: ["isUuid"],
            signature: [],
          },
          rateLimitScope: "per-instance",
        }),
      ],
      expectations
    );
    expect(assessment.missing).toEqual([]);
    expect(assessment.unclassified).toBe(false);
  });

  it("names each missing guard", () => {
    const [assessment] = crossReferenceRoutes([route()], expectations);
    expect(assessment.missing).toEqual(["auth", "rateLimit", "validation"]);
  });

  it("accepts any listed auth kind when several are allowed", () => {
    const [assessment] = crossReferenceRoutes(
      [
        route({
          path: "/api/either",
          guards: {
            device: [],
            admin: [],
            user: ["getCurrentUserId"],
            ratelimit: [],
            validation: [],
            signature: [],
          },
        }),
      ],
      { "/api/either": { auth: ["device", "user"], rateLimit: false, validation: false } }
    );
    expect(assessment.missing).toEqual([]);
  });

  it("treats an unlisted route as unclassified, not as missing guards", () => {
    const [assessment] = crossReferenceRoutes([route({ path: "/api/brandnew" })], expectations);
    expect(assessment.unclassified).toBe(true);
    expect(assessment.missing).toEqual([]);
  });

  it("expects nothing of a route declared open", () => {
    const [assessment] = crossReferenceRoutes([route({ path: "/api/open" })], expectations);
    expect(assessment.missing).toEqual([]);
  });

  it("accepts a signature guard as auth when the expectation names it", () => {
    const [assessment] = crossReferenceRoutes(
      [
        route({
          path: "/api/hook",
          guards: {
            device: [],
            admin: [],
            user: [],
            ratelimit: [],
            validation: [],
            signature: ["verifyPaymongoWebhook"],
          },
        }),
      ],
      { "/api/hook": { auth: ["signature"], rateLimit: false, validation: false } }
    );
    expect(assessment.missing).toEqual([]);
  });
});

describe("middlewareCoverage", () => {
  const matcher = "/((?!_next/static|_next/image|favicon.ico).*)";

  it("reports a covered path as covered", () => {
    expect(middlewareCoverage(matcher, ["/api/thing"])).toEqual([
      { path: "/api/thing", covered: true },
    ]);
  });

  it("reports an excluded path as uncovered", () => {
    expect(middlewareCoverage(matcher, ["/_next/static/chunk.js"])[0].covered).toBe(false);
  });

  it("returns covered:null for a matcher it cannot compile", () => {
    expect(middlewareCoverage("([", ["/api/thing"])[0].covered).toBeNull();
  });
});

describe("cookieScopeConflicts", () => {
  it("returns nothing when the cookie path covers every enforced path", () => {
    expect(cookieScopeConflicts("/", ["/admin", "/api/admin"])).toEqual([]);
  });

  it("names an enforced path the cookie will never be sent to", () => {
    expect(cookieScopeConflicts("/admin", ["/admin", "/api/admin"])).toEqual(["/api/admin"]);
  });

  it("treats an exact match as covered", () => {
    expect(cookieScopeConflicts("/admin", ["/admin"])).toEqual([]);
  });

  it("does not treat a shared prefix without a boundary as covered", () => {
    expect(cookieScopeConflicts("/admin", ["/administration"])).toEqual(["/administration"]);
  });
});

describe("renderRouteGuardTable", () => {
  const assessments = crossReferenceRoutes(
    [
      {
        path: "/api/thing",
        methods: ["POST"],
        guards: {
          device: ["verifyDeviceCookie"],
          admin: [],
          user: [],
          ratelimit: ["createRateLimiter"],
          validation: ["isUuid"],
          signature: [],
        },
        rateLimitScope: "per-instance",
      },
      {
        path: "/api/brandnew",
        methods: ["GET"],
        guards: { device: [], admin: [], user: [], ratelimit: [], validation: [], signature: [] },
        rateLimitScope: "none",
      },
    ],
    expectations
  );

  it("has a header naming the guard columns", () => {
    const [header] = renderRouteGuardTable(assessments).split("\n");
    expect(header).toContain("ROUTE");
    expect(header).toContain("AUTH");
    expect(header).toContain("RATE");
    expect(header).toContain("VALID");
  });

  it("marks the unclassified route distinctly from a satisfied one", () => {
    const rendered = renderRouteGuardTable(assessments);
    expect(rendered).toContain("unclassified");
  });

  it("renders a rule as wide as a body row", () => {
    const [, rule, body] = renderRouteGuardTable(assessments).split("\n");
    expect(rule.length).toBe(body.length);
  });
});

describe("routeSummaryLine", () => {
  it("reports all clear when every route satisfies its expectation", () => {
    const assessments = crossReferenceRoutes(
      [
        {
          path: "/api/open",
          methods: ["GET"],
          guards: { device: [], admin: [], user: [], ratelimit: [], validation: [], signature: [] },
          rateLimitScope: "none",
        },
      ],
      expectations
    );
    expect(routeSummaryLine(assessments)).toBe(
      "ROUTE GUARDS  1/1 routes satisfy their expectation · none unclassified"
    );
  });

  it("counts gaps and unclassified routes separately", () => {
    const assessments = crossReferenceRoutes(
      [
        {
          path: "/api/thing",
          methods: ["POST"],
          guards: { device: [], admin: [], user: [], ratelimit: [], validation: [], signature: [] },
          rateLimitScope: "none",
        },
        {
          path: "/api/brandnew",
          methods: ["GET"],
          guards: { device: [], admin: [], user: [], ratelimit: [], validation: [], signature: [] },
          rateLimitScope: "none",
        },
      ],
      expectations
    );
    expect(routeSummaryLine(assessments)).toContain("1 missing a guard");
    expect(routeSummaryLine(assessments)).toContain("1 unclassified");
  });
});

describe("standing assertion: every API route is classified", () => {
  const apiDir = join(__dirname, "..", "..", "app", "api");

  const routeFiles = (dir: string): string[] => {
    const out: string[] = [];
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) out.push(...routeFiles(full));
      else if (entry === "route.ts") out.push(full);
    }
    return out;
  };

  it("has a ROUTE_EXPECTATIONS entry for every app/api route", () => {
    const paths = routeFiles(apiDir).map(
      (file) => `/api/${relative(apiDir, file).split(sep).slice(0, -1).join("/")}`
    );

    // A new route must be classified before it can be reported on. Failing
    // here is the intended outcome of adding one — decide what guards it
    // should have and write that down, rather than discovering later that
    // nothing was watching it.
    expect(paths.filter((path) => !(path in ROUTE_EXPECTATIONS))).toEqual([]);
  });

  it("has no live route missing a guard its expectation requires", () => {
    const routes = routeFiles(apiDir).map((file) =>
      classifyRoute(
        `/api/${relative(apiDir, file).split(sep).slice(0, -1).join("/")}`,
        readFileSync(file, "utf8")
      )
    );

    // Asserts absence: a passing run publishes nothing.
    const gaps = crossReferenceRoutes(routes, ROUTE_EXPECTATIONS)
      .filter((assessment) => assessment.missing.length > 0)
      .map((assessment) => assessment.route.path);

    expect(gaps).toEqual([]);
  });
});
