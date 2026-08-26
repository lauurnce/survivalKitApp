import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import {
  assessSecrets,
  clientReachable,
  ENV_CLASS,
  parseEnvExample,
  parseImports,
  renderSecretsTable,
  resolveSpecifier,
  scanEnvUsage,
  secretsSummaryLine,
} from "./secretsPosture";

const classes = {
  NEXT_PUBLIC_THING: "PUBLIC_OK",
  SERVER_TOKEN: "SERVER_ONLY",
  NODE_ENV: "PUBLIC_OK",
} as const;

describe("parseEnvExample", () => {
  it("reads a plain declaration", () => {
    expect(parseEnvExample("SERVER_TOKEN=x")).toEqual([
      { name: "SERVER_TOKEN", commented: false },
    ]);
  });

  it("reads a commented-out declaration as optional", () => {
    expect(parseEnvExample("# SERVER_TOKEN=x")).toEqual([
      { name: "SERVER_TOKEN", commented: true },
    ]);
  });

  it("ignores prose comments that are not declarations", () => {
    expect(parseEnvExample("# Copy this file to .env.local for local dev.")).toEqual([]);
  });

  it("ignores blank lines and box-drawing separators", () => {
    expect(parseEnvExample("\n# ─────────────\n\n")).toEqual([]);
  });

  it("keeps declaration order and does not deduplicate silently", () => {
    const names = parseEnvExample("B_VAR=1\nA_VAR=2").map((d) => d.name);
    expect(names).toEqual(["B_VAR", "A_VAR"]);
  });
});

describe("scanEnvUsage", () => {
  it("finds a direct process.env read", () => {
    expect(scanEnvUsage(`const s = process.env.SERVER_TOKEN;`)).toEqual(["SERVER_TOKEN"]);
  });

  it("finds a bracket read", () => {
    expect(scanEnvUsage(`process.env["SERVER_TOKEN"]`)).toEqual(["SERVER_TOKEN"]);
  });

  it("deduplicates and sorts", () => {
    const source = `process.env.B_VAR; process.env.A_VAR; process.env.B_VAR;`;
    expect(scanEnvUsage(source)).toEqual(["A_VAR", "B_VAR"]);
  });

  it("returns an empty array for source that reads nothing", () => {
    expect(scanEnvUsage("export const x = 1;")).toEqual([]);
  });
});

describe("parseImports", () => {
  it("finds static import specifiers", () => {
    const source = `import { a } from "@/lib/a";\nimport b from "./b";`;
    expect(parseImports(source)).toEqual(["@/lib/a", "./b"]);
  });

  it("does not treat a type-only import as a bundle edge", () => {
    // TypeScript erases `import type` at emit, so the bundler never follows
    // it and nothing from the target module ships. Counting it made the
    // client closure swallow whole server modules.
    expect(parseImports(`import type { T } from "./types";`)).toEqual([]);
  });

  it("still counts an inline type binding as a runtime import", () => {
    expect(parseImports(`import { type T, makeThing } from "./things";`)).toEqual(["./things"]);
  });

  it("finds a dynamic import", () => {
    expect(parseImports(`const m = await import("@/lib/heavy");`)).toEqual(["@/lib/heavy"]);
  });

  it("finds a re-export", () => {
    expect(parseImports(`export { a } from "./a";`)).toEqual(["./a"]);
  });
});

describe("resolveSpecifier", () => {
  const known = new Set(["lib/a.ts", "lib/b/index.ts", "components/C.tsx"]);

  it("resolves an @/ alias to a repo-relative module", () => {
    expect(resolveSpecifier("components/C.tsx", "@/lib/a", known)).toBe("lib/a.ts");
  });

  it("resolves a relative specifier against the importing file's directory", () => {
    expect(resolveSpecifier("lib/b/index.ts", "../a", known)).toBe("lib/a.ts");
  });

  it("resolves a directory specifier to its index file", () => {
    expect(resolveSpecifier("components/C.tsx", "@/lib/b", known)).toBe("lib/b/index.ts");
  });

  it("returns null for a bare package specifier", () => {
    expect(resolveSpecifier("components/C.tsx", "react", known)).toBeNull();
  });

  it("returns null when nothing in the known set matches", () => {
    expect(resolveSpecifier("components/C.tsx", "@/lib/missing", known)).toBeNull();
  });
});

describe("clientReachable", () => {
  const modules = {
    "components/C.tsx": `"use client";\nimport { a } from "@/lib/a";`,
    "lib/a.ts": `import { b } from "./b";`,
    "lib/b.ts": `export const b = 1;`,
    "lib/server.ts": `export const s = process.env.SERVER_TOKEN;`,
  };

  it("includes the client entry itself", () => {
    expect(clientReachable(modules).has("components/C.tsx")).toBe(true);
  });

  it("follows imports transitively", () => {
    const reached = clientReachable(modules);
    expect(reached.has("lib/a.ts")).toBe(true);
    expect(reached.has("lib/b.ts")).toBe(true);
  });

  it("excludes a module nothing client-side imports", () => {
    expect(clientReachable(modules).has("lib/server.ts")).toBe(false);
  });

  it("terminates on an import cycle", () => {
    const cyclic = {
      "components/C.tsx": `"use client";\nimport "./x";`,
      "components/x.ts": `import "./y";`,
      "components/y.ts": `import "./x";`,
    };
    expect(clientReachable(cyclic).size).toBe(3);
  });

  it("does not follow an import into a use-server module", () => {
    // Next.js compiles a client component's import of a "use server" module
    // to an endpoint reference, so the action's source never ships. Treating
    // that edge as a bundle edge reported every variable the actions file
    // read as client-reachable — a standing false P0.
    const withServerAction = {
      "components/C.tsx": `"use client";\nimport { act } from "@/app/actions";`,
      "app/actions.ts": `"use server";\nimport { s } from "@/lib/secret";\nexport async function act() { return s; }`,
      "lib/secret.ts": `export const s = process.env.SERVER_TOKEN;`,
    };
    const reached = clientReachable(withServerAction);
    expect(reached.has("components/C.tsx")).toBe(true);
    expect(reached.has("app/actions.ts")).toBe(false);
    expect(reached.has("lib/secret.ts")).toBe(false);
  });
});

describe("assessSecrets", () => {
  const base = {
    declared: [{ name: "SERVER_TOKEN", commented: false }],
    usage: { "lib/server.ts": ["SERVER_TOKEN"] },
    clientFiles: new Set<string>(),
    envFilesIgnored: true,
    registry: classes,
  };

  it("rates a server-only variable read only on the server as ok", () => {
    const posture = assessSecrets(base);
    expect(posture.issues).toEqual([]);
    expect(posture.rows.find((r) => r.name === "SERVER_TOKEN")?.reach).toBe("server");
  });

  it("flags a server-only variable read from a client-reachable file", () => {
    const posture = assessSecrets({
      ...base,
      usage: { "components/C.tsx": ["SERVER_TOKEN"] },
      clientFiles: new Set(["components/C.tsx"]),
    });
    expect(posture.issues.map((i) => i.kind)).toContain("client-reachable");
    expect(posture.rows.find((r) => r.name === "SERVER_TOKEN")?.reach).toBe("CLIENT");
  });

  it("flags a NEXT_PUBLIC_ variable classified server-only", () => {
    const posture = assessSecrets({
      ...base,
      usage: { "lib/server.ts": ["NEXT_PUBLIC_LEAK"] },
      registry: { ...classes, NEXT_PUBLIC_LEAK: "SERVER_ONLY" },
    });
    expect(posture.issues.map((i) => i.kind)).toContain("public-prefixed");
  });

  it("flags a variable used in code but absent from the registry", () => {
    const posture = assessSecrets({ ...base, usage: { "lib/server.ts": ["MYSTERY_VAR"] } });
    expect(posture.issues.map((i) => i.kind)).toContain("unclassified");
  });

  it("flags a variable used in code but absent from .env.example", () => {
    const posture = assessSecrets({ ...base, declared: [] });
    expect(posture.issues.map((i) => i.kind)).toContain("undocumented");
  });

  it("reports a declared-but-unread variable as drift, not as a gap", () => {
    const posture = assessSecrets({
      ...base,
      declared: [...base.declared, { name: "UNUSED_VAR", commented: true }],
    });
    expect(posture.issues.map((i) => i.kind)).toContain("documented-unused");
    expect(posture.gapCount).toBe(0);
  });

  it("flags env files that git does not ignore", () => {
    const posture = assessSecrets({ ...base, envFilesIgnored: false });
    expect(posture.issues.map((i) => i.kind)).toContain("env-not-ignored");
    expect(posture.gapCount).toBeGreaterThan(0);
  });

  it("names the file for a client-reachable issue so the report can cite it", () => {
    const posture = assessSecrets({
      ...base,
      usage: { "components/C.tsx": ["SERVER_TOKEN"] },
      clientFiles: new Set(["components/C.tsx"]),
    });
    expect(posture.issues.find((i) => i.kind === "client-reachable")?.file).toBe(
      "components/C.tsx"
    );
  });
});

describe("renderSecretsTable", () => {
  const posture = assessSecrets({
    declared: [{ name: "SERVER_TOKEN", commented: false }],
    usage: { "lib/server.ts": ["SERVER_TOKEN"], "components/C.tsx": ["NEXT_PUBLIC_THING"] },
    clientFiles: new Set(["components/C.tsx"]),
    envFilesIgnored: true,
    registry: classes,
  });

  it("has a header naming the columns", () => {
    const [header] = renderSecretsTable(posture).split("\n");
    expect(header).toContain("VARIABLE");
    expect(header).toContain("CLASS");
    expect(header).toContain("DOCUMENTED");
    expect(header).toContain("REACH");
  });

  it("names every variable it was given", () => {
    const rendered = renderSecretsTable(posture);
    expect(rendered).toContain("SERVER_TOKEN");
    expect(rendered).toContain("NEXT_PUBLIC_THING");
  });

  it("renders a rule as wide as a body row", () => {
    const [, rule, body] = renderSecretsTable(posture).split("\n");
    expect(rule.length).toBe(body.length);
  });
});

describe("secretsSummaryLine", () => {
  it("reports all clear when nothing is wrong", () => {
    const posture = assessSecrets({
      declared: [{ name: "SERVER_TOKEN", commented: false }],
      usage: { "lib/server.ts": ["SERVER_TOKEN"] },
      clientFiles: new Set<string>(),
      envFilesIgnored: true,
      registry: classes,
    });
    expect(secretsSummaryLine(posture)).toBe(
      "SECRETS       1 variable · none client-reachable · .env ignored"
    );
  });

  it("counts issues without naming the variable", () => {
    const posture = assessSecrets({
      declared: [],
      usage: { "components/C.tsx": ["SERVER_TOKEN"] },
      clientFiles: new Set(["components/C.tsx"]),
      envFilesIgnored: true,
      registry: classes,
    });
    const line = secretsSummaryLine(posture);
    expect(line).toContain("1 client-reachable");
    expect(line).not.toContain("SERVER_TOKEN");
  });
});

describe("standing assertion: the registry covers real env usage", () => {
  const REPO = join(__dirname, "..", "..");
  const ROOTS = ["app", "lib", "components", "scripts", "proxy.ts", "next.config.ts"];
  const EXTENSIONS = [".ts", ".tsx", ".mjs"];

  const walk = (path: string, out: string[] = []): string[] => {
    const stats = statSync(path, { throwIfNoEntry: false });
    if (!stats) return out;
    if (stats.isFile()) {
      // Test files are excluded: their synthetic fixtures embed
      // process.env-shaped strings that no shipped module reads, and the
      // assertion is about what the repository's real modules read.
      if (
        EXTENSIONS.some((ext) => path.endsWith(ext)) &&
        !path.endsWith(".test.ts")
      ) {
        out.push(path);
      }
      return out;
    }
    for (const entry of readdirSync(path)) walk(join(path, entry), out);
    return out;
  };

  const modules = (): Record<string, string> => {
    const found: Record<string, string> = {};
    for (const root of ROOTS) {
      for (const file of walk(join(REPO, root))) {
        found[relative(REPO, file).split(sep).join("/")] = readFileSync(file, "utf8");
      }
    }
    return found;
  };

  it("classifies every environment variable the repository reads", () => {
    const used = new Set<string>();
    for (const source of Object.values(modules())) {
      for (const name of scanEnvUsage(source)) used.add(name);
    }

    // A new secret must be classified before it can be reported on. Failing
    // here is the intended outcome of adding one — decide whether it is safe
    // to publish and write that down in ENV_CLASS.
    expect([...used].filter((name) => !(name in ENV_CLASS)).sort()).toEqual([]);
  });

  it("has no server-only variable read from a client-reachable module", () => {
    const found = modules();
    const posture = assessSecrets({
      declared: parseEnvExample(readFileSync(join(REPO, ".env.example"), "utf8")),
      usage: Object.fromEntries(
        Object.entries(found).map(([file, source]) => [file, scanEnvUsage(source)])
      ),
      clientFiles: clientReachable(found),
      envFilesIgnored: true,
      registry: ENV_CLASS,
    });

    // Asserts absence, so a passing run publishes nothing. This is the P0 in
    // the charter's escalation list, and it is worth failing the build over.
    expect(posture.issues.filter((issue) => issue.kind === "client-reachable")).toEqual([]);
  });
});
