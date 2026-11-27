import { notFound } from "next/navigation";
import { getPayloadClient, getCurrentUser, getSiteSettings } from "@/lib/payload";
import { duplicatePage } from "@/lib/actions";
import { publicUrlForSlug, localizedPath } from "@/lib/pages";
import { isLocale, resolveLocalizationEnabled } from "@/lib/i18n";
import { getViewCountsBySlug } from "@/lib/analytics";
import { NewPageForm } from "@/components/NewPageForm";
import { DeletePageButton } from "@/components/DeletePageButton";

export default async function DashboardPages({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const user = await getCurrentUser();
  const settings = await getSiteSettings();
  const localizationEnabled = resolveLocalizationEnabled(settings.localizationEnabled);

  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "pages",
    limit: 100,
    sort: "-updatedAt",
    locale,
    overrideAccess: false,
    user,
    where: query
      ? {
          or: [
            { title: { contains: query } },
            { slug: { contains: query } },
          ],
        }
      : undefined,
  });

  const viewCounts = await getViewCountsBySlug();

  return (
    <div className="flex flex-col gap-6">
      <NewPageForm locale={locale} localizationEnabled={localizationEnabled} />

      <form method="GET" className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search by title or slug"
          className="h-10 flex-1 rounded-full border border-solid border-black/[.08] px-4 text-sm dark:border-white/[.145] dark:bg-black"
        />
        <button
          type="submit"
          className="h-10 shrink-0 rounded-full border border-solid border-black/[.08] px-4 text-sm font-medium text-zinc-600 dark:border-white/[.145] dark:text-zinc-400"
        >
          Search
        </button>
        {query && (
          <a
            href={localizedPath(locale, localizationEnabled, "/dashboard/pages")}
            className="flex h-10 shrink-0 items-center rounded-full px-3 text-sm text-zinc-500 hover:underline"
          >
            Clear
          </a>
        )}
      </form>

      <ul className="flex flex-col divide-y divide-black/[.08] dark:divide-white/[.145]">
        {result.docs.map((page) => {
          const isPublished = page._status === "published";
          const viewHref = isPublished
            ? publicUrlForSlug(locale, page.slug, localizationEnabled)
            : `${publicUrlForSlug(locale, page.slug, localizationEnabled)}?preview=true`;
          return (
            <li
              key={page.id}
              className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-black dark:text-zinc-50">{page.title}</p>
                <p className="text-sm text-zinc-500">
                  /{page.slug} · {isPublished ? "Published" : "Draft"} ·{" "}
                  {viewCounts[page.slug] ?? 0} views
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
                <a
                  href={viewHref}
                  className="text-zinc-600 hover:underline dark:text-zinc-400"
                >
                  {isPublished ? "View" : "Preview"}
                </a>
                <a
                  href={localizedPath(locale, localizationEnabled, `/${page.slug}/edit`)}
                  className="text-zinc-600 hover:underline dark:text-zinc-400"
                >
                  Edit
                </a>
                <form action={duplicatePage.bind(null, locale, page.id)}>
                  <button type="submit" className="text-zinc-600 hover:underline dark:text-zinc-400">
                    Duplicate
                  </button>
                </form>
                <DeletePageButton locale={locale} id={page.id} title={page.title} />
              </div>
            </li>
          );
        })}
        {result.docs.length === 0 && (
          <p className="py-6 text-center text-sm text-zinc-500">
            {query ? `No pages match "${query}".` : "No pages yet — create one above."}
          </p>
        )}
      </ul>
    </div>
  );
}
