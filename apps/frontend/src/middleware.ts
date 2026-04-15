import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? "nexus_session";
const PUBLIC_ROUTES = ["/", "/auth/login", "/auth/register", "/auth/oauth-callback"];
const AUTH_ONLY = ["/auth/login", "/auth/register"];

function getRole(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role ?? null;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const role = token ? getRole(token) : null;

  if (AUTH_ONLY.some((route) => pathname.startsWith(route)) && role) {
    return NextResponse.redirect(new URL("/profile", req.url));
  }

  if (pathname === "/") {
    return NextResponse.redirect(new URL(role === "CANDIDAT" ? "/profile" : "/auth/login", req.url));
  }

  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  if (!token || !role) {
    const url = new URL("/auth/login", req.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if (role !== "CANDIDAT") {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  if (!pathname.startsWith("/profile")) {
    return NextResponse.redirect(new URL("/profile", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)",
  ],
};
