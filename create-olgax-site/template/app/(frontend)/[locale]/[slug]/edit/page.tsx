import { redirect, notFound } from "next/navigation";
import type { Data } from "@puckeditor/core";
import { PageEditor } from "@/components/PageEditor";
import { getPayloadClient, getCurrentUser, getSiteSettings } from "@/lib/payload";
import { getSectionContent } from "@/lib/sections";
import { isLocale, resolveLocalizationEnabled } from "@/lib/i18n";
import { localizedPath } from "@/lib/pages";

export default async function EditPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ section?: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const { section } = await searchParams;
  const settings = await getSiteSettings();
  const localizationEnabled = resolveLocalizationEnabled(settings.localizationEnabled);

  // The Puck editor is for logged-in Payload users only - the actions it
  // calls also enforce this (see lib/actions.ts), but redirecting here
  // avoids showing the editor UI at all to anonymous visitors. Payload's
  // login view/form both honor `?redirect=` (validated via its own
  // getSafeRedirect - must be a relative path) to bounce back here after login.
  const user = await getCurrentUser();
  if (!user) {
    const editPath = localizedPath(locale, localizationEnabled, `/${slug}/edit`);
    redirect(`/admin/login?redirect=${encodeURIComponent(editPath)}`);
  }

  const payload = await getPayloadClient();

  // `draft: true` returns the latest draft version if one exists (falling
  // back to published), so reopening the editor doesn't discard autosaved
  // progress that hasn't been published yet. A locale with no translation
  // yet falls back to the default locale's content (`localization.fallback`
  // in payload.config.ts) rather than starting from a blank page.
  const result = await payload.find({
    collection: "pages",
    where: { slug: { equals: slug } },
    limit: 1,
    draft: true,
    locale,
  });

  const page = result.docs[0];
  const title = page?.title ?? slug;

  let initialData: Data = (page?.data as Data) ?? { content: [], root: {} };

  // Only start from a section for a brand-new page - never overwrite
  // existing content just because a `?section=` param is present.
  if (!page && section) {
    const sectionContent = await getSectionContent(section);
    if (sectionContent) {
      initialData = { content: sectionContent, root: {} };
    }
  }

  return (
    <PageEditor
      locale={locale}
      slug={slug}
      title={title}
      initialData={initialData}
      localizationEnabled={localizationEnabled}
    />
  );
}
