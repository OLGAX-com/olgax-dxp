import { redirect } from "next/navigation";
import { getPayloadClient, getCurrentUser } from "@/lib/payload";
import { duplicatePage } from "@/lib/actions";
import { publicUrlForSlug } from "@/lib/pages";
import { NewPageForm } from "@/components/NewPageForm";
import { DeletePageButton } from "@/components/DeletePageButton";

export default async function PagesDashboard({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/admin/login?redirect=${encodeURIComponent("/pages")}`);
  }

  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "pages",
    limit: 100,
    sort: "-updatedAt",
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

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <div className="flex w-full max-w-2xl flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">Pages</h1>
          <div className="flex gap-4 text-sm font-medium">
            <a href="/" className="text-zinc-600 hover:underline dark:text-zinc-400">
              Home
            </a>
            <a href="/admin" className="text-zinc-600 hover:underline dark:text-zinc-400">
              Payload admin
            </a>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-sm font-medium">
          <a
            href="/admin/globals/site-settings"
            className="rounded-full border border-solid border-black/[.08] px-4 py-1.5 text-zinc-600 hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:text-zinc-400 dark:hover:bg-[#1a1a1a]"
          >
            Site Settings
          </a>
          <a
            href="/admin/collections/sections"
            className="rounded-full border border-solid border-black/[.08] px-4 py-1.5 text-zinc-600 hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:text-zinc-400 dark:hover:bg-[#1a1a1a]"
          >
            Sections
          </a>
          <a
            href="/admin/collections/media"
            className="rounded-full border border-solid border-black/[.08] px-4 py-1.5 text-zinc-600 hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:text-zinc-400 dark:hover:bg-[#1a1a1a]"
          >
            Media
          </a>
        </div>

        <NewPageForm />

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
              href="/pages"
              className="flex h-10 shrink-0 items-center rounded-full px-3 text-sm text-zinc-500 hover:underline"
            >
              Clear
            </a>
          )}
        </form>

        <ul className="flex flex-col divide-y divide-black/[.08] dark:divide-white/[.145]">
          {result.docs.map((page) => (
            <li key={page.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-black dark:text-zinc-50">{page.title}</p>
                <p className="text-sm text-zinc-500">
                  /{page.slug} · {page._status === "published" ? "Published" : "Draft"}
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm font-medium">
                <a
                  href={publicUrlForSlug(page.slug)}
                  className="text-zinc-600 hover:underline dark:text-zinc-400"
                >
                  View
                </a>
                <a
                  href={`/${page.slug}/edit`}
                  className="text-zinc-600 hover:underline dark:text-zinc-400"
                >
                  Edit
                </a>
                <form action={duplicatePage.bind(null, page.id)}>
                  <button
                    type="submit"
                    className="text-zinc-600 hover:underline dark:text-zinc-400"
                  >
                    Duplicate
                  </button>
                </form>
                <DeletePageButton id={page.id} title={page.title} />
              </div>
            </li>
          ))}
          {result.docs.length === 0 && (
            <p className="py-6 text-center text-sm text-zinc-500">
              {query ? `No pages match "${query}".` : "No pages yet — create one above."}
            </p>
          )}
        </ul>
      </div>
    </div>
  );
}
