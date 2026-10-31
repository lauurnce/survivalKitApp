import { describe, it, expect } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

// sqlRunner loads sql.js through its "browser" export, which fetches
// sql-wasm-browser.wasm from /sqljs/. Only that file is shipped; a second
// copy under the Node build's name (sql-wasm.wasm) was dead weight.
describe("self-hosted sql.js wasm", () => {
  const root = process.cwd();

  it("ships exactly the wasm the browser build requests", () => {
    const browserJs = readFileSync(
      join(root, "node_modules/sql.js/dist/sql-wasm-browser.js"),
      "utf8"
    );
    const requested = new Set(browserJs.match(/sql-wasm[a-z-]*\.wasm/g));
    expect([...requested]).toEqual(["sql-wasm-browser.wasm"]);
    expect(readdirSync(join(root, "public/sqljs"))).toEqual(["sql-wasm-browser.wasm"]);
  });

  it("does not ship the Node build's wasm", () => {
    expect(existsSync(join(root, "public/sqljs/sql-wasm.wasm"))).toBe(false);
  });
});
