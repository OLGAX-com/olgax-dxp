const SAFE_HREF_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);
const SAFE_MEDIA_PROTOCOLS = new Set(["http:", "https:"]);
const DUMMY_ORIGIN = "https://olgax.invalid";

/**
 * Sanitizes a link `href` so unsafe schemes (`javascript:`, `vbscript:`, `data:`,
 * protocol-relative `//`) cannot be injected via stored Puck JSON.
 */
export function safeHref(value: string | undefined | null, fallback = "#"): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith("//")) return fallback;
  if (trimmed.startsWith("#")) return trimmed;

  try {
    const parsed = new URL(trimmed, DUMMY_ORIGIN);
    return SAFE_HREF_PROTOCOLS.has(parsed.protocol) ? trimmed : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Sanitizes an image/media `src` URL, allowing same-origin relative paths and
 * `http:` / `https:` URLs while rejecting `javascript:`, `data:`, and `//`.
 */
export function safeMediaSrc(value: string | undefined | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith("//")) return null;

  try {
    const parsed = new URL(trimmed, DUMMY_ORIGIN);
    return SAFE_MEDIA_PROTOCOLS.has(parsed.protocol) ? trimmed : null;
  } catch {
    return null;
  }
}
