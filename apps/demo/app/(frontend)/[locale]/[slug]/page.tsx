import { redirect, notFound } from "next/navigation";
import { PageRenderer } from "@/components/PageRenderer";
import { HOME_SLUG, localizedPath } from "@/lib/pages";
import { isLocale, resolveLocalizationEnabled } from "@/lib/i18n";
import { getSiteSettings } from "@/lib/payload";

export default async function PublicPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const settings = await getSiteSettings();
  const localizationEnabled = resolveLocalizationEnabled(settings.localizationEnabled);

  // The home page's canonical URL is the site root - redirect its own slug
  // there instead of rendering the same content at two URLs.
  if (slug === HOME_SLUG) {
    redirect(localizedPath(locale, localizationEnabled, ""));
  }

  return <PageRenderer locale={locale} slug={slug} localizationEnabled={localizationEnabled} />;
}
