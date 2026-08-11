import type { CollectionConfig } from "payload";
import { Sites } from "./collections/Sites";

export { Sites };

/**
 * Opt-in helper: adds a required `site` relationship field to an existing collection
 * config (typically `@olgax/payload-preset`'s `Pages`), so a consuming app can scope
 * documents per site without every app being forced into multi-tenancy - see
 * `.github/copilot-instructions.md`'s Phase 3 guidance on package boundaries.
 *
 * This is data-model groundwork only: it does not add tenant-aware access control,
 * domain-based routing, or an admin UI site switcher.
 */
export function withSite(collection: CollectionConfig): CollectionConfig {
  return {
    ...collection,
    fields: [
      ...collection.fields,
      {
        name: "site",
        type: "relationship",
        relationTo: Sites.slug,
        required: true,
      },
    ],
  };
}
