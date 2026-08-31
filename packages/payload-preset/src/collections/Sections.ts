import type { CollectionConfig } from "payload";

// A named, reusable group of Puck blocks (a slice of `Data.content`) that a
// consuming app can use to start a new page from, instead of an empty canvas.
// Deliberately just a data model - inserting a section mid-edit via a custom
// Puck plugin/toolbar is real UX work left for a later pass (see PHASE.md).
export const Sections: CollectionConfig = {
  slug: "sections",
  admin: {
    useAsTitle: "name",
  },
  // Sections are only ever read/written by the editor tooling, never a
  // public route - Payload does not restrict access by default, so this is
  // required, not optional.
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
      name: "content",
      type: "json",
      required: true,
      localized: true,
      admin: {
        description:
          "An array of Puck ComponentData items (Data.content), not a full Data object. " +
          "Localized - each locale can have its own copy in the section's blocks; a locale " +
          "with no translation yet falls back to the default locale's content.",
      },
    },
  ],
};
