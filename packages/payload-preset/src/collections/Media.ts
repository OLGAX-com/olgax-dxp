import type { CollectionConfig } from "payload";
import { isEditorOrAdmin } from "../access/roles";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    // Read is intentionally public (images need to display on public pages).
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => isEditorOrAdmin(req.user),
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
  ],
  upload: {
    mimeTypes: [
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/gif",
      "image/avif",
      "application/pdf",
    ],
    adminThumbnail: "thumbnail",
    imageSizes: [
      {
        name: "thumbnail",
        width: 400,
        height: 300,
        position: "centre",
      },
    ],
  },
};
