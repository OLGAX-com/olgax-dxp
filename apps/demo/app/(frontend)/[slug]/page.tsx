import { notFound } from "next/navigation";
import { Render } from "@puckeditor/core";
import type { Data } from "@puckeditor/core";
import { config } from "@/lib/puck.config";
import { getPayloadClient } from "@/lib/payload";

export default async function PublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const payload = await getPayloadClient();

  // Explicit `_status` filter: the Local API bypasses access control by
  // default, and Payload's `draft` param on find/findByID does NOT filter
  // by status on its own - this is the actual guard against showing
  // unpublished drafts on the public route.
  const result = await payload.find({
    collection: "pages",
    where: {
      slug: { equals: slug },
      _status: { equals: "published" },
    },
    limit: 1,
  });

  const page = result.docs[0];
  if (!page) notFound();

  return <Render config={config} data={page.data as Data} />;
}
