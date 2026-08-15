"use server";

import type { Data } from "@puckeditor/core";
import { getPayloadClient, getCurrentUser } from "./payload";

async function requireEditor() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("You must be logged in to edit pages.");
  }
  return user;
}

async function findPageBySlug(slug: string) {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "pages",
    where: { slug: { equals: slug } },
    limit: 1,
  });
  return { payload, existing: result.docs[0] };
}

// Autosaves editor progress without touching the published/live page - only
// writes to Payload's versions table (Pages has `versions.drafts` enabled).
// Called from PageEditor's debounced `onChange`.
export async function saveDraftPageData(slug: string, title: string, data: Data) {
  const user = await requireEditor();
  const { payload, existing } = await findPageBySlug(slug);

  if (existing) {
    await payload.update({
      collection: "pages",
      id: existing.id,
      data: { title, data },
      draft: true,
      overrideAccess: false,
      user,
    });
  } else {
    // First save for a brand-new page: Payload defaults new documents to
    // `_status: 'draft'` when it's omitted, so this never becomes public.
    await payload.create({
      collection: "pages",
      data: { title, slug, data },
      overrideAccess: false,
      user,
    });
  }
}

// Publishes the page - this is what the public render route shows. Called
// from PageEditor's `onPublish`.
export async function publishPageData(slug: string, title: string, data: Data) {
  const user = await requireEditor();
  const { payload, existing } = await findPageBySlug(slug);

  if (existing) {
    await payload.update({
      collection: "pages",
      id: existing.id,
      data: { title, data, _status: "published" },
      draft: false,
      overrideAccess: false,
      user,
    });
  } else {
    await payload.create({
      collection: "pages",
      data: { title, slug, data, _status: "published" },
      overrideAccess: false,
      user,
    });
  }
}
