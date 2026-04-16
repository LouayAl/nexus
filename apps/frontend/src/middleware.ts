// frontend/src/middleware.ts last version that i need to fix
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

  // Already logged in → redirect away from auth pages
  if (AUTH_ONLY.some((route) => pathname.startsWith(route)) && role) {
    const dest = role === "ADMIN" ? "/admin" : "/profile";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  // Root redirect
  if (pathname === "/") {
    if (role === "ADMIN") return NextResponse.redirect(new URL("/admin", req.url));
    if (role === "CANDIDAT") return NextResponse.redirect(new URL("/profile", req.url));
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Public routes — always allowed
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Not logged in → send to login
  if (!token || !role) {
    const url = new URL("/auth/login", req.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // ADMIN can only access /admin/*
  if (role === "ADMIN") {
    if (!pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  // CANDIDAT can only access /profile/*
  if (role === "CANDIDAT") {
    if (!pathname.startsWith("/profile")) {
      return NextResponse.redirect(new URL("/profile", req.url));
    }
    return NextResponse.next();
  }

  // Any other role (ENTREPRISE etc.) → kick to login
  return NextResponse.redirect(new URL("/auth/login", req.url));
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)",
  ],
};