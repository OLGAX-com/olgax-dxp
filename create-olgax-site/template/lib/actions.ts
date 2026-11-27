"use server";

import type { Data } from "@puckeditor/core";
import { revalidatePath } from "next/cache";
import { isEditorOrAdmin } from "@olgax.com/payload-preset";
import { getPayloadClient, getCurrentUser } from "./payload";
import type { Locale } from "./i18n";

async function requireAuthenticatedUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("You must be logged in to edit pages.");
  }
  return user;
}

async function requireEditorOrAdmin() {
  const user = await requireAuthenticatedUser();
  if (!isEditorOrAdmin(user)) {
    throw new Error("You must be an Editor or Admin to perform this action.");
  }
  return user;
}

async function findPageBySlug(slug: string) {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "pages",
    where: { slug: { equals: slug } },
    limit: 1,
    draft: true,
  });
  return { payload, existing: result.docs[0] };
}

// Autosaves editor progress without touching the published/live page - only
// writes to Payload's versions table (Pages has `versions.drafts` enabled).
// Called from PageEditor's debounced `onChange`. `locale` scopes the write
// to that locale's `title`/`data` (both `localized: true` on Pages) without
// touching other locales' content.
export async function saveDraftPageData(locale: Locale, slug: string, title: string, data: Data) {
  const user = await requireAuthenticatedUser();
  const { payload, existing } = await findPageBySlug(slug);

  if (existing) {
    await payload.update({
      collection: "pages",
      id: existing.id,
      data: { title, data },
      draft: true,
      locale,
      overrideAccess: false,
      user,
    });
  } else {
    // First save for a brand-new page: Payload defaults new documents to
    // `_status: 'draft'` when it's omitted, so this never becomes public.
    await payload.create({
      collection: "pages",
      data: { title, slug, data },
      locale,
      overrideAccess: false,
      user,
    });
  }
}

// Publishes the page - this is what the public render route shows. Called
// from PageEditor's `onPublish`.
export async function publishPageData(locale: Locale, slug: string, title: string, data: Data) {
  const user = await requireEditorOrAdmin();
  const { payload, existing } = await findPageBySlug(slug);

  if (existing) {
    await payload.update({
      collection: "pages",
      id: existing.id,
      data: { title, data, _status: "published" },
      draft: false,
      locale,
      overrideAccess: false,
      user,
    });
  } else {
    await payload.create({
      collection: "pages",
      data: { title, slug, data, _status: "published" },
      locale,
      overrideAccess: false,
      user,
    });
  }
}

// Called from the /dashboard/pages tab - `overrideAccess: false` + `user`
// means Payload's own Pages access control (Editor/Admin required) is the real
// enforcement, not just this action existing behind an authed page.
export async function deletePage(locale: Locale, id: string | number) {
  const user = await requireEditorOrAdmin();
  const payload = await getPayloadClient();
  await payload.delete({ collection: "pages", id, overrideAccess: false, user });
  revalidatePath(`/${locale}/dashboard/pages`);
}

export async function unpublishPage(locale: Locale, id: string | number) {
  const user = await requireEditorOrAdmin();
  const payload = await getPayloadClient();
  await payload.update({
    collection: "pages",
    id,
    data: { _status: "draft" },
    draft: false,
    locale,
    overrideAccess: false,
    user,
  });
  revalidatePath(`/${locale}/dashboard/pages`);
}

// Copies a page's content (for the current locale only - other locales on
// the copy start untranslated) into a brand-new draft page, appending
// "-copy" (or "-copy-2", "-copy-3", ...) to the slug until one is free.
export async function duplicatePage(locale: Locale, id: string | number) {
  const user = await requireAuthenticatedUser();
  const payload = await getPayloadClient();
  const original = await payload.findByID({
    collection: "pages",
    id,
    draft: true,
    locale,
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

  const copyTitle = `${original.title} (copy)`;
  const rawData = (original.data as Data | undefined) ?? { content: [], root: {} };
  const copyData: Data = {
    ...rawData,
    root: {
      ...rawData.root,
      props: {
        ...(rawData.root?.props ?? {}),
        title: copyTitle,
      },
    },
  };

  await payload.create({
    collection: "pages",
    data: { title: copyTitle, slug, data: copyData },
    locale,
    overrideAccess: false,
    user,
  });
  revalidatePath(`/${locale}/dashboard/pages`);
}
