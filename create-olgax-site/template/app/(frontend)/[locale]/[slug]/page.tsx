import { redirect, notFound } from "next/navigation";
import { PageRenderer } from "@/components/PageRenderer";
import { HOME_SLUG } from "@/lib/pages";
import { isLocale } from "@/lib/i18n";

export default async function PublicPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  // The home page's canonical URL is "/[locale]" - redirect its own slug
  // there instead of rendering the same content at two URLs.
  if (slug === HOME_SLUG) {
    redirect(`/${locale}`);
  }

  return <PageRenderer locale={locale} slug={slug} />;
}
