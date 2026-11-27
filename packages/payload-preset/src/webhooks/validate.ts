import { isIP } from "node:net";

const BLOCKED_HOSTNAMES = new Set(["localhost", "0.0.0.0", "metadata.google.internal"]);

function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
    return false;
  }
  const [a, b] = parts;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127)
  );
}

function isPrivateIpv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  if (normalized === "::1" || normalized === "::") return true;
  if (normalized.startsWith("::ffff:")) {
    return isPrivateIpv4(normalized.slice("::ffff:".length));
  }
  return (
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") ||
    normalized.startsWith("fea") ||
    normalized.startsWith("feb")
  );
}

/**
 * Validates that a webhook destination is a safe HTTP(S) URL and does not
 * target loopback, link-local/cloud-metadata, or private RFC1918 networks
 * (unless `OLGAX_ALLOW_PRIVATE_WEBHOOKS=true` is explicitly set).
 */
export function validateWebhookUrl(value?: string | null): true | string {
  if (!value) return "Required";

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return "Must be a valid URL";
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return "Webhook URL must use http or https";
  }

  if (process.env.OLGAX_ALLOW_PRIVATE_WEBHOOKS === "true") {
    return true;
  }

  const hostname = parsed.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (
    BLOCKED_HOSTNAMES.has(hostname) ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal")
  ) {
    return "Webhook URL must not target localhost or internal hostnames";
  }

  const ipVersion = isIP(hostname);
  if (ipVersion === 4 && isPrivateIpv4(hostname)) {
    return "Webhook URL must not target private, loopback, or metadata IP addresses";
  }
  if (ipVersion === 6 && isPrivateIpv6(hostname)) {
    return "Webhook URL must not target private, loopback, or link-local IPv6 addresses";
  }

  return true;
}
