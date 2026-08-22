// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

vi.mock("next/headers", () => ({
  cookies: () => Promise.resolve({ get: () => ({ value: "signed-cookie" }) }),
}));

vi.mock("@/lib/auth/deviceCookie", () => ({
  DEVICE_COOKIE: "bsit_device",
  verifyDeviceCookie: () => "device-1",
}));

// Checkout now requires an account, so the page only renders the gate (and the
// returnPath these tests inspect) for a signed-in visitor. Controllable so the
// signed-out branch can be asserted on its own.
let currentUserId: string | null = "user-1";
vi.mock("@/lib/auth/currentUser", () => ({
  getCurrentUserId: () => Promise.resolve(currentUserId),
}));

let subscribed = false;
vi.mock("@/lib/subscriptions", () => ({
  isSubscribed: () => Promise.resolve(subscribed),
}));

// Stand in for the client component so the test can read exactly which
// returnPath the page decided to hand checkout.
vi.mock("@/components/SubscribeGate", () => ({
  SubscribeGate: ({ returnPath, signInHref }: { returnPath?: string | null; signInHref?: string | null }) => (
    <div
      data-testid="gate"
      data-return-path={returnPath ?? "none"}
      data-sign-in-href={signInHref ?? "none"}
    />
  ),
}));

const YEAR = "11111111-1111-1111-1111-111111111111";
const SUBJECT = "22222222-2222-2222-2222-222222222222";
const OWN_MODULE = "33333333-3333-3333-3333-333333333333";
const OTHER_SUBJECT = "44444444-4444-4444-4444-444444444444";
const OTHER_MODULE = "55555555-5555-5555-5555-555555555555";

const OWN_MODULE_TITLE = "Arrays and Loops";
const FOREIGN_MODULE_TITLE = "Unpublished Capstone Defense Notes";

interface QueryCall {
  table: string;
  columns: string;
  filters: Array<{ op: string; column: string; value: unknown }>;
}

let queries: QueryCall[];

// Every module row in the database, across every subject — the point of the
// cross-subject tests is that a query which forgets to scope by subject can
// reach the rows that do not belong to this page.
const moduleRows = [
  { id: OWN_MODULE, subject_id: SUBJECT, title: OWN_MODULE_TITLE },
  { id: OTHER_MODULE, subject_id: OTHER_SUBJECT, title: FOREIGN_MODULE_TITLE },
];

function resultFor(call: QueryCall): Record<string, unknown> {
  const find = (column: string) => call.filters.find((f) => f.column === column)?.value;

  if (call.table === "subjects") {
    return {
      data: {
        id: SUBJECT,
        title: "Computer Programming 1",
        years: { label: "1st Year", sort_order: 1 },
      },
    };
  }

  if (call.table === "modules") {
    const bySubject = find("subject_id");
    const byId = find("id");
    let rows = moduleRows;
    if (bySubject !== undefined) rows = rows.filter((m) => m.subject_id === bySubject);
    if (byId !== undefined) rows = rows.filter((m) => m.id === byId);
    // A `.single()`-shaped read wants one row; a list read wants the array.
    return { data: byId !== undefined ? (rows[0] ?? null) : rows };
  }

  if (call.table === "sections") return { count: 12, data: null };

  return { data: null };
}

function makeQuery(table: string) {
  const call: QueryCall = { table, columns: "", filters: [] };
  queries.push(call);
  const settle = () => Promise.resolve(resultFor(call));
  const builder = {
    select(columns: string) {
      call.columns = columns;
      return builder;
    },
    eq(column: string, value: unknown) {
      call.filters.push({ op: "eq", column, value });
      return builder;
    },
    in(column: string, value: unknown) {
      call.filters.push({ op: "in", column, value });
      return builder;
    },
    order() {
      return builder;
    },
    maybeSingle: settle,
    single: settle,
    then: (
      onFulfilled?: (value: Record<string, unknown>) => unknown,
      onRejected?: (reason: unknown) => unknown
    ) => settle().then(onFulfilled, onRejected),
  };
  return builder;
}

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => ({ from: (table: string) => makeQuery(table) }),
}));

import UnlockPage from "./page";

async function renderPage(search: Record<string, string>) {
  const ui = await UnlockPage({ searchParams: Promise.resolve(search) });
  return render(ui);
}

beforeEach(() => {
  queries = [];
  subscribed = false;
  currentUserId = "user-1";
});

describe("UnlockPage — return path binding", () => {
  it("accepts a from path whose module belongs to this subject", async () => {
    const from = `/year/${YEAR}/subjects/${SUBJECT}/modules/${OWN_MODULE}`;
    await renderPage({ year: YEAR, subject: SUBJECT, from });

    expect(screen.getByTestId("gate")).toHaveAttribute("data-return-path", from);
    expect(screen.getByRole("link", { name: new RegExp(OWN_MODULE_TITLE, "i") })).toHaveAttribute(
      "href",
      from
    );
  });

  it("rejects a from path whose module belongs to a different subject", async () => {
    // Year and subject segments match the plan on sale, so the shape check in
    // safeReturnPath passes — only the module belongs to someone else.
    const crafted = `/year/${YEAR}/subjects/${SUBJECT}/modules/${OTHER_MODULE}`;
    await renderPage({ year: YEAR, subject: SUBJECT, from: crafted });

    expect(screen.getByTestId("gate")).toHaveAttribute("data-return-path", "none");
    expect(screen.getByRole("link", { name: /computer programming 1/i })).toHaveAttribute(
      "href",
      `/year/${YEAR}/subjects/${SUBJECT}/modules`
    );
  });

  it("rejects a from path that names this subject's module under someone else's year", async () => {
    // The module id is legitimately ours, so the database check alone waves it
    // through — only the segment check catches the mismatched year, and a
    // returnPath like this sends the payer to a URL that cannot resolve.
    const otherYear = "99999999-9999-9999-9999-999999999999";
    const crafted = `/year/${otherYear}/subjects/${SUBJECT}/modules/${OWN_MODULE}`;
    await renderPage({ year: YEAR, subject: SUBJECT, from: crafted });

    expect(screen.getByTestId("gate")).toHaveAttribute("data-return-path", "none");
  });

  it("rejects a from path that is not a module route at all", async () => {
    await renderPage({ year: YEAR, subject: SUBJECT, from: "//evil.example.com" });

    expect(screen.getByTestId("gate")).toHaveAttribute("data-return-path", "none");
    expect(screen.getByRole("link", { name: /computer programming 1/i })).toHaveAttribute(
      "href",
      `/year/${YEAR}/subjects/${SUBJECT}/modules`
    );
  });

  it("never renders another subject's module title from a crafted from path", async () => {
    const crafted = `/year/${YEAR}/subjects/${SUBJECT}/modules/${OTHER_MODULE}`;
    const { container } = await renderPage({ year: YEAR, subject: SUBJECT, from: crafted });

    expect(container.textContent).not.toContain(FOREIGN_MODULE_TITLE);
  });

  it("never renders another subject's module title on the already-unlocked screen", async () => {
    subscribed = true;
    const crafted = `/year/${YEAR}/subjects/${SUBJECT}/modules/${OTHER_MODULE}`;
    const { container } = await renderPage({ year: YEAR, subject: SUBJECT, from: crafted });

    expect(screen.getByText(/already unlocked/i)).toBeInTheDocument();
    expect(container.textContent).not.toContain(FOREIGN_MODULE_TITLE);
  });

  it("scopes every module read to this subject", async () => {
    const crafted = `/year/${YEAR}/subjects/${SUBJECT}/modules/${OTHER_MODULE}`;
    await renderPage({ year: YEAR, subject: SUBJECT, from: crafted });

    const moduleReads = queries.filter((q) => q.table === "modules");
    expect(moduleReads.length).toBeGreaterThan(0);
    for (const read of moduleReads) {
      expect(read.filters).toContainEqual({ op: "eq", column: "subject_id", value: SUBJECT });
    }
  });
});

describe("UnlockPage — sign-in requirement", () => {
  it("offers sign-in instead of checkout when signed out", async () => {
    currentUserId = null;
    await renderPage({ year: YEAR, subject: SUBJECT });

    const link = screen.getByRole("link", { name: /sign in to unlock/i });
    expect(link.getAttribute("href")).toContain("/login?next=");
  });

  it("carries a valid from path through sign-in so the payer returns to the plans", async () => {
    currentUserId = null;
    const from = `/year/${YEAR}/subjects/${SUBJECT}/modules/${OWN_MODULE}`;
    await renderPage({ year: YEAR, subject: SUBJECT, from });

    const href = screen.getByRole("link", { name: /sign in to unlock/i }).getAttribute("href")!;
    // from is encoded into returnHref, which is itself encoded into next —
    // so reaching the raw module path takes two passes.
    const next = decodeURIComponent(href.split("next=")[1]);
    expect(next).toContain(`/unlock?year=${YEAR}&subject=${SUBJECT}`);
    expect(decodeURIComponent(next)).toContain(from);
  });

  it("still quotes the price to a signed-out visitor", async () => {
    currentUserId = null;
    await renderPage({ year: YEAR, subject: SUBJECT });

    // This page is the only place in the app that shows a price. Hiding it
    // behind the account wall asks people to sign up before they know the cost.
    expect(screen.getByTestId("gate")).not.toBeNull();
  });

  it("points the signed-out gate at sign-in instead of checkout", async () => {
    currentUserId = null;
    await renderPage({ year: YEAR, subject: SUBJECT });

    const href = screen.getByTestId("gate").getAttribute("data-sign-in-href")!;
    expect(href).toContain("/login?next=");
    expect(decodeURIComponent(href)).toContain(`/unlock?year=${YEAR}&subject=${SUBJECT}`);
  });

  it("leaves the gate free to check out once signed in", async () => {
    currentUserId = "user-1";
    await renderPage({ year: YEAR, subject: SUBJECT });

    expect(screen.getByTestId("gate").getAttribute("data-sign-in-href")).toBe("none");
  });
});
