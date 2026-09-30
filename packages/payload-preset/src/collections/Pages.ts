import type { CollectionConfig } from "payload";
import { dispatchWebhooks } from "../webhooks/dispatch";

// `data` holds Puck's own `Data` JSON shape (content + root props) verbatim -
// Payload does not need to understand its internal structure.
export const Pages: CollectionConfig = {
  slug: "pages",
  access: {
    // Logged-in users (the editor UI) see everything, including drafts.
    // Anonymous/public requests only ever see published pages - the `draft`
    // param on find/findByID does NOT filter this by itself, per Payload's
    // docs, so this access rule is the actual enforcement point for anyone
    // using REST/GraphQL. The Local API (used by apps/demo's own routes)
    // bypasses access control by default, so those routes additionally
    // filter by `_status` explicitly - see the public render route.
    read: ({ req }) => {
      if (req.user) return true;
      return {
        or: [{ _status: { equals: "published" } }, { _status: { exists: false } }],
      };
    },
    // Editing (autosave, publish, admin panel) requires a logged-in Payload
    // user - these are the actual enforcement point when apps pass
    // `overrideAccess: false` to the Local API (see apps/demo/lib/actions.ts).
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    useAsTitle: "title",
  },
  versions: {
    drafts: true,
  },
  // Fires on every save/delete regardless of how it happens (Local API,
  // REST, admin panel) - not just apps/demo's own server actions - so any
  // consuming app gets webhook support for free. Never fires for plain
  // autosaved drafts (see the `_status` check), only actual publishes.
  hooks: {
    afterChange: [
      async ({ doc, req }) => {
        if (doc._status !== "published") return;
        await dispatchWebhooks(req, {
          event: "page.published",
          slug: doc.slug as string,
          locale: req.locale ?? undefined,
          title: doc.title as string,
          timestamp: new Date().toISOString(),
        });
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        await dispatchWebhooks(req, {
          event: "page.deleted",
          slug: doc.slug as string,
          title: doc.title as string,
          timestamp: new Date().toISOString(),
        });
      },
    ],
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      localized: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
    },
    {
      name: "data",
      type: "json",
      required: true,
      localized: true,
    },
    {
      name: "quickLinks",
      type: "ui",
      label: "Quick links",
      admin: {
        position: "sidebar",
        components: {
          Field: "@olgax.com/payload-preset/src/components/PageQuickLinks#PageQuickLinks",
        },
      },
    },
  ],
};
