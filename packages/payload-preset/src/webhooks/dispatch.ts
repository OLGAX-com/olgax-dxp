import { createHmac } from "crypto";
import type { PayloadRequest } from "payload";

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

// Exported for unit testing - same sha256=<hex> convention GitHub/Stripe use.
export function sign(secret: string, body: string): string {
  return `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
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
        fetch(webhook.url as string, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Olgax-Event": payload.event,
            "X-Olgax-Signature": sign(webhook.secret as string, body),
          },
          body,
          signal: AbortSignal.timeout(5000),
        }),
      ),
    );
  } catch {
    // Swallow - a webhook dispatch failure must never surface to the editor.
  }
}
