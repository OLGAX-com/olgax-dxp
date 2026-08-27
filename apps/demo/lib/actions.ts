"use server";

import type { Data } from "@puckeditor/core";
import { revalidatePath } from "next/cache";
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

// Called from the /pages dashboard - `overrideAccess: false` + `user` means
// Payload's own Pages access control (login required) is the real
// enforcement, not just this action existing behind an authed page.
export async function deletePage(id: string | number) {
  const user = await requireEditor();
  const payload = await getPayloadClient();
  await payload.delete({ collection: "pages", id, overrideAccess: false, user });
  revalidatePath("/pages");
}

// Copies a page's content into a brand-new draft page, appending "-copy" (or
// "-copy-2", "-copy-3", ...) to the slug until one is free.
export async function duplicatePage(id: string | number) {
  const user = await requireEditor();
  const payload = await getPayloadClient();
  const original = await payload.findByID({
    collection: "pages",
    id,
    overrideAccess: false,
    user,
  });

  let slug = `${original.slug}-copy`;
  let suffix = 2;
  while (
    (
      await payload.find({
        collection: "pages",
        where: { slug: { equals: slug } },
        limit: 1,
        overrideAccess: false,
        user,
      })
    ).docs.length > 0
  ) {
    slug = `${original.slug}-copy-${suffix}`;
    suffix++;
  }

  await payload.create({
    collection: "pages",
    data: { title: `${original.title} (copy)`, slug, data: original.data },
    overrideAccess: false,
    user,
  });
  revalidatePath("/pages");
}
