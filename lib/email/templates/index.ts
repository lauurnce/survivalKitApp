// lib/email/templates/index.ts
import type { RenderedEmail } from "../types";

const PH_TZ = "Asia/Manila";

function peso(centavos: number): string {
  return `₱${(centavos / 100).toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function longDate(d: Date): string {
  return d.toLocaleDateString("en-US", { timeZone: PH_TZ, month: "long", day: "numeric", year: "numeric" });
}

// Values are interpolated into HTML, and planLabel ultimately traces back to
// stored data. Escape rather than trust it.
function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function layout(heading: string, body: string, ctaLabel: string, ctaUrl: string): string {
  return `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#111">
<h1 style="font-size:20px;margin:0 0 16px">${esc(heading)}</h1>
${body}
<p style="margin:24px 0"><a href="${esc(ctaUrl)}" style="background:#111;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block">${esc(ctaLabel)}</a></p>
<p style="font-size:12px;color:#666;margin-top:32px">BSIT Survival Kit</p>
</div>`;
}

export function receiptEmail(i: { planLabel: string; amountCentavos: number; accessEndsAt: Date; returnUrl: string }): RenderedEmail {
  const amount = peso(i.amountCentavos), ends = longDate(i.accessEndsAt);
  return {
    subject: `Your ${amount} BSIT Survival Kit receipt`,
    text: `Payment received — thank you.\n\nPlan: ${i.planLabel}\nAmount: ${amount}\nAccess until: ${ends}\n\nPick up where you left off:\n${i.returnUrl}\n\nBSIT Survival Kit`,
    html: layout("Payment received", `<p>Thank you. Here is what you bought:</p>
<table style="font-size:14px;border-collapse:collapse"><tr><td style="padding:4px 16px 4px 0;color:#666">Plan</td><td>${esc(i.planLabel)}</td></tr>
<tr><td style="padding:4px 16px 4px 0;color:#666">Amount</td><td>${esc(amount)}</td></tr>
<tr><td style="padding:4px 16px 4px 0;color:#666">Access until</td><td>${esc(ends)}</td></tr></table>`,
      "Open your reviewers", i.returnUrl),
  };
}

export function welcomeEmail(i: { planLabel: string; returnUrl: string }): RenderedEmail {
  return {
    subject: "You're in — here's how to use it",
    text: `You unlocked ${i.planLabel}.\n\nEvery reviewer now shows its full answer key: worked solutions, code labs, and drills.\n\nStart here:\n${i.returnUrl}\n\nBSIT Survival Kit`,
    html: layout("You're in", `<p>You unlocked <strong>${esc(i.planLabel)}</strong>.</p>
<p>Every reviewer now shows its full answer key — worked solutions, code labs, and drills.</p>`,
      "Start reviewing", i.returnUrl),
  };
}

export function expiryWarningEmail(i: { planLabel: string; accessEndsAt: Date; renewUrl: string }): RenderedEmail {
  const ends = longDate(i.accessEndsAt);
  return {
    subject: `Your access ends ${ends}`,
    text: `Heads up — your ${i.planLabel} access ends on ${ends}.\n\nAfter that the answer keys lock again. Renew here:\n${i.renewUrl}\n\nBSIT Survival Kit`,
    html: layout("Your access is ending", `<p>Your <strong>${esc(i.planLabel)}</strong> access ends on <strong>${esc(ends)}</strong>.</p>
<p>After that the answer keys lock again.</p>`, "Renew access", i.renewUrl),
  };
}

export function winbackEmail(i: { planLabel: string; renewUrl: string }): RenderedEmail {
  return {
    subject: "Your reviewers are locked again",
    text: `Your ${i.planLabel} access has expired, so the answer keys are locked.\n\nEverything you studied is exactly where you left it. Renew here:\n${i.renewUrl}\n\nBSIT Survival Kit`,
    html: layout("Your access expired", `<p>Your <strong>${esc(i.planLabel)}</strong> access has expired, so the answer keys are locked.</p>
<p>Everything you studied is exactly where you left it.</p>`, "Renew access", i.renewUrl),
  };
}
