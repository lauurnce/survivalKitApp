import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { getProfile } from "@/lib/profileStore";
import { getAccountOverview } from "@/lib/account";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "private, no-store" };

// Session probe for client components on prerendered pages (which cannot read
// the session during render): TopBar, the dashboard nav rail, log out, the
// share card, the module feedback form (userId). `?overview=1` adds the nav rail's progress totals. Never errors
// outward — personalization is best-effort.
export async function GET(req?: NextRequest) {
  const wantOverview = req?.nextUrl.searchParams.get("overview") === "1";
  let userId: string | null = null;
  try {
    userId = await getCurrentUserId();
  } catch {
    return NextResponse.json({ firstName: null, signedIn: false }, { headers: NO_STORE });
  }
  if (!userId) return NextResponse.json({ firstName: null, signedIn: false }, { headers: NO_STORE });

  const [firstName, overview] = await Promise.all([
    getProfile(userId)
      .then((p) => p?.firstName ?? null)
      .catch(() => null),
    wantOverview
      ? getAccountOverview(userId)
          .then((o) => ({ overallDone: o.overallDone, overallTotal: o.overallTotal }))
          .catch(() => null)
      : Promise.resolve(undefined),
  ]);

  return NextResponse.json(
    overview === undefined
      ? { firstName, signedIn: true, userId }
      : { firstName, signedIn: true, userId, overview },
    { headers: NO_STORE },
  );
}
