import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "email",
  },
  auth: true,
  access: {
    // Payload does NOT restrict CRUD by default just because `auth: true` is
    // set - without this, anyone could POST /api/users and create an admin
    // account. Allow creating the very first user (bootstrap, e.g. via
    // scripts/seed.ts) or any already-logged-in user creating more; require
    // login for everything else.
    create: async ({ req }) => {
      if (req.user) return true;
      const existing = await req.payload.find({ collection: "users", limit: 1 });
      return existing.totalDocs === 0;
    },
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [],
};
