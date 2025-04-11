import { NextRequest, NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSSRServerClient } from "@/lib/supabase/ssrServer";
import { safeNextPath } from "@/lib/auth/safeNext";

// Landing route for links Supabase emails out (today: password recovery).
//
// Two link shapes are accepted:
//  - ?code=…               PKCE, the default for @supabase/ssr. The code is
//                          swapped for a session using the verifier cookie set
//                          when the reset was requested, so it works in the
//                          browser that asked for it.
//  - ?token_hash=…&type=…  Works in any browser, if the email template is
//                          switched to link here with {{ .TokenHash }}.
// Either way the session cookies are written on this response and the student
// moves on to `next`, which is validated like every other return path.

const OTP_TYPES = new Set<EmailOtpType>(["recovery", "signup", "invite", "magiclink", "email", "email_change"]);

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNextPath(searchParams.get("next"), type === "recovery" ? "/reset-password" : "/account");
  const isRecovery = type === "recovery" || next === "/reset-password";

  const supabase = await createSSRServerClient();
  let ok = false;
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) console.error("auth callback: code exchange failed:", error.code ?? error.status);
    ok = !error;
  } else if (tokenHash && type && OTP_TYPES.has(type)) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (error) console.error("auth callback: OTP verify failed:", error.code ?? error.status);
    ok = !error;
  }

  if (ok) return NextResponse.redirect(new URL(next, req.nextUrl.origin));

  // Expired, reused, or opened in another browser. Recovery links go back to
  // the request form with an explanation; anything else to login.
  const fallback = isRecovery ? "/forgot-password?error=expired" : "/login";
  return NextResponse.redirect(new URL(fallback, req.nextUrl.origin));
}
