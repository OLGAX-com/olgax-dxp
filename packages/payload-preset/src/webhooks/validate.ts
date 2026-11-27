import { lookup as dnsLookup } from "node:dns/promises";
import type { LookupAddress } from "node:dns";
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

function extractMappedIpv4(normalizedIpv6: string): string | null {
  const mappedPrefix = normalizedIpv6.startsWith("::ffff:")
    ? normalizedIpv6.slice("::ffff:".length)
    : normalizedIpv6.startsWith("0:0:0:0:0:ffff:")
      ? normalizedIpv6.slice("0:0:0:0:0:ffff:".length)
      : null;
  if (!mappedPrefix) return null;

  if (mappedPrefix.includes(".")) {
    return mappedPrefix;
  }

  const hexPair = /^([0-9a-f]{1,4}):([0-9a-f]{1,4})$/.exec(mappedPrefix);
  if (!hexPair) return null;

  const hi = Number.parseInt(hexPair[1], 16);
  const lo = Number.parseInt(hexPair[2], 16);
  return `${(hi >> 8) & 0xff}.${hi & 0xff}.${(lo >> 8) & 0xff}.${lo & 0xff}`;
}

function isPrivateIpv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  if (normalized === "::1" || normalized === "::") return true;

  const mappedIpv4 = extractMappedIpv4(normalized);
  if (mappedIpv4) {
    return isPrivateIpv4(mappedIpv4);
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

export function isPrivateOrReservedIp(ip: string): boolean {
  const clean = ip.replace(/^\[|\]$/g, "");
  const ipVersion = isIP(clean);
  if (ipVersion === 4) return isPrivateIpv4(clean);
  if (ipVersion === 6) return isPrivateIpv6(clean);
  return false;
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

export type ResolvedWebhookTarget = {
  url: URL;
  address: string;
  family: 4 | 6;
};

export type LookupAllFn = (
  hostname: string,
  options: { all: true },
) => Promise<LookupAddress[]>;

/**
 * Resolves a webhook hostname via DNS, rejects if any resolved address is private
 * or reserved (preventing DNS rebinding / nip.io style bypasses), and returns a
 * single pinned address so the HTTP client connects directly to that IP.
 */
export async function resolveAndValidateWebhookTarget(
  rawUrl: string,
  lookupFn: LookupAllFn = dnsLookup,
): Promise<ResolvedWebhookTarget> {
  const valid = validateWebhookUrl(rawUrl);
  if (valid !== true) {
    throw new Error(valid);
  }

  const url = new URL(rawUrl);
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  const ipVersion = isIP(hostname);
  const allowPrivate = process.env.OLGAX_ALLOW_PRIVATE_WEBHOOKS === "true";

  if (ipVersion === 4 || ipVersion === 6) {
    return { url, address: hostname, family: ipVersion };
  }

  const records = await lookupFn(hostname, { all: true });
  if (!records || records.length === 0) {
    throw new Error(`Webhook hostname "${hostname}" did not resolve to any address`);
  }

  if (!allowPrivate) {
    for (const record of records) {
      if (isPrivateOrReservedIp(record.address)) {
        throw new Error(
          `Webhook hostname "${hostname}" resolved to a private or reserved IP address`,
        );
      }
    }
  }

  const first = records[0];
  return {
    url,
    address: first.address,
    family: first.family === 6 ? 6 : 4,
  };
}
