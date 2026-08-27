import type { Locale } from "./i18n";

// Convention: the site's homepage is the Page with this slug. Not yet
// user-configurable (e.g. a "set as homepage" toggle) - a fixed convention
// keeps this simple until there's a real need for more.
export const HOME_SLUG = "home";

// Builds a path under the locale prefix when SiteSettings' "localizationEnabled"
// is on, or the bare path when it's off (see proxy.ts, which does the same
// thing in reverse for requests that arrive without a matching prefix).
// `path` must start with "/" or be empty (for the site root).
export function localizedPath(locale: Locale, localizationEnabled: boolean, path: string): string {
  const withLocale = localizationEnabled ? `/${locale}${path}` : path;
  return withLocale || "/";
}

// The home page's own slug redirects to the site root for a single canonical
// URL per locale (see [locale]/[slug]/page.tsx) - anywhere we link to a
// page's public URL should account for that rather than linking to the
// slug path directly.
export function publicUrlForSlug(locale: Locale, slug: string, localizationEnabled: boolean): string {
  return slug === HOME_SLUG
    ? localizedPath(locale, localizationEnabled, "")
    : localizedPath(locale, localizationEnabled, `/${slug}`);
}
