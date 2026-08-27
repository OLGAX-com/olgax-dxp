import { cache } from "react";
import { getPayload } from "payload";
import { headers as nextHeaders } from "next/headers";
import config from "@payload-config";

export function getPayloadClient() {
  return getPayload({ config });
}

// Used to show/hide the "Edit this page" affordance on public routes - only
// logged-in Payload users (the editor's target audience) see it.
export async function getCurrentUser() {
  const payload = await getPayloadClient();
  const { user } = await payload.auth({ headers: await nextHeaders() });
  return user;
}

// Fetched from the root layout on every request (for site-wide color
// theming), so dedupe within a single render pass via React's cache().
export const getSiteSettings = cache(async () => {
  const payload = await getPayloadClient();
  return payload.findGlobal({ slug: "site-settings" });
});
