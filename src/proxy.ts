import { NextRequest, NextResponse } from "next/server";
import { decryptSessionCookie } from "@/lib/auth/session";

// Next.js 16 renamed `middleware.ts` to `proxy.ts` — same mechanism, runs on
// every request (including prefetches), Node.js runtime only. This is an
// *optimistic* check: it only reads the session cookie to redirect quickly.
// The real authorization gate is the Data Access Layer (src/lib/auth/dal.ts),
// which every Server Component/Action actually calls.
const PROTECTED_PREFIXES = ["/candidates"];
const PUBLIC_ROUTES = ["/login", "/"];

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isPublic = PUBLIC_ROUTES.includes(pathname);

  const cookie = req.cookies.get("session")?.value;
  const session = await decryptSessionCookie(cookie);
  const hasValidSession = !!session && session.expiresAt > Date.now();

  if (isProtected && !hasValidSession) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isPublic && pathname === "/login" && hasValidSession) {
    return NextResponse.redirect(new URL("/candidates", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.(?:png|svg|ico)$).*)"],
};
