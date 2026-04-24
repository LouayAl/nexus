// frontend/src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_ROUTES = ["/", "/auth/login", "/auth/register", "/auth/oauth-callback"];
const AUTH_ONLY = ["/auth/login", "/auth/register"];

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "nexus_secret");

async function getUserFromToken(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as { role: string };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get("nexus_session")?.value;
  const user = await getUserFromToken(token);
  const role = user?.role ?? null;

  // Already logged in → redirect away from auth pages
  if (role && AUTH_ONLY.some((route) => pathname.startsWith(route))) {
    if (role === "ADMIN") return NextResponse.redirect(new URL("/admin", req.url));
    if (role === "CANDIDAT") return NextResponse.redirect(new URL("/profile", req.url));
    if (role === "ENTREPRISE") return NextResponse.redirect(new URL("/company/dashboard", req.url));
  }

  // Not logged in → send to login
  if (!user && !PUBLIC_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // ROOT redirect
  if (pathname === "/") {
    if (role === "ADMIN") return NextResponse.redirect(new URL("/admin", req.url));
    if (role === "CANDIDAT") return NextResponse.redirect(new URL("/profile", req.url));
    if (role === "ENTREPRISE") return NextResponse.redirect(new URL("/company/dashboard", req.url));
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // ADMIN ONLY
  if (pathname.startsWith("/admin")) {
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/profile", req.url));
    }
  }

  // CANDIDAT
  if (pathname.startsWith("/profile")) {
    if (role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    if (role !== "CANDIDAT" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  // ENTREPRISE
  if (pathname.startsWith("/company")) {
    if (role !== "ENTREPRISE") {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)",
  ],
};