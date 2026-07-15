import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Controllable per-test: set to a signed cookie value to simulate a real
// visitor whose device cookie has already synced, or leave undefined to
// simulate an anonymous/scripted caller with no cookie at all.
let mockCookieValue: string | undefined;
vi.mock("next/headers", () => ({
  cookies: () => Promise.resolve({ get: () => (mockCookieValue ? { value: mockCookieValue } : undefined) }),
}));

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

import { POST } from "./route";
import { signDeviceCookie } from "@/lib/auth/deviceCookie";

const DEVICE = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

let ipCounter = 0;
function makeReq(body: Record<string, unknown>) {
  const ip = `10.2.${Math.floor(ipCounter / 250)}.${ipCounter++ % 250}`;
  return {
    json: () => Promise.resolve(body),
    headers: { get: (h: string) => (h === "x-real-ip" ? ip : null) },
  } as unknown as import("next/server").NextRequest;
}

function mockJudge0Response(overrides: Record<string, unknown> = {}) {
  fetchMock.mockResolvedValueOnce({
    ok: true,
    json: () =>
      Promise.resolve({
        status: { id: 3, description: "Accepted" },
        stdout: "hello\n",
        stderr: "",
        compile_output: "",
        time: "0.01",
        ...overrides,
      }),
  });
}

beforeEach(() => {
  mockCookieValue = undefined;
  process.env.DEVICE_COOKIE_SECRET = "test-device-secret";
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.stubGlobal("fetch", fetchMock);
});

describe("POST /api/run — device identity requirement", () => {
  it("401s when no device cookie is present", async () => {
    const res = await POST(makeReq({ languageId: "c", code: "int main(){}" }));
    expect(res.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("401s when the cookie is forged/tampered", async () => {
    mockCookieValue = "not-a-real-device.bad-signature";
    const res = await POST(makeReq({ languageId: "c", code: "int main(){}" }));
    expect(res.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("proceeds to Judge0 when a valid device cookie is present", async () => {
    mockCookieValue = signDeviceCookie(DEVICE);
    mockJudge0Response();

    const res = await POST(makeReq({ languageId: "c", code: "int main(){}" }));
    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const json = await res.json();
    expect(json.stdout).toBe("hello\n");
  });
});

describe("POST /api/run — validation (unchanged behavior)", () => {
  beforeEach(() => {
    mockCookieValue = signDeviceCookie(DEVICE);
  });

  it("rejects an unsupported language", async () => {
    const res = await POST(makeReq({ languageId: "python", code: "print(1)" }));
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects code over the size cap", async () => {
    const res = await POST(makeReq({ languageId: "c", code: "x".repeat(60_000) }));
    expect(res.status).toBe(413);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
