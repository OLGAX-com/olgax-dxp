import type { CollectionConfig } from "payload";

// `data` holds Puck's own `Data` JSON shape (content + root props) verbatim -
// Payload does not need to understand its internal structure.
export const Pages: CollectionConfig = {
  slug: "pages",
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: "title",
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
    },
    {
      name: "data",
      type: "json",
      required: true,
    },
  ],
};
