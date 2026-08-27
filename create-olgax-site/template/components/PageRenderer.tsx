import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { Render } from "@puckeditor/core";
import type { Data } from "@puckeditor/core";
import { config } from "@/lib/puck.config";
import { getPayloadClient, getCurrentUser } from "@/lib/payload";
import { EditThisPageLink } from "@/components/EditThisPageLink";

// Shared by the root "/" route (renders the HOME_SLUG page) and the generic
// "/[slug]" route - `fallback` lets the root route show a friendly first-run
// state instead of a 404 when a fresh site has no homepage yet.
export async function PageRenderer({ slug, fallback }: { slug: string; fallback?: ReactNode }) {
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
  const user = await getCurrentUser();

  if (!page) {
    if (fallback) return <>{fallback}</>;
    notFound();
  }

  return (
    <>
      <Render config={config} data={page.data as Data} />
      {user && <EditThisPageLink slug={slug} />}
    </>
  );
}
