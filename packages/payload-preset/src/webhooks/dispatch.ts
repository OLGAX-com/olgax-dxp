import { createHmac } from "crypto";
import http from "node:http";
import https from "node:https";
import type { PayloadRequest } from "payload";
import { resolveAndValidateWebhookTarget, type LookupAllFn } from "./validate";

// Outbound webhooks are configured entirely in the `webhooks` collection
// (URL, secret, which events) - no specific third-party vendor is hardcoded.
// Any external system (a rebuild trigger, a Slack incoming webhook, Zapier,
// a custom endpoint) can subscribe by registering a URL there. This is the
// integration mechanism itself, not an integration with any one service.
export type WebhookEvent = "page.published" | "page.deleted";

export type WebhookPayload = {
  event: WebhookEvent;
  slug: string;
  locale?: string;
  title?: string;
  timestamp: string;
};

const WEBHOOK_TIMEOUT_MS = 5000;

// Exported for unit testing - same sha256=<hex> convention GitHub/Stripe use.
export function sign(secret: string, body: string): string {
  return `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
}

/**
 * Resolves and validates the target address, binds the TCP connection to that
 * exact validated IP (while preserving the original Host header and TLS SNI),
 * and never follows HTTP redirects.
 */
export async function postWebhook(
  rawUrl: string,
  secret: string,
  event: WebhookEvent,
  body: string,
  lookupFn?: LookupAllFn,
): Promise<{ statusCode: number }> {
  const target = await resolveAndValidateWebhookTarget(rawUrl, lookupFn);
  const client = target.url.protocol === "https:" ? https : http;

  return new Promise((resolve, reject) => {
    const req = client.request(
      target.url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
          "X-Olgax-Event": event,
          "X-Olgax-Signature": sign(secret, body),
        },
        // Pin socket connection to the pre-validated IP address to prevent DNS rebinding
        // while keeping `target.url.hostname` as Host header and TLS SNI servername.
        lookup: (_hostname, _options, callback) => {
          callback(null, target.address, target.family);
        },
      },
      (res) => {
        res.resume();
        resolve({ statusCode: res.statusCode ?? 0 });
      },
    );

    req.setTimeout(WEBHOOK_TIMEOUT_MS, () => {
      req.destroy(new Error("Webhook request timed out"));
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// Fires every enabled webhook subscribed to `event`, in parallel, and never
// throws - a slow or broken receiver must never block or fail the publish/
// delete operation that triggered it. Each request carries an HMAC-SHA256
// signature (same `sha256=<hex>` convention GitHub/Stripe webhooks use) so
// receivers can verify the payload actually came from this site.
export async function dispatchWebhooks(req: PayloadRequest, payload: WebhookPayload) {
  try {
    const result = await req.payload.find({
      collection: "webhooks",
      where: {
        enabled: { equals: true },
        events: { contains: payload.event },
      },
      limit: 100,
      overrideAccess: true,
    });

    const body = JSON.stringify(payload);

    await Promise.allSettled(
      result.docs.map((webhook) =>
        postWebhook(
          webhook.url as string,
          webhook.secret as string,
          payload.event,
          body,
        ),
      ),
    );
  } catch {
    // Swallow - a webhook dispatch failure must never surface to the editor.
  }
}
