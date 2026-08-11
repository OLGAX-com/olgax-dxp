import type { Config } from "@puckeditor/core";
import { getRegisteredComponents } from "@olgax/sdk";
import { registerRelatedPages } from "@olgax/components";
import { createCollectionResolverFetch } from "@olgax/datasource";

// Importing @olgax/components registers its 8 default blocks as a side effect.
// RelatedPages uses the fetch-based resolver (not the direct-Payload one) because
// this config is shared with the client `<Puck>` editor - see apps/demo's
// app/(frontend)/api/related-pages/route.ts for the server-side query it calls.
registerRelatedPages(createCollectionResolverFetch("/api/related-pages"));

// Read the full registry now that every block (including RelatedPages) has
// registered - combines the default component library into the one Puck
// `Config` this app's editor and render routes share.
export const config: Config = { components: getRegisteredComponents() };
