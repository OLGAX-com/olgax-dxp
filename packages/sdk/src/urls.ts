const SAFE_HREF_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);
const SAFE_MEDIA_PROTOCOLS = new Set(["http:", "https:"]);
const DUMMY_ORIGIN = "https://olgax.invalid";
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;
const PROTOCOL_RELATIVE_PREFIX = /^[/\\]{2}/;

function normalizeCandidate(value: string | undefined | null): string {
  if (typeof value !== "string") return "";
  return value.replace(CONTROL_CHARS, "").trim();
}

/**
 * Sanitizes a link `href` so unsafe schemes (`javascript:`, `vbscript:`, `data:`,
 * and protocol-relative `//`, `/\`, `\/`, `\\` forms) cannot be injected via
 * stored Puck JSON.
 */
export function safeHref(value: string | undefined | null, fallback = "#"): string {
  const trimmed = normalizeCandidate(value);
  if (!trimmed || PROTOCOL_RELATIVE_PREFIX.test(trimmed)) return fallback;
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
 * `http:` / `https:` URLs while rejecting `javascript:`, `data:`, and
 * protocol-relative (`//`, `/\`, etc.) forms.
 */
export function safeMediaSrc(value: string | undefined | null): string | null {
  const trimmed = normalizeCandidate(value);
  if (!trimmed || PROTOCOL_RELATIVE_PREFIX.test(trimmed)) return null;

  try {
    const parsed = new URL(trimmed, DUMMY_ORIGIN);
    return SAFE_MEDIA_PROTOCOLS.has(parsed.protocol) ? trimmed : null;
  } catch {
    return null;
  }
}
