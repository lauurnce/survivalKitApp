import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { deleteAccount } from "@/lib/deleteAccount";
import { getClientIp } from "@/lib/rateLimit";
import { isServerRateLimited } from "@/lib/serverRateLimit";

// RA 10173 right to erasure (see app/(main)/privacy Section 5 "Right to
// erasure" and Section 6 "How to Exercise Your Rights"). Previously the only
// path was emailing the DPO; this gives authenticated users a self-service
// route. Low limit — this is a destructive, irreversible action, not a
// routine call site. A 3/hour cap only means something if it is enforced
// across all serverless instances, hence the shared check_rate_limit RPC.
const RATE_LIMIT_IP = { max: 3, windowSeconds: 60 * 60 };

export async function POST(req: NextRequest) {
  if (await isServerRateLimited(`account-delete:ip:${getClientIp(req)}`, RATE_LIMIT_IP)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  // Identity comes ONLY from the authenticated session — there is no
  // client-suppliable userId field. A caller can only ever delete their own
  // account, never someone else's.
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const supabase = createServerClient();
  const result = await deleteAccount(supabase, userId);

  if (!result.ok) {
    console.error("[account/delete] failed:", result.error);
    return NextResponse.json({ error: "Deletion failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
