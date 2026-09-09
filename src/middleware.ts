import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const res = NextResponse.next();

  // Extra lock on admin surface
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    res.headers.set("Cache-Control", "no-store");
  }

  // Block common probe paths early
  if (
    pathname.startsWith("/.env") ||
    pathname.startsWith("/wp-admin") ||
    pathname.startsWith("/wp-login") ||
    pathname.includes("phpmyadmin")
  ) {
    return new NextResponse(null, { status: 404 });
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
