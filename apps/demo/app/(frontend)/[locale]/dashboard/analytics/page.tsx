import { getPayloadClient, getCurrentUser, getSiteSettings } from "@/lib/payload";
import { getViewCountsBySlug, getDailyViewTotals } from "@/lib/analytics";
import { publicUrlForSlug } from "@/lib/pages";
import { resolveLocalizationEnabled } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

const TREND_DAYS = 7;

export default async function DashboardAnalytics({
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
  const dailyTotals = await getDailyViewTotals(TREND_DAYS);
  const trendMax = Math.max(1, ...dailyTotals.map((day) => day.count));

  const pagesByViews = [...result.docs].sort(
    (a, b) => (viewCounts[b.slug] ?? 0) - (viewCounts[a.slug] ?? 0),
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Last {TREND_DAYS} days
        </h2>
        <ul className="flex flex-col gap-1.5">
          {dailyTotals.map((day) => (
            <li key={day.date} className="flex items-center gap-3 text-sm">
              <span className="w-20 shrink-0 text-zinc-500">{day.date}</span>
              <div className="h-2 flex-1 rounded-full bg-black/[.06] dark:bg-white/[.08]">
                <div
                  className="h-2 rounded-full bg-foreground"
                  style={{ width: `${(day.count / trendMax) * 100}%` }}
                />
              </div>
              <span className="w-10 shrink-0 text-right font-medium text-black dark:text-zinc-50">
                {day.count}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Views by page
        </h2>
        <ul className="flex flex-col divide-y divide-black/[.08] dark:divide-white/[.145]">
          {pagesByViews.map((page) => (
            <li key={page.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-black dark:text-zinc-50">{page.title}</p>
                <p className="text-sm text-zinc-500">/{page.slug}</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="font-medium text-black dark:text-zinc-50">
                  {viewCounts[page.slug] ?? 0} views
                </span>
                <a
                  href={publicUrlForSlug(locale, page.slug, localizationEnabled)}
                  className="text-zinc-600 hover:underline dark:text-zinc-400"
                >
                  View
                </a>
              </div>
            </li>
          ))}
          {pagesByViews.length === 0 && (
            <p className="py-6 text-center text-sm text-zinc-500">No pages yet.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
