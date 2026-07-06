import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const DEVICE = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

vi.mock("./device", () => ({
  getDeviceId: () => DEVICE,
}));

import { logEvent } from "./analytics";

function lastFetchBody(fetchMock: ReturnType<typeof vi.fn>) {
  const [, init] = fetchMock.mock.calls.at(-1)!;
  return JSON.parse((init as RequestInit).body as string);
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn(() => Promise.resolve(new Response(JSON.stringify({ ok: true }))));
  vi.stubGlobal("fetch", fetchMock);
  Object.defineProperty(document, "referrer", {
    value: "https://www.facebook.com/groups/bsit/",
    configurable: true,
  });
  window.history.replaceState(
    null,
    "",
    "/?utm_source=fb_group&utm_medium=social&utm_campaign=prelim_launch"
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  window.history.replaceState(null, "", "/");
});

describe("logEvent attribution capture", () => {
  it("attaches referrer and utm params on enter events", async () => {
    await logEvent("enter");

    const body = lastFetchBody(fetchMock);
    expect(body).toMatchObject({
      device_id: DEVICE,
      event_type: "enter",
      referrer: "https://www.facebook.com/groups/bsit/",
      utm_source: "fb_group",
      utm_medium: "social",
      utm_campaign: "prelim_launch",
    });
  });

  it("omits empty attribution values on enter events", async () => {
    Object.defineProperty(document, "referrer", { value: "", configurable: true });
    window.history.replaceState(null, "", "/?utm_source=fb_group");

    await logEvent("enter");

    const body = lastFetchBody(fetchMock);
    expect(body.utm_source).toBe("fb_group");
    expect(body).not.toHaveProperty("referrer");
    expect(body).not.toHaveProperty("utm_medium");
    expect(body).not.toHaveProperty("utm_campaign");
  });

  it("does not attach attribution to non-enter events", async () => {
    await logEvent("module_open", { module_id: "11111111-1111-1111-1111-111111111111" });

    const body = lastFetchBody(fetchMock);
    expect(body).not.toHaveProperty("referrer");
    expect(body).not.toHaveProperty("utm_source");
  });
});
