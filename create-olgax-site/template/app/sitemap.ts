import type { MetadataRoute } from "next";
import { getPayloadClient, getSiteSettings } from "@/lib/payload";
import { DEFAULT_LOCALE, LOCALES, resolveLocalizationEnabled } from "@/lib/i18n";
import { publicUrlForSlug } from "@/lib/pages";

export const dynamic = "force-dynamic";

const PAGE_BATCH_SIZE = 200;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
  const settings = await getSiteSettings();
  const localizationEnabled = resolveLocalizationEnabled(settings.localizationEnabled);
  const locales = localizationEnabled ? LOCALES : ([DEFAULT_LOCALE] as const);

  const payload = await getPayloadClient();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    let pageNumber = 1;
    let hasMore = true;

    while (hasMore) {
      const result = await payload.find({
        collection: "pages",
        where: {
          _status: { equals: "published" },
        },
        limit: PAGE_BATCH_SIZE,
        page: pageNumber,
        depth: 0,
        locale,
      });

      for (const page of result.docs) {
        const seo = (page as { seo?: { noIndex?: boolean | null } }).seo;
        if (seo?.noIndex) continue;

        const path = publicUrlForSlug(locale, page.slug, localizationEnabled);
        entries.push({
          url: `${baseUrl}${path}`,
          lastModified: page.updatedAt ? new Date(page.updatedAt) : new Date(),
        });
      }

      hasMore = Boolean(result.hasNextPage);
      pageNumber += 1;
    }
  }

  return entries;
}
