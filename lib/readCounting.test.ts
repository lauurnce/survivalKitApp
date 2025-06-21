import { describe, it, expect } from "vitest";
import { counterVisitsFor, isUncountableRequest } from "./readCounting";

const YEAR = "00000000-0000-0000-0000-000000000001";
const SUBJECT = "11111111-1111-4111-8111-111111111111";
const MODULE = "22222222-2222-4222-8222-222222222222";
const SECTION = "33333333-3333-4333-8333-333333333333";

describe("counterVisitsFor", () => {
  it("counts a module read AND the year reader for a deep-linked lesson", () => {
    expect(
      counterVisitsFor({ event_type: "module_open", year_id: YEAR, subject_id: SUBJECT, module_id: MODULE }),
    ).toEqual([
      { type: "module", id: MODULE },
      { type: "year", id: YEAR },
    ]);
  });

  it("counts the year reader from the subjects list page", () => {
    expect(counterVisitsFor({ event_type: "subject_open", year_id: YEAR })).toEqual([
      { type: "year", id: YEAR },
    ]);
  });

  it("counts a subject read and the year reader from the modules list page", () => {
    expect(counterVisitsFor({ event_type: "subject_open", year_id: YEAR, subject_id: SUBJECT })).toEqual([
      { type: "subject", id: SUBJECT },
      { type: "year", id: YEAR },
    ]);
  });

  it("counts a section read", () => {
    expect(counterVisitsFor({ event_type: "section_view", module_id: MODULE, section_id: SECTION })).toEqual([
      { type: "section", id: SECTION },
    ]);
  });

  it.each(["enter", "year_select", "paywall_teaser_view", "unlock_click", "print_click"])(
    "counts nothing for %s",
    (event_type) => {
      expect(counterVisitsFor({ event_type, year_id: YEAR, module_id: MODULE })).toEqual([]);
    },
  );

  it("counts nothing when the resource id is missing", () => {
    expect(counterVisitsFor({ event_type: "module_open" })).toEqual([]);
    expect(counterVisitsFor({ event_type: "section_view", module_id: MODULE })).toEqual([]);
  });
});

function headers(values: Record<string, string>) {
  const lower = Object.fromEntries(Object.entries(values).map(([k, v]) => [k.toLowerCase(), v]));
  return { get: (name: string) => lower[name.toLowerCase()] ?? null };
}

const CHROME_ANDROID =
  "Mozilla/5.0 (Linux; Android 14; SM-A146P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36";
const SAFARI_IOS =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const FB_IN_APP =
  "Mozilla/5.0 (Linux; Android 13; RMX3630) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/129.0.0.0 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/480.0.0.0;]";

describe("isUncountableRequest", () => {
  it.each([CHROME_ANDROID, SAFARI_IOS, FB_IN_APP])("counts a real browser: %s", (ua) => {
    expect(isUncountableRequest(headers({ "user-agent": ua }))).toBe(false);
  });

  it.each([
    "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/130.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36 Chrome-Lighthouse",
    "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
    "curl/8.7.1",
    "python-requests/2.32.3",
  ])("does not count a bot or tool: %s", (ua) => {
    expect(isUncountableRequest(headers({ "user-agent": ua }))).toBe(true);
  });

  it("does not count a request with no user agent", () => {
    expect(isUncountableRequest(headers({}))).toBe(true);
  });

  it.each<Record<string, string>>([
    { "sec-purpose": "prefetch;prerender" },
    { "sec-purpose": "prefetch" },
    { purpose: "prefetch" },
    { "x-moz": "prefetch" },
    { "next-router-prefetch": "1" },
  ])("does not count a speculative prefetch/prerender: %o", (extra) => {
    expect(isUncountableRequest(headers({ "user-agent": CHROME_ANDROID, ...extra }))).toBe(true);
  });
});
