import type { CollectionConfig } from "payload";

const EVENTS = [
  { label: "Page published", value: "page.published" },
  { label: "Page deleted", value: "page.deleted" },
];

// Outbound webhook subscriptions - the mechanism for integrating with any
// external system (rebuild triggers, Slack, Zapier, a custom endpoint),
// without olgax-dxp hardcoding a specific vendor. Configured entirely here;
// dispatched from Pages' afterChange/afterDelete hooks (see
// src/webhooks/dispatch.ts).
export const Webhooks: CollectionConfig = {
  slug: "webhooks",
  labels: { singular: "Webhook", plural: "Webhooks" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "url", "events", "enabled"],
    description: "Notify an external URL when content changes - see docs for the payload shape.",
  },
  // Contains a signing secret - read/write both require login, unlike most
  // other collections' public-read defaults.
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
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
      validate: (value?: string | null) => {
        if (!value) return "Required";
        try {
          new URL(value);
          return true;
        } catch {
          return "Must be a valid URL";
        }
      },
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
      options: EVENTS,
    },
    {
      name: "enabled",
      type: "checkbox",
      defaultValue: true,
    },
  ],
};
