import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const DEVICE = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

vi.mock("./device", () => ({
  getDeviceId: () => DEVICE,
}));

import { logEvent, logSessionEntry, resetSessionEntry } from "./analytics";

function lastFetchBody(fetchMock: ReturnType<typeof vi.fn>) {
  const [, init] = fetchMock.mock.calls.at(-1)!;
  return JSON.parse((init as RequestInit).body as string);
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  resetSessionEntry();
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

  it("captures utm_content and utm_term on enter events", async () => {
    window.history.replaceState(
      null,
      "",
      "/?utm_source=reactivation&utm_medium=email&utm_campaign=finals-dec-2026" +
        "&utm_content=cta_button&utm_term=finals"
    );

    await logEvent("enter");

    expect(lastFetchBody(fetchMock)).toMatchObject({
      utm_source: "reactivation",
      utm_medium: "email",
      utm_campaign: "finals-dec-2026",
      utm_content: "cta_button",
      utm_term: "finals",
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
    expect(body).not.toHaveProperty("utm_content");
    expect(body).not.toHaveProperty("utm_term");
  });

  it("does not attach attribution to non-enter events", async () => {
    await logEvent("module_open", { module_id: "11111111-1111-1111-1111-111111111111" });

    const body = lastFetchBody(fetchMock);
    expect(body).not.toHaveProperty("referrer");
    expect(body).not.toHaveProperty("utm_source");
  });
});

describe("session entry", () => {
  const enters = () =>
    fetchMock.mock.calls
      .map(([, init]) => JSON.parse((init as RequestInit).body as string))
      .filter((b) => b.event_type === "enter");

  it("records attribution when the visit lands on a module page", async () => {
    window.history.replaceState(
      null,
      "",
      "/year/y/subjects/s/modules/m?utm_source=fb_group&utm_medium=social&utm_campaign=midterms",
    );
    await logSessionEntry();

    expect(enters()).toHaveLength(1);
    expect(enters()[0]).toMatchObject({
      utm_source: "fb_group",
      utm_medium: "social",
      utm_campaign: "midterms",
      referrer: "https://www.facebook.com/groups/bsit/",
    });
  });

  it("logs one enter per session, even when / or /account also fire one", async () => {
    await logSessionEntry();
    await logEvent("enter");
    await logSessionEntry();

    expect(enters()).toHaveLength(1);
  });

  it("still logs other events after the session entered", async () => {
    await logSessionEntry();
    await logEvent("module_open", { module_id: "11111111-1111-1111-1111-111111111111" });
    expect(lastFetchBody(fetchMock).event_type).toBe("module_open");
  });

  it("survives a reload within the same tab session without a second enter", async () => {
    await logSessionEntry();
    // A reload resets module state but keeps sessionStorage.
    resetModuleFlagOnly();
    await logSessionEntry();
    expect(enters()).toHaveLength(1);
  });
});

function resetModuleFlagOnly() {
  const flag = sessionStorage.getItem("bsit:session-entered");
  resetSessionEntry();
  if (flag) sessionStorage.setItem("bsit:session-entered", flag);
}
