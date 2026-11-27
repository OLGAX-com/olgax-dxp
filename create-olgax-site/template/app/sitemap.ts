import type { MetadataRoute } from "next";
import { getPayloadClient, getSiteSettings } from "@/lib/payload";
import { DEFAULT_LOCALE, LOCALES, resolveLocalizationEnabled } from "@/lib/i18n";
import { publicUrlForSlug } from "@/lib/pages";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
  const settings = await getSiteSettings();
  const localizationEnabled = resolveLocalizationEnabled(settings.localizationEnabled);
  const locales = localizationEnabled ? LOCALES : ([DEFAULT_LOCALE] as const);

  const payload = await getPayloadClient();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    const result = await payload.find({
      collection: "pages",
      where: {
        _status: { equals: "published" },
      },
      limit: 500,
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
  }

  return entries;
}
