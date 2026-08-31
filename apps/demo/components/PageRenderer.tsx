import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { Render } from "@puckeditor/core";
import type { Data } from "@puckeditor/core";
import { config } from "@/lib/puck.config";
import { getPayloadClient, getCurrentUser } from "@/lib/payload";
import { EditThisPageLink } from "@/components/EditThisPageLink";
import { UmamiPageView } from "@/components/UmamiPageView";
import { recordPageView } from "@/lib/analytics";
import type { Locale } from "@/lib/i18n";

// Shared by the root "/[locale]" route (renders the HOME_SLUG page) and the
// generic "/[locale]/[slug]" route - `fallback` lets the root route show a
// friendly first-run state instead of a 404 when a fresh site has no
// homepage yet.
export async function PageRenderer({
  locale,
  slug,
  localizationEnabled,
  fallback,
}: {
  locale: Locale;
  slug: string;
  localizationEnabled: boolean;
  fallback?: ReactNode;
}) {
  const payload = await getPayloadClient();

  // Explicit `_status` filter: the Local API bypasses access control by
  // default, and Payload's `draft` param on find/findByID does NOT filter
  // by status on its own - this is the actual guard against showing
  // unpublished drafts on the public route. `locale` returns the requested
  // locale's content, falling back to the default locale for untranslated
  // fields (payload.config.ts's `localization.fallback: true`).
  const result = await payload.find({
    collection: "pages",
    where: {
      slug: { equals: slug },
      _status: { equals: "published" },
    },
    limit: 1,
    locale,
  });

  const page = result.docs[0];
  const user = await getCurrentUser();

  if (!page) {
    if (fallback) return <>{fallback}</>;
    notFound();
  }

  // Anonymous traffic only - skip counting the editor's own visits while
  // working on the site. Scheduled via `after()` so it runs post-response
  // without adding latency, but is still guaranteed to complete (unlike a
  // plain un-awaited call, which some hosting platforms can cut off).
  if (!user) {
    after(() => recordPageView(slug, locale));
  }

  return (
    <>
      <Render config={config} data={page.data as Data} />
      <UmamiPageView skip={Boolean(user)} />
      {user && (
        <EditThisPageLink locale={locale} slug={slug} localizationEnabled={localizationEnabled} />
      )}
    </>
  );
}
