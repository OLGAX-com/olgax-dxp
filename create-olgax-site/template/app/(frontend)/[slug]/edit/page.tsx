import { redirect } from "next/navigation";
import type { Data } from "@puckeditor/core";
import { PageEditor } from "@/components/PageEditor";
import { getPayloadClient, getCurrentUser } from "@/lib/payload";
import { getSectionContent } from "@/lib/sections";

export default async function EditPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ section?: string }>;
}) {
  const { slug } = await params;
  const { section } = await searchParams;

  // The Puck editor is for logged-in Payload users only - the actions it
  // calls also enforce this (see lib/actions.ts), but redirecting here
  // avoids showing the editor UI at all to anonymous visitors. Payload's
  // login view/form both honor `?redirect=` (validated via its own
  // getSafeRedirect - must be a relative path) to bounce back here after login.
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/admin/login?redirect=${encodeURIComponent(`/${slug}/edit`)}`);
  }

  const payload = await getPayloadClient();

  // `draft: true` returns the latest draft version if one exists (falling
  // back to published), so reopening the editor doesn't discard autosaved
  // progress that hasn't been published yet.
  const result = await payload.find({
    collection: "pages",
    where: { slug: { equals: slug } },
    limit: 1,
    draft: true,
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

  return <PageEditor slug={slug} title={title} initialData={initialData} />;
}
