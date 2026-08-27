import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { LOCALES, DEFAULT_LOCALE, resolveLocalizationEnabled } from "@/lib/i18n";

// Proxy runs on every request, so this deliberately avoids a full Payload
// Local API call (native DB drivers aren't guaranteed to work in this
// runtime) - a plain same-origin fetch to Payload's own public REST endpoint
// for the setting, cached in-module for a short window. Fails open to
// "enabled" (today's behavior) if the fetch fails for any reason.
let cached: { value: boolean; expiresAt: number } | null = null;
const CACHE_TTL_MS = 30_000;

async function getLocalizationEnabled(origin: string): Promise<boolean> {
  if (cached && cached.expiresAt > Date.now()) return cached.value;
  try {
    const res = await fetch(`${origin}/api/globals/site-settings?depth=0`);
    const data = await res.json();
    const value = resolveLocalizationEnabled(data?.localizationEnabled);
    cached = { value, expiresAt: Date.now() + CACHE_TTL_MS };
    return value;
  } catch {
    return cached?.value ?? true;
  }
}

// Two modes, both driven by SiteSettings' "localizationEnabled" (see
// lib/pages.ts's `localizedPath`, which every internal link already builds
// with this same toggle in mind):
//
// Enabled (default): standard Next.js i18n pattern - redirect any locale-less
// path to the default locale (/about -> /en/about) so every route always has
// a visible locale prefix.
//
// Disabled: the site only ever serves the default locale, at bare URLs. Any
// locale-prefixed path a visitor lands on (an old bookmark, a stale link)
// redirects to its unprefixed equivalent; every other request is silently
// rewritten (not redirected) to the default locale's actual route
// internally, so the URL bar never shows a prefix at all.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const matchedLocale = LOCALES.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  const localizationEnabled = await getLocalizationEnabled(request.nextUrl.origin);

  if (localizationEnabled) {
    if (matchedLocale) return NextResponse.next();
    const url = request.nextUrl.clone();
    url.pathname = `/${DEFAULT_LOCALE}${pathname}`;
    return NextResponse.redirect(url);
  }

  if (matchedLocale) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(`/${matchedLocale}`.length) || "/";
    return NextResponse.redirect(url);
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!admin|api|_next|favicon.ico|sw.js).*)"],
};
