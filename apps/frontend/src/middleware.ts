import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES  = ["/discover", "/auth/login", "/auth/register","/auth/oauth-callback",];
const AUTH_ONLY      = ["/auth/login", "/auth/register"]; // redirect away if already logged in

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
  const token = req.cookies.get("nexus_token")?.value;
  const role  = token ? getRole(token) : null;

  // ── Already logged in → redirect away from auth pages ──────────────────
  if (AUTH_ONLY.some(r => pathname.startsWith(r)) && role) {
    const dest =
      role === "ADMIN"      ? "/admin"             :
      role === "ENTREPRISE" ? "/company/dashboard" :
      "/discover";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  // ── Public routes — always allow ────────────────────────────────────────
  if (PUBLIC_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // ── Not logged in → redirect to login ───────────────────────────────────
  if (!token || !role) {
    const url = new URL("/auth/login", req.url);
    url.searchParams.set("from", pathname); // remember where they were going
    return NextResponse.redirect(url);
  }

  // ── Role-based protection ────────────────────────────────────────────────
  if (pathname.startsWith("/applications") || pathname.startsWith("/profile")) {
    if (role !== "CANDIDAT") {
      return NextResponse.redirect(new URL(roleDest(role), req.url));
    }
  }

  if (pathname.startsWith("/company")) {
    if (role !== "ENTREPRISE") {
      return NextResponse.redirect(new URL(roleDest(role), req.url));
    }
  }

  if (pathname.startsWith("/admin")) {
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL(roleDest(role), req.url));
    }
  }

  return NextResponse.next();
}

function roleDest(role: string) {
  if (role === "ADMIN")      return "/admin";
  if (role === "ENTREPRISE") return "/company/dashboard";
  return "/discover";
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)",
  ],
};