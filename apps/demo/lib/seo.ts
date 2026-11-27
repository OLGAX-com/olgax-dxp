import type { Metadata } from "next";
import { getPayloadClient } from "./payload";
import type { Locale } from "./i18n";

type SeoGroup = {
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: { url?: string | null; alt?: string | null } | number | string | null;
  canonicalUrl?: string | null;
  noIndex?: boolean | null;
};

function resolveAbsoluteUrl(pathOrUrl: string): string {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
  try {
    return new URL(pathOrUrl, baseUrl).toString();
  } catch {
    return pathOrUrl;
  }
}

/**
 * Builds Next.js `Metadata` for a published page from its localized `seo` group,
 * falling back cleanly to the page title when SEO fields are unset.
 */
export async function getPageMetadata(locale: Locale, slug: string): Promise<Metadata> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "pages",
    where: {
      slug: { equals: slug },
      _status: { equals: "published" },
    },
    limit: 1,
    depth: 1,
    locale,
  });

  const page = result.docs[0] as { title?: string; seo?: SeoGroup } | undefined;
  if (!page) return {};

  const seo = page.seo ?? {};
  const title = seo.metaTitle?.trim() || page.title || "Olgax DXP";
  const description = seo.metaDescription?.trim() || undefined;
  const rawOgUrl =
    seo.ogImage && typeof seo.ogImage === "object" && seo.ogImage.url
      ? seo.ogImage.url
      : undefined;
  const ogImageUrl = rawOgUrl ? resolveAbsoluteUrl(rawOgUrl) : undefined;

  return {
    title,
    ...(description ? { description } : {}),
    ...(seo.canonicalUrl ? { alternates: { canonical: seo.canonicalUrl } } : {}),
    ...(seo.noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title,
      ...(description ? { description } : {}),
      ...(ogImageUrl ? { images: [{ url: ogImageUrl }] } : {}),
    },
  };
}
