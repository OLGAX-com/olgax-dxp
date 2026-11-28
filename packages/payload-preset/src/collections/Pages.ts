import { type CollectionConfig } from "payload";
import { dispatchWebhooks } from "../webhooks/dispatch";
import { isEditorOrAdmin } from "../access/roles";
import { createDraftWorkflowHooks } from "../hooks/draftWorkflow";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const DEFAULT_RESERVED_SLUGS = ["admin", "api", "dashboard", "pages"] as const;

export type CreatePagesCollectionOptions = {
  /** Additional top-level route slugs (e.g. `"blog"`, `"menu"`) that pages cannot claim. */
  reservedSlugs?: readonly string[];
};

// `data` holds Puck's own `Data` JSON shape (content + root props) verbatim -
// Payload does not need to understand its internal structure.
export function createPagesCollection(
  options: CreatePagesCollectionOptions = {},
): CollectionConfig {
  const reservedSlugs = new Set([
    ...DEFAULT_RESERVED_SLUGS,
    ...(options.reservedSlugs ?? []),
  ]);
  const workflowHooks = createDraftWorkflowHooks({ labelPlural: "pages" });

  return {
    slug: "pages",
    access: {
      read: ({ req }) => {
        if (req.user) return true;
        return {
          or: [{ _status: { equals: "published" } }, { _status: { exists: false } }],
        };
      },
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
    hooks: {
      beforeOperation: workflowHooks.beforeOperation,
      beforeChange: workflowHooks.beforeChange,
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
          if (reservedSlugs.has(value)) {
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
}

export const Pages: CollectionConfig = createPagesCollection();
