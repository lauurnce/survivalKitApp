import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";

function makeReq(query: string, ip: string): NextRequest {
  return new NextRequest(`http://localhost:3000/api/card/progress${query}`, {
    headers: { "x-real-ip": ip },
  });
}

describe("GET /api/card/progress — validation", () => {
  it("400s when subject is missing", async () => {
    const res = await GET(makeReq("?count=3", "10.0.0.1"));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeTruthy();
  });

  it("400s when count is missing or not a positive integer", async () => {
    expect((await GET(makeReq("?subject=CP1", "10.0.0.2"))).status).toBe(400);
    expect((await GET(makeReq("?subject=CP1&count=zero", "10.0.0.3"))).status).toBe(400);
    expect((await GET(makeReq("?subject=CP1&count=0", "10.0.0.4"))).status).toBe(400);
  });
});

describe("GET /api/card/progress — rate limiting", () => {
  it("429s on the 31st request from the same IP within the window", async () => {
    const ip = "10.0.0.100";
    let lastStatus = 0;
    for (let i = 0; i < 31; i++) {
      const res = await GET(makeReq("?subject=CP1&count=3", ip));
      lastStatus = res.status;
    }
    expect(lastStatus).toBe(429);
  });
});
