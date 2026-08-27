import { redirect } from "next/navigation";
import { getPayloadClient, getCurrentUser } from "@/lib/payload";
import { NewPageForm } from "@/components/NewPageForm";

export default async function PagesDashboard() {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/admin/login?redirect=${encodeURIComponent("/pages")}`);
  }

  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "pages",
    limit: 100,
    sort: "-updatedAt",
    overrideAccess: false,
    user,
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

        <NewPageForm />

        <ul className="flex flex-col divide-y divide-black/[.08] dark:divide-white/[.145]">
          {result.docs.map((page) => (
            <li key={page.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-black dark:text-zinc-50">{page.title}</p>
                <p className="text-sm text-zinc-500">
                  /{page.slug} · {page._status === "published" ? "Published" : "Draft"}
                </p>
              </div>
              <div className="flex gap-3 text-sm font-medium">
                <a
                  href={`/${page.slug}`}
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
              </div>
            </li>
          ))}
          {result.docs.length === 0 && (
            <p className="py-6 text-center text-sm text-zinc-500">
              No pages yet — create one above.
            </p>
          )}
        </ul>
      </div>
    </div>
  );
}
