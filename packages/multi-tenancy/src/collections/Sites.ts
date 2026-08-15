import type { CollectionConfig } from "payload";

export const Sites: CollectionConfig = {
  slug: "sites",
  admin: {
    useAsTitle: "name",
  },
  // Payload does not restrict access by default - only logged-in users may
  // manage sites.
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
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
