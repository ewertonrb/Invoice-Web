import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/lib/auth/session";

export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/select-company",
    "/companies/:path*",
    "/projects/:path*",
    "/positions/:path*",
    "/rates/:path*",
    "/workers/:path*",
    "/invitations",
    "/work-logs/:path*",
    "/shifts/:path*",
    "/invoices/:path*",
    "/settings/:path*",
  ],
};
