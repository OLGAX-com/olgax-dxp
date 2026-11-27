import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { PageRenderer } from "@/components/PageRenderer";
import { HOME_SLUG, localizedPath } from "@/lib/pages";
import { isLocale, resolveLocalizationEnabled } from "@/lib/i18n";
import { getSiteSettings } from "@/lib/payload";
import { getPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale) || slug === HOME_SLUG) return {};
  return getPageMetadata(locale, slug);
}

export default async function PublicPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const { preview } = await searchParams;
  const settings = await getSiteSettings();
  const localizationEnabled = resolveLocalizationEnabled(settings.localizationEnabled);

  // The home page's canonical URL is the site root - redirect its own slug
  // there instead of rendering the same content at two URLs.
  if (slug === HOME_SLUG) {
    const suffix = preview === "true" ? "?preview=true" : "";
    redirect(`${localizedPath(locale, localizationEnabled, "")}${suffix}`);
  }

  return (
    <PageRenderer
      locale={locale}
      slug={slug}
      localizationEnabled={localizationEnabled}
      preview={preview === "true"}
    />
  );
}
