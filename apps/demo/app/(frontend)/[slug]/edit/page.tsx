import type { Data } from "@puckeditor/core";
import { PageEditor } from "@/components/PageEditor";
import { getPayloadClient } from "@/lib/payload";

export default async function EditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
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
  const initialData: Data = (page?.data as Data) ?? { content: [], root: {} };
  const title = page?.title ?? slug;

  return <PageEditor slug={slug} title={title} initialData={initialData} />;
}
