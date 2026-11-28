import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { Render, resolveAllData } from "@puckeditor/core";
import type { Config, Data } from "@puckeditor/core";
import { createCollectionResolver } from "@olgax.com/datasource";
import { config } from "@/lib/puck.config";
import { getPayloadClient, getCurrentUser } from "@/lib/payload";
import { EditThisPageLink } from "@/components/EditThisPageLink";
import { UmamiPageView } from "@/components/UmamiPageView";
import { recordPageView } from "@/lib/analytics";
import { getVisitorState } from "@/lib/personalization";
import { localizedPath } from "@/lib/pages";
import type { Locale } from "@/lib/i18n";

// Shared by the root "/[locale]" route (renders the HOME_SLUG page) and the
// generic "/[locale]/[slug]" route - `fallback` lets the root route show a
// friendly first-run state instead of a 404 when a fresh site has no
// homepage yet.
export async function PageRenderer({
  locale,
  slug,
  localizationEnabled,
  preview = false,
  fallback,
}: {
  locale: Locale;
  slug: string;
  localizationEnabled: boolean;
  preview?: boolean;
  fallback?: ReactNode;
}) {
  const payload = await getPayloadClient();
  const user = await getCurrentUser();
  const isDraftPreview = Boolean(user && preview);

  // Explicit `_status` filter for public renders: the Local API bypasses
  // access control by default, and Payload's `draft` param on find/findByID
  // does NOT filter by status on its own - this is the actual guard against
  // showing unpublished drafts on the public route. Logged-in editors may
  // explicitly request `?preview=true` to inspect unpublished drafts.
  const result = await payload.find({
    collection: "pages",
    where: isDraftPreview
      ? { slug: { equals: slug } }
      : {
          slug: { equals: slug },
          _status: { equals: "published" },
        },
    draft: isDraftPreview,
    limit: 1,
    locale,
  });

  const page = result.docs[0];

  if (!page) {
    if (fallback) return <>{fallback}</>;
    notFound();
  }

  // Anonymous traffic only (never draft previews) - skip counting the editor's
  // own visits while working on the site.
  if (!user && !isDraftPreview) {
    after(() => recordPageView(slug, locale));
  }

  const visitor = await getVisitorState();
  const localePrefix = localizationEnabled ? `/${locale}` : "";

  // Re-resolve dynamic datasource blocks on SSR via Payload Local API so
  // RelatedPages stays fresh whenever new pages are published or deleted.
  const serverConfig: Config = {
    ...config,
    components: {
      ...config.components,
      ...(config.components.RelatedPages
        ? {
            RelatedPages: {
              ...config.components.RelatedPages,
              resolveData: createCollectionResolver(getPayloadClient, {
                allowedCollections: ["pages"],
                allowedFilterFields: ["slug", "title"],
                locale,
              }) as never,
            },
          }
        : {}),
    },
  };

  let resolvedData = (page.data as Data) ?? { content: [], root: {} };
  try {
    resolvedData = await resolveAllData(resolvedData, serverConfig, {
      visitor,
      localePrefix,
      locale,
    });
  } catch {
    // Keep stored snapshot if runtime resolution fails for an optional custom block.
  }

  return (
    <>
      {isDraftPreview && (
        <div
          role="status"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 16px",
            background: "#18181b",
            color: "#fafafa",
            fontSize: 13,
          }}
        >
          <span>
            Draft preview ({page._status === "published" ? "latest draft" : "unpublished draft"})
          </span>
          <a
            href={localizedPath(locale, localizationEnabled, `/${slug}/edit`)}
            style={{ color: "#fafafa", textDecoration: "underline", fontWeight: 600 }}
          >
            Edit in Puck →
          </a>
        </div>
      )}
      <Render config={serverConfig} data={resolvedData} metadata={{ visitor, localePrefix }} />
      <UmamiPageView skip={Boolean(user || isDraftPreview)} />
      {user && (
        <EditThisPageLink locale={locale} slug={slug} localizationEnabled={localizationEnabled} />
      )}
    </>
  );
}
