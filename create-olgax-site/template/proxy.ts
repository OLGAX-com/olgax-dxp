import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { LOCALES, DEFAULT_LOCALE } from "@/lib/i18n";

// Standard Next.js i18n pattern: redirect any locale-less path to the
// default locale (/about -> /en/about) so every frontend route always has a
// locale prefix. Admin, API, and static asset paths are excluded via the
// matcher below - they're never locale-prefixed.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!admin|api|_next|favicon.ico|sw.js).*)"],
};
