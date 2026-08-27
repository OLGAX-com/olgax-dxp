import type { Data } from "@puckeditor/core";
import { getPayloadClient } from "./payload";

// Fetches a saved Section (packages/payload-preset's `Sections` collection)
// and returns its content ready to seed a brand-new page's initial Puck
// `data` - regenerating ids so inserting the same section into multiple
// pages never collides. Only used when a page has no data yet (see
// app/(frontend)/[slug]/edit/page.tsx) - `<Puck data={...}>` only reads its
// `data` prop once, at mount, so this is the only supported way to
// pre-populate the canvas from a template without touching Puck internals.
export async function getSectionContent(name: string): Promise<Data["content"] | null> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "sections",
    where: { name: { equals: name } },
    limit: 1,
  });

  const section = result.docs[0];
  if (!section) return null;

  const content = section.content as Data["content"];
  return content.map((item) => ({
    ...item,
    props: { ...item.props, id: `${item.type}-${crypto.randomUUID()}` },
  }));
}
