import { createServerClient } from "@/lib/supabase/server";
import {
  UNSUBSCRIBE_PATH,
  recordUnsubscribe,
  verifyUnsubscribeToken,
  type UnsubscribeSource,
} from "@/lib/email/unsubscribe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET never unsubscribes. Mail scanners and link previewers fetch every URL in
// a message, so a GET that acted would opt people out who never clicked.
// GET shows a one-button page; POST does the work. POST is also what Gmail and
// Yahoo send for the RFC 8058 List-Unsubscribe-Post one-click header.

function page(status: number, title: string, body: string): Response {
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>${title}</title></head>
<body style="font-family:system-ui,-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:32px 16px;color:#111;background:#fff;line-height:1.5">
<h1 style="font-size:20px">${title}</h1>
${body}
<p style="font-size:13px;color:#555;margin-top:32px">BSIT Survival Kit · <a href="/" style="color:#555">tryi2i.com</a></p>
</body></html>`;
  return new Response(html, {
    status,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}

const INVALID = () =>
  page(400, "This link doesn't work", "<p>The unsubscribe link is incomplete or was changed. Use the link from the email exactly as it arrived.</p>");

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const u = sp.get("u");
  const t = sp.get("t");
  if (!verifyUnsubscribeToken(u, t)) return INVALID();
  // Values are a verified UUID and a base64url token, so they are safe to echo.
  const action = `${UNSUBSCRIBE_PATH}?${new URLSearchParams({ u: u!, t: t! }).toString()}`;
  return page(
    200,
    "Stop these emails?",
    `<p>You'll stop getting study reminders like the finals email. Receipts and notices about access you paid for still arrive.</p>
<form method="post" action="${action}"><button type="submit" style="font-size:16px;padding:12px 20px;border:0;border-radius:8px;background:#111;color:#fff;cursor:pointer">Unsubscribe</button></form>`
  );
}

export async function POST(req: Request) {
  const sp = new URL(req.url).searchParams;
  const u = sp.get("u");
  if (!verifyUnsubscribeToken(u, sp.get("t"))) return INVALID();

  const body = await req.text().catch(() => "");
  const source: UnsubscribeSource = body.includes("List-Unsubscribe=One-Click") ? "one_click" : "link";

  try {
    await recordUnsubscribe(createServerClient(), u!, source);
  } catch (err) {
    console.error("unsubscribe failed:", err instanceof Error ? err.message : err);
    return page(500, "Something went wrong", "<p>We couldn't save that. Please try the link again in a minute.</p>");
  }
  return page(200, "You're unsubscribed", "<p>You won't get study reminders from us anymore. Your account and your progress are untouched.</p>");
}
