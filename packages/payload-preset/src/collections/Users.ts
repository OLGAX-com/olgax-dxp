import type { CollectionConfig } from "payload";
import { USER_ROLES, isAdminUser } from "../access/roles";

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "role", "createdAt"],
  },
  auth: true,
  access: {
    // Allow creating the very first user (bootstrap, e.g. via scripts/seed.ts)
    // or admins creating team members; block self-registration once users exist.
    create: async ({ req }) => {
      if (isAdminUser(req.user)) return true;
      const existing = await req.payload.find({
        collection: "users",
        limit: 1,
        overrideAccess: true,
      });
      return existing.totalDocs === 0;
    },
    read: ({ req }) => {
      if (!req.user) return false;
      if (isAdminUser(req.user)) return true;
      return { id: { equals: req.user.id } };
    },
    update: ({ req }) => {
      if (!req.user) return false;
      if (isAdminUser(req.user)) return true;
      return { id: { equals: req.user.id } };
    },
    delete: ({ req }) => isAdminUser(req.user),
  },
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation !== "create" || !data) return data;
        // Bootstrap user always receives `admin` role regardless of caller input.
        const existing = await req.payload.find({
          collection: "users",
          limit: 1,
          overrideAccess: true,
        });
        if (existing.totalDocs === 0) {
          return { ...data, role: "admin" };
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "editor",
      options: USER_ROLES,
      access: {
        update: ({ req }) => isAdminUser(req.user),
      },
      admin: {
        description:
          "Admin: full access including Users, Webhooks, and Site Settings. " +
          "Editor: manage, publish, and delete Pages, Sections, and Media. " +
          "Author: create and edit Page drafts only (cannot publish or delete).",
      },
    },
  ],
};
