"use server";

import type { Data } from "@puckeditor/core";
import { getPayloadClient } from "./payload";

// Saves Puck's `Data` JSON verbatim into the matching Payload `pages` doc,
// creating it on first save since the spike editor doesn't have a separate
// "new page" flow yet.
export async function savePageData(slug: string, title: string, data: Data) {
  const payload = await getPayloadClient();

  const existing = await payload.find({
    collection: "pages",
    where: { slug: { equals: slug } },
    limit: 1,
  });

  if (existing.docs.length > 0) {
    await payload.update({
      collection: "pages",
      id: existing.docs[0].id,
      data: { title, data },
    });
  } else {
    await payload.create({
      collection: "pages",
      data: { title, slug, data },
    });
  }
}
