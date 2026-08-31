import { getPayloadClient, getCurrentUser, getSiteSettings } from "@/lib/payload";
import { getViewCountsBySlug } from "@/lib/analytics";
import { publicUrlForSlug } from "@/lib/pages";
import { resolveLocalizationEnabled } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

export default async function DashboardOverview({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const user = await getCurrentUser();
  const settings = await getSiteSettings();
  const localizationEnabled = resolveLocalizationEnabled(settings.localizationEnabled);

  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "pages",
    limit: 200,
    locale,
    overrideAccess: false,
    user,
  });
  const viewCounts = await getViewCountsBySlug();
  const totalViews = Object.values(viewCounts).reduce((sum, n) => sum + n, 0);
  const publishedCount = result.docs.filter((page) => page._status === "published").length;
  const topPages = [...result.docs]
    .sort((a, b) => (viewCounts[b.slug] ?? 0) - (viewCounts[a.slug] ?? 0))
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Pages" value={result.docs.length} hint={`${publishedCount} published`} />
        <StatCard label="Total views" value={totalViews} hint="all pages, all time" />
        <StatCard
          label="Locale"
          value={locale.toUpperCase()}
          hint={localizationEnabled ? "localization on" : "localization off"}
        />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Top pages
        </h2>
        <ul className="flex flex-col divide-y divide-black/[.08] dark:divide-white/[.145]">
          {topPages.map((page) => (
            <li key={page.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-black dark:text-zinc-50">{page.title}</p>
                <p className="text-sm text-zinc-500">/{page.slug}</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-zinc-500">{viewCounts[page.slug] ?? 0} views</span>
                <a
                  href={publicUrlForSlug(locale, page.slug, localizationEnabled)}
                  className="text-zinc-600 hover:underline dark:text-zinc-400"
                >
                  View
                </a>
              </div>
            </li>
          ))}
          {topPages.length === 0 && (
            <p className="py-6 text-center text-sm text-zinc-500">No pages yet.</p>
          )}
        </ul>
      </div>
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string | number; hint: string }) {
  return (
    <div className="rounded-2xl border border-solid border-black/[.08] p-4 dark:border-white/[.145]">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-black dark:text-zinc-50">{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{hint}</p>
    </div>
  );
}
