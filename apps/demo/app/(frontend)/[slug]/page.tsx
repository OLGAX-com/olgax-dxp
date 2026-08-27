import { redirect } from "next/navigation";
import { PageRenderer } from "@/components/PageRenderer";
import { HOME_SLUG } from "@/lib/pages";

export default async function PublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // The home page's canonical URL is "/" - redirect its own slug there
  // instead of rendering the same content at two URLs.
  if (slug === HOME_SLUG) {
    redirect("/");
  }

  return <PageRenderer slug={slug} />;
}
