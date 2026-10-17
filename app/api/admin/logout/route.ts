import { NextResponse } from "next/server";
import {
  legacySessionCookieClearHeader,
  SESSION_COOKIE,
} from "@/lib/auth/adminSession";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE.name, "", {
    ...SESSION_COOKIE.options,
    maxAge: 0,
  });
  // Appended after cookies.set, which rewrites the Set-Cookie headers from
  // its name-keyed map (a second cookies.set of the same name would replace
  // the first instead of adding the /admin-path expiry).
  res.headers.append("Set-Cookie", legacySessionCookieClearHeader());
  return res;
}
