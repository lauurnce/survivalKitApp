/**
 * What an analytics event adds to the public reader/read counters.
 *
 * The counters (`counters` + `counter_log`, written by the `record_visit` RPC)
 * are keyed by device, never by account, so a signed-out visitor counts
 * exactly like a signed-in one, and signing up later changes nothing
 * (lib/auth/claim.ts never touches counter_log).
 *
 *   reader — `counters.reader_count` on a `year` row: distinct devices that
 *            have read anything in that year, counted once per device ever.
 *            Shown as "N readers" on the year cards at /year.
 *   read   — `counters.read_count` on a `subject`, `module` or `section` row:
 *            one per device per resource, counted again only after 10 quiet
 *            minutes (record_visit's window). Shown as "N reads", and the
 *            module read_count ranks "Popular right now" on the landing page.
 *
 * A year reader used to be recorded only from the subjects list page
 * (`subject_open` with a year and no subject). Anyone who arrived by a deep
 * link straight into a lesson — the landing page's CP1 button, a shared link,
 * "Popular right now" — read the year without ever becoming one of its
 * readers. Every event that names a year now records the year reader too;
 * record_visit counts a device once per year, so repeats are free.
 */

export type CounterResourceType = "year" | "subject" | "module" | "section";

export interface CounterVisit {
  type: CounterResourceType;
  id: string;
}

export interface CountableEvent {
  event_type: string;
  year_id?: string | null;
  subject_id?: string | null;
  module_id?: string | null;
  section_id?: string | null;
}

/** The record_visit calls one event should make, in order. Empty = counts nothing. */
export function counterVisitsFor(event: CountableEvent): CounterVisit[] {
  const { event_type, year_id, subject_id, module_id, section_id } = event;
  const visits: CounterVisit[] = [];

  if (event_type === "subject_open") {
    if (subject_id) visits.push({ type: "subject", id: subject_id });
    if (year_id) visits.push({ type: "year", id: year_id });
  } else if (event_type === "module_open") {
    if (module_id) visits.push({ type: "module", id: module_id });
    if (year_id) visits.push({ type: "year", id: year_id });
  } else if (event_type === "section_view") {
    if (section_id) visits.push({ type: "section", id: section_id });
  }

  return visits;
}

// Crawlers that execute JavaScript (Googlebot, Bingbot, Lighthouse, headless
// scrapers) mount the page trackers like a browser does. Each run starts with
// empty storage, so every crawl would mint a fresh device and a new "reader".
const BOT_USER_AGENT =
  /bot\b|bot\/|crawler|crawling|spider|slurp|mediapartners|facebookexternalhit|headlesschrome|lighthouse|pagespeed|pingdom|uptimerobot|statuscake|phantomjs|puppeteer|playwright|selenium|\bcurl\/|\bwget\/|python-requests|python-urllib|axios\/|node-fetch|go-http-client|okhttp|java\//i;

interface HeaderSource {
  get(name: string): string | null;
}

/**
 * True when the request must not move the counters: a known bot or tool user
 * agent (or none at all — every browser sends one), or a request made while a
 * page was being speculatively prefetched/prerendered rather than viewed.
 * Next's own <Link> prefetch never runs page effects, but Chrome's
 * speculation-rules prerender does, and tags those requests
 * `Sec-Purpose: prefetch;prerender`.
 */
export function isUncountableRequest(headers: HeaderSource): boolean {
  const purpose = ["sec-purpose", "purpose", "x-purpose", "x-moz"]
    .map((name) => headers.get(name))
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (/prefetch|prerender|preview/.test(purpose)) return true;
  if (headers.get("next-router-prefetch")) return true;

  const userAgent = headers.get("user-agent");
  if (!userAgent) return true;
  return BOT_USER_AGENT.test(userAgent);
}
