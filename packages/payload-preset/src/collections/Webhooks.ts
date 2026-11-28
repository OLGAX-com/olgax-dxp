import type { CollectionConfig } from "payload";
import { validateWebhookUrl } from "../webhooks/validate";
import { isAdminUser } from "../access/roles";

export type WebhookEventOption = { label: string; value: string };

export const DEFAULT_WEBHOOK_EVENTS: WebhookEventOption[] = [
  { label: "Page published", value: "page.published" },
  { label: "Page deleted", value: "page.deleted" },
];

export type CreateWebhooksCollectionOptions = {
  /** Additional custom webhook events (e.g. `post.published`, `form.submitted`). */
  events?: readonly WebhookEventOption[];
};

export function createWebhooksCollection(
  options: CreateWebhooksCollectionOptions = {},
): CollectionConfig {
  const seen = new Set(DEFAULT_WEBHOOK_EVENTS.map((e) => e.value));
  const mergedEvents: WebhookEventOption[] = [
    ...DEFAULT_WEBHOOK_EVENTS,
    ...(options.events ?? []).filter((e) => !seen.has(e.value)),
  ];

  return {
    slug: "webhooks",
    labels: { singular: "Webhook", plural: "Webhooks" },
    admin: {
      useAsTitle: "name",
      defaultColumns: ["name", "url", "events", "enabled"],
      description: "Notify an external URL when content changes - see docs for the payload shape.",
    },
    // Contains a signing secret - restricted to Admin users only.
    access: {
      read: ({ req }) => isAdminUser(req.user),
      create: ({ req }) => isAdminUser(req.user),
      update: ({ req }) => isAdminUser(req.user),
      delete: ({ req }) => isAdminUser(req.user),
    },
    fields: [
      {
        name: "name",
        type: "text",
        required: true,
        admin: { description: "A label for your own reference, e.g. \"Slack #content-alerts\"." },
      },
      {
        name: "url",
        type: "text",
        required: true,
        validate: (value?: string | null) => validateWebhookUrl(value),
        admin: { description: "The endpoint that receives the POSTed event payload." },
      },
      {
        name: "secret",
        type: "text",
        required: true,
        admin: {
          description:
            "Used to HMAC-sign each request (X-Olgax-Signature header) so your endpoint can " +
            "verify it actually came from this site - see docs for how to verify it.",
        },
      },
      {
        name: "events",
        type: "select",
        hasMany: true,
        required: true,
        options: mergedEvents,
      },
      {
        name: "enabled",
        type: "checkbox",
        defaultValue: true,
      },
    ],
  };
}

export const Webhooks: CollectionConfig = createWebhooksCollection();
