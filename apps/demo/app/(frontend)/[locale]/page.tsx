import { notFound } from "next/navigation";
import { getCurrentUser, getSiteSettings } from "@/lib/payload";
import { PageRenderer } from "@/components/PageRenderer";
import { HOME_SLUG, localizedPath } from "@/lib/pages";
import { isLocale, resolveLocalizationEnabled } from "@/lib/i18n";

// The real production homepage: whatever's published at HOME_SLUG (see
// lib/pages.ts). Falls back to a first-run state (rather than a 404) for a
// freshly scaffolded site that has no homepage yet - `/dashboard` is where
// an editor manages content, not this route.
export default async function RootPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const user = await getCurrentUser();
  const settings = await getSiteSettings();
  const localizationEnabled = resolveLocalizationEnabled(settings.localizationEnabled);

  return (
    <PageRenderer
      locale={locale}
      slug={HOME_SLUG}
      localizationEnabled={localizationEnabled}
      fallback={
        <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-zinc-50 px-6 py-32 text-center dark:bg-black">
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
            This site doesn&apos;t have a homepage yet
          </h1>
          <p className="max-w-md text-zinc-600 dark:text-zinc-400">
            Create and publish a page with the slug &ldquo;{HOME_SLUG}&rdquo; to have it appear
            here.
          </p>
          {user && (
            <a
              href={localizedPath(locale, localizationEnabled, `/${HOME_SLUG}/edit`)}
              className="flex h-11 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
            >
              Create the homepage
            </a>
          )}
        </div>
      }
    />
  );
}
