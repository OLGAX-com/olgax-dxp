// Locale convention for both Payload's localized fields and the frontend's
// locale-prefixed routes (/en/..., /es/...). Add a locale here to support another
// language - payload.config.ts reads this list, so no other code changes are needed.
export const LOCALES = ["en", "es"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

// SiteSettings' `localizationEnabled` checkbox defaults to `true`, but an
// existing document saved before this field existed has it as null/undefined
// - treat that the same as `true` (preserves current locale-prefixed
// behavior rather than silently changing it out from under an existing site).
export function resolveLocalizationEnabled(value: boolean | null | undefined): boolean {
  return value !== false;
}
