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

  const result = await payload.find({
    collection: "pages",
    where: { slug: { equals: slug } },
    limit: 1,
  });

  const page = result.docs[0];
  const initialData: Data = (page?.data as Data) ?? { content: [], root: {} };
  const title = page?.title ?? slug;

  return <PageEditor slug={slug} title={title} initialData={initialData} />;
}
