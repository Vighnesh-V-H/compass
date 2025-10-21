import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { ROUTE_PATTERNS } from "./routes-config";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie = getSessionCookie(request);

  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  if (ROUTE_PATTERNS.public.includes(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/auth")) {
    if (sessionCookie) {
      return NextResponse.redirect(new URL("/projects", request.url));
    } else {
      return NextResponse.next();
    }
  }

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
