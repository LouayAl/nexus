import type { Response } from 'express';

export const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'nexus_session';

type SameSite = 'lax' | 'strict' | 'none';

function getCookieSameSite(): SameSite {
  const sameSite = (process.env.AUTH_COOKIE_SAME_SITE || 'lax').toLowerCase();

  if (sameSite === 'strict' || sameSite === 'none') {
    return sameSite;
  }

  return 'lax';
}

function getCookieMaxAge() {
  const raw = Number(process.env.AUTH_COOKIE_MAX_AGE_MS);
  return Number.isFinite(raw) && raw > 0 ? raw : 7 * 24 * 60 * 60 * 1000;
}

function getCookieSecure(sameSite: SameSite) {
  if (process.env.AUTH_COOKIE_SECURE != null) {
    return process.env.AUTH_COOKIE_SECURE === 'true';
  }

  return process.env.NODE_ENV === 'production' || sameSite === 'none';
}

export function buildAuthCookieOptions() {
  const sameSite = getCookieSameSite();
  const secure = getCookieSecure(sameSite);

  return {
    httpOnly: true,
    secure,
    sameSite,
    maxAge: getCookieMaxAge(),
    path: '/',
    ...(process.env.AUTH_COOKIE_DOMAIN
      ? { domain: process.env.AUTH_COOKIE_DOMAIN }
      : {}),
  } as const;
}

export function setAuthCookie(res: Response, token: string) {
  res.cookie(AUTH_COOKIE_NAME, token, buildAuthCookieOptions());
}

export function clearAuthCookie(res: Response) {
  const options = buildAuthCookieOptions();

  res.clearCookie(AUTH_COOKIE_NAME, {
    ...options,
    maxAge: undefined,
  });
}
