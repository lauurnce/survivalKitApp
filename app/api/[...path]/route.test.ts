import { describe, expect, it } from "vitest";
import { DELETE, GET, PATCH, POST, PUT } from "./route";

// QA GT-23: unknown /api/* paths returned the HTML app 404 with ACAO: *.
describe("/api catch-all", () => {
  it.each([
    ["GET", GET],
    ["POST", POST],
    ["PUT", PUT],
    ["PATCH", PATCH],
    ["DELETE", DELETE],
  ])("answers %s with a JSON 404 and no CORS header", async (_method, handler) => {
    const res = handler();
    expect(res.status).toBe(404);
    expect(res.headers.get("content-type")).toContain("application/json");
    expect(res.headers.get("access-control-allow-origin")).toBeNull();
    expect(await res.json()).toEqual({ error: "not_found" });
  });
});
