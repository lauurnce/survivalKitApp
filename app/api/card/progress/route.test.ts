import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";

function makeReq(query: string): NextRequest {
  return new NextRequest(`http://localhost:3000/api/card/progress${query}`);
}

describe("GET /api/card/progress — validation", () => {
  it("400s when subject is missing", async () => {
    const res = await GET(makeReq("?count=3"));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeTruthy();
  });

  it("400s when count is missing or not a positive integer", async () => {
    expect((await GET(makeReq("?subject=CP1"))).status).toBe(400);
    expect((await GET(makeReq("?subject=CP1&count=zero"))).status).toBe(400);
    expect((await GET(makeReq("?subject=CP1&count=0"))).status).toBe(400);
  });
});
