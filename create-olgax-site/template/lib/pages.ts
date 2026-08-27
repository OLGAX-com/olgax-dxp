// Convention: the site's homepage is the Page with this slug. Not yet
// user-configurable (e.g. a "set as homepage" toggle) - a fixed convention
// keeps this simple until there's a real need for more.
export const HOME_SLUG = "home";

// The home page's own slug redirects to "/" for a single canonical URL (see
// [slug]/page.tsx) - anywhere we link to a page's public URL should account
// for that rather than linking to the slug path directly.
export function publicUrlForSlug(slug: string): string {
  return slug === HOME_SLUG ? "/" : `/${slug}`;
}
