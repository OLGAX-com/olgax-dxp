import { redirect, notFound } from "next/navigation";
import { getSiteSettings } from "@/lib/payload";
import { localizedPath } from "@/lib/pages";
import { isLocale, resolveLocalizationEnabled } from "@/lib/i18n";

// Superseded by /dashboard/pages (see the new dashboard/ route group, which
// also adds Overview/Analytics/Settings tabs) - kept as a redirect so any
// existing bookmarks/links to the old flat dashboard still land somewhere.
export default async function LegacyPagesRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const settings = await getSiteSettings();
  const localizationEnabled = resolveLocalizationEnabled(settings.localizationEnabled);
  redirect(localizedPath(locale, localizationEnabled, "/dashboard/pages"));
}
