import { APIError, type CollectionConfig } from "payload";
import { dispatchWebhooks } from "../webhooks/dispatch";
import { getUserRole, isEditorOrAdmin } from "../access/roles";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RESERVED_SLUGS = new Set(["admin", "api", "dashboard", "pages"]);

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
    // Authors, Editors, and Admins may create/edit drafts; publishing and
    // deleting require Editor or Admin (enforced below).
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => isEditorOrAdmin(req.user),
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
    beforeChange: [
      ({ data, req }) => {
        if (req.user && getUserRole(req.user) === "author" && data?._status === "published") {
          throw new APIError(
            "Authors cannot publish pages. Save as a draft and ask an Editor or Admin to publish.",
            403,
          );
        }
        return data;
      },
    ],
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
      validate: (value?: string | null) => {
        if (!value) return "Slug is required";
        if (!SLUG_REGEX.test(value)) {
          return "Slug must be lowercase letters, numbers, and hyphens only (e.g. about-us)";
        }
        if (RESERVED_SLUGS.has(value)) {
          return `Slug "${value}" is reserved by the system`;
        }
        return true;
      },
    },
    {
      name: "data",
      type: "json",
      required: true,
      localized: true,
    },
    {
      name: "seo",
      type: "group",
      label: "SEO & Metadata",
      localized: true,
      fields: [
        {
          name: "metaTitle",
          type: "text",
          admin: {
            description: "Optional <title> override for search engines (defaults to page title).",
          },
        },
        {
          name: "metaDescription",
          type: "textarea",
          admin: {
            description: "Summary shown in search snippets and social previews (120–160 chars).",
          },
        },
        {
          name: "ogImage",
          type: "upload",
          relationTo: "media",
          admin: {
            description: "Optional Open Graph social preview image.",
          },
        },
        {
          name: "canonicalUrl",
          type: "text",
          validate: (value?: string | null) => {
            if (!value) return true;
            try {
              const parsed = new URL(value);
              return parsed.protocol === "https:" || parsed.protocol === "http:"
                ? true
                : "Canonical URL must use http or https";
            } catch {
              return "Must be a valid absolute URL (e.g. https://example.com/about)";
            }
          },
        },
        {
          name: "noIndex",
          type: "checkbox",
          defaultValue: false,
          admin: {
            description: "Exclude this page from search engines (noindex) and sitemap.xml.",
          },
        },
      ],
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
