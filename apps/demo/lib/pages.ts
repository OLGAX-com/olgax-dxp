import type { Locale } from "./i18n";

// Convention: the site's homepage is the Page with this slug. Not yet
// user-configurable (e.g. a "set as homepage" toggle) - a fixed convention
// keeps this simple until there's a real need for more.
export const HOME_SLUG = "home";

// The home page's own slug redirects to "/[locale]" for a single canonical
// URL per locale (see [locale]/[slug]/page.tsx) - anywhere we link to a
// page's public URL should account for that rather than linking to the
// slug path directly.
export function publicUrlForSlug(locale: Locale, slug: string): string {
  return slug === HOME_SLUG ? `/${locale}` : `/${locale}/${slug}`;
}
