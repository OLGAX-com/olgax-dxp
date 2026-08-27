// Locale convention for both Payload's localized fields and the frontend's
// locale-prefixed routes (/en/..., /es/...). Add a locale here and to
// payload.config.ts's `localization.locales` to support another language -
// no other code changes needed.
export const LOCALES = ["en", "es"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
