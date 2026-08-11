import type { CollectionConfig } from "payload";

export const Sites: CollectionConfig = {
  slug: "sites",
  admin: {
    useAsTitle: "name",
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "domain",
      type: "text",
      required: true,
      unique: true,
    },
  ],
};
